from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.database import models
from app.schemas import schemas
from app.utils.auth import get_current_user, get_admin_user, get_current_faculty, get_student_user
from app.database.models import EventStatus

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("/", response_model=schemas.EventResponse)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    # Verify club exists
    club = db.query(models.Club).filter(models.Club.id == event.club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    new_event = models.Event(
        title=event.title,
        description=event.description,
        club_id=event.club_id,
        start_time=event.start_time,
        end_time=event.end_time,
        slot_duration=event.slot_duration,
        max_participants=event.max_participants,
        status=EventStatus.PENDING
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


@router.get("/", response_model=List[schemas.EventResponse])
def get_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.UserRole.STUDENT:
        # Students can only see approved events
        events = db.query(models.Event).filter(models.Event.status == EventStatus.APPROVED).all()
    else:
        # Admin can see all events
        events = db.query(models.Event).all()
    
    return events


@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Students can only view approved events
    if current_user.role == models.UserRole.STUDENT and event.status != EventStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return event


@router.get("/{event_id}/slots", response_model=List[schemas.SlotResponse])
def get_event_slots(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.status != EventStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Event must be approved to view slots")
    
    # Generate dynamic slots
    slots = []
    current_time = event.start_time
    
    while current_time + datetime.timedelta(minutes=event.slot_duration) <= event.end_time:
        slot_end = current_time + datetime.timedelta(minutes=event.slot_duration)
        
        # Count bookings for this slot
        booking_count = db.query(models.Booking).filter(
            models.Booking.event_id == event_id,
            models.Booking.slot_start == current_time,
            models.Booking.slot_end == slot_end
        ).count()
        
        remaining_capacity = event.max_participants - booking_count
        
        slots.append(schemas.SlotResponse(
            slot_start=current_time,
            slot_end=slot_end,
            remaining_capacity=remaining_capacity
        ))
        
        current_time = slot_end
    
    return slots


@router.post("/{event_id}/submit-for-approval")
def submit_for_approval(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.status != EventStatus.PENDING:
        raise HTTPException(status_code=400, detail="Event is already submitted or processed")
    
    event.status = EventStatus.PENDING
    db.commit()
    
    return {"message": "Event submitted for approval"}


@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(
    event_id: int,
    event_update: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.status == EventStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Cannot update approved event")
    
    # Update fields if provided
    if event_update.title is not None:
        event.title = event_update.title
    if event_update.description is not None:
        event.description = event_update.description
    if event_update.start_time is not None:
        event.start_time = event_update.start_time
    if event_update.end_time is not None:
        event.end_time = event_update.end_time
    if event_update.slot_duration is not None:
        event.slot_duration = event_update.slot_duration
    if event_update.max_participants is not None:
        event.max_participants = event_update.max_participants
    
    db.commit()
    db.refresh(event)
    
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if event has bookings
    bookings = db.query(models.Booking).filter(models.Booking.event_id == event_id).first()
    if bookings:
        raise HTTPException(status_code=400, detail="Cannot delete event with existing bookings")
    
    db.delete(event)
    db.commit()
    
    return {"message": "Event deleted successfully"}