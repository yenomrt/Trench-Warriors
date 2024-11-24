// Define the desired innerText values and a variable to track the current index
const targetTexts = ["1m", "5m", "15m", "1h", "4h", "1d"];
let currentIndex = 0;

// Function to find elements by innerText
function findElementsByInnerText(innerText) {
    const elements = Array.from(document.querySelectorAll('.value-gwXludjS')); // Select all elements
    console.log(elements);
    return elements.filter(el => el.innerText.trim() === innerText); // Match innerText
}

// Function to highlight or focus an element
function focusElement(element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" }); // Scroll into view
    element.style.outline = "2px solid red"; // Highlight the element
    setTimeout(() => {
        element.style.outline = ""; // Remove highlight after a short delay
    }, 1000);
    element.click(); // Trigger a click event
}

// Event listener for cycling through the elements
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'd') { // Alt + C to cycle
        e.preventDefault(); 
        const elements = findElementsByInnerText(targetTexts[currentIndex]);
        if (elements.length > 0) {
            focusElement(elements[0]); // Focus the first matching element
            currentIndex = (currentIndex + 1) % targetTexts.length; // Increment and wrap around
        } else {
            console.log(`No element found with innerText: "${targetTexts[currentIndex]}"`);
        }
    }
    if (e.ctrlKey && e.key === 'a') { // Alt + C to cycle
        e.preventDefault(); 
        const elements = findElementsByInnerText(targetTexts[currentIndex]);
        if (elements.length > 0) {
            focusElement(elements[0]); // Focus the first matching element
            currentIndex = (currentIndex - 1) % targetTexts.length; // Increment and wrap around
        } else {
            console.log(`No element found with innerText: "${targetTexts[currentIndex]}"`);
        }
    }
    if (e.key === 'f1') { // Alt + C to cycle
        e.preventDefault(); 
        console.log("ctrl+f1");
        console.log(targetTexts[0]);
        const elements = findElementsByInnerText(targetTexts[0]);
        focusElement(elements[0]); // Focus the first matching element
    }
});

console.log("Tradingview module loaded");