const mysql2 = require("mysql2");

// create database connection
const dbConnection = mysql2.createPool({
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    host: "localhost",
    connectionLimit: 12,
});

module.exports = dbConnection.promise();