// background.js
console.log("Drive Direct to PDF — background ready");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === "RUN_INJECT") {
    const tabId = sender.tab && sender.tab.id;
    if (!tabId) {
      sendResponse({ ok: false, err: "No tabId" });
      return;
    }

    // Inject pdf-lib UMD first, then inject.js which uses the global PDFLib
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["pdf-lib.umd.min.js"]
    }, () => {
      // ignore errors for pdf-lib load; then inject the main script
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["inject.js"]
      }, () => {
        sendResponse({ ok: true });
      });
    });

    // Required for async sendResponse
    return true;
  }
});
