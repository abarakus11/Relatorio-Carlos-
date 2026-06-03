window.ROBERTO_PROFILE_PHOTO = 'assets/roberto-hayashi-perfil.png';
function applyRobertoProfile() {
  document.querySelectorAll('img[data-profile-roberto]').forEach(function (el) {
    el.src = window.ROBERTO_PROFILE_PHOTO;
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyRobertoProfile);
else applyRobertoProfile();
