SPYTCOMM - Chrome Browser Extension
Created by Jack Perkins (Se7enthChoice)
1.0 Release Thursday 11th January

Description:
-------------
SPYTCOMM is a Chrome browser extension that enhances your Spotify Web Player experience by displaying YouTube comments for the currently playing song.

Video of Features:
-------------------
TODO

Technical Details and How to Use:
--------------------------------

Running the Server:
-------------------
1. Install dependencies: `npm install`
2. Create a `.env` file at the root folder with `API_KEY=YOUR_YOUTUBE_DATA_API_KEY` (Replace YOUR_YOUTUBE_DATA_API_KEY with your actual YouTube Data API v3 key obtained from Google Cloud).
3. Run the server: 
   - `node start` or 
   - `node src/server/server.js`

Running the Extension (Client):
-------------------------------
1. Open 'src/frontend/content.js'
2. Replace 'YOUR_SERVER_URL_HERE' on line 54 with the URL of your server. Ensure it ends with the route '/api/searchYoutube'. 
   Example: 'https://example.onrender.com/api/searchYoutube'
3. Go to 'chrome://extensions/'. Ensure Developer mode is enabled in the top right.
4. Click 'Load unpacked' and select the root folder of the project.

File Breakdown:
---------------
- `icon.png`: Visual icon used
- `manifest.json`: Info and permissions
- `package(-lock).json`: Node metadata

src
├── frontend
│   ├── content.js: Actual page-interacting frontend script
│   ├── styles.css: CSS used when displaying comments and associated data (date posted, user's channel, pfp)
├── popup
│   ├── popup.html: HTML for the popup initiated from Chrome's toolbar. Used for displaying the extension's settings.
│   ├── popup.css: CSS for the popup.
│   ├── popup.js: Script for the popup, communicates options back to the main frontend of the extension.
├── server
│   └── server.js: Backend server for handling API requests, fetching YouTube content, and returning it to the user. NodeJS server.
