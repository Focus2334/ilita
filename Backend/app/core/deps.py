from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt, JWTError

from app.core.security import SECRET_KEY, ALGORITHM
from app.db.models.user import User
from app.db.session import get_db
from sqlalchemy.orm import Session

auth_scheme = HTTPBearer()


def get_current_user(
    token=Depends(auth_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == int(user_id)).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")