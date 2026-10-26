/* Dumpet på Måne Syv · art: everything is drawn in code */
(function () {
  const W = 390, H = 844;
  const TAU = Math.PI * 2;
  const DPR = Math.min(2, window.devicePixelRatio || 1);

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
    // a trot: diagonal legs move together
    const WK = o.walk || 0, ph = o.step || 0, sA = Math.sin(ph) * 6 * WK, sB = -sA, lA = Math.max(0, Math.cos(ph)) * 3.5 * WK, lB = Math.max(0, -Math.cos(ph)) * 3.5 * WK;
    if (WK) ctx.translate(0, -Math.abs(Math.cos(ph)) * 1.4 * WK);
    sh(() => capsule(ctx, -11, -29, -12.5 + sA, -1.5 - lA, 2.3, 1.5), o.legDark);
    sh(() => capsule(ctx, 13, -29, 15.5 + sB, -1.5 - lB, 2.5, 1.5), o.legDark);
    ctx.save(); ctx.translate(20, -38); ctx.rotate(wag - 0.3); sh(() => { ctx.beginPath(); ctx.ellipse(3, -1, 4.4, 2.6, -0.5, 0, TAU); }, o.tail); ctx.restore();
    sh(() => { ctx.beginPath(); ctx.ellipse(2, -35, 19.5, 10.5, -0.06, 0, TAU); }, o.body, o.bodyShade);
    ctx.save(); ctx.beginPath(); ctx.ellipse(2, -35, 19.5, 10.5, -0.06, 0, TAU); ctx.clip();
    const R = rng(12); ctx.fillStyle = o.spots;
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(-14 + R() * 32, -46 + R() * 8, 1 + R() * 2.4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = o.belly; ctx.beginPath(); ctx.ellipse(1, -27, 13, 4.5, 0, 0, TAU); ctx.fill();
    ctx.restore();
    sh(() => capsule(ctx, -7, -31, -6 + sB, -1.5 - lB, 2.7, 1.6), o.leg);
    sh(() => capsule(ctx, 17, -31, 19.5 + sA, -1.5 - lA, 2.9, 1.6), o.leg);
    ctx.fillStyle = o.hoof; [[-6 + sB, -lB], [19.5 + sA, -lA], [-12.5 + sA, -lA], [15.5 + sB, -lB]].forEach(([hx, hy]) => { ctx.beginPath(); ctx.ellipse(hx, hy - 1, 2.2, 1.4, 0, 0, TAU); ctx.fill(); });
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
    const ds = 1.35 * (D.sc || 1);
    if (D.beam === 0) { ctx.save(); ctx.translate(dx, dy); ctx.scale(ds, ds); droneBody(ctx, t, N, D); ctx.restore(); return; }
    const len = D.len || 340;
    ctx.save();
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(sweep);
    ctx.globalCompositeOperation = N ? 'lighter' : 'source-over';
    const beamCol = D.alert ? 'rgba(255,110,80,' : N ? 'rgba(255,190,110,' : 'rgba(80,230,200,';
    ctx.fillStyle = lg(ctx, 0, 0, 0, len, [[0, beamCol + (N ? '.55)' : '.45)')], [0.7, beamCol + (N ? '.18)' : '.12)')], [1, beamCol + '0)']]);
    ctx.beginPath(); ctx.moveTo(-4, 5); ctx.lineTo(4, 5); ctx.lineTo(len * 0.16, len); ctx.lineTo(-len * 0.16, len); ctx.closePath(); ctx.fill();
    if (!N) { ctx.strokeStyle = 'rgba(40,190,160,.35)'; ctx.lineWidth = 0.8; for (let k = 0; k < 4; k++) { const yy = ((t * 60 + k * 70) % (len - 60)) + 10, w = 3 + yy * 0.144; ctx.beginPath(); ctx.moveTo(-w, yy); ctx.lineTo(w, yy); ctx.stroke(); } }
    ctx.restore();
    ctx.translate(dx, dy); ctx.scale(ds, ds);
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
    // walking: legs swing around the hips, the arms counter-swing, the body dips as the stride opens
    const WK = o.walk || 0, ph = o.step || 0, A = 0.36 * WK;
    const aF = -A * Math.sin(ph), aB = A * Math.sin(ph);
    const liftF = WK * Math.max(0, Math.cos(ph)) * 0.09, liftB = WK * Math.max(0, -Math.cos(ph)) * 0.09;
    if (WK) ctx.translate(0, 101 * (1 - Math.cos(A * Math.abs(Math.sin(ph)))));
    if (WK) {
      const sw = aB * 0.75 * (1 - K), rot = p => { const dx = p[0] - S0[0], dy = p[1] - S0[1], c = Math.cos(sw), s2 = Math.sin(sw); p[0] = S0[0] + dx * c - dy * s2; p[1] = S0[1] + dx * s2 + dy * c; };
      rot(E); rot(Wr); rot(HD);
    }
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
      ctx.save(); if (WK) { ctx.translate(-17, -158 + br); ctx.rotate(aF * 0.75); ctx.translate(17, 158 - br); }
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
      ctx.restore();
    }
    if (o.staff) staffDraw(ctx, o, t, br);

    /* ---------- legs and boots */
    const legsBlock = () => {
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
    };
    if (!WK) legsBlock();
    else [0, 1].forEach(side => {
      const hx = side ? 7 : -6, a = side ? aF : aB, lf = side ? liftF : liftB;
      ctx.save(); ctx.translate(hx, -101); ctx.rotate(a); ctx.scale(1, 1 - lf); ctx.translate(-hx, 101);
      ctx.beginPath(); ctx.moveTo(0.17, -114); ctx.lineTo(side ? 70 : -70, -114); ctx.lineTo(side ? 70 : -70, 12); ctx.lineTo(6, 12); ctx.closePath(); ctx.clip();
      legsBlock(); ctx.restore();
    });

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
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = F; ctx.lineWidth = o.browW || 1.05;
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
    if (o.stubble) { ctx.save(); ctx.fillStyle = o.stubble; ctx.beginPath(); ctx.moveTo(-5.6, -184 + br); ctx.bezierCurveTo(-6, -175 + br, -1, -171 + br, 4.5, -170.6 + br); ctx.bezierCurveTo(8.6, -170.6 + br, 11.6, -174 + br, 12.4, -181 + br); ctx.lineTo(11.4, -180.6 + br); ctx.bezierCurveTo(10, -178.4 + br, 8.4, -178.6 + br, 7.6, -179.2 + br); ctx.quadraticCurveTo(5.4, -180 + br, 4, -178 + br); ctx.bezierCurveTo(1, -176 + br, -2, -180 + br, -3.4, -184 + br); ctx.closePath(); ctx.fill(); ctx.restore(); }
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
  // the man: short dark hair, stubble, heavier brows; same clothes
  const HAIR_M = { hairStyle: 'short', hair: '#2e1e14', band: '#b4602e', stubble: 'rgba(52,32,22,.32)', browW: 1.6, lips: '#a8705c', skin: '#cf9a74' };
  function heroLook(outfit, extra, male) { return Object.assign({}, SKIN, male ? HAIR_M : HAIR, OUTFIT[outfit] || OUTFIT.stifinder, extra || {}); }

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
  // the fallen ones: people from Earth who fell before the hero, and live in Kronby
  Object.assign(NPC, {
    ruth: Object.assign({}, SKIN, { skin: '#e6c2a4', skinShade: 'rgba(120,70,50,.25)', face: '#4a2a1c', lips: '#a0645a', outer: 'tunic', coat: '#6e5a7e', coatShade: 'rgba(30,20,40,.3)', top: '#6e5a7e', trim: '#d8c49a', sash: '#d8c49a', sashShade: 'rgba(80,60,20,.3)', pants: 'wide', legs: '#3e3e48', legsShade: 'rgba(0,0,0,.25)', hemTrim: '#d8c49a', sleeve: '#6e5a7e', backSleeve: 'full', upSleeve: '#6e5a7e', collarStyle: 'v', hairStyle: 'knot', hair: '#d6d2c8', boots: '#3a2a1e', bootStyle: 'short', marks: 0 }),
    mateo: Object.assign({}, SKIN, { skin: '#b5815c', skinShade: 'rgba(90,45,20,.3)', face: '#2a160c', lips: '#8a4a3a', outer: 'vest', vest: '#2f5a4a', vestShade: 'rgba(0,30,20,.3)', pocket: '#244a3c', top: '#ece4d0', topShade: 'rgba(80,70,50,.2)', sleeve: '#ece4d0', legs: '#3a3020', legsShade: 'rgba(0,0,0,.25)', hairStyle: 'short', hair: '#1e1610', beard: '#2a1c14', boots: '#3a2616', bootStyle: 'short', marks: 0 }),
    noor: Object.assign({}, SKIN, { skin: '#c48c62', skinShade: 'rgba(100,50,25,.28)', face: '#2a160c', lips: '#9a4e44', outer: 'jacket', coat: '#4e6e92', coatShade: 'rgba(10,20,40,.35)', top: '#e8e0d0', hemBand: '#3a5270', pauldron: '#3a5270', legs: '#2a2a36', legsShade: 'rgba(0,0,0,.3)', hairStyle: 'long', hair: '#1a1210', boots: '#2a1e16', bootStyle: 'short', marks: 0 }),
    kofi: Object.assign({}, SKIN, { skin: '#6a4630', skinShade: 'rgba(30,15,5,.35)', face: '#1a0e08', lips: '#5a2e24', outer: 'longcoat', coat: '#b08a3a', coatShade: 'rgba(60,40,0,.3)', lining: '#4a3a1a', top: '#2a3e3e', collar: '#8a6a2a', collarStyle: 'high', legs: '#2a2a2a', legsShade: 'rgba(0,0,0,.3)', hairStyle: 'short', hair: '#120c08', stubble: 'rgba(20,10,5,.35)', browW: 1.5, boots: '#2a1e16', bootStyle: 'short', marks: 0 })
  });
  // Birk at home: no armour, no spear
  NPC.birkHome = Object.assign({}, NPC.birk, { outer: 'tunic', coat: '#3a5a48', coatShade: 'rgba(0,20,10,.3)', top: '#3a5a48', trim: '#9a7444', sash: '#9a7444', sashShade: 'rgba(50,30,10,.35)', pants: 'wide', legs: '#2a2a22', legsShade: 'rgba(0,0,0,.3)', hemTrim: '#9a7444', sleeve: '#3a5a48', backSleeve: 'full', upSleeve: '#3a5a48', collarStyle: 'v', bootStyle: 'short', staff: false, cape: null });
  // people born in Kronby
  Object.assign(NPC, {
    ebbe: Object.assign({}, SKIN, { skin: '#e8bf9a', skinShade: 'rgba(120,70,50,.25)', face: '#4a2a1c', lips: '#a0645a', outer: 'tunic', coat: '#efe6d0', coatShade: 'rgba(90,80,60,.25)', top: '#efe6d0', trim: '#b4602e', sash: '#b4602e', sashShade: 'rgba(80,30,10,.3)', pants: 'wide', legs: '#5a4a3a', legsShade: 'rgba(0,0,0,.25)', hemTrim: '#d8c49a', sleeve: '#efe6d0', backSleeve: 'full', upSleeve: '#efe6d0', collarStyle: 'v', hairStyle: 'short', hair: '#9a7a52', beard: '#9a7a52', boots: '#3a2a1e', bootStyle: 'short', marks: 0 }),
    vibeke: Object.assign({}, SKIN, { skin: '#dcae88', skinShade: 'rgba(120,70,50,.25)', face: '#3a2016', lips: '#a0545a', outer: 'jacket', coat: '#7a4a5a', coatShade: 'rgba(40,10,20,.35)', top: '#e8dcc8', hemBand: '#5a3040', pauldron: '#5a3040', legs: '#3a3030', legsShade: 'rgba(0,0,0,.3)', hairStyle: 'long', hair: '#4a2e1a', boots: '#2a1e16', bootStyle: 'short', marks: 0 }),
    tove: Object.assign({}, SKIN, { skin: '#e2b48e', skinShade: 'rgba(120,70,50,.25)', face: '#3a2016', lips: '#b0645a', outer: 'tunic', coat: '#d9a441', coatShade: 'rgba(90,60,0,.3)', top: '#d9a441', trim: '#6a8a4a', sash: '#6a8a4a', sashShade: 'rgba(20,40,10,.3)', pants: 'slim', legs: '#4a5a3a', legsShade: 'rgba(0,0,0,.25)', sleeve: '#d9a441', backSleeve: 'full', upSleeve: '#d9a441', collarStyle: 'v', hairStyle: 'tail', hair: '#6a3e22', band: '#c84a3a', boots: '#3a2a1e', bootStyle: 'short', marks: 0 })
  });
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
      c.save(); c.translate(286, 250); c.rotate(-0.3); c.fillStyle = rg(c, -10, -10, 4, 46, [[0, '#e9f7dc'], [1, '#7fb894']]); c.beginPath(); c.arc(0, 0, 36, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(170,255,210,.8)'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(0, 5, 64, 10, 0, 0, TAU); c.stroke(); c.restore();
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
    // clipY: everything below this line is under water
    if (a.clipY != null) { ctx.beginPath(); ctx.rect(-2000, -2000, 4000 + W, a.clipY + 2000); ctx.clip(); }
    // mid: turn around the middle of the body instead of the feet
    ctx.translate(a.x, a.y); if (a.rot) ctx.rotate(a.rot); if (a.mid) ctx.translate(0, a.mid); if (a.flip) ctx.scale(-1, 1); if (a.sq) ctx.scale(1 + (1 - a.sq) * 0.35, a.sq);
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

  /* ===================== THE WALKABLE WORLD
     A side-view landscape you walk through. Small figures, a big sky, open places and closed ones.
     World x runs along the path; the screen shows 390 × 844 with the ground line at GY. */
  const GY = 600, HS = 0.56;

  /* ---------- colour helpers */
  const _cc = {};
  function rgba(c) {
    if (Array.isArray(c)) return c;
    if (_cc[c]) return _cc[c];
    let r;
    if (c[0] === '#') { const n = c.length === 4 ? c.slice(1).split('').map(x => parseInt(x + x, 16)) : [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); r = [n[0], n[1], n[2], 1]; }
    else { const m = c.match(/rgba?\(([^)]+)\)/); const v = m[1].split(',').map(Number); r = [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; }
    return (_cc[c] = r);
  }
  const cstr = a => a[3] >= 1 ? `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})` : `rgba(${a[0] | 0},${a[1] | 0},${a[2] | 0},${+a[3].toFixed(3)})`;
  function cmix(a, b, k) { a = rgba(a); b = rgba(b); return cstr([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k]); }
  const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

  /* ---------- palettes: night is its own family; the day family shifts with the hour */
  const PAL = {
    night: { sky0: '#04100d', sky1: '#0b2520', sky2: '#1a4334', stars: 1, sunCol: '#e9f7dc', sunY: 0.3, sunR: 30, sunGlow: 'rgba(170,255,210,.25)', ring: '#1d3a32', ringLine: 'rgba(130,230,190,.55)', far: '#0c1f19', far2: '#0f251e', towerLit: 1, mist: 'rgba(110,200,150,.13)',
      trunk: '#2b2117', trunkD: '#120d08', trunkL: '#3d3020', leafD: '#0a1610', leafM: '#11251a', leafL: '#1b3726', edge: 'rgba(120,255,180,.35)', seam: '#7dffb0', seamA: 0.95,
      ground: '#12231a', groundD: '#050b07', grass: '#1d3a28', grassL: '#2a5238', water: '#0f3830', waterL: 'rgba(150,255,210,.45)', canopy: '#040c08', grade: null, glow: 1 },
    dawn: { sky0: '#2c4a5c', sky1: '#c99a8c', sky2: '#f4d6a6', stars: 0.15, sunCol: '#fff1cf', sunY: 0.52, sunR: 30, sunGlow: 'rgba(255,214,160,.4)', ring: '#c9b8b0', ringLine: 'rgba(255,240,220,.6)', far: '#7a8796', far2: '#94a0aa', towerLit: 0.3, mist: 'rgba(255,226,206,.38)',
      trunk: '#6e4a32', trunkD: '#43291b', trunkL: '#b08056', leafD: '#2a4638', leafM: '#3f6448', leafL: '#8eb474', edge: 'rgba(255,230,200,.55)', seam: '#7affcf', seamA: 0.35,
      ground: '#526c3c', groundD: '#24341c', grass: '#6c9450', grassL: '#9cc078', water: '#6a9a92', waterL: 'rgba(255,236,210,.6)', canopy: '#16261c', grade: 'rgba(255,160,130,.10)', glow: 0.25 },
    day: { sky0: '#4a9c8a', sky1: '#a3d3c0', sky2: '#eeeecd', stars: 0, sunCol: '#fffbe6', sunY: 0.2, sunR: 26, sunGlow: 'rgba(255,255,230,.45)', ring: '#eef4e8', ringLine: 'rgba(120,170,160,.55)', far: '#8fbca7', far2: '#7eae98', towerLit: 0, mist: 'rgba(245,252,240,.42)',
      trunk: '#8a5a3a', trunkD: '#593823', trunkL: '#c48a58', leafD: '#2b5638', leafM: '#3c7246', leafL: '#86c06a', edge: 'rgba(235,255,220,.7)', seam: '#7affcf', seamA: 0.3,
      ground: '#6a9c52', groundD: '#2c4a26', grass: '#86c06a', grassL: '#b4e08a', water: '#7fb8a4', waterL: 'rgba(255,255,240,.7)', canopy: '#1d3a28', grade: 'rgba(255,200,150,0)', glow: 0.15 },
    afternoon: { sky0: '#5498a2', sky1: '#b6d6c4', sky2: '#f1e2b6', stars: 0, sunCol: '#fff6d8', sunY: 0.3, sunR: 27, sunGlow: 'rgba(255,240,200,.45)', ring: '#f0eee0', ringLine: 'rgba(150,170,150,.5)', far: '#9fb8a0', far2: '#8aa890', towerLit: 0, mist: 'rgba(250,245,225,.42)',
      trunk: '#8e5c3a', trunkD: '#5a3822', trunkL: '#cc9460', leafD: '#30583a', leafM: '#46784a', leafL: '#98c46a', edge: 'rgba(255,250,215,.7)', seam: '#7affcf', seamA: 0.3,
      ground: '#76a050', groundD: '#30492a', grass: '#93c06a', grassL: '#c4e08a', water: '#86b8a8', waterL: 'rgba(255,250,230,.7)', canopy: '#20392a', grade: 'rgba(255,220,160,.06)', glow: 0.15 },
    golden: { sky0: '#3e6f80', sky1: '#e1b27a', sky2: '#f6cf86', stars: 0, sunCol: '#fff0c0', sunY: 0.45, sunR: 32, sunGlow: 'rgba(255,200,120,.5)', ring: '#f2d8b0', ringLine: 'rgba(200,150,100,.5)', far: '#9a8a6c', far2: '#86795e', towerLit: 0.2, mist: 'rgba(255,215,160,.4)',
      trunk: '#8a5432', trunkD: '#54301c', trunkL: '#e09a58', leafD: '#36502e', leafM: '#5a7038', leafL: '#c4b45a', edge: 'rgba(255,220,150,.75)', seam: '#7affcf', seamA: 0.35,
      ground: '#7a8a40', groundD: '#3a3a1e', grass: '#a0a850', grassL: '#e0c070', water: '#a8a888', waterL: 'rgba(255,220,160,.75)', canopy: '#2a2e1c', grade: 'rgba(255,170,90,.12)', glow: 0.3 },
    dusk: { sky0: '#141e30', sky1: '#5a3e58', sky2: '#d8805a', stars: 0.45, sunCol: '#ffb070', sunY: 0.66, sunR: 34, sunGlow: 'rgba(255,140,90,.45)', ring: '#4a3a4c', ringLine: 'rgba(255,170,140,.45)', far: '#2c2c3a', far2: '#36323e', towerLit: 0.8, mist: 'rgba(230,140,110,.2)',
      trunk: '#4a3022', trunkD: '#24160e', trunkL: '#8a5a3a', leafD: '#16241c', leafM: '#22382a', leafL: '#3e5a3a', edge: 'rgba(255,160,120,.4)', seam: '#7dffb0', seamA: 0.65,
      ground: '#323e26', groundD: '#10140c', grass: '#46582e', grassL: '#6a7a40', water: '#3a4a50', waterL: 'rgba(255,170,120,.5)', canopy: '#0c120c', grade: 'rgba(70,30,90,.14)', glow: 0.7 }
  };
  const PKEYS = Object.keys(PAL.night);
  // the day family along the path: you walk through the hours
  const DAYKEYS = [[2200, 'dawn'], [3300, 'day'], [5500, 'day'], [6000, 'afternoon'], [6800, 'golden'], [7600, 'dusk']];
  const _pc = {};
  function palAt(wx, night) {
    const key = night ? 'N' : 'D' + Math.round(wx / 25);
    if (_pc[key]) return _pc[key];
    let P;
    if (night) P = PAL.night;
    else {
      let i = 0; while (i < DAYKEYS.length - 1 && wx > DAYKEYS[i + 1][0]) i++;
      const [x0, a] = DAYKEYS[i], [x1, b] = DAYKEYS[Math.min(i + 1, DAYKEYS.length - 1)];
      const k = x1 > x0 ? smooth(x0, x1, wx) : 0, A = PAL[a], B = PAL[b];
      P = {};
      PKEYS.forEach(n => { const va = A[n], vb = B[n]; P[n] = typeof va === 'number' ? va + (vb - va) * k : va == null || vb == null ? (k < 0.5 ? va : vb) : cmix(va, vb, k); });
    }
    P = Object.assign({}, P);
    P.midD = cmix(P.leafD, P.mist.replace(/[\d.]+\)$/, '1)'), night ? 0.15 : 0.32); P.midM = cmix(P.leafM, P.mist.replace(/[\d.]+\)$/, '1)'), night ? 0.15 : 0.3); P.midT = cmix(P.trunkD, P.mist.replace(/[\d.]+\)$/, '1)'), night ? 0.12 : 0.35);
    return (_pc[key] = P);
  }

  /* ---------- the map: zones along the path */
  const ZONES = [
    { id: 'lake', x0: -400, x1: 1350, closed: 0, zoom: 1 },
    { id: 'thicket', x0: 1350, x1: 2250, closed: 1, zoom: 1.06 },
    { id: 'wreck', x0: 2250, x1: 2950, closed: 0.75, zoom: 1.04 },
    { id: 'woods', x0: 2950, x1: 3950, closed: 1, zoom: 1.06 },
    { id: 'meadow', x0: 3950, x1: 4750, closed: 0, zoom: 0.96 },
    { id: 'edge', x0: 4750, x1: 5550, closed: 0.45, zoom: 1 },
    { id: 'ravine', x0: 5550, x1: 6350, closed: 0, zoom: 0.94 },
    { id: 'stones', x0: 6350, x1: 7150, closed: 0.15, zoom: 0.98 },
    { id: 'kronby', x0: 7150, x1: 8600, closed: 0, zoom: 0.96 }
  ];
  let _planks = 0;
  const LAKE_X = 430, RAV0 = 5730, RAV1 = 6010, PYLON_X = 4440, WRECK_X = 2640, GATE_X = 8040, STONES_X = 6700;
  function zoneAt(wx) { for (const z of ZONES) if (wx < z.x1) return z; return ZONES[ZONES.length - 1]; }
  function zoneMix(wx, key) {
    for (let i = 0; i < ZONES.length; i++) {
      const z = ZONES[i], n = ZONES[i + 1];
      if (wx < z.x1 - 160 || !n) return z[key];
      if (wx < z.x1 + 160) return z[key] + (n[key] - z[key]) * smooth(z.x1 - 160, z.x1 + 160, wx);
    }
    return ZONES[ZONES.length - 1][key];
  }
  // the height of the ground under a world x (screen y at zoom 1)
  function groundAt(wx) {
    if (wx > RAV0 && wx < RAV1) { const u = (wx - RAV0) / (RAV1 - RAV0); return u * 8 < _planks + 0.15 ? GY + Math.sin(u * Math.PI) * 6 : GY + 900; }
    let y = GY + 9 * Math.sin(wx * 0.0042) + 5 * Math.sin(wx * 0.0113 + 1.3);
    if (wx < LAKE_X) y += smooth(LAKE_X, LAKE_X - 190, wx) * 44;
    const dR = wx < RAV0 ? RAV0 - wx : wx - RAV1; if (dR < 260) y = lerp(GY, y, smooth(60, 260, dR));
    const dW = Math.abs(wx - WRECK_X - 10); if (dW < 420) y = lerp(GY + 2, y, smooth(320, 420, dW));
    return y;
  }

  /* ---------- trees, built once as paths and painted each frame in the colours of the hour */
  function blob2(P, cx, cy, r, R, n, j, sy) {
    n = n || 9; j = j == null ? 0.22 : j; sy = sy || 0.85;
    const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + R() * 0.3, rr = r * (1 - j / 2 + R() * j); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sy]); }
    P.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; P.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    P.closePath();
  }
  function crown(T, cx, cy, r, R, light, count) {
    light = light || [0.5, -0.8]; count = count || 6;
    for (let i = 0; i < count; i++) { const a = R() * TAU, d = R() * r * 0.55; blob2(T.leafD, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, r * (0.45 + R() * 0.25), R, 9, 0.24, 0.82); }
    for (let i = 0; i < count; i++) { const a = R() * TAU, d = R() * r * 0.42; blob2(T.leafM, cx + Math.cos(a) * d + light[0] * r * 0.2, cy + Math.sin(a) * d * 0.8 + light[1] * r * 0.2, r * (0.3 + R() * 0.18), R, 8, 0.26, 0.82); }
    for (let i = 0; i < Math.ceil(count * 0.7); i++) { const a = R() * TAU, d = R() * r * 0.3; blob2(T.leafL, cx + Math.cos(a) * d + light[0] * r * 0.4, cy + Math.sin(a) * d * 0.8 + light[1] * r * 0.4, r * (0.13 + R() * 0.12), R, 7, 0.3, 0.8); }
    for (let i = 0; i < count * 2; i++) { const a = -Math.PI / 2 + (R() - 0.3) * 1.9; T.edge.push([cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.66, 0.8 + R() * 1.8]); }
    T.crowns.push([cx, cy, r]);
  }
  function trunk2(T, x, yTop, yBot, w0, w1, lean, R) {
    const P = T.trunk, D = T.trunkD, L = T.trunkL;
    P.moveTo(x - w1 / 2 - 7, yBot); P.bezierCurveTo(x - w1 / 2, yBot - 26, x - w0 / 2 + lean * 0.5, yTop + 50, x - w0 / 2 + lean, yTop);
    P.lineTo(x + w0 / 2 + lean, yTop); P.bezierCurveTo(x + w0 / 2 + lean * 0.5, yTop + 50, x + w1 / 2, yBot - 26, x + w1 / 2 + 8, yBot); P.closePath();
    D.moveTo(x - w1 / 2 - 7, yBot); D.bezierCurveTo(x - w1 / 2, yBot - 26, x - w0 / 2 + lean * 0.5, yTop + 50, x - w0 / 2 + lean, yTop);
    D.lineTo(x - w0 * 0.1 + lean, yTop); D.bezierCurveTo(x - w0 * 0.05 + lean * 0.5, yTop + 50, x - w1 * 0.12, yBot - 26, x - w1 * 0.1, yBot); D.closePath();
    L.moveTo(x + w1 * 0.3, yBot); L.bezierCurveTo(x + w1 * 0.3, yBot - 26, x + w0 * 0.22 + lean * 0.5, yTop + 50, x + w0 * 0.22 + lean, yTop);
    L.lineTo(x + w0 * 0.38 + lean, yTop); L.bezierCurveTo(x + w0 * 0.38 + lean * 0.5, yTop + 50, x + w1 * 0.4, yBot - 26, x + w1 * 0.42, yBot); L.closePath();
    // seams of light running up
    for (let i = 0; i < 2; i++) { const u = 0.3 + i * 0.35 + R() * 0.1, pts = []; for (let k = 0; k <= 6; k++) { const v = k / 6, yy = lerp(yBot - 4, yBot - (yBot - yTop) * (0.45 + R() * 0.4), v); pts.push([x - w1 / 2 + w1 * u + (lean * (yBot - yy) / (yBot - yTop)) * 0.8 + (R() - 0.5) * 3, yy]); } T.seams.push(pts); }
  }
  function branch2(T, x0, y0, x1, y1, w) {
    const P = T.trunk, dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
    P.moveTo(x0 + nx * w, y0 + ny * w); P.quadraticCurveTo((x0 + x1) / 2 + nx * w * 0.7, (y0 + y1) / 2 + ny * w * 0.7 - 8, x1 + nx * w * 0.35, y1 + ny * w * 0.35);
    P.lineTo(x1 - nx * w * 0.35, y1 - ny * w * 0.35); P.quadraticCurveTo((x0 + x1) / 2 - nx * w * 0.7, (y0 + y1) / 2 - ny * w * 0.7 - 8, x0 - nx * w, y0 - ny * w); P.closePath();
  }
  const TREEKINDS = ['broad', 'tall', 'pod', 'young', 'broad', 'tall'];
  const _trees = {};
  function treeDef(kind, seed) {
    const key = kind + seed; if (_trees[key]) return _trees[key];
    const R = rng(seed * 7 + 3), T = { trunk: new Path2D(), trunkD: new Path2D(), trunkL: new Path2D(), leafD: new Path2D(), leafM: new Path2D(), leafL: new Path2D(), edge: [], seams: [], pods: [], rings: [], crowns: [], cap: null, kind };
    if (kind === 'broad') {
      const h = 130 + R() * 50, lean = (R() - 0.5) * 16;
      trunk2(T, 0, -h, 0, 15 + R() * 6, 26 + R() * 8, lean, R);
      branch2(T, lean * 0.6, -h * 0.7, -48 - R() * 20, -h - 30, 6); branch2(T, lean * 0.7, -h * 0.8, 50 + R() * 20, -h - 26, 6);
      crown(T, lean - 46, -h - 44, 56 + R() * 14, R, [0.5, -0.8], 6); crown(T, lean + 48, -h - 48, 56 + R() * 14, R, [0.5, -0.8], 6); crown(T, lean, -h - 92, 66 + R() * 14, R, [0.5, -0.8], 7);
      T.h = h + 160; T.w = 260;
    } else if (kind === 'tall') {
      const h = 250 + R() * 90, lean = (R() - 0.5) * 12;
      trunk2(T, 0, -h, 0, 9 + R() * 3, 18 + R() * 5, lean, R);
      for (let k = 0; k < 3; k++) { const y = -h + k * 52 - 10; crown(T, lean * (1 - k * 0.2) + (k % 2 ? 14 : -10), y, 40 - k * 4 + R() * 8, R, [0.5, -0.8], 5); }
      T.rings.push([lean * 0.4, -h * 0.42, 26 + R() * 8]); if (R() > 0.4) T.rings.push([lean * 0.3, -h * 0.28, 20 + R() * 6]);
      T.h = h + 50; T.w = 120;
    } else if (kind === 'pod') {
      const h = 160 + R() * 50, lean = (R() - 0.5) * 18;
      trunk2(T, 0, -h, 0, 13, 22, lean, R);
      branch2(T, lean * 0.6, -h * 0.75, -58, -h - 6, 5); branch2(T, lean * 0.6, -h * 0.8, 62, -h - 2, 5);
      crown(T, lean, -h - 46, 62 + R() * 10, R, [0.5, -0.8], 7); crown(T, lean - 58, -h - 14, 34, R, [0.5, -0.8], 4); crown(T, lean + 62, -h - 10, 34, R, [0.5, -0.8], 4);
      for (let k = 0; k < 5; k++) T.pods.push([lean + (k - 2) * 26 + (R() - 0.5) * 10, -h + 6 + R() * 20, 26 + R() * 50, R() * TAU]);
      T.h = h + 110; T.w = 200;
    } else if (kind === 'young') {
      const h = 60 + R() * 30, lean = (R() - 0.5) * 10;
      trunk2(T, 0, -h, 0, 6, 11, lean, R);
      crown(T, lean, -h - 30, 38 + R() * 10, R, [0.5, -0.8], 5); crown(T, lean + 22, -h - 6, 24, R, [0.5, -0.8], 3);
      T.h = h + 70; T.w = 110;
    } else if (kind === 'mush') {
      const h = 70 + R() * 70, w = 9 + R() * 5, cw = 40 + R() * 30, lean = (R() - 0.5) * 20;
      T.trunk.moveTo(-w, 0); T.trunk.quadraticCurveTo(-w * 0.5 + lean * 0.4, -h * 0.5, -w * 0.6 + lean, -h); T.trunk.lineTo(w * 0.6 + lean, -h); T.trunk.quadraticCurveTo(w * 0.5 + lean * 0.4, -h * 0.5, w, 0); T.trunk.closePath();
      T.cap = new Path2D(); T.cap.moveTo(lean - cw, -h + 4); T.cap.bezierCurveTo(lean - cw, -h - cw * 0.9, lean + cw, -h - cw * 0.9, lean + cw, -h + 4); T.cap.quadraticCurveTo(lean, -h - 8, lean - cw, -h + 4); T.cap.closePath();
      T.spots = []; for (let k = 0; k < 7; k++) T.spots.push([lean + (R() - 0.5) * cw * 1.3, -h - 6 - R() * cw * 0.5, 2 + R() * 3]);
      T.h = h + cw; T.w = cw * 2;
    }
    return (_trees[key] = T);
  }
  // paint a tree: P palette, mid = hazed version for the middle distance
  function paintTree(ctx, T, x, y, s, flip, P, t, mid, night, sway) {
    ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
    const tD = mid ? P.midT : P.trunkD, tB = mid ? cmix(P.trunk, P.mist.replace(/[\d.]+\)$/, '1)'), night ? 0.12 : 0.33) : P.trunk;
    if (T.kind === 'mush') {
      ctx.fillStyle = mid ? P.midT : cmix(P.trunkL, '#e8e0c8', 0.3); ctx.fill(T.trunk);
      ctx.fillStyle = night ? '#1d4a3c' : '#b4602e'; ctx.fill(T.cap);
      if (night) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(120,255,200,.6)'; T.spots.forEach(([sx, sy, r]) => { ctx.beginPath(); ctx.arc(sx, sy, r * 2.2, 0, TAU); ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(sx, sy, r * 0.8, 0, TAU); ctx.fill(); }); ctx.restore(); }
      else { ctx.fillStyle = 'rgba(255,240,210,.7)'; T.spots.forEach(([sx, sy, r]) => { ctx.beginPath(); ctx.arc(sx, sy, r * 0.8, 0, TAU); ctx.fill(); }); }
      ctx.restore(); return;
    }
    ctx.fillStyle = tB; ctx.fill(T.trunk);
    ctx.fillStyle = tD; ctx.fill(T.trunkD);
    if (!mid) { ctx.fillStyle = P.trunkL; ctx.globalAlpha = 0.6; ctx.fill(T.trunkL); ctx.globalAlpha = 1; }
    // seams of light
    if (!mid && P.seamA > 0.05) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const pulse = 0.65 + 0.35 * Math.sin(t * 1.6 + x * 0.01);
      if (night) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = P.seam; ctx.globalAlpha = 0.18 * pulse * P.seamA; ctx.lineWidth = 6 / s; T.seams.forEach(pts => { poly(ctx, pts); ctx.stroke(); }); }
      ctx.globalAlpha = P.seamA * pulse; ctx.strokeStyle = P.seam; ctx.lineWidth = 1.3 / s; T.seams.forEach(pts => { poly(ctx, pts); ctx.stroke(); });
      ctx.restore();
    }
    // the crowns sway a little: shear around the top of the trunk
    ctx.save(); if (sway) { ctx.transform(1, 0, sway, 1, 0, 0); }
    ctx.fillStyle = mid ? P.midD : P.leafD; ctx.fill(T.leafD);
    ctx.fillStyle = mid ? P.midM : P.leafM; ctx.fill(T.leafM);
    if (!mid) { ctx.fillStyle = P.leafL; ctx.fill(T.leafL); }
    if (!mid && P.edge) { ctx.fillStyle = P.edge; T.edge.forEach(([ex, ey, r], i) => { if (i % 2) return; ctx.beginPath(); ctx.arc(ex, ey, r, 0, TAU); ctx.fill(); }); }
    ctx.restore();
    // luminous rings (the trees here are partly built)
    T.rings.forEach(([rx, ry, rr], i) => {
      ctx.save(); ctx.strokeStyle = night ? 'rgba(140,255,200,.75)' : mid ? 'rgba(255,255,240,.35)' : 'rgba(250,250,235,.85)'; ctx.lineWidth = 1.6 / s;
      if (night && !mid) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 8; }
      ctx.beginPath(); ctx.ellipse(rx, ry + Math.sin(t * 1.2 + i + x) * 2, rr, rr * 0.22, 0, 0, TAU); ctx.stroke(); ctx.restore();
    });
    // hanging pods
    if (!mid) T.pods.forEach(([px, py, len, ph]) => {
      const sw = Math.sin(t * 1.1 + ph) * 3, ey = py + len;
      ctx.strokeStyle = tD; ctx.lineWidth = 1 / s; ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + sw, py + len * 0.6, px + sw, ey); ctx.stroke();
      ctx.save(); ctx.fillStyle = night ? '#bfffe0' : '#f4e0a0'; if (night) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 12; }
      ctx.beginPath(); ctx.ellipse(px + sw, ey + 5, 3.6, 5.4, 0, 0, TAU); ctx.fill(); ctx.restore();
    });
    ctx.restore();
  }

  /* ---------- the scenery list: built once from the zones */
  let SCENERY = null;
  function buildScenery() {
    const R = rng(4242), near = [], mid = [], fern = [], props = [];
    const clear = [[LAKE_X - 500, LAKE_X + 60], [WRECK_X - 380, WRECK_X + 340], [PYLON_X - 90, PYLON_X + 90], [RAV0 - 60, RAV1 + 60], [GATE_X - 360, GATE_X + 400], [STONES_X - 200, STONES_X + 200]];
    const isClear = x => clear.some(([a, b]) => x > a && x < b);
    ZONES.forEach(z => {
      const dens = z.closed, x0 = Math.max(z.x0, -300), x1 = z.x1;
      // middle distance
      for (let x = x0; x < x1; x += 70 + (1 - dens) * 120 + R() * 60) mid.push({ x, k: TREEKINDS[Math.floor(R() * 6)], seed: Math.floor(R() * 40), s: 0.5 + R() * 0.18, flip: R() > 0.5, dy: -26 - R() * 14 });
      // near trees, on the path's far side
      for (let x = x0 + 40; x < x1; x += 120 + (1 - dens) * 260 + R() * 120) {
        if (isClear(x)) continue;
        let k = TREEKINDS[Math.floor(R() * 6)];
        if (z.id === 'thicket' && R() < 0.35) k = 'mush';
        if (z.id === 'lake' && x < LAKE_X) continue;
        near.push({ x, k, seed: Math.floor(R() * 40), s: k === 'tall' ? 0.78 + R() * 0.2 : 0.82 + R() * 0.25, flip: R() > 0.5, dy: -4 - R() * 6 });
      }
      for (let x = x0; x < x1; x += 30 + R() * 50) fern.push({ x, h: 14 + R() * 18 + dens * 14, a: (R() - 0.5) * 0.9, dir: R() > 0.5 ? 1 : -1, kind: R() < 0.5 ? 'fern' : 'grass', dy: 6 + R() * 26 });
    });
    // a few hand-placed things
    const front = [{ x: 820, k: 'broad', seed: 11, s: 0.86, flip: false }, { x: 3330, k: 'tall', seed: 17, s: 0.9, flip: true }, { x: 5290, k: 'pod', seed: 23, s: 0.84, flip: false }];
    for (let k = 0; k < 6; k++) props.push({ type: 'mushL', x: 1500 + k * 130 + R() * 60, s: 0.5 + R() * 0.4 });
    const canopy = (() => { const R3 = rng(31), TW = 700, D = new Path2D(), M = new Path2D(), L = new Path2D(), vines = [];
      for (let x = -60; x < TW + 60; x += 30 + R3() * 28) blob2(D, x, 18 + R3() * 64, 42 + R3() * 44, R3, 10, 0.3, 0.7);
      for (let x = -40; x < TW + 40; x += 36 + R3() * 30) blob2(M, x, 74 + R3() * 44, 16 + R3() * 22, R3, 9, 0.35, 0.75);
      for (let x = -20; x < TW + 20; x += 22 + R3() * 26) blob2(L, x, 94 + R3() * 40, 5 + R3() * 8, R3, 7, 0.4, 0.8);
      for (let k = 0; k < 14; k++) vines.push([R3() * TW, 80 + R3() * 40, 50 + R3() * 140, R3() * TAU]);
      return { TW, D, M, L, vines }; })();
    const pebbles = Array.from({ length: 220 }, () => [-400 + R() * 9000, 3 + R() * 9, 1.4 + R() * 3]);
    const fore = []; for (let x = -500; x < 9000; x += 26 + R() * 40) fore.push({ x, k: R() < 0.55 ? 'fern' : R() < 0.6 ? 'leaf' : 'grass', h: 50 + R() * 90, a: (R() - 0.5) * 0.7, dir: R() > 0.5 ? 1 : -1, dy: R() * 30, glow: R() < 0.12 });
    SCENERY = { canopy, pebbles, fore, front, near: near.sort((a, b) => a.x - b.x), mid: mid.sort((a, b) => a.x - b.x), fern, props, stars: Array.from({ length: 140 }, () => [R(), R() * 0.62, 0.3 + R() * 0.7]), hills: Array.from({ length: 90 }, (_, i) => [i * 60, 30 + R() * 60]), line: Array.from({ length: 260 }, (_, i) => [i * 34, 20 + R() * 46]), towers: Array.from({ length: 22 }, (_, i) => [i * 420 + R() * 200, 120 + R() * 110, 5 + R() * 4, R()]), isles: Array.from({ length: 8 }, (_, i) => [i * 900 + R() * 300, 0.18 + R() * 0.22, 0.5 + R() * 0.6, Math.floor(R() * 99)]), motes: motes(rng(9), 36, { y0: 120, y1: 640, r0: 0.8, r1: 2.2 }) };
  }

  /* ---------- the things that stand in the world */
  /* the wreck: a small ship half sunk in the moss. Seen from outside, or cut open when you are inside. */
  const WR = { x0: -300, x1: 280, top: -205 };
  function hullPath(ctx) {
    ctx.beginPath(); ctx.moveTo(-300, 26); ctx.bezierCurveTo(-330, -60, -300, -170, -200, -198); ctx.lineTo(150, -205);
    ctx.bezierCurveTo(230, -205, 280, -150, 282, -80); ctx.lineTo(282, 26); ctx.closePath();
  }
  function drawWreckBack(ctx, x, y, s, P, t, night, open, G) {
    // the inside: only drawn while you are in it
    if (open <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = open;
    ctx.save(); hullPath(ctx); ctx.clip();
    const wall = night ? '#1c1610' : '#4a3626', wall2 = night ? '#120e0a' : '#3a2a1e';
    ctx.fillStyle = lg(ctx, 0, -205, 0, 26, [[0, wall2], [0.6, wall], [1, wall2]]); ctx.fillRect(-340, -220, 640, 260);
    // ribs and panels
    for (let k = -5; k <= 5; k++) { const rx = k * 52; ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(rx - 5, -210, 10, 240); ctx.fillStyle = 'rgba(255,220,170,.06)'; ctx.fillRect(rx - 5, -210, 2, 240); }
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; for (let yy = -170; yy < 0; yy += 34) { ctx.beginPath(); ctx.moveTo(-320, yy); ctx.lineTo(300, yy); ctx.stroke(); }
    // portholes with the morning outside, and their light on the floor
    [[-70, -128], [30, -132], [118, -128]].forEach(([px, py]) => {
      ctx.fillStyle = night ? '#0e2a26' : lg(ctx, 0, py - 13, 0, py + 13, [[0, '#cfe8d8'], [1, '#8fbf96']]); ctx.beginPath(); ctx.arc(px, py, 13, 0, TAU); ctx.fill();
      if (!night) { ctx.fillStyle = '#5f9a5a'; ctx.beginPath(); ctx.arc(px - 4, py + 6, 7, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#b08a54'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(px, py, 14, 0, TAU); ctx.stroke();
      if (!night) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg(ctx, px, py, px + 60, 0, [[0, 'rgba(255,245,200,.32)'], [1, 'rgba(255,245,200,0)']]); ctx.beginPath(); ctx.moveTo(px - 10, py); ctx.lineTo(px + 10, py); ctx.lineTo(px + 70, 0); ctx.lineTo(px + 20, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
    });
    // notes pinned between the portholes
    [[-28, -110, -0.08], [-12, -92, 0.1], [70, -100, 0.05]].forEach(([nx, ny, a], i) => {
      ctx.save(); ctx.translate(nx, ny); ctx.rotate(a); ctx.fillStyle = '#e8dcbc'; ctx.fillRect(-8, -10, 16, 20); ctx.strokeStyle = 'rgba(60,40,20,.5)'; ctx.lineWidth = 0.6; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-6, -6 + k * 4); ctx.lineTo(5 - (k % 2) * 3, -6 + k * 4); ctx.stroke(); }
      if (i === 1) { ctx.beginPath(); ctx.moveTo(-5, 7); ctx.lineTo(-2, 2); ctx.lineTo(3, 2); ctx.lineTo(5, 7); ctx.stroke(); }
      ctx.fillStyle = '#b4602e'; ctx.beginPath(); ctx.arc(0, -9, 1.3, 0, TAU); ctx.fill(); ctx.restore();
    });
    // the locker, taller than you
    const lo = G.locker || 0;
    ctx.fillStyle = '#4a3a28'; ctx.fillRect(-262, -150, 56, 150); ctx.fillStyle = '#1e1810'; ctx.fillRect(-258, -146, 48, 142);
    if (!G.coatTaken) { ctx.fillStyle = '#8e5a36'; ctx.beginPath(); ctx.moveTo(-248, -136); ctx.lineTo(-222, -136); ctx.lineTo(-216, -40); ctx.lineTo(-254, -40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#2f7a6a'; ctx.fillRect(-239, -132, 8, 90); }
    const dw = 48 * (1 - lo); if (dw > 1) { ctx.fillStyle = '#5a4630'; ctx.fillRect(-258, -146, dw, 142); ctx.fillStyle = 'rgba(0,0,0,.3)'; for (let k = 0; k < 4; k++) ctx.fillRect(-254, -132 + k * 6, Math.max(0, dw - 8), 1.5); ctx.fillStyle = '#c58a52'; ctx.font = '700 8px "Space Grotesk", sans-serif'; if (dw > 30) ctx.fillText('A.L.', -238, -96); }
    if (lo > 0.05) { ctx.fillStyle = '#5a4630'; ctx.beginPath(); ctx.moveTo(-210, -146); ctx.lineTo(-210 + 22 * lo, -152); ctx.lineTo(-210 + 22 * lo, -2); ctx.lineTo(-210, -4); ctx.closePath(); ctx.fill(); }
    // the cot
    ctx.fillStyle = '#4a3a28'; ctx.fillRect(-180, -36, 124, 7); ctx.fillRect(-176, -29, 5, 29); ctx.fillRect(-64, -29, 5, 29);
    ctx.fillStyle = '#6a7a5a'; ctx.beginPath(); ctx.moveTo(-182, -36); ctx.bezierCurveTo(-150, -48, -90, -46, -56, -36); ctx.closePath(); ctx.fill();
    // the console where SKIB lives
    ctx.fillStyle = '#2a2420'; ctx.beginPath(); ctx.moveTo(150, 0); ctx.lineTo(160, -74); ctx.lineTo(236, -74); ctx.lineTo(246, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a322a'; ctx.fillRect(158, -78, 82, 7);
    for (let k = 0; k < 6; k++) { const on = Math.sin(t * (1 + k * 0.3) + k) > 0; ctx.fillStyle = on ? (k % 2 ? '#ffc66b' : '#7affcf') : '#3a322a'; ctx.fillRect(170 + k * 10, -60, 5, 3); }
    // crystals in the corner, roots coming through a crack
    [[262, 0, 0.2, 30], [250, 0, -0.3, 22], [-286, 0, 0.3, 24]].forEach(([cx, cy, a, L], i) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.fillStyle = i % 2 ? '#5fd4b0' : '#9ff5d6'; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 8 + 5 * Math.sin(t * 2 + i); ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-1, -L); ctx.lineTo(2, -L * 0.85); ctx.lineTo(4, 0); ctx.closePath(); ctx.fill(); ctx.restore(); });
    ctx.strokeStyle = night ? '#1a120a' : '#5a3a20'; ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-300, -120); ctx.quadraticCurveTo(-270, -80, -282, -20); ctx.stroke();
    ctx.fillStyle = P.leafM; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(-292 + k * 6, -130 + k * 22, 7, 0, TAU); ctx.fill(); }
    // the floor
    ctx.fillStyle = night ? '#14100b' : '#2a221a'; ctx.fillRect(-340, 0, 640, 30);
    ctx.strokeStyle = 'rgba(180,140,90,.2)'; ctx.lineWidth = 1; for (let k = -320; k < 300; k += 14) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k - 8, 26); ctx.stroke(); }
    // dust in the light
    for (let k = 0; k < 16; k++) { const u = (t * 0.04 + k * 0.071) % 1; ctx.fillStyle = `rgba(255,245,210,${(night ? 0.2 : 0.55) * Math.sin(u * Math.PI)})`; ctx.beginPath(); ctx.arc(-120 + (k * 37) % 300 + u * 40, -150 + (k * 23) % 140 + u * 20, 1, 0, TAU); ctx.fill(); }
    ctx.restore();
    ctx.restore();
  }
  function drawWreckShell(ctx, x, y, s, P, t, night, open) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (open < 0.99) {
      // the hull from outside: plates, portholes, the hatch, moss and roots
      ctx.save(); ctx.globalAlpha = 1 - open;
      hullPath(ctx); ctx.fillStyle = lg(ctx, 0, -205, 0, 26, night ? [[0, '#3a2c20'], [1, '#14100b']] : [[0, cmix(P.trunkL, '#e6d0b0', 0.25)], [0.55, P.trunk], [1, P.trunkD]]); ctx.fill();
      ctx.save(); hullPath(ctx); ctx.clip();
      ctx.strokeStyle = night ? 'rgba(0,0,0,.4)' : 'rgba(60,35,20,.4)'; ctx.lineWidth = 1.4;
      for (let k = -5; k <= 5; k++) { ctx.beginPath(); ctx.moveTo(k * 52, -210); ctx.lineTo(k * 52, 30); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-320, -60); ctx.lineTo(290, -64); ctx.stroke();
      ctx.restore();
      [[-70, -128], [30, -132], [118, -128]].forEach(([px, py], i) => { ctx.fillStyle = i === 1 ? (night ? '#ffc66b' : '#ffe3a0') : (night ? '#0b0806' : '#3e2a1c'); if (i === 1 && night) { ctx.shadowColor = '#ffc66b'; ctx.shadowBlur = 16; } ctx.beginPath(); ctx.arc(px, py, 12, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = night ? '#4a3a28' : '#b08a54'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 13, 0, TAU); ctx.stroke(); });
      ctx.fillStyle = night ? '#120d08' : '#4a3020'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(200, -128, 46, 128, 10) : ctx.rect(200, -128, 46, 128); ctx.fill();
      ctx.strokeStyle = night ? '#3d3020' : '#c9a24a'; ctx.lineWidth = 2.4; ctx.stroke();
      const R = rng(77);
      for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? P.leafM : P.leafD; ctx.beginPath(); blobPath(ctx, -280 + R() * 470, -200 + R() * 40, 12 + R() * 18, R, 7, 0.35, 0.6); ctx.fill(); }
      ctx.strokeStyle = P.trunkD; ctx.lineCap = 'round';
      [[-310, -40, -270, -190, -150, -205, 9], [110, 10, 70, -170, -20, -206, 7]].forEach(([a, b, c2, d, e, f, w]) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(c2, d, e, f); ctx.stroke(); });
      ctx.restore();
    }
    ctx.restore();
  }
  function drawWreckFront(ctx, x, y, s, P, t, night, open) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (open > 0.01) {
      // cut open: the thick rim of the hull and a little moss on top
      ctx.save(); ctx.globalAlpha = open;
      ctx.lineWidth = 12; ctx.strokeStyle = night ? '#2a2018' : cmix(P.trunk, P.trunkD, 0.3); hullPath(ctx); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = night ? 'rgba(255,220,170,.12)' : 'rgba(255,230,190,.35)'; hullPath(ctx); ctx.stroke();
      const R = rng(78); for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? P.leafM : P.leafD; ctx.beginPath(); blobPath(ctx, -260 + R() * 420, -204 + R() * 10, 8 + R() * 12, R, 7, 0.35, 0.55); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  }
  function drawPylon(ctx, x, y, P, t, G) {
    const L = G.locks || [0, 0, 0], open = G.pylonOpen || 0, sink = open * 150, top = -230;
    ctx.save(); ctx.translate(x, y);
    // the barrier across the path, until it opens
    if (open < 0.99) {
      ctx.save(); ctx.globalAlpha = (1 - open) * (0.55 + 0.2 * Math.sin(t * 3)); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = lg(ctx, -76, 0, -46, 0, [[0, 'rgba(120,255,210,0)'], [0.5, 'rgba(140,255,215,.55)'], [1, 'rgba(120,255,210,0)']]); ctx.fillRect(-76, -170, 30, 172);
      ctx.strokeStyle = 'rgba(190,255,230,.6)'; ctx.lineWidth = 1; for (let k = 0; k < 6; k++) { const yy = -160 + ((t * 40 + k * 28) % 160); ctx.beginPath(); ctx.moveTo(-74, yy); ctx.lineTo(-48, yy - 6); ctx.stroke(); }
      ctx.restore();
    }
    ctx.save(); ctx.beginPath(); ctx.rect(-80, -400, 160, 400); ctx.clip(); ctx.translate(0, sink);
    ctx.fillStyle = lg(ctx, -30, 0, 30, 0, [[0, '#4a5a50'], [0.55, '#7d8c80'], [1, '#5d6b62']]);
    ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-18, top + 24); ctx.lineTo(0, top); ctx.lineTo(18, top + 24); ctx.lineTo(30, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(60,200,170,${0.35 + 0.2 * Math.sin(t * 2)})`; ctx.lineWidth = 1;
    for (let k = 0; k < 9; k++) { const yy = top + 40 + k * 22, w = 8 + (k % 3) * 3; ctx.beginPath(); ctx.moveTo(-w, yy); ctx.lineTo(-w + 5, yy - 4); ctx.lineTo(w - 5, yy - 4); ctx.lineTo(w, yy); ctx.stroke(); }
    [[top + 70, 'circle'], [top + 128, 'tri'], [top + 186, 'square']].forEach(([sy, shp], i) => {
      const on = L[i], hi = G.lockHi === i, pulse = 0.6 + 0.4 * Math.sin(t * 3 + i);
      ctx.save(); ctx.translate(0, sy); ctx.fillStyle = '#26302a'; ctx.strokeStyle = on ? '#bff7e4' : hi ? '#ffd38a' : 'rgba(120,200,180,.7)'; ctx.lineWidth = on ? 2.4 : 1.6;
      if (on || hi) { ctx.shadowColor = on ? '#6fffc4' : '#ffc66b'; ctx.shadowBlur = 14 * pulse; }
      ctx.beginPath(); if (shp === 'circle') ctx.arc(0, 0, 12, 0, TAU); else if (shp === 'tri') { ctx.moveTo(0, -13); ctx.lineTo(12.5, 9); ctx.lineTo(-12.5, 9); ctx.closePath(); } else ctx.rect(-11, -11, 22, 22);
      ctx.fill(); ctx.stroke(); if (on) { ctx.fillStyle = `rgba(160,255,220,${0.5 + 0.4 * pulse})`; ctx.fill(); } ctx.restore();
    });
    ctx.fillStyle = '#bff7e4'; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 10 + 20 * open; ctx.beginPath(); ctx.moveTo(0, top - 22); ctx.lineTo(7, top - 4); ctx.lineTo(0, top + 4); ctx.lineTo(-7, top - 4); ctx.closePath(); ctx.fill();
    ctx.restore();
    // roots and moss at its foot
    ctx.strokeStyle = P.trunkD; ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-50, 4); ctx.quadraticCurveTo(-26, -14, -20, -40); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(52, 4); ctx.quadraticCurveTo(28, -10, 22, -30); ctx.stroke();
    ctx.restore();
  }
  function drawSign(ctx, x, y, P, text) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = P.trunkD; ctx.fillRect(-2, -64, 4, 64);
    ctx.fillStyle = P.trunk; ctx.beginPath(); ctx.moveTo(-26, -64); ctx.lineTo(30, -64); ctx.lineTo(38, -55); ctx.lineTo(30, -46); ctx.lineTo(-26, -46); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f4ead0'; ctx.font = `600 9px "Space Grotesk", sans-serif`; ctx.textAlign = 'center'; ctx.fillText(text, 4, -52); ctx.restore();
  }
  function drawStones(ctx, x, y, P, t, G, night) {
    const lit = G.stonesLit || 0;
    [[-150, 70, -0.06], [-80, 96, 0.04], [-10, 120, -0.02], [60, 92, 0.05], [130, 78, -0.04], [200, 60, 0.03]].forEach(([dx, h, a], i) => {
      const on = i < lit, sx = x + dx, sy = y + 9 * Math.sin((x + dx) * 0.0042) - 9 * Math.sin(x * 0.0042);
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(a);
      ctx.fillStyle = cmix('#8a8a7c', P.far, 0.25); ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-11, -h * 0.8); ctx.quadraticCurveTo(0, -h - 6, 11, -h * 0.85); ctx.lineTo(15, 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-11, -h * 0.8); ctx.quadraticCurveTo(-6, -h * 0.95, -2, -h * 0.96); ctx.lineTo(-3, 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = on ? '#bff7e4' : 'rgba(120,200,180,.45)'; ctx.lineWidth = 1.2; if (on) { ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 12 + 6 * Math.sin(t * 4 + i); }
      for (let k = 0; k < 3; k++) { const yy = -h * 0.3 - k * h * 0.18; ctx.beginPath(); ctx.moveTo(-5, yy); ctx.lineTo(0, yy - 6); ctx.lineTo(5, yy); ctx.stroke(); }
      ctx.restore();
      if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, sx, sy - h * 0.55, 4, h * 0.6, [[0, `rgba(150,255,220,${0.22 + 0.08 * Math.sin(t * 3 + i)})`], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(sx, sy - h * 0.55, h * 0.6, 0, TAU); ctx.fill(); ctx.restore(); }
    });
  }
  function drawRavine(ctx, sx0, sx1, y, P, t, G, night, z) {
    // the gap: cliff faces, mist, a river of light far below
    ctx.save();
    ctx.fillStyle = lg(ctx, 0, y, 0, y + 260, [[0, cmix(P.groundD, '#000000', 0.2)], [1, cmix(P.groundD, '#000000', 0.6)]]);
    ctx.fillRect(sx0 - 2, y - 2, sx1 - sx0 + 4, 400);
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = night ? 'rgba(120,255,210,.8)' : 'rgba(150,255,220,.55)'; ctx.lineWidth = 3; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(sx0 + 30, y + 330); ctx.bezierCurveTo(sx0 + 90, y + 250, sx1 - 120, y + 280, sx1 - 30, y + 220); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.fillStyle = lg(ctx, 0, y + 30, 0, y + 200, [[0, 'rgba(240,255,245,0)'], [0.5, P.mist], [1, 'rgba(240,255,245,0)']]); ctx.fillRect(sx0, y + 30 + Math.sin(t * 0.5) * 8, sx1 - sx0, 170); ctx.restore();
    // the far wall of the ravine, hazy
    ctx.fillStyle = cmix(P.groundD, P.far, 0.4); ctx.beginPath(); ctx.moveTo(sx0, y + 10); for (let k = 0; k <= 10; k++) { const u = k / 10; ctx.lineTo(lerp(sx0, sx1, u), y + 40 + Math.sin(u * 9) * 14 + u * 20); } ctx.lineTo(sx1, y + 400); ctx.lineTo(sx0, y + 400); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lg(ctx, 0, y + 40, 0, y + 260, [[0, 'rgba(0,0,0,0)'], [1, P.mist]]); ctx.fillRect(sx0, y + 40, sx1 - sx0, 240);
    // rock faces with strata
    const face = (ex, dir) => {
      ctx.fillStyle = cmix(P.groundD, P.trunkL, 0.18); ctx.beginPath(); ctx.moveTo(ex - dir * 60, y); ctx.lineTo(ex, y);
      const pts = [[ex + dir * 6, y + 30], [ex - dir * 10, y + 70], [ex + dir * 14, y + 120], [ex - dir * 4, y + 170], [ex + dir * 22, y + 240], [ex + dir * 8, y + 400]];
      pts.forEach(([px, py]) => ctx.lineTo(px, (py - y) * z + y)); ctx.lineTo(ex - dir * 60, y + 400); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1.2; for (let k = 1; k < 8; k++) { const yy = y + k * 30 * z; ctx.beginPath(); ctx.moveTo(ex - dir * 60, yy); ctx.lineTo(ex + dir * (4 + (k % 3) * 6), yy + 6); ctx.stroke(); }
      ctx.fillStyle = P.grass; ctx.fillRect(Math.min(ex, ex - dir * 60), y - 2, 60, 5);
      ctx.strokeStyle = P.trunkD; ctx.lineWidth = 1.6; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(ex - dir * (4 + k * 8), y + 4); ctx.quadraticCurveTo(ex + dir * 8, y + 30 + k * 12, ex + dir * (2 + k * 3), y + 50 + k * 18); ctx.stroke(); }
    };
    face(sx0, 1); face(sx1, -1);
    // planks of light
    const N = 8, n = G.planks || 0;
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N, px = lerp(sx0, sx1, u), py = y + Math.sin(u * Math.PI) * 6 * z + Math.sin(t * 1.4 + i) * 1.2, on = i < n, cr = G.crack === i, w = (sx1 - sx0) / N * 0.46;
      ctx.save(); ctx.translate(px, py);
      if (on || cr) {
        ctx.globalAlpha = cr ? (Math.sin(t * 40) > 0 ? 1 : 0.3) : 1; ctx.fillStyle = cr ? 'rgba(255,140,90,.6)' : 'rgba(170,255,225,.6)'; ctx.strokeStyle = cr ? '#ff8a5a' : '#bff7e4'; ctx.lineWidth = 1.2;
        ctx.shadowColor = cr ? '#ff8a5a' : '#6fffc4'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(-w, -2); ctx.lineTo(w, -2); ctx.lineTo(w * 1.1, 3); ctx.lineTo(-w * 1.1, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else { ctx.strokeStyle = 'rgba(190,255,230,.3)'; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.strokeRect(-w, -2, w * 2, 5); }
      ctx.restore();
    }
  }
  function drawKronby(ctx, x, y, P, t, G, z, night) {
    // a palisade of living wood along the far side of the path, a gatehouse, lanterns and the scanner ring
    const dusk = G.dusk == null ? 1 : G.dusk, R = rng(88);
    ctx.save(); ctx.translate(x, y);
    // the wall: grown logs with pointed tops
    for (let k = -14; k <= 22; k++) { if (k >= -2 && k <= 2) continue; const lx = k * 24, h = 118 + R() * 22; ctx.fillStyle = k % 2 ? P.trunk : cmix(P.trunk, P.trunkD, 0.35); ctx.beginPath(); ctx.moveTo(lx - 12, 2); ctx.lineTo(lx - 12, -h); ctx.lineTo(lx, -h - 14); ctx.lineTo(lx + 12, -h); ctx.lineTo(lx + 12, 2); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(lx - 12, -h, 5, h + 2); }
    ctx.fillStyle = P.trunkD; ctx.fillRect(-340, -96, 280, 7); ctx.fillRect(60, -96, 480, 7); ctx.fillRect(-340, -40, 280, 6); ctx.fillRect(60, -40, 480, 6);
    // moss and glowing vines on the wall
    for (let k = 0; k < 16; k++) { const mx = -330 + R() * 860; if (Math.abs(mx) < 70) continue; ctx.fillStyle = P.leafM; ctx.beginPath(); blobPath(ctx, mx, -110 + R() * 30, 8 + R() * 10, R, 7, 0.35, 0.6); ctx.fill(); }
    // the gatehouse
    ctx.fillStyle = cmix(P.trunk, P.trunkD, 0.2); ctx.fillRect(-92, -210, 34, 212); ctx.fillRect(58, -210, 34, 212);
    ctx.fillStyle = P.trunkD; ctx.fillRect(-100, -222, 50, 14); ctx.fillRect(50, -222, 50, 14);
    ctx.fillStyle = '#2b5638'; [[-75, -222], [75, -222]].forEach(([rx, ry]) => { ctx.beginPath(); ctx.moveTo(rx - 30, ry); ctx.lineTo(rx, ry - 34); ctx.lineTo(rx + 30, ry); ctx.closePath(); ctx.fill(); });
    ctx.fillStyle = '#1e140c'; ctx.beginPath(); ctx.moveTo(-58, 2); ctx.lineTo(-58, -126); ctx.quadraticCurveTo(0, -196, 58, -126); ctx.lineTo(58, 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 3; ctx.stroke();
    const open = G.gateOpen || 0;
    if (open > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,200,120,${0.35 * open})`; ctx.fillRect(-52, -124, 104, 126); ctx.restore(); }
    ctx.fillStyle = '#5a3a24'; ctx.fillRect(-53, -122, 52 * (1 - open * 0.85), 124); ctx.fillRect(1 + 52 * open * 0.85, -122, 52 * (1 - open * 0.85), 124);
    ctx.fillStyle = '#3a2416'; for (let k = 0; k < 4; k++) { ctx.fillRect(-53, -108 + k * 30, 52 * (1 - open * 0.85), 3); ctx.fillRect(1 + 52 * open * 0.85, -108 + k * 30, 52 * (1 - open * 0.85), 3); }
    // tower windows
    [[-75, -170], [75, -170], [-75, -120], [75, -120]].forEach(([wx, wy]) => { ctx.fillStyle = `rgba(255,200,110,${0.4 + 0.6 * dusk})`; ctx.shadowColor = '#ffc66b'; ctx.shadowBlur = 10 * dusk; ctx.fillRect(wx - 5, wy, 10, 14); ctx.shadowBlur = 0; });
    // runes and the scanner ring
    const sc = G.scan || 0;
    ctx.save(); ctx.translate(0, -70); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(120,255,210,${0.45 + 0.4 * sc})`; ctx.lineWidth = 2; ctx.shadowColor = '#6fffc4'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.ellipse(0, 0, 72, 92, 0, 0, TAU); ctx.stroke();
    ctx.setLineDash([5, 7]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.ellipse(0, 0, 80, 100, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    if (sc > 0) { const yy = -92 + ((t * 110) % 184); ctx.fillStyle = `rgba(150,255,220,${0.3 * sc})`; ctx.fillRect(-72, yy, 144, 5); }
    ctx.restore();
    // lanterns on posts and banners
    [[-150, -72], [150, -72], [-290, -60], [330, -60]].forEach(([lx, ly]) => {
      ctx.strokeStyle = '#2a2016'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, 2); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.save(); ctx.fillStyle = '#ffd38a'; ctx.shadowColor = '#ffc66b'; ctx.shadowBlur = 14 + 12 * dusk; ctx.beginPath(); ctx.arc(lx, ly - 6, 5, 0, TAU); ctx.fill(); ctx.restore();
      if (dusk > 0.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, lx, ly - 6, 2, 70, [[0, `rgba(255,190,110,${0.28 * dusk})`], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(lx, ly - 6, 70, 0, TAU); ctx.fill(); ctx.restore(); }
    });
    [[-75, -196], [75, -196]].forEach(([bx, by]) => { ctx.fillStyle = '#2f6a4a'; ctx.beginPath(); ctx.moveTo(bx - 10, by); ctx.lineTo(bx + 10, by); ctx.lineTo(bx + 10, by + 50); ctx.lineTo(bx, by + 42); ctx.lineTo(bx - 10, by + 50); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(bx, by + 18, 5, 0, TAU); ctx.stroke(); });
    ctx.restore();
  }
  // the town-tree behind the wall, in the middle distance: a whole town in its crown
  function drawTownTree(ctx, x, y, s, P, t, G) {
    const dusk = G.dusk == null ? 1 : G.dusk, R = rng(61);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = lg(ctx, -90, 0, 90, 0, [[0, P.midT], [0.5, cmix(P.trunk, P.mist.replace(/[\d.]+\)$/, '1)'), 0.25)], [1, P.midT]]);
    ctx.beginPath(); ctx.moveTo(-150, 0); ctx.bezierCurveTo(-90, -40, -70, -200, -64, -460); ctx.lineTo(64, -460); ctx.bezierCurveTo(70, -200, 90, -40, 150, 0); ctx.closePath(); ctx.fill();
    // branches holding houses
    ctx.strokeStyle = P.midT; ctx.lineCap = 'round';
    [[-40, -380, -200, -470, 16], [40, -390, 210, -480, 16], [0, -440, -90, -560, 13], [10, -440, 120, -580, 13]].forEach(([a, b, c2, d, w]) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c2) / 2, b - 50, c2, d); ctx.stroke(); });
    ctx.fillStyle = P.midD; for (let k = 0; k < 14; k++) { ctx.beginPath(); blobPath(ctx, -230 + R() * 460, -520 - R() * 140, 60 + R() * 40, R, 9, 0.25, 0.7); ctx.fill(); }
    ctx.fillStyle = P.midM; for (let k = 0; k < 10; k++) { ctx.beginPath(); blobPath(ctx, -200 + R() * 400, -560 - R() * 110, 34 + R() * 26, R, 8, 0.3, 0.7); ctx.fill(); }
    // houses on the branches, with lit windows
    [[-180, -478], [-110, -520], [150, -490], [200, -500], [-60, -575], [80, -590], [0, -630]].forEach(([hx, hy], i) => {
      ctx.fillStyle = cmix(P.trunkD, P.mist.replace(/[\d.]+\)$/, '1)'), 0.2); ctx.fillRect(hx - 16, hy - 14, 32, 16);
      ctx.fillStyle = '#2b5638'; ctx.beginPath(); ctx.moveTo(hx - 20, hy - 14); ctx.lineTo(hx, hy - 30); ctx.lineTo(hx + 20, hy - 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(255,200,110,${0.3 + 0.7 * dusk})`; ctx.fillRect(hx - 8, hy - 9, 5, 6); ctx.fillRect(hx + 3, hy - 9, 5, 6);
    });
    // lights winding up the trunk
    for (let k = 0; k < 18; k++) { const u = k / 18, lx = Math.sin(u * 14 + t * 0.4) * (90 - u * 50), ly = -u * 440; ctx.fillStyle = k % 2 ? '#ffc66b' : '#8affc8'; ctx.globalAlpha = (0.3 + 0.7 * dusk) * (0.5 + 0.5 * Math.sin(t * 2 + k)); ctx.fillRect(lx - 1.5, ly - 1.5, 3, 3); }
    ctx.globalAlpha = 1; ctx.restore();
  }

  /* ---------- the sky, shared by the forest and the town: gradient, stars, aurora, sun or moon, the planet, the ring, far islands */
  function drawSkyBase(ctx, t, G, P, V, night) {
    if (!SCENERY) buildScenery();
    // sky
    ctx.fillStyle = lg(ctx, 0, 0, 0, GY + 40, [[0, P.sky0], [0.55, P.sky1], [1, P.sky2]]); ctx.fillRect(0, -300, W, H + 600);
    if (P.stars > 0.02) { ctx.fillStyle = '#eafff2'; SCENERY.stars.forEach(([sx, sy, a], i) => { ctx.globalAlpha = P.stars * a * (0.7 + 0.3 * Math.sin(t * 2 + i)); ctx.fillRect(((sx * W * 1.3 - V.x * 0.01) % (W * 1.3) + W * 1.3) % (W * 1.3) - 20, sy * GY, 1.3, 1.3); }); ctx.globalAlpha = 1; }
    // aurora at night
    if (night) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35; for (let k = 0; k < 3; k++) { ctx.fillStyle = lg(ctx, 0, 60 + k * 40, 0, 200 + k * 40, [[0, 'rgba(120,255,190,0)'], [0.5, `rgba(${k ? '90,220,200' : '120,255,170'},.35)`], [1, 'rgba(120,255,190,0)']]); ctx.beginPath(); ctx.moveTo(-20, 120 + k * 40); for (let x = 0; x <= W + 20; x += 20) ctx.lineTo(x, 110 + k * 40 + Math.sin(x * 0.012 + t * 0.3 + k * 2 - V.x * 0.0004) * 30); ctx.lineTo(W + 20, 220 + k * 40); ctx.lineTo(-20, 220 + k * 40); ctx.closePath(); ctx.fill(); } ctx.restore(); }
    // sun or moon, and the ringed planet that hangs over everything
    { const sx = W * 0.72 - V.x * 0.004, sy = GY * P.sunY;
      ctx.save(); ctx.fillStyle = rg(ctx, sx, sy, P.sunR * 0.5, P.sunR * 4, [[0, P.sunGlow], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(sx - P.sunR * 4, sy - P.sunR * 4, P.sunR * 8, P.sunR * 8);
      ctx.fillStyle = P.sunCol; ctx.beginPath(); ctx.arc(sx, sy, P.sunR, 0, TAU); ctx.fill(); ctx.restore();
      const px = W * 0.2 - V.x * 0.006, py = 120;
      ctx.save(); ctx.translate(((px % (W + 300)) + W + 300) % (W + 300) - 150, py); ctx.rotate(-0.28); ctx.globalAlpha = night ? 0.9 : 0.55;
      ctx.fillStyle = night ? '#bfe8cf' : '#f6f2e0'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
      ctx.strokeStyle = night ? 'rgba(170,255,210,.8)' : 'rgba(255,250,235,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 3, 40, 7, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    // the giant ring arching out of the horizon
    { const cx = W * 0.6 - V.x * 0.02, cy = GY + 30, rx = 520, ry = 430;
      ctx.save(); ctx.lineWidth = 14; ctx.strokeStyle = P.ring; ctx.globalAlpha = night ? 0.95 : 0.8;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, -0.12, Math.PI * 1.04, Math.PI * 1.7); ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = P.ringLine; ctx.beginPath(); ctx.ellipse(cx, cy, rx - 7, ry - 7, -0.12, Math.PI * 1.04, Math.PI * 1.7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx, cy, rx + 7, ry + 7, -0.12, Math.PI * 1.04, Math.PI * 1.7); ctx.stroke();
      if (night) { ctx.fillStyle = '#ffd38a'; for (let k = 0; k < 6; k++) { const a = Math.PI * (1.08 + k * 0.1), ex = cx + Math.cos(a) * rx * Math.cos(-0.12) - Math.sin(a) * ry * Math.sin(-0.12), ey = cy + Math.cos(a) * rx * Math.sin(-0.12) + Math.sin(a) * ry * Math.cos(-0.12); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + k); ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3); } }
      ctx.restore(); }
    // floating islands, far away
    SCENERY.isles.forEach(([ix, iy, is, seed]) => { const x = ((ix - V.x * 0.06) % 7200 + 7200) % 7200 - 300; if (x < -120 || x > W + 120) return; ctx.save(); ctx.globalAlpha = night ? 0.7 : 0.55; island(ctx, x, GY * iy + Math.sin(t * 0.4 + seed) * 5, is * 0.8, night, t, seed); ctx.restore(); });
  }

  /* ---------- the whole world, one frame */
  function worldFrame(ctx, t, G) {
    if (!SCENERY) buildScenery();
    _planks = G.planks || 0;
    const inW = (G.wreckOpen || 0) > 0.3, inWreck = wx => inW && wx > WRECK_X - 300 && wx < WRECK_X + 282;
    const V = G.view || (G.view = { x: 0, z: 1 }), night = !!G.night, P = palAt(V.x, night);
    const closed = zoneMix(V.x, 'closed'), z = V.z || 1;
    const SX = wx => (wx - V.x) * z + W / 2, SY = y => (y - GY) * z + GY;
    drawSkyBase(ctx, t, G, P, V, night);
    // the town-tree on the horizon (it grows as you come closer)
    { const kx = W / 2 + (GATE_X - V.x) * 0.22, near = smooth(5200, 7600, V.x);
      if (kx > -300 && kx < W + 300 && near > 0) {
        ctx.save(); ctx.globalAlpha = 0.45 + 0.45 * near; ctx.fillStyle = cmix(P.far2, P.trunkD, 0.3 * near); const s = 0.5 + 0.5 * near, base = GY - 20;
        ctx.beginPath(); ctx.moveTo(kx - 70 * s, base); ctx.quadraticCurveTo(kx - 40 * s, base - 140 * s, kx - 34 * s, base - 300 * s); ctx.lineTo(kx + 34 * s, base - 300 * s); ctx.quadraticCurveTo(kx + 40 * s, base - 140 * s, kx + 70 * s, base); ctx.closePath(); ctx.fill();
        ctx.fillStyle = cmix(P.far2, P.leafD, 0.4 * near); for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.arc(kx + (k - 4) * 26 * s, base - (300 + (k % 3) * 26) * s, (40 + (k % 2) * 16) * s, 0, TAU); ctx.fill(); }
        ctx.fillStyle = '#ffd38a'; for (let k = 0; k < 12; k++) { ctx.globalAlpha = (0.4 + 0.6 * smooth(6600, 7800, V.x)) * (0.6 + 0.4 * Math.sin(t * 1.5 + k)); ctx.fillRect(kx + ((k * 37) % 90 - 45) * s, base - (90 + (k * 53) % 200) * s, 2.4, 3); }
        ctx.restore();
      } }
    // tree-towers and hills far away
    SCENERY.towers.forEach(([tx, th, tw, ph]) => {
      const x = W / 2 + (tx - V.x) * 0.15; if (x < -60 || x > W + 60) return;
      ctx.fillStyle = P.far2; ctx.beginPath(); ctx.moveTo(x - tw * 1.6, GY - 10); ctx.quadraticCurveTo(x - tw * 0.6, GY - th * 0.5, x - tw * 0.5, GY - th); ctx.lineTo(x + tw * 0.5, GY - th); ctx.quadraticCurveTo(x + tw * 0.6, GY - th * 0.5, x + tw * 1.6, GY - 10); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(x, GY - th - 6, tw * 3.2, 0, TAU); ctx.fill();
      ctx.strokeStyle = P.far; ctx.lineWidth = 1.4; for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.ellipse(x, GY - th * (0.35 + k * 0.25), tw * 2.4, tw * 0.5, 0, 0, TAU); ctx.stroke(); }
      if (P.towerLit > 0.05) { for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? '#ffc66b' : '#8affc8'; ctx.globalAlpha = P.towerLit * (0.5 + 0.5 * Math.sin(t * 1.3 + ph * 9 + k)); ctx.fillRect(x - tw * 2 + k * tw * 1.3, GY - th * (0.35 + (k % 2) * 0.25), 2, 2); } ctx.globalAlpha = 1; }
    });
    ctx.fillStyle = P.far; ctx.beginPath(); ctx.moveTo(-10, GY + 20);
    for (let x = -10; x <= W + 30; x += 20) { const wx = x + V.x * 0.25; const i = Math.floor(wx / 60), f = wx / 60 - i, a = SCENERY.hills[((i % 90) + 90) % 90][1], b = SCENERY.hills[(((i + 1) % 90) + 90) % 90][1]; ctx.lineTo(x, GY - 6 - (a + (b - a) * (f * f * (3 - 2 * f))) * 0.8); }
    ctx.lineTo(W + 30, GY + 20); ctx.closePath(); ctx.fill();
    // distant tree line
    ctx.fillStyle = cmix(P.far, P.leafD, night ? 0.3 : 0.35); ctx.beginPath(); ctx.moveTo(-10, GY + 20);
    for (let x = -10; x <= W + 30; x += 8) { const wx = x + V.x * 0.38, i = Math.floor(wx / 34), h = SCENERY.line[((i % 260) + 260) % 260][1], f = wx / 34 - i; ctx.lineTo(x, GY + 4 - h * (1 + closed * 0.8) * Math.sin(f * Math.PI)); }
    ctx.lineTo(W + 30, GY + 20); ctx.closePath(); ctx.fill();
    // haze
    ctx.fillStyle = lg(ctx, 0, GY - 200, 0, GY + 10, [[0, 'rgba(0,0,0,0)'], [1, P.mist]]); ctx.fillRect(0, GY - 200, W, 210);

    // ---- middle distance (parallax .62): scaled trees, hazed
    const mz = 0.62;
    SCENERY.mid.forEach(m => { const x = W / 2 + (m.x - V.x) * mz * z; if (x < -160 || x > W + 160) return; const T = treeDef(m.k, m.seed); paintTree(ctx, T, x, SY(GY + m.dy), m.s * z, m.flip, P, t, true, night, 0); });
    { const tx = W / 2 + (GATE_X + 160 - V.x) * mz * z; if (tx > -320 && tx < W + 320) drawTownTree(ctx, tx, SY(GY - 30), 0.62 * z, P, t, G); }
    ctx.fillStyle = lg(ctx, 0, GY - 260, 0, GY + 20, [[0, 'rgba(0,0,0,0)'], [1, P.mist]]); ctx.globalAlpha = 0.6; ctx.fillRect(0, GY - 260, W, 280); ctx.globalAlpha = 1;

    // ---- the ground strip
    const xL = V.x - (W / 2) / z - 40, xR = V.x + (W / 2) / z + 40;
    const gy = wx => SY(groundAt(wx));
    // the lake reaches toward you, all the way to the bottom of the picture
    const lakeOn = xL < LAKE_X + 60;
    const shoreA = [SX(LAKE_X - 190), gy(LAKE_X - 190)], shoreB = [SX(LAKE_X + 30), SY(H + 10)];
    const shoreX = y => shoreA[0] + (shoreB[0] - shoreA[0]) * (y - shoreA[1]) / (shoreB[1] - shoreA[1]);
    const landClip = () => { ctx.beginPath(); ctx.moveTo(shoreA[0], -600); ctx.lineTo(W + 600, -600); ctx.lineTo(W + 600, H + 600); ctx.lineTo(shoreX(H + 600), H + 600); ctx.lineTo(shoreA[0], shoreA[1]); ctx.closePath(); ctx.clip(); };
    if (lakeOn) {
      const sxL = SX(-700), sxR = SX(LAKE_X + 40), wy = SY(GY + 8);
      ctx.fillStyle = lg(ctx, 0, wy, 0, H + 40, [[0, cmix(P.water, P.waterL.replace(/[\d.]+\)$/, '1)'), night ? 0.12 : 0.25)], [0.35, P.water], [1, cmix(P.water, P.groundD, 0.6)]]); ctx.fillRect(sxL, wy, sxR - sxL, H + 600);
      ctx.save(); ctx.globalCompositeOperation = night ? 'lighter' : 'source-over'; ctx.fillStyle = P.waterL;
      // the moon (or sun) laid on the water as a path of light
      const mx = W * 0.72 - V.x * 0.004;
      for (let k = 0; k < 26; k++) { const yy = wy + 6 + k * k * 0.42, w = 8 + k * 1.6 + Math.sin(t * 2 + k) * 4; if (mx + w < sxL || mx - w > sxR) continue; ctx.globalAlpha = (0.55 - k * 0.018) * (0.6 + 0.4 * Math.sin(t * 3 + k * 1.7)); ctx.fillRect(mx - w / 2 + Math.sin(t * 1.3 + k) * 3, yy, w, 1.6); }
      // ripples
      for (let k = 0; k < 30; k++) { const wx = -660 + (k * 37) % 1060 + Math.sin(t * 0.8 + k) * 8, x = SX(wx), yy = wy + 10 + (k * 53) % 230; if (x < sxL || x > shoreX(yy) - 12) continue; ctx.globalAlpha = 0.18 + 0.14 * Math.sin(t * 2 + k); ctx.fillRect(x, yy, 14 + (k % 4) * 8, 1.2); }
      ctx.restore();
      // lily pads with glowing flowers
      [[-120, 40], [40, 90], [180, 26], [260, 150], [-40, 180]].forEach(([lx, ly], i) => { const x = SX(lx), y = wy + ly * z; if (x > shoreX(y) - 20) return; ctx.fillStyle = cmix(P.leafM, P.water, 0.3); ctx.beginPath(); ctx.ellipse(x, y, 16 * z, 4 * z, 0, 0.3, TAU - 0.1); ctx.lineTo(x, y); ctx.fill(); if (night || i % 2) { ctx.save(); ctx.fillStyle = night ? '#d8ffe8' : '#f4d0e0'; if (night) { ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 12; } ctx.beginPath(); ctx.arc(x + 4, y - 3, 2.6 * z, 0, TAU); ctx.fill(); ctx.restore(); } });
    }
    if (lakeOn) { ctx.save(); landClip(); }
    ctx.beginPath(); ctx.moveTo(SX(xL), H + 400);
    for (let wx = xL; wx <= xR; wx += 10) { if (wx > RAV0 && wx < RAV1) { ctx.lineTo(SX(RAV0), gy(RAV0)); ctx.lineTo(SX(RAV0), H + 400); ctx.lineTo(SX(RAV1), H + 400); wx = RAV1; } ctx.lineTo(SX(wx), gy(wx)); }
    ctx.lineTo(SX(xR), H + 400); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, GY - 20, 0, GY + 240, [[0, P.ground], [1, P.groundD]]); ctx.fill();
    if (lakeOn) { ctx.restore(); ctx.save(); landClip(); }
    // the trodden earth just under the surface, with pebbles
    { ctx.beginPath(); let first = true; const pts = [];
      for (let wx = Math.max(xL, LAKE_X - 60); wx <= xR; wx += 12) { if (wx > RAV0 && wx < RAV1) continue; pts.push([SX(wx), gy(wx)]); }
      if (pts.length > 1) { ctx.moveTo(pts[0][0], pts[0][1]); pts.forEach(p => ctx.lineTo(p[0], p[1])); for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + 15 * z); ctx.closePath(); ctx.fillStyle = cmix(P.ground, P.trunkL, night ? 0.12 : 0.3); ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; }
      ctx.fillStyle = cmix(P.groundD, P.trunkL, 0.25);
      SCENERY.pebbles.forEach(([px, py, r]) => { if (px < xL || px > xR || (px > RAV0 - 6 && px < RAV1 + 6) || px < LAKE_X - 40 || inWreck(px)) return; ctx.beginPath(); ctx.ellipse(SX(px), gy(px) + py * z, r * z, r * 0.55 * z, 0, 0, TAU); ctx.fill(); }); }
    // a lower bank, a little closer to the eye
    ctx.fillStyle = cmix(P.groundD, P.ground, 0.35); ctx.beginPath(); ctx.moveTo(-20, H + 400);
    for (let x = -20; x <= W + 20; x += 14) { const wx = V.x + (x - W / 2) * 1.12; ctx.lineTo(x, SY(GY + 104 + 14 * Math.sin(wx * 0.006) + 8 * Math.sin(wx * 0.017))); }
    ctx.lineTo(W + 20, H + 400); ctx.closePath(); ctx.fill();
    if (lakeOn) { ctx.restore(); ctx.save(); ctx.strokeStyle = cmix(P.groundD, P.water, 0.3); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(shoreA[0], shoreA[1]); ctx.lineTo(shoreX(H + 400), H + 400); ctx.stroke(); ctx.restore(); }
    // grass along the edge
    ctx.strokeStyle = P.grass; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    for (let wx = Math.floor(xL / 14) * 14; wx < xR; wx += 14) { if ((wx > RAV0 - 4 && wx < RAV1 + 4) || wx < LAKE_X - 120 || inWreck(wx)) continue; const x = SX(wx), y = gy(wx), h = (5 + ((wx * 7919) % 7)) * z, sw = Math.sin(t * 1.4 + wx * 0.03) * 2; ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.quadraticCurveTo(x + sw * 0.4, y - h * 0.6, x + sw + 2, y - h); ctx.moveTo(x + 4, y + 2); ctx.quadraticCurveTo(x + 4 + sw * 0.3, y - h * 0.4, x + 3 + sw, y - h * 0.7); ctx.stroke(); }
    if (xR > RAV0 - 200 && xL < RAV1 + 200) drawRavine(ctx, SX(RAV0), SX(RAV1), gy(RAV0), P, t, G, night, z);

    // ---- near scenery on the far side of the path
    const sway = Math.sin(t * 0.9) * 0.025;
    SCENERY.near.forEach(n => { const x = SX(n.x); if (x < -200 || x > W + 200) return; const T = treeDef(n.k, n.seed); paintTree(ctx, T, x, gy(n.x) + n.dy * z, n.s * HS * 1.9 * z, n.flip, P, t, false, night, sway); });
    // glowing mushrooms in the thicket
    SCENERY.props.forEach(p => { if (p.type !== 'mushL') return; const x = SX(p.x); if (x < -60 || x > W + 60) return; paintTree(ctx, treeDef('mush', 5 + (p.x | 0) % 7), x, gy(p.x) + 2, p.s * z, p.x % 2 > 1, P, t, false, night, 0); });
    if (Math.abs(V.x - WRECK_X) < 560) { drawWreckShell(ctx, SX(WRECK_X), gy(WRECK_X), z, P, t, night, G.wreckOpen || 0); drawWreckBack(ctx, SX(WRECK_X), gy(WRECK_X), z, P, t, night, G.wreckOpen || 0, G); }
    if (Math.abs(V.x - PYLON_X) < 460) { ctx.save(); ctx.translate(SX(PYLON_X), gy(PYLON_X)); ctx.scale(z, z); drawPylon(ctx, 0, 0, P, t, G); ctx.restore(); }
    if (Math.abs(V.x - 3980) < 400) { ctx.save(); ctx.translate(SX(3980), gy(3980)); ctx.scale(z, z); drawSign(ctx, 0, 0, P, 'KRONBY →'); ctx.restore(); }
    if (Math.abs(V.x - STONES_X) < 520) { ctx.save(); ctx.translate(SX(STONES_X), gy(STONES_X)); ctx.scale(z, z); drawStones(ctx, 0, 0, P, t, G, night); ctx.restore(); }
    if (Math.abs(V.x - GATE_X) < 760) { ctx.save(); ctx.translate(SX(GATE_X), gy(GATE_X) - 18 * z); ctx.scale(z, z); drawKronby(ctx, 0, 0, P, t, G, z, night); ctx.restore(); }

    // ---- characters, word-lights, the drone
    (G.lights || []).forEach(L => {
      if (L.got && t - L.got > 1.2) return;
      const x = SX(L.x), y = SY(groundAt(L.x) - L.h) + Math.sin(t * 2 + L.x) * 5; if (x < -40 || x > W + 40) return;
      const a = L.got ? Math.max(0, 1 - (t - L.got) / 1.2) : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rg(ctx, x, y, 2, 26, [[0, 'rgba(220,255,240,.9)'], [0.4, 'rgba(120,255,200,.35)'], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = night ? '#eafff4' : '#f8fff4'; ctx.font = `600 ${13 * z}px "Space Grotesk", sans-serif`; ctx.textAlign = 'center'; ctx.shadowColor = '#2fd9a8'; ctx.shadowBlur = 8;
      ctx.fillText(L.word, x, y - 16 - (L.got ? (t - L.got) * 30 : 0)); ctx.restore();
    });
    const cast = (G.cast || []).filter(a => !a.hidden).sort((a, b) => (a.z || 0) - (b.z || 0));
    cast.forEach(a => {
      if (a.wx == null) return;
      const base = a.k === 'skib' ? 0.42 : a.k === 'deer' ? 1.25 : HS;
      let gyv = groundAt(a.wx); if (gyv > GY + 200) gyv = GY;   // nobody falls into the ravine by accident
      a.x = SX(a.wx); a.y = SY(gyv + (a.wy || 0)); a.s = (a.sc || 1) * base * z;
      if (a.x < -120 || a.x > W + 120) return;
      // glowing pool at night under the hero
      if (night && a.k === 'hero' && (G.glow == null ? 1 : G.glow) > 0.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, a.x, a.y, 4, 90 * z, [[0, `rgba(150,255,170,${0.28 * (G.glow == null ? 1 : G.glow)})`], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.ellipse(a.x, a.y, 90 * z, 26 * z, 0, 0, TAU); ctx.fill(); ctx.restore(); }
      if (a.duck) { ctx.save(); ctx.beginPath(); ctx.rect(-500, -2000, W + 1000, SY(gyv) + 2 + 2000); ctx.clip(); drawActor(ctx, a, t); ctx.restore(); }
      else drawActor(ctx, a, t);
    });
    // tall grass on the shore, in front of whoever stands in it
    if (xR > 440 && xL < 760) { const gc = night ? '#0f2418' : P.leafD, gc2 = night ? '#163423' : P.leafM;
      for (let k = 0; k < 26; k++) { const wx = 452 + k * 11 + (k * 7) % 5, x = SX(wx), y = gy(wx) + 3 * z, h = (30 + (k * 13) % 22) * z, sw = Math.sin(t * 1.3 + k * 0.7) * 3 * z;
        ctx.strokeStyle = k % 2 ? gc : gc2; ctx.lineWidth = 2.2 * z; ctx.lineCap = 'round';
        for (let j = -1; j <= 1; j++) { ctx.beginPath(); ctx.moveTo(x + j * 3 * z, y); ctx.quadraticCurveTo(x + j * 4 * z + sw * 0.5, y - h * 0.6, x + j * 6 * z + sw, y - h * (1 - Math.abs(j) * 0.18)); ctx.stroke(); } } }
    // water in front of anyone wading in the lake
    if (xL < LAKE_X + 40) { const wy = SY(GY + 8); ctx.save(); ctx.globalAlpha = 0.86; ctx.fillStyle = lg(ctx, 0, wy, 0, wy + 60, [[0, P.water], [1, P.groundD]]);
      ctx.beginPath(); ctx.moveTo(SX(-700), wy); for (let wx = -700; wx <= LAKE_X; wx += 10) ctx.lineTo(SX(wx), wy); for (let wx = LAKE_X; wx >= -700; wx -= 10) ctx.lineTo(SX(wx), Math.max(wy, gy(wx) + 2)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 0.6; ctx.strokeStyle = P.waterL; ctx.lineWidth = 1.2; ctx.beginPath(); for (let x = SX(-600); x < SX(LAKE_X - 40); x += 6) ctx.lineTo(x, wy + Math.sin(x * 0.08 + t * 2) * 1.6); ctx.stroke(); ctx.restore(); }
    if (Math.abs(V.x - WRECK_X) < 560) drawWreckFront(ctx, SX(WRECK_X), gy(WRECK_X), z, P, t, night, G.wreckOpen || 0);
    // a few trees stand between you and the path
    SCENERY.front.forEach(n => { const x = SX(n.x); if (x < -200 || x > W + 200) return; paintTree(ctx, treeDef(n.k, n.seed), x, gy(n.x) + 14 * z, n.s * HS * 1.9 * z, n.flip, night ? P : Object.assign({}, P, { leafL: P.leafM, trunkL: P.trunk }), t, false, night, sway * 0.6); });
    if (G.drone) { const D = G.drone; drone(ctx, t, night, 0, Object.assign({}, D, { x: SX(D.wx), y: SY(D.y) })); }

    // ---- foreground: ferns and grass close to the eye
    SCENERY.fern.forEach(f => {
      if (inW && Math.abs(f.x - WRECK_X) < 420) return;
      const x = W / 2 + (f.x - V.x) * 1.25 * z; if (x < -40 || x > W + 40) return; if (f.x > RAV0 - 30 && f.x < RAV1 + 30) return; if (f.x < LAKE_X - 160) return;
      const y = SY(groundAt(f.x)) + f.dy * z, sw = Math.sin(t * 1.2 + f.x * 0.02) * 0.08;
      if (f.kind === 'fern') fern(ctx, x, y, f.h * 1.5 * z, f.a, sw, night ? '#0c1a12' : P.leafD, 1.6 * z, 7 * z, f.dir);
      else grassTuft(ctx, x, y, f.h * 1.3 * z, sw * 30, night ? '#0e1f15' : P.grass, 6, null);
    });
    // plants right in front of your eyes, at the bottom of the picture
    { const fc = cmix(P.groundD, '#000000', night ? 0.25 : 0.12), fc2 = cmix(P.groundD, P.leafD, 0.45);
      SCENERY.fore.forEach(f => { const x = W / 2 + (f.x - V.x) * 1.45 * z; if (x < -80 || x > W + 80) return; if (inW && Math.abs(f.x - WRECK_X) < 460) return; const y = SY(GY + 236) + f.dy, sw = Math.sin(t * 0.9 + f.x * 0.01) * 0.05;
        if (lakeOn && x < shoreX(y) + 10) { if (f.k !== 'grass') return; ctx.strokeStyle = fc; ctx.lineWidth = 2 * z; ctx.lineCap = 'round'; for (let k = 0; k < 4; k++) { const rx = x + k * 6 - 9, rh = f.h * (0.9 + k * 0.25) * z; ctx.beginPath(); ctx.moveTo(rx, y + 20); ctx.quadraticCurveTo(rx + sw * 60, y - rh * 0.5, rx + sw * 120 + (k - 1.5) * 4, y - rh); ctx.stroke(); } return; }
        if (f.k === 'fern') fern(ctx, x, y, f.h * z, f.a, sw, f.dir > 0 ? fc : fc2, 2.4 * z, 13 * z, f.dir);
        else if (f.k === 'leaf') { ctx.save(); ctx.translate(x, y); ctx.rotate(f.a * 0.8 + sw); ctx.fillStyle = fc2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-f.h * 0.28 * z, -f.h * 0.5 * z, 0, -f.h * 0.9 * z); ctx.quadraticCurveTo(f.h * 0.28 * z, -f.h * 0.5 * z, 0, 0); ctx.fill(); ctx.strokeStyle = fc; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -f.h * 0.85 * z); ctx.stroke(); ctx.restore(); }
        else grassTuft(ctx, x, y, f.h * 0.7 * z, sw * 40, fc, 7, null);
        if (f.glow && night) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(150,255,210,.85)'; ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x + f.a * 30, y - f.h * 0.75 * z, 3, 0, TAU); ctx.fill(); ctx.restore(); }
      }); }
    // a canopy overhead in closed places
    if (closed > 0.05) {
      const C = SCENERY.canopy, yo = -(1 - closed) * 240, ox = ((-V.x * 1.06 * z) % C.TW + C.TW) % C.TW - C.TW;
      ctx.save();
      ctx.fillStyle = P.canopy; ctx.fillRect(-20, -340, W + 40, 360 + yo);
      for (let tx = ox; tx < W + 20; tx += C.TW) {
        ctx.save(); ctx.translate(tx, yo);
        ctx.fillStyle = P.canopy; ctx.fill(C.D);
        ctx.fillStyle = cmix(P.leafD, P.canopy, 0.35); ctx.fill(C.M);
        ctx.fillStyle = night ? cmix(P.leafM, P.canopy, 0.3) : cmix(P.leafM, P.leafL, 0.25); ctx.globalAlpha = 0.85; ctx.fill(C.L); ctx.globalAlpha = 1;
        ctx.strokeStyle = cmix(P.leafD, P.canopy, 0.5); ctx.lineWidth = 1.4;
        if (!inW) C.vines.forEach(([vx, vy, len, ph]) => { const sw = Math.sin(t * 0.8 + ph) * 4; ctx.beginPath(); ctx.moveTo(vx, vy); ctx.quadraticCurveTo(vx + sw, vy + len * 0.5, vx + sw * 1.5, vy + len); ctx.stroke();
          ctx.fillStyle = cmix(P.leafD, P.canopy, 0.2); for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.ellipse(vx + sw * k / 4 + (k % 2 ? 4 : -4), vy + len * k / 5, 4, 2, k % 2 ? 0.5 : -0.5, 0, TAU); ctx.fill(); }
          if (night) { ctx.save(); ctx.fillStyle = '#bfffe0'; ctx.shadowColor = '#7dffb0'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(vx + sw * 1.5, vy + len + 3, 2.2, 0, TAU); ctx.fill(); ctx.restore(); } });
        ctx.restore();
      }
      // shafts of light through the leaves by day
      if (!night) { ctx.globalCompositeOperation = 'screen'; for (let k = 0; k < 4; k++) { const bx = ((k * 140 - V.x * 0.9) % (W + 200) + W + 200) % (W + 200) - 100; ctx.fillStyle = lg(ctx, bx, 120, bx + 160, GY, [[0, 'rgba(255,250,210,.32)'], [1, 'rgba(255,250,210,0)']]); ctx.beginPath(); ctx.moveTo(bx, 110); ctx.lineTo(bx + 34, 110); ctx.lineTo(bx + 190, GY + 20); ctx.lineTo(bx + 120, GY + 20); ctx.closePath(); ctx.globalAlpha = closed * (0.5 + 0.2 * Math.sin(t * 0.5 + k)); ctx.fill(); } }
      ctx.restore();
    }
    // drifting motes: fireflies at night, pollen by day
    drawMotes(ctx, SCENERY.motes, t, night ? 'rgba(200,255,216,.9)' : 'rgba(255,250,220,.75)', night ? 3.2 : 1.8, [6, -10], night ? 'lighter' : 'source-over');
    // the hour's colour over everything
    if (P.grade) { ctx.save(); ctx.fillStyle = P.grade; ctx.fillRect(0, -300, W, H + 600); ctx.restore(); }
    if (closed > 0.05) { ctx.save(); ctx.fillStyle = rg(ctx, W / 2, GY - 120, 200, 620, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${0.35 * closed * (night ? 1 : 0.6)})`]]); ctx.fillRect(0, -300, W, H + 600); ctx.restore(); }
  }
  SCN.world = { ground: '#0b1712', ownsCast: true, build() { return {}; }, back(ctx, t, S, G) { worldFrame(ctx, t, G); } };

  /* ===================== KRONBY: the town at the foot of the town-tree
     A second walkable strip, drawn with the same camera and the same scale as the forest:
     the street is the ground line GY, people stand at HS, houses are two to three people tall. */
  const TOWN = { GATE: 150, HALL0: 520, HALL1: 1300, DESK: 640, CHEST: 760, BOARD: 1010, STOVE: 1190, CAFE: 1640, WELL: 1880, TRUNK: 2200, ROD0: 2520, ROD1: 4250, MOS1: 5800 };
  const TZONES = [
    { id: 'porten', x0: -500, x1: 450, closed: 0, zoom: 0.96, name: 'Porten' },
    { id: 'hallen', x0: 450, x1: 1360, closed: 0, zoom: 1, name: 'Ankomsthallen' },
    { id: 'torvet', x0: 1360, x1: 2520, closed: 0, zoom: 0.92, name: 'Torvet' },
    { id: 'rodbyen', x0: 2520, x1: 4250, closed: 0.75, zoom: 1, name: 'Rodbyen' },
    { id: 'mosen', x0: 4250, x1: 6200, closed: 0.25, zoom: 0.98, name: 'Mosen' }
  ];
  function townZoneAt(wx) { for (const z of TZONES) if (wx < z.x1) return z; return TZONES[TZONES.length - 1]; }
  function townZoneMix(wx, key) {
    for (let i = 0; i < TZONES.length; i++) {
      const z = TZONES[i], n = TZONES[i + 1];
      if (wx < z.x1 - 140 || !n) return z[key];
      if (wx < z.x1 + 140) return z[key] + (n[key] - z[key]) * smooth(z.x1 - 140, z.x1 + 140, wx);
    }
    return TZONES[TZONES.length - 1][key];
  }
  const townGround = wx => GY + 2.5 * Math.sin(wx * 0.006) + 1.5 * Math.sin(wx * 0.017 + 0.7);
  // one map or the other, for whoever needs the ground, the zones or the zoom
  function mapOf(G) { return G && G.scene === 'town' ? { groundAt: townGround, zoneAt: townZoneAt, zoneMix: townZoneMix } : { groundAt, zoneAt, zoneMix }; }

  /* ---------- the hour, chosen by the story (not by where you stand) */
  const _tp = {};
  function palTod(tod, night) {
    const key = night ? 'night' : (PAL[tod] ? tod : 'day');
    if (_tp[key]) return _tp[key];
    const P = Object.assign({}, PAL[key]), m = P.mist.replace(/[\d.]+\)$/, '1)');
    P.midD = cmix(P.leafD, m, night ? 0.15 : 0.32); P.midM = cmix(P.leafM, m, night ? 0.15 : 0.3); P.midT = cmix(P.trunkD, m, night ? 0.12 : 0.35);
    return (_tp[key] = P);
  }
  // building colours sink into the dark at night and warm up at dusk
  const tint = (c, P, night) => night ? cmix(c, '#08140f', 0.74) : P.grade ? cmix(c, P.sky1, 0.12) : c;

  /* ---------- the street's buildings, far side of the street. x = left edge, w, h = wall height */
  const HOUSES = [
    // inside the gate
    { x: -330, w: 150, h: 170, col: '#c9b38a', roof: '#4a3a2c', wins: 2 },
    { x: 260, w: 170, h: 190, col: '#9fb08a', roof: '#3e4a2e', wins: 2, sign: 'PORTVAGT' },
    // around the square
    { x: 1400, w: 150, h: 200, col: '#d8b47a', roof: '#5a3a24', wins: 2 },
    { x: 1560, w: 180, h: 180, col: '#e7d7b2', roof: '#2f5a44', wins: 1, cafe: 1, sign: 'CAFÉ' },
    { x: 2380, w: 150, h: 210, col: '#b98a6a', roof: '#4a2e20', wins: 2 },
    // Rodbyen: the root town
    { x: 2560, w: 170, h: 200, col: '#e2c48e', roof: '#5a3a24', wins: 2, sign: 'BAGER', no: 1 },
    { x: 2750, w: 150, h: 220, col: '#a9c4b0', roof: '#2f4a3a', wins: 2, sign: 'APOTEK', no: 3 },
    { x: 2930, w: 160, h: 190, col: '#d9a27a', roof: '#4a2e20', wins: 2, no: 5 },
    { x: 3120, w: 180, h: 210, col: '#c6b6d8', roof: '#3a2e4a', wins: 3, sign: 'BOGHANDEL', no: 7 },
    { x: 3330, w: 150, h: 190, col: '#e8dcc0', roof: '#5a4030', wins: 2, no: 9 },
    { x: 3510, w: 170, h: 220, col: '#b7c99a', roof: '#3e4a2e', wins: 2, sign: 'BIBLIOTEK', no: 11 },
    { x: 3710, w: 160, h: 200, col: '#e0b07a', roof: '#5a3a24', wins: 2, sign: 'SLAGTER', no: 13 },
    { x: 3900, w: 170, h: 190, col: '#cfd8c0', roof: '#2f5a44', wins: 2, no: 15 },
    // Mosen: the moss quarter
    { x: 4330, w: 160, h: 180, col: '#9cb89a', roof: '#2a4a32', wins: 2, moss: 1, no: 1 },
    { x: 4560, w: 170, h: 170, col: '#b8c8a0', roof: '#2f4a2a', wins: 2, moss: 1, sign: 'GRØNTHANDLER', no: 3 },
    { x: 4800, w: 150, h: 190, col: '#a8b8c0', roof: '#2f3e4a', wins: 2, moss: 1, no: 5 },
    { x: 5040, w: 170, h: 175, col: '#c0b090', roof: '#3a4a2a', wins: 2, moss: 1, no: 7 },
    { x: 5300, w: 160, h: 185, col: '#b0c4a8', roof: '#2a4a32', wins: 2, moss: 1, no: 9 }
  ];

  /* ---------- a half-timbered house (bindingsværk) with a turf roof. Drawn from its bottom-left corner */
  let BLK = 0;   // the blackout: 1 = every lamp and window in town is dark
  function drawHouse(ctx, B, P, t, night, dusk) {
    const w = B.w, h = B.h, R = rng(B.x | 0 + 7), beam = tint('#3a2a1e', P, night), wall = tint(B.col, P, night);
    // the wall, with a little shade toward the ground
    ctx.fillStyle = lg(ctx, 0, -h, 0, 0, [[0, wall], [1, cmix(wall, beam, 0.18)]]); ctx.fillRect(0, -h, w, h);
    // the timber frame
    ctx.fillStyle = beam;
    const bays = Math.max(2, Math.round(w / 44)), bw = w / bays;
    for (let k = 0; k <= bays; k++) ctx.fillRect(k * bw - 3, -h, 6, h);
    ctx.fillRect(-4, -h - 4, w + 8, 8); ctx.fillRect(-2, -h * 0.52, w + 4, 6); ctx.fillRect(-4, -6, w + 8, 6);
    ctx.lineWidth = 4; ctx.strokeStyle = beam; ctx.lineCap = 'butt';
    for (let k = 0; k < bays; k++) if (k % 2 === 0 && !(B.cafe && k === 1)) { ctx.beginPath(); ctx.moveTo(k * bw + 3, -h * 0.52); ctx.lineTo((k + 1) * bw - 3, -h + 4); ctx.stroke(); }
    // windows: warm light at night, the sky by day
    const lit = (night ? 1 : dusk) * (1 - BLK);
    const nw = B.wins || 2, wy = -h + 18;
    for (let k = 0; k < nw; k++) {
      const wx = (k + 0.5) * (w / nw) - 13;
      ctx.fillStyle = beam; ctx.fillRect(wx - 3, wy - 3, 32, 32);
      if (lit > 0.1 && (k + (B.x | 0)) % 3 !== 1) { ctx.save(); ctx.fillStyle = `rgba(255,${190 + 20 * Math.sin(t + k)},110,${0.55 + 0.45 * lit})`; ctx.shadowColor = '#ffc66b'; ctx.shadowBlur = 12 * lit; ctx.fillRect(wx, wy, 26, 26); ctx.restore(); }
      else { ctx.fillStyle = lg(ctx, 0, wy, 0, wy + 26, [[0, cmix(P.sky1, '#ffffff', 0.35)], [1, cmix(P.sky2, beam, 0.25)]]); ctx.fillRect(wx, wy, 26, 26); }
      ctx.fillStyle = beam; ctx.fillRect(wx + 12, wy, 2.4, 26); ctx.fillRect(wx, wy + 12, 26, 2.4);
    }
    // the door
    R(); const dx = B.cafe ? w * 0.7 : w * 0.5, dwid = 30, dh = 64;
    ctx.fillStyle = tint('#5a3a24', P, night); ctx.beginPath(); ctx.moveTo(dx - dwid / 2, 0); ctx.lineTo(dx - dwid / 2, -dh + 12); ctx.quadraticCurveTo(dx, -dh - 6, dx + dwid / 2, -dh + 12); ctx.lineTo(dx + dwid / 2, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = beam; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = tint('#c9a24a', P, night); ctx.beginPath(); ctx.arc(dx + dwid / 2 - 6, -dh / 2, 2, 0, TAU); ctx.fill();
    // the house number, on a little enamel plate by the door
    if (B.no) { ctx.fillStyle = tint('#24433a', P, night); ctx.fillRect(dx + dwid / 2 + 5, -dh + 6, 17, 14); ctx.strokeStyle = tint('#e8dcc0', P, night); ctx.lineWidth = 1; ctx.strokeRect(dx + dwid / 2 + 6, -dh + 7, 15, 12);
      ctx.fillStyle = night ? '#d9c8a0' : '#f3e6c4'; ctx.font = '700 9px "Space Grotesk", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(B.no), dx + dwid / 2 + 13.5, -dh + 16.5); }
    // the roof: steep, turf on top, moss hanging over the eave
    const rh = h * 0.5, ov = 14, roof = tint(B.roof, P, night);
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(-ov, -h + 2); ctx.lineTo(w / 2, -h - rh); ctx.lineTo(w + ov, -h + 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = tint(B.moss ? '#5f8f4a' : '#4f7a3e', P, night);
    ctx.beginPath(); ctx.moveTo(-ov, -h + 2); ctx.lineTo(w / 2, -h - rh); ctx.lineTo(w + ov, -h + 2); ctx.lineTo(w + ov - 6, -h + 8); ctx.lineTo(w / 2, -h - rh + 9); ctx.lineTo(-ov + 6, -h + 8); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 7 + (B.moss ? 6 : 0); k++) { const mx = -ov + R() * (w + ov * 2); ctx.beginPath(); ctx.ellipse(mx, -h + 4 + R() * 3, 6 + R() * 6, 3 + R() * 5, 0, 0, TAU); ctx.fill(); }
    // a chimney with a breath of smoke
    if ((B.x | 0) % 2 === 0) { const cx = w * 0.72; ctx.fillStyle = tint('#6a4a36', P, night); ctx.fillRect(cx, -h - rh * 0.62, 12, rh * 0.42);
      ctx.fillStyle = night ? 'rgba(200,230,215,.08)' : 'rgba(255,255,250,.35)'; for (let k = 0; k < 3; k++) { const u = (t * 0.25 + k / 3) % 1; ctx.beginPath(); ctx.arc(cx + 6 + u * 14 + Math.sin(t + k) * 3, -h - rh * 0.62 - u * 40, 4 + u * 8, 0, TAU); ctx.fill(); } }
    // glowing moss in the moss quarter
    if (B.moss) { ctx.save(); ctx.globalCompositeOperation = night ? 'lighter' : 'source-over'; ctx.fillStyle = night ? 'rgba(130,255,190,.5)' : 'rgba(150,200,120,.85)'; for (let k = 0; k < 10; k++) { ctx.beginPath(); ctx.arc(R() * w, -R() * 18, 2 + R() * 3, 0, TAU); ctx.fill(); } ctx.restore(); }
    // a shop sign on an iron arm
    if (B.sign) drawShopSign(ctx, B.cafe ? w * 0.18 : w - 6, -h * 0.52 - 4, B.sign, P, night, t);
  }
  function drawShopSign(ctx, x, y, text, P, night, t) {
    ctx.save(); ctx.translate(x, y);
    ctx.strokeStyle = tint('#2a2420', P, night); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(30, 0); ctx.moveTo(4, 0); ctx.quadraticCurveTo(4, 12, 16, 10); ctx.stroke();
    ctx.font = '700 9.5px "Space Grotesk", sans-serif'; const tw = ctx.measureText(text).width + 12;
    ctx.translate(30, 2); ctx.rotate(Math.sin(t * 1.3 + x) * 0.03);
    ctx.strokeStyle = tint('#2a2420', P, night); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-tw / 2 + 4, 0); ctx.lineTo(-tw / 2 + 4, 6); ctx.moveTo(tw / 2 - 4, 0); ctx.lineTo(tw / 2 - 4, 6); ctx.stroke();
    ctx.fillStyle = tint('#24433a', P, night); ctx.fillRect(-tw / 2, 6, tw, 17);
    ctx.strokeStyle = tint('#c9a24a', P, night); ctx.lineWidth = 1.2; ctx.strokeRect(-tw / 2 + 1.5, 7.5, tw - 3, 14);
    ctx.fillStyle = night ? '#d9c8a0' : '#f3e6c4'; ctx.textAlign = 'center'; ctx.fillText(text, 0, 18);
    ctx.restore();
  }
  // a street lamp: a post with a lantern; at dusk and night it pours light on the street
  function drawLamp(ctx, x, y, P, t, night, dusk, s) {
    s = s || 1; const lit = (night ? 1 : dusk) * (1 - BLK);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = tint('#2a2420', P, night); ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -128); ctx.quadraticCurveTo(0, -140, 12, -140); ctx.stroke();
    ctx.fillStyle = tint('#2a2420', P, night); ctx.fillRect(-5, -4, 10, 6);
    ctx.fillStyle = lit > 0.1 ? '#ffd38a' : tint('#e9e2c8', P, night); if (lit > 0.1) { ctx.shadowColor = '#ffc66b'; ctx.shadowBlur = 16 * lit; }
    ctx.beginPath(); ctx.moveTo(8, -138); ctx.lineTo(16, -138); ctx.lineTo(18, -122); ctx.lineTo(6, -122); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = tint('#2a2420', P, night); ctx.fillRect(5, -141, 14, 3); ctx.fillRect(4, -123, 16, 2.4);
    if (lit > 0.1) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, 12, -128, 4, 110, [[0, `rgba(255,196,120,${0.32 * lit})`], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(12, -128, 110, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,200,130,${0.12 * lit})`; ctx.beginPath(); ctx.ellipse(12, 2, 60, 9, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  /* ---------- the town-tree itself: a trunk wider than a street, rising out of the picture */
  function drawTrunkFar(ctx, x, y, s, P, t, night, dusk) {
    const R = rng(404);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const bark = cmix(P.trunkD, P.mist.replace(/[\d.]+\)$/, '1)'), night ? 0.15 : 0.32), barkL = cmix(P.trunk, P.mist.replace(/[\d.]+\)$/, '1)'), night ? 0.12 : 0.3);
    ctx.fillStyle = lg(ctx, -340, 0, 340, 0, [[0, bark], [0.45, barkL], [1, bark]]);
    ctx.beginPath(); ctx.moveTo(-620, 10); ctx.bezierCurveTo(-420, -10, -300, -90, -280, -260); ctx.lineTo(-250, -1200); ctx.lineTo(250, -1200); ctx.lineTo(280, -260); ctx.bezierCurveTo(300, -90, 420, -10, 620, 10); ctx.closePath(); ctx.fill();
    // grooves in the bark
    ctx.strokeStyle = cmix(bark, '#000000', 0.25); ctx.lineWidth = 3;
    for (let k = 0; k < 16; k++) { const gx = -240 + k * 32 + R() * 10; ctx.beginPath(); ctx.moveTo(gx, -1200); ctx.bezierCurveTo(gx + R() * 20 - 10, -700, gx + R() * 30 - 15, -400, gx * (1.2 + R() * 0.3), 0); ctx.stroke(); }
    // windows carved into the trunk, and the lights that wind up it
    const lit = (night ? 1 : 0.3 + 0.7 * dusk) * (1 - BLK);
    for (let k = 0; k < 14; k++) { const wx = -200 + R() * 400, wy = -160 - R() * 900; ctx.fillStyle = `rgba(255,200,110,${(0.25 + 0.6 * lit) * (0.7 + 0.3 * Math.sin(t + k))})`; ctx.beginPath(); ctx.ellipse(wx, wy, 6, 8, 0, 0, TAU); ctx.fill(); }
    for (let k = 0; k < 40; k++) { const u = k / 40, lx = Math.sin(u * 22 + t * 0.3) * 230, ly = -u * 1150; if (Math.cos(u * 22 + t * 0.3) < -0.2) continue; ctx.fillStyle = k % 2 ? '#ffc66b' : '#8affc8'; ctx.globalAlpha = (0.25 + 0.7 * lit) * (0.5 + 0.5 * Math.sin(t * 2 + k)); ctx.fillRect(lx - 2, ly - 2, 4, 4); }
    ctx.globalAlpha = 1; ctx.restore();
  }
  // hazy roofs between the street and the trunk
  function drawRoofline(ctx, V, z, P, night, t, dusk) {
    const R = rng(77), col = cmix(P.far2, P.trunkD, night ? 0.4 : 0.25);
    ctx.fillStyle = col;
    for (let k = 0; k < 70; k++) {
      const wx = -600 + k * 95 + R() * 40, x = W / 2 + (wx - V.x) * 0.5 * z; if (x < -80 || x > W + 80) continue;
      const w = (60 + R() * 50) * z, h = (70 + R() * 70) * z, y = GY - 20;
      ctx.fillRect(x - w / 2, y - h, w, h + 24); ctx.beginPath(); ctx.moveTo(x - w / 2 - 6, y - h); ctx.lineTo(x, y - h - w * 0.5); ctx.lineTo(x + w / 2 + 6, y - h); ctx.closePath(); ctx.fill();
      const lit = (night ? 1 : dusk) * (1 - BLK); if (lit > 0.15 && R() > 0.4) { ctx.save(); ctx.fillStyle = `rgba(255,200,110,${0.5 * lit})`; ctx.fillRect(x - 5 * z, y - h * 0.6, 7 * z, 8 * z); ctx.restore(); ctx.fillStyle = col; }
    }
  }
  // giant roots that arch over the streets of Rodbyen
  function drawRootArch(ctx, x, y, s, P, night, front) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const c = front ? cmix(P.trunkD, '#000000', night ? 0.4 : 0.15) : cmix(P.trunk, P.trunkD, 0.5);
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.moveTo(-260, 20); ctx.bezierCurveTo(-240, -200, -120, -420, 120, -560); ctx.lineTo(220, -560); ctx.bezierCurveTo(-40, -400, -140, -200, -170, 20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = cmix(c, '#000000', 0.3); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-220, 0); ctx.bezierCurveTo(-200, -200, -90, -400, 150, -540); ctx.stroke();
    ctx.restore();
  }

  /* ---------- Ankomsthallen: a long timber hall. Outside: a facade. Inside (open): the front wall is cut away */
  function drawHall(ctx, x0, x1, y, P, t, night, dusk, open, G) {
    const w = x1 - x0, h = 228, beam = tint('#3a2a1e', P, night), wall = tint('#d8c49a', P, night), plank = tint('#a6845e', P, night);
    ctx.save(); ctx.translate(x0, y);
    // the roof first (it overhangs both ways)
    const rh = 96, roof = tint('#4a3a2c', P, night);
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(-20, -h + 4); ctx.lineTo(40, -h - rh); ctx.lineTo(w - 40, -h - rh); ctx.lineTo(w + 20, -h + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = tint('#4f7a3e', P, night); ctx.fillRect(40, -h - rh - 6, w - 80, 10);
    const R = rng(55); for (let k = 0; k < 26; k++) { ctx.beginPath(); ctx.ellipse(40 + R() * (w - 80), -h - rh - 2, 8 + R() * 8, 4 + R() * 5, 0, 0, TAU); ctx.fill(); }
    // the inside: back wall of planks, windows, bunks, the stove, the board, Holm's desk with the big book
    if (open > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, open * 1.4);
      ctx.fillStyle = lg(ctx, 0, -h, 0, 0, [[0, cmix(plank, beam, 0.35)], [1, plank]]); ctx.fillRect(0, -h, w, h);
      ctx.strokeStyle = cmix(plank, beam, 0.4); ctx.lineWidth = 1; for (let yy = -h + 14; yy < 0; yy += 14) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke(); }
      ctx.fillStyle = beam; for (let k = 0; k <= 8; k++) ctx.fillRect(k * w / 8 - 4, -h, 8, h); ctx.fillRect(0, -h, w, 10);
      // high windows
      for (let k = 0; k < 7; k++) { const wx = (k + 0.5) * w / 7 - 18; if (k === 3) continue;
        ctx.fillStyle = night ? '#0d1d24' : lg(ctx, 0, -h + 24, 0, -h + 74, [[0, cmix(P.sky1, '#ffffff', 0.3)], [1, P.sky2]]); ctx.fillRect(wx, -h + 24, 36, 48);
        if (night) { ctx.fillStyle = 'rgba(220,255,240,.7)'; for (let s2 = 0; s2 < 3; s2++) ctx.fillRect(wx + 6 + s2 * 11, -h + 30 + (s2 * 13) % 30, 1.2, 1.2); }
        ctx.fillStyle = beam; ctx.fillRect(wx + 17, -h + 24, 2.4, 48); ctx.fillRect(wx, -h + 46, 36, 2.4); ctx.strokeStyle = beam; ctx.lineWidth = 3; ctx.strokeRect(wx, -h + 24, 36, 48);
        if (!night && open > 0.5) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = lg(ctx, wx, -h + 72, wx + 40, 0, [[0, 'rgba(255,245,210,.35)'], [1, 'rgba(255,245,210,0)']]); ctx.beginPath(); ctx.moveTo(wx, -h + 72); ctx.lineTo(wx + 36, -h + 72); ctx.lineTo(wx + 90, 0); ctx.lineTo(wx + 40, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
      }
      // bunks along the back wall
      [[150, 2], [300, 2], [460, 1]].forEach(([bx, n]) => { for (let k = 0; k < n; k++) { const by = -38 - k * 50;
        ctx.fillStyle = tint('#6a4a32', P, night); ctx.fillRect(bx, by, 96, 8); ctx.fillStyle = tint('#c8b9a0', P, night); ctx.fillRect(bx + 4, by - 9, 88, 9); ctx.fillStyle = tint('#7a9a86', P, night); ctx.fillRect(bx + 40, by - 10, 52, 10); ctx.fillStyle = tint('#e8dcc0', P, night); ctx.fillRect(bx + 6, by - 13, 22, 7); }
        ctx.fillStyle = tint('#5a3a24', P, night); ctx.fillRect(bx, -38 - n * 50, 5, 38 + n * 50); ctx.fillRect(bx + 91, -38 - n * 50, 5, 38 + n * 50); });
      // the noticeboard with pinned notes
      { const bx = TOWN.BOARD - x0 - 40; ctx.fillStyle = tint('#7a5236', P, night); ctx.fillRect(bx, -150, 80, 60); ctx.strokeStyle = beam; ctx.lineWidth = 3; ctx.strokeRect(bx, -150, 80, 60);
        const RN = rng(9); for (let k = 0; k < 9; k++) { ctx.fillStyle = tint(['#f3e6c4', '#e8f0d8', '#f6d8b8'][k % 3], P, night); const nx = bx + 5 + RN() * 60, ny = -146 + RN() * 40; ctx.save(); ctx.translate(nx, ny); ctx.rotate((RN() - 0.5) * 0.3); ctx.fillRect(0, 0, 14, 14); ctx.fillStyle = '#b4602e'; ctx.fillRect(6, 1, 2, 2); ctx.restore(); } }
      // the stove, with a fire
      { const sx = TOWN.STOVE - x0 - 22; ctx.fillStyle = tint('#3a3a36', P, night); ctx.fillRect(sx, -70, 44, 70); ctx.fillRect(sx + 16, -h, 12, h - 70); ctx.fillStyle = '#ff9a4a'; ctx.shadowColor = '#ffb070'; ctx.shadowBlur = 16; ctx.fillRect(sx + 9, -48, 26, 18 + 3 * Math.sin(t * 9)); ctx.shadowBlur = 0;
        if (night || dusk > 0.3) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, sx + 22, -40, 4, 140, [[0, 'rgba(255,160,80,.22)'], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(sx + 22, -40, 140, 0, TAU); ctx.fill(); ctx.restore(); } }
      // hanging lamps
      [0.2, 0.5, 0.8].forEach(u => { const lx = w * u; ctx.strokeStyle = beam; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(lx, -h + 10); ctx.lineTo(lx, -h + 46); ctx.stroke(); ctx.fillStyle = '#ffd38a'; ctx.shadowColor = '#ffc66b'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(lx, -h + 52, 6, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, lx, -h + 52, 3, 120, [[0, `rgba(255,200,120,${night ? 0.22 : 0.1})`], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(lx, -h + 52, 120, 0, TAU); ctx.fill(); ctx.restore(); });
      ctx.restore();
    }
    // the outside: a facade with the big double door and the sign
    if (open < 1) {
      ctx.save(); ctx.globalAlpha = 1 - open;
      ctx.fillStyle = lg(ctx, 0, -h, 0, 0, [[0, wall], [1, cmix(wall, beam, 0.2)]]); ctx.fillRect(0, -h, w, h);
      ctx.fillStyle = beam; const bays = 14, bw = w / bays;
      for (let k = 0; k <= bays; k++) ctx.fillRect(k * bw - 3, -h, 6, h);
      ctx.fillRect(-4, -h - 4, w + 8, 8); ctx.fillRect(-2, -h * 0.5, w + 4, 6); ctx.fillRect(-4, -6, w + 8, 6);
      ctx.lineWidth = 4; ctx.strokeStyle = beam; for (let k = 0; k < bays; k++) if (k % 3 === 0) { ctx.beginPath(); ctx.moveTo(k * bw + 3, -h * 0.5); ctx.lineTo((k + 1) * bw - 3, -h + 4); ctx.stroke(); }
      const lit = (night ? 1 : dusk) * (1 - BLK);
      for (let k = 0; k < bays; k++) { if (k === 6 || k === 7) continue; const wx = k * bw + bw / 2 - 11, wy = -h + 22;
        if (lit > 0.1) { ctx.save(); ctx.fillStyle = `rgba(255,200,110,${0.5 + 0.5 * lit})`; ctx.shadowColor = '#ffc66b'; ctx.shadowBlur = 10 * lit; ctx.fillRect(wx, wy, 22, 28); ctx.restore(); } else { ctx.fillStyle = cmix(P.sky1, beam, 0.25); ctx.fillRect(wx, wy, 22, 28); }
        ctx.fillStyle = beam; ctx.fillRect(wx + 10, wy, 2, 28); }
      // the double door in the middle, under the sign
      const dx = w / 2;
      ctx.fillStyle = tint('#5a3a24', P, night); ctx.beginPath(); ctx.moveTo(dx - 34, 0); ctx.lineTo(dx - 34, -78); ctx.quadraticCurveTo(dx, -104, dx + 34, -78); ctx.lineTo(dx + 34, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = beam; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = beam; ctx.fillRect(dx - 1.5, -92, 3, 92);
      ctx.font = '700 15px "Space Grotesk", sans-serif'; ctx.textAlign = 'center'; const tw = ctx.measureText('ANKOMSTHALLEN').width + 24;
      ctx.fillStyle = tint('#24433a', P, night); ctx.fillRect(dx - tw / 2, -h * 0.5 - 34, tw, 26); ctx.strokeStyle = tint('#c9a24a', P, night); ctx.lineWidth = 2; ctx.strokeRect(dx - tw / 2 + 2, -h * 0.5 - 32, tw - 4, 22);
      ctx.fillStyle = night ? '#e8d8b0' : '#f6ecd0'; ctx.fillText('ANKOMSTHALLEN', dx, -h * 0.5 - 16);
      ctx.restore();
    }
    ctx.restore();
  }
  // in front of whoever is inside: the cut ends of the walls and the floor's edge
  function drawHallFront(ctx, x0, x1, y, P, night, open) {
    if (open <= 0) return;
    const w = x1 - x0, h = 228, beam = tint('#3a2a1e', P, night);
    ctx.save(); ctx.translate(x0, y); ctx.globalAlpha = Math.min(1, open * 1.4);
    ctx.fillStyle = beam; ctx.fillRect(-10, -h - 6, 20, h + 10); ctx.fillRect(w - 10, -h - 6, 20, h + 10);
    ctx.fillStyle = tint('#6a4a32', P, night); ctx.fillRect(-10, -4, w + 20, 10);
    ctx.fillStyle = cmix(beam, '#000000', 0.2); ctx.fillRect(-14, -h - 10, w + 28, 12);
    ctx.restore();
  }
  // Holm's desk with Ankomstbogen, the big arrivals book; the chest of travel clothes
  function drawHallThings(ctx, sx, y, P, t, night, G, SXf) {
    // the desk
    { const x = SXf(TOWN.DESK); ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = tint('#6a4a32', P, night); ctx.fillRect(-46, -58, 92, 8); ctx.fillRect(-42, -50, 8, 50); ctx.fillRect(34, -50, 8, 50); ctx.fillStyle = tint('#5a3a24', P, night); ctx.fillRect(-40, -50, 80, 26);
      const op = G.bookOpen || 0; ctx.fillStyle = tint('#7a2e24', P, night); ctx.fillRect(-26, -66, 52, 8);
      ctx.fillStyle = tint('#f3e6c4', P, night); ctx.beginPath(); ctx.moveTo(-24, -66); ctx.lineTo(-2, -68 - 4 * op); ctx.lineTo(-2, -66); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(24, -66); ctx.lineTo(2, -68 - 4 * op); ctx.lineTo(2, -66); ctx.closePath(); ctx.fill();
      ctx.fillRect(-24, -70 - 2 * op, 22, 4); ctx.fillRect(2, -70 - 2 * op, 22, 4);
      ctx.fillStyle = tint('#2a2420', P, night); ctx.fillRect(30, -74, 2, 12);   // a quill
      ctx.restore(); }
    // the chest
    { const x = SXf(TOWN.CHEST); ctx.save(); ctx.translate(x, y);
      const lid = G.chestOpen || 0; ctx.fillStyle = tint('#7a5236', P, night); ctx.fillRect(-30, -34, 60, 34); ctx.fillStyle = tint('#c9a24a', P, night); ctx.fillRect(-30, -24, 60, 3); ctx.fillRect(-3, -30, 6, 8);
      ctx.save(); ctx.translate(-30, -34); ctx.rotate(-lid * 1.2); ctx.fillStyle = tint('#8a5e3e', P, night); ctx.fillRect(0, -8, 60, 8); ctx.restore();
      if (lid > 0.3) { ctx.fillStyle = tint('#3e5a34', P, night); ctx.fillRect(-24, -38, 48, 6); }
      ctx.restore(); }
  }

  /* ---------- the square: a well, market stalls, café tables */
  function drawWell(ctx, P, night) {
    const st = tint('#9a9284', P, night), stD = tint('#6e675c', P, night);
    ctx.fillStyle = st; ctx.beginPath(); ctx.ellipse(0, -2, 44, 10, 0, 0, TAU); ctx.fill(); ctx.fillRect(-44, -36, 88, 34); ctx.fillStyle = stD; for (let k = 0; k < 6; k++) ctx.fillRect(-44 + k * 15, -36 + (k % 2) * 17, 14, 1.6);
    ctx.fillStyle = tint('#5a8a9a', P, night); ctx.beginPath(); ctx.ellipse(0, -36, 40, 8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = tint('#4a3426', P, night); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-36, -36); ctx.lineTo(-36, -96); ctx.lineTo(36, -96); ctx.lineTo(36, -36); ctx.stroke();
    ctx.fillStyle = tint('#5a3a24', P, night); ctx.beginPath(); ctx.moveTo(-48, -96); ctx.lineTo(0, -124); ctx.lineTo(48, -96); ctx.closePath(); ctx.fill();
  }
  function drawStall(ctx, P, night, t, kind) {
    const awn = kind === 'fish' ? ['#e7e1d0', '#3a6a8a'] : ['#e7e1d0', '#b4602e'];
    ctx.fillStyle = tint('#6a4a32', P, night); ctx.fillRect(-50, -48, 100, 10); ctx.fillRect(-46, -38, 6, 38); ctx.fillRect(40, -38, 6, 38); ctx.fillRect(-48, -110, 4, 62); ctx.fillRect(44, -110, 4, 62);
    for (let k = 0; k < 6; k++) { ctx.fillStyle = tint(awn[k % 2], P, night); ctx.beginPath(); ctx.moveTo(-56 + k * 19, -112); ctx.lineTo(-37 + k * 19, -112); ctx.lineTo(-37 + k * 19, -96); ctx.quadraticCurveTo(-46.5 + k * 19, -88, -56 + k * 19, -96); ctx.closePath(); ctx.fill(); }
    const R = rng(kind === 'fish' ? 3 : 4);
    for (let k = 0; k < 14; k++) { const x = -44 + R() * 88, y = -54 - R() * 8; ctx.fillStyle = tint(kind === 'fish' ? ['#a8c0c8', '#c8d0d0', '#8aa0aa'][k % 3] : ['#c84a32', '#e0b04a', '#6a9a3e', '#e07a32'][k % 4], P, night);
      ctx.beginPath(); if (kind === 'fish') ctx.ellipse(x, y, 9, 3, 0.1, 0, TAU); else ctx.arc(x, y, 4.5, 0, TAU); ctx.fill(); }
  }
  function drawCafeTables(ctx, P, night) {
    [[-60, 0], [10, 0]].forEach(([tx]) => {
      ctx.fillStyle = tint('#4a3a2c', P, night); ctx.fillRect(tx - 2, -36, 4, 36); ctx.fillStyle = tint('#e7e1d0', P, night); ctx.beginPath(); ctx.ellipse(tx, -37, 20, 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = tint('#b4602e', P, night); ctx.beginPath(); ctx.ellipse(tx - 4, -42, 3.4, 4, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = tint('#4a3a2c', P, night); ctx.lineWidth = 2; [[-26, 1], [26, -1]].forEach(([cx, d]) => { ctx.beginPath(); ctx.moveTo(tx + cx, 0); ctx.lineTo(tx + cx, -22); ctx.lineTo(tx + cx - 10 * d, -22); ctx.moveTo(tx + cx, -22); ctx.lineTo(tx + cx, -44); ctx.stroke(); });
    });
  }
  // the lift at the foot of the trunk, up to Kronen
  function drawTrunkBase(ctx, P, t, night, dusk) {
    const bark = tint('#5a3e2a', P, night), barkD = tint('#3a2618', P, night);
    ctx.fillStyle = lg(ctx, -260, 0, 260, 0, [[0, barkD], [0.5, bark], [1, barkD]]);
    ctx.beginPath(); ctx.moveTo(-330, 4); ctx.bezierCurveTo(-240, -10, -190, -80, -180, -200); ctx.lineTo(-170, -700); ctx.lineTo(170, -700); ctx.lineTo(180, -200); ctx.bezierCurveTo(190, -80, 240, -10, 330, 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = barkD; ctx.lineWidth = 3; const R = rng(21); for (let k = 0; k < 12; k++) { const gx = -160 + k * 28 + R() * 8; ctx.beginPath(); ctx.moveTo(gx, -700); ctx.bezierCurveTo(gx + 6, -400, gx - 6, -150, gx * 1.5, 0); ctx.stroke(); }
    // the lift's arched door and its rope
    ctx.fillStyle = '#1e140c'; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-34, -96); ctx.quadraticCurveTo(0, -128, 34, -96); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = tint('#c9a24a', P, night); ctx.lineWidth = 2.4; ctx.stroke();
    const lit = (night ? 1 : 0.35 + 0.65 * dusk) * (1 - BLK); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,200,120,${0.25 * lit})`; ctx.fillRect(-30, -96, 60, 96); ctx.restore();
    ctx.strokeStyle = tint('#8a7a5a', P, night); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-10, -100); ctx.lineTo(-10, -700); ctx.moveTo(10, -100); ctx.lineTo(10, -700); ctx.stroke();
    ctx.font = '700 9.5px "Space Grotesk", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = tint('#24433a', P, night); ctx.fillRect(-40, -150, 80, 16); ctx.fillStyle = night ? '#d9c8a0' : '#f3e6c4'; ctx.fillText('ELEVATOREN', 0, -138.5);
  }

  /* ---------- the whole town, one frame */
  let TSCN = null;
  function buildTown() {
    const R = rng(3131);
    TSCN = {
      lamps: [60, 470, 1370, 1760, 2050, 2470, 2860, 3260, 3640, 4050, 4460, 4920, 5400],
      fore: Array.from({ length: 70 }, (_, i) => ({ x: -600 + i * 95 + R() * 60, k: R() < 0.35 ? 'barrel' : R() < 0.6 ? 'crate' : 'tuft', dy: R() * 30, s: 0.8 + R() * 0.5 })),
      motes: Array.from({ length: 40 }, () => ({ x: R() * W, y: 80 + R() * (GY - 40), r: 1 + R() * 1.6, sp: 0.4 + R() * 0.8, ph: R() * 6 }))
    };
  }
  // signposts with street names, and two things on the near pavement that houses can be 'opposite'
  const SIGNS = [{ x: 2500, t: ['◀ TORVET', 'RODGADE ▶'] }, { x: 2742, t: ['BAGERSTRÆDE ▲'] }, { x: 4252, t: ['◀ RODGADE', 'MOSEVEJ ▶'] }];
  const MARKS = [{ x: 3405, k: 'fountain' }, { x: 4875, k: 'stone' }];
  function drawSignpost(ctx, S, P, night) {
    const pc = tint('#2a2420', P, night);
    ctx.strokeStyle = pc; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -150); ctx.stroke();
    ctx.font = '700 9.5px "Space Grotesk", sans-serif'; ctx.textAlign = 'center';
    S.t.forEach((txt, i) => { const y = -146 + i * 22, tw = ctx.measureText(txt).width + 14;
      ctx.fillStyle = tint('#e8dcc0', P, night); ctx.fillRect(-tw / 2, y, tw, 16); ctx.strokeStyle = pc; ctx.lineWidth = 1.2; ctx.strokeRect(-tw / 2 + 1.5, y + 1.5, tw - 3, 13);
      ctx.fillStyle = tint('#24433a', P, night); ctx.fillText(txt, 0, y + 12); });
  }
  function drawMark(ctx, M, P, t, night) {
    if (M.k === 'fountain') {
      const st = tint('#9a9484', P, night), stD = tint('#6a6456', P, night);
      ctx.fillStyle = stD; ctx.beginPath(); ctx.ellipse(0, 0, 54, 12, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = st; ctx.fillRect(-52, -22, 104, 22); ctx.beginPath(); ctx.ellipse(0, -22, 52, 11, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = night ? '#1f4a52' : '#7fb8c4'; ctx.beginPath(); ctx.ellipse(0, -22, 44, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = stD; ctx.fillRect(-5, -58, 10, 36); ctx.beginPath(); ctx.ellipse(0, -58, 16, 4, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = night ? 'rgba(150,220,230,.45)' : 'rgba(230,250,255,.8)'; ctx.lineWidth = 1.6;
      for (let k = -1; k <= 1; k += 2) { ctx.beginPath(); ctx.moveTo(0, -60); ctx.quadraticCurveTo(k * 18, -78 - Math.sin(t * 3) * 2, k * 30, -26); ctx.stroke(); }
    } else {
      const st = tint('#7a8a72', P, night);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = st; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-34, -40, -10, -60); ctx.quadraticCurveTo(14, -66, 26, -40); ctx.quadraticCurveTo(34, -16, 30, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = tint('#5f8f4a', P, night); for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(-18 + k * 7, -50 + Math.abs(k - 3) * 6, 9, 6, 0, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.globalCompositeOperation = night ? 'lighter' : 'source-over'; ctx.strokeStyle = night ? 'rgba(130,255,190,.6)' : 'rgba(40,90,60,.55)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(-6, -36); ctx.lineTo(0, -20); ctx.lineTo(6, -36); ctx.moveTo(0, -20); ctx.lineTo(0, -8); ctx.stroke(); ctx.restore();
    }
  }
  function townFrame(ctx, t, G) {
    if (!TSCN) buildTown();
    BLK = G.blackout || 0;
    const V = G.view || (G.view = { x: 0, z: 1 }), night = !!G.night, P = palTod(G.tod || 'day', night), z = V.z || 1;
    const dusk = night ? 1 : (G.dusk || (G.tod === 'dusk' ? 0.8 : G.tod === 'golden' ? 0.3 : 0));
    const SX = wx => (wx - V.x) * z + W / 2, SY = y => (y - GY) * z + GY, gy = wx => SY(townGround(wx));
    const closed = townZoneMix(V.x, 'closed'), open = G.hallOpen || 0;
    drawSkyBase(ctx, t, G, P, V, night);
    // the trunk of the town-tree, far and enormous
    { const x = W / 2 + (TOWN.TRUNK - V.x) * 0.3 * z; if (x > -900 && x < W + 900) drawTrunkFar(ctx, x, SY(GY - 30), 0.9 * z, P, t, night, dusk); }
    drawRoofline(ctx, V, z, P, night, t, dusk);
    ctx.fillStyle = lg(ctx, 0, GY - 240, 0, GY + 10, [[0, 'rgba(0,0,0,0)'], [1, P.mist]]); ctx.globalAlpha = 0.7; ctx.fillRect(0, GY - 240, W, 250); ctx.globalAlpha = 1;
    // roots behind the houses in Rodbyen
    for (let rx = TOWN.ROD0 + 120; rx < TOWN.ROD1; rx += 520) { const x = W / 2 + (rx - V.x) * 0.8 * z; if (x > -400 && x < W + 400) drawRootArch(ctx, x, SY(GY - 10), 0.75 * z, P, night, false); }
    const xL = V.x - (W / 2) / z - 60, xR = V.x + (W / 2) / z + 60;
    // the street: packed earth and cobbles, then a kerb and the near bank
    ctx.beginPath(); ctx.moveTo(SX(xL), H + 400); for (let wx = xL; wx <= xR; wx += 12) ctx.lineTo(SX(wx), gy(wx) - 14 * z); ctx.lineTo(SX(xR), H + 400); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, GY - 20, 0, GY + 200, [[0, tint('#8a7e6a', P, night)], [1, tint('#5a5040', P, night)]]); ctx.fill();
    { const R = rng(12), c1 = tint('#9a8e78', P, night), c2 = tint('#7a6e5c', P, night);
      for (let k = 0; k < 420; k++) { const wx = Math.floor(xL / 600) * 600 + R() * 1400; if (wx < xL || wx > xR) continue; const x = SX(wx), y = gy(wx) - 10 * z + R() * 90 * z; ctx.fillStyle = k % 2 ? c1 : c2; ctx.beginPath(); ctx.ellipse(x, y, (7 + R() * 5) * z, (2.6 + R() * 1.6) * z, 0, 0, TAU); ctx.fill(); } }
    ctx.fillStyle = tint('#6a5e4c', P, night); ctx.beginPath(); ctx.moveTo(-20, H + 400); for (let x = -20; x <= W + 20; x += 16) ctx.lineTo(x, SY(GY + 110 + 4 * Math.sin((V.x + x) * 0.01))); ctx.lineTo(W + 20, H + 400); ctx.closePath(); ctx.fill();
    ctx.fillStyle = tint('#3e4a30', P, night); ctx.beginPath(); ctx.moveTo(-20, H + 400); for (let x = -20; x <= W + 20; x += 16) { const wx = V.x + (x - W / 2) * 1.12; ctx.lineTo(x, SY(GY + 124 + 6 * Math.sin(wx * 0.008))); } ctx.lineTo(W + 20, H + 400); ctx.closePath(); ctx.fill();

    // ---- far side of the street: the palisade inside the gate, houses, the hall, the square
    ctx.save();
    // the inside of the palisade, with the gate
    if (xL < 520) { const gx = SX(TOWN.GATE), y0 = gy(TOWN.GATE) - 18 * z; ctx.save(); ctx.translate(gx, y0); ctx.scale(z, z);
      const R = rng(9), log = tint('#6a4a32', P, night), logD = tint('#4a3222', P, night);
      for (let k = -24; k <= 12; k++) { if (k >= -2 && k <= 2) continue; const lx = k * 24, h = 132 + R() * 20; ctx.fillStyle = k % 2 ? log : logD; ctx.beginPath(); ctx.moveTo(lx - 12, 4); ctx.lineTo(lx - 12, -h); ctx.lineTo(lx, -h - 12); ctx.lineTo(lx + 12, -h); ctx.lineTo(lx + 12, 4); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = tint('#3a2618', P, night); ctx.fillRect(-600, -64, 540, 8); ctx.fillRect(60, -64, 240, 8);
      ctx.fillStyle = tint('#5a3a24', P, night); const go = G.gateOpen || 0; ctx.fillRect(-58, -124, 58 * (1 - go * 0.85), 128); ctx.fillRect(58 * go * 0.85, -124, 58 * (1 - go * 0.85), 128);
      ctx.strokeStyle = tint('#c9a24a', P, night); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, 4); ctx.lineTo(-60, -126); ctx.quadraticCurveTo(0, -190, 60, -126); ctx.lineTo(60, 4); ctx.stroke();
      if (go > 0) { ctx.fillStyle = night ? '#0b1a14' : cmix(P.sky2, P.ground, 0.4); ctx.fillRect(-58 + 58 * (1 - go * 0.85), -124, 116 * go * 0.85, 128); }
      ctx.restore(); }
    HOUSES.forEach(B => { const x = SX(B.x); if (x > W + 40 || x + (B.w + 40) * z < -40) return; ctx.save(); ctx.translate(x, gy(B.x + B.w / 2) - 12 * z); ctx.scale(z, z); drawHouse(ctx, B, P, t, night, dusk); ctx.restore(); });
    if (xR > TOWN.HALL0 - 40 && xL < TOWN.HALL1 + 40) { ctx.save(); ctx.translate(SX(TOWN.HALL0), gy(900) - 10 * z); ctx.scale(z, z); drawHall(ctx, 0, TOWN.HALL1 - TOWN.HALL0, 0, P, t, night, dusk, open, G); ctx.restore(); }
    if (open > 0.3) { ctx.save(); ctx.translate(0, 0); drawHallThings(ctx, 0, gy(TOWN.DESK) - 8 * z, P, t, night, G, wx => SX(wx)); ctx.restore(); }
    if (Math.abs(V.x - TOWN.TRUNK) < 700) { ctx.save(); ctx.translate(SX(TOWN.TRUNK), gy(TOWN.TRUNK) - 10 * z); ctx.scale(z, z); drawTrunkBase(ctx, P, t, night, dusk); ctx.restore(); }
    if (Math.abs(V.x - TOWN.WELL) < 500) { ctx.save(); ctx.translate(SX(TOWN.WELL), gy(TOWN.WELL) - 6 * z); ctx.scale(z, z); drawWell(ctx, P, night); ctx.restore(); }
    [[1470, 'veg'], [2420, 'fish']].forEach(([sx, k]) => { if (Math.abs(V.x - sx) > 520) return; ctx.save(); ctx.translate(SX(sx), gy(sx) + 4 * z); ctx.scale(z, z); drawStall(ctx, P, night, t, k); ctx.restore(); });
    if (Math.abs(V.x - TOWN.CAFE) < 500) { ctx.save(); ctx.translate(SX(TOWN.CAFE + 20), gy(TOWN.CAFE) + 6 * z); ctx.scale(z, z); drawCafeTables(ctx, P, night); ctx.restore(); }
    SIGNS.forEach(S => { const x = SX(S.x); if (x < -80 || x > W + 80) return; ctx.save(); ctx.translate(x, gy(S.x) - 4 * z); ctx.scale(z, z); drawSignpost(ctx, S, P, night); ctx.restore(); });
    TSCN.lamps.forEach(lx => { const x = SX(lx); if (x < -140 || x > W + 140) return; drawLamp(ctx, x, gy(lx) - 4 * z, P, t, night, dusk, z); });
    ctx.restore();

    // ---- people
    (G.lights || []).forEach(L => {
      if (L.got && t - L.got > 1.2) return;
      const x = SX(L.x), y = SY(townGround(L.x) - L.h) + Math.sin(t * 2 + L.x) * 5; if (x < -40 || x > W + 40) return;
      const a = L.got ? Math.max(0, 1 - (t - L.got) / 1.2) : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, x, y, 2, 26, [[0, 'rgba(220,255,240,.9)'], [0.4, 'rgba(120,255,200,.35)'], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#f8fff4'; ctx.font = `600 ${13 * z}px "Space Grotesk", sans-serif`; ctx.textAlign = 'center'; ctx.shadowColor = '#2fd9a8'; ctx.shadowBlur = 8; ctx.fillText(L.word, x, y - 16 - (L.got ? (t - L.got) * 30 : 0)); ctx.restore();
    });
    const cast = (G.cast || []).filter(a => !a.hidden).sort((a, b) => (a.z || 0) - (b.z || 0));
    cast.forEach(a => {
      if (a.wx == null) return;
      const base = a.k === 'skib' ? 0.42 : a.k === 'deer' ? 1.25 : HS;
      a.x = SX(a.wx); a.y = SY(townGround(a.wx) + (a.wy || 0)); a.s = (a.sc || 1) * base * z;
      if (a.x < -120 || a.x > W + 120) return;
      if (night && a.k === 'hero' && (G.glow == null ? 1 : G.glow) > 0.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rg(ctx, a.x, a.y, 4, 90 * z, [[0, `rgba(150,255,170,${0.28 * (G.glow == null ? 1 : G.glow)})`], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.ellipse(a.x, a.y, 90 * z, 22 * z, 0, 0, TAU); ctx.fill(); ctx.restore(); }
      drawActor(ctx, a, t);
    });
    if (xR > TOWN.HALL0 - 40 && xL < TOWN.HALL1 + 40) drawHallFront(ctx, SX(TOWN.HALL0), SX(TOWN.HALL1), gy(900) - 10 * z, P, night, open);
    if (G.drone) { const D = G.drone; drone(ctx, t, night, 0, Object.assign({}, D, { x: SX(D.wx), y: SY(D.y) })); }
    (G.drones || []).forEach(D => { const x = SX(D.wx); if (x < -300 || x > W + 300) return; drone(ctx, t, night, 0, Object.assign({}, D, { x, y: SY(D.y) })); });
    // a hint: a soft arrow over the door you are looking for
    if (G.pin) { const x = SX(G.pin.x), y = gy(G.pin.x) - (92 + Math.sin(t * 4) * 6) * z; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(140,255,215,.85)'; ctx.shadowColor = '#2fd9a8'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.moveTo(x - 9 * z, y - 12 * z); ctx.lineTo(x + 9 * z, y - 12 * z); ctx.lineTo(x, y); ctx.closePath(); ctx.fill(); ctx.restore(); }
    MARKS.forEach(M => { const x = SX(M.x); if (x < -80 || x > W + 80) return; ctx.save(); ctx.translate(x, SY(GY + 78)); ctx.scale(z, z); drawMark(ctx, M, P, t, night); ctx.restore(); });

    // ---- the near side: barrels, crates and moss, close to the eye
    TSCN.fore.forEach(f => { const x = W / 2 + (f.x - V.x) * 1.35 * z; if (x < -60 || x > W + 60) return; if (MARKS.some(M => Math.abs(f.x - M.x) < 120)) return; if (f.x > TOWN.HALL0 - 60 && f.x < TOWN.HALL1 + 60 && open > 0.3) return;
      const y = SY(GY + 150 + f.dy), s = f.s * z;
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      if (f.k === 'barrel') { const bc = tint('#7a5236', P, night), hoop = tint('#3a2a1e', P, night);
        ctx.fillStyle = bc; ctx.beginPath(); ctx.moveTo(-13, 0); ctx.quadraticCurveTo(-19, -22, -13, -44); ctx.lineTo(13, -44); ctx.quadraticCurveTo(19, -22, 13, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = cmix(bc, hoop, 0.4); ctx.lineWidth = 1; for (let j = -1; j <= 1; j++) { ctx.beginPath(); ctx.moveTo(j * 7, -1); ctx.quadraticCurveTo(j * 10, -22, j * 7, -43); ctx.stroke(); }
        ctx.fillStyle = hoop; ctx.fillRect(-16, -36, 32, 3); ctx.fillRect(-16, -9, 32, 3); ctx.fillStyle = cmix(bc, '#000000', 0.25); ctx.beginPath(); ctx.ellipse(0, -44, 13, 3.4, 0, 0, TAU); ctx.fill(); }
      else if (f.k === 'crate') { ctx.fillStyle = tint('#8a6a46', P, night); ctx.fillRect(-18, -30, 36, 30); ctx.strokeStyle = tint('#5a3a24', P, night); ctx.lineWidth = 2.4; ctx.strokeRect(-18, -30, 36, 30); ctx.beginPath(); ctx.moveTo(-18, -30); ctx.lineTo(18, 0); ctx.stroke(); }
      else grassTuft(ctx, 0, 0, 26, Math.sin(t + f.x) * 3, tint('#4f6a3a', P, night), 6, null);
      ctx.restore(); });
    // roots overhead in Rodbyen
    if (closed > 0.05) {
      ctx.save(); ctx.globalAlpha = Math.min(1, closed * 1.3);
      const rc = cmix(P.trunkD, '#000000', night ? 0.45 : 0.2), top = SY(GY - 330);
      ctx.fillStyle = rc; ctx.fillRect(-20, -400, W + 40, top + 400 - 30 * z);
      for (let rx = TOWN.ROD0 - 300; rx < TOWN.ROD1 + 400; rx += 210) { const x = W / 2 + (rx - V.x) * 1.08 * z; if (x < -260 || x > W + 260) continue;
        const k = ((rx / 210) | 0) % 3, dip = (40 + k * 26) * z, w = (150 + k * 40) * z;
        ctx.beginPath(); ctx.moveTo(x - w, top - 40 * z); ctx.bezierCurveTo(x - w * 0.5, top + dip, x + w * 0.5, top + dip, x + w, top - 40 * z); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = cmix(rc, P.trunk, 0.35); ctx.lineWidth = 2 * z; ctx.beginPath(); ctx.moveTo(x - w * 0.8, top - 30 * z); ctx.bezierCurveTo(x - w * 0.4, top + dip * 0.8, x + w * 0.4, top + dip * 0.8, x + w * 0.8, top - 30 * z); ctx.stroke();
        // little lights hanging from the roots
        ctx.save(); ctx.fillStyle = night ? '#ffd38a' : '#f3e6c4'; ctx.shadowColor = '#ffc66b'; ctx.shadowBlur = night ? 10 * (1 - BLK) : 0; ctx.globalAlpha *= 0.85 * (1 - 0.9 * BLK);
        for (let j = 0; j < 3; j++) { const lx = x - w * 0.4 + j * w * 0.4, ly = top + dip * 0.7 + (12 + (j * 17) % 22) * z; ctx.strokeStyle = rc; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, top + dip * 0.6); ctx.lineTo(lx, ly); ctx.stroke(); ctx.beginPath(); ctx.arc(lx, ly + 3 * z, 2.6 * z, 0, TAU); ctx.fill(); }
        ctx.restore(); }
      ctx.restore();
      ctx.save(); ctx.fillStyle = rg(ctx, W / 2, GY - 120, 200, 620, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${0.3 * closed * (night ? 1 : 0.6)})`]]); ctx.fillRect(0, -300, W, H + 600); ctx.restore();
    }
    // lantern-flies at night, dust in the light by day
    drawMotes(ctx, TSCN.motes, t, night ? 'rgba(255,220,160,.9)' : 'rgba(255,250,220,.6)', night ? 2.6 : 1.4, [4, -6], night ? 'lighter' : 'source-over');
    // rain: grey light and long thin drops
    if (G.rain > 0) {
      const r = G.rain, R = rng(77); ctx.save();
      ctx.fillStyle = `rgba(60,78,88,${0.22 * r})`; ctx.fillRect(0, -300, W, H + 600);
      ctx.strokeStyle = `rgba(210,228,236,${0.38 * r})`; ctx.lineWidth = 1.1;
      for (let k = 0; k < 170 * r; k++) { const sp = 560 + R() * 260, x = ((R() * (W + 80) + t * 70) % (W + 80)) - 40, y = ((R() * (H + 120) + t * sp) % (H + 120)) - 60; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 15); ctx.stroke(); }
      ctx.restore();
    }
    if (P.grade) { ctx.save(); ctx.fillStyle = P.grade; ctx.fillRect(0, -300, W, H + 600); ctx.restore(); }
  }
  SCN.town = { ground: '#0b1712', ownsCast: true, build() { return {}; }, back(ctx, t, S, G) { townFrame(ctx, t, G); } };

  /* ===================== ROOMS: side-view cutaways at the same scale as the world.
     The bedroom on Earth and the Kurator ship. Floor at GY; x in room units; the camera is G.view. */
  function drawPeople(ctx, t, G, SX, SY, z, night) {
    (G.cast || []).filter(a => !a.hidden && a.wx != null).sort((a, b) => (a.z || 0) - (b.z || 0)).forEach(a => {
      const base = a.k === 'skib' ? 0.42 : a.k === 'deer' ? 1.25 : HS;
      a.x = SX(a.wx); a.y = SY(GY + (a.wy || 0)); a.s = (a.sc || 1) * base * z;
      drawActor(ctx, a, t);
    });
  }
  function roomView(G, cx, cz) {
    const V = G.view || (G.view = { x: cx, z: cz });
    const z = V.z || 1, SX = wx => (wx - V.x) * z + W / 2, SY = y => (y - GY) * z + GY;
    return { V, z, SX, SY };
  }

  /* ---------- Earth: a flat in a block, at three in the morning */
  const BED = { x0: -150, x1: 150, top: -200 };
  let _city = null;
  SCN.bedroom = {
    ground: '#0b1218', ownsCast: true, build() { return {}; },
    back(ctx, t, S, G) {
      const { V, z, SX, SY } = roomView(G, 0, 0.86);
      if (!_city) { const R = rng(17); _city = { far: Array.from({ length: 30 }, (_, i) => [i * 34 - 500 + R() * 10, 120 + R() * 220, 22 + R() * 14]), near: Array.from({ length: 16 }, (_, i) => [i * 70 - 560 + R() * 20, 260 + R() * 260, 46 + R() * 20]), stars: Array.from({ length: 70 }, () => [R() * W, R() * 380, R()]) }; }
      // night sky over the city
      ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#08121c'], [0.6, '#16283a'], [1, '#22384a']]); ctx.fillRect(0, -300, W, H + 600);
      _city.stars.forEach(([sx, sy, a], i) => { ctx.fillStyle = `rgba(230,240,255,${0.25 + 0.5 * a * (0.7 + 0.3 * Math.sin(t + i))})`; ctx.fillRect(sx, sy, 1.2, 1.2); });
      ctx.fillStyle = 'rgba(240,250,230,.92)'; ctx.beginPath(); ctx.arc(W * 0.78, 150, 16, 0, TAU); ctx.fill();
      // far towers, then nearer blocks (slow parallax)
      _city.far.forEach(([bx, h, w], i) => { const x = W / 2 + (bx - V.x * 0.25) * 0.9; ctx.fillStyle = '#132232'; ctx.fillRect(x, SY(GY) - h, w, h + 400); for (let k = 0; k < 6; k++) if ((i * 7 + k * 3) % 5 === 0) { ctx.fillStyle = 'rgba(255,214,140,.5)'; ctx.fillRect(x + 5 + (k % 2) * 9, SY(GY) - h + 12 + k * 16, 3, 4); } });
      _city.near.forEach(([bx, h, w], i) => { const x = W / 2 + (bx - V.x * 0.55); ctx.fillStyle = '#0e1a26'; ctx.fillRect(x, SY(GY) - h + 140, w, h + 400); for (let k = 0; k < 10; k++) if ((i * 5 + k * 7) % 4 === 0) { const on = Math.sin(t * 0.25 + i * 3 + k) > -0.7; if (on) { ctx.fillStyle = 'rgba(255,206,120,.75)'; ctx.fillRect(x + 8 + (k % 3) * 14, SY(GY) - h + 160 + Math.floor(k / 3) * 26, 6, 9); } } });
      // our building: the outside wall around the cut-open flat
      ctx.save(); ctx.translate(SX(0), SY(GY)); ctx.scale(z, z);
      ctx.fillStyle = '#2a2c30'; ctx.fillRect(-168, -640, 336, 1000); ctx.fillStyle = '#34363a'; ctx.fillRect(-176, -652, 352, 16);
      for (let fl = -3; fl <= 1; fl++) { if (fl === 0) continue; [-110, -20, 70].forEach((wx, i) => { const wy = fl * 215 - 150; const lit = (fl * 7 + i * 3 + 9) % 4 === 0; ctx.fillStyle = lit ? 'rgba(255,206,120,.8)' : '#141a20'; ctx.fillRect(wx, wy, 40, 60); ctx.strokeStyle = '#3a3c40'; ctx.lineWidth = 3; ctx.strokeRect(wx, wy, 40, 60); if (lit) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(wx + 6, wy + 28, 14, 32); } }); ctx.fillStyle = '#222428'; ctx.fillRect(-168, fl * 215 + 4, 336, 8); }
      // the room
      ctx.fillStyle = lg(ctx, 0, BED.top, 0, 0, [[0, '#1a2c34'], [1, '#22383f']]); ctx.fillRect(BED.x0, BED.top, BED.x1 - BED.x0, -BED.top);
      ctx.strokeStyle = 'rgba(255,255,255,.03)'; ctx.lineWidth = 5; for (let x = BED.x0 + 8; x < BED.x1; x += 15) { ctx.beginPath(); ctx.moveTo(x, BED.top); ctx.lineTo(x, 0); ctx.stroke(); }
      // a window of normal size, with the city in it
      ctx.fillStyle = lg(ctx, 0, -150, 0, -82, [[0, '#0b1a2a'], [1, '#22404a']]); ctx.fillRect(66, -150, 52, 68);
      for (let k = 0; k < 5; k++) { const bh = 12 + (k * 13) % 26; ctx.fillStyle = k % 2 ? '#0c1820' : '#102028'; ctx.fillRect(67 + k * 10.4, -82 - bh, 10, bh); if (k % 2) { ctx.fillStyle = 'rgba(255,214,140,.8)'; ctx.fillRect(70 + k * 10.4, -76 - bh, 2, 3); } }
      ctx.strokeStyle = '#5a3a24'; ctx.lineWidth = 3.5; ctx.strokeRect(66, -150, 52, 68); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(92, -150); ctx.lineTo(92, -82); ctx.stroke();
      ctx.fillStyle = 'rgba(70,120,100,.85)'; ctx.beginPath(); ctx.moveTo(58, -156); ctx.quadraticCurveTo(66, -116, 58, -74); ctx.lineTo(67, -74); ctx.quadraticCurveTo(70, -116, 66, -156); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(126, -156); ctx.quadraticCurveTo(118, -116, 126, -74); ctx.lineTo(117, -74); ctx.quadraticCurveTo(114, -116, 118, -156); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a2016'; ctx.fillRect(54, -158, 76, 3);
      // shelf with books and a plant, a framed print of a ringed planet
      ctx.fillStyle = '#4a3020'; ctx.fillRect(-140, -128, 64, 3.5);
      const R = rng(5); for (let i = 0; i < 6; i++) { ctx.fillStyle = ['#7a4a2c', '#2f5446', '#a88a4c', '#5a6a3a', '#3a2a1c'][i % 5]; const bh = 12 + R() * 7; ctx.fillRect(-137 + i * 7, -128 - bh, 5.5, bh); }
      ctx.fillStyle = '#6a4a30'; ctx.fillRect(-92, -137, 9, 9); ctx.fillStyle = '#3f7a44'; ctx.beginPath(); ctx.arc(-87.5, -142, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1d3a34'; ctx.fillRect(-40, -168, 38, 46); ctx.strokeStyle = '#c58a52'; ctx.lineWidth = 1.4; ctx.strokeRect(-37, -165, 32, 40);
      ctx.strokeStyle = 'rgba(110,255,200,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-21, -145, 8, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-21, -145, 13, 3.4, -0.3, 0, TAU); ctx.stroke();
      // floor and rug
      ctx.fillStyle = '#3a2a1e'; ctx.fillRect(BED.x0, 0, BED.x1 - BED.x0, 16); ctx.fillStyle = 'rgba(70,110,90,.5)'; ctx.beginPath(); ctx.ellipse(10, 2, 90, 5, 0, 0, TAU); ctx.fill();
      // the bed
      ctx.fillStyle = '#5a3a24'; ctx.fillRect(-146, -62, 10, 62); ctx.fillStyle = '#e8e0cc'; ctx.fillRect(-136, -36, 128, 14); ctx.fillStyle = '#3a2a1e'; ctx.fillRect(-136, -22, 130, 12); ctx.fillRect(-12, -22, 5, 22); ctx.fillRect(-136, -10, 5, 10);
      // nightstand, lamp, the phone
      ctx.fillStyle = '#5a3a24'; ctx.fillRect(4, -40, 34, 40); ctx.fillStyle = '#4a3020'; ctx.fillRect(4, -22, 34, 2);
      ctx.fillStyle = '#c9b88a'; ctx.beginPath(); ctx.moveTo(12, -60); ctx.lineTo(26, -60); ctx.lineTo(30, -48); ctx.lineTo(8, -48); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#3a2a1e'; ctx.fillRect(18, -48, 2.4, 8);
      ctx.fillStyle = '#0d1418'; ctx.fillRect(24, -43, 11, 3); ctx.fillStyle = `rgba(150,230,255,${0.4 + 0.25 * Math.sin(t * 2)})`; ctx.fillRect(25, -42.6, 9, 2);
      // the sleeper
      const beam = G.beam || 0;
      if (!G.lifted) {
        const b = Math.sin(t * 1.1) * 1.1;
        ctx.fillStyle = '#f2ecdc'; ctx.beginPath(); ctx.ellipse(-116, -40, 17, 6, -0.05, 0, TAU); ctx.fill();
        ctx.fillStyle = G.male ? '#2e1e14' : '#3a2418'; ctx.beginPath(); ctx.ellipse(-120, -47, 9.5, 6.4, -0.2, 0, TAU); ctx.fill();
        ctx.fillStyle = '#d6a07a'; ctx.beginPath(); ctx.ellipse(-112, -45, 5.4, 6.2, 0.3, 0, TAU); ctx.fill();
        ctx.fillStyle = '#2f6a5a'; ctx.beginPath(); ctx.moveTo(-114, -38); ctx.bezierCurveTo(-90, -50 - b, -40, -48 - b, -10, -36); ctx.lineTo(-10, -22); ctx.lineTo(-116, -22); ctx.closePath(); ctx.fill();
        if (G.zzz !== false && beam < 0.1) { ctx.fillStyle = 'rgba(200,230,220,.65)'; ctx.font = '600 9px "Space Grotesk", sans-serif'; [0, 1, 2].forEach(k => { const u = ((t * 0.35 + k / 3) % 1); ctx.globalAlpha = 1 - u; ctx.fillText('z', -104 + u * 18 + k * 3, -58 - u * 36); }); ctx.globalAlpha = 1; }
      } else { ctx.fillStyle = '#2f6a5a'; ctx.beginPath(); ctx.moveTo(-116, -32); ctx.bezierCurveTo(-80, -36, -40, -36, -10, -32); ctx.lineTo(-10, -22); ctx.lineTo(-116, -22); ctx.closePath(); ctx.fill(); }
      // the ceiling, and the light that comes straight through it
      ctx.fillStyle = '#2a2c30'; ctx.fillRect(BED.x0 - 10, BED.top - 14, BED.x1 - BED.x0 + 20, 14);
      if (beam > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const a = Math.min(1, beam), wob = Math.sin(t * 9) * 2;
        ctx.fillStyle = lg(ctx, 0, -520, 0, 0, [[0, `rgba(200,255,235,${0.7 * a})`], [1, `rgba(120,255,210,${0.3 * a})`]]);
        ctx.beginPath(); ctx.moveTo(-100 - wob, -660); ctx.lineTo(-44 + wob, -660); ctx.lineTo(-12, -20); ctx.lineTo(-120, -20); ctx.closePath(); ctx.fill();
        for (let k = 0; k < 22; k++) { const u = ((t * 0.5 + k * 0.137) % 1); ctx.fillStyle = `rgba(230,255,245,${a * (1 - u)})`; ctx.beginPath(); ctx.arc(-110 + ((k * 53) % 90), -20 - u * 600, 1.2, 0, TAU); ctx.fill(); }
        ctx.fillStyle = `rgba(160,255,220,${0.12 * a})`; ctx.fillRect(BED.x0, BED.top, BED.x1 - BED.x0, -BED.top);
        ctx.restore();
      }
      ctx.restore();
      drawPeople(ctx, t, G, SX, SY, z, false);
      // the floor slab below the flat
      ctx.save(); ctx.translate(SX(0), SY(GY)); ctx.scale(z, z); ctx.fillStyle = '#2a2c30'; ctx.fillRect(BED.x0 - 10, 18, BED.x1 - BED.x0 + 20, 16); ctx.restore();
    }
  };

  /* ---------- the Kurator ship: a long, quiet chamber, cut open against space */
  SCN.ship = {
    ground: '#05090a', ownsCast: true, build() { const R = rng(9); return { stars: Array.from({ length: 160 }, () => [R() * W, R() * H, R()]) }; },
    back(ctx, t, S, G) {
      const { V, z, SX, SY } = roomView(G, 0, 1.12);
      ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#03060a'], [1, '#0a1418']]); ctx.fillRect(0, -300, W, H + 600);
      S.stars.forEach(([sx, sy, a], i) => { ctx.fillStyle = `rgba(240,255,245,${0.2 + 0.7 * a})`; ctx.fillRect((sx - V.x * 0.03 * a + W * 2) % W, sy, a > 0.9 ? 1.8 : 1.1, a > 0.9 ? 1.8 : 1.1); });
      // Earth, small and far below
      { const ex = W * 0.2 - V.x * 0.05, ey = H * 0.86; ctx.fillStyle = rg(ctx, ex, ey, 10, 120, [[0, 'rgba(120,200,255,.35)'], [1, 'rgba(0,0,0,0)']]); ctx.beginPath(); ctx.arc(ex, ey, 120, 0, TAU); ctx.fill(); ctx.fillStyle = rg(ctx, ex - 20, ey - 20, 4, 80, [[0, '#9fd8ff'], [0.6, '#3a7ab0'], [1, '#1e4a6a']]); ctx.beginPath(); ctx.arc(ex, ey, 74, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(90,160,90,.85)'; ctx.beginPath(); ctx.ellipse(ex - 14, ey - 18, 22, 14, 0.5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(ex + 26, ey + 10, 14, 9, 0.2, 0, TAU); ctx.fill(); }
      const alarm = G.anomaly ? 0.5 + 0.5 * Math.sin(t * 6) : 0, col = G.anomaly ? '255,190,120' : '150,255,220';
      ctx.save(); ctx.translate(SX(0), SY(GY)); ctx.scale(z, z);
      // hull: a long elegant shell, the near side cut away
      ctx.beginPath(); ctx.moveTo(-330, 40); ctx.bezierCurveTo(-400, -60, -360, -270, -200, -290); ctx.lineTo(200, -290); ctx.bezierCurveTo(360, -270, 400, -60, 330, 40); ctx.closePath();
      ctx.fillStyle = '#c9bf9e'; ctx.fill(); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 6; ctx.stroke();
      // the inside
      ctx.save(); ctx.beginPath(); ctx.moveTo(-300, 20); ctx.bezierCurveTo(-360, -60, -330, -250, -190, -268); ctx.lineTo(190, -268); ctx.bezierCurveTo(330, -250, 360, -60, 300, 20); ctx.closePath(); ctx.clip();
      ctx.fillStyle = lg(ctx, 0, -270, 0, 20, [[0, '#e2dcc6'], [0.6, '#cfc6a8'], [1, '#a89e80']]); ctx.fillRect(-380, -300, 760, 340);
      for (let k = -6; k <= 6; k++) { ctx.strokeStyle = 'rgba(160,140,90,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(k * 52, -270); ctx.quadraticCurveTo(k * 58, -120, k * 52, 20); ctx.stroke(); }
      if (alarm) { ctx.fillStyle = `rgba(255,140,60,${0.12 * alarm})`; ctx.fillRect(-380, -300, 760, 340); }
      // a viewport of normal size, with stars in it
      ctx.fillStyle = '#06120f'; ctx.beginPath(); ctx.ellipse(-190, -170, 40, 34, 0, 0, TAU); ctx.fill();
      for (let k = 0; k < 18; k++) { ctx.fillStyle = 'rgba(240,255,245,.8)'; ctx.fillRect(-220 + (k * 23) % 60, -196 + (k * 17) % 50, 1, 1); }
      ctx.fillStyle = '#3a7ab0'; ctx.beginPath(); ctx.arc(-178, -146, 14, Math.PI, TAU); ctx.fill();
      ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(-190, -170, 42, 36, 0, 0, TAU); ctx.stroke();
      // the pod: a column of light from floor to ceiling
      const px = -40;
      ctx.fillStyle = '#2a2a22'; ctx.beginPath(); ctx.ellipse(px, -262, 38, 8, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.ellipse(px, 0, 42, 8, 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = lg(ctx, px - 36, 0, px + 36, 0, [[0, `rgba(${col},.04)`], [0.5, `rgba(${col},.3)`], [1, `rgba(${col},.04)`]]); ctx.fillRect(px - 34, -258, 68, 258);
      for (let k = 0; k < 4; k++) { const yy = -250 + ((t * 50 + k * 64) % 250); ctx.strokeStyle = `rgba(${col},.6)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px, yy, 34, 6, 0, 0, TAU); ctx.stroke(); }
      ctx.restore();
      // the readout, floating in the middle of the room
      const p = Math.round(G.progress || 0), hx = 34, hy = -250;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(${col},.1)`; ctx.strokeStyle = `rgba(${col},.85)`; ctx.lineWidth = 0.8; ctx.fillRect(hx, hy, 124, 84); ctx.strokeRect(hx, hy, 124, 84);
      ctx.fillStyle = `rgba(${col},.95)`; ctx.font = '600 7.5px "Space Grotesk", sans-serif';
      ctx.fillText('SPECIMEN 4471 · HUMAN', hx + 6, hy + 13); ctx.fillText('KERNEL GROWTH', hx + 6, hy + 28);
      ctx.strokeRect(hx + 6, hy + 33, 88, 7); ctx.fillRect(hx + 7, hy + 34, 86 * p / 100, 5); ctx.fillText(p + '%', hx + 98, hy + 40);
      ctx.beginPath(); for (let k = 0; k <= 50; k++) { const xx = hx + 6 + k * 2.2, yy = hy + 56 + Math.sin(k * 0.5 + t * 8) * (G.anomaly ? 7 : 3) * Math.sin(k / 50 * Math.PI); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
      if (G.anomaly) { ctx.fillStyle = `rgba(255,170,110,${0.6 + 0.4 * alarm})`; ctx.font = '700 8px "Space Grotesk", sans-serif'; ctx.fillText('ANOMALY: LINGUAL', hx + 6, hy + 74); ctx.fillText('RESONANCE', hx + 6, hy + 83); }
      else { ctx.font = '500 7px "Space Grotesk", sans-serif'; ctx.fillText('STATUS: NOMINAL', hx + 6, hy + 76); }
      ctx.restore();
      // floor with a golden grid
      ctx.fillStyle = '#2a3a34'; ctx.fillRect(-380, 0, 760, 40); ctx.strokeStyle = 'rgba(201,162,74,.4)'; ctx.lineWidth = 1; for (let k = -360; k < 360; k += 24) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k * 1.15, 30); ctx.stroke(); }
      ctx.restore();
      ctx.restore();
      drawPeople(ctx, t, G, SX, SY, z, false);
      if (G.anomaly) for (let k = 0; k < 3; k++) { ctx.fillStyle = 'rgba(255,170,110,.18)'; ctx.fillRect(0, (t * 300 + k * 290) % H, W, 2); }
    }
  };

  window.Art = { W, H, DPR, SCN, render, makeStage, drawActor, handOf, heroLook, nightify, NPC, DEER_DAY, DEER_NIGHT, OUTFIT, ROTATION, scene, lerp, GY, HS, groundAt, zoneAt, zoneMix, palAt, smooth, WX: { LAKE_X, RAV0, RAV1, PYLON_X, WRECK_X, GATE_X, STONES_X }, TOWN, TZONES, townGround, townZoneAt, mapOf, palTod };
})();
