import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const Messages = () => {
    const { name, category } = useParams();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`http://localhost:3000/messages/${name}/${category}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages', error);
            }
        };

        fetchMessages();
    }, [name, category]);

    const handleUpvote = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:3000/messages/${id}/upvote`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages(prevMessages => 
                prevMessages.map(msg => msg.id === id ? { ...msg, positive_rating: msg.positive_rating + 1 } : msg)
            );
        } catch (error) {
            console.error('Error upvoting message', error);
        }
    };

    const handleDownvote = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:3000/messages/${id}/downvote`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages(prevMessages => 
                prevMessages.map(msg => msg.id === id ? { ...msg, negative_rating: msg.negative_rating + 1 } : msg)
            );
        } catch (error) {
            console.error('Error downvoting message', error);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Messages in {category}</h2>
            <ul className="list-group">
                {messages.map(message => (
                    <li key={message.id} className="list-group-item">
                        <p><strong>{message.user_name}:</strong> {message.content}</p>
                        <p><small>Positive: {message.positive_rating}, Negative: {message.negative_rating}</small></p>
                        <p><small>Posted on: {message.created_at}</small></p>
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-success" onClick={() => handleUpvote(message.id)}>Upvote</button>
                            <button className="btn btn-danger" onClick={() => handleDownvote(message.id)}>Downvote</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Messages;
