# app/crud/users.py

from sqlalchemy.orm import Session, joinedload

from app.db.models.user import User
from app.db.models.role import Role
from app.db.models.progress import UserCourseProgress, UserPageProgress
from app.db.models.user_course_assignment import UserCourseAssignment
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


def get_user(db: Session, user_id: int):
    return (
        db.query(User)
        .options(joinedload(User.roles))
        .filter(User.id == user_id)
        .first()
    )


def add_role_to_user(db: Session, user: User, role: Role):
    if role not in user.roles:
        user.roles.append(role)
        db.commit()
        db.refresh(user)
    return user


def remove_role_from_user(db: Session, user: User, role: Role):
    if role in user.roles:
        user.roles.remove(role)
        db.commit()
        db.refresh(user)
    return user


def delete_user(db: Session, user: User):
    db.query(User).filter(User.manager_id == user.id).update(
        {User.manager_id: None},
        synchronize_session=False,
    )
    db.query(UserCourseAssignment).filter(
        UserCourseAssignment.user_id == user.id
    ).delete(synchronize_session=False)
    db.query(UserCourseProgress).filter(
        UserCourseProgress.user_id == user.id
    ).delete(synchronize_session=False)
    db.query(UserPageProgress).filter(
        UserPageProgress.user_id == user.id
    ).delete(synchronize_session=False)

    user.roles.clear()
    db.delete(user)
    db.commit()