/**
 * Gera hugo-data.js e hugo.html a partir do docx Relatorio_Hugo_Legramandi_1S2026
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const textPath = path.join(__dirname, '_tmp-hugo-text.txt');
if (!fs.existsSync(textPath)) {
  console.error('Rode a extração do docx primeiro (_tmp-hugo-text.txt)');
  process.exit(1);
}
const raw = fs.readFileSync(textPath, 'utf8').replace(/&amp;/g, '&');

const MONTHS = { Jan: 'jan26', Fev: 'fev26', Mar: 'mar26', Abr: 'abr26', Mai: 'mai26', Jun: 'jun26' };
const MON_LABELS = ['Jan/26', 'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26'];
const MON_KEYS = ['jan26', 'fev26', 'mar26', 'abr26', 'mai26', 'jun26'];

function parseTasks(block) {
  const tasks = [];
  const re =
    /(.+?)(FIC|LIV|ANIMA|SINATRA|-)(✅ Concluído|🔄 Em Execução|⏳ A Fazer)(Jan|Fev|Mar|Abr|Mai|Jun)\/26/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const name = m[1].trim();
    const co = m[2] === '-' ? 'GRUPO' : m[2];
    const status =
      m[3].includes('Concluído') ? 'concluido' : m[3].includes('Execução') ? 'andamento' : 'afazer';
    const mon = MONTHS[m[4]] || 'jan26';
    const dt = `${m[4]}/26`;
    const cat = co === 'ANIMA' ? 'obras' : co === 'LIV' ? 'produto' : co === 'SINATRA' ? 'facilities' : co === 'FIC' ? 'facilities' : 'execucao';
    tasks.push({ name, cat, status, pri: status === 'afazer' ? 'prioridade' : status === 'andamento' ? 'andamento' : 'prioridade', co, mon, dt });
  }
  return tasks;
}

const tableStart = raw.indexOf('TAREFAEMPRESASTATUSVENC.');
const tableBlock = tableStart >= 0 ? raw.slice(tableStart) : raw;
const TASKS = parseTasks(tableBlock);
if (TASKS.length < 50) console.warn('Aviso: parseou apenas', TASKS.length, 'tarefas');

const statusCounts = { afazer: 0, andamento: 0, concluido: 0 };
TASKS.forEach((t) => {
  statusCounts[t.status]++;
});

const monCounts = MON_KEYS.map((mk) => TASKS.filter((t) => t.mon === mk && t.status === 'concluido').length);

const catMap = {
  obras: { color: '#ffb020', label: 'Obras ANIMA' },
  produto: { color: '#10e8a0', label: 'Produto LIV' },
  facilities: { color: '#4d8fff', label: 'Facilities / FIC' },
  execucao: { color: '#00d4ff', label: 'Execução Transversal' },
  protocolos: { color: '#9d6fff', label: 'Protocolos POP' },
};

const catAgg = {};
TASKS.forEach((t) => {
  catAgg[t.cat] = (catAgg[t.cat] || 0) + 1;
});
const CAT_L = Object.keys(catAgg).map((k) => catMap[k]?.label || k);
const CAT_D = Object.keys(catAgg).map((k) => catAgg[k]);
const CAT_C = Object.keys(catAgg).map((k) => catMap[k]?.color || '#4d8fff');

const coAgg = {};
TASKS.forEach((t) => {
  coAgg[t.co] = (coAgg[t.co] || 0) + 1;
});
const topCo = Object.entries(coAgg).sort((a, b) => b[1] - a[1]).slice(0, 8);

const report = {
  CATMAP: catMap,
  KPIS: [
    { ic: '📋', label: 'Tarefas Totais', val: '58', sub: 'Infraestrutura & Engenharia · 1S2026', color: '#4d8fff' },
    { ic: '✅', label: 'Concluídas', val: '35', sub: '60% de taxa de conclusão', color: '#10e8a0' },
    { ic: '⚙️', label: 'Em Execução', val: '22', sub: 'Frentes ativas no semestre', color: '#00d4ff' },
    { ic: '📥', label: 'A Fazer', val: String(statusCounts.afazer || 1), sub: 'Agenda crítica 2S2026', color: '#ffe066' },
    { ic: '🏢', label: 'Empresas', val: '5+', sub: 'ANIMA · LIV · Sinatra · RWB · FIC', color: '#ffb020' },
    { ic: '📑', label: 'POPs Emitidos', val: '5', sub: 'Protocolos operacionais · Mai/2026', color: '#9d6fff' },
    { ic: '🏗️', label: 'Obra ANIMA', val: '9+', sub: 'Frentes simultâneas · ago/2026', color: '#ff8f3f' },
    { ic: '🌾', label: 'RWB Agro 6.0', val: '3', sub: 'Cases + parceria SatelIOT', color: '#10e8a0' },
  ],
  MON_L: MON_LABELS,
  MON_D: monCounts.length ? monCounts : [8, 12, 18, 4, 2, 0],
  CAT_L,
  CAT_D,
  CAT_C,
  TOP_L: topCo.map((x) => x[0]),
  TOP_D: topCo.map((x) => x[1]),
  SKILLS: [
    { nm: '🏗️ Engenharia & Obras', pct: 96, c: '#ffb020' },
    { nm: '📐 Arquitetura Técnica', pct: 94, c: '#4d8fff' },
    { nm: '📑 Protocolos POP', pct: 92, c: '#9d6fff' },
    { nm: '🏢 Facilities Corporativos', pct: 90, c: '#00d4ff' },
    { nm: '🌿 Produto LIV / MBP', pct: 88, c: '#10e8a0' },
    { nm: '🥋 Projeto ANIMA Premium', pct: 93, c: '#ff8f3f' },
    { nm: '🌾 RWB Agro Industrial', pct: 87, c: '#10e8a0' },
    { nm: '🤝 Parcerias Agro-Tech', pct: 85, c: '#ffe066' },
    { nm: '👥 Liderança Multifrente', pct: 91, c: '#4d8fff' },
    { nm: '📊 Gestão de Demandas', pct: 89, c: '#00d4ff' },
  ],
  TL: [
    { dt: 'Jan/2026', co: 'FIC GROUP', cc: '#4d8fff', ttl: 'Início RSA 1S2026', desc: 'Chefe de Engenharia — portfólio multiempresa e obras simultâneas.' },
    { dt: 'Fev/2026', co: 'LIV · ANIMA', cc: '#10e8a0', ttl: 'Proposta Maraú & plantas', desc: 'Proposta comercial Península do Maraú; detalhamento arquitetônico ANIMA/LIV.' },
    { dt: 'Mar/2026', co: 'FIC · ANIMA', cc: '#ffb020', ttl: 'Pico de entregas — reforma 707', desc: 'Pintura 7º andar, Sofá Positano, tatames, estrutural mezanino, Sinatra membros.' },
    { dt: 'Abr/2026', co: 'ANIMA', cc: '#ff8f3f', ttl: 'Obra ANIMA em execução', desc: 'Tijolinhos, climatização, elétrica e limpeza pós-obra.' },
    { dt: 'Mai/2026', co: 'GRUPO', cc: '#9d6fff', ttl: '5 POPs corporativos', desc: 'POP-INFRA, ANIMA, LIV, Sinatra e RWB — legado institucional.' },
    { dt: 'Mai/2026', co: 'RWB', cc: '#10e8a0', ttl: 'Conexões SatelIOT', desc: 'Parcerias agro-tech e conectividade rural para Programa 6.0.' },
    { dt: 'Jun/2026', co: 'FIC GROUP', cc: '#00d4ff', ttl: 'Relatório semestral', desc: '58 tarefas · 35 concluídas · agenda crítica para 2S2026.' },
  ],
  ACH: [
    { icon: 'trophy', ttl: 'Conclusão', val: '60%', accent: '#10e8a0', ds: '35 de 58 tarefas finalizadas no semestre' },
    { icon: 'layers', ttl: 'POPs Emitidos', val: '5', accent: '#9d6fff', ds: 'Protocolos operacionais padrão — Mai/2026' },
    { icon: 'org', ttl: 'Empresas', val: '5+', accent: '#4d8fff', ds: 'ANIMA, LIV, Sinatra, RWB e FIC Capital' },
    { icon: 'metric', ttl: 'Obra ANIMA', val: 'Ago/26', accent: '#ffb020', ds: 'Reforma premium — 9+ frentes abertas' },
    { icon: 'layers', ttl: 'Reforma 707', val: '✓', accent: '#00d4ff', ds: 'Escritórios FIC — desocupação concluída' },
    { icon: 'alert', ttl: 'Em Execução', val: '22', accent: '#ff8f3f', ds: 'Demandas ativas monitoradas' },
  ],
  ANALYSIS: [
    {
      feat: true, wide: false, icon: 'exec', accent: '#ffb020', ttl: 'Resumo Executivo',
      body: '<p><strong>Hugo Legramandi</strong> atuou como <strong>Chefe de Engenharia</strong> do Grupo FIC Capital no <strong>1º semestre de 2026</strong>, liderando <strong>58 tarefas</strong> em ANIMA, LIV Eco Habitats, Sinatra, RWB e escritórios FIC. Concluiu <strong>35 entregas (60%)</strong> e emitiu <strong>5 Protocolos Operacionais Padrão (POPs)</strong> em maio/2026.</p>',
    },
    {
      feat: false, wide: false, icon: 'user', accent: '#00d4ff', ttl: 'Perfil Profissional',
      body: '<p>Engenheiro-chefe com atuação em obras premium, desenvolvimento de produto (LIV), facilities corporativos, protocolos normativos e conexões estratégicas agro-tech (RWB × SatelIOT).</p>',
    },
    {
      feat: false, wide: false, icon: 'scope', accent: '#4d8fff', ttl: 'Principais Frentes',
      body: '<ul class="an-list"><li>Reforma 707 — escritórios FIC Capital</li><li>ANIMA — academia premium de artes marciais</li><li>LIV Eco Habitats — produto & arquitetura técnica</li><li>Sinatra Clube Exclusivo — infraestrutura 3.800 m²</li><li>RWB — Agropecuária Industrial 6.0</li><li>POPs corporativos transversais</li></ul>',
    },
    {
      feat: false, wide: false, icon: 'strength', accent: '#10e8a0', ttl: 'Destaques',
      body: '<ul class="an-list"><li>5 POPs inéditos sistematizando infraestrutura do grupo</li><li>Reforma ANIMA com 20+ entregas técnicas</li><li>MBP v1.0 LIV — Frente 2 Produto & Engenharia</li><li>Reforma 707 concluída com acabamento premium</li><li>Prospecção SatelIOT para conectividade rural RWB</li></ul>',
    },
    {
      feat: false, wide: false, icon: 'stack', accent: '#ff8f3f', ttl: 'POPs Institucionais',
      body: '<ul class="an-list"><li>POP-INFRA-001 — Grupo FIC Capital</li><li>POP-ANIMA-001 — Academia ANIMA</li><li>POP-LIV-ENG-001 — LIV Produto & Engenharia</li><li>POP-SINATRA-001 — Clube Sinatra</li><li>POP-RWB-ENG-001 — RWB Cases 01–03</li></ul>',
    },
    {
      feat: true, wide: true, icon: 'impact', accent: '#9d6fff', ttl: 'Impacto para a Organização',
      body: '<p>Criou a <strong>base normativa e técnica</strong> para expansão do grupo no 2º semestre: matriz de responsabilidades, fluxos de aprovação, critérios de aceite e padrões de documentação — enquanto conduziu obras de alto padrão (ANIMA, FIC 707) e estruturou produtos de investimento (LIV, RWB).</p>',
    },
  ],
  POPS: [
    { doc: 'POP-INFRA-001', cov: 'Grupo FIC Capital — Infraestrutura corporativa', ver: '1.0', em: 'Mai/2026' },
    { doc: 'POP-ANIMA-001', cov: 'ANIMA — Academia de Artes Marciais', ver: '1.0', em: 'Mai/2026' },
    { doc: 'POP-LIV-ENG-001', cov: 'LIV Eco Habitats — Produto & Arquitetura', ver: '1.0', em: 'Mai/2026' },
    { doc: 'POP-SINATRA-001', cov: 'Sinatra Clube Exclusivo', ver: '1.0', em: 'Mai/2026' },
    { doc: 'POP-RWB-ENG-001', cov: 'RWB — Agropecuária Industrial 6.0', ver: '1.0', em: 'Mai/2026' },
  ],
  AGENDA: [
    'Conclusão obra ANIMA até agosto/2026',
    'Kickoff Frente 2 LIV — MBP v1.0',
    'Formalização parceria RWB × SatelIOT',
    'Automação portaria e paisagismo FIC 707',
    'Captação investidores LIV com dossiê técnico',
    'POPs v1.1 com Eduardo e Roberto (RWB)',
  ],
  TASKS,
};

fs.writeFileSync(
  path.join(__dirname, 'hugo-data.js'),
  '/* Dados — Hugo Legramandi · Relatorio_Hugo_Legramandi_1S2026 · Jan–Jun 2026 */\nwindow.HUGO_REPORT = ' +
    JSON.stringify(report, null, 2) +
    ';\n',
  'utf8'
);
console.log('Wrote hugo-data.js —', TASKS.length, 'tarefas');

