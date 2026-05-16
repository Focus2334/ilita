from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserRead
from app.crud.users import create_user, get_users

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserRead)
def create(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@router.get("/", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    return get_users(db)