from fastapi import FastAPI

from app.api.users import router as users_router
from app.api.courses import router as courses_router
from app.api.assignments import router as assignments_router
from app.api.auth import router as auth_router

app = FastAPI(title="LMS MVP")


@app.get("/")
def root():
    return {"message": "LMS API is running 🚀"}


app.include_router(users_router)
app.include_router(courses_router)
app.include_router(assignments_router)
app.include_router(auth_router)