const BLOCKED = [
  { method: "POST",   pattern: /^\/post$/ },
  { method: "POST",   pattern: /^\/edit-post\/[^/]+$/ },
  { method: "DELETE", pattern: /^\/post\/[^/]+$/ },
  { method: "POST",   pattern: /^\/comments$/ },
  { method: "DELETE", pattern: /^\/comments\/[^/]+$/ },
];

function isAjax(req) {
  if (req.xhr) return true;
  const accept = req.get("accept") || "";
  if (accept.includes("application/json")) return true;
  const requestedWith = req.get("x-requested-with") || "";
  return requestedWith.toLowerCase() === "xmlhttprequest";
}

function demoMode(req, res, next) {
  const blocked = BLOCKED.some(
    (rule) => rule.method === req.method && rule.pattern.test(req.path),
  );
  if (!blocked) return next();

  if (isAjax(req)) {
    return res.status(200).json({
      demo: true,
      message:
        "This is a public demo. Creating, editing, or deleting content is disabled.",
    });
  }

  const referer = req.get("referer");
  const back = referer || "/";
  const separator = back.includes("?") ? "&" : "?";
  return res.redirect(back + separator + "demo=1");
}

module.exports = demoMode;
