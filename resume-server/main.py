from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
import logging
from pydantic import BaseModel, Field

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
