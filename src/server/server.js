require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Use the port from environment variables or default to 3000

app.use(bodyParser.json());
app.use(cors());

const apiKey = process.env.API_KEY; // YouTube API key stored in .env file

app.post('/api/searchYoutube', async (req, res) => {
  try {
    const { title, artist, orderPreference } = req.body;
    const videoId = await searchYouTubeVideoId(title, artist, orderPreference);
    const comments = await getYouTubeVideoComments(videoId);

    // Send back the response with YouTube comments and video title
    const response = {
      videoTitle: `Comments for ${title} by ${artist}`,
      comments: comments,
    };
    res.json(response);
  } catch (error) {
    console.error('Error processing YouTube API requests:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to search for a YouTube video ID based on the song information
async function searchYouTubeVideoId(title, artist, orderPreference) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        type: 'video',
        q: `${title} ${artist}`,
        maxResults: 1,
        order: orderPreference || 'relevance', // Use the provided orderPreference or default to 'relevance'
        key: apiKey,
      },
    });

    const videoId = response.data.items[0].id.videoId;
    return videoId;
  } catch (error) {
    console.error('Error searching YouTube for video ID:', error.message);
    throw error;
  }
}

// Function to retrieve comments for a YouTube video
async function getYouTubeVideoComments(videoId) {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
      params: {
        part: 'snippet',
        videoId: videoId,
        key: apiKey,
        maxResults: 100, // Max number of comments to retrieve, default is 20
      },
    });

    // Extract comments from the response (comments Resource snippet https://developers.google.com/youtube/v3/docs/comments#resource)
    const comments = response.data.items.map(item => item.snippet.topLevelComment.snippet);
    return comments;
  } catch (error) {
    console.error('Error retrieving YouTube video comments:', error.message);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
