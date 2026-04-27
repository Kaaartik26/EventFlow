from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models
from app.schemas import schemas
from app.utils.auth import get_current_user, get_admin_user, get_student_user
from app.database.models import EventStatus

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/book-slot", response_model=schemas.BookingResponse)
def book_slot(
    booking: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_student_user)
):
    # Check if event exists and is approved
    event = db.query(models.Event).filter(models.Event.id == booking.event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.status != EventStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Event is not approved for booking")
    
    # Check slot is valid (within event time)
    if booking.slot_start < event.start_time or booking.slot_end > event.end_time:
        raise HTTPException(status_code=400, detail="Invalid slot timing")
    
    # Check slot duration matches event slot duration
    slot_duration = (booking.slot_end - booking.slot_start).total_seconds() / 60
    if slot_duration != event.slot_duration:
        raise HTTPException(status_code=400, detail="Invalid slot duration")
    
    # Count existing bookings for that slot
    existing_bookings = db.query(models.Booking).filter(
        models.Booking.event_id == booking.event_id,
        models.Booking.slot_start == booking.slot_start,
        models.Booking.slot_end == booking.slot_end
    ).count()
    
    # Check capacity
    if existing_bookings >= event.max_participants:
        raise HTTPException(status_code=400, detail="Slot is full")
    
    # Prevent duplicate booking by same user
    already_booked = db.query(models.Booking).filter(
        models.Booking.event_id == booking.event_id,
        models.Booking.slot_start == booking.slot_start,
        models.Booking.slot_end == booking.slot_end,
        models.Booking.user_id == current_user.id
    ).first()
    
    if already_booked:
        raise HTTPException(status_code=400, detail="You already booked this slot")
    
    # Create booking
    new_booking = models.Booking(
        user_id=current_user.id,
        event_id=booking.event_id,
        slot_start=booking.slot_start,
        slot_end=booking.slot_end
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return new_booking


@router.get("/my-bookings", response_model=List[schemas.BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).all()
    
    return bookings


@router.get("/all-bookings", response_model=List[schemas.BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    bookings = db.query(models.Booking).all()
    return bookings


@router.delete("/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Users can only delete their own bookings, admins can delete any
    if current_user.role != models.UserRole.ADMIN and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this booking")
    
    db.delete(booking)
    db.commit()
    
    return {"message": "Booking deleted successfully"}