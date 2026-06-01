import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const dataPath = path.join(root, 'emilly-data.js');
let src = fs.readFileSync(dataPath, 'utf8');

const MONTH = { '01': 'jan', '02': 'fev', '03': 'mar', '04': 'abr', '05': 'mai', '06': 'jun', '07': 'jul', '08': 'ago', '09': 'set', '10': 'out', '11': 'nov', '12': 'dez' };
const CO = { administracao: 'ADMIN', financeiro: 'FINANCEIRO', marketing: 'MARKETING', juridico: 'JURIDICO' };

src = src.replace(
  /\/\* Dados — Emilly Dantas · RSA Dashboard 2026 · FIC Capital Group \(1º semestre\) \*\//,
  '/* Dados — Emilly Dantas · Relatorio_Claude.pdf / RSA Dashboard 2026 · 1º semestre */'
);

// Inject co/mon into each task line
src = src.replace(
  /\{ name: '([^']+)', cat: '(\w+)', area: '([^']+)', pri: '(\w+)', status: '(\w+)', dt: '([^']+)' \}/g,
  (m, name, cat, area, pri, status, dt) => {
    const mm = dt.split('/')[1] || '01';
    const mon = (MONTH[mm] || 'jan') + '26';
    const co = CO[cat] || area.toUpperCase().slice(0, 12);
    let priOut = pri;
    if (status === 'standby') priOut = 'standby';
    else if (status === 'andamento') priOut = 'andamento';
    else if (status === 'afazer') priOut = 'standby';
    else if (status === 'atrasada') priOut = 'urgente';
    else if (pri === 'prioridade') priOut = 'prioridade';
    return `{ name: '${name}', cat: '${cat}', area: '${area}', pri: '${priOut}', status: '${status}', co: '${co}', mon: '${mon}', dt: '${dt}' }`;
  }
);

fs.writeFileSync(dataPath, src, 'utf8');
console.log('Enriched emilly-data.js tasks');
