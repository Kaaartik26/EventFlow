from pydantic import BaseModel, EmailStr
from datetime import datetime


#useer schema
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_admin: bool

    class Config:
        from_attributes = True



#event schema
class EventCreate(BaseModel):
    title: str
    description: str
    location: str
    start_time: datetime
    end_time: datetime
    slot_duration: int
    max_capacity: int


class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    location: str
    start_time: datetime
    end_time: datetime
    slot_duration: int
    max_capacity: int

    class Config:
        from_attributes = True


#bookings schema
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

    class Config:
        from_attributes = True