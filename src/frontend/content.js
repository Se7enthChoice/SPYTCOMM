// Function to inject a CSS file into the document
function injectCSSFile(cssFile) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL(cssFile);
  document.head.appendChild(link);
}

// Inject the 'styles.css' file
injectCSSFile('styles.css');

// Global variables for options
let toggleExtension = ""; // Can be true or false
let doToggleExtensionFromLoad = false;
let sortComments = ""; // Can be likeCount or mostRecent
let intervalInput = ""; // Can be between 0 and 16
let retrieveMethod = ""; // Can be relevance or viewCount or rating

// Load saved options from storage and set default values if not present
chrome.storage.sync.get({
  toggleExtension: true, // Set a default value
  sortComments: 'likeCount',
  intervalInput: 8,
  retrieveMethod: 'relevance'
}, function (options) {
  console.log('Options retrieved from storage:', options);
  toggleExtension = options.toggleExtension;
  doToggleExtensionFromLoad = true;
  sortComments = options.sortComments;
  intervalInput = options.intervalInput;
  retrieveMethod = options.retrieveMethod;
});

var currentSong;
var currentArtist;

// Function to get the current song information from the Spotify Web Player
function getCurrentSongInfo() {
  const newSong = document.querySelector('[data-testid="context-item-link"]').innerText;
  const newArtist = document.querySelector('[data-testid="context-item-info-artist"]').innerText;

  if (currentSong !== newSong || currentArtist !== newArtist) {
    // Song has changed, update variables and send request to server
    currentSong = newSong;
    currentArtist = newArtist;
    sendSongInfoToServer(currentSong, currentArtist);
  }
}

// Function to send the song information to the backend server
function sendSongInfoToServer(song, artist) {
  // Send the song information to the backend server
  fetch('YOUR_SERVER_URL_HERE', { // INPUT YOUR SERVER URL HERE
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: song, artist: artist, orderPreference: retrieveMethod }),
  })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the server (data contains YouTube comments and video title)
      console.log('Server response:', data);

      // Display the comments and video title on the page
      displayCommentsInSpotify(data);
    })
    .catch(error => {
      console.error('Error sending request to the server:', error);
    });
}

// Run this function every 5 seconds
setInterval(getCurrentSongInfo, 10000); // Change new song check interval here (currently 10 seconds)

// Declare a global variable to keep track of the ongoing comment display process
let commentDisplayProcess;

