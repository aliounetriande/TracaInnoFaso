from app import bcrypt
from flask import Blueprint, request, jsonify
from app.models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Nom d'utilisateur ou mot de passe incorrect"}), 401

    if user.is_logged_in:
        return jsonify({"msg": "Cet utilisateur est déjà connecté ailleurs."}), 403

    # Mise à jour de l'état de connexion
    user.is_logged_in = True
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    return jsonify({"token": access_token}), 200


@auth_bp.route("/add-user", methods=["POST"])
def add_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Nom d'utilisateur et mot de passe requis"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "L'utilisateur existe déjà"}), 400

    # Hachage du mot de passe AVANT de le stocker
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Utilisateur ajouté avec succès"}), 201


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user:
        user.is_logged_in = False
        db.session.commit()
        return jsonify({"msg": "Déconnexion réussie"}), 200
    else:
        return jsonify({"msg": "Utilisateur introuvable"}), 404
