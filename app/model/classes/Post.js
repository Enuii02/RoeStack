// Get the functions in the db.js file
const db = require("../db");

const Community = require("./community");
const User = require("./user");
const Utils = require("../../utils");

/**
 * This class defines a Post created by an user
 */
class Post {
  /**
   * Default constructor for Post
   * @param {int} id
   * @param {String} title
   * @param {String} content
   * @param {User} user
   * @param {Community} community
   * @param {Date} createdAt
   */
  constructor(
    id = -1,
    title = "Undefined",
    content = "Undefined",
    user = null,
    category = "Undefined",
    community = null,
    createdAt = new Date("2000-01-01"),
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.user = user;
    this.category = this.category;
    this.community = community;
    this.createdAt = createdAt;
    this.amountVotes = 0;
    this.elapsedTime = "";
    this.answersCount = 0;
    this.currentUserVote = 0;
  }

    /**
     * This function acts as a second constructor (as JS does not allow constructor overloading) that fetches post data from the database.
     * @param {int} id 
     * @returns 
     */
    async load(id, session) {

        const sql = `
            SELECT * 
            FROM Posts 
            WHERE id = ?
        `;

    Utils.log("Loading post #" + id + "...")
    const results = await db.query(sql, [id]);

    const post = results[0];
    // Save the results rows in the User object
    this.id = post.id;
    this.title = post.title;
    this.content = post.content;
    this.session = session;
    this.user = await new User().load(post.user_id);
    this.category = post.category;
    this.community = await new Community().load(post.community_id);
    this.createdAt = post.created_at;
    this.amountVotes = await this.getVoteCount(id);
    this.elapsedTime = Utils.getElapsedTime(this.createdAt);
    this.answersCount = await this.getCommentsCount();
    this.currentUserVote = await this.getCurrentUserVote();

    Utils.log("Participation of current user voting: " + this.currentUserVote)
    return this;
  }

   /**
   * This function fetches the current vote amount for a specific post id.
   * @param {int} id
   * @returns Amount of Votes.
   */
    async getVoteCount() {
        // Select the sum of all votes based on the boolean positive (0 = -1 and 1 = +1 / if empty, default 0)
        var sql = `
            SELECT COALESCE(SUM(positive * 2 - 1), 0) AS count
            FROM vote 
            WHERE post_id = ?;
        `;
        var row = await db.query(sql, [this.id]);
        return row[0].count;
    }

    /**
     * This function fetches the current user's vote.
     * @returns User vote.
     */
    async getCurrentUserVote() {
        Utils.log(this.session)
        
        if (!this.session || !this.session.user) {
            Utils.log("Post - No session detected!")
            return 0; // no user or session = no vote
        }
        // Select the current vote based on the boolean positive (0 = -1 and 1 = +1 / if empty, default 0)
        // MAX ensures that at least one row exists, so that coalesce can give a 0
        var sql = `
            SELECT COALESCE(MAX(positive * 2 - 1), 0) as vote
            FROM vote 
            WHERE post_id = ? AND user_id = ?;
        `;
        var row = await db.query(sql, [this.id, this.session.user.id]);
        return row[0].vote;
    }

    /**
     * This function deletes the current user's vote.
     * @returns User vote.
     */
    async deleteCurrentUserVote() {
        Utils.log("Deleting vote with user_id: " + this.session.user.id + " and post_id: " + this.id)
        var sql = `
            DELETE FROM vote 
            WHERE post_id = ? AND user_id = ?;
        `;
        await db.query(sql, [this.id, this.session.user.id]);
    }

    /**
     * This functions casts a positive or negative vote on this post.
     * @param {Boolean} positive 1 = upvote, 0 = downvote
     * @returns the amended total amount of votes for this post.
     */
    async vote(positive) {

        Utils.log("Amending vote with user_id: " + this.session.user.id + " and post_id: " + this.id + " to " + ((positive)? "upvote.":"downvote."))

        const sql = `
            INSERT INTO vote (user_id, post_id, comment_id, positive)
            VALUES (?, ?, NULL, ?)
            ON DUPLICATE KEY UPDATE positive = VALUES(positive)
        `;

        await db.query(sql, [this.session.user.id, this.id, positive]);

        Utils.log("Vote amended.")

        // Refresh vote count after voting
        this.amountVotes = await this.getVoteCount();

        return this.amountVotes;
    }

  async getCommentsCount() {
    const sql = "SELECT COUNT(*) as count FROM comments WHERE post_id = ?";
    const result = await db.query(sql, [this.id]);
    return result[0].count;
  }
}
// Add class to the exports, so that other classes can use it
module.exports = Post;
