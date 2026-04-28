function removeQueryParam(url, paramName) {
    const urlObj = new URL(url, "http://localhost:3000"); // This assumes the base URL is localhost:3000, adjust if needed
    urlObj.searchParams.delete(paramName);
    return urlObj.pathname + urlObj.search;
}

function addQueryParam(url, paramName, paramValue) {
    const baseUrl = removeQueryParam(url, paramName); // Remove existing category param
    const separator = baseUrl.includes('?') ? '&' : '?'; // Use ? if no params, & if there are
    return `${baseUrl}${separator}${paramName}=${paramValue}`;
}

const searchButton = document.querySelector(".search-button")
const searchInput = document.getElementById("searchInput")


searchButton.addEventListener('click', (e)=> {
    e.preventDefault();
    if (searchInput.value === ''){
        return
    }
    window.location.href = addQueryParam(window.location.href, "search", searchInput.value);
})