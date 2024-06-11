const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// const connection = mysql.createConnection({
//     host: 'eu-cluster-west-01.k8s.cleardb.net',
//     user: 'b58fcd7b104721',
//     password: '4d81e108',
//     database: 'heroku_0079a0c4500b5ab'
// });

// const connection = mysql.createConnection({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE
// });

// const pool = mysql.createPool({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//     waitForConnections: true,
//     connectionLimit: 20,
//     queueLimit: 0
// });

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

module.exports = connection;

// module.exports = pool.promise();
