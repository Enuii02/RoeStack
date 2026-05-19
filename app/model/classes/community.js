// Get the functions in the db.js file
const db = require("../db");
const User = require("./user");
const Utils = require("../../utils");

/**
 * This class defines a Community
 */
class Community {
  /**
   * Default constructor for Community
   * @param {int} id
   * @param {String} name
   * @param {String} description
   * @param {String} status
   * @param {User} createdBy
   * @param {Date} createdAt
   */
  constructor(
    id = -1,
    name = "Undefined",
    description = "Undefined",
    status = "Undefined",
    createdBy = null,
    createdAt = new Date("2000-01-01"),
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.amountPosts = 0;
    this.amountUsers = 0;
  }

  /**
   * This function acts as a second constructor (as JS does not allow constructor overloading) that fetches post data from the database.
   * @param {int} id
   * @returns
   */
  async load(id, contentManager) {
    const sql = `
            SELECT * 
            FROM communities 
            WHERE id = ?
        `;

    Utils.log("Loading community #" + id + "...");

    const results = await db.query(sql, [id]);

    const community = results[0];
    // Save the results rows in the User object
    this.id = community.id;
    this.name = community.name;
    this.description = community.description;
    this.status = community.status;
    this.createdBy = await new User().load(
      community.created_by,
      contentManager,
    );
    this.createdAt = community.created_at;
    this.amountPosts = await this.getPostCount();
    this.amountUsers = await this.getFollowersCount();

    return this;
  }

  /**
   * This function fetches the current post amount for a specific community id.
   * @returns Amount of Posts.
   */
  async getPostCount() {
    var sql = `
            SELECT count(id) as count 
            FROM posts 
            WHERE community_id = ?
        `;
    var row = await db.query(sql, [this.id]);
    return row[0].count;
  }

  /**
   * This function fetches the current users following this community.
   * @returns Amount of Followers.
   */
  async getFollowersCount() {
    // Get all users, ordering it by wether it is a mod or not
    const sql = `
            SELECT COUNT(user_id) AS count
            FROM userFollowCommunity
            WHERE community_id = ?
        `;

    const row = await db.query(sql, [this.id]);
    return row[0].count;
  }

  static async getAll() {
    const sql = `
    SELECT id, name
    FROM communities
  `;

    const results = await db.query(sql);

    const communities = [];

    for (const row of results) {
      const community = new Community();
      await community.load(row.id);

      communities.push({
        id: community.id,
        name: community.name,
        followers: community.amountUsers,
      });
    }

    return communities;
  }

  /**
   * Static method to create a new community.
   */
  static async create({ name, description, contentManager }) {
      const sql = `
          INSERT INTO communities (name, description, status, created_by, created_at)
          VALUES (?, ?, 'active', ?, NOW())
      `;

      // Accessing user ID from the contentManager session
      const userId = contentManager.session.user.id;

      const result = await db.query(sql, [name, description, userId]);

      // Handle different return structures from mysql2
      const insertId = result.insertId || result[0]?.insertId;

      // Load and return the full community object
      const community = await new Community().load(insertId, contentManager);

      return community;
  }

  /**
   * Instance method to update community details.
   */
  async update({ name, description, status }) {
      const sql = `
          UPDATE communities 
          SET name = ?, 
              description = ?, 
              status = ?
          WHERE id = ?
      `;

      // Use 'this.id' from the currently loaded community instance
      await db.query(sql, [
          name, 
          description, 
          status || this.status, 
          this.id 
      ]);

      // Update local properties so the object stays in sync with DB
      this.name = name;
      this.description = description;
      if (status) this.status = status;

      return this;
  }

  /**
   * Static method to delete a community.
   * Checks if the user is the creator or a moderator.
   */
  static async delete(communityId, userId, isMod) {
      // First, we must fetch the community to check ownership
      const [rows] = await db.query("SELECT created_by FROM communities WHERE id = ?", [communityId]);
      
      if (!rows || rows.length === 0) {
          throw new Error("Community not found");
      }

      const communityOwnerId = rows.created_by || rows[0]?.created_by;

      // Security check: must be owner OR a moderator
      if (communityOwnerId == userId || isMod) {
          await db.query("DELETE FROM communities WHERE id = ?", [communityId]);
          return true;
      } else {
          throw new Error("Forbidden: You do not have permission to delete this community.");
      }
  }
}
// Add class to the exports, so that other classes can use it
module.exports = Community;
