import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CreateMessage = () => {
    const { name, category } = useParams();
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
             await axios.post('http://localhost:3000/messages', {
                targetName: name,
                category,
                content,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            alert('Message sent successfully');
            navigate(`/profile/${name}/${category}`);
        } catch (error) {
            console.error('Error creating message', error);
            alert('Failed to send message');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Create New Message in {category}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="content">Message:</label>
                    <textarea
                        id="content"
                        className="form-control"
                        placeholder='Enter Message'
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                    />
                </div>
                <button type="submit" className="btn btn-success mt-3">Submit</button>
            </form>
        </div>
    );
};

export default CreateMessage;
