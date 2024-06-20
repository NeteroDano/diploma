const express = require('express');
const router = express.Router();
const db = require('../data/db');
const multer = require('multer');
const path = require('path');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddlewares');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const appealPath = path.join(__dirname, '../verification_docs/');
        console.log('Uploading file to:', appealPath);
        cb(null, appealPath); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = uniqueSuffix + '-' + file.originalname;
        console.log('Saving file as:', fileName);
        cb(null, fileName);
    }
});

const appealFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed.'));
    }
};

const appealUpload = multer({ 
    storage: storage,
    fileFilter: appealFileFilter,
});

router.post('/submit', authenticateToken, appealUpload.array('documents', 10), (req, res) => {
    const userId = req.user.id;
    const { content } = req.body;
    const documents = req.files.map(file => file.filename);

    if (!content || documents.length === 0) {
        return res.status(400).json({ error: 'Content and documents are required for an appeal.' });
    }

    if (content.length < 10 || content.length > 200) {
        return res.status(400).json({ error: 'Content must be between 10 and 200 characters.' });
    }

    const checkQuery = 'SELECT id, verified_at, status FROM verifications WHERE users_id = ? ORDER BY verified_at DESC LIMIT 1';
    db.query(checkQuery, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'No verification request found for this user.' });
        }

        const verification = results[0];
        const verifications_id = verification.id;

        if (verification.status === 'pending') {
            return res.status(400).json({ error: 'Cannot submit an appeal while verification request is pending.' });
        }

        if (verification.status !== 'rejected') {
            return res.status(400).json({ error: 'An appeal can only be submitted after a rejection.' });
        }

        const now = new Date();
        const verifiedAt = new Date(verification.verified_at);

        if (now - verifiedAt < 24 * 60 * 60 * 1000 /*1 * 60 * 1000*/) {
            return res.status(400).json({ error: 'You can submit an appeal only after 24 hours of verification.' });
        }

        const insertQuery = `
            INSERT INTO appeals (users_id, verifications_id, appeal_content, appeal_at, appeal_documents, appeal_status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        `;
        db.query(insertQuery, [userId, verifications_id, content, now, documents.join(',')], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(200).json({ message: 'Appeal submitted successfully' });
        });
    });
});

router.get('/status/latest', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const selectQuery = `
        SELECT * 
        FROM appeals
        WHERE users_id = ?
        ORDER BY appeal_at DESC
        LIMIT 1
    `;

    db.query(selectQuery, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No appeal found for this user.' });
        }
        res.status(200).json(results[0]);
    });
});

router.get('/admin/requests', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const selectQuery = `
        SELECT a.id, a.appeal_content, a.appeal_at, a.appeal_status, a.appeal_admin_message, a.appeal_documents,
               v.full_name AS user_name, v.content AS verification_content, v.documents AS verification_documents, 
               v.status AS verification_status, v.desired_role, v.created_at, v.verified_at
        FROM appeals a
        JOIN verifications v ON a.verifications_id = v.id
        JOIN users u ON a.users_id = u.id
        WHERE a.appeal_status = 'pending'
    `;

    db.query(selectQuery, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(results);
    });
});

router.post('/verify/:id', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { id } = req.params;
    const { status, message = '' } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const updateQuery = `
        UPDATE appeals
        SET appeal_status = ?, appeal_response_at = CURRENT_DATE, appeal_admin_message = ?
        WHERE id = ?
    `;

    db.query(updateQuery, [status, message, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (status === 'approved') {
            const selectVerificationQuery = `
                SELECT v.users_id, v.desired_role
                FROM verifications v
                JOIN appeals a ON v.id = a.verifications_id
                WHERE a.id = ?
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

                const updateUserRoleQuery = `
                    UPDATE users
                    SET role = ?
                    WHERE id = ?
                `;
                db.query(updateUserRoleQuery, [desired_role, users_id], (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    res.status(200).json({ message: 'Appeal approved and user role updated successfully' });
                });
            });
        } else {
            res.status(200).json({ message: 'Appeal status updated successfully' });
        }
    });
});

module.exports = router;
