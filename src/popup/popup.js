document.addEventListener('DOMContentLoaded', function () {
  // Get elements
  const toggleExtension = document.getElementById('toggleExtension');
  const sortComments = document.getElementById('sortComments');
  const intervalInput = document.getElementById('intervalInput');
  const retrieveMethod = document.getElementById('retrieveMethod');

  // Load saved options from storage and set default values if not present
  chrome.storage.sync.get({
    toggleExtension: true,      // Set a default value
    sortComments: 'likeCount',
    intervalInput: 8,
    retrieveMethod: 'relevance'
  }, function (options) {
    // Populate options from storage
    toggleExtension.checked = options.toggleExtension;
    sortComments.value = options.sortComments;
    intervalInput.value = options.intervalInput;
    retrieveMethod.value = options.retrieveMethod;
  });

  // Add event listeners
  toggleExtension.addEventListener('change', function () {
    // Handle toggleExtension change
    const value = toggleExtension.checked;
    console.log(value);
    chrome.storage.sync.set({ toggleExtension: value });
    sendMessageToContentScript({ toggleExtension: value });
  });

  sortComments.addEventListener('change', function () {
    // Handle sortComments change
    const value = sortComments.value;
    chrome.storage.sync.set({ sortComments: value });
    sendMessageToContentScript({ sortComments: value });
  });

  intervalInput.addEventListener('input', function () {
    // Handle intervalInput change
    // If more than 15, set to 15, if less than 1, set to 1
    if (intervalInput.value > 15) {
      intervalInput.value = 15;
    } else if (intervalInput.value < 1) {
      intervalInput.value = 1;
    } else if (isNaN(intervalInput.value)) { // If not a number, set to 8 (default)
      intervalInput.value = 8;
    }
    const value = parseInt(intervalInput.value, 10);
    chrome.storage.sync.set({ intervalInput: value });
    sendMessageToContentScript({ intervalInput: value });
  });

  retrieveMethod.addEventListener('change', function () {
    // Handle retrieveMethod change
    const value = retrieveMethod.value;
    chrome.storage.sync.set({ retrieveMethod: value });
    sendMessageToContentScript({ retrieveMethod: value });
  });

  // Function to send a message to the content script
  function sendMessageToContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, message);
    });
  }
});
