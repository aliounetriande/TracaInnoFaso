# Importation des modules nécessaires
from flask import Flask, Blueprint, request, send_file, jsonify
from pylibdmtx.pylibdmtx import encode  # Génération de codes Data Matrix
from PIL import Image, ImageDraw, ImageFont  # Manipulation des images et ajout de texte
from flask_cors import CORS  # Gestion des requêtes cross-origin (CORS)
from flask_jwt_extended import JWTManager, jwt_required  # Sécurisation avec JWT
import io  # Manipulation des fichiers en mémoire
import os  # Gestion des fichiers système

# Définition de la taille de l'étiquette (en pixels, convertis depuis les mm)
LABEL_WIDTH = int(74 * 11.81)  # 74 mm en pixels
LABEL_HEIGHT = int(105 * 11.81)  # 105 mm en pixels

# Création d'un Blueprint pour modulariser les routes de l'étiquette carton
carton_bp = Blueprint('carton', __name__)

@carton_bp.route('/generate-label-carton', methods=['POST'])
@jwt_required()  # Sécurisation de la route, requiert un token JWT valide
def generate_label():
    """ Génère une étiquette pour un carton avec une Data Matrix """
    
    # Récupération des données JSON envoyées dans la requête
    data = request.json
    print("Données reçues:", data)  # Debugging: affiche les données reçues

    # Extraction des informations
    gtin = data.get("gtin", "")
    content_gtin = data.get("content_gtin", "")
    batch = data.get("batch", "")
    expiry_date = data.get("expiry_date", "")
    quantity = data.get("quantity", "150")  # Valeur par défaut si non fournie
    serial_number = data.get("serial_number", "")

    # Vérification que tous les champs obligatoires sont présents
    if not gtin or not content_gtin or not batch or not expiry_date or not serial_number:
        return jsonify({"error": "Champs manquants"}), 400  # Retourne une erreur HTTP 400

    # Création de l'étiquette vierge (blanche)
    label = Image.new("RGB", (LABEL_WIDTH, LABEL_HEIGHT), "white")
    draw = ImageDraw.Draw(label)

    # Chargement de la police d'écriture
    try:
        font = ImageFont.truetype("arial.ttf", 40)  # Utilise Arial si disponible
    except IOError:
        font = ImageFont.load_default()  # Sinon, utilise la police par défaut

    # Ajout des informations textuelles sur l'étiquette
    draw.text((30, 60), "GTIN", font=font, fill="black")
    draw.text((30, 130), gtin, font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((570, 60), "Content GTIN", font=font, fill="black")
    draw.text((570, 130), content_gtin, font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 220), "Batch", font=font, fill="black")
    draw.text((30, 290), batch, font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 380), "EXPIRATION", font=font, fill="black")
    draw.text((30, 450), expiry_date, font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((570, 220), "QUANTITY", font=font, fill="black")
    draw.text((570, 290), quantity, font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 560), "SERIAL NUMBER", font=font, fill="black")
    draw.text((30, 630), serial_number, font=font, fill="black", stroke_width=2, stroke_fill="black")

    # Ajout d'un trait horizontal pour séparer les sections
    draw.line([(10, 750), (860, 750)], fill="black", width=5)

    # Ajout de références supplémentaires (norme GS1)
    draw.text((500, 900), f"(01) {gtin}", font=font, fill="black")
    draw.text((500, 950), f"(10) {expiry_date}", font=font, fill="black")
    draw.text((500, 1000), f"(17) {batch}", font=font, fill="black")
    draw.text((500, 1050), f"(02) {content_gtin}", font=font, fill="black")
    draw.text((500, 1100), f"(37) {quantity}", font=font, fill="black")

    # Génération de la Data Matrix
    dm_data = f"GTIN:{gtin};CONTENT GTIN:{content_gtin};BATCH:{batch};EXP:{expiry_date};QTY:{quantity};;"
    encoded = encode(dm_data.encode('utf-8'))
    dm_image = Image.frombytes('RGB', (encoded.width, encoded.height), encoded.pixels)

    # Redimensionnement de la Data Matrix pour qu'elle s'insère bien sur l'étiquette
    dm_size = 400
    dm_image = dm_image.resize((dm_size, dm_size))

    # Ajout de la Data Matrix sur l'étiquette
    label.paste(dm_image, (20, LABEL_HEIGHT - dm_size - 20))

    # Sauvegarde de l'étiquette dans un buffer mémoire
    img_io = io.BytesIO()
    label.save(img_io, 'PNG')
    img_io.seek(0)  # Repositionner le pointeur du fichier au début

    # Envoi de l'image générée en réponse avec le bon type MIME
    return send_file(img_io, mimetype='image/png')