from fastapi import APIRouter
from src.utils.openai_client import get_openai_client
import logging

router = APIRouter()


@router.get("/availableModels")
def get_available_models():
    openai_client = get_openai_client()
    available_models = []
    try:
        models = openai_client.models.list()
        for model in models.data:
            available_models.append(model.id)
    except Exception as e:
        logging.error(f"Error fetching models: {e}")
    return {"models": available_models}