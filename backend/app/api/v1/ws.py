import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.security import decode_token

router = APIRouter()

# In-memory connection manager (use Redis pub/sub for production multi-instance)
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, meeting_id: str):
        await websocket.accept()
        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = []
        self.active_connections[meeting_id].append(websocket)

    def disconnect(self, websocket: WebSocket, meeting_id: str):
        if meeting_id in self.active_connections:
            self.active_connections[meeting_id].remove(websocket)
            if not self.active_connections[meeting_id]:
                del self.active_connections[meeting_id]

    async def broadcast(self, meeting_id: str, message: dict):
        if meeting_id in self.active_connections:
            for connection in self.active_connections[meeting_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/ws/meeting/{meeting_id}")
async def websocket_meeting(websocket: WebSocket, meeting_id: str):
    """
    WebSocket endpoint for real-time meeting transcription and updates.

    Clients can send:
    - {"type": "transcript_chunk", "text": "...", "speaker": "...", "timestamp": ...}
    - {"type": "ping"}

    Server broadcasts:
    - {"type": "transcript_update", "segment": {...}}
    - {"type": "action_item_added", "item": {...}}
    - {"type": "summary_update", "summary": {...}}
    - {"type": "participant_joined", "user": {...}}
    - {"type": "pong"}
    """
    # Optional: authenticate via query param token
    token = websocket.query_params.get("token")
    if token:
        payload = decode_token(token)
        if not payload:
            await websocket.close(code=4001, reason="Invalid token")
            return

    await manager.connect(websocket, meeting_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
                continue

            msg_type = message.get("type")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif msg_type == "transcript_chunk":
                # Broadcast the transcript chunk to all connected clients
                await manager.broadcast(meeting_id, {
                    "type": "transcript_update",
                    "segment": {
                        "text": message.get("text", ""),
                        "speaker": message.get("speaker", "Unknown"),
                        "timestamp": message.get("timestamp", 0),
                    },
                })

            elif msg_type == "action_item_update":
                await manager.broadcast(meeting_id, {
                    "type": "action_item_added",
                    "item": message.get("item", {}),
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket, meeting_id)
    except Exception:
        manager.disconnect(websocket, meeting_id)
