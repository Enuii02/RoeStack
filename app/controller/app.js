// Import express.js
const express = require("express");
const { DateTime } = require("luxon");
const Utils = require("../utils.js");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));
app.use(express.json());

// Use the Pug templating engine
app.set("view engine", "pug");
app.set("views", "./app/views");

// Get the functions in the db.js file to use
const db = require("../model/db.js");

// Get Misc Classes
const User = require("../model/classes/user.js");
const Post = require("../model/classes/post.js");
const Comment = require("../model/classes/comment.js");
const Community = require("../model/classes/community.js");
const ContentManager = require("../model/classes/ContentManager.js");
const getFilteredPosts = require("../model/middleware/getFilteredPosts.js");
const {
  clearUserImageCache,
} = require("../model/middleware/getFilteredPosts.js");
const removeQueryParam = require("../model/middleware/removeQueryParam.js");
const { addQueryParam } = require("../model/middleware/removeQueryParam.js");
// This snippet is used to make sure that post data is encoded and read properly
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the ContentManager once
const contentManager = new ContentManager();

// Set the sessions
var session = require("express-session");
app.use(
  session({
    secret: "supersecretthatwillneverbediscoveredbyanyonenotevenmateusz",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);
Utils.log("Session created.");

// REGISTERING MIDDLEWARE /////////////////////////////////////////////////////////////////////////

// This middleware is used to make the removeQueryParam function
//  Available in all Pug templates, used in the filtering of posts.

app.use((req, res, next) => {
  res.locals.removeQueryParam = removeQueryParam;
  res.locals.addQueryParam = addQueryParam;
  res.locals.req = req;
  next();
});

// MAIN CONTENT ///////////////////////////////////////////////////////////////////////////////////

/**
 * Create a route for root - /
 */
app.get("/", getFilteredPosts, async function (req, res) {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to Home page...");
    let content = await ContentManager.getInstance(req.session).update();
    res.render("pages/index", {
      content,
      currentPage: "home",
      posts: req.sortedFilteredPosts,
      activeSort: req.activeSort,
      currentPath: req.path,
    });
  } else {
    res.redirect("/login");
  }
});

/**
 * Create a route for explore - /explore
 */
app.get("/explore", async function (req, res) {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to Explore page...");
    let content = await ContentManager.getInstance(req.session).update({
      getAllCommunities: true,
    });
    res.render("pages/explore", {
      content,
      currentPage: "explore",
    });
  } else {
    res.redirect("/login");
  }
});

/**
 * Create a route for profile - /profile
 */
app.get("/profile", async function (req, res) {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to Profile page...");
    let content = await ContentManager.getInstance(req.session).update();
    res.render("pages/profile", { content });
  } else {
    res.redirect("/login");
  }
});

app.get("/search", getFilteredPosts, async function(req, res) {
   if (req.session.loggedIn && req.session.user) {
      Utils.log("Going to the search page...");
      let content = await ContentManager.getInstance(req.session).update({
      getAllCommunities: true,
    });
  
    // console.log(req.sortedFilteredPosts)

  res.render("pages/search",
    { content,
      communities: content.communityList,
      posts: req.sortedFilteredPosts,
      activeSort: req.activeSort,
      currentPath: req.path
    }
  )

  } else {
    res.redirect("/login");
  }
})

// ROUTING ////////////////////////////////////////////////////////////////////////////////////////

const commentRoutes = require("./commentController.js");
const userRoutes = require("./userController.js");
const communityRoutes = require("./communityController.js");
const loginRoutes = require("./loginController.js");
const postRoutes = require("./postController.js");
const voteRoutes = require("./voteController.js");

app.use("/", commentRoutes);
app.use("/", userRoutes);
app.use("/", communityRoutes);
app.use("/", postRoutes);
app.use("/", voteRoutes);
app.use("/", loginRoutes);

// MISC ///////////////////////////////////////////////////////////////////////////////////////////

/**
 * Create a route for the invalid page - /invalid
 */
//app.get("/invalid", function (req, res) {
//res.render("pages/invalid");
//});

/**
 * Catch all page redirection for 404s.
 */
//app.use((req, res) => {
//res.status(404).redirect("/invalid");
//});

//

/**
 * Start server on port 3000
 */

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  Utils.log(`Server running at ${PORT}`);
});
