const express = require('express');
const router = express.Router();

// Маршрут для отримання списку користувачів
router.get('/', (req, res) => {
    res.send('List of users');
});

// Маршрут для створення нового користувача
router.post('/', (req, res) => {
    const newUser = req.body;
    // Логіка для збереження нового користувача
    res.send(`User ${newUser.name} created!`);
});

module.exports = router;
