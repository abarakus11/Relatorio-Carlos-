/**
 * Extrai dados de remixed-4609b962.html e gera paulo-data.js + paulo-robson.html
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = process.argv[2] || 'C:\\Users\\FIC\\Downloads\\remixed-4609b962.html';
const htmlSrc = fs.readFileSync(srcPath, 'utf8');

const start = htmlSrc.indexOf('const D = ');
if (start < 0) throw new Error('Objeto D não encontrado no HTML fonte');
const jsonStart = htmlSrc.indexOf('{', start);
let depth = 0;
let end = jsonStart;
for (; end < htmlSrc.length; end++) {
  const ch = htmlSrc[end];
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0) break;
  }
}
const D = JSON.parse(htmlSrc.slice(jsonStart, end + 1));

const MONTHS = { '01': 'jan', '02': 'fev', '03': 'mar', '04': 'abr', '05': 'mai', '06': 'jun', '07': 'jul', '08': 'ago', '09': 'set', '10': 'out', '11': 'nov', '12': 'dez' };

function parseMon(pz) {
  if (!pz || !pz.includes('/')) return 'jan26';
  const [, mm, yy] = pz.split('/');
  return (MONTHS[mm] || 'jan') + String(yy).slice(-2);
}

function parseDt(pz) {
  if (!pz || !pz.includes('/')) return '—';
  const [dd, mm] = pz.split('/');
  return `${dd}/${mm}`;
}

function mapStatus(s) {
  return ({ 'A Fazer': 'afazer', 'Em Execução': 'andamento', Standby: 'standby', Concluído: 'concluido' }[s] || 'afazer');
}

function mapPri(p) {
  const x = (p || 'Prioridade').toLowerCase();
  if (x.includes('urgent')) return 'urgente';
  if (x.includes('emerg')) return 'emergente';
  return 'prioridade';
}

function brl(v) {
  if (v >= 1e6) return 'R$ ' + (v / 1e6).toFixed(1).replace('.', ',') + ' mi';
  if (v >= 1e3) return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
}

const statusOrder = ['A Fazer', 'Em Execução', 'Standby', 'Concluído'];
const statusCounts = statusOrder.map((s) => D.tarefas_detalhe.filter((t) => t.s === s).length);
const totalConcl = D.tarefas.linhas.reduce((s, r) => s + r[4], 0);
const aFazer = statusCounts[0];
const emExec = statusCounts[1];
const standby = statusCounts[2];
const concluido = statusCounts[3];
const atrasadas = D.tarefas_detalhe.filter((t) => t.atr).length;

const monKeys = ['jan26', 'fev26', 'mar26', 'abr26', 'mai26', 'jun26'];
const monLabels = ['Jan/26', 'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26'];
const monCounts = monKeys.map((mk) => D.tarefas_detalhe.filter((t) => t.s === 'Concluído' && parseMon(t.pz) === mk).length);

const empCounts = {};
D.tarefas_detalhe.forEach((t) => {
  const e = t.e === '—' ? 'Grupo' : t.e;
  empCounts[e] = (empCounts[e] || 0) + 1;
});
const topEmp = Object.entries(empCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

const TASKS = D.tarefas_detalhe.map((t) => ({
  name: t.t,
  cat: mapStatus(t.s),
  status: mapStatus(t.s),
  pri: mapPri(t.p),
  co: t.e === '—' ? 'GRUPO' : t.e,
  mon: parseMon(t.pz),
  dt: parseDt(t.pz),
  desc: t.d,
  atr: t.atr,
}));

const report = {
  CATMAP: {
    afazer: { color: '#ffe066', label: 'A Fazer' },
    andamento: { color: '#4d8fff', label: 'Em Execução' },
    standby: { color: '#9d6fff', label: 'Standby' },
    concluido: { color: '#10e8a0', label: 'Concluído' },
  },
  KPIS: [
    { ic: '📋', label: 'Total de Entregas', val: '128', sub: '106 operacionais + 22 em destaque', color: '#ffe066' },
    { ic: '✅', label: 'Tarefas Concluídas', val: String(concluido), sub: `${totalConcl} no consolidado por empresa`, color: '#10e8a0' },
    { ic: '⚙️', label: 'Em Execução', val: String(emExec), sub: 'Demandas ativas no período', color: '#4d8fff' },
    { ic: '📥', label: 'A Fazer / Standby', val: String(aFazer + standby), sub: `${aFazer} a fazer · ${standby} standby`, color: '#9d6fff' },
    { ic: '💰', label: 'Receita de Impostos', val: brl(D.receita_impostos.total), sub: 'Liquidação tributária · Jan–Mai/2026', color: '#ffe066' },
    { ic: '📊', label: 'Despesa do Setor', val: brl(D.despesa_setor), sub: `${((D.despesa_setor / D.receita_impostos.total) * 100).toFixed(1)}% sobre receita`, color: '#ff8f3f' },
    { ic: '🚀', label: 'Pro Invest', val: '9', sub: 'R$ 390 mi em pipeline de aporte', color: '#00d4ff' },
    { ic: '🤝', label: 'Prospecções', val: String(D.prospec.prospec.length), sub: `${D.prospec.prospec.filter((x) => x[3] === 'Deal').length} deals LegalCert`, color: '#9d6fff' },
  ],
  MON_L: monLabels,
  MON_D: monCounts,
  CAT_L: ['A Fazer', 'Em Execução', 'Standby', 'Concluído'],
  CAT_D: statusCounts,
  CAT_C: ['#ffe066', '#4d8fff', '#9d6fff', '#10e8a0'],
  TOP_L: topEmp.map((x) => x[0]),
  TOP_D: topEmp.map((x) => x[1]),
  SKILLS: [
    { nm: '🏛️ Controlling & Governança', pct: 96, c: '#ffe066' },
    { nm: '⚖️ Liquidação / Precatórios', pct: 94, c: '#10e8a0' },
    { nm: '📈 Pro Invest & Captação', pct: 90, c: '#4d8fff' },
    { nm: '📑 Radar Benefits / Nota Fatura', pct: 92, c: '#00d4ff' },
    { nm: '💼 Conta Azul & ERP', pct: 88, c: '#ff8f3f' },
    { nm: '🤝 Prospecção Comercial', pct: 85, c: '#9d6fff' },
    { nm: '📊 Análise Financeira', pct: 93, c: '#ffe066' },
    { nm: '🏢 Gestão Multiempresa', pct: 95, c: '#10e8a0' },
  ],
  TL: [
    { dt: 'Jan/2026', co: 'LEGALCERT', cc: '#ffe066', ttl: 'Início RSA 2026 — controlling do grupo', desc: 'Consolidação financeira, protocolos e operação Radar Benefits em múltiplas empresas.' },
    { dt: 'Fev/2026', co: 'FIC CAPITAL', cc: '#4d8fff', ttl: 'Dashboards ERP 2025/2026', desc: 'Dashboards de despesas, receita e investimentos; fechamento contábil FIC.' },
    { dt: 'Mar/2026', co: 'LEGALCERT', cc: '#10e8a0', ttl: 'Pico de prospecções — 24 deals', desc: '52 prospecções no semestre; intensificação comercial LegalCert Advisor.' },
    { dt: 'Mar/2026', co: 'PRO INVEST', cc: '#00d4ff', ttl: 'Pipeline Pro Invest — Tec Vidro R$ 270 mi', desc: 'Demonstração DCF e reuniões com diretoria para captação de capital.' },
    { dt: 'Abr/2026', co: 'CYBERGLASS', cc: '#9d6fff', ttl: 'Parecer jurídico-econômico (119 p.)', desc: 'Entrega do parecer sobre liquidação de ICMS via precatórios estaduais.' },
    { dt: 'Mai/2026', co: 'GRUPO GPR', cc: '#ff8f3f', ttl: 'Receita recorrente R$ 10 mil/mês', desc: 'Contrato SEC Finanças fechado — receita contratada a partir de maio/2026.' },
    { dt: 'Jun/2026', co: 'LEGALCERT', cc: '#ffe066', ttl: 'Relatório semestral RSA', desc: `${concluido} tarefas detalhadas · ${atrasadas} atrasadas · 14 empresas sob gestão.` },
  ],
  ACH: [
    { icon: 'trophy', ttl: 'Entregas Totais', val: '128', accent: '#ffe066', ds: '106 tarefas operacionais + 22 entregas em destaque' },
    { icon: 'metric', ttl: 'Receita Impostos', val: brl(D.receita_impostos.total), accent: '#10e8a0', ds: 'Faturamento por liquidação tributária · Jan–Mai/2026' },
    { icon: 'org', ttl: 'Empresas', val: '14', accent: '#4d8fff', ds: 'Protocolos financeiros padronizados no grupo' },
    { icon: 'layers', ttl: 'Pro Invest', val: 'R$ 390 mi', accent: '#00d4ff', ds: '9 projetos em pipeline de captação' },
    { icon: 'alert', ttl: 'Atrasadas', val: String(atrasadas), accent: '#ff5a5a', ds: 'Tarefas com prazo vencido no período' },
    { icon: 'calendar', ttl: 'GCAP Oportunidade', val: brl(D.oportunidade_gcap.total_venda), accent: '#9d6fff', ds: 'Valor estimado de venda com precatórios federais' },
  ],
  ANALYSIS: [
    {
      feat: true, wide: false, icon: 'exec', accent: '#ffe066', ttl: 'Resumo Executivo',
      body: `<p><strong>Paulo Robson Aparecido Ferreira</strong> atua como <strong>Director of Controlling</strong> no FIC Capital Group (1º semestre/2026). Responsável pela gestão financeira do grupo com <strong>128 entregas</strong>, receita de impostos de <strong>${brl(D.receita_impostos.total)}</strong>, <strong>14 protocolos financeiros</strong> e pipeline Pro Invest de <strong>R$ 390 milhões</strong>.</p>`,
    },
    {
      feat: false, wide: false, icon: 'user', accent: '#4d8fff', ttl: 'Perfil Profissional',
      body: '<p>Controller sênior com foco em liquidação tributária via precatórios, governança financeira multiempresa, captação Pro Invest, operação Radar Benefits e integração Conta Azul/ERP.</p>',
    },
    {
      feat: false, wide: false, icon: 'scope', accent: '#10e8a0', ttl: 'Principais Frentes',
      body: '<ul class="an-list"><li>Controlling e fechamento contábil do grupo</li><li>Radar Benefits — notas fatura e MIT</li><li>Pro Invest — captação e due diligence</li><li>Prospecção comercial LegalCert (52 reuniões)</li><li>Protocolos financeiros (14 empresas)</li><li>Casos estratégicos — precatórios e defesa tributária</li></ul>',
    },
    {
      feat: false, wide: false, icon: 'strength', accent: '#ffe066', ttl: 'Destaques do Semestre',
      body: '<ul class="an-list"><li>Framework de 14 Protocolos de Procedimento Financeiro (~46.700 palavras)</li><li>Migração Excel → Conta Azul (contas a pagar/receber)</li><li>Parecer CYBERGLASS — 119 páginas</li><li>Receita recorrente GPR — R$ 10 mil/mês</li><li>9 projetos Pro Invest em andamento</li></ul>',
    },
    {
      feat: false, wide: false, icon: 'stack', accent: '#00d4ff', ttl: 'Indicadores Financeiros',
      body: `<ul class="an-list"><li>Receita impostos: ${brl(D.receita_impostos.total)}</li><li>Despesa setor financeiro: ${brl(D.despesa_setor)}</li><li>Margem operacional setor: ${((D.despesa_setor / D.receita_impostos.total) * 100).toFixed(1)}% sobre receita</li><li>1.534 lançamentos contábeis no período</li><li>Oportunidade GCAP: ${brl(D.oportunidade_gcap.total_venda)}</li></ul>`,
    },
    {
      feat: true, wide: true, icon: 'impact', accent: '#ff8f3f', ttl: 'Impacto para a Organização',
      body: '<p>Padronizou a <strong>governança financeira</strong> de todo o grupo FIC, centralizou controles no Conta Azul, estruturou pipeline de captação Pro Invest e manteve operação recorrente Radar Benefits em dezenas de clientes — sustentando receita de impostos e preparando expansão internacional (PDI 2º semestre).</p>',
    },
  ],
  TASKS,
  FINANCE: {
    receitaImpostos: D.receita_impostos,
    despesaSetor: D.despesa_setor,
    resultMes: D.result_mes,
    custoOper: D.custo_oper,
    custoDetalhe: D.custo_detalhe,
    impLabels: D.receita_impostos.lista.map((x) => x.imp),
    impData: D.receita_impostos.lista.map((x) => x.valor),
  },
  PROJETOS: D.projetos,
  PROSPEC: D.prospec,
  GCAP: D.oportunidade_gcap,
  CASOS: D.casos_estrategicos,
  PROTOCOLOS: D.protocolos,
  PDI: D.pdi,
  TAREFAS_EMPRESA: D.tarefas.linhas,
};

const dataJs =
  '/* Dados — Paulo Robson · Relatório Semestral RSA 2026 · Jan–Mai/2026 */\nwindow.PAULO_REPORT = ' +
  JSON.stringify(report, null, 2) +
  ';\n';

