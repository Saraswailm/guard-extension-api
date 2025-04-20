import pandas as pd
import numpy as np
from urllib.parse import urlparse
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import re

# === Simulated df1 and df2 (replace with your real data if available) ===
df1 = pd.DataFrame({
    'url': ['http://example.com', 'https://secure-login.com'],
    'type': ['benign', 'phishing']
})

df2 = pd.DataFrame({
    'Domain': ['malicious-site.com', 'safeportal.com'],
    'Have_IP': [1, 0],
    'Have_At': [1, 0],
    'URL_Length': [28, 25],
    'URL_Depth': [3, 2],
    'Redirection': [1, 0],
    'https_Domain': [0, 1],
    'Label': [1, 0]
})

# === Preprocessing df1 ===
df1.columns = ['url', 'type']
df1['Have_IP'] = np.nan
df1['Have_At'] = np.nan
df1['URL_Length'] = df1['url'].apply(len)
df1['URL_Depth'] = df1['url'].apply(lambda x: x.count('/'))
df1['Redirection'] = 0
df1['https_Domain'] = df1['url'].apply(lambda x: 1 if x.startswith('https') else 0)
df1['Label'] = df1['type'].apply(lambda x: 1 if x == 'phishing' else 0)

# === Preprocessing df2 ===
df2['url'] = df2['Domain'].apply(lambda x: 'http://' + x)
df2 = df2[['url', 'Have_IP', 'Have_At', 'URL_Length', 'URL_Depth', 'Redirection', 'https_Domain', 'Label']]

# === Merge datasets ===
df = pd.concat([df1[['url', 'Have_IP', 'Have_At', 'URL_Length', 'URL_Depth', 'Redirection', 'https_Domain', 'Label']], df2], ignore_index=True)

# === Feature extraction ===
def extract_features(url):
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
        sum(c.isdigit() for c in url) / len(url),
        sum(c in "-_/@?&=" for c in url) / len(url),
        domain.count('.'),
        int(bool(re.search(r"bit\.ly|tinyurl|t\.co", url))),  # COMMA here is important ✅
        int(bool(re.search(r"login|secure|bank|verify", url, re.IGNORECASE)))  # ✅ Last line (no comma needed)
    ]


X = df['url'].apply(extract_features).tolist()
y = df['Label']

# === Train/test split ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === Train model ===
model = RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced")
model.fit(X_train, y_train)

# === Evaluate ===
y_pred = model.predict(X_test)
print("🔥 Model Accuracy:", accuracy_score(y_test, y_pred))

# === Save model ===
joblib.dump(model, "phishing_model.pkl")

# === Optional: Test prediction ===
def predict_url(url):
    features = [extract_features(url)]
    prediction = model.predict(features)
    return "🔴 Phishing" if prediction[0] == 1 else "🟢 Benign"

# Test example
test_url = "http://bit.ly/fakebank-login"
print(f"{test_url} → {predict_url(test_url)}")
