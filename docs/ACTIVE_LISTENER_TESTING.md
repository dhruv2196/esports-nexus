# Testing Active Listener Payload Processing

## 🎯 Overview

This guide demonstrates how to test that an active listener (webhook, message queue, event listener) is properly receiving and passing payloads.

## 1. 🔊 Active Listener Implementation

### WebSocket Listener Example

```python
# websocket_listener.py
import asyncio
import websockets
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PayloadListener:
    def __init__(self):
        self.received_payloads = []
        self.processed_payloads = []
        self.active_connections = set()
        
    async def handle_connection(self, websocket, path):
        """Handle new WebSocket connection"""
        self.active_connections.add(websocket)
        logger.info(f"New connection established. Total connections: {len(self.active_connections)}")
        
        try:
            async for message in websocket:
                await self.process_payload(message, websocket)
        except websockets.exceptions.ConnectionClosed:
            logger.info("Connection closed")
        finally:
            self.active_connections.remove(websocket)
    
    async def process_payload(self, message, websocket):
        """Process received payload"""
        try:
            # Parse payload
            payload = json.loads(message)
            timestamp = datetime.now().isoformat()
            
            # Log receipt
            logger.info(f"Received payload: {payload}")
            
            # Store received payload
            received_record = {
                "timestamp": timestamp,
                "payload": payload,
                "status": "received"
            }
            self.received_payloads.append(received_record)
            
            # Validate payload
            if self.validate_payload(payload):
                # Process payload
                processed_result = await self.forward_payload(payload)
                
                # Store processed record
                processed_record = {
                    "timestamp": timestamp,
                    "payload": payload,
                    "status": "processed",
                    "result": processed_result
                }
                self.processed_payloads.append(processed_record)
                
                # Send acknowledgment
                response = {
                    "status": "success",
                    "message": "Payload processed successfully",
                    "id": payload.get("id"),
                    "timestamp": timestamp
                }
                await websocket.send(json.dumps(response))
            else:
                # Send error response
                response = {
                    "status": "error",
                    "message": "Invalid payload format",
                    "timestamp": timestamp
                }
                await websocket.send(json.dumps(response))
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            await websocket.send(json.dumps({"status": "error", "message": "Invalid JSON"}))
        except Exception as e:
            logger.error(f"Error processing payload: {str(e)}")
            await websocket.send(json.dumps({"status": "error", "message": str(e)}))
    
    def validate_payload(self, payload):
        """Validate payload structure"""
        required_fields = ["id", "type", "data"]
        return all(field in payload for field in required_fields)
    
    async def forward_payload(self, payload):
        """Forward payload to downstream service"""
        # Simulate forwarding to another service
        await asyncio.sleep(0.1)  # Simulate processing time
        
        # In real scenario, this would call another API or service
        logger.info(f"Forwarding payload {payload['id']} to downstream service")
        
        return {
            "forwarded": True,
            "downstream_response": "OK",
            "processing_time": 0.1
        }
    
    def get_stats(self):
        """Get listener statistics"""
        return {
            "total_received": len(self.received_payloads),
            "total_processed": len(self.processed_payloads),
            "active_connections": len(self.active_connections),
            "last_received": self.received_payloads[-1] if self.received_payloads else None
        }

# Start WebSocket server
async def start_listener():
    listener = PayloadListener()
    async with websockets.serve(listener.handle_connection, "localhost", 8765):
        logger.info("WebSocket listener started on ws://localhost:8765")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(start_listener())
```

### HTTP Webhook Listener Example

