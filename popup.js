// Popup script for the extension
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a performance comparison page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const statusDiv = document.getElementById('status');
        
        if (currentTab.url && currentTab.url.includes('edgeteam.ms/perf-lab/perf-comparison-requests/details/')) {
            statusDiv.textContent = 'Extension is active on this page';
            statusDiv.className = 'status active';
        } else {
            statusDiv.textContent = 'Navigate to a performance comparison page to use this extension';
            statusDiv.className = 'status inactive';
        }
    });
});