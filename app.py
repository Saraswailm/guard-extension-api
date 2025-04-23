from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import requests
import base64
from utils import extract_ml_features, rule_based_detection, is_blacklisted

app = Flask(__name__)
CORS(app)
import os
import joblib
import requests

MODEL_URL = "https://huggingface.co/sarasw/fishix-phishing-detector/resolve/main/phishing_model.pkl?download=true"

# Download the model if it's not already present
if not os.path.exists("phishing_model.pkl"):
    print("🔽 Downloading phishing model from Hugging Face...")
    r = requests.get(MODEL_URL)
    with open("phishing_model.pkl", "wb") as f:
        f.write(r.content)


model = joblib.load("phishing_model.pkl")

VT_API_KEY = "YOUR_VIRUSTOTAL_API_KEY"  # Replace with your real key

def get_virustotal_data(url):
    headers = {
        "x-apikey": VT_API_KEY
    }

    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"

    try:
        response = requests.get(api_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            stats = data["data"]["attributes"].get("last_analysis_stats", {})
            malicious_engines = stats.get("malicious", 0)
            suspicious_engines = stats.get("suspicious", 0)
            tags = data["data"]["attributes"].get("tags", [])
            return {
                "malicious": malicious_engines,
                "suspicious": suspicious_engines,
                "tags": tags
            }
    except Exception as e:
        print(f"[VirusTotal Error] {e}")
    
    return None

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    url = data.get("url", "")

    try:
        response = requests.get(url, timeout=5, allow_redirects=True)
        final_url = response.url
        print(f"[INFO] Final resolved URL: {final_url}")
    except requests.exceptions.RequestException:
        final_url = url
        print(f"[ERROR] Failed to fetch URL. Using original: {url}")

    # Combine rule-based + blacklist detection
    rule_tags = []
    if rule_based_detection(final_url):
        rule_tags.append("Triggered rule-based detection")
        return jsonify({
            "result": 1,
            "source": "Rule-based",
            "tags": rule_tags
        })

    if is_blacklisted(final_url):
        rule_tags.append("Found in blacklist")
        return jsonify({
            "result": 1,
            "source": "Blacklist",
            "tags": rule_tags
        })

    # ML prediction + confidence
    features = [extract_ml_features(final_url)]
    prediction = model.predict(features)[0]
    proba = model.predict_proba(features)[0][1]

    # Get VirusTotal threat intelligence
    vt_result = get_virustotal_data(final_url)
    vt_tags = vt_result.get("tags", []) if vt_result else []
    malicious_count = vt_result.get("malicious", 0) if vt_result else 0

    # Merge tags
    combined_tags = rule_tags + vt_tags

    return jsonify({
        "result": int(prediction),
        "source": "ML + VT",
        "confidence": round(proba, 2),
        "tags": combined_tags,
        "engines": malicious_count
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
