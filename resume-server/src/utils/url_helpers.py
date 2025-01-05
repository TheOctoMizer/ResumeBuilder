import requests
from bs4 import BeautifulSoup
import logging
from typing import Dict, List
import concurrent.futures
import asyncio

async def get_page_title(url: str) -> Dict[str, str]:
    """Fetch the title of a webpage."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string if soup.title else "No title found"
        
        return {
            "url": url,
            "title": title.strip() if title else "No title found"
        }
    except Exception as e:
        logging.error(f"Error fetching title for {url}: {str(e)}")
        return {
            "url": url,
            "title": "Error fetching title"
        }

def _get_page_title_sync(url: str) -> Dict[str, str]:
    """Synchronous version of get_page_title for use with run_in_executor."""
    return asyncio.run(get_page_title(url))

async def get_titles_for_urls(urls: List[str]) -> List[Dict[str, str]]:
    """Process multiple URLs concurrently."""
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        tasks = [
            loop.run_in_executor(executor, _get_page_title_sync, url)
            for url in urls
        ]
        results = await asyncio.gather(*tasks)
    return results 