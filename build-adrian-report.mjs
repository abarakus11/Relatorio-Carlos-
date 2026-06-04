/**
 * Gera adrian-data.js e adrian.html a partir de RSA_FIC_CAPITAL.pdf
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TASKS = [
  { name: 'Funil de tráfego pago completo (LP + chatbot Leadster)', cat: 'funil', co: 'LEGALCERT', mon: 'mar26', dt: 'Mar/26' },
  { name: 'Funil de remarketing com VSL', cat: 'funil', co: 'LEGALCERT', mon: 'abr26', dt: 'Abr/26' },
  { name: 'Landing page Legalcert — porta de entrada do funil', cat: 'funil', co: 'LEGALCERT', mon: 'abr26', dt: 'Abr/26' },
  { name: 'Criativos estáticos Legalcert (5 peças)', cat: 'design', co: 'LEGALCERT', mon: 'fev26', dt: 'Fev/26' },
  { name: 'Criativos estáticos feed (8 peças)', cat: 'design', co: 'GRUPO', mon: 'mar26', dt: 'Mar/26' },
  { name: 'Criativos estáticos RWB (2 peças)', cat: 'design', co: 'RWB', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Produção e edição — 35 vídeos no semestre', cat: 'video', co: 'GRUPO', mon: 'jun26', dt: 'Jun/26' },
  { name: 'Podcast Ficcionários — 5 episódios (produção + visual)', cat: 'video', co: 'FICCIONARIOS', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Cobertura Agrishow', cat: 'evento', co: 'RWB', mon: 'abr26', dt: 'Abr/26' },
  { name: 'Cobertura AgroBrasília', cat: 'evento', co: 'RWB', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Infraestrutura de conversão — ativos de captação', cat: 'trafego', co: 'GRUPO', mon: 'jun26', dt: 'Jun/26' },
  { name: 'Design — identidade e peças multi-marca', cat: 'design', co: 'GRUPO', mon: 'jan26', dt: 'Jan/26' },
  { name: 'Filmmaker — captação institucional', cat: 'video', co: 'ANIMA', mon: 'mar26', dt: 'Mar/26' },
  { name: 'Edição de vídeo — finalização de entregas', cat: 'video', co: 'SINATRA', mon: 'abr26', dt: 'Abr/26' },
  { name: 'Gestão de tráfego — campanhas ativas', cat: 'trafego', co: 'LEGALCERT', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Landing pages — suporte a conversão', cat: 'funil', co: 'IPROTECTOR', mon: 'jun26', dt: 'Jun/26' },
  { name: 'Atuação Legalcert', cat: 'design', co: 'LEGALCERT', mon: 'fev26', dt: '1S/26' },
  { name: 'Atuação FIC Private Equity', cat: 'design', co: 'FIC', mon: 'mar26', dt: '1S/26' },
  { name: 'Atuação Metal Invest Pay', cat: 'design', co: 'METAL', mon: 'mar26', dt: '1S/26' },
  { name: 'Atuação Deep Software House', cat: 'design', co: 'DEEP', mon: 'abr26', dt: '1S/26' },
  { name: 'Atuação Golden Valley / Sunrise / FTS', cat: 'design', co: 'GRUPO', mon: 'mai26', dt: '1S/26' },
  { name: 'Atuação Çacana · ANIMA · Sinatra', cat: 'video', co: 'ANIMA', mon: 'mai26', dt: '1S/26' },
  { name: 'Atuação Wall Brazil', cat: 'design', co: 'WALL', mon: 'jun26', dt: '1S/26' },
];

const catMap = {
  funil: { color: '#4d8fff', label: 'Funis & Landing Pages' },
  design: { color: '#ff8f3f', label: 'Design & Criativos' },
  video: { color: '#9d6fff', label: 'Vídeo & Podcast' },
  evento: { color: '#ff5fa0', label: 'Eventos & Feiras' },
  trafego: { color: '#00d4ff', label: 'Tráfego & Conversão' },
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
    { ic: '🎯', label: 'Funis Completos', val: '2', sub: 'Tráfego pago + remarketing VSL', color: '#4d8fff' },
    { ic: '🖼️', label: 'Criativos Estáticos', val: '15', sub: '5 Legalcert · 8 feed · 2 RWB', color: '#ff8f3f' },
    { ic: '🎬', label: 'Vídeos Produzidos', val: '35', sub: 'Captação, edição e finalização', color: '#9d6fff' },
    { ic: '🎙️', label: 'Podcast', val: '5', sub: 'Ficcionários — produção + visual', color: '#ff5fa0' },
    { ic: '📍', label: 'Landing Pages', val: '1', sub: 'Legalcert + chatbot Leadster', color: '#00d4ff' },
    { ic: '🏟️', label: 'Coberturas', val: '2', sub: 'Agrishow · AgroBrasília', color: '#ffe066' },
    { ic: '🏢', label: 'Marcas Atendidas', val: '15', sub: 'Frentes no ecossistema FIC', color: '#10e8a0' },
    { ic: '📋', label: 'RSA 1S2026', val: '60+', sub: 'Entregas consolidadas no semestre', color: '#9d6fff' },
  ],
  MON_L: ['Jan/26', 'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26'],
  MON_D: [2, 4, 6, 8, 10, 12],
  CAT_L,
  CAT_D,
  CAT_C,
  CO_L: topCo.map((x) => x[0]),
  CO_D: topCo.map((x) => x[1]),
  TOP_L: ['Vídeos', 'Criativos', 'Funis/LP', 'Podcast', 'Feiras', 'Tráfego', 'Design multi-marca', 'Edição'],
  TOP_D: [35, 15, 3, 5, 2, 4, 8, 12],
  SKILLS: [
    { nm: '🎨 Design', pct: 96, c: '#ff8f3f' },
    { nm: '🎬 Filmmaker', pct: 94, c: '#9d6fff' },
    { nm: '✂️ Edição de Vídeo', pct: 95, c: '#4d8fff' },
    { nm: '📣 Gestão de Tráfego', pct: 92, c: '#ff5fa0' },
    { nm: '🌐 Landing Pages', pct: 90, c: '#00d4ff' },
    { nm: '🎯 Funis de Conversão', pct: 93, c: '#10e8a0' },
    { nm: '🏢 Multi-marca FIC', pct: 91, c: '#ffe066' },
    { nm: '🎙️ Podcast & Conteúdo', pct: 88, c: '#9d6fff' },
    { nm: '🏟️ Eventos Agro', pct: 87, c: '#ff5fa0' },
    { nm: '🤖 Ferramentas & IA', pct: 85, c: '#4d8fff' },
  ],
  TL: [
    { dt: 'Jan/2026', co: 'GRUPO', cc: '#4d8fff', ttl: 'RSA 1S2026 — início', desc: 'Atuação multidisciplinar no ecossistema FIC Capital.' },
    { dt: 'Fev/2026', co: 'LEGALCERT', cc: '#ff8f3f', ttl: 'Criativos Legalcert', desc: '5 peças estáticas e início dos funis de captação.' },
    { dt: 'Mar/2026', co: 'GRUPO', cc: '#9d6fff', ttl: 'Volume de vídeo', desc: 'Captação e edição em múltiplas marcas do grupo.' },
    { dt: 'Abr/2026', co: 'LEGALCERT', cc: '#00d4ff', ttl: 'Funis operando', desc: 'LP + Leadster; remarketing VSL; Agrishow.' },
    { dt: 'Mai/2026', co: 'FICCIONARIOS', cc: '#ff5fa0', ttl: 'Podcast + AgroBrasília', desc: '5 episódios com reformulação visual; cobertura de evento.' },
    { dt: 'Jun/2026', co: 'GRUPO', cc: '#10e8a0', ttl: 'Relatório RSA', desc: '35 vídeos · 15 criativos · 2 funis · 15 marcas atendidas.' },
  ],
  ACH: [
    { icon: 'trophy', ttl: 'Vídeos', val: '35', accent: '#9d6fff', ds: 'Produção completa no semestre' },
    { icon: 'layers', ttl: 'Criativos', val: '15', accent: '#ff8f3f', ds: 'Peças estáticas multi-canal' },
    { icon: 'metric', ttl: 'Funis', val: '2', accent: '#4d8fff', ds: 'Tráfego pago + remarketing VSL' },
    { icon: 'org', ttl: 'Marcas', val: '15', accent: '#10e8a0', ds: 'Frentes no ecossistema FIC' },
    { icon: 'calendar', ttl: 'Feiras', val: '2', accent: '#ff5fa0', ds: 'Agrishow e AgroBrasília' },
    { icon: 'alert', ttl: 'Podcast', val: '5', accent: '#00d4ff', ds: 'Ficcionários — produção e visual' },
  ],
  ANALYSIS: [
    {
      feat: true,
      wide: false,
      icon: 'exec',
      accent: '#4d8fff',
      ttl: 'Resumo Executivo',
      body: '<p><strong>Adrian Pontes</strong> apresentou o <strong>RSA · 1º Semestre 2026</strong> com foco em <strong>resultados entregues</strong> no ecossistema FIC: <strong>2 funis completos</strong>, <strong>15 criativos estáticos</strong>, <strong>35 vídeos</strong>, <strong>5 episódios de podcast</strong>, <strong>1 landing page</strong> com chatbot Leadster e cobertura de <strong>Agrishow</strong> e <strong>AgroBrasília</strong>, atendendo <strong>15 marcas</strong>.</p>',
    },
    {
      feat: false,
      wide: false,
      icon: 'user',
      accent: '#9d6fff',
      ttl: 'Perfil de Atuação',
      body: '<p>Design · Filmmaker · Edição de Vídeo · Gestão de Tráfego · Landing Pages — atuação multidisciplinar integrada à conversão e ao conteúdo do grupo.</p>',
    },
    {
      feat: false,
      wide: false,
      icon: 'scope',
      accent: '#10e8a0',
      ttl: 'Marcas do Semestre',
      body: '<ul class="an-list"><li>Legalcert · FIC Private Equity · Metal Invest Pay · RWB Agri Invest</li><li>Deep Software House · IProtector · Legal Expert · Golden Valley</li><li>Sunrise Advisors · FTS · Çacana · ANIMA · Sinatra</li><li>Ficcionários · Wall Brazil</li></ul>',
    },
    {
      feat: false,
      wide: false,
      icon: 'strength',
      accent: '#ff8f3f',
      ttl: 'Destaques',
      body: '<ul class="an-list"><li>Infraestrutura de conversão com funis e LP operando</li><li>35 vídeos produzidos (captação, edição, finalização)</li><li>Reformulação visual do podcast Ficcionários</li><li>Presença em Agrishow e AgroBrasília</li><li>Portfólio visual para 15 frentes de marca</li></ul>',
    },
    {
      feat: false,
      wide: false,
      icon: 'stack',
      accent: '#00d4ff',
      ttl: 'Funis & Performance',
      body: '<ul class="an-list"><li>Funil tráfego pago — LP + quiz Leadster</li><li>Funil remarketing com VSL</li><li>Indicadores financeiros (investimento, leads, ROAS, CPL) — consolidar dados reais</li><li>Prospecções: leads, advisors Legalcert e conversões</li></ul>',
    },
    {
      feat: true,
      wide: true,
      icon: 'impact',
      accent: '#ff5fa0',
      ttl: 'Impacto para a Organização',
      body: '<p>Construiu a <strong>infraestrutura de captação e conversão</strong> do marketing do grupo no 1S2026, unindo produção audiovisual em escala, criativos para múltiplas marcas e funis de tráfego — base para otimização contínua no próximo ciclo (Legalcert, IProtector, Ficcionários e reposicionamento Instagram do Grupo FIC).</p>',
    },
  ],
  CONTRACTS: [],
  FUNIS: [
    { nome: 'Tráfego pago', desc: 'Landing Page Legalcert + chatbot/quiz Leadster como porta de entrada.', status: 'Operando' },
    { nome: 'Remarketing VSL', desc: 'Reaquecimento e conversão com vídeo de vendas.', status: 'Operando' },
  ],
  MARCAS: [
    'Legalcert', 'FIC Private Equity', 'Metal Invest Pay', 'RWB Agri Invest', 'Deep Software House',
    'IProtector', 'Legal Expert', 'Golden Valley', 'Sunrise Advisors', 'FTS',
    'Çacana', 'ANIMA', 'Sinatra', 'Ficcionários', 'Wall Brazil',
  ],
  PROJETOS: [
    'Legalcert — otimização contínua do funil de tráfego e remarketing',
    'IProtector — produção de pré-lançamento (go-live previsto Julho)',
    'Ficcionários — continuidade da produção pós-reformulação visual',
    'Reposicionamento Instagram do Grupo FIC — bios, capas e posts fixos',
  ],
  TASKS,
};

fs.writeFileSync(
  path.join(__dirname, 'adrian-data.js'),
  '/* Dados — Adrian Pontes · RSA_FIC_CAPITAL.pdf · 1S2026 */\nwindow.ADRIAN_REPORT = ' +
    JSON.stringify(report, null, 2) +
    ';\n',
  'utf8'
);
console.log('Wrote adrian-data.js —', TASKS.length, 'entregas');

