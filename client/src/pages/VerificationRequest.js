import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VerificationRequest = () => {
    const [fullName, setFullName] = useState('');
    const [content, setContent] = useState('');
    const [desiredRole, setDesiredRole] = useState('author');
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateFields = () => {
        if (fullName.length < 3 || fullName.length > 50) {
            return 'Full name must be between 3 and 50 characters.';
        }

        if (content.length < 10 || content.length > 500) {
            return 'Content must be between 10 and 500 characters.';
        }

        if (documents.length === 0) {
            return 'At least one document is required.';
        }

        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateFields();
        if (validationError) {
            setError(validationError);
            return;
        }

        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('content', content);
        formData.append('desired_role', desiredRole);
        documents.forEach(doc => formData.append('documents', doc));

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/verification/submit', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Verification request submitted successfully');
            navigate('/');
        } catch (error) {
            console.error('Error submitting verification request', error);
            if (error.response && error.response.data && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Unknown error occurred. Please try again.');
            }
        }
    };

    const handleFileChange = (e) => {
        setDocuments([...e.target.files]);
    };

    return (
        <div className="container mt-5">
            <h2>Submit Verification Request</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        placeholder='Enter full name'
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="content">Content:</label>
                    <textarea
                        className="form-control"
                        id="content"
                        placeholder='Enter content'
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
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
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
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
                        onChange={handleFileChange}
                        multiple
                        required
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                    />
                </div>
                <button type="submit" className="btn btn-success mt-3">Submit</button>
            </form>
        </div>
    );
};

export default VerificationRequest;
