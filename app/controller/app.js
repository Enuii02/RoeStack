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
const ContentManager = require("../model/classes/ContentManager.js");

// Create a route for root - /
app.get("/", async function (_, res) {
  let content = await new ContentManager().update({ getLatestPosts: true });
  res.render("pages/index", { content, currentPage: "home" });
});

// Create a route for explore - /explore
app.get("/explore", async function (_req, res) {
  let content = await new ContentManager().update({ getAllCommunities: true });
  res.render("pages/explore", { content, currentPage: "explore" });
});

// Create a route for add-post - /add-post
app.get("/add-post", async function (_, res) {
  let content = await new ContentManager().update();
  res.render("pages/add-post", { content, currentPage: "add-post" });
});

// Create a route for profile - /profile
app.get("/profile", async function (_, res) {
  let content = await new ContentManager().update();
  res.render("pages/profile", { content });
});

// Create a route for all-users - /all-users
app.get("/all-users", async function (_, res) {
  let content = await new ContentManager().update({ getUserList: true });
  console.log(content);
  res.render("pages/all-users", { content });
});

/**
 * Single User page that takes in as input an id and renders the information about the user.
 */
app.get("/user/:id", async (req, res) => {
  let content = await new ContentManager().update();

  var id = req.params.id;

  // TODO Assign user based on current login
  if (id === "me") {
    id = 1;
  }

  // Create new empty User
  let user = new User();

  // Load data from database
  await user.load(id);

  let posts = await new ContentManager().getLatestPosts({userID: user.id});

  // Render single user
  res.render("./pages/single-user", {
    user,
    posts,
    content,
    currentPage: "profile",
  });
});

/**
 * Single Post page that takes in as input an id and renders the information about the post.
 */
app.get("/post/:id", async (req, res) => {
  let content = await new ContentManager().update();

  // Create new empty Post
  let post = new Post();

  // Load data from database
  await post.load(req.params.id);

  // Render single post
  res.render("./pages/single-post", { post, content });
});

/**
 * Single Community page that takes in as input an id and renders the information about the community.
 */
app.get("/community/:id", async (req, res) => {
  let content = await new ContentManager().update();

  // Create new empty Community
  let community = new Community();

  // Load data from database
  await community.load(req.params.id);

  let posts = await new ContentManager().getLatestPosts({communityID: community.id});

  // Render single community
  res.render("./pages/single-community", { community, posts, content });
});

// Start server on port 3000
app.listen(3000, function () {
  console.log(`Server running at http://127.0.0.1:3000/`);
});
