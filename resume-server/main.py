from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from src.config.startup import configure_app, startup_handler, shutdown_handler
from src.routes import job_operations, job_stats, get_available_models, get_all_jobs, get_time_to_respond
from src.utils.session_management import initialize_session_data
from src.utils.session_management import get_db_client, get_db_name, get_job_tracking_table
from fastapi.responses import FileResponse, HTMLResponse
from fastapi_cache.decorator import cache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import logging
from pymongo import UpdateOne

app = FastAPI()

# Configure the application
configure_app(app)

# Mount static files
app.mount("/static", StaticFiles(directory="client/build", html=True), name="client")
@app.get("/", response_class=HTMLResponse)
async def home() -> FileResponse:
    return FileResponse("client/build/index.html")

# Event handlers
app.add_event_handler("startup", startup_handler)
app.add_event_handler("shutdown", shutdown_handler)

# Add extracted entities to extracted entities table
async def add_extracted_entities_to_table(job_id: str, extracted_entities: dict):
    """
    Add extracted entities to the extracted entities table

    Args:
        job_id (str): The job ID to link the extracted entities
        extracted_entities (dict): The extracted entities from the job description

    Returns:
        Inserted ID or None
    """
    try:
        db = get_db_client()
        extracted_entities_table = db[get_db_name()][get_extracted_entities_table()]
        extracted_entities["job_id"] = job_id
        extracted_entities["added_at"] = datetime.utcnow()
        result = await extracted_entities_table.insert_one(extracted_entities)
        return result.inserted_id
    except Exception as e:
        logging.error(f"Error adding extracted entities to table: {e}")
        return None


app.include_router(router=get_available_models.router, prefix='/api')
app.include_router(router=get_all_jobs.router, prefix='/api')
app.include_router(router=get_time_to_respond.router, prefix='/api')
app.include_router(router=job_stats.router, prefix='/api')
app.include_router(router=job_operations.router, prefix='/api')