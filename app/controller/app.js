// Import express.js
const express = require("express");
const { DateTime } = require("luxon");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Use the Pug templating engine
app.set("view engine", "pug");
app.set("views", "./app/views");

// Get the functions in the db.js file to use
const db = require("../model/db");

// Get Misc Classes
const User = require("../model/classes/User.js");
const Post = require("../model/classes/Post.js");
const Community = require("../model/classes/Community.js");
const ContentMgr = require("../model/classes/ContentMgr.js");



// Create a route for root - /
app.get("/", async function (req, res) {
    var posts = await new ContentMgr().getLatestPosts();
    res.render("index", { posts });
});

// Create a route for explore - /explore
app.get("/explore", function(req, res) {
    res.render("pages/explore");
});

// Create a route for add-post - /add-post
app.get("/add-post", function(req, res) {
    res.render("pages/add-post");
});

// Create a route for profile - /profile
app.get("/profile", function(req, res) {
    res.render("pages/profile");
});


/**
 * Single User page that takes in as input an id and renders the information about the user.
 */
app.get("/user/:id", async (req, res) => {

    // Create new empty User
    let user = new User();

    // Load data from database
    await user.load(req.params.id);

    // Render single user
    res.render("single-user", { user });

});

/**
 * Single Post page that takes in as input an id and renders the information about the post.
 */
app.get("/post/:id", async (req, res) => {

    // Create new empty Post
    let post = new Post();

    // Load data from database
    await post.load(req.params.id);

    // Render single post
    res.render("single-post", { post });

});

/**
 * Single Community page that takes in as input an id and renders the information about the community.
 */
app.get("/community/:id", async (req, res) => {

    // Create new empty Community
    let community = new Community();

    // Load data from database
    await community.load(req.params.id);

    // Render single community
    res.render("single-community", { community });

});

// Start server on port 3000
app.listen(3000, function () {
    console.log(`Server running at http://127.0.0.1:3000/`);
});
