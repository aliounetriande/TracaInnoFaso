from flask import Blueprint, request, jsonify
from app.models import db, User
from flask_jwt_extended import create_access_token

auth = Blueprint('auth', __name__)

# Route pour l'inscription
@auth.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Nom d'utilisateur et mot de passe requis"}), 400

    # Vérifier si l'utilisateur existe déjà
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "L'utilisateur existe déjà"}), 400

    new_user = User(username=username, password=password)  # Passe directement le mot de passe


    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Utilisateur créé avec succès"}), 201

# Route pour la connexion (génération du token JWT)
@auth.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Nom d'utilisateur ou mot de passe incorrect"}), 401

    # Création du token JWT
    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token}), 200
