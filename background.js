chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(["whitelist", "blacklist"], (data) => {
        if (!data.whitelist) {
            chrome.storage.local.set({ whitelist: [] });
        }
        if (!data.blacklist) {
            chrome.storage.local.set({ blacklist: [] });
        }
    });
    console.log("Fishix extension installed and storage initialized.");
});
