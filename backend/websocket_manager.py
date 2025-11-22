# websocket_manager.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
import json
from datetime import datetime

# WebSocket connection manager
active_connections: Dict[int, WebSocket] = {}


async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """Handle WebSocket connections"""
    await websocket.accept()
    active_connections[user_id] = websocket
    print(f"✅ User {user_id} connected to WebSocket")

    try:
        while True:
            # Keep connection alive and listen for any messages
            data = await websocket.receive_text()
            print(f"📨 Message from user {user_id}: {data}")
    except WebSocketDisconnect:
        print(f"❌ User {user_id} disconnected")
        active_connections.pop(user_id, None)
    except Exception as e:
        print(f"⚠️ Error for user {user_id}: {str(e)}")
        active_connections.pop(user_id, None)


async def send_notification(user_id: int, notification_data: dict):
    """
    Send notification to a specific user via WebSocket
    
    notification_data should include:
    - id: notification ID
    - message: notification message
    - status: 'pending', 'accepted', or 'rejected'
    - itinerary_id: (optional) related itinerary ID
    - created_at: (optional) timestamp
    """
    ws = active_connections.get(user_id)
    if ws:
        try:
            # Ensure created_at is included
            if 'created_at' not in notification_data:
                notification_data['created_at'] = datetime.utcnow().isoformat()
            
            # Send as JSON string
            await ws.send_text(json.dumps(notification_data))
            print(f"✅ Notification sent to user {user_id}: {notification_data.get('message')}")
        except Exception as e:
            print(f"⚠️ Failed to send notification to user {user_id}: {str(e)}")
            # Remove disconnected WebSocket
            active_connections.pop(user_id, None)
    else:
        print(f"⚠️ User {user_id} is not connected")