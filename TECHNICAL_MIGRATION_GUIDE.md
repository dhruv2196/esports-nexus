# Technical Migration Guide: From Monolith to Microservices

**Version**: 1.0  
**Date**: December 2024  
**Purpose**: Step-by-step guide for migrating the current Spring Boot monolith to the TRD-specified microservices architecture

---

## 1. Current Architecture Analysis

### 1.1 Existing Spring Boot Structure
Based on the codebase analysis, the current monolithic application has:

```
backend/
├── controller/
│   ├── AuthController.java
│   ├── TournamentController.java
│   ├── UserController.java
│   └── PubgController.java
├── service/
│   ├── UserService.java
│   ├── TournamentService.java
│   └── PubgService.java
├── repository/
│   ├── UserRepository.java
│   └── TournamentRepository.java
├── security/
│   ├── JwtUtils.java
│   └── SecurityConfig.java
└── model/
    ├── User.java
    └── Tournament.java
```

### 1.2 Database Schema (MongoDB)
Current collections:
- `users`: User accounts and profiles
- `tournaments`: Tournament data
- `matches`: Match history
- `teams`: Team information

---

## 2. Service Decomposition Strategy

### 2.1 Service Boundaries
Based on the TRD, we'll create these services:

| Service | Language | Database | Extracted From |
|---------|----------|----------|----------------|
| User Service | Node.js | PostgreSQL | AuthController, UserService |
| Tournament Service | Go | PostgreSQL | TournamentController, TournamentService |
| Game Integration | Python | DynamoDB | PubgController, PubgService |
| Team Service | Node.js | PostgreSQL | TeamController, TeamService |
| AI/ML Service | Python | PostgreSQL + S3 | New functionality |
| Payment Service | Node.js | PostgreSQL | New functionality |

### 2.2 API Gateway Routes
```yaml
# AWS API Gateway configuration
paths:
  /api/v1/users/**:
    target: http://user-service.internal:3000
  /api/v1/tournaments/**:
    target: http://tournament-service.internal:8080
  /api/v1/games/**:
    target: http://game-service.internal:5000
  /api/v1/teams/**:
    target: http://team-service.internal:3001
  /api/v1/ai/**:
    target: http://ai-service.internal:5001
  /api/v1/payments/**:
    target: http://payment-service.internal:3002
```

---

## 3. Step-by-Step Migration Plan

### Phase 1: Infrastructure Setup (Week 1)

#### 3.1 AWS Account Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure AWS credentials
aws configure

# Create VPC and subnets
aws ec2 create-vpc --cidr-block 10.0.0.0/16
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.2.0/24
```

#### 3.2 EKS Cluster Setup
```bash
# Install eksctl
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl

# Create EKS cluster
eksctl create cluster \
  --name esports-nexus-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 5 \
  --managed
```

#### 3.3 Database Setup
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier esports-nexus-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.3 \
  --master-username admin \
  --master-user-password $DB_PASSWORD \
  --allocated-storage 100 \
  --vpc-security-group-ids sg-xxx

# Create DynamoDB tables
aws dynamodb create-table \
  --table-name match_stats \
  --attribute-definitions \
    AttributeName=match_id,AttributeType=S \
    AttributeName=game_id,AttributeType=S \
  --key-schema \
    AttributeName=match_id,KeyType=HASH \
    AttributeName=game_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### Phase 2: User Service Extraction (Week 2)

#### 3.4 Create User Service (Node.js)
```bash
mkdir -p services/user-service
cd services/user-service
npm init -y
npm install express @nestjs/core @nestjs/common @nestjs/platform-express
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install class-validator class-transformer
```

#### 3.5 User Service Implementation
```typescript
// services/user-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  await app.listen(3000);
}
bootstrap();

// services/user-service/src/users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  oauth_provider: string;

  @Column({ nullable: true })
  oauth_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

// services/user-service/src/users/users.controller.ts
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }
}
```

#### 3.6 Data Migration Script
```python
# scripts/migrate_users.py
import pymongo
import psycopg2
import bcrypt
from datetime import datetime
import uuid

