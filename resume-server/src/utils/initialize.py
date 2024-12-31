from .session_management import get_session_data, get_db_client, get_db_name, get_job_tracking_table, get_extracted_entities_table, get_manual_annotation_table
import logging
from logging import getLogger

async def initialize_db():
    session = get_session_data()
    try:
        db = get_db_client()[get_db_name()]
        job_tracking_table = db[get_job_tracking_table()]
        manual_annotation_table = db[get_manual_annotation_table()]
        extracted_entities_table = db[get_extracted_entities_table()]
        # check if the indexes are already created
        indexes = await job_tracking_table.index_information()
        if "job_search_index" not in indexes:
            logging.info("Creating indexes for job_tracking table")
            await job_tracking_table.create_index(
                [
                    ("Company", "text"),
                    ("JobTitle", "text"),
                    ("Location", "text"),
                    ("TechnicalSkills", "text"),
                    ("Experience", "text"),
                ],
                name="job_search_index",
                default_language="english",
            )
            logging.info("Databases and collections initialized successfully.")
        else:
            logging.info("Databases and collections initialized successfully.")
    except Exception as e:
        logging.error(f"Error initializing database: {e}")