import React, { useState } from 'react';
import api from '../utils/api';

const SearchFiles = () => {
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        try {
            setError('');
            setHasSearched(true);
            const res = await api.get('/api/search', {
                params: { keyword, category }
            });
            setResults(res.data.files);
        } catch (error) {
            console.error('Search failed:', error);
            if (error.response?.status === 401) {
                // Handle unauthorized access
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                setError(error.response?.data?.message || 'Search failed. Please try again.');
            }
            setResults([]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div>
            <h2>Search Files</h2>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <input
                    type="text"
                    placeholder="Search by category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button 
                    onClick={handleSearch}
                    disabled={!keyword && !category}
                >
                    Search
                </button>
            </div>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {results.length > 0 && (
                <ul className="search-results">
                    {results.map((file) => (
                        <li key={file.id}>
                            {file.filename} - {file.description}
                        </li>
                    ))}
                </ul>
            )}
            
            {hasSearched && results.length === 0 && !error && (
                <p className="no-results">No files found matching your search criteria.</p>
            )}
        </div>
    );
};

export default SearchFiles;
