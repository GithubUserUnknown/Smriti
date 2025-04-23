import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import SearchFiles from './components/SearchFiles';
import ChatInterface from './components/ChatInterface';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback';
import Dashboard from './components/Dashboard';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/health`);
        if (!response.ok) {
          throw new Error('Server is not responding');
        }
        // Check authentication after confirming server is up
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('user');
        if (token && userInfo) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userInfo));
        }
      } catch (error) {
        console.error('Server connection error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkServerStatus();
  }, []);

  const handleLogin = (userInfo) => {
    setIsAuthenticated(true);
    setUser(userInfo);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} user={user} />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <div className="dashboard-layout">
                    <div className="chat-section">
                      <ChatInterface />
                    </div>
                    <div className="side-section">
                      <FileUpload />
                      <SearchFiles />
                    </div>
                  </div>
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              } 
            />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;



