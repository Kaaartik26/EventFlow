from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from app.database.models import UserRole, EventStatus

# User schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

# Faculty schemas
class FacultyCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str

class FacultyLogin(BaseModel):
    email: EmailStr
    password: str

class FacultyResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: str
    created_at: datetime

    class Config:
        from_attributes = True

# Club schemas
class ClubCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ClubResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

# Event schemas
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    club_id: int
    start_time: datetime
    end_time: datetime
    slot_duration: int
    max_participants: int

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    slot_duration: Optional[int] = None
    max_participants: Optional[int] = None

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    club_id: int
    start_time: datetime
    end_time: datetime
    slot_duration: int
    max_participants: int
    status: EventStatus
    approved_by_id: Optional[int]
    rejection_comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class EventApproval(BaseModel):
    status: EventStatus
    comment: Optional[str] = None

# Booking schemas
class BookingCreate(BaseModel):
    event_id: int
    slot_start: datetime
    slot_end: datetime

class BookingResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    slot_start: datetime
    slot_end: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Slot schemas
class SlotResponse(BaseModel):
    slot_start: datetime
    slot_end: datetime
    remaining_capacity: int

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    faculty_id: Optional[int] = None