const express = require("express");
const session = require("express-session");
const Utils = require("../utils.js");
const app = express();
const router = express.Router();

const Post = require("../model/classes/post.js");
const Comment = require("../model/classes/comment.js");
const ContentManager = require("../model/classes/contentManager.js");

/**
 * Vote page used to send a vote request from the client side to the server's db
 */
router.post("/vote", async (req, res) => {
  if (req.session.loggedIn && req.session.user) {
    const { subjectId, typeId, positive } = req.body;

    // Create and populate post object
    var subject;
    switch (typeId) {
      case "0":
        subject = await new Post().load(parseInt(subjectId), ContentManager.getInstance(req.session));
        break;
      case "1":
        subject = await new Comment().load(parseInt(subjectId), ContentManager.getInstance(req.session));
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


module.exports = router;