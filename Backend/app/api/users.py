from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.company import Team
from app.db.models.role import Role
from app.core.deps import require_admin_or_hr
from app.schemas.user import UserCreate, UserRead
from app.schemas.role import RoleRead, UserRoleAssign
from app.crud.users import (
    add_role_to_user,
    create_user,
    delete_user,
    get_user,
    get_users,
    remove_role_from_user,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserRead, dependencies=[Depends(require_admin_or_hr)])
def create(user: UserCreate, db: Session = Depends(get_db)):
    if user.team_id is not None and not db.get(Team, user.team_id):
        raise HTTPException(status_code=400, detail="Team not found")
    return create_user(db, user)


@router.get("/", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    return get_users(db)


@router.delete(
    "/{user_id}",
    status_code=204,
    dependencies=[Depends(require_admin_or_hr)],
)
def remove_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    delete_user(db, user)
    return Response(status_code=204)


@router.get(
    "/{user_id}/roles",
    response_model=list[RoleRead],
    dependencies=[Depends(require_admin_or_hr)],
)
def list_user_roles(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.roles


@router.post(
    "/{user_id}/roles",
    response_model=list[RoleRead],
    dependencies=[Depends(require_admin_or_hr)],
)
def assign_role_to_user(
    user_id: int,
    data: UserRoleAssign,
    db: Session = Depends(get_db),
):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.get(Role, data.role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    add_role_to_user(db, user, role)
    return user.roles


@router.delete(
    "/{user_id}/roles/{role_id}",
    response_model=list[RoleRead],
    dependencies=[Depends(require_admin_or_hr)],
)
def unassign_role_from_user(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    remove_role_from_user(db, user, role)
    return user.roles