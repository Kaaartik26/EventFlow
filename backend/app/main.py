from fastapi import FastAPI, Depends
from app.database.database import Base, engine
from app.database import models
from app.routers import auth
from app.utils.auth import get_current_user
from app.routers import bookings
from app.routers import auth, events, bookings

app = FastAPI(title="EventFlow API")

Base.metadata.create_all(bind=engine)

app.include_router(bookings.router)
app.include_router(events.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "EventFlow API Running Successfullu"}

@app.get("/me")
def read_current_user(current_user = Depends(get_current_user)):
    return current_user