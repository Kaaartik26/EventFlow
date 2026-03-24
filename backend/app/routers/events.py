from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models
from app.schemas import schemas
from app.utils.auth import get_admin_user
from app.services.slot_service import generate_slots


router = APIRouter(prefix="/events", tags=["Events"])


# -----------------------------
# CREATE EVENT (ADMIN ONLY)
# -----------------------------
@router.post("/", response_model=schemas.EventResponse)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    new_event = models.Event(
        title=event.title,
        description=event.description,
        location=event.location,
        start_time=event.start_time,
        end_time=event.end_time,
        slot_duration=event.slot_duration,
        max_capacity=event.max_capacity
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


# -----------------------------
# GET ALL EVENTS
# -----------------------------
@router.get("/", response_model=List[schemas.EventResponse])
def get_events(db: Session = Depends(get_db)):

    events = db.query(models.Event).all()
    return events


# -----------------------------
# GET SINGLE EVENT
# -----------------------------
@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):

    event = db.query(models.Event).filter(models.Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return event


# -----------------------------
# GET EVENT SLOTS (DYNAMIC)
# -----------------------------
@router.get("/{event_id}/slots")
def get_event_slots(event_id: int, db: Session = Depends(get_db)):

    event = db.query(models.Event).filter(models.Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    bookings = db.query(models.Booking).filter(
        models.Booking.event_id == event_id
    ).all()

    slots = generate_slots(event, bookings)

    return slots