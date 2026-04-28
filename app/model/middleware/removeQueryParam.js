/**
 * Removes a specific query parameter from a Url
 * @param {string} url - The original URL
 * @param {string} paramName - The query parameter to remove (e.g., 'category')
 * @returns {string} - The URL without the specified parameter
 */

function removeQueryParam(url, paramName) {
    const urlObj = new URL(url, "http://localhost:3000"); // This assumes the base URL is localhost:3000, adjust if needed
    urlObj.searchParams.delete(paramName);
    return urlObj.pathname + urlObj.search;
}

/**
 * Intelligently adds a query parameter, using ? or & as needed
 * @param {string} url - The base URL
 * @param {string} paramName - The parameter name
 * @param {string} paramValue - The parameter value
 * @returns {string} - URL with the new parameter added
 */
function addQueryParam(url, paramName, paramValue) {
    const baseUrl = removeQueryParam(url, paramName); // Remove existing category param
    const separator = baseUrl.includes('?') ? '&' : '?'; // Use ? if no params, & if there are
    return `${baseUrl}${separator}${paramName}=${paramValue}`;
}


// With:
module.exports = removeQueryParam;
module.exports.addQueryParam = addQueryParam;
