
// Get the functions in the db.js file
const db = require("../db");

const Post = require("./Post");


class ContentManager {

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
}

// Add class to the exports, so that other classes can use it
module.exports = ContentManager;