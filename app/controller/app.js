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
const ContentManager = require("../model/classes/contentManager.js");
const getFilteredPosts = require("../model/middleware/getFilteredPosts.js");
const removeQueryParam = require("../model/middleware/removeQueryParam.js");
const { addQueryParam } = require("../model/middleware/removeQueryParam.js");
// This snippet is used to make sure that post data is encoded and read properly
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
//  available in all Pug templates, used in the filtering of posts.

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
    let content = await new ContentManager(req.session).update();
    console.log("the link", req.originalUrl)
    res.render("pages/index", {
      content,
      currentPage: "home",
      posts: req.sortedFilteredPosts,
      activeSort: req.activeSort,
      currentPath: req.path
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
    let content = await new ContentManager(req.session).update({
      getAllCommunities: true,
    });
    res.render("pages/explore", { 
      content,
      currentPage: "explore"
      });
  } else {
    res.redirect("/login");
  }
});

/**
 * Create a route for add-post - /add-post
 */
app.get("/add-post", async function (req, res) {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to Add Post page...");
    let content = await new ContentManager(req.session).update();
    res.render("pages/add-post", { content, currentPage: "add-post" });
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
    let content = await new ContentManager(req.session).update();
    res.render("pages/profile", { content });
  } else {
    res.redirect("/login");
  }
});

/**
 * Create a route for all-users - /all-users
 */
app.get("/all-users", async function (req, res) {
  if (req.session.loggedIn && req.session.user) {
    if (req.session.user.isMod) {
      Utils.log("Going to Add Users page...");
      let content = await new ContentManager(req.session).update({
        getUserList: true,
      });
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
app.get("/user/:id", getFilteredPosts, async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to User page...");
    let content = await new ContentManager(req.session).update();

    var id = req.params.id;

    if (id === "me") {
      id = req.session.uid;
    }

    // Create new empty User
    let user = new User();

    // Load data from database
    await user.load(id);

    Utils.log("User '" + user.name + "' loaded.");

    let posts = await new ContentManager(req.session);

    
    // Fetch the JSON list of images for this specific user
    const apiResponse = await fetch("https://owres.org/roestack/user/" + user.id);
    const result = await apiResponse.json();
    var images = [];
    console.log(result)
    if (result) { if (result.success === true) images = result.data.images }

    // Render single user
    res.render("./pages/single-user", {
      user,
      posts,
      posts: req.sortedFilteredPosts,
      currentPath: req.path,
      activeSort: req.activeSort,
      content,
      currentPage: "profile",
      images: images 
    });
  } else {
    res.redirect("/login");
  }
});

/**
 * Single Post page that takes in as input an id and renders the information about the post.
 */
app.get("/post/:id", async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to Post page...");
    let content = await new ContentManager(req.session).update();

    // Create new empty Post
    let post = new Post();
    // Load data from database
    await post.load(req.params.id, req.session);

    Utils.log("Post '" + post.title + "' loaded.");

    const comments = await new ContentManager(req.session).getCommentsForPost(
      post.id,
    );

    // Render single post
    res.render("./pages/single-post", {
      post,
      content,
      comments,
      currentUser: req.session.user,
    });
  } else {
    res.redirect("/login");
  }
});

/**
 * Single Community page that takes in as input an id and renders the information about the community.
 */
app.get("/community/:id", getFilteredPosts, async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    let content = await new ContentManager(req.session).update();

    // Create new empty Community
    let community = new Community();

    // Load data from database
    await community.load(req.params.id);

    Utils.log("Community '" + community.name + "' loaded.");

    // let posts = await new ContentManager().getLatestPosts({
    //   communityID: community.id,
    // });

    // Render single community
    // res.render("./pages/single-community", { community, posts, content });
    res.render("./pages/single-community", {
      community,
      posts: req.sortedFilteredPosts,
      activeSort: req.activeSort,
      currentPath: req.path,
      content,
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/follow", async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    const { userId, communityId } = req.body;
    // Check if the requested userId is the same as the current logged in user or if the user is mod
    if (userId == req.session.user.id || req.session.user.isMod) {
      // Send follow request, a new user object is needed as it could be that a moderator is forcefully
      // making another user follow/unfollow the community
      var user = await new User().load(userId);
      var community = await new Community().load(communityId);
      var result = await user.followUnfollow(community);
      res.json({ followingAmount: result });
    } else {
      res.redirect("/invalid");
    }
  }
});

