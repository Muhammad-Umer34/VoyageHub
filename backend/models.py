from sqlalchemy import (
    Column, String, Boolean, Integer, DateTime, Date, Time,
    ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    profile_photo = Column(String, nullable=False, default="https://res.cloudinary.com/dbslrfquo/image/upload/v1763120927/pde6iyl46pvyfkbmmi50.png")
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    code_expiry = Column(DateTime, nullable=True)

    itineraries = relationship("Itinerary", back_populates="owner")


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    destination = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    cover_image = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="itineraries")
    collaborators = relationship("ItineraryCollaborator", cascade="all, delete")
    day_schedules = relationship("DaySchedule", cascade="all, delete")


class ItineraryCollaborator(Base):
    __tablename__ = "itinerary_collaborators"

    id = Column(Integer, primary_key=True, index=True)

    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    role = Column(String, default="editor")
    added_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("itinerary_id", "user_id", name="unique_collaborator"),
    )


class DaySchedule(Base):
    __tablename__ = "day_schedules"

    id = Column(Integer, primary_key=True, index=True)

    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False, index=True)

    day_number = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)

    activities = relationship("Activity", cascade="all, delete")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)

    day_schedule_id = Column(Integer, ForeignKey("day_schedules.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    location = Column(String, nullable=True)

    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    description = Column(String, nullable=True)
    cover_image = Column(String, nullable=True)

    position = Column(Integer, nullable=False) 
