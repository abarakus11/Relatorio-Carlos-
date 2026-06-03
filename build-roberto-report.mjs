/**
 * Gera roberto-data.js e roberto-hayashi.html a partir do docx RSA Roberto Hayashi 1S2026
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TASKS = [
  { name: 'BioFeed — Orçamentos e planos de ação', cat: 'biofeed', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'mar26', dt: 'Mar/26' },
  { name: 'BioFeed — Fornecedores contactados e áreas definidas', cat: 'biofeed', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'mar26', dt: 'Mar/26' },
  { name: 'BioFeed — Estruturas recebimento, pré-limpeza e armazenamento', cat: 'biofeed', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'abr26', dt: 'Abr/26' },
  { name: 'BioFeed — Biodigestores para geração de biogás', cat: 'biofeed', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'abr26', dt: 'Abr/26' },
  { name: 'BioFeed — Projeto módulos 10.000 / 5.000 / 1.000 ha', cat: 'biofeed', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Çacana — Potencial negócio nacional e internacional', cat: 'cacana', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'mar26', dt: 'Mar/26' },
  { name: 'Çacana — Unidade fabril em São Paulo (linha Brasília)', cat: 'cacana', status: 'andamento', pri: 'andamento', co: 'RWB', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Dívidas — Estruturação de grupos de produtores rurais', cat: 'dividas', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'abr26', dt: 'Abr/26' },
  { name: 'Agrishow — Carteira máquinas, insumos e prestadores', cat: 'feiras', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'abr26', dt: 'Abr/26' },
  { name: 'Agrobrasília — Contatos produtores e pesquisadores (3 dias)', cat: 'feiras', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Prospecção — Grupos de compras de agricultores', cat: 'prospeccao', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Prospecção — Agrovila', cat: 'prospeccao', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Prospecção — BioFeed e Çacana SP', cat: 'prospeccao', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'jun26', dt: 'Jun/26' },
  { name: 'Reunião — Christian Heinrich Praun (OLAM AGRI)', cat: 'reunioes', status: 'concluido', pri: 'prioridade', co: 'OLAM', mon: 'mai26', dt: 'Mai/26' },
  { name: 'Reunião — Eduardo Advisor (manejo florestal Amazonas)', cat: 'reunioes', status: 'andamento', pri: 'andamento', co: 'RWB', mon: 'jun26', dt: 'Jun/26' },
  { name: 'Programa Ajuste de Dívidas de Agricultores', cat: 'andamento', status: 'andamento', pri: 'andamento', co: 'RWB', mon: 'jun26', dt: 'Jun/26' },
  { name: 'BioFeed — Produtor Ibotirama/BA (1.500 ha)', cat: 'andamento', status: 'andamento', pri: 'andamento', co: 'RWB', mon: 'jun26', dt: 'Jun/26' },
  { name: 'Çacana SP — Rede 300+ pontos de venda', cat: 'andamento', status: 'andamento', pri: 'andamento', co: 'RWB', mon: 'jun26', dt: 'Jun/26' },
  { name: 'Oportunidade — 7% agricultores com dívidas atrasadas', cat: 'oportunidades', status: 'concluido', pri: 'prioridade', co: 'RWB', mon: 'jun26', dt: 'Jun/26' },
  { name: 'PDI — Escalar Programa de Dívidas (juros 6–15% a.a.)', cat: 'pdi', status: 'afazer', pri: 'prioridade', co: 'RWB', mon: 'jun26', dt: '2S/26' },
  { name: 'PDI — BioFeed: +3 áreas (mín. 5.000 ha cada)', cat: 'pdi', status: 'afazer', pri: 'prioridade', co: 'RWB', mon: 'jun26', dt: '2S/26' },
  { name: 'PDI — Çacana: viabilizar fábrica SP + plantio cana', cat: 'pdi', status: 'afazer', pri: 'prioridade', co: 'RWB', mon: 'jun26', dt: '2S/26' },
];

const catMap = {
  biofeed: { color: '#10e8a0', label: 'RWB · BioFeed' },
  cacana: { color: '#ffb020', label: 'RWB · Çacana' },
  dividas: { color: '#4d8fff', label: 'Dívidas Agrícolas' },
  feiras: { color: '#00d4ff', label: 'Feiras & Eventos' },
  prospeccao: { color: '#9d6fff', label: 'Prospecções' },
  reunioes: { color: '#ff8f3f', label: 'Reuniões Estratégicas' },
  andamento: { color: '#4d8fff', label: 'Projetos em Andamento' },
  oportunidades: { color: '#ffe066', label: 'Oportunidades' },
  pdi: { color: '#ff5a5a', label: 'Agenda 2S2026' },
};

const catAgg = {};
TASKS.forEach((t) => {
  catAgg[t.cat] = (catAgg[t.cat] || 0) + 1;
});
const CAT_L = Object.keys(catAgg).map((k) => catMap[k]?.label || k);
const CAT_D = Object.keys(catAgg).map((k) => catAgg[k]);
const CAT_C = Object.keys(catAgg).map((k) => catMap[k]?.color || '#4d8fff');

const statusCounts = { afazer: 0, andamento: 0, concluido: 0 };
TASKS.forEach((t) => {
  statusCounts[t.status]++;
});

const MON_KEYS = ['jan26', 'fev26', 'mar26', 'abr26', 'mai26', 'jun26'];
const monCounts = MON_KEYS.map((mk) => TASKS.filter((t) => t.mon === mk && t.status === 'concluido').length);

const coAgg = {};
TASKS.forEach((t) => {
  coAgg[t.co] = (coAgg[t.co] || 0) + 1;
});
const topCo = Object.entries(coAgg).sort((a, b) => b[1] - a[1]).slice(0, 6);

const report = {
  CATMAP: catMap,
  KPIS: [
    { ic: '📋', label: 'Entregas Registradas', val: '22', sub: 'RSA · RWB Agribusiness · 1S2026', color: '#4d8fff' },
    { ic: '✅', label: 'Concluídas', val: String(statusCounts.concluido), sub: `${Math.round((statusCounts.concluido / TASKS.length) * 100)}% do portfólio semestral`, color: '#10e8a0' },
    { ic: '⚙️', label: 'Em Andamento', val: String(statusCounts.andamento), sub: 'BioFeed · Çacana · Dívidas', color: '#00d4ff' },
    { ic: '🎯', label: 'Agenda 2S2026', val: String(statusCounts.afazer), sub: 'Plano de Desenvolvimento Individual', color: '#ffe066' },
    { ic: '🌾', label: 'Frentes RWB', val: '3', sub: 'BioFeed · Çacana · Dívidas', color: '#10e8a0' },
    { ic: '🤝', label: 'OLAM AGRI', val: 'R$ 250–300 MM', sub: 'Interesse em aporte BioFeed', color: '#ffb020' },
    { ic: '📍', label: 'BioFeed Captado', val: '1.500 ha', sub: 'Ibotirama/BA · doc. jurídico', color: '#ff8f3f' },
    { ic: '🏪', label: 'Rede Çacana SP', val: '300+', sub: 'Pontos de venda capital e interior', color: '#9d6fff' },
  ],
  MON_L: ['Jan/26', 'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26'],
  MON_D: monCounts,
  CAT_L,
  CAT_D,
  CAT_C,
  TOP_L: topCo.map((x) => x[0]),
  TOP_D: topCo.map((x) => x[1]),
  SKILLS: [
    { nm: '🌾 Agronegócio & RWB', pct: 96, c: '#10e8a0' },
    { nm: '🔬 BioFeed & Biogás', pct: 94, c: '#4d8fff' },
    { nm: '🏭 Çacana & Industrialização', pct: 92, c: '#ffb020' },
    { nm: '💰 Estruturação de Dívidas', pct: 90, c: '#00d4ff' },
    { nm: '🤝 Prospecção & Parcerias', pct: 93, c: '#9d6fff' },
    { nm: '🎪 Feiras Agro (Agrishow)', pct: 88, c: '#ff8f3f' },
    { nm: '📊 Grupos de Compras', pct: 91, c: '#ffe066' },
    { nm: '🗺️ Viabilidade Territorial', pct: 89, c: '#4d8fff' },
    { nm: '🌿 Manejo Florestal', pct: 85, c: '#10e8a0' },
    { nm: '📈 Escalonamento de Negócios', pct: 92, c: '#00d4ff' },
  ],
  TL: [
    { dt: 'Nov/2025', co: 'RWB', cc: '#4d8fff', ttl: 'Head of Agribusiness', desc: 'Roberto Carlos Hayashi assume liderança agro no ecossistema RWB.' },
    { dt: 'Mar/2026', co: 'RWB', cc: '#10e8a0', ttl: 'BioFeed estruturado', desc: 'Orçamentos, fornecedores e módulos territoriais (1k–10k ha) definidos.' },
    { dt: 'Abr/2026', co: 'RWB', cc: '#00d4ff', ttl: 'Agrishow Ribeirão Preto', desc: 'Carteira de máquinas, insumos e prestadores para empreendimentos.' },
    { dt: 'Mai/2026', co: 'OLAM', cc: '#ffb020', ttl: 'Reunião OLAM AGRI', desc: 'Christian Heinrich Praun — interesse em aporte R$ 250–300 MM no BioFeed.' },
    { dt: 'Mai/2026', co: 'RWB', cc: '#9d6fff', ttl: 'Agrobrasília', desc: 'Três dias de evento — contatos com produtores e pesquisadores.' },
    { dt: 'Jun/2026', co: 'RWB', cc: '#ff8f3f', ttl: 'Produtor captado BA', desc: 'BioFeed Ibotirama — 1.500 ha com documentação no jurídico.' },
    { dt: 'Jun/2026', co: 'RWB', cc: '#10e8a0', ttl: 'RSA 1S2026', desc: 'Relatório semestral emitido — 22 entregas consolidadas.' },
  ],
  ACH: [
    { icon: 'trophy', ttl: 'Frentes RWB', val: '3', accent: '#10e8a0', ds: 'BioFeed · Çacana · Dívidas de Agricultores' },
    { icon: 'metric', ttl: 'OLAM AGRI', val: 'R$ 300 MM', accent: '#ffb020', ds: 'Interesse declarado em aporte BioFeed' },
    { icon: 'layers', ttl: 'Feiras', val: '2', accent: '#00d4ff', ds: 'Agrishow e Agrobrasília' },
    { icon: 'org', ttl: 'BioFeed BA', val: '1.500 ha', accent: '#4d8fff', ds: 'Primeiro produtor — Ibotirama' },
    { icon: 'alert', ttl: 'Mercado', val: '7%', accent: '#ff5a5a', ds: 'Agricultores BR com dívidas atrasadas' },
    { icon: 'layers', ttl: 'Çacana SP', val: '300+', accent: '#9d6fff', ds: 'Pontos de venda prospectados' },
  ],
  ANALYSIS: [
    {
      feat: true,
      wide: false,
      icon: 'exec',
      accent: '#ffb020',
      ttl: 'Resumo Executivo',
      body: '<p><strong>Roberto Carlos Hayashi</strong> atua como <strong>Head of Agribusiness</strong> da RWB desde novembro/2025, conduzindo o <strong>RSA 1S2026</strong> com foco em três frentes estratégicas: <strong>BioFeed</strong>, <strong>Çacana</strong> e <strong>Estruturação de Dívidas de Agricultores</strong>. Consolidou orçamentos, fornecedores e planos de ação, participou de <strong>Agrishow</strong> e <strong>Agrobrasília</strong>, e captou o primeiro produtor BioFeed em <strong>Ibotirama/BA (1.500 ha)</strong>.</p>',
    },
    {
      feat: false,
      wide: false,
      icon: 'user',
      accent: '#00d4ff',
      ttl: 'Perfil Profissional',
      body: '<p>Liderança agro no ecossistema RWB | Rural Wealth Brazil, com atuação em prospecção comercial, estruturação de projetos agroindustriais, feiras do setor, reuniões com investidores e viabilização de parcerias de escala nacional e internacional.</p>',
    },
    {
      feat: false,
      wide: false,
      icon: 'scope',
      accent: '#4d8fff',
      ttl: 'Principais Frentes',
      body: '<ul class="an-list"><li>RWB | BioFeed — biogás, módulos territoriais e captação de produtores</li><li>RWB | Çacana — unidade fabril SP e rede de 300+ pontos de venda</li><li>Programa de Ajuste de Dívidas de Agricultores (6–15% a.a.)</li><li>Grupos de compras e fornecedores agro</li><li>Parceria estratégica OLAM AGRI / Marfrig</li></ul>',
    },
    {
      feat: false,
      wide: false,
      icon: 'strength',
      accent: '#10e8a0',
      ttl: 'Destaques do Semestre',
      body: '<ul class="an-list"><li>Projeto BioFeed praticamente pronto com produtor captado na Bahia</li><li>Interesse OLAM AGRI em aportes de R$ 250–300 milhões</li><li>Carteira Agrishow para máquinas, insumos e serviços</li><li>Çacana SP com produção via linha existente em Brasília</li><li>Potencial de escala em grupos de compras de insumos</li></ul>',
    },
    {
      feat: false,
      wide: false,
      icon: 'stack',
      accent: '#ff8f3f',
      ttl: 'Feiras & Prospecções',
      body: '<ul class="an-list"><li>Agrishow — Ribeirão Preto (máquinas e equipamentos BioFeed)</li><li>Agrobrasília — 3 dias (produtores e pesquisadores)</li><li>Convertidos: grupos de compras, agrovila, BioFeed, Çacana SP</li><li>Reunião Eduardo Advisor — manejo florestal Amazonas</li></ul>',
    },
    {
      feat: true,
      wide: true,
      icon: 'impact',
      accent: '#9d6fff',
      ttl: 'Impacto para a Organização',
      body: '<p>Estruturou a <strong>base comercial e territorial</strong> da RWB para escalar receita agroindustrial: definiu módulos de implantação (1.000–10.000 ha), abriu canal com <strong>OLAM AGRI</strong>, mapeou oportunidade em <strong>7% dos agricultores brasileiros com dívidas atrasadas</strong> e preparou a expansão da <strong>Çacana</strong> em São Paulo com rede de vendas já prospectada.</p>',
    },
  ],
  PROJETOS: [
    { nome: 'RWB | BioFeed', desc: 'Biogás, biodigestores, módulos 1k–10k ha e primeiro produtor em Ibotirama/BA.', status: 'Em andamento', cor: '#10e8a0' },
    { nome: 'RWB | Çacana', desc: 'Fábrica SP com linha Brasília; 300+ pontos de venda na capital e interior.', status: 'Em andamento', cor: '#ffb020' },
    { nome: 'Dívidas de Agricultores', desc: 'Programa de ajuste — juros 6–15% a.a., grupos de compras e fornecedores.', status: 'Estruturação', cor: '#4d8fff' },
  ],
  FEIRAS: [
    { evt: 'Agrishow', local: 'Ribeirão Preto', desc: 'Carteira de indústrias de máquinas, insumos e prestadores para BioFeed.' },
    { evt: 'Agrobrasília', local: 'Brasília', desc: 'Três dias — contatos com produtores e pesquisadores do agronegócio.' },
  ],
  OPORTUNIDADES: [
    '7% dos agricultores brasileiros com dívidas atrasadas — programa de reestruturação e escalonamento',
    'OLAM AGRI: aporte R$ 250–300 MM para garantir compra de cereais e fortalecer presença no Brasil',
    'Rede Çacana com 300+ pontos de venda prontos para capital e interior de SP',
    'Grupos de compras de insumos com potencial de faturamento na ordem de milhões',
  ],
  AGENDA: [
    'Escalar Programa de Ajuste de Dívidas de Agricultores (juros 6–15% a.a.)',
    'Estruturar +3 áreas BioFeed (mín. 5.000 ha; ideal 10.000 ha) — parceiro ideal OLAM AGRI',
    'Viabilizar fábrica Çacana em SP com plantio de cana e logística estratégica',
    'Levantar aporte financeiro BioFeed — produtor Ibotirama/BA',
    'Formalizar documentação manejo florestal Amazonas (Eduardo Advisor)',
  ],
  TASKS,
};

fs.writeFileSync(
  path.join(__dirname, 'roberto-data.js'),
  '/* Dados — Roberto Hayashi · Relatório de Atividades Semestrais 01-26 · Jan–Jun 2026 */\nwindow.ROBERTO_REPORT = ' +
    JSON.stringify(report, null, 2) +
    ';\n',
  'utf8'
);
console.log('Wrote roberto-data.js —', TASKS.length, 'entregas');

