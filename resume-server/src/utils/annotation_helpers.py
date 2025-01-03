import logging
from datetime import datetime
from src.utils.session_management import get_db_client, get_db_name, get_manual_annotation_table

async def add_job_to_manual_annotation_table(job_content: str):
    """
    Add a job to the manual annotation table

    Args:
        job_content (str): The job description content to be added

    Returns:
        Inserted ID or None
    """
    try:
        db = get_db_client()
        manual_annotation_table = db[get_db_name()][get_manual_annotation_table()]

        job = {
            "content": job_content,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        result = await manual_annotation_table.insert_one(job)
        return result.inserted_id
    except Exception as e:
        logging.error(f"Error adding job to manual annotation table: {e}")
        return None 