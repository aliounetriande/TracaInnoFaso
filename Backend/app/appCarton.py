from flask import Flask, Blueprint, request, send_file
from pylibdmtx.pylibdmtx import encode
from PIL import Image, ImageDraw, ImageFont
from flask_cors import CORS
from flask_jwt_extended import jwt_required
import io


LABEL_WIDTH = int(74 * 11.81)  # 74 mm en pixels
LABEL_HEIGHT = int(105 * 11.81)  # 105 mm en pixels

carton_bp = Blueprint('carton', __name__)

@carton_bp.route('/generate-label-carton', methods=['POST'])
@jwt_required()
def generate_label():
    data = request.json
    gtin = data.get("gtin", "")
    content_gtin = data.get("content_gtin", "")
    batch = data.get("batch", "")
    expiry_date = data.get("expiry_date", "")
    quantity = data.get("quantity", "150")
    serial_number = data.get("serial_number", "")

    if not gtin or not content_gtin or not batch or not expiry_date or not serial_number:
        return {"error": "Champs manquants"}, 400

    label = Image.new("RGB", (LABEL_WIDTH, LABEL_HEIGHT), "white")
    draw = ImageDraw.Draw(label)

    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font = ImageFont.load_default()

    draw.text((30, 60), f"GTIN", font=font, fill="black")
    draw.text((30, 130), f"{gtin}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((590, 60), f"Content GTIN", font=font, fill="black")
    draw.text((590, 130), f"{content_gtin}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 220), f"Batch", font=font, fill="black")
    draw.text((30, 290), f"{batch}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 380), f"EXPIRATION", font=font, fill="black")
    draw.text((30, 450), f"{expiry_date}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((590, 220), f"QUANTITY", font=font, fill="black")
    draw.text((590, 290), f"{quantity}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 560), f"SERIAL NUMBER", font=font, fill="black")
    draw.text((30, 630), f"{serial_number}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    
    # Dessiner un trait horizontal au milieu de l'étiquette
    draw.line([(10, 750), (860, 750)], fill="black", width=5)

    draw.text((550, 900), f"(01) {gtin}", font=font, fill="black")
    draw.text((550, 950), f"(10) {expiry_date}", font=font, fill="black")
    draw.text((550, 1000), f"(17) {batch}", font=font, fill="black")
    draw.text((550, 1050), f"(02) {content_gtin}", font=font, fill="black")
    draw.text((550, 1100), f"(37) {quantity}", font=font, fill="black")
   
 
 

    dm_data = f"GTIN:{gtin};CONTENT GTIN:{content_gtin};BATCH:{batch};EXP:{expiry_date};QTY:{quantity};;"
    encoded = encode(dm_data.encode('utf-8'))
    dm_image = Image.frombytes('RGB', (encoded.width, encoded.height), encoded.pixels)

    dm_size = 400
    dm_image = dm_image.resize((dm_size, dm_size))

    label.paste(dm_image, (20, LABEL_HEIGHT - dm_size - 20))

    img_io = io.BytesIO()
    label.save(img_io, 'PNG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/png')

