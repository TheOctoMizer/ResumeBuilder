from enum import Enum
import json
from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
import logging
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Optional, List
from openai import OpenAI
from urllib.parse import urlencode, urlparse, parse_qs, urlunparse


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


@app.on_event("startup")
async def startup_event():
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting the server")
    await initialize_db()

@app.on_event("shutdown")
async def shutdown_event():
    logging.info("Shutting down the server")
    mongo_client.close()


# Connect to MongoDB using Motor
mongo_client = AsyncIOMotorClient("mongodb://localhost:27017/")
db = None
job_tracking_table = None
manual_annotation_table = None
extracted_entities_table = None


async def initialize_db():
    global db, job_tracking_table, manual_annotation_table, extracted_entities_table
    try:
        db = mongo_client["jobsDB"]
        job_tracking_table = db["job_tracking"]
        manual_annotation_table = db["manual_annotation"]
        extracted_entities_table = db["extracted_entities"]
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


# Initialize OpenAI API
openai_client = OpenAI(
    base_url="http://localhost:1234/v1",
    api_key="lm-studio"
)


# Serve the React app
@app.get("/", response_class=HTMLResponse)
async def read_root() -> HTMLResponse:
    return FileResponse("client/build/index.html")

async def convert_mongo_document(document):
    if '_id' in document:
        document['id'] = str(document['_id'])
        del document['_id']
    return document

