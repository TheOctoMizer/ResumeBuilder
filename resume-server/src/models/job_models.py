from enum import Enum
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

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
    status: JobStatusType = Field(..., description="The current stage or outcome of the job application process.")
    date: datetime = Field(default_factory=datetime.utcnow, description="Status update timestamp.")

class WorkArrangementType(str, Enum):
    Onsite = "Onsite"
    Remote = "Remote"
    Hybrid = "Hybrid"
    NotSpecified = "Not Specified"

class WorkLocationType(str, Enum):
    Onsite = "Onsite"
    Remote = "Remote"
    Hybrid = "Hybrid"
    NotSpecified = "Not Specified"

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
