// content.js

console.log("Content script loaded on Dexscreener.");

window.onload = () => {
    console.log("Window onload event fired. Now extracting information...");

    // Example: Extract specific data from Dexscreener
    const priceElement = document.querySelector('.custom-i33gp9 .custom-72rvq0'); // Adjust selector as needed
    if (priceElement) {
        const tokenPrice = priceElement.getAttribute('title') || priceElement.innerText;
        console.log("Extracted Token Price:", tokenPrice);

        // Send a message to the background script if needed
        chrome.runtime.sendMessage(
            { type: "pageData", data: { tokenPrice } },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                } else {
                    console.log("Response from background script:", response);
                }
            }
        );
    } else {
        console.warn("Price element not found on the page.");
    }
};