let html = fs.readFileSync(path.join(__dirname, 'marina.html'), 'utf8');
const reps = [
  [/Dashboard Executivo — Marina Rodrigues/g, 'Dashboard Executivo — Roberto Hayashi'],
  [/Marina Rodrigues · RSA Dashboard 1S2026 · Jan–Jun 2026/g, 'Roberto Hayashi · RWB Agribusiness · Jan–Jun 2026'],
  [/data-profile-marina/g, 'data-profile-roberto'],
  [/Relatório Semestral · RSA Dashboard 1S2026/g, 'Relatório Semestral · RSA 1S2026'],
  [/Marina <span>Rodrigues<\/span>/g, 'Roberto <span>Hayashi</span>'],
  [/Infraestrutura &nbsp;·&nbsp; FIC Capital Group/g, 'Head of Agribusiness &nbsp;·&nbsp; RWB · FIC Capital Group'],
  [/Indicadores do Semestre/g, 'Indicadores de Performance'],
  [/RSA Dashboard 2026 · Janeiro a Junho 2026 · Relatorio_Claude\.pdf/g, 'Relatório de Atividades · Janeiro a Junho 2026 · Relatório de Atividades Semestrais 01-26.docx'],
  [/marina-data\.js/g, 'roberto-data.js'],
  [/profile-photo-marina\.js/g, 'profile-photo-roberto.js'],
  [/window\.MARINA_REPORT/g, 'window.ROBERTO_REPORT'],
  [/<strong>Marina Rodrigues<\/strong><span>Infraestrutura — FIC Capital Group<\/span>/g,
    '<strong>Roberto Hayashi</strong><span>Head of Agribusiness — RWB</span>'],
  [/RSA Dashboard de Tarefas · Planejamento · Execução · Controle<br>Relatório Semestral — Janeiro a Junho 2026/g,
    'RWB Agribusiness · BioFeed · Çacana · Dívidas<br>Relatório Semestral — Janeiro a Junho 2026'],
  [/Detalhamento de tarefas — infraestrutura \(2[23] no semestre\)/g, 'Painel de entregas — 22 registradas no 1º semestre 2026'],
  [/Resumo executivo · RSA 1S2026 · FIC Capital Group/g, 'Sumário executivo · Head of Agribusiness · RSA 1S2026'],
  [/alt="Marina Rodrigues"/g, 'alt="Roberto Hayashi"'],
  [/Competências &amp; Integração/g, 'Competências &amp; Agribusiness'],
  [/Visualização interativa do volume de entregas e distribuição por área/g, 'Volume de entregas por frente RWB e parceiros'],
];

