var mysql = require('mysql');

var connection = mysql.createConnection({
    host : 'localhost',
    user : 'nodejs',
    password : '1111',
    database : 'opentutorial'
});

connection.connect(); 
//connection 객체한테 connection() 메소드 호출하면 접속 될것이라고 알려주는 코드

//첫번째 인자의 sql문이 서버에게 전송되어 실행이 끝나면, 두번째 인자인 콜백 호출
connection.query('SELECT * FROM topic', function(error,results, fields) {
    if(error) {
        console.log(error);
    }
    console.log(results);
});
//topic에 저장되어있는 데이터가 객체 형태로 반환

connection.end();