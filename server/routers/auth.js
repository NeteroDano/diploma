const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const db = require('../data/db');

// Реєстрація
router.post('/register', [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
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

// // Вхід
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//         return res.status(401).send('Invalid email or password');
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//         return res.status(401).send('Invalid email or password');
//     }

//     const token = jwt.sign({ id: user._id, role: user.role }, 'secret_key', { expiresIn: '1h' });
//     res.json({ token });
// });

module.exports = router;
