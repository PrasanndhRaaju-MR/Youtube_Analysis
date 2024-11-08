import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [channelId, setChannelId] = useState('');
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    setChannelId(event.target.value);
  };

  const fetchChannelData = async () => {
    setLoading(true);
    setError('');
    setChannelData(null);

    try {
      const response = await axios.get(`https://new-youtube-channel-analysis.onrender.com/api/channel-data?channelId=${channelId}`);
      setChannelData(response.data);
    } catch (err) {
      console.error('Error fetching channel data:', err);
      setError('Failed to fetch channel data. Please check the channel ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="App">
        <div className="header">
          <img src="/logo.png" alt="YouTube Logo" className="youtube-logo" />
          <h1>Channel Data Fetcher</h1>
        </div>

        <input
          type="text"
          placeholder="Enter YouTube Channel ID"
          value={channelId}
          onChange={handleInputChange}
          className="channel-input"
        />
        <button onClick={fetchChannelData} className="fetch-button">Fetch Channel Data</button>

        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {channelData && (
          <div className="channel-info">
            <img src={channelData.logo} alt="Channel Logo" className="channel-logo" />
            <h2>{channelData.title}</h2>
            <p><strong>Description:</strong> {channelData.description}</p>
            <p><strong>Subscribers:</strong> {channelData.subscribers}</p>
            <p><strong>Total Views:</strong> {channelData.views}</p>
            <p><strong>Video Count:</strong> {channelData.videoCount}</p>

            <h3 className="top-videos-title">Top 10 Videos</h3>
            <div className="video-grid">
              {channelData.videos.map((video) => (
                <div className="video-box" key={video.videoId}>
                  <a href={video.link} target="_blank" rel="noopener noreferrer">
                    <img src={video.thumbnailUrl} alt={video.title} className="video-thumbnail" />
                    <h4>{video.title}</h4>
                  </a>
                  <p><strong>Likes:</strong> {video.likeCount}</p>
                  <p><strong>Published:</strong> {new Date(video.publishedAt).toLocaleDateString()}</p>
                  <p><strong>Earnings:</strong> ${video.earnings}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
