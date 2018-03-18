var express = require('express');
var app = express();

var things = require('./things');

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_db');

var personSchema = mongoose.Schema({
   name: String,
   age: Number,
   nationality: String
});
var Person = mongoose.model("Person", personSchema);

app.set('view engine', 'pug');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static('public'));

app.get('/person', function(req, res){
    res.render('person');
});

app.post('/person', function (req, res) {
    var personInfo = req.body;

    if(!personInfo.name || !personInfo.age || !personInfo.nationality){
        res.render('show_message', {
            message: "Sorry, you provided worng info", type: "error"});
    } else {
        var newPerson = new Person({
            name: personInfo.name,
            age: personInfo.age,
            nationality: personInfo.nationality
        });

        newPerson.save(function(err, Person){
            if(err)
                res.render('show_message', {message: "Database error", type: "error"});
            else
                res.render('show_message', {
                    message: "New person added", type: "success", person: newPerson});
        });
    }
});

app.get('/search', function (req, res) {
    Person.find({age: 43}, "nationality",
        function(err, response){
            console.log(response);
        });
})

app.get('/update', function (req, res) {
    Person.update({age: 43}, {nationality: "American"}, function(err, response){
        console.log(response);
    });
})

app.get('/updateById', function (req, res) {
    Person.findByIdAndUpdate("5aae63585c01254248147dc4", {nationality: "Italian"},
        function(err, response){
            console.log(response.name);
        });
})

app.get('/form', function(req, res){
    res.render('form');
});

app.get('/people', function(req, res){
    Person.find(function(err, response){
        res.json(response);
    });
});

app.post('/form', function(req, res){
    console.log(req.body);
    res.send("recieved your request!");
});

app.get('/first_template', function(req, res){
    res.render('first_view', {
        user: {name: "Felix", age: "22"}
    });
});

//Simple request time logger
app.use('/logger', function(req, res, next){
    console.log("A new request received at " + Date.now());

    //This function call is very important. It tells that more processing is
    //required for the current request and is in the next middleware
    next();
});

app.get('/logger', function (req, res) {
    res.send('Request has been logged.');
})

//First middleware before response is sent
app.use('/middleware', function(req, res, next){
    console.log("Start");
    next();
});

//Route handler
app.get('/middleware', function(req, res, next){
    res.send("Middleware");
    console.log("Middleware");
    next();
});

app.use('/middleware', function(req, res){
    console.log('End');
});


app.get('/get', function (req, res) {
    res.send('Hello World!');
});

app.post('/post', function (req, res) {
    res.send('Hello Poster!');
});

app.all('/all', function (req, res) {
    res.send('This is always coming back');
})

app.get('/:id([0-9]{5})', function(req, res){
    res.send('The id you specified is ' + req.params.id);
});

app.use('/things', things);

app.use('/static', express.static('public'));

//Other routes here
app.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
});

app.listen(3000);