from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import requests
import base64
import re
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

# Load ML model
model = joblib.load("phishing_model_structured.pkl")
EXPECTED_FEATURES_COUNT = 89

# Your VirusTotal API key
VT_API_KEY = "dccc3bf97a1defecb7007a878fe065cbbb2a8460a790d4a510d82e7b4237f251"

# --- Helper Functions ---

# Rule-based detection
def rule_based_detection(url):
    signs = [
        bool(re.search(r'\d+\.\d+\.\d+\.\d+', url)),  # IP in URL
        '@' in url,
        url.count('//') > 1,
        '-' in url,
        len(url) > 75
    ]
    return any(signs)

# Heuristic-based detection
def heuristic_based_detection(url):
    suspicious_keywords = ['secure', 'account', 'update', 'login', 'free', 'verify', 'password', 'banking']
    return any(keyword in url.lower() for keyword in suspicious_keywords)

# VirusTotal lookup
def virus_total_check(url):
    try:
        headers = {"x-apikey": VT_API_KEY}
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
        response = requests.get(api_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            stats = data["data"]["attributes"].get("last_analysis_stats", {})
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            return malicious, suspicious
    except Exception as e:
        print(f"[VirusTotal error] {e}")
    return 0, 0

# --- API Endpoint ---
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Handle missing input
        url = data.get("url", "")
        features = data.get("features", [])

        if not url or not features or len(features) != EXPECTED_FEATURES_COUNT:
            return jsonify({"error": "Invalid input format"}), 400

        result = {
            "machine_learning": None,
            "rule_based": None,
            "heuristic_based": None,
            "virus_total": None,
            "final_decision": None
        }

        # 1. Machine Learning
        ml_prediction = model.predict([features])[0]
        result["machine_learning"] = int(ml_prediction)

        # 2. Rule-Based Detection
        rule_flag = rule_based_detection(url)
        result["rule_based"] = int(rule_flag)

        # 3. Heuristic-Based Detection
        heuristic_flag = heuristic_based_detection(url)
        result["heuristic_based"] = int(heuristic_flag)

        # 4. VirusTotal Check
        vt_malicious, vt_suspicious = virus_total_check(url)
        vt_flag = 1 if (vt_malicious + vt_suspicious) > 0 else 0
        result["virus_total"] = vt_flag

        # --- Final Decision Logic ---
        # If any method flags as phishing, consider phishing
        if any([ml_prediction, rule_flag, heuristic_flag, vt_flag]):
            result["final_decision"] = "phishing"
        else:
            result["final_decision"] = "benign"

        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
