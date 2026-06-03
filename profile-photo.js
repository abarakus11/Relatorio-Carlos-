window.PROFILE_PHOTO = 'assets/carlos-eber-perfil.png';
function applyProfile() {
  document.querySelectorAll('img[data-profile]').forEach(function (el) {
    el.src = window.PROFILE_PHOTO;
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyProfile);
else applyProfile();
