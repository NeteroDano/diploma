const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddlewares');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const answerPath = path.join(__dirname, '../uploads/');
        console.log('Uploading file to:', answerPath);
        cb(null, answerPath); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = uniqueSuffix + '-' + file.originalname;
        console.log('Saving file as:', fileName);
        cb(null, fileName);
    }
});

const answerFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

const answerUpload = multer({ 
    storage: storage,
    fileFilter: answerFileFilter,
});

router.post('/', authenticateToken, answerUpload.single('file'), authorizeRole(['author', 'studio']), (req, res) => {
    const { message_id, content } = req.body;
    const user_id = req.user.id;
    const file_path = req.file ? req.file.filename : null;

    if (!content || content.length < 10 || content.length > 300) {
        return res.status(400).json({ error: 'Content must be between 10 and 300 characters and not be empty.' });
    }

    const checkAnswerQuery = `SELECT * FROM answers WHERE messages_id = ? AND users_id = ?`;
    db.query(checkAnswerQuery, [message_id, user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length > 0) {
            return res.status(403).json({ error: 'You have already replied to this message' });
        }

        const checkMessageQuery = `SELECT target_id FROM messages WHERE id = ?`;
        db.query(checkMessageQuery, [message_id], (err, messageResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (messageResults.length === 0) {
                return res.status(404).json({ error: 'Message not found' });
            }

            const targetId = messageResults[0].target_id;

            if (targetId !== user_id) {
                return res.status(403).json({ error: 'You are not authorized to reply to this message' });
            }

            const insertAnswerQuery = `INSERT INTO answers (messages_id, users_id, content, file_path) VALUES (?, ?, ?, ?)`;
            db.query(insertAnswerQuery, [message_id, user_id, content, file_path], (err, results) => {
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
});

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
