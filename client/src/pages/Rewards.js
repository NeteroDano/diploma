import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Rewards = () => {
    const [rewards, setRewards] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchRewards();
        fetchUserRole();
    }, []);

    const fetchRewards = async () => {
        const token = localStorage.getItem('token');
        try {
             const response = await axios.get('http://localhost:3000/rewards', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRewards(response.data);
        } catch (error) {
            console.error('Error fetching rewards', error);
            alert('Failed to fetch rewards');
        }
    };

    const fetchUserRole = async () => {
        const token = localStorage.getItem('token');
        try {
             const response = await axios.get('http://localhost:3000/profiles/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsAdmin(response.data.role === 'admin');
        } catch (error) {
            console.error('Error fetching user role', error);
            alert('Failed to fetch user role');
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3000/rewards/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRewards(prevRewards => prevRewards.filter(reward => reward.id !== id));
            alert('Reward deleted successfully');
        } catch (error) {
            console.error('Error deleting reward', error);
            alert('Failed to delete reward');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Rewards</h2>
            <ul className="list-group">
                {rewards.map(reward => (
                    <li key={reward.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <p><strong>Name:</strong> {reward.name}</p>
                            <p><strong>Description:</strong> {reward.description}</p>
                            <p><strong>Condition:</strong> {reward.condition_type} - {reward.condition_value}</p>
                            {reward.image ? (
                                 <img src={`http://localhost:3000/rewards/images/${reward.image}`} alt="Reward" className="img-thumbnail" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            ) : (
                                <div className="img-thumbnail" style={{ width: '100px', height: '100px', objectFit: 'cover' }}>
                                    No image available
                                </div>
                            )}
                        </div>
                        {isAdmin && (
                            <button className="btn btn-danger" onClick={() => handleDelete(reward.id)}>Delete</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Rewards;
