from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'  # Définit le nom explicite de la table
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # "carton", "palette" ou "admin"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Date d'inscription
    is_logged_in = db.Column(db.Boolean, default=False) # Indique si l'utilisateur est connecté

    def __init__(self, username, password_hash, role, created_at=None, is_logged_in=False):
        self.username = username
        self.password_hash = password_hash
        self.role = role
        self.created_at = created_at if created_at else datetime.utcnow()
        self.is_logged_in = is_logged_in

    def set_password(self, password):
        """Hache et stocke le mot de passe"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
      """Vérifie si le mot de passe correspond au hash enregistré (via flask_bcrypt)"""
      print("Mot de passe entré:", password)
      print("Mot de passe haché enregistré:", self.password_hash)
      result = bcrypt.check_password_hash(self.password_hash, password)
      print("Résultat de la comparaison:", result)
      return result
    


    def __repr__(self):
        return f"<User {self.username}>"
    
    def __repr__(self):
      return f"<User {self.username}, role={self.role}>"

    
