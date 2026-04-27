from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import models
from app.schemas import schemas
from app.utils.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/clubs", tags=["Clubs"])


@router.get("/", response_model=List[schemas.ClubResponse])
def get_clubs(db: Session = Depends(get_db)):
    clubs = db.query(models.Club).all()
    return clubs


@router.get("/{club_id}", response_model=schemas.ClubResponse)
def get_club(club_id: int, db: Session = Depends(get_db)):
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return club


@router.post("/", response_model=schemas.ClubResponse)
def create_club(
    club: schemas.ClubCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    existing_club = db.query(models.Club).filter(models.Club.name == club.name).first()
    if existing_club:
        raise HTTPException(status_code=400, detail="Club with this name already exists")

    new_club = models.Club(
        name=club.name,
        description=club.description,
        created_by_id=current_user.id
    )

    db.add(new_club)
    db.commit()
    db.refresh(new_club)

    return new_club


@router.put("/{club_id}", response_model=schemas.ClubResponse)
def update_club(
    club_id: int,
    club_update: schemas.ClubUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    if club_update.name is not None:
        existing_club = db.query(models.Club).filter(
            models.Club.name == club_update.name,
            models.Club.id != club_id
        ).first()
        if existing_club:
            raise HTTPException(status_code=400, detail="Club with this name already exists")
        club.name = club_update.name

    if club_update.description is not None:
        club.description = club_update.description

    db.commit()
    db.refresh(club)

    return club


@router.delete("/{club_id}")
def delete_club(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    # Check if club has events
    events = db.query(models.Event).filter(models.Event.club_id == club_id).first()
    if events:
        raise HTTPException(status_code=400, detail="Cannot delete club with existing events")

    db.delete(club)
    db.commit()

    return {"message": "Club deleted successfully"}
