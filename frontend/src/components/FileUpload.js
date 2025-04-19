import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        formData.append('tags', tags);
        formData.append('category', category);

        try {
            const res = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(res);
            setMessage(res.data?.message || 'File uploaded and parsed successfully!');
        } catch (error) {
            console.error(error);
            setMessage('File upload failed!');
        }
    };

    

    return (
        <div>
            <h2>File Upload</h2>
            <input type="file" onChange={handleFileChange} />
            <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
            />
            <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            />
            <button onClick={handleUpload}>Upload</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default FileUpload;