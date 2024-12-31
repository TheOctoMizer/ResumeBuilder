from pydantic import BaseModel, Field
from enum import Enum

class AllJobsRequest(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number")
    search: str = Field(default="", description="Search query")
    limit: int = Field(default=10, ge=1, le=100, description="Number of items per page")


