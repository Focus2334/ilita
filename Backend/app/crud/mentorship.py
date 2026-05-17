from sqlalchemy.orm import Session, joinedload

from app.db.models.mentor_student import MentorStudent
from app.db.models.user import User

MENTOR_ROLE = "mentor"
STUDENT_ROLE = "student"


def _role_names(user: User) -> set[str]:
    return {role.name for role in user.roles}


def user_has_role(user: User, role_name: str) -> bool:
    return role_name in _role_names(user)


def get_mentor(db: Session, mentor_id: int):
    return (
        db.query(User)
        .options(joinedload(User.roles))
        .filter(User.id == mentor_id)
        .first()
    )


def get_student(db: Session, student_id: int):
    return (
        db.query(User)
        .options(joinedload(User.roles))
        .filter(User.id == student_id)
        .first()
    )


def get_mentor_students(db: Session, mentor_id: int):
    return (
        db.query(User)
        .join(MentorStudent, MentorStudent.student_id == User.id)
        .filter(MentorStudent.mentor_id == mentor_id)
        .order_by(User.last_name, User.first_name)
        .all()
    )


def get_mentor_student_link(db: Session, mentor_id: int, student_id: int):
    return (
        db.query(MentorStudent)
        .filter(
            MentorStudent.mentor_id == mentor_id,
            MentorStudent.student_id == student_id,
        )
        .first()
    )


def assign_student_to_mentor(db: Session, mentor: User, student: User):
    link = get_mentor_student_link(db, mentor.id, student.id)
    if link:
        return link

    link = MentorStudent(mentor_id=mentor.id, student_id=student.id)
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def unassign_student_from_mentor(db: Session, mentor_id: int, student_id: int):
    link = get_mentor_student_link(db, mentor_id, student_id)
    if not link:
        return False
    db.delete(link)
    db.commit()
    return True
