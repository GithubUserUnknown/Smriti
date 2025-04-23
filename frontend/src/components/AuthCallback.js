import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Changed from jwt_decode to { jwtDecode }

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          throw new Error('No token received');
        }

        // Store the token
        localStorage.setItem('token', token);
        
        // Decode token to get user info
        const decoded = jwtDecode(token);
        localStorage.setItem('user', JSON.stringify(decoded));
        
        // Get the stored redirect URL or default to home
        const redirectUrl = sessionStorage.getItem('redirectUrl') || '/';
        sessionStorage.removeItem('redirectUrl'); // Clean up
        
        navigate(redirectUrl);
        window.location.reload(); // Refresh to update auth state
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { 
          state: { error: 'Authentication failed. Please try again.' } 
        });
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="auth-callback-container">
      <div className="loading-spinner">Processing authentication...</div>
    </div>
  );
};

export default AuthCallback;
