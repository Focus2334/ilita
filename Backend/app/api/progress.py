from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.core.deps import get_current_user
from app.schemas.progress import MyCourseProgressRead
from app.crud.progress import get_user_courses_progress

router = APIRouter(prefix="/me", tags=["Learning"])


@router.get("/courses", response_model=list[MyCourseProgressRead])
def my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_courses_progress(db, current_user.id)