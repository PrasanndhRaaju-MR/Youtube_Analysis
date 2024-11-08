import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
      const response = await axios.get(`http://localhost:5000/api/channel-data?channelId=${channelId}`);
      setChannelData(response.data);
    } catch (err) {
      console.error('Error fetching channel data:', err);
      setError('Failed to fetch channel data. Please check the channel ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    const labels = channelData.videos.map(video => video.title);
    const likes = channelData.videos.map(video => video.likeCount);
    const views = channelData.videos.map(video => video.viewCount);

    return {
      labels,
      datasets: [
        {
          label: 'Likes',
          data: likes,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Views',
          data: views,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
      ],
    };
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
            <p><div className="description">{channelData.description}</div></p>
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
                  <p><strong>Views:</strong> {video.viewCount}</p>
                  <p><strong>Published:</strong> {new Date(video.publishedAt).toLocaleDateString()}</p>
                  <p><strong>Total Comments:</strong> {video.totalComments}</p>
                  <p><strong>Comment Analysis:</strong> {video.commentAnalysis}</p>
                </div>
              ))}
            </div>
            <p>

            </p>
            <br>
            </br>
            <h3 className="top-videos-title">Analysis of Views & Likes for Top 10 Videos</h3>
            <br></br><br></br>
            <div style={{ height: '400px' }}>
              <Bar data={generateChartData()} options={{ responsive: true }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
