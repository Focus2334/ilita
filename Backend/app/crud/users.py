# app/crud/users.py

from sqlalchemy.orm import Session
from app.db.models.user import User
from app.core.security import hash_password


def create_user(db: Session, user_data):
    user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),  # 🔥
        team_id=user_data.team_id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def get_users(db: Session):
    return db.query(User).all()