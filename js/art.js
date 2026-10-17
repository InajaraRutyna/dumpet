/* Dumpet på Måne Syv · art: everything is drawn in code */
(function () {
  const W = 390, H = 844;
  const TAU = Math.PI * 2;
  const DPR = Math.min(2.5, window.devicePixelRatio || 1);

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  function off(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.round(w * DPR); c.height = Math.round(h * DPR);
    const x = c.getContext('2d'); x.scale(DPR, DPR);
    return [c, x];
  }
  function lg(ctx, x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  }
  function rg(ctx, x, y, r0, r1, stops) {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  }
  function hillPath(ctx, base, amp, freq, ph, x0 = -30, x1 = W + 30, bottom = H + 10) {
    ctx.beginPath(); ctx.moveTo(x0, bottom);
    for (let x = x0; x <= x1; x += 5) {
      const y = base + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 2.3 + ph * 1.7) * amp * 0.45
        + Math.sin(x * freq * 5.3 + ph * 0.3) * amp * 0.16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x1, bottom); ctx.closePath();
  }
  function blobPath(ctx, cx, cy, r, R, n = 9, j = 0.22, sy = 1) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + R() * 0.3;
      const rr = r * (1 - j + R() * j * 2);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sy]);
    }
    ctx.beginPath();
    const m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let s = m(pts[n - 1], pts[0]); ctx.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], mm = m(p, q);
      ctx.quadraticCurveTo(p[0], p[1], mm[0], mm[1]);
    }
    ctx.closePath();
  }
  // A clump of foliage: dark base blobs, lit blobs offset toward the light.
  function foliage(ctx, cx, cy, r, R, cols, light = [0.6, -0.8], count = 7, sy = 0.85) {
    const [dark, mid, lit, edge] = cols;
    for (let i = 0; i < count; i++) {
      const a = R() * TAU, d = R() * r * 0.55;
      blobPath(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d * sy, r * (0.45 + R() * 0.25), R, 9, 0.22, sy);
      ctx.fillStyle = dark; ctx.fill();
    }
    for (let i = 0; i < count; i++) {
      const a = R() * TAU, d = R() * r * 0.45;
      const x = cx + Math.cos(a) * d + light[0] * r * 0.18, y = cy + Math.sin(a) * d * sy + light[1] * r * 0.18;
      blobPath(ctx, x, y, r * (0.32 + R() * 0.18), R, 8, 0.25, sy);
      ctx.fillStyle = mid; ctx.fill();
    }
    if (lit) for (let i = 0; i < Math.ceil(count * 0.7); i++) {
      const a = R() * TAU, d = R() * r * 0.35;
      const x = cx + Math.cos(a) * d + light[0] * r * 0.38, y = cy + Math.sin(a) * d * sy + light[1] * r * 0.38;
      blobPath(ctx, x, y, r * (0.14 + R() * 0.12), R, 7, 0.3, sy);
      ctx.fillStyle = lit; ctx.fill();
    }
    if (edge) for (let i = 0; i < count * 2; i++) {
      const a = -Math.PI / 2 + (R() - 0.3) * 1.9;
      ctx.fillStyle = edge;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.66, 1 + R() * 2.2, 0, TAU); ctx.fill();
    }
  }
  function trunk(ctx, x, yTop, yBot, w0, w1, R, cols, lean = 0) {
    const [base, dark, lit] = cols;
    ctx.beginPath();
    ctx.moveTo(x - w1 / 2 - 8, yBot);
    ctx.bezierCurveTo(x - w1 / 2, yBot - 30, x - w0 / 2 + lean * 0.5, yTop + 60, x - w0 / 2 + lean, yTop);
    ctx.lineTo(x + w0 / 2 + lean, yTop);
    ctx.bezierCurveTo(x + w0 / 2 + lean * 0.5, yTop + 60, x + w1 / 2, yBot - 30, x + w1 / 2 + 10, yBot);
    ctx.closePath();
    ctx.fillStyle = lg(ctx, x - w1 / 2, 0, x + w1 / 2, 0, [[0, dark], [0.55, base], [1, lit]]);
    ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = dark; ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const bx = x - w1 / 2 + R() * w1, by = yTop + R() * (yBot - yTop);
      ctx.globalAlpha = 0.35 + R() * 0.3; ctx.lineWidth = 1 + R() * 1.6;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + (R() - 0.5) * 6, by + 18, bx + (R() - 0.5) * 4, by + 30 + R() * 30); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function fern(ctx, x, y, len, ang, sway, col, lw = 2, leaf = 9, dir = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang + sway);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, bend = Math.sin(t * 1.6) * len * 0.35 * dir;
      pts.push([bend, -t * len]);
    }
    ctx.beginPath(); ctx.moveTo(0, 0); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.stroke();
    for (let i = 1; i < 14; i++) {
      const [px, py] = pts[i], t = i / 14, L = leaf * (1 - t * 0.75);
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + s * L * 0.6, py - L * 0.2, px + s * L, py - L * 0.55);
        ctx.quadraticCurveTo(px + s * L * 0.5, py + 1, px, py + 1.5); ctx.fill();
      }
    }
    ctx.restore();
  }
  function grassTuft(ctx, x, y, h, sway, col, n = 5, R) {
    ctx.strokeStyle = col; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const dx = (i - n / 2) * 2.2, hh = h * (0.6 + (R ? R() : 0.5) * 0.6);
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(x + dx, y);
      ctx.quadraticCurveTo(x + dx + sway * 0.4, y - hh * 0.6, x + dx + sway + (i - n / 2) * 2.5, y - hh); ctx.stroke();
    }
  }

  /* ------------------------------------------------------------ the heroine */

  function capsule(ctx, x1, y1, x2, y2, r1, r2) {
    const a = Math.atan2(y2 - y1, x2 - x1), n = a + Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x1, y1, r1, n, n + Math.PI);
    ctx.arc(x2, y2, r2, n + Math.PI, n + TAU);
    ctx.closePath();
  }

  function drawShape(ctx, o, fn, fill, shade) {
    if (o.mode === 'paper') {
      ctx.save(); ctx.shadowColor = 'rgba(70,45,20,.38)'; ctx.shadowBlur = 3; ctx.shadowOffsetX = 1.6; ctx.shadowOffsetY = 2.4;
      fn(); ctx.fillStyle = fill; ctx.fill(); ctx.restore(); return;
    }
    if (o.rim) {
      ctx.save(); ctx.translate(o.rimDx, o.rimDy); fn(); ctx.fillStyle = o.rim;
      if (o.rimGlow) { ctx.shadowColor = o.rim; ctx.shadowBlur = o.rimGlow; }
      ctx.fill(); ctx.restore();
    }
    fn(); ctx.fillStyle = fill; ctx.fill();
    if (shade) { ctx.save(); fn(); ctx.clip(); ctx.fillStyle = shade; ctx.beginPath(); ctx.rect(-300, -400, 300 + (o.shadeX || -2), 500); ctx.fill(); ctx.restore(); }
    if (o.outline) { fn(); ctx.strokeStyle = o.outline; ctx.lineWidth = o.olw || 1.4; ctx.lineJoin = 'round'; ctx.stroke(); }
  }

  /* ------------------------------------------------------------ the forest creature */

  function ship(ctx, x, y, s, o, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.08 + Math.sin(t * 1.3) * 0.03);
    if (o.beam) {
      ctx.save(); ctx.globalCompositeOperation = o.beamOp || 'lighter';
      ctx.fillStyle = lg(ctx, 0, 0, 0, 160, [[0, o.beam], [1, 'rgba(0,0,0,0)']]);
      ctx.beginPath(); ctx.moveTo(-14, 4); ctx.lineTo(14, 4); ctx.lineTo(46, 170); ctx.lineTo(-46, 170); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    const shape = (fn, fill, shade) => drawShape(ctx, o, fn, fill, shade);
    shape(() => { ctx.beginPath(); ctx.ellipse(0, -6, 15, 12, 0, Math.PI, TAU); ctx.closePath(); }, o.dome);
    shape(() => { ctx.beginPath(); ctx.ellipse(0, 0, 44, 10, 0, 0, TAU); }, o.hull, o.hullShade);
    shape(() => { ctx.beginPath(); ctx.ellipse(0, 3, 26, 5, 0, 0, TAU); }, o.under);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + t * 1.5, lx = Math.cos(a) * 34, ly = Math.sin(a) * 6.5;
      if (Math.sin(a) < -0.2) continue;
      ctx.save(); ctx.shadowColor = o.light; ctx.shadowBlur = 8; ctx.fillStyle = o.light;
      ctx.beginPath(); ctx.arc(lx, ly, 2, 0, TAU); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------ particles */

  function motes(R, n, opts) {
    const a = [];
    for (let i = 0; i < n; i++) a.push({ x: R() * W, y: opts.y0 + R() * (opts.y1 - opts.y0), r: opts.r0 + R() * (opts.r1 - opts.r0), ph: R() * TAU, sp: 0.3 + R() * 0.7 });
    return a;
  }

  function drawMotes(ctx, list, t, col, glow, drift = [6, -10], op = 'lighter', tw = true) {
    ctx.save(); ctx.globalCompositeOperation = op;
    for (const m of list) {
      const x = (m.x + Math.sin(t * m.sp + m.ph) * drift[0] + t * 4 * m.sp) % (W + 20) - 10;
      const y = m.y + Math.cos(t * m.sp * 0.8 + m.ph) * 8 + ((t * drift[1] * m.sp) % 60);
      const a = tw ? 0.35 + 0.65 * Math.max(0, Math.sin(t * 2 * m.sp + m.ph)) : 1;
      ctx.globalAlpha = a;
      ctx.fillStyle = rg(ctx, x, y, 0, m.r * glow, [[0, col], [0.35, col], [1, 'rgba(0,0,0,0)']]);
      ctx.beginPath(); ctx.arc(x, y, m.r * glow, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------ the spell orb over the palm */

  function orb(ctx, x, y, t, o) {
    const p = 0.75 + 0.25 * Math.sin(t * 3);
    const ph = (t % 4) / 4;
    if (ph < 0.45) {
      const k = ph / 0.45, e = 1 - Math.pow(1 - k, 3), r = 24 + e * 190;
      ctx.save();
      if (o.mode === 'paper') {
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * TAU + 0.3; ctx.save(); ctx.translate(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); ctx.rotate(a + k * 3);
          ctx.globalAlpha = 1 - k * k; ctx.fillStyle = i % 2 ? '#e9b44c' : '#9cbf4a';
          ctx.beginPath(); for (let j = 0; j < 10; j++) { const b = (j / 10) * TAU, rr = j % 2 ? 3.8 : 9; ctx.lineTo(Math.cos(b) * rr, Math.sin(b) * rr); } ctx.closePath(); ctx.fill(); ctx.restore();
        }
      } else {
        ctx.globalCompositeOperation = o.burstOp || 'lighter';
        ctx.globalAlpha = (1 - k * k) * 0.9; ctx.strokeStyle = o.burst || o.ring; ctx.lineWidth = 0.8 + 3.2 * (1 - k);
        ctx.shadowColor = o.ring; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.stroke();
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * TAU + i * 0.37, r0 = r * (0.35 + (i % 3) * 0.12), r1 = r0 + 10 + (i % 4) * 6;
          ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke();
        }
      }
      ctx.restore();
    }
    ctx.save();
    if (o.mode !== 'paper') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rg(ctx, x, y, 0, 70 * p, [[0, o.halo], [1, 'rgba(0,0,0,0)']]);
      ctx.beginPath(); ctx.arc(x, y, 70 * p, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    // rune ring
    ctx.translate(x, y); ctx.rotate(t * 0.7);
    ctx.strokeStyle = o.ring; ctx.lineWidth = 1.2;
    if (o.mode !== 'paper') { ctx.shadowColor = o.ring; ctx.shadowBlur = 8; }
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 20, 0, 0, TAU); ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU; ctx.save(); ctx.rotate(a); ctx.translate(26, 0);
      ctx.beginPath(); ctx.moveTo(-2, -3); ctx.lineTo(2, 0); ctx.lineTo(-2, 3); ctx.stroke(); ctx.restore();
    }
    ctx.rotate(-t * 1.6);
    ctx.fillStyle = o.core; ctx.shadowColor = o.ring; ctx.shadowBlur = o.mode === 'paper' ? 0 : 18;
    ctx.beginPath(); ctx.arc(0, 0, 8.5 * p, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function wordGlyph(ctx, x, y, word, t, o) {
    const ph = (t % 4) / 4, pop = ph < 0.12 ? 1 + 0.35 * Math.sin(ph / 0.12 * Math.PI) : 1;
    ctx.save(); ctx.textAlign = 'center'; ctx.font = o.font;
    ctx.translate(x, y + Math.sin(t * 1.2) * 3); ctx.scale(pop, pop);
    ctx.globalAlpha = 0.9 + 0.1 * Math.sin(t * 1.7);
    if (o.stroke) { ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.strokeStyle = o.stroke; ctx.strokeText(word, 0, 0); }
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 16; }
    ctx.fillStyle = o.color; ctx.fillText(word, 0, 0);
    ctx.restore();
  }

  /* ------------------------------------------------------------ dialogue panel */

  function wrap(ctx, text, maxW) {
    const words = text.split(' '), lines = []; let cur = '';
    for (const w of words) { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > maxW && cur) { lines.push(cur); cur = w; } else cur = n; }
    if (cur) lines.push(cur); return lines;
  }

  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

  /* =================================================================== STYLES */

  function limbPath(ctx, pts) {
    const n = pts.length, Lf = [], Rt = [], nrm = [];
    for (let i = 0; i < n; i++) {
      const [x, y, r] = pts[i];
      const a = i === 0 ? pts[0] : pts[i - 1], b = i === n - 1 ? pts[n - 1] : pts[i + 1];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      nrm.push(Math.atan2(ny, nx)); Lf.push([x + nx * r, y + ny * r]); Rt.push([x - nx * r, y - ny * r]);
    }
    ctx.beginPath(); ctx.moveTo(Lf[0][0], Lf[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(Lf[i][0], Lf[i][1]);
    ctx.arc(pts[n - 1][0], pts[n - 1][1], pts[n - 1][2], nrm[n - 1], nrm[n - 1] - Math.PI, true);
    for (let i = n - 2; i >= 0; i--) ctx.lineTo(Rt[i][0], Rt[i][1]);
    ctx.arc(pts[0][0], pts[0][1], pts[0][2], nrm[0] + Math.PI, nrm[0], true);
    ctx.closePath();
  }
  /* ---------------- gear for the long-coat outfits (drawn by adult() at fixed points) */

  function glowStroke(ctx, o, col, w, blur) {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = blur; }
  }

  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); }

  // behind everything: ponytail, braid (back part), hood

  function gearBehind(ctx, o, t, br, wind, sh) {
    if (o.pack) {
      sh(() => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-27, -162 + br, 14, 36, 3) : ctx.rect(-27, -162 + br, 14, 36); }, o.pack, o.packShade);
      ctx.save(); ctx.strokeStyle = o.packLine || 'rgba(0,0,0,.35)'; ctx.lineWidth = 0.8; ctx.strokeRect(-25, -156 + br, 9, 12); ctx.restore();
      ctx.save(); ctx.strokeStyle = o.antenna || '#2a2a22'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-24, -162 + br); ctx.lineTo(-27, -199 + br); ctx.stroke();
      const blink = (t % 1.6) < 0.8 ? 1 : 0.25;
      ctx.fillStyle = o.glowCore; ctx.globalAlpha = blink; if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 8; }
      ctx.beginPath(); ctx.arc(-27, -200 + br, 1.6, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillRect(-25.4, -140 + br, 9.6, 1.6); ctx.restore();
    }
    if (o.hairStyle === 'tail') {
      sh(() => { ctx.beginPath(); ctx.moveTo(-6, -203 + br); ctx.bezierCurveTo(-16, -206 + br, -22 + wind * 0.4, -194, -23 + wind * 0.8, -174); ctx.bezierCurveTo(-22 + wind, -166, -18 + wind, -162, -16 + wind * 0.8, -160); ctx.bezierCurveTo(-17, -172, -12, -188 + br, -3, -198 + br); ctx.closePath(); }, o.hair);
      sh(() => { ctx.beginPath(); ctx.ellipse(-6.5, -202 + br, 2.6, 2, 0.4, 0, TAU); }, o.band || o.belt);
    }
    if (o.hood) {
      sh(() => { ctx.beginPath(); ctx.moveTo(-18, -160 + br); ctx.bezierCurveTo(-22, -174 + br, -16, -186 + br, -6, -183 + br); ctx.bezierCurveTo(2, -180 + br, 8, -172 + br, 12, -163 + br); ctx.quadraticCurveTo(0, -160 + br, -18, -160 + br); ctx.closePath(); }, o.hood, o.coatShade);
    }
  }

  // on the lowered arm: wrist gauntlet + holo screen

  function gearBackArm(ctx, o, t, br, sh) {
    if (!o.gauntlet) return;
    sh(() => limbPath(ctx, [[-21, -121 + br, 4.4], [-18.8, -99.5 + br, 3.9]]), o.gauntlet, o.gauntletShade);
    ctx.save(); glowStroke(ctx, o, o.glowLine || o.vein, 1.2, 6);
    poly(ctx, [[-22.4, -117 + br], [-21, -104 + br]]); ctx.stroke(); ctx.restore();
    if (o.holoWrist) {
      const p = 0.7 + 0.3 * Math.sin(t * 2.4);
      ctx.save(); ctx.globalAlpha = 0.95 * p;
      ctx.fillStyle = o.holoFill || 'rgba(60,220,180,.32)';
      ctx.strokeStyle = o.holoLine || o.glowLine || o.vein; ctx.lineWidth = 0.9;
      if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 6; }
      // beam from the wrist
      ctx.beginPath(); ctx.moveTo(-23.5, -112 + br); ctx.lineTo(-40, -128 + br); ctx.lineTo(-40, -112 + br); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.rect(-55, -134 + br, 18, 22); ctx.fill(); ctx.stroke();
      // a tiny map on the screen
      ctx.beginPath(); ctx.moveTo(-52, -118 + br); ctx.lineTo(-48, -124 + br); ctx.lineTo(-44, -121 + br); ctx.lineTo(-40, -129 + br); ctx.stroke();
      ctx.beginPath(); ctx.arc(-44, -121 + br, 1.2, 0, TAU); ctx.stroke();
      const sy = -134 + ((t * 14) % 22);
      ctx.globalAlpha = 0.5 * p; ctx.beginPath(); ctx.moveTo(-55, sy + br); ctx.lineTo(-37, sy + br); ctx.stroke();
      ctx.restore();
    }
  }

  // on the coat: panels, closures, harness, vials, moss, glowing hem

  function gearCoat(ctx, o, t, br, wind, sh) {
    const pulse = 0.6 + 0.4 * Math.sin(t * 2.2);
    if (o.panels) {
      ctx.save(); ctx.strokeStyle = o.panels; ctx.lineWidth = 0.8;
      poly(ctx, [[-20.5, -80], [-8.5, -79]]); ctx.stroke(); poly(ctx, [[19, -80], [8.5, -79]]); ctx.stroke();
      ctx.strokeRect(-20, -108, 8, 9); ctx.strokeRect(10.5, -108, 8, 9);
      poly(ctx, [[-14.5, -150], [-12.5, -127]]); ctx.stroke(); poly(ctx, [[14.5, -150], [12.5, -127]]); ctx.stroke();
      ctx.restore();
    }
    if (o.asym) {
      sh(() => { poly(ctx, [[-8.5, -163 + br], [16, -163.5 + br], [20, -155 + br], [14, -121], [3.5, -121]]); ctx.closePath(); }, o.coat, o.coatShade);
      ctx.save(); glowStroke(ctx, o, o.glowLine || o.vein, 1.2, 8); ctx.globalAlpha = 0.75 + 0.25 * pulse;
      poly(ctx, [[-8.5, -163 + br], [3.5, -121]]); ctx.stroke();
      ctx.fillStyle = o.glowCore;
      [[-5.5, -152], [-2.5, -141], [0.5, -130]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x + 2.6, y + br * 0.6, 0.9, 0, TAU); ctx.fill(); });
      ctx.restore();
    }
    if (o.hemLight) {
      ctx.save(); glowStroke(ctx, o, o.hemLight, 1.1, 8); ctx.globalAlpha = 0.7 + 0.3 * pulse;
      poly(ctx, [[-7, -41], [-17, -40.5], [-28 + wind, -42]]); ctx.stroke();
      poly(ctx, [[7, -42], [16, -41.5], [26 + wind * 0.6, -43]]); ctx.stroke();
      if (!o.asym) { poly(ctx, [[-5.5, -153 + br], [-3.5, -121.5]]); ctx.stroke(); poly(ctx, [[5.5, -153 + br], [3.5, -121.5]]); ctx.stroke(); }
      poly(ctx, [[-3.5, -117], [-7, -41]]); ctx.stroke(); poly(ctx, [[3.5, -117], [7, -42]]); ctx.stroke();
      ctx.restore();
    }
    if (o.moss) {
      const R = rng(31);
      ctx.save();
      // circuit roots climbing the coat from the hem
      glowStroke(ctx, o, o.glowLine || o.vein, 0.9, 6); ctx.globalAlpha = 0.65 + 0.35 * pulse; ctx.fillStyle = o.glowLine || o.vein;
      const traces = [[[-20, -42], [-20, -56], [-16, -60], [-16, -74]], [[-12, -41], [-12, -50], [-9, -53]], [[14, -42], [14, -54], [11, -57], [11, -66]], [[21, -43], [21, -51], [18, -54]], [[-16, -60], [-21, -64]]];
      traces.forEach(tr => { poly(ctx, tr); ctx.stroke(); const e = tr[tr.length - 1]; ctx.beginPath(); ctx.arc(e[0], e[1], 0.9, 0, TAU); ctx.fill(); });
      ctx.restore();
      ctx.save();
      const clump = (cx, cy, n, r) => { for (let i = 0; i < n; i++) { ctx.fillStyle = i % 3 ? o.moss : o.mossLight; ctx.beginPath(); ctx.arc(cx + (R() - 0.5) * r * 2, cy + (R() - 0.5) * r, 1.2 + R() * 1.8, 0, TAU); ctx.fill(); } };
      clump(-18, -44, 14, 7); clump(17, -45, 12, 6); clump(-15, -160 + br, 10, 5); clump(-21, -128 + br, 6, 3);
      ctx.restore();
    }
    if (o.harness) {
      sh(() => { poly(ctx, [[-14, -163 + br], [-10.8, -163 + br], [6.8, -121], [3.6, -121]]); ctx.closePath(); }, o.harness);
      sh(() => { poly(ctx, [[14, -163 + br], [10.8, -163 + br], [-6.8, -121], [-3.6, -121]]); ctx.closePath(); }, o.harness);
      sh(() => { ctx.beginPath(); ctx.arc(0, -141, 3, 0, TAU); }, o.buckle || o.belt);
      ctx.save(); ctx.fillStyle = o.glowCore; if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 6; } ctx.beginPath(); ctx.arc(0, -141, 1.2, 0, TAU); ctx.fill(); ctx.restore();
    }
    if (o.vials) {
      sh(() => { poly(ctx, [[-17, -161 + br], [-13, -163 + br], [15, -124], [11, -121]]); ctx.closePath(); }, o.harness || o.belt);
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const u = 0.18 + i * 0.16, vx = lerp(-15, 13, u), vy = lerp(-162, -122.5, u) + br * (1 - u);
        ctx.fillStyle = o.vialCap || '#3a2a1c'; ctx.fillRect(vx - 1.6, vy - 4.4, 3.2, 1.6);
        ctx.fillStyle = 'rgba(230,255,240,.55)'; ctx.fillRect(vx - 1.6, vy - 2.8, 3.2, 6.2);
        const col = o.vials[i % o.vials.length];
        if (!o.flat) { ctx.shadowColor = col; ctx.shadowBlur = 5 + 3 * Math.sin(t * 2 + i); }
        ctx.fillStyle = col; ctx.fillRect(vx - 1.1, vy - 0.4 - Math.sin(t * 1.5 + i) * 0.4, 2.2, 3.6);
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }
    if (o.beltTech) {
      [[-13.5, -122.5], [-9, -122.5], [8, -122.5]].forEach(([bx, by], i) => {
        sh(() => { ctx.beginPath(); ctx.rect(bx, by, 4.6, 6.4); }, o.beltTech);
        ctx.save(); ctx.fillStyle = i === 1 ? o.glowCore : (o.amber || '#ffc66b'); if (!o.flat) { ctx.shadowColor = i === 1 ? o.glow : (o.amber || '#ffc66b'); ctx.shadowBlur = 5; }
        ctx.fillRect(bx + 1.6, by + 1.4, 1.4, 1.4); ctx.restore();
      });
    }
    if (o.pauldron) {
      sh(() => { ctx.beginPath(); ctx.moveTo(-8, -166 + br); ctx.quadraticCurveTo(-22, -170 + br, -26.5, -150 + br); ctx.lineTo(-19.5, -147 + br); ctx.quadraticCurveTo(-18, -158 + br, -8, -160 + br); ctx.closePath(); }, o.pauldron, o.plateShade);
      sh(() => { ctx.beginPath(); ctx.moveTo(-15, -158 + br); ctx.quadraticCurveTo(-24, -158 + br, -27, -141 + br); ctx.lineTo(-21, -139 + br); ctx.quadraticCurveTo(-20, -150 + br, -14, -152 + br); ctx.closePath(); }, o.pauldron, o.plateShade);
      ctx.save(); glowStroke(ctx, o, o.glowLine || o.vein, 0.9, 6); ctx.globalAlpha = 0.7 + 0.3 * pulse;
      ctx.beginPath(); ctx.moveTo(-12, -163.5 + br); ctx.quadraticCurveTo(-21, -165 + br, -24, -151 + br); ctx.stroke(); ctx.restore();
    }
  }

  // braid hanging over the shoulder, in front of the coat

  function gearBraid(ctx, o, t, br, wind, sh) {
    if (o.hairStyle !== 'braid') return;
    for (let i = 0; i < 9; i++) {
      const u = i / 8, bx = lerp(-8, -14 + wind * 0.3, u) + Math.sin(u * 3) * 2, by = lerp(-180, -128, u) + br;
      sh(() => { ctx.beginPath(); ctx.ellipse(bx + (i % 2 ? 0.8 : -0.8), by, 2.9 - u * 0.8, 3.6, i % 2 ? 0.5 : -0.5, 0, TAU); }, o.hair);
    }
    sh(() => { ctx.beginPath(); ctx.rect(-15.5 + wind * 0.3, -126 + br, 3.6, 2.2); }, o.band || o.belt);
    ctx.save(); ctx.fillStyle = o.glowCore; if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 5; } ctx.fillRect(-14.4 + wind * 0.3, -125.6 + br, 1.4, 1.4); ctx.restore();
  }

  // collars, drawn after the neck and before the head

  function gearCollar(ctx, o, t, br, sh) {
    const pulse = 0.6 + 0.4 * Math.sin(t * 2.2);
    if (o.collarStyle === 'high') {
      sh(() => { poly(ctx, [[-10, -162 + br], [-12.5, -181 + br], [-6.5, -177.5 + br], [-3, -164 + br]]); ctx.closePath(); }, o.collar || o.coat, o.coatShade);
      sh(() => { poly(ctx, [[10.5, -162 + br], [13.5, -179 + br], [7.5, -174.5 + br], [4.5, -163.5 + br]]); ctx.closePath(); }, o.collar || o.coat);
      ctx.save(); glowStroke(ctx, o, o.glowLine || o.vein, 1, 7); ctx.globalAlpha = 0.7 + 0.3 * pulse;
      poly(ctx, [[-12.5, -181 + br], [-6.5, -177.5 + br]]); ctx.stroke(); poly(ctx, [[13.5, -179 + br], [7.5, -174.5 + br]]); ctx.stroke();
      ctx.restore();
      return true;
    }
    if (o.collarStyle === 'cowl') {
      sh(() => { ctx.beginPath(); ctx.moveTo(-11, -160 + br); ctx.bezierCurveTo(-13, -170 + br, -8, -177 + br, 0, -175.5 + br); ctx.bezierCurveTo(8, -176 + br, 12, -170 + br, 11.5, -160 + br); ctx.quadraticCurveTo(0, -156 + br, -11, -160 + br); ctx.closePath(); }, o.cowl, o.coatShade);
      ctx.save(); ctx.strokeStyle = o.cowlLine || 'rgba(0,0,0,.25)'; ctx.lineWidth = 0.8;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-9, -165 + i * 3 + br); ctx.quadraticCurveTo(0, -162 + i * 3 + br, 10, -166 + i * 3 + br); ctx.stroke(); }
      ctx.restore();
      sh(() => { ctx.beginPath(); ctx.moveTo(-6, -161 + br); ctx.quadraticCurveTo(-11, -140, -10 + Math.sin(t * 1.1) * 1.5, -128); ctx.lineTo(-4.5, -129); ctx.quadraticCurveTo(-4, -145, -1, -160 + br); ctx.closePath(); }, o.cowl, o.coatShade);
      return true;
    }
    return false;
  }

  // on the head: visor, goggles, earpiece

  function gearHead(ctx, o, t, br, sh) {
    const pulse = 0.6 + 0.4 * Math.sin(t * 2.6);
    if (o.goggles) {
      sh(() => { ctx.beginPath(); ctx.moveTo(-10, -195 + br); ctx.quadraticCurveTo(1, -201 + br, 13, -196.5 + br); ctx.lineTo(13.2, -193.4 + br); ctx.quadraticCurveTo(1, -197.8 + br, -10, -192 + br); ctx.closePath(); }, o.goggles);
      [[1.5, -201.5], [8.8, -201]].forEach(([gx, gy]) => {
        sh(() => { ctx.beginPath(); ctx.ellipse(gx, gy + br, 3.6, 2.8, -0.1, 0, TAU); }, o.goggles);
        ctx.save(); ctx.fillStyle = o.lens || '#9ff5d6'; if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 4; }
        ctx.beginPath(); ctx.ellipse(gx + 0.3, gy + br, 2.4, 1.8, -0.1, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(gx - 0.6, gy - 0.6 + br, 0.8, 0.5, 0, 0, TAU); ctx.fill(); ctx.restore();
      });
    }
    if (o.visor) {
      ctx.save();
      ctx.fillStyle = o.visorFill || 'rgba(120,255,215,.22)';
      ctx.beginPath(); ctx.moveTo(-2.2, -191.2 + br); ctx.lineTo(6, -191.2 + br); ctx.lineTo(6.4, -185.6 + br); ctx.lineTo(-1.6, -184.8 + br); ctx.closePath(); ctx.fill();
      glowStroke(ctx, o, o.glowLine || o.vein, 0.8, 6); ctx.globalAlpha = 0.8 + 0.2 * pulse; ctx.stroke();
      poly(ctx, [[-2.2, -189.5 + br], [-5.2, -187 + br]]); ctx.stroke();
      ctx.lineWidth = 0.5; ctx.globalAlpha = 0.9;
      poly(ctx, [[0, -189.6 + br], [2.2, -189.6 + br]]); ctx.stroke(); poly(ctx, [[0, -188.4 + br], [1.2, -188.4 + br]]); ctx.stroke();
      ctx.restore();
    }
    if (o.earpiece) {
      ctx.save(); ctx.fillStyle = o.earpiece; ctx.beginPath(); ctx.ellipse(-4.6, -185.5 + br, 2.3, 3.1, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = o.glowCore; if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 6 * pulse; }
      ctx.beginPath(); ctx.arc(-4.6, -185.5 + br, 1, 0, TAU); ctx.fill();
      glowStroke(ctx, o, o.glowLine || o.vein, 0.6, 4); poly(ctx, [[-3.2, -183.5 + br], [1.5, -179.5 + br]]); ctx.stroke();
      ctx.restore();
    }
  }

  // boots

  function gearBoots(ctx, o, t, sh) {
    if (!o.bootPlate) return;
    sh(() => { ctx.beginPath(); ctx.moveTo(-13.8, -38); ctx.lineTo(-4.2, -38); ctx.lineTo(-5, -24); ctx.quadraticCurveTo(-9, -21, -13, -24); ctx.closePath(); }, o.bootPlate);
    sh(() => { ctx.beginPath(); ctx.moveTo(7.8, -38); ctx.lineTo(17, -38); ctx.lineTo(16.2, -24); ctx.quadraticCurveTo(12.4, -21, 8.6, -24); ctx.closePath(); }, o.bootPlate);
    ctx.save(); glowStroke(ctx, o, o.glowLine || o.vein, 0.9, 5);
    poly(ctx, [[-12, -31], [-6, -31]]); ctx.stroke(); poly(ctx, [[9.6, -31], [15.4, -31]]); ctx.stroke(); ctx.restore();
  }

  /* The adult heroine. Feet at 0, about 205 units tall, turned three-quarters to the right.
     o.variant: 1 = long expedition coat, hair in a knot · 2 = short jacket + shoulder cape, bob with a glowing lock */

  function deer(ctx, x, y, s, o, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const sh = (fn, fill, shade) => drawShape(ctx, o, fn, fill, shade);
    const nod = Math.sin(t * 1.4) * 1.2, wag = Math.sin(t * 5) * 0.35, ear = (t % 3.3) > 3.1 ? -0.5 : 0;
    if (o.ground) { ctx.fillStyle = o.ground; ctx.beginPath(); ctx.ellipse(3, 1, 25, 4, 0, 0, TAU); ctx.fill(); }
    sh(() => capsule(ctx, -11, -29, -12.5, -1.5, 2.3, 1.5), o.legDark);
    sh(() => capsule(ctx, 13, -29, 15.5, -1.5, 2.5, 1.5), o.legDark);
    ctx.save(); ctx.translate(20, -38); ctx.rotate(wag - 0.3); sh(() => { ctx.beginPath(); ctx.ellipse(3, -1, 4.4, 2.6, -0.5, 0, TAU); }, o.tail); ctx.restore();
    sh(() => { ctx.beginPath(); ctx.ellipse(2, -35, 19.5, 10.5, -0.06, 0, TAU); }, o.body, o.bodyShade);
    ctx.save(); ctx.beginPath(); ctx.ellipse(2, -35, 19.5, 10.5, -0.06, 0, TAU); ctx.clip();
    const R = rng(12); ctx.fillStyle = o.spots;
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(-14 + R() * 32, -46 + R() * 8, 1 + R() * 2.4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = o.belly; ctx.beginPath(); ctx.ellipse(1, -27, 13, 4.5, 0, 0, TAU); ctx.fill();
    ctx.restore();
    sh(() => capsule(ctx, -7, -31, -6, -1.5, 2.7, 1.6), o.leg);
    sh(() => capsule(ctx, 17, -31, 19.5, -1.5, 2.9, 1.6), o.leg);
    ctx.fillStyle = o.hoof; [[-6, 0], [19.5, 0], [-12.5, 0], [15.5, 0]].forEach(([hx, hy]) => { ctx.beginPath(); ctx.ellipse(hx, hy - 1, 2.2, 1.4, 0, 0, TAU); ctx.fill(); });
    sh(() => capsule(ctx, -11, -40, -17.5, -55 + nod, 5.4, 3.8), o.body, o.bodyShade);
    ctx.save(); ctx.translate(-20, -58 + nod);
    // antlers with glowing tips
    ctx.save(); ctx.strokeStyle = o.antler; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const branch = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); };
    branch([[2, -4], [6, -13], [4.5, -22]]); branch([[6, -13], [11.5, -18]]); branch([[5.4, -18], [8, -24]]);
    branch([[-1, -4], [-3.5, -14], [-1, -23]]); branch([[-3.5, -14], [-9, -19]]);
    ctx.restore();
    const tp = 0.6 + 0.4 * Math.sin(t * 2.2);
    [[4.5, -22], [11.5, -18], [8, -24], [-1, -23], [-9, -19]].forEach(([ax, ay], i) => {
      ctx.save(); if (!o.flat) { ctx.shadowColor = o.tipGlow; ctx.shadowBlur = 8 * tp; }
      ctx.fillStyle = o.tip; ctx.beginPath(); ctx.ellipse(ax, ay, 1.9, 1.2, i * 0.7, 0, TAU); ctx.fill(); ctx.restore();
    });
    ctx.save(); ctx.translate(4, -3); ctx.rotate(-0.5 + ear);
    sh(() => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -2, 9, -6); ctx.quadraticCurveTo(4, -5, 0, -2); ctx.closePath(); }, o.body);
    ctx.restore();
    sh(() => { ctx.beginPath(); ctx.ellipse(0, 0, 6.6, 5.3, 0.15, 0, TAU); }, o.body, o.bodyShade);
    sh(() => { ctx.beginPath(); ctx.ellipse(-6, 2, 4.2, 3.1, 0.1, 0, TAU); }, o.snout || o.body);
    ctx.fillStyle = o.nose; ctx.beginPath(); ctx.arc(-9.6, 1.4, 1.1, 0, TAU); ctx.fill();
    const blink = (t % 4.6) > 4.45 ? 0.2 : 1;
    ctx.save(); if (o.eyeGlow) { ctx.shadowColor = o.eyeGlow; ctx.shadowBlur = 8; }
    ctx.fillStyle = o.eye; ctx.beginPath(); ctx.ellipse(-2, -1.2, 1.3, 1.6 * blink, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.restore();
    ctx.restore();
  }

  /* A floating island with an anti-gravity ring. */

  function island(ctx, x, y, s, N, t, seed) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 0.8 + seed) * 4); ctx.scale(s, s);
    const R = rng(seed * 13 + 1);
    // ring
    ctx.save(); ctx.globalCompositeOperation = N ? 'lighter' : 'source-over';
    ctx.strokeStyle = N ? 'rgba(125,255,190,.8)' : 'rgba(40,170,140,.65)'; ctx.lineWidth = 2;
    if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 12; }
    ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 20;
    ctx.beginPath(); ctx.ellipse(0, 70, 30, 6, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = lg(ctx, 0, 70, 0, 120, [[0, N ? 'rgba(125,255,190,.25)' : 'rgba(120,230,200,.22)'], [1, 'rgba(0,0,0,0)']]);
    ctx.beginPath(); ctx.moveTo(-26, 72); ctx.lineTo(26, 72); ctx.lineTo(16, 120); ctx.lineTo(-16, 120); ctx.closePath(); ctx.fill();
    ctx.restore();
    // hanging roots
    ctx.strokeStyle = N ? '#24361f' : '#6b4a2e'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 7; i++) { const rx = -26 + i * 9, ry = 8 + (i % 3) * 8; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.quadraticCurveTo(rx + Math.sin(t + i) * 3, ry + 20, rx + 2, ry + 26 + R() * 24); ctx.stroke(); }
    // rock
    ctx.beginPath(); ctx.moveTo(-44, 0); ctx.bezierCurveTo(-40, 20, -18, 40, -4, 58); ctx.bezierCurveTo(4, 50, 30, 26, 44, 0); ctx.closePath();
    ctx.fillStyle = N ? lg(ctx, 0, 0, 0, 60, [[0, '#2a2a1c'], [1, '#121510']]) : lg(ctx, 0, 0, 0, 60, [[0, '#a07a52'], [1, '#5e4028']]);
    ctx.fill();
    ctx.fillStyle = N ? 'rgba(125,255,190,.5)' : 'rgba(255,240,200,.25)'; ctx.fillRect(-30, 6, 2, 10); ctx.fillRect(12, 10, 2, 14);
    // grass cap
    ctx.fillStyle = N ? '#173023' : '#6fae52'; ctx.beginPath(); ctx.ellipse(0, 0, 46, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = N ? '#1f3f2c' : '#8cc866'; ctx.beginPath(); ctx.ellipse(-6, -2, 34, 5, 0, 0, TAU); ctx.fill();
    // a crystal cluster on top
    ctx.save(); if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 14; }
    [[-8, 0, -0.2, 26], [0, 0, 0.1, 34], [8, 0, 0.35, 22]].forEach(([cx, cy, a, L], i) => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      ctx.fillStyle = N ? ['#9dffd0', '#d8fff0', '#6dffb0'][i] : ['#7fd6b8', '#bff0dc', '#5fbf9f'][i];
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-1, -L); ctx.lineTo(2, -L * 0.85); ctx.lineTo(4, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    });
    ctx.restore();
    ctx.restore();
  }

  /* -------- the forest, shared by day and night: same place, different light */

  function forestBuild(N, op) {
    const O = Object.assign({ stones: true, cable: true, pylon: true, sign: 'KRONBY 2 km', hull: true, lake: false, seed: 77 }, op || {});
    const R = rng(O.seed);
    const [back, b] = off(W + 40, H); b.translate(20, 0);
    b.fillStyle = lg(b, 0, 0, 0, 560, N ? [[0, '#071817'], [0.5, '#103129'], [0.85, '#2a4a30'], [1, '#5f6f30']] : [[0, '#56a896'], [0.5, '#a3d3c0'], [1, '#eeeecd']]);
    b.fillRect(-20, 0, W + 40, H);
    if (N) for (let i = 0; i < 130; i++) { b.fillStyle = `rgba(230,255,225,${0.2 + R() * 0.6})`; b.fillRect(-20 + R() * (W + 40), R() * 420, 1.2, 1.2); }
    // ringed planet
    b.save(); b.translate(292, 120); b.rotate(-0.28);
    b.globalAlpha = N ? 0.95 : 0.6;
    b.fillStyle = N ? rg(b, -10, -10, 4, 50, [[0, '#e9f7dc'], [1, '#8fb894']]) : rg(b, -10, -10, 4, 50, [[0, '#fbf6e2'], [1, '#c9dcc0']]);
    b.beginPath(); b.arc(0, 0, 40, 0, TAU); b.fill();
    b.strokeStyle = N ? 'rgba(170,255,210,.8)' : 'rgba(250,245,225,.9)'; b.lineWidth = 3;
    if (N) { b.shadowColor = '#7dffb0'; b.shadowBlur = 10; }
    b.beginPath(); b.ellipse(0, 4, 70, 12, 0, 0, TAU); b.stroke();
    b.restore();
    // a giant artificial ring rising out of the horizon, with stations on it
    const ringPts = [];
    {
      const cx = 250, cy = 560, rx = 250, ry = 420, rot = 0.32, a0 = Math.PI * 1.08, a1 = Math.PI * 1.62;
      const P = (a, d) => { const x = Math.cos(a) * (rx + d), y = Math.sin(a) * (ry + d); return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; };
      b.beginPath();
      for (let k = 0; k <= 60; k++) { const [x, y] = P(lerp(a0, a1, k / 60), 7); k ? b.lineTo(x, y) : b.moveTo(x, y); }
      for (let k = 60; k >= 0; k--) { const [x, y] = P(lerp(a0, a1, k / 60), -7); b.lineTo(x, y); }
      b.closePath();
      b.fillStyle = N ? 'rgba(30,60,52,.95)' : 'rgba(236,244,232,.85)'; b.fill();
      b.strokeStyle = N ? 'rgba(130,230,190,.55)' : 'rgba(120,170,160,.55)'; b.lineWidth = 1; b.stroke();
      for (let k = 0; k <= 24; k++) {
        const a = lerp(a0, a1, k / 24), [x0, y0] = P(a, -7), [x1, y1] = P(a, 7);
        b.strokeStyle = N ? 'rgba(130,230,190,.35)' : 'rgba(110,150,140,.45)'; b.beginPath(); b.moveTo(x0, y0); b.lineTo(x1, y1); b.stroke();
        if (k % 3 === 1) ringPts.push(P(a, 0));
      }
    }
    // far tree-towers (a city grown from trees)
    const towers = [];
    const tower = (x, base, h, w, col, colLight, lights) => {
      b.fillStyle = col;
      b.beginPath(); b.moveTo(x - w * 0.9, base); b.quadraticCurveTo(x - w * 0.45, base - h * 0.5, x - w * 0.5, base - h); b.lineTo(x + w * 0.5, base - h); b.quadraticCurveTo(x + w * 0.45, base - h * 0.5, x + w * 0.9, base); b.closePath(); b.fill();
      foliage(b, x, base - h - 10, w * 2.6, R, [col, colLight, null, null], [0.4, -0.8], 6, 0.7);
      for (let k = 0; k < 3; k++) {
        const ry = base - h * (0.25 + k * 0.22), rw = w * (1.5 + R() * 0.8);
        b.fillStyle = colLight; b.beginPath(); b.ellipse(x, ry, rw, rw * 0.22, 0, 0, TAU); b.fill();
        if (lights) towers.push([x, ry, rw]);
      }
    };
    for (let i = 0; i < 6; i++) tower(30 + i * 66 + R() * 20, 470, 150 + R() * 70, 6 + R() * 3, N ? '#163029' : '#97c2b0', N ? '#1d3b31' : '#a9cfbe', N);
    for (let i = 0; i < 4; i++) tower(70 + i * 95 + R() * 25, 500, 170 + R() * 60, 9 + R() * 3, N ? '#10241d' : '#7eae98', N ? '#16302a' : '#8fbca7', N);
    // mist
    b.fillStyle = lg(b, 0, 400, 0, 540, [[0, 'rgba(0,0,0,0)'], [0.5, N ? 'rgba(110,200,150,.16)' : 'rgba(245,252,240,.6)'], [1, 'rgba(0,0,0,0)']]);
    b.fillRect(-20, 400, W + 40, 140);

    const [front, c] = off(W + 40, H); c.translate(20, 0);
    hillPath(c, 520, 12, 0.016, 2.2); c.fillStyle = N ? '#12241b' : '#6c9e66'; c.fill();
    for (let i = 0; i < 18; i++) foliage(c, -20 + i * 25 + R() * 10, 528 + R() * 10, 13 + R() * 8, R, N ? ['#0e1d15', '#16291e', '#1f3a29', null] : ['#4d8048', '#629a54', '#93c873', null], [0.3, -0.9], 4);
    // ground
    c.fillStyle = lg(c, 0, 560, 0, H, N ? [[0, '#16271a'], [1, '#070d09']] : [[0, '#7fb55a'], [0.45, '#5a8e40'], [1, '#2c4a26']]);
    c.beginPath(); c.moveTo(-20, 590); c.bezierCurveTo(100, 566, 260, 572, W + 20, 580); c.lineTo(W + 20, H); c.lineTo(-20, H); c.closePath(); c.fill();
    // stepping stones into the distance
    const stones = [];
    if (O.lake) {
      c.fillStyle = lg(c, 0, 596, 0, 700, N ? [[0, '#2a4a3a'], [0.35, '#123029'], [1, '#08140f']] : [[0, '#cfe7d6'], [0.4, '#7fb8a4'], [1, '#3d7a64']]);
      c.beginPath(); c.moveTo(-20, 604); c.bezierCurveTo(90, 590, 280, 594, W + 20, 602); c.lineTo(W + 20, 690); c.bezierCurveTo(260, 704, 120, 698, -20, 692); c.closePath(); c.fill();
      c.fillStyle = N ? '#0f1c13' : '#4f7f3c';
      c.beginPath(); c.moveTo(-20, 690); c.bezierCurveTo(120, 700, 260, 706, W + 20, 688); c.lineTo(W + 20, H); c.lineTo(-20, H); c.closePath(); c.fill();
      for (let k = 0; k < 26; k++) { const rx = R() * W, ry = 688 + R() * 18; c.strokeStyle = N ? '#1d3524' : '#3a6a30'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(rx, ry + 10); c.quadraticCurveTo(rx + 3, ry - 10, rx + (R() - 0.5) * 8, ry - 22 - R() * 18); c.stroke(); }
    }
    if (O.stones && !O.lake) for (let k = 0; k < 10; k++) {
      const u = k / 9, yy = lerp(585, 838, Math.pow(u, 1.35)), xx = lerp(212, 186, u) + Math.sin(k * 1.9) * 9, rx = lerp(8, 40, u);
      c.fillStyle = N ? '#2a3226' : '#c8b590'; c.beginPath(); c.ellipse(xx, yy, rx, rx * 0.3, 0, 0, TAU); c.fill();
      c.fillStyle = N ? '#1c2219' : '#a8936c'; c.beginPath(); c.ellipse(xx, yy + rx * 0.08, rx, rx * 0.24, 0, 0, Math.PI); c.fill();
      stones.push([xx, yy, rx]);
    }
    // giant tree, left
    const trunkCols = N ? ['#2b2117', '#120d08', '#3d3020'] : ['#8a5a3a', '#593823', '#c48a58'];
    trunk(c, 26, -10, 690, 74, 118, R, trunkCols, -12);
    // root flare
    // giant tree, right, grown around a crashed hull
    trunk(c, 366, -10, 700, 66, 104, R, trunkCols, 10);
    c.save(); c.translate(296, 492); c.rotate(-0.18);
    c.fillStyle = N ? lg(c, 0, -26, 0, 26, [[0, '#3a2a1e'], [1, '#14100b']]) : lg(c, 0, -26, 0, 26, [[0, '#d39a66'], [0.5, '#a06b44'], [1, '#5a3a24']]);
    c.beginPath(); c.ellipse(0, 0, 98, 25, 0, 0, TAU); c.fill();
    c.fillStyle = N ? '#20171099' : 'rgba(255,235,200,.35)'; c.beginPath(); c.ellipse(0, -9, 80, 7, 0, 0, TAU); c.fill();
    c.strokeStyle = N ? 'rgba(0,0,0,.4)' : 'rgba(70,40,20,.5)'; c.lineWidth = 1.2;
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 26, -24); c.quadraticCurveTo(i * 30, 0, i * 26, 24); c.stroke(); }
    c.fillStyle = N ? 'rgba(80,140,100,.25)' : 'rgba(95,165,140,.6)';
    for (let i = 0; i < 6; i++) { blobPath(c, -70 + R() * 140, -14 + R() * 20, 6 + R() * 10, R, 7, 0.35, 0.6); c.fill(); }
    c.restore();
    const ports = [[230, 500], [262, 494], [294, 488], [326, 482]];
    ports.forEach(([px, py]) => { c.fillStyle = N ? '#0b0806' : '#3e2a1c'; c.beginPath(); c.arc(px, py, 8, 0, TAU); c.fill(); });
    // roots wrapping the hull
    c.strokeStyle = trunkCols[0]; c.lineCap = 'round';
    [[340, 430, 250, 470, 214, 560, 9], [356, 450, 300, 520, 268, 590, 11], [330, 470, 340, 520, 312, 600, 8]].forEach(([x0, y0, x1, y1, x2, y2, w]) => { c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke(); });
    // canopy
    const leaves = N ? ['#0b1811', '#13281c', '#1d3a28', null] : ['#2b5638', '#3c7246', '#86c06a', 'rgba(230,255,220,.7)'];
    for (let i = 0; i < 9; i++) foliage(c, -10 + R() * 130, -14 + R() * 120, 52 + R() * 30, R, leaves, [0.8, 0.4], 7);
    for (let i = 0; i < 9; i++) foliage(c, 280 + R() * 130, -14 + R() * 120, 52 + R() * 30, R, leaves, [-0.4, 0.5], 7);
    // glowing lilies (tall stems with bulbs)
    const lilies = [];
    for (let i = 0; i < 16; i++) {
      const lx = i < 8 ? 40 + R() * 90 : 250 + R() * 120, ly = 600 + R() * 120, lh = 18 + R() * 30;
      c.strokeStyle = N ? '#1d3a28' : '#4a7d3a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(lx, ly); c.quadraticCurveTo(lx + 4, ly - lh * 0.6, lx + 2, ly - lh); c.stroke();
      lilies.push([lx + 2, ly - lh, 2.4 + R() * 2]);
    }
    // ferns, mid-ground
    for (let i = 0; i < 6; i++) fern(c, 60 + i * 60 + R() * 20, 640 + R() * 40, 40 + R() * 30, (R() - 0.5) * 1.2, 0, N ? '#11241a' : '#3f7a3c', 1.6, 7, R() > 0.5 ? 1 : -1);
    // seams of light running up the giant trunks
    const seams = [];
    for (let i = 0; i < 4; i++) seams.push([4 + i * 15 + R() * 6, 250 + R() * 120, 600 + R() * 50, (R() - 0.5) * 8]);
    for (let i = 0; i < 3; i++) seams.push([344 + i * 15 + R() * 6, 240 + R() * 80, 430 + R() * 30, (R() - 0.5) * 8]);
    // hanging light pods
    const pods = [];
    for (let i = 0; i < 6; i++) { const left = i < 3; pods.push([left ? 70 + R() * 70 : 280 + R() * 60, 100 + R() * 90, 40 + R() * 120, R() * TAU]); }
    // a conduit cable from the hull, running along the roots into the ground
    const cable = O.cable ? [[318, 500], [304, 540], [282, 566], [262, 598], [236, 612], [214, 640], [196, 700]] : null;
    if (cable) c.strokeStyle = N ? '#1a1f1a' : '#3e3a30'; c.lineWidth = 3.4; c.lineCap = 'round'; c.lineJoin = 'round';
    if (cable) { c.beginPath(); c.moveTo(cable[0][0], cable[0][1]); for (let k = 1; k < cable.length; k++) c.lineTo(cable[k][0], cable[k][1]); c.stroke(); }
    // a tech pylon, half overgrown
    const pyl = O.pylon ? [352, 596] : null;
    if (pyl) {
    c.fillStyle = N ? '#1c2420' : '#5d6b62';
    c.beginPath(); c.moveTo(pyl[0] - 9, pyl[1]); c.lineTo(pyl[0] - 5, pyl[1] - 112); c.lineTo(pyl[0], pyl[1] - 122); c.lineTo(pyl[0] + 5, pyl[1] - 112); c.lineTo(pyl[0] + 9, pyl[1]); c.closePath(); c.fill();
    c.fillStyle = N ? '#26302a' : '#7d8c80'; c.beginPath(); c.moveTo(pyl[0], pyl[1] - 122); c.lineTo(pyl[0] + 5, pyl[1] - 112); c.lineTo(pyl[0] + 9, pyl[1]); c.lineTo(pyl[0] + 1, pyl[1]); c.closePath(); c.fill();
    for (let k = 0; k < 7; k++) foliage(c, pyl[0] - 8 + R() * 16, pyl[1] - 6 - R() * 40, 5 + R() * 4, R, N ? ['#0e1d15', '#16291e', null, null] : ['#3f6f3a', '#5a9450', '#8cc866', null], [0.2, -0.9], 3);
    }
    return { O, back, front, stones, seams, pods, lilies, ports, towers, ringPts, cable, pyl, R: rng(5), motes: motes(rng(3), N ? 46 : 30, { y0: 140, y1: 760, r0: 1, r1: 2.4 }), grass: Array.from({ length: 34 }, () => [R() * W, 600 + R() * 200, 8 + R() * 14]) };
  }

  function forestFrame(ctx, t, S, N, G) {
    G = G || {};
    const pan = Math.sin(t * 0.22) * 8;
    ctx.drawImage(S.back, -20 + pan * 0.35, 0, W + 40, H);
    if (N) {
      // tower lights
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      S.towers.forEach(([x, y, rw], i) => {
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI + t * 0.3 + i, lx = x + Math.cos(a) * rw - 20 + pan * 0.35 + 20, ly = y + Math.sin(a) * rw * 0.22;
          const on = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 2 + k);
          ctx.fillStyle = k % 2 ? `rgba(255,200,110,${0.5 * on + 0.3})` : `rgba(140,255,200,${0.5 * on + 0.3})`;
          ctx.beginPath(); ctx.arc(lx, ly, 1.4, 0, TAU); ctx.fill();
        }
      });
      // aurora
      ctx.filter = 'blur(8px)';
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        for (let x = -10; x <= W + 10; x += 8) { const yy = 190 + k * 36 + Math.sin(x * 0.012 + t * 0.6 + k) * 28 + Math.sin(x * 0.03 - t * 0.4) * 9; x === -10 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
        for (let x = W + 10; x >= -10; x -= 8) { const yy = 190 + k * 36 + Math.sin(x * 0.012 + t * 0.6 + k) * 28 + Math.sin(x * 0.03 - t * 0.4) * 9 + 64; ctx.lineTo(x, yy); }
        ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, 160, 0, 340, [[0, 'rgba(120,255,170,0)'], [0.4, `rgba(${k === 1 ? '200,255,120' : '110,255,180'},.15)`], [1, 'rgba(120,255,170,0)']]);
        ctx.fill();
      }
      ctx.restore();
    }
    if (S.ringPts) S.ringPts.forEach(([x, y], i) => {
      const on = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3);
      ctx.save(); ctx.fillStyle = N ? `rgba(160,255,210,${0.4 + 0.6 * on})` : `rgba(80,210,180,${0.3 + 0.5 * on})`;
      if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 8; }
      ctx.beginPath(); ctx.arc(x - 20 + pan * 0.35, y, 2, 0, TAU); ctx.fill(); ctx.restore();
    });
    island(ctx, 64 + pan * 0.5, 228, 0.78, N, t, 1);
    island(ctx, 176 + pan * 0.45, 160, 0.46, N, t, 2);
    island(ctx, 300 + pan * 0.5, 250, 0.56, N, t, 3);
    ctx.drawImage(S.front, -20 + pan * 0.7, 0, W + 40, H);
    const px = pan * 0.7;
    if (!N) {
      // sunbeams through the canopy gap
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(9px)';
      for (let i = 0; i < 4; i++) {
        const x = 150 + i * 52 + pan, a = 0.16 + 0.08 * Math.sin(t * 0.7 + i * 1.7);
        ctx.fillStyle = lg(ctx, x, 0, x - 120, 640, [[0, 'rgba(255,248,210,0)'], [0.25, `rgba(255,248,210,${a})`], [1, 'rgba(255,248,210,0)']]);
        ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x + 22 + i * 6, -20); ctx.lineTo(x - 90 + i * 8, 640); ctx.lineTo(x - 150, 640); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    // light seams in the trunks
    ctx.save(); ctx.lineCap = 'round';
    S.seams.forEach(([x, y0, y1, bend], i) => {
      const p = 0.55 + 0.45 * Math.sin(t * 1.4 + i * 1.3);
      ctx.strokeStyle = N ? `rgba(140,255,200,${0.55 + 0.4 * p})` : `rgba(90,230,190,${0.35 + 0.2 * p})`;
      ctx.lineWidth = N ? 1.6 : 1.2;
      if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 10; }
      ctx.beginPath(); ctx.moveTo(x + px, y0); ctx.bezierCurveTo(x + bend + px, y0 + (y1 - y0) * 0.3, x - bend + px, y0 + (y1 - y0) * 0.7, x + bend * 0.5 + px, y1); ctx.stroke();
      // a light pulse travelling up the seam
      const u = 1 - ((t * 0.25 + i * 0.17) % 1), yy = lerp(y0, y1, u);
      ctx.fillStyle = N ? 'rgba(220,255,230,.9)' : 'rgba(220,255,240,.8)';
      ctx.beginPath(); ctx.arc(x + px + Math.sin(u * 3) * bend * 0.4, yy, N ? 2.4 : 1.8, 0, TAU); ctx.fill();
    });
    ctx.restore();
    // portholes
    ctx.save();
    S.ports.forEach(([x, y], i) => {
      const p = 0.6 + 0.4 * Math.sin(t * 2 + i);
      if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 16 * p; }
      ctx.fillStyle = rg(ctx, x + px, y, 0.5, 6, [[0, N ? '#f0fff4' : '#f2fff0'], [1, N ? `rgba(110,255,170,${0.7 + 0.3 * p})` : '#7fd6a8']]);
      ctx.beginPath(); ctx.arc(x + px, y, 5.6, 0, TAU); ctx.fill();
    });
    ctx.restore();
    // hanging light pods
    ctx.save();
    S.pods.forEach(([x, y, len, ph], i) => {
      const sw = Math.sin(t * 0.9 + ph) * 5, ex = x + px + sw, ey = y + len;
      ctx.strokeStyle = N ? 'rgba(60,90,60,.9)' : 'rgba(60,100,50,.85)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + px, y); ctx.quadraticCurveTo(x + px + sw * 0.3, y + len * 0.5, ex, ey); ctx.stroke();
      const p = 0.6 + 0.4 * Math.sin(t * 1.8 + ph);
      if (N) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = rg(ctx, ex, ey + 4, 0, 22, [[0, `rgba(${i % 3 ? '140,255,200' : '255,205,120'},${0.45 * p})`], [1, 'rgba(0,0,0,0)']]);
        ctx.beginPath(); ctx.arc(ex, ey + 4, 22, 0, TAU); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = N ? (i % 3 ? '#c8ffe0' : '#ffd890') : (i % 3 ? '#d6f6e6' : '#f2e2b0');
      ctx.beginPath(); ctx.ellipse(ex, ey + 4, 3.2, 5, 0, 0, TAU); ctx.fill();
    });
    ctx.restore();
    // stone path inlay
    ctx.save(); ctx.lineCap = 'round';
    S.stones.forEach(([x, y, rx], i) => {
      const p = 0.5 + 0.5 * Math.sin(t * 2 - i * 0.6);
      ctx.strokeStyle = N ? `rgba(140,255,200,${0.35 + 0.6 * p})` : `rgba(40,190,150,${0.35 + 0.35 * p})`;
      ctx.lineWidth = Math.max(0.8, rx * 0.05);
      if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 8; }
      ctx.beginPath(); ctx.ellipse(x + px, y - rx * 0.03, rx * 0.62, rx * 0.17, 0, 0, TAU); ctx.stroke();
    });
    ctx.restore();
    // glowing lilies
    ctx.save();
    S.lilies.forEach(([x, y, r], i) => {
      const p = 0.6 + 0.4 * Math.sin(t * 1.5 + i), col = i % 4 ? '125,255,176' : '255,201,107';
      if (N) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = rg(ctx, x + px, y, 0, r * 6, [[0, `rgba(${col},${0.35 * p})`], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(x + px, y, r * 6, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillStyle = N ? `rgba(${col},.95)` : (i % 4 ? '#bff0d4' : '#f4d98a');
      ctx.beginPath(); ctx.ellipse(x + px, y, r * 0.8, r * 1.2, 0, 0, TAU); ctx.fill();
    });
    ctx.restore();
    // pylon light rings
    if (S.pyl) {
      const [qx, qy] = S.pyl;
      ctx.save();
      for (let k = 0; k < 3; k++) {
        const yy = qy - 30 - k * 30 + Math.sin(t * 1.5 + k) * 3, on = 0.6 + 0.4 * Math.sin(t * 2 + k);
        ctx.strokeStyle = N ? `rgba(140,255,200,${0.5 + 0.5 * on})` : `rgba(30,170,140,${0.55 + 0.35 * on})`; ctx.lineWidth = 1.4;
        if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 10; }
        ctx.beginPath(); ctx.ellipse(qx + px, yy, 14 - k * 2, 3.4 - k * 0.4, 0, 0, TAU); ctx.stroke();
      }
      ctx.fillStyle = N ? '#d8fff0' : '#bff7e4'; if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 14; }
      ctx.beginPath(); ctx.arc(qx + px, qy - 124, 2.6 + Math.sin(t * 3) * 0.6, 0, TAU); ctx.fill();
      ctx.restore();
    }
    // energy pulses along the cable
    if (S.cable) {
      ctx.save(); const cb = S.cable;
      ctx.strokeStyle = N ? 'rgba(125,255,190,.55)' : 'rgba(60,220,180,.45)'; ctx.lineWidth = 1.1; if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 6; }
      ctx.beginPath(); ctx.moveTo(cb[0][0] + px, cb[0][1]); for (let k = 1; k < cb.length; k++) ctx.lineTo(cb[k][0] + px, cb[k][1]); ctx.stroke();
      for (let j = 0; j < 3; j++) {
        const u = ((t * 0.35 + j / 3) % 1) * (cb.length - 1), k = Math.floor(u), f = u - k;
        const x = lerp(cb[k][0], cb[k + 1][0], f) + px, y = lerp(cb[k][1], cb[k + 1][1], f);
        ctx.fillStyle = N ? '#eafff2' : '#e6fff6'; ctx.shadowBlur = 12; ctx.shadowColor = '#7dffb0';
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    // lake shimmer
    if (S.O.lake) {
      ctx.save(); ctx.strokeStyle = N ? 'rgba(150,255,200,.45)' : 'rgba(255,255,245,.7)'; ctx.lineWidth = 1.1;
      if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 6; }
      for (let i = 0; i < 12; i++) { const y = 612 + i * 6.5, x = 20 + ((i * 67 + t * 12) % 340); ctx.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(t * 1.6 + i)); ctx.beginPath(); ctx.moveTo(x + px, y); ctx.lineTo(x + 18 + (i % 3) * 9 + px, y); ctx.stroke(); }
      ctx.restore();
    }
    // a holographic way-sign over the path
    if (S.O.sign) {
      const sx = 236 + px, sy = 548 + Math.sin(t * 1.2) * 2, fl = (t % 5) > 4.85 ? 0.3 : 1;
      ctx.save(); ctx.globalAlpha = fl;
      ctx.strokeStyle = N ? 'rgba(140,255,200,.9)' : 'rgba(30,160,130,.9)'; ctx.lineWidth = 1;
      ctx.fillStyle = N ? 'rgba(40,120,90,.35)' : 'rgba(200,255,235,.55)';
      if (N) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 10; }
      ctx.beginPath(); ctx.moveTo(sx - 26, sy - 9); ctx.lineTo(sx + 20, sy - 9); ctx.lineTo(sx + 28, sy); ctx.lineTo(sx + 20, sy + 9); ctx.lineTo(sx - 26, sy + 9); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx - 4, sy + 9); ctx.lineTo(sx - 4, sy + 30); ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.shadowBlur = 0; ctx.fillStyle = N ? '#eafff2' : '#0f4a3a'; ctx.font = '600 10px "Space Grotesk", "DejaVu Sans", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(S.O.sign, sx, sy + 3.5); ctx.textAlign = 'left';
      ctx.restore();
    }
    for (const [gx, gy, gh] of S.grass) grassTuft(ctx, gx + px, gy, gh, Math.sin(t * 1.6 + gx * 0.05) * 3, N ? 'rgba(30,60,36,.95)' : 'rgba(50,100,40,.85)', 5, S.R);
    const gp = G.glowPool == null ? 0 : G.glowPool;
    if (N && gp > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = gp;
      ctx.fillStyle = rg(ctx, (G.glowX || 178) + pan, G.glowY || 650, 10, 170, [[0, 'rgba(150,255,170,.28)'], [1, 'rgba(0,0,0,0)']]);
      ctx.beginPath(); ctx.ellipse((G.glowX || 178) + pan, G.glowY || 650, 170, 56, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
  }

  function droneBody(ctx, t, N, D) {
    ctx.rotate(Math.sin(t * 0.9) * 0.08);
    ctx.fillStyle = N ? '#1a201c' : '#c9cfc4'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = N ? '#2a322c' : '#e6eadf'; ctx.beginPath(); ctx.ellipse(0, -2.5, 8, 3.5, 0, Math.PI, TAU); ctx.fill();
    ctx.strokeStyle = N ? '#3a443c' : '#8a958a'; ctx.lineWidth = 1.4;
    [[-18, -3], [18, -3]].forEach(([rx, ry]) => { ctx.beginPath(); ctx.moveTo(rx * 0.6, 0); ctx.lineTo(rx, ry); ctx.stroke(); ctx.beginPath(); ctx.ellipse(rx, ry, 7 * (0.6 + 0.4 * Math.abs(Math.sin(t * 40 + rx))), 1.4, 0, 0, TAU); ctx.stroke(); });
    const alert = D && D.alert;
    ctx.fillStyle = alert ? '#ff6a4a' : N ? '#ffb86b' : '#1fd6a8'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = alert ? 18 : 12;
    ctx.beginPath(); ctx.arc(0, 3, alert ? 3.2 : 2.6, 0, TAU); ctx.fill();
  }

  function drone(ctx, t, N, pan, D) {
    D = D || {};
    const dx = (D.x != null ? D.x : 270 + Math.sin(t * 0.45) * 40) + pan * 0.5, dy = (D.y != null ? D.y : 300) + Math.sin(t * 0.9) * 8;
    const sweep = D.sweep != null ? D.sweep : Math.sin(t * 0.7) * 0.42;
    if (D.beam === 0) { ctx.save(); ctx.translate(dx, dy); ctx.scale(1.35, 1.35); droneBody(ctx, t, N, D); ctx.restore(); return; }
    const len = D.len || 340;
    ctx.save();
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(sweep);
    ctx.globalCompositeOperation = N ? 'lighter' : 'source-over';
    const beamCol = D.alert ? 'rgba(255,110,80,' : N ? 'rgba(255,190,110,' : 'rgba(80,230,200,';
    ctx.fillStyle = lg(ctx, 0, 0, 0, len, [[0, beamCol + (N ? '.55)' : '.45)')], [0.7, beamCol + (N ? '.18)' : '.12)')], [1, beamCol + '0)']]);
    ctx.beginPath(); ctx.moveTo(-4, 5); ctx.lineTo(4, 5); ctx.lineTo(len * 0.16, len); ctx.lineTo(-len * 0.16, len); ctx.closePath(); ctx.fill();
    if (!N) { ctx.strokeStyle = 'rgba(40,190,160,.35)'; ctx.lineWidth = 0.8; for (let k = 0; k < 4; k++) { const yy = ((t * 60 + k * 70) % (len - 60)) + 10, w = 3 + yy * 0.144; ctx.beginPath(); ctx.moveTo(-w, yy); ctx.lineTo(w, yy); ctx.stroke(); } }
    ctx.restore();
    ctx.translate(dx, dy); ctx.scale(1.35, 1.35);
    droneBody(ctx, t, N, D);
    ctx.restore();
    return [dx, dy, sweep, len];
  }

  function hero(ctx, x, y, s, o, t) {
    o = o || {};
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const br = Math.sin(t * 1.6) * 0.6, wind = Math.sin(t * 1.1) * 2.5 + Math.sin(t * 2.6) * 1, lift = Math.sin(t * 1.3) * 2;
    const sh = (fn, fill, shade) => drawShape(ctx, o, fn, fill, shade);
    const pulse = 0.6 + 0.4 * Math.sin(t * 2.2);
    const glowLine = (pts, w = 1, blur = 7) => { ctx.save(); glowStroke(ctx, o, o.glowLine || o.vein, w, blur); ctx.globalAlpha = 0.7 + 0.3 * pulse; poly(ctx, pts); ctx.stroke(); ctx.restore(); };
    const line = (pts, col, w = 1) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; poly(ctx, pts); ctx.stroke(); ctx.restore(); };
    const dot = (px, py, r, col, glow) => { ctx.save(); ctx.fillStyle = col; if (glow && !o.flat) { ctx.shadowColor = glow; ctx.shadowBlur = 8 * pulse; } ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill(); ctx.restore(); };
    const outer = o.outer || 'longcoat', hs = o.hairStyle || 'knot', pants = o.pants || 'slim', bt = o.bootStyle || 'tall';
    const K = o.cast == null ? 0 : o.cast, MK = o.marks == null ? 1 : o.marks;
    const S0 = [16.5, -159 + br];
    const E = [lerp(22, 32, K), lerp(-128 + br, -183 + lift * 0.4, K)], Wr = [lerp(20.6, 42, K), lerp(-100 + br, -209 + lift, K)], HD = [lerp(20.2, 44.3, K), lerp(-95 + br, -213.5 + lift, K)];
    const LP = (p, q, u) => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
    const seam = o.seam || 'rgba(0,0,0,.28)';
    if (o.ground) { ctx.fillStyle = o.ground; ctx.beginPath(); ctx.ellipse(5, 1, outer === 'cloak' ? 40 : 30, 5, 0, 0, TAU); ctx.fill(); }

    /* ---------- back layer */
    if (o.bigpack) {
      sh(() => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-35, -172 + br, 20, 66, 3) : ctx.rect(-35, -172 + br, 20, 66); }, o.bigpack, o.packShade);
      line([[-35, -150 + br], [-15, -150 + br]], seam, 0.8); line([[-35, -127 + br], [-15, -127 + br]], seam, 0.8);
      sh(() => { ctx.beginPath(); ctx.ellipse(-25, -176 + br, 12, 5.6, 0, 0, TAU); }, o.bedroll);
      line([[-30, -181 + br], [-30, -171 + br]], seam, 0.8); line([[-20, -181 + br], [-20, -171 + br]], seam, 0.8);
      ctx.save(); ctx.translate(-36, -116 + br); ctx.rotate(Math.sin(t * 1.7) * 0.18);
      line([[0, 0], [0, 6]], '#2a2016', 0.8);
      sh(() => { ctx.beginPath(); ctx.rect(-3.4, 6, 6.8, 9); }, '#3a2a1c');
      ctx.fillStyle = o.amber || '#ffc66b'; if (!o.flat) { ctx.shadowColor = o.amber || '#ffc66b'; ctx.shadowBlur = 12 * pulse; } ctx.fillRect(-2.2, 7.4, 4.4, 6.2);
      ctx.restore();
    }
    if (o.pack) gearBehind(ctx, { ...o, hood: null, hairStyle: null }, t, br, wind, sh);
    if (o.cape) sh(() => { ctx.beginPath(); ctx.moveTo(-8, -167 + br); ctx.bezierCurveTo(-30, -162 + br, -33 + wind, -110, -40 + wind * 1.6, -46); ctx.lineTo(-18 + wind, -50); ctx.quadraticCurveTo(-15, -120, -2, -160 + br); ctx.closePath(); }, o.cape, o.capeShade);
    if (outer === 'cloak') sh(() => { ctx.beginPath(); ctx.moveTo(-14, -166 + br); ctx.quadraticCurveTo(-31, -120, -42 + wind * 1.2, -36); ctx.lineTo(38 + wind * 0.8, -38); ctx.quadraticCurveTo(28, -120, 14, -166 + br); ctx.closePath(); }, o.lining);
    if (outer === 'longcoat') sh(() => { ctx.beginPath(); ctx.moveTo(-17, -152 + br); ctx.quadraticCurveTo(-24, -100, -32 + wind * 1.3, -41); ctx.lineTo(30 + wind * 0.6, -43); ctx.quadraticCurveTo(23, -100, 17, -152 + br); ctx.closePath(); }, o.lining);
    if (o.hoodUp) sh(() => { ctx.beginPath(); ctx.moveTo(-4, -166 + br); ctx.bezierCurveTo(-20, -168 + br, -25, -190 + br, -21, -204 + br); ctx.quadraticCurveTo(-24, -214 + br, -27 + wind * 0.3, -217 + br); ctx.quadraticCurveTo(-14, -219 + br, -6, -213 + br); ctx.bezierCurveTo(6, -219 + br, 17, -210 + br, 17, -194 + br); ctx.lineTo(14, -178 + br); ctx.quadraticCurveTo(8, -167 + br, -4, -166 + br); ctx.closePath(); }, o.hood, o.hoodShade);
    if (!o.hoodUp) {
      if (hs === 'knot' && !o.hat) sh(() => { ctx.beginPath(); ctx.ellipse(-11.5, -187 + br, 6.4, 6.8, 0.3, 0, TAU); }, o.hair);
      if (hs === 'long') sh(() => { ctx.beginPath(); ctx.moveTo(-4, -206 + br); ctx.bezierCurveTo(-19, -205 + br, -23, -182, -23 + wind * 0.5, -152); ctx.bezierCurveTo(-22 + wind * 0.7, -138, -14 + wind * 0.6, -134, -6, -140); ctx.bezierCurveTo(-9, -160, -6, -178 + br, 4, -190 + br); ctx.closePath(); }, o.hair);
      if (hs === 'tail') gearBehind(ctx, { ...o, pack: null, hood: null }, t, br, wind, sh);
    }

    /* ---------- lowered arm (hidden under a cloak) */
    if (outer !== 'cloak') {
      const slv = o.sleeve || o.coat;
      if (o.backSleeve === 'rolled') {
        sh(() => limbPath(ctx, [[-17, -158 + br, 4.6], [-21.5, -127 + br, 4]]), slv, o.coatShade);
        sh(() => limbPath(ctx, [[-21.6, -131 + br, 4.4], [-21.4, -125 + br, 4.3]]), o.cuff || slv);
        sh(() => limbPath(ctx, [[-21.5, -125 + br, 3.3], [-18.5, -97 + br, 2.8]]), o.skin, o.skinShade);
      } else sh(() => limbPath(ctx, [[-17, -158 + br, 4.5], [-21.5, -125 + br, 3.9], [-18.5, -97 + br, 3.1]]), slv, o.sleeveShade || o.coatShade);
      if (o.suitLine) line([[-19, -150 + br], [-22.5, -125 + br], [-20, -102 + br]], o.suitLine, 0.8);
      if (o.bracer) { sh(() => limbPath(ctx, [[-21.2, -119 + br, 3.9], [-19.1, -100 + br, 3.4]]), o.bracer); for (let k = 0; k < 4; k++) line([[-24.6, -116 + k * 4.6 + br], [-17.2, -114 + k * 4.6 + br]], seam, 0.7); }
      if (o.armPlate) { sh(() => limbPath(ctx, [[-21.4, -120 + br, 4.4], [-19.4, -103 + br, 3.9]]), o.armPlate, o.plateShade); glowLine([[-23.4, -117 + br], [-21.8, -105 + br]], 0.9, 6); }
      sh(() => { ctx.beginPath(); ctx.ellipse(-18, -92.5 + br, 2.9, 3.6, 0.2, 0, TAU); }, o.glove || o.skin, o.skinShade);
      if (o.gauntlet) gearBackArm(ctx, o, t, br, sh);
    }
    if (o.staff) staffDraw(ctx, o, t, br);

    /* ---------- legs and boots */
    const drawBoots = () => {
      if (bt === 'bare') {
        sh(() => { ctx.beginPath(); ctx.moveTo(-12.5, -12); ctx.lineTo(-5.5, -12); ctx.lineTo(-4.5, -5); ctx.quadraticCurveTo(2, -4, 3, -1); ctx.lineTo(3, 0); ctx.lineTo(-12.5, 0); ctx.closePath(); }, o.skin, o.skinShade);
        sh(() => { ctx.beginPath(); ctx.moveTo(9, -12); ctx.lineTo(15.5, -12); ctx.lineTo(16, -6); ctx.quadraticCurveTo(23, -4.6, 24.5, -1); ctx.lineTo(24.5, 0); ctx.lineTo(9, 0); ctx.closePath(); }, o.skin, o.skinShade);
        return;
      }
      const top = bt === 'short' ? -19 : bt === 'wrap' ? -30 : -40;
      sh(() => { ctx.beginPath(); ctx.moveTo(-13.5, top); ctx.lineTo(-4.5, top); ctx.lineTo(-4, -7); ctx.quadraticCurveTo(2, -5, 3, -1); ctx.lineTo(3, 0); ctx.lineTo(-14, 0); ctx.closePath(); }, o.boots, o.bootsShade);
      sh(() => { ctx.beginPath(); ctx.moveTo(8, top); ctx.lineTo(16.8, top); ctx.lineTo(17, -8); ctx.quadraticCurveTo(24, -6, 25.5, -1); ctx.lineTo(25.5, 0); ctx.lineTo(8, 0); ctx.closePath(); }, o.boots, o.bootsShade);
      if (bt === 'wrap') for (let k = 0; k < 4; k++) { line([[-13.5, top + 4 + k * 6], [-4.5, top + 7 + k * 6]], o.wrapLine || seam, 0.9); line([[8, top + 4 + k * 6], [16.8, top + 7 + k * 6]], o.wrapLine || seam, 0.9); }
      if (o.bootBand) { ctx.save(); ctx.fillStyle = o.bootBand; ctx.fillRect(-13.5, top + 4, 9, 2); ctx.fillRect(8, top + 4, 8.8, 2); ctx.restore(); }
      if (o.techSole) { glowLine([[-14, -1.2], [3, -1.2]], 1.2, 6); glowLine([[8, -1.2], [25.5, -1.2]], 1.2, 6); }
      if (o.bootPlate) gearBoots(ctx, o, t, sh);
    };
    if (pants === 'wide') {
      drawBoots();
      sh(() => { poly(ctx, [[-14, -102], [0, -102], [-1, -60], [-2 + wind * 0.3, -8], [-22 + wind * 0.4, -8], [-16.5, -60]]); ctx.closePath(); }, o.legs, o.legsShade);
      sh(() => { poly(ctx, [[1, -102], [15, -102], [17, -60], [25 + wind * 0.3, -8], [4 + wind * 0.2, -8], [2.5, -60]]); ctx.closePath(); }, o.legs, o.legsShade);
      line([[-8, -90], [-12 + wind * 0.2, -20]], seam, 0.8); line([[8.5, -90], [13 + wind * 0.2, -22]], seam, 0.8);
      if (o.hemTrim) { line([[-22 + wind * 0.4, -10], [-2 + wind * 0.3, -10]], o.hemTrim, 1.4); line([[4 + wind * 0.2, -10], [25 + wind * 0.3, -10]], o.hemTrim, 1.4); }
    } else {
      const wv = pants === 'cargo' ? 1.15 : pants === 'pj' ? 1.3 : 1;
      sh(() => limbPath(ctx, [[-6, -101, 6.2 * wv], [-8, -52, 4.5 * wv], [-9, -14, 3.4]]), o.legs, o.legsShade);
      sh(() => limbPath(ctx, [[7, -101, 6.2 * wv], [10, -52, 4.5 * wv], [12, -14, 3.4]]), o.legs, o.legsShade);
      if (pants === 'cargo') {
        sh(() => { ctx.beginPath(); ctx.rect(-15.5, -84, 7.4, 10); }, o.pocket || o.legs); line([[-15.5, -81], [-8.1, -81]], seam, 0.8);
        sh(() => { ctx.beginPath(); ctx.rect(13.5, -84, 7.4, 10); }, o.pocket || o.legs); line([[13.5, -81], [20.9, -81]], seam, 0.8);
        if (o.pad) { sh(() => { ctx.beginPath(); ctx.ellipse(-8, -52, 5.4, 6.4, 0, 0, TAU); }, o.pad); sh(() => { ctx.beginPath(); ctx.ellipse(10, -52, 5.4, 6.4, 0, 0, TAU); }, o.pad); }
      }
      if (pants === 'pj') { ctx.save(); ctx.fillStyle = o.pjDot || 'rgba(255,255,255,.4)'; for (let k = 0; k < 12; k++) { const px = (k % 2 ? 9 : -8) + ((k * 3.1) % 6) - 3, py = -96 + ((k * 13.3) % 82); ctx.beginPath(); ctx.arc(px, py, 1, 0, TAU); ctx.fill(); } ctx.restore(); }
      if (pants === 'suit' && o.suitLine) { line([[-11.5, -98], [-12.5, -52], [-12, -16]], o.suitLine, 0.8); line([[13, -98], [14.4, -52], [15.2, -16]], o.suitLine, 0.8); line([[-12, -56], [-4, -56]], o.suitLine, 0.8); line([[6, -56], [14.4, -56]], o.suitLine, 0.8); }
      if (pants === 'armor') {
        [[-8, -52], [10, -52]].forEach(([kx, ky]) => sh(() => { ctx.beginPath(); ctx.ellipse(kx, ky, 5.6, 5, 0, 0, TAU); }, o.plate, o.plateShade));
        sh(() => { poly(ctx, [[-13.6, -46], [-4.4, -46], [-4.6, -22], [-13.4, -22]]); ctx.closePath(); }, o.plate, o.plateShade);
        sh(() => { poly(ctx, [[7.8, -46], [17, -46], [17, -22], [8, -22]]); ctx.closePath(); }, o.plate, o.plateShade);
        line([[-9, -44], [-9, -24]], o.plateLight || seam, 0.8); line([[12.4, -44], [12.4, -24]], o.plateLight || seam, 0.8);
      }
      drawBoots();
    }

    /* ---------- torso base */
    sh(() => { ctx.beginPath(); ctx.moveTo(-16, -163 + br); ctx.quadraticCurveTo(0, -165 + br, 16, -163 + br); ctx.quadraticCurveTo(14, -140, 12, -121); ctx.lineTo(14.5, -100); ctx.lineTo(-13.5, -100); ctx.lineTo(-12, -121); ctx.quadraticCurveTo(-14, -140, -16, -163 + br); ctx.closePath(); }, o.top, o.topShade);

    /* ---------- outer garment */
    if (outer === 'pajamas') {
      sh(() => { poly(ctx, [[-6, -163.5 + br], [-17, -163 + br], [-19, -150], [-17, -128], [-18, -104], [18.5, -104], [17.5, -128], [19.5, -150], [17.5, -163 + br], [6, -163.5 + br], [0.5, -158 + br]]); ctx.closePath(); }, o.top, o.topShade);
      ctx.save(); ctx.fillStyle = o.pjDot || 'rgba(255,255,255,.4)';
      for (let k = 0; k < 14; k++) { const px = -15 + ((k * 7.3) % 32), py = -156 + ((k * 11.7) % 50); ctx.beginPath(); ctx.arc(px, py + br * 0.5, k % 3 ? 0.9 : 1.4, 0, TAU); ctx.fill(); }
      ctx.restore();
    } else if (outer === 'longcoat') {
      sh(() => { ctx.beginPath(); ctx.moveTo(-6, -163 + br); ctx.lineTo(-16, -163.5 + br); ctx.quadraticCurveTo(-20.5, -162 + br, -20, -155 + br); ctx.quadraticCurveTo(-16, -138, -14, -121); ctx.quadraticCurveTo(-20, -90, -28 + wind, -42); ctx.quadraticCurveTo(-17, -40, -7, -41); ctx.lineTo(-3.5, -121); ctx.lineTo(-5.5, -153 + br); ctx.closePath(); }, o.coat, o.coatShade);
      sh(() => { ctx.beginPath(); ctx.moveTo(6, -163 + br); ctx.lineTo(16, -163.5 + br); ctx.quadraticCurveTo(20.5, -162 + br, 20, -155 + br); ctx.quadraticCurveTo(16, -138, 14, -121); ctx.quadraticCurveTo(18, -90, 26 + wind * 0.6, -43); ctx.quadraticCurveTo(16, -41, 7, -42); ctx.lineTo(3.5, -121); ctx.lineTo(5.5, -153 + br); ctx.closePath(); }, o.coat, o.coatShade);
      sh(() => { ctx.beginPath(); ctx.rect(-14.5, -121.5, 29, 4.4); }, o.belt);
      gearCoat(ctx, o, t, br, wind, sh);
    } else if (outer === 'jacket') {
      sh(() => { poly(ctx, [[-8, -163.5 + br], [-16, -163.5 + br], [-20.5, -156 + br], [-17.5, -138], [-15.5, -114], [16, -114], [18, -138], [20.5, -156 + br], [16, -163.5 + br], [8, -163.5 + br], [0, -156 + br]]); ctx.closePath(); }, o.coat, o.coatShade);
      sh(() => { ctx.beginPath(); ctx.rect(-15.5, -119, 31.5, 5); }, o.hemBand || o.belt);
      line([[-14, -146], [-6, -144]], seam, 0.8); line([[14.5, -146], [6.5, -144]], seam, 0.8);
      line([[-17, -132], [-9, -131]], seam, 0.8); line([[17.5, -132], [9.5, -131]], seam, 0.8);
      glowLine([[0.4, -155 + br], [1.2, -119]], 1.1, 7);
      sh(() => { ctx.beginPath(); ctx.rect(-14, -108, 28.5, 4.2); }, o.belt);
      sh(() => { ctx.beginPath(); ctx.rect(8, -106, 6, 9); }, o.holster || o.belt);
      if (o.pauldron) gearCoat(ctx, { ...o, panels: null, asym: null, hemLight: null, moss: null, harness: null, vials: null, beltTech: null }, t, br, wind, sh);
    } else if (outer === 'vest') {
      sh(() => { poly(ctx, [[-8, -164 + br], [-19.5, -163 + br], [-22, -150 + br], [-20.5, -132], [-19, -110], [19.5, -110], [21, -132], [22.5, -150 + br], [20, -163 + br], [8, -164 + br], [0.5, -150 + br]]); ctx.closePath(); }, o.vest, o.vestShade);
      for (let k = 0; k < 5; k++) { const yy = -152 + k * 9; line([[-21, yy + (k ? 0 : br)], [-1.5, yy + 1]], seam, 0.8); line([[2.5, yy + 1], [21.5, yy + (k ? 0 : br)]], seam, 0.8); }
      line([[0.5, -150 + br], [0.5, -110]], o.zip || seam, 1.1);
      [[-18, -130], [11, -130]].forEach(([px, py]) => { sh(() => { ctx.beginPath(); ctx.rect(px, py, 7.5, 9); }, o.pocket || o.vest); line([[px, py + 2.6], [px + 7.5, py + 2.6]], seam, 0.8); });
      sh(() => { ctx.beginPath(); ctx.rect(-12, -150 + br, 5, 7); }, o.radio || '#2a2a22'); dot(-9.5, -148 + br, 0.9, o.glowCore, o.glow);
      sh(() => { ctx.beginPath(); ctx.rect(-14, -106, 28.5, 4.2); }, o.belt);
    } else if (outer === 'suit') {
      sh(() => { poly(ctx, [[-16, -163.5 + br], [-6, -163.5 + br], [0, -146], [6, -163.5 + br], [16, -163.5 + br], [14.5, -140], [0, -131], [-13.5, -140]]); ctx.closePath(); }, o.panel, o.panelShade);
      sh(() => { poly(ctx, [[-13, -118], [-6, -118], [-5, -100], [-13.5, -100]]); ctx.closePath(); }, o.panel);
      sh(() => { poly(ctx, [[6.5, -118], [13.5, -118], [14.5, -100], [6, -100]]); ctx.closePath(); }, o.panel);
      if (o.harness) {
        sh(() => { poly(ctx, [[-14, -163 + br], [-10.8, -163 + br], [1.6, -142], [-1.6, -140]]); ctx.closePath(); }, o.harness);
        sh(() => { poly(ctx, [[14, -163 + br], [10.8, -163 + br], [-1.6, -142], [1.6, -140]]); ctx.closePath(); }, o.harness);
        sh(() => { poly(ctx, [[-1.6, -140], [1.6, -140], [1.6, -112], [-1.6, -112]]); ctx.closePath(); }, o.harness);
      }
      sh(() => { ctx.beginPath(); ctx.arc(0, -140, 4.2, 0, TAU); }, o.harness || o.panel);
      dot(0, -140, 2.4, o.glowCore, o.glow);
      sh(() => { poly(ctx, [[-14, -110], [15, -104], [15, -100], [-14, -105.5]]); ctx.closePath(); }, o.belt);
      sh(() => { ctx.beginPath(); ctx.rect(9, -104, 6.4, 10); }, o.holster || o.belt); dot(12.2, -100, 0.9, o.amber || '#ffc66b', o.amber || '#ffc66b');
      if (o.suitLine) { line([[-12.8, -138], [-12, -121]], o.suitLine, 0.8); line([[13.5, -138], [12.5, -121]], o.suitLine, 0.8); }
    } else if (outer === 'tunic') {
      sh(() => { poly(ctx, [[-6, -163.5 + br], [-16, -163.5 + br], [-18, -150], [-14, -121], [-19, -92], [-25 + wind, -58], [-3.5, -60], [-1.5, -118], [-3.5, -152 + br]]); ctx.closePath(); }, o.coat, o.coatShade);
      sh(() => { poly(ctx, [[6, -163.5 + br], [16, -163.5 + br], [18, -150], [14, -121], [18.5, -92], [23 + wind * 0.6, -60], [3.5, -61], [1.5, -118], [3.5, -152 + br]]); ctx.closePath(); }, o.coat, o.coatShade);
      if (o.trim) {
        line([[-25 + wind, -58], [-3.5, -60]], o.trim, 2); line([[3.5, -61], [23 + wind * 0.6, -60]], o.trim, 2);
        line([[-3.5, -152 + br], [-1.5, -118], [-3.5, -60]], o.trim, 1.4); line([[3.5, -152 + br], [1.5, -118], [3.5, -61]], o.trim, 1.4);
        ctx.save(); ctx.fillStyle = o.glowLine || o.vein; if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 5; } ctx.globalAlpha = 0.7 + 0.3 * pulse;
        for (let k = 0; k < 4; k++) { const u = (k + 0.5) / 4; [[lerp(-24 + wind, -5, u), -63.5], [lerp(5, 22 + wind * 0.6, u), -64]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.moveTo(dx, dy - 2); ctx.lineTo(dx + 1.6, dy); ctx.lineTo(dx, dy + 2); ctx.lineTo(dx - 1.6, dy); ctx.closePath(); ctx.fill(); }); }
        ctx.restore();
      }
      sh(() => { ctx.beginPath(); ctx.rect(-15, -126, 30, 8); }, o.sash, o.sashShade);
      sh(() => { poly(ctx, [[-9, -119], [-5, -119], [-8 + wind * 0.5, -84], [-13 + wind * 0.6, -86]]); ctx.closePath(); }, o.sash, o.sashShade);
      sh(() => { poly(ctx, [[-5, -119], [-1.5, -119], [-2.5 + wind * 0.4, -90], [-6.5 + wind * 0.5, -90]]); ctx.closePath(); }, o.sash);
      sh(() => { ctx.beginPath(); ctx.ellipse(-5, -121, 3.6, 3, 0, 0, TAU); }, o.sash, o.sashShade);
    } else if (outer === 'armor') {
      sh(() => { poly(ctx, [[-15, -110], [15, -110], [19, -70], [-18, -70]]); ctx.closePath(); }, o.under, o.underShade);
      [-1, 1].forEach((side) => [0, 1, 2].forEach((k) => {
        const x0 = side < 0 ? -17 + k * 4 : 4 + k * 4.6, rot = side * (0.06 + k * 0.02);
        ctx.save(); ctx.translate(x0 + 3, -108); ctx.rotate(rot);
        sh(() => { poly(ctx, [[-3.4, 0], [3.4, 0], [3.8, 22 + k * 2], [-3.8, 22 + k * 2]]); ctx.closePath(); }, o.plate, o.plateShade);
        line([[-3.4, 2.4], [3.4, 2.4]], o.plateLight || seam, 0.7);
        ctx.restore();
      }));
      [0, 1, 2].forEach((k) => sh(() => { ctx.beginPath(); ctx.moveTo(-13.4 - k * 0.2, -122 + k * 4.4); ctx.quadraticCurveTo(0, -119 + k * 4.4, 14 + k * 0.2, -122 + k * 4.4); ctx.lineTo(14.2 + k * 0.2, -117 + k * 4.4); ctx.quadraticCurveTo(0, -114 + k * 4.4, -13.6 - k * 0.2, -117 + k * 4.4); ctx.closePath(); }, o.plate2 || o.plate, o.plateShade));
      sh(() => { poly(ctx, [[-6, -162 + br], [-15.5, -163.5 + br], [-19.5, -156 + br], [-17, -136], [-13, -121], [13.5, -121], [17.5, -136], [19.5, -156 + br], [15.5, -163.5 + br], [6, -162 + br], [0, -157 + br]]); ctx.closePath(); }, o.plate, o.plateShade);
      line([[0, -156 + br], [0.3, -123]], o.plateLight || seam, 1);
      ctx.save(); glowStroke(ctx, o, o.glowLine || o.vein, 1, 7); ctx.globalAlpha = 0.7 + 0.3 * pulse; ctx.beginPath(); ctx.moveTo(-14.5, -159 + br); ctx.quadraticCurveTo(-8, -154, -6, -162 + br); ctx.stroke(); ctx.beginPath(); ctx.moveTo(14.5, -159 + br); ctx.quadraticCurveTo(8, -154, 6, -162 + br); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(0, -140); ctx.fillStyle = o.glowCore; if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 10 * pulse; } ctx.beginPath(); ctx.moveTo(0, -4.4); ctx.lineTo(3, 0); ctx.lineTo(0, 4.4); ctx.lineTo(-3, 0); ctx.closePath(); ctx.fill(); ctx.restore();
      if (o.pauldron) gearCoat(ctx, { ...o, panels: null, asym: null, hemLight: null, moss: null, harness: null, vials: null, beltTech: null }, t, br, wind, sh);
    } else if (outer === 'cloak') {
      sh(() => { ctx.beginPath(); ctx.moveTo(-1, -166 + br); ctx.lineTo(-15, -166 + br); ctx.quadraticCurveTo(-22, -160 + br, -23, -148); ctx.quadraticCurveTo(-30, -96, -38 + wind * 1.2, -37); ctx.quadraticCurveTo(-22, -35, -6, -38); ctx.quadraticCurveTo(-3, -100, -1, -150); ctx.closePath(); }, o.coat, o.coatShade);
      sh(() => { ctx.beginPath(); ctx.moveTo(1, -166 + br); ctx.lineTo(12, -166 + br); ctx.lineTo(17, -160 + br); ctx.lineTo(20, -150); ctx.quadraticCurveTo(27, -96, 34 + wind * 0.8, -39); ctx.quadraticCurveTo(20, -36, 5, -38); ctx.quadraticCurveTo(3, -100, 1, -150); ctx.closePath(); }, o.coat, o.coatShade);
      if (o.trim) {
        line([[-1, -150], [-3, -100], [-6, -38]], o.trim, 1.6); line([[1, -150], [3, -100], [5, -38]], o.trim, 1.6);
        line([[-38 + wind * 1.2, -37], [-22, -35], [-6, -38]], o.trim, 2); line([[5, -38], [20, -36], [34 + wind * 0.8, -39]], o.trim, 2);
      }
      ctx.save(); glowStroke(ctx, o, o.glowLine || o.vein, 0.9, 6); ctx.globalAlpha = 0.6 + 0.4 * pulse;
      const rune = (rx, ry) => { poly(ctx, [[rx - 2, ry + 2], [rx, ry - 2.5], [rx + 2, ry + 2]]); ctx.stroke(); poly(ctx, [[rx - 1, ry], [rx + 1, ry]]); ctx.stroke(); };
      for (let k = 0; k < 4; k++) { rune(lerp(-33 + wind, -9, (k + 0.5) / 4), -44); rune(lerp(8, 30 + wind * 0.8, (k + 0.5) / 4), -45); }
      ctx.restore();
      sh(() => { ctx.beginPath(); ctx.arc(0, -160 + br, 3.6, 0, TAU); }, o.trim || o.belt); dot(0, -160 + br, 1.8, o.glowCore, o.glow);
    }
    gearBraid(ctx, o, t, br, wind, sh);
    if (o.necklace) {
      ctx.save(); ctx.strokeStyle = o.cord || '#3a2a1c'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-7, -165 + br); ctx.quadraticCurveTo(0, -150 + br, 8, -165 + br); ctx.stroke(); ctx.restore();
      [[-4.2, -157.5], [0.4, -154.6], [4.8, -157.8]].forEach(([nx, ny], k) => { ctx.save(); ctx.translate(nx, ny + br); ctx.fillStyle = k === 1 ? o.crystal : o.crystal2; if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 6; } ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(1.6, 2); ctx.lineTo(0, 5 + (k === 1 ? 2 : 0)); ctx.lineTo(-1.6, 2); ctx.closePath(); ctx.fill(); ctx.restore(); });
    }

    /* ---------- front arm: idle (down) or casting (raised), blended by o.cast */
    const up = o.upSleeve || o.sleeve || o.coat;
    if (outer === 'pajamas') {
      sh(() => limbPath(ctx, [[S0[0], S0[1], 4.9], [E[0], E[1], 4.3]]), up, o.sleeveShade || o.topShade);
    } else sh(() => limbPath(ctx, [[S0[0], S0[1], 4.6], [E[0], E[1], 3.9]]), up, o.sleeveShade || o.coatShade);
    if (outer === 'cloak') sh(() => { const d1 = LP(E, Wr, 0.0); poly(ctx, [[14, -162 + br], [d1[0] + 1, d1[1] - 2], [d1[0] + 3, d1[1] + 15 * (0.4 + 0.6 * K)], [27, -150 + (1 - K) * 20], [19, -140 + (1 - K) * 24]]); ctx.closePath(); }, o.coat, o.coatShade);
    if (o.cuff) { const c0 = LP(S0, E, 0.9), c1 = LP(E, Wr, 0.14); sh(() => limbPath(ctx, [[c0[0], c0[1], 4.2], [c1[0], c1[1], 4]]), o.cuff); }
    if (o.shoulderPlate) sh(() => { ctx.beginPath(); ctx.ellipse(19.5, -161 + br, 7, 5, 0.8, 0, TAU); }, o.shoulderPlate, o.plateShade);
    if (o.armPlate) { const a0 = LP(S0, E, 0.12), a1 = LP(S0, E, 0.6); sh(() => limbPath(ctx, [[a0[0] + 2, a0[1] - 2, 5.2], [a1[0], a1[1], 4.6]]), o.armPlate, o.plateShade); }
    const fa0 = outer === 'pajamas' ? LP(E, Wr, 0.55) : E;
    if (outer === 'pajamas') sh(() => limbPath(ctx, [[E[0], E[1], 4.2], [fa0[0], fa0[1], 3.6]]), up, o.topShade);
    sh(() => limbPath(ctx, [[fa0[0], fa0[1], 3.3], [Wr[0], Wr[1], 2.7]]), o.skin, o.skinShade);
    sh(() => { ctx.beginPath(); ctx.ellipse(HD[0], HD[1], lerp(2.9, 3.6, K), lerp(3.6, 2.7, K), lerp(0.2, -0.9, K), 0, TAU); }, o.glove || o.skin, o.skinShade);
    if (K > 0.35) {
      ctx.save(); ctx.globalAlpha = Math.min(1, (K - 0.35) / 0.5); ctx.strokeStyle = o.skin; ctx.lineCap = 'round'; ctx.lineWidth = 1.7;
      if (o.mode === 'paint' && o.rim) { ctx.shadowColor = o.rim; ctx.shadowBlur = 6; }
      [[-2.3, 0.5, -4.5, -4.5], [-0.5, -2.5, -1.3, -9], [1.2, -2.8, 1.9, -9.5], [2.6, -1.8, 4.7, -7.3], [3.1, -0.2, 6.3, -4.1]].forEach(([a, b, c, d]) => { ctx.beginPath(); ctx.moveTo(HD[0] + a, HD[1] + b); ctx.lineTo(HD[0] + c, HD[1] + d); ctx.stroke(); });
      ctx.restore();
    }

    /* ---------- neck, collar, head */
    sh(() => { ctx.beginPath(); ctx.moveTo(-3, -177 + br); ctx.lineTo(5.5, -177 + br); ctx.lineTo(6.2, -163 + br); ctx.lineTo(-3.8, -163 + br); ctx.closePath(); }, o.skin);
    const cs = o.collarStyle || 'band';
    if (cs === 'ring') {
      sh(() => { ctx.beginPath(); ctx.ellipse(1.2, -165 + br, 10, 3.6, 0, 0, TAU); }, o.collar || o.panel);
      glowLine([[-7.5, -166 + br], [1, -168.2 + br], [9.6, -166 + br]], 1, 7);
    } else if (cs === 'v') {
      sh(() => { poly(ctx, [[-6, -164 + br], [0.5, -154 + br], [7, -164 + br], [4, -164 + br], [0.5, -158 + br], [-3, -164 + br]]); ctx.closePath(); }, o.trim || o.coat);
    } else if (cs !== 'none' && !gearCollar(ctx, o, t, br, sh)) {
      sh(() => { ctx.beginPath(); ctx.moveTo(-8.5, -163 + br); ctx.lineTo(-7.6, -169.5 + br); ctx.quadraticCurveTo(0, -167.5 + br, 8.4, -170 + br); ctx.lineTo(9.2, -163 + br); ctx.quadraticCurveTo(0, -160.5 + br, -8.5, -163 + br); ctx.closePath(); }, o.collar || o.coat, o.coatShade);
    }
    sh(() => {
      ctx.beginPath(); ctx.moveTo(1, -200 + br);
      ctx.bezierCurveTo(9, -200 + br, 13, -194 + br, 12.6, -187 + br);
      ctx.bezierCurveTo(12.6, -182 + br, 11, -178 + br, 6.2, -173.6 + br);
      ctx.quadraticCurveTo(3, -172 + br, 0, -174.2 + br);
      ctx.bezierCurveTo(-5, -176 + br, -9, -180 + br, -9.6, -187 + br);
      ctx.bezierCurveTo(-10, -195 + br, -6, -200 + br, 1, -200 + br); ctx.closePath();
    }, o.skin);
    if (o.face) {
      const F = o.face;
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = F; ctx.lineWidth = 1.05;
      ctx.beginPath(); ctx.moveTo(-1.2, -191 + br); ctx.quadraticCurveTo(2, -192.8 + br, 4.6, -191.8 + br); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7.6, -192 + br); ctx.quadraticCurveTo(9.8, -192.8 + br, 11.4, -191.2 + br); ctx.stroke();
      ctx.fillStyle = o.eyeWhite || '#f6efe6';
      ctx.beginPath(); ctx.moveTo(-0.4, -187.6 + br); ctx.quadraticCurveTo(2, -189.6 + br, 4.4, -187.8 + br); ctx.quadraticCurveTo(2, -186.2 + br, -0.4, -187.6 + br); ctx.fill();
      ctx.fillStyle = o.iris || '#4a3020'; ctx.beginPath(); ctx.arc(2.6, -187.8 + br, 1.05, 0, TAU); ctx.fill();
      ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-0.6, -187.7 + br); ctx.quadraticCurveTo(2, -190 + br, 4.6, -188 + br); ctx.stroke();
      ctx.strokeStyle = o.faceSoft || F; ctx.lineWidth = 0.85;
      ctx.beginPath(); ctx.moveTo(10.2, -186.5 + br); ctx.quadraticCurveTo(12.6, -181.5 + br, 10.4, -180.6 + br); ctx.stroke();
      ctx.fillStyle = o.lips || '#a8584a';
      ctx.beginPath(); ctx.moveTo(5.4, -177 + br); ctx.quadraticCurveTo(7.6, -178.2 + br, 9.8, -177.4 + br); ctx.quadraticCurveTo(7.8, -175.4 + br, 5.4, -177 + br); ctx.fill();
      ctx.restore();
    }
    if (o.eyes === 'closed') {
      ctx.save(); ctx.fillStyle = o.skin; ctx.beginPath(); ctx.ellipse(2, -187.8 + br, 3.2, 2.2, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = o.face || '#3a2016'; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-0.4, -187.4 + br); ctx.quadraticCurveTo(2, -186.2 + br, 4.4, -187.4 + br); ctx.stroke();
      ctx.strokeStyle = MK > 0.3 ? o.glowCore : (o.face || '#3a2016'); if (MK > 0.3 && !o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 6; }
      ctx.beginPath(); ctx.moveTo(7.8, -187.4 + br); ctx.quadraticCurveTo(9.6, -186.4 + br, 11.4, -187.4 + br); ctx.stroke(); ctx.restore();
    } else if (MK > 0.3) {
      ctx.save(); if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 9; }
      ctx.fillStyle = o.glowCore; ctx.globalAlpha = Math.min(1, (MK - 0.3) * 3);
      ctx.beginPath(); ctx.moveTo(7.8, -187.6 + br); ctx.quadraticCurveTo(9.6, -189.2 + br, 11.4, -187.7 + br); ctx.quadraticCurveTo(9.6, -186.4 + br, 7.8, -187.6 + br); ctx.fill();
      ctx.restore();
    } else if (o.face) {
      ctx.save(); ctx.fillStyle = o.eyeWhite || '#f6efe6';
      ctx.beginPath(); ctx.moveTo(7.8, -187.6 + br); ctx.quadraticCurveTo(9.6, -189.2 + br, 11.4, -187.7 + br); ctx.quadraticCurveTo(9.6, -186.4 + br, 7.8, -187.6 + br); ctx.fill();
      ctx.fillStyle = o.iris || '#4a3020'; ctx.beginPath(); ctx.arc(9.9, -187.8 + br, 0.85, 0, TAU); ctx.fill(); ctx.restore();
    }
    if (o.mouth === 'open') { ctx.save(); ctx.fillStyle = '#4a1e16'; ctx.beginPath(); ctx.ellipse(7.6, -176.6 + br, 1.8, 1.6, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    if (o.beard) sh(() => { ctx.beginPath(); ctx.moveTo(-6.5, -181 + br); ctx.bezierCurveTo(-6, -173 + br, -1, -168.5 + br, 4.5, -168 + br); ctx.bezierCurveTo(9, -168 + br, 12, -172 + br, 12.4, -179 + br); ctx.bezierCurveTo(11, -176 + br, 9, -174.5 + br, 7.6, -175.4 + br); ctx.quadraticCurveTo(4, -178 + br, 0, -176 + br); ctx.quadraticCurveTo(-3, -178 + br, -6.5, -181 + br); ctx.closePath(); }, o.beard);

    /* ---------- hair front, hood, hat */
    if (o.hoodUp) {
      sh(() => { ctx.beginPath(); ctx.moveTo(-3, -197 + br); ctx.quadraticCurveTo(4, -201 + br, 12, -196 + br); ctx.lineTo(12, -193.5 + br); ctx.quadraticCurveTo(5, -197 + br, -3, -194 + br); ctx.closePath(); }, o.hair);
      sh(() => { ctx.beginPath(); ctx.moveTo(-9.5, -168 + br); ctx.bezierCurveTo(-15, -186 + br, -12, -207 + br, 2, -210 + br); ctx.bezierCurveTo(13, -211 + br, 18.5, -202 + br, 16.5, -188 + br); ctx.lineTo(13.4, -188.5 + br); ctx.bezierCurveTo(14.4, -199 + br, 10, -205.5 + br, 2, -205 + br); ctx.bezierCurveTo(-8, -203.5 + br, -10.5, -186 + br, -5.5, -170 + br); ctx.closePath(); }, o.hood, o.hoodShade);
      ctx.save(); glowStroke(ctx, o, o.glowLine || o.vein, 0.8, 6); ctx.globalAlpha = 0.6 + 0.4 * pulse;
      ctx.beginPath(); ctx.moveTo(-5.5, -170 + br); ctx.bezierCurveTo(-10.5, -186 + br, -8, -203.5 + br, 2, -205 + br); ctx.bezierCurveTo(10, -205.5 + br, 14.4, -199 + br, 13.4, -188.5 + br); ctx.stroke(); ctx.restore();
    } else if (hs === 'undercut') {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = o.hair;
      ctx.beginPath(); ctx.moveTo(-9.6, -193 + br); ctx.quadraticCurveTo(-10.4, -186 + br, -8.6, -180 + br); ctx.lineTo(-3.5, -181 + br); ctx.lineTo(-2.5, -193 + br); ctx.closePath(); ctx.fill(); ctx.restore();
      glowLine([[-8.6, -190 + br], [-5, -190 + br], [-3.8, -187.5 + br]], 0.6, 4); glowLine([[-8.8, -186.5 + br], [-6, -186.5 + br]], 0.6, 4);
      sh(() => { ctx.beginPath(); ctx.moveTo(-10, -192 + br); ctx.bezierCurveTo(-11, -208 + br, 13, -213 + br, 15.5, -194 + br); ctx.bezierCurveTo(11, -199 + br, 3, -199 + br, -2.5, -194 + br); ctx.quadraticCurveTo(-6, -193.5 + br, -10, -192 + br); ctx.closePath(); }, o.hair);
    } else {
      sh(() => { ctx.beginPath(); ctx.moveTo(-10.5, -183 + br); ctx.bezierCurveTo(-13.5, -207 + br, 15, -209 + br, 13.2, -190 + br); ctx.bezierCurveTo(8, -197.5 + br, 0, -197.5 + br, -5, -192 + br); ctx.bezierCurveTo(-6.4, -189 + br, -7.4, -186 + br, -8.2, -182 + br); ctx.closePath(); }, o.hair);
      if (hs === 'long') {
        sh(() => { ctx.beginPath(); ctx.moveTo(-10.5, -186 + br); ctx.bezierCurveTo(-12, -172 + br, -11 + wind * 0.3, -160, -12 + wind * 0.4, -146); ctx.lineTo(-7 + wind * 0.3, -148); ctx.bezierCurveTo(-7, -162 + br, -7.5, -174 + br, -7, -184 + br); ctx.closePath(); }, o.hair);
        [[-10.2, -168], [-10.6, -158], [-10.2 + wind * 0.3, -150]].forEach(([bx, by]) => dot(bx, by + br, 1.2, o.glowCore, o.glow));
      }
    }
    if (o.hat) {
      sh(() => { ctx.beginPath(); ctx.ellipse(1.5, -199.5 + br, 23, 4.8, -0.06, 0, TAU); }, o.hat, o.hatShade);
      sh(() => { ctx.beginPath(); ctx.moveTo(-9.5, -200 + br); ctx.bezierCurveTo(-10, -217 + br, 13, -219 + br, 12.5, -201 + br); ctx.quadraticCurveTo(1.5, -198 + br, -9.5, -200 + br); ctx.closePath(); }, o.hat, o.hatShade);
      sh(() => { ctx.beginPath(); ctx.moveTo(-9.8, -204.5 + br); ctx.quadraticCurveTo(1.5, -202 + br, 12.8, -205 + br); ctx.lineTo(12.6, -201.6 + br); ctx.quadraticCurveTo(1.5, -198.6 + br, -9.6, -201 + br); ctx.closePath(); }, o.hatBand);
      [-5, 1.5, 8].forEach((bx, k) => dot(bx, -202.8 + br + (k === 1 ? 0.6 : 0), 0.9, o.glowCore, o.glow));
    }
    if (o.circlet) {
      ctx.save(); ctx.strokeStyle = o.circlet; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-9.6, -194 + br); ctx.quadraticCurveTo(2, -199 + br, 13, -195 + br); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(3.5, -199 + br); ctx.fillStyle = o.crystal; if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 9 * pulse; } ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(2, 0); ctx.lineTo(0, 2); ctx.lineTo(-2, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    gearHead(ctx, o, t, br, sh);

    /* ---------- the transformation marks (scaled by o.marks) */
    if (MK > 0.02) {
      ctx.save(); if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 7; }
      [[16.5, -163, 0.25, 9.5, 0], [20.5, -160.5, 0.85, 7, 1], [13, -164.5, -0.25, 6.5, 1]].forEach(([sx, sy, a, L, k], i) => {
        const g = Math.max(0, Math.min(1, MK * 3 - i * 0.6)); if (g <= 0) return; L *= g;
        ctx.save(); ctx.translate(sx, sy + br); ctx.rotate(a - 0.45);
        ctx.fillStyle = k ? o.crystal2 : o.crystal;
        ctx.beginPath(); ctx.moveTo(-2.4 * g, 0); ctx.lineTo(-0.6, -L); ctx.lineTo(0.9, -L * 0.82); ctx.lineTo(2.4 * g, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.moveTo(-0.6, -L); ctx.lineTo(0.2, -L * 0.3); ctx.lineTo(-1.4, -L * 0.2); ctx.closePath(); ctx.fill();
        ctx.restore();
      });
      ctx.restore();
      ctx.save(); ctx.strokeStyle = o.vein; ctx.fillStyle = o.vein; ctx.lineWidth = o.veinW || 0.9; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (!o.flat) { ctx.shadowColor = o.glow; ctx.shadowBlur = 5 + 7 * pulse; }
      ctx.globalAlpha = (0.7 + 0.3 * pulse) * Math.min(1, MK * 1.5);
      const dx = E[0] - Wr[0], dy = E[1] - Wr[1], dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
      const P = (u, off) => [Wr[0] + dx * u + nx * off, Wr[1] + dy * u + ny * off];
      const ln = (pts) => { poly(ctx, pts); ctx.stroke(); }, nd = (q) => { ctx.beginPath(); ctx.arc(q[0], q[1], 0.85, 0, TAU); ctx.fill(); };
      const reach = Math.min(1, MK * 1.6);
      const vp = [P(0.06, 0.3), P(0.26, -1.1), P(0.42, 0.5), P(0.6, -0.7), P(0.84, 0.2)].slice(0, 2 + Math.round(reach * 3));
      ln(vp); nd(P(0.26, -1.1)); if (reach > 0.5) { ln([P(0.42, 0.5), P(0.55, 2)]); nd(P(0.55, 2)); nd(P(0.6, -0.7)); }
      if (cs !== 'high' && cs !== 'cowl' && MK > 0.5) { ln([[2.2, -163.5 + br], [2.6, -168 + br], [4.6, -170 + br]]); nd([4.6, -170 + br]); }
      ctx.restore();
    }
    ctx.restore();
  }


  /* ===================== looks: heroine, outfits, night version, NPCs */
  const SKIN = { skin: '#d6a07a', skinShade: 'rgba(120,64,40,.28)', face: '#3a2016', faceSoft: 'rgba(90,45,25,.7)', lips: '#a4574a', iris: '#3c2a1c', outline: '#1d2a20', olw: 1.05, shadeX: -4, mode: 'cel', glow: '#6fffc4', glowCore: '#d8fff0', crystal: '#9ff5d6', crystal2: '#5fd4b0', vein: '#7affcf', glowLine: '#7affcf', seam: 'rgba(0,0,0,.28)', ground: 'rgba(20,40,20,.32)' };
  const HAIR = { hairStyle: 'tail', hair: '#3a2418', band: '#b4602e' };
  const OUTFIT = {
    pajamas: { outer: 'pajamas', top: '#b9c9b4', topShade: 'rgba(60,80,60,.22)', sleeve: '#b9c9b4', pants: 'pj', legs: '#7f9a86', legsShade: 'rgba(30,50,40,.22)', pjDot: 'rgba(255,255,240,.55)', bootStyle: 'bare', collarStyle: 'none', band: '#7f9a86' },
    stifinder: { outer: 'longcoat', coat: '#8e5a36', coatShade: 'rgba(50,25,10,.35)', lining: '#2f7a6a', top: '#22403a', collar: '#6e4428', collarStyle: 'high', hemLight: '#6fffc4', gauntlet: '#34463c', gauntletShade: 'rgba(0,0,0,.25)', holoWrist: false, pack: '#3b4a40', packShade: 'rgba(0,0,0,.25)', legs: '#3b3328', boots: '#24180f', belt: '#6b4428', bootBand: '#c58a52' },
    vandrer: { outer: 'cloak', coat: '#3e5a34', coatShade: 'rgba(10,25,10,.35)', lining: '#24301e', trim: '#c8894a', hood: '#3e5a34', hoodShade: 'rgba(10,25,10,.3)', top: '#2a2a20', legs: '#3a3426', boots: '#4a3220', bootStyle: 'wrap', wrapLine: 'rgba(200,137,74,.7)' },
    ranger: { outer: 'jacket', coat: '#b4602e', coatShade: 'rgba(70,25,5,.35)', top: '#2c2a1c', hemBand: '#5a3a24', pauldron: '#5a3a24', plateShade: 'rgba(30,15,5,.35)', shoulderPlate: '#5a3a24', pants: 'cargo', legs: '#55603a', legsShade: 'rgba(20,30,10,.3)', pocket: '#4a5432', pad: '#3a2a1c', backSleeve: 'full', sleeve: '#b4602e', glove: '#2a1c12', belt: '#2a1c12', holster: '#3a2a1c', boots: '#2a1c12', collarStyle: 'band', collar: '#5a3a24' },
    mystiker: { outer: 'tunic', coat: '#e2d6b4', coatShade: 'rgba(110,90,50,.3)', top: '#e2d6b4', trim: '#2f7a6a', sash: '#2f7a6a', sashShade: 'rgba(0,30,20,.3)', pants: 'wide', legs: '#2a4a40', legsShade: 'rgba(0,20,15,.3)', hemTrim: '#c8a46a', sleeve: '#d6a07a', backSleeve: 'full', upSleeve: '#d6a07a', bracer: '#8a6440', collarStyle: 'v', necklace: true, boots: '#6a4a30', bootStyle: 'short' }
  };
  const ROTATION = ['stifinder', 'vandrer', 'ranger', 'mystiker'];
  function heroLook(outfit, extra) { return Object.assign({}, SKIN, HAIR, OUTFIT[outfit] || OUTFIT.stifinder, extra || {}); }

  const DARK = [12, 22, 17];
  function hexRgb(c) {
    if (typeof c !== 'string') return null;
    if (c[0] === '#') { const n = c.length === 4 ? c.slice(1).split('').map(x => parseInt(x + x, 16)) : [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; return n; }
    const m = c.match(/rgba?\(([^)]+)\)/); if (m) return m[1].split(',').slice(0, 3).map(Number);
    return null;
  }
  function mix(c, k) { const a = hexRgb(c); if (!a) return c; return `rgb(${a.map((v, i) => Math.round(v * (1 - k) + DARK[i] * k)).join(',')})`; }
  const NIGHT_KEYS = ['skin', 'hair', 'coat', 'lining', 'top', 'legs', 'boots', 'belt', 'collar', 'sleeve', 'upSleeve', 'cuff', 'hood', 'cape', 'plate', 'plate2', 'under', 'vest', 'pocket', 'pad', 'harness', 'hemBand', 'holster', 'pack', 'bigpack', 'bedroll', 'hat', 'hatBand', 'sash', 'trim', 'band', 'gauntlet', 'armPlate', 'pauldron', 'shoulderPlate', 'bootPlate', 'glove', 'bracer', 'panel', 'cowl', 'beard', 'radio', 'zip', 'bootBand', 'robe', 'body', 'spots', 'belly', 'leg', 'legDark', 'tail', 'snout', 'antler'];
  // the night version: same outfit, sunk into dark green, outlined by a rim of light
  function nightify(o, glow) {
    glow = glow == null ? 1 : glow;
    const n = Object.assign({}, o, { mode: 'paint', outline: null, rim: `rgba(157,255,200,${0.35 + 0.65 * glow})`, rimDx: 1.3, rimDy: -1.3, rimGlow: 4 + 10 * glow, ground: 'rgba(0,0,0,.4)' });
    NIGHT_KEYS.forEach(k => { if (n[k]) n[k] = mix(n[k], k === 'skin' ? 0.62 : 0.72); });
    ['skinShade', 'coatShade', 'topShade', 'legsShade', 'bootsShade', 'sleeveShade', 'plateShade', 'hoodShade', 'capeShade', 'sashShade', 'vestShade', 'underShade', 'panelShade', 'gauntletShade', 'packShade', 'hatShade', 'bodyShade', 'robeShade'].forEach(k => { n[k] = null; });
    n.face = o.face ? mix(o.face, 0.3) : null; n.faceSoft = n.face; n.lips = o.lips ? mix(o.lips, 0.55) : null; n.eyeWhite = 'rgb(120,140,128)'; n.iris = '#0a120d';
    n.glowCore = glow > 0.4 ? '#eafff2' : '#9fdcc0';
    n.vein = glow > 0.4 ? '#c0ffd8' : 'rgba(150,230,190,.6)';
    n.glowLine = n.vein; n.veinW = 1.1;
    if (n.hemLight) n.hemLight = glow > 0.4 ? '#8affc8' : 'rgba(120,220,170,.5)';
    return n;
  }

  /* NPCs, drawn with the same body */
  const NPC = {
    birk: Object.assign({}, SKIN, { skin: '#9a6a48', skinShade: 'rgba(60,30,15,.3)', face: '#2a160c', lips: '#7a3a2c', outer: 'armor', plate: '#9a7444', plate2: '#86643a', plateShade: 'rgba(50,30,10,.35)', plateLight: 'rgba(255,230,180,.45)', under: '#24433a', underShade: 'rgba(0,0,0,.25)', top: '#24433a', sleeve: '#24433a', coat: '#24433a', armPlate: '#9a7444', pauldron: '#9a7444', cape: '#2f6a4a', capeShade: 'rgba(0,20,10,.3)', pants: 'armor', legs: '#24433a', boots: '#3a2616', hairStyle: 'undercut', hair: '#1e1410', collarStyle: 'none', marks: 0, staff: true }),
    holm: Object.assign({}, SKIN, { skin: '#e0b896', face: '#4a2a1c', outer: 'tunic', coat: '#2f5446', coatShade: 'rgba(0,20,10,.3)', top: '#2f5446', trim: '#c9a24a', sash: '#c9a24a', sashShade: 'rgba(60,40,0,.3)', pants: 'wide', legs: '#5a3a24', legsShade: 'rgba(0,0,0,.25)', hemTrim: '#c9a24a', sleeve: '#d8cfb2', backSleeve: 'full', upSleeve: '#d8cfb2', collarStyle: 'v', hairStyle: 'undercut', hair: '#8a8478', beard: '#8a8478', boots: '#3a2616', bootStyle: 'short', marks: 0 })
  };
  const DEER_DAY = { mode: 'cel', body: '#6f8f4c', bodyShade: 'rgba(30,50,20,.3)', spots: '#9cc06a', belly: '#d6caa0', leg: '#8a6040', legDark: '#6a4630', hoof: '#2a1c12', tail: '#d6caa0', antler: '#c9a77a', tip: '#7affcf', tipGlow: '#7affcf', snout: '#c9b28a', nose: '#2a1c12', eye: '#1e140c', outline: '#1d2a20', olw: 1.1, shadeX: -12, ground: 'rgba(30,50,20,.35)' };
  const DEER_NIGHT = { mode: 'paint', body: '#18231b', spots: '#22362a', belly: '#1c2a20', leg: '#141d17', legDark: '#0e1510', hoof: '#070a08', tail: '#1c2a20', antler: '#2f4a3a', tip: '#c8ffe0', tipGlow: '#7dffb0', snout: '#1c2a20', nose: '#070a08', eye: '#d9ffb0', eyeGlow: '#b8ff8a', rim: '#9dffc8', rimDx: -1.3, rimDy: -1.3, rimGlow: 10 };

  function staffDraw(ctx, o, t, br) {
    ctx.save();
    ctx.strokeStyle = o.mode === 'paint' ? '#1a201c' : '#3a2a1c'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-17, -78 + br); ctx.lineTo(-25, -238 + br); ctx.stroke();
    ctx.strokeStyle = o.mode === 'paint' ? '#2c3a30' : '#9a7444'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-23.6, -212 + br); ctx.lineTo(-24.6, -224 + br); ctx.stroke();
    ctx.fillStyle = '#c8ffe0'; ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 10 + 4 * Math.sin(t * 2);
    ctx.beginPath(); ctx.moveTo(-25.2, -246 + br); ctx.lineTo(-22.8, -238 + br); ctx.lineTo(-25.2, -230 + br); ctx.lineTo(-27.6, -238 + br); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* ===================== the Kurators: tall, elegant aliens. Feet at 0, facing right. */
  function kurator(ctx, x, y, s, o, t) {
    o = Object.assign({ robe: '#ece6d4', robeShade: 'rgba(120,110,80,.25)', trim: '#c9a24a', skin: '#c8d3c2', skinShade: 'rgba(60,80,60,.22)', eye: '#141a16', outline: '#2a2a22', olw: 1.1, mode: 'cel', shadeX: -6 }, o || {});
    const fl = Math.sin(t * 1.2 + (o.ph || 0)) * 3;
    ctx.save(); ctx.translate(x, y - 8 - fl); ctx.scale(s, s);
    const sh = (fn, fill, shade) => drawShape(ctx, o, fn, fill, shade);
    const sm = !!o.small, top = sm ? -150 : -210, br = Math.sin(t * 1.4) * 0.8;
    ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = rg(ctx, 0, 8 + fl, 0, 34, [[0, o.hover || 'rgba(255,230,160,.7)'], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.ellipse(0, 8 + fl, 34, 7, 0, 0, TAU); ctx.fill(); ctx.restore();
    // halo
    if (!sm) {
      ctx.save(); ctx.translate(-4, top - 66); ctx.rotate(-0.3);
      ctx.strokeStyle = o.trim; ctx.lineWidth = 1.6; if (o.mode === 'paint') { ctx.shadowColor = o.trim; ctx.shadowBlur = 10; }
      ctx.beginPath(); ctx.ellipse(0, 0, 30, 8, 0, 0, TAU); ctx.stroke();
      for (let k = 0; k < 6; k++) { const a = t * 0.8 + k * TAU / 6; if (Math.sin(a) < 0) continue; ctx.fillStyle = o.trim; ctx.beginPath(); ctx.arc(Math.cos(a) * 30, Math.sin(a) * 8, 1.6, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    // back sleeve
    sh(() => { ctx.beginPath(); ctx.moveTo(-16, top + 8); ctx.quadraticCurveTo(-28, top + 50, -26, top + 96); ctx.lineTo(-14, top + 98); ctx.quadraticCurveTo(-14, top + 50, -8, top + 14); ctx.closePath(); }, o.robe, o.robeShade);
    // robe
    sh(() => { ctx.beginPath(); ctx.moveTo(-9, top - 4); ctx.quadraticCurveTo(-21, top - 1, -21, top + 18); ctx.quadraticCurveTo(-28, top + 130, -34, 0); ctx.quadraticCurveTo(-2, 6, 30, 0); ctx.quadraticCurveTo(25, top + 130, 20, top + 18); ctx.quadraticCurveTo(21, top - 1, 9, top - 4); ctx.closePath(); }, o.robe, o.robeShade);
    ctx.save(); ctx.strokeStyle = o.trim; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(3, top + 2); ctx.quadraticCurveTo(5, top + 110, 1, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-33, -4); ctx.quadraticCurveTo(-2, 2, 29, -4); ctx.stroke();
    ctx.lineWidth = 0.8; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(3, top + k * 30); ctx.lineTo(8 + k, top + k * 30 + 4); ctx.stroke(); }
    ctx.restore();
    // front sleeve and hand
    if (o.point) {
      sh(() => { ctx.beginPath(); ctx.moveTo(12, top + 6); ctx.quadraticCurveTo(30, top + 14, 46, top + 22); ctx.lineTo(44, top + 34); ctx.quadraticCurveTo(26, top + 34, 10, top + 30); ctx.closePath(); }, o.robe, o.robeShade);
      sh(() => { ctx.beginPath(); ctx.moveTo(45, top + 23); ctx.lineTo(62, top + 22); ctx.lineTo(62, top + 25); ctx.lineTo(45, top + 31); ctx.closePath(); }, o.skin, o.skinShade);
    } else if (o.tablet) {
      sh(() => { ctx.beginPath(); ctx.moveTo(12, top + 6); ctx.quadraticCurveTo(24, top + 40, 24, top + 66); ctx.lineTo(12, top + 70); ctx.quadraticCurveTo(10, top + 40, 6, top + 12); ctx.closePath(); }, o.robe, o.robeShade);
      ctx.save(); ctx.translate(26, top + 66); ctx.rotate(-0.35);
      ctx.fillStyle = '#20302a'; ctx.fillRect(-2, -12, 18, 24);
      ctx.fillStyle = `rgba(110,255,210,${0.55 + 0.25 * Math.sin(t * 3)})`; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 10; ctx.fillRect(0, -10, 14, 20);
      ctx.restore();
      sh(() => { ctx.beginPath(); ctx.ellipse(24, top + 70, 3.6, 2.6, 0.3, 0, TAU); }, o.skin, o.skinShade);
    } else {
      sh(() => { ctx.beginPath(); ctx.moveTo(12, top + 6); ctx.quadraticCurveTo(26, top + 50, 18, top + 96); ctx.lineTo(6, top + 96); ctx.quadraticCurveTo(10, top + 50, 6, top + 12); ctx.closePath(); }, o.robe, o.robeShade);
      sh(() => { ctx.beginPath(); ctx.moveTo(8, top + 96); ctx.lineTo(9, top + 112); ctx.lineTo(12, top + 96); ctx.lineTo(14, top + 113); ctx.lineTo(16, top + 96); ctx.closePath(); }, o.skin, o.skinShade);
    }
    // collar and neck
    sh(() => { ctx.beginPath(); ctx.moveTo(-3, top - 2); ctx.lineTo(-4, top - (sm ? 26 : 40)); ctx.lineTo(7, top - (sm ? 26 : 40)); ctx.lineTo(8, top - 2); ctx.closePath(); }, o.skin, o.skinShade);
    sh(() => { ctx.beginPath(); ctx.moveTo(-12, top - 2); ctx.lineTo(-10, top - 16); ctx.quadraticCurveTo(2, top - 10, 13, top - 16); ctx.lineTo(14, top - 2); ctx.quadraticCurveTo(2, top + 3, -12, top - 2); ctx.closePath(); }, o.trim);
    // head
    const hy = top - (sm ? 44 : 64) + br;
    if (!sm) sh(() => { ctx.beginPath(); ctx.moveTo(-8, hy + 10); ctx.bezierCurveTo(-22, hy - 10, -24, hy - 38, -16, hy - 52); ctx.quadraticCurveTo(-10, hy - 30, -2, hy - 20); ctx.closePath(); }, o.trim);
    sh(() => { ctx.beginPath(); ctx.ellipse(4, hy, sm ? 15 : 14, sm ? 19 : 27, sm ? -0.15 : -0.32, 0, TAU); }, o.skin, o.skinShade);
    // eyes
    const blink = (t + (o.ph || 0)) % 5.2 > 5.05 ? 0.15 : 1;
    [[4, hy + 2, 6.6, 3.4], [14, hy, 4.6, 2.8]].forEach(([ex, ey, rx, ry], i) => {
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(-0.28);
      ctx.fillStyle = o.eye; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry * blink, 0, 0, TAU); ctx.fill();
      if (blink > 0.5) { ctx.fillStyle = o.eyeGlint || '#e9c46a'; ctx.beginPath(); ctx.arc(rx * 0.25, -ry * 0.2, i ? 0.9 : 1.3, 0, TAU); ctx.fill(); }
      ctx.restore();
    });
    ctx.save(); ctx.strokeStyle = 'rgba(40,50,40,.6)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(9, hy + 15 + (sm ? -2 : 0)); ctx.lineTo(14, hy + 14 + (sm ? -2 : 0)); ctx.stroke(); ctx.restore();
    ctx.restore();
  }

  /* SKIB, the wreck's AI: a holographic face */
  function skibFace(ctx, x, y, s, t, talking, alarm) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 1.3) * 3); ctx.scale(s, s);
    const gl = (t % 3.7) > 3.6 ? 3 : 0;
    ctx.translate(gl, 0);
    const col = alarm ? '255,170,110' : '120,255,210';
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(${col},.08)`; ctx.strokeStyle = `rgba(${col},.9)`; ctx.lineWidth = 2; ctx.shadowColor = `rgb(${col})`; ctx.shadowBlur = 16;
    ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + Math.PI / 6; ctx.lineTo(Math.cos(a) * 46, Math.sin(a) * 46); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 0.7; ctx.globalAlpha = 0.35;
    for (let k = -40; k < 40; k += 6) { const yy = k + ((t * 20) % 6); ctx.beginPath(); ctx.moveTo(-38, yy); ctx.lineTo(38, yy); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    const bl = (t % 4.4) > 4.25 ? 0.2 : 1;
    ctx.beginPath(); ctx.moveTo(-20, -10); ctx.lineTo(-8, -10 + (1 - bl) * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -10 + (1 - bl) * 2); ctx.lineTo(20, -10); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath();
    for (let k = 0; k <= 30; k++) { const xx = -18 + k * 1.2, a = talking ? Math.sin(k * 0.9 + t * 18) * Math.sin(k / 30 * Math.PI) * (4 + 3 * Math.sin(t * 7)) : 0; k ? ctx.lineTo(xx, 16 + a) : ctx.moveTo(xx, 16 + a); }
    ctx.stroke();
    ctx.restore();
  }

  /* ===================== scenes. Each: build(opt) → S (cached), back(ctx,t,S,G), optional front(ctx,t,S,G), ground colour */
  const SCN = {};
  const font = (w, px) => `${w} ${px}px "Space Grotesk", "DejaVu Sans", sans-serif`;

  /* ---------- Earth bedroom at night */
  SCN.bedroom = {
    ground: '#2a1f17',
    build() {
      const R = rng(5);
      const [bg, c] = off(W, H);
      c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#10202a'], [0.7, '#1a2e36'], [1, '#14222a']]); c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,255,255,.025)'; c.lineWidth = 8; for (let x = 0; x < W; x += 26) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 620); c.stroke(); }
      // window with a night city
      c.fillStyle = lg(c, 0, 160, 0, 430, [[0, '#0b1a2a'], [1, '#22404a']]); c.fillRect(232, 160, 130, 260);
      c.fillStyle = 'rgba(240,250,230,.9)'; c.beginPath(); c.arc(330, 200, 13, 0, TAU); c.fill();
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(230,240,255,${0.3 + R() * 0.5})`; c.fillRect(234 + R() * 126, 165 + R() * 120, 1.2, 1.2); }
      const sky = [];
      for (let i = 0; i < 9; i++) { const bx = 232 + i * 15 + R() * 4, bh = 60 + R() * 110; c.fillStyle = i % 2 ? '#0c1820' : '#102028'; c.fillRect(bx, 420 - bh, 16, bh); for (let k = 0; k < 8; k++) if (R() > 0.45) sky.push([bx + 3 + (k % 2) * 7, 420 - bh + 8 + Math.floor(k / 2) * 12]); }
      c.strokeStyle = '#5a3a24'; c.lineWidth = 9; c.strokeRect(232, 160, 130, 260); c.lineWidth = 5; c.beginPath(); c.moveTo(297, 160); c.lineTo(297, 420); c.moveTo(232, 290); c.lineTo(362, 290); c.stroke();
      c.fillStyle = '#4a3020'; c.fillRect(222, 420, 150, 12);
      // curtains
      c.fillStyle = 'rgba(70,120,100,.75)';
      c.beginPath(); c.moveTo(214, 146); c.quadraticCurveTo(232, 300, 214, 470); c.lineTo(240, 470); c.quadraticCurveTo(252, 300, 236, 146); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(378, 146); c.quadraticCurveTo(362, 300, 380, 470); c.lineTo(392, 470); c.lineTo(392, 146); c.closePath(); c.fill();
      c.fillStyle = '#2a2016'; c.fillRect(206, 140, 186, 6);
      // shelf, books, plant, poster
      c.fillStyle = '#4a3020'; c.fillRect(20, 300, 140, 7);
      for (let i = 0; i < 9; i++) { c.fillStyle = ['#7a4a2c', '#2f5446', '#a88a4c', '#5a6a3a', '#3a2a1c'][i % 5]; const bw = 8 + R() * 5, bh = 26 + R() * 12; c.fillRect(26 + i * 14, 300 - bh, bw, bh); }
      c.fillStyle = '#6a4a30'; c.fillRect(132, 284, 18, 16); foliage(c, 141, 274, 16, R, ['#2f5a34', '#3f7a44', '#6aa25a', null], [0.3, -0.8], 5);
      c.fillStyle = '#1d3a34'; c.fillRect(40, 170, 90, 100); c.strokeStyle = '#c58a52'; c.lineWidth = 2; c.strokeRect(46, 176, 78, 88);
      c.strokeStyle = 'rgba(110,255,200,.45)'; c.lineWidth = 1.2; c.beginPath(); c.arc(85, 214, 22, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(85, 214, 34, 7, -0.3, 0, TAU); c.stroke();
      // floor
      c.fillStyle = lg(c, 0, 620, 0, H, [[0, '#3a2a1e'], [1, '#22180f']]); c.fillRect(0, 620, W, H - 620);
      c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; for (let y = 640; y < H; y += 26) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      c.fillStyle = 'rgba(70,110,90,.45)'; c.beginPath(); c.ellipse(190, 760, 170, 40, 0, 0, TAU); c.fill();
      // bed
      c.fillStyle = '#4a3020'; c.fillRect(14, 470, 18, 200);
      c.fillStyle = '#5a3a24'; c.beginPath(); c.roundRect ? c.roundRect(14, 470, 30, 170, 8) : c.rect(14, 470, 30, 170); c.fill();
      c.fillStyle = '#e8e0cc'; c.fillRect(30, 600, 260, 40);
      c.fillStyle = '#3a2a1e'; c.fillRect(30, 640, 262, 26); c.fillRect(280, 640, 12, 50);
      // nightstand
      c.fillStyle = '#5a3a24'; c.fillRect(304, 560, 64, 90); c.fillStyle = '#4a3020'; c.fillRect(304, 600, 64, 3);
      c.fillStyle = '#c9b88a'; c.beginPath(); c.moveTo(322, 520); c.lineTo(350, 520); c.lineTo(356, 545); c.lineTo(316, 545); c.closePath(); c.fill(); c.fillStyle = '#3a2a1e'; c.fillRect(334, 545, 4, 15);
      return { bg, sky, R };
    },
    back(ctx, t, S, G) {
      ctx.drawImage(S.bg, 0, 0, W, H);
      S.sky.forEach(([x, y], i) => { const on = Math.sin(t * 0.3 + i * 7.1) > -0.6; if (on) { ctx.fillStyle = 'rgba(255,214,140,.85)'; ctx.fillRect(x, y, 3, 4); } });
      // phone on the nightstand
      ctx.save(); ctx.fillStyle = '#0d1418'; ctx.fillRect(316, 553, 26, 6); ctx.fillStyle = `rgba(150,230,255,${0.35 + 0.2 * Math.sin(t * 2)})`; ctx.fillRect(318, 554, 22, 4); ctx.restore();
      const beam = G.beam || 0;
      // the sleeping shape in the bed
      if (!G.lifted) {
        const b = Math.sin(t * 1.1) * 2;
        ctx.save();
        ctx.fillStyle = '#f2ecdc'; ctx.beginPath(); ctx.ellipse(78, 598, 40, 14, -0.05, 0, TAU); ctx.fill();
        ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.ellipse(70, 584, 24, 13, -0.2, 0, TAU); ctx.fill();
        ctx.fillStyle = '#d6a07a'; ctx.beginPath(); ctx.ellipse(86, 588, 12, 14, 0.3, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#3a2016'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(88, 586); ctx.quadraticCurveTo(92, 588, 96, 586); ctx.stroke();
        ctx.fillStyle = '#2f6a5a'; ctx.beginPath(); ctx.moveTo(84, 604); ctx.bezierCurveTo(120, 584 - b, 220, 588 - b, 290, 604); ctx.lineTo(292, 640); ctx.lineTo(70, 640); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(110 + k * 45, 600 - b); ctx.lineTo(118 + k * 45, 640); ctx.stroke(); }
        if (G.zzz !== false && beam < 0.1) { ctx.fillStyle = 'rgba(200,230,220,.6)'; ctx.font = font(600, 14); [0, 1, 2].forEach(k => { const u = ((t * 0.35 + k / 3) % 1); ctx.globalAlpha = 1 - u; ctx.fillText('z', 100 + u * 40 + k * 4, 570 - u * 70); }); }
        ctx.restore();
      } else {
        ctx.fillStyle = '#2f6a5a'; ctx.beginPath(); ctx.moveTo(84, 612); ctx.bezierCurveTo(140, 606, 220, 610, 290, 612); ctx.lineTo(292, 640); ctx.lineTo(70, 640); ctx.closePath(); ctx.fill();
      }
      if (beam > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const a = Math.min(1, beam);
        ctx.fillStyle = lg(ctx, 0, 0, 0, 660, [[0, `rgba(200,255,235,${0.75 * a})`], [1, `rgba(120,255,210,${0.25 * a})`]]);
        const wob = Math.sin(t * 9) * 3;
        ctx.beginPath(); ctx.moveTo(120 - wob, -10); ctx.lineTo(200 + wob, -10); ctx.lineTo(230, 650); ctx.lineTo(70, 650); ctx.closePath(); ctx.fill();
        for (let k = 0; k < 26; k++) { const u = ((t * 0.5 + k * 0.137) % 1); ctx.fillStyle = `rgba(230,255,245,${a * (1 - u)})`; ctx.beginPath(); ctx.arc(80 + ((k * 53) % 140), 650 - u * 640, 1.5, 0, TAU); ctx.fill(); }
        ctx.fillStyle = `rgba(160,255,220,${0.18 * a})`; ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    }
  };

  /* ---------- the Kurator ship: transformation chamber */
  SCN.ship = {
    ground: '#0e1a18',
    build() {
      const R = rng(9);
      const [bg, c] = off(W, H);
      c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#d8d2bd'], [0.55, '#bfb79b'], [1, '#8a8064']]); c.fillRect(0, 0, W, H);
      // big window to space
      c.save(); c.beginPath(); c.ellipse(205, 250, 170, 150, 0, 0, TAU); c.clip();
      c.fillStyle = lg(c, 0, 100, 0, 400, [[0, '#06120f'], [1, '#0f2a24']]); c.fillRect(0, 0, W, 420);
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(240,255,245,${0.3 + R() * 0.7})`; c.fillRect(30 + R() * 350, 100 + R() * 300, R() > 0.9 ? 2 : 1.2, R() > 0.9 ? 2 : 1.2); }
      c.fillStyle = rg(c, 110, 330, 4, 70, [[0, 'rgba(120,200,255,.5)'], [1, 'rgba(0,0,0,0)']]); c.beginPath(); c.arc(110, 330, 70, 0, TAU); c.fill();
      c.fillStyle = rg(c, 100, 320, 2, 32, [[0, '#9fd8ff'], [0.6, '#3a7ab0'], [1, '#1e4a6a']]); c.beginPath(); c.arc(110, 330, 30, 0, TAU); c.fill();
      c.fillStyle = 'rgba(90,160,90,.8)'; c.beginPath(); c.ellipse(104, 322, 10, 7, 0.5, 0, TAU); c.fill(); c.beginPath(); c.ellipse(120, 338, 7, 5, 0.2, 0, TAU); c.fill();
      c.restore();
      c.strokeStyle = '#c9a24a'; c.lineWidth = 6; c.beginPath(); c.ellipse(205, 250, 170, 150, 0, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(201,162,74,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(205, 250, 182, 162, 0, 0, TAU); c.stroke();
      for (let k = 0; k < 12; k++) { const a = k * TAU / 12; c.strokeStyle = 'rgba(160,140,90,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(205 + Math.cos(a) * 182, 250 + Math.sin(a) * 162); c.lineTo(205 + Math.cos(a) * 420, 250 + Math.sin(a) * 420); c.stroke(); }
      // floor
      c.fillStyle = lg(c, 0, 600, 0, H, [[0, '#2a3a34'], [1, '#0e1a18']]);
      c.beginPath(); c.moveTo(0, 640); c.quadraticCurveTo(195, 600, W, 640); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(201,162,74,.35)'; c.lineWidth = 1; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(195 + k * 10, 618); c.lineTo(195 + k * 80, H); c.stroke(); }
      for (let y = 650; y < H; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      // pillars
      [[12, 0], [370, 0]].forEach(([x]) => { c.fillStyle = lg(c, x - 14, 0, x + 14, 0, [[0, '#8a7a50'], [0.5, '#e6dcbc'], [1, '#8a7a50']]); c.fillRect(x - 14, 0, 28, 650); c.fillStyle = '#c9a24a'; c.fillRect(x - 16, 120, 32, 4); c.fillRect(x - 16, 520, 32, 4); });
      return { bg };
    },
    back(ctx, t, S, G) {
      ctx.drawImage(S.bg, 0, 0, W, H);
      const alarm = G.anomaly ? 0.5 + 0.5 * Math.sin(t * 6) : 0;
      if (alarm) { ctx.fillStyle = `rgba(255,140,60,${0.12 * alarm})`; ctx.fillRect(0, 0, W, H); }
      // the pod
      const px = 140;
      ctx.save();
      ctx.fillStyle = '#2a2a22'; ctx.beginPath(); ctx.ellipse(px, 690, 70, 16, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.ellipse(px, 684, 66, 13, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2a2a22'; ctx.beginPath(); ctx.ellipse(px, 200, 60, 12, 0, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      const col = G.anomaly ? '255,190,120' : '150,255,220';
      ctx.fillStyle = lg(ctx, px - 60, 0, px + 60, 0, [[0, `rgba(${col},.05)`], [0.5, `rgba(${col},.32)`], [1, `rgba(${col},.05)`]]);
      ctx.fillRect(px - 56, 205, 112, 478);
      for (let k = 0; k < 5; k++) { const yy = 210 + ((t * 70 + k * 96) % 470); ctx.strokeStyle = `rgba(${col},.6)`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(px, yy, 56, 10, 0, 0, TAU); ctx.stroke(); }
      ctx.restore();
      // holo readouts
      const p = Math.round(G.progress || 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const hx = 226, hy = 104;
      ctx.fillStyle = `rgba(${col},.12)`; ctx.strokeStyle = `rgba(${col},.8)`; ctx.lineWidth = 1;
      ctx.fillRect(hx, hy, 146, 112); ctx.strokeRect(hx, hy, 146, 112);
      ctx.fillStyle = `rgba(${col},.95)`; ctx.font = font(600, 10);
      ctx.fillText('SPECIMEN 4471 · HUMAN', hx + 8, hy + 16);
      ctx.fillText('KERNEL GROWTH', hx + 8, hy + 36);
      ctx.strokeRect(hx + 8, hy + 42, 110, 9); ctx.fillRect(hx + 9, hy + 43, 108 * p / 100, 7);
      ctx.fillText(p + '%', hx + 122, hy + 50);
      ctx.beginPath(); for (let k = 0; k <= 60; k++) { const xx = hx + 8 + k * 2.1, yy = hy + 72 + Math.sin(k * 0.5 + t * 8) * (G.anomaly ? 9 : 4) * Math.sin(k / 60 * Math.PI); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
      if (G.anomaly) {
        ctx.fillStyle = `rgba(255,170,110,${0.6 + 0.4 * alarm})`; ctx.font = font(700, 11);
        ctx.fillText('ANOMALY:', hx + 8, hy + 94); ctx.fillText('LINGUAL RESONANCE', hx + 8, hy + 107);
        for (let k = 0; k < 3; k++) { ctx.fillStyle = 'rgba(255,170,110,.25)'; ctx.fillRect(0, (t * 300 + k * 290) % H, W, 2); }
      } else { ctx.fillStyle = `rgba(${col},.7)`; ctx.font = font(500, 9); ctx.fillText('STATUS: NOMINAL', hx + 8, hy + 100); }
      ctx.restore();
    }
  };

  /* ---------- falling through the sky of Måne Syv */
  SCN.fall = {
    ground: '#0b1712',
    build() {
      const R = rng(12);
      const [bg, c] = off(W, H);
      c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#06110f'], [0.6, '#0f2b24'], [1, '#2a5a44']]); c.fillRect(0, 0, W, H);
      for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(230,255,235,${0.2 + R() * 0.7})`; c.fillRect(R() * W, R() * H * 0.7, 1.3, 1.3); }
      c.save(); c.translate(300, 150); c.rotate(-0.3); c.fillStyle = rg(c, -12, -12, 4, 60, [[0, '#e9f7dc'], [1, '#7fb894']]); c.beginPath(); c.arc(0, 0, 52, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(170,255,210,.8)'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 6, 92, 15, 0, 0, TAU); c.stroke(); c.restore();
      c.strokeStyle = 'rgba(160,240,200,.35)'; c.lineWidth = 7; c.beginPath(); c.ellipse(140, 900, 420, 640, 0.35, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
      const clouds = Array.from({ length: 14 }, () => [R() * W, R() * H * 1.4, 40 + R() * 70, 0.4 + R() * 0.9]);
      return { bg, clouds, R };
    },
    back(ctx, t, S, G) {
      ctx.drawImage(S.bg, 0, 0, W, H);
      const p = G.fallP || 0;
      // the forest rushing up from below
      const sc = 0.15 + p * p * 2.6;
      ctx.save(); ctx.translate(195, 760 - p * 280); ctx.scale(sc, sc * 0.55);
      ctx.fillStyle = '#0f2a1c'; ctx.beginPath(); ctx.arc(0, 0, 420, 0, TAU); ctx.fill();
      const R = rng(3);
      for (let k = 0; k < 60; k++) { const a = R() * TAU, d = 60 + R() * 340; ctx.fillStyle = k % 3 ? '#16402a' : '#1d5034'; ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 24 + R() * 30, 0, TAU); ctx.fill(); }
      ctx.fillStyle = lg(ctx, 0, -60, 0, 60, [[0, '#9ad6c4'], [1, '#2f6a5a']]); ctx.beginPath(); ctx.ellipse(0, 0, 70, 55, 0, 0, TAU); ctx.fill();
      for (let k = 0; k < 40; k++) { const a = R() * TAU, d = 90 + R() * 300; ctx.fillStyle = `rgba(140,255,200,${0.5 + 0.5 * Math.sin(t * 3 + k)})`; ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 3, 0, TAU); ctx.fill(); }
      ctx.restore();
      // clouds and wind streaks rushing up
      S.clouds.forEach(([x, y, r, sp], i) => {
        const yy = ((y - t * 520 * sp) % (H * 1.4) + H * 1.4) % (H * 1.4) - 200;
        ctx.fillStyle = `rgba(200,235,220,${0.12 + 0.1 * sp})`;
        ctx.beginPath(); ctx.ellipse(x, yy, r, r * 0.4, 0, 0, TAU); ctx.fill();
      });
      ctx.strokeStyle = 'rgba(220,255,240,.4)'; ctx.lineWidth = 1;
      for (let k = 0; k < 18; k++) { const x = (k * 53) % W, yy = ((k * 97 - t * 1400) % H + H) % H; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x, yy + 60); ctx.stroke(); }
    }
  };

  /* ---------- the forest: night lake, day path */
  SCN.lake = { ground: '#0f1c13', build() { return forestBuild(true, { lake: true, stones: false, cable: false, pylon: false, sign: null }); }, back(ctx, t, S, G) { forestFrame(ctx, t, S, true, G); if (G.drone) drone(ctx, t, true, 0, G.drone); } };
  SCN.lakedawn = { ground: '#4f7f3c', build() { return forestBuild(false, { lake: true, stones: false, cable: false, pylon: false, sign: null }); }, back(ctx, t, S, G) { forestFrame(ctx, t, S, false, G); } };
  SCN.path = { ground: '#2c4a26', build() { return forestBuild(false, { sign: 'KRONBY 2 km', pylon: true, seed: 81 }); }, back(ctx, t, S, G) { forestFrame(ctx, t, S, false, G); if (G.drone) drone(ctx, t, false, 0, G.drone); } };

  /* ---------- inside the wreck */
  SCN.cabin = {
    ground: '#1d1610',
    build() {
      const R = rng(21);
      const [bg, c] = off(W, H);
      c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#2a1f17'], [0.5, '#3a2a1e'], [1, '#1d1610']]); c.fillRect(0, 0, W, H);
      // porthole with the morning forest outside
      c.save(); c.beginPath(); c.ellipse(130, 330, 92, 112, 0, 0, TAU); c.clip();
      c.fillStyle = lg(c, 0, 220, 0, 440, [[0, '#a8d8c4'], [1, '#e8ecd0']]); c.fillRect(30, 210, 200, 240);
      for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#6a8a5a' : '#7a9a6a'; c.fillRect(40 + i * 34, 260 + (i % 3) * 10, 10, 190); }
      for (let i = 0; i < 10; i++) foliage(c, 40 + R() * 180, 230 + R() * 60, 26, R, ['#5a8a52', '#74a860', '#a6d27a', null], [0.3, -0.8], 4);
      c.fillStyle = '#86b860'; c.fillRect(30, 410, 200, 40);
      c.restore();
      c.strokeStyle = '#7a5a34'; c.lineWidth = 12; c.beginPath(); c.ellipse(130, 330, 92, 112, 0, 0, TAU); c.stroke();
      c.strokeStyle = '#b08a54'; c.lineWidth = 2; c.beginPath(); c.ellipse(130, 330, 98, 118, 0, 0, TAU); c.stroke();
      for (let k = 0; k < 10; k++) { const a = k * TAU / 10; c.fillStyle = '#5a3a24'; c.beginPath(); c.arc(130 + Math.cos(a) * 92, 330 + Math.sin(a) * 112, 3, 0, TAU); c.fill(); }
      // ribs
      for (let x = -30; x < W + 40; x += 78) { c.strokeStyle = 'rgba(20,12,6,.55)'; c.lineWidth = 14; c.beginPath(); c.moveTo(x, H); c.quadraticCurveTo(x + 30, 300, x + 90, -20); c.stroke(); c.strokeStyle = 'rgba(200,150,90,.18)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 4, H); c.quadraticCurveTo(x + 26, 300, x + 86, -20); c.stroke(); }
      // moss patches
      for (let i = 0; i < 12; i++) foliage(c, R() * W, R() < 0.5 ? 40 + R() * 80 : 600 + R() * 40, 10 + R() * 12, R, ['#2f4a28', '#3f6a34', '#6a9a4a', null], [0.2, -0.8], 3);
      // notes pinned to the wall
      [[212, 392, -0.06], [252, 410, 0.08], [226, 462, 0.03]].forEach(([x, y, a], i) => {
        c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#e8dcbc'; c.fillRect(0, 0, 40, 48); c.strokeStyle = 'rgba(60,40,20,.55)'; c.lineWidth = 0.8;
        for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(4, 8 + k * 6.5); c.lineTo(36 - (k % 3) * 6, 8 + k * 6.5); c.stroke(); }
        if (i === 1) { c.strokeStyle = 'rgba(60,40,20,.8)'; c.beginPath(); c.moveTo(10, 40); c.lineTo(16, 30); c.lineTo(26, 30); c.lineTo(30, 40); c.moveTo(14, 30); c.lineTo(12, 22); c.moveTo(14, 26); c.lineTo(9, 24); c.stroke(); }
        c.fillStyle = '#b4602e'; c.beginPath(); c.arc(20, 3, 2.4, 0, TAU); c.fill(); c.restore();
      });
      // floor
      c.fillStyle = lg(c, 0, 620, 0, H, [[0, '#2a221a'], [1, '#14100b']]); c.fillRect(0, 630, W, H - 630);
      c.strokeStyle = 'rgba(180,140,90,.18)'; c.lineWidth = 1; for (let x = 0; x < W; x += 12) { c.beginPath(); c.moveTo(x, 632); c.lineTo(x - 30, H); c.stroke(); }
      c.fillStyle = '#4a3a28'; c.fillRect(0, 626, W, 6);
      // cot
      c.fillStyle = '#4a3a28'; c.fillRect(120, 590, 140, 10); c.fillRect(124, 600, 6, 30); c.fillRect(250, 600, 6, 30);
      c.fillStyle = '#6a7a5a'; c.beginPath(); c.moveTo(118, 590); c.bezierCurveTo(150, 576, 220, 580, 262, 590); c.lineTo(262, 598); c.lineTo(118, 598); c.closePath(); c.fill();
      // terminal
      c.fillStyle = '#2a2420'; c.beginPath(); c.moveTo(286, 640); c.lineTo(300, 520); c.lineTo(380, 520); c.lineTo(390, 640); c.closePath(); c.fill();
      c.fillStyle = '#3a322a'; c.fillRect(300, 520, 80, 10);
      // crystals in the corner
      const crys = [[368, 626, 0.2, 40], [352, 630, -0.3, 30], [380, 628, 0.5, 26], [20, 628, -0.2, 22], [34, 630, 0.3, 30]];
      return { bg, crys, R };
    },
    back(ctx, t, S, G) {
      ctx.drawImage(S.bg, 0, 0, W, H);
      // morning light through the porthole
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.filter = 'blur(6px)';
      ctx.fillStyle = lg(ctx, 130, 300, 260, 700, [[0, 'rgba(255,245,200,.45)'], [1, 'rgba(255,245,200,0)']]);
      ctx.beginPath(); ctx.moveTo(60, 270); ctx.lineTo(200, 380); ctx.lineTo(330, 700); ctx.lineTo(110, 700); ctx.closePath(); ctx.fill();
      ctx.restore();
      for (let k = 0; k < 20; k++) { const u = (t * 0.03 + k * 0.071) % 1; ctx.fillStyle = `rgba(255,245,210,${0.5 * Math.sin(u * Math.PI)})`; ctx.beginPath(); ctx.arc(110 + ((k * 61) % 180) + u * 60, 380 + ((k * 37) % 280) - u * 40, 1.2, 0, TAU); ctx.fill(); }
      // locker
      const open = G.locker || 0;
      ctx.save();
      ctx.fillStyle = '#4a3a28'; ctx.fillRect(8, 380, 86, 248);
      ctx.fillStyle = '#1e1810'; ctx.fillRect(14, 386, 74, 236);
      if (!G.coatTaken) {
        ctx.fillStyle = '#8e5a36'; ctx.beginPath(); ctx.moveTo(34, 404); ctx.lineTo(70, 404); ctx.lineTo(78, 560); ctx.lineTo(26, 560); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2f7a6a'; ctx.beginPath(); ctx.moveTo(46, 410); ctx.lineTo(58, 410); ctx.lineTo(60, 556); ctx.lineTo(44, 556); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(111,255,196,${0.6 + 0.4 * Math.sin(t * 2)})`; ctx.lineWidth = 1.2; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(26, 558); ctx.lineTo(78, 558); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#c58a52'; ctx.font = font(700, 8); ctx.fillText('A.L.', 64, 422);
      }
      ctx.strokeStyle = '#b08a54'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, 400); ctx.lineTo(74, 400); ctx.stroke();
      ctx.fillStyle = '#5a4630'; const dw = 74 * (1 - open);
      if (dw > 1) { ctx.fillRect(14, 386, dw, 236); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.strokeRect(18, 392, dw - 8, 224); for (let k = 0; k < 5; k++) ctx.fillRect(22, 410 + k * 8, Math.max(0, dw - 16), 2); }
      if (open > 0.05) { ctx.fillStyle = '#5a4630'; ctx.beginPath(); ctx.moveTo(88, 386); ctx.lineTo(88 + 30 * open, 376); ctx.lineTo(88 + 30 * open, 632); ctx.lineTo(88, 622); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      // crystals
      S.crys.forEach(([x, y, a, L], i) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = i % 2 ? '#5fd4b0' : '#9ff5d6'; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 8 + 6 * Math.sin(t * 2 + i);
        ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-1, -L); ctx.lineTo(2, -L * 0.85); ctx.lineTo(5, 0); ctx.closePath(); ctx.fill(); ctx.restore();
      });
      // console lights
      for (let k = 0; k < 6; k++) { const on = Math.sin(t * (1 + k * 0.3) + k) > 0; ctx.fillStyle = on ? (k % 2 ? '#ffc66b' : '#7affcf') : '#3a322a'; ctx.fillRect(306 + k * 11, 540, 6, 4); }
    }
  };

  /* ---------- the pylon with three locks */
  SCN.pylon = {
    ground: '#2c4a26',
    build() { return Object.assign(forestBuild(false, { pylon: false, sign: null, cable: false, seed: 90 }), {}); },
    back(ctx, t, S, G) {
      forestFrame(ctx, t, S, false, G);
      const L = G.locks || [0, 0, 0], open = G.pylonOpen || 0;
      const px = 262, base = 650, top = 190;
      ctx.save();
      // shadow and roots
      ctx.fillStyle = 'rgba(20,40,20,.35)'; ctx.beginPath(); ctx.ellipse(px, base, 70, 12, 0, 0, TAU); ctx.fill();
      // body
      ctx.fillStyle = lg(ctx, px - 40, 0, px + 40, 0, [[0, '#4a5a50'], [0.55, '#7d8c80'], [1, '#5d6b62']]);
      ctx.beginPath(); ctx.moveTo(px - 40, base); ctx.lineTo(px - 24, top + 30); ctx.lineTo(px, top); ctx.lineTo(px + 24, top + 30); ctx.lineTo(px + 40, base); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(20,30,25,.5)'; ctx.lineWidth = 1.4; ctx.stroke();
      // runes
      ctx.strokeStyle = `rgba(60,200,170,${0.35 + 0.2 * Math.sin(t * 2)})`; ctx.lineWidth = 1;
      for (let k = 0; k < 14; k++) { const yy = top + 50 + k * 30, w = 10 + (k % 3) * 4; ctx.beginPath(); ctx.moveTo(px - w, yy); ctx.lineTo(px - w + 6, yy - 5); ctx.lineTo(px + w - 6, yy - 5); ctx.lineTo(px + w, yy); ctx.stroke(); }
      // sockets
      const SOCK = [[px, 290, 'circle'], [px, 400, 'tri'], [px, 510, 'square']];
      SOCK.forEach(([sx, sy, shp], i) => {
        const on = L[i], pulse = 0.6 + 0.4 * Math.sin(t * 3 + i), hi = G.lockHi === i;
        ctx.save(); ctx.translate(sx, sy);
        ctx.fillStyle = '#26302a'; ctx.strokeStyle = on ? '#bff7e4' : hi ? '#ffd38a' : 'rgba(120,200,180,.6)'; ctx.lineWidth = on ? 3 : 2;
        if (on || hi) { ctx.shadowColor = on ? '#6fffc4' : '#ffc66b'; ctx.shadowBlur = 18 * pulse; }
        ctx.beginPath();
        if (shp === 'circle') ctx.arc(0, 0, 18, 0, TAU);
        else if (shp === 'tri') { ctx.moveTo(0, -20); ctx.lineTo(19, 14); ctx.lineTo(-19, 14); ctx.closePath(); }
        else ctx.rect(-17, -17, 34, 34);
        ctx.fill(); ctx.stroke();
        if (on) { ctx.fillStyle = `rgba(160,255,220,${0.5 + 0.4 * pulse})`; ctx.fill(); }
        ctx.restore();
      });
      // light rings and top crystal
      for (let k = 0; k < 3; k++) {
        const yy = top + 60 + k * 170 + Math.sin(t * 1.5 + k) * 6, on = L[k] ? 1 : 0.35;
        ctx.strokeStyle = `rgba(60,210,170,${0.35 + 0.5 * on})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(px, yy, 52 - k * 4, 9, 0, 0, TAU); ctx.stroke();
      }
      ctx.fillStyle = '#bff7e4'; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 12 + 20 * open;
      ctx.beginPath(); ctx.moveTo(px, top - 30); ctx.lineTo(px + 9, top - 6); ctx.lineTo(px, top + 4); ctx.lineTo(px - 9, top - 6); ctx.closePath(); ctx.fill();
      ctx.restore();
      if (open > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, 0, 0, 0, top, [[0, 'rgba(120,255,210,0)'], [1, `rgba(150,255,220,${0.5 * open})`]]);
        ctx.fillRect(px - 10, 0, 20, top);
        ctx.fillStyle = `rgba(150,255,220,${0.12 * open})`; ctx.beginPath(); ctx.ellipse(px, base - 40, 120 * open, 60 * open, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
      // roots over the base
      ctx.strokeStyle = '#593823'; ctx.lineCap = 'round';
      [[px - 60, base + 10, px - 30, base - 30, px - 16, base - 70, 6], [px + 70, base + 6, px + 34, base - 20, px + 24, base - 54, 5]].forEach(([a, b, c2, d, e, f, w]) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(c2, d, e, f); ctx.stroke(); });
    }
  };

  /* ---------- the mirror bridge over the ravine */
  SCN.bridge = {
    ground: '#3a2a1c',
    N: 8,
    build() {
      const R = rng(33);
      const [bg, c] = off(W, H);
      c.fillStyle = lg(c, 0, 0, 0, 560, [[0, '#4fa08e'], [0.55, '#d9d2a4'], [1, '#f2c47a']]); c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,240,200,.85)'; c.beginPath(); c.arc(300, 300, 34, 0, TAU); c.fill();
      for (let i = 0; i < 7; i++) { const x = 10 + i * 60 + R() * 20, h = 160 + R() * 120; c.fillStyle = '#8fbca7'; c.fillRect(x - 6, 470 - h, 12, h); foliage(c, x, 470 - h - 10, 20, R, ['#7eae98', '#97c2b0', null, null], [0.3, -0.8], 5); for (let k = 0; k < 3; k++) { c.fillStyle = '#a9cfbe'; c.beginPath(); c.ellipse(x, 470 - h * (0.3 + k * 0.2), 16, 4, 0, 0, TAU); c.fill(); } }
      // far cliffs
      hillPath(c, 500, 14, 0.02, 1.1); c.fillStyle = '#9a8a6a'; c.fill();
      // chasm
      c.fillStyle = lg(c, 0, 560, 0, H, [[0, '#4a5a4a'], [0.5, '#20302a'], [1, '#0e1a16']]); c.fillRect(0, 540, W, H - 540);
      c.strokeStyle = 'rgba(120,255,210,.8)'; c.lineWidth = 3; c.shadowColor = '#6fffc4'; c.shadowBlur = 12;
      c.beginPath(); c.moveTo(150, H); c.bezierCurveTo(190, 760, 220, 720, 200, 680); c.stroke(); c.shadowBlur = 0;
      // left cliff
      const cliff = (pts, col, col2) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => c.lineTo(p[0], p[1])); c.closePath(); c.fill(); c.strokeStyle = col2; c.lineWidth = 2; for (let k = 0; k < 8; k++) { const y = pts[0][1] + 20 + k * 30; c.beginPath(); c.moveTo(pts[0][0] + 4, y); c.lineTo(pts[1][0] - 20 - (k % 3) * 12, y + 8); c.stroke(); } };
      cliff([[-20, 600], [118, 600], [104, 680], [124, 760], [96, H], [-20, H]], '#6a5038', 'rgba(40,25,10,.35)');
      cliff([[410, 566], [282, 566], [296, 640], [270, 720], [300, H], [410, H]], '#6a5038', 'rgba(40,25,10,.35)');
      c.fillStyle = '#5a8a3a'; c.fillRect(-20, 594, 140, 10); c.fillRect(280, 560, 130, 10);
      for (let i = 0; i < 10; i++) { foliage(c, -10 + i * 14, 596, 8, R, ['#3f6f2a', '#5a8a3a', '#8cc866', null], [0.2, -0.9], 3); foliage(c, 290 + i * 13, 562, 8, R, ['#3f6f2a', '#5a8a3a', '#8cc866', null], [0.2, -0.9], 3); }
      c.strokeStyle = '#4a3420'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(100 + i * 3, 610 + i * 10); c.quadraticCurveTo(120, 650 + i * 12, 112 + i * 2, 700 + i * 10); c.stroke(); c.beginPath(); c.moveTo(290 - i * 3, 576 + i * 10); c.quadraticCurveTo(272, 620 + i * 12, 280 - i * 2, 660 + i * 10); c.stroke(); }
      return { bg, R };
    },
    back(ctx, t, S, G) {
      ctx.drawImage(S.bg, 0, 0, W, H);
      // mist
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = lg(ctx, 0, 600, 0, 760, [[0, 'rgba(230,255,240,0)'], [0.5, 'rgba(230,255,240,.5)'], [1, 'rgba(230,255,240,0)']]);
      ctx.fillRect(0, 620 + Math.sin(t * 0.4) * 10, W, 140); ctx.restore();
      // planks of light
      const N = SCN.bridge.N, n = G.planks || 0;
      for (let i = 0; i < N; i++) {
        const u = (i + 0.5) / N, x = lerp(118, 282, u), y = lerp(600, 566, u) + Math.sin(u * Math.PI) * 10 + Math.sin(t * 1.4 + i) * 1.5;
        const on = i < n, cr = G.crack === i;
        ctx.save(); ctx.translate(x, y);
        if (on || cr) {
          const flick = cr ? (Math.sin(t * 40) > 0 ? 1 : 0.3) : 1;
          ctx.globalAlpha = flick; ctx.fillStyle = cr ? 'rgba(255,140,90,.55)' : 'rgba(170,255,225,.55)'; ctx.strokeStyle = cr ? '#ff8a5a' : '#bff7e4'; ctx.lineWidth = 1.4;
          ctx.shadowColor = cr ? '#ff8a5a' : '#6fffc4'; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.moveTo(-10, -3); ctx.lineTo(10, -3); ctx.lineTo(12, 3); ctx.lineTo(-12, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else { ctx.strokeStyle = 'rgba(190,255,230,.25)'; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.strokeRect(-11, -3, 22, 6); }
        ctx.restore();
      }
    }
  };

  /* ---------- the gate of Kronby at dusk */
  SCN.gate = {
    ground: '#2a2a1e',
    build() {
      const R = rng(44);
      const [bg, c] = off(W, H);
      c.fillStyle = lg(c, 0, 0, 0, 600, [[0, '#0f2a2a'], [0.5, '#4a5a4a'], [0.85, '#d98a4a'], [1, '#f2b46a']]); c.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(230,255,235,${0.2 + R() * 0.5})`; c.fillRect(R() * W, R() * 220, 1.2, 1.2); }
      // the great tree with the town in its crown
      c.fillStyle = lg(c, 40, 0, 360, 0, [[0, '#3a2818'], [0.5, '#6a4a2c'], [1, '#3a2818']]);
      c.beginPath(); c.moveTo(-20, H); c.lineTo(-20, 330); c.quadraticCurveTo(60, 300, 80, 120); c.lineTo(320, 120); c.quadraticCurveTo(330, 300, 410, 330); c.lineTo(410, H); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(20,10,4,.35)'; c.lineWidth = 3; for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(20 + k * 32, H); c.quadraticCurveTo(40 + k * 28, 400, 90 + k * 20, 120); c.stroke(); }
      // crown with houses and balconies
      for (let i = 0; i < 16; i++) foliage(c, -10 + i * 28, 70 + (i % 3) * 30, 50, R, ['#1d3a28', '#2b5638', '#3f7a4a', null], [0.3, -0.8], 6);
      for (let i = 0; i < 9; i++) { const hx = 40 + i * 38, hy = 150 + (i % 3) * 46; c.fillStyle = '#4a3020'; c.fillRect(hx - 12, hy, 24, 18); c.fillStyle = '#2b5638'; c.beginPath(); c.moveTo(hx - 15, hy); c.lineTo(hx, hy - 12); c.lineTo(hx + 15, hy); c.closePath(); c.fill(); c.fillStyle = '#c9a24a'; c.fillRect(hx - 14, hy + 18, 28, 2); }
      const wins = []; for (let i = 0; i < 9; i++) { wins.push([40 + i * 38 - 4, 150 + (i % 3) * 46 + 5]); }
      // the arch
      c.fillStyle = '#1e140c'; c.beginPath(); c.moveTo(120, 660); c.lineTo(120, 420); c.quadraticCurveTo(195, 300, 270, 420); c.lineTo(270, 660); c.closePath(); c.fill();
      c.strokeStyle = '#c9a24a'; c.lineWidth = 4; c.stroke();
      c.strokeStyle = 'rgba(201,162,74,.5)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(108, 660); c.lineTo(108, 416); c.quadraticCurveTo(195, 284, 282, 416); c.lineTo(282, 660); c.stroke();
      // doors
      c.fillStyle = '#5a3a24'; c.fillRect(126, 430, 68, 230); c.fillRect(196, 430, 68, 230);
      c.fillStyle = '#3a2416'; for (let k = 0; k < 5; k++) { c.fillRect(126, 446 + k * 44, 138, 5); }
      c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(186, 548, 4, 0, TAU); c.arc(204, 548, 4, 0, TAU); c.fill();
      // ground
      c.fillStyle = lg(c, 0, 640, 0, H, [[0, '#4a4430'], [1, '#1e1c14']]); c.fillRect(0, 650, W, H - 650);
      c.strokeStyle = 'rgba(0,0,0,.25)'; for (let y = 660; y < H; y += 18) for (let x = (y / 18 % 2) * 14; x < W; x += 28) { c.strokeRect(x, y, 28, 18); }
      // banners
      [[60, 430], [330, 430]].forEach(([bx, by]) => { c.fillStyle = '#2f6a4a'; c.beginPath(); c.moveTo(bx - 14, by); c.lineTo(bx + 14, by); c.lineTo(bx + 14, by + 90); c.lineTo(bx, by + 78); c.lineTo(bx - 14, by + 90); c.closePath(); c.fill(); c.strokeStyle = '#c9a24a'; c.lineWidth = 1.5; c.beginPath(); c.arc(bx, by + 34, 8, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(bx, by + 22); c.lineTo(bx, by + 46); c.stroke(); });
      return { bg, wins, R };
    },
    back(ctx, t, S, G) {
      ctx.drawImage(S.bg, 0, 0, W, H);
      const dusk = G.dusk || 0;
      S.wins.forEach(([x, y], i) => { ctx.fillStyle = `rgba(255,200,110,${0.5 + 0.5 * dusk})`; ctx.fillRect(x, y, 8, 7); });
      // lanterns
      [[86, 560], [304, 560]].forEach(([lx, ly], i) => {
        ctx.save(); ctx.strokeStyle = '#2a2016'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, 660); ctx.lineTo(lx, ly); ctx.stroke();
        ctx.fillStyle = '#ffd38a'; ctx.shadowColor = '#ffc66b'; ctx.shadowBlur = 16 + 10 * dusk; ctx.beginPath(); ctx.arc(lx, ly - 6, 6, 0, TAU); ctx.fill(); ctx.restore();
      });
      // gate runes
      ctx.save(); ctx.strokeStyle = `rgba(120,255,210,${0.4 + 0.3 * Math.sin(t * 2)})`; ctx.lineWidth = 1.2; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 8;
      for (let k = 0; k < 7; k++) { const a = Math.PI * (1.12 + k * 0.127); ctx.beginPath(); ctx.arc(195 + Math.cos(a) * 92, 430 + Math.sin(a) * 110, 3, 0, TAU); ctx.stroke(); }
      ctx.restore();
      // the scanner ring
      const sc = G.scan || 0;
      ctx.save(); ctx.translate(195, 520); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(120,255,210,${0.5 + 0.4 * sc})`; ctx.lineWidth = 2; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.ellipse(0, 0, 92, 128, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.ellipse(0, 0, 100, 136, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      if (sc > 0) { const yy = -128 + ((t * 120) % 256); ctx.fillStyle = `rgba(150,255,220,${0.25 * sc})`; ctx.fillRect(-90, yy, 180, 6); }
      ctx.restore();
      if (dusk > 0) { ctx.fillStyle = `rgba(5,15,12,${0.45 * dusk})`; ctx.fillRect(0, 0, W, H); }
      if (G.drone) drone(ctx, t, dusk > 0.5, 0, G.drone);
    }
  };

  /* ---------- title */
  SCN.title = { ground: '#070d09', build() { return forestBuild(true, { lake: true, stones: false, cable: false, pylon: false, sign: null, seed: 7 }); }, back(ctx, t, S, G) { forestFrame(ctx, t, S, true, G); drone(ctx, t, true, 0, { x: 120 + Math.sin(t * 0.3) * 80, y: 250 }); } };

  /* ===================== actors, effects, render */
  function spellBurst(ctx, x, y, el, N, col) {
    const c = col || (N ? '200,255,225' : '31,166,130');
    ctx.save();
    if (N) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, x, y, 0, 80, [[0, `rgba(${c},${0.5 * Math.max(0, 1 - el / 2)})`], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(x, y, 80, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    for (let r = 0; r < 2; r++) {
      const e = el - r * 0.18; if (e < 0 || e > 1.4) continue;
      const k = 1 - Math.pow(1 - Math.min(1, e / 1.1), 3), rad = 16 + k * 170;
      ctx.globalAlpha = Math.max(0, 1 - e / 1.4); ctx.strokeStyle = `rgb(${c})`; ctx.lineWidth = 3.4 * (1 - k) + 0.6;
      ctx.shadowColor = `rgb(${c})`; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.stroke();
      if (!r) for (let i = 0; i < 14; i++) { const a = i * TAU / 14 + 0.2, r0 = rad * 0.45, r1 = r0 + 12 + (i % 3) * 7; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke(); }
    }
    ctx.globalAlpha = Math.max(0, 1 - el / 2.6); ctx.fillStyle = N ? '#f4fff6' : '#eafff8'; ctx.shadowColor = `rgb(${c})`; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(x, y, 7 + 3 * Math.sin(el * 8), 0, TAU); ctx.fill();
    ctx.restore();
  }
  function drawActor(ctx, a, t) {
    if (a.hidden) return;
    ctx.save();
    if (a.alpha != null) ctx.globalAlpha = a.alpha;
    ctx.translate(a.x, a.y); if (a.rot) ctx.rotate(a.rot); if (a.flip) ctx.scale(-1, 1); if (a.sq) ctx.scale(1 + (1 - a.sq) * 0.35, a.sq);
    const tt = t + (a.ph || 0);
    if (a.k === 'hero' || a.k === 'npc') hero(ctx, 0, 0, a.s || 1.32, a.o, tt);
    else if (a.k === 'deer') deer(ctx, 0, 0, a.s || 1.2, a.o || DEER_DAY, tt);
    else if (a.k === 'kurator') kurator(ctx, 0, 0, a.s || 1.2, a.o, tt);
    else if (a.k === 'skib') skibFace(ctx, 0, 0, a.s || 1, tt, a.talk, a.alarm);
    ctx.restore();
  }
  // where the casting hand of a hero actor is, in scene coordinates
  function handOf(a, t) {
    const s = a.s || 1.32, lift = Math.sin((t + (a.ph || 0)) * 1.3) * 2, K = a.o && a.o.cast != null ? a.o.cast : 0;
    const hx = lerp(20.2, 44.3, K), hy = lerp(-95, -213.5 + lift, K);
    return [a.x + (a.flip ? -1 : 1) * hx * s, a.y + hy * s];
  }
  const cache = {};
  function scene(id, opt) { const key = id + (opt ? JSON.stringify(opt) : ''); if (!cache[key]) cache[key] = SCN[id].build(opt); return cache[key]; }

  function render(ctx, t, G) {
    const sc = SCN[G.scene] || SCN.title, S = scene(G.scene in SCN ? G.scene : 'title', G.sopt);
    ctx.save();
    ctx.fillStyle = sc.ground || '#000'; ctx.fillRect(0, 0, W, H + 400);
    const lift = G.lift || 0;
    let sx = 0, sy = 0;
    if (G.shake && t - G.shake.t0 < G.shake.dur) { const k = 1 - (t - G.shake.t0) / G.shake.dur; sx = (Math.random() - 0.5) * 10 * k * (G.shake.amp || 1); sy = (Math.random() - 0.5) * 10 * k * (G.shake.amp || 1); }
    ctx.translate(sx, sy - lift);
    if (G.cam && G.cam.z && G.cam.z !== 1) { const cx = G.cam.x || W / 2, cy = G.cam.y || H / 2; ctx.translate(cx, cy); ctx.scale(G.cam.z, G.cam.z); ctx.translate(-cx, -cy); }
    sc.back(ctx, t, S, G);
    if (!sc.ownsCast) (G.cast || []).slice().sort((a, b) => (a.z || a.y) - (b.z || b.y)).forEach(a => drawActor(ctx, a, t));
    if (sc.front) sc.front(ctx, t, S, G);
    // spell burst at a hero's hand
    if (G.burst && t - G.burst.t0 < 3.2) {
      const a = (G.cast || []).find(x => x.k === 'hero');
      if (a) {
        const [hx, hy] = handOf(a, t), el = t - G.burst.t0, k = Math.min(1, el / 0.4), fade = el > 2.4 ? 1 - (el - 2.4) / 0.8 : 1;
        ctx.save(); ctx.globalAlpha = Math.max(0, fade);
        spellBurst(ctx, hx, hy - 6, el, !!G.night, G.burst.col);
        if (G.burst.word) wordGlyph(ctx, hx, hy - 56 - el * 8, G.burst.word, t, { font: font(600, 28), color: G.night ? '#eaffef' : '#effff8', glow: G.night ? '#7dffb0' : '#2fd9a8', stroke: G.night ? null : 'rgba(20,80,60,.5)' });
        ctx.restore();
      }
    }
    if (G.fizzle && t - G.fizzle.t0 < 1.2) {
      const a = (G.cast || []).find(x => x.k === 'hero');
      if (a) { const [hx, hy] = handOf(a, t), el = t - G.fizzle.t0; ctx.save(); ctx.globalAlpha = 1 - el / 1.2; ctx.fillStyle = '#ff9a6a'; for (let k = 0; k < 8; k++) { const ang = k * TAU / 8 + el * 3; ctx.beginPath(); ctx.arc(hx + Math.cos(ang) * el * 30, hy + Math.sin(ang) * el * 30 + el * 20, 2.2, 0, TAU); ctx.fill(); } ctx.restore(); }
    }
    if (G.splash && t - G.splash.t0 < 2) {
      const el = t - G.splash.t0;
      ctx.save(); ctx.fillStyle = 'rgba(200,255,235,.85)';
      for (let k = 0; k < 40; k++) { const ang = -Math.PI * (0.1 + 0.8 * ((k * 37) % 40) / 40), v = 160 + (k * 53) % 180; const x = G.splash.x + Math.cos(ang) * v * el, y = G.splash.y + Math.sin(ang) * v * el + 300 * el * el; ctx.globalAlpha = Math.max(0, 1 - el / 2); ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = 'rgba(200,255,235,.7)'; ctx.lineWidth = 2; ctx.globalAlpha = Math.max(0, 1 - el / 2); ctx.beginPath(); ctx.ellipse(G.splash.x, G.splash.y, 30 + el * 120, 8 + el * 24, 0, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    // full-screen overlays (not lifted)
    if (G.vignette) { ctx.save(); ctx.fillStyle = rg(ctx, W / 2, H * 0.42, H * 0.25, H * 0.8, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${G.vignette})`]]); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (G.glitch && t - G.glitch.t0 < (G.glitch.dur || 0.6)) { ctx.save(); for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? 'rgba(255,140,90,.25)' : 'rgba(110,255,210,.2)'; ctx.fillRect(0, Math.random() * H, W, 2 + Math.random() * 8); } ctx.restore(); }
    if (G.flash) { const f = G.flash, el = t - f.t0, up = f.up || 0.3, hold = f.hold || 0.4, down = f.down || 1.2; let a = el < up ? el / up : el < up + hold ? 1 : 1 - (el - up - hold) / down; if (a > 0) { ctx.fillStyle = `rgba(${f.col || '235,255,245'},${Math.min(1, a)})`; ctx.fillRect(0, 0, W, H); } }
    if (G.fade) { ctx.fillStyle = `rgba(4,10,8,${G.fade})`; ctx.fillRect(0, 0, W, H); }
  }

  /* the scene canvas */
  function makeStage(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    return { ctx, draw(t, G) { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); render(ctx, t, G); } };
  }

  window.Art = { W, H, DPR, SCN, render, makeStage, drawActor, handOf, heroLook, nightify, NPC, DEER_DAY, DEER_NIGHT, OUTFIT, ROTATION, scene, lerp };
})();
