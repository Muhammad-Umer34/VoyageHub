from sqlalchemy.orm import Session
from sqlalchemy import literal
from fastapi import HTTPException
from models import User
from models import Itinerary
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
        username = user.email.split('@')[0]

        db_user = User(
            email=user.email,
            username=username,        
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



def create_itinerary(db:Session, itinerary_data, owner_id: int):
    try:
        db_itinerary = Itinerary(
            owner_id=owner_id,
            title=itinerary_data.title,
            description=itinerary_data.description,
            destination=itinerary_data.destination,
            start_date=itinerary_data.start_date,
            end_date=itinerary_data.end_date,
            cover_image=itinerary_data.cover_image,
        )
        db.add(db_itinerary)
        db.commit()
        db.refresh(db_itinerary)
        return db_itinerary
    except Exception as e:
        logger.error(f"Error creating itinerary for user {owner_id}: {e}")
        db.rollback()  
        raise HTTPException(status_code=500, detail="Internal server error")