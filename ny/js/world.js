/* Dumpet på Måne Syv · walking through the world: input, camera, companions, word-lights */
(function () {
  'use strict';
  const E = window.E, A = window.Art, G = E.G, $ = E.$;
  const WD = { L: 0, R: 0, J: 0, vy: 0, py: 0, on: false, to: null, min: -1e9, done: null, lastT: 0, speed: 150 };
  const hero = () => E.actor('hero');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- the pad: ◀ ▶ to walk, ▲ to jump */
  function bindHold(el, key) {
    const on = e => { e.preventDefault(); E.audioStart(); WD[key] = 1; el.classList.add('down'); };
    const off = e => { WD[key] = 0; el.classList.remove('down'); };
    el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
  function initPad() {
    bindHold($('#pL'), 'L'); bindHold($('#pR'), 'R');
    $('#pJ').addEventListener('pointerdown', e => { e.preventDefault(); E.audioStart(); WD.J = 1; });
    addEventListener('keydown', e => { if (!WD.on || e.target.closest('input,textarea')) return; if (e.key === 'ArrowLeft') WD.L = 1; else if (e.key === 'ArrowRight') WD.R = 1; else if (e.key === 'ArrowUp' || e.key === ' ') { WD.J = 1; e.preventDefault(); } });
    addEventListener('keyup', e => { if (e.key === 'ArrowLeft') WD.L = 0; else if (e.key === 'ArrowRight') WD.R = 0; });
  }
  function showPad(on, hint) {
    WD.on = on; $('#pad').hidden = !on; if (!on) { WD.L = WD.R = WD.J = 0; }
    const h = $('#goal'); h.hidden = !on || !hint; if (hint) h.textContent = hint;
  }
  const modalOpen = () => !$('#modal').hidden;

  /* ---------- walk until you reach a place; resolves there */
  function explore(o) {
    return new Promise(res => {
      E.hidePanel(); E.closeSheet();
      const h = hero();
      WD.to = o.to; WD.left = !!(h && o.to < h.wx); WD.min = o.min != null ? o.min : WD.left ? o.to : (h ? h.wx - 600 : -1e9); WD.max = o.max != null ? o.max : WD.left ? h.wx + 200 : o.to; WD.done = res; WD.light = o.light;
      if (o.lights) { const got = E.S().got || {}; G.lights = o.lights.map(([x, hh, word, en]) => ({ x, h: hh, word, en, got: got[word] ? -99 : 0 })); }
      showPad(true, o.hint);
      if (h && (WD.left ? h.wx <= o.to + 1 : h.wx >= o.to - 1)) finish();
    });
  }
  /* ---------- find a door: walk freely, and say “her” at the one you think is right; resolves with its id */
  function find(o) {
    return new Promise(res => {
      E.hidePanel(); E.closeSheet();
      WD.to = null; WD.left = false; WD.min = o.min != null ? o.min : -1e9; WD.max = o.max != null ? o.max : 1e9; WD.done = null;
      WD.find = { doors: o.doors, want: o.want, res, near: null, mark: o.mark };
      if (o.lights) { const got = E.S().got || {}; G.lights = o.lights.map(([x, hh, word, en]) => ({ x, h: hh, word, en, got: got[word] ? -99 : 0 })); }
      showPad(true, o.hint);
      const b = $('#here');
      b.onclick = e => { e.stopPropagation(); const F = WD.find; if (!F || !F.near) return; WD.find = null; b.hidden = true; $('#goal').style.visibility = ''; showPad(false); G.pin = null; E.SFX.tick(); F.res(F.near.id); };
    });
  }
  function finish() { const d = WD.done; WD.done = null; WD.to = null; showPad(false); G.lights = (G.lights || []).filter(L => L.got > 0); if (d) d(); }

  /* ---------- a scripted walk (anyone with a world x) */
  function walk(id, to, speed) {
    const a = E.actor(id); if (!a) return Promise.resolve();
    const d = Math.abs(to - a.wx); if (d < 1) return Promise.resolve();
    return E.tween(a, 'wx', to, d / (speed || 120), 'lin');
  }

  /* ---------- each frame */
  let pop = null;
  function caught(L, t) {
    L.got = t; const S = E.S(); S.got = S.got || {}; S.got[L.word] = 1;
    E.learn(L.word); E.gainPower(1); E.SFX.chime(); E.speak(L.word);
    const el = $('#wordpop'); el.innerHTML = `<b lang="da">${E.fog(L.word)}</b><span>${E.esc(L.en || E.GLOSS[E.norm(L.word)] || '')}</span>`; el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(pop); pop = setTimeout(() => { el.hidden = true; }, 2600);
    E.save();
  }
  function tick(t) {
    const dt = Math.min(0.05, t - (WD.lastT || t)); WD.lastT = t;
    if (G.scene !== 'world' && G.scene !== 'town') return;
    const M = A.mapOf(G);
    const h = hero(); if (!h) { if (G.titleDrift && G.view) G.view.x += dt * 14; return; }
    const frozen = modalOpen() || !$('#sheet').hidden;
    // your own feet
    if (WD.on && !frozen) {
      const v = WD.R - WD.L;
      if (v) { h.wx = clamp(h.wx + v * WD.speed * dt, WD.min, WD.max != null ? WD.max : 1e9); h.flip = v < 0; }
      if (WD.J && WD.py <= 0.5) { WD.vy = 430; E.tone(520, 0.12, 0.03, 'sine', 0, 780); }
      WD.J = 0;
      if (WD.to != null && (WD.left ? h.wx <= WD.to + 1 : h.wx >= WD.to - 1)) finish();
      // remember where you are, so a closed app reopens on the same spot of the path
      const S = E.S(); if (v && S.cp && t - (WD.savedT || 0) > 0.8) { WD.savedT = t; S.cp.at = Math.round(h.wx); S.cp.atN = S.cp.r.length; E.save(); }
    }
    // looking for a door: the button appears when you stand at one
    if (WD.find) {
      const F = WD.find; let near = null, best = 44;
      F.doors.forEach(d => { const dd = Math.abs(h.wx - d.x); if (dd < best) { best = dd; near = d; } });
      F.near = near; const b = $('#here');
      if (near && !frozen) { b.hidden = false; b.innerHTML = `${near.label ? E.esc(near.label) + ' · ' : ''}Her ▸`; } else b.hidden = true;
      $('#goal').style.visibility = b.hidden ? '' : 'hidden';
      G.pin = F.mark ? F.doors.find(d => d.id === F.want) : null;
    }
    if (WD.py > 0 || WD.vy > 0) { WD.vy -= 1300 * dt; WD.py = Math.max(0, WD.py + WD.vy * dt); if (WD.py <= 0) WD.vy = 0; }
    if (WD.on || WD.py > 0) h.wy = -WD.py;
    // word-lights you touch are yours
    (G.lights || []).forEach(L => { if (!L.got && Math.abs(h.wx - L.x) < 26 && L.h <= 112 + WD.py) caught(L, t); });
    // walking, for everyone in the world
    for (const a of G.cast) {
      if (a.wx == null) continue;
      if (a.follow) {
        const lead = E.actor(a.follow); if (lead) {
          const want = lead.wx - (a.gap || 62) * (lead.flip ? -1 : 1), d = want - a.wx;
          if (Math.abs(d) > 10) a.wx += Math.sign(d) * Math.min(Math.abs(d), Math.max(60, Math.abs(d) * 2.4) * dt);
        }
      }
      const dx = a.wx - (a._lx == null ? a.wx : a._lx); a._lx = a.wx;
      const moving = Math.abs(dx) > 0.04 && dt > 0;
      a._walk = (a._walk || 0) + ((moving ? 1 : 0) - (a._walk || 0)) * Math.min(1, dt * 9);
      a._step = (a._step || 0) + Math.abs(dx) * (a.k === 'deer' ? 0.08 : 0.085);
      if (a.o) { a.o.walk = a._walk < 0.03 ? 0 : a._walk; a.o.step = a._step; }
      if (moving && a.autoFlip !== false && Math.abs(dx) > 0.2) a.flip = a.k === 'deer' ? dx > 0 : dx < 0;
      // a face that turns toward whoever is talking
      if (!moving && a.look) { const o2 = E.actor(a.look); if (o2) a.flip = a.k === 'deer' ? o2.wx > a.wx : o2.wx < a.wx; }
    }
    // the name of the place you are in
    if (G.scene === 'town') { const zt = M.zoneAt(h.wx); if (zt.id !== WD.zone) { WD.zone = zt.id; E.where('Kronby · ' + zt.name); } }
    else { const zn = A.zoneAt(h.wx).id; if (zn !== WD.zone) { WD.zone = zn; const N = { lake: 'Søen', thicket: 'Den mørke skov', wreck: 'Vraget', woods: 'Skoven', meadow: 'Engen', edge: 'Skovkanten', ravine: 'Kløften', stones: 'Klangstenene', kronby: 'Kronby' }; E.where('Måne Syv · ' + (N[zn] || '')); } }
    // the camera
    const V = G.view || (G.view = { x: h.wx, z: 1 });
    const tx = G.camX != null ? G.camX : h.wx + (h.flip ? -36 : 36);
    V.x += (tx - V.x) * Math.min(1, dt * (G.camX != null ? 2.2 : 3.2));
    const tz = G.camZ != null ? G.camZ : M.zoneMix(V.x, 'zoom');
    V.z += (tz - V.z) * Math.min(1, dt * 1.5);
    G.feet = A.GY + 64;
  }

  /* ---------- enter the world at a place */
  function enter(o) {
    G.scene = o.map === 'town' ? 'town' : 'world'; G.tod = o.tod || 'day'; G.dusk = o.dusk || 0; G.hallOpen = o.hallOpen || 0; G.gateOpen = o.gateOpen || 0; G.bookOpen = 0; G.chestOpen = 0; G.rain = o.rain || 0; G.blackout = o.blackout || 0; G.drones = null; G.pin = null; G.drone = null; WD.zone = null; G.night = !!o.night; G.glow = o.night ? 1 : null; G.camX = null; G.camZ = null; G.lights = [];
    G.feet = A.GY + 64; G.maxLift = 220;
    E.setCast(o.cast || []);
    const h = hero(); G.view = { x: o.view != null ? o.view : h ? h.wx + 36 : 0, z: A.mapOf(G).zoneMix(h ? h.wx : 0, 'zoom') };
    WD.py = 0; WD.vy = 0;
    if (o.where) E.where(o.where);
  }

  initPad();
  E.onTick(tick);
  window.World = { explore, find, walk, enter, WD, finish };
})();
