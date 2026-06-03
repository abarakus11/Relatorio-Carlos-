/* Contexto de área (?area=) — tema, fundo e menu Equipe */
(function () {
  'use strict';

  const PAGE_CLASSES = [
    'page-tecnologia',
    'page-comercial',
    'page-marketing',
    'page-juridico',
    'page-infraestrutura',
    'page-administrativo',
    'page-emilly',
  ];
  const THEME_CSS = {
    tecnologia: 'tecnologia-theme.css',
    marketing: 'marketing-theme.css',
    juridico: 'juridico-theme.css',
    infraestrutura: 'infraestrutura-theme.css',
    administrativo: 'administrativo-theme.css',
  };
  const AREA_BG = {
    tecnologia: 'assets/tecnologia-bg.png',
    marketing: 'assets/marketing-bg.png',
    juridico: 'assets/juridico-bg.png',
    infraestrutura: 'assets/infraestrutura-bg.png',
    administrativo: 'assets/administrativo-bg.png',
  };
  const BODY_CLASS = {
    tecnologia: 'page-tecnologia',
    comercial: 'page-comercial',
    marketing: 'page-marketing',
    juridico: 'page-juridico',
    infraestrutura: 'page-infraestrutura',
    administrativo: 'page-administrativo',
  };

  function rememberDefaultBg() {
    document.querySelectorAll('.page-bg img, .hdr-bg img').forEach((img) => {
      if (!img.dataset.defaultSrc) img.dataset.defaultSrc = img.getAttribute('src') || '';
    });
  }

  function ensureThemeStylesheet(areaKey) {
    const href = THEME_CSS[areaKey];
    if (!href || document.querySelector('link[data-area-theme="' + areaKey + '"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.areaTheme = areaKey;
    document.head.appendChild(link);
  }

  function applyAreaTheme(areaKey) {
    rememberDefaultBg();
    PAGE_CLASSES.forEach((c) => document.body.classList.remove(c));
    const cls = BODY_CLASS[areaKey];
    if (cls) document.body.classList.add(cls);

    if (THEME_CSS[areaKey]) ensureThemeStylesheet(areaKey);

    const bg = AREA_BG[areaKey];
    document.querySelectorAll('.page-bg img, .hdr-bg img').forEach((img) => {
      if (bg) img.src = bg;
      else if (img.dataset.defaultSrc) img.src = img.dataset.defaultSrc;
    });
  }

  function currentPageHref() {
    const path = (location.pathname || '').split('/').pop() || 'index.html';
    return path + location.search;
  }

  function isCurrentTeamLink(personHref) {
    const here = currentPageHref();
    const pathOnly = here.split('?')[0];
    if (personHref === here) return true;
    if (!location.search && personHref === pathOnly && personHref.indexOf('?') === -1) return true;
    return false;
  }

  function refreshEquipeMenu(member, viewArea) {
    const menu = document.getElementById('equipeMenu');
    const byArea = window.FIC_MEMBERS && window.FIC_MEMBERS.byArea;
    const labels = window.FIC_MEMBERS && window.FIC_MEMBERS.AREA_LABELS;
    if (!menu || !byArea) return;

    const list = byArea[viewArea] || [];
    menu.innerHTML = list
      .map((person) => {
        if (isCurrentTeamLink(person.href)) {
          return '<li class="hdr-equipe-item" role="listitem"><span class="hdr-area-name">' + person.name + '</span></li>';
        }
        return '<li class="hdr-equipe-item" role="listitem"><a href="' + person.href + '">' + person.name + '</a></li>';
      })
      .join('');
    const areaLabel = (labels && labels[viewArea]) || viewArea;
    menu.setAttribute('aria-label', 'Equipe de ' + areaLabel);
  }

  function initMemberViewArea() {
    const M = window.FIC_MEMBERS;
    if (!M || !M.memberFromPath) return;
    const member = M.memberFromPath();
    if (!member) return;

    const viewArea = M.viewAreaFromQuery(member);
    const areas = M.memberAreas(member);
    if (areas.length > 1 || viewArea !== member.area) {
      applyAreaTheme(viewArea);
    } else if (BODY_CLASS[viewArea] || AREA_BG[viewArea]) {
      applyAreaTheme(viewArea);
    }

    refreshEquipeMenu(member, viewArea);
  }

  window.FIC_VIEW_AREA = {
    applyAreaTheme,
    refreshEquipeMenu,
    initMemberViewArea,
    currentPageHref,
    isCurrentTeamLink,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMemberViewArea);
  } else {
    initMemberViewArea();
  }
})();
