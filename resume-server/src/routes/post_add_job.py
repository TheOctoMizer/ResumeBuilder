# src/routes/post_add_job.py

from fastapi import APIRouter

router = APIRouter()

async def extract_and_add_to_annotation(job: AddJobRequest):
    """Extract job URL details and add job to the annotation table."""
    extract_url_task = extract_url_find_id(job)
    add_job_task = add_job_to_manual_annotation_table(job.content)
    job_url, job_post_id, job_find = await extract_url_task
    job_id = await add_job_task

    if not job_id:
        raise ValueError("Error adding job to manual annotation table")
    return job_url, job_post_id, job_find, job_id

async def process_job_details_and_queries(job: AddJobRequest, job_url: str, job_find: str, job_post_id: str):
    """Process job details and generate search queries concurrently."""
    process_details_task = process_job_and_extract_details(
        job_content=job.content, job_url=job_url, job_find=job_find, job_id=job_post_id
    )
    generate_search_task = get_google_search_queries(job.content)

    job_details, (search_queries, lang) = await asyncio.gather(process_details_task, generate_search_task)

    if not job_details:
        raise ValueError("Error extracting job details")
    if not search_queries:
        raise ValueError("Error generating search queries")

    return job_details, search_queries, lang


async def add_to_tracking_table(job_tracking_table, job_details, job_id):
    """Add job details to the tracking table."""
    job_tracking_entry = job_details.dict(by_alias=True)
    job_tracking_entry.update({
        "job_id": str(job_id),
        "ResumeGenerated": False,  # Default value
        "ResumePath": "",
        "statuses": [],
    })

    tracking_result = await job_tracking_table.insert_one(job_tracking_entry)
    if not tracking_result.inserted_id:
        raise ValueError("Error adding job to tracking table")
    return tracking_result.inserted_id

async def perform_search(search_queries, lang):
    """Perform Google search queries."""
    search_results = await search_google(search_queries, lang)
    return search_results

@router.post('/addJob')
async def add_job(job: AddJobRequest) -> dict:
    try:
        # Step 1: Get database references
        db = get_db_client()
        job_tracking_table = db[get_db_name()][get_job_tracking_table()]

        # Step 2: Extract details and add to annotation table
        job_url, job_post_id, job_find, job_id = await extract_and_add_to_annotation(job)

        # Step 3: Process job details and generate queries
        job_details, search_queries, lang = await process_job_details_and_queries(job, job_url, job_find, job_post_id)

        # Step 4: Add to tracking table
        tracking_result_id = await add_to_tracking_table(job_tracking_table, job_details, job_id)

        # Step 5: Perform Google search
        search_results = await perform_search(search_queries, lang)

        return {
            "message": "Job added successfully",
            "job_id": str(tracking_result_id),
            "search_results": search_results
        }

    except ValueError as ve:
        logging.error(f"Validation error adding job: {ve}")
        return {"error": str(ve)}

    except Exception as e:
        logging.error(f"Error adding job: {e}")
        return {"error": "Error adding job"}