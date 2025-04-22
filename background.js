chrome.webRequest.onBeforeRequest.addListener(
    async function(details) {
      const url = details.url;
  
      try {
        const response = await fetch("https://guard-extension-api.onrender.com/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url })
        });
  
        const result = await response.json();
  
        if (result.result === 1) {
          await chrome.storage.local.set({ blockedUrl: url });
          return { redirectUrl: chrome.runtime.getURL("warning.html") };
        }
  
      } catch (err) {
        console.error("Detection failed:", err);
      }
  
      return {};
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
  