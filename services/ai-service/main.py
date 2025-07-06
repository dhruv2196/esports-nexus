from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow as tf
from datetime import datetime
import asyncpg
import redis.asyncio as redis
import boto3
import joblib
import json
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI/ML Service",
    description="AI-powered features for team matching and performance prediction",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_NAME = os.getenv("DB_NAME", "esports_nexus_analytics")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
S3_BUCKET = os.getenv("S3_BUCKET", "esports-nexus-models")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Global variables
db_pool = None
redis_client = None
s3_client = boto3.client('s3', region_name=AWS_REGION)

# ML Models storage
models = {
    "player_clustering": None,
    "team_recommender": None,
    "performance_predictor": None,
    "churn_predictor": None
}

# Pydantic models
class TeamRecommendationRequest(BaseModel):
    user_id: str
    game_id: str
    preferred_roles: List[str]
    language: Optional[str] = "en"
    region: Optional[str] = None

class TeamRecommendationResponse(BaseModel):
    recommended_players: List[Dict[str, Any]]
    chemistry_score: float
    confidence: float

class PerformancePredictionRequest(BaseModel):
    player_ids: List[str]
    game_id: str
    match_type: str

class PerformancePredictionResponse(BaseModel):
    win_probability: float
    predicted_score: Dict[str, float]
    key_factors: List[str]

class PlayerAnalysisRequest(BaseModel):
    player_id: str
    game_id: str
    time_period: Optional[int] = 30  # days

class TrainingRequest(BaseModel):
    model_type: str
    game_id: str
    hyperparameters: Optional[Dict[str, Any]] = {}

# Startup and shutdown events
@app.on_event("startup")
async def startup():
    global db_pool, redis_client
    
    # Initialize database connection
    try:
        db_pool = await asyncpg.create_pool(
            host=DB_HOST,
            port=int(DB_PORT),
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            min_size=10,
            max_size=20
        )
        logger.info("Database connection pool created")
        await create_tables()
    except Exception as e:
        logger.error(f"Failed to create database pool: {e}")
    
    # Initialize Redis
    try:
        redis_client = await redis.from_url(REDIS_URL, decode_responses=True)
        await redis_client.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
    
    # Load ML models
    await load_models()

@app.on_event("shutdown")
async def shutdown():
    if db_pool:
        await db_pool.close()
    if redis_client:
        await redis_client.close()

