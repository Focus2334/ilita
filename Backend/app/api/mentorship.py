from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import require_admin_or_hr
from app.schemas.user import UserRead
from app.schemas.mentorship import MentorStudentAssign
from app.crud.mentorship import (
    MENTOR_ROLE,
    STUDENT_ROLE,
    assign_student_to_mentor,
    get_mentor,
    get_mentor_students,
    get_student,
    unassign_student_from_mentor,
    user_has_role,
)

router = APIRouter(
    prefix="/mentors",
    tags=["Mentorship"],
    dependencies=[Depends(require_admin_or_hr)],
)


@router.get("/{mentor_id}/students", response_model=list[UserRead])
def list_mentor_students(mentor_id: int, db: Session = Depends(get_db)):
    mentor = get_mentor(db, mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    if not user_has_role(mentor, MENTOR_ROLE):
        raise HTTPException(status_code=400, detail="User does not have mentor role")
    return get_mentor_students(db, mentor_id)


@router.post("/{mentor_id}/students", response_model=UserRead, status_code=201)
def assign_student(
    mentor_id: int,
    data: MentorStudentAssign,
    db: Session = Depends(get_db),
):
    mentor = get_mentor(db, mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    if not user_has_role(mentor, MENTOR_ROLE):
        raise HTTPException(status_code=400, detail="User does not have mentor role")

    student = get_student(db, data.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not user_has_role(student, STUDENT_ROLE):
        raise HTTPException(status_code=400, detail="User does not have student role")

    if mentor.id == student.id:
        raise HTTPException(status_code=400, detail="Mentor and student cannot be the same user")

    assign_student_to_mentor(db, mentor, student)
    return student


@router.delete("/{mentor_id}/students/{student_id}", status_code=204)
def unassign_student(
    mentor_id: int,
    student_id: int,
    db: Session = Depends(get_db),
):
    mentor = get_mentor(db, mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    if not user_has_role(mentor, MENTOR_ROLE):
        raise HTTPException(status_code=400, detail="User does not have mentor role")

    student = get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not unassign_student_from_mentor(db, mentor_id, student_id):
        raise HTTPException(status_code=404, detail="Student is not assigned to this mentor")

    return Response(status_code=204)
