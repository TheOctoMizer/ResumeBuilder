from functools import wraps
import logging
from typing import Callable, Any

def handle_exceptions(func: Callable) -> Callable:
    @wraps(func)
    async def wrapper(*args, **kwargs) -> Any:
        try:
            return await func(*args, **kwargs)
        except ValueError as ve:
            logging.warning(f"Validation error in {func.__name__}: {ve}")
            return {"error": str(ve), "type": "validation_error"}
        except Exception as e:
            logging.error(f"Error in {func.__name__}: {e}", exc_info=True)
            return {"error": "Internal server error", "type": "server_error"}
    return wrapper