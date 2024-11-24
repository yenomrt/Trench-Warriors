// background.js

console.log("Background script is loaded.");

// Global variable to store ticker data
let tickerData = null;

// Listener for tab updates to reset ticker when user switches tabs
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (sidePanelPort) {
            // Reset ticker data in the side panel each time the tab changes
            sidePanelPort.postMessage({ type: "tickerReset" });
            console.log("Ticker data reset on side panel.");
        }

        // Handle Dexscreener tab activation
        if (tab && tab.url && tab.url.includes("dexscreener.com")) {
            // Check if content script is already injected by sending a ping message
            chrome.tabs.sendMessage(activeInfo.tabId, { type: "ping" }, (response) => {
                if (chrome.runtime.lastError) {
                    // Content script is not injected, inject dexscreener.js
                    console.log("Content script not found, injecting dexscreener.js...");
                    chrome.scripting.executeScript({
                        target: { tabId: activeInfo.tabId },
                        files: ["dexscreener.js"]
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.error("Error injecting dexscreener.js:", chrome.runtime.lastError);
                        } else {
                            console.log("dexscreener.js content script injected.");

                            // Send a message to the content script after injection
                            sendTabActivatedMessage(activeInfo.tabId);
                        }
                    });
                } else {
                    // Content script is already injected, send tabActivated message directly
                    console.log("Content script already injected, sending tabActivated message.");
                    sendTabActivatedMessage(activeInfo.tabId);
                }
            });
        } else if (tab.url.includes("bullx.io/pump-vision")) {
            // Check if content script is already injected by sending a ping message
            chrome.tabs.sendMessage(activeInfo.tabId, { type: "ping" }, (response) => {
                if (chrome.runtime.lastError) {
                    // Content script is not injected, inject bullx_pump_vision.js
                    console.log("Bullx Pump Vision content script not found, injecting bullx_pump_vision.js...");
                    chrome.scripting.executeScript({
                        target: { tabId: activeInfo.tabId },
                        files: ["bullx_pump_vision.js"]
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.error("Error injecting bullx_pump_vision.js:", chrome.runtime.lastError);
                        } else {
                            console.log("bullx_pump_vision.js content script injected.");
                            // Send a message to the content script after injection
                            //sendTabActivatedMessage(activeInfo.tabId);
                        }
                    });
                } else {
                    // Content script is already injected, send tabActivated message directly
                    console.log("Bullx Pump Vision content script already injected, sending tabActivated message.");
                    //sendTabActivatedMessage(activeInfo.tabId);
                }
            });
        }
    });
});

// Function to send the tabActivated message to the content script
function sendTabActivatedMessage(tabId) {
    chrome.tabs.sendMessage(tabId, { type: "tabActivated" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error sending message to content script:", chrome.runtime.lastError);
        } else {
            console.log("Message sent to content script on tab activation.", response);
        }
    });
}

// Global variable to store side panel port
let sidePanelPort = null;

// Listener for incoming connections (such as from side panel)
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "sidePanel") {
        console.log("Side panel connected.");
        sidePanelPort = port;

        // Clean up if the side panel is disconnected
        port.onDisconnect.addListener(() => {
            sidePanelPort = null;
            console.log("Side panel disconnected.");
        });
    }
});

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received from content script:", message);
    if (message.type === "tickerData" && (sender.url.includes("dexscreener.com") || sender.url.includes("bullx.io/pump-vision"))) {
        console.log("Ticker data received from content script:", message.data);

        // If the side panel is connected, send the ticker data directly
        if (sidePanelPort) {
            sidePanelPort.postMessage({ type: "tickerUpdate", data: message.data });
            console.log("Ticker data sent to side panel.");
        }

        sendResponse({ status: "success", received: true });
    } else if (message.type === "ping") {
        // Handle ping message to confirm content script is loaded
        sendResponse({ status: "alive" });
    } else  if (message.type === 'fetchData') {
        fetch(message.url)
            .then(response => response.text())
            .then(data => {
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep the message channel open for async response
    }
    return true; // Keep the sendResponse callback alive for async responses
});

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
