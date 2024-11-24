// side_panel.js
const iframe = document.getElementById('website-frame');

document.addEventListener("DOMContentLoaded", () => {
    // Connect to the background script
    const port = chrome.runtime.connect({ name: "sidePanel" });

    // Listen for incoming messages from the background script
    port.onMessage.addListener((message) => {
        if (message.type === "tickerUpdate") {
            const tickerElement = document.getElementById("ticker");
            if (message.data && message.data.ticker) {
                tickerElement.textContent = message.data.ticker;
                console.log("Ticker data updated in side panel:", message.data.ticker);
                if (message.data.action && message.data.action === "GetInfoFromPF") {
                    console.log("Getting Info on PF");
                    // Example usage

                                        // Example of sending a message when a button is clicked
                    //document.addEventListener('DOMContentLoaded', () => {
                        // Send a message when the iframe is fully loaded
                   //     iframe.addEventListener('load', () => {
                            sendMessageToIframe({ type: 'GetInfoFromPF', text: message.data.ticker, params: 'some params' });
                    //    });
                   // });
                    
                }
            } else {
                tickerElement.textContent = "No ticker data available.";
            }
        }
        else if (message.type === "tickerReset") {
            const tickerElement = document.getElementById("ticker");
            if (tickerElement) {
                tickerElement.textContent = "No ticker available";
                console.log("Ticker data reset in side panel.");
            }
        }

    });

    // Initial message or actions if needed
    console.log("Side panel script loaded and connected to background.");
});




// Function to fetch a website and get href attributes of links with a certain innerText
async function getLinksByInnerText(url, innerTextToMatch) {
    try {
        // Use Fetch API to get the website content
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const html = await response.text();

        // Create a DOM parser to parse the HTML
        const parser = new DOMParser();
        const document = parser.parseFromString(html, 'text/html');

        // Find all anchor tags and filter them by the given innerText
        const links = Array.from(document.querySelectorAll('a'))
            .filter(link => link.textContent.trim() === innerTextToMatch)
            .map(link => link.href);

        // Return the matching links
        return links;
    } catch (error) {
        console.error('Error:', error);
    }
}


// Reference to the iframe


// Send a message to the iframe
function sendMessageToIframe(message) {
    console.log("MEssage to iframe");
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(message, 'http://localhost:3000/'); // Set the correct target origin here
    }
}

