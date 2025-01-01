# src/routes/get_time_to_respond.py

from fastapi import APIRouter
from src.utils.session_management import get_job_tracking_table, get_db_client, get_session_data, get_db_name
import logging

router = APIRouter()

@router.get("/timeToRespond")
async def get_time_to_response():
    try:
        session = get_session_data()
        db = get_db_client()
        job_tracking_table = db[get_db_name()][get_job_tracking_table()]
        pipeline = [
            {
                "$match": {
                    "IsShortlisted": True,
                    "AppliedDate": {"$ne": None},
                    "ShortlistedDate": {"$ne": None}
                }
            },
            {
                "$project": {
                    "time_to_shortlist": {
                        "$subtract": ["$ShortlistedDate", "$AppliedDate"]
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "average_time_to_shortlist": {"$avg": "$time_to_shortlist"}
                }
            }
        ]
        result = await job_tracking_table.aggregate(pipeline).to_list(length=1)
        average_time = result[0]["average_time_to_shortlist"] if result else 0
        return {"average_time_to_shortlist_days": average_time / 1000 / 60 / 60 / 24}
    except Exception as e:
        logging.error(f"Error fetching time to response: {e}")
        return {"error": "Error fetching time to response"}