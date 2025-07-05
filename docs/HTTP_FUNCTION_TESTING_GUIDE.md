# Testing HTTP Trigger Function Apps with Python, Postman & Mock Servers

## 📋 Overview

This guide covers testing HTTP trigger functions (like Azure Functions, AWS Lambda, or Google Cloud Functions) using Python, Postman, and mock servers.

## 🐍 1. Create a Sample HTTP Trigger Function (Python)

### Azure Function Example

```python
# function_app.py
import azure.functions as func
import json
import logging

app = func.FunctionApp()

@app.route(route="process-order", methods=["POST"])
def process_order(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing order request.')
    
    try:
        # Parse request body
        req_body = req.get_json()
        
        # Validate required fields
        order_id = req_body.get('orderId')
        customer_id = req_body.get('customerId')
        items = req_body.get('items', [])
        
        if not order_id or not customer_id:
            return func.HttpResponse(
                json.dumps({"error": "Missing required fields"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Process the order (mock processing)
        total_amount = sum(item.get('price', 0) * item.get('quantity', 1) for item in items)
        
        # Call external service (this is where mock server helps)
        # payment_result = process_payment(customer_id, total_amount)
        
        response = {
            "orderId": order_id,
            "customerId": customer_id,
            "totalAmount": total_amount,
            "status": "processed",
            "message": "Order processed successfully"
        }
        
        return func.HttpResponse(
            json.dumps(response),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )
        
    except ValueError:
        return func.HttpResponse(
            json.dumps({"error": "Invalid request body"}),
            status_code=400,
            headers={"Content-Type": "application/json"}
        )
    except Exception as e:
        logging.error(f"Error processing order: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
```

### AWS Lambda Example

```python
# lambda_function.py
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    HTTP trigger Lambda function
    """
    try:
        # Parse request body
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event
        
        # Extract data
        order_id = body.get('orderId')
        customer_id = body.get('customerId')
        items = body.get('items', [])
        
        # Validate
        if not order_id or not customer_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        # Process
        total_amount = sum(item.get('price', 0) * item.get('quantity', 1) for item in items)
        
        response = {
            'orderId': order_id,
            'customerId': customer_id,
            'totalAmount': total_amount,
            'status': 'processed'
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(response)
        }
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error'})
        }
```

## 🧪 2. Local Testing Setup

### Create a Local Test Server

```python
# local_test_server.py
from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Simulate your function locally
@app.route('/api/process-order', methods=['POST'])
def process_order():
    try:
        data = request.get_json()
        
        # Your function logic here
        order_id = data.get('orderId')
        customer_id = data.get('customerId')
        items = data.get('items', [])
        
        if not order_id or not customer_id:
            return jsonify({'error': 'Missing required fields'}), 400
        
        total_amount = sum(item.get('price', 0) * item.get('quantity', 1) for item in items)
        
        response = {
            'orderId': order_id,
            'customerId': customer_id,
            'totalAmount': total_amount,
            'status': 'processed'
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=7071)
```

## 📮 3. Testing with Postman

### Step 1: Create a New Request

1. Open Postman
2. Click "New" → "Request"
3. Name it "Process Order Test"

### Step 2: Configure the Request

```
Method: POST
URL: http://localhost:7071/api/process-order
Headers:
  Content-Type: application/json
```

### Step 3: Add Request Body

```json
{
  "orderId": "ORD-12345",
  "customerId": "CUST-67890",
  "items": [
    {
      "productId": "PROD-001",
      "name": "Gaming Mouse",
      "price": 59.99,
      "quantity": 2
    },
    {
      "productId": "PROD-002",
      "name": "Mechanical Keyboard",
      "price": 129.99,
      "quantity": 1
    }
  ]
}
```

### Step 4: Create Test Scripts

In Postman's "Tests" tab:

```javascript
// Test status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('orderId');
    pm.expect(jsonData).to.have.property('customerId');
    pm.expect(jsonData).to.have.property('totalAmount');
    pm.expect(jsonData).to.have.property('status');
});

// Test calculations
pm.test("Total amount is calculated correctly", function () {
    const jsonData = pm.response.json();
    const expectedTotal = (59.99 * 2) + (129.99 * 1);
    pm.expect(jsonData.totalAmount).to.equal(expectedTotal);
});

// Test response values
pm.test("Order ID matches request", function () {
    const requestData = JSON.parse(pm.request.body.raw);
    const responseData = pm.response.json();
    pm.expect(responseData.orderId).to.equal(requestData.orderId);
});
```

### Step 5: Environment Variables

Create environment variables in Postman:

```json
{
  "base_url": "http://localhost:7071",
  "api_key": "your-api-key",
  "test_order_id": "ORD-{{$randomInt}}",
  "test_customer_id": "CUST-{{$randomInt}}"
}
```

Use in requests:
```
URL: {{base_url}}/api/process-order
```

## 🎭 4. Setting Up Mock Server

### Option 1: Using Postman Mock Server

1. In Postman, create a collection
2. Add example responses
3. Click "Mock Server" → "Create Mock Server"
4. Use the mock URL in your tests

### Option 2: Using Python Mock Server

