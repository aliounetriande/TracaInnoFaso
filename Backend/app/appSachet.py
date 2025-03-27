# Importation des modules nécessaires
from flask import Flask, Blueprint, request, send_file  # Flask pour créer l'API, Blueprint pour structurer le code
from pylibdmtx.pylibdmtx import encode  # Bibliothèque pour générer des codes Data Matrix
from PIL import Image  # Pillow pour manipuler les images
from flask_cors import CORS  # Flask-CORS pour gérer les requêtes cross-origin (CORS)
from flask_jwt_extended import jwt_required  # JWT pour sécuriser l'accès à l'API
import io  # Pour la manipulation des fichiers en mémoire

# Définition d'un Blueprint pour modulariser les routes liées à la génération de Data Matrix
datamatrix_bp = Blueprint('datamatrix', __name__)

# Route API pour générer une Data Matrix pour un sachet
@datamatrix_bp.route('/generate-datamatrix-sachet', methods=['POST'])
@jwt_required()  # Sécurise la route, l'utilisateur doit être authentifié via un token JWT
def generate_datamatrix():
    # Récupération des données JSON envoyées dans la requête
    data = request.json
    gtin = data.get("gtin", "")  # Récupération du code GTIN (Global Trade Item Number)

    # Vérification que le champ GTIN est bien renseigné
    if not gtin:
        return {"error": "Champs manquants"}, 400  # Retourne une erreur HTTP 400 si GTIN est absent

    # Création de la donnée à encoder dans la Data Matrix
    dm_data = f"GTIN:{gtin};;"
    
    # Encodage de la donnée en Data Matrix
    encoded = encode(dm_data.encode('utf-8'))
    
    # Création d'une image à partir des pixels encodés
    dm_image = Image.frombytes('RGB', (encoded.width, encoded.height), encoded.pixels)

    # Redimensionner l'image pour s'assurer qu'elle ait une taille appropriée
    dm_size = 400  # Définition de la taille souhaitée en pixels
    dm_image = dm_image.resize((dm_size, dm_size))  # Redimensionnement de l'image

    # Sauvegarde de l'image dans un buffer en mémoire
    img_io = io.BytesIO()  # Création d'un objet buffer en mémoire
    dm_image.save(img_io, 'PNG')  # Sauvegarde de l'image au format PNG dans le buffer
    img_io.seek(0)  # Repositionne le pointeur au début du buffer

    # Envoie l'image générée en réponse avec le bon type MIME
    return send_file(img_io, mimetype='image/png')