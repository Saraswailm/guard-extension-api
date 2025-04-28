from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from urllib.parse import urlparse
import re

app = Flask(__name__)
CORS(app)  # Allow cross-origin access for Chrome Extension

# Load the saved model once
model = joblib.load("phishing_model_xgb.pkl")

# Define the same feature extractor
def extract_features(url):
    try:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        path = parsed_url.path

        return [
            len(url),
            url.count('.'),
            url.count('-'),
            url.count('@'),
            url.count('//'),
            len(domain),
            len(path),
            sum(c.isdigit() for c in url) / len(url) if len(url) > 0 else 0,
            sum(c in "-_/@?&=" for c in url) / len(url) if len(url) > 0 else 0,
            domain.count('.'),
            int(bool(re.search(r"bit\.ly|tinyurl|t\.co", url))),
            int(bool(re.search(r"login|secure|bank|verify", url, re.IGNORECASE)))
        ]
    except Exception as e:
        return [0] * 12  # safe fallback features

# API endpoint for prediction
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        url = data.get('url', '')
        if not url:
            return jsonify({'error': 'No URL provided'}), 400
        
        features = [extract_features(url)]
        prediction = model.predict(features)[0]  # 1 = phishing, 0 = benign

        return jsonify({'result': int(prediction)})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
