import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Changed from jwt_decode to { jwtDecode }

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (error) {
      console.error('Authentication error:', error);
      navigate('/login');
      return;
    }
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(decoded));
        
        // Log successful authentication
        console.log('Authentication successful');
        
        navigate('/');
        window.location.reload();
      } catch (error) {
        console.error('Error processing token:', error);
        navigate('/login');
      }
    } else {
      console.error('No token received');
      navigate('/login');
    }
  }, [navigate, location]);

  return (
    <div className="auth-callback-container">
      <div className="loading-spinner"></div>
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;
