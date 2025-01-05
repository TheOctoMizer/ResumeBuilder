from fastapi import APIRouter
from fastapi.responses import HTMLResponse, FileResponse

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
async def home_route() -> FileResponse:
    return FileResponse("client/build/index.html")
