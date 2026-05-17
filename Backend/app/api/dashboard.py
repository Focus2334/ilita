from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.dashboard import DashboardRead
from app.services.dashboard_mapper import build_dashboard_payload

router = APIRouter(prefix="/me", tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardRead)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return build_dashboard_payload(db, current_user)
