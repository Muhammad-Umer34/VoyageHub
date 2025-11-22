from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import date, datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class ItineraryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    destination: str
    start_date: str
    end_date: str
    cover_image: Optional[str] = None

class ItineraryOut(BaseModel):

    id: int
    owner_id: int
    title: str
    description: Optional[str] = None
    destination: str
    start_date: date
    end_date: date
    cover_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    profile_photo: Optional[str] = None
    username: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class emailVerification(BaseModel):
    message:str


class Invite(BaseModel):
    email: EmailStr
    itinerary_id: int


class NotificationResponse(BaseModel):
    notification_id: int


class CollabNotificationOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    itinerary_id: int
    message: str
    status: str  # 'pending', 'accepted', 'rejected'
    created_at: datetime

    class Config:
        from_attributes = True    