from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database import models
from app.schemas import schemas
from app.utils.hashing import hash_password, verify_password
from app.utils.auth import create_access_token, create_faculty_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_pw,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_credentials.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user_credentials.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(data={"user_id": db_user.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/faculty/login", response_model=schemas.Token)
def faculty_login(faculty_credentials: schemas.FacultyLogin, db: Session = Depends(get_db)):
    db_faculty = db.query(models.Faculty).filter(models.Faculty.email == faculty_credentials.email).first()

    if not db_faculty:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(faculty_credentials.password, db_faculty.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_faculty_access_token(data={"faculty_id": db_faculty.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/faculty/signup", response_model=schemas.FacultyResponse)
def faculty_signup(faculty: schemas.FacultyCreate, db: Session = Depends(get_db)):
    existing_faculty = db.query(models.Faculty).filter(models.Faculty.email == faculty.email).first()

    if existing_faculty:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(faculty.password)

    new_faculty = models.Faculty(
        name=faculty.name,
        email=faculty.email,
        password=hashed_pw,
        department=faculty.department
    )

    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)

    return new_faculty


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/faculty/me", response_model=schemas.FacultyResponse)
def get_current_faculty_info(current_faculty: models.Faculty = Depends(get_current_user)):
    return current_faculty