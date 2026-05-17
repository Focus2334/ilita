from sqlalchemy.orm import Session

from app.db.models.progress import UserCourseProgress
from app.db.models.user_course_assignment import UserCourseAssignment


def get_assignment(db: Session, assignment_id: int):
    return db.get(UserCourseAssignment, assignment_id)


def get_assignment_for_user_course(db: Session, user_id: int, course_id: int):
    return (
        db.query(UserCourseAssignment)
        .filter(
            UserCourseAssignment.user_id == user_id,
            UserCourseAssignment.course_id == course_id,
        )
        .first()
    )


def assign_course(db: Session, user_id: int, course_id: int):
    existing = get_assignment_for_user_course(db, user_id, course_id)
    if existing:
        return existing

    assignment = UserCourseAssignment(
        user_id=user_id,
        course_id=course_id,
        status="assigned",
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def unassign_course(db: Session, assignment_id: int):
    assignment = get_assignment(db, assignment_id)
    if not assignment:
        return None

    db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == assignment.user_id,
        UserCourseProgress.course_id == assignment.course_id,
    ).delete(synchronize_session=False)

    db.delete(assignment)
    db.commit()
    return assignment


def get_user_assignments(db: Session, user_id: int):
    return db.query(UserCourseAssignment).filter(
        UserCourseAssignment.user_id == user_id
    ).all()