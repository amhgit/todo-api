var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];


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
    var matchedTodo = _.findWhere(todos,{id: todoId});
    
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.post('/todos', function(req, res) {
    //var body = req.body;
    var body = _.pick(req.body,'description', 'completed')
    
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }
    body.id = todoNextId++;
    body.description = body.description.trim();
    todos.push(body);
    //console.log('description: ' + body);
    res.json(body);
})

app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos,{id: todoId});
    if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    } else {
        res.status(404).json({"error": "no todo found with that Id"});
    }
});
    //res.send('Asking for todo with id of: ' + req.params.id);

app.listen(PORT, function() {
    console.log('Express listening on port: ' + PORT);
});
