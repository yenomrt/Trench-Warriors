// bullx_pump_vision.js

console.log("BullX Pump Vision content script loaded.");

// Function to handle pump.fun links based on specific path attribute
function handlePumpFunLinkFromPath(pathElement) {
    // Check if the warrior icon has already been added before the pump.fun link
    if (pathElement.closest('a').previousElementSibling && pathElement.closest('a').previousElementSibling.classList.contains('warrior-icon')) {
        console.log("Warrior icon already added before this pump.fun link.");
        return; // Exit the function if the icon is already added
    }

    const linkElement = pathElement.closest('a');
    if (linkElement) {
        const linkAddress = linkElement.href;
        console.log("Extracted link address:", linkAddress);

        // Extract the last part of the address after "pump.fun/"
        const urlParts = linkAddress.split("pump.fun/");
        if (urlParts.length > 1) {
            const extractedPart = urlParts[1];
            console.log("Extracted part after pump.fun/:", extractedPart);

            // Create a new icon element to insert before the pump.fun link
            const newIcon = document.createElement('span');
            newIcon.innerHTML = '<button type="button" class="ant-btn ant-btn-default !rounded-full !border-none w-5 h-5 text-center !p-0 !m-0 !bg-grey-500">⚔️</button>'; // Warrior icon
            newIcon.classList.add('warrior-icon'); // Add a class to identify the icon
            newIcon.style.marginRight = '';
            newIcon.style.cursor = 'pointer';

            // Add click event listener to send the token address to the side panel
            newIcon.addEventListener('click', () => {
                chrome.runtime.sendMessage({ type: "tickerData", data: { ticker: extractedPart , action: "GetInfoFromPF"} }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message:", chrome.runtime.lastError);
                    } else {
                        console.log("Token address sent to side panel:", extractedPart);
                    }
                });
            });

            // Insert the new icon before the pump.fun link
            linkElement.parentNode.insertBefore(newIcon, linkElement);
            console.log("New icon inserted before the pump.fun link.");
        } else {
            console.warn("Could not extract the part after pump.fun/ from the link address.");
        }
    }
}

// Apply the function to all existing path elements with the specific attribute
const existingPathElements = document.querySelectorAll('path[d="M5.92039 1.3088C6.99879 0.230399 8.74723 0.230399 9.82569 1.3088C10.904 2.38721 10.904 4.13565 9.82569 5.21405L7.873 7.16667L3.96777 3.26142L5.92039 1.3088Z"]');
existingPathElements.forEach((pathElement) => {
    handlePumpFunLinkFromPath(pathElement);
});

// Set up a MutationObserver to monitor changes in the DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    const newPathElements = node.querySelectorAll('path[d="M5.92039 1.3088C6.99879 0.230399 8.74723 0.230399 9.82569 1.3088C10.904 2.38721 10.904 4.13565 9.82569 5.21405L7.873 7.16667L3.96777 3.26142L5.92039 1.3088Z"]');
                    newPathElements.forEach((pathElement) => {
                        handlePumpFunLinkFromPath(pathElement);
                    });
                }
            });
        }
    });
});

// Start observing the body for changes to detect new path elements
observer.observe(document.body, { childList: true, subtree: true });

console.log("MutationObserver set up to monitor path elements.");

// Listener for messages from the background script to update the side panel
document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "tickerDataUpdate") {
            const tickerElement = document.getElementById("ticker");
            if (tickerElement) {
                tickerElement.textContent = message.tickerData;
                console.log("Ticker data updated in side panel:", message.tickerData);
            }
        } else if (message.type === "tickerReset") {
            const tickerElement = document.getElementById("ticker");
            if (tickerElement) {
                tickerElement.textContent = "No ticker available";
                console.log("Ticker data reset in side panel.");
            }
        }
    });
});
