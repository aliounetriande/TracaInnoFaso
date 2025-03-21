import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")  # Change pour la production
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:root@localhost:5432/UserAppTraca"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_VERIFY_SUB = False
