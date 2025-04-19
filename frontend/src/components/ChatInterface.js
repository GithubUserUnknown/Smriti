import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatMessage from './ChatMessage';
import PersonalityManager from './PersonalityManager';

const ChatInterface = () => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [personalityConfig, setPersonalityConfig] = useState({
    name: 'Smriti',
    gender: 'female',
    age: 23,
    behaviorPrompt: 'You are cheerful, bright, and a bit flirty. Your tone should be warm, playful, and friendly.',
  });
  const [persistCompanyContext, setPersistCompanyContext] = useState('');
  const [persistCompanyCount, setPersistCompanyCount] = useState(0); // count for persisting company data over next 5 queries

  const userId = 'user123'; // Replace with real user ID in production

  const chatWindowRef = useRef(null);
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [conversation]);

  // Summarize the last 5 conversational exchanges
  const summarizeLastFiveConversations = () => {
    const lastFive = conversation.slice(-5);
    return lastFive
      .map((entry) => `User: ${entry.user}\nAI: ${entry.ai}`)
      .join('\n\n');
  };

  const handleQuery = async () => {
    if (query.trim() === '') {
      alert('Please enter a message before sending!');
      return;
    }

    // Generate conversation summary from last 5 exchanges
    const contextSummary = summarizeLastFiveConversations();

    // Prepare the payload including any persistent company context if active.
    const payload = {
      query,
      userId,
      ...personalityConfig,
      conversationHistory: contextSummary,
      persistentCompanyContext: persistCompanyContext // include persistent value if it exists
    };

    try {
      const res = await axios.post('http://localhost:5000/api/ai-query', payload);
      const newResponse = {
        user: query,
        ai: res.data?.response || 'Oops! I could not generate a response this time.',
      };
      setConversation((prev) => [...prev, newResponse]);
      setQuery('');

      // If the response indicates that company data was used, persist that context
      if (res.data.companyDataUsed) {
        // Set or refresh the persistent company context and reset the counter to 5
        setPersistCompanyContext(res.data.companyContext);
        setPersistCompanyCount(5);
      } else if (persistCompanyCount > 0) {
        // Decrement the counter on each query when persisting company data
        setPersistCompanyCount(persistCompanyCount - 1);
        if (persistCompanyCount - 1 === 0) {
          // Clear persistent company context after 5 queries
          setPersistCompanyContext('');
        }
      }
    } catch (error) {
      console.error('Query failed:', error.message);
      const fallbackResponse = { user: query, ai: 'Oops! Something went wrong.' };
      setConversation((prev) => [...prev, fallbackResponse]);
      setQuery('');
    }
  };

  // Handle Enter vs. Shift+Enter behavior.
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  // Callback when a personality is selected (or created) in the PersonalityManager.
  const handleSelectPersonality = (selected) => {
    setPersonalityConfig({
      name: selected.name,
      gender: selected.gender,
      age: selected.age,
      behaviorPrompt: selected.behavior_prompt || '',
    });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Chat with AI</h2>

      {/* Personality Management Component */}
      <PersonalityManager userId={userId} onSelectPersonality={handleSelectPersonality} />

      {/* Chat Window */}
      <div
        ref={chatWindowRef}
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '10px',
          height: '400px',
          overflowY: 'auto',
          marginBottom: '20px',
          backgroundColor: '#f9f9f9',
        }}
      >
        {conversation.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg}
            onSubmitRating={(ratingValue) => {
              // Rating submission logic (can be implemented as needed)
              axios
                .post('http://localhost:5000/api/submit-rating', {
                  query: msg.user,
                  response: msg.ai,
                  rating: ratingValue,
                })
                .then(() => console.log('Rating submitted!'))
                .catch((err) => console.error('Rating submission error:', err.message));
            }}
          />
        ))}
      </div>

      {/* Query Input Block */}
      <textarea
        placeholder="Type your query here..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        rows="4"
        style={{
          width: '100%',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      />
      <button
        onClick={handleQuery}
        style={{
          padding: '10px 20px',
          borderRadius: '5px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Send
      </button>
    </div>
  );
};

export default ChatInterface;