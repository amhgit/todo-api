var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
//var todos = [
//    {
//        id: 1,
//        description: 'visit electronic store',
//        completed: true
//
//    },
//    {
//        id: 2,
//        description: 'go to market',
//        completed: false
//    },
//    {
//        id: 3,
//        description: 'get dinner',
//        completed: true
//
//    }
//];

var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
   res.send('TODO API Root'); 
});

// get all todos
app.get('/todos',function(req, res) {
    res.json(todos);
});

// get one todo by id
app.get('/todos/:id', function(req, res) {
    var todoID = parseInt(req.params.id, 10);
    var found = false;
    
    todos.forEach(function(todo) {
        if (todo.id === todoID) {
            res.json(todo);
            found = true;
        }
    });
    if (!found) {
        res.status(404).send('todo with ID: ' + todoID + ' not found');
    }
});

app.post('/todos', function(req, res) {
    var body = req.body;
    body.id = todoNextId++;
    todos.push(body);
    console.log('description: ' + body);
    res.json(body);
})

    //res.send('Asking for todo with id of: ' + req.params.id);

app.listen(PORT, function(){
    console.log('Express listening on port: ' + PORT);
});
