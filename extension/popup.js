chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const url = tabs[0].url;
  const statusDiv = document.getElementById("status");

  fetch("https://guard-extension-api.onrender.com/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url: url }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.result === 1) {
        statusDiv.textContent = "This site may be a phishing website!";
        statusDiv.className = "status phishing";
      } else {
        statusDiv.textContent = "This site looks safe.";
        statusDiv.className = "status safe";
      }
    })
    .catch((err) => {
      console.error("Extension popup error:", err);
      statusDiv.textContent = "Error scanning site.";
      statusDiv.className = "status phishing";
    });
});
