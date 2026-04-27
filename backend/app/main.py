from fastapi import FastAPI, Depends
from app.database.database import Base, engine
from app.database import models
from app.routers import auth, events, bookings, clubs, faculty
from app.utils.auth import get_current_user

app = FastAPI(title="EventFlow API")

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(bookings.router)
app.include_router(clubs.router)
app.include_router(faculty.router)


@app.get("/")
def root():
    return {"message": "EventFlow API Running Successfully"}


@app.get("/me")
def read_current_user(current_user = Depends(get_current_user)):
    return current_user