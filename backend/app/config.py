import os
from dotenv import load_dotenv

load_dotenv()

# Force SQLite for development
DATABASE_URL = "sqlite:///./eventflow.db"

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60