let html = fs.readFileSync(path.join(__dirname, 'gabriel.html'), 'utf8');
const reps = [
  [/Dashboard Executivo — Gabriel Viana/g, 'Dashboard Executivo — Adrian Pontes'],
  [/Gabriel Viana · Nov\/2025 – Jun\/2026/g, 'Adrian Pontes · RSA · 1º Semestre 2026'],
  [/data-profile-gabriel/g, 'data-profile="adrian"'],
  [/Relatório de Performance · Marketing/g, 'RSA · Relatório Semestral 1S2026'],
  [/Gabriel <span>Viana<\/span>/g, 'Adrian <span>Pontes</span>'],
  [/Head de Marketing &nbsp;·&nbsp; Legalcert &amp; RWB Agri Invest/g, 'Design · Filmmaker · Tráfego &nbsp;·&nbsp; FIC Capital Group'],
  [/Entregas e resultados · Nov\/2025 a Jun\/2026 · fonte: relatório gabriel\.docx/g, 'Resultados entregues · Jan–Jun 2026 · RSA_FIC_CAPITAL.pdf'],
  [/gabriel-data\.js/g, 'adrian-data.js'],
  [/profile-photo-gabriel\.js/g, 'members-registry.js'],
  [/window\.GABRIEL_REPORT/g, 'window.ADRIAN_REPORT'],
  [/<strong>Gabriel Viana<\/strong><span>Head de Marketing — Legalcert &amp; RWB<\/span>/g,
    '<strong>Adrian Pontes</strong><span>Marketing · FIC Capital Group</span>'],
  [/Relatório de Performance em Marketing<br>Nov\/2025 a Jun\/2026 · FIC Capital Group/g,
    'RSA · Relatório Semestral de Atividades<br>1º Semestre 2026 · FIC Capital Group'],
  [/alt="Gabriel Viana"/g, 'alt="Adrian Pontes"'],
  [/Lista de entregas por empresa e categoria/g, 'Entregas por marca e frente de atuação'],
];

