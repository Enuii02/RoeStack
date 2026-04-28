const express = require("express");
const session = require("express-session");
const Utils = require("../utils.js");
const app = express();
const router = express.Router();

const Comment = require("../model/classes/comment.js");

router.delete("/comments/:id", async (req, res) => {
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


router.get("/comments/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { sort } = req.query; // sort

    const comments = await ContentManager.getCommentsByPostId(postId, req.session, sort);

    const tree = Comment.buildTree(comments);

    res.render("partials/comment-list", {
      comments: tree,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



router.post("/comments", async (req, res) => {
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

module.exports = router;