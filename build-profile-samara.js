const fs = require('fs');
const path = require('path');
const img = fs.readFileSync(path.join(__dirname, 'assets', 'samara-gomes-perfil.jpg'));
const b64 = img.toString('base64');
const out = `window.SAMARA_PROFILE_PHOTO="data:image/jpeg;base64,${b64}";
function applySamaraProfile(){document.querySelectorAll("img[data-profile-samara]").forEach(function(el){el.src=window.SAMARA_PROFILE_PHOTO;});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",applySamaraProfile);
else applySamaraProfile();
`;
fs.writeFileSync(path.join(__dirname, 'profile-photo-samara.js'), out);
console.log('OK', out.length, 'bytes');
