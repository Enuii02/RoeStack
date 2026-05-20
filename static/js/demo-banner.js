(function () {
  function showBanner() {
    const banner = document.getElementById("demo-banner");
    if (banner) banner.removeAttribute("hidden");
  }

  function stripDemoParam() {
    if (!window.history || !window.history.replaceState) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("demo")) return;
    url.searchParams.delete("demo");
    const newSearch = url.searchParams.toString();
    const newUrl =
      url.pathname + (newSearch ? "?" + newSearch : "") + url.hash;
    window.history.replaceState({}, "", newUrl);
  }

  if (new URLSearchParams(window.location.search).has("demo")) {
    showBanner();
    stripDemoParam();
  }

  // Intercept fetch responses that come back with { demo: true }
  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = function (...args) {
      return originalFetch.apply(this, args).then((response) => {
        const cloned = response.clone();
        const contentType = cloned.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          cloned
            .json()
            .then((data) => {
              if (data && data.demo) showBanner();
            })
            .catch(() => {});
        }
        return response;
      });
    };
  }

  // Intercept legacy XMLHttpRequest calls too
  const OriginalXHR = window.XMLHttpRequest;
  if (OriginalXHR) {
    const originalSend = OriginalXHR.prototype.send;
    OriginalXHR.prototype.send = function (...args) {
      this.addEventListener("load", function () {
        const contentType = this.getResponseHeader("content-type") || "";
        if (!contentType.includes("application/json")) return;
        try {
          const data = JSON.parse(this.responseText);
          if (data && data.demo) showBanner();
        } catch (_) {}
      });
      return originalSend.apply(this, args);
    };
  }
})();
