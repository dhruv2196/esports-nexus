resource "aws_api_gateway_rest_api" "esports_nexus_api" {
  name        = "esports-nexus-api"
  description = "API Gateway for Esports Nexus microservices"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# User Service Routes
resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.esports_nexus_api.id
  parent_id   = aws_api_gateway_rest_api.esports_nexus_api.root_resource_id
  path_part   = "users"
}

resource "aws_api_gateway_resource" "users_proxy" {
  rest_api_id = aws_api_gateway_rest_api.esports_nexus_api.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "users_any" {
  rest_api_id   = aws_api_gateway_rest_api.esports_nexus_api.id
  resource_id   = aws_api_gateway_resource.users_proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "users_integration" {
  rest_api_id = aws_api_gateway_rest_api.esports_nexus_api.id
  resource_id = aws_api_gateway_resource.users_proxy.id
  http_method = aws_api_gateway_method.users_any.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${aws_lb.user_service_alb.dns_name}/api/v1/users/{proxy}"
  
  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# Auth Service Routes
resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.esports_nexus_api.id
  parent_id   = aws_api_gateway_rest_api.esports_nexus_api.root_resource_id
  path_part   = "auth"
}

resource "aws_api_gateway_resource" "auth_proxy" {
  rest_api_id = aws_api_gateway_rest_api.esports_nexus_api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "auth_any" {
  rest_api_id   = aws_api_gateway_rest_api.esports_nexus_api.id
  resource_id   = aws_api_gateway_resource.auth_proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "auth_integration" {
  rest_api_id = aws_api_gateway_rest_api.esports_nexus_api.id
  resource_id = aws_api_gateway_resource.auth_proxy.id
  http_method = aws_api_gateway_method.auth_any.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${aws_lb.user_service_alb.dns_name}/api/v1/auth/{proxy}"
  
  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# API Deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_integration.users_integration,
    aws_api_gateway_integration.auth_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.esports_nexus_api.id
  stage_name  = var.environment
}

# API Gateway Domain
resource "aws_api_gateway_domain_name" "api_domain" {
  domain_name              = "api.${var.domain_name}"
  regional_certificate_arn = aws_acm_certificate_validation.api_cert.certificate_arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_base_path_mapping" "api_mapping" {
  api_id      = aws_api_gateway_rest_api.esports_nexus_api.id
  stage_name  = aws_api_gateway_deployment.api_deployment.stage_name
  domain_name = aws_api_gateway_domain_name.api_domain.domain_name
  base_path   = "v1"
}

# Output the API Gateway URL
output "api_gateway_url" {
  value = aws_api_gateway_deployment.api_deployment.invoke_url
}