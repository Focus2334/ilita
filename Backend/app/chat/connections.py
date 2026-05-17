from typing import Dict, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(user_id, set()).add(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        connections = self.active_connections.get(user_id)
        if not connections:
            return
        connections.discard(websocket)
        if not connections:
            del self.active_connections[user_id]

    async def send_to_user(self, user_id: int, data: dict):
        for ws in list(self.active_connections.get(user_id, ())):
            try:
                await ws.send_json(data)
            except Exception:
                self.disconnect(user_id, ws)


manager = ConnectionManager()
