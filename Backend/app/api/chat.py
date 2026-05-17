from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.chat.connections import manager
from app.crud.messages import (
    create_message,
    get_conversation_messages,
    list_conversation_previews,
    mark_conversation_read,
    message_to_dict,
)
from app.crud.users import get_user
from app.db.models.user import User
from app.db.session import get_db
from app.db.chat_session import get_chat_db
from app.schemas.chat import (
    ConversationPartner,
    ConversationPreview,
    MessageCreate,
    MessageRead,
)

router = APIRouter(prefix="/chat", tags=["Chat"])


def _ensure_partner(db: Session, partner_id: int, current_user_id: int) -> User:
    if partner_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot chat with yourself")
    partner = get_user(db, partner_id)
    if not partner:
        raise HTTPException(status_code=404, detail="User not found")
    return partner


@router.get("/conversations", response_model=list[ConversationPreview])
def list_conversations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    chat_db: Session = Depends(get_chat_db),
):
    previews = list_conversation_previews(chat_db, user.id)
    result: list[ConversationPreview] = []

    for partner_id, last_message, unread_count in previews:
        partner = get_user(db, partner_id)
        if not partner:
            continue
        result.append(
            ConversationPreview(
                partner=ConversationPartner(
                    id=partner.id,
                    first_name=partner.first_name,
                    last_name=partner.last_name,
                ),
                last_message=MessageRead.model_validate(last_message)
                if last_message
                else None,
                unread_count=unread_count,
            )
        )

    return result


@router.get(
    "/conversations/{partner_id}/messages",
    response_model=list[MessageRead],
)
def get_messages(
    partner_id: int,
    limit: int = Query(50, ge=1, le=100),
    before_id: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    chat_db: Session = Depends(get_chat_db),
):
    _ensure_partner(db, partner_id, user.id)
    messages = get_conversation_messages(
        chat_db,
        user.id,
        partner_id,
        limit=limit,
        before_id=before_id,
    )
    return [MessageRead.model_validate(m) for m in reversed(messages)]


@router.post(
    "/conversations/{partner_id}/messages",
    response_model=MessageRead,
    status_code=201,
)
async def send_message(
    partner_id: int,
    body: MessageCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    chat_db: Session = Depends(get_chat_db),
):
    _ensure_partner(db, partner_id, user.id)
    message = create_message(
        chat_db,
        sender_id=user.id,
        recipient_id=partner_id,
        content=body.content,
    )
    await manager.send_to_user(
        partner_id,
        {"type": "message", **message_to_dict(message)},
    )
    return MessageRead.model_validate(message)


@router.patch("/conversations/{partner_id}/read")
def mark_read(
    partner_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    chat_db: Session = Depends(get_chat_db),
):
    _ensure_partner(db, partner_id, user.id)
    count = mark_conversation_read(chat_db, user.id, partner_id)
    return {"marked_read": count}
