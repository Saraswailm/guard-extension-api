const url = window.location.href;

fetch("https://guard-extension-api.onrender.com/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url })
})
.then(response => response.json())
.then(data => {
  if (data.result === 1) {
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
    `;

    const title = document.createElement("div");
    title.innerHTML = `<span style="font-weight: bold; font-size: 20px; color: white;">🛡️ FISHIX</span>`;
    title.style.marginBottom = "10px";
    box.appendChild(title);

    const message = document.createElement("div");
    message.innerHTML = "<strong>⚠️ This site may be a phishing website!</strong>";
    message.style = `
      background: #ffcccc;
      color: #660000;
      border-radius: 10px;
      padding: 10px;
      margin-top: 12px;
      font-size: 16px;
      text-align: center;
    `;

    const centerWarning = message.cloneNode(true);
    centerWarning.style.position = "fixed";
    centerWarning.style.top = "50%";
    centerWarning.style.left = "50%";
    centerWarning.style.transform = "translate(-50%, -50%)";
    centerWarning.style.zIndex = "99999";
    document.body.appendChild(centerWarning);
    box.appendChild(message);

    const buttons = document.createElement("div");
    buttons.style = `
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 15px;
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
  .catch(err => console.error("Phishing check error:", err));
})();

