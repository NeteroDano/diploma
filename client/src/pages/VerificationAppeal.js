import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VerificationAppeal = () => {
    const [content, setContent] = useState('');
    const [documents, setDocuments] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', content);
        documents.forEach(doc => formData.append('documents', doc));

        try {
            const token = localStorage.getItem('token');
            console.log('Submitting appeal with data:', { content, documents });
            // const response = await axios.post('http://localhost:3000/appeals/submit', formData, {
            const response = await axios.post('https://diploma-2507928da0ba.herokuapp.com/appeals/submit', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Server response:', response);
            alert('Appeal submitted successfully');
            navigate('/');
        } catch (error) {
            console.error('Error submitting appeal', error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Failed to submit appeal');
            }
        }
    };

    const handleFileChange = (e) => {
        setDocuments([...e.target.files]);
    };

    return (
        <div className="container mt-5">
            <h2>Submit Appeal</h2>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <form onSubmit={handleSubmit}>
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
                    <label htmlFor="documents">Documents:</label>
                    <input
                        type="file"
                        className="form-control"
                        id="documents"
                        onChange={handleFileChange}
                        multiple
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
};

export default VerificationAppeal;