for (const [re, rep] of reps) html = html.replace(re, rep);

html = html.replace(/infraestrutura-theme\.css/g, 'roberto-theme.css');
html = html.replace(/page-infraestrutura/g, 'page-roberto');
html = html.replace(/assets\/infraestrutura-bg\.png/g, 'assets/roberto-hayashi-bg.png');

const extraSections = `
<!-- PROJETOS RWB -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Projetos RWB</h2>
        <p>BioFeed · Çacana · Dívidas de Agricultores</p>
      </div>
    </div>
    <div class="anal-grid" id="projGrid"></div>
  </div>
</section>

<!-- FEIRAS -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Feiras &amp; Eventos</h2>
        <p>Presença no agronegócio brasileiro</p>
      </div>
    </div>
    <div class="anal-grid" id="feirasGrid"></div>
  </div>
</section>

<!-- OPORTUNIDADES -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Oportunidades Estratégicas</h2>
        <p>Identificadas no 1º semestre 2026</p>
      </div>
    </div>
    <div class="task-grid" id="oportGrid"></div>
  </div>
</section>

<!-- AGENDA 2S2026 -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Plano · 2º Semestre 2026</h2>
        <p>Desenvolvimento individual — prioridades</p>
      </div>
    </div>
    <div class="task-grid" id="agendaGrid"></div>
  </div>
</section>
`;

