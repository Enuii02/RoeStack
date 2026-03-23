
// Get the functions in the db.js file
const db = require("../db");
const User = require("./User");

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
    constructor(id = -1, name = "Undefined", description = "Undefined", status = "Undefined", createdBy = null, createdAt = new Date("2000-01-01")) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.amountPosts = 0;
    }

    /**
     * This function acts as a second constructor (as JS does not allow constructor overloading) that fetches post data from the database.
     * @param {int} id 
     * @returns 
     */
    async load(id) {
        
        const sql = "SELECT * FROM Communities WHERE id = ?";

        const results = await db.query(sql, [id]);

        const community = results[0];
        // Save the results rows in the User object
        this.id = community.id;
        this.name = community.name;
        this.description = community.description;
        this.createdBy = await User().load(community.user_id);
        this.createdAt = community.created_at;
        this.amountPosts = await this.getPostCount(id);
        
        return this;
    }

    /**
     * This function fetches the current post amount for a specific community id.
     * @param {int} id 
     * @returns Amount of Posts.
     */
    async getPostCount(id) {
        var sql = "SELECT vote_count AS count FROM posts WHERE id = ?";
          var row = await db.query(sql, [id]);
          return row[0].count;
    }

}
// Add class to the exports, so that other classes can use it
module.exports = Community;