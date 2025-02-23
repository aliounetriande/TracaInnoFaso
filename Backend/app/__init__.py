from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Autorise les requêtes cross-origin

    # Importation des blueprints
    from app.appSachet import datamatrix_bp
    from app.appCarton import carton_bp
    from app.appPalette import palette_bp

    # Enregistrement des blueprints
    app.register_blueprint(datamatrix_bp)
    app.register_blueprint(carton_bp)
    app.register_blueprint(palette_bp)

    return app
