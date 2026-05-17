from fastapi import WebSocket
from sqlalchemy.orm import Session

from app.chat.connections import manager
from app.crud.messages import create_message, message_to_dict
from app.crud.users import get_user


async def handle_incoming_message(
    sender_id: int,
    data: dict,
    websocket: WebSocket,
    lms_db: Session,
    chat_db: Session,
):
    recipient_id = data.get("recipient_id")
    content = (data.get("content") or "").strip()

    if not recipient_id or not content:
        await websocket.send_json({"error": "recipient_id and content required"})
        return

    try:
        recipient_id = int(recipient_id)
    except (TypeError, ValueError):
        await websocket.send_json({"error": "invalid recipient_id"})
        return

    if recipient_id == sender_id:
        await websocket.send_json({"error": "cannot message yourself"})
        return

    if not get_user(lms_db, recipient_id):
        await websocket.send_json({"error": "recipient not found"})
        return

    message = create_message(
        chat_db,
        sender_id=sender_id,
        recipient_id=recipient_id,
        content=content,
    )
    payload = {"type": "message", **message_to_dict(message)}

    await manager.send_to_user(recipient_id, payload)
    await websocket.send_json({"type": "sent", "message_id": message.id})
