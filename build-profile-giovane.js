const fs = require('fs');
const path = require('path');
const img = fs.readFileSync(path.join(__dirname, 'assets', 'giovane-oliveira-perfil.jpg'));
const b64 = img.toString('base64');
const out = `window.GIOVANE_PROFILE_PHOTO="data:image/jpeg;base64,${b64}";
function applyGiovaneProfile(){document.querySelectorAll("img[data-profile-giovane]").forEach(function(el){el.src=window.GIOVANE_PROFILE_PHOTO;});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",applyGiovaneProfile);
else applyGiovaneProfile();
`;
fs.writeFileSync(path.join(__dirname, 'profile-photo-giovane.js'), out);
console.log('OK', out.length, 'bytes');
