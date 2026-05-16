from sqlalchemy.orm import Session
from app.db.models.user import User
from app.schemas.user import UserCreate


def create_user(db: Session, data: UserCreate):
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_users(db: Session):
    return db.query(User).all()