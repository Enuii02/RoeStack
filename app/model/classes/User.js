
// Get the functions in the db.js file
const db = require("../Db");
const Utils = require("../../Utils");
const bcrypt = require("bcryptjs");

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
     * @param {int} postCount 
     * @param {String} elapsedTime 
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
        this.elapsedTime = "";
        this.amountPosts = 0;
    }

    /**
     * This function acts as a second constructor (as JS does not allow constructor overloading) that fetches user data from the database.
     * @param {int} id 
     * @returns 
     */
    async load(id) {
        
        const sql = `
            SELECT * 
            FROM Users 
            WHERE id = ?
        `;

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
        this.elapsedTime = Utils.getElapsedTime(this.createdAt)
        this.amountPosts = await this.getPostCount(id);
        
        return this;
    }

    /**
     * This function fetches the current post amount for a specific user id.
     * @returns Amount of Posts.
     */
    async getPostCount() {
        var sql = `
            SELECT count(id) as count 
            FROM posts 
            WHERE user_id = ?
        `;
        var row = await db.query(sql, [this.id]);
        return row[0].count;
    }

    
    // Checks to see if the submitted email address exists in the Users table
    async getIdFromEmail() {
        var sql = `
            SELECT id 
            FROM Users 
            WHERE email = ?
        `;
        const result = await db.query(sql, [this.email]);
        // TODO LOTS OF ERROR CHECKS HERE..
        if (JSON.stringify(result) != '[]') {
            this.id = result[0].id;
            return this.id;
        }
        else {
            return false;
        }
    }

    async setUserPassword(password) {
        const passwordHash = await bcrypt.hash(password, 10);
        var sql = `
            UPDATE Users SET password_hash = ? 
            WHERE id = ?
        `;
        const result = await db.query(sql, [passwordHash, this.id]);
        return true;
    }

    // Test a submitted password against a stored password
    async authenticate(password) {
        // Get the stored, hashed password for the user
        var sql = `
            SELECT password_hash 
            FROM Users 
            WHERE id = ?
        `;
        const result = await db.query(sql, [this.id]);
        const match = await bcrypt.compare(password, result[0].password_hash);
        if (match == true) {
            return true;
        }
        else {
            return false;
        }
    }

    // Add a new record to the users table
    async addUser(password) {
        const passwordHash = await bcrypt.hash(password, 10);
        var sql = `
            INSERT INTO Users (email, password_hash) 
            VALUES (? , ?)
        `;
        const result = await db.query(sql, [this.email, passwordHash]);
        this.id = result.insertId;
        return true;
    }

}

// Add class to the exports, so that other classes can use it
module.exports = User;