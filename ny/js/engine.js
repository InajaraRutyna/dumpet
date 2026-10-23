/* Dumpet på Måne Syv · engine: stage, words, speech, panels, saving, sound, menu */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), A = window.Art;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ================= state, saved on the device */
  const KEY = 'dumpet2';
  const DEF = { v: 2, name: '', pro: 'hun', mem: {}, words: {}, power: 0, prog: {}, cp: null, day: 0, started: 0, set: { sound: 1, music: 0.75, rate: 0.9, pitch: 1, voice: '', mic: 1 } };
  let S = JSON.parse(JSON.stringify(DEF));
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && o.v === 2) S = Object.assign(S, o, { set: Object.assign({}, DEF.set, o.set || {}) }); } catch (e) { }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  const W = { ff: false, ffq: [], sd: 0 };          // runtime flags: fast-forward while restoring a checkpoint
  const wait = ms => W.ff ? Promise.resolve() : new Promise(r => setTimeout(r, ms));

  /* ================= the picture */
  const G = { scene: 'title', cast: [], lift: 0, liftT: 0 };
  let stage, canvasBox = { x: 0, y: 0, sc: 1 };
  const clock = () => performance.now() / 1000;
  const TW = [];
  function ease(e, k) { return e === 'lin' ? k : e === 'out' ? 1 - Math.pow(1 - k, 3) : e === 'in' ? k * k * k : k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  // animate obj[key] to a value; instant while restoring
  function tween(obj, key, to, dur, e) {
    for (let i = TW.length - 1; i >= 0; i--) if (TW[i].obj === obj && TW[i].key === key) { TW[i].res(); TW.splice(i, 1); }
    if (W.ff || !dur) { obj[key] = to; return Promise.resolve(); }
    return new Promise(res => TW.push({ obj, key, from: +obj[key] || 0, to, t0: clock(), dur, e: e || 'io', res }));
  }
  function runTweens(t) {
    for (let i = TW.length - 1; i >= 0; i--) {
      const w = TW[i], k = Math.min(1, (t - w.t0) / w.dur);
      w.obj[w.key] = w.from + (w.to - w.from) * ease(w.e, k);
      if (k >= 1) { TW.splice(i, 1); w.res(); }
    }
  }
  function layout() {
    const vw = innerWidth, vh = innerHeight, st = $('#stage'), cv = $('#cv');
    let sw, sh;
    if (vw / vh < 0.62) { sw = vw; sh = vh; } else { sh = vh; sw = Math.min(vw, Math.round(vh * 390 / 844)); }
    st.style.width = sw + 'px'; st.style.height = sh + 'px';
    const sc = Math.max(sw / 390, sh / 844), cw = 390 * sc, ch = 844 * sc;
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px'; cv.style.left = (sw - cw) / 2 + 'px'; cv.style.top = (sh - ch) / 2 + 'px';
    canvasBox = { x: (sw - cw) / 2, y: (sh - ch) / 2, sc };
    document.documentElement.style.setProperty('--s', Math.max(0.86, Math.min(1.35, sw / 390)).toFixed(3));
  }
  // when a tall panel covers the bottom, the scene slides up so the characters stay visible
  // the scene sits at one fixed height per place: it never jumps with the size of a text box
  let liftScene = null;
  function updateLift() {
    const st = $('#stage').getBoundingClientRect();
    const visTop = -canvasBox.y / canvasBox.sc, visH = st.height / canvasBox.sc;
    const want = (G.feet || 668) - (visTop + visH * 0.54);   // the hero's feet just above the middle of what you see
    const target = Math.max(0, Math.min(G.maxLift == null ? 260 : G.maxLift, want));
    if (G.scene !== liftScene) { liftScene = G.scene; G.lift = target; return; }
    G.lift += (target - G.lift) * 0.12;
  }
  const TICK = [];
  function onTick(f) { TICK.push(f); }
  function frame() {
    const t = clock();
    runTweens(t);
    for (const f of TICK) { try { f(t); } catch (e) { console.error(e); } }
    updateLift();
    for (const a of G.cast) { if (a.k === 'skib') a.talk = G.talk === 'skib' && speaking(); else if (a.k === 'hero' && G.night && a._g !== G.glow) refreshHero(); }
    try { stage.draw(t, G); } catch (e) { console.error(e); }
    audioTick(t);
    requestAnimationFrame(frame);
  }

  /* ================= people and pronouns */
  const SPK = {};
  const Hun = () => S.pro === 'han' ? 'Han' : 'Hun';
  function fmt(s) {
    return String(s).replace(/\{navn\}/g, S.name || 'Syv').replace(/\{hun\}/g, S.pro).replace(/\{Hun\}/g, Hun()).replace(/\{hende\}/g, S.pro === 'han' ? 'ham' : 'hende').replace(/\{hendes\}/g, S.pro === 'han' ? 'hans' : 'hendes')
      .replace(/\{job\}/g, (S.mem.job && S.mem.job.da) || 'lærer').replace(/\{she\}/g, S.pro === 'han' ? 'he' : 'she').replace(/\{She\}/g, S.pro === 'han' ? 'He' : 'She').replace(/\{her\}/g, S.pro === 'han' ? 'him' : 'her').replace(/\{hers\}/g, S.pro === 'han' ? 'his' : 'her');
  }

  /* ================= words: every Danish word can be tapped for its meaning */
  const GLOSS = {};
  const BASE = new Set('og er jeg du ja nej hej tak'.split(' '));
  let PHR = [], RE = null;
  const unacc = s => s.replace(/[éèê]/g, 'e').replace(/[áà]/g, 'a').replace(/[óò]/g, 'o');
  const DIG = { '1': 'en', '2': 'to', '3': 'tre', '4': 'fire', '5': 'fem', '6': 'seks', '7': 'syv', '8': 'otte', '9': 'ni', '10': 'ti' };
  const norm = s => unacc(String(s).toLowerCase()).replace(/\d+/g, d => DIG[d] || d).replace(/[.,!?;:"'’…()–—-]/g, ' ').replace(/\s+/g, ' ').trim();
  function addGloss(o) { Object.assign(GLOSS, o); PHR = Object.keys(GLOSS).filter(k => k.includes(' ')).sort((a, b) => b.length - a.length); RE = new RegExp('(?<![\\p{L}&])(?:' + PHR.map(p => p.replace(/ /g, '\\s+')).join('|') + ')(?![\\p{L}])|[\\p{L}]+', 'giu'); }
  const gk = w => { const l = w.toLowerCase().replace(/\s+/g, ' '); return GLOSS[l] != null ? l : GLOSS[unacc(l)] != null ? unacc(l) : ''; };
  const knows = k => BASE.has(k) || (S.words[k] || 0) > 0;
  function fog(s) {
    s = esc(fmt(s));
    if (!RE) return s;
    return s.replace(RE, x => { const k = gk(x); return k ? `<span data-w="${esc(k)}" class="${knows(k) ? '' : 'new'}">${x}</span>` : x; });
  }
  function learn(...ks) { ks.forEach(k => { k = norm(k); if (GLOSS[k] != null) S.words[k] = (S.words[k] || 0) + 1; }); }
  function learnText(t) { const n = ' ' + norm(t) + ' '; Object.keys(GLOSS).forEach(k => { if (n.includes(' ' + k + ' ')) S.words[k] = (S.words[k] || 0) + 1; }); }
  let glT;
  function pop(el, word, g, sayIt) {
    const gl = $('#gl'), m = String(g || '').match(/^(.*?)\s*\((.*)\)\s*$/), main = m && m[1] ? m[1] : g, note = m && m[1] ? m[2] : '';
    gl.innerHTML = `<b>${esc(word)}</b>${sayIt ? `<button class="mini" data-say="${esc(word)}" aria-label="Hear it">▶</button>` : ''}<div>${esc(main)}</div>${note ? `<div class="n">${esc(note)}</div>` : ''}`;
    gl.hidden = false;
    const r = el.getBoundingClientRect(), st = $('#stage').getBoundingClientRect(), w = gl.offsetWidth, h = gl.offsetHeight;
    let x = r.left - st.left + r.width / 2 - w / 2; x = Math.max(8, Math.min(st.width - w - 8, x));
    let y = r.top - st.top - h - 8; if (y < 56) y = r.bottom - st.top + 8;
    gl.style.left = x + 'px'; gl.style.top = y + 'px';
    clearTimeout(glT); glT = setTimeout(() => gl.hidden = true, 6000);
  }
  document.addEventListener('click', e => {
    audioStart();
    const gl = $('#gl');
    if (e.target.closest('#gl')) { const b = e.target.closest('[data-say]'); if (b) speak(b.dataset.say); e.stopPropagation(); return; }
    const wasOpen = !gl.hidden; gl.hidden = true;
    if (wasOpen && !e.target.closest('[data-w],button,input,textarea,select')) { e.stopPropagation(); e.preventDefault(); return; }
    const w = e.target.closest('[data-w]');
    if (w) { e.stopPropagation(); const k = w.dataset.w; pop(w, k.includes(' ') ? k : w.textContent, GLOSS[k], true); if (w.classList.contains('new')) { w.classList.remove('new'); S.words[k] = (S.words[k] || 0) + 1; save(); } return; }
    const sp = e.target.closest('[data-say]'); if (sp) { e.stopPropagation(); speak(sp.dataset.say, sp.dataset.who); }
  }, true);
  let tipT;
  function toast(t, ms) { const tip = $('#tip'); tip.textContent = t; tip.hidden = false; clearTimeout(tipT); tipT = setTimeout(() => tip.hidden = true, ms || 2600); }

  /* ================= speech: the world speaks Danish aloud; you can answer aloud */
  const daVoices = () => { try { return speechSynthesis.getVoices().filter(x => /^da/i.test(x.lang)); } catch (e) { return []; } };
  try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => { }; } catch (e) { }
  let speakingUntil = 0;
  const speaking = () => { try { return speechSynthesis.speaking || clock() < speakingUntil; } catch (e) { return clock() < speakingUntil; } };
  function speak(t, who) {
    if (W.ff || !t) return;
    try {
      const v = (SPK[who] && SPK[who].voice) || [1, 1], u = new SpeechSynthesisUtterance(fmt(t).replace(/[«»"“”…]/g, ' '));
      u.lang = 'da-DK'; u.rate = Math.max(0.5, Math.min(1.6, S.set.rate * v[0])); u.pitch = Math.max(0.1, Math.min(2, S.set.pitch * v[1]));
      const vs = daVoices(), dv = vs.find(x => x.name === S.set.voice) || vs[0]; if (dv) u.voice = dv;
      const busy = speechSynthesis.speaking || speechSynthesis.pending;
      speechSynthesis.cancel();
      if (busy) setTimeout(() => { try { speechSynthesis.speak(u); } catch (e) { } }, 80); else speechSynthesis.speak(u);
      speakingUntil = clock() + Math.min(6, 0.6 + t.length * 0.055);
    } catch (e) { }
  }
  // Listening. On phones the microphone needs a moment, and it can't open while the game or a voice is still playing:
  // so the game goes quiet first, the button says "vent" (wait), and only then "Tal nu" (speak now).
  let hearMiss = 0;
  function hear(onState) {
    return new Promise(res => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      hear.why = '';
      if (!SR || !S.set.mic) { hear.why = 'none'; return res(null); }
      const st = x => { try { if (onState) onState(x); } catch (e) { } };
      const ac = AU.c, wasOn = !!(ac && ac.state === 'running');
      let done = false, opened = false, interim = [], tStop, tOpen;
      const fin = v => {
        if (done) return; done = true; clearTimeout(tStop); clearTimeout(tOpen);
        if (wasOn) ac.resume().catch(() => { });
        if (v && v.length) hearMiss = 0; else if (v) hearMiss++;
        res(v);
      };
      try { speechSynthesis.cancel(); } catch (e) { }
      if (wasOn) ac.suspend().catch(() => { });
      st('wait');
      setTimeout(() => {
        let r;
        try { r = new SR(); } catch (e) { hear.why = 'none'; return fin(null); }
        r.lang = 'da-DK'; r.maxAlternatives = 5; r.interimResults = true; r.continuous = false;
        r.onaudiostart = () => { opened = true; st('listen'); };
        r.onspeechstart = () => { opened = true; st('hearing'); };
        r.onresult = e => {
          const last = e.results[e.results.length - 1], alts = [...last].map(x => x.transcript).filter(x => x && x.trim());
          if (!alts.length) return;
          if (last.isFinal) fin(alts); else interim = alts;
        };
        r.onerror = e => {
          hear.why = e.error;
          if (['not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'language-not-supported'].includes(e.error)) fin(interim.length ? interim : null);
        };
        r.onend = () => fin(interim);
        try { r.start(); } catch (e) { hear.why = 'none'; return fin(null); }
        // some phones never announce that the microphone is open: after a moment, assume it is
        tOpen = setTimeout(() => { if (!opened) st('listen'); }, 1500);
        tStop = setTimeout(() => { try { r.stop(); } catch (e) { } }, 9000);
      }, 400);
    });
  }
  // what to tell the player when nothing usable came back
  function hearMsg(alts) {
    const w = hear.why;
    if (alts === null) {
      if (w === 'not-allowed' || w === 'service-not-allowed') return 'The microphone is blocked for this page. Allow it in the browser’s site settings (the icon left of the address), or tap or write the answer.';
      if (w === 'audio-capture') return 'No microphone was found. Tap or write the answer instead.';
      if (w === 'network') return 'Speaking needs an internet connection. Tap or write the answer instead.';
      if (w === 'language-not-supported') return 'This phone can’t recognise spoken Danish. Tap or write the answer instead.';
      return 'Speaking doesn’t work in this browser. Open the page in Chrome, or tap or write the answer.';
    }
    return hearMiss >= 2 ? 'Still nothing. Wait until the button says “Tal nu”, then speak close to the phone. Or use Skriv to write it.' : 'I heard nothing. Wait until the button says “Tal nu”, then speak.';
  }
  const MICL = { wait: '… vent', listen: '● Tal nu', hearing: '… lytter' };

  /* ================= checkpoints: every answered step is remembered; leaving mid-scene loses nothing */
  function cpStart(id) { if (S.cp && S.cp.id === id && S.cp.r.length) { W.ffq = S.cp.r.slice(); W.ff = true; } else { S.cp = { id, r: [] }; W.ffq = []; W.ff = false; } save(); }
  function cpEnd() { S.cp = null; W.ff = false; W.ffq = []; save(); }
  async function step(run) {
    if (W.sd) return run();
    if (W.ffq.length) return W.ffq.shift();
    if (W.ff) { W.ff = false; restoreAudioMood(); }
    W.sd = 1; let v;
    try { v = await run(); } finally { W.sd = 0; }
    if (S.cp) { S.cp.r.push(v === undefined ? null : v); save(); }
    return v;
  }

  /* ================= panels */
  const panel = () => $('#panel');
  function show(html, cls) { const p = panel(); p.className = (cls || '') + (G.night ? ' night' : ''); p.innerHTML = html; p.hidden = false; p.scrollTop = 0; return p; }
  function hidePanel() { const p = panel(); p.hidden = true; p.innerHTML = ''; G.talk = null; }
  function nextBtn(label) { return `<button class="go next" id="nx" aria-label="Continue">${label || '▸'}</button>`; }
  // wait for ▸ only: a tap on the text is for looking words up, never for moving on
  function waitNext(p) {
    return new Promise(res => {
      const b = p.querySelector('#nx'); if (!b) return res();
      b.onclick = e => { e.stopPropagation(); b.onclick = null; res(); };
    });
  }
  // on a keyboard, Enter is the same as ▸
  addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.target.closest && e.target.closest('input,textarea')) return;
    const b = document.querySelector('#panel:not([hidden]) #nx'); if (b) { e.preventDefault(); b.click(); }
  });
  function who(id) { const s = SPK[id] || { name: id }; return `<div class="who">${esc(fmt(s.name))}${s.sub ? ` <small>${esc(s.sub)}</small>` : ''}</div>`; }
  function lineHtml(id, da, en) {
    return `<div class="pop">${who(id)}<p class="da" lang="da">${fog(da)}</p><div class="tools"><button class="mini" data-say="${esc(fmt(da))}" data-who="${id}">▶ igen</button>${en ? `<button class="mini" data-en>EN</button>` : ''}</div>${en ? `<p class="trans" hidden>${esc(fmt(en))}</p>` : ''}</div>`;
  }
  function wireEn(p) { p.querySelectorAll('[data-en]').forEach(b => b.onclick = () => { const t = b.closest('.pop').querySelector('.trans'); if (t) t.hidden = !t.hidden; }); }
  const extra = o => (o && o.narr ? `<p class="narr pop">${fmtB(o.narr)}</p>` : '') + (o && o.think ? `<p class="think pop">${thinkH(o.think)}</p>` : '');
  const fmtB = s => esc(fmt(s)).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  // a thought is English, but the Danish it quotes (“…”) can be tapped like any other Danish
  const fogEsc = h => RE ? h.replace(RE, x => { const k = gk(x.replace(/&amp;/g, '&')); return k ? `<span data-w="${esc(k)}" class="${knows(k) ? '' : 'new'}">${x}</span>` : x; }) : h;
  const thinkH = s => esc(fmt(s)).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/“([^”]+)”/g, (m, q) => {
    const ws = q.match(/[\p{L}]+/gu) || [], n = ws.filter(w => gk(w)).length;
    return ws.length && n * 2 >= ws.length ? `“<span lang="da" class="q">${fogEsc(q)}</span>”` : m;
  });
  function say_(id, da, o) {
    o = o || {};
    return new Promise(async res => {
      G.talk = id;
      const p = show((o.pre ? `<p class="narr pop">${fmtB(o.pre)}</p>` : '') + lineHtml(id, da, o.en) + extra(o) + nextBtn());
      wireEn(p); speak(da, id); learnText(fmt(da));
      await waitNext(p); res();
    });
  }
  function alien_(id, en, o) {
    o = o || {};
    return new Promise(async res => {
      G.talk = id;
      const p = show(`<div class="alien pop">${who(id)}<p class="enl">${esc(fmt(en))}</p></div>` + extra(o) + nextBtn());
      if (o.sfx && SFX[o.sfx]) SFX[o.sfx]();
      await waitNext(p); res();
    });
  }
  // several kinds of line in one panel: ['n', narration] · ['t', thought] · ['a:vex', English] · ['d:lav', Danish, english]
  function tell_(lines) {
    return new Promise(async res => {
      const h = lines.map(l => {
        const [k, x, en] = l;
        if (k === 'n') return `<p class="narr pop">${fmtB(x)}</p>`;
        if (k === 't') return `<p class="think pop">${thinkH(x)}</p>`;
        if (k === 'm') return `<div class="memory pop"><div class="who">${fog('Et minde vender tilbage')}</div><p style="margin:.2em 0">${fmtB(x)}</p></div>`;
        if (k.startsWith('a:')) return `<div class="alien pop">${who(k.slice(2))}<p class="enl">${esc(fmt(x))}</p></div>`;
        if (k.startsWith('d:')) { learnText(fmt(x)); return lineHtml(k.slice(2), x, en); }
        return '';
      }).join('');
      const p = show(h + nextBtn()); wireEn(p);
      const d = lines.find(l => l[0].startsWith('d:')); if (d) { G.talk = d[0].slice(2); speak(d[1], d[0].slice(2)); }
      await waitNext(p); res();
    });
  }
  function choose_(o) {
    return new Promise(res => {
      const p = show((o.who && o.da ? lineHtml(o.who, o.da, o.en) : '') + (o.narr ? `<p class="narr pop">${fmtB(o.narr)}</p>` : '') + (o.think ? `<p class="think pop">${thinkH(o.think)}</p>` : '') +
        `<div class="opts">${(o.shuffle ? shuffle(o.opts.map((x, i) => [x, i])) : o.opts.map((x, i) => [x, i])).map(([x, i]) => `<button data-i="${i}" ${o.da_opts ? 'lang="da"' : ''}>${esc(fmt(x))}</button>`).join('')}</div>`);
      wireEn(p); if (o.who && o.da) { G.talk = o.who; speak(o.da, o.who); }
      p.querySelectorAll('.opts button').forEach(b => b.addEventListener('click', () => res(+b.dataset.i)));
    });
  }

  /* ================= answering: tap the words, say it aloud, or write it */
  function utter(o) {
    return new Promise(res => {
      let comp = [], done = false;
      // a real shuffle, and never in the answer's own order
      const ansW = norm(fmt(o.ans || '')).split(' ');
      let pool = shuffle((o.pool || []).map((w, i) => ({ w, i })));
      for (let k = 0; k < 12 && pool.length > 2 && pool.slice(0, 2).map(c => norm(fmt(c.w))).join(' ') === ansW.slice(0, 2).join(' '); k++) pool = shuffle(pool);
      const used = new Set();
      const p = show(`${o.who && o.da ? `<div class="ask">${lineHtml(o.who, o.da, o.en)}</div>` : ''}${o.narr ? `<p class="narr">${fmtB(o.narr)}</p>` : ''}${o.give ? `<p class="fb">Say exactly this: <span lang="da">${fog(o.give)}</span> <button class="mini" data-say="${esc(fmt(o.give))}">▶</button></p>` : ''}
        <div class="slot" id="comp" data-ans="${esc(fmt(o.ans || ''))}"></div>
        <div class="chips" id="tray"></div>
        <textarea class="write" id="ty" rows="2" hidden autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Skriv her … (write here)"></textarea>
        <div class="tools2">${o.noMic ? '' : '<button class="ghost" id="mic">🎙 Sig det</button>'}<button class="ghost" id="wr">⌨ Skriv</button><button class="ghost" id="del" aria-label="Remove last word">⌫</button><button class="ghost" id="hint" aria-label="Hint">?</button></div>
        <div class="row end"><button class="go" id="sig">Svar ▸</button></div>`);
      wireEn(p);
      if (o.who && o.da && !o.silent) { G.talk = o.who; speak(o.da, o.who); }
      const paint = () => {
        p.querySelector('#comp').innerHTML = comp.length ? comp.map((c, k) => `<button class="chip" data-k="${k}">${esc(fmt(c.w))}</button>`).join('') : `<span class="ph">${o.ph || 'Tap words in order · tryk på ordene'}</span>`;
        p.querySelector('#tray').innerHTML = pool.map(c => `<button class="chip ${used.has(c.i) ? 'used' : ''}" data-i="${c.i}" ${used.has(c.i) ? 'disabled' : ''}>${esc(fmt(c.w))}</button>`).join('');
        p.querySelectorAll('#comp [data-k]').forEach(b => b.onclick = () => { const c = comp.splice(+b.dataset.k, 1)[0]; used.delete(c.i); paint(); });
        p.querySelectorAll('#tray [data-i]').forEach(b => b.onclick = () => { const c = pool.find(x => x.i === +b.dataset.i); comp.push(c); used.add(c.i); SFX.tick(); paint(); });
      };
      paint();
      const fin = (text, mode) => { if (done) return; done = true; res({ text: norm(text), raw: String(text).trim(), mode }); };
      p.querySelector('#del').onclick = () => { const c = comp.pop(); if (c) used.delete(c.i); paint(); };
      p.querySelector('#wr').onclick = () => { const t = p.querySelector('#ty'); t.hidden = !t.hidden; if (!t.hidden) t.focus(); };
      p.querySelector('#ty').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); p.querySelector('#sig').click(); } });
      p.querySelector('#sig').onclick = () => { const ty = p.querySelector('#ty'); if (!ty.hidden && ty.value.trim()) return fin(ty.value, 'write'); if (!comp.length) return toast('Tap some words first, or write, or say it.'); fin(comp.map(c => fmt(c.w)).join(' '), 'tap'); };
      const mic = p.querySelector('#mic');
      if (mic) mic.onclick = async () => { const lab = mic.innerHTML; mic.disabled = true; const alts = await hear(x => { mic.textContent = MICL[x]; mic.classList.toggle('rec', x !== 'wait'); }); if (done) return; mic.disabled = false; mic.classList.remove('rec'); mic.innerHTML = lab; if (alts === null || !alts.length) return toast(hearMsg(alts), 6000); const best = o.pickAlt ? o.pickAlt(alts.map(norm)) : 0; fin(alts[best] || alts[0], 'voice'); };
      let hn = 0;
      p.querySelector('#hint').onclick = () => { hn++; if (hn === 1) toast(o.hint || 'Use the words you have heard.', 5200); else { toast('Answer: ' + fmt(o.ans || ''), 6500); } };
    });
  }
  const IRONY = {};
  async function converse_(o) {
    let give = false;
    for (let tries = 0; ; tries++) {
      // of everything the phone thinks it heard, take the guess that is a right answer, if there is one
      const pickAlt = alts => { const i = alts.findIndex(t => { try { return !!(o.judge(t, tries, {}) || {}).ok; } catch (e) { return false; } }); return i < 0 ? 0 : i; };
      const u = await utter(Object.assign({ pickAlt }, o, give ? { give: o.ans, silent: true } : tries ? { silent: true } : {}));
      let r = o.judge(u.text, tries, u) || { ok: false };
      if (r.ok) {
        learnText(u.raw);
        const own = u.mode !== 'tap';
        gainPower((r.power || 2) + (own ? 2 : 0) - (give ? 1 : 0));
        if (!o.noBurst) castAnim(r.word || o.word || null); else SFX.ok();
      } else { G.fizzle = { t0: clock() }; SFX.bad(); }
      let told = '';
      if (!r.ok && tries >= 2 && !give && o.ans) {
        give = true;
        const ir = IRONY[o.who] || IRONY._ || ['Sig bare:', ''];
        r = { who: o.who, da: ir[0] + ' ' + cap(fmt(o.ans)) + '.', note: ir[1] };
        told = `<p class="fb bad">Say exactly this: <span lang="da">${fog(o.ans)}</span> <button class="mini" data-say="${esc(fmt(o.ans))}">▶</button>${o.hint ? `<br><span class="hint">${esc(o.hint)}</span>` : ''}</p>`;
      }
      await new Promise(async res => {
        const mine = u.raw ? `<div class="mine"><div class="who">${esc(S.name || 'You')} <small>${u.mode === 'voice' ? 'spoken' : u.mode === 'write' ? 'written' : ''}</small></div><p class="da" lang="da">${fog(u.raw)}</p></div>` : '';
        const p = show(mine + (r.da ? lineHtml(r.who || o.who, r.da, r.en) : '') + (r.note ? `<p class="narr">${fmtB(r.note)}</p>` : '') + (r.think ? `<p class="think">${thinkH(r.think)}</p>` : '') + (r.fb ? `<p class="fb ${r.ok ? '' : 'bad'}">${fmtB(r.fb)}</p>` : '') + told + (r.ok && u.mode !== 'tap' ? `<p class="gain">+ Ordkraft for ${u.mode === 'voice' ? 'saying' : 'writing'} it yourself.</p>` : '') + nextBtn());
        wireEn(p); if (r.da) { G.talk = r.who || o.who; speak(r.da, r.who || o.who); }
        await waitNext(p); res();
      });
      if (r.ok) return { t: u.text, raw: u.raw, mode: u.mode, tag: r.tag };
    }
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* the step-wrapped versions the story uses */
  const say = (...a) => step(() => say_(...a));
  const alien = (...a) => step(() => alien_(...a));
  const tell = (...a) => step(() => tell_(...a));
  const choose = o => step(() => choose_(o));
  const converse = o => step(() => converse_(o));

  /* ================= full sheets (games, menu) */
  function sheet(html, o) {
    o = o || {};
    if (!o.mid) hidePanel();
    const sh = $('#sheet'); sh.className = (o.mid ? 'mid ' : '') + (o.dim ? 'dim' : ''); sh.dataset.lift = o.lift ? '1' : '0';
    sh.innerHTML = `<div class="card pop">${html}</div>`; sh.hidden = false; return sh.querySelector('.card');
  }
  function closeSheet() { const sh = $('#sheet'); sh.hidden = true; sh.innerHTML = ''; }
  // menus live on their own layer above everything; closing one returns you exactly where you were
  function modal(html) { const m = $('#modal'); m.innerHTML = `<div class="card pop">${html}</div>`; m.hidden = false; return m.querySelector('.card'); }
  function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }

  /* ================= power, HUD */
  function gainPower(n) { if (W.ff) return; S.power = Math.max(0, S.power + n); hud(); save(); }
  function hud() { $('#kraft u').style.width = Math.min(100, (S.power % 100)) + '%'; $('#kraft b').textContent = 'ORDKRAFT' + (S.power >= 100 ? ' · ' + ['', 'II', 'III', 'IV', 'V'][Math.min(4, Math.floor(S.power / 100))] : ''); }
  function where(t) { $('#where').textContent = t; }

  /* ================= SOUND: synthesised, nothing recorded */
  const AU = { c: null };
  function audioStart() {
    if (AU.c && AU.c.state === 'suspended') { try { AU.c.resume(); } catch (e) { } }
    if (AU.c || !S.set.sound) return; const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = AU.c = new C();
    AU.out = c.createGain(); AU.out.gain.value = 0.85; AU.out.connect(c.destination);
    const b = AU.buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = (type, f, q) => { const s = c.createBufferSource(); s.buffer = b; s.loop = true; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = c.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(AU.out); s.start(); return { fl, g }; };
    AU.wind = noise('bandpass', 500, 0.7); AU.water = noise('lowpass', 380, 0.4); AU.hum = noise('lowpass', 90, 2);
    AU.mus = c.createGain(); AU.mus.gain.value = 0; const lp = AU.lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; lp.Q.value = 0.4; AU.mus.connect(lp); lp.connect(AU.out);
    AU.dg = c.createGain(); AU.dg.gain.value = 0; AU.dg.connect(lp);
    AU.osc = [0, 1, 2].map(i => { const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = 146.8; o.detune.value = (i - 1) * 6; o.connect(AU.dg); o.start(); return o; });
    AU.step = 0; AU.next = 0; AU.nb = 0;
  }
  function tone(f, dur, vol, type, delay, slide, dest, att) {
    if (!AU.c || !S.set.sound || W.ff) return; const c = AU.c, t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + (att || 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || AU.out); o.start(t); o.stop(t + dur + 0.05);
  }
  function noiseHit(dur, f0, f1, vol) { if (!AU.c || !S.set.sound || W.ff) return; const c = AU.c, n = c.currentTime, s = c.createBufferSource(); s.buffer = AU.buf; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(f0, n); f.frequency.exponentialRampToValueAtTime(f1, n + dur); const g = c.createGain(); g.gain.setValueAtTime(vol, n); g.gain.exponentialRampToValueAtTime(0.001, n + dur); s.connect(f); f.connect(g); g.connect(AU.out); s.start(n); s.stop(n + dur + 0.1); }
  const SFX = {
    tick: () => tone(1800, 0.05, 0.02, 'sine'),
    ok: () => [392, 494, 587].forEach(f => tone(f, 1.1, 0.05, 'triangle')),
    cast: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 1.3, 0.05, 'sine', i * 0.06)); tone(130, 0.8, 0.12, 'sine', 0, 260); },
    bad: () => tone(130, 0.35, 0.08, 'sawtooth', 0, 70),
    chime: () => [1568, 2093, 2637].forEach((f, i) => tone(f, 0.9, 0.035, 'sine', i * 0.07)),
    beam: () => { tone(80, 4, 0.12, 'sawtooth', 0, 400, null, 1.5); [880, 1320, 1760].forEach((f, i) => tone(f, 3.5, 0.02, 'sine', 0.5 + i * 0.3, f * 1.5, null, 1)); },
    flash: () => { [1568, 2093, 2637, 3136, 4186].forEach((f, i) => tone(f, 2.4, 0.03, 'sine', i * 0.07, f * 1.5)); tone(60, 2, 0.14, 'sine', 0, 40); },
    alarm: () => { for (let i = 0; i < 4; i++) { tone(660, 0.22, 0.06, 'square', i * 0.5); tone(495, 0.22, 0.06, 'square', i * 0.5 + 0.25); } },
    whoosh: () => noiseHit(1.6, 2400, 200, 0.4),
    splash: () => { noiseHit(1.7, 3000, 180, 0.7); tone(110, 0.6, 0.25, 'sine', 0, 40); },
    drone: () => { tone(220, 1.2, 0.04, 'sawtooth', 0, 330); tone(223, 1.2, 0.04, 'sawtooth', 0, 334); },
    found: () => { tone(880, 0.12, 0.08, 'square'); tone(880, 0.12, 0.08, 'square', 0.18); tone(1320, 0.3, 0.08, 'square', 0.36); },
    stone: () => { tone(55, 1.4, 0.22, 'sine', 0, 38); tone(82, 0.5, 0.1, 'triangle'); },
    clang: () => { tone(330, 0.9, 0.07, 'square', 0, 300); tone(495, 0.7, 0.05, 'triangle', 0.02); noiseHit(0.3, 5000, 1500, 0.15); },
    shard: () => [1175, 1568, 2349].forEach((f, i) => tone(f, 0.7, 0.04, 'sine', i * 0.05)),
    plank: () => { tone(392, 0.6, 0.05, 'triangle'); tone(587, 0.8, 0.04, 'sine', 0.08); },
    crack: () => { noiseHit(0.4, 3000, 400, 0.4); tone(90, 0.4, 0.1, 'sawtooth', 0, 50); },
    scan: () => tone(300, 1.6, 0.05, 'sine', 0, 1200),
    heart: () => { tone(60, 0.25, 0.25, 'sine', 0, 40); tone(55, 0.25, 0.2, 'sine', 0.28, 38); },
    door: () => { tone(70, 2.4, 0.18, 'sawtooth', 0, 50, null, 0.4); noiseHit(2, 600, 100, 0.25); }
  };
  const _ = null, semi = (f, n) => f * Math.pow(2, n / 12);
  /* music: each mood is a small sequencer (bpm, key, chords per bar, melody per step, bass, percussion) */
  const MOODS = {
    earth: { bpm: 60, key: 349.2, bar: 8, ch: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [-5, -1, 2]], mel: [19, _, 16, _, 12, _, _, _, 17, _, 14, _, 9, _, _, _, 16, _, 12, _, 9, _, _, _, 14, _, 11, _, 7, _, _, _], mw: 'sine', mv: 0.045, ml: 1.8, bass: [0, _, _, _, _, _, _, _], bw: 'sine', bv: 0.04, bl: 2.4, dv: 0.015, lp: 2600 },
    ship: { bpm: 152, key: 311.1, bar: 8, ch: [[0, 1, 7], [0, 5, 7]], mel: [0, 7, 14, 7, 12, 19, 14, 7, 0, 7, 14, 21, 19, 14, 12, 7], mw: 'square', mv: 0.02, ml: 0.09, bass: [0, _, _, _, _, _, _, _], bw: 'sine', bv: 0.05, bl: 1.2, perc: [_, _, 't', _, _, _, 't', 't'], dv: 0.03, lp: 4200 },
    alarm: { bpm: 112, key: 138.6, bar: 8, ch: [[0, 6, 12], [1, 7, 13]], mel: [12, _, 13, _, 12, _, _, _, 12, _, 13, _, 15, _, 13, _], mw: 'sawtooth', mv: 0.045, ml: 0.3, bass: [0, _, _, 0, _, _, 0, _], bw: 'sawtooth', bv: 0.07, bl: 0.22, perc: ['k', _, _, _, 'k', _, 't', _], dv: 0.035, lp: 1000 },
    fall: { bpm: 70, key: 196, bar: 8, ch: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]], mel: [24, _, _, 22, _, _, 19, _, 20, _, _, 19, _, _, 15, _, 17, _, _, 15, _, _, 14, _, 12, _, _, _, _, _, _, _], mw: 'triangle', mv: 0.06, ml: 1.4, bass: [0, _, 2, _, 1, _, 2, _], bw: 'sawtooth', bv: 0.05, bl: 0.6, perc: ['k', _, _, _, 'k', _, _, 'k'], dv: 0.05, lp: 1600 },
    night: { bpm: 56, key: 246.9, bar: 8, ch: [[0, 4, 8], [2, 6, 10]], mel: [22, _, 20, _, 18, _, _, 16, _, _, 18, _, 14, _, _, _, 16, _, _, 20, _, _, 18, _, 12, _, _, _, _, _, _, _], mw: 'sine', mv: 0.055, ml: 2.4, bass: [_, _, _, _, 0, _, _, _], bw: 'sine', bv: 0.06, bl: 2, dv: 0.04, lp: 1400 },
    hunt: { bpm: 96, key: 155.6, bar: 8, ch: [[0, 6, 13], [0, 6, 12]], mel: [12, _, _, _, 13, _, _, _, 12, _, _, _, 11, _, _, _], mw: 'sawtooth', mv: 0.04, ml: 1.2, att: 0.4, bass: [0, _, _, 0, _, _, _, _], bw: 'sawtooth', bv: 0.05, bl: 0.3, perc: ['h', _, _, _, _, _, _, _], dv: 0.06, lp: 700 },
    dawn: { bpm: 92, key: 261.6, bar: 8, ch: [[0, 4, 7], [5, 9, 12], [-3, 0, 4], [7, 11, 14]], mel: [12, 16, 19, 24, 19, 16, 21, _, 17, 21, 24, 29, 24, 21, 19, _, 9, 12, 16, 21, 16, 12, 19, _, 19, 23, 26, 31, 26, 23, 19, _], mw: 'sine', mv: 0.04, ml: 0.7, bass: [0, _, _, _, 2, _, _, _], bw: 'triangle', bv: 0.05, bl: 0.8, dv: 0.02, lp: 3200 },
    wreck: { bpm: 64, key: 293.7, bar: 8, ch: [[0, 3, 7], [1, 4, 8], [-2, 2, 5], [0, 3, 7]], mel: [12, _, 15, _, 19, _, 22, _, 20, _, 19, _, 15, _, _, _, 13, _, 16, _, 20, _, 19, _, 15, _, 12, _, _, _, _, _], mw: 'sine', mv: 0.05, ml: 1, bass: [0, _, _, _, _, _, _, _], bw: 'triangle', bv: 0.05, bl: 1.6, perc: ['t', _, _, _, 'T', _, _, _], dv: 0.02, lp: 2400 },
    forest: { bpm: 100, key: 220, bar: 8, ch: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], mel: [16, _, 19, 21, _, 19, 16, _, 17, _, 21, 24, _, 21, 17, _, 19, _, 23, 26, _, 23, 19, _, 24, _, 21, 19, 16, _, 12, _], mw: 'triangle', mv: 0.055, ml: 0.5, bass: [0, _, 2, _, 1, _, 2, _], bw: 'triangle', bv: 0.06, bl: 0.35, perc: ['k', _, 't', _, 'k', _, 't', 't'], dv: 0.02, lp: 2400 },
    tense: { bpm: 104, key: 164.8, bar: 8, ch: [[0, 3, 7], [1, 4, 8]], mel: [12, _, 15, _, 13, _, _, _, 12, _, 15, _, 17, _, 15, _], mw: 'sawtooth', mv: 0.04, ml: 0.3, bass: [0, _, _, 0, _, _, 0, _], bw: 'sawtooth', bv: 0.06, bl: 0.22, perc: ['k', _, _, _, 'k', _, 't', _], dv: 0.03, lp: 1100 },
    wonder: { bpm: 80, key: 293.7, bar: 8, ch: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [2, 5, 9]], mel: [24, _, 23, _, 19, _, 16, _, 21, _, 19, _, 16, _, 12, _, 17, _, 16, _, 12, _, 9, _, 14, _, 16, _, 19, _, _, _], mw: 'sine', mv: 0.055, ml: 1.2, bass: [0, _, _, _, 2, _, _, _], bw: 'sine', bv: 0.05, bl: 1.6, dv: 0.03, lp: 3000, vib: 1 },
    gate: { bpm: 120, key: 196, bar: 8, ch: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], mel: [19, _, 16, 19, 24, _, 23, _, 21, _, 17, 21, 26, _, 24, _, 19, 18, 19, 23, 26, _, 23, _, 24, _, 19, _, 12, _, _, _], mw: 'square', mv: 0.035, ml: 0.18, bass: [0, _, 'c', _, 2, _, 'c', _], bw: 'triangle', bv: 0.07, bl: 0.18, dv: 0.01, lp: 2400 },
    dread: { bpm: 48, key: 155.6, bar: 8, ch: [[0, 6, 13], [0, 6, 12]], mel: [12, _, _, _, _, _, _, _, 11, _, _, _, _, _, _, _], mw: 'sawtooth', mv: 0.05, ml: 4, att: 1.2, bass: [_, _, _, _, _, _, _, _], perc: ['h', _, _, _, _, _, _, _], dv: 0.06, lp: 520 },
    silence: { bpm: 60, key: 220, bar: 8, ch: [[0, 4, 7]], mel: [_, _, _, _, _, _, _, _], mw: 'sine', mv: 0, ml: 1, bass: [_, _, _, _, _, _, _, _], dv: 0, lp: 800 }
  };
  let MOOD = 'night', AMB = { wind: 0.02, water: 0, hum: 0, birds: 0, crickets: 0 };
  function mood(m, amb) { MOOD = m; if (amb) AMB = Object.assign({ wind: 0, water: 0, hum: 0, birds: 0, crickets: 0 }, amb); }
  function restoreAudioMood() { }
  function audioTick(t) {
    if (!AU.c) return; const now = AU.c.currentTime, vol = 2.4 * S.set.music;
    // the old piece fades out, a breath of silence, then the new one fades in
    if (AU.lm == null) { AU.lm = MOOD; AU.ph = 'in'; AU.step = 0; AU.next = now + 0.2; AU.mus.gain.setValueAtTime(0, now); AU.mus.gain.setTargetAtTime(vol, now, 1); }
    else if (MOOD !== AU.lm) { if (AU.ph !== 'out') { AU.ph = 'out'; AU.fo = now + 2.4; AU.mus.gain.setTargetAtTime(0, now, 0.6); } else if (now >= AU.fo) { AU.lm = MOOD; AU.ph = 'in'; AU.step = 0; AU.next = now + 0.25; AU.mus.gain.setTargetAtTime(vol, now + 0.2, 1.1); } }
    else if (AU.ph === 'out') { AU.ph = 'in'; AU.mus.gain.setTargetAtTime(vol, now, 0.8); }
    else AU.mus.gain.setTargetAtTime(S.set.sound ? vol : 0, now, 0.5);
    const M = MOODS[AU.lm] || MOODS.night, set = (p, v) => p.setTargetAtTime(S.set.sound ? v : 0, now, 0.6);
    set(AU.wind.g.gain, AMB.wind + 0.012 * Math.sin(t * 0.4)); AU.wind.fl.frequency.setTargetAtTime(420 + 260 * Math.sin(t * 0.23) + 120 * Math.sin(t * 0.61), now, 0.5);
    set(AU.water.g.gain, AMB.water); set(AU.hum.g.gain, AMB.hum); set(AU.dg.gain, AU.ph === 'out' ? 0 : M.dv * 1.6); AU.lp.frequency.setTargetAtTime(M.lp, now, 1.2);
    if (AU.next < now - 0.3) AU.next = now + 0.05;
    const sd = 60 / M.bpm / 2;
    while (S.set.sound && AU.next < now + 0.14) {
      const i = AU.step++, d = Math.max(0, AU.next - now), bi = Math.floor(i / M.bar), ch = M.ch[bi % M.ch.length], k = i % M.bar, pass = Math.floor(i / M.mel.length);
      if (k === 0) AU.osc.forEach((o, j) => o.frequency.setTargetAtTime(semi(M.key / 2, ch[j]), now + d, 0.6));
      const m = M.mel[i % M.mel.length]; if (m != null && M.mv) tone(semi(M.key, m) * (M.vib && pass % 2 ? 0.5 : 1), M.ml, M.mv, M.mw, d, 0, AU.mus, M.att);
      const b = M.bass[k]; if (b === 'c') { tone(semi(M.key, ch[1]), M.bl, M.bv * 0.55, M.bw, d, 0, AU.mus); tone(semi(M.key, ch[2]), M.bl, M.bv * 0.55, M.bw, d, 0, AU.mus); } else if (b != null) tone(semi(M.key / 2, ch[b]), M.bl, M.bv, M.bw, d, 0, AU.mus);
      const pc = M.perc && M.perc[k]; if (pc === 'k') tone(170, 0.2, 0.14, 'triangle', d, 60, AU.mus); else if (pc === 't' || pc === 'T') tone(pc === 't' ? 2100 : 1500, 0.035, 0.025, 'square', d, 0, AU.mus); else if (pc === 'h') { tone(150, 0.22, 0.18, 'triangle', d, 55, AU.mus); tone(130, 0.2, 0.12, 'triangle', d + 0.28, 50, AU.mus); }
      AU.next += sd;
    }
    if (t > AU.nb) { AU.nb = t + 0.4 + Math.random() * 1.4; if (AMB.birds && Math.random() < AMB.birds) { const f = 2300 + Math.random() * 900; tone(f, 0.07, 0.018, 'sine', 0, f * 1.3); tone(f * 1.1, 0.07, 0.018, 'sine', 0.11, f * 1.4); } if (AMB.crickets && Math.random() < AMB.crickets) for (let k = 0; k < 3; k++) tone(4200 + Math.random() * 300, 0.04, 0.008, 'sine', k * 0.06); }
  }

  /* ================= the heroine on stage */
  const outfitOf = day => day <= 0 ? 'pajamas' : A.ROTATION[(day - 1) % A.ROTATION.length];
  function heroLook(extra) { let o = A.heroLook(outfitOf(S.day), extra, S.pro === 'han'); if (G.night) o = A.nightify(o, G.glow == null ? 1 : G.glow); return o; }
  function actor(id) { return G.cast.find(a => a.id === id); }
  function setCast(list) { G.cast = list.map(a => { const b = Object.assign({}, a); if (b.k === 'hero' && !b.o) { b.id = b.id || 'hero'; b.o = heroLook(b.extra || {}); b._g = G.glow; } return b; }); }
  function refreshHero(extra) { const h = actor('hero'); if (!h) return; if (extra) h.extra = Object.assign({}, h.extra || {}, extra); const c = h.o && h.o.cast; h.o = heroLook(h.extra || {}); if (c && (!h.extra || h.extra.cast == null)) h.o.cast = c; h._g = G.glow; }
  // the arm goes up, the word flies, the arm comes down
  async function castAnim(word, col) {
    const h = actor('hero'); if (W.ff) return;
    G.burst = { t0: clock(), word: word || null, col }; SFX.cast();
    if (!h || !h.o) return;
    await tween(h.o, 'cast', 1, 0.3, 'out'); await wait(1300); if (h.o) await tween(h.o, 'cast', 0, 0.6);
  }

  /* ================= chapters, title, menu */
  const CH = [];
  function chapter(o) { CH.push(o); }
  let RUNNING = false;
  async function runChapter(c, fresh) {
    if (RUNNING) return; RUNNING = true; G.titleDrift = false; G.drone = null;
    closeModal(); closeSheet(); $('#title').hidden = true; $('#hud').hidden = false; hidePanel();
    if (fresh) S.cp = null;
    S.cur = c.id; save();
    where(c.label); hud();
    try { await c.run(); } catch (e) { console.error(e); toast('Something went wrong: ' + e.message, 6000); }
    RUNNING = false;
  }
  function titleScreen() {
    G.scene = 'world'; G.night = true; G.glow = 1; G.cast = []; G.fade = 0; G.lift = 0; G.lights = []; G.camX = null; G.titleDrift = true; G.view = { x: 260, z: 1 }; G.drone = { wx: 520, y: 250, len: 460 }; mood('night', { wind: 0.03, crickets: 0.5 });
    hidePanel(); $('#hud').hidden = true;
    const t = $('#title'); t.hidden = false;
    const cont = !!(S.cp && S.cp.r && S.cp.r.length);
    t.innerHTML = `<h1>Dumpet på<br>Måne Syv</h1><p>Taken from your bed. Changed halfway. Dumped on a moon where every word is magic, and every word is Danish.</p>
      ${cont ? `<button class="go" id="tCont">Fortsæt · continue</button>` : ''}<button class="${cont || S.started ? 'ghost' : 'go'}" id="tNew">${S.started ? 'Ny rejse · start again' : 'Begynd · begin'}</button><button class="${!cont && S.started ? 'go' : 'ghost'}" id="tCh">Kapitler · chapters</button><button class="ghost" id="tSet">Indstillinger · settings</button>`;
    t.querySelector('#tNew').onclick = async () => { audioStart(); if (S.started && !confirmBox()) return; t.hidden = true; await newGame(); };
    if (cont) t.querySelector('#tCont').onclick = () => { audioStart(); const c = CH.find(x => S.cp && S.cp.id && S.cp.id.startsWith(x.id)) || CH.find(x => x.id === S.cur) || CH[0]; runChapter(c); };
    t.querySelector('#tCh').onclick = () => { audioStart(); chapters(); };
    t.querySelector('#tSet').onclick = () => { audioStart(); settings(); };
  }
  function confirmBox() { return window.confirm('Start a new journey from the very beginning? Your name, words and progress are reset.'); }
  async function newGame() {
    const keep = S.set; S = JSON.parse(JSON.stringify(DEF)); S.set = keep; S.started = 1; save();
    await whoAreYou();
    runChapter(CH[0], true);
  }
  function whoAreYou() {
    return new Promise(res => {
      $('#title').hidden = true;
      const c = modal(`<p class="lab">Before you fall asleep</p><p class="h">Who are you?</p><p class="hint">Your hero's name. People here will call you by it.</p>
        <input class="write" id="nm" maxlength="18" placeholder="Name" autocomplete="off">
        <p class="hint" style="margin-top:.8em">In Danish, <b>hun</b> = she, <b>han</b> = he. Choose who you are: a woman or a man.</p>
        <div class="row"><button class="ghost" data-p="hun">hun · she</button><button class="ghost" data-p="han">han · he</button></div>
        <div class="row end"><button class="go" id="ok">Sov godt ▸</button></div>`);
      let pro = 'hun'; const mark = () => c.querySelectorAll('[data-p]').forEach(b => b.className = b.dataset.p === pro ? 'go' : 'ghost'); mark();
      c.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { pro = b.dataset.p; mark(); });
      c.querySelector('#ok').onclick = () => { const n = c.querySelector('#nm').value.trim().replace(/[<>]/g, ''); if (!n) return toast('Write a name first.'); S.name = n.charAt(0).toUpperCase() + n.slice(1); S.pro = pro; save(); closeModal(); res(); };
    });
  }
  function chapters() {
    const groups = {};
    CH.forEach(c => (groups[c.k] = groups[c.k] || []).push(c));
    const c = modal(`<div class="menu"><p class="lab">Kapitler <span>chapters</span></p>${Object.keys(groups).map(k => `<p class="sec">${esc(groups[k][0].kTitle)}</p>${groups[k].map(x => `<button class="item" data-id="${x.id}" ${x.locked ? 'disabled' : ''}><span>${esc(x.title)}</span><small>${x.locked ? 'låst' : S.prog[x.id] ? 'done' : ''}</small></button>`).join('')}`).join('')}
      <div class="row end"><button class="ghost" id="cl">Luk · close</button></div></div>`);
    c.querySelectorAll('[data-id]').forEach(b => b.onclick = async () => {
      const x = CH.find(y => y.id === b.dataset.id);
      // a section is already running: start the chosen one cleanly from a fresh page
      if (RUNNING) { if (!(S.cp && S.cp.id && S.cp.id.startsWith(x.id))) S.cp = null; S.auto = x.id; save(); location.reload(); return; }
      closeModal(); if (!S.name) await whoAreYou(); runChapter(x, !(S.cp && S.cp.id && S.cp.id.startsWith(x.id)));
    });
    c.querySelector('#cl').onclick = () => { closeModal(); if (!$('#hud').hidden) return; titleScreen(); };
  }
  function settings(back) {
    const vs = daVoices();
    const c = modal(`<div class="menu"><p class="lab">Indstillinger <span>settings</span></p>
      <div class="set"><span>Sound</span><button class="ghost" id="sSnd">${S.set.sound ? 'on' : 'off'}</button></div>
      <div class="set"><span>Music volume</span><input type="range" id="sMus" min="0" max="1" step=".05" value="${S.set.music}"></div>
      <div class="set"><span>Voice speed</span><input type="range" id="sRate" min=".5" max="1.3" step=".05" value="${S.set.rate}"></div>
      <div class="set"><span>Voice pitch</span><input type="range" id="sPitch" min=".5" max="1.5" step=".05" value="${S.set.pitch}"></div>
      <div class="set"><span>Danish voice</span><select class="ghost" id="sVoice">${vs.length ? vs.map(v => `<option ${v.name === S.set.voice ? 'selected' : ''}>${esc(v.name)}</option>`).join('') : '<option>none found on this device</option>'}</select></div>
      <div class="set"><span>Microphone answers</span><button class="ghost" id="sMic">${S.set.mic ? 'on' : 'off'}</button></div>
      <div class="row"><button class="ghost" id="sTest">▶ Test the voice</button></div>
      <p class="hint">No Danish voice? On Android: Settings › Text-to-speech › install Danish. On iPhone: Settings › Accessibility › Spoken Content › Voices › Dansk.</p>
      <div class="row end"><button class="go" id="cl">Luk · close</button></div></div>`);
    c.querySelector('#sSnd').onclick = e => { S.set.sound = S.set.sound ? 0 : 1; e.target.textContent = S.set.sound ? 'on' : 'off'; save(); audioStart(); };
    c.querySelector('#sMic').onclick = e => { S.set.mic = S.set.mic ? 0 : 1; e.target.textContent = S.set.mic ? 'on' : 'off'; save(); };
    c.querySelector('#sMus').oninput = e => { S.set.music = +e.target.value; save(); };
    c.querySelector('#sRate').oninput = e => { S.set.rate = +e.target.value; save(); };
    c.querySelector('#sPitch').oninput = e => { S.set.pitch = +e.target.value; save(); };
    c.querySelector('#sVoice').onchange = e => { S.set.voice = e.target.value; save(); };
    c.querySelector('#sTest').onclick = () => speak('Hej. Jeg hedder Lav. Jeg er en moshjort.', 'lav');
    c.querySelector('#cl').onclick = () => { closeModal(); if (back) back(); else if ($('#hud').hidden) titleScreen(); };
  }
  function book() {
    const ks = Object.keys(S.words).filter(k => GLOSS[k] != null).sort((a, b) => a.localeCompare(b, 'da'));
    const c = modal(`<div class="menu"><p class="lab">Ordbog <span>${ks.length} words met</span></p><div class="book">${ks.map(k => `<div><span data-say="${esc(k)}">▶ ${esc(k)}</span><i>${esc(GLOSS[k])}</i></div>`).join('') || '<p class="hint">Tap any Danish word to see what it means. It lands here.</p>'}</div><div class="row end"><button class="go" id="cl">Luk</button></div></div>`);
    c.querySelector('#cl').onclick = closeSheet;
  }
  function menu() {
    const c = modal(`<div class="menu"><p class="lab">Menu</p>
      <button class="item" id="mRes"><span>Fortsæt</span><small>continue</small></button>
      <button class="item" id="mBook"><span>Ordbog</span><small>word book</small></button>
      <button class="item" id="mCh"><span>Kapitler</span><small>chapters</small></button>
      <button class="item" id="mSet"><span>Indstillinger</span><small>settings</small></button>
      <button class="item" id="mRe"><span>Start afsnittet forfra</span><small>restart this section</small></button>
      <button class="item" id="mTit"><span>Til titelskærmen</span><small>title screen</small></button></div>`);
    c.querySelector('#mRes').onclick = closeSheet;
    c.querySelector('#mBook').onclick = book;
    c.querySelector('#mCh').onclick = chapters;
    c.querySelector('#mSet').onclick = () => settings(menu);
    c.querySelector('#mRe').onclick = () => { if (!window.confirm('Restart this section from its beginning?')) return; S.cp = null; save(); location.reload(); };
    c.querySelector('#mTit').onclick = () => { save(); location.reload(); };
  }

  function boot() {
    stage = A.makeStage($('#cv'));
    layout(); addEventListener('resize', layout);
    $('#bMenu').onclick = menu; $('#bBook').onclick = book;
    hud();
    if (window.visualViewport) { const vv = window.visualViewport, upd = () => { const kb = Math.max(0, innerHeight - vv.height - vv.offsetTop); document.documentElement.style.setProperty('--kb', (kb > 80 ? Math.round(kb) : 0) + 'px'); }; vv.addEventListener('resize', upd); vv.addEventListener('scroll', upd); }
    requestAnimationFrame(frame);
    const auto = S.auto && CH.find(x => x.id === S.auto); S.auto = null; save();
    if (auto) runChapter(auto); else titleScreen();
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  }

  window.E = {
    S: () => S, G, W, $, esc, shuffle, fmt, fog, norm, unacc, cap, wait, tween, clock, save, toast, speak, hear, hearMsg, MICL, learn, learnText,
    addGloss, GLOSS, SPK, IRONY, say, alien, tell, choose, converse, utter, step, show, hidePanel, nextBtn, waitNext, lineHtml, wireEn,
    sheet, closeSheet, modal, closeModal, onTick, gainPower, hud, where, mood, SFX, tone, cpStart, cpEnd, heroLook, actor, setCast, refreshHero, outfitOf, castAnim, speaking, daVoices,
    chapter, CH, boot, chapters, menu, audioStart, layout, Hun, titleScreen, book
  };
})();
