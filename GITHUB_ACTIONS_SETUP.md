# GitHub Actions Setup Guide

## Required Secrets for Automated Deployment

To enable automated deployments using the GitHub Actions workflow, you need to set up the following secrets in your repository:

### How to Add Secrets

1. Go to your repository: https://github.com/dhruv2196/esports-nexus
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

### Required Secrets

#### 1. `DOCKER_USERNAME`
- **Description**: Your Docker Hub username
- **How to get**: Your Docker Hub account username
- **Example**: `dhruv2196`

#### 2. `DOCKER_PASSWORD`
- **Description**: Your Docker Hub password or access token
- **How to get**: 
  1. Log in to [Docker Hub](https://hub.docker.com)
  2. Go to Account Settings → Security
  3. Create a new Access Token
  4. Copy the token (use this instead of your password)
- **Security**: Use an access token, not your actual password

#### 3. `KUBE_CONFIG`
- **Description**: Your Kubernetes cluster configuration
- **How to get**:
  ```bash
  # Get your kubeconfig and encode it
  cat ~/.kube/config | base64
  ```
- **Note**: Only needed if deploying to Kubernetes

### Optional Secrets

#### 4. `PUBG_API_KEY`
- **Description**: Your PUBG API key for production
- **How to get**: From [PUBG Developer Portal](https://developer.pubg.com/)
- **Note**: Can be added to production environment

#### 5. `MONGO_PASSWORD`
- **Description**: MongoDB password for production
- **How to get**: Generate a strong password
- **Example**: Use a password generator

### Setting Up Docker Hub

1. Create a Docker Hub account at https://hub.docker.com
2. Create repositories:
   - `dhruv2196/esports-nexus-backend`
   - `dhruv2196/esports-nexus-frontend`

### Workflow Configuration

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
1. Build Docker images on push to main branch
2. Push images to Docker Hub
3. Optionally deploy to Kubernetes (if KUBE_CONFIG is set)

### Testing the Workflow

After setting up secrets:
1. Make a small change to any file
2. Commit and push to main branch
3. Check Actions tab in your repository
4. Monitor the workflow execution

### Troubleshooting

- **Docker login failed**: Check DOCKER_USERNAME and DOCKER_PASSWORD
- **Push denied**: Make sure Docker Hub repositories exist
- **Kubernetes deployment failed**: Verify KUBE_CONFIG is properly encoded

### Security Best Practices

1. Use Docker Access Tokens instead of passwords
2. Rotate secrets regularly
3. Never commit secrets to the repository
4. Use environment-specific secrets for different deployments