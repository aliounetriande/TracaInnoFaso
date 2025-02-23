from flask import Flask, Blueprint, request, send_file
from pylibdmtx.pylibdmtx import encode
from PIL import Image, ImageDraw, ImageFont
from flask_cors import CORS
import io



LABEL_WIDTH = int(148 * 11.81)  # 148 mm en pixels
LABEL_HEIGHT = int(105 * 11.81)  # 105 mm en pixels

palette_bp = Blueprint('palette', __name__)

@palette_bp.route('/generate-label', methods=['POST'])
def generate_label():
    data = request.json
    sscc = data.get("sscc", " ")
    content_gtin = data.get("content_gtin", " ")
    batch = data.get("batch", " ")
    expiry_date = data.get("expiry_date", " ")
    prod_date = data.get("prod_date", " ")
    quantity = data.get("quantity", " ")
    order_number = data.get("order_number", " ")
    number_part_cust = data.get("number_part_cust", " ")
    description = data.get("description", " ")

    label = Image.new("RGB", (LABEL_WIDTH, LABEL_HEIGHT), "white")
    draw = ImageDraw.Draw(label)

    

    try:
        font = ImageFont.truetype("arial.ttf", 50)
    except IOError:
        font = ImageFont.load_default()

    draw.text((30, 20), f"SSCC: ", font=font, fill="black")
    draw.text((30, 90), f"{sscc}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((1200, 20), f"Quantity: ", font=font, fill="black")
    draw.text((1575, 90), f"{quantity}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 180), f"Content GTIN: ", font=font, fill="black")
    draw.text((30, 250), f"{content_gtin}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((1200, 180), f"EXP: ", font=font, fill="black")
    draw.text((1375, 250), f"{expiry_date}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 320), f"Batch: ", font=font, fill="black")
    draw.text((30, 390), f"{batch}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((1200, 320), f"PROD DATE: ", font=font, fill="black")
    draw.text((1375, 390), f"{prod_date}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 460), f"Description: ", font=font, fill="black")
    draw.text((30, 530), f"{description}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((30, 600), f"Order Number: ", font=font, fill="black")
    draw.text((30, 670), f"{order_number}", font=font, fill="black", stroke_width=2, stroke_fill="black")
    draw.text((1200, 600), f"Number Part Cust: ", font=font, fill="black")
    draw.text((1473, 670), f"{number_part_cust}", font=font, fill="black", stroke_width=2, stroke_fill="black")

    #la ligne
    draw.line([(10,770), (1720,770)], fill="black", width=3) 

    #partie pour afficher les infos de la data matrix
    draw.text((900, 800), f"(00) {sscc}", font=font, fill="black")
    draw.text((900, 850), f"(02) {content_gtin}", font=font, fill="black")
    draw.text((900, 900), f"(10) {batch}", font=font, fill="black")
    draw.text((900, 950), f"(17) {expiry_date}", font=font, fill="black")
    draw.text((900, 1000), f"(11) {prod_date}", font=font, fill="black")
    draw.text((900, 1050), f"(37) {quantity}", font=font, fill="black")
    draw.text((900, 1100), f"(241) {number_part_cust}", font=font, fill="black")
    draw.text((900, 1150), f"(400)) {order_number}", font=font, fill="black")

    dm_data = f"SSCC:{sscc};CONTENT GTIN:{content_gtin};BATCH:{batch};EXP:{expiry_date};PROD DATE:{prod_date};QTY:{quantity};ORDER:{order_number};CUST PART NUMBER:{number_part_cust};;"
    encoded = encode(dm_data.encode('utf-8'))
    dm_image = Image.frombytes('RGB', (encoded.width, encoded.height), encoded.pixels)

    dm_size = 450
    dm_image = dm_image.resize((dm_size, dm_size))
    label.paste(dm_image, (100, LABEL_HEIGHT - dm_size - 15))

    img_io = io.BytesIO()
    label.save(img_io, 'PNG', resolution=100.0)
    img_io.seek(0)

    return send_file(img_io, mimetype='application/png', as_attachment=True, download_name="Etiquette-palette.png")

