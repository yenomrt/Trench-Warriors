// dexscreener.js

console.log("Content script loaded on Dexscreener.");

// Variable to store the previously sent ticker value
let previousTicker = null;

// Function to extract and send ticker data if it has changed
function checkAndUpdateTickerData() {
    const tickerElements = document.querySelectorAll('.custom-i33gp9 .custom-72rvq0'); // Adjust selector as needed

    if (tickerElements && tickerElements.length > 1) {
        const ticker = tickerElements[1]?.getAttribute('title') || tickerElements[1]?.innerText;

        // Only send the message if the ticker has changed
        if (ticker) {
            previousTicker = ticker;
            console.log("Ticker updated:", ticker);

            // Send the ticker data to the background script or side panel
            chrome.runtime.sendMessage(
                { type: "tickerData", data: { ticker } },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message:", chrome.runtime.lastError);
                    } else {
                        console.log("Response from background script:", response);
                    }
                }
            );
        }
    } else {
        console.warn("Ticker elements not found or insufficient elements on the page.");
    }
}

// Run the check and update function immediately after the script loads
checkAndUpdateTickerData();

// Listener for tab visibility change to detect when the user switches back to Dexscreener
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        console.log("User switched back to the Dexscreener tab.");
        checkAndUpdateTickerData();
    }
});

// Listener for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in Dexscreener content script:", message);

    try {
        if (message.type === "tabActivated") {
            console.log("Handling 'tabActivated' message.");
            checkAndUpdateTickerData();
            sendResponse({ status: "success", message: "Tab activated and data checked." });
        } else if (message.type === "ping") {
            console.log("Ping message received from background script.");
            sendResponse({ status: "alive" });
        } else {
            console.warn("Received an unexpected message type:", message.type);
        }
    } catch (error) {
        console.error("Error handling message in Dexscreener content script:", error);
        sendResponse({ status: "error", error: error.message });
    }
    return true; // Keeps the sendResponse callback alive for async responses
});
