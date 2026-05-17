import re

from sqlalchemy.orm import Session, joinedload

from app.db.models.course import Course, CoursePage
from app.db.models.progress import UserCourseProgress, UserPageProgress
from app.db.models.user import User
from app.services.dashboard_defaults import (
    DEFAULT_COURSE_CATEGORY,
    DEFAULT_COURSE_LOCKED,
    DEFAULT_COURSE_MANDATORY,
    DEFAULT_EVENTS,
    DEFAULT_SURVEYS,
    DEFAULT_USER_GAMIFICATION,
)

TASK_TYPES = frozenset({"video", "article", "task", "test"})
STATUS_TAGS = {
    "completed": "Завершён",
    "in_progress": "В процессе",
    "available": "Доступен",
    "locked": "Заблокирован",
}


def parse_duration_days(duration: str | None, fallback: int = 7) -> int:
    if not duration:
        return fallback
    match = re.search(r"(\d+)", duration)
    if not match:
        return fallback
    value = int(match.group(1))
    if "час" in duration.lower():
        return max(1, (value + 1) // 2)
    return max(1, value)


def duration_label(days: int) -> str:
    hours = max(1, days * 2)
    if hours == 1:
        return "1 час"
    if 2 <= hours <= 4:
        return f"{hours} часа"
    return f"{hours} часов"


def xp_for_course(duration_days: int) -> int:
    return max(100, duration_days * 15)


def _progress_maps(db: Session, user_id: int, course: Course):
    progress_row = (
        db.query(UserCourseProgress)
        .filter(
            UserCourseProgress.user_id == user_id,
            UserCourseProgress.course_id == course.id,
        )
        .first()
    )

    page_ids = [page.id for page in course.pages]
    viewed_pages: dict[int, bool] = {}
    if page_ids:
        rows = (
            db.query(UserPageProgress)
            .filter(
                UserPageProgress.user_id == user_id,
                UserPageProgress.page_id.in_(page_ids),
            )
            .all()
        )
        viewed_pages = {row.page_id: row.viewed for row in rows}

    return progress_row, viewed_pages


def _page_progress(page, viewed_pages: dict[int, bool]) -> int:
    if viewed_pages.get(page.id):
        return 100
    blocks = sorted(page.blocks, key=lambda item: item.position)
    if not blocks:
        return 0
    done = sum(
        1
        for block in blocks
        if (block.content or {}).get("done") or viewed_pages.get(page.id)
    )
    return int(done / len(blocks) * 100) if blocks else 0


def _stage_status(page_index: int, current_index: int | None, page_progress: int) -> str:
    if current_index is None:
        return "locked"
    if page_index < current_index:
        return "completed"
    if page_index == current_index:
        return "current"
    if page_progress >= 100:
        return "completed"
    return "locked"


def _build_stages(course: Course, viewed_pages: dict[int, bool]):
    pages = sorted(course.pages, key=lambda item: item.position)
    if not pages:
        return []

    progresses = [_page_progress(page, viewed_pages) for page in pages]
    current_index = next(
        (idx for idx, pct in enumerate(progresses) if pct < 100),
        len(pages) - 1,
    )

    stages = []
    for index, page in enumerate(pages):
        blocks = sorted(page.blocks, key=lambda item: item.position)
        status = _stage_status(index, current_index, progresses[index])
        tasks = [
            {
                "id": str(block.id),
                "title": (block.content or {}).get("title")
                or (block.content or {}).get("text")
                or f"{block.type.capitalize()} #{block.position}",
                "type": block.type if block.type in TASK_TYPES else "article",
                "done": viewed_pages.get(page.id, False)
                or (block.content or {}).get("done", False),
            }
            for block in blocks
        ]
        stages.append(
            {
                "id": str(page.id),
                "title": page.title,
                "progress": progresses[index],
                "status": status,
                **({"tasks": tasks} if tasks else {}),
            }
        )
    return stages


def _ui_status(progress_row, locked: bool) -> str:
    if locked:
        return "locked"
    if not progress_row or progress_row.status == "not_started":
        return "available"
    if progress_row.status == "completed" or progress_row.progress_percent >= 100:
        return "completed"
    return "in_progress"


def _build_tags(*, mandatory: bool, category: str, ui_status: str) -> list[str]:
    tags: list[str] = []
    if mandatory:
        tags.append("Обязательный")
    if ui_status in STATUS_TAGS:
        tags.append(STATUS_TAGS[ui_status])
    if category and category not in tags:
        tags.append(category)
    return tags


def map_course_for_user(
    course: Course,
    *,
    progress_row: UserCourseProgress | None,
    viewed_pages: dict[int, bool],
    category: str = DEFAULT_COURSE_CATEGORY,
    mandatory: bool = DEFAULT_COURSE_MANDATORY,
    locked: bool = DEFAULT_COURSE_LOCKED,
    unlock_requirement: str | None = None,
) -> dict:
    pages = sorted(course.pages, key=lambda item: item.position)
    total_stages = len(pages) or 3
    progress_percent = progress_row.progress_percent if progress_row else 0
    ui_status = _ui_status(progress_row, locked)

    stages = _build_stages(course, viewed_pages)
    completed_stages = sum(1 for stage in stages if stage["status"] == "completed")
    current_stage = completed_stages + 1 if ui_status == "in_progress" else completed_stages
    if ui_status == "completed":
        current_stage = total_stages
    current_stage = min(current_stage, total_stages)

    duration_days = course.duration_days or 7
    xp = xp_for_course(duration_days)

    completed_at = progress_row.completed_at if progress_row else None
    completed_date = completed_at.strftime("%d.%m.%Y") if completed_at else None

    return {
        "id": str(course.id),
        "title": course.title,
        "description": course.description or "",
        "category": category,
        "mandatory": mandatory,
        "duration": duration_label(duration_days),
        "xp": xp,
        "totalStages": total_stages,
        "currentStage": current_stage,
        "progress": progress_percent,
        "status": ui_status,
        "locked": locked,
        **({"unlockRequirement": unlock_requirement} if unlock_requirement else {}),
        "tags": _build_tags(mandatory=mandatory, category=category, ui_status=ui_status),
        "stages": stages,
        **({"completedDate": completed_date} if completed_date else {}),
    }


def _compute_user_xp(courses: list[dict]) -> int:
    total = 0
    for course in courses:
        total += round(course["xp"] * course["progress"] / 100)
    return total


def _level_from_xp(xp: int) -> tuple[int, int]:
    thresholds = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4500, 5500]
    level = 1
    for index, threshold in enumerate(thresholds):
        if xp >= threshold:
            level = index + 1
    next_threshold = thresholds[level] if level < len(thresholds) else thresholds[-1] + 1000
    return level, next_threshold


