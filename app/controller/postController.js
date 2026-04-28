const express = require("express");
const session = require("express-session");
const Utils = require("../utils.js");
const app = express();
const router = express.Router();

const Post = require("../model/classes/post.js");
const ContentManager = require("../model/classes/ContentManager.js");

/**
 * Single Post page that takes in as input an id and renders the information about the post.
 */
router.get("/post/:id", async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to Post page...");
    let content = await ContentManager.getInstance(req.session).update();

    // Create new empty Post
    let post = new Post();
    // Load data from database
    await post.load(req.params.id, ContentManager.getInstance(req.session));

    Utils.log("Post '" + post.title + "' loaded.");

    const comments = await ContentManager.getInstance(req.session).getCommentsForPost(
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
 * Create a route for add-post - /add-post
 */
router.get("/add-post", async function (req, res) {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to Add Post page...");
    let content = await ContentManager.getInstance(req.session).update();
    res.render("pages/add-post", { 
      content, 
      currentPage: "add-post" 
    });
  } else {
    res.redirect("/login");
  }
});

module.exports = router;