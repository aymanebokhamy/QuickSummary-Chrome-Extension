document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['defaultSummaryLength', 'autoSummarize'], (result) => {
        if (result.defaultSummaryLength) {
            document.getElementById('defaultSummaryLength').value = result.defaultSummaryLength;
        }
        if (result.autoSummarize) {
            document.getElementById('autoSummarize').checked = result.autoSummarize;
        }
    });
});

document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const defaultSummaryLength = document.getElementById('defaultSummaryLength').value;
    const autoSummarize = document.getElementById('autoSummarize').checked;

    chrome.storage.sync.set({
        defaultSummaryLength: defaultSummaryLength,
        autoSummarize: autoSummarize
    }, () => {
        alert('Settings saved successfully!');
        window.close();
    });
});

document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
    alert('Changes discarded.');
    window.close();
});
