from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import base64
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    temp_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(temp_path)

    try:
        with open(temp_path, 'rb') as f:
            base64_image = base64.b64encode(f.read()).decode('utf-8')

        payload = {
            "model": "llava",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                    "type": "text",
                    "text": "List all food items in this image. Only output the comma-separated names without additional descriptions. Example: apple, banana, bread. Do not contains any other description, verbs, subjects, objects, or any sentences. Don not display any words like ,The, image, shows, a, variety, of, fruits, and, vegetables, arranged, in, baskets, on, a, table, separated, list, of, fruit, names. There are several.The results only contains the food name."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.0,
            "max_tokens": 50
        }

        response = requests.post(
            "https://play-hahaha-zone.duckdns.org/v1/chat/completions",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        response.raise_for_status()
        analysis = response.json()['choices'][0]['message']['content']
        return jsonify({'analysis': analysis})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)