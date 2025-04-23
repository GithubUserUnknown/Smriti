import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Changed from jwt_decode to { jwtDecode }

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Decode token to get user info
      try {
        const decoded = jwtDecode(token); // Changed from jwt_decode to jwtDecode
        // You might want to store user info in localStorage or context
        localStorage.setItem('user', JSON.stringify(decoded));
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      
      // Redirect to home page
      navigate('/');
      // Refresh the page to update all states
      window.location.reload();
    } else {
      // Handle error
      navigate('/login');
    }
  }, [navigate, location]);

  return (
    <div>
      Processing authentication...
    </div>
  );
};

export default AuthCallback;