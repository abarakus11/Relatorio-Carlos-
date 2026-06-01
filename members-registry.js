/* Cadastro de colaboradores — FIC Capital Group (perfis e menu Áreas) */
(function () {
  'use strict';

  const AREA_LABELS = {
    tecnologia: 'Tecnologia',
    comercial: 'Comercial',
    marketing: 'Marketing',
    financeiro: 'Financeiro',
    infraestrutura: 'Infraestrutura',
    juridico: 'Jurídico',
  };

  const ROLE_BY_AREA = {
    tecnologia: 'Tecnologia',
    comercial: 'Comercial',
    marketing: 'Marketing',
    financeiro: 'Financeiro',
    infraestrutura: 'Infraestrutura',
    juridico: 'Jurídico',
  };

  /** @type {Array<{id:string,slug:string,name:string,first:string,last:string,area:string,role?:string,subtitle?:string,initials:string,badge?:string,hasReport:boolean,accent?:[string,string]}>} */
  const PEOPLE = [
    { id: 'carlos', slug: 'index.html', name: 'Carlos Eber Santos', first: 'Carlos Eber', last: 'Santos', area: 'tecnologia', role: 'Tecnologia Sênior', subtitle: 'Infraestrutura & BPO', initials: 'CS', badge: 'Relatório de Performance Anual', hasReport: true },
    { id: 'giovane', slug: 'giovane.html', name: 'Giovane Oliveira', first: 'Giovane', last: 'Oliveira', area: 'tecnologia', role: 'TI & Helpdesk', subtitle: 'FIC Capital', initials: 'GO', badge: 'Relatório Mensal · Jun 2025', hasReport: true },
    { id: 'samara', slug: 'samara.html', name: 'Samara Gomes', first: 'Samara', last: 'Gomes', area: 'comercial', role: 'BDR', subtitle: 'Business Development Representative', initials: 'SG', badge: 'Relatório de Performance · Comercial', hasReport: true },
    { id: 'giovana', slug: 'giovana.html', name: 'Giovana Cabral', first: 'Giovana', last: 'Cabral', area: 'comercial', initials: 'GC', hasReport: false },
    { id: 'luan', slug: 'luan.html', name: 'Luan Carlos', first: 'Luan', last: 'Carlos', area: 'marketing', initials: 'LC', hasReport: false },
    { id: 'adrian', slug: 'adrian.html', name: 'Adrian Pontes', first: 'Adrian', last: 'Pontes', area: 'marketing', initials: 'AP', hasReport: false },
    { id: 'gabriel', slug: 'gabriel.html', name: 'Gabriel Viana', first: 'Gabriel', last: 'Viana', area: 'marketing', role: 'Head de Marketing', subtitle: 'Legalcert & RWB Agri Invest', initials: 'GV', badge: 'Relatório de Performance · Marketing', hasReport: true },
    { id: 'emilly', slug: 'emilly.html', name: 'Emilly Dantas', first: 'Emilly', last: 'Dantas', area: 'financeiro', role: 'Senior Integration Agent', subtitle: 'Administração & Financeiro', initials: 'ED', badge: 'Relatório Semestral · RSA Dashboard 2026', hasReport: true },
    { id: 'paulo', slug: 'paulo-robson.html', name: 'Paulo Robson', first: 'Paulo', last: 'Robson', area: 'financeiro', initials: 'PR', hasReport: false },
    { id: 'jorge', slug: 'jorge.html', name: 'Jorge Buarque', first: 'Jorge', last: 'Buarque', area: 'infraestrutura', initials: 'JB', hasReport: false },
    { id: 'hugo', slug: 'hugo.html', name: 'Hugo Legramandi', first: 'Hugo', last: 'Legramandi', area: 'infraestrutura', initials: 'HL', hasReport: false },
    { id: 'carolina', slug: 'carolina.html', name: 'Carolina', first: 'Carolina', last: '', area: 'juridico', initials: 'CA', hasReport: false },
    { id: 'rafaela', slug: 'rafaela.html', name: 'Rafaela Dupont', first: 'Rafaela', last: 'Dupont', area: 'juridico', initials: 'RD', hasReport: false },
  ];

  PEOPLE.forEach((p) => {
    if (!p.role) p.role = ROLE_BY_AREA[p.area] || 'FIC Capital Group';
    if (!p.subtitle) p.subtitle = 'FIC Capital Group';
    if (!p.badge) p.badge = p.hasReport ? 'Relatório de Performance' : 'Perfil · FIC Capital Group';
    if (!p.accent) {
      const accents = {
        tecnologia: ['#4d8fff', '#10e8a0'],
        comercial: ['#d4a5b8', '#e8b4cc'],
        marketing: ['#9d6fff', '#ff5fa0'],
        financeiro: ['#4d8fff', '#10e8a0'],
        infraestrutura: ['#00d4ff', '#4d8fff'],
        juridico: ['#ff8f3f', '#ffe066'],
      };
      p.accent = accents[p.area] || ['#4d8fff', '#00d4ff'];
    }
  });

  const bySlug = Object.fromEntries(PEOPLE.map((p) => [p.slug, p]));
  const byId = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));

  const byArea = {};
  Object.keys(AREA_LABELS).forEach((key) => {
    byArea[key] = PEOPLE.filter((p) => p.area === key).map((p) => ({
      name: p.name,
      href: p.slug,
    }));
  });

  function memberFromPath() {
    const path = (location.pathname || '').split('/').pop() || 'index.html';
    return bySlug[path] || null;
  }

  function avatarSvg(initials, c1, c2) {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
      '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' + c1 + '"/><stop offset="100%" stop-color="' + c2 + '"/></linearGradient></defs>' +
      '<rect width="200" height="200" fill="#0d1526"/>' +
      '<circle cx="100" cy="100" r="72" fill="url(#g)" opacity=".35"/>' +
      '<text x="100" y="112" text-anchor="middle" font-family="system-ui,sans-serif" font-size="' +
      (initials.length > 2 ? '44' : '52') +
      '" font-weight="600" fill="#f0f4ff">' +
      initials +
      '</text></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function applyAvatars() {
    PEOPLE.forEach((p) => {
      const src = avatarSvg(p.initials, p.accent[0], p.accent[1]);
      document.querySelectorAll('[data-profile="' + p.id + '"]').forEach((el) => {
        el.src = src;
        el.alt = p.name;
      });
    });
  }

  window.FIC_MEMBERS = {
    AREA_LABELS,
    PEOPLE,
    bySlug,
    byId,
    byArea,
    memberFromPath,
    avatarSvg,
    applyAvatars,
  };
})();
