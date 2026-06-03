window.PAULO_PROFILE_PHOTO = 'assets/paulo-robson-perfil.png';
function applyPauloProfile() {
  document.querySelectorAll('img[data-profile="paulo"]').forEach(function (el) {
    el.src = window.PAULO_PROFILE_PHOTO;
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyPauloProfile);
else applyPauloProfile();
