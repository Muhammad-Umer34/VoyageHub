from sqlalchemy.orm import Session
from sqlalchemy import literal
from fastapi import HTTPException
from models import User
import logging

logger = logging.getLogger(__name__)

def get_user_by_email(db: Session, email: str):
    try:
        user = db.query(User).filter(User.email == email).limit(literal(1)).first()
        return user
    except Exception as e:
        logger.error(f"Error fetching user by email {email}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def create_user(db: Session, user, hashed_password, verification_code, code_expiry):
    try:
        db_user = User(
            email=user.email,
            full_name=user.full_name,
            hashed_password=hashed_password,
            verification_code=verification_code,
            code_expiry=code_expiry,
            is_verified=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        logger.error(f"Error creating user {user.email}: {e}")
        db.rollback()  
        raise HTTPException(status_code=500, detail="Internal server error")
