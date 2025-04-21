const url = window.location.href;

fetch("https://guard-extension-api.onrender.com/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: url })
})
.then(response => response.json())
.then(data => {
  console.log("🧠 Model prediction result:", data);
  if (data.result === 1) {
    const banner = document.createElement("div");
    banner.textContent = "⚠️ Warning: This site may be a phishing website!";
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.right = "0";
    banner.style.padding = "15px";
    banner.style.backgroundColor = "#ffcccc";
    banner.style.color = "#8b0000";
    banner.style.fontSize = "16px";
    banner.style.fontWeight = "bold";
    banner.style.textAlign = "center";
    banner.style.zIndex = "99999";
    document.body.prepend(banner);
  }
})
.catch(err => console.error("Phishing check error:", err));

