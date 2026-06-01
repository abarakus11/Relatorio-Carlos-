import fs from 'fs';
import path from 'path';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
let html = fs.readFileSync(path.join(root, 'samara.html'), 'utf8');

const replacements = [
  [/Dashboard Executivo — Samara Gomes/g, 'Dashboard Executivo — Emilly Dantas'],
  [/Samara Gomes · Abr–Jul 2026/g, 'Emilly Dantas · RSA Dashboard 2026 · Jan–Jun 2026'],
  [/data-profile-samara/g, 'data-profile-emilly'],
  [/<body class="page-comercial">/g, '<body class="page-comercial page-emilly">'],
  [/\/assets\/comercial-bg\.jpg/g, 'assets/emilly-bg.png'],
  [/\/samara-gomes-perfil\.jpg/g, ''],
  [/Relatório de Atividades · Abr–Jul 2026/g, 'Relatório Semestral · RSA Dashboard 2026'],
  [/Samara <span>Gomes<\/span>/g, 'Emilly <span>Dantas</span>'],
  [/BDR · Comercial &nbsp;·&nbsp; Legalcert/g, 'Senior Integration Agent &nbsp;·&nbsp; Administração &amp; Financeiro'],
  [/Equipe comercial/g, 'Equipe financeiro'],
  [/<li class="hdr-equipe-item" role="listitem"><a href="samara\.html">Samara Gomes<\/a><\/li>\s*<li class="hdr-equipe-item" role="listitem"><span class="hdr-area-name">Giovana Cabral<\/span><\/li>/g,
    '<li class="hdr-equipe-item" role="listitem"><a href="emilly.html">Emilly Dantas</a></li>\n              <li class="hdr-equipe-item" role="listitem"><a href="paulo-robson.html">Paulo Robson</a></li>'],
  [/Indicadores de Performance/g, 'Indicadores do Portfólio'],
  [/Indicadores do período 07\/04\/2026 – 01\/06\/2026/g, 'RSA Dashboard 2026 · Janeiro a Junho 2026 · fonte: Relatorio_Claude.pdf'],
  [/samara-data\.js/g, 'emilly-data.js'],
  [/profile-photo-samara\.js/g, 'profile-photo-emilly.js'],
  [/window\.SAMARA_REPORT/g, 'window.EMILLY_REPORT'],
  [/samara relatorio\.docx/g, 'Relatorio_Claude.pdf / RSA Dashboard 2026'],
  [/<strong>Samara Gomes<\/strong><span>BDR — Business Development Representative<\/span>/g,
    '<strong>Emilly Dantas</strong><span>Senior Integration Agent — FIC Capital Group</span>'],
  [/Relatório de Atividades<br>BDR · Comercial · Legalcert · Jul 2026/g,
    'RSA Dashboard 2026 · Task Management<br>Relatório Semestral — Janeiro a Junho 2026'],
  [/Lista completa de tarefas extraídas dos relatórios/g, 'Amostra das demandas do portfólio institucional (246 no total)'],
  [/alt="Samara Gomes"/g, 'alt="Emilly Dantas"'],
  [/ct\.textContent=`Exibindo \$\{tasks\.length\} de \$\{TASKS\.length\} tarefas registradas`;/,
    'ct.textContent=`Exibindo ${tasks.length} amostras · portfólio RSA Dashboard 2026: 246 demandas no total`;'],
  [/Registro de Atividades/g, 'Registro de Tarefas'],
  [/Timeline de Projetos/g, 'Timeline do Semestre'],
  [/Principais marcos e entregas ao longo do período analisado/g, 'Marcos do 1º semestre 2026 — Janeiro a Junho'],
  [/Competências Técnicas/g, 'Competências &amp; Integração'],
  [/Estimativa percentual baseada na frequência e complexidade das atividades identificadas/g,
    'Capacidades desenvolvidas no semestre — gestão de portfólio e finanças'],
];

for (const [re, rep] of replacements) html = html.replace(re, rep);

// Chart card subtitles (Samara monthly → Emilly 6 months)
html = html.replace(
  '<p>Tarefas entregues mês a mês</p>',
  '<p>Volume de entregas por mês · Jan–Jun 2026</p>'
);
html = html.replace(
  '<p>Distribuição proporcional</p>',
  '<p>Situação das 246 demandas do portfólio</p>'
);
html = html.replace(
  '<h3>Por Categoria</h3>',
  '<h3>Por Status</h3>'
);
html = html.replace(
  '<h3>Volume por Mês</h3>',
  '<h3>Volume por Mês</h3>'
);
html = html.replace(
  '<p>Comparação barras</p>',
  '<p>Comparativo Jan–Jun 2026</p>'
);
html = html.replace(
  '<h3>Top Atividades Recorrentes</h3>',
  '<h3>Top Entregas Recorrentes</h3>'
);
html = html.replace(
  '<p>Ranking das demandas mais frequentes</p>',
  '<p>Principais tipos de demanda no semestre</p>'
);

// Suggested max for 6-month data
html = html.replace(/suggestedMax:35/g, 'suggestedMax:55');

fs.writeFileSync(path.join(root, 'emilly.html'), html, 'utf8');
console.log('Wrote emilly.html', html.length, 'bytes');
