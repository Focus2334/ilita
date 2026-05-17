from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.chat.connections import manager
from app.chat.handler import handle_incoming_message
from app.core.deps import resolve_user_id_from_token
from app.db.chat_session import ChatSessionLocal
from app.db.session import SessionLocal

router = APIRouter(tags=["Chat WebSocket"])


@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket, token: str = Query(...)):
    lms_db = SessionLocal()
    chat_db = ChatSessionLocal()
    user_id: int | None = None

    try:
        user_id = resolve_user_id_from_token(token, lms_db)
        if user_id is None:
            await websocket.close(code=4001, reason="Unauthorized")
            return

        await manager.connect(user_id, websocket)

        while True:
            data = await websocket.receive_json()
            await handle_incoming_message(
                user_id,
                data,
                websocket,
                lms_db,
                chat_db,
            )
    except WebSocketDisconnect:
        if user_id is not None:
            manager.disconnect(user_id, websocket)
    finally:
        if user_id is not None:
            manager.disconnect(user_id, websocket)
        chat_db.close()
        lms_db.close()
