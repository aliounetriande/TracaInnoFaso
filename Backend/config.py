import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")  # Change pour la production
    JWT_SECRET_KEY = SECRET_KEY  # Nécessaire pour JWT
    
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:aris@localhost:5432/Tracainnofaso"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_VERIFY_SUB = False
    
    # Définir la durée d'expiration du token à 7 jours
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