fs.writeFileSync(path.join(__dirname, 'paulo-data.js'), dataJs, 'utf8');
console.log('Wrote paulo-data.js —', TASKS.length, 'tarefas');

/* ── HTML a partir de emilly.html ── */
let html = fs.readFileSync(path.join(__dirname, 'emilly.html'), 'utf8');

const reps = [
  [/Dashboard Executivo — Emilly Dantas/g, 'Dashboard Executivo — Paulo Robson'],
  [/Emilly Dantas · RSA Dashboard 2026 · Jan–Jun 2026/g, 'Paulo Robson · RSA 2026 · Jan–Mai/2026'],
  [/data-profile-paulo/g, 'data-profile="paulo"'],
  [/<body class="page-comercial page-emilly">/g, '<body class="page-financeiro">'],
  [/assets\/emilly-bg\.png/g, 'assets/tecnologia-bg.png'],
  [/Relatório Semestral · RSA Dashboard 2026/g, 'Relatório Semestral · RSA 2026'],
  [/Emilly <span>Dantas<\/span>/g, 'Paulo <span>Robson</span>'],
  [/Senior Integration Agent &nbsp;·&nbsp; Administração &amp; Financeiro/g, 'Director of Controlling &nbsp;·&nbsp; Gestão Financeira do Grupo'],
  [/Equipe administrativo/g, 'Equipe financeiro'],
  [/<li class="hdr-equipe-item" role="listitem"><a href="emilly\.html">Emilly Dantas<\/a><\/li>/g,
    '<li class="hdr-equipe-item" role="listitem"><a href="emilly.html">Emilly Dantas</a></li>\n              <li class="hdr-equipe-item" role="listitem"><span class="hdr-area-name">Paulo Robson</span></li>'],
  [/Indicadores do Portfólio/g, 'Indicadores de Performance'],
  [/RSA Dashboard 2026 · Janeiro a Junho 2026 · fonte: Relatorio_Claude\.pdf/g, 'RSA 2026 · Janeiro a Maio 2026 · LEGALCERT / FIC Capital Group'],
  [/Visualização interativa do volume de entregas e distribuição por área/g, 'Volume de entregas, status das tarefas e indicadores financeiros do controlling'],
  [/Volume de entregas por mês · Jan–Jun 2026/g, 'Conclusões por mês · Jan–Jun 2026'],
  [/Situação das 246 demandas do portfólio/g, 'Distribuição por status — módulo Financeiro'],
  [/Comparativo Jan–Jun 2026/g, 'Comparativo mensal · 1º semestre 2026'],
  [/Principais tipos de demanda no semestre/g, 'Empresas com maior volume de tarefas'],
  [/Competências &amp; Integração/g, 'Competências &amp; Controlling'],
  [/Capacidades desenvolvidas no semestre — gestão de portfólio e finanças/g, 'Competências do Director of Controlling — finanças, captação e governança'],
  [/Marcos do 1º semestre 2026 — Janeiro a Junho/g, 'Marcos do 1º semestre 2026 — Janeiro a Maio'],
  [/emilly-data\.js/g, 'paulo-data.js'],
  [/profile-photo-emilly\.js/g, 'members-registry.js'],
  [/window\.EMILLY_REPORT/g, 'window.PAULO_REPORT'],
  [/<strong>Emilly Dantas<\/strong><span>Senior Integration Agent — FIC Capital Group<\/span>/g,
    '<strong>Paulo Robson Aparecido Ferreira</strong><span>Director of Controlling — FIC Capital Group</span>'],
  [/RSA Dashboard 2026 · Task Management<br>Relatório Semestral — Janeiro a Junho 2026/g,
    'RSA 2026 · LEGALCERT<br>Relatório Semestral — Janeiro a Maio 2026'],
  [/Amostra das demandas do portfólio institucional \(246 no total\)/g, 'Lista detalhada de tarefas do módulo Financeiro (90 documentadas)'],
  [/alt="Emilly Dantas"/g, 'alt="Paulo Robson"'],
  [/suggestedMax:55/g, 'suggestedMax:25'],
  [/ct\.textContent=`Exibindo \$\{tasks\.length\} amostras · portfólio RSA Dashboard 2026: 246 demandas no total`;/,
    'ct.textContent=`Exibindo ${tasks.length} de ${TASKS.length} tarefas documentadas no relatório semestral`;'],
];

