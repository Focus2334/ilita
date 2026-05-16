from sqlalchemy.orm import Session

from app.db.models.role import Role


def get_roles(db: Session):
    return db.query(Role).order_by(Role.id).all()


def get_role(db: Session, role_id: int):
    return db.get(Role, role_id)


def create_role(db: Session, name: str):
    role = Role(name=name)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


def update_role(db: Session, role: Role, name: str):
    role.name = name
    db.commit()
    db.refresh(role)
    return role
