from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import httpx
import asyncio
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import boto3
from botocore.exceptions import ClientError
import asyncpg
import redis.asyncio as redis
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Game Integration Service",
    description="Service for integrating with various game APIs",
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
RIOT_API_KEY = os.getenv("RIOT_API_KEY", "")
PUBG_API_KEY = os.getenv("PUBG_API_KEY", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_NAME = os.getenv("DB_NAME", "esports_nexus_games")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Database connection pool
db_pool = None
redis_client = None

# AWS clients
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
sqs = boto3.client('sqs', region_name=AWS_REGION)
s3 = boto3.client('s3', region_name=AWS_REGION)

# Pydantic models
class GameStats(BaseModel):
    game_id: str
    player_id: str
    player_name: str
    stats: Dict[str, Any]
    last_updated: datetime

class PlayerProfile(BaseModel):
    player_id: str
    game_id: str
    in_game_name: str
    rank: Optional[str]
    level: Optional[int]
    stats: Dict[str, Any]
    match_history: List[Dict[str, Any]]

class MatchData(BaseModel):
    match_id: str
    game_id: str
    players: List[str]
    start_time: datetime
    end_time: Optional[datetime]
    match_data: Dict[str, Any]

class GameIntegrationRequest(BaseModel):
    game_id: str
    player_name: str
    region: Optional[str] = None

# Startup and shutdown events
@app.on_event("startup")
async def startup():
    global db_pool, redis_client
    
    # Initialize database connection pool
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
        
        # Create tables if they don't exist
        await create_tables()
    except Exception as e:
        logger.error(f"Failed to create database pool: {e}")
    
    # Initialize Redis client
    try:
        redis_client = await redis.from_url(REDIS_URL, decode_responses=True)
        await redis_client.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")

@app.on_event("shutdown")
async def shutdown():
    if db_pool:
        await db_pool.close()
    if redis_client:
        await redis_client.close()

async def create_tables():
    """Create necessary tables in PostgreSQL"""
    async with db_pool.acquire() as conn:
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS player_profiles (
                id SERIAL PRIMARY KEY,
                player_id VARCHAR(255) NOT NULL,
                game_id VARCHAR(50) NOT NULL,
                in_game_name VARCHAR(255) NOT NULL,
                rank VARCHAR(50),
                level INTEGER,
                stats JSONB,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(player_id, game_id)
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS match_history (
                id SERIAL PRIMARY KEY,
                match_id VARCHAR(255) NOT NULL UNIQUE,
                game_id VARCHAR(50) NOT NULL,
                player_id VARCHAR(255) NOT NULL,
                match_data JSONB,
                match_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "game-integration-service",
        "version": "1.0.0"
    }

# Game endpoints
@app.get("/api/v1/games")
async def get_supported_games():
    """Get list of supported games"""
    games = [
        {
            "id": "valorant",
            "name": "Valorant",
            "publisher": "Riot Games",
            "api_available": True,
            "regions": ["na", "eu", "ap", "kr", "br", "latam"]
        },
        {
            "id": "bgmi",
            "name": "Battlegrounds Mobile India",
            "publisher": "Krafton",
            "api_available": True,
            "regions": ["india"]
        },
        {
            "id": "codm",
            "name": "Call of Duty Mobile",
            "publisher": "Activision",
            "api_available": False,
            "regions": ["global"]
        },
        {
            "id": "freefire",
            "name": "Free Fire",
            "publisher": "Garena",
            "api_available": False,
            "regions": ["sea", "latam", "mena"]
        }
    ]
    return games

# Valorant integration
@app.get("/api/v1/games/valorant/stats/{player_name}")
async def get_valorant_stats(player_name: str, region: str = "na"):
    """Get Valorant player stats"""
    if not RIOT_API_KEY:
        raise HTTPException(status_code=503, detail="Riot API key not configured")
    
    # Check cache first
    cache_key = f"valorant:stats:{region}:{player_name}"
    cached_data = await redis_client.get(cache_key) if redis_client else None
    
    if cached_data:
        return json.loads(cached_data)
    
    try:
        # Riot API endpoints
        account_url = f"https://{region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{player_name}"
        
        async with httpx.AsyncClient() as client:
            headers = {"X-Riot-Token": RIOT_API_KEY}
            
            # Get account info
            account_resp = await client.get(account_url, headers=headers)
            if account_resp.status_code != 200:
                raise HTTPException(status_code=404, detail="Player not found")
            
            account_data = account_resp.json()
            puuid = account_data["puuid"]
            
            # Get match history
            matches_url = f"https://{region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/{puuid}"
            matches_resp = await client.get(matches_url, headers=headers)
            
            stats = {
                "player_id": puuid,
                "player_name": player_name,
                "region": region,
                "account_level": account_data.get("summonerLevel", 0),
                "matches": matches_resp.json() if matches_resp.status_code == 200 else [],
                "last_updated": datetime.now().isoformat()
            }
            
            # Cache the result
            if redis_client:
                await redis_client.setex(cache_key, 3600, json.dumps(stats))
            
            # Store in database
            await store_player_profile("valorant", puuid, player_name, stats)
            
            return stats
            
    except httpx.RequestError as e:
        logger.error(f"Error fetching Valorant stats: {e}")
        raise HTTPException(status_code=503, detail="Failed to fetch player stats")

# BGMI/PUBG integration
@app.get("/api/v1/games/bgmi/stats/{player_name}")
async def get_bgmi_stats(player_name: str):
    """Get BGMI player stats"""
    if not PUBG_API_KEY:
        raise HTTPException(status_code=503, detail="PUBG API key not configured")
    
    # Check cache
    cache_key = f"bgmi:stats:{player_name}"
    cached_data = await redis_client.get(cache_key) if redis_client else None
    
    if cached_data:
        return json.loads(cached_data)
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {PUBG_API_KEY}",
                "Accept": "application/vnd.api+json"
            }
            
            # Search for player
            search_url = "https://api.pubg.com/shards/pc-sa/players"
            params = {"filter[playerNames]": player_name}
            
            search_resp = await client.get(search_url, headers=headers, params=params)
            if search_resp.status_code != 200:
                raise HTTPException(status_code=404, detail="Player not found")
            
            player_data = search_resp.json()
            if not player_data["data"]:
                raise HTTPException(status_code=404, detail="Player not found")
            
            player = player_data["data"][0]
            player_id = player["id"]
            
            # Get player stats
            stats_url = f"https://api.pubg.com/shards/pc-sa/players/{player_id}/seasons/lifetime"
            stats_resp = await client.get(stats_url, headers=headers)
            
            stats = {
                "player_id": player_id,
                "player_name": player_name,
                "stats": stats_resp.json() if stats_resp.status_code == 200 else {},
                "last_updated": datetime.now().isoformat()
            }
            
            # Cache the result
            if redis_client:
                await redis_client.setex(cache_key, 3600, json.dumps(stats))
            
            # Store in database
            await store_player_profile("bgmi", player_id, player_name, stats)
            
            return stats
            
    except httpx.RequestError as e:
        logger.error(f"Error fetching BGMI stats: {e}")
        raise HTTPException(status_code=503, detail="Failed to fetch player stats")

# Generic stats endpoint
@app.post("/api/v1/games/stats")
async def get_game_stats(request: GameIntegrationRequest):
    """Get stats for any supported game"""
    if request.game_id == "valorant":
        return await get_valorant_stats(request.player_name, request.region or "na")
    elif request.game_id == "bgmi":
        return await get_bgmi_stats(request.player_name)
    else:
        raise HTTPException(status_code=400, detail=f"Game {request.game_id} not supported")

# Data ingestion endpoint
@app.post("/api/v1/games/ingest/{game_id}")
async def ingest_game_data(game_id: str, background_tasks: BackgroundTasks):
    """Trigger data ingestion for a specific game"""
    if game_id not in ["valorant", "bgmi"]:
        raise HTTPException(status_code=400, detail="Unsupported game")
    
    # Add to background tasks
    background_tasks.add_task(ingest_game_data_task, game_id)
    
    return {"message": f"Data ingestion started for {game_id}"}

async def ingest_game_data_task(game_id: str):
    """Background task to ingest game data"""
    logger.info(f"Starting data ingestion for {game_id}")
    
    # Get list of players to update from database
    async with db_pool.acquire() as conn:
        players = await conn.fetch(
            "SELECT DISTINCT player_id, in_game_name FROM player_profiles WHERE game_id = $1",
            game_id
        )
    
    for player in players:
        try:
            if game_id == "valorant":
                await get_valorant_stats(player["in_game_name"])
            elif game_id == "bgmi":
                await get_bgmi_stats(player["in_game_name"])
        except Exception as e:
            logger.error(f"Error updating stats for {player['in_game_name']}: {e}")
    
    logger.info(f"Data ingestion completed for {game_id}")

# Match data endpoints
@app.post("/api/v1/games/matches")
async def store_match_data(match: MatchData):
    """Store match data in DynamoDB"""
    try:
        table = dynamodb.Table('match_stats')
        
        item = {
            'match_id': match.match_id,
            'game_id': match.game_id,
            'timestamp': int(match.start_time.timestamp()),
            'players': match.players,
            'match_data': match.match_data,
            'end_time': int(match.end_time.timestamp()) if match.end_time else None
        }
        
        table.put_item(Item=item)
        
        # Also store in PostgreSQL for relational queries
        async with db_pool.acquire() as conn:
            for player_id in match.players:
                await conn.execute(
                    """INSERT INTO match_history (match_id, game_id, player_id, match_data, match_date)
                       VALUES ($1, $2, $3, $4, $5)
                       ON CONFLICT (match_id) DO NOTHING""",
                    match.match_id, match.game_id, player_id, 
                    json.dumps(match.match_data), match.start_time
                )
        
        return {"message": "Match data stored successfully"}
        
    except ClientError as e:
        logger.error(f"Error storing match data: {e}")
        raise HTTPException(status_code=500, detail="Failed to store match data")

@app.get("/api/v1/games/matches/{match_id}")
async def get_match_data(match_id: str):
    """Retrieve match data"""
    try:
        table = dynamodb.Table('match_stats')
        response = table.get_item(Key={'match_id': match_id})
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Match not found")
        
        return response['Item']
        
    except ClientError as e:
        logger.error(f"Error retrieving match data: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve match data")

# Helper functions
async def store_player_profile(game_id: str, player_id: str, player_name: str, stats: dict):
    """Store player profile in database"""
    async with db_pool.acquire() as conn:
        await conn.execute(
            """INSERT INTO player_profiles (player_id, game_id, in_game_name, stats, last_updated)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (player_id, game_id) 
               DO UPDATE SET stats = $4, last_updated = $5""",
            player_id, game_id, player_name, json.dumps(stats), datetime.now()
        )

# OAuth endpoints for Riot Games
@app.get("/api/v1/games/valorant/auth")
async def valorant_auth_url():
    """Get Valorant OAuth URL"""
    client_id = os.getenv("RIOT_CLIENT_ID", "")
    redirect_uri = os.getenv("RIOT_REDIRECT_URI", "http://localhost:3000/callback")
    
    if not client_id:
        raise HTTPException(status_code=503, detail="Riot OAuth not configured")
    
    auth_url = f"https://auth.riotgames.com/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope=openid"
    return {"auth_url": auth_url}

@app.post("/api/v1/games/valorant/callback")
async def valorant_callback(code: str):
    """Handle Valorant OAuth callback"""
    # Implementation for OAuth callback
    # Exchange code for token and link account
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)