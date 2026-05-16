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
const ContentManager = require("../model/classes/contentManager.js");

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

router.get("/edit-community/:id", async (req, res) => {
    if (!req.session.loggedIn) return res.redirect("/login");

    const contentManager = ContentManager.getInstance(req.session);
    let community = await new Community().load(req.params.id, contentManager);

    // Security: Only creator or mod
    if (community.createdBy.id !== req.session.user.id && !req.session.user.isMod) {
        return res.redirect("/invalid");
    }

    res.render("pages/create-community", { 
        community, 
        content: await contentManager.update() 
    });
});

router.post("/edit-community/:id", async (req, res) => {
    try {
        const { name, description } = req.body;
        const contentManager = ContentManager.getInstance(req.session);
        let community = await new Community().load(req.params.id, contentManager);

        if (community.createdBy.id !== req.session.user.id && !req.session.user.isMod) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await community.update({ name, description });
        res.json({ success: true, communityId: community.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/community", async (req, res) => {
    if (!req.session.loggedIn) return res.status(401).json({ error: "Login required" });

    try {
        const { name, description } = req.body;
        const newId = await Community.create({ 
            name, 
            description, 
            userId: req.session.user.id,
            contentManager: ContentManager.getInstance(req.session)
        });
        res.json({ communityId: newId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/community/:id", async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const isMod = req.session.user?.isMod;

        await Community.delete(req.params.id, userId, isMod);
        res.json({ success: true });
    } catch (err) {
        res.status(err.message === "Forbidden or Community not found" ? 403 : 500).json({ error: err.message });
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