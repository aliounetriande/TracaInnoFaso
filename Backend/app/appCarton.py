# Importation des modules nécessaires
from flask import Flask, Blueprint, request, send_file, jsonify
from pylibdmtx.pylibdmtx import encode
from PIL import Image, ImageDraw, ImageFont
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required
import io
import os

from app.auth import User  # Assure-toi que ce chemin est correct

# Définition de la taille de l'étiquette
LABEL_WIDTH = int(74 * 11.81)
LABEL_HEIGHT = int(105 * 11.81)

carton_bp = Blueprint('carton', __name__)

@carton_bp.route('/generate-label-carton', methods=['POST'])
@jwt_required()
def generate_label():
    # Récupération de l'identité de l'utilisateur connecté
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    signature = user.username if user else "Inconnu"

    # Récupération des données JSON envoyées dans la requête
    data = request.json

    # Extraction des informations
    gtin = data.get("gtin", "")
    content_gtin = data.get("content_gtin", "")
    batch = data.get("batch", "")
    expiry_date = data.get("expiry_date", "")
    quantity = data.get("quantity", "150")
    serial_number = data.get("serial_number", "")

    if not gtin or not content_gtin or not batch or not expiry_date or not serial_number:
        return jsonify({"error": "Champs manquants"}), 400

    # Création de l'étiquette
    label = Image.new("RGB", (LABEL_WIDTH, LABEL_HEIGHT), "white")
    draw = ImageDraw.Draw(label)

    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font = ImageFont.load_default()

    # Ajout des infos
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

    # Ligne de séparation
    draw.line([(10, 750), (860, 750)], fill="black", width=5)

    # Norme GS1
    draw.text((500, 900), f"(01) {gtin}", font=font, fill="black")
    draw.text((500, 950), f"(10) {expiry_date}", font=font, fill="black")
    draw.text((500, 1000), f"(17) {batch}", font=font, fill="black")
    draw.text((500, 1050), f"(02) {content_gtin}", font=font, fill="black")
    draw.text((500, 1100), f"(37) {quantity}", font=font, fill="black")

    # ✍️ Signature ajoutée en bas de l’étiquette
    draw.text((500, 1150), f"Par : {signature}", font=font, fill="black")

    # Génération de la Data Matrix
    dm_data = f"GTIN:{gtin};CONTENT GTIN:{content_gtin};BATCH:{batch};EXP:{expiry_date};QTY:{quantity};;"
    encoded = encode(dm_data.encode('utf-8'))
    dm_image = Image.frombytes('RGB', (encoded.width, encoded.height), encoded.pixels)
    dm_size = 400
    dm_image = dm_image.resize((dm_size, dm_size))
    label.paste(dm_image, (20, LABEL_HEIGHT - dm_size - 20))

    # Sauvegarde et retour
    img_io = io.BytesIO()
    label.save(img_io, 'PNG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/png', as_attachment=True, download_name="Etiquette-carton.png")
