from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.models.course import Course
from app.db.models.progress import UserCourseProgress, UserPageProgress
from app.db.models.user import User
from app.db.models.user_course_assignment import UserCourseAssignment
from app.crud.courses import get_course


def _utcnow():
    return datetime.now(timezone.utc)


def get_course_progress_row(db: Session, user_id: int, course_id: int):
    return (
        db.query(UserCourseProgress)
        .filter(
            UserCourseProgress.user_id == user_id,
            UserCourseProgress.course_id == course_id,
        )
        .first()
    )


def get_or_create_course_progress(db: Session, user_id: int, course_id: int):
    progress = get_course_progress_row(db, user_id, course_id)
    if progress:
        return progress

    progress = UserCourseProgress(
        user_id=user_id,
        course_id=course_id,
        status="not_started",
        progress_percent=0,
    )
    db.add(progress)
    db.flush()
    return progress


def _sync_assignment_status(db: Session, user_id: int, course_id: int, status: str):
    assignment = (
        db.query(UserCourseAssignment)
        .filter(
            UserCourseAssignment.user_id == user_id,
            UserCourseAssignment.course_id == course_id,
        )
        .first()
    )
    if not assignment:
        return

    assignment.status = status
    if status == "in_progress" and assignment.started_at is None:
        assignment.started_at = _utcnow()
    if status == "completed":
        assignment.completed_at = _utcnow()


def recalculate_course_progress(db: Session, user_id: int, course: Course):
    progress = get_or_create_course_progress(db, user_id, course.id)
    total_pages = len(course.pages)

    if total_pages == 0:
        progress.progress_percent = 0
    else:
        page_ids = [page.id for page in course.pages]
        viewed_count = (
            db.query(UserPageProgress)
            .filter(
                UserPageProgress.user_id == user_id,
                UserPageProgress.page_id.in_(page_ids),
                UserPageProgress.viewed.is_(True),
            )
            .count()
        )
        progress.progress_percent = int(viewed_count / total_pages * 100)

    if progress.progress_percent == 100:
        progress.status = "completed"
        progress.completed_at = progress.completed_at or _utcnow()
        _sync_assignment_status(db, user_id, course.id, "completed")
    elif progress.progress_percent > 0:
        progress.status = "in_progress"
        progress.started_at = progress.started_at or _utcnow()
        _sync_assignment_status(db, user_id, course.id, "in_progress")
    else:
        progress.status = "not_started"
        progress.completed_at = None

    return progress


def start_course(db: Session, user: User, course: Course):
    progress = get_or_create_course_progress(db, user.id, course.id)

    if progress.status == "not_started":
        progress.status = "in_progress"
        progress.started_at = _utcnow()
        _sync_assignment_status(db, user.id, course.id, "in_progress")

    db.commit()
    db.refresh(progress)
    return progress


def mark_page_viewed(db: Session, user: User, course: Course, page_id: int):
    page_progress = (
        db.query(UserPageProgress)
        .filter(
            UserPageProgress.user_id == user.id,
            UserPageProgress.page_id == page_id,
        )
        .first()
    )

    if page_progress:
        page_progress.viewed = True
    else:
        db.add(
            UserPageProgress(
                user_id=user.id,
                page_id=page_id,
                viewed=True,
            )
        )

    recalculate_course_progress(db, user.id, course)
    db.commit()


def build_course_progress(db: Session, user_id: int, course: Course):
    progress = get_course_progress_row(db, user_id, course.id)

    page_ids = [page.id for page in course.pages]
    viewed_by_page: dict[int, bool] = {}
    if page_ids:
        rows = (
            db.query(UserPageProgress)
            .filter(
                UserPageProgress.user_id == user_id,
                UserPageProgress.page_id.in_(page_ids),
            )
            .all()
        )
        viewed_by_page = {row.page_id: row.viewed for row in rows}

    pages = [
        {
            "page_id": page.id,
            "title": page.title,
            "position": page.position,
            "viewed": viewed_by_page.get(page.id, False),
        }
        for page in sorted(course.pages, key=lambda item: item.position)
    ]

    return {
        "course_id": course.id,
        "course_title": course.title,
        "status": progress.status if progress else "not_started",
        "progress_percent": progress.progress_percent if progress else 0,
        "started_at": progress.started_at if progress else None,
        "completed_at": progress.completed_at if progress else None,
        "pages": pages,
    }


def get_user_courses_progress(db: Session, user_id: int):
    rows = (
        db.query(UserCourseProgress, Course)
        .join(Course, Course.id == UserCourseProgress.course_id)
        .filter(UserCourseProgress.user_id == user_id)
        .order_by(UserCourseProgress.id.desc())
        .all()
    )

    return [
        {
            "course_id": course.id,
            "course_title": course.title,
            "status": progress.status,
            "progress_percent": progress.progress_percent,
            "started_at": progress.started_at,
            "completed_at": progress.completed_at,
        }
        for progress, course in rows
    ]
