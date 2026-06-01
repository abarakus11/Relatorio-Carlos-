const fs = require('fs');
const path = require('path');
const img = fs.readFileSync(path.join(__dirname, 'assets', 'gabriel-viana-perfil.png'));
const b64 = img.toString('base64');
const out = `window.GABRIEL_PROFILE_PHOTO="data:image/png;base64,${b64}";
function applyGabrielProfile(){document.querySelectorAll("img[data-profile-gabriel]").forEach(function(el){el.src=window.GABRIEL_PROFILE_PHOTO;});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",applyGabrielProfile);
else applyGabrielProfile();
`;
fs.writeFileSync(path.join(__dirname, 'profile-photo-gabriel.js'), out);
console.log('OK', out.length, 'bytes');
