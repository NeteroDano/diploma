const express = require('express');
const router = express.Router();
const db = require('../data/db');
const multer = require('multer');
const path = require('path');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddlewares');

// Налаштування multer для завантаження файлів
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'verification_docs/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Маршрут для подання заявки на верифікацію
router.post('/submit', authenticateToken, upload.single('documents'), authorizeRole(['user']), (req, res) => {
    const userId = req.user.id;
    const { full_name, content, desired_role } = req.body;
    const documents = req.file ? req.file.filename : null;

    if (!full_name || !content || !desired_role || !documents) {
        return res.status(400).json({ error: 'Full name, content, desired role, and documents are required.' });
    }

    // Перевірка на існування верифікаційного запиту
    const checkQuery = 'SELECT * FROM verifications WHERE users_id = ?';
    db.query(checkQuery, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'You have already submitted a verification request.' });
        }

        // Якщо запиту немає, вставляємо новий
        const insertQuery = `
            INSERT INTO verifications (users_id, full_name, content, documents, desired_role)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertQuery, [userId, full_name, content, documents, desired_role], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(200).json({ message: 'Verification request submitted successfully' });
        });
    });
});

// Маршрут для отримання статусу заявки на верифікацію
router.get('/status', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const selectQuery = `
        SELECT full_name, content, documents, status, desired_role, created_at, verified_at, admin_message
        FROM verifications
        WHERE users_id = ?
    `;

    db.query(selectQuery, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No verification request found' });
        }
        res.status(200).json(results[0]);
    });
});

// Маршрут для адміністрування верифікаційних заявок
router.get('/admin/requests', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const selectQuery = `
        SELECT v.id, u.name AS user_name, v.full_name, v.content, v.documents, v.status, v.desired_role, v.created_at, v.verified_at
        FROM verifications v
        JOIN users u ON v.users_id = u.id
        WHERE v.status = 'pending'
    `;

    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

// Маршрут для верифікації або відмови у верифікації
router.post('/verify/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { id } = req.params;
    const { status, message = '' } = req.body;  // Додаємо значення за замовчуванням для message

    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const updateQuery = `
        UPDATE verifications
        SET status = ?, verified_at = CURRENT_DATE, admin_message = ?
        WHERE id = ?
    `;

    db.query(updateQuery, [status, message, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const selectVerificationQuery = `
            SELECT users_id, desired_role
            FROM verifications
            WHERE id = ?
        `;

        db.query(selectVerificationQuery, [id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Verification request not found' });
            }

            const { users_id, desired_role } = results[0];

            let newRole = 'user';
            if (status === 'approved') {
                newRole = desired_role;
            }

            const updateUserRoleQuery = `
                UPDATE users
                SET role = ?
                WHERE id = ?
            `;
            db.query(updateUserRoleQuery, [newRole, users_id], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.status(200).json({ message: 'Verification status updated successfully' });
            });
        });
    });
});

module.exports = router;
