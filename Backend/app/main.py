import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.users import router as users_router
from app.api.courses import router as courses_router
from app.api.assignments import router as assignments_router
from app.api.auth import router as auth_router
from app.api.roles import router as roles_router
from app.api.progress import router as progress_router
from app.api.dashboard import router as dashboard_router
from app.api.mentorship import router as mentorship_router
from app.api.chat import router as chat_router
from app.chat.websocket import router as chat_ws_router
from app.core.deps import require_auth

app = FastAPI(title="LMS MVP", redirect_slashes=False)

_cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    # Любой localhost / 127.0.0.1 с портом (Vite, preview и т.д.)
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "LMS API is running 🚀"}


app.include_router(users_router, dependencies=require_auth)
app.include_router(roles_router, dependencies=require_auth)
app.include_router(mentorship_router, dependencies=require_auth)
app.include_router(courses_router, dependencies=require_auth)
app.include_router(assignments_router, dependencies=require_auth)
app.include_router(progress_router, dependencies=require_auth)
app.include_router(dashboard_router, dependencies=require_auth)
app.include_router(chat_router, dependencies=require_auth)
app.include_router(auth_router)
app.include_router(chat_ws_router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)