const db = require("../db");
const User = require("./user");
const Utils = require("../../utils");

class Comment {
  constructor(
    id = -1,
    postId = -1,
    user = null,
    content = "",
    parentId = null,
    createdAt = new Date(),
  ) {
    this.id = id;
    this.postId = postId;
    this.user = user;
    this.content = content;
    this.parentId = parentId;
    this.createdAt = createdAt;

    this.amountVotes = 0;
    this.elapsedTime = "";
    this.currentUserVote = 0;

    this.session;
    this.replies = [];
  }

  /**
   * Load single comment
   */
  async load(id, session) {
    const sql = "SELECT * FROM Comments WHERE id = ?";

    Utils.log("Loading comment #" + id + "...");

    const results = await db.query(sql, [id]);
    const comment = results[0];

    this.id = comment.id;
    this.postId = comment.post_id;
    this.user = await new User().load(comment.user_id);
    this.content = comment.content;
    this.parentId = comment.parent_id;
    this.createdAt = comment.created_at;
    this.session = session;
    this.isDeleted = comment.is_deleted === 1;

    this.amountVotes = await this.getVoteCount(this.id);
    this.elapsedTime = Utils.getElapsedTime(this.createdAt);
    this.currentUserVote = await this.getCurrentUserVote();

    return this;
  }

  /**
   * This function fetches the current vote amount for a specific comment id.
   * @param {int} id
   * @returns Amount of Votes.
   */
  async getVoteCount() {
    // Select the sum of all votes based on the boolean positive (0 = -1 and 1 = +1 / if empty, default 0)
    var sql = `
              SELECT COALESCE(SUM(positive * 2 - 1), 0) AS count
              FROM vote 
              WHERE comment_id = ?;
          `;
    var row = await db.query(sql, [this.id]);
    return row[0].count;
  }

  /**
   *  Load ALL comments for a post (flat)
   */
  static async getByPostId(postId, session, sort = "best") {
    let orderBy = "";

    switch (sort) {
      case "latest":
        orderBy = "created_at DESC";
        break;

      case "oldest":
        orderBy = "created_at ASC";
        break;

      case "best":
      default:
        orderBy = "vote_count DESC, created_at DESC";
        break;
    }

    const sql = `
    SELECT id 
    FROM Comments 
    WHERE post_id = ?
    ORDER BY ${orderBy}
  `;

    const rows = await db.query(sql, [postId]);

    const comments = [];

    for (let row of rows) {
      const comment = await new Comment().load(row.id, session);
      comments.push(comment);
    }

    return comments;
  }

  /**
   *  Build tree (replies)
   */

  static buildTree(comments) {
    const map = {};
    const roots = [];

    comments.forEach((c) => {
      map[c.id] = c;
      c.replies = [];
    });

    comments.forEach((c) => {
      if (c.parentId === null) {
        roots.push(c);
      } else {
        if (map[c.parentId]) {
          map[c.parentId].replies.push(c);
        }
      }
    });

    return roots;
  }

  /**
   * This function fetches the current user's vote.
   * @returns User vote.
   */
  async getCurrentUserVote() {
    if (!this.session || !this.session.user) {
      Utils.log("Comment - No session detected!");
      return 0; // no user or session = no vote
    }
    // Select the current vote based on the boolean positive (0 = -1 and 1 = +1 / if empty, default 0)
    // MAX ensures that at least one row exists, so that coalesce can give a 0
    var sql = `
          SELECT COALESCE(MAX(positive * 2 - 1), 0) as vote
          FROM vote 
          WHERE comment_id = ? AND user_id = ?;
      `;
    var row = await db.query(sql, [this.id, this.session.user.id]);
    return row[0].vote;
  }

  /**
   * This function deletes the current user's vote.
   * @returns User vote.
   */
  async deleteCurrentUserVote() {
    Utils.log(
      "Deleting vote with user_id: " +
        this.session.user.id +
        " and comment_id: " +
        this.id,
    );
    var sql = `
          DELETE FROM vote 
          WHERE comment_id = ? AND user_id = ?;
      `;
    await db.query(sql, [this.id, this.session.user.id]);
  }

  /**
   * This functions casts a positive or negative vote on this post.
   * @param {Boolean} positive 1 = upvote, 0 = downvote
   * @returns the amended total amount of votes for this post.
   */
  async vote(positive) {
    Utils.log(
      "Amending vote with user_id: " +
        this.session.user.id +
        " and comment_id: " +
        this.id +
        " to " +
        (positive ? "upvote." : "downvote."),
    );

    const sql = `
          INSERT INTO vote (user_id, post_id, comment_id, positive)
          VALUES (?, NULL, ?, ?)
          ON DUPLICATE KEY UPDATE positive = VALUES(positive)
      `;

    await db.query(sql, [this.session.user.id, this.id, positive]);

    Utils.log("Vote amended.");
    // Refresh vote count after voting
    this.amountVotes = await this.getVoteCount();

    return this.amountVotes;
  }

  static async create({ content, postId, parentId, userId, session }) {
    const sql = `
    INSERT INTO comments (content, user_id, post_id, parent_id, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

    const result = await db.query(sql, [content, userId, postId, parentId]);

    const insertId = result.insertId || result[0]?.insertId;

    const comment = await new Comment().load(insertId, session);

    return comment;
  }

  static async delete(commentId, userId) {
    // get comment
    const result = await db.query("SELECT * FROM comments WHERE id = ?", [
      commentId,
    ]);

    const comment = result[0]?.[0] || result[0];

    console.log("COMMENT:", commentId, comment);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // get user
    const userResult = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    const user = userResult[0]?.[0] || userResult[0];
    console.log("USER:", user);
    console.log("is_mod:", user.is_mod, typeof user.is_mod);

    console.log("USER:", userId, user);
    if (!user) {
      throw new Error("User not found");
    }

    const isOwner = comment.user_id == userId;
    const isModerator = Number(user.is_mod) === 1;

    if (!isOwner && !isModerator) {
      throw new Error("Forbidden");
    }

    const deletedBy = isModerator ? "moderator" : "user";

    await db.query(
      `UPDATE comments 
     SET is_deleted = 1, content = ?, deleted_by = ?
     WHERE id = ?`,
      [`Answer has been deleted by ${deletedBy}`, deletedBy, commentId],
    );

    return `Answer has been deleted by ${deletedBy}`;
  }
}

module.exports = Comment;
