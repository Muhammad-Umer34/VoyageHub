# main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from controllers.auth_controllers import router as auth_router
from controllers.itennary_controllers import router as itinerary_router
from websocket_manager import websocket_endpoint

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Itinerary Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ],
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