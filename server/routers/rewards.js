const express = require('express');
const router = express.Router();
const db = require('../data/db');
const path = require('path');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddlewares');
const multer = require('multer');

// Налаштування multer для збереження файлів з оригінальними іменами
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../rewards/'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Створення нової винагороди
router.post('/', authenticateToken, authorizeRole(['admin']), upload.single('image'), (req, res) => {
    const { name, description, condition_type, condition_value } = req.body;
    const userId = req.user.id;
    const image = req.file ? req.file.filename : null;

    if (!name || !description || !condition_type || !condition_value) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const insertRewardQuery = `INSERT INTO rewards (name, description, condition_type, condition_value, users_id, image) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(insertRewardQuery, [name, description, condition_type, condition_value, userId, image], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(201).json({ message: 'Reward added successfully' });
    });
});

// Відображення зображень винагород
router.get('/images/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../rewards', filename);
    res.sendFile(filePath);
});

// Отримання усіх винагород
router.get('/', authenticateToken, (req, res) => {
    const getRewardsQuery = `SELECT * FROM rewards`;
    db.query(getRewardsQuery, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(200).json(results);
    });
});

// Видалення винагороди
router.delete('/:rewardId', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { rewardId } = req.params;

    const deleteUserRewardsQuery = `DELETE FROM user_rewards WHERE rewards_id = ?`;
    db.query(deleteUserRewardsQuery, [rewardId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const deleteRewardQuery = `DELETE FROM rewards WHERE id = ?`;
        db.query(deleteRewardQuery, [rewardId], (err, rewardResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (rewardResults.affectedRows === 0) {
                return res.status(404).json({ error: 'Reward not found' });
            }

            res.status(200).json({ message: 'Reward and associated user rewards deleted successfully' });
        });
    });
});

// Перевірка умов та отримання винагород
const checkAndGrantRewards = (userId) => {
    const getConditionsQuery = `
        SELECT r.id AS reward_id, r.condition_type, r.condition_value,
               (SELECT COUNT(*) FROM messages WHERE users_id = ?) AS messages_count,
               (SELECT COUNT(*) FROM answers WHERE users_id = ?) AS answers_count,
               (SELECT SUM(positive_rating) - SUM(negative_rating) FROM messages WHERE users_id = ?) AS net_votes
        FROM rewards r
        LEFT JOIN user_rewards ur ON ur.rewards_id = r.id AND ur.users_id = ?
        WHERE ur.id IS NULL
    `;

    db.query(getConditionsQuery, [userId, userId, userId, userId], (err, results) => {
        if (err) {
            console.error(err);
            return;
        }

        results.forEach(row => {
            let conditionMet = false;
            switch (row.condition_type) {
                case 'messages_count':
                    conditionMet = row.messages_count >= row.condition_value;
                    break;
                case 'answers_count':
                    conditionMet = row.answers_count >= row.condition_value;
                    break;
                case 'net_votes':
                    conditionMet = row.net_votes >= row.condition_value;
                    break;
            }

            if (conditionMet) {
                const insertUserRewardQuery = `INSERT INTO user_rewards (users_id, rewards_id, obtained, obtained_at) VALUES (?, ?, true, NOW())`;
                db.query(insertUserRewardQuery, [userId, row.reward_id], (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        });
    });
};

// Маршрут для перевірки умов та отримання винагород
router.post('/check-rewards', authenticateToken, (req, res) => {
    const userId = req.user.id;

    checkAndGrantRewards(userId);

    res.status(200).json({ message: 'Rewards checked and granted if conditions met' });
});

module.exports = router;