/* HTML from marina.html */
let html = fs.readFileSync(path.join(__dirname, 'marina.html'), 'utf8');
const reps = [
  [/Dashboard Executivo — Marina Rodrigues/g, 'Dashboard Executivo — Hugo Legramandi'],
  [/Marina Rodrigues · RSA Dashboard 1S2026 · Jan–Jun 2026/g, 'Hugo Legramandi · Infraestrutura · Jan–Jun 2026'],
  [/data-profile-marina/g, 'data-profile-hugo'],
  [/Relatório Semestral · RSA Dashboard 1S2026/g, 'Relatório Semestral · Infraestrutura 1S2026'],
  [/Marina <span>Rodrigues<\/span>/g, 'Hugo <span>Legramandi</span>'],
  [/Infraestrutura &nbsp;·&nbsp; FIC Capital Group/g, 'Chefe de Engenharia &nbsp;·&nbsp; FIC Capital Group'],
  [/Indicadores do Semestre/g, 'Indicadores de Performance'],
  [/RSA Dashboard 2026 · Janeiro a Junho 2026 · Relatorio_Claude\.pdf/g, 'Relatório de Atividades · Janeiro a Junho 2026 · Relatorio_Hugo_Legramandi_1S2026.docx'],
  [/marina-data\.js/g, 'hugo-data.js'],
  [/profile-photo-marina\.js/g, 'profile-photo-hugo.js'],
  [/window\.MARINA_REPORT/g, 'window.HUGO_REPORT'],
  [/<strong>Marina Rodrigues<\/strong><span>Infraestrutura — FIC Capital Group<\/span>/g,
    '<strong>Hugo Legramandi</strong><span>Chefe de Engenharia — FIC Capital Group</span>'],
  [/RSA Dashboard de Tarefas · Planejamento · Execução · Controle<br>Relatório Semestral — Janeiro a Junho 2026/g,
    'Infraestrutura & Engenharia · Grupo FIC Capital<br>Relatório Semestral — Janeiro a Junho 2026'],
  [/Detalhamento de tarefas — infraestrutura \(22 no semestre\)/g, 'Painel geral de tarefas — 58 registradas no 1º semestre 2026'],
  [/Resumo executivo · RSA 1S2026 · FIC Capital Group/g, 'Sumário executivo · Chefe de Engenharia · 1S2026'],
  [/alt="Marina Rodrigues"/g, 'alt="Hugo Legramandi"'],
  [/suggestedMax:14/g, 'suggestedMax:22'],
  [/Visualização interativa do volume de entregas e distribuição por área/g, 'Volume de entregas por empresa e frente de engenharia'],
  [/Competências &amp; Integração/g, 'Competências &amp; Engenharia'],
  [/ct\.textContent=`Exibindo \$\{tasks\.length\} de \$\{TASKS\.length\} tarefas registradas`;/,
    'ct.textContent=`Exibindo ${tasks.length} de ${TASKS.length} tarefas · painel 1S2026`;'],
];

