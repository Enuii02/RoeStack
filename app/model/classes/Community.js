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
            FROM Communities 
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
    FROM Communities
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
}
// Add class to the exports, so that other classes can use it
module.exports = Community;
