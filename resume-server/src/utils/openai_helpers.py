import json
import logging
from src.utils.openai_client import get_openai_client
from src.models.job_models import JobDataEntities
from pydantic import BaseModel, Field
from typing import List, Optional

# Define pydantic models
class JobDataEntities(BaseModel):
    Company: str = Field(description="The official name of the organization offering the job.")
    JobTitle: str = Field(description="The title or designation of the job role being offered.")
    Salary: Optional[str] = Field(description="The range or exact salary offered for the position.")
    City: str = Field(description="The city where the job is based")
    State: str = Field(description="The state where the job is based")
    Country: str = Field(description="The country where the job is based")
    Experience: List[str] = Field(description="The minimum level of professional experience required for the job.")
    TechnicalSkills: List[str] = Field(description="A list of technical skills required to qualify for the role.")
    SoftSkills: List[str] = Field(description="A list of soft skills required to excel in the role.")
    JobSummary: str = Field(description="A concise summary of the job posting.")
    WorkArrangement: str = Field(description="The type of employment arrangement offered.")
    WorkLocation: str = Field(description="The work environment.")
    Education: str = Field(description="The minimum educational qualification required for the job.")


class SearchRequestSchema(BaseModel):
    query: List[str] = Field(min_items=3, description="Search terms to use for the google search to up skill for the job")
    lang: str = Field(description="Language code to make the google search")


async def process_job_and_extract_details(job_content: str, job_url: str, job_find: str, job_id: str) -> JobDataEntities:
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
    try:
        openai_client = get_openai_client()
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
                    "schema": JobDataEntities.model_json_schema()
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
        job_entity = JobDataEntities(**job_details, JobURL=job_url, JobFind=job_find, JobID=job_id)
        logging.info("Job details extracted successfully.")
        return job_entity

    except Exception as e:
        logging.error(f"Error processing job details: {e}")
        return None

async def get_google_search_queries(data: str):
    try:
        openai_client = get_openai_client()
        search_queries = openai_client.beta.chat.completions.parse(
            model="gemma-2-27b-it",
            messages=[
                {"role": "system", "content": "Generate search queries to upskill for the job."},
                {"role": "user", "content": data},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "schema": SearchRequestSchema.model_json_schema()
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