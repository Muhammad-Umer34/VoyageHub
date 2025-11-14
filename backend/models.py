from sqlalchemy import Column, String, Boolean, Integer, DateTime
from datetime import datetime, timedelta
from database import Base

class User(Base):
    __tablename__ = "users" 
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)  # ✅ ADD THIS
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)  
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    code_expiry = Column(DateTime, nullable=True)