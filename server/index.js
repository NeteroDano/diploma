const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./data/db');
const authRouter = require('./routers/auth');
const profilesRouter = require('./routers/profiles');
const searchRouter = require('./routers/search');
const messagesRouter = require('./routers/messages');


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршрути
app.use('/auth', authRouter);
app.use('/profiles', profilesRouter);

app.use('/search', searchRouter);
app.use('/messages', messagesRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Web Application!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
