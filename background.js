// Background service worker for Pantheon Toolkit
// Handles extension lifecycle and background tasks

// Installation and update handling
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Pantheon Toolkit installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        console.log('Welcome to Pantheon Toolkit! Navigate to a perf-lab comparison page to get started.');
    } else if (details.reason === 'update') {
        console.log('Pantheon Toolkit updated to version:', chrome.runtime.getManifest().version);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Pantheon Toolkit service worker started');
});

// Handle tab updates to check for supported pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only process completed page loads
    if (changeInfo.status !== 'complete') return;
    
    // Check if this is a supported perf-lab page
    if (tab.url && tab.url.includes('edgeteam.ms/perf-lab/perf-comparison-requests/details/')) {
        console.log('Pantheon Toolkit: Supported page detected', tab.url);
        
        // Update action badge to indicate availability
        chrome.action.setBadgeText({
            tabId: tabId,
            text: '✓'
        });
        
        chrome.action.setBadgeBackgroundColor({
            tabId: tabId,
            color: '#4CAF50'
        });
        
        chrome.action.setTitle({
            tabId: tabId,
            title: 'Pantheon Toolkit - Ready to analyze performance data'
        });
    } else {
        // Clear badge for unsupported pages
        chrome.action.setBadgeText({
            tabId: tabId,
            text: ''
        });
        
        chrome.action.setTitle({
            tabId: tabId,
            title: 'Pantheon Toolkit - Navigate to a perf-lab comparison page'
        });
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'dataExtracted':
            console.log('Performance data extracted:', request.data);
            // Could store data or update badge with count
            if (request.data) {
                const totalItems = (request.data.regressions?.length || 0) + (request.data.improvements?.length || 0);
                chrome.action.setBadgeText({
                    tabId: sender.tab.id,
                    text: totalItems > 0 ? totalItems.toString() : '✓'
                });
            }
            break;
            
        case 'analysisStarted':
            chrome.action.setBadgeText({
                tabId: sender.tab.id,
                text: '...'
            });
            chrome.action.setBadgeBackgroundColor({
                tabId: sender.tab.id,
                color: '#FF9800'
            });
            break;
            
        case 'analysisCompleted':
            chrome.action.setBadgeBackgroundColor({
                tabId: sender.tab.id,
                color: '#4CAF50'
            });
            break;
            
        default:
            console.log('Unknown message action:', request.action);
    }
    
    // Send response if needed
    sendResponse({ received: true });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will be overridden by popup, but keeping for fallback
    console.log('Pantheon Toolkit icon clicked on tab:', tab.url);
});

// Cleanup on extension suspension
self.addEventListener('suspend', () => {
    console.log('Pantheon Toolkit service worker suspending');
});