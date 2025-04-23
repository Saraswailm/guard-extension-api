const url = window.location.href;
const whitelist = ["github.com", "google.com", "microsoft.com"];

function isWhitelisted(url) {
  return whitelist.some(domain => url.includes(domain));
}

if (isWhitelisted(url)) {
  console.log("✅ Whitelisted site detected.");
  return; // Skip warning or prediction
}

fetch("https://guard-extension-api.onrender.com/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url })
})
.then(response => response.json())
.then(data => {
  if (data.result === 1) {
    // Red overlay
    const overlay = document.createElement("div");
    overlay.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(153, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      z-index: 99998;
    `;
    document.body.appendChild(overlay);

    // Center warning message (in the middle of the screen)
    const centerWarning = document.createElement("div");
    centerWarning.innerHTML = "<strong>⚠️ This site may be a phishing website!</strong>";
    centerWarning.style = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffcccc;
      color: #660000;
      border-radius: 10px;
      padding: 10px 20px;
      font-size: 16px;
      text-align: center;
      z-index: 99999;
      font-weight: bold;
    `;
    document.body.appendChild(centerWarning);

    // Top right popup box
    const box = document.createElement("div");
    box.style = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 20px;
      border-radius: 16px;
      background: linear-gradient(to right, #420000, #a42121);
      color: #fff;
      z-index: 99999;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
      max-width: 300px;
    `;

    const title = document.createElement("div");
    title.innerHTML = `<span style="font-weight: bold; font-size: 20px; color: white;">🛡️ FISHIX</span>`;
    title.style.marginBottom = "10px";
    box.appendChild(title);

    const popupMessage = document.createElement("div");
    popupMessage.innerHTML = "⚠️ This site may be a phishing website!";
    popupMessage.style = `
      background: #ffcccc;
      color: #660000;
      border-radius: 8px;
      padding: 8px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
    `;
    box.appendChild(popupMessage);

    const buttons = document.createElement("div");
    buttons.style = `
      display: flex;
      justify-content: center;
      gap: 10px;
    `;

    const blockBtn = document.createElement("button");
    blockBtn.textContent = "Block";
    blockBtn.style = `
      background: #ff4d4d;
      border: none;
      color: #fff;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
    `;
    blockBtn.onclick = () => {
      document.body.innerHTML = "";
      document.write("<h1 style='text-align:center; margin-top:20%; color:white;'>❌ Access Blocked by FISHIX</h1>");
      document.body.style.backgroundColor = "#550000";
    };

    const allowBtn = document.createElement("button");
    allowBtn.textContent = "Allow";
    allowBtn.style = `
      background: #ccc;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
    `;
    allowBtn.onclick = () => {
      box.remove();
      overlay.remove();
      centerWarning.remove();
    };

    buttons.appendChild(blockBtn);
    buttons.appendChild(allowBtn);
    box.appendChild(buttons);
    document.body.appendChild(box);
  }
})
.catch(err => console.error("Phishing check error:", err));
