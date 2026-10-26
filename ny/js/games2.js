/* Dumpet på Måne Syv · more mini-games, general enough for every section.
   Each returns a promise. Every game puts data-ans on its question, so the test player can answer it. */
(function () {
  'use strict';
  const E = window.E, esc = E.esc, fog = E.fog, SFX = E.SFX, Gm = window.Games;
  const shuffle = Gm.shuffle, sayBtn = Gm.sayBtn;
  const tapWait = (el, sel) => new Promise(r => el.querySelector(sel).onclick = r);
  const dots = (n, of) => `<div class="shards">${Array.from({ length: of }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* =====================================================================
     SORT — each card into its box. A card you get wrong comes back a little later; “? Ved ikke” is always allowed. */
  // a bar that runs out; resolves 'time' when it does
  function timer(el, ms) {
    let stop = false, t0 = performance.now(), done; const p = new Promise(r => done = r);
    const f = () => { if (stop) return; const k = Math.max(0, 1 - (performance.now() - t0) / ms); if (el.isConnected) el.style.width = (k * 100) + '%'; if (k <= 0) return done('time'); requestAnimationFrame(f); };
    requestAnimationFrame(f);
    return { p, stop: () => { stop = true; } };
  }
  async function sortCards(o) {
    let q = shuffle(o.items), got = 0, miss = 0, slow = 0;
    const total = o.items.length, cols = o.groups.length, voice = E.daVoices().length > 0, listen = o.listen && voice;
    while (q.length) {
      const v = q.shift(), say = v.say || v.w;
      const pick = await new Promise(res => {
        const c = E.sheet(`<p class="lab">${esc(o.lab)} <span>${got}/${total}</span></p>${total <= 18 ? dots(got, total) : ''}
          ${o.h ? `<p class="hint center">${o.h}</p>` : ''}
          <div class="verb sortc" lang="da" data-ans="${esc(v.g)}">${listen ? '<button class="go" id="pl">▶ Lyt</button>' : `${fog(v.w)} ${sayBtn(say, o.who)}`}</div>
          ${v.en && !listen && !o.ms ? `<p class="center hint">${esc(v.en)}</p>` : ''}
          ${o.ms ? '<div class="meter"><i id="tm" style="width:100%"></i></div>' : ''}
          <div class="forge" style="grid-template-columns:repeat(${cols},1fr)">${o.groups.map(g => `<button data-g="${esc(g.k)}"><span lang="da">${esc(g.label)}</span>${g.small ? `<small>${esc(g.small)}</small>` : ''}</button>`).join('')}</div>
          <div class="row end"><button class="ghost" data-g="?">? Ved ikke</button></div>`, { lift: 1 });
        const pl = c.querySelector('#pl'); if (pl) { pl.onclick = () => E.speak(say, o.who); }
        if (listen || o.ms) setTimeout(() => E.speak(say, o.who), 300);
        const tm = o.ms ? timer(c.querySelector('#tm'), o.ms + (listen ? 1200 : 0)) : null;
        if (tm) tm.p.then(() => res('time'));
        c.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { if (tm) tm.stop(); res(b.dataset.g); });
      });
      const grp = o.groups.find(g => g.k === v.g);
      if (pick === v.g) {
        got++; SFX.tick(); E.learnText(v.w);
        E.sheet(`<p class="lab">${esc(o.lab)} <span>${got}/${total}</span></p>${total <= 18 ? dots(got, total) : ''}<div class="verb" lang="da">${fog(v.w)} ${sayBtn(say, o.who)}</div>
          <p class="center"><b lang="da">${fog(grp.label)}</b>${v.en ? ` · ${esc(v.en)}` : ''}${v.why ? `<br><span class="hint">${esc(v.why)}</span>` : ''}</p>`, { lift: 1 });
        if (listen) E.speak(say, o.who);
        await E.wait(v.why ? 1900 : 1300);
      } else {
        if (pick === 'time') slow++; else if (pick !== '?') { miss++; SFX.bad(); }
        q.splice(Math.min(q.length, 2 + Math.floor(Math.random() * 3)), 0, v);
        const c = E.sheet(`<p class="lab">${pick === '?' ? 'Ved ikke' : pick === 'time' ? 'For langsomt' : 'Ikke helt'} <span>${got}/${total}</span></p>
          <div class="verb" lang="da">${fog(v.w)} ${sayBtn(say, o.who)}</div>
          <p class="center">${v.en ? esc(v.en) + '. ' : ''}It goes in <b lang="da">${fog(grp.label)}</b>.${v.why ? ' ' + esc(v.why) : ''}</p><p class="hint center">The card goes back in the pile. It will come again.</p>
          <div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
        E.speak(say, o.who);
        await tapWait(c, '#nx');
      }
    }
    E.closeSheet();
    return { miss, slow };
  }

  /* =====================================================================
     GAP — choose the word for the gap. Each key says what follows it; a wrong key explains itself. */
  async function gapChoice(o) {
    let miss = 0, n = 0;
    for (const it of o.items) {
      n++; let tries = 0;
      // the gap starts a sentence: no words before it, or the words before it end one
      const first = !it.a || /[.?!–]\s*$/.test(it.a);
      const sp = /^[?.!,]/.test(it.b) ? '' : ' ';
      for (; ;) {
        const pick = await new Promise(res => {
          const c = E.sheet(`<p class="lab">${esc(o.lab)} <span>${n}/${o.items.length}</span></p>${o.h ? `<p class="hint center">${o.h}</p>` : ''}
            <div class="frag" lang="da" data-ans="${esc(it.k)}">${it.a ? fog(it.a) + ' ' : ''}<span class="gap">?</span>${sp}${fog(it.b)}</div>${it.en ? `<p class="center hint">${esc(it.en)}</p>` : ''}
            <div class="keys" style="grid-template-columns:repeat(${Math.min(o.keys.length, 4)},1fr)">${o.keys.map(k => `<button data-k="${esc(k.id)}"><span lang="da">${esc(first ? cap(k.da) : k.da)}</span>${k.plus ? `<small class="hint">${esc(k.plus)}</small>` : ''}</button>`).join('')}</div>`, { lift: 1 });
          c.querySelectorAll('[data-k]').forEach(b => b.onclick = () => res(b.dataset.k));
        });
        const key = o.keys.find(k => k.id === it.k), word = first ? cap(key.da) : key.da, whole = `${it.a ? it.a + ' ' : ''}${word}${sp}${it.b}`;
        if (pick === it.k) {
          SFX.tick(); E.learnText(key.da);
          const c = E.sheet(`<div class="frag" lang="da">${it.a ? fog(it.a) + ' ' : ''}<b style="color:var(--teal)">${fog(word)}</b>${sp}${fog(it.b)} ${sayBtn(whole)}</div><p class="center hint">${esc(it.why || '')}</p><div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
          E.speak(whole); await tapWait(c, '#nx');
          break;
        }
        miss++; tries++; SFX.bad(); E.G.fizzle = { t0: E.clock() };
        const wrong = o.keys.find(k => k.id === pick), tip = (o.tips && o.tips[pick]) || `Not ${wrong ? wrong.da : 'that one'} here.`;
        const c = E.sheet(`<p class="lab">Ikke helt <span>not quite</span></p><p>${esc(tip)}</p>${tries >= 2 ? `<p class="fb">It is <b lang="da">${esc(word)}</b>. ${esc(it.why || '')}</p>` : ''}<div class="row end"><button class="go" id="nx">Prøv igen ▸</button></div>`, { lift: 1 });
        await tapWait(c, '#nx');
      }
    }
    E.closeSheet();
    return { miss };
  }

  /* =====================================================================
     PLACE — tap the gap where the little word belongs (ikke, også, gerne …) */
  async function placeWord(o) {
    let miss = 0, n = 0;
    for (const it of o.items) {
      n++; let tries = 0; const w = it.w.split(' '), word = it.word || o.word;
      for (; ;) {
        const pick = await new Promise(res => {
          const parts = []; for (let i = 0; i <= w.length; i++) { parts.push(`<button class="pg" data-gap="${i}" aria-label="here">+</button>`); if (i < w.length) parts.push(`<span class="pw">${fog(w[i])}</span>`); }
          const c = E.sheet(`<p class="lab">${esc(o.lab)} <span>${n}/${o.items.length}</span></p>
            <p class="hint center">Where does <b class="chipw" lang="da">${esc(word)}</b> go? Tap the gap.</p>
            <div class="place" lang="da" data-ans="${it.at}">${parts.join('')}</div>${it.en ? `<p class="center hint">${esc(it.en)}</p>` : ''}`, { lift: 1 });
          c.querySelectorAll('[data-gap]').forEach(b => b.onclick = () => res(+b.dataset.gap));
        });
        const right = w.slice(0, it.at).concat([word], w.slice(it.at)).join(' ');
        if (pick === it.at) {
          SFX.tick(); E.learnText(word);
          const shown = w.slice(0, it.at).map(fog).concat([`<b style="color:var(--teal)">${fog(word)}</b>`], w.slice(it.at).map(fog)).join(' ');
          const c = E.sheet(`<div class="frag" lang="da">${shown} ${sayBtn(right)}</div><p class="center hint">${esc(it.why || '')}</p><div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
          E.speak(right); await tapWait(c, '#nx');
          break;
        }
        miss++; tries++; SFX.bad();
        const c = E.sheet(`<p class="lab">Ikke helt <span>not quite</span></p><p>${esc(it.tip || o.tip || 'Look at the verb. Is this a main clause, or does it start with fordi, når, da, at or der?')}</p>
          ${tries >= 2 ? `<p class="fb" lang="da">${fog(right)}</p><p class="hint">${esc(it.why || '')}</p>` : ''}<div class="row end"><button class="go" id="nx">Prøv igen ▸</button></div>`, { lift: 1 });
        await tapWait(c, '#nx');
      }
    }
    E.closeSheet();
    return { miss };
  }

  /* =====================================================================
     STRESS — listen, then tap the word that carries the stress */
  async function stressTap(o) {
    let miss = 0, n = 0;
    for (const it of o.items) {
      n++; let tries = 0; const w = it.w.split(' ');
      for (; ;) {
        const pick = await new Promise(res => {
          const c = E.sheet(`<p class="lab">${esc(o.lab)} <span>${n}/${o.items.length}</span></p><p class="hint center">${o.h || 'Which word is stressed? Listen, then tap it.'}</p>
            <div class="stress" lang="da" data-ans="${it.at}">${w.map((x, i) => `<button data-si="${i}">${esc(x)}</button>`).join('')}</div>
            <div class="row" style="justify-content:center"><button class="ghost" id="pl">▶ Lyt</button></div>${it.en ? `<p class="center hint">${esc(it.en)}</p>` : ''}`, { lift: 1 });
          c.querySelector('#pl').onclick = () => E.speak(it.w);
          setTimeout(() => E.speak(it.w), 300);
          c.querySelectorAll('[data-si]').forEach(b => b.onclick = () => res(+b.dataset.si));
        });
        if (pick === it.at) {
          SFX.tick();
          const c = E.sheet(`<div class="frag" lang="da">${w.map((x, i) => i === it.at ? `<b class="str">${fog(x)}</b>` : fog(x)).join(' ')} ${sayBtn(it.w)}</div><p class="center hint">${esc(it.why || '')}</p><div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
          await tapWait(c, '#nx'); break;
        }
        miss++; tries++; SFX.bad();
        const c = E.sheet(`<p class="lab">Lyt igen <span>listen again</span></p><p>${esc(o.tip || 'The stress falls on the most important new word.')}</p>${tries >= 2 ? `<p class="fb" lang="da">${w.map((x, i) => i === it.at ? `<b class="str">${fog(x)}</b>` : fog(x)).join(' ')}</p><p class="hint">${esc(it.why || '')}</p>` : ''}<div class="row end"><button class="go" id="nx">Prøv igen ▸</button></div>`, { lift: 1 });
        await tapWait(c, '#nx');
      }
    }
    E.closeSheet();
    return { miss };
  }

  /* =====================================================================
     ONE OF THESE — a multiple-choice card that waits for the right answer, and explains */
  async function chooseOne(o) {
    let miss = 0, tries = 0;
    const order = o.keep ? o.opts.map((x, i) => i) : shuffle(o.opts.map((x, i) => i));
    for (; ;) {
      const pick = await new Promise(res => {
        const c = E.sheet(`${o.lab ? `<p class="lab">${esc(o.lab)}${o.sub ? ` <span>${esc(o.sub)}</span>` : ''}</p>` : ''}${o.h ? `<p class="h">${esc(E.fmt(o.h))}</p>` : ''}${o.html || ''}
          ${o.ms ? '<div class="meter"><i id="tm" style="width:100%"></i></div>' : ''}
          <div class="opts" data-ans="${o.a}">${order.map(i => `<button data-k="${i}" ${o.da ? 'lang="da"' : ''}>${esc(E.fmt(o.opts[i]))}</button>`).join('')}</div>`, { lift: o.lift == null ? 1 : o.lift });
        if (o.say) setTimeout(() => E.speak(o.say, o.who), 250);
        const tm = o.ms ? timer(c.querySelector('#tm'), o.ms) : null;
        if (tm) tm.p.then(() => res('time'));
        c.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { if (tm) tm.stop(); res(+b.dataset.k); });
      });
      if (pick === o.a) { SFX.tick(); if (o.why) { const c = E.sheet(`<p class="center">✓ <span lang="da">${fog(o.opts[o.a])}</span></p><p class="center hint">${esc(E.fmt(o.why))}</p><div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: o.lift == null ? 1 : o.lift }); await tapWait(c, '#nx'); } break; }
      miss++; tries++; SFX.bad();
      const tip = pick === 'time' ? (o.slow || 'Too slow! Try again, a little faster.') : ((o.tips && o.tips[pick]) || o.tip || 'Read it again, slowly.');
      const c = E.sheet(`<p class="lab">${pick === 'time' ? 'For langsomt' : 'Ikke helt'} <span>${pick === 'time' ? 'too slow' : 'not quite'}</span></p><p>${esc(E.fmt(tip))}</p>${tries >= 2 && o.why ? `<p class="fb">${esc(E.fmt(o.why))}</p>` : ''}<div class="row end"><button class="go" id="nx">Prøv igen ▸</button></div>`, { lift: o.lift == null ? 1 : o.lift });
      await tapWait(c, '#nx');
    }
    E.closeSheet();
    return { miss };
  }

  /* =====================================================================
     NOTEBOOK — the hero's own notebook. Someone answers; you write down what they said */
  function noteHtml(book) {
    return `<div class="note"><p class="nt" lang="da">${fog(book.title)}</p>${book.rows.map(r => `<div class="nr ${r.v ? 'on' : ''}"><span lang="da">${fog(r.l)}</span><b lang="da">${r.v ? fog(r.v) : '…'}</b></div>`).join('')}</div>`;
  }
  async function noteFill(book, row, o) {
    const res = await chooseOne({ lab: 'Notesbog', sub: 'notebook', html: noteHtml(book) + (o.line ? `<div class="memory"><div class="who">${esc(E.fmt(o.who || ''))}</div><p class="da" lang="da">${fog(o.line)}</p></div>` : '') + `<p class="hint">${esc(E.fmt(o.q))}</p>`, opts: o.opts, a: o.a, da: true, why: o.why, tips: o.tips, tip: o.tip });
    book.rows[row].v = o.opts[o.a];
    const c = E.sheet(`<p class="lab">Notesbog <span>notebook</span></p>${noteHtml(book)}<div class="row end"><button class="go" id="nx">▸</button></div>`, { lift: 1 });
    SFX.chime(); await tapWait(c, '#nx'); E.closeSheet();
    return res;
  }

  /* =====================================================================
     WRITE — a text with a live checklist; the button opens when every line is ticked */
  function writeTask(o) {
    return new Promise(res => {
      const mic = !!(window.SpeechRecognition || window.webkitSpeechRecognition) && E.S().set.mic;
      const c = E.sheet(`<p class="lab">${esc(o.lab)} <span>${esc(o.sub || '')}</span></p>
        <p class="hint">${o.hint || ''}</p>
        <textarea class="write" id="tx" lang="da" autocapitalize="sentences" spellcheck="false" placeholder="${esc(o.ph || '')}"></textarea>
        <ul class="checks" id="ck"></ul><p class="fb bad" id="warn" hidden></p>
        <div class="tools2">${mic ? '<button class="ghost" id="mc">🎙 Dikter</button>' : ''}<button class="ghost" id="hp">? Hjælp</button></div>
        <div id="model" hidden data-ans="${esc(o.model)}"></div>
        <div class="row end"><button class="go" id="sc" disabled>${esc(o.btn || 'Færdig ▸')}</button></div>`, { lift: 0 });
      const tx = c.querySelector('#tx'), ck = c.querySelector('#ck'), sc = c.querySelector('#sc'), warn = c.querySelector('#warn');
      const check = () => {
        const raw = tx.value, low = ' ' + E.norm(raw) + ' ';
        const L = o.checks.map(k => [!!k.f(raw, low), k.t(raw, low)]);
        ck.innerHTML = L.map(([ok, t]) => `<li class="${ok ? 'ok' : ''}">${esc(t)}</li>`).join('');
        const w = o.warn ? o.warn(raw, low) : ''; warn.hidden = !w; warn.innerHTML = w || '';
        sc.disabled = !L.every(x => x[0]);
      };
      tx.oninput = check; check();
      c.querySelector('#hp').onclick = () => { const m = c.querySelector('#model'); m.hidden = !m.hidden; m.innerHTML = `<div class="memory"><div class="who">${esc(o.modelWho || 'An example')}</div><p class="da" lang="da" style="font-size:1.02em">${fog(o.model)}</p></div>`; };
      const mc = c.querySelector('#mc');
      if (mc) mc.onclick = async () => { const lab = mc.innerHTML; const alts = await E.hear(x => { mc.textContent = E.MICL[x]; }); mc.innerHTML = lab; if (alts && alts[0]) { let t = alts[0].trim(); t = t.charAt(0).toUpperCase() + t.slice(1); tx.value = (tx.value.trim() ? tx.value.trim() + ' ' : '') + t + '.'; check(); } };
      sc.onclick = () => { E.closeSheet(); res(tx.value.trim()); };
    });
  }

  /* a percentage on the crystal, ticking up */
  async function crystalMeter(from, to, label) {
    const c = E.sheet(`<div class="cmeter"><p class="lab" style="justify-content:center">${esc(label || 'Kernen')}</p><div class="mbar"><i id="mb" style="width:${from}%"></i></div><p class="mnum" id="mn">${from} %</p></div>`, { mid: true, dim: true });
    const mb = c.querySelector('#mb'), mn = c.querySelector('#mn');
    for (let v = from; v <= to; v++) { mb.style.width = v + '%'; mn.textContent = v + ' %'; if (v > from) SFX.heart(); await E.wait(420); }
    await E.wait(1200);
    E.closeSheet();
  }

  Object.assign(window.Games, { sortCards, gapChoice, placeWord, stressTap, chooseOne, noteFill, noteHtml, writeTask, crystalMeter });
})();
