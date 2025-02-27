from flask import Flask, Blueprint, request, send_file
from pylibdmtx.pylibdmtx import encode
from PIL import Image
from flask_cors import CORS
import io

datamatrix_bp = Blueprint('datamatrix', __name__)

@datamatrix_bp.route('/generate-datamatrix-sachet', methods=['POST'])
def generate_datamatrix():
    data = request.json
    gtin = data.get("gtin", "")

    if not gtin:
        return {"error": "Champs manquants"}, 400

    # Générer la Data Matrix avec les informations
    dm_data = f"GTIN:{gtin};;"
    encoded = encode(dm_data.encode('utf-8'))
    dm_image = Image.frombytes('RGB', (encoded.width, encoded.height), encoded.pixels)

    # Redimensionner la Data Matrix (optionnel)
    dm_size = 400
    dm_image = dm_image.resize((dm_size, dm_size))

    # Sauvegarde dans un buffer
    img_io = io.BytesIO()
    dm_image.save(img_io, 'PNG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/png')

