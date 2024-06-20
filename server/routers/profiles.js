const express = require('express');
const router = express.Router();
const db = require('../data/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, validateId } = require('../middlewares/authMiddlewares');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/');
        console.log('Uploading file to:', uploadPath);
        cb(null, uploadPath); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = uniqueSuffix + '-' + file.originalname;
        console.log('Saving file as:', fileName);
        cb(null, fileName);
    }
});

const profileFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

const profileUpload = multer({
    storage: storage,
    fileFilter: profileFileFilter,
});

const deleteOldAvatar = (oldAvatar) => {
    if (oldAvatar) {
        const oldAvatarPath = path.join(__dirname, '../uploads/', oldAvatar);
        fs.unlink(oldAvatarPath, (err) => {
            if (err) {
                console.error('Failed to delete old avatar:', err);
            } else {
                console.log('Old avatar deleted:', oldAvatarPath);
            }
        });
    }
};

router.get('/me', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const getUserProfileQuery = `
        SELECT u.id, u.name, u.email, u.role, p.bio, p.avatar
        FROM users u
        LEFT JOIN profiles p ON u.id = p.users_id
        WHERE u.id = ?
    `;
    
    db.query(getUserProfileQuery, [userId], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (userResults.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResults[0];

        const getUserRewardsQuery = `
            SELECT r.id, r.name, r.description, r.image, ur.obtained_at
            FROM user_rewards ur
            JOIN rewards r ON ur.rewards_id = r.id
            WHERE ur.users_id = ?
        `;
        
        db.query(getUserRewardsQuery, [userId], (err, rewardResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
                ...user,
                rewards: rewardResults
            });
        });
    });
});

router.put('/me', authenticateToken, validateId, profileUpload.single('avatar'), (req, res) => {
    const userId = req.user.id;
    const { bio } = req.body;
    const avatar = req.file ? req.file.filename : null;

    if (!bio && !avatar) {
        return res.status(400).json({ error: 'Bio or avatar must be provided.' });
    }

    db.query('SELECT avatar FROM profiles WHERE users_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user profile:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const oldAvatar = results[0] ? results[0].avatar : null;

        const updateFields = [];
        if (bio) updateFields.push('bio = ?');
        if (avatar) updateFields.push('avatar = ?');

        const updateProfileQuery = `UPDATE profiles SET ${updateFields.join(', ')} WHERE users_id = ?`;
        const updateParams = [];
        if (bio) updateParams.push(bio);
        if (avatar) updateParams.push(avatar);
        updateParams.push(userId);

        db.query(updateProfileQuery, updateParams, (err, results) => {
            if (err) {
                console.error('Error updating profile:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.affectedRows === 0) {
                const insertProfileQuery = 'INSERT INTO profiles (users_id, bio, avatar) VALUES (?, ?, ?)';
                db.query(insertProfileQuery, [userId, bio || '', avatar || ''], (err, results) => {
                    if (err) {
                        console.error('Error inserting profile:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    deleteOldAvatar(oldAvatar);
                    return res.status(200).json({ message: 'Profile updated successfully', avatar });
                });
            } else {
                deleteOldAvatar(oldAvatar);
                return res.status(200).json({ message: 'Profile updated successfully', avatar });
            }
        });
    });
});

router.get('/:name', authenticateToken, (req, res) => {
    const { name } = req.params;

    const userQuery = 'SELECT id, name, email, role FROM users WHERE name = ?';
    const profileQuery = 'SELECT bio, avatar FROM profiles WHERE users_id = ?';

    db.query(userQuery, [name], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (userResults.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResults[0];

        db.query(profileQuery, [user.id], (err, profileResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const profile = profileResults.length > 0 ? profileResults[0] : { bio: '', avatar: '' };

            res.json({ ...user, ...profile });
        });
    });
});

module.exports = router;
