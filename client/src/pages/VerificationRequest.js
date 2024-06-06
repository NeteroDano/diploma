import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VerificationRequest = () => {
    const [fullName, setFullName] = useState('');
    const [content, setContent] = useState('');
    const [desiredRole, setDesiredRole] = useState('author');
    const [document, setDocument] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('content', content);
        formData.append('desired_role', desiredRole);
        formData.append('documents', document);
    
        try {
            const token = localStorage.getItem('token');
            // await axios.post('http://localhost:3000/verification/submit', formData, {
            await axios.post('https://diploma-2507928da0ba.herokuapp.com/verification/submit', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Verification request submitted successfully');
            navigate('/');
        } catch (error) {
            console.error('Error submitting verification request', error);
            alert('Failed to submit verification request');
        }
    };    

    return (
        <div className="container mt-5">
            <h2>Submit Verification Request</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">Content:</label>
                    <textarea
                        className="form-control"
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="desiredRole">Desired Role:</label>
                    <select
                        className="form-control"
                        id="desiredRole"
                        value={desiredRole}
                        onChange={(e) => setDesiredRole(e.target.value)}
                        required
                    >
                        <option value="author">Author</option>
                        <option value="studio">Studio</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="documents">Documents:</label>
                    <input
                        type="file"
                        className="form-control"
                        id="documents"
                        onChange={(e) => setDocument(e.target.files[0])}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
};

export default VerificationRequest;