for (const [re, rep] of reps) html = html.replace(re, rep);

/* Cores dos gráficos — tema financeiro (dourado) */
html = html.replace(/const CHART_ROSE='#d4a5b8';/g, "const CHART_ROSE='#ffe066';");
html = html.replace(/const CHART_BLUSH='rgba\(212,165,184,\.35\)';/g, "const CHART_BLUSH='rgba(255,224,102,.35)';");
html = html.replace(/Chart\.defaults\.color='#d4b8c4';/g, "Chart.defaults.color='#c8b888';");
html = html.replace(/backgroundColor:'#2a1822'/g, "backgroundColor:'#1a1810'");
html = html.replace(/borderColor:'rgba\(232,180,204,\.25\)'/g, "borderColor:'rgba(255,224,102,.25)'");
html = html.replace(/titleColor:'#fdf6f9'/g, "titleColor:'#fff8e8'");
html = html.replace(/bodyColor:'#d4b8c4'/g, "bodyColor:'#c8b888'");
html = html.replace(/backgroundColor:\['#d4a5b8','#9ec9b0','#c4a8dc','#e8c0a8','#e8b4cc','#f0a8c4','#e8d8b0','#e8a0a8'\]/g,
  "backgroundColor:['#ffe066','#10e8a0','#4d8fff','#ff8f3f','#9d6fff','#00d4ff','#ff5a5a','#c8b888']");

