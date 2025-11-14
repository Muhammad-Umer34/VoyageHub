from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserCreate(BaseModel):
    username: str  # ✅ ADD THIS
    email: EmailStr
    password: str
    full_name: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str  # ✅ ADD THIS
    email: EmailStr
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class EmailVerification(BaseModel):  # ✅ Fixed capitalization
    message: str