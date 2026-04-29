const express = require("express");
const session = require("express-session");
const Utils = require("../utils.js");
const app = express();
const router = express.Router();

const getFilteredPosts = require("../model/middleware/getFilteredPosts.js");
const { clearUserImageCache } = require("../model/middleware/getFilteredPosts.js");
const removeQueryParam = require("../model/middleware/removeQueryParam.js");
const { addQueryParam } = require("../model/middleware/removeQueryParam.js");

const User = require("../model/classes/user.js");
const Community = require("../model/classes/community.js");
const ContentManager = require("../model/classes/ContentManager.js");

/**
 * Single Community page that takes in as input an id and renders the information about the community.
 */
router.get("/community/:id", getFilteredPosts, async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    let content = await ContentManager.getInstance(req.session).update();

    // Create new empty Community
    let community = new Community();

    // Load data from database
    await community.load(req.params.id, ContentManager.getInstance(req.session));

    Utils.log("Community '" + community.name + "' loaded.");


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
 * Create a route for create-community - /create-community
 */
router.get("/create-community", async function (req, res) {
  if (req.session.loggedIn && req.session.user) {
    Utils.log("Going to Add Community page...");
    let content = await ContentManager.getInstance(req.session).update();
    res.render("pages/create-community", { 
      content, 
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


router.post("/follow", async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    const { userId, communityId } = req.body;
    // Check if the requested userId is the same as the current logged in user or if the user is mod
    if (userId == req.session.user.id || req.session.user.isMod) {
      // Send follow request, a new user object is needed as it could be that a moderator is forcefully
      // making another user follow/unfollow the community
      var user = await new User().load(userId, ContentManager.getInstance(req.session));
      var community = await new Community().load(communityId, ContentManager.getInstance(req.session));
      var result = await user.followUnfollow(community);
      res.json({ followingAmount: result });
    } else {
      res.redirect("/invalid");
    }
  }
});

// JE - Ban route: only mods can ban a community.
// When a mod clicks Ban on a community page, this route updates the community
// status to 'banned' in the database, then sends them back to that community page.
router.get("/community/ban/:id", async (req, res) => {
  if (req.session.loggedIn && req.session.user && req.session.user.isMod) {
    const db = require("../model/db.js");
    await db.query("UPDATE communities SET status = 'banned' WHERE id = ?", [req.params.id]);
    res.redirect("/community/" + req.params.id);
  } else {
    res.redirect("/login");
  }
});

// JE - Approve route: only mods can approve a community.
// When a mod clicks Approve on a banned community page, this route updates the
// community status to 'active' in the database, then sends them back to that community page.
router.get("/community/approve/:id", async (req, res) => {
  if (req.session.loggedIn && req.session.user && req.session.user.isMod) {
    const db = require("../model/db.js");
    await db.query("UPDATE communities SET status = 'active' WHERE id = ?", [req.params.id]);
    res.redirect("/community/" + req.params.id);
  } else {
    res.redirect("/login");
  }
});

module.exports = router;