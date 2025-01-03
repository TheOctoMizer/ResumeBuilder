from fastapi import APIRouter
from fastapi import Query
from typing import Optional, Dict
import logging
from src.utils.session_management import get_job_tracking_table, get_db_client, get_db_name
from src.utils.convert_mongo_document import convert_mongo_document
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase, AsyncIOMotorClient
from pymongo.errors import ConnectionFailure

router = APIRouter()

@router.get("/jobs")
async def get_all_jobs(
    page: int = Query(1, ge=1, description="Page number"),
    search: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(12, ge=1, le=100, description="Number of items per page"),
) -> Dict:
    """
    Fetch all jobs with optional pagination and search.

    Args:
        page (int): Page number, defaults to 1.
        search (str): Search query, defaults to None (no search filter applied).
        limit (int): Number of items per page, defaults to 12.

    Returns:
        dict: Paginated list of jobs matching the query.
    """
    try:
        # Get database and collection names
        db_client = get_db_client()
        if not isinstance(db_client, AsyncIOMotorClient):
            raise TypeError(f"Expected AsyncIOMotorClient, got {type(db_client)}")
        
        db_name = get_db_name()
        if not isinstance(db_name, str):
            raise TypeError(f"Expected a string for db name, got {type(db_name)}")
        
        db = db_client[db_name]
        if not isinstance(db, AsyncIOMotorDatabase):
            raise TypeError(f"Expected AsyncIOMotorDatabase, got {type(db)}")

        job_tracking_table_name = get_job_tracking_table()
        if not isinstance(job_tracking_table_name, str):
            raise ValueError(f"Expected a string for collection name, got {type(job_tracking_table_name)}")

        # Access the collection
        job_tracking_table = db[job_tracking_table_name]
        if not isinstance(job_tracking_table, AsyncIOMotorCollection):
            raise ValueError(f"Expected AsyncIOMotorCollection, got {type(job_tracking_table)}")

        # Build query and pagination
        query = {}
        if search:
            query["$text"] = {"$search": search}

        skip = (page - 1) * limit

        # Execute the query
        cursor = job_tracking_table.find(query).skip(skip).limit(limit)
        jobs = await cursor.to_list(length=limit)
        jobs = [await convert_mongo_document(job) for job in jobs]

        # Get total count
        total_jobs = await job_tracking_table.count_documents(query)

        response = {
            "jobs": jobs,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_jobs,
                "total_pages": (total_jobs + limit - 1) // limit,
            },
        }
        return response

    except ConnectionFailure as e:
        logging.error(f"Database connection error: {e}")
        return {"error": "Failed to connect to the database."}
    except Exception as e:
        logging.error(f"Error fetching all jobs: {e}")
        return {"error": f"Error fetching all jobs: {str(e)}"}
