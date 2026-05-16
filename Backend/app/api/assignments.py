from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.assignment import AssignCourseRequest, AssignmentRead
from app.crud.assignments import assign_course, get_user_assignments

router = APIRouter(prefix="/courses", tags=["Assignments"])


@router.post("/{course_id}/assign", response_model=AssignmentRead)
def assign(course_id: int, data: AssignCourseRequest, db: Session = Depends(get_db)):
    return assign_course(db, data.user_id, course_id)


@router.get("/users/{user_id}/assignments", response_model=list[AssignmentRead])
def user_assignments(user_id: int, db: Session = Depends(get_db)):
    return get_user_assignments(db, user_id)