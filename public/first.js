var mysql      = require('mysql');
var con = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',   
  password : 'root', 
  port: 3308, 
  database : 'Emp_DB'
});
con.connect();
console.log("Connected!");
