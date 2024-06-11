import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';

const Messages = () => {
    const { name, category } = useParams();
    const [messages, setMessages] = useState([]);
    const [sort, setSort] = useState('date');
    const [order, setOrder] = useState('desc');
    const [isAdmin, setIsAdmin] = useState(false);
    const [replyMessageId, setReplyMessageId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyFile, setReplyFile] = useState(null);
    const [view, setView] = useState('unanswered');
    const [expandedMessageId, setExpandedMessageId] = useState(null);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    // useEffect(() => {
    //     fetchMessages();
    // }, [name, category, sort, order, view]);

    const fetchMessages = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
             const response = await axios.get(`http://localhost:3000/messages/${name}/${category}`, {
                params: { sort, order, view },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages(response.data);

             const userResponse = await axios.get('http://localhost:3000/profiles/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsAdmin(userResponse.data.role === 'admin');
        } catch (error) {
            console.error('Error fetching messages', error);
        }
    }, [name, category, sort, order, view]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const fetchAnswers = async (messageId) => {
        const token = localStorage.getItem('token');
        try {
             const response = await axios.get(`http://localhost:3000/answers/messages/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAnswers(prevAnswers => ({ ...prevAnswers, [messageId]: response.data }));
        } catch (error) {
            console.error('Error fetching answers', error);
        }
    };

    const handleVote = async (id, rating) => {
        const token = localStorage.getItem('token');
        try {
             await axios.post(`http://localhost:3000/messages/${id}/rate`, { rating }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    msg.id === id 
                        ? {
                            ...msg,
                            positive_rating: rating === 'positive' ? msg.positive_rating + 1 : msg.positive_rating,
                            negative_rating: rating === 'negative' ? msg.negative_rating + 1 : msg.negative_rating
                          } 
                        : msg
                )
            );
            alert('Vote submitted successfully');
        } catch (error) {
            if (error.response && (error.response.status === 400 || error.response.status === 403)) {
                alert(error.response.data.error);
            } else {
                console.error('Error voting for message', error);
                alert('Error voting for message');
            }
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
             await axios.delete(`http://localhost:3000/messages/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id));
            alert('Message deleted successfully');
        } catch (error) {
            console.error('Error deleting message', error);
            alert('Failed to delete message');
        }
    };

    const handleReply = async (messageId) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('message_id', messageId);
        formData.append('content', replyContent);
        if (replyFile) formData.append('file', replyFile);

        try {
             const response = await axios.post('http://localhost:3000/answers', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            setReplyMessageId(null);
            setReplyContent('');
            setReplyFile(null);
            fetchMessages();
            alert('Reply posted successfully');
        } catch (error) {
            console.error('Error posting reply', error);
            alert('Failed to post reply');
        }
    };

    const handleSortChange = (newSort) => {
        if (sort === newSort) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSort(newSort);
            setOrder('asc');
        }
    };

    const toggleReply = (messageId) => {
        if (expandedMessageId === messageId) {
            setExpandedMessageId(null);
        } else {
            setExpandedMessageId(messageId);
            fetchAnswers(messageId);
        }
    };

    const renderFile = (filePath) => {
        if (!filePath) return null;

        const fileExtension = filePath.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
             return <img src={`http://localhost:3000/uploads/${filePath}`} alt="Attached file" style={{ maxWidth: '100%', maxHeight: '400px' }} />;
        } else if (fileExtension === 'pdf') {
             return <iframe src={`http://localhost:3000/uploads/${filePath}`} title="Attached file" style={{ width: '100%', height: '400px' }}></iframe>;
        } else {
             return <a href={`http://localhost:3000/uploads/${filePath}`} target="_blank" rel="noopener noreferrer">View attached file</a>;
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (file && allowedTypes.includes(file.type)) {
            setReplyFile(file);
        } else {
            alert('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            e.target.value = null;
        }
    };

    const unansweredMessages = messages.filter(message => !message.has_answers);
    const answeredMessages = messages.filter(message => message.has_answers);

    return (
        <div className="container mt-5">
            <h2>Messages in {category}</h2>
            
            
            <div className="d-flex justify-content-center w-100 mb-3 ">
                <button className={`btn ${view === 'unanswered' ? 'btn-primary' : 'btn-outline-primary'} me-2 w-50`} onClick={() => setView('unanswered')}>Unanswered Messages</button>
                <button className={`btn ${view === 'answered' ? 'btn-primary' : 'btn-outline-primary'} w-50`} onClick={() => setView('answered')}>Answered Messages</button>
            </div>
            
            <div className="d-flex justify-content-between w-100 mb-3">
                <button className="btn btn-secondary mb-3 me-5 w-25" onClick={() => navigate(`/profile/${name}`)}>Back to Profile</button>
                <Link to={`/profile/${name}/${category}/create`} className="btn btn-success mb-3 w-25">
                    Add Message
                </Link>
            </div>
            <div>
                <button onClick={() => handleSortChange('date')} className={`btn ${sort === 'date' ? 'btn-secondary' : 'btn-outline-secondary'} me-2`}>
                    Sort by Date ({order})
                </button>
                <button onClick={() => handleSortChange('rating')} className={`btn ${sort === 'rating' ? 'btn-secondary' : 'btn-outline-secondary'}`}>
                    Sort by Rating ({order})
                </button>
            </div>
                
            {view === 'unanswered' && (
                <div>
                    <h3>Unanswered Messages</h3>
                    <ul className="list-group" >
                        {unansweredMessages.map(message => (
                            <li key={message.id} className="list-group-item" style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}>
                                <div>
                                    <p><strong>{message.user_name}:</strong> {message.content}</p>
                                    <p><small>Positive: {message.positive_rating} Negative: {message.negative_rating}</small></p>
                                    <p><small>Posted on: {moment(message.created_at).format('YYYY-MM-DD HH:mm:ss')}</small></p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <button className="btn btn-success" onClick={() => handleVote(message.id, 'positive')}>Upvote</button>
                                        <button className="btn btn-danger" onClick={() => handleVote(message.id, 'negative')}>Downvote</button>
                                        {isAdmin && (
                                            <button className="btn btn-danger" onClick={() => handleDelete(message.id)}>Delete</button>
                                        )}
                                        <button className="btn btn-primary" onClick={() => setReplyMessageId(message.id)}>Reply</button>
                                    </div>
                                    {replyMessageId === message.id && (
                                        <div className="mt-3">
                                            <label htmlFor="content">Answer:</label>
                                            <textarea
                                                className="form-control"
                                                placeholder='Enter answer'
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <input
                                                type="file"
                                                className="form-control mt-2"
                                                style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                                                onChange={handleFileChange}
                                            />
                                            <button className="btn btn-success mt-2" onClick={() => handleReply(message.id)}>Send</button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {view === 'answered' && (
                <div>
                    <h3>Answered Messages</h3>
                    <ul className="list-group">
                        {answeredMessages.map(message => (
                            <li key={message.id} className="list-group-item" style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}>
                                <div>
                                    <p><strong>{message.user_name}:</strong> {message.content}</p>
                                    <p><small>Positive: {message.positive_rating} Negative: {message.negative_rating}</small></p>
                                    <p><small>Posted on: {moment(message.created_at).format('YYYY-MM-DD HH:mm:ss')}</small></p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <button className="btn btn-success" onClick={() => handleVote(message.id, 'positive')}>Upvote</button>
                                        <button className="btn btn-danger" onClick={() => handleVote(message.id, 'negative')}>Downvote</button>
                                        {isAdmin && (
                                            <button className="btn btn-danger" onClick={() => handleDelete(message.id)}>Delete</button>
                                        )}
                                        <button className="btn btn-primary" onClick={() => toggleReply(message.id)}>View Replies</button>
                                    </div>
                                    {expandedMessageId === message.id && (
                                        <div className="mt-3">
                                            <ul className="list-group">
                                                {answers[message.id] && answers[message.id].map(answer => (
                                                    <li key={answer.id} className="list-group-item">
                                                        <p><strong>{answer.user_name}:</strong> {answer.content}</p>
                                                        {answer.file_path && renderFile(answer.file_path)}
                                                        <p><small>Answered on: {moment(answer.created_at).format('YYYY-MM-DD HH:mm:ss')}</small></p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Messages;
