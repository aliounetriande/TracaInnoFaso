from flask import Flask, request, send_file
from pylibdmtx.pylibdmtx import encode
from PIL import Image, ImageDraw, ImageFont
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)

LABEL_WIDTH = int(105 * 11.81)  # 105 mm en pixels
LABEL_HEIGHT = int(74 * 11.81)  # 74 mm en pixels

@app.route('/generate-label', methods=['POST'])
def generate_label():
    data = request.json
    gtin = data.get("gtin", "")
    content_gtin = data.get("content_gtin", "")
    batch = data.get("batch", "")
    expiry_date = data.get("expiry_date", "")
    quantity = data.get("quantity", "150")

    if not gtin or not content_gtin or not batch or not expiry_date:
        return {"error": "Champs manquants"}, 400

    label = Image.new("RGB", (LABEL_WIDTH, LABEL_HEIGHT), "white")
    draw = ImageDraw.Draw(label)

    try:
        font = ImageFont.truetype("arial.ttf", 30)
    except IOError:
        font = ImageFont.load_default()

    draw.text((20, 20), f"GTIN: {gtin}", font=font, fill="black")
    draw.text((20, 60), f"Content GTIN: {content_gtin}", font=font, fill="black")
    draw.text((20, 100), f"Batch: {batch}", font=font, fill="black")
    draw.text((20, 140), f"EXP: {expiry_date}", font=font, fill="black")
    draw.text((20, 180), f"Quantity: {quantity}", font=font, fill="black")

    dm_data = f"GTIN:{gtin};CONTENT GTIN:{content_gtin};BATCH:{batch};EXP:{expiry_date};QTY:{quantity};;"
    encoded = encode(dm_data.encode('utf-8'))
    dm_image = Image.frombytes('RGB', (encoded.width, encoded.height), encoded.pixels)

    dm_size = 100
    dm_image = dm_image.resize((dm_size, dm_size))

    label.paste(dm_image, (20, LABEL_HEIGHT - dm_size - 20))

    img_io = io.BytesIO()
    label.save(img_io, 'PNG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
