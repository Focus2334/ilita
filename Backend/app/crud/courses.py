from sqlalchemy.orm import Session
from app.db.models.course import Course
from app.schemas.course import CourseCreate


def create_course(db: Session, data: CourseCreate):
    course = Course(
        title=data.title,
        description=data.description,
        duration_days=data.duration_days
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def get_courses(db: Session):
    return db.query(Course).all()