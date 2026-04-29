const express = require("express");
const session = require("express-session");
const Utils = require("../utils.js");
const app = express();
const router = express.Router();

const User = require("../model/classes/user.js");
const ContentManager = require("../model/classes/ContentManager.js");
const getFilteredPosts = require("../model/middleware/getFilteredPosts.js");
const {
  clearUserImageCache,
} = require("../model/middleware/getFilteredPosts.js");
const removeQueryParam = require("../model/middleware/removeQueryParam.js");
const { addQueryParam } = require("../model/middleware/removeQueryParam.js");

/**
 * Single User page that takes in as input an id and renders the information about the user.
 */
router.get(
  "/user/:id",
  clearUserImageCache,
  getFilteredPosts,
  async (req, res) => {
    if (req.session.loggedIn && req.session.user) {
      Utils.log("Going to User page...");

      var id = req.params.id;

      if (id === "me") {
        id = req.session.uid;
      }

      const contentManager = await ContentManager.getInstance(req.session);

      // Delete image cache in case the user uploaded a new picture
      if (contentManager.imagePathCache) {
        Utils.log("ContentManager - Deleting cache");
        contentManager.imagePathCache = {};
      }

      let content = await contentManager.update();

      // Create new empty User
      let user = new User();

      // Load data from database
      await user.load(id, ContentManager.getInstance(req.session));

      Utils.log("User '" + user.name + "' loaded.");

      // Render single user
      res.render("./pages/single-user", {
        user,
        posts: req.sortedFilteredPosts,
        currentPath: req.path,
        activeSort: req.activeSort,
        content,
        currentPage: "profile",
      });
    } else {
      res.redirect("/login");
    }
  },
);

/**
 * Create a route for all-users - /all-users
 */
router.get("/all-users", async function (req, res) {
  if (req.session.loggedIn && req.session.user) {
    if (req.session.user.isMod) {
      Utils.log("Going to Add Users page...");
      let content = await ContentManager.getInstance(req.session).update({
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
router.post("/delete-account", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).send("Not logged in");
    }

    const userId = req.session.user.id;

    const user = new User();
    await user.delete(userId);

    req.session.destroy(() => {
      res.redirect("/");
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
