// Function to extract text from the active webpage
function extractText() {
    const article = document.querySelector('article');
    const body = document.querySelector('body');
    const paragraph = document.querySelector('p');
    
    if (article) {
        return article.innerText;
    } else if (body) {
        return body.innerText;
    } else if (paragraph) {
        return paragraph.innerText;
    } else {
        return null; // Return null if no text was found
    }
}

async function generateSummary(text, length, language) {
    const cacheKey = `${text}-${length}-${language}`;
    const cachedSummary = localStorage.getItem(cacheKey);

    // Check cache first
    if (cachedSummary) {
        console.log('Using cached summary');
        return JSON.parse(cachedSummary);
    }

    try {
        const response = await fetch('http://localhost:5000/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, length, language })
        });

        const data = await response.json();

        // Check if the API returned an error
        if (!response.ok) {
            throw new Error(data.error || 'An unknown error occurred');
        }

        // Cache the summary and return it
        localStorage.setItem(cacheKey, JSON.stringify(data.summary));
        return data.summary;
    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
}

async function extractAndSummarize() {
    try {
        // Execute `extractText` directly in the content script
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [result] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractText
        });

        const extractedText = result?.result;

        if (!extractedText || extractedText.trim() === "") {
            document.getElementById('output').textContent = 'No summarizable content found on this page.';
            return;
        }

        const summaryLength = document.getElementById('summaryLength').value;
        const language = document.getElementById('language').value;

        // Show loading indicator
        const loadingElement = document.getElementById('loading');
        loadingElement.style.display = 'block';
        loadingElement.textContent = 'Loading...';

        document.getElementById('output').textContent = '';

        try {
            const summary = await generateSummary(extractedText, summaryLength, language);
            document.getElementById('output').textContent = summary;
        } catch (error) {
            document.getElementById('output').textContent = error.message || 'Error generating summary. Please try again later.';
        } finally {
            // Hide loading indicator
            loadingElement.style.display = 'none';
        }
    } catch (error) {
        document.getElementById('output').textContent = 'Failed to extract content from page.';
    }
}

// Event listener for the Extract button
document.getElementById('extractBtn').addEventListener('click', extractAndSummarize);

// Event listener for the Settings button
document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage(); // Opens the settings.html page in a new tab
});
