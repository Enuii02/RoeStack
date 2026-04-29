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

router.get("/edit-post/:id", async (req, res) => {

  
    if (!req.session.loggedIn || !req.session.user) { res.redirect("/login"); }

    const postId = req.params.id;
    const contentManager = ContentManager.getInstance(req.session);
    
    // Load existing data
    let post = new Post();
    await post.load(postId, contentManager);

    // Security: Only allow the owner (or a mod) to see the edit screen
    if (post.user.id !== req.session.user.id && !req.session.user.isMod) {
        return res.redirect("/invalid");
    }

    const communities = await contentManager.getAllCommunities();
    
    // Render the same form used for 'create', but pass the 'post' object
    res.render("pages/create-post", { post, communities, content: await contentManager.update() });
});

router.post("/edit-post/:id", async (req, res) => {
    if (!req.session.loggedIn || !req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const postId = req.params.id;
        const { title, content, mapUrl, imageUrl, communityId, category } = req.body;
        const contentManager = ContentManager.getInstance(req.session);

        // Load the existing post first to check ownership
        let post = await new Post().load(postId, contentManager);

        Utils.log(`Editing post #${post.id}`) 

        // Security: Only author or mod can update
        if (post.user.id !== req.session.user.id && !req.session.user.isMod) {
            return res.status(403).json({ error: "You don't have permission to edit this." });
        }

        // Perform the update
        // Use a dedicated update method in your Post class (see step 2 below)
        await post.update({
            title,
            content,
            mapUrl: mapUrl === "" ? null : mapUrl,
            imageUrl: imageUrl === "" ? null : imageUrl,
            communityId,
            category
        });

        return res.json({ postId: post.id });
    } catch (err) {
        console.error("Post Update Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

/**
 * Create a route for create-post - /create-post
 */
router.get("/create-post", async function (req, res) {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to Add Post page...");
    let content = await ContentManager.getInstance(req.session).update();
    const communities = await ContentManager.getInstance(req.session).getAllCommunities();
    res.render("pages/create-post", { 
      content, 
      communities: communities,
      currentPage: "create-post" 
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/post", async (req, res) => {
    // Check if user is logged in
    if (!req.session.loggedIn || !req.session.user) {
        return res.status(401).json({ error: "Your session has expired. Please log in again." });
    }
    try {
        const { title, content, mapUrl, imageUrl, communityId, category } = req.body;
        const contentManager = ContentManager.getInstance(req.session);

        // Call the static method directly on the Class 'Post'
        // Pass a single object to match your destructuring: { title, content, ... }
        console.log(title, 
            content, 
            mapUrl, 
            imageUrl, 
            communityId, 
            category, 
            contentManager)
        const post = await Post.create({ 
            title, 
            content, 
            mapUrl: ((mapUrl === "") ? null : mapUrl), 
            imageUrl: ((imageUrl === "") ? null : imageUrl), 
            communityId, 
            category, 
            contentManager 
        });

        return res.json({ postId: post.id });
    } catch (err) {
        console.error("Post Creation Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

router.delete("/post/:id", async (req, res) => {
  try {
    const userId = req.session.uid || req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const text = await Post.delete(req.params.id, userId);

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


module.exports = router;