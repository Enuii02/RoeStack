/**
 * When added as a middleware, this function will block most of app functions that interact with the database.
 */

const BLOCKED = [
  // Comments
  { method: "POST",   pattern: /^\/comments$/ },
  { method: "DELETE", pattern: /^\/comments\/[^/]+$/ },

  // Communities
  { method: "POST",   pattern: /^\/community$/ },
  { method: "POST",   pattern: /^\/edit-community\/[^/]+$/ },
  { method: "DELETE", pattern: /^\/community\/[^/]+$/ },

  // Posts
  { method: "POST",   pattern: /^\/post$/ },
  { method: "POST",   pattern: /^\/edit-post\/[^/]+$/ },
  { method: "DELETE", pattern: /^\/post\/[^/]+$/ },

  // Registration / account
  { method: "POST",   pattern: /^\/register$/ },
  { method: "POST",   pattern: /^\/set-password$/ },
  { method: "POST",   pattern: /^\/delete-account$/ },
];

const DEMO_MESSAGE =
  "Demo mode: this action is disabled on the public demo.";

// Decide whether the request expects a JSON response (AJAX call) or an HTML
// response (a plain <form> submit). AJAX callers can show a banner inline,
// form submits need a redirect because the browser will navigate.
function isAjax(req) {
  if (req.xhr) return true;
  const accept = req.get("accept") || "";
  if (accept.includes("application/json")) return true;
  const requestedWith = req.get("x-requested-with") || "";
  if (requestedWith.toLowerCase() === "xmlhttprequest") return true;
  // fetch() in modern browsers sets Sec-Fetch-Mode: cors for cross-script
  // calls and Sec-Fetch-Dest: empty for fetch (vs. "document" for navigation).
  const fetchDest = req.get("sec-fetch-dest") || "";
  if (fetchDest === "empty") return true;
  return false;
}

module.exports = function demoMode(req, res, next) {
  const blocked = BLOCKED.some(
    (rule) => rule.method === req.method && rule.pattern.test(req.path),
  );
  if (!blocked) return next();

  if (isAjax(req)) {
    return res.status(403).json({ demo: true, error: DEMO_MESSAGE });
  }

  // Form submit: redirect back to where they came from, with ?demo=1
  // so the front-end banner script can show itself.
  const referer = req.get("referer") || "/";
  const separator = referer.includes("?") ? "&" : "?";
  return res.redirect(referer + separator + "demo=1");
};
