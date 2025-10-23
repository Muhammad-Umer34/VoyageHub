from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import engine, Base, get_db
from backend import crud, schemas
from backend.auth.hashing import hash_password, verify_password
from backend.auth.jwt_handler import create_access_token

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Itinerary Planner API")

# allow front-end origin(s) — adjust in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user.password)
    db_user = crud.create_user(db, user=user, hashed_password=hashed)
    return db_user

@app.post("/auth/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses fields 'username' and 'password'
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserOut)
def read_me(current_user = Depends(lambda: None)):  # replaced below
    # placeholder (we will wire properly below)
    return {"id": 1, "email": "test@example.com"}

# Proper protected endpoint example:
from .auth.dependencies import get_current_user
@app.get("/protected", response_model=schemas.UserOut)
def protected_route(current_user = Depends(get_current_user)):
    return current_user
