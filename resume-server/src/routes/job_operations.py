from fastapi import APIRouter, BackgroundTasks
from src.models.job_models import AddJobRequest, JobDataEntities
from src.utils.error_handling import handle_exceptions
from src.utils.session_management import get_db_client, get_db_name, get_job_tracking_table
from src.utils.extract_job_details import extract_url_find_id
from src.utils.google_search import search_google
from src.utils.openai_client import get_openai_client
from src.utils.openai_helpers import process_job_and_extract_details, get_google_search_queries
from src.utils.annotation_helpers import add_job_to_manual_annotation_table
import logging
from typing import List
from pymongo import UpdateOne

router = APIRouter()

@router.post("/addJob")
@handle_exceptions
async def add_job(job: AddJobRequest, background_tasks: BackgroundTasks):
    try:
        # Critical operations
        job_url, job_post_id, job_find = await extract_url_find_id(job)
        job_id = await add_job_to_manual_annotation_table(job.content)
        if not job_id:
            return {"error": "Error adding job to manual annotation table"}

        job_details = await process_job_and_extract_details(
            job_content=job.content, 
            job_url=job_url, 
            job_find=job_find, 
            job_id=job_post_id
        )
        
        if not job_details:
            return {"error": "Error extracting job details"}

        # Add to tracking table
        db = get_db_client()
        job_tracking_table = db[get_db_name()][get_job_tracking_table()]
        job_tracking_entry = job_details.dict(by_alias=True)
        job_tracking_entry.update({
            "job_id": str(job_id),
            "ResumeGenerated": False,
            "ResumePath": "",
            "statuses": [],
        })

        tracking_result = await job_tracking_table.insert_one(job_tracking_entry)
        if not tracking_result.inserted_id:
            return {"error": "Error adding job to tracking table"}

        # Move search queries to background task
        background_tasks.add_task(process_search_queries, job.content, job_id)
        
        return {"message": "Job added successfully", "job_id": str(tracking_result.inserted_id)}
    except Exception as e:
        logging.error(f"Error adding job: {e}")
        return {"error": "Error adding job"}

async def process_search_queries(content: str, job_id: str):
    try:
        search_queries, lang = await get_google_search_queries(content)
        if search_queries:
            search_results = await search_google(search_queries, lang)
            # Store results in database
            db = get_db_client()
            job_tracking_table = db[get_db_name()][get_job_tracking_table()]
            await job_tracking_table.update_one(
                {"job_id": job_id},
                {"$set": {"search_results": search_results}}
            )
    except Exception as e:
        logging.error(f"Error processing search queries: {e}")

@router.post("/bulkUpdate")
@handle_exceptions
async def bulk_update_job_statuses(jobs_data: List[dict]):
    try:
        db = get_db_client()
        job_tracking_table = db[get_db_name()][get_job_tracking_table()]
        
        operations = [
            UpdateOne(
                {"_id": job["id"]},
                {"$set": job["updates"]}
            ) for job in jobs_data
        ]
        
        result = await job_tracking_table.bulk_write(operations)
        return result
    except Exception as e:
        logging.error(f"Error in bulk update: {e}")
        return None 