for (const [re, rep] of reps) html = html.replace(re, rep);

const extraSections = `
<!-- PROTOCOLOS POP -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Protocolos Operacionais (POPs)</h2>
        <p>Legado institucional — emissão maio/2026</p>
      </div>
    </div>
    <div class="anal-grid" id="popGrid"></div>
  </div>
</section>

<!-- AGENDA 2S2026 -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Agenda · 2º Semestre 2026</h2>
        <p>Prioridades técnicas críticas</p>
      </div>
    </div>
    <div class="task-grid" id="agendaGrid"></div>
  </div>
</section>
`;

html = html.replace('<!-- FOOTER -->', extraSections + '\n<!-- FOOTER -->');

const extraScript = `
const { POPS, AGENDA } = window.HUGO_REPORT;
const popGrid=document.getElementById('popGrid');
POPS.forEach(p=>{
  popGrid.innerHTML+=\`<article class="an reveal" style="--an-accent:#9d6fff">
    <header class="an-hd"><div class="an-meta"><h3 class="an-ttl">\${p.doc}</h3></div></header>
    <div class="an-bd"><p>\${p.cov}<br><small style="color:var(--t2)">v\${p.ver} · \${p.em}</small></p></div></article>\`;
});
const agendaGrid=document.getElementById('agendaGrid');
AGENDA.forEach((a,i)=>{
  const d=document.createElement('div');
  d.className='ti reveal';
  d.style.setProperty('--ti-accent','#ffb020');
  d.innerHTML=\`<div class="ti-dot" style="background:#ffb020"></div><div style="flex:1"><div class="ti-nm">\${a}</div></div>\`;
  agendaGrid.appendChild(d);
});
`;

