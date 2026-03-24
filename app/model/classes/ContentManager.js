
// Get the functions in the db.js file
const db = require("../db");

const Post = require("./Post");
const User = require("./User");

// TODO Convert to Singleton or Observer
class ContentManager {

    async update(
        getStatistics = true,
        getLatestPosts = false, 
        getUserList = false
    ) {

        var totalPosts, totalUsers, mostHelpful, 
            latestPosts, userList;

        // Get all statistics
        (getStatistics)  ? totalPosts  = await this.getTotalPosts()  : latestPosts = [];
        (getStatistics)  ? totalUsers  = await this.getTotalUsers()  : latestPosts = [];
        (getStatistics)  ? mostHelpful = await this.getMostHelpful() : latestPosts = [];

        // Get latest post sorted by created_at descending
        (getLatestPosts) ? latestPosts = await this.getLatestPosts() : latestPosts = [];

        // Get all users sorted by mods ascending
        (getUserList)    ? userList    = await this.getUserList()    : userList    = [];

        return new Content(latestPosts, totalPosts, totalUsers, userList, mostHelpful);

    }

    async getLatestPosts() {

        var posts = []
        const sql = "SELECT id FROM posts ORDER BY created_at DESC";

        const results = await db.query(sql, null);

        console.log(results);

        var post;

        for (let i = 0; i < results.length; i++) {
            console.log(results[i].id);
            post = await new Post().load(results[i].id);
            posts.push(post);
            console.log(post);
        }
        return posts;
    }

    
    async getUserList() {
        // Get all users, ordering it by wether it is a mod or not
        const sql = "SELECT id FROM user ORDER BY is_mod ASC";

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

        console.log(results);

        var post;

        for (let i = 0; i < results.length; i++) {
            console.log(results[i].id);
            post = await new Post().load(results[i].id);
            posts.push(post);
            console.log(post);
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

    async getMostHelpful() {
        const sql = "SELECT users.id, SUM(vote_count) as count FROM users, posts WHERE posts.user_id = users.id GROUP BY users.id ORDER BY `count` DESC LIMIT 5";
        const results = await db.query(sql, null);
        var users = [];
        var user;
        for (let i = 0; i < results.length; i++) {
            user = await new User().load(results[i].id);
            users.push(user);
        }
        return users;
    }
}

class Content {

    constructor(latestPosts, totalPosts, totalUsers, userList, mostHelpful) {

        this.latestPosts = latestPosts; 
        this.totalPosts = totalPosts;
        this.totalUsers = totalUsers;
        this.mostHelpful = mostHelpful;
        this.userList = userList;
    
    }
}

// Add class to the exports, so that other classes can use it
module.exports = ContentManager;