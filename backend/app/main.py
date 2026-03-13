from fastapi import FastAPI
from app.database.database import Base, engine

app = FastAPI(title="EventFlow API")

# create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "EventFlow API Running"}