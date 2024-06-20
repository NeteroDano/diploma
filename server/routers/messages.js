const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddlewares');

router.get('/:targetName/:category', authenticateToken, (req, res) => {
    const { targetName, category } = req.params;
    const { sort = 'date', order = 'desc', view } = req.query;

    let sortQuery;
    if (sort === 'date') {
        sortQuery = 'm.created_at';
    } else if (sort === 'rating') {
        sortQuery = '(m.positive_rating - m.negative_rating)';
    } else {
        return res.status(400).json({ error: 'Invalid sort parameter' });
    }

    let orderQuery;
    if (order === 'asc') {
        orderQuery = 'ASC';
    } else if (order === 'desc') {
        orderQuery = 'DESC';
    } else {
        return res.status(400).json({ error: 'Invalid order parameter' });
    }

    let viewQuery;
    if (view === 'unanswered') {
        viewQuery = 'AND m.has_answers = FALSE';
    } else if (view === 'answered') {
        viewQuery = 'AND m.has_answers = TRUE';
    } else {
        viewQuery = '';
    }

    const query = `
    SELECT m.id, u.name AS user_name, m.content, m.positive_rating, m.negative_rating, m.created_at, m.users_id, m.has_answers
    FROM messages m
    JOIN users u ON m.users_id = u.id
    JOIN users t ON m.target_id = t.id
    WHERE t.name = ? AND m.category = ? ${viewQuery}
    ORDER BY ${sortQuery} ${orderQuery}, m.id DESC
    `;

    db.query(query, [targetName, category], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

router.post('/', authenticateToken, (req, res) => {
    const { targetName, category, content } = req.body;
    const userId = req.user.id;

    if (!targetName || !category || !content) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (content.length < 10 || content.length > 300) {
        return res.status(400).json({ error: 'Message length must be between 10 and 300 characters' });
    }

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
            INSERT INTO messages (users_id, target_id, category, content, positive_rating, negative_rating, created_at, voted_users, has_answers)
            VALUES (?, ?, ?, ?, 0, 0, NOW(), '[]', FALSE)
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

router.post('/:messageId/rate', authenticateToken, (req, res) => {
    const { messageId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!['positive', 'negative'].includes(rating)) {
        return res.status(400).json({ error: 'Invalid rating type' });
    }

    const checkAuthorQuery = `
        SELECT users_id, COALESCE(voted_users, '[]') AS voted_users
        FROM messages 
        WHERE id = ?
    `;
    db.query(checkAuthorQuery, [messageId], (err, messageResults) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (messageResults.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const message = messageResults[0];

        if (message.users_id === userId) {
            return res.status(403).json({ error: 'You cannot vote for your own message' });
        }

        let votedUsers;
        try {
            votedUsers = JSON.parse(message.voted_users);
        } catch (error) {
            votedUsers = [];
        }

        if (votedUsers.includes(userId)) {
            return res.status(403).json({ error: 'You have already voted for this message' });
        }

        votedUsers.push(userId);

        const updateRatingQuery = `
            UPDATE messages 
            SET ${rating === 'positive' ? 'positive_rating = positive_rating + 1' : 'negative_rating = negative_rating + 1'},
            voted_users = ?
            WHERE id = ?
        `;

        db.query(updateRatingQuery, [JSON.stringify(votedUsers), messageId], (err, updateResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.status(200).json({ message: 'Your vote has been recorded' });
        });
    });
});

router.delete('/:messageId', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { messageId } = req.params;

    const deleteQuery = 'DELETE FROM messages WHERE id = ?';

    db.query(deleteQuery, [messageId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.status(200).json({ message: 'Message deleted successfully' });
    });
});

module.exports = router;
