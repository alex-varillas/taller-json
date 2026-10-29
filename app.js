/* ============ Aplicación ============ */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const STORE = 'taller-json-v1';
  const state = { done: {}, drafts: {}, current: 0 };
  EX.forEach((e, i) => { e.id = i + 1; });

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (s && typeof s === 'object') {
        state.done = s.done || {};
        state.drafts = s.drafts || {};
        state.current = Number.isInteger(s.current) && s.current >= 0 && s.current < EX.length ? s.current : 0;
      }
    } catch (e) { /* sin almacenamiento: el taller funciona igual */ }
  }
  let saveTimer = null;
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { } }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 350); }

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const fmt = t => esc(t).split('§').map((p, i) => i % 2 ? '<code>' + p + '</code>' : p).join('');

  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    $('#toast-text').textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
  }

  /* ---------- Navegación ---------- */
  function buildNav() {
    const nav = $('#nav');
    nav.innerHTML = '';
    LEVELS.forEach(L => {
      const sec = document.createElement('section');
      sec.className = 'lv lv' + L.n;
      sec.innerHTML = '<h3 class="lv-head"><span><span class="swatch" aria-hidden="true"></span>' + esc(L.nombre) + '</span><span class="lv-count" id="lvc' + L.n + '"></span></h3><p class="lv-desc">' + esc(L.desc) + '</p>';
      const ul = document.createElement('ul');
      EX.forEach((e, i) => {
        if (e.nivel !== L.n) return;
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ex-link';
        b.dataset.i = i;
        b.innerHTML = '<span class="ex-num">' + String(e.id).padStart(2, '0') + '</span><span class="ex-t">' + esc(e.titulo) + '</span><span class="ex-ok" aria-hidden="true"></span>';
        b.addEventListener('click', () => { go(i); closeNav(); });
        li.appendChild(b);
        ul.appendChild(li);
      });
      sec.appendChild(ul);
      nav.appendChild(sec);
    });
    // Una ficha de avance por nivel, junto a la ficha del avance total
    const kpis = $('#progreso');
    kpis.querySelectorAll('.tile.level').forEach(t => t.remove());
    LEVELS.forEach(L => {
      const total = EX.filter(e => e.nivel === L.n).length;
      const t = document.createElement('div');
      t.className = 'tile level lv' + L.n;
      t.innerHTML = '<p class="tile-label"><span class="swatch" aria-hidden="true"></span><span class="name">' + esc(L.nombre) + '</span></p>' +
        '<p class="tile-value"><span id="lvt' + L.n + '">0</span><small aria-hidden="true">/' + total + '</small><span class="sr"> de ' + total + '</span></p>' +
        '<p class="tile-sub">' + esc(L.desc) + '</p>' +
        '<div class="seg" aria-hidden="true"><i id="seg' + L.n + '"></i></div>';
      kpis.appendChild(t);
    });
    $('#meter').setAttribute('aria-valuemax', EX.length);
  }

  function refreshProgress() {
    let total = 0;
    LEVELS.forEach(L => {
      const all = EX.filter(e => e.nivel === L.n);
      const n = all.filter(e => state.done[e.id]).length;
      total += n;
      $('#lvc' + L.n).textContent = n + '/' + all.length;
      $('#lvt' + L.n).textContent = n;
      $('#seg' + L.n).style.width = (n / all.length * 100) + '%';
    });
    const left = EX.length - total;
    $('#overall-text').innerHTML = total + '<small> de ' + EX.length + '</small>';
    $('#overall-label').textContent = total === EX.length ? 'Taller completo' : 'Tu avance';
    $('#overall-sub').textContent = total === 0 ? 'Empieza por el ejercicio 1, a tu ritmo.'
      : left === 0 ? 'Resolviste todos los ejercicios.'
      : (left === 1 ? 'Te falta 1 ejercicio.' : 'Te faltan ' + left + ' ejercicios.');
    $('#meter').setAttribute('aria-valuenow', total);
    $('#meter-fill').style.width = (total / EX.length * 100) + '%';
    $('#nav-toggle-count').textContent = total + '/' + EX.length;
    document.querySelectorAll('.ex-link').forEach(b => {
      const i = +b.dataset.i;
      b.classList.toggle('done', !!state.done[EX[i].id]);
      b.setAttribute('aria-current', i === state.current ? 'true' : 'false');
    });
  }

  function closeNav() {
    $('#layout').classList.remove('nav-open');
    $('#nav-toggle').setAttribute('aria-expanded', 'false');
  }

  /* ---------- Diagnóstico de errores (en español) ---------- */
  function maskStrings(raw) {
    let out = '', inStr = false, esc2 = false, start = -1;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (!inStr) {
        if (c === '"') { inStr = true; start = i; }
        out += c;
      } else if (esc2) { esc2 = false; out += c === '\n' ? '\n' : '·'; }
      else if (c === '\\') { esc2 = true; out += '·'; }
      else if (c === '"') { inStr = false; out += '"'; }
      else out += c === '\n' ? '\n' : '·';
    }
    return { m: out, open: inStr ? start : -1 };
  }
  const lineOf = (s, idx) => s.slice(0, idx).split('\n').length;

  function diagnose(raw) {
    const { m, open } = maskStrings(raw);
    const tips = [];
    const add = (idx, text) => tips.push({ line: lineOf(m, idx), text });
    let r;

    if (open >= 0) add(open, 'este texto abre comillas y nunca las cierra.');

    const stack = [];
    const pairs = { '}': '{', ']': '[' };
    for (let i = 0; i < m.length; i++) {
      const c = m[i];
      if (c === '{' || c === '[') stack.push({ c, i });
      else if (c === '}' || c === ']') {
        const top = stack.pop();
        if (!top) add(i, 'hay un ' + c + ' de más, no tiene su apertura.');
        else if (top.c !== pairs[c]) add(i, 'el ' + c + ' no corresponde con el ' + top.c + ' abierto en la línea ' + lineOf(m, top.i) + '. Probablemente falta un cierre antes.');
      }
    }
    stack.forEach(t => add(t.i, 'el ' + t.c + ' abierto aquí nunca se cierra.'));

    const hasSingle = (r = /'/.exec(m));
    if (hasSingle) add(r.index, 'JSON solo acepta comillas dobles ("). Cambia las comillas simples (\').');
    if ((r = /\/\/|\/\*/.exec(m))) add(r.index, 'JSON no permite comentarios. Bórralos.');

    const seen = new Set();
    const known = /(?<![\w$.])(True|False|None|undefined|NaN|Infinity)(?![\w$])/g;
    while ((r = known.exec(m))) {
      const w = r[1];
      if (seen.has(w)) continue;
      seen.add(w);
      const how = { True: 'escribe true en minúscula.', False: 'escribe false en minúscula.', None: 'en JSON el valor vacío es null.' }[w] || 'JSON no tiene ' + w + '. Usa null u otro valor válido.';
      add(r.index, w + ' no es válido: ' + how);
    }

    const keyRe = /(?<=[{,]\s*)([A-Za-z_$][\w$]*)\s*:/g;
    const keyWords = new Set();
    while ((r = keyRe.exec(m))) { keyWords.add(r[1]); add(r.index, 'la clave "' + r[1] + '" necesita comillas dobles.'); }

    const commaRe = /,\s*[}\]]/g;
    while ((r = commaRe.exec(m))) add(r.index, 'hay una coma de más justo antes de un cierre. Quítala.');

    const zeroRe = /(?<![\w.])-?0\d+(?:\.\d+)?/g;
    while ((r = zeroRe.exec(m))) add(r.index, 'los números no pueden empezar con cero (' + r[0] + '). Escribe ' + Number(r[0]) + '.');

    const missRe = /(["\]}\d]|\btrue|\bfalse|\bnull)\s+(?=["{\[\-\d]|\btrue\b|\bfalse\b|\bnull\b)/g;
    while ((r = missRe.exec(m))) {
      const at = r.index + r[1].length - 1;
      if (m[at] === '"' && /^\s*:/.test(m.slice(at + 1))) continue;
      add(at, 'parece que falta una coma después de este valor.');
    }

    {
      const blank = s => s.replace(/[^\n]/g, '·');
      const m2 = m.replace(/'[^'\n]*'/g, blank).replace(/\/\/[^\n]*/g, blank).replace(/\/\*[\s\S]*?\*\//g, blank);
      const wordRe = /(?<![\w$.])([A-Za-zÀ-ÿ_][\w$À-ÿ]*)(?![\w$À-ÿ])(?!\s*:)/g;
      const skip = new Set(['true', 'false', 'null', 'True', 'False', 'None', 'undefined', 'NaN', 'Infinity']);
      const shown = new Set();
      while ((r = wordRe.exec(m2))) {
        const w = r[1];
        if (skip.has(w) || keyWords.has(w) || shown.has(w)) continue;
        shown.add(w);
        add(r.index, '"' + w + '" quedó fuera de comillas. Si es parte de un texto, escapa las comillas de alrededor con \\" o ponlo todo entre comillas dobles.');
      }
    }

    tips.sort((a, b) => a.line - b.line);
    const uniq = [];
    tips.forEach(t => { if (!uniq.some(u => u.line === t.line && u.text === t.text)) uniq.push(t); });
    const lines = uniq.slice(0, 6).map(t => 'Línea ' + t.line + ': ' + t.text);
    if (uniq.length > 6) lines.push('Hay ' + (uniq.length - 6) + (uniq.length - 6 === 1 ? ' aviso más' : ' avisos más') + '. Corrige estos primero y vuelve a mirar.');
    if (!lines.length) lines.push('Revisa que cada clave tenga comillas dobles, que haya una coma entre elementos y que cada llave y corchete tenga su cierre.');
    return lines;
  }

  function enginePos(raw, msg) {
    let m = /line (\d+) column (\d+)/.exec(msg);
    if (m) return { line: +m[1], col: +m[2] };
    m = /position (\d+)/.exec(msg);
    if (m) {
      const parts = raw.slice(0, +m[1]).split('\n');
      return { line: parts.length, col: parts[parts.length - 1].length + 1 };
    }
    return null;
  }

  /* ---------- Resaltado de la vista interpretada ---------- */
  function highlight(str) {
    return esc(str).replace(/("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g, m => {
      let c = 'n';
      if (m[0] === '"') c = /:$/.test(m) ? 'k' : 's';
      else if (m === 'true' || m === 'false') c = 'b';
      else if (m === 'null') c = 'z';
      return '<span class="t-' + c + '">' + m + '</span>';
    });
  }

  /* ---------- Editor ---------- */
  const code = $('#code');
  function updateGutter(raw) {
    const n = raw.split('\n').length;
    let g = '';
    for (let i = 1; i <= n; i++) g += (i > 1 ? '\n' : '') + i;
    $('#gutter').textContent = g;
    const h = Math.min(Math.max(n * 22.4 + 28, 288), 560);
    document.querySelector('.editor').style.height = h + 'px';
    $('#gutter').scrollTop = code.scrollTop;
  }

  function validate() {
    const e = EX[state.current];
    const raw = code.value;
    updateGutter(raw);
    let parsed, ok = false, err = null;
    if (raw.trim() === '') err = { empty: true };
    else {
      try { parsed = JSON.parse(raw); ok = true; } catch (ex) { err = { msg: String(ex.message) }; }
    }
    const results = e.checks.map(([, fn]) => {
      if (!ok) return null;
      try { return !!fn(parsed, raw); } catch (x) { return false; }
    });
    const passed = results.filter(r => r === true).length;
    const pass = ok && passed === e.checks.length;

    $('#checks').innerHTML = e.checks.map(([label], i) => {
      const r = results[i];
      const cls = r === true ? 'ok' : r === false ? 'no' : 'wait';
      const sym = r === true ? '✓' : r === false ? '✗' : '·';
      const sr = r === true ? 'Cumplido: ' : r === false ? 'Falta: ' : 'Pendiente: ';
      return '<li class="' + cls + '"><span class="mark" aria-hidden="true">' + sym + '</span><span><span class="sr">' + sr + '</span>' + esc(label) + '</span></li>';
    }).join('');

    const count = $('#checks-count');
    count.textContent = passed + '/' + e.checks.length;
    count.classList.toggle('is-done', pass);

    const st = $('#status');
    if (err && err.empty) {
      st.className = 'status neutral';
      st.innerHTML = 'El editor está vacío. Escribe tu JSON y se validará mientras escribes.';
    } else if (err) {
      const pos = enginePos(raw, err.msg);
      st.className = 'status bad';
      st.innerHTML = '<strong>JSON no válido</strong>' + (pos ? '<span class="loc">línea ' + pos.line + ', columna ' + pos.col + '</span>' : '') +
        '<ul class="tips">' + diagnose(raw).map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
        '<p class="engine">Mensaje original del motor (en inglés): <code>' + esc(err.msg.slice(0, 160)) + '</code></p>';
    } else if (pass) {
      st.className = 'status good';
      st.innerHTML = '<strong>Correcto.</strong> Cumples los ' + e.checks.length + ' requisitos.';
    } else {
      st.className = 'status mid';
      st.innerHTML = '<strong>JSON válido.</strong> Cumples ' + passed + ' de ' + e.checks.length + ' requisitos. Revisa los que marcan ✗.';
    }
    $('#editor').dataset.state = st.className.replace('status ', '');

    const pv = $('#preview');
    if (ok) { pv.className = 'preview'; pv.innerHTML = highlight(JSON.stringify(parsed, null, 2)); }
    else { pv.className = 'preview empty'; pv.textContent = 'Cuando tu JSON sea válido, aquí verás cómo lo interpreta JSON.parse, con un color por tipo de dato.'; }

    const done = $('#done');
    done.hidden = !pass;
    if (pass) {
      const last = state.current === EX.length - 1;
      $('#done-title').textContent = 'Ejercicio ' + e.id + ' resuelto';
      $('#done-text').innerHTML = '<strong>Lo que practicaste:</strong> ' + fmt(e.aprendiste);
      $('#btn-next-2').hidden = last;
      if (!state.done[e.id]) {
        state.done[e.id] = true;
        save();
        refreshProgress();
        if (EX.every(x => state.done[x.id])) toast('Completaste los 20 ejercicios');
      }
    }
  }

  /* ---------- Render de un ejercicio ---------- */
  function render() {
    const e = EX[state.current];
    const L = LEVELS.find(l => l.n === e.nivel);
    const pill = $('#lvl-pill');
    pill.textContent = 'Nivel ' + L.n + ' / ' + L.nombre;
    pill.className = 'pill lv' + L.n;
    $('#ex-count').textContent = 'Ejercicio ' + e.id + ' de ' + EX.length;
    $('#ex-title').textContent = e.titulo;
    $('#ex-prompt').innerHTML = fmt(e.enunciado);
    const refs = $('#ex-refs');
    if (e.refs && e.refs.length) {
      refs.hidden = false;
      refs.innerHTML = e.refs.map(r => '<div class="ref"><div class="ref-l">' + esc(r.etiqueta) + '</div><pre>' + highlight(r.codigo) + '</pre></div>').join('');
    } else { refs.hidden = true; refs.innerHTML = ''; }

    const draft = state.drafts[e.id];
    code.value = typeof draft === 'string' ? draft : e.starter;
    if (typeof draft !== 'string') {
      const k = e.starter.indexOf('\n  \n');
      const pos = k >= 0 ? k + 3 : 0;
      code.setSelectionRange(pos, pos);
    }
    code.scrollTop = 0;

    $('#hint').hidden = true;
    $('#btn-hint').textContent = 'Ver pista';
    $('#btn-hint').setAttribute('aria-expanded', 'false');
    $('#hint-text').innerHTML = fmt(e.pista);
    hideSolution();

    $('#btn-prev').disabled = state.current === 0;
    $('#btn-next').disabled = state.current === EX.length - 1;
    validate();
    refreshProgress();
  }

  function go(i) {
    if (i < 0 || i >= EX.length) return;
    state.drafts[EX[state.current].id] = code.value;
    state.current = i;
    save();
    render();
    // Lleva al inicio del ejercicio solo si ya se había bajado más allá
    const top = $('#layout').getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' });
  }

  /* ---------- Pista y solución ---------- */
  let solStep = 0, solTimer = null;
  function hideSolution() {
    clearTimeout(solTimer);
    solStep = 0;
    $('#solution').hidden = true;
    const b = $('#btn-solution');
    b.textContent = 'Ver solución';
    b.setAttribute('aria-expanded', 'false');
  }
  $('#btn-hint').addEventListener('click', () => {
    const h = $('#hint');
    h.hidden = !h.hidden;
    $('#btn-hint').textContent = h.hidden ? 'Ver pista' : 'Ocultar pista';
    $('#btn-hint').setAttribute('aria-expanded', String(!h.hidden));
  });
  $('#btn-solution').addEventListener('click', () => {
    const b = $('#btn-solution');
    if (!$('#solution').hidden) { hideSolution(); return; }
    if (solStep === 0) {
      solStep = 1;
      b.textContent = '¿Seguro? Pulsa de nuevo';
      clearTimeout(solTimer);
      solTimer = setTimeout(() => { solStep = 0; b.textContent = 'Ver solución'; }, 4000);
      return;
    }
    clearTimeout(solTimer);
    $('#solution-code').innerHTML = highlight(EX[state.current].solucion);
    $('#solution').hidden = false;
    b.textContent = 'Ocultar solución';
    b.setAttribute('aria-expanded', 'true');
  });
  $('#btn-use').addEventListener('click', () => {
    code.value = EX[state.current].solucion;
    state.drafts[EX[state.current].id] = code.value;
    saveSoon();
    validate();
    toast('Solución cargada en el editor');
  });
  $('#btn-copy').addEventListener('click', () => {
    const txt = EX[state.current].solucion;
    const fallback = () => {
      const rng = document.createRange();
      rng.selectNodeContents($('#solution-code'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(rng);
      toast('Texto seleccionado, copia con Ctrl+C');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => toast('Solución copiada'), fallback);
    } else fallback();
  });

  /* ---------- Botones generales ---------- */
  $('#btn-prev').addEventListener('click', () => go(state.current - 1));
  $('#btn-next').addEventListener('click', () => go(state.current + 1));
  $('#btn-next-2').addEventListener('click', () => go(state.current + 1));
  $('#btn-reset').addEventListener('click', () => {
    code.value = EX[state.current].starter;
    delete state.drafts[EX[state.current].id];
    saveSoon();
    validate();
    toast('Ejercicio reiniciado');
  });
  $('#btn-format').addEventListener('click', () => {
    try {
      const v = JSON.parse(code.value);
      code.value = JSON.stringify(v, null, 2);
      state.drafts[EX[state.current].id] = code.value;
      saveSoon();
      validate();
      toast('JSON formateado');
    } catch (e) { toast('Corrige los errores para poder formatear'); }
  });
  $('#nav-toggle').addEventListener('click', () => {
    const l = $('#layout');
    const open = !l.classList.contains('nav-open');
    l.classList.toggle('nav-open', open);
    $('#nav-toggle').setAttribute('aria-expanded', String(open));
  });

  /* ---------- Eventos del editor ---------- */
  code.addEventListener('input', () => {
    state.drafts[EX[state.current].id] = code.value;
    saveSoon();
    validate();
  });
  code.addEventListener('scroll', () => { $('#gutter').scrollTop = code.scrollTop; });
  function insert(text) {
    code.focus();
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok) {
      code.setRangeText(text, code.selectionStart, code.selectionEnd, 'end');
      code.dispatchEvent(new Event('input'));
    }
  }
  code.addEventListener('keydown', ev => {
    if (ev.key === 'Tab' && !ev.shiftKey && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      ev.preventDefault();
      insert('  ');
    } else if (ev.key === 'Enter' && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.shiftKey) {
      const v = code.value, s = code.selectionStart, e = code.selectionEnd;
      if (s !== e) return;
      ev.preventDefault();
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const indent = (/^[ \t]*/.exec(v.slice(lineStart, s)) || [''])[0];
      const prev = v[s - 1], next = v[s];
      if ((prev === '{' && next === '}') || (prev === '[' && next === ']')) {
        insert('\n' + indent + '  \n' + indent);
        const p = s + 1 + indent.length + 2;
        code.setSelectionRange(p, p);
      } else if (prev === '{' || prev === '[') insert('\n' + indent + '  ');
      else insert('\n' + indent);
    }
  });

  /* ---------- Tema claro u oscuro ---------- */
  // El claro es el predeterminado, sin importar el tema del sistema.
  // La elección se guarda aparte del progreso y el <head> la aplica antes de pintar.
  const THEME = 'taller-json-tema-v2';
  try { localStorage.removeItem('taller-json-tema'); } catch (e) { } // clave antigua, ya no se usa
  const currentTheme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  function refreshThemeButton() {
    const dark = currentTheme() === 'dark';
    const b = $('#btn-theme');
    const label = dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
    b.dataset.dark = String(dark);
    b.setAttribute('aria-label', label);
    b.title = label;
  }
  $('#btn-theme').addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME, next); } catch (e) { }
    refreshThemeButton();
  });

  /* ---------- Inicio ---------- */
  refreshThemeButton();
  load();
  buildNav();
  render();
})();
