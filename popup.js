// popup.js

document.addEventListener('DOMContentLoaded', function () {
  const statusEl = document.getElementById("status");

  // STEP 1: Fetch URL and run prediction
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    fetch("https://guard-extension-api.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    })
    .then(response => {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return response.json();
      } else {
        throw new Error("Invalid JSON response");
      }
    })
    .then(data => {
      if (data.result === "phishing") {
        statusEl.textContent = "⚠️ Phishing detected!";
        statusEl.style.background = "#8B0000";
      } else {
        statusEl.textContent = "✅ Safe site";
        statusEl.style.background = "#006400";
      }
    })
    .catch(err => {
      statusEl.textContent = "⚠️ Error checking site";
      statusEl.style.background = "#444";
      console.error("Prediction error:", err);
    });
  });

  // STEP 2: Add Open Settings button
  const settingsButton = document.createElement("button");
  settingsButton.textContent = "Open Settings (Whitelist/Blacklist)";
  settingsButton.style = `
    background: #ffcccc;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: bold;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
  `;
  settingsButton.onclick = function () {
    chrome.runtime.openOptionsPage();
  };

  document.body.appendChild(settingsButton);
});
