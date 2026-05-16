from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.company import Team
from app.schemas.user import UserCreate, UserRead
from app.crud.users import create_user, get_users

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserRead)
def create(user: UserCreate, db: Session = Depends(get_db)):
    if user.team_id is not None and not db.get(Team, user.team_id):
        raise HTTPException(status_code=400, detail="Team not found")
    return create_user(db, user)


@router.get("/", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    return get_users(db)