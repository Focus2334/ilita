from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.db.models.course import Course, CoursePage, PageBlock
from app.db.models.progress import UserCourseProgress, UserPageProgress
from app.db.models.user_course_assignment import UserCourseAssignment
from app.schemas.course import CourseCreate, CoursePageCreate, PageBlockCreate


def get_course(db: Session, course_id: int):
    return (
        db.query(Course)
        .options(
            joinedload(Course.pages).joinedload(CoursePage.blocks),
        )
        .filter(Course.id == course_id)
        .first()
    )


def get_courses(db: Session):
    return db.query(Course).order_by(Course.id).all()


def update_course(db: Session, course: Course, data):
    if data.title is not None:
        course.title = data.title
    if data.description is not None:
        course.description = data.description
    if data.duration_days is not None:
        course.duration_days = data.duration_days
    db.commit()
    db.refresh(course)
    return course


def create_course(db: Session, data: CourseCreate):
    course = Course(
        title=data.title,
        description=data.description,
        duration_days=data.duration_days,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def get_course_page(db: Session, course_id: int, page_id: int):
    return (
        db.query(CoursePage)
        .options(joinedload(CoursePage.blocks))
        .filter(CoursePage.id == page_id, CoursePage.course_id == course_id)
        .first()
    )


def _next_page_position(db: Session, course_id: int) -> int:
    max_position = (
        db.query(func.max(CoursePage.position))
        .filter(CoursePage.course_id == course_id)
        .scalar()
    )
    return (max_position or 0) + 1


def _next_block_position(db: Session, page_id: int) -> int:
    max_position = (
        db.query(func.max(PageBlock.position))
        .filter(PageBlock.page_id == page_id)
        .scalar()
    )
    return (max_position or 0) + 1


def create_course_page(db: Session, course: Course, data: CoursePageCreate):
    position = data.position
    if position is None:
        position = _next_page_position(db, course.id)

    page = CoursePage(
        course_id=course.id,
        title=data.title,
        position=position,
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


def create_page_block(db: Session, page: CoursePage, data: PageBlockCreate):
    position = data.position
    if position is None:
        position = _next_block_position(db, page.id)

    block = PageBlock(
        page_id=page.id,
        type=data.type,
        position=position,
        content=data.content,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


def get_page_block(db: Session, course_id: int, page_id: int, block_id: int):
    page = get_course_page(db, course_id, page_id)
    if not page:
        return None
    return (
        db.query(PageBlock)
        .filter(PageBlock.id == block_id, PageBlock.page_id == page_id)
        .first()
    )


def delete_course(db: Session, course: Course):
    page_ids = [page.id for page in course.pages]
    if page_ids:
        db.query(UserPageProgress).filter(
            UserPageProgress.page_id.in_(page_ids)
        ).delete(synchronize_session=False)

    db.query(UserCourseAssignment).filter(
        UserCourseAssignment.course_id == course.id
    ).delete(synchronize_session=False)
    db.query(UserCourseProgress).filter(
        UserCourseProgress.course_id == course.id
    ).delete(synchronize_session=False)

    db.delete(course)
    db.commit()


def delete_course_page(db: Session, page: CoursePage):
    db.query(UserPageProgress).filter(
        UserPageProgress.page_id == page.id
    ).delete(synchronize_session=False)
    db.delete(page)
    db.commit()


def delete_page_block(db: Session, block: PageBlock):
    db.delete(block)
    db.commit()