```python
# mock_server.py
from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Mock external payment service
@app.route('/api/payment/process', methods=['POST'])
def mock_payment():
    data = request.get_json()
    
    # Simulate different responses based on amount
    amount = data.get('amount', 0)
    
    if amount > 10000:
        return jsonify({
            'status': 'failed',
            'reason': 'Amount exceeds limit'
        }), 400
    
    return jsonify({
        'transactionId': 'TXN-12345',
        'status': 'success',
        'amount': amount
    }), 200

# Mock inventory service
@app.route('/api/inventory/check', methods=['POST'])
def mock_inventory():
    data = request.get_json()
    items = data.get('items', [])
    
    # Simulate inventory check
    inventory_status = []
    for item in items:
        inventory_status.append({
            'productId': item['productId'],
            'available': True,
            'stock': 100
        })
    
    return jsonify({
        'items': inventory_status
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)
```

### Option 3: Using WireMock (Java-based)

```json
// mappings/payment-success.json
{
  "request": {
    "method": "POST",
    "url": "/api/payment/process"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "transactionId": "TXN-12345",
      "status": "success"
    }
  }
}
```

## 🔄 5. Integration Testing with Mock Services

```python
# test_function_with_mocks.py
import unittest
import json
import requests
from unittest.mock import patch, Mock

class TestOrderProcessing(unittest.TestCase):
    
    def setUp(self):
        self.base_url = "http://localhost:7071"
        self.mock_url = "http://localhost:8080"
    
    def test_successful_order(self):
        """Test successful order processing"""
        payload = {
            "orderId": "ORD-TEST-001",
            "customerId": "CUST-TEST-001",
            "items": [
                {"productId": "PROD-001", "price": 50.00, "quantity": 2}
            ]
        }
        
        response = requests.post(
            f"{self.base_url}/api/process-order",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['orderId'], payload['orderId'])
        self.assertEqual(data['totalAmount'], 100.00)
    
    @patch('requests.post')
    def test_with_mocked_payment(self, mock_post):
        """Test with mocked payment service"""
        # Configure mock
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'transactionId': 'TXN-MOCK-001',
            'status': 'success'
        }
        mock_post.return_value = mock_response
        
        # Your test logic here
        # ...
    
    def test_invalid_order(self):
        """Test order with missing fields"""
        payload = {
            "orderId": "ORD-TEST-002"
            # Missing customerId
        }
        
        response = requests.post(
            f"{self.base_url}/api/process-order",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)

if __name__ == '__main__':
    unittest.main()
```

## 📊 6. Postman Collection Example

```json
{
  "info": {
    "name": "Order Processing API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Successful Order",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"orderId\": \"{{$randomUUID}}\",\n  \"customerId\": \"CUST-{{$randomInt}}\",\n  \"items\": [\n    {\n      \"productId\": \"PROD-001\",\n      \"price\": 99.99,\n      \"quantity\": 1\n    }\n  ]\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/process-order",
          "host": ["{{base_url}}"],
          "path": ["api", "process-order"]
        }
      },
      "response": []
    }
  ]
}
```

## 🚀 7. Advanced Testing Scenarios

### Load Testing with Postman

```javascript
// Pre-request Script for load testing
const orderData = {
    orderId: `ORD-${pm.variables.replaceIn('{{$randomInt}}')}`,
    customerId: `CUST-${pm.variables.replaceIn('{{$randomInt}}')}`,
    items: []
};

// Generate random items
const itemCount = Math.floor(Math.random() * 5) + 1;
for (let i = 0; i < itemCount; i++) {
    orderData.items.push({
        productId: `PROD-${i + 1}`,
        price: Math.random() * 100,
        quantity: Math.floor(Math.random() * 3) + 1
    });
}

pm.variables.set("orderPayload", JSON.stringify(orderData));
```

### Data-Driven Testing

Create a CSV file for test data:
```csv
orderId,customerId,productId,price,quantity,expectedStatus
ORD-001,CUST-001,PROD-001,50.00,2,200
ORD-002,CUST-002,PROD-002,75.50,1,200
ORD-003,,PROD-003,25.00,1,400
```

## 🛠️ 8. Debugging Tips

1. **Enable Logging**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

2. **Capture Request/Response**
```python
# In your function
logging.info(f"Request body: {req.get_body()}")
logging.info(f"Response: {response}")
```

3. **Use Postman Console**
- View → Show Postman Console
- See all request/response details

4. **Mock Server Logs**
```python
@app.before_request
def log_request():
    print(f"Request: {request.method} {request.path}")
    print(f"Headers: {dict(request.headers)}")
    print(f"Body: {request.get_data()}")
```

## 📝 Best Practices

1. **Organize Tests**
   - Group by functionality
   - Use folders in Postman
   - Name tests descriptively

2. **Use Variables**
   - Environment variables for different stages
   - Collection variables for shared data
   - Dynamic variables for random data

3. **Validate Thoroughly**
   - Check status codes
   - Validate response structure
   - Test edge cases
   - Test error scenarios

4. **Mock External Dependencies**
   - Isolate function logic
   - Test different scenarios
   - Simulate failures

5. **Automate Testing**
   - Use Newman for CI/CD
   - Schedule collection runs
   - Generate reports

This comprehensive guide should help you test HTTP trigger functions effectively using Python, Postman, and mock servers!