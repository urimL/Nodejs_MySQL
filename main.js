var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');

//mysql에 접속
var db = mysql.createConnection({
  host: 'localhost',
  user: 'nodejs',
  password: 'dbfla9771!',
  database : 'opentutorial'
});
db.connect();

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        /*fs.readdir('./data', function(error, topics){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });*/
        
        //mysql의 데이터를 main.js로 load해오는 방법
        db.query(`SELECT * FROM topic`,function(error,topics) {
          console.log(topics);
          var title = 'Welcome';
          var description = 'Hello, NodeJs';
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
        //배열의 객체로 여러가지 propery 값이 세팅되어 출력

      } 
      
      //상세보기
      else {
        /*
        fs.readdir('./data', function(error, topics){
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(topics);
            var html = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });
        */


        //글 목록 가져오기
        db.query(`SELECT * FROM topic`, function(error,topics){
          if(error){
            throw error;
          }
          db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,[queryData.id], function(error2, topic){
            if(error2){
              throw error2;
            }
           var title = topic[0].title;
           var description = topic[0].description;
           var list = template.list(topics);
           var html = template.HTML(title, list,
             `<h2>${title}</h2>
             ${description}
             <p>by ${topic[0].name}</p>`,
             ` <a href="/create">create</a>
                 <a href="/update?id=${queryData.id}">update</a>
                 <form action="delete_process" method="post">
                   <input type="hidden" name="id" value="${queryData.id}">
                   <input type="submit" value="delete">
                 </form>`
           );
            response.writeHead(200);
            response.end(html);
          })
        });
      }
    } else if(pathname === '/create'){
        db.query(`SELECT * FROM topic`,function(error,topics) {
        console.log(topics);
        var title = 'Create';
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `<form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      
      request.on('end', function(){
          var post = qs.parse(body);
          /*fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })*/
          db.query(`
            insert into topic(title, description, created, author_id) 
            values (?,?,NOW(),?)`,
            [post.title,post.description,1],
            function(error,result) {
              if(error) {
                throw error;
              }
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
              response.end();
            }
          )
      });
    } else if(pathname === '/update'){
      db.query(`SELECT * FROM topic`,function(error, topics){      
        //fs.readdir('./data', function(error, filelist){
          if(error) {
            throw error;
          }
        db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
          if(error2){
            throw error2;
          }
        //fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var list = template.list(topics);
          var html = template.HTML(topic[0].title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
              <p>
                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          /*
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
            })
          });
          */
         db.query(`UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?`,[post.title,post.description,post.id], function(error, result){
          response.writeHead(302, {Location: `/?id=${post.id}`});
          response.end();
         })
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          /*
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
          */
         db.query(`DELETE FROM topic WHERE id=?`,[post.id], function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/`});
            response.end();
         })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
