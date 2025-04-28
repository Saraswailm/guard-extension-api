// Load existing whitelist and blacklist
function loadLists() {
  chrome.storage.local.get(["whitelist", "blacklist"], (data) => {
    const whitelist = data.whitelist || [];
    const blacklist = data.blacklist || [];

    const whitelistElement = document.getElementById("whitelist");
    const blacklistElement = document.getElementById("blacklist");

    whitelistElement.innerHTML = "";
    whitelist.forEach(domain => {
      const li = document.createElement("li");
      li.textContent = domain;
      whitelistElement.appendChild(li);
    });

    blacklistElement.innerHTML = "";
    blacklist.forEach(domain => {
      const li = document.createElement("li");
      li.textContent = domain;
      blacklistElement.appendChild(li);
    });
  });
}

// Add to whitelist
document.getElementById("addWhitelistBtn").addEventListener("click", () => {
  const domain = document.getElementById("whitelistInput").value.trim();
  if (domain) {
    chrome.storage.local.get(["whitelist"], (data) => {
      const whitelist = data.whitelist || [];
      whitelist.push(domain);
      chrome.storage.local.set({ whitelist }, loadLists);
    });
  }
});

// Add to blacklist
document.getElementById("addBlacklistBtn").addEventListener("click", () => {
  const domain = document.getElementById("blacklistInput").value.trim();
  if (domain) {
    chrome.storage.local.get(["blacklist"], (data) => {
      const blacklist = data.blacklist || [];
      blacklist.push(domain);
      chrome.storage.local.set({ blacklist }, loadLists);
    });
  }
});

// Initialize on page load
loadLists();