def migrate_users():
    # MongoDB connection
    mongo_client = pymongo.MongoClient("mongodb://admin:esportsNexusAdmin2024@localhost:27017/esports_nexus?authSource=admin")
    mongo_db = mongo_client["esports_nexus"]
    users_collection = mongo_db["users"]
    
    # PostgreSQL connection
    pg_conn = psycopg2.connect(
        host="esports-nexus-db.xxx.rds.amazonaws.com",
        database="esports_nexus",
        user="admin",
        password="your_password"
    )
    pg_cursor = pg_conn.cursor()
    
    # Create users table if not exists
    pg_cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255),
            oauth_provider VARCHAR(50),
            oauth_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Migrate users
    migrated = 0
    for user in users_collection.find():
        try:
            user_id = str(uuid.uuid4())
            username = user.get('username')
            email = user.get('email')
            password_hash = user.get('password')
            created_at = user.get('createdAt', datetime.now())
            
            pg_cursor.execute("""
                INSERT INTO users (user_id, username, email, password_hash, created_at)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (email) DO NOTHING
            """, (user_id, username, email, password_hash, created_at))
            
            migrated += 1
            if migrated % 100 == 0:
                print(f"Migrated {migrated} users...")
                pg_conn.commit()
        
        except Exception as e:
            print(f"Error migrating user {user.get('email')}: {e}")
            pg_conn.rollback()
    
    pg_conn.commit()
    print(f"Migration complete. Migrated {migrated} users.")
    
    pg_cursor.close()
    pg_conn.close()
    mongo_client.close()

if __name__ == "__main__":
    migrate_users()
```

### Phase 3: Tournament Service (Week 3)

#### 3.7 Create Tournament Service (Go)
```bash
mkdir -p services/tournament-service
cd services/tournament-service
go mod init github.com/esportsnexus/tournament-service
```

#### 3.8 Tournament Service Implementation
```go
// services/tournament-service/main.go
package main

import (
    "log"
    "net/http"
    "github.com/gorilla/mux"
    "github.com/jinzhu/gorm"
    _ "github.com/lib/pq"
)