/* Seções extras: financeiro, projetos, PDI */
const extraSections = `
<!-- INDICADORES FINANCEIROS -->
<section class="sec" id="sec-finance">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Indicadores Financeiros</h2>
        <p>Receita de impostos, despesa do setor e resultado mensual · Jan–Mai/2026</p>
      </div>
    </div>
    <div class="charts-r1">
      <div class="crd crd-live reveal">
        <div class="crd-hd"><div><h3>Receita por Imposto</h3><p>Distribuição da receita de liquidação tributária</p></div></div>
        <canvas id="cFinImp"></canvas>
      </div>
      <div class="crd crd-live reveal">
        <div class="crd-hd"><div><h3>Receita × Despesa</h3><p>Resultado mensal do setor financeiro</p></div></div>
        <canvas id="cFinMes"></canvas>
      </div>
    </div>
    <div class="charts-r2" style="padding-top:20px">
      <div class="crd crd-live reveal">
        <div class="crd-hd"><div><h3>Custo Operacional</h3><p>Despesa do setor financeiro por mês</p></div></div>
        <canvas id="cFinCusto"></canvas>
      </div>
      <div class="crd crd-live reveal">
        <div class="crd-hd"><div><h3>Casos Estratégicos</h3><p>Entregas em destaque do semestre</p></div></div>
        <div id="casosGrid" class="ach-grid" style="padding:16px 0"></div>
      </div>
    </div>
  </div>
</section>

<!-- PROJETOS & PROSPECÇÕES -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Projetos &amp; Prospecções</h2>
        <p>Pipeline Pro Invest, Radar Benefits e prospecções comerciais</p>
      </div>
    </div>
    <div class="anal-grid" id="projGrid"></div>
  </div>
</section>

<!-- PDI -->
<section class="sec">
  <div class="wrap">
    <div class="sec-hd reveal">
      <div class="sec-hd-inner">
        <h2>Plano de Desenvolvimento Individual</h2>
        <p>Objetivos para o 2º semestre de 2026</p>
      </div>
    </div>
    <div class="task-grid" id="pdiGrid"></div>
  </div>
</section>
`;

