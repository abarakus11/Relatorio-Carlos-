/* Ícone LinkedIn ao lado do nome no cabeçalho */
(function () {
  'use strict';

  const SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">' +
    '<path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a-1.999 1.999 0 1 1 0-3.998 1.999 1.999 0 0 1 0 3.998zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';

  if (!document.getElementById('hdr-linkedin-style')) {
    const style = document.createElement('style');
    style.id = 'hdr-linkedin-style';
    style.textContent =
      '.av-txt h1{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px}' +
      '.hdr-profile-links{display:inline-flex;align-items:center;gap:6px;margin-left:4px;vertical-align:middle}' +
      '.hdr-linkedin{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;' +
      'margin:0;padding:0;border:0;border-radius:8px;color:rgba(255,255,255,.78);background:transparent;' +
      'cursor:pointer;text-decoration:none;transition:color .2s,transform .2s,background .2s;flex-shrink:0}' +
      '.hdr-linkedin:hover{color:#fff;background:rgba(10,102,194,.4);transform:translateY(-1px)}' +
      '.hdr-linkedin:focus-visible{outline:2px solid rgba(0,212,255,.55);outline-offset:3px}' +
      'body.page-comercial .hdr-linkedin{color:rgba(245,230,238,.85)}' +
      'body.page-comercial .hdr-linkedin:hover{background:rgba(10,102,194,.45)}' +
      'body.page-administrativo .hdr-linkedin{color:rgba(232,255,240,.9)}' +
      'body.page-marketing .hdr-linkedin{color:rgba(184,240,255,.85)}' +
      'body.page-juridico .hdr-linkedin{color:rgba(255,232,200,.88)}' +
      'body.page-infraestrutura .hdr-linkedin{color:rgba(255,232,180,.9)}';
    document.head.appendChild(style);
  }

  function getMember() {
    return window.FIC_MEMBERS && window.FIC_MEMBERS.memberFromPath
      ? window.FIC_MEMBERS.memberFromPath()
      : null;
  }

  function resolveUrl() {
    const attr = document.body.getAttribute('data-linkedin');
    if (attr) return attr.trim();
    const m = getMember();
    if (!m) return '';
    if (m.linkedin) return String(m.linkedin).trim();
    return (
      'https://www.linkedin.com/search/results/people/?keywords=' +
      encodeURIComponent(m.name + ' FIC Capital')
    );
  }

  function applyHdrLinkedIn() {
    const url = resolveUrl();
    if (!url) return;

    const h1 = document.querySelector('.av-txt h1');
    if (!h1) return;

    let wrap = h1.querySelector('.hdr-profile-links');
    if (!wrap) {
      wrap = document.createElement('span');
      wrap.className = 'hdr-profile-links';
      h1.appendChild(wrap);
    }

    let link = wrap.querySelector('.hdr-linkedin');
    if (!link) {
      link = document.createElement('a');
      link.className = 'hdr-linkedin';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerHTML = SVG;
      wrap.appendChild(link);
    }

    const m = getMember();
    const isSearch = m && !m.linkedin;
    const label = m
      ? (isSearch ? 'Buscar ' + m.name + ' no LinkedIn' : 'LinkedIn de ' + m.name)
      : 'Perfil no LinkedIn';
    link.href = url;
    link.setAttribute('aria-label', label);
    link.title = label;
  }

  window.applyHdrLinkedIn = applyHdrLinkedIn;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHdrLinkedIn);
  } else {
    applyHdrLinkedIn();
  }

  (function loadPdfExport() {
    if (document.getElementById('hdr-pdf-export-script')) return;
    const s = document.createElement('script');
    s.id = 'hdr-pdf-export-script';
    s.src = 'hdr-pdf-export.js';
    s.defer = true;
    document.body.appendChild(s);
  })();
})();
