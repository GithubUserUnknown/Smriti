import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ isAuthenticated, user }) => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/login');
    // Refresh the page to reset all states
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>AI Chat Platform</h1>
      </div>
      
      <div className="navbar-menu">
        {isAuthenticated && (
          <>
            <a href="/" className="nav-link">Home</a>
            <a href="/dashboard" className="nav-link">Dashboard</a>
          </>
        )}
      </div>

      <div className="navbar-end">
        {isAuthenticated ? (
          <div className="user-section">
            <div className="user-info">
              <img 
                src={user?.picture || 'https://ui-avatars.com/api/?name=' + user?.email} 
                alt="Profile" 
                className="profile-image"
              />
              <span className="welcome-text">{user?.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        ) : (
          <button onClick={handleGoogleLogin} className="google-login-btn">
            <i className="fab fa-google"></i> Login with Google
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
