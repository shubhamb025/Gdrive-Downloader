// content.js
console.log("Drive Direct to PDF — content script loaded");

function isDrivePreview() {
  // broad detection for Drive PDF/image preview
  if (document.querySelector('pdf-viewer')) return true;
  if (document.querySelector('img[src^="blob:"]')) return true;
  if (document.querySelector('.kFq7Od')) return true;
  if (document.querySelector('.HaAclf')) return true;
  if (window.viewerData) return true;
  return false;
}

function createButton() {
  if (document.getElementById("drive-to-pdf-btn")) return;
  const btn = document.createElement("button");
  btn.id = "drive-to-pdf-btn";
  btn.textContent = "⬇ Download PDF";
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    padding: 12px 18px;
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 26px;
    font-weight: 600;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    cursor: pointer;
  `;
  btn.title = "Capture preview images and create PDF";

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Processing…";
    try {
      // Ask background to inject pdf-lib + inject.js into page main world
      chrome.runtime.sendMessage({ action: "RUN_INJECT" }, (resp) => {
        // background runs the scripts; no response payload required
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = "⬇ Download PDF";
        }, 2000);
      });
    } catch (e) {
      console.error(e);
      btn.disabled = false;
      btn.textContent = "⬇ Download PDF";
    }
  });

  document.body.appendChild(btn);
}

function removeButton() {
  const b = document.getElementById("drive-to-pdf-btn");
  if (b) b.remove();
}

function check() {
  if (isDrivePreview()) createButton();
  else removeButton();
}

check();
new MutationObserver(check).observe(document.body, { childList: true, subtree: true });
setInterval(check, 800);
