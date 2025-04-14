from functools import wraps
from app import bcrypt
from flask import Blueprint, request, jsonify
from app.models import db, User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.decorators import role_required


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
    return jsonify({
    "token": access_token,
    "role": user.role,
    "username": user.username
}), 200

def role_required(allowed_roles):
    def decorator(func):
        @wraps(func)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user:
                return jsonify({"msg": "Utilisateur non trouvé"}), 404
            if user.role not in allowed_roles:
                return jsonify({"msg": "Accès refusé pour le rôle actuel"}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator


@auth_bp.route("/add-user", methods=["POST"])
def add_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if not username or not password or not role:
        return jsonify({"msg": "Champs requis : username, password, role"}), 400

    if role not in ["carton", "palette", "admin"]:
        return jsonify({"msg": "Le rôle doit être 'carton', 'palette' ou 'admin'"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "L'utilisateur existe déjà"}), 400

    # Hachage du mot de passe AVANT de le stocker
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password, role=role)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": f"Utilisateur '{username}' ajouté avec le rôle '{role}'"}), 201

@auth_bp.route('/generate/palette', methods=['POST'])
@role_required(['palette', 'admin'])  # seuls les users 'palette' et 'admin' peuvent accéder
def generate_palette():
    return jsonify({"msg": "Étiquette palette générée avec succès"}), 200


@auth_bp.route('/generate/carton', methods=['POST'])
@role_required(['carton', 'admin'])  # seuls les users 'carton' et 'admin' peuvent accéder
def generate_carton():
    return jsonify({"msg": "Étiquette carton générée avec succès"}), 200




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
