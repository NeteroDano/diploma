const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticateToken } = require('../middlewares/authMiddlewares');

router.get('/', authenticateToken, (req, res) => {
    const { role, query } = req.query;

    if (!role || !query) {
        return res.status(400).json({ error: 'Role and query parameters are required.' });
    }

    const searchQuery = 'SELECT id, name, role FROM users WHERE role = ? AND name LIKE ?';
    db.query(searchQuery, [role, `%${query}%`], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
