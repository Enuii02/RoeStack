const express = require("express");
const session = require("express-session");
const Utils = require("../utils.js");
const app = express();
const router = express.Router();

const User = require("../model/classes/user.js");
const ContentManager = require("../model/classes/ContentManager.js");

/**
 * Create a route for the login page - /login
 */
router.get("/login", async function (_, res) {
  // var user = await new User().load(1);
  // user.setUserPassword("123")
  res.render("pages/login");
});

/**
 * Create a route for the register page - /register
 */
router.get("/register", async function (_, res) {
  Utils.log("Going to Register page...");
  res.render("pages/register");
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
        req.session.uid = uId;
        req.session.user = user;
        req.session.loggedIn = true;

        res.redirect("/user/me");
      } else {
        res.send("Invalid password");
      }
    } else {
      res.send("Invalid email");
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