from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import require_admin_or_hr
from app.schemas.role import RoleCreate, RoleRead, RoleUpdate
from app.crud.roles import create_role, get_role, get_roles, update_role

router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
    dependencies=[Depends(require_admin_or_hr)],
)


@router.get("/", response_model=list[RoleRead])
def list_roles(db: Session = Depends(get_db)):
    return get_roles(db)


@router.post("/", response_model=RoleRead, status_code=201)
def create(data: RoleCreate, db: Session = Depends(get_db)):
    try:
        return create_role(db, data.name.strip())
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Role already exists")


@router.put("/{role_id}", response_model=RoleRead)
def update(role_id: int, data: RoleUpdate, db: Session = Depends(get_db)):
    role = get_role(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    try:
        return update_role(db, role, data.name.strip())
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Role already exists")
