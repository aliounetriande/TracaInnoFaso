from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate  # Ajout de Flask-Migrate

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()  # Initialisation de Flask-Bcrypt
jwt = JWTManager()  # Initialisation de Flask-JWT-Extended

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Initialisation des extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app)  # Autorise les requêtes cross-origin

    # Importation des blueprints
    from app.appSachet import datamatrix_bp
    from app.appCarton import carton_bp
    from app.appPalette import palette_bp
    from app.auth.routes import auth  # Import du blueprint d'authentification
   
    # Enregistrement des blueprints
    app.register_blueprint(datamatrix_bp)
    app.register_blueprint(carton_bp)
    app.register_blueprint(palette_bp)
    app.register_blueprint(auth, url_prefix="/auth")  # Authentification

    return app
