const ContentManager = require("../classes/ContentManager");

/**
 * Middleware that handles post sorting and filtering based on query parameters
 * Attaches sorted posts to req.sortedFilteredPosts and sort type to req.activeSort
 * Supports filtering by user ID from request parameters
 * 
 * Supported sort types:
 * - "popular": Posts sorted by votes + comments (descending)
 * - "foryou": Personalized posts (default content manager)
 * - "latest": Posts sorted by creation date (newest first, default)
 * 
 * TODO: Implement filtering functionality and personalized "for you" sorting
 */
async function getPosts(req, _, next) {
  try {
    const contentManager = new ContentManager();
    const userId = req.params.id || null;
    const sortType = req.query.sortby || "latest";

    const posts = await fetchPostsBySortType(contentManager, sortType, userId);

    req.sortedFilteredPosts = posts;
    req.activeSort = normalizeSortType(sortType);

    next();
  } catch (error) {
    console.error("Error in sorting middleware:", error);
    next(error);
  }
}

/**
 * Fetches posts based on the specified sort type and optional user ID
 * @param {ContentManager} contentManager - Content manager instance
 * @param {string} sortType - Type of sorting ("popular", "foryou", or "latest")
 * @param {number|null} userId - Optional user ID to filter posts
 * @returns {Promise<Array>} - Array of Post objects
 */
async function fetchPostsBySortType(contentManager, sortType, userId) {
  const params = userId ? { userID: userId } : {};

  switch (sortType) {
    case "popular":
      return await contentManager.getPopularPosts(params);
    case "foryou":
      // TODO: Implement getForYouPosts() in ContentManager
      return await contentManager.getLatestPosts(params);
    case "latest":
    default:
      return await contentManager.getLatestPosts(params);
  }
}

/**
 * Normalizes sort type for consistent output
 * @param {string} sortType - Raw sort type from query
 * @returns {string} - Normalized sort type
 */
function normalizeSortType(sortType) {
  if (sortType === "popular") return "popular";
  if (sortType === "foryou") return "forYou";
  return "latest";
}

module.exports = getPosts;
