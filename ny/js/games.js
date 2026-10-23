/* Dumpet på Måne Syv · the mini-games. Each returns a promise with its result. */
(function () {
  'use strict';
  const E = window.E, G = E.G, esc = E.esc, fog = E.fog, SFX = E.SFX;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sayBtn = (t, who) => `<button class="mini" data-say="${esc(E.fmt(t))}"${who ? ` data-who="${who}"` : ''} aria-label="Hear it">▶</button>`;
  const shards = (n, of) => `<div class="shards">${Array.from({ length: of }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;
  const tapWait = (el, sel) => new Promise(r => el.querySelector(sel).onclick = r);

  /* a card that teaches before anything is asked */
  function teach(o) {
    return new Promise(res => {
      const c = E.sheet(`<p class="lab">${esc(o.lab || 'Ordmagi')}<span>${esc(o.sub || '')}</span></p>${o.h ? `<p class="h">${esc(E.fmt(o.h))}</p>` : ''}${o.html}<div class="row end"><button class="go" id="ok">${o.btn || 'Forstået ▸'}</button></div>`, { lift: o.lift !== false, dim: !!o.dim });
      c.querySelectorAll('[data-en]').forEach(b => b.onclick = () => { const t = b.closest('.pop,div').querySelector('.trans'); if (t) t.hidden = !t.hidden; });
      c.querySelector('#ok').onclick = () => { E.closeSheet(); res(); };
    });
  }

  /* ---------- a running clock bar */
  function clockBar(el, ms) {
    let stop = false, t0 = performance.now(), done;
    const p = new Promise(r => done = r);
    const tick = () => { if (stop) return; const k = (performance.now() - t0) / ms; el.style.width = Math.max(0, 100 - k * 100) + '%'; if (k >= 1) { stop = true; done('time'); } else requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    return { p, stop() { stop = true; } };
  }

  /* =====================================================================
     GEM DIG — the drone hunts what glows. Obey Lav's whispers in time. */
  const CMD = {
    ned: { da: 'Ned!', en: 'Get down', ic: '↓' },
    stille: { da: 'Stille!', en: 'Freeze', ic: '■' },
    lob: { da: 'Løb!', en: 'Run', ic: '»' },
    bag: { da: 'Bag træet!', en: 'Behind the tree', ic: '♣' }
  };
  async function gemDig() {
    await teach({
      lab: 'Gem dig', sub: 'hide', h: 'Lav whispers. You obey. Fast.',
      html: `<p class="hint">The drone hunts anything that glows. Lav will whisper what to do. Learn the four whispers first: tap ▶ to hear each one.</p>
        <div class="book">${Object.values(CMD).map(c => `<div><span lang="da">${sayBtn(c.da, 'lav')} <b>${fog(c.da)}</b></span><i>${c.ic} ${esc(c.en)}</i></div>`).join('')}</div>
        <p class="hint">The whisper comes first. Later the words fade, and you only hear them.</p>`,
      btn: 'Klar ▸'
    });
    const h = E.actor('hero'), x0 = h.wx, D = G.drone || (G.drone = { wx: x0 + 80, y: 372, len: 300, sweep: -0.3, alert: 0 });
    D.alert = 0; if (Math.abs(D.wx - h.wx) > 150) await E.tween(D, 'wx', h.wx + 90, 1.2);
    const gy = () => window.Art.groundAt(h.wx), aim = tx => Math.atan((D.wx - tx) / Math.max(120, gy() - D.y));
    // a fresh order every time, never the same whisper twice in a row
    const seq = []; while (seq.length < 12) { const k = shuffle(Object.keys(CMD))[0]; if (k !== seq[seq.length - 1]) seq.push(k); }
    const listen = E.daVoices().length > 0, HIDE_X = 822, A_X = x0, B_X = x0 + 150;
    // the whole playing field in view: both spots and the hiding tree
    G.camX = (A_X + HIDE_X) / 2 + 30; G.camZ = 0.82;
    let lives = 3, ok = 0, miss = 0, saved = 0, pos = 'A';
    for (let r = 0; r < seq.length; r++) {
      const k = seq[r], C = CMD[k], ms = Math.max(2800, 5800 - r * 250), hide = listen && r >= 4;
      E.tween(D, 'sweep', aim(h.wx) + (r % 2 ? 0.45 : -0.45), 1.2);
      const res = await new Promise(async done => {
        const c = E.sheet(`<p class="lab">Gem dig <span>${'◆'.repeat(lives)}${'◇'.repeat(3 - lives)} · ${r + 1}/${seq.length}</span></p>
          <div class="whisper" id="wh" data-ans="${k}">${hide ? '· · ·' : esc(C.da)}</div>
          <div class="meter"><i id="tm" style="width:100%"></i></div>
          <div class="act">${Object.keys(CMD).map(x => `<button data-a="${x}"><span>${CMD[x].ic}</span> ${esc(CMD[x].en)}</button>`).join('')}</div>
          <div class="row"><button class="ghost" id="again">▶ igen</button><span class="hint">${hide ? 'Listen. Lav barely breathes the words now.' : 'Lav whispers. Do it before the time runs out.'}</span></div>`, { lift: 1 });
        await E.wait(300);
        E.speak(C.da, 'lav');
        const cl = clockBar(c.querySelector('#tm'), ms);
        c.querySelector('#again').onclick = () => E.speak(C.da, 'lav');
        c.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { cl.stop(); done(b.dataset.a); });
        cl.p.then(() => done('time'));
      });
      if (res === k) {
        ok++; SFX.tick();
        // only the move you chose happens, and nothing else
        let move = null;
        if (k === 'ned') { h.duck = 1; E.tween(h, 'wy', 46, 0.18, 'out'); }
        if (k === 'stille') E.tween(G, 'glow', 0.35, 0.25);
        if (k === 'lob') { const to = pos === 'B' ? A_X : B_X; pos = pos === 'B' ? 'A' : 'B'; move = E.tween(h, 'wx', to, Math.abs(to - h.wx) / 380, 'lin'); }
        if (k === 'bag') { pos = 'T'; move = E.tween(h, 'wx', HIDE_X, Math.abs(HIDE_X - h.wx) / 330, 'lin'); }
        if (move) await move; else await E.wait(350);
        await E.tween(D, 'sweep', aim(h.wx) + (D.wx > h.wx ? -0.55 : 0.55), 0.9);
        E.sheet(`<p class="whisper" lang="da">${fog(C.da)}</p><p class="center hint">${esc(C.en)}. The beam slides past.</p>`, { lift: 1 });
        await E.wait(900);
        // you stand up again before the next whisper
        if (k === 'ned') { await E.tween(h, 'wy', 0, 0.22); h.duck = 0; }
        if (k === 'stille') await E.tween(G, 'glow', 1, 0.35);
      } else {
        miss++; lives--;
        await E.tween(D, 'sweep', aim(h.wx), 0.5);
        D.alert = 1; SFX.found(); G.shake = { t0: E.clock(), dur: 0.5, amp: 0.6 };
        E.sheet(`<p class="lab">Fundet <span>found</span></p><p class="whisper" style="color:var(--bad)">${esc(C.da)}</p><p class="center">${fog(C.da)} = <b>${esc(C.en.toLowerCase())}</b>.${res === 'time' ? ' Too slow.' : ''}</p>`, { lift: 1 });
        await E.wait(1700); D.alert = 0;
        if (lives <= 0) {
          saved++;
          E.sheet(`<p class="narr">The beam locks onto you. Then Lav kicks a stone into the lake with a loud <b>plop</b>, and the drone turns toward the water, curious.</p><p class="da" lang="da">${fog('Du skylder mig en.')} ${sayBtn('Du skylder mig en.', 'lav')}</p><p class="hint">You owe me one.</p><div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
          E.speak('Du skylder mig en.', 'lav');
          G.splash = { t0: E.clock(), x: h.x - 150, y: h.y + 14 }; SFX.splash();
          await E.tween(D, 'sweep', aim(h.wx - 180), 0.8);
          await tapWait(document.querySelector('#sheet .card'), '#nx');
          lives = 3;
        }
      }
    }
    if (h.duck) { h.duck = 0; h.wy = 0; }
    E.closeSheet();
    return { ok, miss, saved };
  }

  /* =====================================================================
     HUKOMMELSESSMEDJEN — forge the past tense; every right form is a shard of memory */
  async function forgeSort(list) {
    let q = shuffle(list), got = 0, miss = 0;
    const total = list.length, LABEL = { 1: '-ede', 2: '-te', u: 'anderledes' };
    while (q.length) {
      const v = q.shift();
      const pick = await new Promise(res => {
        const c = E.sheet(`<p class="lab">Hukommelsessmedjen <span>${got}/${total}</span></p>${shards(got, total)}
          <p class="hint center">Which past tense does it take?</p>
          <div class="verb" lang="da" data-ans="${v.g}">${fog(v.inf)} ${sayBtn(v.inf, 'skib')}</div><p class="center hint">${esc(v.en)}</p>
          <div class="forge"><button data-g="1">-ede<small>lave → lavede</small></button><button data-g="2">-te<small>læse → læste</small></button><button data-g="u">anderledes<small>gå → gik</small></button></div>
          <div class="row end"><button class="ghost" data-g="?">? Ved ikke</button></div>`, { lift: 1 });
        c.querySelectorAll('[data-g]').forEach(b => b.onclick = () => res(b.dataset.g));
      });
      if (pick === v.g) {
        got++; E.speak(v.past, 'skib'); E.castAnim(v.past); E.learn(v.inf, v.past);
        E.sheet(`<p class="lab">Hukommelsessmedjen <span>${got}/${total}</span></p>${shards(got, total)}<div class="verb" lang="da">${fog(v.past)}</div><p class="center hint">${esc(v.inf)} → ${esc(v.past)} · ${LABEL[v.g]}</p>`, { lift: 1 });
        await E.wait(1300);
      } else {
        if (pick !== '?') { miss++; SFX.bad(); }
        q.splice(Math.min(q.length, 2 + Math.floor(Math.random() * 3)), 0, v);
        const c = E.sheet(`<p class="lab">${pick === '?' ? 'Ved ikke' : 'Ikke helt'} <span>${got}/${total}</span></p>
          <div class="verb" lang="da">${fog(v.inf)} → ${fog(v.past)} ${sayBtn(v.past, 'skib')}</div>
          <p class="center">It goes in <b>${LABEL[v.g]}</b>.${v.why ? ' ' + esc(v.why) : ''}</p><p class="hint center">The card goes back into the fire. It will come again.</p>
          <div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
        E.speak(v.past, 'skib');
        await tapWait(c, '#nx');
      }
    }
    E.closeSheet();
    return { miss };
  }

  /* soft d or t: listen to the ending */
  async function earTest(items) {
    const voice = E.daVoices().length > 0; let miss = 0, n = 0;
    for (const it of shuffle(items)) {
      n++;
      const pick = await new Promise(res => {
        const c = E.sheet(`<p class="lab" data-ans="${it.g}">Lyt efter enden <span>${n}/${items.length}</span></p>
          <p class="hint center">${voice ? 'SKIB says a memory word. Does it end in a soft <b>-ede</b> or a crisp <b>-te</b>?' : 'There is no Danish voice on this device, so read it: which ending is it?'}</p>
          <div class="verb">${voice ? '<button class="go" id="pl">▶ Lyt</button>' : esc(it.w.replace(/(ede|te)$/, '···'))}</div>
          <div class="act"><button data-g="1">-ede<br><small>soft d, like “the”</small></button><button data-g="2">-te<br><small>a clean t</small></button></div>`, { lift: 1 });
        const pl = c.querySelector('#pl'); if (pl) pl.onclick = () => E.speak(it.w, 'skib');
        if (voice) setTimeout(() => E.speak(it.w, 'skib'), 300);
        c.querySelectorAll('[data-g]').forEach(b => b.onclick = () => res(b.dataset.g));
      });
      const ok = pick === it.g; if (!ok) { miss++; SFX.bad(); } else SFX.tick();
      E.learn(it.w);
      const c = E.sheet(`<p class="lab">${ok ? 'Rigtigt' : 'Lyt igen'} <span>${n}/${items.length}</span></p><div class="verb" lang="da">${fog(it.w)} ${sayBtn(it.w, 'skib')}</div>
        <p class="center hint">${it.g === '1' ? '-ede: the d melts, almost “-e-the”.' : '-te: you hear a real t.'}</p><div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
      if (ok) { await E.wait(1100); } else await tapWait(c, '#nx');
    }
    E.closeSheet();
    return { miss };
  }

  /* choose one memory (or write your own) */
  function pickOne(o) {
    return new Promise(res => {
      const c = E.sheet(`<p class="lab">${esc(o.lab || 'Hukommelse')}<span>${esc(o.sub || 'memory')}</span></p><p class="h">${esc(E.fmt(o.h))}</p>${o.hint ? `<p class="hint">${o.hint}</p>` : ''}
        <div class="chips">${o.opts.map((x, i) => `<button class="chip" data-i="${i}"><span lang="da">${esc(x.da)}</span>${x.en ? ` <small class="hint">${esc(x.en)}</small>` : ''}</button>`).join('')}</div>
        ${o.own ? `<input class="write" id="own" placeholder="${esc(o.own)}" autocomplete="off" maxlength="30"><div class="row end"><button class="ghost" id="useOwn">Brug mit eget ▸</button></div>` : ''}`, { lift: 1 });
      c.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { E.closeSheet(); res(Object.assign({}, o.opts[+b.dataset.i])); });
      const u = c.querySelector('#useOwn');
      if (u) u.onclick = () => { const v = c.querySelector('#own').value.trim().replace(/[<>]/g, ''); if (!v) return E.toast('Write it first.'); E.closeSheet(); res(o.ownMake ? o.ownMake(v) : { da: v, en: v, own: 1 }); };
    });
  }

  /* i or på */
  async function prepSort(items) {
    let q = shuffle(items), got = 0, miss = 0;
    while (q.length) {
      const it = q.shift();
      const pick = await new Promise(res => {
        const c = E.sheet(`<p class="lab">i eller på? <span>${got}/${items.length}</span></p><p class="hint center">${esc(it.ctx || 'Jeg arbejdede ___')}</p>
          <div class="frag" lang="da" data-ans="${it.p}"><span class="gap">?</span> ${fog(it.w)}</div><p class="center hint">${esc(it.en)}</p>
          <div class="act"><button data-p="i">i</button><button data-p="på">på</button></div>`, { lift: 1 });
        c.querySelectorAll('[data-p]').forEach(b => b.onclick = () => res(b.dataset.p));
      });
      if (pick === it.p) { got++; SFX.tick(); E.learn(it.w); E.sheet(`<div class="frag" lang="da"><b>${fog(it.p)}</b> ${fog(it.w)}</div><p class="center hint">${esc(it.why || '')}</p>`, { lift: 1 }); await E.wait(900); }
      else {
        miss++; SFX.bad(); q.push(it);
        const c = E.sheet(`<p class="lab">Ikke helt</p><div class="frag" lang="da"><b>${fog(it.p)}</b> ${fog(it.w)}</div><p class="center">${esc(it.why || '')}</p><div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
        await tapWait(c, '#nx');
      }
    }
    E.closeSheet();
    return { miss };
  }

  /* =====================================================================
     A LOG to read, with questions under it */
  async function readLog(o) {
    let miss = 0;
    for (let i = 0; i < o.qs.length; i++) {
      const Q = o.qs[i];
      await new Promise(res => {
        const c = E.sheet(`<p class="lab">${esc(o.lab)}<span>${i + 1}/${o.qs.length}</span></p>
          <div class="scroll" lang="da"><h4>${fog(o.title)}</h4>${o.text.split('\n').map(p => `<p style="margin:.2em 0 .5em">${fog(p)}</p>`).join('')}</div>
          <div class="row"><button class="mini" id="rd">▶ Læs højt</button><span class="hint">Tap any word you don't know.</span></div>
          <p class="h" style="margin-top:.7em">${Q.da ? fog(Q.q) : esc(Q.q)}</p>
          <div class="opts" data-ans="${Q.a}">${shuffle(Q.opts.map((x, k) => [x, k])).map(([x, k]) => `<button data-k="${k}" ${Q.da ? 'lang="da"' : ''}>${esc(x)}</button>`).join('')}</div>
          <p class="fb" id="why" hidden></p><div class="row end"><button class="go" id="nx" hidden>▸</button></div>`, { lift: 0 });
        if (i > 0) c.scrollTop = c.querySelector('.h').offsetTop - 60;
        c.querySelector('#rd').onclick = () => E.speak(o.text.replace(/\n/g, ' '), o.who || 'asta');
        let wrong = 0;
        c.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', e => {
          if (e.target.closest('[data-w]')) return;
          const k = +b.dataset.k, why = c.querySelector('#why');
          if (k === Q.a) {
            b.classList.add('right'); SFX.ok(); why.className = 'fb'; why.innerHTML = fog(Q.why || 'Rigtigt.'); why.hidden = false;
            c.querySelectorAll('[data-k]').forEach(x => x.disabled = true); const nx = c.querySelector('#nx'); nx.hidden = false; nx.onclick = res; E.gainPower(wrong ? 1 : 3);
          } else {
            b.classList.add('wrong'); b.disabled = true; SFX.bad(); miss++; wrong++;
            why.className = 'fb bad'; why.innerHTML = esc(Q.hint || 'Look again. The answer is in the log.'); why.hidden = false;
          }
        }));
      });
    }
    E.learnText(o.text);
    E.closeSheet();
    return { miss };
  }

  /* =====================================================================
     TRE NØGLER — på grund af / for at / fordi open the pylon's three locks */
  const KEYS = [
    { id: 'pga', da: 'på grund af', en: 'because of', plus: '+ a thing', svg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>' },
    { id: 'fa', da: 'for at', en: 'in order to', plus: '+ a verb', svg: '<svg viewBox="0 0 24 24"><path d="M12 3 22 20H2Z" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>' },
    { id: 'fd', da: 'fordi', en: 'because', plus: '+ a whole sentence', svg: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>' }
  ];
  async function threeKeys(items) {
    const cnt = { pga: 0, fa: 0, fd: 0 }, per = {}; items.forEach(it => per[it.k] = (per[it.k] || 0) + 1);
    let miss = 0; G.locks = [0, 0, 0];
    for (const it of items) {
      let tries = 0;
      for (; ;) {
        const pick = await new Promise(res => {
          const c = E.sheet(`<p class="lab">Tre nøgler <span>${KEYS.map(k => `${cnt[k.id]}/${per[k.id]}`).join(' · ')}</span></p>
            <div class="frag" lang="da" data-ans="${it.k}">${fog(it.a)} <span class="gap">?</span> ${fog(it.b)}</div>${it.en ? `<p class="center hint">${esc(it.en)}</p>` : ''}
            <div class="keys">${KEYS.map(k => `<button data-k="${k.id}">${k.svg}<span>${esc(k.da)}</span><small class="hint">${esc(k.plus)}</small></button>`).join('')}</div>`, { lift: 1 });
          c.querySelectorAll('[data-k]').forEach(b => b.onclick = () => res(b.dataset.k));
        });
        const ki = KEYS.findIndex(k => k.id === pick);
        G.lockHi = ki;
        if (pick === it.k) {
          cnt[it.k]++; SFX.clang(); E.castAnim(KEYS[ki].da); E.learn(KEYS[ki].da);
          if (cnt[it.k] === per[it.k]) { G.locks[ki] = 1; G.locks = G.locks.slice(); SFX.chime(); }
          const c = E.sheet(`<div class="frag" lang="da">${fog(it.a)} <b style="color:var(--teal)">${fog(KEYS[ki].da)}</b> ${fog(it.b)}</div><p class="center hint">${esc(it.why || '')}</p>${cnt[it.k] === per[it.k] ? `<p class="center gain">The ${['circle', 'triangle', 'square'][ki]} lock is open.</p>` : ''}<div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
          await tapWait(c, '#nx');
          break;
        } else {
          miss++; tries++; SFX.bad(); G.fizzle = { t0: E.clock() };
          const right = KEYS.find(k => k.id === it.k);
          const tip = pick === 'pga' ? 'på grund af needs a thing after it (a noun), not a verb or a sentence.' : pick === 'fa' ? 'for at needs a verb right after it: for at finde, for at sove.' : 'fordi needs a whole sentence after it, with its own subject and verb.';
          const c = E.sheet(`<p class="lab">Låsen gnister <span>the lock sparks</span></p><p>${esc(tip)}</p>${tries >= 2 ? `<p class="fb">Look at what comes after the gap: <b lang="da">${esc(it.b.split(' ').slice(0, 3).join(' '))} …</b> → <b lang="da">${esc(right.da)}</b></p>` : ''}<div class="row end"><button class="go" id="nx">Prøv igen ▸</button></div>`, { lift: 1 });
          await tapWait(c, '#nx');
        }
      }
    }
    G.lockHi = null; E.closeSheet();
    return { miss };
  }

  /* =====================================================================
     SPEJLBROEN — the bridge is built from sentences in the right order */
  async function bridge(items, P) {
    const h = E.actor('hero'); let miss = 0;
    const X = window.Art.WX, N = 8, pos = i => X.RAV0 + (X.RAV1 - X.RAV0) * (i + 0.5) / N;
    G.planks = 0; G.crack = null;
    for (let i = 0; i < items.length; i++) {
      const it = items[i]; let tries = 0;
      for (; ;) {
        const ans = await new Promise(res => {
          let comp = [];
          let pool = shuffle(it.w.map((w, k) => ({ w, k })));
          for (let r = 0; r < 12 && pool.every((c, k) => c.k === k); r++) pool = shuffle(pool);
          const c = E.sheet(`<p class="lab">Spejlbroen <span>planke ${i + 1}/${items.length}</span></p>${it.rule ? `<p class="hint">${esc(it.rule)}</p>` : ''}
            <div class="frag" lang="da" style="text-align:left">${fog(it.pre)} <span id="sl"></span>${esc(it.post || '.')}</div>
            ${it.en ? `<p class="hint">${esc(E.fmt(it.en))}</p>` : ''}
            <div class="chips" id="tr" data-ans="${esc(it.w.map(E.fmt).join('|'))}"></div>
            <div class="tools2"><button class="ghost" id="del">⌫</button><button class="ghost" id="clr">Forfra</button></div>
            <div class="row end"><button class="go" id="ok">Byg ▸</button></div>`, { lift: 1 });
          const paint = () => {
            c.querySelector('#sl').innerHTML = comp.length ? comp.map(x => `<b class="pill" style="font-size:.8em">${esc(E.fmt(x.w))}</b>`).join(' ') : '<span class="gap">&nbsp;</span>';
            c.querySelector('#tr').innerHTML = pool.map(x => `<button class="chip ${comp.includes(x) ? 'used' : ''}" data-k="${x.k}" ${comp.includes(x) ? 'disabled' : ''}>${esc(E.fmt(x.w))}</button>`).join('');
            c.querySelectorAll('#tr [data-k]').forEach(b => b.onclick = () => { comp.push(pool.find(x => x.k === +b.dataset.k)); SFX.tick(); paint(); });
          };
          paint();
          c.querySelector('#del').onclick = () => { comp.pop(); paint(); };
          c.querySelector('#clr').onclick = () => { comp = []; paint(); };
          c.querySelector('#ok').onclick = () => { if (comp.length < it.w.length) return E.toast('Use all the words.'); res(comp.map(x => E.fmt(x.w)).join(' ')); };
        });
        const good = [it.w.map(E.fmt).join(' ')].concat((it.alt || []).map(a => a.map(E.fmt).join(' '))).map(E.norm);
        if (good.includes(E.norm(ans))) {
          G.crack = null; G.planks = i + 1; SFX.plank(); E.learnText(E.fmt(it.pre + ' ' + it.w.join(' ')));
          E.gainPower(tries ? 1 : 3);
          E.tween(h, 'wx', pos(Math.min(N - 1, i)), 0.8, 'lin');
          const full = E.fmt(it.pre + ' ' + it.w.join(' ') + (it.post || '.'));
          E.speak(full);
          const c = E.sheet(`<p class="lab">Planken holder <span>${i + 1}/${items.length}</span></p><p class="da" lang="da">${fog(full)} ${sayBtn(full)}</p>${it.why ? `<p class="hint">${esc(it.why)}</p>` : ''}<div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
          if (P && P.mid && i === Math.floor(items.length / 2) - 1) { E.speak(P.mid[0], 'lav'); c.insertAdjacentHTML('afterbegin', `<div class="pop">${E.lineHtml('lav', P.mid[0], P.mid[1])}</div>`); E.wireEn(c); }
          await tapWait(c, '#nx');
          break;
        } else {
          miss++; tries++; G.crack = i; SFX.crack(); G.shake = { t0: E.clock(), dur: 0.4, amp: 0.5 };
          const give = tries >= 3, model = E.fmt(it.pre + ' ' + it.w.join(' ') + (it.post || '.'));
          const c = E.sheet(`<p class="lab">Planken knækker <span>the plank cracks</span></p>
            <div class="mine"><p class="da" lang="da" style="margin:0">${fog(it.pre + ' ' + ans + (it.post || '.'))}</p></div>
            ${give ? `${E.lineHtml('lav', 'Selv en sten kan høre det. Sig: ' + model, 'Even a stone can hear it. Say: ' + model)}` : `<p>${esc(it.hint || 'Look at where the verb is.')}</p>`}
            <div class="row end"><button class="go" id="nx">Prøv igen ▸</button></div>`, { lift: 1 });
          E.wireEn(c);
          if (give) E.speak('Selv en sten kan høre det. Sig: ' + model, 'lav');
          await tapWait(c, '#nx');
        }
      }
    }
    E.closeSheet();
    return { miss };
  }

  /* =====================================================================
     KLANGSTEN — the sound stones answer the right sounds */
  async function stones() {
    let miss = 0; G.stonesLit = 0; const lightUp = () => { G.stonesLit = Math.min(6, (G.stonesLit || 0) + 1); SFX.stone(); };
    // 1 · the letters nobody says
    const SIL = [
      { w: 'for at', mute: [2, 4, 5], say: 'Jeg kom hertil for at finde hjælp.', note: 'for at sounds like one short “fo”.' },
      { w: 'på grund af', mute: [7, 10], say: 'Hun styrtede ned på grund af en drone.', note: 'The d in grund and the f in af are silent: “på grån a”.' },
      { w: 'også', mute: [1], say: 'Lav er også sulten.', note: 'The g disappears: “o-se”.' },
      { w: 'godt', mute: [2], say: 'Det gik godt.', note: 'The d is silent: “got”.' }
    ];
    await teach({ lab: 'Klangsten', sub: 'sound stones', h: 'Danish swallows letters.', html: `<p>The stones hum when you hear what a Dane really says. Spoken Danish drops letters: <b lang="da">for at</b> sounds like “fo”. <b lang="da">på grund af</b> sounds like “på grån a”.</p><p class="hint">Tap the letters you <b>cannot</b> hear. Then tap Færdig.</p>`, btn: 'Prøv ▸' });
    for (const s of SIL) {
      for (let tries = 0; ; tries++) {
        const sel = await new Promise(res => {
          const on = new Set();
          const c = E.sheet(`<p class="lab">Stumme bogstaver <span>silent letters</span></p><p class="hint center">${sayBtn(s.say)} Listen: <span lang="da">${fog(s.say)}</span></p>
            <div class="frag" id="lt" data-ans="${s.mute.join(',')}">${[...s.w].map((ch, i) => ch === ' ' ? '<span style="display:inline-block;width:.6em"></span>' : `<button class="chip" data-i="${i}" style="min-width:2.2em">${esc(ch)}</button>`).join('')}</div>
            <div class="row end"><button class="go" id="ok">Færdig ▸</button></div>`, { lift: 1 });
          setTimeout(() => E.speak(s.say), 300);
          c.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const i = +b.dataset.i; on.has(i) ? on.delete(i) : on.add(i); b.style.opacity = on.has(i) ? 0.35 : 1; b.style.textDecoration = on.has(i) ? 'line-through' : ''; });
          c.querySelector('#ok').onclick = () => res([...on].sort((a, b) => a - b));
        });
        const ok = sel.join() === s.mute.join();
        const shown = [...s.w].map((ch, i) => s.mute.includes(i) ? `<s style="opacity:.4">${esc(ch)}</s>` : esc(ch)).join('');
        if (ok || tries >= 1) {
          lightUp(); if (ok) { E.gainPower(2); } else { miss++; SFX.bad(); }
          const c = E.sheet(`<p class="lab">${ok ? 'Stenen synger' : 'Sådan her'} <span>${ok ? 'the stone sings' : 'like this'}</span></p><div class="frag" lang="da" style="font-size:1.6em">${shown}</div><p class="center">${esc(s.note)} ${sayBtn(s.w)}</p><div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
          E.learn(s.w); await tapWait(c, '#nx'); break;
        }
        miss++; SFX.bad(); E.toast('Not quite. Listen once more.', 2000);
      }
    }
    // 2 · the stone sound [ɔ]
    const W = [['godt', 1], ['kom', 1], ['grund', 1], ['job', 1], ['også', 1], ['bo', 0], ['lys', 0], ['sø', 0], ['hun', 0], ['nu', 0]];
    await teach({ lab: 'Klangsten', sub: 'the stone sound', h: 'One sound, many spellings.', html: `<p>The deepest stone hums an open, round <b>å</b>-like sound, written [ɔ]. You hear it in <b lang="da">godt</b> ${sayBtn('godt')}, <b lang="da">kom</b> ${sayBtn('kom')} and <b lang="da">grund</b> ${sayBtn('grund')}, even though they are spelled with o and u.</p><p class="hint">Find all the stones with that sound.</p>`, btn: 'Find dem ▸' });
    await new Promise(res => {
      const found = new Set(), need = W.filter(x => x[1]).length;
      const c = E.sheet(`<p class="lab">Find lyden [ɔ] <span id="ct">0/${need}</span></p><p class="hint">Tap ▶ to hear a stone. Tap the word if it has the sound.</p>
        <div class="stones">${shuffle(W).map(([w, y]) => `<div class="st"><button data-w2="${w}" data-y="${y}">${esc(w)}</button><button class="mini" data-say="${w}" aria-label="Hear it">▶</button></div>`).join('')}</div>`, { lift: 1 });
      c.querySelectorAll('[data-w2]').forEach(b => b.onclick = () => {
        const w = b.dataset.w2;
        E.speak(w);
        if (b.dataset.y === '1') { if (!found.has(w)) { found.add(w); SFX.stone(); b.parentNode.classList.add('on'); b.style.boxShadow = '0 0 14px rgba(122,255,207,.35)'; E.learn(w); } c.querySelector('#ct').textContent = found.size + '/' + need; if (found.size === need) setTimeout(res, 900); }
        else { miss++; SFX.bad(); b.disabled = true; b.parentNode.style.opacity = 0.35; E.toast(`“${w}” has a different vowel.`, 1600); }
      });
    });
    // 3 · say it to the stones
    const SAY = ['for at', 'på grund af', 'Jeg kom hertil på grund af en drone.', 'Det gik godt.'];
    const mic = !!(window.SpeechRecognition || window.webkitSpeechRecognition) && E.S().set.mic;
    await teach({ lab: 'Klangsten', sub: 'say it', h: 'Now the stones listen to you.', html: `<p>${mic ? 'Tap ▶ to hear it, then 🎙 and say it. Say it the lazy Danish way: swallow the silent letters.' : 'There is no microphone here. Tap ▶, then say it aloud twice, the lazy Danish way. Be honest with the stones.'}</p>`, btn: 'Klar ▸' });
    for (const s of SAY) {
      const target = E.norm(s);
      for (let tries = 0; ; tries++) {
        const r = await new Promise(res => {
          const c = E.sheet(`<p class="lab">Sig det <span>say it</span></p><div class="frag" lang="da">${fog(s)}</div>
            <div class="act"><button id="pl">▶ Lyt</button>${mic ? '<button id="mc">🎙 Sig det</button>' : '<button id="dn">Jeg sagde det ✓</button>'}</div><p class="hint center" id="hd"></p>`, { lift: 1 });
          c.querySelector('#pl').onclick = () => E.speak(s);
          setTimeout(() => E.speak(s), 300);
          const dn = c.querySelector('#dn'); if (dn) dn.onclick = () => res('self');
          const mc = c.querySelector('#mc');
          if (mc) mc.onclick = async () => { const lab = mc.innerHTML; mc.disabled = true; const alts = await E.hear(x => { mc.textContent = E.MICL[x]; mc.classList.toggle('rec', x !== 'wait'); }); mc.disabled = false; mc.classList.remove('rec'); mc.innerHTML = lab; if (alts === null) { E.toast(E.hearMsg(null), 6000); return res('self'); } if (!alts.length) { c.querySelector('#hd').textContent = E.hearMsg(alts); return; } res(alts.map(E.norm)); };
        });
        if (r === 'self') { if (SAY.indexOf(s) % 2) lightUp(); else SFX.stone(); E.gainPower(1); break; }
        const words = target.split(' '), best = Math.max(...r.map(a => words.filter(w => (' ' + a + ' ').includes(' ' + w + ' ')).length / words.length));
        if (best >= 0.75) { if (SAY.indexOf(s) % 2) lightUp(); else SFX.stone(); E.gainPower(3); E.castAnim(); E.sheet(`<p class="whisper">✓</p><p class="center hint">The stone heard: “${esc(r[0])}”</p>`, { lift: 1 }); await E.wait(1200); break; }
        miss++; SFX.bad();
        if (tries >= 2) { if (SAY.indexOf(s) % 2) lightUp(); E.sheet(`<p class="center">The stone heard “${esc(r[0])}”. Speech recognition is fussy; that's fine. Moving on.</p>`, { lift: 1 }); await E.wait(2000); break; }
        E.toast(`The stone heard “${r[0]}”. Again, slowly.`, 2600);
      }
    }
    E.closeSheet();
    return { miss };
  }

  /* =====================================================================
     THE GATE SCANNER — write your background, checked live */
  const PAST = new Set(('lavede arbejdede flyttede boede spillede studerede cyklede startede åbnede passede malede dansede forskede ringede elskede hentede ' +
    'læste købte spiste begyndte rejste mødte underviste kendte kørte hørte lærte brugte søgte besøgte troede ' +
    'gik havde kom tog var fik gjorde sagde ville kunne skrev sov stjal faldt hed skulle måtte vidste så fandt drak løb gav sad stod bad').split(' '));
  const SUBJ = new Set('jeg du han hun vi de man den det'.split(' '));
  function analyse(txt, name) {
    const raw = txt.replace(/\s+/g, ' ').trim();
    const sents = raw.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(s => s.split(/\s+/).length >= 3);
    const words = E.norm(raw).split(' ');
    const isPast = w => PAST.has(w) || (/ede$/.test(w) && w.length > 5);
    const past = words.some(isPast);
    const reason = /\b(fordi|for at|på grund af)\b/i.test(E.unacc(raw.toLowerCase()).replace(/pa grund/, 'på grund'));
    let forI = 0, forBad = '';
    sents.forEach(s => {
      const m = s.toLowerCase().match(/^før\b[^,]*,\s*([\wæøå]+)\s+([\wæøå]+)/);
      if (m) { const v = m[1], sb = m[2]; if ((isPast(v) || /^(kan|vil|skal|er|har|bor|arbejder)$/.test(v)) && (SUBJ.has(sb) || (name && sb === name.toLowerCase()))) forI = 1; else if (SUBJ.has(v)) forBad = s; }
    });
    let fordiBad = '';
    const fm = raw.toLowerCase().match(/fordi\s+(jeg|du|han|hun|vi|de|man)\s+([\wæøå]+)\s+(ikke|gerne)\b/);
    if (fm) fordiBad = fm[0];
    return { sents: sents.length, past, reason, forI, forBad, fordiBad };
  }
  function gateWrite(o) {
    return new Promise(res => {
      const mic = !!(window.SpeechRecognition || window.webkitSpeechRecognition) && E.S().set.mic;
      const c = E.sheet(`<p class="lab">Formular 7B · Baggrund <span>background</span></p>
        <p class="hint">Holm's scanner reads what you write about your life before. Write at least three sentences. The list fills in as you write.</p>
        <textarea class="write" id="tx" lang="da" autocapitalize="sentences" spellcheck="false" placeholder="Før jeg kom hertil, …"></textarea>
        <ul class="checks" id="ck"></ul><p class="fb bad" id="warn" hidden></p>
        <div class="tools2">${mic ? '<button class="ghost" id="mc">🎙 Dikter</button>' : ''}<button class="ghost" id="hp">? Hjælp</button></div>
        <div id="model" hidden data-ans="${esc(o.model)}"></div>
        <div class="row end"><button class="go" id="sc" disabled>Scan ▸</button></div>`, { lift: 0 });
      const tx = c.querySelector('#tx'), ck = c.querySelector('#ck'), sc = c.querySelector('#sc'), warn = c.querySelector('#warn');
      const check = () => {
        const a = analyse(tx.value, E.S().name);
        const L = [[a.sents >= 3, `3 sætninger (${a.sents}/3)`], [a.past, 'datid: lavede, boede, var …'], [a.reason, 'en grund: fordi / for at / på grund af'], [a.forI, 'Før …, + verbet først (Før jeg kom hertil, boede jeg …)']];
        ck.innerHTML = L.map(([ok, t]) => `<li class="${ok ? 'ok' : ''}">${esc(t)}</li>`).join('');
        const w = a.forBad ? `After a før-clause the verb jumps before the subject: “…, ${esc('boede jeg')}” not “…, jeg boede”.` : a.fordiBad ? `Inside a fordi-sentence, ikke/gerne go before the verb: “fordi jeg ikke kunne …”.` : '';
        warn.hidden = !w; warn.innerHTML = w;
        sc.disabled = !(L.every(x => x[0]));
        return a;
      };
      tx.oninput = check; check();
      c.querySelector('#hp').onclick = () => { const m = c.querySelector('#model'); m.hidden = !m.hidden; m.innerHTML = `<div class="memory"><div class="who">Holm's example, made of your memories</div><p class="da" lang="da" style="font-size:1.02em">${fog(o.model)}</p></div>`; };
      const mc = c.querySelector('#mc');
      if (mc) mc.onclick = async () => { mc.textContent = '… lytter'; const alts = await E.hear(); mc.textContent = '🎙 Dikter'; if (alts && alts[0]) { let t = alts[0].trim(); t = t.charAt(0).toUpperCase() + t.slice(1); tx.value = (tx.value.trim() ? tx.value.trim() + ' ' : '') + t + '.'; check(); } };
      sc.onclick = () => { E.closeSheet(); res(tx.value.trim()); };
    });
  }

  /* a dramatic one-tap moment */
  function qte(label, ms, sub) {
    return new Promise(res => {
      const c = E.sheet(`<p class="center hint">${esc(sub || '')}</p><button class="go" id="q" style="width:100%;font-size:1.4em;min-height:3.4em;animation:pop .5s ease-out infinite alternate">${esc(label)}</button><div class="meter"><i id="tm" style="width:100%"></i></div>`, { lift: 1 });
      const cl = clockBar(c.querySelector('#tm'), ms);
      c.querySelector('#q').onclick = () => { cl.stop(); E.closeSheet(); res(true); };
      cl.p.then(() => { E.closeSheet(); res(false); });
    });
  }

  function endCard(o) {
    return new Promise(res => {
      const S = E.S(), n = Object.keys(S.words).length;
      const c = E.sheet(`<div class="endcard"><p class="lab" style="justify-content:center">${esc(o.k)}</p><p class="h">${esc(o.title)}</p>
        <p class="hint">${esc(o.line || '')}</p>
        <div class="row" style="justify-content:center"><span class="pill">${n} ord mødt</span><span class="pill">Ordkraft ${S.power}</span></div>
        <div style="text-align:left;margin-top:.8em">${o.learned.map(x => `<p class="narr" style="margin:.25em 0">◆ ${x}</p>`).join('')}</div>
        <div class="row" style="justify-content:center"><button class="go" id="ok">${esc(o.btn || 'Videre ▸')}</button></div></div>`, { mid: true, dim: true });
      c.querySelector('#ok').onclick = () => { E.closeSheet(); res(); };
    });
  }

  window.Games = { teach, gemDig, forgeSort, earTest, pickOne, prepSort, readLog, threeKeys, bridge, stones, gateWrite, analyse, qte, endCard, shuffle, sayBtn, CMD, KEYS };
})();
