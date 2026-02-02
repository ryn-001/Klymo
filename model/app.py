import os
import torch
import requests
from io import BytesIO
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
import cloudinary
import cloudinary.uploader
from transformers import AutoImageProcessor, SiglipForImageClassification

app = Flask(__name__)
CORS(app)

cloudinary.config( 
  cloud_name = "dpf9ahkft", 
  api_key = "715742843611293", 
  api_secret = "w7D3JKykv_PVaFRD84DRP_56hIM",
  secure = True
)

# cloudinary.config( 
#     cloud_name = os.environ.get("CLOUDINARY_NAME"), 
#     api_key = os.environ.get("CLOUDINARY_KEY"), 
#     api_secret = os.environ.get("CLOUDINARY_SECRET"),
#     secure = True
# )

MODEL_NAME = "prithivMLmods/Realistic-Gender-Classification"
model = SiglipForImageClassification.from_pretrained(MODEL_NAME)
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)

@app.route('/classify', methods=['POST'])
def classify():
    try:
        data = request.get_json()
        image_url = data.get('url')
        public_id = data.get('public_id')

        if not image_url:
            return jsonify({"error": "No URL provided"}), 400

        response = requests.get(image_url, timeout=10)
        img = Image.open(BytesIO(response.content)).convert("RGB")
        
        inputs = processor(images=img, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=1).squeeze().tolist()

        gender = "female" if probs[0] > probs[1] else "male"

        if public_id:
            try:
                cloudinary.uploader.destroy(public_id)
            except:
                pass
        
        return jsonify({
            "gender": gender, 
            "confidence": max(probs),
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 7860))
    app.run(host='0.0.0.0', port=port)