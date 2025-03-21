from flask import Blueprint, request, jsonify
from app.models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Vérifier si l'utilisateur existe
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        return jsonify({"token": access_token}), 200

    return jsonify({"error": "Identifiants incorrects"}), 401


@auth_bp.route("/add-user", methods=["POST"])
def add_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Nom d'utilisateur et mot de passe requis"}), 400

    # Vérifier si l'utilisateur existe déjà
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "L'utilisateur existe déjà"}), 400

    # Créer un nouvel utilisateur
    new_user = User(username=username, password=password)  # Passe bien le `password`


    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Utilisateur ajouté avec succès"}), 201
