import React, { useState } from 'react';
import axios from 'axios';

function ChatMessage({ message, onSubmitRating }) {
  const [localRating, setLocalRating] = useState(0);
  const [faded, setFaded] = useState(false);
  const [error, setError] = useState(null);

  const handleStarClick = async (ratingValue) => {
    try {
      if (localRating === 0) { // Allow rating only once per message
        setLocalRating(ratingValue);
        await onSubmitRating(ratingValue);
        setTimeout(() => {
          setFaded(true);
        }, 500);
      }
    } catch (error) {
      setError('Failed to submit rating');
      setLocalRating(0); // Reset rating on error
      console.error('Rating submission error:', error);
    }
  };

  return (
    <div className="message-wrapper">
      {/* User Message */}
      {message.user && (
        <div className="message user">
          <div className="message-content">
            <p>{message.user}</p>
          </div>
          <div className="message-metadata">
            <span className="timestamp">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}

      {/* AI Message */}
      {message.ai && (
        <div className="message ai">
          <div className="message-content">
            <p>{message.ai}</p>
            
            {/* Image Display */}
            {message.imagePaths && message.imagePaths.length > 0 && (
              <div className="message-images">
                {message.imagePaths.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="AI Generated"
                    className="message-image"
                  />
                ))}
              </div>
            )}

        {/* Star Rating Section */}
        {!faded && (
          <div
            style={{
              marginTop: '10px',
              opacity: faded ? 0 : 1,
              transition: 'opacity 1s ease-out'
            }}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <span
                key={value}
                style={{
                  cursor: 'pointer',
                  color: value <= localRating ? 'gold' : 'gray',
                  fontSize: '20px',
                  marginRight: '5px'
                }}
                onClick={() => handleStarClick(value)}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="message-metadata">
            <span className="timestamp">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
