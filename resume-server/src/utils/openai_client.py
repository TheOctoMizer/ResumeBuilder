from openai import OpenAI

_cached_client = None

def get_openai_client(api_key: str = None, base_url: str = None):
    """
    Function returns a cached OpenAI client if exists, else creates a new client.
    Use in Entry point so client can be reused.
    :return:
    OpenAI client
    """
    global _cached_client
    if _cached_client is None:
        if api_key is None:
            raise ValueError("API key not provide; API key must be provided to create the client")
        _cached_client = OpenAI(
            api_key=api_key,
            base_url=base_url,
        )
    return _cached_client

async def get_new_openai_client(api_key, base_url=None):
    """
    Always creates a new OpenAI client instance with the provided parameters.
    Use when client is a one-time need.
    """
    return OpenAI(api_key=api_key, base_url=base_url)