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


class SightSeekingActivityIN(BaseModel):
    title: str
    location_name: str 
    entry_fee: Optional[int] = None
    cover_image: Optional[str] = None
    time: Optional[str] = None  
    description: Optional[str] = None
    type: str = "sightseeing"  
    itinerary_id: int
    day_number: int
    date: str 


class SightSeekingActivityOUT(BaseModel):
    id: int
    title: str
    type: str
    time: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    added_by: int
    day_schedule_id: int
    location_name: str
    entry_fee: Optional[int] = None
    
    class Config:
        from_attributes = True


class MealActivityIN(BaseModel):
    title: str
    type: str = "meal"
    description: Optional[str] = None
    cover_image: Optional[str] = None

    cuisine_type: Optional[str] = None
    restaurant_name: Optional[str] = None

    itinerary_id: int
    day_number: int
    date: str



class AccommodationActivityIN(BaseModel):
    title: str
    type: str = "accommodation"
    description: Optional[str] = None
    cover_image: Optional[str] = None

    hotel_name: str
    address: Optional[str] = None
    booking_link: Optional[str] = None

    itinerary_id: int
    day_number: int
    date: str
