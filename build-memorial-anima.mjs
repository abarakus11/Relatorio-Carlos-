import fs from 'fs';
import path from 'path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const srcDocx = 'C:/Users/FIC/Downloads/MEMORIAL DESCRITIVO BANHEIROS ANIMA.docx';
const xmlPath = path.join(root, '_marina_memorial_docx/word/document.xml');

if (!fs.existsSync(xmlPath)) {
  const zip = path.join(root, '_memorial.zip');
  fs.copyFileSync(srcDocx, zip);
  // unzip via powershell in build - assume already extracted
}

const xml = fs.readFileSync(xmlPath, 'utf8');
const paras = xml.split(/<w:p[\s>]/).slice(1).map((chunk) => {
  const texts = [...chunk.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]);
  return texts.join('').replace(/\s+/g, ' ').trim();
}).filter(Boolean);

const sections = [];
let current = null;

function flush() {
  if (current) sections.push(current);
  current = null;
}

for (const p of paras) {
  const isHeading = /^\d{1,2}\.\s+[A-ZÁÉÍÓÚÃÕÇ]/.test(p) || /^1[0-6]\.\s/.test(p);
  const isSub = /^\d+\.\d+\s/.test(p);
  if (isHeading && !isSub) {
    flush();
    current = { title: p, paragraphs: [], items: [] };
    continue;
  }
  if (!current) {
    if (p.includes('MEMORIAL DESCRITIVO') || p.includes('Reforma de Banheiro')) continue;
    if (!sections.length && !current) {
      current = { title: 'Introdução', paragraphs: [], items: [] };
    }
  }
  if (!current) continue;
  if (p.length < 120 && !p.endsWith('.') && !isSub) {
    current.items.push(p);
  } else {
    current.paragraphs.push(p);
  }
}

flush();

const out = {
  title: 'Memorial Descritivo — Reforma de Banheiros ANIMA',
  subtitle: 'ANIMA Wellness Club · Infraestrutura & Facilities',
  sourceFile: 'MEMORIAL DESCRITIVO BANHEIROS ANIMA.docx',
  sections: sections.map((s) => ({
    title: s.title,
    body:
      s.paragraphs.map((t) => `<p>${escapeHtml(t)}</p>`).join('') +
      (s.items.length
        ? `<ul class="an-list">${s.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
        : ''),
  })),
};

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.copyFileSync(srcDocx, path.join(root, 'assets/MEMORIAL-DESCRITIVO-BANHEIROS-ANIMA.docx'));
fs.writeFileSync(path.join(root, 'memorial-anima-data.json'), JSON.stringify(out, null, 2));
console.log('sections', out.sections.length, 'paragraphs total', paras.length);
