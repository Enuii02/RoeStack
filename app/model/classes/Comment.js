const db = require("../Db");
const User = require("./User");
const Utils = require("../../Utils");

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

    this.votes = 0;
    this.elapsedTime = "";

    this.replies = [];
  }

  /**
   * Load single comment
   */
  async load(id) {
    const sql = "SELECT * FROM Comments WHERE id = ?";
    const results = await db.query(sql, [id]);

    const c = results[0];

    this.id = c.id;
    this.postId = c.post_id;
    this.user = await new User().load(c.user_id);
    this.content = c.content;
    this.parentId = c.parent_id;
    this.createdAt = c.created_at;

    this.votes = await this.getVoteCount(this.id);
    this.elapsedTime = Utils.getElapsedTime(this.createdAt);

    return this;
  }

  /**
   * Get votes
   */
  async getVoteCount(id) {
    var sql = "SELECT vote_count AS count FROM comments WHERE id = ?";
    var row = await db.query(sql, [id]);
    return row[0].count;
  }

  /**
   *  Load ALL comments for a post (flat)
   */
  static async getByPostId(postId) {
    const sql =
      "SELECT * FROM Comments WHERE post_id = ? ORDER BY created_at ASC";
    const rows = await db.query(sql, [postId]);

    const comments = [];

    for (let row of rows) {
      let comment = new Comment();

      comment.id = Number(row.id);
      comment.postId = row.post_id;
      comment.user = await new User().load(row.user_id);
      comment.content = row.content;
      comment.parentId = row.parent_id !== null ? Number(row.parent_id) : null;
      comment.createdAt = row.created_at;

      comment.votes = await comment.getVoteCount(row.id);
      comment.elapsedTime = Utils.getElapsedTime(comment.createdAt);

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
}

module.exports = Comment;
