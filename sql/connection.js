var mysql = require("mysql2");

require("dotenv").config();

var hostname = process.env.DB_HOST;
var username = process.env.DB_USER;
var password = process.env.DB_PASS;
var database = process.env.DB_NAME;
var port     = process.env.DB_PORT; 

var con = mysql.createConnection({
  host: hostname,
  user: username,
  password,
  database,
  port,
});


module.exports = con;