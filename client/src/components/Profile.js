import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
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
      const response = await axios.put(
        'http://localhost:3000/profiles/me',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // Оновлення стану профілю з новими даними з сервера
      const updatedProfile = { ...profile, bio };
      if (avatar) {
        updatedProfile.avatar = URL.createObjectURL(avatar);
      }
      setProfile(updatedProfile);
      setIsEditing(false);
      setAvatar(null);
    } catch (error) {
      console.error('Error updating profile', error);
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
                    alt="Avatar" 
                    className="img-thumbnail"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="img-thumbnail" 
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}>
                    No avatar available
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
                      />
                    </div>
                    <button type="button" className="btn btn-primary mt-3" onClick={handleSave}>
                      Save
                    </button>
                    <button type="button" className="btn btn-secondary mt-3 ml-2" onClick={handleCancel}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div>
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Role:</strong> {profile.role}</p>
                    <p><strong>Bio:</strong> {profile.bio || 'No bio available'}</p>
                    <button className="btn btn-primary mt-3" onClick={handleEdit}>
                      Edit Profile
                    </button>
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
