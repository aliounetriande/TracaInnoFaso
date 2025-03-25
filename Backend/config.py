import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")  # Change pour la production
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:aris@localhost:5432/Tracainnofaso"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_VERIFY_SUB = False