html = html.replace('<!-- FOOTER -->', extraSections + '\n<!-- FOOTER -->');

const extraScript = `
const { PROJETOS, FEIRAS, OPORTUNIDADES, AGENDA } = window.ROBERTO_REPORT;
const projGrid=document.getElementById('projGrid');
PROJETOS.forEach(p=>{
  projGrid.innerHTML+=\`<article class="an reveal" style="--an-accent:\${p.cor}">
    <header class="an-hd"><div class="an-meta"><h3 class="an-ttl">\${p.nome}</h3></div></header>
    <div class="an-bd"><p>\${p.desc}<br><small style="color:var(--t2)">\${p.status}</small></p></div></article>\`;
});
const feirasGrid=document.getElementById('feirasGrid');
FEIRAS.forEach(f=>{
  feirasGrid.innerHTML+=\`<article class="an reveal" style="--an-accent:#00d4ff">
    <header class="an-hd"><div class="an-meta"><h3 class="an-ttl">\${f.evt}</h3></div></header>
    <div class="an-bd"><p><strong>\${f.local}</strong><br>\${f.desc}</p></div></article>\`;
});
const oportGrid=document.getElementById('oportGrid');
OPORTUNIDADES.forEach(a=>{
  const d=document.createElement('div');
  d.className='ti reveal';
  d.style.setProperty('--ti-accent','#ffe066');
  d.innerHTML=\`<div class="ti-dot" style="background:#ffe066"></div><div style="flex:1"><div class="ti-nm">\${a}</div></div>\`;
  oportGrid.appendChild(d);
});
const agendaGrid=document.getElementById('agendaGrid');
AGENDA.forEach(a=>{
  const d=document.createElement('div');
  d.className='ti reveal';
  d.style.setProperty('--ti-accent','#10e8a0');
  d.innerHTML=\`<div class="ti-dot" style="background:#10e8a0"></div><div style="flex:1"><div class="ti-nm">\${a}</div></div>\`;
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

html = html.replace(/<!-- MEMORIAL ANIMA -->[\s\S]*?<!-- ANALYSIS -->/, '<!-- ANALYSIS -->');
html = html.replace('<script src="memorial-anima-data.js"></script>\n', '');
html = html.replace(/\/\* ═+[\\s\\S]*?RENDER MEMORIAL ANIMA[\\s\\S]*?\}\)\(\);\n\n/, '');

html = html.replace(
  /<ul class="hdr-equipe-menu" id="equipeMenu" role="list" aria-label="Equipe de infraestrutura"><\/ul>/,
  '<ul class="hdr-equipe-menu" id="equipeMenu" role="list" aria-label="Equipe de infraestrutura">\n              <li class="hdr-equipe-item" role="listitem"><a href="marina.html">Marina Rodrigues</a></li>\n              <li class="hdr-equipe-item" role="listitem"><a href="hugo.html">Hugo Legramandi</a></li>\n              <li class="hdr-equipe-item" role="listitem"><a href="jorge.html">Jorge Buarque</a></li>\n              <li class="hdr-equipe-item" role="listitem"><a href="augusto.html">Augusto Mariano</a></li>\n              <li class="hdr-equipe-item" role="listitem"><span class="hdr-area-name">Roberto Hayashi</span></li>\n            </ul>'
);

fs.writeFileSync(path.join(__dirname, 'roberto-hayashi.html'), html, 'utf8');
console.log('Wrote roberto-hayashi.html', html.length, 'bytes');
