from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Response, Cookie
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

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://frontend:5173",  # Docker service name
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test")
async def test():
    return {"status": "ok"}

# ============= REGISTER =============
@app.post("/auth/register")
def register(
    user: schemas.UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Check if email already exists
    existing_email = crud.get_user_by_email(db, user.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = crud.get_user_by_username(db, user.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
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

# ============= EMAIL VERIFICATION =============
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

# ============= RESEND VERIFICATION CODE =============
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

# ============= LOGIN =============
@app.post("/auth/token")
def login_for_access_token(
    response: Response,
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

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=900,
        secure=False,
        samesite="lax",
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=604800,  
        secure=False, 
        samesite="lax",
        path="/"
    )

    return {
        "message": "Login successful",
        "access_token": access_token
    }

# ============= FORGET PASSWORD =============
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

# ============= VERIFY FORGET PASSWORD TOKEN =============
class VerifyForgetPasswordRequest(BaseModel):
    token: str

@app.post("/auth/verify-forget-password")
def verify_forget_password(request: VerifyForgetPasswordRequest):
    payload = verify_forget_password_token(request.token) 
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    return {"message": "Token is valid", "email": payload["sub"]}

# ============= RESET PASSWORD =============
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

# ============= REFRESH TOKEN =============
@app.post("/auth/refresh")
def refresh_access_token(
    response: Response,
    refresh_token: str = Cookie(None),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    payload = verify_token(refresh_token, expected_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    new_access_token = create_access_token({"sub": payload["sub"]})

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        max_age=900,
        secure=False, 
        samesite="lax",
        path="/"
    )

    return {"message": "Access token refreshed"}

# ============= PROTECTED ROUTES =============
@app.get("/me", response_model=schemas.UserOut)
def read_me(current_user=Depends(get_current_user)):
    return current_user

@app.get("/protected", response_model=schemas.UserOut)
def protected_route(current_user=Depends(get_current_user)):
    return current_user