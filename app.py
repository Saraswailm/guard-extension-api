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
model = joblib.load("phishing_model_xgb.pkl")
EXPECTED_FEATURES_COUNT = 12

# VirusTotal API Key
VT_API_KEY = "dccc3bf97a1defecb7007a878fe065cbbb2a8460a790d4a510d82e7b4237f251"

# --- Helper Functions ---

def rule_based_detection(url):
    signs = [
        bool(re.search(r'\d+\.\d+\.\d+\.\d+', url)),  # IP in URL
        '@' in url,
        url.count('//') > 1,
        '-' in url,
        len(url) > 75
    ]
    return any(signs)

def heuristic_based_detection(url):
    suspicious_keywords = ['secure', 'account', 'update', 'login', 'free', 'verify', 'password', 'banking']
    return any(keyword in url.lower() for keyword in suspicious_keywords)

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

        url = data.get("url", "")
        features = data.get("features", [])

        if not url or not features or len(features) != EXPECTED_FEATURES_COUNT:
            return jsonify({"error": "Invalid input format"}), 400

        # Machine Learning
        ml_prediction = model.predict([features])[0]

        # Rule-Based Detection
        rule_flag = rule_based_detection(url)

        # Heuristic-Based Detection
        heuristic_flag = heuristic_based_detection(url)

        # VirusTotal Check
        vt_malicious, vt_suspicious = virus_total_check(url)
        vt_flag = 1 if (vt_malicious + vt_suspicious) > 0 else 0

        # --- Final Decision ---
        if any([ml_prediction, rule_flag, heuristic_flag, vt_flag]):
            final_decision = "phishing"
        else:
            final_decision = "benign"

        # 🐟 Debug
        print("🐟 FINAL DECISION DEBUG")
        print("URL →", url)
        print("ML:", ml_prediction)
        print("RULE:", rule_flag)
        print("HEURISTIC:", heuristic_flag)
        print("VT:", vt_flag)
        print("→ Final:", final_decision)

        return jsonify({
            "final_decision": final_decision
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
