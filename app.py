from flask import Flask, request, jsonify
from urllib.parse import urlparse
import joblib
import re

app = Flask(__name__)
model = joblib.load("phishing_model.pkl")

def extract_features(url):
    if not url or len(url.strip()) == 0:
        return [0] * 12  # Return a default zero-vector

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

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get("url", "")
    features = [extract_features(url)]
    prediction = model.predict(features)[0]
    return jsonify({"result": int(prediction)})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)