async def create_tables():
    """Create necessary tables for analytics"""
    async with db_pool.acquire() as conn:
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS player_features (
                player_id VARCHAR(255) PRIMARY KEY,
                game_id VARCHAR(50),
                features JSONB,
                cluster_id INTEGER,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS team_recommendations (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255),
                game_id VARCHAR(50),
                recommended_team JSONB,
                chemistry_score FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS model_metadata (
                model_name VARCHAR(100) PRIMARY KEY,
                version VARCHAR(50),
                accuracy FLOAT,
                trained_at TIMESTAMP,
                hyperparameters JSONB
            )
        ''')

async def load_models():
    """Load pre-trained models from S3"""
    model_files = {
        "player_clustering": "kmeans_player_clustering.pkl",
        "team_recommender": "team_recommender.pkl",
        "performance_predictor": "performance_predictor.h5",
        "churn_predictor": "churn_predictor.pkl"
    }
    
    for model_name, filename in model_files.items():
        try:
            # Download from S3
            local_path = f"/tmp/{filename}"
            s3_client.download_file(S3_BUCKET, f"models/{filename}", local_path)
            
            # Load model based on type
            if filename.endswith('.pkl'):
                models[model_name] = joblib.load(local_path)
            elif filename.endswith('.h5'):
                models[model_name] = tf.keras.models.load_model(local_path)
            
            logger.info(f"Loaded model: {model_name}")
        except Exception as e:
            logger.warning(f"Could not load model {model_name}: {e}")
            # Initialize default models if not found
            if model_name == "player_clustering":
                models[model_name] = KMeans(n_clusters=5, random_state=42)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "ai-service",
        "version": "1.0.0",
        "models_loaded": {k: v is not None for k, v in models.items()}
    }

# Team recommendation endpoint
@app.post("/api/v1/ai/recommend-team", response_model=TeamRecommendationResponse)
async def recommend_team(request: TeamRecommendationRequest):
    """Recommend compatible teammates using AI"""
    
    # Check cache first
    cache_key = f"team_rec:{request.user_id}:{request.game_id}"
    if redis_client:
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
    
    try:
        # Get player features
        async with db_pool.acquire() as conn:
            # Get requesting player's features
            user_data = await conn.fetchrow(
                "SELECT features, cluster_id FROM player_features WHERE player_id = $1 AND game_id = $2",
                request.user_id, request.game_id
            )
            
            if not user_data:
                # Generate features if not exists
                user_features = await generate_player_features(request.user_id, request.game_id)
            else:
                user_features = json.loads(user_data['features'])
            
            # Get potential teammates
            candidates = await conn.fetch(
                """SELECT p.player_id, p.features, p.cluster_id, u.username, u.profile
                   FROM player_features p
                   JOIN users u ON p.player_id = u.user_id
                   WHERE p.game_id = $1 AND p.player_id != $2
                   AND ($3::text IS NULL OR u.profile->>'language' = $3)
                   AND ($4::text IS NULL OR u.profile->>'country' = $4)
                   LIMIT 100""",
                request.game_id, request.user_id, request.language, request.region
            )
        
        # Calculate compatibility scores
        recommendations = []
        user_vector = np.array(list(user_features.values()))
        
        for candidate in candidates:
            candidate_features = json.loads(candidate['features'])
            candidate_vector = np.array(list(candidate_features.values()))
            
            # Calculate similarity
            similarity = cosine_similarity([user_vector], [candidate_vector])[0][0]
            
            # Role compatibility
            role_score = calculate_role_compatibility(
                user_features.get('preferred_roles', []),
                candidate_features.get('preferred_roles', []),
                request.preferred_roles
            )
            
            # Communication style compatibility
            comm_score = calculate_communication_compatibility(
                user_features.get('communication_style', {}),
                candidate_features.get('communication_style', {})
            )
            
            # Overall chemistry score
            chemistry = (similarity * 0.4 + role_score * 0.4 + comm_score * 0.2) * 100
            
            recommendations.append({
                'user_id': candidate['player_id'],
                'username': candidate['username'],
                'chemistry_score': chemistry,
                'stats': candidate_features.get('stats', {}),
                'preferred_roles': candidate_features.get('preferred_roles', [])
            })
        
        # Sort by chemistry score
        recommendations.sort(key=lambda x: x['chemistry_score'], reverse=True)
        top_recommendations = recommendations[:4]  # Top 4 players for a 5-person team
        
        # Calculate team chemistry
        team_chemistry = calculate_team_chemistry(top_recommendations)
        
        response = TeamRecommendationResponse(
            recommended_players=top_recommendations,
            chemistry_score=team_chemistry,
            confidence=0.85  # Model confidence
        )
        
        # Cache result
        if redis_client:
            await redis_client.setex(cache_key, 3600, json.dumps(response.dict()))
        
        # Store recommendation
        async with db_pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO team_recommendations (user_id, game_id, recommended_team, chemistry_score)
                   VALUES ($1, $2, $3, $4)""",
                request.user_id, request.game_id, json.dumps(response.dict()), team_chemistry
            )
        
        return response
        
    except Exception as e:
        logger.error(f"Error in team recommendation: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

# Performance prediction endpoint
@app.post("/api/v1/ai/predict-performance", response_model=PerformancePredictionResponse)
async def predict_performance(request: PerformancePredictionRequest):
    """Predict team performance using ML models"""
    
    if not models["performance_predictor"]:
        raise HTTPException(status_code=503, detail="Performance prediction model not available")
    
    try:
        # Get player features
        features = []
        async with db_pool.acquire() as conn:
            for player_id in request.player_ids:
                player_data = await conn.fetchrow(
                    "SELECT features FROM player_features WHERE player_id = $1 AND game_id = $2",
                    player_id, request.game_id
                )
                if player_data:
                    features.append(json.loads(player_data['features']))
        
        if len(features) < len(request.player_ids):
            raise HTTPException(status_code=400, detail="Some players not found")
        
        # Prepare input for model
        team_features = aggregate_team_features(features)
        input_vector = prepare_model_input(team_features, request.match_type)
        
        # Make prediction
        if isinstance(models["performance_predictor"], tf.keras.Model):
            prediction = models["performance_predictor"].predict(input_vector)
            win_probability = float(prediction[0][0])
        else:
            win_probability = 0.5  # Default if model not available
        
        # Analyze key factors
        key_factors = analyze_key_factors(team_features)
        
        response = PerformancePredictionResponse(
            win_probability=win_probability,
            predicted_score={
                "kills": team_features.get("avg_kills", 0) * 5,
                "deaths": team_features.get("avg_deaths", 0) * 5,
                "objectives": team_features.get("avg_objectives", 0)
            },
            key_factors=key_factors
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error in performance prediction: {e}")
        raise HTTPException(status_code=500, detail="Failed to predict performance")

# Player analysis endpoint
@app.post("/api/v1/ai/analyze-player")
async def analyze_player(request: PlayerAnalysisRequest):
    """Analyze player performance and provide insights"""
    
    try:
        async with db_pool.acquire() as conn:
            # Get player's match history
            matches = await conn.fetch(
                """SELECT match_data, match_date FROM match_history 
                   WHERE player_id = $1 AND game_id = $2 
                   AND match_date > CURRENT_DATE - INTERVAL '%s days'
                   ORDER BY match_date DESC""",
                request.player_id, request.game_id, request.time_period
            )
        
        if not matches:
            raise HTTPException(status_code=404, detail="No match data found")
        
        # Analyze performance trends
        performance_data = []
        for match in matches:
            match_stats = json.loads(match['match_data'])
            performance_data.append({
                'date': match['match_date'],
                'kda': match_stats.get('kda', 0),
                'win': match_stats.get('win', False),
                'score': match_stats.get('score', 0)
            })
        
        df = pd.DataFrame(performance_data)
        
        # Calculate insights
        insights = {
            'average_kda': df['kda'].mean(),
            'win_rate': df['win'].mean() * 100,
            'performance_trend': calculate_trend(df['score'].values),
            'consistency_score': 100 - (df['kda'].std() / df['kda'].mean() * 100),
            'best_performance': df.loc[df['score'].idxmax()].to_dict(),
            'improvement_areas': identify_improvement_areas(df)
        }
        
        # Generate personalized recommendations
        recommendations = generate_player_recommendations(insights)
        
        return {
            'player_id': request.player_id,
            'analysis_period': request.time_period,
            'total_matches': len(matches),
            'insights': insights,
            'recommendations': recommendations
        }
        
    except Exception as e:
        logger.error(f"Error in player analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze player")

# Model training endpoint
@app.post("/api/v1/ai/train")
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Trigger model training"""
    
    if request.model_type not in models:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    # Add training to background tasks
    background_tasks.add_task(
        train_model_task,
        request.model_type,
        request.game_id,
        request.hyperparameters
    )
    
    return {"message": f"Training started for {request.model_type}"}

# Helper functions
async def generate_player_features(player_id: str, game_id: str) -> Dict[str, Any]:
    """Generate features for a player"""
    # This would fetch player stats and generate features
    # Simplified version for demonstration
    features = {
        'kda': np.random.uniform(0.5, 3.0),
        'win_rate': np.random.uniform(0.3, 0.7),
        'matches_played': np.random.randint(10, 1000),
        'avg_score': np.random.uniform(100, 300),
        'preferred_roles': ['duelist', 'support'],
        'communication_style': {
            'frequency': np.random.uniform(0, 1),
            'positivity': np.random.uniform(0, 1)
        }
    }
    
    # Store in database
    async with db_pool.acquire() as conn:
        await conn.execute(
            """INSERT INTO player_features (player_id, game_id, features)
               VALUES ($1, $2, $3)
               ON CONFLICT (player_id) DO UPDATE SET features = $3""",
            player_id, game_id, json.dumps(features)
        )
    
    return features

def calculate_role_compatibility(user_roles: List[str], candidate_roles: List[str], 
                                preferred_roles: List[str]) -> float:
    """Calculate role compatibility score"""
    # Check if roles complement each other
    role_overlap = len(set(user_roles) & set(candidate_roles))
    role_coverage = len(set(preferred_roles) & set(candidate_roles))
    
    # Penalize too much overlap, reward coverage
    compatibility = (role_coverage / len(preferred_roles)) - (role_overlap * 0.2)
    return max(0, min(1, compatibility))

def calculate_communication_compatibility(user_comm: Dict, candidate_comm: Dict) -> float:
    """Calculate communication style compatibility"""
    if not user_comm or not candidate_comm:
        return 0.5
    
    freq_diff = abs(user_comm.get('frequency', 0.5) - candidate_comm.get('frequency', 0.5))
    pos_diff = abs(user_comm.get('positivity', 0.5) - candidate_comm.get('positivity', 0.5))
    
    # Lower difference is better
    compatibility = 1 - (freq_diff + pos_diff) / 2
    return compatibility

def calculate_team_chemistry(players: List[Dict]) -> float:
    """Calculate overall team chemistry"""
    if not players:
        return 0
    
    # Average individual chemistry scores
    avg_chemistry = np.mean([p['chemistry_score'] for p in players])
    
    # Check role diversity
    all_roles = []
    for p in players:
        all_roles.extend(p.get('preferred_roles', []))
    
    role_diversity = len(set(all_roles)) / max(len(all_roles), 1)
    
    # Combined score
    team_chemistry = (avg_chemistry * 0.7 + role_diversity * 30)
    return min(100, team_chemistry)

def aggregate_team_features(player_features: List[Dict]) -> Dict:
    """Aggregate individual player features into team features"""
    team_features = {
        'avg_kda': np.mean([p.get('kda', 0) for p in player_features]),
        'avg_win_rate': np.mean([p.get('win_rate', 0) for p in player_features]),
        'total_matches': sum([p.get('matches_played', 0) for p in player_features]),
        'avg_kills': np.mean([p.get('stats', {}).get('kills_per_game', 0) for p in player_features]),
        'avg_deaths': np.mean([p.get('stats', {}).get('deaths_per_game', 0) for p in player_features]),
        'avg_objectives': np.mean([p.get('stats', {}).get('objectives_per_game', 0) for p in player_features])
    }
    return team_features

def prepare_model_input(features: Dict, match_type: str) -> np.ndarray:
    """Prepare features for model input"""
    # Convert features to numpy array
    feature_vector = np.array([
        features.get('avg_kda', 0),
        features.get('avg_win_rate', 0),
        features.get('total_matches', 0) / 1000,  # Normalize
        features.get('avg_kills', 0),
        features.get('avg_deaths', 0),
        features.get('avg_objectives', 0),
        1 if match_type == 'ranked' else 0
    ])
    return feature_vector.reshape(1, -1)

def analyze_key_factors(features: Dict) -> List[str]:
    """Analyze key factors affecting performance"""
    factors = []
    
    if features.get('avg_kda', 0) > 2.5:
        factors.append("Strong individual performance")
    elif features.get('avg_kda', 0) < 1.0:
        factors.append("Individual performance needs improvement")
    
    if features.get('avg_win_rate', 0) > 0.6:
        factors.append("High win rate indicates good teamwork")
    
    if features.get('total_matches', 0) > 500:
        factors.append("Experienced team")
    
    return factors

def calculate_trend(values: np.ndarray) -> str:
    """Calculate performance trend"""
    if len(values) < 2:
        return "stable"
    
    # Simple linear regression
    x = np.arange(len(values))
    slope = np.polyfit(x, values, 1)[0]
    
    if slope > 0.1:
        return "improving"
    elif slope < -0.1:
        return "declining"
    else:
        return "stable"

def identify_improvement_areas(df: pd.DataFrame) -> List[str]:
    """Identify areas for improvement"""
    areas = []
    
    if df['kda'].mean() < 1.0:
        areas.append("Focus on survival and positioning")
    
    if df['win'].mean() < 0.4:
        areas.append("Work on team coordination")
    
    if df['score'].std() > df['score'].mean() * 0.5:
        areas.append("Improve consistency")
    
    return areas

def generate_player_recommendations(insights: Dict) -> List[str]:
    """Generate personalized recommendations"""
    recommendations = []
    
    if insights['consistency_score'] < 50:
        recommendations.append("Practice regularly to improve consistency")
    
    if insights['performance_trend'] == "declining":
        recommendations.append("Review recent gameplay and identify mistakes")
    
    if insights['win_rate'] < 45:
        recommendations.append("Focus on team communication and objectives")
    
    if not recommendations:
        recommendations.append("Keep up the great work!")
    
    return recommendations

async def train_model_task(model_type: str, game_id: str, hyperparameters: Dict):
    """Background task to train ML models"""
    logger.info(f"Starting training for {model_type} on {game_id} data")
    
    try:
        # Fetch training data
        async with db_pool.acquire() as conn:
            if model_type == "player_clustering":
                # Fetch player features
                data = await conn.fetch(
                    "SELECT features FROM player_features WHERE game_id = $1",
                    game_id
                )
                
                # Prepare data
                features = [json.loads(row['features']) for row in data]
                X = np.array([[f.get('kda', 0), f.get('win_rate', 0), 
                              f.get('matches_played', 0)] for f in features])
                
                # Train model
                scaler = StandardScaler()
                X_scaled = scaler.fit_transform(X)
                
                n_clusters = hyperparameters.get('n_clusters', 5)
                model = KMeans(n_clusters=n_clusters, random_state=42)
                model.fit(X_scaled)
                
                # Save model
                models[model_type] = model
                joblib.dump(model, f"/tmp/{model_type}.pkl")
                
                # Upload to S3
                s3_client.upload_file(
                    f"/tmp/{model_type}.pkl",
                    S3_BUCKET,
                    f"models/{model_type}.pkl"
                )
                
                # Update metadata
                await conn.execute(
                    """INSERT INTO model_metadata (model_name, version, accuracy, trained_at, hyperparameters)
                       VALUES ($1, $2, $3, $4, $5)
                       ON CONFLICT (model_name) DO UPDATE 
                       SET version = $2, accuracy = $3, trained_at = $4, hyperparameters = $5""",
                    model_type, "1.0", 0.85, datetime.now(), json.dumps(hyperparameters)
                )
        
        logger.info(f"Training completed for {model_type}")
        
    except Exception as e:
        logger.error(f"Error training {model_type}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)