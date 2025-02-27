import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment-timezone';
import '../profile.css';

const Profile = () => {
    const [profile, setProfile] = useState({});
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/profiles/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProfile(response.data);
                setBio(response.data.bio || '');
            } catch (error) {
                console.error('Error fetching profile', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        const formData = new FormData();
        if (bio) {
            formData.append('bio', bio);
        }
        if (avatar) {
            formData.append('avatar', avatar);
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                'http://localhost:3000/profiles/me',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            const updatedProfile = { ...profile, bio };
            if (avatar) {
                updatedProfile.avatar = avatar.name;
            }
            setProfile(updatedProfile);
            setIsEditing(false);
            setAvatar(null);
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile', error);
            alert('Failed to update profile');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setBio(profile.bio);
        setAvatar(null);
    };

    const handleFileChange = (e) => {
        setAvatar(e.target.files[0]);
    };

    const checkRewards = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:3000/rewards/check-rewards', {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Rewards checked successfully');
            const updatedProfileResponse = await axios.get('http://localhost:3000/profiles/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProfile(updatedProfileResponse.data);
        } catch (error) {
            console.error('Error checking rewards', error);
            alert('Error checking rewards');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">Profile</h2>
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body d-flex">
                            <div className="mr-4 flex-shrink-0" style={{ width: '150px', height: '150px' }}>
                                {profile.avatar ? (
                                    <img 
                                        src={profile.avatar.startsWith('blob:') ? profile.avatar : `http://localhost:3000/uploads/${profile.avatar}`}
                                        alt="Avatar" 
                                        className="img-thumbnail"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div 
                                        className="img-thumbnail" 
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}>
                                        No avatar added yet
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow-1 ml-4">
                                {isEditing ? (
                                    <form>
                                        <div className="form-group">
                                            <label htmlFor="bio">Bio:</label>
                                            <textarea
                                                id="bio"
                                                className="form-control"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="avatar">Avatar:</label>
                                            <input
                                                type="file"
                                                id="avatar"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ border: '1px solid #ced4da', boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)' }}
                                            />
                                        </div>
                                        <div className="d-flex mt-3 justify-content-between align-items-center">
                                            <button type="button" className="btn btn-secondary mt-3 ml-2" onClick={handleCancel}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary mt-3" onClick={handleSave}>
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div>
                                        <p><strong>Name:</strong> {profile.name}</p>
                                        <p><strong>Email:</strong> {profile.email}</p>
                                        <p><strong>Role:</strong> {profile.role}</p>
                                        <p><strong>Bio:</strong> {profile.bio || 'No bio added yet'}</p>
                                        <h3>Rewards:</h3>
                                        <ul className="list-group">
                                            {profile.rewards && profile.rewards.length > 0 ? (
                                                profile.rewards.map(reward => (
                                                    <li key={reward.id} className="list-group-item">
                                                        <p><strong>Description:</strong> {reward.description}</p>
                                                        <p><strong>Obtained At:</strong> {moment.tz(reward.obtained_at, 'UTC').format('YYYY-MM-DD HH:mm:ss')}</p>
                                                        {reward.image && (
                                                            <img src={`http://localhost:3000/rewards/images/${reward.image}`} alt="Reward" className="img-thumbnail" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                                        )}
                                                    </li>
                                                ))
                                            ) : (
                                                <p>No rewards available</p>
                                            )}
                                        </ul>
                                        <div className="d-flex mt-3 justify-content-between align-items-center">
                                            <button className="btn btn-primary" onClick={handleEdit}>
                                                Edit Profile
                                            </button>
                                            <button className="btn btn-success" onClick={checkRewards}>
                                                Check Rewards
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
