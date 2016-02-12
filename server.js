var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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
    var query = req.query;
    var where = {};
    
    if (query.hasOwnProperty('completed')) {
        where.completed = query.completed === 'true';
    }
    
    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {$like: '%' + query.q + '%'};
    }
    
    //db.todo.findAll({where:{completed: (query.completed === //'true')}}).then(function(todos) {
    db.todo.findAll({where:where}).then(function(todos) {
            res.json(todos);          
    },function(e) {
        res.status(500).send();
    });        
            
});

// get one todo by id
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    
    db.todo.findById(todoId).then(function(todo) {
        if (!!todo) {
           res.json(todo.toJSON()); 
        } else {
            res.status(404).send();
        }       
    }, function(e) {
        res.status(500).send();
    });
});

app.post('/todos', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    
    db.todo.create(body).then(function(todo) {
       res.json(todo.toJSON());
    }, function(e) {
        res.status(400).json(e);
    });
});

app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    
    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function(rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: 'No todo with id(' + todoId + ') found'
            });
        } else {
            res.status(200).send();
        }
                        
    }, function() {
            res.status(500).send();
    });
});

// put - to update todo item
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body,'description', 'completed');
    var attributes = {};
    
    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    } 
    
    if (body.hasOwnProperty('description'))
    {
        attributes.description = body.description;
    }
    
    db.todo.findById(todoId).then(function(todo) {
       if(todo) {
        todo.update(attributes).then(function(todo) {
            res.json(todo.toJSON());
        }, function(e) {
            res.status(400).json(e);
        });
       } else {
           res.status(404).send();
       }           
    }, function() {
        res.status(500).send();
    });
});

app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    
    db.user.create(body).then(function(user) {
       res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });
});

//{force:true}  -- forces the database to be rebuilt
db.sequelize.sync({force: true}).then(function() {
    app.listen(PORT, function() {
        console.log('Express listening on port: ' + PORT);
    });    
});
