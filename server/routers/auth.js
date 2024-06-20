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
        .isLength({ max: 20 }).withMessage('Name must be no more than 20 characters long')
        .matches(/^[A-Za-z]+$/).withMessage('Name must consist of English letters only')
        .custom(value => {
            return new Promise((resolve, reject) => {
                const query = 'SELECT id FROM users WHERE name = ?';
                db.execute(query, [value], (err, results) => {
                    if (err) {
                        reject(new Error('Database error'));
                    }
                    if (results.length > 0) {
                        reject(new Error('Name is already registered'));
                    }
                    resolve(true);
                });
            });
        }),
    check('email')
        .isEmail().withMessage('Valid email is required')
        .custom(value => {
            return new Promise((resolve, reject) => {
                const query = 'SELECT id FROM users WHERE email = ?';
                db.execute(query, [value], (err, results) => {
                    if (err) {
                        reject(new Error('Database error'));
                    }
                    if (results.length > 0) {
                        reject(new Error('Email is already registered'));
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
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.execute(query, [name, email, hashedPassword, 'user'], (err, results) => {
        if (err) {
            return res.status(500).send('Error registering user: ' + err.message);
        }
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
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.execute(query, [email], async (err, results) => {
            if (err) {
                console.log('Database error:', err.message);
                return res.status(500).send('Error logging in: ' + err.message);
            }

            if (results.length === 0) {
                console.log('User not found');
                return res.status(401).send('Invalid email or password');
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.log('Password does not match');
                return res.status(401).send('Invalid email or password');
            }

            const token = jwt.sign({ id: user.id, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
            res.json({ token });
        });
    } catch (err) {
        console.log('Error during login:', err.message);
        res.status(500).send('Error logging in: ' + err.message);
    }
});

router.get('/admin', authenticateToken, authorizeRole(['admin']), (req, res) => {
    res.send('This is an admin route');
});

module.exports = router;
