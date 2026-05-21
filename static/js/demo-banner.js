// Public API: call showDemoBanner(message) from anywhere to display the banner.
function showDemoBanner(message) {
  const banner = document.getElementById("demo-banner");
  if (!banner) return;
  if (message) {
    const messageEl = document.getElementById("demo-banner-message");
    if (messageEl) messageEl.textContent = message;
  }
  banner.removeAttribute("hidden");
}

function hideDemoBanner() {
  const banner = document.getElementById("demo-banner");
  if (banner) banner.setAttribute("hidden", "");
}

// On page load: if the server redirected us with ?demo=1, show the banner
// and strip the query param so a refresh doesn't keep re-triggering it.
(function () {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("demo")) return;
  showDemoBanner();
  if (window.history && window.history.replaceState) {
    params.delete("demo");
    const newSearch = params.toString();
    const newUrl =
      window.location.pathname +
      (newSearch ? "?" + newSearch : "") +
      window.location.hash;
    window.history.replaceState({}, "", newUrl);
  }
})();
