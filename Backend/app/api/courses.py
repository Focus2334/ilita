from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.course import CourseCreate, CourseRead
from app.crud.courses import create_course, get_courses

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("/", response_model=CourseRead)
def create(course: CourseCreate, db: Session = Depends(get_db)):
    return create_course(db, course)


@router.get("/", response_model=list[CourseRead])
def list_courses(db: Session = Depends(get_db)):
    return get_courses(db)