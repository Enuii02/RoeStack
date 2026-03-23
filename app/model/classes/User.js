
// Get the functions in the db.js file
const db = require("../db");

/**
 * This class defines a User, used to distinguish each student/staff/moderator
 */
class User {

    /**
     * Default constructor for User
     * @param {int} id 
     * @param {String} name 
     * @param {String} role 
     * @param {String} bio 
     * @param {Boolean} isMod 
     * @param {String} email 
     * @param {String} passwordHash 
     * @param {Date} createdAt 
     */
    constructor(id = -1, name = "Undefined", role = "Undefined", bio = "Undefined", isMod = false, email = "Undefined", passwordHash = "Undefined", createdAt = new Date("2000-01-01")) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.bio = bio;
        this.isMod = isMod;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
        this.postCount = -1;
    }

    /**
     * This function acts as a second constructor (as JS does not allow constructor overloading) that fetches user data from the database.
     * @param {int} id 
     * @returns 
     */
    async load(id) {
        
        const sql = "SELECT * FROM Users WHERE id = ?";

        const results = await db.query(sql, [id]);

        const user = results[0];
        // Save the results rows in the User object
        this.id = user.id;
        this.name = user.name;
        this.role = user.role;
        this.bio = user.bio;
        this.isMod = user.is_mod;
        this.email = user.email;
        this.passwordHash = user.password_hash;
        this.createdAt = user.created_at;
        this.postCount = await this.getPostCount(id);
        
        return this;
    }

    /**
     * This function fetches the current post amount for a specific user id.
     * @param {int} id 
     * @returns Amount of Posts.
     */
    async getPostCount(id) {
        var sql = "SELECT count(id) AS count FROM posts WHERE user_id = ?";
          var row = await db.query(sql, [id]);
          return row[0].count;
    }

}
// Add class to the exports, so that other classes can use it
module.exports = User;