
// Get the functions in the db.js file
const db = require("../db");

const Post = require("./Post");
const User = require("./User");

// TODO Convert to Singleton or Observer
class ContentManager {

    async update({
        getStatistics = true,
        getLatestPosts = false, 
        getUserList = false
    } = {}) { 

        var totalPosts, totalUsers, totalComments, mostHelpful, 
            latestPosts, userList;

        // Get all statistics
        if (getStatistics)  totalPosts    = await this.getTotalPosts();
        if (getStatistics)  totalUsers    = await this.getTotalUsers();
        if (getStatistics)  totalComments = await this.getTotalComments();
        if (getStatistics)  mostHelpful   = await this.getMostHelpful();

        // Get latest post sorted by created_at descending
        if (getLatestPosts) latestPosts   = await this.getLatestPosts();

        // Get all users sorted by mods first
        if (getUserList)    userList      = await this.getUsersList();

        return new Content(latestPosts, totalPosts, totalComments, totalUsers, userList, mostHelpful);

    }

    async getLatestPosts() {
        var posts = []
        const sql = "SELECT id FROM posts ORDER BY created_at DESC";

        const results = await db.query(sql, null);

        var post;

        for (let i = 0; i < results.length; i++) {
            post = await new Post().load(results[i].id);
            posts.push(post);
        }
        return posts;
    }

    
    async getUsersList() {
        // Get all users, ordering it by wether it is a mod or not
        const sql = "SELECT id FROM users ORDER BY is_mod DESC";

        const results = await db.query(sql, null);
        var users = [];
        var user;
        for (let i = 0; i < results.length; i++) {
            user = await new User().load(results[i].id);
            users.push(user);
        }
        return users;
    }

    async getLatestPostsFromID(id) {

        var posts = []
        const sql = "SELECT id FROM posts WHERE user_id = ? ORDER BY created_at DESC";

        const results = await db.query(sql, [id]);

        var post;

        for (let i = 0; i < results.length; i++) {
            post = await new Post().load(results[i].id);
            posts.push(post);
        }
        return posts;
    }

    async getTotalPosts() {
        const sql = "SELECT count(id) as count FROM posts";
        const results = await db.query(sql, null);
        return results[0].count
    }

    async getTotalUsers() {
        const sql = "SELECT count(id) as count FROM users";
        const results = await db.query(sql, null);
        return results[0].count
    }

    async getTotalComments() {
        return 25;
        // TODO Uncomment when comments table is available
        // const sql = "SELECT count(id) as count FROM comments";
        // const results = await db.query(sql, null);
        // return results[0].count
    }

    async getMostHelpful() {
        const sql = "SELECT users.id, SUM(vote_count) as count FROM users, posts WHERE posts.user_id = users.id GROUP BY users.id ORDER BY `count` DESC LIMIT 5";
        const results = await db.query(sql, null);
        var users = [];
        var user;
        for (let i = 0; i < results.length; i++) {
            user = await new User().load(results[i].id);
            users.push(user);
            console.log(user)
        }
        return users;
    }
}

class Content {

    constructor(latestPosts, totalPosts, totalComments, totalUsers, userList, mostHelpful) {

        this.latestPosts = latestPosts; 
        this.totalPosts = totalPosts;
        this.totalComments = totalComments;
        this.totalUsers = totalUsers;
        this.mostHelpful = mostHelpful;
        this.userList = userList;
    
    }
}

// Add class to the exports, so that other classes can use it
module.exports = ContentManager;