// VOTE SYSTEM ////////////////////////////////////////////////////////////////////////////////////

/**
 * Vote page used to send a vote request from the client side to the server's db
 */
app.post("/vote", async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    const { subjectId, typeId, positive } = req.body;

    // Create and populate post object
    var subject;
    switch (typeId) {
      case "0":
        subject = await new Post().load(parseInt(subjectId), req.session);
        break;
      case "1":
        subject = await new Comment().load(parseInt(subjectId), req.session);
        break;
    }
    var result;
    console.log(subject.currentUserVote, positive);
    if (positive === null || subject.currentUserVote * 2 - 1 === positive) {
      // The current vote is the same as the request, this means that the user clicked again on
      // the upvote/downvote button, leading the system to delete the vote.
      await subject.deleteCurrentUserVote();
      result = await subject.getVoteCount();
    } else {
      // The user is casting either a new vote, or is replacing the current vote with the other.
      result = await subject.vote(positive);
    }
    // Give the total vote count result in json format
    res.json({ votes: result });
  }
});

// LOGIN 

/**
 * Create a route for the login page - /login
 */
app.get("/login", async function (_, res) {
  // var user = await new User().load(1);
  // user.setUserPassword("123")
  res.render("pages/login");
});

/**
 * Create a route for the register page - /register
 */
app.get("/register", async function (_, res) {
  Utils.log("Going to Register page...");
  res.render("pages/register");
});

/**
 * Set password request page
 */
app.post("/set-password", async function (req, res) {
  Utils.log("Setting password for " + req.body.email + "...");
  params = await req.body;
  var user = new User();
  user.email = params.email;
  try {
    uId = await user.getIdFromEmail();
    if (uId) {
      await user.load(uId);
      Utils.log("User " + user.name + " identified.");
      // If a valid, existing user is found, set the password and redirect to the single-users page
      await user.setUserPassword(params.password);
      res.send("Password set successfully");
    } else {
      Utils.log("User with id #" + uId + " not identified.");
      // If no existing user is found, add a new one
      newId = await user.addUser(params.email);
      res.send(
        "Perhaps a page where a new user sets a programme would be good here",
      );
    }
  } catch (err) {
    console.error(`Error while adding password `, err.message);
  }
});

/**
 * Check submitted email and password pair request page
 */
app.post("/authenticate", async function (req, res) {
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

        res.redirect("/user/me");
      } else {
        // TODO improve the user journey here
        res.send("Invalid password");
      }
    } else {
      res.send("Invalid email");
    }
  } catch (err) {
    console.error(`Error while comparing `, err.message);
  }
});

app.post("/comments", async (req, res) => {
  try {
    const { content, postId, parentId } = req.body;
    const userId = req.session.uid || req.session.user?.id;

    if (!userId) return res.status(401).json({ error: "Not authorized" });

    const comment = await Comment.create({
      content,
      postId,
      parentId,
      userId,
      session: req.session,
    });

    // single-comment.pug renders one commentItem node
    res.render("partials/single-comment", {
      comment,
      currentUser: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/comments/:id", async (req, res) => {
  try {
    const userId = req.session.uid || req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const text = await Comment.delete(req.params.id, userId);

    res.json({ success: true, text });
  } catch (err) {
    if (err.message === "Forbidden") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (err.message === "Comment not found") {
      return res.status(404).json({ error: "Not found" });
    }

    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/comments/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { sort } = req.query; // sort

    const comments = await Comment.getByPostId(postId, req.session, sort);

    const tree = Comment.buildTree(comments);

    res.render("partials/comment-list", {
      comments: tree,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Create a route for the logout page - /logout
 */
app.get("/logout", function (req, res) {
  Utils.log("Logging out...");
  req.session.destroy();
  res.redirect("/login");
});

// MISC ///////////////////////////////////////////////////////////////////////////////////////////

/**
 * Create a route for the invalid page - /invalid
 */
app.get("/invalid", function (req, res) {
  res.render("pages/invalid");
});

/**
 * Catch all page redirection for 404s.
 */
app.use((req, res) => {
  res.status(404).redirect("/invalid");
});

// 

/**
 * Start server on port 3000
 */
app.listen(3000, function () {
  Utils.log(`Server running at http://127.0.0.1:3000/`);
});