```python
# webhook_listener.py
from flask import Flask, request, jsonify
import json
import logging
from datetime import datetime
import requests
from threading import Thread
import queue

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebhookListener:
    def __init__(self):
        self.payload_queue = queue.Queue()
        self.received_payloads = []
        self.processed_payloads = []
        self.failed_payloads = []
        
        # Start background processor
        self.processor_thread = Thread(target=self.process_queue, daemon=True)
        self.processor_thread.start()
    
    def receive_payload(self, payload):
        """Receive and queue payload"""
        timestamp = datetime.now().isoformat()
        
        # Log and store
        logger.info(f"Received payload: {payload}")
        self.received_payloads.append({
            "timestamp": timestamp,
            "payload": payload
        })
        
        # Queue for processing
        self.payload_queue.put(payload)
        
        return {
            "status": "received",
            "timestamp": timestamp,
            "queue_size": self.payload_queue.qsize()
        }
    
    def process_queue(self):
        """Background processor for queued payloads"""
        while True:
            try:
                payload = self.payload_queue.get(timeout=1)
                self.process_payload(payload)
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Queue processor error: {str(e)}")
    
    def process_payload(self, payload):
        """Process individual payload"""
        timestamp = datetime.now().isoformat()
        
        try:
            # Validate
            if not self.validate_payload(payload):
                raise ValueError("Invalid payload format")
            
            # Forward to downstream
            result = self.forward_to_downstream(payload)
            
            # Store success
            self.processed_payloads.append({
                "timestamp": timestamp,
                "payload": payload,
                "result": result
            })
            
            logger.info(f"Successfully processed payload {payload.get('id')}")
            
        except Exception as e:
            # Store failure
            self.failed_payloads.append({
                "timestamp": timestamp,
                "payload": payload,
                "error": str(e)
            })
            logger.error(f"Failed to process payload: {str(e)}")
    
    def validate_payload(self, payload):
        """Validate payload structure"""
        required_fields = ["id", "type", "data"]
        return all(field in payload for field in required_fields)
    
    def forward_to_downstream(self, payload):
        """Forward to downstream service"""
        # Example: Forward to another API
        downstream_url = "http://localhost:9000/api/process"
        
        try:
            response = requests.post(
                downstream_url,
                json=payload,
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Downstream forwarding failed: {str(e)}")
            # In production, you might want to retry or queue for later
            raise

listener = WebhookListener()

@app.route('/webhook', methods=['POST'])
def webhook_endpoint():
    """Webhook endpoint to receive payloads"""
    try:
        payload = request.get_json()
        result = listener.receive_payload(payload)
        return jsonify(result), 202  # Accepted
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get listener statistics"""
    return jsonify({
        "received": len(listener.received_payloads),
        "processed": len(listener.processed_payloads),
        "failed": len(listener.failed_payloads),
        "queue_size": listener.payload_queue.qsize()
    })

if __name__ == '__main__':
    app.run(debug=True, port=8080)
```

## 2. 🧪 Test Client Implementation

### WebSocket Test Client

```python
# test_websocket_client.py
import asyncio
import websockets
import json
import uuid
from datetime import datetime

class WebSocketTestClient:
    def __init__(self, uri="ws://localhost:8765"):
        self.uri = uri
        self.responses = []
        
    async def send_test_payload(self, payload):
        """Send test payload and wait for response"""
        async with websockets.connect(self.uri) as websocket:
            # Send payload
            await websocket.send(json.dumps(payload))
            print(f"Sent payload: {payload}")
            
            # Wait for response
            response = await websocket.recv()
            response_data = json.loads(response)
            self.responses.append(response_data)
            print(f"Received response: {response_data}")
            
            return response_data
    
    async def send_multiple_payloads(self, payloads):
        """Send multiple payloads"""
        results = []
        async with websockets.connect(self.uri) as websocket:
            for payload in payloads:
                await websocket.send(json.dumps(payload))
                response = await websocket.recv()
                results.append(json.loads(response))
                await asyncio.sleep(0.1)  # Small delay between sends
        return results
    
    async def test_listener_scenarios(self):
        """Test various scenarios"""
        test_results = {}
        
        # Test 1: Valid payload
        print("\n=== Test 1: Valid Payload ===")
        valid_payload = {
            "id": str(uuid.uuid4()),
            "type": "order",
            "data": {
                "customer": "test-customer",
                "amount": 100.50,
                "items": ["item1", "item2"]
            }
        }
        result = await self.send_test_payload(valid_payload)
        test_results["valid_payload"] = result["status"] == "success"
        
        # Test 2: Invalid payload (missing required field)
        print("\n=== Test 2: Invalid Payload ===")
        invalid_payload = {
            "id": str(uuid.uuid4()),
            "data": {"test": "data"}
            # Missing 'type' field
        }
        result = await self.send_test_payload(invalid_payload)
        test_results["invalid_payload"] = result["status"] == "error"
        
        # Test 3: Malformed JSON
        print("\n=== Test 3: Malformed JSON ===")
        async with websockets.connect(self.uri) as websocket:
            await websocket.send("invalid json {")
            response = await websocket.recv()
            result = json.loads(response)
            test_results["malformed_json"] = result["status"] == "error"
        
        # Test 4: Rapid fire payloads
        print("\n=== Test 4: Rapid Fire Payloads ===")
        rapid_payloads = [
            {
                "id": f"rapid-{i}",
                "type": "test",
                "data": {"index": i}
            }
            for i in range(10)
        ]
        results = await self.send_multiple_payloads(rapid_payloads)
        test_results["rapid_fire"] = all(r["status"] == "success" for r in results)
        
        return test_results

# Run tests
async def main():
    client = WebSocketTestClient()
    results = await client.test_listener_scenarios()
    
    print("\n=== Test Results ===")
    for test, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test}: {status}")

if __name__ == "__main__":
    asyncio.run(main())
```

