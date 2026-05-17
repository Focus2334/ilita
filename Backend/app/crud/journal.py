from sqlalchemy.orm import Session, joinedload

from app.db.models.course import Course
from app.db.models.progress import UserCourseProgress
from app.db.models.role import Role
from app.db.models.user import User, user_roles
from app.db.models.user_course_assignment import UserCourseAssignment

STUDENT_ROLE = "student"


def get_students(db: Session) -> list[User]:
    return (
        db.query(User)
        .join(user_roles, User.id == user_roles.c.user_id)
        .join(Role, Role.id == user_roles.c.role_id)
        .filter(Role.name == STUDENT_ROLE)
        .options(joinedload(User.roles))
        .order_by(User.last_name, User.first_name)
        .all()
    )


def build_journal(db: Session) -> dict:
    students = get_students(db)
    courses = db.query(Course).order_by(Course.title).all()

    trainee_rows: list[dict] = []

    for student in students:
        assignments = (
            db.query(UserCourseAssignment)
            .filter(UserCourseAssignment.user_id == student.id)
            .all()
        )
        progress_rows = {
            row.course_id: row
            for row in db.query(UserCourseProgress)
            .filter(UserCourseProgress.user_id == student.id)
            .all()
        }

        course_items = []
        for assignment in assignments:
            course = db.get(Course, assignment.course_id)
            if not course:
                continue
            progress = progress_rows.get(course.id)
            course_items.append(
                {
                    "assignment_id": assignment.id,
                    "course_id": course.id,
                    "course_title": course.title,
                    "assignment_status": assignment.status,
                    "progress_percent": progress.progress_percent if progress else 0,
                    "progress_status": progress.status if progress else "not_started",
                }
            )

        trainee_rows.append(
            {
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
                "courses": sorted(course_items, key=lambda item: item["course_title"]),
            }
        )

    return {
        "trainees": trainee_rows,
        "courses": [{"id": course.id, "title": course.title} for course in courses],
    }
