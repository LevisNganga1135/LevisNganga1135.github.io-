/* Deep-sea scene drawn on a fixed canvas behind every page.
   - Home (data-scene="hero"): full cast — leviathan, anglerfish, jellyfish, fish school.
   - Other pages: a quieter version that darkens as you go deeper.
   - Optional footage: drop a file at assets/video/deep-sea.mp4 and it plays behind the creatures. */
(() => {
  const canvas = document.getElementById("ocean");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isHero = document.body.dataset.scene === "hero";
  const baseDepth = parseFloat(document.body.dataset.tint || "0");

  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mod = (v, m) => ((v % m) + m) % m;
  const mix = (c1, c2, t) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)));

  const state = { scroll: 0, progress: 0, mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5, hasVideo: false };
  window.__ocean = state;

  let W = 0, H = 0, DPR = 1;
  let rays = [], snow = [], jellies = [], school = null, lev = null;

  /* ---------- setup ---------- */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function build() {
    const small = W < 700;
    rays = Array.from({ length: 7 }, () => ({
      x: rnd(-0.1, 1.0), w: rnd(0.04, 0.12), a: rnd(0.4, 1), sp: rnd(0.5, 1.5), ph: rnd(0, 6.28)
    }));
    snow = Array.from({ length: small ? 70 : 150 }, () => ({
      x: Math.random(), y: Math.random(), z: rnd(0.2, 1), r: rnd(0.6, 2), sp: rnd(0.5, 1.4), ph: rnd(0, 6.28)
    }));
    jellies = Array.from({ length: isHero ? (small ? 3 : 5) : small ? 2 : 3 }, () => ({
      x: rnd(0.05, 0.95), y: rnd(0.1, 1.2), s: rnd(18, 44), ph: rnd(0, 6.28), sp: rnd(0.6, 1.2),
      col: Math.random() < 0.7 ? [79, 240, 230] : [176, 140, 255], z: rnd(0.4, 1)
    }));
    school = {
      x: -200, y: 0.8, dir: 1, wait: rnd(4, 9),
      fish: Array.from({ length: 26 }, () => ({ dx: rnd(-70, 70), dy: rnd(-30, 30), ph: rnd(0, 6.28) }))
    };
    lev = {
      active: false, dir: 1, hx: 0, y0: 0, wait: isHero ? 0 : 4, speed: isHero ? 22 : 30,
      L: W * (isHero ? 1.3 : 0.9), Wm: clamp(W * (isHero ? 0.05 : 0.03), 22, 72), alpha: isHero ? 0.93 : 0.5
    };
    if (isHero) startLeviathan(true);
  }

  function startLeviathan(first) {
    lev.active = true;
    lev.dir = first ? 1 : Math.random() < 0.5 ? 1 : -1;
    lev.hx = first ? W * 0.68 : lev.dir === 1 ? -W * 0.1 : W * 1.1;
    lev.y0 = first ? H * (W < 700 ? 0.22 : 0.4) : rnd(H * 0.25, H * 0.65);
  }

  /* ---------- background & light ---------- */
  const TOP_SURF = [16, 110, 138], TOP_DEEP = [1, 8, 14];
  const BOT_SURF = [4, 34, 52], BOT_DEEP = [0, 3, 6];

  function drawBackground(d) {
    if (state.hasVideo) { ctx.clearRect(0, 0, W, H); return; }
    const top = mix(TOP_SURF, TOP_DEEP, Math.pow(d, 0.7));
    const bot = mix(BOT_SURF, BOT_DEEP, Math.pow(d, 0.7));
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgb(${top})`);
    g.addColorStop(1, `rgb(${bot})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawRays(d, time) {
    if (state.hasVideo) return;
    const a = 0.17 * Math.pow(1 - d, 1.6);
    if (a < 0.005) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const len = H * 1.15, slant = W * 0.22;
    for (const r of rays) {
      const x0 = r.x * W + Math.sin(time * 0.1 * r.sp + r.ph) * 0.06 * W - state.scroll * 0.05;
      const sp = r.w * W;
      const g = ctx.createLinearGradient(x0, 0, x0 + slant, len);
      g.addColorStop(0, `rgba(140,235,240,${a * r.a})`);
      g.addColorStop(1, "rgba(140,235,240,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x0, -20);
      ctx.lineTo(x0 + sp * 0.3, -20);
      ctx.lineTo(x0 + slant + sp, len);
      ctx.lineTo(x0 + slant, len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSnow(time, near) {
    ctx.save();
    for (const p of snow) {
      if ((p.z >= 0.55) !== near) continue;
      const x = mod(p.x * W + Math.sin(time * 0.3 * p.sp + p.ph) * 20 - (state.mx - 0.5) * 40 * p.z, W);
      const y = mod(p.y * H + time * p.sp * 12 * p.z - state.scroll * 0.5 * p.z, H);
      ctx.globalAlpha = 0.1 + 0.35 * p.z;
      ctx.fillStyle = "#c8f0f5";
      ctx.beginPath();
      ctx.arc(x, y, p.r * (0.6 + p.z * 0.6), 0, 6.283);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- creatures ---------- */
  function drawJellies(d, time) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of jellies) {
      const pulse = Math.sin(time * p.sp * 1.6 + p.ph);
      const bw = p.s * (1 + 0.08 * pulse), bh = p.s * (0.8 - 0.12 * pulse);
      const px = p.x * W + Math.sin(time * 0.2 * p.sp + p.ph) * 30 - (state.mx - 0.5) * 50 * p.z;
      const py = mod(p.y * H - time * p.sp * 6 - state.scroll * 0.3 * p.z, H + 240) - 120;
      const [r, g, b] = p.col;
      const alpha = (0.35 + 0.35 * d) * p.z;
      const grad = ctx.createRadialGradient(px, py - bh * 0.4, 1, px, py - bh * 0.4, bw * 1.1);
      grad.addColorStop(0, `rgba(${r},${g},${b},${0.35 * alpha})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},${0.02 * alpha})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(px - bw, py);
      ctx.bezierCurveTo(px - bw, py - bh * 1.5, px + bw, py - bh * 1.5, px + bw, py);
      ctx.quadraticCurveTo(px, py + bh * 0.35, px - bw, py);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.35 * alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.28 * alpha})`;
      for (let k = 0; k <= 6; k++) {
        const tx = px - bw * 0.8 + k * ((bw * 1.6) / 6);
        ctx.beginPath();
        ctx.moveTo(tx, py);
        for (let j = 1; j <= 8; j++) {
          ctx.lineTo(tx + Math.sin(time * 1.2 * p.sp + j * 0.7 + k) * p.s * 0.1 * (j / 8 + 0.2), py + j * p.s * 0.28);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawSchool(time, dt) {
    if (!isHero) return;
    const s = school;
    if (s.wait > 0) {
      s.wait -= dt;
      if (s.wait <= 0) { s.dir = Math.random() < 0.5 ? 1 : -1; s.x = s.dir === 1 ? -150 : W + 150; s.y = rnd(0.55, 0.85); }
      return;
    }
    s.x += s.dir * 70 * dt;
    if ((s.dir === 1 && s.x > W + 200) || (s.dir === -1 && s.x < -200)) { s.wait = rnd(12, 25); return; }
    ctx.save();
    ctx.fillStyle = "rgba(190,230,235,0.5)";
    const cy = s.y * H - state.scroll * 0.2;
    for (const f of s.fish) {
      const fx = s.x + f.dx + Math.sin(time * 2 + f.ph) * 6;
      const fy = cy + f.dy + Math.sin(time * 1.5 + f.ph) * 5;
      ctx.beginPath();
      ctx.moveTo(fx + s.dir * 7, fy);
      ctx.lineTo(fx - s.dir * 5, fy - 2.5);
      ctx.lineTo(fx - s.dir * 5, fy + 2.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAnglerfish(time) {
    if (!isHero) return;
    const s = clamp(W * 0.05, 38, 78);
    const narrow = W < 700;
    const px = W * (narrow ? 0.66 : 0.8) + Math.sin(time * 0.15) * W * 0.05 - (state.mx - 0.5) * 30;
    const py = H * (narrow ? 0.9 : 0.76) + Math.sin(time * 0.4) * 12 - state.scroll * 0.25;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(-1, 1); // face left, toward the headline
    // tail
    ctx.fillStyle = "rgba(2,9,14,0.96)";
    ctx.beginPath();
    ctx.moveTo(-s * 0.8, 0);
    ctx.bezierCurveTo(-s * 1.2, -s * 0.15, -s * 1.5, -s * 0.55 + Math.sin(time) * 5, -s * 1.8, -s * 0.5);
    ctx.bezierCurveTo(-s * 1.6, -s * 0.1, -s * 1.6, s * 0.1, -s * 1.8, s * 0.5 + Math.sin(time) * 5);
    ctx.bezierCurveTo(-s * 1.4, s * 0.5, -s * 1.2, s * 0.15, -s * 0.8, 0);
    ctx.fill();
    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.72, 0, 0, 6.283);
    ctx.fill();
    // jaw
    ctx.beginPath();
    ctx.moveTo(s * 0.35, s * 0.2);
    ctx.quadraticCurveTo(s * 1.15, s * 0.05, s * 1.0, s * 0.6);
    ctx.quadraticCurveTo(s * 0.6, s * 0.85, s * 0.2, s * 0.55);
    ctx.closePath();
    ctx.fill();
    // teeth
    ctx.fillStyle = "rgba(220,245,245,0.75)";
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const tx = lerp(s * 0.98, s * 0.42, t), ty = lerp(s * 0.42, s * 0.2, t) - Math.sin(t * 3.14) * s * 0.02;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - s * 0.03, ty - s * 0.16);
      ctx.lineTo(tx - s * 0.075, ty);
      ctx.closePath();
      ctx.fill();
    }
    // eye
    ctx.fillStyle = "rgba(225,255,250,0.9)";
    ctx.beginPath();
    ctx.arc(s * 0.52, -s * 0.18, s * 0.075, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "#01070d";
    ctx.beginPath();
    ctx.arc(s * 0.54, -s * 0.18, s * 0.035, 0, 6.283);
    ctx.fill();
    // stalk and lure
    const sway = Math.sin(time * 0.9) * s * 0.12;
    const lx = s * 1.25 + sway, ly = -s * 1.3;
    ctx.strokeStyle = "rgba(2,9,14,0.96)";
    ctx.lineWidth = Math.max(2, s * 0.04);
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.66);
    ctx.quadraticCurveTo(s * 0.55, -s * 1.7, lx, ly);
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    const pulse = 0.75 + 0.25 * Math.sin(time * 2.2);
    const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, s * 2.1);
    glow.addColorStop(0, `rgba(255,176,59,${0.6 * pulse})`);
    glow.addColorStop(0.25, `rgba(255,160,40,${0.22 * pulse})`);
    glow.addColorStop(1, "rgba(255,160,40,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lx, ly, s * 2.1, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "rgba(255,240,200,0.95)";
    ctx.beginPath();
    ctx.arc(lx, ly, Math.max(3, s * 0.07), 0, 6.283);
    ctx.fill();
    ctx.restore();
  }

  function drawLeviathan(d, time, dt) {
    if (!lev.active) {
      lev.wait -= dt;
      if (lev.wait <= 0) startLeviathan(false);
      return;
    }
    lev.hx += lev.dir * lev.speed * dt;
    const margin = lev.L * 0.02 + 200;
    if ((lev.dir === 1 && lev.hx - lev.L > W + margin) || (lev.dir === -1 && lev.hx + lev.L < -margin)) {
      lev.active = false;
      lev.wait = isHero ? rnd(8, 16) : rnd(14, 28);
      return;
    }
    const N = 80, L = lev.L, Wm = lev.Wm, A = Wm * 1.3;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const y = A * Math.sin(s * 7.5 - time * 0.55) * (0.25 + 0.9 * s);
      const w = Wm * (0.66 + 0.34 * Math.sin(Math.min(1, s / 0.1) * Math.PI / 2)) * Math.pow(1 - s, 0.9);
      pts.push({ x: -s * L, y, w, s });
    }
    const top = [], bot = [], nrm = [];
    for (let i = 0; i <= N; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
      let nx = -(b.y - a.y), ny = b.x - a.x;
      const len = Math.hypot(nx, ny) || 1;
      nx /= len; ny /= len;
      nrm.push([nx, ny]);
      top.push([pts[i].x + nx * pts[i].w, pts[i].y + ny * pts[i].w]);
      bot.push([pts[i].x - nx * pts[i].w, pts[i].y - ny * pts[i].w]);
    }

    ctx.save();
    ctx.globalAlpha = lev.alpha;
    ctx.translate(lev.hx, lev.y0 - state.scroll * 0.12);
    if (lev.dir < 0) ctx.scale(-1, 1);

    const body = ctx.createLinearGradient(0, 0, -L, 0);
    body.addColorStop(0, "rgba(1,6,10,0.97)");
    body.addColorStop(0.6, "rgba(2,10,16,0.86)");
    body.addColorStop(1, "rgba(3,14,22,0)");
    ctx.fillStyle = body;

    // body silhouette
    ctx.beginPath();
    ctx.moveTo(top[0][0], top[0][1]);
    for (let i = 1; i <= N; i++) ctx.lineTo(top[i][0], top[i][1]);
    for (let i = N; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
    ctx.closePath();
    ctx.fill();

    // dorsal spines
    for (let i = 3; i < N * 0.62; i += 3) {
      const [nx, ny] = nrm[i + 1];
      const h = pts[i + 1].w * 0.6;
      ctx.beginPath();
      ctx.moveTo(top[i][0], top[i][1]);
      ctx.lineTo(top[i + 1][0] + nx * h - 6, top[i + 1][1] + ny * h);
      ctx.lineTo(top[i + 2][0], top[i + 2][1]);
      ctx.closePath();
      ctx.fill();
    }

    // head, aligned to the direction the body is travelling
    const w0 = pts[0].w, hl = Wm * 1.9;
    const ang = Math.atan2(pts[0].y - pts[4].y, pts[0].x - pts[4].x);
    ctx.save();
    ctx.translate(0, pts[0].y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(-3, -w0);
    ctx.quadraticCurveTo(hl * 0.5, -w0 * 1.3, hl, -w0 * 0.2);
    ctx.lineTo(hl * 0.94, w0 * 0.05);
    ctx.lineTo(-3, w0 * 0.3);
    ctx.closePath();
    ctx.fill();
    // lower jaw, slightly open
    const jaw = 0.08 * Math.sin(time * 0.5);
    ctx.beginPath();
    ctx.moveTo(-3, w0 * 0.3);
    ctx.lineTo(hl * 0.9, w0 * (0.18 + jaw));
    ctx.quadraticCurveTo(hl * 0.6, w0 * (1.0 + jaw), -3, w0);
    ctx.closePath();
    ctx.fill();
    // teeth
    ctx.fillStyle = "rgba(210,238,242,0.4)";
    for (let i = 0; i < 9; i++) {
      const t = i / 8, tx = lerp(hl * 0.9, hl * 0.12, t), ty = lerp(w0 * 0.14, w0 * 0.32, t);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 2.5, ty + Wm * 0.12);
      ctx.lineTo(tx - 5.5, ty);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // rim light along the back
    ctx.strokeStyle = `rgba(79,240,230,${0.12 * (1 - d * 0.5)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(top[0][0], top[0][1]);
    for (let i = 1; i <= N; i++) ctx.lineTo(top[i][0], top[i][1]);
    ctx.stroke();

    // glowing eye and belly lights
    ctx.globalCompositeOperation = "lighter";
    const ex = hl * 0.42, ey = -w0 * 0.42, er = Wm * 0.45;
    const ep = 0.8 + 0.2 * Math.sin(time * 1.4);
    ctx.save();
    ctx.translate(0, pts[0].y);
    ctx.rotate(ang);
    const eye = ctx.createRadialGradient(ex, ey, 0, ex, ey, er);
    eye.addColorStop(0, `rgba(255,190,80,${0.95 * ep})`);
    eye.addColorStop(0.2, `rgba(255,150,40,${0.45 * ep})`);
    eye.addColorStop(1, "rgba(255,140,30,0)");
    ctx.fillStyle = eye;
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, 6.283);
    ctx.fill();
    ctx.restore();
    for (let i = 6; i < N * 0.85; i += 4) {
      const [nx, ny] = nrm[i];
      const bx = pts[i].x - nx * pts[i].w * 0.55, by = pts[i].y - ny * pts[i].w * 0.55;
      const pu = 0.5 + 0.5 * Math.sin(time * 1.1 + i * 0.6);
      const gr = ctx.createRadialGradient(bx, by, 0, bx, by, 14);
      gr.addColorStop(0, `rgba(79,240,230,${0.55 * pu * (1 - pts[i].s)})`);
      gr.addColorStop(1, "rgba(79,240,230,0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(bx, by, 14, 0, 6.283);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ---------- loop ---------- */
  let last = performance.now(), time = reduce ? 8 : 0, queued = false;

  function render(dt) {
    const d = clamp(baseDepth + state.progress * 0.4, 0, 1);
    drawBackground(d);
    drawRays(d, time);
    drawSnow(time, false);
    drawLeviathan(d, time, dt);
    drawSchool(time, dt);
    drawJellies(d, time);
    drawAnglerfish(time);
    drawSnow(time, true);
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    state.mx += (state.tx - state.mx) * 0.04;
    state.my += (state.ty - state.my) * 0.04;
    render(dt);
    requestAnimationFrame(frame);
  }

  function renderOnce() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; render(0); });
  }

  window.addEventListener("resize", () => { resize(); if (reduce) renderOnce(); });
  window.addEventListener("scroll", () => { if (reduce) renderOnce(); }, { passive: true });
  window.addEventListener("pointermove", (e) => { state.tx = e.clientX / W; state.ty = e.clientY / H; }, { passive: true });

  resize();
  if (reduce) render(0); else requestAnimationFrame(frame);
})();
