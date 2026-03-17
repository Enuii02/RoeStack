/* CATEGORY FILTER */

const categories = document.querySelectorAll(".category-item");
const posts = document.querySelectorAll(".post-card");

function filterPosts(category) {
  posts.forEach((post) => {
    const postCategory = post.dataset.category;

    if (category === "all" || postCategory === category) {
      post.classList.remove("hidden");
    } else {
      post.classList.add("hidden");
    }
  });
}

/* CATEGORY CLICK */

categories.forEach((category) => {
  category.addEventListener("click", () => {
    const selectedCategory = category.dataset.category;

    // remove active
    categories.forEach((c) => c.classList.remove("active"));

    // activate clicked
    category.classList.add("active");

    // filter posts
    filterPosts(selectedCategory);
  });
});

/* DEFAULT STATE */

document.addEventListener("DOMContentLoaded", () => {
  filterPosts("all");
});
