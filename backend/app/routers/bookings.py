from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database import models
from app.schemas import schemas
from app.utils.auth import get_current_user


router = APIRouter(prefix="/bookings", tags=["Bookings"])


# CREATE BOOKING
@router.post("/", response_model=schemas.BookingResponse)
def create_booking(
    booking: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    # 1. checking if an event exists
    event = db.query(models.Event).filter(models.Event.id == booking.event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # 2. Check slot is valid (within event time)
    if booking.slot_start < event.start_time or booking.slot_end > event.end_time:
        raise HTTPException(status_code=400, detail="Invalid slot timing")

    # 3. Count existing bookings for that slot
    existing_bookings = db.query(models.Booking).filter(
        models.Booking.event_id == booking.event_id,
        models.Booking.slot_start == booking.slot_start
    ).count()

    # 4. Check capacity
    if existing_bookings >= event.max_capacity:
        raise HTTPException(status_code=400, detail="Slot is full")

    # 5. Prevent duplicate booking by same user
    already_booked = db.query(models.Booking).filter(
        models.Booking.event_id == booking.event_id,
        models.Booking.slot_start == booking.slot_start,
        models.Booking.user_id == current_user.id
    ).first()

    if already_booked:
        raise HTTPException(status_code=400, detail="You already booked this slot")

    # 6. Create booking
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


# GET USER BOOKINGS
@router.get("/")
def get_user_bookings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).all()

    return bookings