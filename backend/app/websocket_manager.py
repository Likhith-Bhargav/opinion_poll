import json
from typing import List, Dict
from fastapi import WebSocket
from app.schemas import WSMessage

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: WSMessage):
        message_data = message.model_dump()
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message_data))
            except:
                self.active_connections.remove(connection)

    async def broadcast_poll_update(self, poll_id: int, update_type: str, data: dict):
        message = WSMessage(
            type=f"poll_{update_type}",
            data={"poll_id": poll_id, **data}
        )
        await self.broadcast(message)

manager = ConnectionManager()
