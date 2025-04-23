import re
import math
from collections import Counter

# 🧠 Entropy calculation
def calc_entropy(string):
    counter = Counter(string)
    probs = [count / len(string) for count in counter.values()]
    return -sum(p * math.log2(p) for p in probs)

# 🔍 Feature extractor (used by ML)
def extract_ml_features(url):
    return [
        len(url),
        url.count('.'),
        url.count('-'),
        int(bool(re.search(r'\d+\.\d+\.\d+\.\d+', url))),
        int("@" in url),
        calc_entropy(url)
    ]

# 🔪 Rule-based detection (simple logic)
def rule_based_detection(url):
    score = 0
    if url.count('@') > 0: score += 1
    if url.count('-') > 3: score += 1
    if url.count('=') > 3: score += 1
    if re.search(r"(login|verify|secure|update|bank)", url, re.IGNORECASE): score += 1
    return score >= 2  # Return True if suspicious

# 🚫 Blacklist check
BLACKLIST = [
    "bit.ly", "tinyurl.com", "phishingsite.com", "badlink.xyz"
]

def is_blacklisted(url):
    return any(bad in url for bad in BLACKLIST)
