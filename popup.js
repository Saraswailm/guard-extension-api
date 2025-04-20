chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const url = tabs[0].url;
  const resultDiv = document.getElementById("result");

  fetch("https://guard-extension-api.onrender.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url })
  })
  .then(response => {
    if (!response.ok) throw new Error("Bad response from server");
    return response.json();
  })
  .then(data => {
    if (data.result === 1) {
      resultDiv.textContent = "⚠️ Phishing Website!";
      resultDiv.className = "phishing";
    } else {
      resultDiv.textContent = "✅ Safe Website!";
      resultDiv.className = "safe";
    }
  })
  .catch(err => {
    resultDiv.textContent = "Error scanning site.";
    resultDiv.className = "phishing";
    console.error(err);
  });
});
