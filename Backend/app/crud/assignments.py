from sqlalchemy.orm import Session

from app.db.models.user_course_assignment import UserCourseAssignment


def assign_course(db: Session, user_id: int, course_id: int):
    assignment = UserCourseAssignment(
        user_id=user_id,
        course_id=course_id,
        status="assigned"
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def get_user_assignments(db: Session, user_id: int):
    return db.query(UserCourseAssignment).filter(
        UserCourseAssignment.user_id == user_id
    ).all()