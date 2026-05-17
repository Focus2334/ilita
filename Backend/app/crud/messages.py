from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.db.models.message import Message


def create_message(
    chat_db: Session,
    *,
    sender_id: int,
    recipient_id: int,
    content: str,
) -> Message:
    message = Message(
        sender_id=sender_id,
        recipient_id=recipient_id,
        content=content.strip(),
    )
    chat_db.add(message)
    chat_db.commit()
    chat_db.refresh(message)
    return message


def get_message(chat_db: Session, message_id: int) -> Message | None:
    return chat_db.get(Message, message_id)


def get_conversation_messages(
    chat_db: Session,
    user_id: int,
    partner_id: int,
    *,
    limit: int = 50,
    before_id: int | None = None,
) -> list[Message]:
    query = chat_db.query(Message).filter(
        or_(
            and_(Message.sender_id == user_id, Message.recipient_id == partner_id),
            and_(Message.sender_id == partner_id, Message.recipient_id == user_id),
        )
    )

    if before_id is not None:
        anchor = chat_db.get(Message, before_id)
        if anchor is not None:
            query = query.filter(Message.timestamp < anchor.timestamp)

    return (
        query.order_by(Message.timestamp.desc())
        .limit(min(limit, 100))
        .all()
    )


def list_conversation_previews(chat_db: Session, user_id: int) -> list[tuple[int, Message | None, int]]:
    """partner_id, last_message, unread_count (входящие непрочитанные)."""
    messages = (
        chat_db.query(Message)
        .filter(
            or_(Message.sender_id == user_id, Message.recipient_id == user_id)
        )
        .order_by(Message.timestamp.desc())
        .all()
    )

    last_by_partner: dict[int, Message] = {}
    unread_by_partner: dict[int, int] = {}

    for msg in messages:
        partner_id = msg.recipient_id if msg.sender_id == user_id else msg.sender_id

        if partner_id not in last_by_partner:
            last_by_partner[partner_id] = msg

        if msg.recipient_id == user_id and not msg.is_read:
            unread_by_partner[partner_id] = unread_by_partner.get(partner_id, 0) + 1

    partner_ids = set(last_by_partner) | set(unread_by_partner)
    return [
        (
            partner_id,
            last_by_partner.get(partner_id),
            unread_by_partner.get(partner_id, 0),
        )
        for partner_id in sorted(
            partner_ids,
            key=lambda pid: last_by_partner[pid].timestamp if pid in last_by_partner else 0,
            reverse=True,
        )
    ]


def mark_conversation_read(chat_db: Session, user_id: int, partner_id: int) -> int:
    updated = (
        chat_db.query(Message)
        .filter(
            Message.sender_id == partner_id,
            Message.recipient_id == user_id,
            Message.is_read.is_(False),
        )
        .update({Message.is_read: True}, synchronize_session=False)
    )
    chat_db.commit()
    return updated


def message_to_dict(message: Message) -> dict:
    return {
        "id": message.id,
        "sender_id": message.sender_id,
        "recipient_id": message.recipient_id,
        "content": message.content,
        "timestamp": message.timestamp.isoformat(),
        "is_read": message.is_read,
    }
