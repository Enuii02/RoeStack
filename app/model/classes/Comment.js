const db = require("../Db");
const User = require("./User");
const Utils = require("../../Utils");

class Comment {

  constructor(
    id = -1,
    postId = -1,
    user = null,
    text = "",
    parentId = null,
    createdAt = new Date()
  ) {
    this.id = id;
    this.postId = postId;
    this.user = user;
    this.text = text;
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
    this.text = c.text;
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
   *  Build tree (replies)
   */
  static buildTree(comments) {
    const map = {};
    const roots = [];

    comments.forEach(c => {
      map[c.id] = c;
      c.replies = [];
    });

    comments.forEach(c => {
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