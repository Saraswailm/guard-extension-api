from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import re
import joblib

app = Flask(__name__)
CORS(app)

# === API Keys ===
VT_API_KEY = "dccc3bf97a1defecb7007a878fe065cbbb2a8460a790d4a510d82e7b4237f251"
OTX_API_KEY = "3512568d10a6c6a7ad7ea04e5369a6aec5f1febc3e8f542ec3fe1d291bb40f6a"

# === Load ML Model ===
ml_model = joblib.load("phishing_model_xgb.pkl")

# === Feature Extraction (simple example, replace with your full 89 features) ===
def extract_features(url):
    return [
        len(url),
        url.count('-'),
        url.count('='),
        int('https' in url),
    ]

# === VirusTotal Check ===
def virus_total_check(url):
    try:
        headers = {"x-apikey": VT_API_KEY}
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
        response = requests.get(api_url, headers=headers, timeout=5)
        if response.status_code == 200:
            stats = response.json().get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
            return stats.get("malicious", 0), stats.get("suspicious", 0)
    except Exception as e:
        print(f"[VirusTotal error] {e}")
    return None, None

# === OTX Check ===
def otx_check(url):
    try:
        headers = {"X-OTX-API-KEY": OTX_API_KEY}
        otx_url = f"https://otx.alienvault.com/api/v1/indicators/url/{url}/general"
        response = requests.get(otx_url, headers=headers, timeout=5)
        if response.status_code == 200:
            pulses = response.json().get("pulse_info", {}).get("count", 0)
            return pulses > 0
    except Exception as e:
        print(f"[OTX error] {e}")
    return False

# === Rule-Based Detection ===
def rule_based_detection(url):
    return any([
        len(url) > 120,
        url.count('-') > 6,
        url.count('=') > 5
    ])

# === Heuristic-Based Detection ===
def heuristic_based_detection(url):
    keywords = ['secure-login', 'bank-update', 'validate-account', 'signin-verification']
    return any(kw in url.lower() for kw in keywords)

# === Prediction Endpoint ===
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        url = data.get("url", "")
        if not url:
            return jsonify({"error": "Missing URL"}), 400

        # Step 1: VirusTotal
        vt_malicious, vt_suspicious = virus_total_check(url)
        if vt_malicious is not None:
            if vt_malicious + vt_suspicious > 0:
                return jsonify({"final_decision": "phishing", "flagged_by": "VirusTotal"})
            else:
                return jsonify({"final_decision": "benign", "flagged_by": "VirusTotal (clean)"})

        # Step 2: OTX (if VT failed)
        otx_result = otx_check(url)
        if otx_result:
            return jsonify({"final_decision": "phishing", "flagged_by": "OTX pulse"})

        # Step 3: Rule + Heuristic
        rule = rule_based_detection(url)
        heuristic = heuristic_based_detection(url)
        if rule and heuristic:
            return jsonify({"final_decision": "phishing", "flagged_by": "Heuristic + Rule"})

        # Step 4: ML fallback (only if all above checks didn't flag it)
        features = extract_features(url)
        ml_prediction = ml_model.predict([features])[0]
        if ml_prediction == 1:
            return jsonify({"final_decision": "phishing", "flagged_by": "ML model"})
        else:
            return jsonify({"final_decision": "benign", "flagged_by": "ML model"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === Run App ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)

