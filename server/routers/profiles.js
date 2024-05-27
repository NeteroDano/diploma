const express = require('express');
const router = express.Router();
const db = require('../data/db');
const multer = require('multer');
const path = require('path');
const { authenticateToken, validateId } = require('../middlewares/authMiddlewares');

// Налаштування multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Отримання профілю користувача
router.get('/me', authenticateToken, validateId, (req, res) => {
    const userId = req.user.id;

    const userQuery = 'SELECT id, name, email, role FROM users WHERE id = ?';
    const profileQuery = 'SELECT bio, avatar FROM profiles WHERE users_id = ?';

    db.query(userQuery, [userId], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (userResults.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        db.query(profileQuery, [userId], (err, profileResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            return res.json({ ...userResults[0], ...profileResults[0] });
        });
    });
});

// Оновлення профілю користувача з можливістю завантаження аватара
router.put('/me', authenticateToken, validateId, upload.single('avatar'), (req, res) => {
    const userId = req.user.id;
    const { bio } = req.body;
    const avatar = req.file ? req.file.filename : null;

    console.log(`UserId: ${userId}, Bio: ${bio}, Avatar: ${avatar}`);

    if (!bio && !avatar) {
        return res.status(400).json({ error: 'Bio or avatar must be provided.' });
    }

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
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.affectedRows === 0) {
            const insertProfileQuery = 'INSERT INTO profiles (users_id, bio, avatar) VALUES (?, ?, ?)';
            db.query(insertProfileQuery, [userId, bio || '', avatar || ''], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                return res.status(200).json({ message: 'Profile updated successfully', avatar });
            });
        } else {
            return res.status(200).json({ message: 'Profile updated successfully', avatar });
        }
    });
});

// Отримання профілю користувача за іменем
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
