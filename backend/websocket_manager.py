from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
import json
from datetime import datetime

active_connections: Dict[int, WebSocket] = {}


async def broadcast_active_users():
    active_user_ids = list(active_connections.keys())
    message = {
        "type": "active_users_update",
        "active_users": active_user_ids,
        "count": len(active_user_ids),
    }
    disconnected = []
    for user_id, ws in active_connections.items():
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            disconnected.append(user_id)
    for user_id in disconnected:
        active_connections.pop(user_id, None)


async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    active_connections[user_id] = websocket
    print(f"✅ User {user_id} connected to WebSocket")
    await broadcast_active_users()

    try:
        while True:
            data = await websocket.receive_text()
            print(f"📨 Message from user {user_id}: {data}")
    except WebSocketDisconnect:
        print(f"❌ User {user_id} disconnected")
        active_connections.pop(user_id, None)
        await broadcast_active_users()
    except Exception as e:
        print(f"⚠️ Error for user {user_id}: {str(e)}")
        active_connections.pop(user_id, None)
        await broadcast_active_users()


async def send_notification(user_id: int, notification_data: dict):
    ws = active_connections.get(user_id)
    if ws:
        try:
            if 'created_at' not in notification_data:
                notification_data['created_at'] = datetime.utcnow().isoformat()
            await ws.send_text(json.dumps(notification_data))
            print(f"✅ Notification sent to user {user_id}: {notification_data.get('message')}")
        except Exception as e:
            print(f"⚠️ Failed to send notification to user {user_id}: {str(e)}")
            active_connections.pop(user_id, None)
            await broadcast_active_users()  
    else:
        print(f"⚠️ User {user_id} is not connected")


def get_active_users():
    return list(active_connections.keys())


async def broadcast_chat_message(message_data: dict):

    message = {
        "type": "chat_message",
        **message_data
    }
    disconnected = []
    for user_id, ws in active_connections.items():
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            disconnected.append(user_id)
    for user_id in disconnected:
        active_connections.pop(user_id, None)
