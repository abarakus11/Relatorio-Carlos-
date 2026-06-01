const fs = require('fs');
const path = require('path');
const img = fs.readFileSync(path.join(__dirname, 'assets', 'emilly-dantas-perfil.png'));
const b64 = img.toString('base64');
const out = `window.EMILLY_PROFILE_PHOTO="data:image/png;base64,${b64}";
function applyEmillyProfile(){document.querySelectorAll("img[data-profile-emilly]").forEach(function(el){el.src=window.EMILLY_PROFILE_PHOTO;});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",applyEmillyProfile);
else applyEmillyProfile();
`;
fs.writeFileSync(path.join(__dirname, 'profile-photo-emilly.js'), out);
console.log('OK', out.length, 'bytes');
