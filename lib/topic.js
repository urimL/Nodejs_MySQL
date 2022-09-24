var db = require('./db');
var template = require('./template')
exports.home = function(request, response) {
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
}
