function toggleMenu(button) {
    const menu = button.nextElementSibling;
    menu.classList.toggle("show");
}

document.addEventListener("click", function (e) {
  document.querySelectorAll(".dropdown-menu.show").forEach(menu => {
    if (!menu.parentElement.contains(e.target)) {
      menu.classList.remove("show");
    }
  });
});
