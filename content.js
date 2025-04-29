// Function to check whitelist/blacklist
function checkUrlAgainstLists(url) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["whitelist", "blacklist"], (data) => {
      const whitelist = data.whitelist || [];
      const blacklist = data.blacklist || [];

      if (blacklist.some(domain => url.includes(domain))) {
        resolve("blacklist");
      } else if (whitelist.some(domain => url.includes(domain))) {
        resolve("whitelist");
      } else {
        resolve("none");
      }
    });
  });
}

// Main execution
(function () {
  const url = window.location.href;

  // 🚫 Skip internal extension pages
  if (url.startsWith("chrome-extension://")) {
    console.log("Skipping internal Chrome extension pages.");
    return;
  }

  checkUrlAgainstLists(url).then((listResult) => {
    if (listResult === "blacklist") {
      console.log("🚨 Blacklisted site detected.");
      return;
    } else if (listResult === "whitelist") {
      console.log("✅ Whitelisted site detected.");
      return;
    } else {
      // 🛡️ Not in list → Check with ML model
      fetch("https://guard-extension-api.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      })
      .then(response => {
        if (!response || !response.ok || !response.headers) {
          throw new Error("No valid response received.");
        }
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("Invalid content type from server.");
        }
        return response.json();
      })
      .then(data => {
        if (data.result === 1) {
          // 🔴 Phishing Detected
          const overlay = document.createElement("div");
          overlay.style = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(153, 0, 0, 0.8);
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
          title.innerHTML = `<span style="font-weight: bold; font-size: 20px;">🛡 FISHIX</span>`;
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
            cursor: pointer;
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
            cursor: pointer;
          `;
          allowBtn.onclick = () => {
            box.remove();
            overlay.remove();
          };

          buttons.appendChild(blockBtn);
          buttons.appendChild(allowBtn);
          box.appendChild(buttons);
          document.body.appendChild(box);

        } else if (data.result === 0) {
          // ✅ Safe Site Detected
          const safeBox = document.createElement("div");
          safeBox.style = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 20px;
            border-radius: 16px;
            background: linear-gradient(to right, #003300, #00cc66);
            color: #fff;
            z-index: 99999;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          `;
          safeBox.textContent = "✅ This site is safe";
          document.body.appendChild(safeBox);

          // Auto-hide after 4 seconds
          setTimeout(() => {
            safeBox.remove();
          }, 4000);
        }
      })
      .catch(err => {
        console.error("Phishing check error:", err.message);

        const errorBox = document.createElement("div");
        errorBox.textContent = "⚠️ Unable to classify site (network error)";
        errorBox.style = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #555;
          color: white;
          padding: 12px 16px;
          border-radius: 10px;
          z-index: 99999;
          font-weight: bold;
        `;
        document.body.appendChild(errorBox);

        setTimeout(() => errorBox.remove(), 4000);
      });
    }
  });
})();
