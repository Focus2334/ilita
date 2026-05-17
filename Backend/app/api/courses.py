from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.core.deps import get_current_user, require_admin_or_hr
from app.schemas.course import (
    CourseCreate,
    CourseDetailRead,
    CoursePageCreate,
    CoursePageRead,
    CourseRead,
    PageBlockCreate,
    PageBlockRead,
)
from app.schemas.progress import CourseProgressRead
from app.crud.courses import (
    create_course,
    create_course_page,
    create_page_block,
    delete_course,
    delete_course_page,
    delete_page_block,
    get_course,
    get_course_page,
    get_page_block,
    get_courses,
)
from app.crud.progress import (
    build_course_progress,
    mark_page_viewed,
    start_course,
)

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("/", response_model=CourseRead, dependencies=[Depends(require_admin_or_hr)])
def create(course: CourseCreate, db: Session = Depends(get_db)):
    return create_course(db, course)


@router.get("/", response_model=list[CourseRead])
def list_courses(db: Session = Depends(get_db)):
    return get_courses(db)


def _sort_course_tree(course):
    course.pages.sort(key=lambda page: page.position)
    for page in course.pages:
        page.blocks.sort(key=lambda block: block.position)
    return course


@router.post("/{course_id}/start", response_model=CourseProgressRead, tags=["Courses"])
def start_course_endpoint(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    start_course(db, current_user, course)
    return build_course_progress(db, current_user.id, course)


@router.get("/{course_id}/progress", response_model=CourseProgressRead, tags=["Courses"])
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return build_course_progress(db, current_user.id, course)


@router.post(
    "/{course_id}/pages/{page_id}/view",
    response_model=CourseProgressRead,
    tags=["Courses"],
)
def view_page(
    course_id: int,
    page_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    page = get_course_page(db, course_id, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    mark_page_viewed(db, current_user, course, page_id)
    return build_course_progress(db, current_user.id, course)


@router.get("/{course_id}", response_model=CourseDetailRead)
def get_course_detail(course_id: int, db: Session = Depends(get_db)):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return _sort_course_tree(course)


@router.delete(
    "/{course_id}",
    status_code=204,
    dependencies=[Depends(require_admin_or_hr)],
)
def remove_course(course_id: int, db: Session = Depends(get_db)):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    delete_course(db, course)
    return Response(status_code=204)


@router.post(
    "/{course_id}/pages",
    response_model=CoursePageRead,
    status_code=201,
    dependencies=[Depends(require_admin_or_hr)],
)
def create_page(
    course_id: int,
    data: CoursePageCreate,
    db: Session = Depends(get_db),
):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return create_course_page(db, course, data)


@router.get("/{course_id}/pages", response_model=list[CoursePageRead])
def list_pages(course_id: int, db: Session = Depends(get_db)):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return sorted(course.pages, key=lambda page: page.position)


@router.delete(
    "/{course_id}/pages/{page_id}",
    status_code=204,
    dependencies=[Depends(require_admin_or_hr)],
)
def remove_page(course_id: int, page_id: int, db: Session = Depends(get_db)):
    page = get_course_page(db, course_id, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    delete_course_page(db, page)
    return Response(status_code=204)


@router.post(
    "/{course_id}/pages/{page_id}/blocks",
    response_model=PageBlockRead,
    status_code=201,
    dependencies=[Depends(require_admin_or_hr)],
)
def create_block(
    course_id: int,
    page_id: int,
    data: PageBlockCreate,
    db: Session = Depends(get_db),
):
    page = get_course_page(db, course_id, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return create_page_block(db, page, data)


@router.get(
    "/{course_id}/pages/{page_id}/blocks",
    response_model=list[PageBlockRead],
)
def list_blocks(course_id: int, page_id: int, db: Session = Depends(get_db)):
    page = get_course_page(db, course_id, page_id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return sorted(page.blocks, key=lambda block: block.position)


@router.delete(
    "/{course_id}/pages/{page_id}/blocks/{block_id}",
    status_code=204,
    dependencies=[Depends(require_admin_or_hr)],
)
def remove_block(
    course_id: int,
    page_id: int,
    block_id: int,
    db: Session = Depends(get_db),
):
    block = get_page_block(db, course_id, page_id, block_id)
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    delete_page_block(db, block)
    return Response(status_code=204)
