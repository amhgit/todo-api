var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];


var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
   res.send('TODO API Root'); 
});

// get all todos
app.get('/todos',middleware.requireAuthentication, function(req, res) {
    var query = req.query;
    var where = {
        userId: req.user.get('id')
    };
    
    if (query.hasOwnProperty('completed')) {
        where.completed = query.completed === 'true';
    }
    
    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {$like: '%' + query.q + '%'};
    }
    
    //db.todo.findAll({where:{completed: (query.completed === //'true')}}).then(function(todos) {
    
    console.log('UserID: ' + req.user.id)
    //where.userId = req.user.id;
    
    db.todo.findAll({where:where}).then(function(todos) {
            res.json(todos);          
    },function(e) {
        res.status(500).send();
    });        
            
});

// get one todo by id
app.get('/todos/:id',middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    
    db.todo.findById(todoId,{where:{id: todoId,userId: req.user.get('id')}}).then(function(todo) {
        if (!!todo) {
           res.json(todo.toJSON()); 
        } else {
            res.status(404).send();
        }       
    }, function(e) {
        res.status(500).send();
    });
});

app.post('/todos', middleware.requireAuthentication,function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    
    db.todo.create(body).then(function(todo) {
       //res.json(todo.toJSON());
        req.user.addTodo(todo).then(function() {
            return todo.reload();
        }).then(function(todo) {
            res.json(todo.toJSON());
        });
    }, function(e) {
        res.status(400).json(e);
    });
});

app.delete('/todos/:id', middleware.requireAuthentication,function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    
    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
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
app.put('/todos/:id', middleware.requireAuthentication,function(req, res) {
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
    
    //db.todo.findById(todoId).then(function(todo) {
    //db.todo.findById(todoId,{where:{userId: //req.user.get('id')}}).then(function(todo) {
    db.todo.findOne({where:{userId: req.user.get('id'), id: todoId}}).then(function(todo) {
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

app.post('/users',function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    
    db.user.create(body).then(function(user) {
       res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });
});

app.post('/users/login', function(req,res) {
    //[pick email pswd]
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');
        userInstance = user;
        
        return db.token.create({
            token: token
        });
    }).then(function(tokenInstance) { //token create finish
        console.log('**Authentication completed');
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());

    }).catch(function() {
        console.log('**db.user.authenticate error')
        res.status(401).send();
    });                   
});

app.delete('/users/login',middleware.requireAuthentication, function(req, res) {
    req.token.destroy().then(function() {
        res.status(204).send();
    }).catch(function(){
        res.status(500).send();
    });
});
//{force:true}  -- forces the database to be rebuilt
//db.sequelize.sync().then(function() {
db.sequelize.sync({force:true}).then(function() {
    app.listen(PORT, function() {
        console.log('Express listening on port: ' + PORT);
    });    
});
