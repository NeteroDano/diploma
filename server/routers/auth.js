const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const db = require('../data/db');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddlewares');

// Реєстрація
router.post('/register', [
    check('name')
        .not().isEmpty().withMessage('Name is required')
        .isLength({ max: 20 }).withMessage('Name must be no more than 10 characters long')
        .matches(/^[a-zA-Z]+$/).withMessage('Name must consist of English letters only')
        .custom((value) => {
            return new Promise((resolve, reject) => {
                const query = 'SELECT * FROM users WHERE name = ?';
                db.query(query, [value], (err, results) => {
                    if (err) {
                        return reject(new Error('Database error'));
                    }
                    if (results.length > 0) {
                        return reject(new Error('Name is already registered'));
                    }
                    resolve(true);
                });
            });
        }),
    check('email')
        .isEmail().withMessage('Valid email is required')
        .custom((value) => {
            return new Promise((resolve, reject) => {
                const query = 'SELECT * FROM users WHERE email = ?';
                db.query(query, [value], (err, results) => {
                    if (err) {
                        return reject(new Error('Database error'));
                    }
                    if (results.length > 0) {
                        return reject(new Error('Email is already registered'));
                    }
                    resolve(true);
                });
            });
        }),
    check('password')
        .isLength({ min: 6, max: 14 }).withMessage('Password must be between 6 and 14 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    console.log(`Registering user: ${name}, ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [name, email, hashedPassword, 'user'], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error registering user: ' + err.message);
        }
        console.log('User registered:', results);
        res.status(201).send('User registered successfully');
    });
});

// Вхід
router.post('/login', [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6, max: 14 }).withMessage('Password must be between 6 and 14 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], async (err, results) => {
            if (err) {
                return res.status(500).send('Error logging in: ' + err.message);
            }

            if (results.length === 0) {
                return res.status(401).send('Invalid email or password');
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).send('Invalid email or password');
            }

            const token = jwt.sign({ id: user.id, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Error logging in: ' + err.message);
    }
});

router.get('/admin', authenticateToken, authorizeRole(['admin']), (req, res) => {
    res.send('This is an admin route');
});

module.exports = router;
