from fastapi import FastAPI

from app.api.users import router as users_router
from app.api.courses import router as courses_router
from app.api.assignments import router as assignments_router
from app.api.auth import router as auth_router
from app.api.roles import router as roles_router
from app.core.deps import require_auth

app = FastAPI(title="LMS MVP")


@app.get("/")
def root():
    return {"message": "LMS API is running 🚀"}


app.include_router(users_router, dependencies=require_auth)
app.include_router(roles_router, dependencies=require_auth)
app.include_router(courses_router, dependencies=require_auth)
app.include_router(assignments_router, dependencies=require_auth)
app.include_router(auth_router)