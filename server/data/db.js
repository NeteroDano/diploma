const mysql = require('mysql2');

// const connection = mysql.createConnection({
//     host: 'localhost',
//     port: '3306',
//     user: 'city',
//     password: '02110211W-',
//     database: 'diploma'
// });

// const connection = mysql.createConnection({
//     host: 'eu-cluster-west-01.k8s.cleardb.net',
//     user: 'b58fcd7b104721',
//     password: '4d81e108',
//     database: 'heroku_0079a0c4500b5ab'
// });

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

//module.exports = connection;

connection.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    console.log(results);
    connection.end((err) => {
        if (err) {
            console.error('Error closing connection:', err);
        } else {
            console.log('Connection closed');
        }
    });
});

