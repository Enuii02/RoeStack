const ContentManager = require("../classes/ContentManager");

/**
 * Middleware that handles post sorting based on query parameters
 * Attaches the sorted content to req.sortedContent and activeSort to req.activeSort
 * It also allows to fetch data for specific users or communities
 * 
 * Supported sort types:
 * - "popular": Get posts sorted by votes + comments (descending)
 * - "foryou": Get posts with default content manager (TODO: implement custom for you algorithm)
 * - "latest" (default): Get posts sorted by creation date (newest first)
 */
async function sortingMiddleware(req, res, next) {
  try {
    const { sortby } = req.query;
    const contentManager = new ContentManager();
    let content;
    let activeSort = "latest";

    if (sortby === "popular") {
      content = await contentManager.update({ getPopularPosts: true });
      activeSort = "popular";
    } else if (sortby === "foryou") {
      // TODO: create getForYouPosts in content manager
      content = await contentManager.update();
      activeSort = "forYou";
    } else {
      content = await contentManager.update({ getLatestPosts: true });
      activeSort = "latest";
    }

    // Attach the sorted content and active sort to the request object
    req.sortedContent = content;
    req.activeSort = activeSort;

    next();
  } catch (error) {
    console.error("Error in sorting middleware:", error);
    next(error);
  }
}

module.exports = sortingMiddleware;
