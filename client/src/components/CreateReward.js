import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateReward = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [conditionType, setConditionType] = useState('');
    const [conditionValue, setConditionValue] = useState('');
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('condition_type', conditionType);
        formData.append('condition_value', conditionValue);
        if (image) formData.append('image', image);

        try {
             await axios.post('http://localhost:3000/rewards', formData, {
          //  await axios.post('https://diploma-2507928da0ba.herokuapp.com/rewards', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Reward created successfully');
            navigate('/rewards');
        } catch (error) {
            console.error('Error creating reward', error);
            alert('Failed to create reward');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Create Reward</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        placeholder='Enter name'
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <input
                        type="text"
                        id="description"
                        placeholder='Enter description'
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="conditionType">Condition Type:</label>
                    <select
                        id="conditionType"
                        className="form-control"
                        value={conditionType}
                        onChange={(e) => setConditionType(e.target.value)}
                        required
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                    >
                        <option value="">Select Condition Type</option>
                        <option value="messages_count">Messages Count</option>
                        <option value="answers_count">Answers Count</option>
                        <option value="net_votes">Net Votes</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="conditionValue">Condition Value:</label>
                    <input
                        type="number"
                        id="conditionValue"
                        placeholder='Enter condition value'
                        className="form-control"
                        value={conditionValue}
                        onChange={(e) => setConditionValue(e.target.value)}
                        required
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image">Image:</label>
                    <input
                        type="file"
                        id="image"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                    />
                </div>
                <button type="submit" className="btn btn-success mt-3">Submit</button>
            </form>
        </div>
    );
};

export default CreateReward;