type Tournament struct {
    gorm.Model
    ID           string `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
    Name         string `gorm:"not null"`
    GameID       string `gorm:"type:uuid"`
    OrganizerID  string `gorm:"type:uuid"`
    BracketType  string
    PrizePoolCents int
    Status       string
}

var db *gorm.DB

func main() {
    var err error
    db, err = gorm.Open("postgres", "host=esports-nexus-db.xxx.rds.amazonaws.com user=admin dbname=esports_nexus sslmode=require password=yourpassword")
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()
    
    db.AutoMigrate(&Tournament{})
    
    router := mux.NewRouter()
    router.HandleFunc("/api/v1/tournaments", CreateTournament).Methods("POST")
    router.HandleFunc("/api/v1/tournaments", GetTournaments).Methods("GET")
    router.HandleFunc("/api/v1/tournaments/{id}", GetTournament).Methods("GET")
    
    log.Println("Tournament service starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}

func CreateTournament(w http.ResponseWriter, r *http.Request) {
    // Implementation
}

func GetTournaments(w http.ResponseWriter, r *http.Request) {
    // Implementation
}

func GetTournament(w http.ResponseWriter, r *http.Request) {
    // Implementation
}
```

### Phase 4: AI/ML Service Setup (Week 4)

#### 3.9 Create AI/ML Service (Python)
```bash
mkdir -p services/ai-service
cd services/ai-service
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary
pip install scikit-learn tensorflow pandas numpy
pip install boto3  # For AWS integration
```

#### 3.10 AI Service Implementation
```python
# services/ai-service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.cluster import KMeans
import joblib
import asyncpg
import os

app = FastAPI()

# Load pre-trained models
kmeans_model = None
team_recommender = None

@app.on_event("startup")
async def startup_event():
    global kmeans_model, team_recommender
    # Load models from S3 or local storage
    try:
        kmeans_model = joblib.load('models/player_clustering.pkl')
        team_recommender = joblib.load('models/team_recommender.pkl')
    except:
        print("Models not found, will train on first request")

class TeamRecommendationRequest(BaseModel):
    user_id: str
    game_id: str
    preferred_roles: List[str]

class TeamRecommendationResponse(BaseModel):
    recommended_players: List[dict]
    chemistry_score: float

@app.post("/api/v1/ai/recommend-team", response_model=TeamRecommendationResponse)
async def recommend_team(request: TeamRecommendationRequest):
    # Connect to database
    conn = await asyncpg.connect(
        host=os.getenv('DB_HOST'),
        database='esports_nexus',
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    
    # Get player stats
    player_stats = await conn.fetch("""
        SELECT p.*, u.username 
        FROM player_profiles p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.game_id = $1 AND p.user_id != $2
    """, request.game_id, request.user_id)
    
    # Prepare features for clustering
    features = []
    for player in player_stats:
        stats = player['stats_json']
        features.append([
            stats.get('kda', 0),
            stats.get('win_rate', 0),
            stats.get('matches_played', 0)
        ])
    
    # Cluster players
    if kmeans_model:
        clusters = kmeans_model.predict(features)
    else:
        kmeans_model = KMeans(n_clusters=5)
        clusters = kmeans_model.fit_predict(features)
    
    # Find compatible players
    recommended_players = []
    for i, player in enumerate(player_stats):
        if clusters[i] == clusters[0]:  # Same cluster as requesting user
            recommended_players.append({
                'user_id': player['user_id'],
                'username': player['username'],
                'stats': player['stats_json']
            })
    
    # Calculate chemistry score
    chemistry_score = calculate_team_chemistry(recommended_players[:4])
    
    await conn.close()
    
    return TeamRecommendationResponse(
        recommended_players=recommended_players[:4],
        chemistry_score=chemistry_score
    )

def calculate_team_chemistry(players):
    # Simplified chemistry calculation
    if not players:
        return 0.0
    
    total_kda = sum(p['stats'].get('kda', 0) for p in players)
    avg_win_rate = sum(p['stats'].get('win_rate', 0) for p in players) / len(players)
    
    chemistry = (total_kda / len(players)) * 0.3 + avg_win_rate * 0.7
    return min(chemistry, 100.0)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
```

### Phase 5: API Gateway Configuration (Week 5)

#### 3.11 AWS API Gateway Setup
```terraform
# infrastructure/api-gateway.tf
resource "aws_api_gateway_rest_api" "esports_api" {
  name        = "esports-nexus-api"
  description = "API Gateway for Esports Nexus microservices"
}

resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.esports_api.id
  parent_id   = aws_api_gateway_rest_api.esports_api.root_resource_id
  path_part   = "users"
}

resource "aws_api_gateway_integration" "users_integration" {
  rest_api_id = aws_api_gateway_rest_api.esports_api.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = "ANY"
  
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${aws_lb.user_service_lb.dns_name}/{proxy}"
  
  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}
```

### Phase 6: Monitoring Setup (Week 6)

#### 3.12 Prometheus Configuration
```yaml
# k8s/monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
```

#### 3.13 Service Mesh Setup (Istio)
```bash
# Install Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo -y

# Enable sidecar injection
kubectl label namespace default istio-injection=enabled

# Apply traffic management rules
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: user-service
spec:
  hosts:
  - user-service
  http:
  - match:
    - uri:
        prefix: /api/v1/users
    route:
    - destination:
        host: user-service
        port:
          number: 3000
      weight: 100
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
EOF
```

---

## 4. Rollback Strategy

### 4.1 Database Rollback
```sql
-- Backup before migration
pg_dump -h esports-nexus-db.xxx.rds.amazonaws.com -U admin -d esports_nexus > backup_$(date +%Y%m%d).sql

-- Rollback procedure
psql -h esports-nexus-db.xxx.rds.amazonaws.com -U admin -d esports_nexus < backup_20240101.sql
```

### 4.2 Service Rollback
```bash
# Kubernetes rollback
kubectl rollout undo deployment/user-service
kubectl rollout undo deployment/tournament-service

# Check rollback status
kubectl rollout status deployment/user-service
```

---

## 5. Testing Strategy

### 5.1 Integration Tests
```javascript
// tests/integration/user-service.test.js
const request = require('supertest');
const app = require('../../services/user-service/src/app');

describe('User Service Integration Tests', () => {
  test('POST /api/v1/users/register', async () => {
    const response = await request(app)
      .post('/api/v1/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user_id');
  });
});
```

### 5.2 Load Testing
```python
# tests/load/locustfile.py
from locust import HttpUser, task, between

class EsportsUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def view_tournaments(self):
        self.client.get("/api/v1/tournaments")
    
    @task
    def view_user_profile(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/v1/users/me", headers=headers)
    
    def on_start(self):
        response = self.client.post("/api/v1/users/login", json={
            "email": "test@example.com",
            "password": "Test123!"
        })
        self.token = response.json()["token"]
```

---

## 6. Deployment Checklist

### Pre-deployment
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Load tests meet performance requirements
- [ ] Security scan completed
- [ ] Database migrations tested
- [ ] Rollback procedures documented
- [ ] Monitoring dashboards configured
- [ ] Alerts configured

### Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Verify monitoring metrics
- [ ] Deploy to production (blue-green)
- [ ] Run production smoke tests
- [ ] Monitor error rates
- [ ] Switch traffic gradually

### Post-deployment
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Verify data consistency
- [ ] Update documentation
- [ ] Team retrospective

---

This migration guide provides a practical, step-by-step approach to transforming the monolithic application into the microservices architecture specified in the TRD.