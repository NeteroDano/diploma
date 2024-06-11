const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./data/db');
const authRouter = require('./routers/auth');
const profilesRouter = require('./routers/profiles');
const searchRouter = require('./routers/search');
const messagesRouter = require('./routers/messages');
const verificationRouter = require('./routers/verification');
const appealsRouter = require('./routers/appeals');
const answersRouter = require('./routers/answers');
const rewardsRouter = require('./routers/rewards');
require('dotenv').config();



const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/verification_docs', express.static(path.join(__dirname, 'verification_docs')));
app.use('/rewards', express.static(path.join(__dirname, 'rewards')));

// Маршрути
app.use('/auth', authRouter);
app.use('/profiles', profilesRouter);
app.use('/search', searchRouter);
app.use('/messages', messagesRouter);
app.use('/verification', verificationRouter);
app.use('/appeals', appealsRouter);
app.use('/answers', answersRouter);
app.use('/rewards', rewardsRouter);


app.get('/', (req, res) => {
    res.send('Welcome to the Web Application!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
