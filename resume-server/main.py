# main.py

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
from starlette.responses import FileResponse

from src.routes.get_available_models import router as get_available_models

from src.utils.openai_client import get_openai_client
from src.utils.convert_mongo_document import convert_mongo_document
from src.models.get_all_job_request import AllJobsRequest
from src.models.work_arrangement import WorkArrangementType
from src.routes.get_all_jobs import router as get_all_jobs
from src.utils.initialize import initialize_db
from src.utils.session_management import get_job_tracking_table, get_manual_annotation_table, get_extracted_entities_table, initialize_session_data, get_db_client, get_db_name
from src.utils.google_search import search_google
from src.routes.get_time_to_respond import router as get_time_to_respond
from src.models.work_location import WorkLocationType
from src.utils.extract_job_details import extract_url_find_id

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
    mongo_client = get_db_client()
    mongo_client.close()


# Connect to MongoDB using Motor
initialize_session_data(
    mongo_client=AsyncIOMotorClient("mongodb://localhost:27017/"),
    db="jobsDB",
    job_tracking_table="job_tracking",
    manual_annotation_table="manual_annotation",
    extracted_entities_table="extracted_entities"
)
# db = None
# job_tracking_table = None
# manual_annotation_table = None
# extracted_entities_table = None





_ = get_openai_client(
                base_url="http://localhost:1234/v1",
                api_key="lm-studio"
            )


# Serve the React app
@app.get("/", response_class=HTMLResponse)
async def read_root() -> FileResponse:
    return FileResponse("client/build/index.html")





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
    Salary: str = Field(default="Not Specified", description="The range or exact salary offered for the position, if mentioned in the job posting. May include a minimum and maximum amount or a fixed amount.")
    City: str = Field(description="The geographic location where the job is based, such as a city", default="Not Specified")
    State: str = Field(description="The geographic location where the job is based, such as a state", default="Not Specified")
    Country: str = Field(description="The geographic location where the job is based, such as a country", default="Not Specified")
    Experience: List[str] = Field(..., description="The minimum level of professional experience required for the job, typically measured in years or types of relevant experience.")
    TechnicalSkills: List[str] = Field(..., description="A list of technical, professional, or interpersonal skills required to qualify for the role, such as 'Python', 'Team Leadership', or 'Project Management'.")
    JobSummary: Optional[str] = Field(..., description="A brief summary of the job application, for quick references.")
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


class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    lang: str = Field("en", description="Language code for the search query")
    num: int = Field(10, ge=1, le=100, description="Number of search results to fetch")
    stop: int = Field(10, ge=1, le=100, description="Number of search results to stop at")

search_request_schema = {
    "type": "object",
    "title": "SearchRequest",
    "properties": {
        "query": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 3,
            "description": "Search terms to use for the google search to up skill for the job"
        },
        "lang": {"type": "string", "description": "Language code to make the google search"}
    },
    "required": ["query", "lang"]
}

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
    "JobSummary": {
        "type": "string",
        "description": "A concise summary of the job posting, capturing the role, responsibilities, and key qualifications."
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
    "JobSummary"
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
        db = get_db_client()
        extracted_entities_table = db[get_db_name()][get_extracted_entities_table()]
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
    "Provide a clear and concise summary of the job posting that describes the role, responsibilities, and key qualifications.\n"
    "Keep the summary between 30 to 60 words to ensure it is informative yet concise."
)
    openai_client = None
    try:
        openai_client = get_openai_client()
    except Exception as e:
        logging.error(f"Error connecting to OpenAI API in process_job_and_extract_details: {e}")

    try:
        logging.info("Extracting job details...")
        openai_response = openai_client.beta.chat.completions.parse(
            model="gemma-2-27b-it",
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
        logging.info("Job details extracted successfully.")
        return job_entity

    except Exception as e:
        logging.error(f"Error processing job details: {e}")
        return None


async def get_google_search_queries(data: str):
    openai_client = None
    try:
        openai_client = get_openai_client()
    except Exception as e:
        logging.error(f"Error connecting to OpenAI API in get_google_search_queries: {e}")
    try:
        search_queries = openai_client.beta.chat.completions.parse(
            model="gemma-2-27b-it",
            messages=[
                {"role": "system", "content": "Generate search queries to upskill for the job."},
                {"role": "user", "content": data},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "schema": search_request_schema
                }
            }
        )

        intermediate_search_queries = search_queries.choices[0].message.content
        if not intermediate_search_queries:
            logging.error("No search queries extracted.")
            return None, None

        if isinstance(intermediate_search_queries, str):
            logging.info("Search queries extracted as string.")
            intermediate_search_queries = json.loads(intermediate_search_queries)
            logging.info(f"Search queries loaded into JSON")
        search_queries = intermediate_search_queries["query"]
        lang = intermediate_search_queries["lang"]

        return search_queries, lang
    except Exception as e:
        logging.error(f"Error generating search queries: {e}")
        return None, None




# API to add a new job
@app.post("/api/addJob")
async def add_job(job: AddJobRequest) -> dict:
    # print(F"Job: {job}")
    try:
        db = get_db_client()
        job_tracking_table = db[get_db_name()][get_job_tracking_table()]
        job_url, job_post_id, job_find = await extract_url_find_id(job)
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

        search_queries, lang = await get_google_search_queries(job.content)
        if not search_queries:
            return {"error": "Error generating search queries"}
        
        search_results = await search_google(search_queries, lang)
        return {"message": "Job added successfully", "job_id": str(tracking_result.inserted_id), "search_results": search_results}
    except Exception as e:
        logging.error(f"Error adding job: {e}")
        return {"error": "Error adding job"}


app.include_router(router=get_available_models, prefix='/api')
app.include_router(router=get_all_jobs, prefix='/api')
app.include_router(router=get_time_to_respond, prefix='/api')

@app.get("/api/applicationStages")
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
    
@app.get("/api/responseRates")
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

@app.get("/api/jobSourceEffectiveness")
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
    
    

@app.get("/api/jobs/stats")
async def get_job_stats():
    """
    Retrieve aggregated statistics for the job tracking dashboard.
    
    Returns:
        dict: A dictionary containing various analytics data.
    """
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
