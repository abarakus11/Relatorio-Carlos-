import fs from 'fs';
import path from 'path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
let html = fs.readFileSync(path.join(root, 'giovane.html'), 'utf8');

const replacements = [
  [/Dashboard Executivo — Giovane Oliveira/g, 'Dashboard Executivo — Marina Rodrigues'],
  [/Giovane Oliveira · Jun 2025/g, 'Marina Rodrigues · RSA Dashboard 1S2026 · Jan–Jun 2026'],
  [/data-profile-giovane/g, 'data-profile-marina'],
  [/<body>/g, '<body class="page-infraestrutura">'],
  [
    /<img src="https:\/\/i\.pinimg\.com[^"]+"[^>]+>/g,
    '<img src="assets/infraestrutura-bg.png" alt="" width="1920" height="1080" loading="eager" decoding="async">',
  ],
  [
    /<img src="https:\/\/media1\.tenor\.com[^"]+"[^>]+>/g,
    '<img src="assets/infraestrutura-bg.png" alt="" width="1920" height="400" loading="eager" decoding="async">',
  ],
  [/Relatório Mensal · Jun 2025/g, 'Relatório Semestral · RSA Dashboard 1S2026'],
  [/Giovane <span>Oliveira<\/span>/g, 'Marina <span>Rodrigues</span>'],
  [/TI &amp; Helpdesk &nbsp;·&nbsp; FIC Capital/g, 'Infraestrutura &nbsp;·&nbsp; FIC Capital Group'],
  [/Equipe de tecnologia/g, 'Equipe de infraestrutura'],
  [
    /<ul class="hdr-equipe-menu" id="equipeMenu"[^>]*>[\s\S]*?<\/ul>/,
    '<ul class="hdr-equipe-menu" id="equipeMenu" role="list" aria-label="Equipe de infraestrutura"></ul>',
  ],
  [/Indicadores de Performance/g, 'Indicadores do Semestre'],
  [/Indicadores do período — giovane\.pdf/g, 'RSA Dashboard 2026 · Janeiro a Junho 2026 · Relatorio_Claude.pdf'],
  [/giovane-data\.js/g, 'marina-data.js'],
  [/profile-photo-giovane\.js/g, 'profile-photo-marina.js'],
  [/window\.GIOVANE_REPORT/g, 'window.MARINA_REPORT'],
  [/giovane\.pdf/g, 'Relatorio_Claude.pdf'],
  [/<strong>Giovane Oliveira<\/strong><span>TI &amp; Helpdesk — FIC Capital<\/span>/g,
    '<strong>Marina Rodrigues</strong><span>Infraestrutura — FIC Capital Group</span>'],
  [
    /Relatório Mensal de Performance<br>Departamento de TI &amp; Helpdesk · Jun 2025/g,
    'RSA Dashboard de Tarefas · Planejamento · Execução · Controle<br>Relatório Semestral — Janeiro a Junho 2026',
  ],
  [/Lista completa de tarefas extraídas dos relatórios/g, 'Detalhamento de tarefas — infraestrutura (22 no semestre)'],
  [/Resumo executivo gerado a partir dos dados coletados/g, 'Resumo executivo · RSA 1S2026 · FIC Capital Group'],
  [/alt="Giovane Oliveira"/g, 'alt="Marina Rodrigues"'],
  [/suggestedMax:35/g, 'suggestedMax:14'],
];

for (const [re, rep] of replacements) html = html.replace(re, rep);

if (!html.includes('infraestrutura-theme.css')) {
  html = html.replace('</style>\n</head>', '</style>\n<link rel="stylesheet" href="infraestrutura-theme.css"/>\n</head>');
}

html = html.replace(
  '<script src="members-registry.js"></script>\n<script src="hdr-linkedin.js"></script>',
  '<script src="members-registry.js"></script>\n<script src="view-area.js"></script>\n<script src="hdr-linkedin.js"></script>'
);

fs.writeFileSync(path.join(root, 'marina.html'), html, 'utf8');
console.log('Wrote marina.html', html.length, 'bytes');
