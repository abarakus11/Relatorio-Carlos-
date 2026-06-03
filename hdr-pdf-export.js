/* Botão PDF ao lado do LinkedIn — exporta relatório completo do perfil */
(function () {
  'use strict';

  const REPORT_BY_MEMBER = {
    giovane: 'GIOVANE_REPORT',
    samara: 'SAMARA_REPORT',
    gabriel: 'GABRIEL_REPORT',
    emilly: 'EMILLY_REPORT',
    marina: 'MARINA_REPORT',
  };

  const AREA_RGB = {
    tecnologia: [77, 143, 255],
    comercial: [212, 165, 184],
    marketing: [157, 111, 255],
    administrativo: [16, 232, 160],
    financeiro: [255, 224, 102],
    infraestrutura: [255, 143, 63],
    juridico: [255, 180, 100],
  };

  const AREA_LABELS = {
    tecnologia: 'Tecnologia',
    comercial: 'Comercial',
    marketing: 'Marketing',
    administrativo: 'Administrativo',
    financeiro: 'Financeiro',
    infraestrutura: 'Infraestrutura',
    juridico: 'Jurídico',
  };

  let libsLoading = null;

  if (!document.getElementById('hdr-pdf-export-style')) {
    const style = document.createElement('style');
    style.id = 'hdr-pdf-export-style';
    style.textContent =
      '.hdr-pdf-btn{display:inline-flex;align-items:center;justify-content:center;min-width:52px;height:36px;' +
      'padding:0 12px;margin:0;border:1px solid rgba(255,255,255,.22);border-radius:8px;' +
      'font-family:Outfit,system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;' +
      'text-transform:uppercase;color:rgba(255,255,255,.92);background:rgba(255,255,255,.08);' +
      'cursor:pointer;transition:color .2s,transform .2s,background .2s,border-color .2s;flex-shrink:0}' +
      '.hdr-pdf-btn:hover{color:#fff;background:rgba(77,143,255,.35);border-color:rgba(77,143,255,.55);transform:translateY(-1px)}' +
      '.hdr-pdf-btn:focus-visible{outline:2px solid rgba(0,212,255,.55);outline-offset:3px}' +
      '.hdr-pdf-btn[disabled]{opacity:.55;cursor:wait;transform:none}' +
      'body.page-comercial .hdr-pdf-btn{border-color:rgba(245,230,238,.28);background:rgba(245,230,238,.08)}' +
      'body.page-marketing .hdr-pdf-btn{border-color:rgba(184,240,255,.28)}' +
      'body.page-infraestrutura .hdr-pdf-btn{border-color:rgba(255,232,180,.28)}';
    document.head.appendChild(style);
  }

  function getMember() {
    return window.FIC_MEMBERS && window.FIC_MEMBERS.memberFromPath
      ? window.FIC_MEMBERS.memberFromPath()
      : null;
  }

  function getReport() {
    const m = getMember();
    if (!m) return null;
    const key = REPORT_BY_MEMBER[m.id];
    return key && window[key] ? window[key] : null;
  }

  function stripHtml(html) {
    if (!html) return '';
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function loadScript(src, id) {
    if (id && document.getElementById(id)) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      if (id) s.id = id;
      s.src = src;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error('Falha ao carregar ' + src));
      };
      document.head.appendChild(s);
    });
  }

  function loadPdfLibs() {
    if (window.jspdf && window.jspdf.jsPDF) {
      const probe = new window.jspdf.jsPDF();
      if (typeof probe.autoTable === 'function') return Promise.resolve();
    }
    if (libsLoading) return libsLoading;
    const local = [
      'assets/vendor/jspdf.umd.min.js',
      'assets/vendor/jspdf.plugin.autotable.min.js',
    ];
    const cdn = [
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
      'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js',
    ];

    function tryLoad(urls) {
      return urls.reduce(function (chain, src) {
        return chain.then(function () {
          return loadScript(src);
        });
      }, Promise.resolve());
    }

    libsLoading = tryLoad(local)
      .catch(function () {
        return tryLoad(cdn);
      })
      .then(function () {
        if (!window.jspdf || !window.jspdf.jsPDF) {
          throw new Error('jsPDF indisponível');
        }
        const probe = new window.jspdf.jsPDF();
        if (typeof probe.autoTable !== 'function') {
          throw new Error('Plugin autoTable indisponível');
        }
      });
    return libsLoading;
  }

  function parseObjectPosition(img) {
    let x = 0.5;
    let y = 0.28;
    if (img && img instanceof Element) {
      const op = (getComputedStyle(img).objectPosition || 'center 28%').trim().split(/\s+/);
      if (op[0]) x = parsePositionPart(op[0], true);
      if (op[1]) y = parsePositionPart(op[1], false);
      else if (!/%/.test(op[0]) && op[0] !== 'center') y = parsePositionPart(op[0], false);
    }
    return { x, y };
  }

  function parsePositionPart(part, isX) {
    if (!part) return 0.5;
    if (part.endsWith('%')) return Math.min(1, Math.max(0, parseFloat(part) / 100));
    const map = isX
      ? { left: 0, center: 0.5, right: 1 }
      : { top: 0, center: 0.5, bottom: 1 };
    return map[part] !== undefined ? map[part] : 0.5;
  }

  /** object-fit:cover + object-position — spec CSS */
  function coverDrawRect(iw, ih, size, focal) {
    const scale = Math.max(size / iw, size / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    let dx = focal.x * (size - dw);
    let dy = focal.y * (size - dh);
    if (dw >= size) dx = Math.min(0, Math.max(size - dw, dx));
    if (dh >= size) dy = Math.min(0, Math.max(size - dh, dy));
    return { dx, dy, dw, dh };
  }

  /** Avatar circular — fundo opaco para evitar manchas no jsPDF */
  function imgToDataUrl(img, sizePx, ringRgb, bgRgb) {
    if (!img || !img.src) return null;
    const size = sizePx || 320;
    const ring = ringRgb || [77, 143, 255];
    const bg = bgRgb || [8, 14, 28];
    try {
      const iw = img.naturalWidth || img.width || size;
      const ih = img.naturalHeight || img.height || size;
      if (!iw || !ih) return null;

      const focal = parseObjectPosition(img);
      const { dx, dy, dw, dh } = coverDrawRect(iw, ih, size, focal);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const cx = size / 2;
      const cy = size / 2;
      const r = size / 2 - 1;

      /* Fundo opaco (jsPDF renderiza transparência como preto) */
      ctx.fillStyle = 'rgb(' + bg[0] + ',' + bg[1] + ',' + bg[2] + ')';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgb(' + ring[0] + ',' + ring[1] + ',' + ring[2] + ')';
      ctx.lineWidth = Math.max(3, size * 0.02);
      ctx.stroke();

      return canvas.toDataURL('image/jpeg', 0.92);
    } catch (_) {
      return null;
    }
  }

  function chartDataUrl(id) {
    const c = document.getElementById(id);
    if (!c) return null;
    try {
      return c.toDataURL('image/png', 1);
    } catch (_) {
      return null;
    }
  }

  function scrapeKpis() {
    return Array.from(document.querySelectorAll('#kpiGrid .kpi')).map(function (el) {
      return {
        ic: el.querySelector('.kpi-emoji')?.textContent?.trim() || '•',
        label: el.querySelector('.kpi-l')?.textContent?.trim() || '',
        val: el.querySelector('.kpi-v')?.textContent?.trim() || '',
        sub: el.querySelector('.kpi-s')?.textContent?.trim() || '',
        color: '#4d8fff',
      };
    });
  }

  function scrapeTasks() {
    return Array.from(document.querySelectorAll('#taskGrid .ti')).map(function (el) {
      const tags = Array.from(el.querySelectorAll('.tbg')).map(function (t) {
        return t.textContent.trim();
      });
      return {
        name: el.querySelector('.ti-nm')?.textContent?.trim() || '',
        cat: tags[0] || '',
        pri: tags[1] || '',
        co: tags[2] || '',
        dt: el.querySelector('.ti-dt')?.textContent?.trim() || '',
      };
    });
  }

  function scrapeAnalysis() {
    return Array.from(document.querySelectorAll('#analGrid .an')).map(function (el) {
      return {
        ttl: el.querySelector('.an-ttl')?.textContent?.trim() || '',
        body: stripHtml(el.querySelector('.an-bd')?.innerHTML || ''),
      };
    });
  }

  function scrapeAchievements() {
    return Array.from(document.querySelectorAll('#achGrid .ach')).map(function (el) {
      return {
        ttl: el.querySelector('.ach-ttl')?.textContent?.trim() || '',
        val: el.querySelector('.ach-val')?.textContent?.trim() || '',
        ds: el.querySelector('.ach-ds')?.textContent?.trim() || '',
      };
    });
  }

  function scrapeSkills() {
    return Array.from(document.querySelectorAll('.ferris-cabin')).map(function (el) {
      return {
        nm: el.querySelector('.sk-nm')?.textContent?.trim() || '',
        pct: parseInt(el.querySelector('.sk-pct')?.textContent || '0', 10) || 0,
      };
    });
  }

  function scrapeTimeline() {
    return Array.from(document.querySelectorAll('#tlEl .tl-item')).map(function (el) {
      return {
        dt: el.querySelector('.tl-dt')?.textContent?.trim() || '',
        co: el.querySelector('.tl-co')?.textContent?.trim() || '',
        ttl: el.querySelector('.tl-ttl')?.textContent?.trim() || '',
        desc: el.querySelector('.tl-desc')?.textContent?.trim() || '',
      };
    });
  }

  async function collectProfileData() {
    const member = getMember();
    const report = getReport();
    const catmap = report?.CATMAP || {};
    const badge = document.querySelector('.av-txt .badge')?.textContent?.trim() || member?.badge || '';
    const roleLine = document.querySelector('.av-txt p')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const photoEl =
      document.querySelector('.av-in img') ||
      document.querySelector('.ftr-ic img') ||
      document.querySelector('[data-profile]');

    if (photoEl && !photoEl.complete) {
      await new Promise(function (resolve) {
        const done = function () {
          resolve();
        };
        photoEl.addEventListener('load', done, { once: true });
        photoEl.addEventListener('error', done, { once: true });
        setTimeout(done, 1200);
      });
    }

    let tasks = report?.TASKS || scrapeTasks();
    if (report?.TASKS) {
      tasks = report.TASKS.map(function (t) {
        const ci = catmap[t.cat] || { label: t.cat || '' };
        return {
          name: t.name,
          cat: ci.label || t.cat || '',
          pri: t.pri || '',
          co: t.co || '',
          dt: t.dt || '',
        };
      });
    }

    const memorial = window.MEMORIAL_ANIMA || null;

    return {
      member,
      badge,
      roleLine,
      photoData: imgToDataUrl(
        photoEl,
        400,
        AREA_RGB[member?.area] || AREA_RGB.tecnologia,
        [8, 14, 28]
      ),
      kpis: report?.KPIS || scrapeKpis(),
      tasks,
      analysis: report?.ANALYSIS
        ? report.ANALYSIS.map(function (a) {
            return { ttl: a.ttl, body: stripHtml(a.body) };
          })
        : scrapeAnalysis(),
      achievements: report?.ACH || scrapeAchievements(),
      skills: report?.SKILLS || scrapeSkills(),
      timeline: report?.TL || scrapeTimeline(),
      periods: report?.REPORT_PERIODS || [],
      monthly: report
        ? { labels: report.MON_L || [], data: report.MON_D || [] }
        : null,
      categories: report
        ? { labels: report.CAT_L || [], data: report.CAT_D || [] }
        : null,
      memorial,
      charts: {
        line: chartDataUrl('cLine'),
        donut: chartDataUrl('cDonut'),
        bar: chartDataUrl('cBar'),
        top: chartDataUrl('cTop'),
      },
      generatedAt: new Date(),
    };
  }

  function slugName(name) {
    return (name || 'perfil')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function ensureSpace(doc, y, need, margin) {
    const pageH = doc.internal.pageSize.getHeight();
    if (y + need > pageH - margin) {
      doc.addPage();
      return margin;
    }
    return y;
  }

  function drawPageFooter(doc, pageW, margin, accent) {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setDrawColor(230, 235, 245);
      doc.line(margin, doc.internal.pageSize.getHeight() - 14, pageW - margin, doc.internal.pageSize.getHeight() - 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 150);
      doc.text('FIC Capital Group · Documento confidencial · Uso interno', margin, doc.internal.pageSize.getHeight() - 8);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(String(i) + ' / ' + String(total), pageW - margin, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    }
  }

  function drawSectionTitle(doc, title, x, y, accent) {
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(x, y, 4, 14, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 40, 60);
    doc.text(title, x + 10, y + 10);
    return y + 22;
  }

  function drawCover(doc, data, accent, pageW, margin) {
    const m = data.member;
    const headerH = 72;
    doc.setFillColor(8, 14, 28);
    doc.rect(0, 0, pageW, headerH, 'F');
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(0, headerH - 3, pageW, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('FIC CAPITAL', margin, 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 195, 220);
    doc.text('Relatório Executivo de Performance', margin, 32);

    const photoX = pageW - margin - 44;
    const photoSize = 44;
    if (data.photoData) {
      try {
        doc.addImage(data.photoData, 'JPEG', photoX, 15, photoSize, photoSize, undefined, 'MEDIUM');
      } catch (_) {
        /* foto opcional */
      }
    }

    let y = headerH + 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(20, 30, 50);
    doc.text(m?.name || 'Colaborador', margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(data.roleLine || m?.role || '', margin, y);
    y += 10;

    if (data.badge) {
      doc.setFillColor(
        Math.min(255, accent[0] + 180),
        Math.min(255, accent[1] + 180),
        Math.min(255, accent[2] + 180)
      );
      doc.setDrawColor(accent[0], accent[1], accent[2]);
      doc.roundedRect(margin, y, Math.min(pageW - margin * 2, doc.getTextWidth(data.badge) + 16), 10, 2, 2, 'FD');
      doc.setFontSize(9);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(data.badge, margin + 8, y + 7);
      y += 18;
    }

    const areaLabel = AREA_LABELS[m?.area] || m?.area || '';
    if (areaLabel) {
      doc.setFontSize(10);
      doc.setTextColor(100, 110, 130);
      doc.text('Área: ' + areaLabel, margin, y);
      y += 8;
    }

    const dateStr = data.generatedAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    doc.text('Gerado em ' + dateStr, margin, y);
    y += 20;

    doc.setDrawColor(230, 235, 245);
    doc.line(margin, y, pageW - margin, y);
    y += 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(50, 60, 80);
    doc.text('Sobre este documento', margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 90, 110);
    const intro =
      data.kpis.length || data.tasks.length
        ? 'Consolidação automática do dashboard de performance: indicadores, competências, timeline, análise e registro completo de atividades.'
        : 'Perfil cadastrado no sistema FIC Capital Group. O dashboard completo será incluído assim que o relatório de performance for publicado.';
    const introLines = doc.splitTextToSize(intro, pageW - margin * 2);
    doc.text(introLines, margin, y);
    return y + introLines.length * 5 + 10;
  }

  function drawKpis(doc, data, accent, pageW, margin, startY) {
    if (!data.kpis.length) return startY;
    let y = ensureSpace(doc, startY, 40, margin);
    y = drawSectionTitle(doc, 'Indicadores de Performance', margin, y, accent);
    const cols = 2;
    const gap = 8;
    const cardW = (pageW - margin * 2 - gap) / cols;
    const cardH = 28;
    let col = 0;
    let rowY = y;

    data.kpis.forEach(function (k, i) {
      if (col === 0) {
        rowY = ensureSpace(doc, rowY, cardH + 6, margin);
        if (rowY === margin && i > 0) {
          rowY = drawSectionTitle(doc, 'Indicadores de Performance (cont.)', margin, rowY, accent);
        }
      }
      const x = margin + col * (cardW + gap);
      doc.setFillColor(248, 250, 255);
      doc.setDrawColor(225, 232, 245);
      doc.roundedRect(x, rowY, cardW, cardH, 3, 3, 'FD');
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.circle(x + 8, rowY + 10, 2.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 110, 130);
      doc.text(k.label || '', x + 14, rowY + 9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(String(k.val || ''), x + 14, rowY + 20);
      if (k.sub) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(130, 140, 160);
        doc.text(k.sub, x + 14, rowY + 25);
      }
      col++;
      if (col >= cols) {
        col = 0;
        rowY += cardH + gap;
      }
    });
    return col ? rowY + cardH + 10 : rowY + 10;
  }

  function drawAnalysis(doc, data, accent, pageW, margin, startY) {
    if (!data.analysis.length) return startY;
    let y = ensureSpace(doc, startY, 30, margin);
    y = drawSectionTitle(doc, 'Inteligência Analítica', margin, y, accent);
    data.analysis.forEach(function (a) {
      y = ensureSpace(doc, y, 24, margin);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(40, 50, 70);
      doc.text(a.ttl || 'Análise', margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(70, 80, 100);
      const lines = doc.splitTextToSize(a.body || '', pageW - margin * 2);
      lines.forEach(function (line) {
        y = ensureSpace(doc, y, 5, margin);
        doc.text(line, margin, y);
        y += 4.5;
      });
      y += 6;
    });
    return y;
  }

  function drawAchievements(doc, data, accent, pageW, margin, startY) {
    if (!data.achievements.length) return startY;
    let y = ensureSpace(doc, startY, 30, margin);
    y = drawSectionTitle(doc, 'Conquistas & Destaques', margin, y, accent);
    const cols = 3;
    const gap = 6;
    const cardW = (pageW - margin * 2 - gap * (cols - 1)) / cols;
    let col = 0;
    let rowY = y;
    data.achievements.forEach(function (a) {
      if (col === 0) rowY = ensureSpace(doc, rowY, 34, margin);
      const x = margin + col * (cardW + gap);
      doc.setFillColor(252, 248, 240);
      doc.setDrawColor(235, 225, 210);
      doc.roundedRect(x, rowY, cardW, 30, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(String(a.val || ''), x + 5, rowY + 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(50, 55, 70);
      doc.text(a.ttl || '', x + 5, rowY + 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 105, 120);
      const dsLines = doc.splitTextToSize(a.ds || '', cardW - 8);
      doc.text(dsLines.slice(0, 2), x + 5, rowY + 23);
      col++;
      if (col >= cols) {
        col = 0;
        rowY += 36;
      }
    });
    return (col ? rowY + 36 : rowY) + 8;
  }

  function drawSkills(doc, data, accent, pageW, margin, startY) {
    if (!data.skills.length) return startY;
    let y = ensureSpace(doc, startY, 30, margin);
    y = drawSectionTitle(doc, 'Competências Técnicas', margin, y, accent);
    data.skills.forEach(function (s) {
      y = ensureSpace(doc, y, 12, margin);
      const label = (s.nm || '').replace(/^[^\w]+/, '').trim() || s.nm || '';
      const pct = s.pct || 0;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 60, 80);
      doc.text(label, margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(pct) + '%', pageW - margin, y, { align: 'right' });
      y += 3;
      doc.setFillColor(235, 240, 250);
      doc.roundedRect(margin, y, pageW - margin * 2, 4, 2, 2, 'F');
      const barW = ((pageW - margin * 2) * pct) / 100;
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.roundedRect(margin, y, Math.max(barW, 2), 4, 2, 2, 'F');
      y += 10;
    });
    return y + 4;
  }

  function drawTimeline(doc, data, accent, pageW, margin, startY) {
    if (!data.timeline.length) return startY;
    let y = ensureSpace(doc, startY, 30, margin);
    y = drawSectionTitle(doc, 'Timeline de Projetos', margin, y, accent);
    data.timeline.forEach(function (t) {
      y = ensureSpace(doc, y, 18, margin);
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.circle(margin + 2, y - 1, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(40, 50, 70);
      doc.text((t.dt || '') + (t.co ? ' · ' + t.co : ''), margin + 8, y);
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(t.ttl || '', margin + 8, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(90, 100, 120);
      const descLines = doc.splitTextToSize(t.desc || '', pageW - margin - 10);
      descLines.forEach(function (line) {
        y = ensureSpace(doc, y, 4.5, margin);
        doc.text(line, margin + 8, y);
        y += 4;
      });
      y += 4;
    });
    return y;
  }

  function drawCharts(doc, data, accent, pageW, margin, startY) {
    const imgs = [
      { url: data.charts.line, label: 'Evolução Mensal' },
      { url: data.charts.donut, label: 'Por Categoria' },
      { url: data.charts.bar, label: 'Volume por Mês' },
      { url: data.charts.top, label: 'Top Atividades' },
    ].filter(function (c) {
      return c.url;
    });
    if (!imgs.length) return startY;

    let y = ensureSpace(doc, startY, 50, margin);
    y = drawSectionTitle(doc, 'Análise Gráfica', margin, y, accent);
    const halfW = (pageW - margin * 2 - 8) / 2;
    const imgH = 52;
    imgs.forEach(function (c, i) {
      if (i % 2 === 0) y = ensureSpace(doc, y, imgH + 14, margin);
      const x = margin + (i % 2) * (halfW + 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(80, 90, 110);
      doc.text(c.label, x, y);
      doc.setDrawColor(225, 232, 245);
      doc.roundedRect(x, y + 2, halfW, imgH, 2, 2, 'S');
      try {
        doc.addImage(c.url, 'PNG', x + 2, y + 4, halfW - 4, imgH - 4);
      } catch (_) {
        /* gráfico opcional */
      }
      if (i % 2 === 1 || i === imgs.length - 1) y += imgH + 14;
    });
    return y;
  }

  function drawMonthlyTable(doc, data, accent, pageW, margin, startY) {
    if (!data.monthly || !data.monthly.labels?.length) return startY;
    let y = ensureSpace(doc, startY, 30, margin);
    y = drawSectionTitle(doc, 'Resumo Mensal', margin, y, accent);
    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Mês', 'Tarefas']],
      body: data.monthly.labels.map(function (lb, i) {
        return [lb, String(data.monthly.data[i] ?? '')];
      }),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: accent, textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 255] },
    });
    return doc.lastAutoTable.finalY + 10;
  }

  function drawTasks(doc, data, accent, pageW, margin, startY) {
    if (!data.tasks.length) return startY;
    doc.addPage();
    let y = drawSectionTitle(doc, 'Registro de Atividades (' + data.tasks.length + ')', margin, margin, accent);
    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Atividade', 'Categoria', 'Prioridade', 'Empresa', 'Data']],
      body: data.tasks.map(function (t) {
        return [t.name || '', t.cat || '', t.pri || '', t.co || '', t.dt || ''];
      }),
      styles: { fontSize: 7.5, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: accent, textColor: 255, fontSize: 8 },
      columnStyles: { 0: { cellWidth: 68 } },
      alternateRowStyles: { fillColor: [248, 250, 255] },
    });
    return doc.lastAutoTable.finalY + 10;
  }

  function drawMemorial(doc, data, accent, pageW, margin, startY) {
    const M = data.memorial;
    if (!M || !M.sections?.length) return startY;
    doc.addPage();
    let y = drawSectionTitle(doc, M.title || 'Memorial Descritivo', margin, margin, accent);
    if (M.intro) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(70, 80, 100);
      const lines = doc.splitTextToSize(stripHtml(M.intro), pageW - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 4.5 + 8;
    }
    M.sections.forEach(function (s) {
      y = ensureSpace(doc, y, 20, margin);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(40, 50, 70);
      doc.text(s.title || '', margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(70, 80, 100);
      const bodyLines = doc.splitTextToSize(stripHtml(s.body || ''), pageW - margin * 2);
      bodyLines.forEach(function (line) {
        y = ensureSpace(doc, y, 4.5, margin);
        doc.text(line, margin, y);
        y += 4;
      });
      y += 6;
    });
    return y;
  }

  function drawPendingStub(doc, data, accent, pageW, margin, startY) {
    if (data.kpis.length || data.tasks.length) return startY;
    let y = ensureSpace(doc, startY, 40, margin);
    y = drawSectionTitle(doc, 'Status do Relatório', margin, y, accent);
    doc.setFillColor(248, 250, 255);
    doc.setDrawColor(225, 232, 245);
    doc.roundedRect(margin, y, pageW - margin * 2, 36, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(50, 60, 80);
    doc.text('Dashboard em elaboração', margin + 10, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 100, 120);
    const stubLines = doc.splitTextToSize(
      'Este colaborador já está cadastrado com foto, área e equipe. Os indicadores serão incluídos automaticamente.',
      pageW - margin * 2 - 20
    );
    doc.text(stubLines, margin + 10, y + 24);
    return y + 46;
  }

  async function generateProfilePdf() {
    await loadPdfLibs();
    const { jsPDF } = window.jspdf;
    const data = await collectProfileData();
    const m = data.member;
    if (!m) throw new Error('Perfil não identificado');

    const accent = AREA_RGB[m.area] || AREA_RGB.tecnologia;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 16;

    let y = drawCover(doc, data, accent, pageW, margin);
    y = drawPendingStub(doc, data, accent, pageW, margin, y);
    y = drawKpis(doc, data, accent, pageW, margin, y);
    y = drawCharts(doc, data, accent, pageW, margin, y);
    y = drawMonthlyTable(doc, data, accent, pageW, margin, y);
    y = drawSkills(doc, data, accent, pageW, margin, y);
    y = drawTimeline(doc, data, accent, pageW, margin, y);
    y = drawAchievements(doc, data, accent, pageW, margin, y);
    y = drawAnalysis(doc, data, accent, pageW, margin, y);
    drawTasks(doc, data, accent, pageW, margin, y);
    drawMemorial(doc, data, accent, pageW, margin, y);

    drawPageFooter(doc, pageW, margin, accent);

    const filename = 'Relatorio-' + slugName(m.name) + '.pdf';
    doc.save(filename);
  }

  function applyHdrPdfExport() {
    const wrap = document.querySelector('.hdr-profile-links');
    if (!wrap) return;

    let btn = wrap.querySelector('.hdr-pdf-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hdr-pdf-btn';
      btn.textContent = 'PDF';
      wrap.appendChild(btn);
    }

    const m = getMember();
    const label = m ? 'Baixar relatório PDF de ' + m.name : 'Baixar relatório PDF';
    btn.setAttribute('aria-label', label);
    btn.title = label;

    if (btn.dataset.pdfBound === '1') return;
    btn.dataset.pdfBound = '1';

    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      const prev = btn.textContent;
      btn.disabled = true;
      btn.textContent = '…';
      generateProfilePdf()
        .catch(function (err) {
          console.error(err);
          alert('Não foi possível gerar o PDF: ' + (err && err.message ? err.message : 'erro desconhecido'));
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = prev;
        });
    });
  }

  window.applyHdrPdfExport = applyHdrPdfExport;
  window.FIC_PROFILE_PDF = { collectProfileData, generateProfilePdf };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHdrPdfExport);
  } else {
    applyHdrPdfExport();
  }
})();
