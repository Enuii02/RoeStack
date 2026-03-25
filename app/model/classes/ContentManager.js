
// Get the functions in the db.js file
const db = require("../db");
const Community = require("./Community");

const Post = require("./Post");
const User = require("./User");

// TODO Convert to Singleton or Observer
/**
 * The Content Manager 
 */
class ContentManager {

    async update({
        getStatistics = true,
        getLatestPosts = false, 
        getUserList = false,
        getAllCommunities = false
    } = {}) { 

        var totalPosts, totalUsers, totalComments, mostHelpful, topCommunities,
            latestPosts, userList, communityList;

        // Get all statistics
        if (getStatistics)  totalPosts       = await this.getTotalPosts();
        if (getStatistics)  totalUsers       = await this.getTotalUsers();
        if (getStatistics)  totalComments    = await this.getTotalComments();
        if (getStatistics)  mostHelpful      = await this.getMostHelpful();
        if (getStatistics)  mostHelpful      = await this.getMostHelpful();
        if (getStatistics)  topCommunities   = await this.getTopCommunities();

        // Get latest post sorted by created_at descending
        if (getLatestPosts) latestPosts      = await this.getLatestPosts();

        // Get all users sorted by mods first
        if (getUserList)    userList         = await this.getUsersList();

        // Get all communities sorted by oldest first
        if (getAllCommunities) communityList = await this.getAllCommunities();

        return new Content(
            totalPosts, totalUsers, totalComments, mostHelpful, topCommunities,
            latestPosts, userList, communityList
        );

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

    async getTopCommunities() {
        // TODO Get all communities sorted by amount of users DESC
        const sql = "SELECT id FROM communities ORDER BY created_at ASC LIMIT 5";

        const results = await db.query(sql, null);
        var communities = [];
        var community;
        for (let i = 0; i < results.length; i++) {
            community = await new Community().load(results[i].id);
            communities.push(community);
        }
        return communities;
    }

    async getAllCommunities() {
        // Get all communities sorted by oldest first
        const sql = "SELECT id FROM communities ORDER BY created_at ASC";

        const results = await db.query(sql, null);
        var communities = [];
        var community;
        for (let i = 0; i < results.length; i++) {
            community = await new Community().load(results[i].id);
            communities.push(community);
        }
        return communities;
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

    constructor(totalPosts, totalUsers, totalComments, mostHelpful, topCommunities,
            latestPosts, userList, communityList) {

        this.totalPosts = totalPosts;
        this.totalUsers = totalUsers;
        this.totalComments = totalComments;
        this.mostHelpful = mostHelpful;
        this.topCommunities = topCommunities;
        this.latestPosts = latestPosts; 
        this.userList = userList;
        this.communityList = communityList;
    
    }
}

// Add class to the exports, so that other classes can use it
module.exports = ContentManager;