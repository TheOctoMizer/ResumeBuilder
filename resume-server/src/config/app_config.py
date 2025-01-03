from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017/"
    DB_NAME: str = "jobsDB"
    JOB_TRACKING_TABLE: str = "job_tracking"
    MANUAL_ANNOTATION_TABLE: str = "manual_annotation"
    EXTRACTED_ENTITIES_TABLE: str = "extracted_entities"
    REDIS_URL: str = "redis://localhost:6379"
    OPENAI_BASE_URL: str = "http://localhost:1234/v1"
    OPENAI_API_KEY: str = "lm-studio"
    port: Optional[int] = 8000

    class Config:
        env_file = ".env"

settings = Settings() 