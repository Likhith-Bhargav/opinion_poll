from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging

from app.websocket_manager import manager

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Handle any client-specific messages here if needed
                logger.info(f"Received message: {message}")
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected")
