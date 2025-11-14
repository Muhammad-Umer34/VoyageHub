from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

from database import get_db
import crud, schemas
from auth.hashing import hash_password, verify_password
from auth.jwt_handler import create_access_token, create_refresh_token, verify_token
from auth.dependencies import get_current_user
from auth.send_emails import send_verification_email
from auth.send_forget_password_email import send_forget_password_email
from auth.forget_password import create_forget_password_token, verify_forget_password_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(
    user: schemas.UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    print(f"Received registration request with data: {user}")  

    existing = crud.get_user_by_email(db, user.email)
    if existing:
        print(f"Registration failed: Email {user.email} already registered") 
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        hashed = hash_password(user.password)
        verification_code = str(random.randint(100000, 999999))
        expiry_time = datetime.utcnow() + timedelta(minutes=10)

        print(f"Creating user with email: {user.email}, verification_code: {verification_code}") 

        crud.create_user(
            db,
            user=user,
            hashed_password=hashed,
            verification_code=verification_code,
            code_expiry=expiry_time
        )
    except Exception as e:
        print(f"Exception during user creation: {e}")  
        raise HTTPException(status_code=500, detail="Internal server error during user creation")

    background_tasks.add_task(send_verification_email, user.email, verification_code)
    print(f"Verification email scheduled for: {user.email}")  

    return {"message": "User registered. Verification code sent to email."}


class EmailVerificationRequest(BaseModel):
    email: str
    code: str


@router.post("/verify-email")
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

    return {"message": "Email verified successfully!"}


class ResendCodeRequest(BaseModel):
    email: str

@router.post("/resend-code")
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

    background_tasks.add_task(send_verification_email, user.email, new_code)

    return {"message": "New code sent to email."}


@router.post("/token")
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(db, email=form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=900,
        samesite="lax",
        secure=False,
        path="/"
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=False,
        path="/"
    )

    return {"message": "Login successful"}


class ForgetPasswordRequest(BaseModel):
    email: str


@router.post("/forget-password")
def forget_password(
    request: ForgetPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_forget_password_token({"sub": user.email})
    reset_link = f"http://localhost:5173/reset-password?token={token}"

    background_tasks.add_task(send_forget_password_email, user.email, reset_link)

    return {"message": "Password reset email sent successfully."}


class VerifyForgetPasswordRequest(BaseModel):
    token: str


@router.post("/verify-forget-password")
def verify_forget_password_route(request: VerifyForgetPasswordRequest):
    payload = verify_forget_password_token(request.token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    return {"message": "Valid token", "email": payload["sub"]}


class PasswordResetRequest(BaseModel):
    token: str
    new_password: str


@router.post("/reset-password")
def reset_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    payload = verify_forget_password_token(request.token)

    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = crud.get_user_by_email(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(request.new_password)
    db.commit()

    return {"message": "Password reset successfully."}


@router.post("/refresh")
def refresh_access_token(response: Response, refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    payload = verify_token(refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access_token = create_access_token({"sub": payload["sub"]})

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        max_age=900,
        samesite="lax",
        secure=False,
        path="/"
    )

    return {"message": "Access token refreshed"}


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.get("/protected", response_model=schemas.UserOut)
def protected_route(current_user=Depends(get_current_user)):
    return current_user