html = html.replace('<!-- FOOTER -->', extraSections + '\n<!-- FOOTER -->');

const extraScript = `
/* ── Financeiro, projetos, PDI ── */
const { FINANCE, PROJETOS, PROSPEC, GCAP, CASOS, PDI } = window.PAULO_REPORT;
const finColors = ['#ffe066','#ff8f3f','#10e8a0','#4d8fff','#9d6fff','#00d4ff','#c8b888'];

new Chart(document.getElementById('cFinImp'),{
  type:'doughnut',
  data:{labels:FINANCE.impLabels,datasets:[{data:FINANCE.impData,backgroundColor:finColors,borderColor:'#1a1810',borderWidth:3}]},
  options:{responsive:true,animation:false,cutout:'55%',plugins:{legend:{position:'bottom',labels:{padding:8,font:{size:10}}}}}
});
new Chart(document.getElementById('cFinMes'),{
  type:'bar',
  data:{labels:FINANCE.resultMes.map(m=>m.mes),datasets:[
    {label:'Receita',data:FINANCE.resultMes.map(m=>m.rec),backgroundColor:'rgba(255,224,102,.75)'},
    {label:'Despesa',data:FINANCE.resultMes.map(m=>m.desp),backgroundColor:'rgba(255,90,90,.55)'},
  ]},
  options:{responsive:true,animation:false,plugins:{legend:{position:'bottom'}},scales:{y:{ticks:{callback:v=>'R$ '+(v/1000)+'k'}}}}
});
new Chart(document.getElementById('cFinCusto'),{
  type:'bar',
  data:{labels:FINANCE.custoOper.map(m=>m.mes),datasets:[{label:'Custo',data:FINANCE.custoOper.map(m=>m.valor),backgroundColor:'rgba(255,143,63,.7)',borderRadius:6}]},
  options:{responsive:true,animation:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:v=>'R$ '+(v/1000)+'k'}}}}
});

const casosGrid=document.getElementById('casosGrid');
CASOS.slice(0,4).forEach(c=>{
  casosGrid.innerHTML+=\`<article class="ach reveal" style="--ach-accent:#ffe066">
    <header class="ach-hd"><div class="ach-meta"><h3 class="ach-ttl">\${c.titulo}</h3></div></header>
    <p class="ach-ds">\${c.cliente} · \${c.status}</p></article>\`;
});

const projGrid=document.getElementById('projGrid');
projGrid.innerHTML=\`
<article class="an reveal an--wide" style="--an-accent:#ffe066">
  <header class="an-hd"><div class="an-meta"><h3 class="an-ttl">Pro Invest — \${PROJETOS.proinvest.length} projetos · R$ 390 mi</h3></div></header>
  <div class="an-bd"><ul class="an-list">\${PROJETOS.proinvest.map(p=>'<li><strong>'+p.n+'</strong> — '+p.aporte+' · '+p.fase+'</li>').join('')}</ul></div>
</article>
<article class="an reveal" style="--an-accent:#10e8a0">
  <header class="an-hd"><div class="an-meta"><h3 class="an-ttl">Radar Benefits</h3></div></header>
  <div class="an-bd"><p>\${PROJETOS.radar.map(p=>p.n).join('; ')}</p></div>
</article>
<article class="an reveal" style="--an-accent:#4d8fff">
  <header class="an-hd"><div class="an-meta"><h3 class="an-ttl">Prospecções (\${PROSPEC.prospec.length})</h3></div></header>
  <div class="an-bd"><p>\${PROSPEC.prospec.length} reuniões jan–mai · \${PROSPEC.prospec.filter(x=>x[3]==='Deal').length} deals · \${PROSPEC.canceladas.length} canceladas</p></div>
</article>
<article class="an reveal" style="--an-accent:#9d6fff">
  <header class="an-hd"><div class="an-meta"><h3 class="an-ttl">Oportunidade GCAP</h3></div></header>
  <div class="an-bd"><p>4 precatórios · face R$ \${GCAP.total_prec.toLocaleString('pt-BR')} · venda estimada R$ \${GCAP.total_venda.toLocaleString('pt-BR')}</p></div>
</article>\`;

const pdiGrid=document.getElementById('pdiGrid');
PDI.forEach(p=>{
  const d=document.createElement('div');
  d.className='ti reveal';
  d.style.setProperty('--ti-accent','#ffe066');
  d.innerHTML=\`<div class="ti-dot" style="background:#ffe066"></div>
  <div style="flex:1"><div class="ti-nm">\${p.obj}</div>
  <div class="ti-meta"><span class="tbg" style="background:rgba(255,224,102,.12);color:#ffe066;border-color:rgba(255,224,102,.3)">\${p.prazo}</span></div>
  <p style="font-size:13px;color:var(--t1);margin-top:8px">\${p.acao}</p></div>\`;
  pdiGrid.appendChild(d);
});
`;

