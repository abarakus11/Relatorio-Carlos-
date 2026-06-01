(function () {
  'use strict';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
    '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#9d6fff"/><stop offset="100%" stop-color="#ff5fa0"/></linearGradient></defs>' +
    '<rect width="200" height="200" fill="#0d1526"/>' +
    '<circle cx="100" cy="100" r="72" fill="url(#g)" opacity=".35"/>' +
    '<text x="100" y="112" text-anchor="middle" font-family="system-ui,sans-serif" font-size="48" font-weight="600" fill="#f0f4ff">GV</text>' +
    '</svg>';
  window.GABRIEL_PROFILE_PHOTO = 'data:image/svg+xml,' + encodeURIComponent(svg);
  function apply() {
    document.querySelectorAll('img[data-profile-gabriel]').forEach(function (el) {
      el.src = window.GABRIEL_PROFILE_PHOTO;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
