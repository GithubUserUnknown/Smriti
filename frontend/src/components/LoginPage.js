import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css'; // External CSS for styling

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      });
      setMessage(res.data.message || 'Login successful!');
      localStorage.setItem('token', res.data.token); // Store JWT token
      onLogin({ email }); // Update authentication state
      navigate('/'); // Redirect to homepage
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Invalid credentials. Please try again.'
      );
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="button" onClick={handleLogin}>
          Login
        </button>
      </form>
      <button onClick={handleGoogleLogin} className="google-login-btn">
        Login with Google
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default LoginPage;
