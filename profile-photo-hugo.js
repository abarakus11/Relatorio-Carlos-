window.HUGO_PROFILE_PHOTO = 'assets/hugo-legramandi-perfil.png';
function applyHugoProfile() {
  document.querySelectorAll('img[data-profile-hugo]').forEach(function (el) {
    el.src = window.HUGO_PROFILE_PHOTO;
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyHugoProfile);
else applyHugoProfile();
