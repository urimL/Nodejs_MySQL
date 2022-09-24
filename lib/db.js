//mysql에 접속
var mysql = require('mysql');

var db = mysql.createConnection({
    host: 'localhost',
    user: 'nodejs',
    password: 'dbfla9771!',
    database : 'opentutorial'
  });
  db.connect();

  //외부에서 쓸 수 있도록 expert
  module.exports = db;