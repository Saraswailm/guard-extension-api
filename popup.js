// popup.js

document.addEventListener('DOMContentLoaded', function () {
  const settingsButton = document.createElement('button');
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
