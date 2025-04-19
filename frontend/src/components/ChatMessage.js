import React, { useState } from 'react';

function ChatMessage({ message, onSubmitRating }) {
  const [localRating, setLocalRating] = useState(0);
  const [faded, setFaded] = useState(false);

  const handleStarClick = (ratingValue) => {
    if (localRating === 0) { // Allow rating only once per message
      setLocalRating(ratingValue);
      setTimeout(() => {
        setFaded(true);
        onSubmitRating(ratingValue);
      }, 500);
    }
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      {/* User's message */}
      <div style={{ textAlign: 'right', marginBottom: '5px', color: '#007bff' }}>
        <strong>You:</strong> {message.user}
      </div>

      {/* AI's response */}
      <div
        style={{
          textAlign: 'left',
          backgroundColor: '#eef',
          padding: '10px',
          borderRadius: '5px',
          position: 'relative'
        }}
      >
        <strong>AI:</strong> {message.ai}

        {/* Display images from the database if available */}
        {message.imagePaths && message.imagePaths.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            {message.imagePaths.map((img, i) => (
              <img
                key={i}
                src={img} // Use the URL provided by the database. Adjust if a prefix is needed.
                alt="Associated"
                style={{
                  maxWidth: '150px',
                  marginRight: '10px',
                  borderRadius: '4px'
                }}
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
    </div>
  );
}

export default ChatMessage;