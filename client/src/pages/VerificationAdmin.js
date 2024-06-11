import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Container, Button, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const VerificationAdmin = () => {
    const [verifications, setVerifications] = useState([]);
    const [appeals, setAppeals] = useState([]);

    useEffect(() => {
        const fetchVerifications = async () => {
            const token = localStorage.getItem('token');
            try {
                 const response = await axios.get('http://localhost:3000/verification/admin/requests', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setVerifications(response.data);
            } catch (error) {
                console.error('Error fetching verification requests', error);
            }
        };

        const fetchAppeals = async () => {
            const token = localStorage.getItem('token');
            try {
                 const response = await axios.get('http://localhost:3000/appeals/admin/requests', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAppeals(response.data);
            } catch (error) {
                console.error('Error fetching appeal requests', error);
            }
        };

        fetchVerifications();
        fetchAppeals();
    }, []);

    const handleVerificationDecision = async (id, decision, message) => {
        const token = localStorage.getItem('token');
        try {
             await axios.post(`http://localhost:3000/verification/verify/${id}`, {
                status: decision,
                message: message
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setVerifications(verifications.filter(verification => verification.id !== id));
            alert('Verification decision submitted successfully');
        } catch (error) {
            console.error('Error submitting verification decision', error);
            alert('Failed to submit verification decision');
        }
    };

    const handleAppealDecision = async (id, decision, message) => {
        const token = localStorage.getItem('token');
        try {
             await axios.post(`http://localhost:3000/appeals/verify/${id}`, {
                status: decision,
                message: message
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setAppeals(appeals.filter(appeal => appeal.id !== id));
            alert('Appeal decision submitted successfully');
        } catch (error) {
            console.error('Error submitting appeal decision', error);
            alert('Failed to submit appeal decision');
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Admin Dashboard</h2>
            <div className="mb-4">
                <h3>Verification Requests</h3>
                {verifications.length === 0 ? (
                    <Alert variant="info">No verification requests available.</Alert>
                ) : (
                    verifications.map((verification) => (
                        <Card key={verification.id} className="mb-3">
                            <Card.Body>
                                <Card.Title>Verification Request</Card.Title>
                                <Card.Text><strong>Full Name:</strong> {verification.full_name}</Card.Text>
                                <Card.Text><strong>Content:</strong> {verification.content}</Card.Text>
                                <Card.Text><strong>Status:</strong> {verification.status}</Card.Text>
                                <Card.Text><strong>Desired Role:</strong> {verification.desired_role}</Card.Text>
                                <Card.Text><strong>Created At:</strong> {verification.created_at}</Card.Text>
                                <Card.Text><strong>Verified At:</strong> {verification.verified_at || 'Not verified yet'}</Card.Text>
                                {verification.documents && (
                                    <Card.Text>
                                        <strong>Documents:</strong> 
                                        {verification.documents.split(',').map((doc, index) => (
                                            <div key={index}>
                                                {doc.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                                 <img src={`http://localhost:3000/uploads/${doc}`} alt={`Document ${index + 1}`} className="img-thumbnail" style={{ width: '150px', height: '150px', objectFit: 'cover', margin: '5px' }} />
                                                ) : (
                                                 <a href={`http://localhost:3000/verification_docs/${doc}`} target="_blank" rel="noopener noreferrer">Download Document {index + 1}</a>
                                            )}
                                        </div>
                                        ))}
                                    </Card.Text>
                                )}
                                <Form onSubmit={(e) => {
                                    e.preventDefault();
                                    const decision = e.target.elements.decision.value;
                                    const message = e.target.elements.message.value;
                                    handleVerificationDecision(verification.id, decision, message);
                                }}>
                                    <Form.Group controlId="decision">
                                        <Form.Label>Decision</Form.Label>
                                        <Form.Control as="select" style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}>
                                            <option value="approved">Approve</option>
                                            <option value="rejected">Reject</option>
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group controlId="message">
                                        <Form.Label>Message</Form.Label>
                                        <Form.Control type="text" placeholder="Enter message" style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}/>
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="mt-3">Submit</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </div>
            <div>
                <h3>Appeal Requests</h3>
                {appeals.length === 0 ? (
                    <Alert variant="info">No appeal requests available.</Alert>
                ) : (
                    appeals.map((appeal) => (
                        <Card key={appeal.id} className="mb-3">
                            <Card.Body>
                                <Card.Title>Appeal Request</Card.Title>
                                <Card.Text><strong>Appeal Content:</strong> {appeal.appeal_content}</Card.Text>
                                <Card.Text><strong>Appeal Submitted At:</strong> {appeal.appeal_at}</Card.Text>
                                <Card.Text><strong>Appeal Status:</strong> {appeal.appeal_status}</Card.Text>
                                <Card.Text><strong>Appeal Admin Message:</strong> {appeal.appeal_admin_message}</Card.Text>
                                {appeal.appeal_documents && (
                                    <Card.Text>
                                        <strong>Appeal Documents:</strong> 
                                        {appeal.appeal_documents.split(',').map((doc, index) => (
                                            <div key={index}>
                                                {doc.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                                 <img src={`http://localhost:3000/uploads/${doc}`} alt={`Document ${index + 1}`} className="img-thumbnail" style={{ width: '150px', height: '150px', objectFit: 'cover', margin: '5px' }} />
                                                ) : (
                                                 <a href={`http://localhost:3000/verification_docs/${doc}`} target="_blank" rel="noopener noreferrer">Download Document {index + 1}</a>
                                            )}
                                        </div>
                                        ))}
                                    </Card.Text>
                                )}
                                <Form onSubmit={(e) => {
                                    e.preventDefault();
                                    const decision = e.target.elements.decision.value;
                                    const message = e.target.elements.message.value;
                                    handleAppealDecision(appeal.id, decision, message);
                                }}>
                                    <Form.Group controlId="decision">
                                        <Form.Label>Decision</Form.Label>
                                        <Form.Control as="select" style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}>
                                            <option value="approved">Approve</option>
                                            <option value="rejected">Reject</option>
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group controlId="message">
                                        <Form.Label>Message</Form.Label>
                                        <Form.Control type="text" placeholder="Enter message" style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}/>
                                    </Form.Group>
                                    <Button variant="primary" type="submit" className="mt-3">Submit</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </div>
        </Container>
    );
};

export default VerificationAdmin;
