/* StaffWare 2.0 – static demo. No build step; data comes from data.js.
   UX model: pick a working context (division + filters) once, then run forms / reports / actions.
   Anything that needs a missing filter asks for just that filter at run time. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = (n) => (n < 0 ? '(' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (n < 0 ? ')' : '');
  const byCode = (c) => MODULES.find((m) => m.code === c);
  const store = {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  const DESC = {
    MG: 'Job cost, open lots and budget tracking across divisions.',
    AR: 'Billing, work in progress and invoicing for builders.',
    IC: 'Stock levels, counts and material movement to lots.',
    PO: 'Purchase orders, vendors, back orders and pricing.',
    ES: 'Bids, master assemblies and estimating prices.',
    PM: 'Customer plans, material packs and bid pricing.',
    PR: 'Timecards, payroll runs and labor reports.',
  };
  const state = { filters: {}, actionFilters: {}, tab: {}, cat: {}, q: {}, cur: null, pending: null };
  const fstate = (code, action) => ((action ? state.actionFilters : state.filters)[code] ||= {});
  const prefs = { fav: new Set(store.get('sw-fav', [])), recent: store.get('sw-recent', []), theme: store.get('sw-theme', '') };
  if (prefs.theme) document.documentElement.dataset.theme = prefs.theme;

  /* ---------- generic helpers ---------- */
  function toast(msg, kind = '') {
    const t = document.createElement('div'); t.className = 'toast ' + kind; t.textContent = msg;
    $('#toasts').append(t); setTimeout(() => t.remove(), 3200);
  }
  const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const layer = () => $('#layer');
  const closeLayer = () => { layer().innerHTML = ''; layer().onclick = null; };
  const hasVal = (v) => Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && String(v).trim() !== '';
  const alts = (req) => (req ? req.split('|') : []);
  const letters = (a) => [...a.replace('*', '')];
  const got = (st, l) => hasVal(st[l]) || (l === 'D' && hasVal(st['D*']));
  const satisfied = (it) => !alts(it.req).length || alts(it.req).some((a) => letters(a).every((l) => got(fstate(it.m.code, it.action), l)));
  function bestAlt(it) {
    const st = fstate(it.m.code, it.action);
    return alts(it.req).map((a) => letters(a)).sort((a, b) => a.filter((l) => !got(st, l)).length - b.filter((l) => !got(st, l)).length)[0] || [];
  }
  const missing = (it) => bestAlt(it).filter((l) => !got(fstate(it.m.code, it.action), l));
  const flist = (m, action) => (action ? m.actionFilters : m.filters);
  const fdef = (m, l, action) => flist(m, action).find((f) => f.l === l) || (l === 'D' ? flist(m, action).find((f) => f.l === 'D*') : null);

  /* ---------- classify module buttons into forms / reports / actions ---------- */
  const CATS = [
    [/labor|payroll|hourly|employee|timecard|piece|terminated/i, 'Labor'],
    [/bill|invoice|wip|lots by plan|sequence/i, 'Billing'],
    [/job cost|jc |budget|lot info|lots ready|open lots/i, 'Job cost'],
    [/po |purchase|vendor|back order|ordered|overage|compare|price fluct/i, 'Purchasing'],
    [/inventory|inv |material|counter|item|stock|on hand|top 20|negative/i, 'Materials'],
    [/plan|pack|bid|assembly|customer/i, 'Plans & bids'],
  ];
  const catOf = (label) => (CATS.find(([re]) => re.test(label)) || [0, 'General'])[1];
  const ACTION_TEXT = [
    [/^post/i, 'Posts the selected records. This updates your books and cannot be undone.', true],
    [/^clear/i, 'Clears the working data for the current selection.', true],
    [/^delete/i, 'Permanently removes the selected plan data.', true],
    [/^duplicate/i, 'Copies everything from the source to the target below.', false],
    [/^transfer/i, 'Sends estimating data across to Plan management.', true],
    [/^update/i, 'Recalculates prices using the latest costs.', true],
    [/^import/i, 'Imports estimated prices into the selected bid.', true],
    [/^append/i, 'Adds hourly time to the piece-rate payroll run.', true],
    [/^fix/i, 'Corrects billing codes on the selected records.', true],
    [/^process/i, 'Processes the selected records for the chosen period.', true],
    [/^inv transaction/i, 'Records a manual stock adjustment.', true],
  ];
  const actText = (label) => { const f = ACTION_TEXT.find(([re]) => re.test(label)); return f ? [f[1], f[2]] : ['Runs this process for the current context.', false]; };

  function flatten(m) {
    if (m._items) return m._items;
    const out = [];
    m.sections.forEach((s, si) => s.cols.forEach((col, ci) => col.forEach((b, bi) => {
      const [label, req, o = {}] = b;
      let kind = 'report';
      if (s.title === 'Data entry forms' || /^Enter /.test(label)) kind = 'form';
      else if (s.title === 'Action buttons' || ['red', 'blue', 'peach'].includes(o.kind)) kind = 'action';
      out.push({ id: `${m.code}|${label}|${si}`, m, label, req, o, kind, action: !!s.action, cat: catOf(label), exps: o.exp ? ['Exp'] : o.exps || [], tone: o.kind || '' });
    })));
    return (m._items = out);
  }
  const itemById = (id) => MODULES.flatMap((m) => (m.stub ? [] : flatten(m))).find((i) => i.id === id);

  /* ---------- shell ---------- */
  function renderSidebar() {
    const built = MODULES.filter((m) => !m.stub), soon = MODULES.filter((m) => m.stub);
    const link = (m, cls = '') => `<a href="#/m/${m.code}" data-code="${m.code}" class="${cls}"><span class="code" style="--cc:${m.color || '#8794a1'};--ci:${m.ink || '#fff'}">${m.code}</span>${esc(m.name)}</a>`;
    $('#sidebar').innerHTML = `
      <a class="brand" href="#/home"><img src="assets/logo.png" alt="Republic Electric"><span><b>StaffWare</b><small>Republic Electric West</small></span></a>
      <nav class="nav"><a href="#/home" data-code="home"><span class="code" style="--cc:var(--ink-3)">⌂</span>Switchboard</a>
        <div class="nav-label">Modules</div>${built.map((m) => link(m)).join('')}
        <details><summary class="nav-label" style="cursor:pointer">Coming soon ▾</summary>${soon.map((m) => link(m, 'soon')).join('')}</details></nav>
      <div class="side-foot"><button id="themeBtn" title="Toggle theme">◐ Theme</button><button id="exitBtn">⎋ Exit</button></div>`;
  }
  const setCrumbs = (parts) => { $('#crumbs').innerHTML = parts.map((p) => (p.href ? `<a href="${p.href}">${esc(p.t)}</a>` : `<b>${esc(p.t)}</b>`)).join('<span>›</span>'); };

  /* ---------- routing ---------- */
  function route() {
    document.body.classList.remove('nav-open');
    const [, kind, rawArg = ''] = (location.hash || '#/home').split('/');
    const [arg, qs] = rawArg.split('?'); const deepTab = new URLSearchParams(qs || '').get('tab');
    if (deepTab && byCode(arg)) state.tab[arg] = deepTab;
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.code === (kind === 'm' ? arg : kind === 'assemblies' ? 'ES' : 'home')));
    const v = $('#view'); state.cur = null;
    if (kind === 'm' && byCode(arg)) {
      const m = byCode(arg);
      setCrumbs([{ t: 'Switchboard', href: '#/home' }, { t: m.name }]);
      document.title = `${m.name} · StaffWare 2.0`;
      if (m.stub) v.innerHTML = stubView(m);
      else { state.cur = m; v.innerHTML = moduleView(m); }
    } else if (kind === 'assemblies') {
      setCrumbs([{ t: 'Switchboard', href: '#/home' }, { t: 'Estimating', href: '#/m/ES' }, { t: 'Master assemblies' }]);
      document.title = 'Master assemblies · StaffWare 2.0'; v.innerHTML = assembliesView();
    } else {
      setCrumbs([{ t: 'Switchboard' }]); document.title = 'StaffWare 2.0 · Republic Electric West'; v.innerHTML = homeView();
    }
    window.scrollTo(0, 0);
    if (state.pending && state.cur?.code === state.pending.code) { const it = itemById(state.pending.id); state.pending = null; if (it) setTimeout(() => runItem(it), 50); }
  }

  /* ---------- home ---------- */
  /* Items needing action. Dates come from the sample data (screens captured 10/27/2026). */
  const daysSince = (iso) => Math.floor((Date.now() - new Date(iso + 'T00:00').getTime()) / 86400000);
  const ago = (d) => (d === 0 ? 'today' : d === 1 ? '1 day ago' : d > 0 ? `${d} days ago` : `in ${-d} days`);
  function attentionItems() {
    const pay = daysSince('2026-10-28'), cnt = daysSince('2026-10-02');
    return [
      { tone: 'r', title: pay > 0 ? 'Payroll is overdue' : 'Payroll is due', detail: `Piece and hourly timecards pending since 10/28/2026 (${ago(pay)}).`, cta: 'Process payroll', id: 'PR|Process payroll|0', alt: ['Review pending', 'PR|Employee totals|1'] },
      { tone: 'r', title: 'Material not posted to job cost', detail: 'Unposted material in both divisions (REI, REW).', cta: 'Post packs to job cost', id: 'IC|Post packs to job cost|3', alt: ['Review unposted', 'IC|Lot packs unposted|2'] },
      { tone: '', title: 'Inventory count needs posting', detail: `Last count 10/02/2026 for REW (${ago(cnt)}).`, cta: 'Post inventory count', id: 'IC|Post inventory count|1', alt: ['Enter count', 'IC|Enter inventory count|1'] },
    ];
  }
  function goRun(id) { const it = itemById(id); if (!it) return; state.tab[it.m.code] = it.kind; state.pending = { code: it.m.code, id: it.id }; location.hash = '#/m/' + it.m.code; if (state.cur?.code === it.m.code) route(); }

  function homeView() {
    const months = OPEN_LOTS.filter((r) => r[0] >= '2026-01' && r[0] <= '2026-10').reverse();
    const max = Math.max(...months.map((r) => Math.max(r[1] || 0, r[2] || 0)));
    const bars = months.map((r) => `<div class="bargrp" title="${r[0]} · REI ${r[1]} · REW ${r[2]}"><div class="bar rei" style="height:${(r[1] / max) * 100}%"></div><div class="bar rew" style="height:${((r[2] || 0) / max) * 100}%"></div></div>`).join('');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const built = MODULES.filter((m) => !m.stub);
    const pay = daysSince('2026-10-28');
    const tiles = built.map((m) => {
      const it = flatten(m); const n = (k) => it.filter((i) => i.kind === k).length;
      return `<a class="tile" href="#/m/${m.code}" style="--cc:${m.color}"><div class="top"><span class="code" style="--cc:${m.color};--ci:${m.ink}">${m.code}</span><h3>${esc(m.name)}</h3></div>
        <p>${DESC[m.code]}</p><div class="counts"><span><b>${n('form')}</b> ${n('form') === 1 ? 'form' : 'forms'}</span><span><b>${n('report')}</b> reports</span><span><b>${n('action')}</b> actions</span></div></a>`;
    }).join('');
    const att = attentionItems().map((a) => `<li class="att ${a.tone}"><span class="dot ${a.tone}"></span><div class="att-t"><b>${esc(a.title)}</b><span>${esc(a.detail)}</span></div>
      <div class="att-b"><button class="runbtn sm ${a.tone === 'r' ? 'red' : ''}" data-go="${esc(a.id)}">${esc(a.cta)} →</button>${a.alt ? `<button class="ghost" data-go="${esc(a.alt[1])}">${esc(a.alt[0])}</button>` : ''}</div></li>`).join('');
    const pinned = [...prefs.fav].map(itemById).filter(Boolean);
    const recent = prefs.recent.filter((id) => !prefs.fav.has(id)).map(itemById).filter(Boolean);
    const jl = [...pinned.map((i) => [i, '★ Pinned']), ...recent.map((i) => [i, 'Recent'])].slice(0, 6);
    const jump = jl.length ? `<div class="jump">${jl.map(([i, tag]) => `<button class="jchip" data-jump="${esc(i.id)}"><span class="code" style="--cc:${i.m.color};--ci:${i.m.ink}">${i.m.code}</span><span><b>${esc(i.label)}</b><small>${tag} · ${i.kind}</small></span></button>`).join('')}</div>`
      : `<div class="empty-jump"><b>Nothing here yet</b><span>Reports you run and items you pin ★ will show up here for one-click access.</span><button class="ghost" data-search>Find a report <kbd>⌘K</kbd></button></div>`;
    return `
    <section class="hero"><div class="hero-top"><h1><span class="tri"></span>Welcome back, Eric</h1><span class="demo-tag">Demo · sample data</span></div>
      <p class="hero-sub">${today}<span class="hide-sm"> · Republic Electric West &amp; Republic Elite Integration</span></p>
      <div class="kpis"><div class="kpi"><small>Open lots · REW</small><b>87</b><span>2026-10</span></div><div class="kpi"><small>Open lots · REI</small><b>188</b><span>2026-10</span></div>
      <div class="kpi"><small>Inventory · REW</small><b>$3.45M</b><span>Job cost</span></div><div class="kpi ${pay > 0 ? 'late' : ''}"><small>Payroll pending</small><b>10/28</b><span>${pay > 0 ? 'Overdue ' + ago(pay) : 'Due ' + ago(pay)}</span></div></div>
      <p class="fresh">Sample figures from 10/27/2026 · not connected to StaffwareSQL</p></section>
    <div class="top-grid">
      <section class="card att-card"><div class="sh pad"><span class="tri"></span><h2>Needs attention</h2><small>${attentionItems().length} to resolve</small></div><ul class="att-list">${att}</ul></section>
      <section class="card jump-card"><div class="sh pad"><span class="tri"></span><h2>Jump back in</h2></div>${jump}</section>
    </div>
    <section class="block"><div class="sh"><span class="tri"></span><h2>Modules</h2></div><div class="tiles">${tiles}</div></section>
    <section class="block"><div class="card chart"><div class="sh"><span class="tri"></span><h2>Open lots by month</h2><small>2026 · sample</small></div><div class="bars">${bars}</div>
      <div class="xlab">${months.map((r) => `<span>${r[0].slice(5)}</span>`).join('')}</div><div class="legend"><span><i style="background:var(--brand)"></i>REI</span><span><i style="background:var(--red)"></i>REW</span></div></div></section>
    <section class="block"><div class="sh"><span class="tri"></span><h2>Coming next</h2></div><div class="soon-row">${MODULES.filter((m) => m.stub).map((m) => `<a href="#/m/${m.code}">${m.code} · ${esc(m.name)}</a>`).join('')}</div></section>`;
  }
  const stubView = (m) => `<div class="card stub-card"><span class="code" style="--cc:#8794a1">${m.code}</span><h2>${esc(m.name)}</h2>
    <p>${m.legacy ? 'Marked unused in the data dictionary — a candidate to retire.' : 'Not part of the captured screens yet. It will follow the same pattern as the other modules.'}</p><a href="#/home" class="pbtn" style="text-decoration:none;display:inline-block">Back to switchboard</a></div>`;

  /* ---------- fields ---------- */
  function control(m, f, action, extra = '') {
    const val = fstate(m.code, action)[f.l] ?? '';
    const id = `fc-${action ? 'a' : 'f'}-${m.code}-${f.l.replace('*', 'x') || 'z'}${extra}`;
    const common = `data-m="${m.code}" data-l="${esc(f.l)}" data-a="${action ? 1 : 0}" id="${id}"`;
    if (f.type === 'select') return `<select ${common}><option value=""></option>${LOOKUPS[f.opt].map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    if (f.type === 'division') return `<select ${common}><option value=""></option>${DIVISIONS.map((d) => `<option value="${d.id}" ${d.id === val ? 'selected' : ''}>${d.id} — ${d.name}</option>`).join('')}</select>`;
    if (f.type === 'date') return `<input type="date" ${common} value="${esc(val)}">`;
    if (f.type === 'number') return `<input type="number" min="0" step="0.01" ${common} value="${esc(val)}" placeholder="0.00">`;
    if (f.type === 'list') return `<select multiple ${common}>${LOOKUPS[f.opt].map((o) => `<option ${(val || []).includes(o) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    if (f.type === 'combo') return `<div class="combo"><input autocomplete="off" role="combobox" ${common} value="${esc(val)}" data-combo="${f.opt}" placeholder="Type to search…"><ul hidden></ul></div>`;
    return `<input type="text" ${common} value="${esc(val)}">`;
  }
  const field = (m, f, action, need = false, extra = '') => `<div class="fld ${need ? 'need' : ''}" data-fld="${esc(f.l)}"><label for="fc-${action ? 'a' : 'f'}-${m.code}-${f.l.replace('*', 'x') || 'z'}${extra}">${esc(f.label)}</label>${control(m, f, action, extra)}</div>`;

  /* ---------- module page ---------- */
  function tabsFor(m) {
    const it = flatten(m); const n = (k) => it.filter((i) => i.kind === k).length;
    return [...(m.aside ? [{ k: 'overview', t: 'Overview' }] : []), { k: 'report', t: 'Reports', n: n('report') }, { k: 'form', t: 'Forms', n: n('form') }, { k: 'action', t: 'Actions', n: n('action') }].filter((t) => t.n !== 0);
  }
  function moduleView(m) {
    const tabs = tabsFor(m);
    if (!state.tab[m.code] || !tabs.some((t) => t.k === state.tab[m.code])) state.tab[m.code] = tabs[0].k;
    return `<div id="modroot">
      <header class="phead"><div class="ptitle"><span class="tri"></span><h1>${esc(m.name)}</h1></div><p>${DESC[m.code]}</p><div class="rule"></div></header>
      <div class="ctx" id="ctx"></div>
      <div class="tabs" id="tabs"></div>
      <div id="items"></div></div>`.replace('<div id="items"></div>', `<div id="items"></div>`) + renderModuleParts(m, true);
  }
  /* returns '' but fills DOM after insertion */
  function renderModuleParts(m, defer) {
    if (defer) queueMicrotask(() => { renderCtx(m); renderTabs(m); renderItems(m); });
    return '';
  }
  function refreshModule() { if (state.cur) { renderCtx(state.cur); renderTabs(state.cur); renderItems(state.cur); } }

  function renderCtx(m) {
    const el = $('#ctx'); if (!el) return;
    const st = fstate(m.code); const divF = m.filters.find((f) => f.type === 'division');
    const set = m.filters.filter((f) => f.l && f.type !== 'division' && hasVal(st[f.l]));
    const seg = divF ? `<span class="seg" role="group" aria-label="Division">${DIVISIONS.map((d) => `<button data-div="${d.id}" class="${st[divF.l] === d.id ? 'on' : ''}" title="${d.name}">${d.id}</button>`).join('')}</span>` : '';
    el.innerHTML = `<span class="lab">Working on</span>${seg}
      ${set.map((f) => `<span class="fchip"><b>${esc(f.label)}</b> ${esc(Array.isArray(st[f.l]) ? st[f.l].join(', ') : st[f.l])}<button data-unset="${esc(f.l)}" aria-label="Remove ${esc(f.label)}">×</button></span>`).join('')}
      ${!set.length && !(divF && hasVal(st[divF.l])) ? '<span class="hint">Set your filters once — reports will use them.</span>' : ''}
      <span class="grow"></span><button class="ghost p" data-open-filters>＋ Filters</button>
      ${Object.values(st).some(hasVal) ? '<button class="ghost" data-clear>Clear</button>' : ''}`;
  }
  function renderTabs(m) {
    const el = $('#tabs'); if (!el) return; const cur = state.tab[m.code];
    el.innerHTML = tabsFor(m).map((t) => `<button class="tab ${t.k === cur ? 'on' : ''}" data-tab="${t.k}">${t.t}${t.n ? `<span class="n">${t.n}</span>` : ''}</button>`).join('') +
      (cur !== 'overview' ? `<label class="search"><span>🔍︎</span><input id="modQ" placeholder="Search ${cur === 'report' ? 'reports' : cur === 'form' ? 'forms' : 'actions'}…" value="${esc(state.q[m.code] || '')}" aria-label="Search"></label>` : '');
  }
  function needsHTML(it) {
    if (!alts(it.req).length) return '<div class="needs ready">✓ Ready to run</div>';
    const st = fstate(it.m.code, it.action); const ls = bestAlt(it);
    if (satisfied(it)) return '<div class="needs ready">✓ Ready — filters set</div>';
    return `<div class="needs">Needs ${ls.map((l) => `<span class="need-chip ${got(st, l) ? 'ok' : ''}">${esc(fdef(it.m, l, it.action)?.label || l)}</span>`).join('')}</div>`;
  }
  function renderItems(m) {
    const el = $('#items'); if (!el) return;
    const tab = state.tab[m.code]; const q = (state.q[m.code] || '').toLowerCase();
    if (tab === 'overview') { el.innerHTML = overviewHTML(m); return; }
    let list = flatten(m).filter((i) => i.kind === tab && (!q || i.label.toLowerCase().includes(q)));
    let pills = '';
    if (tab === 'report') {
      const cats = ['All', ...new Set(flatten(m).filter((i) => i.kind === 'report').map((i) => i.cat))];
      const favN = flatten(m).filter((i) => prefs.fav.has(i.id)).length;
      const cur = state.cat[m.code] || 'All';
      pills = `<div class="pills">${[...(favN ? ['★ Pinned'] : []), ...cats].map((c) => `<button class="pill ${c === cur ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
      if (cur === '★ Pinned') list = list.filter((i) => prefs.fav.has(i.id)); else if (cur !== 'All') list = list.filter((i) => i.cat === cur);
    }
    const star = (i) => `<button class="mini ${prefs.fav.has(i.id) ? 'on' : ''}" data-star="${esc(i.id)}" title="${prefs.fav.has(i.id) ? 'Unpin' : 'Pin to switchboard'}" aria-label="Pin">${prefs.fav.has(i.id) ? '★' : '☆'}</button>`;
    const cards = list.map((i) => {
      if (i.kind === 'action') {
        const [txt, risky] = actText(i.label);
        return `<div class="arow ${i.tone}"><div><h3>${esc(i.label)}${risky ? '<span class="tagx r">Changes data</span>' : ''}</h3><p>${txt}</p>${needsHTML(i)}</div><button class="runbtn" data-run="${esc(i.id)}">Run…</button></div>`;
      }
      return `<div class="ic-card ${i.kind}" role="button" tabindex="0" data-run="${esc(i.id)}" data-label="${esc(i.label)}"><div class="tools">${i.exps.map((e, ei) => `<button class="mini" data-exp="${ei + 1}" data-run="${esc(i.id)}" title="Export CSV" aria-label="Export CSV">⇩</button>`).join('')}${star(i)}</div>
        <h3>${esc(i.label)}</h3>${i.kind === 'form' ? '<div class="needs">Data entry form</div>' : ''}${needsHTML(i)}<div class="foot"><span class="tagx">${esc(i.kind === 'form' ? 'Form' : i.cat)}</span>${i.o.help ? `<button class="mini" data-help="${esc(i.o.help)}" title="Help">?</button>` : ''}<span class="run">${i.kind === 'form' ? 'Open →' : 'Run →'}</span></div></div>`;
    }).join('');
    const none = `<div class="empty"><b>Nothing matches “${esc(state.q[m.code] || '')}”</b>Try a different word or clear the search.</div>`;
    el.innerHTML = pills + (tab === 'action' ? `<div class="alist">${cards || none}</div>` : `<div class="grid">${cards || none}</div>`);
    state._lastList = list;
  }
  function overviewHTML(m) {
    const first = flatten(m).filter((i) => i.kind === 'report').slice(0, 6);
    const sugg = `<div class="sh sugg-title"><span class="tri"></span><h2>Popular reports</h2></div><div class="grid">${first.map((i) => `<div class="ic-card" role="button" tabindex="0" data-run="${esc(i.id)}"><h3>${esc(i.label)}</h3>${needsHTML(i)}<div class="foot"><span class="tagx">${esc(i.cat)}</span><span class="run">Run →</span></div></div>`).join('')}</div>`;
    return `<div class="ov">${asideView(m)}</div>${sugg}`;
  }
  function asideView(m) {
    if (m.aside === 'openlots') {
      const months = OPEN_LOTS.filter((r) => r[0] >= '2025-01' && r[0] <= '2026-10').reverse(); const max = Math.max(...months.map((r) => Math.max(r[1] || 0, r[2] || 0)));
      return `<div class="card panel" style="grid-column:1/-1"><h3>Open lots · REI vs REW</h3><div class="bars" style="height:150px">${months.map((r) => `<div class="bargrp" title="${r[0]} · REI ${r[1]} · REW ${r[2]}"><div class="bar rei" style="height:${(r[1] / max) * 100}%"></div><div class="bar rew" style="height:${((r[2] || 0) / max) * 100}%"></div></div>`).join('')}</div>
        <div class="legend"><span><i style="background:var(--brand)"></i>REI</span><span><i style="background:var(--red)"></i>REW</span><span style="margin-left:auto">Jan 2025 → Oct 2026</span></div></div>
        <div class="card panel"><h3>Open lots per period</h3><div class="scrollbox"><table class="minitable"><thead><tr><th>Period</th><th>REI</th><th>REW</th></tr></thead><tbody>${OPEN_LOTS.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div></div>`;
    }
    if (m.aside === 'snapshot') return `<div class="card panel"><h3>Customer snapshot in use</h3><div class="empty-snap">No billing snapshot is currently in use.<br>Run “Process billing” to create one.</div></div>`;
    if (m.aside === 'invdates') return `<div class="card panel"><h3>Material unposted by division</h3><table class="minitable"><thead><tr><th>Division</th></tr></thead><tbody><tr><td>REI</td></tr><tr><td>REW</td></tr></tbody></table></div>
      <div class="card panel"><h3>Inventory counts</h3><div class="scrollbox"><table class="minitable"><thead><tr><th>Date</th><th>Division</th></tr></thead><tbody>${INV_DATES.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div></div>`;
    if (m.aside === 'payroll') return `<div class="card panel"><h3>Pending dates <span class="tagx r">Payroll in progress</span></h3><table class="minitable"><thead><tr><th>Piece date</th><th>Hourly date</th></tr></thead><tbody><tr><td>10/28/2026</td><td>10/28/2026</td></tr></tbody></table></div>
      <div class="card panel"><h3>Paid dates</h3><div class="scrollbox"><table class="minitable"><thead><tr><th>Payroll date</th><th>Division</th></tr></thead><tbody>${PAID_DATES.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div></div>`;
    return '';
  }

  /* ---------- running things ---------- */
  function remember(it) { prefs.recent = [it.id, ...prefs.recent.filter((x) => x !== it.id)].slice(0, 8); store.set('sw-recent', prefs.recent); }
  function runItem(it, exp = 0) {
    if (it.o.route) { location.hash = it.o.route; return; }
    if (it.kind === 'action') return actionDialog(it);
    ensureParams(it, () => {
      remember(it); const ctx = summary(it.m);
      if (exp) return exportCsv(it.label);
      if (it.kind === 'form') return openForm(it.m, it.label);
      openReport(it.m, it.label, ctx);
    });
  }
  function summary(m, action) {
    const st = fstate(m.code, action);
    return flist(m, action).filter((f) => hasVal(st[f.l])).map((f) => `${f.label}: ${Array.isArray(st[f.l]) ? st[f.l].join(', ') : st[f.l]}`);
  }
  function ensureParams(it, cb) { if (satisfied(it)) return cb(); paramDialog(it, cb, { all: false }); }

  function paramDialog(it, cb, { all = false, danger = false, btn = 'Run', intro = '' } = {}) {
    const m = it.m; const ls = all ? bestAlt(it) : missing(it);
    const fields = ls.map((l) => fdef(m, l, it.action)).filter(Boolean);
    let body;
    const need = (f) => !got(fstate(m.code, it.action), f.l);
    if (it.action && m.code === 'PM' && fields.some((f) => /^From/.test(f.label)) && fields.some((f) => /^To/.test(f.label))) {
      const from = fields.filter((f) => /^From/.test(f.label)), to = fields.filter((f) => /^To/.test(f.label)), rest = fields.filter((f) => !from.includes(f) && !to.includes(f));
      body = `<div class="copy"><div><h4>From (source)</h4>${from.map((f) => field(m, f, true, need(f), 'p')).join('')}</div><div class="arrow">➜</div><div><h4>To (target)</h4>${to.map((f) => field(m, f, true, need(f), 'p')).join('')}</div></div>${rest.map((f) => field(m, f, true, need(f), 'p')).join('')}`;
    } else body = fields.length ? `<div class="fgrid">${fields.map((f) => `<div class="${f.type === 'list' ? 'full' : ''}">${field(m, f, it.action, need(f), 'p')}</div>`).join('')}</div>` : '';
    const [txt, risky] = actText(it.label);
    layer().innerHTML = `<div class="overlay" data-close-bg><div class="dialog pdlg ${fields.length > 3 ? 'wide' : ''}" role="dialog" aria-modal="true" data-id="${esc(it.id)}">
      <div class="dh"><h2><span class="tri"></span>${esc(it.label)}</h2><p>${esc(intro || (it.kind === 'action' ? txt : fields.length ? 'Just a couple of details before this runs:' : 'Ready to go.'))}</p></div>
      <div class="db">${it.kind === 'action' ? `<div class="warnbox ${danger ? '' : 'info'}">ⓘ <span><b>Demo mode.</b> ${danger ? 'In production this changes data in StaffWare. ' : ''}Nothing will be changed here.</span></div>` : ''}${body}</div>
      <div class="df"><button class="sbtn" data-close>Cancel</button><button class="pbtn ${danger ? 'danger' : ''}" id="pdGo">${esc(btn)}</button></div></div></div>`;
    const go = $('#pdGo'); const upd = () => { go.disabled = !satisfied(it); };
    upd(); layer().__upd = upd;
    go.onclick = () => { if (!satisfied(it)) return; closeLayer(); refreshModule(); cb(); };
    $('.pdlg select, .pdlg input', layer())?.focus();
  }
  function actionDialog(it) {
    const [, risky] = actText(it.label);
    paramDialog(it, () => { remember(it); toast(`Demo only — “${it.label}” did not change any data`); }, { all: true, danger: risky, btn: it.label.length > 22 ? 'Run action' : it.label });
  }
  function promptParam(name, def, cb) {
    layer().innerHTML = `<div class="overlay" data-close-bg><div class="dialog" role="dialog" aria-modal="true"><div class="dh"><h2><span class="tri"></span>Labor burden</h2><p>${esc(name)}</p></div>
      <div class="db"><div class="fld"><label for="paramIn">Burden %</label><input id="paramIn" value="${esc(def)}" inputmode="decimal"></div></div>
      <div class="df"><button class="sbtn" data-close>Cancel</button><button class="pbtn" id="paramOk">Run report</button></div></div></div>`;
    const go = () => { const v = $('#paramIn').value.trim(); if (!v) return; closeLayer(); cb(v); };
    $('#paramOk').onclick = go; $('#paramIn').onkeydown = (e) => e.key === 'Enter' && go(); $('#paramIn').select();
  }

  /* ---------- forms ---------- */
  function openForm(m, label) {
    const r = rng(hash(label)); const div = DIVISIONS[Math.floor(r() * 3)].id;
    layer().innerHTML = `<div class="overlay" data-close-bg style="place-items:stretch end;padding:0"><aside class="drawer" role="dialog" aria-modal="true">
      <header><h2>${esc(label)}</h2><p>${esc(m.name)} · data entry</p></header>
      <div class="dbody"><div class="fgrid">
        <div class="fld full"><label>Name / description</label><input placeholder="${esc(label)}"></div>
        <div class="fld"><label>Division</label><select>${DIVISIONS.map((d) => `<option ${d.id === div ? 'selected' : ''}>${d.id}</option>`).join('')}</select></div>
        <div class="fld"><label>Status</label><select><option>Active</option><option>Inactive</option></select></div>
        <div class="fld"><label>Customer</label><select>${LOOKUPS.customer.map((o) => `<option>${o}</option>`).join('')}</select></div>
        <div class="fld"><label>Date</label><input type="date" value="${new Date().toISOString().slice(0, 10)}"></div>
        <div class="fld"><label>Quantity</label><input type="number" value="${Math.floor(r() * 90) + 10}"></div>
        <div class="fld"><label>Amount</label><input value="${money(r() * 5000 + 200)}"></div>
        <div class="fld full"><label>Notes</label><textarea rows="4" placeholder="Optional notes"></textarea></div></div></div>
      <footer><button class="sbtn" data-close>Cancel</button><button class="pbtn" id="saveForm">Save</button></footer></aside></div>`;
    $('#saveForm').onclick = () => { closeLayer(); toast(`Demo only — “${label}” was not saved`); };
  }

  /* ---------- reports ---------- */
  function openReport(m, label, ctx) {
    if (label === 'WIP timed') { const pre = fstate('AR').L; return promptParam('The report needs a labor burden percentage.', hasVal(pre) ? pre : '25', (b) => reportSheet(m, 'TWIP - timed work in progress', ctx, twipBody(b), 'landscape')); }
    if (/^(Inventory value summ|Current inventory summary)$/.test(label)) return reportSheet(m, 'Inventory current value summary', ctx, invBody(), 'portrait', 'REW');
    if (label === 'PO item history') return reportSheet(m, 'Inventory item: ' + (fstate('PO').E || 'BX-MT-1G-HB-EX') + ' purchasing history', ctx, poBody(), 'landscape');
    reportSheet(m, label, ctx, genericBody(m, label), 'portrait');
  }
  function twipBody(burden) {
    const sum = (rows, i) => rows.reduce((a, r) => a + (r[i] || 0), 0); const f = (n) => (n ? money(n) : ''); const pct = (n) => (n ? n + '%' : '');
    const groups = TWIP.map((g) => {
      const rows = g.rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${f(r[2])}</td><td>${f(r[3])}</td><td>${f(r[4])}</td><td>${pct(r[5])}</td><td>${f(r[6])}</td><td>${f(r[7])}</td><td>${f(r[8])}</td><td>${pct(r[9])}</td><td>${f(r[10])}</td><td>${f(r[11])}</td><td>${f(r[12])}</td><td class="bal">${f(r[13])}</td><td>${f(r[14])}</td><td>${pct(r[15])}</td><td>${f(r[16])}</td><td>${pct(r[17])}</td><td>${f(r[18])}</td><td>${pct(r[19])}</td></tr>`).join('');
      const t = g.rows;
      return `<tr class="grp"><td colspan="20">${esc(g.head)}</td></tr>${rows}<tr class="tot"><td colspan="2">Totals</td><td>${f(sum(t, 2))}</td><td>${f(sum(t, 3))}</td><td>${f(sum(t, 4))}</td><td></td><td>${f(sum(t, 6))}</td><td>${f(sum(t, 7))}</td><td>${f(sum(t, 8))}</td><td></td><td>${f(sum(t, 10))}</td><td>${f(sum(t, 11))}</td><td>${f(sum(t, 12))}</td><td>${f(sum(t, 13))}</td><td>${f(sum(t, 14))}</td><td></td><td>${f(sum(t, 16))}</td><td></td><td>${f(sum(t, 18))}</td><td></td></tr>`;
    }).join('');
    return `<div class="sub"><span></span><span>Profit data is gross and includes sales tax on material, labor values include burden ${esc(burden)}%</span></div>
    <table class="rt"><thead><tr><th rowspan="2" class="l">Lot / block / plan</th><th rowspan="2">Start date</th><th colspan="4">Labor</th><th colspan="4">Material</th><th colspan="4">Contract and Billing</th><th colspan="6">Gross profit</th></tr>
      <tr>${['Standard', 'Total est', 'Actual', '%', 'Standard', 'Total est', 'Actual', '%', 'Standard', 'Total est', 'Billing', 'Balance', 'Standard', 'GS%', 'Total est', 'GE%', 'Actual', 'GA%'].map((h) => `<th class="sub2">${h}</th>`).join('')}</tr></thead><tbody>${groups}</tbody></table>`;
  }
  function invBody() {
    const total = INV_VALUE.reduce((a, r) => a + r[3], 0);
    return `<table class="rt"><thead><tr><th class="l">Inventory class</th><th>Last cost</th><th>Average cost</th><th>Job cost</th></tr></thead><tbody>${INV_VALUE.map((r) => `<tr><td>${r[0]}</td><td>${money(r[1])}</td><td>${money(r[2])}</td><td>${money(r[3])}</td></tr>`).join('')}<tr class="tot"><td colspan="3">Total inventory value (job cost)</td><td>${money(total)}</td></tr></tbody></table>`;
  }
  function poBody() {
    return `<div class="sub"><span>1G Mtl Handy box EXT w/1/2" KO'S 1-7/8" Deep (Orbit HB-1-50-EXT)</span></div><table class="rt"><thead><tr><th class="l">PO Num</th><th>Date</th><th class="l">Vendor</th><th>Ordered</th><th>Uom</th><th>Received</th><th>Cost</th><th>Notes</th></tr></thead><tbody>
    ${PO_HISTORY.map(([d, rows]) => `<tr class="grp"><td colspan="8">${d} &nbsp; Republic Electric West</td></tr>${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td style="text-align:left">${r[2]}</td><td>${r[3].toFixed(2)}</td><td>ea</td><td>${r[4].toFixed(2)}</td><td>$${r[5].toFixed(6)}</td><td></td></tr>`).join('')}`).join('')}</tbody></table>`;
  }
  function reportData(label) {
    const r = rng(hash(label)); const L = label.toLowerCase(); let cols, gen;
    if (/count|inventory|item|material|counter/.test(L)) { cols = ['Item', 'Description', 'Class', 'Qty', 'Unit cost', 'Value']; gen = (i) => { const q = Math.floor(r() * 400) + 1, c = r() * 40 + .3; return [LOOKUPS.item[i % 8], ['Handy box', 'Crimp sleeve', 'Wire nut', 'Staple', 'Romex 14/2', 'Plate', 'Switch 15A', 'Device'][i % 8], LOOKUPS.invclass[i % 7], q, money(c), money(q * c)]; }; }
    else if (/labor|payroll|hourly|employee|timecard|piece/.test(L)) { cols = ['Employee', 'Job', 'Lot', 'Hours', 'Rate', 'Gross']; gen = (i) => { const h = r() * 40 + 4, rt = r() * 20 + 22; return [LOOKUPS.employee[i % 5], LOOKUPS.job[i % 5], LOOKUPS.lot[i % 7], h.toFixed(1), money(rt), money(h * rt)]; }; }
    else if (/po |purchase|vendor|order|back/.test(L + ' ')) { cols = ['PO #', 'Date', 'Vendor', 'Ordered', 'Received', 'Cost']; gen = (i) => { const q = Math.floor(r() * 200) + 10; return [LOOKUPS.po[i % 5], `2026-0${(i % 9) + 1}-1${i % 9}`, LOOKUPS.vendor[i % 4], q, Math.floor(q * (.6 + r() * .4)), money(q * (r() * 5 + 1))]; }; }
    else { cols = ['Customer', 'Job', 'Lot / plan', 'Date', 'Division', 'Amount']; gen = (i) => [LOOKUPS.customer[i % 3], LOOKUPS.job[i % 5], LOOKUPS.lot[i % 7], `2026-10-${String(i + 1).padStart(2, '0')}`, ['REW', 'REI'][i % 2], money(r() * 12000 + 400)]; }
    return { cols, rows: Array.from({ length: 16 }, (_, i) => gen(i)) };
  }
  function genericBody(m, label) {
    const { cols, rows } = reportData(label);
    return `<table class="rt"><thead><tr>${cols.map((c, i) => `<th class="${i < 2 ? 'l' : ''}">${c}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i < 3 ? ' style="text-align:left"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table><p style="color:#777;font-size:11px;margin-top:12px">Demo data — layout shown with sample values.</p>`;
  }
  function reportSheet(m, title, ctx, body, orient, divLabel) {
    layer().innerHTML = `<div class="overlay" data-close-bg><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sheet-bar"><h2>${esc(title)}</h2><span class="demo-tag sm">Sample data</span><button class="sbtn" id="rPrint">🖶 Print</button>
        <button class="sbtn ${orient === 'portrait' ? 'on' : ''}" data-orient="portrait">Portrait</button><button class="sbtn ${orient === 'landscape' ? 'on' : ''}" data-orient="landscape">Landscape</button>
        <button class="sbtn" data-zoom="-1" aria-label="Zoom out">−</button><span class="zoomlab" id="zl">100%</span><button class="sbtn" data-zoom="1" aria-label="Zoom in">＋</button>
        <button class="sbtn" id="rPdf">PDF</button><button class="sbtn" id="rCsv">CSV</button><button class="pbtn" data-close>Close</button></div>
      <div class="sheet-body"><div class="paper ${orient}" id="paper"><h1>${esc(title)}${divLabel ? `<span class="div">${divLabel}</span>` : ''}</h1>
        ${ctx.length ? `<div class="sub"><span>${ctx.map(esc).join(' · ')}</span></div>` : ''}${body}<div class="foot"><span>${new Date().toLocaleString('en-US')} · Sample data, not from StaffwareSQL</span><span>Page 1 of 1</span></div></div></div></div></div>`;
    let z = 1; const paper = $('#paper');
    const apply = () => { paper.style.transform = `scale(${z})`; paper.style.marginBottom = `${(z - 1) * paper.offsetHeight}px`; $('#zl').textContent = Math.round(z * 100) + '%'; };
    layer().onclick = (e) => {
      const o = e.target.closest('[data-orient]'), zm = e.target.closest('[data-zoom]');
      if (o) { paper.className = 'paper ' + o.dataset.orient; $$('[data-orient]').forEach((b) => b.classList.toggle('on', b === o)); apply(); }
      if (zm) { z = Math.min(1.6, Math.max(.5, z + zm.dataset.zoom * .1)); apply(); }
    };
    $('#rPrint').onclick = $('#rPdf').onclick = () => window.print();
    $('#rCsv').onclick = () => exportCsv(title);
  }
  function exportCsv(label) {
    const { cols, rows } = reportData(label);
    const csv = [cols, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = label.replace(/[^\w]+/g, '_') + '.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500); toast(`Exported ${a.download} (sample data)`);
  }

  /* ---------- filters drawer ---------- */
  function openFilters(m) {
    const main = m.filters.filter((f) => f.l || f.type === 'list'); const act = m.actionFilters;
    layer().innerHTML = `<div class="overlay" data-close-bg style="place-items:stretch end;padding:0"><aside class="drawer" role="dialog" aria-modal="true"><header><h2>Filters</h2><p>${esc(m.name)} · applies to every report and form</p></header>
      <div class="dbody"><div><div class="fgrid">${main.map((f) => `<div class="${f.type === 'list' ? 'full' : ''}">${field(m, f, false, false, 'd')}</div>`).join('')}</div></div>
      ${act ? `<div><h4>Copy source &amp; target (for Duplicate actions)</h4><div class="fgrid">${act.map((f) => `<div>${field(m, f, true, false, 'd')}</div>`).join('')}</div></div>` : ''}</div>
      <footer><button class="ghost" id="fClear">Clear all</button><button class="pbtn" data-close>Done</button></footer></aside></div>`;
    $('#fClear').onclick = () => { state.filters[m.code] = {}; state.actionFilters[m.code] = {}; openFilters(m); refreshModule(); };
  }

  /* ---------- master assemblies ---------- */
  const asm = { group: 'REW', type: null, open: new Set(), q: '' };
  function assembliesView() {
    const types = ASSEMBLY_TYPES[asm.group] || []; asm.type ||= asm.group === 'REI' ? '03 Cameras' : types[0];
    const list = (ASSEMBLIES[asm.group] || []).filter((a) => !asm.q || (a.name + a.desc + a.notes).toLowerCase().includes(asm.q.toLowerCase()));
    const rows = list.map((a, i) => {
      const id = asm.group + i + a.name; const open = asm.open.has(id);
      const sub = a.items ? `<tr class="child"><td colspan="4"><table class="subtbl"><thead><tr><th>Item</th><th class="num">Quantity</th><th>Stage</th><th>Work</th><th>Status</th><th class="num">Estimating price</th><th>No change</th></tr></thead><tbody>${a.items.map((it) => `<tr><td>${it.item}</td><td class="num">${it.qty}</td><td>${it.stage}</td><td>${it.work}</td><td>${it.status}</td><td class="num">${it.price.toFixed(6)}</td><td>${it.nochange}</td></tr>`).join('')}</tbody></table></td></tr>` : `<tr class="child"><td colspan="4"><div class="empty-snap" style="text-align:left;padding:10px 34px">No items in this assembly yet.</div></td></tr>`;
      return `<tr class="parent ${open ? 'open' : ''}" data-asm="${esc(id)}"><td class="tw">${open ? '▾' : '▸'}</td><td>${esc(a.name)}</td><td>${esc(a.desc)}</td><td>${esc(a.notes)}</td></tr>${open ? sub : ''}`;
    }).join('');
    return `<header class="phead"><div class="ptitle"><span class="tri"></span><h1>Master assemblies</h1></div><p>Reusable material packs, grouped by division. Expand a row to see its items.</p><div class="rule"></div></header>
      <div class="asm-bar"><label for="asmGroup" class="lab" style="font:700 10.5px Roboto;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)">Group</label>
        <select class="inp" id="asmGroup" style="width:auto;min-width:260px">${ASSEMBLY_GROUPS.map((g) => `<option ${g === asm.group ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select><span class="grow"></span>
        <button class="ghost" id="asmDefaults">Set default values</button><button class="ghost" id="asmRefresh">Refresh</button><button class="ghost p" id="asmNew">＋ New group</button></div>
      <div class="asm"><div class="card panel"><h3>Type</h3>${types.length ? `<ul class="typelist">${types.map((t) => `<li class="${t === asm.type ? 'sel' : ''}" data-type="${esc(t)}">${esc(t)}</li>`).join('')}</ul>` : '<div class="empty-snap">No types in this group.</div>'}<div class="recbar">Type ${types.indexOf(asm.type) + 1 || 0} of ${types.length}</div></div>
        <div class="card panel"><h3>Assemblies <input class="inp" id="asmQ" placeholder="Search assemblies" value="${esc(asm.q)}" style="width:240px;margin-left:auto;text-transform:none;letter-spacing:0;font-weight:400"></h3>
          <div class="grid-wrap"><table class="dt"><thead><tr><th></th><th>Name</th><th>Description</th><th>Notes</th></tr></thead><tbody>${rows || '<tr><td colspan="4"><div class="empty-snap">No assemblies match.</div></td></tr>'}</tbody></table></div><div class="recbar">${list.length} assemblies</div></div></div>`;
  }

  /* ---------- command palette ---------- */
  function openPalette() {
    const idx = [];
    MODULES.forEach((m) => { idx.push({ m, label: m.name, sec: 'Module' }); if (!m.stub) flatten(m).forEach((i) => idx.push({ m, label: i.label, sec: i.kind, it: i })); });
    let hl = 0, res = [];
    layer().innerHTML = `<div class="overlay" data-close-bg style="align-items:start"><div class="palette" role="dialog" aria-label="Search"><input id="pIn" placeholder="Search modules, reports, forms and actions…" autocomplete="off"><ul id="pList"></ul><div class="pf"><span>↑↓ navigate</span><span>↵ run</span><span>esc close</span></div></div></div>`;
    const draw = () => {
      const q = $('#pIn').value.trim().toLowerCase();
      res = (q ? idx.filter((r) => (r.label + ' ' + r.m.name + ' ' + r.m.code).toLowerCase().includes(q)) : idx.filter((r) => r.sec === 'Module')).slice(0, 40);
      hl = Math.min(hl, Math.max(res.length - 1, 0));
      $('#pList').innerHTML = res.length ? res.map((r, i) => `<li class="${i === hl ? 'hl' : ''}" data-i="${i}"><span class="code" style="--cc:${r.m.color || '#8794a1'};--ci:${r.m.ink || '#fff'}">${r.m.code}</span>${esc(r.label)}<small>${r.sec === 'Module' ? 'Module' : esc(r.m.name + ' · ' + r.sec)}</small></li>`).join('') : '<div class="none">No matches</div>';
    };
    const go = (r) => {
      closeLayer();
      if (r.it) { state.tab[r.m.code] = r.it.kind; state.q[r.m.code] = ''; state.cat[r.m.code] = 'All'; state.pending = { code: r.m.code, id: r.it.id }; if (location.hash === '#/m/' + r.m.code) { route(); } else location.hash = '#/m/' + r.m.code; }
      else location.hash = '#/m/' + r.m.code;
    };
    $('#pIn').oninput = () => { hl = 0; draw(); };
    $('#pIn').onkeydown = (e) => {
      if (e.key === 'ArrowDown') { hl = Math.min(hl + 1, res.length - 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { hl = Math.max(hl - 1, 0); draw(); e.preventDefault(); } else if (e.key === 'Enter' && res[hl]) go(res[hl]);
    };
    $('#pList').onclick = (e) => { const li = e.target.closest('li[data-i]'); if (li) go(res[+li.dataset.i]); };
    draw(); $('#pIn').focus();
  }
  function signOut() {
    layer().innerHTML = `<div class="overlay"><div class="dialog signed-out"><img src="assets/logo.png" alt=""><h2 style="font:900 20px Roboto;text-transform:uppercase;color:var(--brand)">You've been signed out</h2><p style="margin:8px 0 18px;color:var(--ink-2)">Thanks, Eric. Your StaffWare session has ended.</p><button class="pbtn" id="signIn">Sign back in</button></div></div>`;
    $('#signIn').onclick = () => { closeLayer(); location.hash = '#/home'; };
  }
  function comboDraw(inp) {
    const ul = inp.nextElementSibling; const q = inp.value.toLowerCase();
    const opts = LOOKUPS[inp.dataset.combo].filter((o) => o.toLowerCase().includes(q)).slice(0, 30);
    ul.innerHTML = opts.map((o, i) => `<li class="${i === 0 ? 'hl' : ''}" data-v="${esc(o)}">${q ? esc(o).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i'), '<mark>$1</mark>') : esc(o)}</li>`).join('');
    ul.hidden = !opts.length;
  }
  function setFilter(el, v) {
    fstate(el.dataset.m, el.dataset.a === '1')[el.dataset.l] = v;
    layer().__upd?.(); refreshModule();
  }

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-close]') || (t.matches('[data-close-bg]'))) { closeLayer(); return; }
    const li = t.closest('.combo li');
    if (li) { const inp = li.closest('.combo').querySelector('input'); inp.value = li.dataset.v; setFilter(inp, li.dataset.v); li.parentElement.hidden = true; return; }
    if (!t.closest('.combo')) $$('.combo ul').forEach((u) => (u.hidden = true));
    const m = state.cur;
    const star = t.closest('[data-star]'); if (star) { const id = star.dataset.star; prefs.fav.has(id) ? prefs.fav.delete(id) : prefs.fav.add(id); store.set('sw-fav', [...prefs.fav]); refreshModule(); toast(prefs.fav.has(id) ? 'Pinned to your switchboard' : 'Unpinned'); return; }
    const help = t.closest('[data-help]'); if (help) { layer().innerHTML = `<div class="overlay" data-close-bg><div class="dialog"><div class="dh"><h2><span class="tri"></span>Help</h2><p>${esc(help.dataset.help)}</p></div><div class="df"><button class="pbtn" data-close>Got it</button></div></div></div>`; return; }
    const run = t.closest('[data-run]'); if (run && m) { const it = itemById(run.dataset.run); if (it) runItem(it, +(t.closest('[data-exp]')?.dataset.exp || 0)); return; }
    const go = t.closest('[data-go]'); if (go) { goRun(go.dataset.go); return; }
    if (t.closest('[data-search]')) return openPalette();
    const jump = t.closest('[data-jump]'); if (jump) { const it = itemById(jump.dataset.jump); state.tab[it.m.code] = it.kind; state.pending = { code: it.m.code, id: it.id }; location.hash = '#/m/' + it.m.code; return; }
    const tab = t.closest('[data-tab]'); if (tab && m) { state.tab[m.code] = tab.dataset.tab; refreshModule(); return; }
    const cat = t.closest('[data-cat]'); if (cat && m) { state.cat[m.code] = cat.dataset.cat; renderItems(m); return; }
    const dv = t.closest('[data-div]'); if (dv && m) { const f = m.filters.find((x) => x.type === 'division'); const st = fstate(m.code); st[f.l] = st[f.l] === dv.dataset.div ? '' : dv.dataset.div; refreshModule(); return; }
    const un = t.closest('[data-unset]'); if (un && m) { fstate(m.code)[un.dataset.unset] = ''; refreshModule(); return; }
    if (t.closest('[data-clear]') && m) { state.filters[m.code] = {}; state.actionFilters[m.code] = {}; refreshModule(); toast('Filters cleared'); return; }
    if (t.closest('[data-open-filters]') && m) return openFilters(m);
    if (t.closest('#themeBtn')) { prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = prefs.theme; store.set('sw-theme', prefs.theme); return; }
    if (t.closest('#exitBtn')) return signOut();
    if (t.closest('#searchBtn')) return openPalette();
    if (t.closest('#menuBtn')) return document.body.classList.toggle('nav-open');
    if (t.closest('#scrim')) return document.body.classList.remove('nav-open');
    const row = t.closest('tr[data-asm]'); if (row) { const id = row.dataset.asm; asm.open.has(id) ? asm.open.delete(id) : asm.open.add(id); $('#view').innerHTML = assembliesView(); return; }
    const ty = t.closest('[data-type]'); if (ty) { asm.type = ty.dataset.type; $('#view').innerHTML = assembliesView(); return; }
    if (t.closest('#asmNew')) { layer().innerHTML = `<div class="overlay" data-close-bg><div class="dialog"><div class="dh"><h2><span class="tri"></span>New group</h2><p>Name the new assembly group.</p></div><div class="db"><div class="fld"><label>Group name</label><input></div></div><div class="df"><button class="sbtn" data-close>Cancel</button><button class="pbtn" id="newGrp">Create</button></div></div></div>`; return; }
    if (t.closest('#newGrp')) { closeLayer(); return toast('Demo only — group was not created'); }
    if (t.closest('#asmDefaults')) return toast('Demo only — no changes applied');
    if (t.closest('#asmRefresh')) { $('#view').innerHTML = assembliesView(); return toast('Refreshed'); }
  });
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.id === 'modQ' && state.cur) { state.q[state.cur.code] = el.value; renderItems(state.cur); return; }
    if (el.id === 'asmQ') { asm.q = el.value; const pos = el.selectionStart; $('#view').innerHTML = assembliesView(); const n = $('#asmQ'); n.focus(); n.setSelectionRange(pos, pos); return; }
    if (el.dataset?.l !== undefined && el.dataset.m) {
      setFilter(el, el.multiple ? [...el.selectedOptions].map((o) => o.value) : el.value);
      if (el.dataset.combo) comboDraw(el);
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'asmGroup') { asm.group = e.target.value; asm.type = null; asm.open.clear(); $('#view').innerHTML = assembliesView(); }
  });
  document.addEventListener('focusin', (e) => { if (e.target.dataset?.combo) comboDraw(e.target); });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape' && layer().innerHTML) closeLayer();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('ic-card')) { e.preventDefault(); e.target.click(); }
    const c = e.target.dataset?.combo;
    if (c && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
      const ul = e.target.nextElementSibling; const items = $$('li', ul); if (!items.length) return;
      let i = items.findIndex((x) => x.classList.contains('hl'));
      if (e.key === 'Enter') { items[i]?.click(); e.preventDefault(); return; }
      items[i]?.classList.remove('hl'); i = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[i].classList.add('hl'); items[i].scrollIntoView({ block: 'nearest' }); e.preventDefault();
    }
  });
  window.addEventListener('hashchange', route);
  $('#scrim').id = 'scrim';
  renderSidebar();
  route();
})();
