import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, Route, Routes } from 'react-router-dom';
import Messages from './Messages';
import CreateMessage from './CreateMessage';

const UserProfile = () => {
    const { name } = useParams();
    const [profile, setProfile] = useState({});
    const [categories] = useState(['questions', 'thanks', 'criticism', 'suggestions']);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                 const response = await axios.get(`http://localhost:3000/profiles/${name}`, {
              //  const response = await axios.get(`https://diploma-2507928da0ba.herokuapp.com/profiles/${name}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProfile(response.data);
            } catch (error) {
                console.error('Error fetching profile', error);
            }
        };

        fetchProfile();
    }, [name]);

    return (
        <div className="container mt-5">
            <h2 className="text-center">Profile</h2>
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body d-flex">
                            <div className="mr-4">
                                {profile.avatar ? (
                                    <img 
                                         src={profile.avatar.startsWith('blob:') ? profile.avatar : `http://localhost:3000/uploads/${profile.avatar}`} 
                                      //  src={profile.avatar.startsWith('blob:') ? profile.avatar : `https://diploma-2507928da0ba.herokuapp.com/uploads/${profile.avatar}`}
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
                                <p><strong>Name:</strong> {profile.name}</p>
                                <p><strong>Role:</strong> {profile.role}</p>
                                <p><strong>Bio:</strong> {profile.bio || 'No bio added yet'}</p>
                            </div>
                        </div>
                    </div>

                    {['author', 'studio'].includes(profile.role) && (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h3>Messages</h3>
                                <div className="d-flex gap-2">
                                    {categories.map(category => (
                                        <Link 
                                            key={category} 
                                            className="btn btn-primary flex-grow-1" 
                                            to={`/profile/${name}/${category}`}
                                        >
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </Link>
                                    ))}
                                </div>
                                <Routes>
                                    <Route path="/:category" element={<Messages />} />
                                    <Route path="/:category/create" element={<CreateMessage />} />
                                </Routes>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
