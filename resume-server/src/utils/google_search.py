from googlesearch import search

async def search_google(query: dict, lang: str = "en", num: int = 10, stop: int = 10, pause: float = 2.0):
    # loop through the queries and search
    search_results = []
    for q in query:
        # Convert the generator to a list before appending
        results = list(search(q, num=num, lang=lang, stop=stop, pause=pause))
        search_results.append(results)
    return search_results