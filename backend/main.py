from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from controllers.auth_controllers import router as auth_router
from controllers.itennary_controllers import router as itinerary_router
from websocket_manager import websocket_endpoint
from websocket_manager import get_active_users
import models 

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Itinerary Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test")
async def test():
    return {"status": "ok"}

app.include_router(auth_router)
app.include_router(itinerary_router)

@app.websocket("/ws/notifications/{user_id}")
async def websocket_route(websocket: WebSocket, user_id: int):
    await websocket_endpoint(websocket, user_id)

@app.get("/active-users")
async def active_users():
    """Return list of currently connected users"""
    users = get_active_users()
    return {"active_users": users, "count": len(users)}