// Function to display the comments and video title on the page
function displayCommentsInSpotify(data) {
  let comments = data.comments;

  // Create or select a container within the Spotify Web Player to display comments
  let commentsContainer = document.getElementById('spotify-comments-container');

  if (!commentsContainer) {
    // Create a container if it doesn't exist
    commentsContainer = document.createElement('div');
    commentsContainer.id = 'spotify-comments-container';
    document.body.appendChild(commentsContainer);
  }

  // Clear existing comments
  commentsContainer.innerHTML = '';

  // Stop any ongoing comment display process
  if (commentDisplayProcess) {
    clearTimeout(commentDisplayProcess);
  }

  // If toggle extension from load
  if (doToggleExtensionFromLoad) {
    doToggleExtension(toggleExtension);
    doToggleExtensionFromLoad = false;
  }

  // Display the video title
  const videoTitleElement = document.createElement('div');
  videoTitleElement.className = 'video-title';
  videoTitleElement.textContent = data.videoTitle;
  commentsContainer.appendChild(videoTitleElement);

  // Display new comments sequentially
  if (comments && comments.length > 0) {

    // Sort the comments by like count here (highest to lowest)
    if (sortComments === 'likeCount') {
      comments.sort((a, b) => b.likeCount - a.likeCount);
    } // Comments are sorted by newest to oldest by default anyway

    // Display comments one by one
    let index = 0;
    const maxComments = 6; // Set the maximum number of comments (+1)

    function displayNextComment() {
      if (index < comments.length) {
        // Comment div made up of 4 parts: channel name, profile picture, date, and comment text
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        // Show profile picture
        const profilePicture = document.createElement('img');
        profilePicture.className = 'profile-picture';
        profilePicture.src = comments[index].authorProfileImageUrl;
        commentElement.appendChild(profilePicture);
        // Show channel name (clicking on the text should take you to the channel (.authorChannelUrl))
        const channelName = document.createElement('div');
        channelName.className = 'channel-name';
        const channelLink = document.createElement('a');
        channelLink.href = comments[index].authorChannelUrl; // Link to the channel
        channelLink.target = '_blank'; // Ensure the link opens in a new tab
        channelLink.textContent = comments[index].authorDisplayName; // Display the channel name
        channelName.appendChild(channelLink);
        commentElement.appendChild(channelName);
        // Show date
        const date = document.createElement('div');
        date.className = 'date';
        date.textContent = formatCommentDate(comments[index].publishedAt);
        commentElement.appendChild(date);
        // Show comment text
        const commentText = document.createElement('div');
        commentText.className = 'comment-text';
        commentText.textContent = comments[index].textOriginal; // Display the comment text
        commentElement.appendChild(commentText);
        // Add comment div to comments container
        commentsContainer.appendChild(commentElement);

        // Remove the oldest comment if the maximum comment count is reached
        if (commentsContainer.childNodes.length >= maxComments + 1) {
          // The "+1" is to account for the video title as the first child
          const oldestComment = commentsContainer.childNodes[1]; // Skip the first child (video title)
          commentsContainer.removeChild(oldestComment); // Remove the oldest comment
        }

        // IntervalInputFixed should be parseInt(intervalInput, 10) * 1000 (ms)
        const intervalInputFixed = parseInt(intervalInput, 10) * 1000;

        commentDisplayProcess = setTimeout(() => {
          displayNextComment(); // Display the next comment after a short delay 
        }, intervalInputFixed); // Adjust the duration in milliseconds as needed (retrieved from intervalInput in popup.js)

        index++;
      } else {
        // Inform when all comments are displayed, ensure this is appended to the container
        const endOfComments = document.createElement('div');
        endOfComments.className = 'endOfComments';
        endOfComments.textContent = 'No more comments available for this video.';
        commentsContainer.appendChild(endOfComments);
      }
    }

    // Start the sequential display of comments
    displayNextComment();
  } else {
    // Display a message if no comments are available
    commentsContainer.textContent = 'No comments available for this video.';
  }
}

// Function to format the date string
function formatCommentDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  const formattedDate = new Date(dateString).toLocaleString('en-US', options);
  return formattedDate;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    // Handle messages here
    if (request.toggleExtension !== undefined) {
      // Handle toggleExtension change
      console.log('Toggle Extension in content.js:', request.toggleExtension ? 'On' : 'Off');
      doToggleExtension(request.toggleExtension);
    }

    if (request.sortComments !== undefined) {
      // Handle sortComments change
      console.log('Sort Comments in content.js:', request.sortComments);
      sortComments = request.sortComments;
    }

    if (request.intervalInput !== undefined) {
      // Handle intervalInput change
      console.log('Comment Display Interval in content.js:', request.intervalInput);
      intervalInput = request.intervalInput;
    }

    if (request.retrieveMethod !== undefined) {
      // Handle retrieveMethod change
      console.log('Retrieve Video By in content.js:', request.retrieveMethod);
      retrieveMethod = request.retrieveMethod;
    }
  }
);

// Function to toggle the extension on/off
function doToggleExtension(on) {
  // First check if spotify-comments-container div exists, if so then just show/hide it
  const commentsContainer = document.getElementById('spotify-comments-container');
  if (commentsContainer) {
    commentsContainer.style.display = on ? 'inline' : 'none';
  } else {
    // There is no spotify-comments-container div, likely a problem
    console.log('Spotify Comments Container does not exist');
  }
}
