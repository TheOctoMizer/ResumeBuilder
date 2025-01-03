from fastapi import APIRouter
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

router = APIRouter()
router.mount("/static", StaticFiles(directory="client/build", html=True), name="client")

@router.get("/", response_class=HTMLResponse)
async def home() -> FileResponse:
    return FileResponse("client/build/index.html")
