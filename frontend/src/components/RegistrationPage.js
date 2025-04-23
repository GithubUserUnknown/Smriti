import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RegistrationPage.css'; // External CSS for styling

const RegistrationPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_CHATBOT_URL}/api/auth/register`, {
        email,
        password,
      });
      setMessage(res.data.message || 'Registration successful! You can now log in.');
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="registration-container">
      <h2>Register</h2>
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
        <button type="button" onClick={handleRegister}>
          Register
        </button>

        <button
  onClick={() => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`; // Redirect to Google login
  }}
  className="google-login-btn"
>
  Login with Google
</button>


      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RegistrationPage;
