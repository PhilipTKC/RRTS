let isEnabled = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toggleOverlay",
    title: "Toggle Overlay",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggleOverlay") {
    chrome.tabs.sendMessage(tab.id, { toggleOverlay: { isEnabled: (isEnabled = !isEnabled) } });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  listenForLocalStorage(message);
});

function listenForLocalStorage(message): void {
  if (message.spreadsheetId) {
    const spreadsheetId = message.spreadsheetId;
    chrome.storage.local.set({ spreadsheetId });
  }

  if (message.defects) {
    const defects = message.defects;
    chrome.storage.local.set({ defects });
  }
}
