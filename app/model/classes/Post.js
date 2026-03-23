
// Get the functions in the db.js file
const db = require("../db");

const Community = require("./Community");
const User = require("./User");

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
    constructor(id = -1, title = "Undefined", content = "Undefined", user = null, category="Undefined", community = null, createdAt = new Date("2000-01-01")) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.user = user;
        this.category = this.category;
        this.community = community;
        this.createdAt = createdAt;
        this.amountVotes = 0;
        this.elapsedTime = ""
    }

    /**
     * This function acts as a second constructor (as JS does not allow constructor overloading) that fetches post data from the database.
     * @param {int} id 
     * @returns 
     */
    async load(id) {

        const sql = "SELECT * FROM Posts WHERE id = ?";

        const results = await db.query(sql, [id]);
        console.log(results);

        const post = results[0];
        // Save the results rows in the User object
        this.id = post.id;
        this.title = post.title;
        this.content = post.content;
        this.user = await new User().load(post.user_id);
        this.category = post.category;
        this.community = await new Community().load(post.community_id);
        this.createdAt = post.created_at;
        this.amountVotes = await this.getVoteCount(id);
        this.elapsedTime = this.getElapsedTime();
        
        console.log(this);
        return this;
    }

    /**
     * This function fetches the current vote amount for a specific post id.
     * @param {int} id 
     * @returns Amount of Votes.
     */
    async getVoteCount(id) {
        var sql = "SELECT vote_count AS count FROM posts WHERE id = ?";
        var row = await db.query(sql, [id]);
        return row[0].count;
    }

    getElapsedTime() {
        var dateNow = new Date();

        var seconds = Math.floor((this.createdAt - (dateNow))/1000*-1);
        var minutes = Math.floor(seconds/60);
        var hours = Math.floor(minutes/60);
        var days = Math.floor(hours/24);

        if (hours === 0 && days === 0) {
            return "Just now"
        }
        
        if (hours < 24 && days === 0) {
            return hours + ((hours === 1) ? " hour ago" : " hours ago")
        } else {
            return days + ((days === 1) ? " day ago" : " days ago")
        }
        
    }

}
// Add class to the exports, so that other classes can use it
module.exports = Post;