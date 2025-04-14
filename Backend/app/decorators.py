from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import User

def role_required(allowed_roles):
    def decorator(func):
        @wraps(func)
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
