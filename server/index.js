const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Імпорт маршрутів
const authRouter = require('./routers/auth');
app.use('/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Web Application!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

