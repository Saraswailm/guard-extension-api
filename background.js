let pausedRequest = null;

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    if (details.type === "main_frame") {
      pausedRequest = details;
      chrome.tabs.sendMessage(details.tabId, { action: "phishing-check", url: details.url });
      return { cancel: true }; // Cancel temporarily
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "user-decision" && pausedRequest) {
    if (msg.allow) {
      chrome.tabs.update(pausedRequest.tabId, { url: pausedRequest.url });
    } else {
      chrome.tabs.update(pausedRequest.tabId, { url: "about:blank" });
    }
    pausedRequest = null;
  }
});
