const VIRUSTOTAL_API_KEY = "dccc3bf97a1defecb7007a878fe065cbbb2a8460a790d4a510d82e7b4237f251";
const BLACKLIST = ["bit.ly", "tinyurl.com", "phishingsite.com", "badlink.xyz"];

// Rule-based check
function ruleBasedDetection(url) {
  let score = 0;
  if (url.includes("@")) score++;
  if ((url.match(/-/g) || []).length > 3) score++;
  if ((url.match(/=/g) || []).length > 3) score++;
  if (/login|verify|secure|update|bank/i.test(url)) score++;
  return score >= 2;
}

// Blacklist check
function isBlacklisted(url) {
  return BLACKLIST.some((domain) => url.includes(domain));
}

// ML API call — now returns full object if phishing
async function checkMLModel(url) {
  try {
    const res = await fetch("https://guard-extension-api.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await res.json();

    return data.result === 1 ? data : null;
  } catch (err) {
    console.error("ML API error:", err);
    return null;
  }
}

// Unified decision engine
async function decideUrlFate(url) {
  if (isBlacklisted(url)) {
    return { source: "Blacklist", url };
  }

  if (ruleBasedDetection(url)) {
    return { source: "Rule-based", url };
  }

  const mlResult = await checkMLModel(url);
  if (mlResult) {
    return {
      source: mlResult.source,
      confidence: mlResult.confidence,
      tags: mlResult.tags ? mlResult.tags.join(", ") : "",
      engines: mlResult.engines || 0,
      url
    };
  }

  return null;
}

// Core interception logic (onBeforeRequest)
chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    const url = details.url;
    const verdict = await decideUrlFate(url);

    if (verdict) {
      // Save to local history
      chrome.storage.local.get({ history: [] }, (result) => {
        const history = result.history;
        history.unshift({
          url,
          source: verdict.source,
          time: new Date().toLocaleString()
        });
        chrome.storage.local.set({ history: history.slice(0, 20) });
      });

      // Construct query parameters for warning.html
      const params = new URLSearchParams();
      params.set("source", verdict.source);
      params.set("url", encodeURIComponent(verdict.url));
      if (verdict.confidence) params.set("confidence", verdict.confidence);
      if (verdict.tags) params.set("tags", verdict.tags);
      if (verdict.engines !== undefined) params.set("engines", verdict.engines);

      return {
        redirectUrl: chrome.runtime.getURL("warning.html") + "?" + params.toString()
      };
    }

    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
