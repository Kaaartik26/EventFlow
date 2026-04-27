from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models
from app.schemas import schemas
from app.utils.auth import get_current_faculty
from app.database.models import EventStatus

router = APIRouter(prefix="/faculty", tags=["Faculty"])


@router.get("/events/pending", response_model=List[schemas.EventResponse])
def get_pending_events(
    db: Session = Depends(get_db),
    current_faculty: models.Faculty = Depends(get_current_faculty)
):
    events = db.query(models.Event).filter(models.Event.status == EventStatus.PENDING).all()
    return events


@router.get("/events/reviewed", response_model=List[schemas.EventResponse])
def get_reviewed_events(
    db: Session = Depends(get_db),
    current_faculty: models.Faculty = Depends(get_current_faculty)
):
    events = db.query(models.Event).filter(
        models.Event.status.in_([EventStatus.APPROVED, EventStatus.REJECTED])
    ).all()
    return events


@router.get("/events/all", response_model=List[schemas.EventResponse])
def get_all_events(
    db: Session = Depends(get_db),
    current_faculty: models.Faculty = Depends(get_current_faculty)
):
    events = db.query(models.Event).all()
    return events


@router.patch("/events/{event_id}", response_model=schemas.EventResponse)
def review_event(
    event_id: int,
    approval_data: schemas.EventApproval,
    db: Session = Depends(get_db),
    current_faculty: models.Faculty = Depends(get_current_faculty)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.status != EventStatus.PENDING:
        raise HTTPException(status_code=400, detail="Event is not pending review")
    
    if approval_data.status == EventStatus.APPROVED:
        event.status = EventStatus.APPROVED
        event.approved_by_id = current_faculty.id
        event.rejection_comment = None
    elif approval_data.status == EventStatus.REJECTED:
        event.status = EventStatus.REJECTED
        event.rejection_comment = approval_data.comment
        event.approved_by_id = None
    else:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    db.commit()
    db.refresh(event)
    
    return event


@router.get("/me", response_model=schemas.FacultyResponse)
def get_current_faculty_info(current_faculty: models.Faculty = Depends(get_current_faculty)):
    return current_faculty
