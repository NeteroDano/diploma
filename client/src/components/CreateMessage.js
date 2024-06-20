import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CreateMessage = () => {
    const { name, category } = useParams();
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (content.length < 10 || content.length > 300) {
            alert('Content length must be between 10 and 300 characters');
            return;
        }
        
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

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="container mt-5">
            <h2>Create New Message in category {category}</h2>
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
                <div className="d-flex justify-content-between mt-3">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                    <button type="submit" className="btn btn-success">Submit</button>
                </div>
            </form>
        </div>
    );
};

export default CreateMessage;
