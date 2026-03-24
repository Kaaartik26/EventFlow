from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database import models
from app.schemas import schemas
from app.utils.hashing import hash_password, verify_password
from app.utils.auth import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(data={"user_id": db_user.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }