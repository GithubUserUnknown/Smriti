import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import EmbedCodeGenerator from './EmbedCodeGenerator';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [apiKey, setApiKey] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [personality, setPersonality] = useState(null); // Store personality details
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChats: 1280,
    activeUsers: 37,
    avgResponseTime: 370,
    satisfaction: 3.7
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          throw new Error('No authentication token found');
          
        }

        // Fetch user data and stats in parallel
        const [userResponse] = await Promise.all([ // Fetch user data only for now
          api.get('/auth/user-data')
        ]);

        setApiKey(userResponse.data.apiKey);
        setToken(userResponse.data.token);
        setUserId(userResponse.data.googleId);

        if (userResponse.data.googleId) {
          try {
            const personalityResponse = await api.get('/api/personalities', {
              params: { userId: userResponse.data.googleId }
            });
            // Set personality to null if no personalities exist
            setPersonality(personalityResponse.data.personalities?.[0] || null);
          } catch (error) {
            console.error('Error fetching personality:', error.message);
            setPersonality(null);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, trend }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">
          {value}
          {trend && (
            <span className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
              <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'}`}></i>
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <i className="fas fa-exclamation-circle"></i>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          <i className="fas fa-redo"></i> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button className="refresh-button">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <button className="settings-button">
            <i className="fas fa-cog"></i> Settings
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Chats"
          value={stats.totalChats}
          icon="fa-comments"
          trend={12}
        />
        <StatCard 
          title="Active Users"
          value={stats.activeUsers}
          icon="fa-users"
          trend={8}
        />
        <StatCard 
          title="Avg Response Time"
          value={`${stats.avgResponseTime}s`}
          icon="fa-clock"
          trend={-5}
        />
        <StatCard 
          title="User Satisfaction"
          value={`${stats.satisfaction}%`}
          icon="fa-smile"
          trend={15}
        />
      </div>

      <div className="dashboard-sections">
        <div className="section embed-section">
          <h2>Chatbot Embed Code</h2>
          {apiKey && token && personality ? (
            <EmbedCodeGenerator 
              apiKey={apiKey} 
              token={token} 
              personality={personality} 
            />
          ) : (
            <div className="missing-credentials">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Missing Credentials</h3>
              <p>No API key, token, or personality found. Please contact support.</p>
            </div>
          )}
        </div>

        <div className="section personality-section">
          <h2>Active Personality</h2>
          {personality ? (
            <div className="personality-card">
              <div className="personality-avatar">
                <i className={`fas fa-${personality.gender === 'female' ? 'female' : 'male'}`}></i>
              </div>
              <div className="personality-details">
                <h3>{personality.name}</h3>
                <p>{personality.behaviorPrompt}</p>
                <div className="personality-traits">
                  <span className="trait">Age: {personality.age}</span>
                  <span className="trait">Gender: {personality.gender}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-personality">
              <p>No personality configured</p>
              <button 
                className="create-personality-button"
                onClick={() => navigate('/')}
              >
                <i className="fas fa-plus"></i> Create Personality
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
