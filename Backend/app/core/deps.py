# app/core/deps.py

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.db.models.user import User
from app.core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

PRIVILEGED_ROLES = frozenset({"admin", "hr"})


def _normalize_token(raw: str) -> str:
    token = raw.strip().strip('"').strip("'")
    if token.lower().startswith("bearer "):
        token = token[7:].strip()
    return token


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(
            _normalize_token(token),
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"leeway": 10},
        )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = (
            db.query(User)
            .options(joinedload(User.roles))
            .filter(User.id == int(user_id))
            .first()
        )

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")


def resolve_user_id_from_token(token: str, db: Session) -> int | None:
    """Проверка JWT и существования пользователя в основной БД (для WebSocket)."""
    try:
        payload = jwt.decode(
            _normalize_token(token),
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"leeway": 10},
        )
        user_id = payload.get("sub")
        if user_id is None:
            return None
        uid = int(user_id)
        if not db.get(User, uid):
            return None
        return uid
    except (JWTError, ValueError, TypeError):
        return None


def require_admin_or_hr(user: User = Depends(get_current_user)) -> User:
    role_names = {role.name for role in user.roles}
    if not role_names & PRIVILEGED_ROLES:
        raise HTTPException(status_code=403, detail="Admin or HR role required")
    return user


require_auth = [Depends(get_current_user)]