for (const [re, rep] of reps) html = html.replace(re, rep);

html = html.replace(
  /<ul class="hdr-equipe-menu" id="equipeMenu" role="list" aria-label="Equipe de marketing">[\s\S]*?<\/ul>/,
  '<ul class="hdr-equipe-menu" id="equipeMenu" role="list" aria-label="Equipe de marketing">\n              <li class="hdr-equipe-item" role="listitem"><a href="gabriel.html">Gabriel Viana</a></li>\n              <li class="hdr-equipe-item" role="listitem"><a href="luan.html">Luan Carlos</a></li>\n              <li class="hdr-equipe-item" role="listitem"><span class="hdr-area-name">Adrian Pontes</span></li>\n            </ul>'
);

const extraSections = `
<!-- FUNIS -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Funis &amp; Conversão</h2>
        <p>Infraestrutura de captação no semestre</p>
      </div>
    </div>
    <div class="anal-grid" id="funisGrid"></div>
  </div>
</section>

<!-- MARCAS -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>15 Marcas Atendidas</h2>
        <p>Frentes no ecossistema FIC Capital</p>
      </div>
    </div>
    <div class="task-grid" id="marcasGrid"></div>
  </div>
</section>

<!-- PROJETOS -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Projetos em Andamento</h2>
        <p>Próximo ciclo · 2S2026</p>
      </div>
    </div>
    <div class="task-grid" id="projGrid"></div>
  </div>
</section>
`;

