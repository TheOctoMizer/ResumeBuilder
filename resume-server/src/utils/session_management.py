# src/utils/session_management.py

from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient

session_data = {}


def initialize_session_data(mongo_client: AsyncIOMotorClient, db: str, job_tracking_table: str, manual_annotation_table: str, extracted_entities_table: str):
    session_data["mongo_client"] = mongo_client
    session_data["db"] = db
    session_data["job_tracking_table"] = job_tracking_table
    session_data["manual_annotation_table"] = manual_annotation_table
    session_data["extracted_entities_table"] = extracted_entities_table

def get_session_data() -> dict:
    return session_data

def get_db_client() -> AsyncIOMotorClient:
    return session_data["mongo_client"]

def get_job_tracking_table() -> str:
    return session_data["job_tracking_table"]

def get_manual_annotation_table() -> str:
    return session_data["manual_annotation_table"]

def get_extracted_entities_table() -> str:
    return session_data["extracted_entities_table"]

def get_db_name() -> str:
    return session_data["db"]

def get_db_collection_names() -> list:
    return [session_data["job_tracking_table"], session_data["manual_annotation_table"], session_data["extracted_entities_table"]]

