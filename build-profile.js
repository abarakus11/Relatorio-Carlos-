const fs = require('fs');
const path = require('path');
const img = fs.readFileSync(path.join(__dirname, 'assets', 'carlos-eber-perfil.jpg'));
const b64 = img.toString('base64');
const out = `window.PROFILE_PHOTO="data:image/jpeg;base64,${b64}";
function applyProfile(){document.querySelectorAll("img[data-profile]").forEach(function(el){el.src=window.PROFILE_PHOTO;});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",applyProfile);
else applyProfile();
`;
fs.writeFileSync(path.join(__dirname, 'profile-photo.js'), out);
console.log('OK', out.length, 'bytes');