class AllJobsRequest(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number")
    search: str = Field(default="", description="Search query")
    limit: int = Field(default=10, ge=1, le=100, description="Number of items per page")


# API to fetch all jobs using POST
@app.get("/api/allJobs")
async def get_all_jobs(
    page: int = Query(1, ge=1, description="Page number"),
    search: Optional[str] = Query(None, description="Search query"),
    limit: int = Query(12, ge=1, le=100, description="Number of items per page"),
):
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
        query = {}
        if search:
            query["$text"] = {"$search": search}
        skip = (page - 1) * limit
        cursor = job_tracking_table.find(query).skip(skip).limit(limit)
        jobs = await cursor.to_list(length=limit)
        jobs = [await convert_mongo_document(job) for job in jobs]
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
    except Exception as e:
        logging.error(f"Error fetching all jobs: {e}")
        return {"error": "Error fetching all jobs"}


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
    status: JobStatusType = Field(..., description="The current stage or outcome of the job application process, such as 'Applied', 'Shortlisted', or 'Offered'.")
    date: datetime = Field(default_factory=datetime.utcnow, description="The specific date and time when this particular status update occurred.")


class JobDataEntities(BaseModel):
    JobURL: str = Field(..., description="The direct URL to the job posting, providing quick access to detailed job information.")
    JobFind: str = Field(..., description="The platform or website where the job was discovered, such as LinkedIn, Indeed, Glassdoor, or a company's career page.")
    JobID: str = Field(..., description="The unique identifier assigned to the job by the job posting platform or company, if available.")
    Company: str = Field(..., description="The official name of the organization offering the job.")
    JobTitle: str = Field(..., description="The title or designation of the job role being offered, such as 'Software Engineer' or 'Marketing Specialist'.")
    # Salary: Optional[SalaryType] = Field(None, description="The range or exact salary offered for the position, if mentioned in the job posting. May include a minimum and maximum amount or a fixed amount.")
    Salary: str = Field(default="Not Specified", description="The range or exact salary offered for the position, if mentioned in the job posting. May include a minimum and maximum amount or a fixed amount.")
    City: str = Field(description="The geographic location where the job is based, such as a city", default="Not Specified")
    State: str = Field(description="The geographic location where the job is based, such as a state", default="Not Specified")
    Country: str = Field(description="The geographic location where the job is based, such as a country", default="Not Specified")
    Experience: List[str] = Field(..., description="The minimum level of professional experience required for the job, typically measured in years or types of relevant experience.")
    TechnicalSkills: List[str] = Field(..., description="A list of technical, professional, or interpersonal skills required to qualify for the role, such as 'Python', 'Team Leadership', or 'Project Management'.")
    WorkArrangement: WorkArrangementType = Field(..., description="The type of employment arrangement offered, such as full-time, part-time, internship, or contract.")
    WorkLocation: WorkLocationType = Field(..., description="The work environment, specifying whether the job requires onsite presence, is fully remote, or offers a hybrid arrangement.")
    CompanyDetails: Optional[str] = Field(None, description="Additional information about the company, such as its mission, values, culture, or industry details.")
    ResumeGenerated: bool = Field(False, description="Indicates whether a tailored resume has been generated for the job application.")
    ResumePath: str = Field("", description="The file path or URL where the generated resume is stored for future reference or submission.")
    ProcessedDate: datetime = Field(default_factory=datetime.utcnow, description="The date when the job application data was last processed or updated.")
    IsApplied: bool = Field(False, description="Indicates whether the job has been applied to.")
    IsShortlisted: bool = Field(False, description="Indicates whether the candidate has been shortlisted for the job.")
    IsInterviewed: bool = Field(False, description="Indicates whether the candidate has been interviewed for the job.")
    IsOffered: bool = Field(False, description="Indicates whether the candidate has received a formal job offer.")
    IsAccepted: bool = Field(False, description="Indicates whether the candidate has accepted a job offer.")
    IsDeclined: bool = Field(False, description="Indicates whether the candidate has declined a job offer.")
    IsJoined: bool = Field(False, description="Indicates whether the candidate has joined the organization.")
    IsRejected: bool = Field(False, description="Indicates whether the candidate has been rejected at any stage of the application process.")
    AppliedDate: Optional[datetime] = Field(None, description="The date when the job application was submitted.")
    ShortlistedDate: Optional[datetime] = Field(None, description="The date when the candidate was shortlisted for the job.")
    InterviewedDate: Optional[datetime] = Field(None, description="The date when the candidate was interviewed for the job.")
    OfferedDate: Optional[datetime] = Field(None, description="The date when the candidate received a formal job offer.")
    AcceptedDate: Optional[datetime] = Field(None, description="The date when the candidate accepted a job offer.")
    DeclinedDate: Optional[datetime] = Field(None, description="The date when the candidate declined a job offer.")
    JoinedDate: Optional[datetime] = Field(None, description="The date when the candidate joined the organization.")
    RejectedDate: Optional[datetime] = Field(None, description="The date when the candidate was rejected at any stage of the application process.")
    OfferedSalary: Optional[str] = Field(None, description="The salary amount formally offered to the candidate if the application progressed to an offer stage.")


class AddJobRequest(BaseModel):
    content: str = Field(..., description="Job description content")
    url: str = Field(..., description="Job URL")
    job_find: str = Field(..., description="Job platform or website where the job was found")
    job_id: str = Field(..., description="Unique identifier of the job")


json_schema = {
  "type": "object",
  "title": "JobDataEntities",
  "properties": {
    "Company": {
      "type": "string",
      "description": "The official name of the organization offering the job."
    },
    "JobTitle": {
      "type": "string",
      "description": "The title or designation of the job role being offered, such as 'Software Engineer' or 'Marketing Specialist'."
    },
    "Salary": {
      "type": ["string", "null"],
      "description": "The range or exact salary offered for the position, if mentioned in the job posting. May include a minimum and maximum amount or a fixed amount."
    },
    "City": {
      "type": "string",
      "description": "The city where the job is based"
    },
    "State": {
      "type": "string",
      "description": "The state where the job is based"
    },
    "Country": {
      "type": "string",
      "description": "The country where the job is based"
    },
    "Experience": {
      "type": "array",
            "items": {"type": "string"},
      "description": "The minimum level of professional experience required for the job, typically measured in years or types of relevant experience. Typically includes a range or specific number of years."
    },
    "TechnicalSkills": {
      "type": "array",
            "items": {"type": "string"},
      "description": "A list of technical skills required to qualify for the role, such as 'Python', 'JavaScript', or 'SQL'. These are typically specific to the job role or industry."
    },
    "SoftSkills": {
        "type": "array",
            "items": {"type": "string"},
        "description": "A list of soft skills or interpersonal skills required to excel in the role, such as 'Communication', 'Problem-Solving', or 'Leadership'."
    },
    "WorkArrangement": {
      "type": "string",
      "enum": ["Full-time", "Part-time", "Internship", "Contract", "Not Specified"],
      "description": "The type of employment arrangement offered, such as full-time, part-time, internship, or contract."
    },
    "WorkLocation": {
      "type": "string",
      "enum": ["Onsite", "Remote", "Hybrid", "Not Specified"],
      "description": "The work environment, specifying whether the job requires onsite presence, is fully remote, or offers a hybrid arrangement."
    },
    "Education": {
        "type": "string",
        "description": "The minimum educational qualification required for the job, such as 'Bachelor's Degree' or 'Master's Degree'."
    },
  },
  "required": [
    "Company",
    "JobTitle",
    "Location",
    "Experience",
    "TechnicalSkills",
    "WorkArrangement",
    "WorkLocation",
  ]
}


# Add job to manual annotation table
async def add_job_to_manual_annotation_table(job_content: str):
    """
    Add a job to the manual annotation table

    Args:
        job_content (str): The job description content to be added

    Returns:
        Inserted ID or None
    """
    try:
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
    

# Add extracted entities to extracted entities table
async def add_extracted_entities_to_table(job_id: str, extracted_entities: dict):
    """
    Add extracted entities to the extracted entities table

    Args:
        job_id (str): The job ID to link the extracted entities
        extracted_entities (dict): The extracted entities from the job description

    Returns:
        Inserted ID or None
    """
    try:
        extracted_entities["job_id"] = job_id
        extracted_entities["added_at"] = datetime.utcnow()
        result = await extracted_entities_table.insert_one(extracted_entities)
        return result.inserted_id
    except Exception as e:
        logging.error(f"Error adding extracted entities to table: {e}")
        return None
    

# Process job content and extract relevant details
async def process_job_and_extract_details(job_content: str, job_url: str, job_find: str, job_id: str) -> Optional[JobDataEntities]:
    """
    Process the job content and extract relevant details using OpenAI API

    Args:
        job_content (str): The job description content to be processed
        job_url (str): The URL of the job posting
        job_find (str): The platform or website where the job was found
        job_id (str): The unique identifier of the job

    Returns:
        JobDataEntities: The extracted entities from the job description
    """
    system_instruction = (
        "Extract all the available job details.\n"
        "Keep the extractions relevant to the job description and brief.\n"
        "Keep the details between 5 to 10 words."
    )

    try:
        openai_response = openai_client.beta.chat.completions.parse(
            model="gemma-2-9b-it",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": job_content},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "schema": json_schema
                }
            }
        )
        job_details = openai_response.choices[0].message.content
        if not job_details:
            logging.error("No job details extracted.")
            return None
        if isinstance(job_details, str):
            logging.info("Job details extracted as string.")
            job_details = json.loads(job_details)
            logging.info(f"Job details loaded into JSON")
        # print(F"Job Details: {job_details}")
        # Validate and create a JobDataEntities instance
        job_entity = JobDataEntities(**job_details, JobURL=job_url, JobFind=job_find, JobID=job_id)
        return job_entity

    except Exception as e:
        logging.error(f"Error processing job details: {e}")
        return None


