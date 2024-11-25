const mysql = require('mysql2');
require('dotenv').config();

const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;
const db_database = process.env.DB_DATABASE;
const db_port = process.env.DB_PORT;

const db = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database,
    port: db_port
}).promise();

module.exports = db;