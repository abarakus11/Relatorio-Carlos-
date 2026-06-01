const fs = require('fs');
const path = require('path');
const img = fs.readFileSync(path.join(__dirname, 'assets', 'marina-rodrigues-perfil.png'));
const b64 = img.toString('base64');
const out = `window.MARINA_PROFILE_PHOTO="data:image/png;base64,${b64}";
function applyMarinaProfile(){document.querySelectorAll("img[data-profile-marina]").forEach(function(el){el.src=window.MARINA_PROFILE_PHOTO;});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",applyMarinaProfile);
else applyMarinaProfile();
`;
fs.writeFileSync(path.join(__dirname, 'profile-photo-marina.js'), out);
console.log('OK', out.length, 'bytes');
