
const url = window.location.href;

fetch("https://guard-extension-api.onrender.com/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url })
})
.then(res => res.json())
.then(data => {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = data.result === 1 ? "⚠️ Phishing detected!" : "✅ This site appears safe.";
})
.catch(() => {
  document.getElementById("status").textContent = "❌ Error checking URL.";
});
