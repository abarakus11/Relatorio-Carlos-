/* Exportação PDF — padrão executivo FIC Capital (ref: testepadrao.pdf) */
(function () {
  'use strict';

  const REPORT_BY_MEMBER = {
    giovane: 'GIOVANE_REPORT',
    samara: 'SAMARA_REPORT',
    gabriel: 'GABRIEL_REPORT',
    adrian: 'ADRIAN_REPORT',
    emilly: 'EMILLY_REPORT',
    paulo: 'PAULO_REPORT',
    marina: 'MARINA_REPORT',
    hugo: 'HUGO_REPORT',
    roberto: 'ROBERTO_REPORT',
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

  const THEME = {
    cover: [11, 18, 32],
    ink: [15, 23, 42],
    body: [30, 41, 59],
    muted: [71, 85, 105],
    paper: [255, 255, 255],
    soft: [248, 250, 252],
    line: [226, 232, 240],
  };

  /** Tipografia legível — tamanhos mínimos confortáveis para impressão */
  const TYPE = {
    margin: 16,
    top: 22,
    bottom: 16,
    section: 14,
    title: 11,
    body: 10,
    small: 9,
    line: 5.5,
  };

  let libsLoading = null;

  if (!document.getElementById('hdr-pdf-export-style')) {
    const style = document.createElement('style');
    style.id = 'hdr-pdf-export-style';
    style.textContent =
      '.hdr-pdf-btn{display:inline-flex;align-items:center;justify-content:center;min-width:52px;height:36px;' +
      'padding:0 12px;margin:0;border:1px solid rgba(255,255,255,.22);border-radius:8px;' +
      'font-family:Outfit,system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;' +
      'text-transform:uppercase;color:rgba(255,255,255,.92);background:rgba(255,255,255,.08);cursor:pointer;' +
      'transition:color .2s,transform .2s,background .2s,border-color .2s;flex-shrink:0}' +
      '.hdr-pdf-btn:hover{color:#fff;background:rgba(77,143,255,.35);border-color:rgba(77,143,255,.55);transform:translateY(-1px)}' +
      '.hdr-pdf-btn[disabled]{opacity:.55;cursor:wait}';
    document.head.appendChild(style);
  }

  function getMember() {
    return window.FIC_MEMBERS?.memberFromPath?.() || null;
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

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error('Falha ao carregar ' + src));
      };
      document.head.appendChild(s);
    });
  }

  function loadPdfLibs() {
    if (window.jspdf?.jsPDF) {
      const p = new window.jspdf.jsPDF();
      if (typeof p.autoTable === 'function') return Promise.resolve();
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
    libsLoading = local
      .reduce(function (c, u) {
        return c.then(function () {
          return loadScript(u);
        });
      }, Promise.resolve())
      .catch(function () {
        return cdn.reduce(function (c, u) {
          return c.then(function () {
            return loadScript(u);
          });
        }, Promise.resolve());
      })
      .then(function () {
        const p = new window.jspdf.jsPDF();
        if (typeof p.autoTable !== 'function') throw new Error('autoTable indisponível');
      });
    return libsLoading;
  }

  function parseObjectPosition(img) {
    let x = 0.5;
    let y = 0.28;
    if (img instanceof Element) {
      const op = (getComputedStyle(img).objectPosition || 'center 28%').trim().split(/\s+/);
      if (op[0]) x = parsePos(op[0], true);
      if (op[1]) y = parsePos(op[1], false);
    }
    return { x, y };
  }

  function parsePos(part, isX) {
    if (!part) return 0.5;
    if (part.endsWith('%')) return Math.min(1, Math.max(0, parseFloat(part) / 100));
    const map = isX
      ? { left: 0, center: 0.5, right: 1 }
      : { top: 0, center: 0.5, bottom: 1 };
    return map[part] ?? 0.5;
  }

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

  /** Avatar circular — fundo = cor da página onde será colocado */
  function imgToDataUrl(img, sizePx, ringRgb, bgRgb) {
    if (!img?.src) return null;
    const size = sizePx || 400;
    const ring = ringRgb || [77, 143, 255];
    const bg = bgRgb || [255, 255, 255];
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
      const cx = size / 2;
      const r = size / 2 - 2;

      ctx.fillStyle = 'rgb(' + bg.join(',') + ')';
      ctx.fillRect(0, 0, size, size);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cx, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cx, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgb(' + ring.join(',') + ')';
      ctx.lineWidth = Math.max(4, size * 0.022);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cx, r + Math.max(4, size * 0.022) / 2 + 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgb(' + bg.join(',') + ')';
      ctx.lineWidth = 5;
      ctx.stroke();

      return canvas.toDataURL('image/jpeg', 0.94);
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

  function scrapeChartData(id) {
    if (typeof Chart === 'undefined') return null;
    const c = Chart.getChart(id);
    if (!c?.data?.labels?.length) return null;
    const data = c.data.datasets[0]?.data || [];
    return { labels: c.data.labels.slice(), data: data.map(Number) };
  }

  function scrapeKpis() {
    return Array.from(document.querySelectorAll('#kpiGrid .kpi')).map(function (el) {
      return {
        label: el.querySelector('.kpi-l')?.textContent?.trim() || '',
        val: el.querySelector('.kpi-v')?.textContent?.trim() || '',
        sub: el.querySelector('.kpi-s')?.textContent?.trim() || '',
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
        feat: el.classList.contains('an--feat'),
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
        setTimeout(done, 1500);
      });
    }

    const accent = AREA_RGB[member?.area] || AREA_RGB.tecnologia;
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

    const monthly =
      report?.MON_L?.length
        ? { labels: report.MON_L, data: report.MON_D || [] }
        : scrapeChartData('cBar') || scrapeChartData('cLine');

    const categories =
      report?.CAT_L?.length
        ? { labels: report.CAT_L, data: report.CAT_D || [] }
        : scrapeChartData('cDonut');

    const periods = report?.REPORT_PERIODS || [];
    const periodLabel =
      periods.map(function (p) {
        return p.label;
      }).join(' · ') ||
      badge.replace(/^Relatório[^·]*·?\s*/i, '').trim() ||
      badge;

    return {
      member,
      badge,
      roleLine,
      periodLabel,
      areaLabel: AREA_LABELS[member?.area] || member?.area || '',
      accent,
      photoData: imgToDataUrl(photoEl, 480, accent, THEME.paper),
      kpis: report?.KPIS || scrapeKpis(),
      tasks,
      analysis: report?.ANALYSIS
        ? report.ANALYSIS.map(function (a) {
            return { ttl: a.ttl, body: stripHtml(a.body), feat: a.feat };
          })
        : scrapeAnalysis(),
      achievements: report?.ACH || scrapeAchievements(),
      skills: report?.SKILLS || scrapeSkills(),
      timeline: report?.TL || scrapeTimeline(),
      monthly,
      categories,
      memorial: window.MEMORIAL_ANIMA || null,
      charts: {
        line: chartDataUrl('cLine'),
        donut: chartDataUrl('cDonut'),
        bar: chartDataUrl('cBar'),
        top: chartDataUrl('cTop'),
      },
      generatedAt: new Date(),
      executionRate: tasks.length ? '100%' : '—',
    };
  }

  function slugName(name) {
    return (name || 'perfil')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function fmtDate(d) {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function splitName(member) {
    if (!member) return { first: 'Colaborador', last: '' };
    return { first: member.first || member.name.split(' ')[0], last: member.last || '' };
  }

  function setInk(doc) {
    doc.setTextColor(THEME.ink[0], THEME.ink[1], THEME.ink[2]);
  }

  function setBody(doc) {
    doc.setTextColor(THEME.body[0], THEME.body[1], THEME.body[2]);
  }

  function setMuted(doc) {
    doc.setTextColor(THEME.muted[0], THEME.muted[1], THEME.muted[2]);
  }

  function writeParagraph(doc, text, x, y, maxW) {
    const lines = doc.splitTextToSize(text || '', maxW);
    lines.forEach(function (line) {
      doc.text(line, x, y);
      y += TYPE.line;
    });
    return y;
  }

  function ensureY(doc, y, need, top, bottom) {
    const pageH = doc.internal.pageSize.getHeight();
    const b = bottom ?? TYPE.bottom;
    const t = top ?? TYPE.top;
    if (y + need > pageH - b) {
      doc.addPage();
      return t;
    }
    return y;
  }

  function paintPageChrome(doc, data, margin, pageW, pageH) {
    const accent = data.accent;
    doc.setFillColor(THEME.cover[0], THEME.cover[1], THEME.cover[2]);
    doc.rect(0, 0, pageW, 13, 'F');
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(0, 13, pageW, 0.9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(TYPE.small);
    doc.setTextColor(255, 255, 255);
    doc.text('FIC Capital', margin, 8.5);
    doc.setFont('helvetica', 'normal');
    const mid = (data.member?.name || '') + ' · ' + (data.areaLabel || '');
    doc.text(mid, pageW / 2, 8.5, { align: 'center' });
    doc.text(data.periodLabel.slice(0, 32), pageW - margin, 8.5, { align: 'right' });

    doc.setDrawColor(THEME.line[0], THEME.line[1], THEME.line[2]);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    doc.setFontSize(TYPE.small);
    setMuted(doc);
    doc.text('FIC Capital · Confidencial · Uso interno', margin, pageH - 6);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    return TYPE.top;
  }

  function drawAllChrome(doc, data, margin, pageW, pageH) {
    const total = doc.internal.getNumberOfPages();
    for (let i = 2; i <= total; i++) {
      doc.setPage(i);
      paintPageChrome(doc, data, margin, pageW, pageH);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TYPE.small);
      setMuted(doc);
      doc.text('Página ' + i + ' de ' + total, pageW - margin, pageH - 6, { align: 'right' });
    }
  }

  function sectionTitle(doc, title, x, y, accent) {
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(x, y, 3, 13, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(TYPE.section);
    setInk(doc);
    doc.text(title, x + 8, y + 9);
    return y + 20;
  }

  function metaBox(doc, label, value, x, y, w, h, accent) {
    doc.setFillColor(THEME.soft[0], THEME.soft[1], THEME.soft[2]);
    doc.setDrawColor(THEME.line[0], THEME.line[1], THEME.line[2]);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(TYPE.small);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(label, x + 5, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(TYPE.body);
    setInk(doc);
    const lines = doc.splitTextToSize(String(value), w - 10);
    doc.text(lines.slice(0, 3), x + 5, y + 16);
  }

  /* ── CAPA ── */
  function drawCoverPage(doc, data, pageW, margin) {
    const accent = data.accent;
    const m = data.member;
    const names = splitName(m);
    const coverH = 62;

    doc.setFillColor(THEME.cover[0], THEME.cover[1], THEME.cover[2]);
    doc.rect(0, 0, pageW, coverH, 'F');
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(0, coverH, pageW, 1.2, 'F');

    doc.setFillColor(THEME.paper[0], THEME.paper[1], THEME.paper[2]);
    doc.rect(0, coverH + 1.2, pageW, doc.internal.pageSize.getHeight(), 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('FIC Capital', margin, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(TYPE.small);
    doc.setTextColor(220, 228, 240);
    doc.text('Relatório executivo de performance', margin, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(TYPE.small);
    doc.text('Confidencial · Uso interno', margin, 29);

    if (data.badge) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TYPE.small);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(doc.splitTextToSize(data.badge, pageW - margin * 2 - 58)[0], margin, 37);
    }

    const photoSize = 52;
    const photoX = pageW - margin - photoSize;
    const photoY = 24;
    if (data.photoData) {
      try {
        doc.addImage(data.photoData, 'JPEG', photoX, photoY, photoSize, photoSize, undefined, 'MEDIUM');
      } catch (_) {}
    }

    let y = coverH + 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    setInk(doc);
    doc.text(names.first, margin, y);
    y += 10;
    if (names.last) {
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(names.last, margin, y);
      y += 11;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(TYPE.title);
    setInk(doc);
    doc.text(data.roleLine || m?.role || '', margin, y);
    y += 8;
    doc.setFontSize(TYPE.body);
    setBody(doc);
    doc.text('FIC Capital · Área: ' + data.areaLabel, margin, y);
    y += 16;

    const boxW = (pageW - margin * 2 - 6) / 2;
    const boxH = 28;
    metaBox(doc, 'Período', data.periodLabel, margin, y, boxW, boxH, accent);
    metaBox(doc, 'Área', data.areaLabel, margin + boxW + 6, y, boxW, boxH, accent);
    y += boxH + 6;
    metaBox(doc, 'Gerado em', fmtDate(data.generatedAt), margin, y, boxW, boxH, accent);
    metaBox(doc, 'Execução', data.executionRate, margin + boxW + 6, y, boxW, boxH, accent);
    y += boxH + 14;

    doc.setDrawColor(THEME.line[0], THEME.line[1], THEME.line[2]);
    doc.line(margin, y, pageW - margin, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(TYPE.body);
    setBody(doc);
    const intro =
      data.kpis.length || data.tasks.length
        ? 'Este documento reúne os indicadores, competências, timeline, análises e atividades registradas no dashboard de performance.'
        : 'Perfil cadastrado no ecossistema FIC Capital. O dashboard completo será integrado quando o relatório for publicado.';
    writeParagraph(doc, intro, margin, y, pageW - margin * 2);

    doc.setFontSize(TYPE.small);
    setMuted(doc);
    doc.text('FIC Capital · Documento confidencial · Uso interno', pageW / 2, doc.internal.pageSize.getHeight() - 10, {
      align: 'center',
    });
  }

  function drawKpiCards(doc, data, x, y, w, accent) {
    const cols = 2;
    const gap = 6;
    const cardW = (w - gap) / cols;
    const cardH = 28;
    let col = 0;
    let rowY = y;
    const kpis = data.kpis.slice(0, 8);
    if (!kpis.length) return y;

    kpis.forEach(function (k) {
      if (col === 0) rowY = ensureY(doc, rowY, cardH + gap, TYPE.top, TYPE.bottom);
      const cx = x + col * (cardW + gap);
      doc.setFillColor(THEME.soft[0], THEME.soft[1], THEME.soft[2]);
      doc.setDrawColor(THEME.line[0], THEME.line[1], THEME.line[2]);
      doc.roundedRect(cx, rowY, cardW, cardH, 2, 2, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TYPE.small);
      setBody(doc);
      doc.text(doc.splitTextToSize(k.label || '', cardW - 10)[0], cx + 5, rowY + 9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(String(k.val || ''), cx + 5, rowY + 19);
      if (k.sub) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(TYPE.small);
        setMuted(doc);
        doc.text(doc.splitTextToSize(k.sub, cardW - 10)[0], cx + 5, rowY + 25);
      }
      col++;
      if (col >= cols) {
        col = 0;
        rowY += cardH + gap;
      }
    });
    return col ? rowY + cardH + 8 : rowY + 8;
  }

  function drawMonthlyBars(doc, monthly, x, y, w, h, accent) {
    if (!monthly?.labels?.length) return y;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(TYPE.title);
    setInk(doc);
    doc.text('Evolução mensal de tarefas', x, y);
    y += 8;
    const max = Math.max.apply(null, monthly.data.concat([1]));
    const n = monthly.labels.length;
    const gap = 4;
    const barW = (w - gap * (n - 1)) / n;
    const baseY = y + h - 8;
    monthly.labels.forEach(function (lb, i) {
      const val = Number(monthly.data[i]) || 0;
      const bh = Math.max(3, (val / max) * (h - 18));
      const bx = x + i * (barW + gap);
      doc.setFillColor(
        Math.min(255, accent[0] + 90),
        Math.min(255, accent[1] + 90),
        Math.min(255, accent[2] + 90)
      );
      doc.roundedRect(bx, baseY - bh, barW, bh, 1, 1, 'F');
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.roundedRect(bx, baseY - bh, barW, Math.min(bh, 4), 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(TYPE.body);
      setInk(doc);
      doc.text(String(val), bx + barW / 2, baseY - bh - 3, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TYPE.small);
      setBody(doc);
      doc.text(lb, bx + barW / 2, baseY + 5, { align: 'center' });
    });
    return y + h + 8;
  }

  function drawCategoryList(doc, categories, x, y, w, accent) {
    if (!categories?.labels?.length) return y;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(TYPE.title);
    setInk(doc);
    doc.text('Distribuição por categoria', x, y);
    y += 8;
    categories.labels.forEach(function (lb, i) {
      const val = categories.data[i] ?? '';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TYPE.body);
      setBody(doc);
      doc.text('• ' + lb + ': ' + val, x + 2, y);
      y += TYPE.line + 1;
    });
    return y + 4;
  }

  function drawKpiPage(doc, data, margin, pageW, pageH) {
    doc.addPage();
    let y = paintPageChrome(doc, data, margin, pageW, pageH);
    y = sectionTitle(doc, 'Indicadores de performance', margin, y, data.accent);

    const contentW = pageW - margin * 2;
    if (data.monthly?.labels?.length) {
      y = drawMonthlyBars(doc, data.monthly, margin, y, contentW, 42, data.accent);
      y += 6;
    }
    if (data.categories?.labels?.length) {
      y = ensureY(doc, y, 30, TYPE.top, TYPE.bottom);
      y = drawCategoryList(doc, data.categories, margin, y, contentW, data.accent);
      y += 6;
    }
    y = drawKpiCards(doc, data, margin, y, contentW, data.accent);

    const charts = [
      { url: data.charts.line, label: 'Gráfico — evolução mensal' },
      { url: data.charts.bar, label: 'Gráfico — volume por mês' },
      { url: data.charts.top, label: 'Gráfico — principais atividades' },
    ].filter(function (c) {
      return c.url;
    });
    if (charts.length) {
      y = ensureY(doc, y, 50, TYPE.top, TYPE.bottom);
      y = sectionTitle(doc, 'Análise gráfica', margin, y, data.accent);
      charts.slice(0, 2).forEach(function (c) {
        y = ensureY(doc, y, 48, TYPE.top, TYPE.bottom);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(TYPE.small);
        setBody(doc);
        doc.text(c.label, margin, y);
        y += 4;
        try {
          doc.addImage(c.url, 'PNG', margin, y, contentW, 38);
        } catch (_) {}
        y += 42;
      });
    }
  }

  function drawSkillsPage(doc, data, margin, pageW, pageH) {
    if (!data.skills.length && !data.achievements.length) return;
    doc.addPage();
    let y = paintPageChrome(doc, data, margin, pageW, pageH);

    if (data.skills.length) {
      y = sectionTitle(doc, 'Competências técnicas', margin, y, data.accent);
      data.skills.forEach(function (s) {
        y = ensureY(doc, y, 14, TYPE.top, TYPE.bottom);
        const label = (s.nm || '').replace(/^[^\w\s]+/, '').trim() || s.nm;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(TYPE.body);
        setInk(doc);
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'bold');
        doc.text(String(s.pct) + '%', pageW - margin, y, { align: 'right' });
        y += 4;
        doc.setFillColor(THEME.line[0], THEME.line[1], THEME.line[2]);
        doc.roundedRect(margin, y, pageW - margin * 2, 4.5, 2, 2, 'F');
        const bw = ((pageW - margin * 2) * s.pct) / 100;
        doc.setFillColor(data.accent[0], data.accent[1], data.accent[2]);
        doc.roundedRect(margin, y, Math.max(3, bw), 4.5, 2, 2, 'F');
        y += 11;
      });
      y += 6;
    }

    if (data.achievements.length) {
      y = ensureY(doc, y, 28, TYPE.top, TYPE.bottom);
      y = sectionTitle(doc, 'Conquistas e destaques', margin, y, data.accent);
      const cols = 2;
      const gap = 6;
      const cardW = (pageW - margin * 2 - gap) / cols;
      let col = 0;
      let rowY = y;
      data.achievements.forEach(function (a) {
        if (col === 0) rowY = ensureY(doc, rowY, 32, TYPE.top, TYPE.bottom);
        const cx = margin + col * (cardW + gap);
        doc.setFillColor(THEME.soft[0], THEME.soft[1], THEME.soft[2]);
        doc.setDrawColor(THEME.line[0], THEME.line[1], THEME.line[2]);
        doc.roundedRect(cx, rowY, cardW, 30, 2, 2, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(data.accent[0], data.accent[1], data.accent[2]);
        doc.text(String(a.val || ''), cx + 6, rowY + 13);
        doc.setFontSize(TYPE.body);
        setInk(doc);
        doc.text(a.ttl || '', cx + 6, rowY + 20);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(TYPE.small);
        setBody(doc);
        doc.text(doc.splitTextToSize(a.ds || '', cardW - 12).slice(0, 2), cx + 6, rowY + 25);
        col++;
        if (col >= cols) {
          col = 0;
          rowY += 36;
        }
      });
    }
  }

  function drawAnalysisPage(doc, data, margin, pageW, pageH) {
    if (!data.analysis.length) return;
    doc.addPage();
    let y = paintPageChrome(doc, data, margin, pageW, pageH);
    y = sectionTitle(doc, 'Inteligência analítica', margin, y, data.accent);
    data.analysis.forEach(function (a) {
      y = ensureY(doc, y, 24, TYPE.top, TYPE.bottom);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(TYPE.title);
      setInk(doc);
      doc.text(a.ttl || 'Análise', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TYPE.body);
      setBody(doc);
      y = writeParagraph(doc, a.body || '', margin, y, pageW - margin * 2);
      y += 6;
    });
  }

  function drawTimelinePage(doc, data, margin, pageW, pageH) {
    if (!data.timeline.length) return;
    doc.addPage();
    let y = paintPageChrome(doc, data, margin, pageW, pageH);
    y = sectionTitle(doc, 'Timeline de projetos', margin, y, data.accent);
    data.timeline.forEach(function (t) {
      y = ensureY(doc, y, 20, TYPE.top, TYPE.bottom);
      doc.setFillColor(data.accent[0], data.accent[1], data.accent[2]);
      doc.circle(margin + 2.5, y, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(TYPE.small);
      doc.setTextColor(data.accent[0], data.accent[1], data.accent[2]);
      doc.text(((t.dt || '') + (t.co ? ' · ' + t.co : '')).trim(), margin + 8, y + 1);
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(TYPE.body);
      setInk(doc);
      doc.text(t.ttl || '', margin + 8, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TYPE.body);
      setBody(doc);
      y = writeParagraph(doc, t.desc || '', margin + 8, y, pageW - margin - 10);
      y += 4;
    });
  }

  function drawTasksPage(doc, data, margin, pageW, pageH) {
    if (!data.tasks.length) return;
    doc.addPage();
    let y = paintPageChrome(doc, data, margin, pageW, pageH);
    y = sectionTitle(
      doc,
      'Registro de atividades (' + data.tasks.length + ')',
      margin,
      y,
      data.accent
    );
    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin, top: TYPE.top, bottom: TYPE.bottom },
      head: [['Atividade', 'Categoria', 'Prioridade', 'Empresa', 'Data']],
      body: data.tasks.map(function (t) {
        return [t.name, t.cat, t.pri, t.co, t.dt];
      }),
      styles: {
        fontSize: TYPE.body,
        cellPadding: 4,
        overflow: 'linebreak',
        textColor: THEME.ink,
        lineColor: THEME.line,
        lineWidth: 0.1,
      },
      headStyles: { fillColor: data.accent, textColor: 255, fontSize: TYPE.body, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: THEME.soft },
      columnStyles: { 0: { cellWidth: 68 } },
    });
  }

  function drawMemorialPage(doc, data, margin, pageW, pageH) {
    const M = data.memorial;
    if (!M?.sections?.length) return;
    doc.addPage();
    let y = paintPageChrome(doc, data, margin, pageW, pageH);
    y = sectionTitle(doc, M.title || 'Memorial descritivo', margin, y, data.accent);
    if (M.intro) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TYPE.body);
      setBody(doc);
      y = writeParagraph(doc, stripHtml(M.intro), margin, y, pageW - margin * 2);
      y += 6;
    }
    M.sections.forEach(function (s, i) {
      y = ensureY(doc, y, 22, TYPE.top, TYPE.bottom);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(TYPE.title);
      setInk(doc);
      doc.text(s.title || 'Capítulo ' + (i + 1), margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(TYPE.body);
      setBody(doc);
      y = writeParagraph(doc, stripHtml(s.body || ''), margin, y, pageW - margin * 2);
      y += 6;
    });
  }

  function drawPendingPage(doc, data, margin, pageW, pageH) {
    doc.addPage();
    let y = paintPageChrome(doc, data, margin, pageW, pageH);
    y = sectionTitle(doc, 'Status do relatório', margin, y, data.accent);
    doc.setFillColor(THEME.soft[0], THEME.soft[1], THEME.soft[2]);
    doc.roundedRect(margin, y, pageW - margin * 2, 40, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(TYPE.section);
    setInk(doc);
    doc.text('Dashboard em elaboração', margin + 10, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(TYPE.body);
    setBody(doc);
    writeParagraph(
      doc,
      'Perfil cadastrado com foto, área e equipe. Os indicadores serão incluídos automaticamente quando o relatório for publicado.',
      margin + 10,
      y + 26,
      pageW - margin * 2 - 20
    );
  }

  async function generateProfilePdf() {
    await loadPdfLibs();
    const { jsPDF } = window.jspdf;
    const data = await collectProfileData();
    if (!data.member) throw new Error('Perfil não identificado');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = TYPE.margin;

    drawCoverPage(doc, data, pageW, margin);

    const hasContent = data.kpis.length || data.tasks.length;
    if (hasContent) {
      drawKpiPage(doc, data, margin, pageW, pageH);
      drawSkillsPage(doc, data, margin, pageW, pageH);
      drawAnalysisPage(doc, data, margin, pageW, pageH);
      drawTimelinePage(doc, data, margin, pageW, pageH);
      drawTasksPage(doc, data, margin, pageW, pageH);
      drawMemorialPage(doc, data, margin, pageW, pageH);
    } else {
      drawPendingPage(doc, data, margin, pageW, pageH);
    }

    drawAllChrome(doc, data, margin, pageW, pageH);

    doc.save('Relatorio-' + slugName(data.member.name) + '.pdf');
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
    btn.setAttribute('aria-label', m ? 'Baixar relatório PDF de ' + m.name : 'Baixar relatório PDF');
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
          alert('Não foi possível gerar o PDF: ' + (err?.message || 'erro desconhecido'));
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
