import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatMessage from './ChatMessage';
import PersonalityManager from './PersonalityManager';
import api from '../utils/api';
import '../styles/ChatInterface.css';
import EmojiPicker from 'emoji-picker-react';
import { useSpeechRecognition } from 'react-speech-recognition';

const ChatInterface = ({ config = {} }) => {
  // Destructure configuration with defaults
  const {
    enableEmoji = true,
    enableAttachments = true,
    enableVoice = true,
  } = config;

  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [personalityConfig, setPersonalityConfig] = useState({
    name: 'Smriti',
    gender: 'female',
    age: 23,
    behaviorPrompt: 'You are cheerful, bright, and a bit flirty. Your tone should be warm, playful, and friendly.',
  });
  const [persistCompanyContext, setPersistCompanyContext] = useState('');
  const [persistCompanyCount, setPersistCompanyCount] = useState(0); // count for persisting company data over next 5 queries
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  
  // Voice recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          throw new Error('No authentication token found');
        }

        const userResponse = await api.get('/api/auth/user-data', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        setUserId(userResponse.data.googleId);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
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
    if (!userId) {
      console.error('User ID not available');
      return;
    }

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
      persistentCompanyContext: persistCompanyContext
    };

    try {
      const res = await api.post('/api/ai-query', payload);
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

  // Handle file attachment
  const handleFileAttachment = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Add file handling logic here
      // You might want to upload to a server or process it
      console.log('File attached:', file);
    }
  };

  // Handle emoji selection
  const onEmojiClick = (event, emojiObject) => {
    setQuery(prevQuery => prevQuery + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (listening) {
      setIsRecording(false);
      // Add transcript to query
      setQuery(prevQuery => prevQuery + ' ' + transcript);
      resetTranscript();
    } else {
      setIsRecording(true);
      resetTranscript();
    }
  };

  const handleSubmitRating = async (message, ratingValue) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await api.post('/api/submit-rating', {
        query: message.user,
        response: message.ai,
        rating: ratingValue
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Rating submitted successfully!');
    } catch (error) {
      console.error('Failed to submit rating:', error.message);
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2 className="chat-title">
          <i className="fas fa-robot"></i>
          Chat with {personalityConfig.name}
        </h2>
        <PersonalityManager userId={userId} onSelectPersonality={handleSelectPersonality} />
      </div>

      <div ref={chatWindowRef} className="chat-window">
        {conversation.map((msg, index) => (
          <div
            ref={index === conversation.length - 1 ? lastMessageRef : null}
            key={index}
          >
            <ChatMessage 
              message={msg} 
              isUser={Boolean(msg.user)}
              showAvatar={true}
              showTimestamp={true}
              onSubmitRating={(ratingValue) => handleSubmitRating(msg, ratingValue)}
            />
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
      </div>

      <div className={`chat-input-container ${isFocused ? 'focused' : ''}`}>
        {showEmojiPicker && enableEmoji && (
          <div className="emoji-picker-container">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
        
        <div className="input-toolbar">
          {enableEmoji && (
            <button 
              className="toolbar-button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Emoji picker"
            >
              <i className="far fa-smile"></i>
            </button>
          )}
          
          {enableAttachments && (
            <button 
              className="toolbar-button"
              onClick={() => fileInputRef.current.click()}
              title="Attach file"
            >
              <i className="fas fa-paperclip"></i>
            </button>
          )}
          
          {enableVoice && browserSupportsSpeechRecognition && (
            <button 
              className={`toolbar-button ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceInput}
              title="Voice input"
            >
              <i className={`fas fa-microphone${isRecording ? '-slash' : ''}`}></i>
            </button>
          )}
          
          {enableAttachments && (
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttachment}
              style={{ display: 'none' }}
            />
          )}
        </div>

        <textarea
          ref={inputRef}
          className="chat-textarea"
          placeholder="Type your message here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={1}
        />
        
        <button 
          className="send-button" 
          onClick={handleQuery}
          disabled={!query.trim()}
          aria-label="Send message"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