### HTTP Webhook Test Client

```python
# test_webhook_client.py
import requests
import json
import uuid
import time
from concurrent.futures import ThreadPoolExecutor
import threading

class WebhookTestClient:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.results = []
        self.lock = threading.Lock()
    
    def send_payload(self, payload):
        """Send single payload"""
        response = requests.post(
            f"{self.base_url}/webhook",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        return response
    
    def test_valid_payload(self):
        """Test with valid payload"""
        payload = {
            "id": str(uuid.uuid4()),
            "type": "transaction",
            "data": {
                "amount": 250.00,
                "currency": "USD",
                "timestamp": time.time()
            }
        }
        
        response = self.send_payload(payload)
        print(f"Valid payload test: Status {response.status_code}")
        print(f"Response: {response.json()}")
        
        return response.status_code == 202
    
    def test_invalid_payload(self):
        """Test with invalid payload"""
        payload = {
            "id": str(uuid.uuid4()),
            # Missing required fields
        }
        
        response = self.send_payload(payload)
        print(f"Invalid payload test: Status {response.status_code}")
        
        # Should still accept but will fail processing
        return response.status_code == 202
    
    def test_concurrent_payloads(self, num_payloads=50):
        """Test concurrent payload sending"""
        def send_single(index):
            payload = {
                "id": f"concurrent-{index}",
                "type": "stress-test",
                "data": {
                    "index": index,
                    "timestamp": time.time()
                }
            }
            
            start_time = time.time()
            response = self.send_payload(payload)
            end_time = time.time()
            
            with self.lock:
                self.results.append({
                    "index": index,
                    "status": response.status_code,
                    "duration": end_time - start_time
                })
        
        # Send payloads concurrently
        with ThreadPoolExecutor(max_workers=10) as executor:
            executor.map(send_single, range(num_payloads))
        
        # Check results
        successful = sum(1 for r in self.results if r["status"] == 202)
        avg_duration = sum(r["duration"] for r in self.results) / len(self.results)
        
        print(f"\nConcurrent test results:")
        print(f"Total sent: {num_payloads}")
        print(f"Successful: {successful}")
        print(f"Average duration: {avg_duration:.3f}s")
        
        return successful == num_payloads
    
    def check_processing_status(self):
        """Check listener statistics"""
        response = requests.get(f"{self.base_url}/stats")
        stats = response.json()
        
        print(f"\nListener Statistics:")
        print(f"Received: {stats['received']}")
        print(f"Processed: {stats['processed']}")
        print(f"Failed: {stats['failed']}")
        print(f"Queue size: {stats['queue_size']}")
        
        return stats
    
    def run_all_tests(self):
        """Run all test scenarios"""
        print("=== Running Webhook Listener Tests ===\n")
        
        tests = {
            "Valid Payload": self.test_valid_payload(),
            "Invalid Payload": self.test_invalid_payload(),
            "Concurrent Payloads": self.test_concurrent_payloads()
        }
        
        # Wait for processing
        print("\nWaiting for processing to complete...")
        time.sleep(2)
        
        # Check final status
        final_stats = self.check_processing_status()
        
        print("\n=== Test Summary ===")
        for test_name, passed in tests.items():
            status = "✅ PASSED" if passed else "❌ FAILED"
            print(f"{test_name}: {status}")
        
        return tests, final_stats

if __name__ == "__main__":
    client = WebhookTestClient()
    client.run_all_tests()
```

