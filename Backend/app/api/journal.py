from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.deps import require_admin_or_hr
from app.crud.assignments import assign_course, unassign_course
from app.crud.journal import STUDENT_ROLE, build_journal, get_students
from app.crud.users import get_user
from app.db.session import get_db
from app.schemas.journal import JournalRead

router = APIRouter(
    prefix="/journal",
    tags=["Journal"],
    dependencies=[Depends(require_admin_or_hr)],
)


@router.get("/", response_model=JournalRead)
def get_journal(db: Session = Depends(get_db)):
    return build_journal(db)


@router.post("/trainees/{user_id}/courses/{course_id}", status_code=201)
def assign_trainee_to_course(
    user_id: int,
    course_id: int,
    db: Session = Depends(get_db),
):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role_names = {role.name for role in user.roles}
    if STUDENT_ROLE not in role_names:
        raise HTTPException(status_code=400, detail="User is not a trainee (student)")

    from app.crud.courses import get_course

    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    assignment = assign_course(db, user_id, course_id)
    return {"assignment_id": assignment.id}


@router.delete("/assignments/{assignment_id}", status_code=204)
def remove_trainee_from_course(assignment_id: int, db: Session = Depends(get_db)):
    assignment = unassign_course(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return Response(status_code=204)
