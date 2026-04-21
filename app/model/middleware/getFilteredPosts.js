const ContentManager = require("../classes/contentManager");

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
 *  */
async function getFilteredPosts(req, _, next) {
  if (req.session.user) {
  
    try {
      const contentManager = new ContentManager(req.session);
      const sortType = req.query.sortby || "latest";
      let userId = req.params.id;
      let communityId = parseInt(req.params.communityId) || -1;
      
      if (userId === "me") {
        userId = req.session.uid;
      } else {
        userId = req.params.id || -1;
      }

      const posts = await fetchPostsBySortType(contentManager, sortType, userId, req.session.uid, communityId);

      req.sortedFilteredPosts = posts;
      req.activeSort = normalizeSortType(sortType);

      next();
    } catch (error) {
      console.error("Error in sorting middleware:", error);
      next(error);
    }
  } else {
    next();
  }
}

/**
 * Fetches posts based on the specified sort type and optional user ID
 * @param {ContentManager} contentManager - Content manager instance
 * @param {string} sortType - Type of sorting ("popular", "foryou", or "latest")
 * @param {number|null} userId - Optional user ID to filter posts
 * @returns {Promise<Array>} - Array of Post objects
 */
async function fetchPostsBySortType(contentManager, sortType, userId = -1, sessionUserID, communityId = -1) {
   const options = {
    userID: userId,
    communityID: communityId,
    sortByLatest: false,
    sortByPopularity: false,
    reverse: false
  };

  switch (sortType) {
    case "popular":
      options.sortByPopularity = true;
      break;
    case "foryou":
      options.sortByForYou = true;
      options.userID = sessionUserID || -1;
      break;
    case "oldest":
      options.sortByLatest = true;
      options.reverse = true;
      break;
    default:
      options.sortByLatest = true;
      options.reverse = false;
  }
  // console.log(options)
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
  if (sortType === "oldest") return "oldest";
  return "latest";
}

module.exports = getFilteredPosts;