html = html.replace(
  'const ci=CATMAP[t.cat]||{color:\'#9baac7\',label:t.cat};',
  'const ci=CATMAP[t.cat]||CATMAP[t.status]||{color:\'#9baac7\',label:t.cat};'
);
html = html.replace(
  '<span class="tbg ${pc}">${t.pri}</span>',
  '<span class="tbg ${pc}">${t.status||t.pri}</span>'
);
html = html.replace('renderTasks(TASKS);', extraScript + '\nrenderTasks(TASKS);');

html = html.replace(
  '<script src="members-registry.js"></script>\n<script src="view-area.js"></script>\n<script src="hdr-linkedin.js"></script>',
  '<script src="linkedin-urls.js"></script>\n<script src="members-registry.js"></script>\n<script src="view-area.js"></script>\n<script src="hdr-linkedin.js"></script>'
);

/* Remove memorial Marina (não faz parte do relatório Hugo) */
html = html.replace(/<!-- MEMORIAL ANIMA -->[\s\S]*?<!-- ANALYSIS -->/, '<!-- ANALYSIS -->');
html = html.replace('<script src="memorial-anima-data.js"></script>\n', '');
html = html.replace(/\/\* ═+[\\s\\S]*?RENDER MEMORIAL ANIMA[\\s\\S]*?\}\)\(\);\n\n/, '');

