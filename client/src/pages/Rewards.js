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
         //   const response = await axios.get('https://diploma-2507928da0ba.herokuapp.com/rewards', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRewards(response.data);
        } catch (error) {
            console.error('Error fetching rewards', error);
        }
    };

    const fetchUserRole = async () => {
        const token = localStorage.getItem('token');
        try {
             const response = await axios.get('http://localhost:3000/profiles/me', {
          //  const response = await axios.get('https://diploma-2507928da0ba.herokuapp.com/profiles/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setIsAdmin(response.data.role === 'admin');
        } catch (error) {
            console.error('Error fetching user role', error);
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3000/rewards/${id}`, {
           // await axios.delete(`https://diploma-2507928da0ba.herokuapp.com/rewards/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRewards(prevRewards => prevRewards.filter(reward => reward.id !== id));
        } catch (error) {
            console.error('Error deleting reward', error);
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
                               // <img src={`https://diploma-2507928da0ba.herokuapp.com/rewards/images/${reward.image}`} alt="Reward" className="img-thumbnail" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
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
