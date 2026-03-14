from fastapi import FastAPI
from app.database.database import Base, engine
from app.database  import models

app = FastAPI(title="EventFlow API")

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "EventFlow API Running"}