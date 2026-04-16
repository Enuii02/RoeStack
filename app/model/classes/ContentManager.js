
// Get the functions in the db.js file
const db = require("../db.");
const Community = require("./Community");

const Post = require("./Post");
const User = require("./User");

// TODO Convert to Singleton or Observer
/**
 * The Content Manager 
 */
class ContentManager {

    constructor(session) {
        this.session = session;
    }

    async update({
        getStatistics = true,
        getLatestPosts = false, 
        getUserList = false,
        getAllCommunities = false
    } = {}) { 

        var totalPosts, totalUsers, totalComments, mostHelpful, topCommunities,
            latestPosts, userList, communityList, popularPosts;

        // Get all statistics
        if (getStatistics)  totalPosts       = await this.getTotalPosts();
        if (getStatistics)  totalUsers       = await this.getTotalUsers();
        if (getStatistics)  totalComments    = await this.getTotalComments();
        if (getStatistics)  mostHelpful      = await this.getMostHelpful();
        if (getStatistics)  topCommunities   = await this.getTopCommunities();
        if (getStatistics)  {
            // this.session.user is not an instance of user anymore, hence the user is loaded again to update any new attributes.
            this.session.user = await new User().load(this.session.user.id)
        }

        // Get latest post sorted by created_at descending
        if (getLatestPosts) latestPosts      = await this.getPosts();

        // Get all users sorted by mods first
        if (getUserList)    userList         = await this.getUsersList();

        // Get all communities sorted by oldest first
        if (getAllCommunities) communityList = await this.getAllCommunities();

        return new Content(
            totalPosts, totalUsers, totalComments, mostHelpful, topCommunities,
            latestPosts, userList, communityList, popularPosts, this.session
        );

    }

    async getPosts({
        userID = -1,
        communityID = -1,
        sortByLatest = true,
        sortByForYou = false,
        sortByPopularity = false,
        reverse = false,
    
    } = {}) { 
        var post;
        var posts = [];
        var sql;
        var results;
        
        // Build query dynamically based on provided filters
        let whereClause = "";
        let orderByClause = ""
        let params = [];
        let sortOrder = (reverse) ? `ASC` : `DESC`;

        // Build WHERE clause and parameters array
        if (userID !== -1 && communityID !== -1) {
            whereClause = "WHERE user_id = ? AND community_id = ?";
            params = [userID, communityID];
        } else if (sortByForYou && userID !== -1) {
            whereClause = "WHERE community_id IN ( SELECT community_id FROM userFollowCommunity WHERE user_id = ? )"
            params = [userID]
        } else if (userID !== -1) {
            whereClause = "WHERE user_id = ?";
            params = [userID];
        } else if (communityID !== -1) {
            whereClause = "WHERE community_id = ?";
            params = [communityID];
        }  

        // Build ORDER BY clause
        if (sortByPopularity) {
            orderByClause = "ORDER BY (vote_count + comment_count)"
        } else {
            orderByClause = "ORDER BY created_at";
        } 

        sql = `SELECT id FROM posts ${whereClause} ${orderByClause} ${sortOrder}`;
        // console.log('SQL:', sql);
        results = await db.query(sql, params);

            for (let i = 0; i < results.length; i++) {
                post = await new Post().load(results[i].id, this.session);
                posts.push(post);
            }

        return posts;
    }
    async getAmountOfPosts({
        userID = -1,
        communityID = -1
    } = {}) { 
        var sql;
        var results;

        var userNotSelected = userID === -1;
        var communityNotSelected = communityID === -1;

        if (userNotSelected && communityNotSelected) {
            // Get count of all posts 
            sql = `
                SELECT count(id) as count 
                FROM posts
            `;
            results = await db.query(sql, null);
        } else if (userNotSelected) {
            // Get count of all posts related to a specific community
            sql = `
                SELECT count(id) 
                FROM posts 
                WHERE community_id = ?
            `;
            results = await db.query(sql, [communityID]);
        } else if (communityNotSelected) {
            // Get count of all posts related to a specific user 
            sql = `
                SELECT count(id) 
                FROM posts 
                WHERE user_id = ?
            `;
            results = await db.query(sql, [userID]);
        }

        return results[i].id;
    }

    
    async getUsersList() {
        // Get all users, ordering it by wether it is a mod or not
        const sql = `
            SELECT id 
            FROM users 
            ORDER BY is_mod DESC
        `;

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
        const sql = `
            SELECT id 
            FROM communities 
            ORDER BY created_at ASC 
            LIMIT 5
        `;

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
        const sql = `
            SELECT id 
            FROM communities 
            ORDER BY created_at ASC
        `;

        const results = await db.query(sql, null);
        var communities = [];
        var community;
        for (let i = 0; i < results.length; i++) {
            community = await new Community().load(results[i].id);
            communities.push(community);
        }
        return communities;
    }

    async getTotalPosts() {
        const sql = `
            SELECT count(id) as count 
            FROM posts
        `;
        const results = await db.query(sql, null);
        return results[0].count
    }

    async getTotalUsers() {
        const sql = `
            SELECT count(id) as count 
            FROM users
        `;
        const results = await db.query(sql, null);
        return results[0].count
    }

    async getTotalComments() {
        return 25;
        // TODO Uncomment when comments table is available
        // const sql = `
        //     SELECT count(id) as count 
        //     FROM comments
        // `;
        // const results = await db.query(sql, null);
        // return results[0].count
    }

    async getMostHelpful() {
        // Select top five users that have the most votes (if no votes have been found, coalesce (default) to 0)
        // We use the sum of all the +1 and -1 based on the boolean named positive (0 is mapped to -1 and 1 is mapped to +1) 
        const sql = `
            SELECT u.id, COALESCE(SUM(v.positive * 2 - 1), 0) AS count 

            FROM users u 
            LEFT JOIN posts p ON p.user_id = u.id 
            LEFT JOIN vote v ON v.post_id = p.id

            WHERE v.post_id = p.id AND p.user_id = u.id
            GROUP BY u.id 
            ORDER BY count DESC 
            LIMIT 5
        `;
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

    constructor(totalPosts, totalUsers, totalComments, mostHelpful, topCommunities,
            latestPosts, userList, communityList, popularPosts, session) {

        this.totalPosts = totalPosts;
        this.totalUsers = totalUsers;
        this.totalComments = totalComments;
        this.mostHelpful = mostHelpful;
        this.topCommunities = topCommunities;
        this.latestPosts = latestPosts; 
        this.userList = userList;
        this.communityList = communityList;
        this.popularPosts = popularPosts;
        this.session = session;
    
    }
}

// Add class to the exports, so that other classes can use it
module.exports = ContentManager;