## 3. 📮 Postman Collection for Testing

```json
{
  "info": {
    "name": "Active Listener Tests",
    "description": "Test collection for active listener payload processing"
  },
  "item": [
    {
      "name": "Test Valid Payload",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 202 Accepted\", function () {",
              "    pm.response.to.have.status(202);",
              "});",
              "",
              "pm.test(\"Response has status field\", function () {",
              "    var jsonData = pm.response.json();",
              "    pm.expect(jsonData).to.have.property('status');",
              "    pm.expect(jsonData.status).to.equal('received');",
              "});",
              "",
              "pm.test(\"Response has timestamp\", function () {",
              "    var jsonData = pm.response.json();",
              "    pm.expect(jsonData).to.have.property('timestamp');",
              "});",
              "",
              "// Store response for later verification",
              "pm.collectionVariables.set(\"last_payload_timestamp\", pm.response.json().timestamp);"
            ]
          }
        },
        {
          "listen": "prerequest",
          "script": {
            "exec": [
              "// Generate unique payload ID",
              "pm.collectionVariables.set(\"payload_id\", pm.variables.replaceIn('{{$guid}}'));",
              "pm.collectionVariables.set(\"timestamp\", new Date().toISOString());"
            ]
          }
        }
      ],
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
          "raw": "{\n    \"id\": \"{{payload_id}}\",\n    \"type\": \"test-payload\",\n    \"data\": {\n        \"message\": \"Test from Postman\",\n        \"timestamp\": \"{{timestamp}}\",\n        \"value\": {{$randomInt}}\n    }\n}"
        },
        "url": {
          "raw": "{{base_url}}/webhook",
          "host": ["{{base_url}}"],
          "path": ["webhook"]
        }
      }
    },
    {
      "name": "Check Listener Stats",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"Status code is 200\", function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test(\"Stats include all required fields\", function () {",
              "    var jsonData = pm.response.json();",
              "    pm.expect(jsonData).to.have.property('received');",
              "    pm.expect(jsonData).to.have.property('processed');",
              "    pm.expect(jsonData).to.have.property('failed');",
              "    pm.expect(jsonData).to.have.property('queue_size');",
              "});",
              "",
              "pm.test(\"Payloads are being processed\", function () {",
              "    var jsonData = pm.response.json();",
              "    pm.expect(jsonData.received).to.be.above(0);",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/stats",
          "host": ["{{base_url}}"],
          "path": ["stats"]
        }
      }
    },
    {
      "name": "Load Test - Multiple Payloads",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test(\"All requests accepted\", function () {",
              "    pm.response.to.have.status(202);",
              "});"
            ]
          }
        }
      ],
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
          "raw": "{\n    \"id\": \"load-test-{{$randomInt}}\",\n    \"type\": \"load-test\",\n    \"data\": {\n        \"iteration\": {{$randomInt}},\n        \"timestamp\": \"{{$timestamp}}\"\n    }\n}"
        },
        "url": {
          "raw": "{{base_url}}/webhook",
          "host": ["{{base_url}}"],
          "path": ["webhook"]
        }
      }
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [""]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [""]
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8080",
      "type": "string"
    }
  ]
}
```

## 4. 🔍 Mock Downstream Service

