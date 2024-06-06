import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppealStatus = () => {
    const [appealStatus, setAppealStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppealStatus = async () => {
            const token = localStorage.getItem('token');
            try {
                // const response = await axios.get('http://localhost:3000/appeals/status/latest', {
                const response = await axios.get('https://diploma-2507928da0ba.herokuapp.com/appeals/status/latest', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data) {
                    setAppealStatus(response.data);
                } else {
                    setAppealStatus(null);
                }
            } catch (error) {
                console.error('Error fetching appeal status', error);
                setAppealStatus(null);
            }
        };

        fetchAppealStatus();
    }, [navigate]);

    if (!appealStatus) {
        return <div>Loading...</div>;
    }

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Appeal Status</h2>
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>Appeal Status</Card.Title>
                    <div><strong>Appeal Content:</strong> {appealStatus.appeal_content}</div>
                    <div><strong>Appeal Submitted At:</strong> {appealStatus.appeal_at}</div>
                    <div><strong>Appeal Status:</strong> {appealStatus.appeal_status}</div>
                    <div><strong>Appeal Admin Message:</strong> {appealStatus.appeal_admin_message}</div>
                    {appealStatus.appeal_documents && (
                        <div>
                            <strong>Appeal Documents:</strong>
                            {appealStatus.appeal_documents.split(',').map((doc, index) => (
                                <div key={index}>
                                    {doc.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                    // <img src={`http://localhost:3000/verification_docs/${doc}`} alt={`Document ${index + 1}`} 
                                    <img src={`https://diploma-2507928da0ba.herokuapp.com/verification_docs/${doc}`} alt={`Document ${index + 1}`} 
                                    className="img-thumbnail" style={{ width: '150px', height: '150px', objectFit: 'cover', margin: '5px' }} />
                                    ) : (
                                    // <a href={`http://localhost:3000/verification_docs/${doc}`} target="_blank" rel="noopener noreferrer">Download Document {index + 1}</a>
                                    <a href={`https://diploma-2507928da0ba.herokuapp.com/verification_docs/${doc}`} target="_blank" rel="noopener noreferrer">Download Document {index + 1}</a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>
            {!appealStatus && (
                <Alert variant="info">No appeal submitted.</Alert>
            )}
        </Container>
    );
};

export default AppealStatus;
