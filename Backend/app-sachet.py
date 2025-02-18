from flask import Flask, request, send_file
from pylibdmtx.pylibdmtx import encode
from PIL import Image
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)

@app.route('/generate-datamatrix-sachet', methods=['POST'])
def generate_datamatrix():
    data = request.json
    gtin = data.get("gtin", "")
    batch = data.get("batch", "")
    expiry_date = data.get("expiry_date", "")

    if not gtin or not batch or not expiry_date:
        return {"error": "Champs manquants"}, 400

    # Générer la Data Matrix avec les informations
    dm_data = f"GTIN:{gtin};BATCH:{batch};EXP:{expiry_date};;"
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
