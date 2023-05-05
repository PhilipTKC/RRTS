var isEnabled = false;
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "toggleOverlay",
        title: "Toggle Overlay",
        contexts: ["all"]
    });
});
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "toggleOverlay") {
        chrome.tabs.sendMessage(tab.id, { toggleOverlay: { isEnabled: (isEnabled = !isEnabled) } });
    }
});
chrome.runtime.onMessage.addListener(function (message) {
    listenForLocalStorage(message);
});
function listenForLocalStorage(message) {
    if (message.spreadsheetId) {
        var spreadsheetId = message.spreadsheetId;
        chrome.storage.local.set({ spreadsheetId: spreadsheetId });
    }
    if (message.defects) {
        var defects = message.defects;
        chrome.storage.local.set({ defects: defects });
    }
}
