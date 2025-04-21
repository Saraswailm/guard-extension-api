// content.js
const url = window.location.href;

fetch("https://guard-extension-api.onrender.com/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ url: url })
})
  .then(response => response.json())
  .then(data => {
    if (data.result === 1) {
      // Pause user interaction visually
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.backgroundColor = "rgba(153, 0, 0, 0.7)";
      overlay.style.backdropFilter = "blur(5px)";
      overlay.style.zIndex = "99998";
      document.body.appendChild(overlay);

      // Main phishing alert box
      const box = document.createElement("div");
      box.style.position = "fixed";
      box.style.top = "20px";
      box.style.right = "20px";
      box.style.padding = "20px";
      box.style.borderRadius = "16px";
      box.style.background = "linear-gradient(to right, #420000, #a42121)";
      box.style.color = "#fff";
      box.style.zIndex = "99999";
      box.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.4)";

      // Title
      const title = document.createElement("div");
      title.style.fontSize = "20px";
      title.style.fontWeight = "bold";
      title.innerHTML = "🛡️ FISHIX";
      box.appendChild(title);

      // Warning message
      const message = document.createElement("div");
      message.innerHTML = "<strong>⚠️ This site may be a phishing website!</strong>";
      message.style.background = "#f8cccc";
      message.style.color = "#660000";
      message.style.borderRadius = "10px";
      message.style.padding = "10px";
      message.style.marginTop = "12px";
      message.style.fontSize = "16px";
      message.style.textAlign = "center";
      box.appendChild(message);

      // Buttons
      const buttons = document.createElement("div");
      buttons.style.display = "flex";
      buttons.style.justifyContent = "center";
      buttons.style.gap = "10px";
      buttons.style.marginTop = "15px";

      const blockBtn = document.createElement("button");
      blockBtn.textContent = "Block";
      blockBtn.style.background = "#ff4d4d";
      blockBtn.style.border = "none";
      blockBtn.style.color = "#fff";
      blockBtn.style.padding = "8px 16px";
      blockBtn.style.borderRadius = "8px";
      blockBtn.style.fontWeight = "bold";
      blockBtn.onclick = () => {
        document.body.innerHTML = "";
        document.write("<h1 style='text-align:center; margin-top:20%; color:white;'>❌ Access Blocked by FISHIX</h1>");
        document.body.style.backgroundColor = "#550000";
      };

      const allowBtn = document.createElement("button");
      allowBtn.textContent = "Allow";
      allowBtn.style.background = "#ccc";
      allowBtn.style.border = "none";
      allowBtn.style.padding = "8px 16px";
      allowBtn.style.borderRadius = "8px";
      allowBtn.style.fontWeight = "bold";
      allowBtn.onclick = () => {
        box.remove();
        overlay.remove();
      };

      buttons.appendChild(blockBtn);
      buttons.appendChild(allowBtn);
      box.appendChild(buttons);
      document.body.appendChild(box);
    }
  })
  .catch(err => console.error("Phishing check error:", err));