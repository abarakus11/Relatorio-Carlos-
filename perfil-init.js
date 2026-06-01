/* Preenche cabeçalho / equipe / rodapé em páginas de perfil (aguardando relatório) */
(function () {
  'use strict';

  const { memberFromPath, byArea, applyAvatars } = window.FIC_MEMBERS || {};
  if (!memberFromPath) return;

  const m = memberFromPath();
  if (!m) return;

  document.title = 'Perfil — ' + m.name;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = m.name + ' · ' + m.role + ' · FIC Capital Group';

  if (m.area === 'comercial') document.body.classList.add('page-comercial');

  const badge = document.getElementById('profBadge');
  const h1Span = document.getElementById('profH1Span');
  const role = document.getElementById('profRole');
  const ftrName = document.getElementById('ftrName');
  const ftrRole = document.getElementById('ftrRole');

  if (badge) badge.textContent = m.badge;
  const h1First = document.getElementById('profH1First');
  if (h1First) h1First.textContent = m.first;
  if (h1Span) {
    if (m.last) {
      h1Span.textContent = m.last;
      h1Span.classList.add('hl');
    } else {
      h1Span.textContent = '';
      if (h1First) h1First.classList.add('hl');
    }
  }
  if (role) role.innerHTML = m.role + ' &nbsp;·&nbsp; ' + m.subtitle;

  document.querySelectorAll('[data-profile="stub"]').forEach((el) => {
    el.setAttribute('data-profile', m.id);
  });
  if (ftrName) ftrName.textContent = m.name;
  if (ftrRole) ftrRole.textContent = m.role + ' — ' + m.subtitle.replace(/ &/g, '');

  const menu = document.getElementById('equipeMenu');
  if (menu && byArea) {
    const list = byArea[m.area] || [];
    menu.innerHTML = list
      .map((person) => {
        const isCurrent = person.href === m.slug;
        if (isCurrent) {
          return '<li class="hdr-equipe-item" role="listitem"><span class="hdr-area-name">' + person.name + '</span></li>';
        }
        return '<li class="hdr-equipe-item" role="listitem"><a href="' + person.href + '">' + person.name + '</a></li>';
      })
      .join('');
    const areaLabel = window.FIC_MEMBERS.AREA_LABELS[m.area] || m.area;
    menu.setAttribute('aria-label', 'Equipe de ' + areaLabel);
  }

  applyAvatars();

  const now = new Date();
  const ftrDate = document.getElementById('ftrDate');
  if (ftrDate) {
    ftrDate.textContent = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  if (typeof window.applyHdrLinkedIn === 'function') window.applyHdrLinkedIn();
})();
