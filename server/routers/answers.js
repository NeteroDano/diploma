const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddlewares');
const multer = require('multer');
const path = require('path');

// Налаштування multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

// Обмеження типів файлів
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Додавання відповіді
router.post('/', authenticateToken, upload.single('file'), authorizeRole(['author', 'studio']), (req, res) => {
    const { message_id, content } = req.body;
    const user_id = req.user.id;
    const file_path = req.file ? req.file.filename : null;

    const checkAnswerQuery = `SELECT * FROM answers WHERE messages_id = ? AND users_id = ?`;
    db.query(checkAnswerQuery, [message_id, user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length > 0) {
            return res.status(403).json({ error: 'You have already replied to this message' });
        }

        const query = `INSERT INTO answers (messages_id, users_id, content, file_path) VALUES (?, ?, ?, ?)`;
        db.query(query, [message_id, user_id, content, file_path], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const updateMessageQuery = `UPDATE messages SET has_answers = TRUE WHERE id = ?`;
            db.query(updateMessageQuery, [message_id], (err, updateResults) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.status(201).json({ message: 'Answer created successfully' });
            });
        });
    });
});

// Отримання відповідей для повідомлення
router.get('/messages/:messageId', authenticateToken, (req, res) => {
    const { messageId } = req.params;

    const query = `
        SELECT a.id, a.content, a.file_path, a.created_at, u.name AS user_name
        FROM answers a
        JOIN users u ON a.users_id = u.id
        WHERE a.messages_id = ?
    `;
    db.query(query, [messageId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
