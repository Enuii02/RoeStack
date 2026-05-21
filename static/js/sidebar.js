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

  /* HAMBURGER TOGGLE (mobile) */
  const MOBILE_BREAKPOINT = 600;
  const toggles = document.querySelectorAll(".sidebar-toggle");

  const setCollapsed = (card, collapsed) => {
    const btn = card.querySelector(".sidebar-toggle");
    card.classList.toggle("collapsed", collapsed);
    if (btn) {
      btn.classList.toggle("open", !collapsed);
      btn.setAttribute("aria-expanded", String(!collapsed));
    }
  };

  const applyDefault = () => {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    document.querySelectorAll(".sidebar-card").forEach((card) => {
      setCollapsed(card, isMobile);
    });
  };

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".sidebar-card");
      if (!card) return;
      setCollapsed(card, !card.classList.contains("collapsed"));
    });
  });

  applyDefault();
  window.addEventListener("resize", applyDefault);
});
