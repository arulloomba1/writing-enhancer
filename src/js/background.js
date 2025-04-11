// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        settings: {
            wordiness: true,
            medicalTerms: true,
            cliches: true
        }
    });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_SETTINGS') {
        // Get settings from storage
        chrome.storage.sync.get('settings', (data) => {
            // If no settings exist, use defaults
            const settings = data.settings || {
                wordiness: true,
                medicalTerms: true,
                cliches: true
            };
            sendResponse(settings);
        });
        return true; // Will respond asynchronously
    }
    
    if (request.type === 'UPDATE_SETTINGS') {
        chrome.storage.sync.set({
            settings: request.settings
        }, () => {
            // Only try to send message if we have a valid tab
            if (sender.tab && sender.tab.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: 'SETTINGS_UPDATED',
                    settings: request.settings
                }).catch(() => {
                    // Ignore any connection errors
                    console.log('Content script not ready yet');
                });
            }
            sendResponse({ success: true });
        });
        return true; // Will respond asynchronously
    }
}); 