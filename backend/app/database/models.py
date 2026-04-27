from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"

class EventStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    bookings = relationship("Booking", back_populates="user")
    created_clubs = relationship("Club", back_populates="created_by")

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    department = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_events = relationship("Event", back_populates="approved_by_faculty")

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = relationship("User", back_populates="created_clubs")
    events = relationship("Event", back_populates="club")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    club_id = Column(Integer, ForeignKey("clubs.id"))
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    slot_duration = Column(Integer, nullable=False)  # minutes
    max_participants = Column(Integer, nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.PENDING, nullable=False)
    approved_by_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    rejection_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    club = relationship("Club", back_populates="events")
    approved_by_faculty = relationship("Faculty", back_populates="approved_events")
    bookings = relationship("Booking", back_populates="event")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    slot_start = Column(DateTime, nullable=False)
    slot_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="bookings")
    event = relationship("Event", back_populates="bookings")