var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
   'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1,250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

// adding {force: true} to sync - it will recreate tables
sequelize.sync({
    //force: true
}).then(function() {
    console.log('Everything is synced'); 
//    Todo.findAll({
//        where: {id:2}
//    }).then(function(todos) {
//        if(todos) {
//            todos.forEach(function(todo) {
//               console.log(todo.toJSON());
//            });
//        } else {
//            console.log('No todos found');              
//        }
//    });
//    
    //another way
    Todo.findById(3).then(function(todo) {
        if (todo) {
            console.log(todo.toJSON());
        }else {
            console.log('No todos found');              
        }
    });
   
//    Todo.create({
//        description: 'Take out trash'
//    }).then(function(todo) {
//        return Todo.create({
//            description: "Clean office"
//        });
//    }).then(function() {
//        //return Todo.findById(1)
//        return Todo.findAll({
//            // where: {description: {$like: '%trash%}}
//            where: {
//                completed: false
//            }
//        })
//    }).then(function(todos) {
//        if (todos) {
//            todos.forEach(function(todo){
//                console.log(todo.toJSON());
//            });
//        } else {
//            console.log("no todo found");
//        }
//    }).catch(function(e) {
//       console.log(e); 
//    });
    
});