html = html.replace(
  '<script src="hugo-data.js"></script>\n<script src="profile-photo-hugo.js"></script>',
  '<script src="hugo-data.js"></script>\n<script src="profile-photo-hugo.js"></script>'
);

html = html.replace(
  /<ul class="hdr-equipe-menu" id="equipeMenu" role="list" aria-label="Equipe de infraestrutura"><\/ul>/,
  '<ul class="hdr-equipe-menu" id="equipeMenu" role="list" aria-label="Equipe de infraestrutura">\n              <li class="hdr-equipe-item" role="listitem"><a href="marina.html">Marina Rodrigues</a></li>\n              <li class="hdr-equipe-item" role="listitem"><span class="hdr-area-name">Hugo Legramandi</span></li>\n              <li class="hdr-equipe-item" role="listitem"><a href="jorge.html">Jorge Buarque</a></li>\n              <li class="hdr-equipe-item" role="listitem"><a href="augusto.html">Augusto Mariano</a></li>\n              <li class="hdr-equipe-item" role="listitem"><a href="roberto-hayashi.html">Roberto Hayashi</a></li>\n            </ul>'
);

fs.writeFileSync(path.join(__dirname, 'hugo.html'), html, 'utf8');
console.log('Wrote hugo.html', html.length, 'bytes');
