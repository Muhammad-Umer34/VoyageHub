from sqlalchemy import (
    Column, String, Boolean, Integer, DateTime, Date,
    ForeignKey, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    profile_photo = Column(
        String,
        nullable=False,
        default="https://res.cloudinary.com/dbslrfquo/image/upload/v1763120927/pde6iyl46pvyfkbmmi50.png"
    )

    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    code_expiry = Column(DateTime, nullable=True)

    itineraries = relationship("Itinerary", back_populates="owner")

    sent_notifications = relationship(
        "CollabNotification",
        back_populates="sender",
        foreign_keys="[CollabNotification.sender_id]",
        cascade="all, delete"
    )
    received_notifications = relationship(
        "CollabNotification",
        back_populates="receiver",
        foreign_keys="[CollabNotification.receiver_id]",
        cascade="all, delete"
    )


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(String)
    destination = Column(String, nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    cover_image = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="itineraries")
    collaborators = relationship("ItineraryCollaborator", cascade="all, delete")
    day_schedules = relationship("DaySchedule", cascade="all, delete")

    notifications = relationship(
        "CollabNotification",
        back_populates="itinerary",
        cascade="all, delete"
    )


class ItineraryCollaborator(Base):
    __tablename__ = "itinerary_collaborators"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    role = Column(String, default="editor")
    added_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("itinerary_id", "user_id", name="unique_collaborator"),
    )


class DaySchedule(Base):
    __tablename__ = "day_schedules"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
    total_activities = Column(Integer, default=0)
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())

    activities = relationship(
        "Activity",
        cascade="all, delete",
        back_populates="day_schedule"
    )


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    day_schedule_id = Column(Integer, ForeignKey("day_schedules.id"), nullable=False)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(String, nullable=True)
    cover_image = Column(String, nullable=True)
    added_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    day_schedule = relationship("DaySchedule", back_populates="activities")
    added_by_user = relationship("User") 

    meal_activity = relationship(
        "MealActivity",
        uselist=False,
        back_populates="activity",
        passive_deletes=True
    )
    accommodation_activity = relationship(
        "AccommodationActivity",
        uselist=False,
        back_populates="activity",
        passive_deletes=True
    )
    sightseeing_activity = relationship(
        "SightseeingActivity",
        uselist=False,
        back_populates="activity",
        passive_deletes=True
    )


class MealActivity(Base):
    __tablename__ = "meal_activities"

    id = Column(Integer, ForeignKey("activities.id", ondelete="CASCADE"), primary_key=True)
    cuisine_type = Column(String, nullable=True)
    restaurant_name = Column(String, nullable=True)

    activity = relationship("Activity", back_populates="meal_activity")


class AccommodationActivity(Base):
    __tablename__ = "accommodation_activities"

    id = Column(Integer, ForeignKey("activities.id", ondelete="CASCADE"), primary_key=True)

    hotel_name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    booking_link = Column(String, nullable=True)

    __table_args__ = (
        UniqueConstraint("id", name="unique_accommodation_activity"),
    )

    activity = relationship("Activity", back_populates="accommodation_activity")


class SightseeingActivity(Base):
    __tablename__ = "sightseeing_activities"

    id = Column(Integer, ForeignKey("activities.id", ondelete="CASCADE"), primary_key=True)

    location_name = Column(String, nullable=False)
    entry_fee = Column(Integer, nullable=True)

    activity = relationship("Activity", back_populates="sightseeing_activity")

    
class CollabNotification(Base):
    __tablename__ = "collab_notifications"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False)

    message = Column(String, nullable=False)
    status = Column(String, default="pending")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="sent_notifications",
        overlaps="sent_notifications"
    )
    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
        back_populates="received_notifications",
        overlaps="received_notifications"
    )
    itinerary = relationship(
        "Itinerary",
        foreign_keys=[itinerary_id],
        back_populates="notifications",
        overlaps="notifications"
    )
