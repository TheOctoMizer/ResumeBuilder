from fastapi import APIRouter
from fastapi_cache.decorator import cache
from src.utils.session_management import get_db_client, get_db_name, get_job_tracking_table
from src.utils.error_handling import handle_exceptions
import logging

router = APIRouter()

@router.get("/applicationStages")
@handle_exceptions
async def get_application_stages():
    try:
        db = get_db_client()
        job_tracking_table = db[get_db_name()][get_job_tracking_table()]
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "Applied": {"$sum": {"$cond": ["$IsApplied", 1, 0]}},
                    "Shortlisted": {"$sum": {"$cond": ["$IsShortlisted", 1, 0]}},
                    "Interviewed": {"$sum": {"$cond": ["$IsInterviewed", 1, 0]}},
                    "Offered": {"$sum": {"$cond": ["$IsOffered", 1, 0]}},
                    "Accepted": {"$sum": {"$cond": ["$IsAccepted", 1, 0]}},
                    "Rejected": {"$sum": {"$cond": ["$IsRejected", 1, 0]}}
                }
            }
        ]
        result = await job_tracking_table.aggregate(pipeline).to_list(length=1)
        return result[0] if result else {}
    except Exception as e:
        logging.error(f"Error fetching application stages: {e}")
        return {"error": "Error fetching application stages"}

@router.get("/stats")
@cache(expire=300)
@handle_exceptions
async def get_job_stats():
    try:
        db = get_db_client()
        job_tracking_table = db[get_db_name()][get_job_tracking_table()]

        # Application Stage Distribution
        application_stage_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "Applied": {"$sum": {"$cond": ["$IsApplied", 1, 0]}},
                    "Shortlisted": {"$sum": {"$cond": ["$IsShortlisted", 1, 0]}},
                    "Interviewed": {"$sum": {"$cond": ["$IsInterviewed", 1, 0]}},
                    "Offered": {"$sum": {"$cond": ["$IsOffered", 1, 0]}},
                    "Accepted": {"$sum": {"$cond": ["$IsAccepted", 1, 0]}},
                    "Rejected": {"$sum": {"$cond": ["$IsRejected", 1, 0]}}
                }
            }
        ]
        application_stage_result = await job_tracking_table.aggregate(application_stage_pipeline).to_list(length=1)
        application_stage = application_stage_result[0] if application_stage_result else {}
        
        # Salary Distribution
        salary_distribution_pipeline = [
            {
                "$match": {
                    "Salary": {"$ne": "Not Specified"}
                }
            },
            {
                "$group": {
                    "_id": "$Salary",
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id": 1}
            }
        ]
        salary_distribution = await job_tracking_table.aggregate(salary_distribution_pipeline).to_list(length=None)
        
        # Location Distribution
        location_distribution_pipeline = [
            {
                "$group": {
                    "_id": "$Country",  # You can change this to "State" or "City" if preferred
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"count": -1}
            }
        ]
        location_distribution = await job_tracking_table.aggregate(location_distribution_pipeline).to_list(length=None)
        
        # Top Skills
        top_skills_pipeline = [
            {"$unwind": "$TechnicalSkills"},
            {
                "$group": {
                    "_id": "$TechnicalSkills",
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"count": -1}
            },
            {
                "$limit": 10  # Top 10 skills
            }
        ]
        top_skills = await job_tracking_table.aggregate(top_skills_pipeline).to_list(length=None)
        
        # Job Source Effectiveness
        job_source_pipeline = [
            {
                "$group": {
                    "_id": "$JobFind",
                    "total_applications": {"$sum": 1},
                    "shortlisted": {"$sum": {"$cond": ["$IsShortlisted", 1, 0]}},
                    "interviewed": {"$sum": {"$cond": ["$IsInterviewed", 1, 0]}},
                    "offered": {"$sum": {"$cond": ["$IsOffered", 1, 0]}},
                    "accepted": {"$sum": {"$cond": ["$IsAccepted", 1, 0]}},
                    "rejected": {"$sum": {"$cond": ["$IsRejected", 1, 0]}}
                }
            },
            {
                "$sort": {"total_applications": -1}
            }
        ]
        job_source_effectiveness = await job_tracking_table.aggregate(job_source_pipeline).to_list(length=None)
        
        # Compile all stats
        stats = {
            "applicationStageDistribution": application_stage,
            "salaryDistribution": salary_distribution,
            "locationDistribution": location_distribution,
            "topSkills": top_skills,
            "jobSourceEffectiveness": job_source_effectiveness
        }
        
        return stats
    except Exception as e:
        logging.error(f"Error fetching job statistics: {e}")
        return {"error": "Error fetching job statistics"}

@router.get("/jobSourceEffectiveness")
@handle_exceptions
async def get_job_source_effectiveness():
    try:
        db = get_db_client()
        job_tracking_table = db[get_db_name()][get_job_tracking_table()]
        pipeline = [
            {
                "$group": {
                    "_id": "$JobFind",
                    "total_applications": {"$sum": 1},
                    "shortlisted": {"$sum": {"$cond": ["$IsShortlisted", 1, 0]}},
                    "interviewed": {"$sum": {"$cond": ["$IsInterviewed", 1, 0]}},
                    "offered": {"$sum": {"$cond": ["$IsOffered", 1, 0]}},
                    "accepted": {"$sum": {"$cond": ["$IsAccepted", 1, 0]}},
                    "rejected": {"$sum": {"$cond": ["$IsRejected", 1, 0]}}
                }
            }
        ]
        results = await job_tracking_table.aggregate(pipeline).to_list(length=None)
        return results
    except Exception as e:
        logging.error(f"Error fetching job source effectiveness: {e}")
        return {"error": "Error fetching job source effectiveness"}


@router.get("/responseRates")
@handle_exceptions
async def get_response_rates():
    try:
        db = get_db_client()
        job_tracking_table = db[get_db_name()][get_job_tracking_table()]
        total_applied = await job_tracking_table.count_documents({"IsApplied": True})
        total_shortlisted = await job_tracking_table.count_documents({"IsShortlisted": True})
        total_interviewed = await job_tracking_table.count_documents({"IsInterviewed": True})
        total_offered = await job_tracking_table.count_documents({"IsOffered": True})
        total_accepted = await job_tracking_table.count_documents({"IsAccepted": True})
        total_rejected = await job_tracking_table.count_documents({"IsRejected": True})

        return {
            "Applied": total_applied,
            "Shortlisted": total_shortlisted,
            "Interviewed": total_interviewed,
            "Offered": total_offered,
            "Accepted": total_accepted,
            "Rejected": total_rejected,
            "ResponseRates": {
                "ShortlistedRate": total_shortlisted / total_applied * 100 if total_applied else 0,
                "InterviewedRate": total_interviewed / total_applied * 100 if total_applied else 0,
                "OfferedRate": total_offered / total_applied * 100 if total_applied else 0,
                "AcceptedRate": total_accepted / total_applied * 100 if total_applied else 0,
                "RejectedRate": total_rejected / total_applied * 100 if total_applied else 0,
            }
        }
    except Exception as e:
        logging.error(f"Error fetching response rates: {e}")
        return {"error": "Error fetching response rates"}

