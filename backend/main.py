from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import crud, schemas
from auth.hashing import hash_password, verify_password
from auth.jwt_handler import create_access_token, create_refresh_token, verify_token
from auth.dependencies import get_current_user
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
from auth.send_emails import send_verification_email

# ===========================================
# DATABASE INITIALIZATION
# ===========================================
Base.metadata.create_all(bind=engine)

# ===========================================
# APP CONFIGURATION
# ===========================================
app = FastAPI(title="Itinerary Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test")
async def test():
    return {"status": "ok"}

# ===========================================
# USER REGISTRATION WITH EMAIL VERIFICATION
# ===========================================
@app.post("/auth/register")
def register(
    user: schemas.UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)

    # Generate verification code and expiry
    verification_code = str(random.randint(100000, 999999))
    expiry_time = datetime.utcnow() + timedelta(minutes=10)

    # Create user (unverified)
    db_user = crud.create_user(
        db,
        user=user,
        hashed_password=hashed,
        verification_code=verification_code,
        code_expiry=expiry_time
    )

    # Send email in the background
    background_tasks.add_task(send_verification_email, user.email, verification_code)

    return {"message": "User registered. Verification code sent to your email."}

# ===========================================
# VERIFY EMAIL ENDPOINT
# ===========================================
class EmailVerificationRequest(BaseModel):
    email: str
    code: str

@app.post("/auth/verify-email")
def verify_email(request: EmailVerificationRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")

    if user.verification_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    if datetime.utcnow() > user.code_expiry:
        raise HTTPException(status_code=400, detail="Verification code expired")

    # Mark user as verified
    user.is_verified = True
    user.verification_code = None
    user.code_expiry = None
    db.commit()
    db.refresh(user)
    return {"message": "Email verified successfully!"}

# ===========================================
# RESEND VERIFICATION CODE
# ===========================================
class ResendCodeRequest(BaseModel):
    email: str

@app.post("/auth/resend-code")
def resend_code(
    request: ResendCodeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")

    new_code = str(random.randint(100000, 999999))
    new_expiry = datetime.utcnow() + timedelta(minutes=10)

    user.verification_code = new_code
    user.code_expiry = new_expiry
    db.commit()
    db.refresh(user)

    background_tasks.add_task(send_verification_email, user.email, new_code)
    return {"message": "A new verification code has been sent to your email."}

# ===========================================
# LOGIN (ONLY FOR VERIFIED USERS)
# ===========================================
@app.post("/auth/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify your email first.")

    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

# ===========================================
# REFRESH TOKEN ENDPOINT
# ===========================================
class TokenRefreshRequest(BaseModel):
    refresh_token: str

@app.post("/auth/refresh", response_model=schemas.Token)
def refresh_access_token(request: TokenRefreshRequest):
    payload = verify_token(request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    new_access_token = create_access_token({"sub": payload["sub"]})
    return {"access_token": new_access_token, "token_type": "bearer"}

# ===========================================
# USER INFO AND PROTECTED ROUTE
# ===========================================
@app.get("/me", response_model=schemas.UserOut)
def read_me(current_user=Depends(get_current_user)):
    return current_user

@app.get("/protected", response_model=schemas.UserOut)
def protected_route(current_user=Depends(get_current_user)):
    return current_user
