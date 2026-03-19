// Import express.js
const express = require("express");
const { DateTime } = require("luxon");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('../model/db');

// Create a route for root - /
app.get("/", function(req, res) {
    res.render("index");
});


// Display a formatted list of students
app.get("/users", function(req, res) {
    var sql = 'select * from Users';
    db.query(sql).then(results => {
    	    // Send the results rows to the all-students template
    	    // The rows will be in a variable called data
        res.render('all-users', {data: results});
    });
});

// Display a formatted list of posts
app.get("/posts", function(req, res) {
    var sql = 'select * from Posts, Users where Posts.fk_user_id = Users.id';
    db.query(sql).then(results => {
    	    // Send the results rows to the all-posts pug template
        res.render('all-posts', {data: results});
    });
});

// Single user page.  Show the user name and bio
app.get("/user-single/:id", async function (req, res) {
    var stId = req.params.id;
    console.log(stId);
    // Query to get the required results from the students table.  
    // We need this to get the programme code for this student.
    var stSql = "SELECT s.name as student, ps.name as programme, \
    ps.id as pcode from Students s \
    JOIN Student_Programme sp on sp.id = s.id \
    JOIN Programmes ps on ps.id = sp.programme \
    WHERE s.id = ?";

    var stResult = await db.query(stSql, [stId]);
    console.log(stResult);
    var pCode = stResult[0]['pcode'];
    
    // Get the modules for this student using the programme code from 
    // the query above
    var modSql = "SELECT * FROM Programme_Modules pm \
    JOIN Modules m on m.code = pm.module \
    WHERE programme = ?";

    var modResult = await db.query(modSql, [pCode]);
    console.log(modResult);

    // Send directly to the browser for now as a simple concatenation of strings
    res.send(JSON.stringify(stResult) + JSON.stringify(modResult));
    });


// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});

