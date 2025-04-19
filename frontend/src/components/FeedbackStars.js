import React, { useState } from 'react';
import axios from 'axios';

const FeedbackStars = ({ query, response }) => {
    const [rating, setRating] = useState(0); // Selected rating

    const handleRating = async (value) => {
        setRating(value); // Update the local state
        try {
            await axios.post('http://localhost:5000/submit-feedback', {
                query, // User query
                response, // AI-generated response
                rating: value, // Numerical rating
            });
            console.log('Rating submitted successfully!');
        } catch (error) {
            console.error('Failed to submit rating:', error.message);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div className="feedback-stars" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                {[...Array(5)].map((_, index) => (
                    <span
                        key={index}
                        style={{
                            cursor: 'pointer',
                            color: index < rating ? 'gold' : 'gray',
                            fontSize: '20px',
                        }}
                        onClick={() => handleRating(index + 1)}
                    >
                        ★
                    </span>
                ))}
            </div>
            <div className="feedback-stars-bottom" style={{ textAlign: 'center', marginTop: '10px' }}>
                {[...Array(5)].map((_, index) => (
                    <span
                        key={index}
                        style={{
                            cursor: 'pointer',
                            color: index < rating ? 'gold' : 'gray',
                            fontSize: '20px',
                        }}
                        onClick={() => handleRating(index + 1)}
                    >
                        ★
                    </span>
                ))}
            </div>
        </div>
    );
};

export default FeedbackStars;