import React, { useState } from 'react';
import axios from 'axios';

const AIConfig = ({ setPersonalityConfig }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('female'); // Default to female
  const [behaviorPrompt, setBehaviorPrompt] = useState('');

  // Handle form submission to set personality and behavior
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a name for the AI!');
      return;
    }

    // Update personality configuration in parent (ChatInterface)
    setPersonalityConfig({ name, gender, behaviorPrompt });
    alert('Personality updated successfully!');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h3>Configure AI Personality</h3>

      <div style={{ marginBottom: '10px' }}>
        <label>
          AI Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter AI name"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>
          AI Gender:
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>
          Behavior Prompt (Optional):
          <textarea
            value={behaviorPrompt}
            onChange={(e) => setBehaviorPrompt(e.target.value)}
            placeholder="E.g., Be formal or playful"
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </label>
      </div>

      <button
        type="submit"
        style={{
          padding: '10px 20px',
          borderRadius: '5px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Save Personality
      </button>
    </form>
  );
};

export default AIConfig;