html = html.replace('renderTasks(TASKS);', extraScript + '\nrenderTasks(TASKS);');

/* Task render: usar status como cat */
html = html.replace(
  'const ci=CATMAP[t.cat]||{color:\'#9baac7\',label:t.cat};',
  'const ci=CATMAP[t.cat]||CATMAP[t.status]||{color:\'#9baac7\',label:t.cat};'
);
html = html.replace(
  '<span class="tbg ${pc}">${t.pri}</span>',
  '<span class="tbg ${pc}">${t.pri}</span>${t.atr?\'<span class="tbg tb-urg">atrasada</span>\':\'\'}'
);
html = html.replace(
  '<span class="ti-dt">${t.dt}/26</span>',
  '<span class="ti-dt">${t.dt}</span>'
);

/* Script order: members-registry before inline for avatars */
html = html.replace(
  '<script src="paulo-data.js"></script>\n<script src="members-registry.js"></script>',
  '<script src="members-registry.js"></script>\n<script src="paulo-data.js"></script>\n<script src="profile-photo-paulo.js"></script>\n<script src="view-area.js"></script>\n<script src="hdr-linkedin.js"></script>\n<script src="areas-menu.js"></script>'
);

/* Remove duplicate scripts at bottom if emilly had them */
html = html.replace(/<script src="linkedin-urls\.js"><\/script>\s*<script src="members-registry\.js"><\/script>\s*<script src="view-area\.js"><\/script>\s*<script src="hdr-linkedin\.js"><\/script>\s*<script src="areas-menu\.js"><\/script>\s*<\/body>/,
  '</body>');

fs.writeFileSync(path.join(__dirname, 'paulo-robson.html'), html, 'utf8');
console.log('Wrote paulo-robson.html', html.length, 'bytes');
