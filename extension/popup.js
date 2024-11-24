chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "side_panel.html"
    });
  });
  