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

# --- CONFIGURATION ---
# Replace the API_KEY and API_SECRET with your actual strings from Cloudinary
cloudinary.config( 
  cloud_name = "dpf9ahkft", 
  api_key = "715742843611293", 
  api_secret = "w7D3JKykv_PVaFRD84DRP_56hIM",
  secure = True
)

MODEL_NAME = "prithivMLmods/Realistic-Gender-Classification"
model = SiglipForImageClassification.from_pretrained(MODEL_NAME)
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)

@app.route('/classify', methods=['POST'])
def classify():
    try:
        data = request.get_json()
        print(f"Incoming Request: {data}") 

        image_url = data.get('url')
        public_id = data.get('public_id')

        if not image_url:
            return jsonify({"error": "No URL provided"}), 

        response = requests.get(image_url, timeout=10)
        img = Image.open(BytesIO(response.content)).convert("RGB")
        
        inputs = processor(images=img, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=1).squeeze().tolist()

        gender = "female" if probs[0] > probs[1] else "male"
        print(f"Result: {gender}")

        if public_id:
            try:
                cloudinary.uploader.destroy(public_id)
                print(f"Cloudinary file deleted: {public_id}")
            except Exception as e:
                print(f"Cloudinary deletion failed (ignoring): {e}")
        
        return jsonify({"gender": gender, "status": "success"})

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)