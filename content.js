const url = window.location.href;

fetch("https://guard-extension-api.onrender.com/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ url: url })
})
  .then(response => response.json())
  .then(data => {
    if (data.result === 1) {
      // Blur background
      document.body.style.filter = "blur(6px)";
      document.body.style.pointerEvents = "none";

      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.backgroundColor = "rgba(88, 8, 8, 0.6)";
      overlay.style.zIndex = 99998;
      overlay.id = "fishix-overlay";
      document.body.appendChild(overlay);

      // Warning popup
      const popup = document.createElement("div");
      popup.style.position = "fixed";
      popup.style.top = "20px";
      popup.style.right = "20px";
      popup.style.background = "linear-gradient(to bottom right, #330000, #aa2e2e)";
      popup.style.padding = "16px 20px";
      popup.style.borderRadius = "15px";
      popup.style.boxShadow = "0px 4px 16px rgba(0,0,0,0.25)";
      popup.style.zIndex = 99999;
      popup.style.color = "#fff";
      popup.style.fontFamily = "Arial, sans-serif";
      popup.style.minWidth = "280px";

      popup.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <img src="logo.png" alt="Fishix" style="width: 20px; height: 20px;">
          <strong style="font-size: 16px;">FISHIX</strong>
        </div>
        <div style="margin-bottom: 10px; background-color: #f9cccc; color: #7a0000; padding: 10px; border-radius: 8px;">
          ⚠️ This site may be a phishing website!
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="blockBtn" style="padding: 6px 12px; background-color: #e53935; border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer;">Block</button>
          <button id="allowBtn" style="padding: 6px 12px; background-color: #ccc; border: none; border-radius: 6px; color: #333; font-weight: bold; cursor: pointer;">Allow</button>
        </div>
      `;

      document.body.appendChild(popup);

      document.getElementById("blockBtn").onclick = () => {
        window.location.href = "about:blank";
      };
      document.getElementById("allowBtn").onclick = () => {
        popup.remove();
        overlay.remove();
        document.body.style.filter = "none";
        document.body.style.pointerEvents = "auto";
      };
    }
  })
  .catch(err => {
    console.error("Phishing check error:", err);
  });
