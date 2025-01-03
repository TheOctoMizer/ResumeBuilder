from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from fastapi_throttling import ThrottlingMiddleware
from .app_config import settings
from src.utils.initialize import initialize_db
from src.utils.session_management import get_db_client, initialize_session_data
from src.utils.openai_client import get_openai_client
import logging

def configure_app(app: FastAPI):
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Configure rate limiting
    app.add_middleware(
        ThrottlingMiddleware
    )

async def startup_handler():
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the server")
    
    # Initialize session data
    initialize_session_data(
        mongo_uri=settings.MONGODB_URI,
        db=settings.DB_NAME,
        job_tracking_table=settings.JOB_TRACKING_TABLE,
        manual_annotation_table=settings.MANUAL_ANNOTATION_TABLE,
        extracted_entities_table=settings.EXTRACTED_ENTITIES_TABLE
    )
    
    # Initialize OpenAI client
    _ = get_openai_client(
        base_url=settings.OPENAI_BASE_URL,
        api_key=settings.OPENAI_API_KEY
    )
    
    # Initialize Redis cache
    redis = aioredis.from_url(settings.REDIS_URL)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    
    # Initialize database
    await initialize_db()

async def shutdown_handler():
    mongo_client = get_db_client()
    mongo_client.close() 