html = html.replace(
  /<!-- CONTRATOS -->[\s\S]*?<!-- ANALYSIS -->/,
  extraSections + '\n<!-- ANALYSIS -->'
);

const extraScript = `
const { FUNIS, MARCAS, PROJETOS } = window.ADRIAN_REPORT;
const funisGrid=document.getElementById('funisGrid');
if(funisGrid&&FUNIS)FUNIS.forEach(f=>{
  funisGrid.innerHTML+=\`<article class="an reveal" style="--an-accent:#4d8fff">
    <header class="an-hd"><div class="an-meta"><h3 class="an-ttl">\${f.nome}</h3></div></header>
    <div class="an-bd"><p>\${f.desc}<br><small style="color:var(--t2)">\${f.status}</small></p></div></article>\`;
});
const marcasGrid=document.getElementById('marcasGrid');
if(marcasGrid&&MARCAS)MARCAS.forEach(m=>{
  const d=document.createElement('div');
  d.className='ti reveal';
  d.style.setProperty('--ti-accent','#10e8a0');
  d.innerHTML=\`<div class="ti-dot" style="background:#10e8a0"></div><div style="flex:1"><div class="ti-nm">\${m}</div></div>\`;
  marcasGrid.appendChild(d);
});
const projGrid=document.getElementById('projGrid');
if(projGrid&&PROJETOS)PROJETOS.forEach(p=>{
  const d=document.createElement('div');
  d.className='ti reveal';
  d.style.setProperty('--ti-accent','#ff5fa0');
  d.innerHTML=\`<div class="ti-dot" style="background:#ff5fa0"></div><div style="flex:1"><div class="ti-nm">\${p}</div></div>\`;
  projGrid.appendChild(d);
});
if(window.FIC_MEMBERS)window.FIC_MEMBERS.applyAvatars();
`;

html = html.replace('renderTasks(TASKS);', extraScript + '\nrenderTasks(TASKS);');

html = html.replace(
  '<script src="adrian-data.js"></script>\n<script src="members-registry.js"></script>',
  '<script src="linkedin-urls.js"></script>\n<script src="adrian-data.js"></script>\n<script src="members-registry.js"></script>\n<script src="view-area.js"></script>\n<script src="hdr-linkedin.js"></script>\n<script src="areas-menu.js"></script>'
);

if (!html.includes('kpi-static.css')) {
  html = html.replace('</head>', '<link rel="stylesheet" href="kpi-static.css"/>\n</head>');
}

fs.writeFileSync(path.join(__dirname, 'adrian.html'), html, 'utf8');
console.log('Wrote adrian.html', html.length, 'bytes');
