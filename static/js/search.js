// =============Search bar=============

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
    window.location.href = addQueryParam(window.location.origin + "/search", "search", searchInput.value);
})

// ===============Search page==============

if (window.location.pathname === "/search") {
    
const posts = document.querySelectorAll(".posts .post-box");
const btnPost = document.getElementById("load-more-posts");
const btnCommunity = document.getElementById("load-more-communities");
const communities = document.querySelectorAll(".communities .community-card")
const PAGE_SIZE = 3;
let shown = PAGE_SIZE;

// hide everything past the first 5
posts.forEach((post, i) => {
    if (i >= PAGE_SIZE) post.style.display = "none";
});

if (posts.length <= PAGE_SIZE) btnPost.style.display = "none";

btnPost.addEventListener("click", () => {
    const next = shown + PAGE_SIZE;
    posts.forEach((post, i) => {
        if (i >= shown && i < next) post.style.display = "";
    });
    shown = next;
    if (shown >= posts.length) btn.style.display = "none";
});

communities.forEach((c, i) => {
    if (i >= PAGE_SIZE) c.style.display = "none";
})

if (communities.length <= PAGE_SIZE) btnCommunity.style.display = "none";


btnCommunity.addEventListener("click", () => {
    const next = shown + PAGE_SIZE;
    communities.forEach((c, i) => {
        if (i >= shown && i < next) c.style.display = "";
    });
    shown = next;
    if (shown >= posts.length) btn.style.display = "none";
});

}

