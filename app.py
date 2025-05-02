from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64

app = Flask(__name__)
CORS(app)

# API Keys
VT_API_KEY = "dccc3bf97a1defecb7007a878fe065cbbb2a8460a790d4a510d82e7b4237f251"
OTX_API_KEY = "28e5d08ae71af68fa0ca60042c861036e6171440f0050d8af1016688fc60003b"

# === VirusTotal Check ===
def virus_total_check(url):
    try:
        headers = {"x-apikey": VT_API_KEY}
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
        response = requests.get(api_url, headers=headers, timeout=5)

        if response.status_code == 200:
            data = response.json()
            stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            return malicious, suspicious
    except Exception as e:
        print(f"[VirusTotal error] {e}")
    return None, None

# === OTX Check ===
def otx_check(url):
    try:
        headers = {"X-OTX-API-KEY": OTX_API_KEY}
        api_url = f"https://otx.alienvault.com/api/v1/indicators/url/{url}/general"
        response = requests.get(api_url, headers=headers, timeout=5)

        if response.status_code == 200:
            data = response.json()
            pulses = data.get("pulse_info", {}).get("count", 0)
            return pulses > 0
    except Exception as e:
        print(f"[OTX error] {e}")
    return False

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
                return jsonify({
                    "final_decision": "phishing",
                    "flagged_by": "VirusTotal"
                })
            else:
                return jsonify({
                    "final_decision": "benign",
                    "flagged_by": "VirusTotal (clean)"
                })

        # Step 2: OTX if VT failed
        if otx_check(url):
            return jsonify({
                "final_decision": "phishing",
                "flagged_by": "OTX"
            })

        return jsonify({
            "final_decision": "unknown",
            "flagged_by": "No signal from VT or OTX"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
