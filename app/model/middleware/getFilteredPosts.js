const ContentManager = require("../classes/ContentManager");

/**
 * Middleware handles the queries and parameters.
 * Depending on the query/parameter it calls the 
 * getPosts method from content manager with the 
 * appropriate options.  
 * 
 * Supported sort types:
 * - "popular": Posts sorted by votes + comments (descending)
 * - "foryou": Personalized posts (default content manager)
 * - "latest": Posts sorted by creation date (newest first, default)
 * - "oldest": latest reversed duh
 * 
 * TODO: Implement filtering functionality and personalized "for you" sorting
 */
async function getFilteredPosts(req, _, next) {
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
   const options = {
    userID: userId ?? -1,
    sortByLatest: false,
    sortByPopularity: false,
    reverse: false
  };

  switch (sortType) {
    case "popular":
      options.sortByPopularity = true;
      break;
    case "foryou":
      options.sortByForYour = true;
    case "oldest":
      options.sortByLatest;
      options.reverse;
    default:
      options.sortByLatest;
      options.reverse;
  }
  return await contentManager.getPosts(options);
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

module.exports = getFilteredPosts;
