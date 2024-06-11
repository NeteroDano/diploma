import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const VerificationStatus = () => {
    const [status, setStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatus = async () => {
            const token = localStorage.getItem('token');
            try {
                 const response = await axios.get('http://localhost:3000/verification/status', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.data) {
                    setStatus(response.data);
                } else {
                    alert('You have not submitted a verification request.'); 
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching verification status', error);
                alert('Error fetching verification status');
                navigate('/');
            }
        };

        fetchStatus();
    }, [navigate]);

    if (!status) {
        return <div>Loading...</div>;
    }

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Verification Status</h2>
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>Verification Status</Card.Title>
                    <div><strong>Full Name:</strong> {status.full_name}</div>
                    <div><strong>Content:</strong> {status.content}</div>
                    <div><strong>Status:</strong> {status.status}</div>
                    <div><strong>Desired Role:</strong> {status.desired_role}</div>
                    <div><strong>Created At:</strong> {status.created_at}</div>
                    <div><strong>Verified At:</strong> {status.verified_at || 'Not verified yet'}</div>
                    {status.admin_message && (
                        <div><strong>Admin Message:</strong> {status.admin_message}</div>
                    )}
                    {status.documents && (
                        <div>
                            <strong>Documents:</strong>
                            {status.documents.split(',').map((doc, index) => (
                                <div key={index}>
                                    {doc.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                     <img src={`http://localhost:3000/verification_docs/${doc}`} alt={`Document ${index + 1}`} className="img-thumbnail" style={{ width: '150px', height: '150px', objectFit: 'cover', margin: '5px' }} />
                                    ) : (
                                     <a href={`http://localhost:3000/verification_docs/${doc}`} target="_blank" rel="noopener noreferrer">Download Document {index + 1}</a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default VerificationStatus;
