const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 5000;

app.use(cors());

// Replace 'YOUR_API_KEY' with your actual YouTube Data API v3 key
const YOUTUBE_API_KEY = 'AIzaSyCRreCni6wmdd-BXr1Gd7SABioXUdQ-b6o';
const GEMINI_API_KEY = 'AIzaSyDniMVc_sBZIg7Cmnj0EulJBw9mHL_6YxA';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Function to analyze comments using Gemini API
const analyzeComments = async (comments) => {
  // Limit to first 100 comments for analysis
  const commentsToAnalyze = comments.slice(0, 100);

  const prompt = `Analyze the following comments and provide a 100-word summary:\n${commentsToAnalyze.join('\n')}`;
  
  let retries = 3;
  while (retries > 0) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error fetching from Gemini API:', error);
      retries -= 1;
      if (retries <= 0) {
        console.log('Error analyzing comments after retries. Returning partial result.');
        return 'Failed to analyze comments after multiple attempts. Please try again later.';
      }
      console.log('Retrying...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increase delay
    }
  }
};

// Get channel data and top 10 popular videos
app.get('/api/channel-data', async (req, res) => {
  const CHANNEL_ID = req.query.channelId;
  try {
    // Fetch channel statistics
    const channelResponse = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`);
    const channelData = channelResponse.data.items[0];
    const channelLogo = channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.default.url;
    const channelStatistics = channelData.statistics;

    // Fetch top 10 popular videos
    const videosResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=viewCount&maxResults=10&key=${YOUTUBE_API_KEY}`);
    
    const videos = await Promise.all(videosResponse.data.items.map(async (video) => {
      const videoId = video.id.videoId;
      const videoStatsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`);
      const videoStats = videoStatsResponse.data.items[0];
      
      const likeCount = videoStats.statistics.likeCount || 0;
      const viewCount = videoStats.statistics.viewCount || 0;
      const publishedAt = videoStats.snippet.publishedAt;
      const thumbnailUrl = videoStats.snippet.thumbnails.maxres?.url || videoStats.snippet.thumbnails.high?.url || videoStats.snippet.thumbnails.default.url;

      // Fetch comments (limit to 100 comments)
      const commentsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${YOUTUBE_API_KEY}`
      );
      const comments = commentsResponse.data.items.map(item => item.snippet.topLevelComment.snippet.textDisplay);

      // Analyze comments using Gemini API
      const commentAnalysis = await analyzeComments(comments);

      // Get total comment count from video stats (not limited to 100)
      const totalComments = videoStats.statistics.commentCount || 0;

      return {
        title: video.snippet.title,
        videoId,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        likeCount,
        viewCount,
        publishedAt,
        thumbnailUrl,
        commentAnalysis,  // Comment analysis result
        totalComments,    // Display total comments count (not limited to 100)
      };
    }));

    // Combine data
    const data = {
      title: channelData.snippet.title,
      description: channelData.snippet.description,
      logo: channelLogo,
      subscribers: channelStatistics.subscriberCount,
      views: channelStatistics.viewCount,
      videoCount: channelStatistics.videoCount,
      videos, // Include popular videos
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from YouTube API:', error);
    res.status(500).send('Error fetching channel data');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
