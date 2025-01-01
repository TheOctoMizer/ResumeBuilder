# src/utils/extract_job_details.py

from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

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


async def extract_url_find_id(job):
    """Extracts the job URL, the job ID, and the job find website from a given job.

    Args:
        job: The job to parse.

    Returns:
        The job URL, the job ID, and the job find website.
    """

    job_url = job.url
    job_id = await extract_job_id(job_url)
    job_website = await extract_website(job_url)
    return job_url, job_id, job_website