async def extract_job_id(url):
  """Extracts the 'currentJobId' parameter from a given URL.

  Args:
    url: The URL to parse.

  Returns:
    The value of the 'currentJobId' parameter, or None if not found.
  """
  parsed_url = urlparse(url)
  query_params = parse_qs(parsed_url.query)
  job_id = query_params.get('currentJobId')
  if job_id:
    return job_id[0]  # Extract the first value from the list
  else:
    return None

async def extract_website(url):
  """Extracts the website from a given URL.

  Args:
    url: The URL to parse.

  Returns:
    The website part of the URL.
  """

  parsed_url = urlparse(url)
  return parsed_url.netloc

async def extract_job_url(url):
    """Extracts the job URL from a given URL.
    
    Args:
        url: The URL to parse.
    
    Returns:
        The job URL part of the URL.
    """
    
    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    if 'currentJobId' not in query_params:
        return url
    if "currentJobId" in query_params:
        job_id_param = {'currentJobId': query_params['currentJobId'][0]}
        cleaned_query = urlencode(job_id_param)
        cleaned_url = urlunparse(parsed_url._replace(query=cleaned_query))
        return cleaned_url

# API to add a new job
@app.post("/api/addJob")
async def add_job(job: AddJobRequest) -> dict:
    # print(F"Job: {job}")
    try:
        job_url = await extract_job_url(job.url)
        job_find = await extract_website(job.url)
        job_post_id = await extract_job_id(job.url)
        # print(F"Job URL: {job_url}")
        # print(F"Job ID: {job_post_id}")
        # print(F"Job Find: {job_find}")
        job_id = await add_job_to_manual_annotation_table(job.content)
        if not job_id:
            return {"error": "Error adding job to manual annotation table"}

        job_details = await process_job_and_extract_details(job_content=job.content, job_url=job_url, job_find=job_find, job_id=job_post_id)
        if not job_details:
            return {"error": "Error extracting job details"}

        # extracted_entities = job_details.dict()
        job_tracking_entry = job_details.dict(by_alias=True)
        job_tracking_entry.update({
            "job_id": str(job_id),
            "ResumeGenerated": False,  # Set default or based on your logic
            "ResumePath": "",
            "statuses": [],
            # "ProcessedDate": datetime.utcnow()
        })

        tracking_result = await job_tracking_table.insert_one(job_tracking_entry)
        if not tracking_result.inserted_id:
            return {"error": "Error adding job to tracking table"}

        return {"message": "Job added successfully", "job_id": str(tracking_result.inserted_id)}
    
    except Exception as e:
        logging.error(f"Error adding job: {e}")
        return {"error": "Error adding job"}


@app.get("/api/availableModels")
async def get_available_models():
    available_models = []
    try:
        models = await openai_client.models.list()
        for model in models.data:
            available_models.append(model.id)
    except Exception as e:
        logging.error(f"Error fetching models: {e}")
    return {"models": available_models}
