from fastapi import FastAPI

from app.api.users import router as users_router
from app.api.courses import router as courses_router
from app.api.assignments import router as assignments_router
from app.api.auth import router as auth_router
from app.api.roles import router as roles_router
from app.api.progress import router as progress_router
from app.api.mentorship import router as mentorship_router
from app.api.chat import router as chat_router
from app.chat.websocket import router as chat_ws_router
from app.core.deps import require_auth

app = FastAPI(title="LMS MVP")


@app.get("/")
def root():
    return {"message": "LMS API is running 🚀"}


app.include_router(users_router, dependencies=require_auth)
app.include_router(roles_router, dependencies=require_auth)
app.include_router(mentorship_router, dependencies=require_auth)
app.include_router(courses_router, dependencies=require_auth)
app.include_router(assignments_router, dependencies=require_auth)
app.include_router(progress_router, dependencies=require_auth)
app.include_router(chat_router, dependencies=require_auth)
app.include_router(auth_router)
app.include_router(chat_ws_router)