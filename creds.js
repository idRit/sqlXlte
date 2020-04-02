const mysql = require("mysql");

const pool = mysql.createPool({
    connectionLimit: 10, // default = 10
    host: '172.17.0.2',
    user: 'root',
    password: 'root',
    database: 'products'
});

module.exports = {
    pool
}