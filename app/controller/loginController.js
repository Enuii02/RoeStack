const express = require("express");
const session = require("express-session");
const Utils = require("../utils.js");
const app = express();
const router = express.Router();

const User = require("../model/classes/user.js");
const ContentManager = require("../model/classes/contentManager.js");
const Community = require("../model/classes/community.js");

/**
 * Create a route for the login page - /login
 */
router.get("/login", async function (req, res) {
  // JE - Pass any error query param to the login page so it can show the appropriate error state.
  res.render("pages/login", { error: req.query.error });
});

/**
 * Create a route for the register page - /register
 */
router.get("/register", async function (_, res) {
  Utils.log("Going to Register page...");

  const communities = await Community.getAll();

  res.render("pages/register", { communities });
});

router.post("/register", async (req, res) => {
  try {
    const user = new User();

    await user.register(req.body);

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Registration failed");
    res.status(400).json({ error: "Email already exists" });
  }
});

/**
 * Set password request page
 */
router.post("/set-password", async function (req, res) {
  Utils.log("Setting password for " + req.body.email + "...");
  params = await req.body;
  var user = new User();
  user.email = params.email;
  try {
    uId = await user.getIdFromEmail();
    if (uId) {
      await user.load(uId, ContentManager.getInstance(req.session));
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
router.post("/authenticate", async function (req, res) {
  Utils.log("Authenticating password...");
  const params = req.body;
  var user = new User();
  user.email = params.email;
  try {
    uId = await user.getIdFromEmail();
    if (uId) {
      await user.load(uId, ContentManager.getInstance(req.session));
      match = await user.authenticate(params.password);
      if (match) {
        // JE - If the user is banned, block login, do not create a session, and redirect back with an error.
        if (user.isBanned) {
          return res.redirect("/login?error=banned");
        }
        req.session.uid = uId;
        req.session.user = user;
        req.session.loggedIn = true;

        res.redirect("/user/me");
      } else {
        // JE - Redirect back to login with error param so the page can show a red border on the password field.
        res.redirect("/login?error=password");
      }
    } else {
      // JE - Redirect back to login with error param so the page can show a red border on the email field.
      res.redirect("/login?error=email");
    }
  } catch (err) {
    console.error(`Error while comparing `, err.message);
  }
});

/**
 * Create a route for the logout page - /logout
 */
router.get("/logout", function (req, res) {
  Utils.log("Logging out...");
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
