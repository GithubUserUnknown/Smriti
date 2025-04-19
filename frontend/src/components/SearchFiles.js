import React, { useState } from 'react';
import axios from 'axios';

const SearchFiles = () => {
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/search', {
                params: { keyword, category },
            });
            setResults(res.data.files);
        } catch (error) {
            console.error('Search failed!', error.message);
        }
    };

    return (
        <div>
            <h2>Search Files</h2>
            <input
                type="text"
                placeholder="Search by keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />
            <input
                type="text"
                placeholder="Search by category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            {results.length > 0 && (
                <ul>
                    {results.map((file) => (
                        <li key={file.id}>
                            {file.filename} - {file.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchFiles;