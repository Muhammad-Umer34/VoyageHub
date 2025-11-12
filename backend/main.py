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
from auth.forget_password import create_forget_password_token, verify_forget_password_token
from auth.send_forget_password_email import send_forget_password_email


Base.metadata.create_all(bind=engine)

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
    verification_code = str(random.randint(100000, 999999))
    expiry_time = datetime.utcnow() + timedelta(minutes=10)

    db_user = crud.create_user(
        db,
        user=user,
        hashed_password=hashed,
        verification_code=verification_code,
        code_expiry=expiry_time
    )

    background_tasks.add_task(send_verification_email, user.email, verification_code)

    return {"message": "User registered. Verification code sent to your email."}

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

    user.is_verified = True
    user.verification_code = None
    user.code_expiry = None
    db.commit()
    db.refresh(user)
    return {"message": "Email verified successfully!"}

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

class ForgetPasswordRequest(BaseModel):
    email: str

@app.post("/auth/forget-password")
def forget_password(
    request: ForgetPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_email(db, email=request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_forget_password_token({"sub": user.email})
    reset_link = f"http://localhost:5173/reset-password?token={token}"

    background_tasks.add_task(send_forget_password_email, user.email, reset_link)

    return {"message": "Password reset email sent successfully."}


class VerifyForgetPasswordRequest(BaseModel):
    token: str

@app.post("/auth/verify-forget-password")
def verify_forget_password(request: VerifyForgetPasswordRequest):
    payload = verify_forget_password_token(request.token) 
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    return {"message": "Token is valid", "email": payload["sub"]}


class PasswordResetRequest(BaseModel):
    token: str
    new_password: str

@app.post("/auth/reset-password")
def reset_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    payload = verify_forget_password_token(request.token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = crud.get_user_by_email(db, email=payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed = hash_password(request.new_password)
    user.hashed_password = hashed
    db.commit()
    db.refresh(user)

    return {"message": "Password has been reset successfully."}
  

class TokenRefreshRequest(BaseModel):
    refresh_token: str

@app.post("/auth/refresh", response_model=schemas.Token)
def refresh_access_token(request: TokenRefreshRequest):
    payload = verify_token(request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    new_access_token = create_access_token({"sub": payload["sub"]})
    return {"access_token": new_access_token, "token_type": "bearer"}


@app.get("/me", response_model=schemas.UserOut)
def read_me(current_user=Depends(get_current_user)):
    return current_user

@app.get("/protected", response_model=schemas.UserOut)
def protected_route(current_user=Depends(get_current_user)):
    return current_user
