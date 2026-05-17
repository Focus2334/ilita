from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# Backend/app -> repo root
REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIST = REPO_ROOT / "frontend" / "my-dashboard" / "dist"


def mount_frontend(app: FastAPI) -> bool:
    """Раздаёт собранный React на том же порту, что и API."""
    if not FRONTEND_DIST.is_dir():
        return False

    app.mount(
        "/",
        StaticFiles(directory=FRONTEND_DIST, html=True),
        name="frontend",
    )
    return True
