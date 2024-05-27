const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticateToken } = require('../middlewares/authMiddlewares');

// Отримання всіх повідомлень для автора/студії за категорією
router.get('/:targetName/:category', authenticateToken, (req, res) => {
    const { targetName, category } = req.params;

    const query = `
        SELECT m.id, u.name AS user_name, m.content, m.positive_rating, m.negative_rating, m.created_at
        FROM messages m
        JOIN users u ON m.users_id = u.id
        JOIN users t ON m.target_id = t.id
        WHERE t.name = ? AND m.category = ?
        ORDER BY m.created_at DESC
    `;

    db.query(query, [targetName, category], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

// Додавання нового повідомлення
router.post('/', authenticateToken, (req, res) => {
    const { targetName, category, content } = req.body;
    const userId = req.user.id;

    if (!targetName || !category || !content) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Отримати target_id за name
    const getUserQuery = `SELECT id, role FROM users WHERE name = ?`;
    db.query(getUserQuery, [targetName], (err, userResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (userResults.length === 0) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        const targetUser = userResults[0];
        const validRoles = ['author', 'studio'];

        if (!validRoles.includes(targetUser.role)) {
            return res.status(403).json({ error: 'You can only send messages to authors or studios.' });
        }

        const targetId = targetUser.id;

        const query = `
            INSERT INTO messages (users_id, target_id, category, content, positive_rating, negative_rating, created_at)
            VALUES (?, ?, ?, ?, 0, 0, CURDATE())
        `;

        db.query(query, [userId, targetId, category, content], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ message: 'Message created successfully' });
        });
    });
});

// Оновлення позитивного рейтингу
router.post('/:id/upvote', authenticateToken, (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE messages SET positive_rating = positive_rating + 1 WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json({ message: 'Message upvoted successfully' });
    });
});

// Оновлення негативного рейтингу
router.post('/:id/downvote', authenticateToken, (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE messages SET negative_rating = negative_rating + 1 WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json({ message: 'Message downvoted successfully' });
    });
});



module.exports = router;
