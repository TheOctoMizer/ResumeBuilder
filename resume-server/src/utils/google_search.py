from googlesearch import search

async def search_google(query: dict, lang: str = "en", num: int = 10, stop: int = 10, pause: float = 2.0):
    # loop through the queries and search
    search_results = []
    for q in query:
        search_results.append(search(q, num=num, lang=lang, stop=stop, pause=pause))
    return search_results