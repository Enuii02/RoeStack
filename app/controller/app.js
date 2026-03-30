// Import express.js
const express = require("express");
const { DateTime } = require("luxon");
const Utils = require("../Utils");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Use the Pug templating engine
app.set("view engine", "pug");
app.set("views", "./app/views");

// Get the functions in the db.js file to use
const db = require("../model/Db.js");

// Get Misc Classes
const User = require("../model/classes/User.js");
const Post = require("../model/classes/Post.js");
const Community = require("../model/classes/Community.js");
const ContentManager = require("../model/classes/ContentManager.js");


// This snippet is used to make sure that post data is encoded and read properly
app.use(express.urlencoded({ extended: true }));

// Set the sessions
var session = require('express-session');
app.use(session({
  secret: 'secretkeysdfjsflyoifasdakjdbkjbdkajbsdkjabdkjakjsp3562njkn',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
Utils.log("Session created.");

// MAIN CONTENT ///////////////////////////////////////////////////////////////////////////////////


// Create a route for root - /
app.get("/", async function (req, res) {
  if (req.session.loggedIn) {
    Utils.log("Going to Home page...");
    let content = await new ContentManager().update({ getLatestPosts: true });
    res.render("pages/index", { content, currentPage: "home" });
  } else {
    res.redirect("/login");
  }
});

<<<<<<< HEAD

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
=======
// Create a route for explore - /explore
app.get("/explore", async function (req, res) {
  if (req.session.loggedIn) {
    Utils.log("Going to Explore page...");
    let content = await new ContentManager().update({ getAllCommunities: true });
    res.render("pages/explore", { content, currentPage: "explore" });
  } else {
    res.redirect("/login");
  }
});

// Create a route for add-post - /add-post
app.get("/add-post", async function (req, res) {
  if (req.session.loggedIn) {
    Utils.log("Going to Add Post page...");
    let content = await new ContentManager().update();
    res.render("pages/add-post", { content, currentPage: "add-post" });
  } else {
    res.redirect("/login");
  }
});

// Create a route for profile - /profile
app.get("/profile", async function (req, res) {
  if (req.session.loggedIn) {
    Utils.log("Going to Profile page...");
    let content = await new ContentManager().update();
    res.render("pages/profile", { content });
  } else {
    res.redirect("/login");
  }
});
>>>>>>> login-management

// Create a route for all-users - /all-users
app.get("/all-users", async function (req, res) {
  if (req.session.loggedIn) {
    if (req.session.user.isMod) {
      Utils.log("Going to Add Users page...");
      let content = await new ContentManager().update({ getUserList: true });
      res.render("pages/all-users", { content });
    } else {
      Utils.log("Cannot access Add Users page, User is not mod.");
      res.redirect("/invalid");
    }
  } else {
    res.redirect("/login");
  }
});

/**
 * Single User page that takes in as input an id and renders the information about the user.
 */
app.get("/user/:id", async (req, res) => {
  if (req.session.loggedIn) {
    Utils.log("Going to User page...");
    let content = await new ContentManager().update();

    var id = req.params.id;

    // TODO Assign user based on current login
    if (id === "me") {
      id = req.session.uid;
    }

    // Create new empty User
    let user = new User();

    let currentUser = req.session.user;

    // Load data from database
    await user.load(id);
    
    Utils.log("User '" + user.name + "' loaded.");

    let posts = await new ContentManager().getLatestPosts({userID: user.id});


    // Render single user
    res.render("./pages/single-user", {
      user,
      currentUser,
      posts,
      content,
      currentPage: "profile",
    });
<<<<<<< HEAD


=======
  } else {
    res.redirect("/login");
  }
});

/**
 * Single Post page that takes in as input an id and renders the information about the post.
 */
app.get("/post/:id", async (req, res) => {
  if (req.session.loggedIn) {
    Utils.log("Going to Post page...");
    let content = await new ContentManager().update();

    // Create new empty Post
    let post = new Post();

    // Load data from database
    await post.load(req.params.id);
    
    Utils.log("Post '" + post.title + "' loaded.");

    // Render single post
    res.render("./pages/single-post", { post, content });
  
  } else {
    res.redirect("/login");
  }
});

/**
 * Single Community page that takes in as input an id and renders the information about the community.
 */
app.get("/community/:id", async (req, res) => {
  if (req.session.loggedIn) {
    Utils.log("Going to Community page...");
    let content = await new ContentManager().update();

    // Create new empty Community
    let community = new Community();

    // Load data from database
    await community.load(req.params.id);
    
    Utils.log("Community '" + community.name + "' loaded.");

    let posts = await new ContentManager().getLatestPosts({communityID: community.id});

    // Render single community
    res.render("./pages/single-community", { community, posts, content });
    
  } else {
    res.redirect("/login");
  }
});


// LOGIN //////////////////////////////////////////////////////////////////////////////////////////


// Create a route for the login page - /login
app.get("/login", async function (_, res) {
  Utils.log("Going to Login page...");
  res.render("pages/login");
});

// Create a route for the register page - /register
app.get("/register", async function (_, res) {
  Utils.log("Going to Register page...");
  res.render("pages/register");
});

// Set password 
app.post('/set-password', async function (req, res) {
  Utils.log("Setting password for " + req.body.email  + "...");
  params = await req.body;
  var user = new User();
  user.email = params.email;
  try {
    uId = await user.getIdFromEmail();
    if (uId) {
      await user.load(uId);
      Utils.log("User " + user.name + " identified.");
      // If a valid, existing user is found, set the password and redirect to the users single-student page
      await user.setUserPassword(params.password);
      res.send('Password set successfully');
    }
    else {
      Utils.log("User with id #" + uId + " not identified.");
      // If no existing user is found, add a new one
      newId = await user.addUser(params.email);
      res.send('Perhaps a page where a new user sets a programme would be good here');
    }
  } catch (err) {
    console.error(`Error while adding password `, err.message);
  }
});

// Check submitted email and password pair
app.post('/authenticate', async function (req, res) {
  Utils.log("Authenticating password...");
  const params = req.body;
  var user = new User();
  user.email = params.email;
  try {
    uId = await user.getIdFromEmail();
    if (uId) {
      await user.load(uId);
      match = await user.authenticate(params.password);
      if (match) {
        req.session.uid = uId;
        req.session.user = user;
        req.session.loggedIn = true;

        res.redirect('/user/me');

      }
      else {
        // TODO improve the user journey here
        res.send('Invalid password');
      }
    }
    else {
      res.send('Invalid email');
    }
  } catch (err) {
    console.error(`Error while comparing `, err.message);
  }
});

// Logout
app.get('/logout', function (req, res) {
  Utils.log("Logging out...");
  req.session.destroy();
  res.redirect("/login");
});


// MISC ///////////////////////////////////////////////////////////////////////////////////////////

// Invalid page
app.get('/invalid', function (req, res) {
  Utils.log("Going to Invalid page...");
  res.render("pages/invalid");
});

// Catch all 404s
app.use((req, res) => {
  res.status(404).redirect("/invalid");
});

>>>>>>> login-management
// Start server on port 3000
app.listen(3000, function () {
  Utils.log(`Server running at http://127.0.0.1:3000/`);
});
