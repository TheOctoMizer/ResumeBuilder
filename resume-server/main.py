from enum import Enum
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
import logging
from pydantic import BaseModel, Field
from pymongo import MongoClient
from openai import OpenAI
from datetime import datetime
from typing import Optional, List


app = FastAPI()

# Enable CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the React app
app.mount("/static", StaticFiles(directory="client/build", html=True), name="client")

async def startup():
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the server")



async def shutdown():
    logging.info("Shutting down the server")

# Connect to MongoDB
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["jobsDB"]
collection = db["jobs"]


# Initialize OpenAI API
openai_client = OpenAI(
    base_url="http://localhost:1234/v1",
    api_key="lm-studio"
)


# Serve the React app
@app.get("/")
async def read_root() -> HTMLResponse:
    return FileResponse("client/build/index.html")

class AllJobsRequest(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number")
    search: str = Field(default="", description="Search query")
    limit: int = Field(default=10, ge=1, le=100, description="Number of items per page")

# API to fetch all jobs using POST
@app.post("/api/allJobs")
async def get_all_jobs(request: AllJobsRequest) -> dict:
    try:
        # Access the data from the request body
        jobs = [
            {"title": "Software Engineer", "company": "Google"},
            {"title": "Product Manager", "company": "Facebook"},
        ]
        return {"jobs": jobs}
    except Exception as e:
        logging.error(f"Error fetching jobs: {e}")
        return {"error": "Error fetching jobs"}

class WorkArrangementType(str, Enum):
    FullTime = "Full-time"
    PartTime = "Part-time"
    Internship = "Internship"
    Contract = "Contract"
    NotSpecified = "Not Specified"

class WorkLocationType(str, Enum):
    Onsite = "Onsite"
    Remote = "Remote"
    Hybrid = "Hybrid"
    NotSpecified = "Not Specified"

class SalaryType(str, Enum):
    Min = "Min"
    Max = "Max"

class JobStatusType(str, Enum):
    Applied = "Applied"
    Rejected = "Rejected"
    Shortlisted = "Shortlisted"
    Interviewed = "Interviewed"
    Offered = "Offered"
    Accepted = "Accepted"
    Declined = "Declined"
    Joined = "Joined"

class StatusEntryType(BaseModel):
    status: JobStatusType = Field(..., description="Current status of the job application")
    date: datetime = Field(default_factory=datetime.now, description="Date and time when the status was updated")


class JobDataEntities(BaseModel):
    JobURL: str = Field(..., description="URL of the job posting")
    JobFind: str = Field(..., description="Job finding platform")
    JobID: str = Field(..., description="Job ID")
    Company: str = Field(..., description="Company name")
    JobTitle: str = Field(..., description="Job title")
    Salary: SalaryType = Field(..., description="Salary type")
    Location: str = Field(..., description="Location")
    Experience: list = Field(..., description="Experience required")
    Skills: list = Field(..., description="Skills required")
    Description: str = Field(..., description="Job description")
    WorkArrangement: WorkArrangementType = Field(..., description="Work arrangement")
    WorkLocation: WorkLocationType = Field(..., description="Work location")
    ResumeGenerated: bool = Field(..., description="Resume generated")
    ResumePath: str = Field(..., description="Path to the generated resume")
    ProcessedDate: datetime = Field(default_factory=datetime.now, description="Date and time of processing")
    # Applied: bool = Field(..., description="Job applied")
    # AppliedDate: datetime = Field(default_factory=datetime.now, description="Date and time of application")
    # Rejected: bool = Field(..., description="Job rejected")
    # RejectedDate: datetime = Field(default_factory=datetime.now, description="Date and time of rejection")
    # Shortlisted: bool = Field(..., description="Job shortlisted")
    # ShortlistedDate: datetime = Field(default_factory=datetime.now, description="Date and time of shortlisting")
    # Interviewed: bool = Field(..., description="Job interviewed")
    # InterviewedDate: datetime = Field(default_factory=datetime.now, description="Date and time of interview")
    # Offered: bool = Field(..., description="Job offered")
    # OfferedDate: datetime = Field(default_factory=datetime.now, description="Date and time of offer")
    # OfferedSalary: str = Field(..., description="Offered salary")
    # Accepted: bool = Field(..., description="Job accepted")
    # AcceptedDate: datetime = Field(default_factory=datetime.now, description="Date and time of acceptance")
    # Declined: bool = Field(..., description="Job declined")
    # DeclinedDate: datetime = Field(default_factory=datetime.now, description="Date and time of decline")
    # Joined: bool = Field(..., description="Job joined")
    # JoinedDate: datetime = Field(default_factory=datetime.now, description="Date and time of joining")
    statuses: List[StatusEntryType] = Field(default_factory=list, description="List of status updates for the job application")
    OfferedSalary: Optional[str] = Field(None, description="Offered salary")


# Add job request model
class AddJobRequest(BaseModel):
    content: str = Field(...)

# API to add a new job
@app.post("/api/addJob")
async def add_job(job: AddJobRequest) -> dict:
    try:
        # Add job to the database
        return {"message": "Job added successfully"}
    except Exception as e:
        logging.error(f"Error adding job: {e}")
        return {"error": "Error adding job"}

@app.get("/api/availableModels")
async def get_available_models():
    available_models = []
    try:
        models = openai_client.models.list()
        for model in models:
            available_models.append(model.id)
    except Exception as e:
        logging.error(f"Error fetching models: {e}")
    return {"models": available_models}