```python
# mock_downstream.py
from flask import Flask, request, jsonify
import time
import random

app = Flask(__name__)

@app.route('/api/process', methods=['POST'])
def process_payload():
    """Mock downstream service that receives forwarded payloads"""
    payload = request.get_json()
    
    # Simulate processing time
    processing_time = random.uniform(0.1, 0.5)
    time.sleep(processing_time)
    
    # Simulate different responses
    if random.random() > 0.9:  # 10% failure rate
        return jsonify({
            "status": "error",
            "message": "Processing failed"
        }), 500
    
    return jsonify({
        "status": "success",
        "processed_id": payload.get("id"),
        "processing_time": processing_time,
        "result": "Payload processed by downstream service"
    }), 200

if __name__ == '__main__':
    app.run(port=9000)
```

## 5. 🧪 Integration Test Suite

```python
# integration_test.py
import unittest
import requests
import json
import time
import subprocess
import signal
import os

class ListenerIntegrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Start all services"""
        # Start mock downstream service
        cls.downstream_process = subprocess.Popen(
            ['python', 'mock_downstream.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Start webhook listener
        cls.listener_process = subprocess.Popen(
            ['python', 'webhook_listener.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for services to start
        time.sleep(2)
    
    @classmethod
    def tearDownClass(cls):
        """Stop all services"""
        cls.downstream_process.terminate()
        cls.listener_process.terminate()
    
    def test_end_to_end_flow(self):
        """Test complete flow from listener to downstream"""
        # Send payload
        payload = {
            "id": "test-e2e-001",
            "type": "integration-test",
            "data": {"test": "data"}
        }
        
        response = requests.post(
            "http://localhost:8080/webhook",
            json=payload
        )
        
        self.assertEqual(response.status_code, 202)
        
        # Wait for processing
        time.sleep(1)
        
        # Check stats
        stats_response = requests.get("http://localhost:8080/stats")
        stats = stats_response.json()
        
        self.assertGreater(stats['received'], 0)
        self.assertGreater(stats['processed'], 0)

if __name__ == '__main__':
    unittest.main()
```

## 6. 📊 Monitoring Dashboard

```python
# listener_monitor.py
import requests
import time
from datetime import datetime
import os

class ListenerMonitor:
    def __init__(self, listener_url="http://localhost:8080"):
        self.listener_url = listener_url
    
    def monitor_loop(self):
        """Continuous monitoring loop"""
        while True:
            try:
                # Get stats
                response = requests.get(f"{self.listener_url}/stats")
                stats = response.json()
                
                # Clear screen
                os.system('cls' if os.name == 'nt' else 'clear')
                
                # Display dashboard
                print("=" * 50)
                print(f"LISTENER MONITORING DASHBOARD")
                print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print("=" * 50)
                print(f"Total Received:  {stats['received']:>10}")
                print(f"Total Processed: {stats['processed']:>10}")
                print(f"Total Failed:    {stats['failed']:>10}")
                print(f"Queue Size:      {stats['queue_size']:>10}")
                print("=" * 50)
                
                # Calculate rates
                if hasattr(self, 'last_stats'):
                    received_rate = stats['received'] - self.last_stats['received']
                    processed_rate = stats['processed'] - self.last_stats['processed']
                    print(f"Receive Rate:    {received_rate:>10}/s")
                    print(f"Process Rate:    {processed_rate:>10}/s")
                
                self.last_stats = stats
                
            except Exception as e:
                print(f"Error: {str(e)}")
            
            time.sleep(1)

if __name__ == "__main__":
    monitor = ListenerMonitor()
    monitor.monitor_loop()
```

## 7. 🚀 Running the Complete Test

```bash
# Terminal 1: Start mock downstream service
python mock_downstream.py

# Terminal 2: Start webhook listener
python webhook_listener.py

# Terminal 3: Run tests
python test_webhook_client.py

# Terminal 4: Monitor dashboard
python listener_monitor.py

# Terminal 5: Run Postman collection
newman run active_listener_tests.json -e environment.json --iteration-count 100
```

This comprehensive testing setup allows you to verify that your active listener is:
1. ✅ Receiving payloads correctly
2. ✅ Validating payload format
3. ✅ Queuing for processing
4. ✅ Forwarding to downstream services
5. ✅ Handling errors gracefully
6. ✅ Processing concurrently
7. ✅ Maintaining statistics

The tests cover various scenarios including valid/invalid payloads, concurrent requests, and end-to-end flow verification.