import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api'; // Use the configured api instance

const PersonalityManager = ({ userId, onSelectPersonality }) => {
  const [personalities, setPersonalities] = useState([]);
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [form, setForm] = useState({
    name: '',
    gender: 'girl',
    age: 23,
    behaviorPrompt: '',
  });
  const [message, setMessage] = useState('');

  // Fetch saved personalities for the current user
  useEffect(() => {
    const fetchPersonalities = async () => {
      if (!userId) {
        console.log('No userId provided, skipping personality fetch');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const res = await api.get('/api/personalities', {
          params: { userId },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setPersonalities(res.data.personalities || []);
        
        // If there are personalities and none is selected, select the first one
        if (res.data.personalities?.length > 0 && !selectedPersonality) {
          const firstPersonality = res.data.personalities[0];
          setSelectedPersonality(String(firstPersonality.id));
          onSelectPersonality(firstPersonality);
        }
      } catch (error) {
        console.error('Error fetching personalities:', error.message);
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        setPersonalities([]);
      }
    };

    fetchPersonalities();
  }, [userId, onSelectPersonality]);

  // Create a new personality
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!userId) {
      setMessage('User ID is required to create a personality.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await api.post('/api/personalities', {
        userId,
        ...form
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setMessage('Personality created successfully!');
      // Refresh personality list
      setPersonalities((prev) => [res.data.personality, ...prev]);
      // Automatically select the newly created personality
      setSelectedPersonality(String(res.data.personality.id));
      onSelectPersonality(res.data.personality);
      
      // Clear form
      setForm({
        name: '',
        gender: 'girl',
        age: 23,
        behaviorPrompt: '',
      });
    } catch (error) {
      console.error('Error creating personality:', error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setMessage('Failed to create personality. Please try again.');
    }
  };

  // Handle dropdown change for selecting a personality
  const handleSelectionChange = (e) => {
    const personalityId = e.target.value;
    setSelectedPersonality(personalityId);
    const selected = personalities.find(
      (p) => String(p.id) === personalityId
    );
    if (selected) {
      onSelectPersonality(selected);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '8px',
      }}
    >
      <h3>Personality Manager</h3>
      <form onSubmit={handleCreate}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          >
            <option value="girl">Girl</option>
            <option value="boy">Boy</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={(e) =>
              setForm({ ...form, age: Number(e.target.value) })
            }
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            placeholder="Behavior Prompt (Optional)"
            value={form.behaviorPrompt}
            onChange={(e) =>
              setForm({ ...form, behaviorPrompt: e.target.value })
            }
            rows="3"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Create Personality
        </button>
      </form>
      {message && <p>{message}</p>}
      <hr />
      <h4>Select Personality</h4>
      {personalities.length > 0 ? (
        <select
          value={selectedPersonality}
          onChange={handleSelectionChange}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '16px',
          }}
        >
          <option value="">-- Choose a personality --</option>
          {personalities.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}, {p.gender}, {p.age}
              {p.behavior_prompt ? ` - ${p.behavior_prompt}` : ''}
            </option>
          ))}
        </select>
      ) : (
        <p>No saved personalities. Create one first.</p>
      )}
    </div>
  );
};

export default PersonalityManager;