def map_user_profile(user: User, courses: list[dict]) -> dict:
    gamification = DEFAULT_USER_GAMIFICATION.copy()
    xp = _compute_user_xp(courses)
    level, xp_to_next = _level_from_xp(xp)
    gamification.update(
        {
            "xp": xp,
            "level": level,
            "xpToNext": xp_to_next,
            "achievements": min(12, len([c for c in courses if c["progress"] >= 100])),
        }
    )

    return {
        "name": f"{user.first_name} {user.last_name}".strip(),
        "initials": f"{user.first_name[:1]}{user.last_name[:1]}".upper(),
        "email": user.email,
        **gamification,
    }


def build_dashboard_payload(db: Session, user: User) -> dict:
    courses_db = (
        db.query(Course)
        .options(joinedload(Course.pages).joinedload(CoursePage.blocks))
        .order_by(Course.id)
        .all()
    )

    courses: list[dict] = []
    for course in courses_db:
        progress_row, viewed_pages = _progress_maps(db, user.id, course)
        courses.append(
            map_course_for_user(
                course,
                progress_row=progress_row,
                viewed_pages=viewed_pages,
            )
        )

    return {
        "user": map_user_profile(user, courses),
        "courses": courses,
        "surveys": [dict(item) for item in DEFAULT_SURVEYS],
        "events": [dict(item) for item in DEFAULT_EVENTS],
    }


def admin_course_to_create(data: dict) -> dict:
    duration_days = parse_duration_days(data.get("duration"))
    return {
        "title": data["title"],
        "description": data.get("description"),
        "duration_days": duration_days,
    }
