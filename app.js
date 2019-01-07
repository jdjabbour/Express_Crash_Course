// These are the required modules
/// Express and Body Parser are installed via the package.json file
/// Once added you run npm install in the CLI to install them
/// The "*" tells the system to install the latest package
/// The Path module does not need to be installed since it is part of the standard library
//// This is a course from: https://www.youtube.com/watch?v=gnsO8-xJ8rs&t=4021s

var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var path = require('path');
var mongojs = require('mongojs');

var db = mongojs('customerapp', ['users'])
var ObjectId = mongojs.ObjectId;

// This starts the express web app
var app = express();

//// Middleware
//// Middleware has to be before the handler
var logger = function(req, res, next){
    console.log('Logging....');
    next();
}

//// The use function starts the middleware by calling it
app.use(logger);

// Sets up the View Engine Middleware using ejs module
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sets up the Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


// Set Static Path
/// Static is the same as a static folder in Flask
app.use(express.static(path.join(__dirname, 'public')));

/*
var people = [
    {
        name: "Jason",
        age: 30
    },
    {
        name: "Jen",
        age: 29
    },
    {
        name: "George",
        age: 60
    }
]
*/

//Global Vars
/// Any other global variables you want you can add here
/// Just use res.locals.*******
app.use(function(req, res, next){
    res.locals.errors = null;
    next();
});

// Express Validator Middelware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root   = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg: msg,
            value: value
        };
    }
}))

/*
var users = [
    {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "jdoe@gmail.com"
    },
    {
        id: 2,
        first_name: "Jim",
        last_name: "Doe",
        email: "jdoe@gmail.com"
    },
    {
        id: 3,
        first_name: "Jack",
        last_name: "Doe",
        email: "jdoe@gmail.com"
    }
]
*/

/// Sets up the handler for the index page
app.get('/', function(req, res){
    db.users.find(function(err, docs){
        console.log(docs);
        res.render('index', {
            title: 'Customers',
            users: docs
        });
    })
    //res.send('Hello World'); // Send is like console.log only ooutputs to web browser
    //res.json(people); // Outputs the Json information to the browser

    // Ouputs the file from the EJS middleware. In this case the index file
});

app.post('/users/add', function(req, res){

    req.checkBody('first_name', 'Fist Name is Required').notEmpty();
    req.checkBody('last_name', 'Last Name is Required').notEmpty();
    req.checkBody('email', 'Email is Required').notEmpty();

    var errors = req.validationErrors();

    if(errors){
        res.render('index', {
            title: 'Customers',
            users: users,
            errors: errors
        });
    }else{
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        }
        db.users.insert(newUser, function(err, result){
            if(err){
                console.log(err);
            }
            res.redirect('/');
        });
    //console.log('Form submitted');
    //console.log(req.body.first_name);


    }
    console.log(newUser);
});

app.delete('/users/delete/:id', function(req, res){
    //console.log(req.params.id);
    db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
        if(err){
            console.log(err);
        }
        res.redirect('/');
    });
});

/// This tells the system which port and uses the function to output a string
app.listen(3000, function(){
    console.log('Server started on port 3000....')
});