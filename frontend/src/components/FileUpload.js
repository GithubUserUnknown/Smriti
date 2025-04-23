import React, { useState } from 'react';
import api from '../utils/api'; // Import the configured api instance
import '../styles/FileUpload.css'; // External CSS for styling

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [image, setImage] = useState(null); // State for optional image upload
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Single file
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]); // Optional image
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        if (image) formData.append('image', image);
        formData.append('description', description);
        formData.append('tags', tags);
        formData.append('category', category);

        const token = localStorage.getItem('token'); // Get token from storage

        setIsLoading(true);
        try {
            const res = await api.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` // Add authorization header
                },
            });
            setMessage(res.data?.message || 'File uploaded successfully!');
            
            // Clear form after successful upload
            setFile(null);
            setImage(null);
            setDescription('');
            setTags('');
            setCategory('');
            
            // Reset file input fields
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                input.value = '';
            });
        } catch (error) {
            console.error(error);
            setMessage(
                error.response?.data?.message || 
                'Upload failed. Please ensure you are logged in and try again.'
            );
            
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="file-upload-container">
            <h2>File Upload</h2>
            <div className="upload-form">
                <div className="form-group">
                    <label>Main File:</label>
                    <input 
                        type="file" 
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label>Optional Image:</label>
                    <input 
                        type="file" 
                        onChange={handleImageChange}
                        accept="image/*"
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label>Description:</label>
                    <input
                        type="text"
                        placeholder="Enter description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label>Tags:</label>
                    <input
                        type="text"
                        placeholder="Enter comma-separated tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                
                <div className="form-group">
                    <label>Category:</label>
                    <input
                        type="text"
                        placeholder="Enter category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                
                <button 
                    onClick={handleUpload} 
                    disabled={!file || isLoading}
                    className={isLoading ? 'loading' : ''}
                >
                    {isLoading ? 'Uploading...' : 'Upload'}
                </button>
                
                {message && (
                    <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
