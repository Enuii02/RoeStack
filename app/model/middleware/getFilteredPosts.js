const ContentManager = require("../classes/contentManager");
const log = require("../../utils").log;

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
 * Additionally, if a category query parameter is provided, it filters the sorted posts by the specified category.
 * If no posts match the category filter, it falls back to displaying all sorted posts and logs a message.
 * 
 * The resulting sorted and filtered posts are attached to the request object as req.sortedFilteredPosts for use in subsequent middleware or route handlers.
 *  */
async function getFilteredPosts(req, _, next) {
  if (req.session.user) {
  
    try {
      const contentManager = new ContentManager(req.session);
      const sortType = req.query.sortby || "latest";
      const category = req.query.category;
      const search = req.query.search || "";
      
      // Default values
      let userId = -1;
      let communityId = -1;

      // Logic to handle the ":id" parameter based on the URL path
      if (req.params.id) {
        if (req.path.includes('/community/')) {
          // If the URL has 'community', the :id is a communityId
          communityId = parseInt(req.params.id);
        } else {
          // Otherwise, it's a userId (handle "me" alias)
          userId = req.params.id === "me" ? req.session.uid : req.params.id;
        }
      }

      const posts = await fetchPostsBySortType(
        contentManager,
        sortType,
        userId,
        req.session.uid,
        communityId,
        search);

      // If category filter is applied, filter the sorted posts by the specified category
      if (category) {
        const filteredPosts = posts.filter(post => post.category === category);
        if (filteredPosts.length === 0) {
          req.sortedFilteredPosts = [];
          log("No posts found for the selected category. Displaying all posts.");
        } else {
            req.sortedFilteredPosts = filteredPosts;
          }

      // If category filter is not applied, use the sorted posts as is
      } else {
        req.sortedFilteredPosts = posts;
      }
      
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
async function fetchPostsBySortType(contentManager, sortType, userId = -1, sessionUserID, communityId = -1, search = '') {
   const options = {
    userID: userId,
    communityID: communityId,
    sortByLatest: false,
    sortByPopularity: false,
    reverse: false,
    search : search
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

function clearUserImageCache(req, _, next) {
    const id = req.params.id === "me" ? req.session.uid : req.params.id;
    if (id) {
        const contentManager = new ContentManager(req.session);
        const key = `user_${id}`;
        if (contentManager.imagePathCache?.[key]) {
            delete contentManager.imagePathCache[key];
            log(`ContentManager - Cleared cache for ${key}`);
        }
    }
    next();
}

module.exports = getFilteredPosts;
module.exports.clearUserImageCache = clearUserImageCache;