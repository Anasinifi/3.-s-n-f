import React, { useEffect, useMemo, useRef, useState } from 'react';
import { playSound } from './fx';

// ============================================================================
// --- OYUNLAR SEKMESİ: 10 basit çocuk oyunu ---
// Hepsi telefonda çalışır, internet / veritabanı kullanmaz (okuma maliyeti YOK).
// En yüksek puanlar sadece o telefonda saklanır.
// ============================================================================

const INK = '#2b2233';
const snd = (n) => { try { playSound(n); } catch (_) {} };
const bestKey = (id) => `ca_minigame_best_${id}`;
const getBest = (id) => { try { return Number(localStorage.getItem(bestKey(id))) || 0; } catch (_) { return 0; } };
const saveBest = (id, v) => { try { if (v > getBest(id)) localStorage.setItem(bestKey(id), String(v)); } catch (_) {} };
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));

// Mantıksal tuval 360x600; ekrana sığacak şekilde büyür/küçülür
const LW = 360, LH = 600;
function useFit(ref) {
  const [s, setS] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const upd = () => { const r = el.getBoundingClientRect(); setS(Math.max(0.3, Math.min(r.width / LW, r.height / LH))); };
    upd();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(upd) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', upd);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', upd); };
  }, [ref]);
  return s;
}

// Döngü: her karede step(dt) çağırır (dt saniye)
function useLoop(step, running) {
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    if (!running) return undefined;
    let raf = 0, last = performance.now();
    const tick = (t) => { const dt = Math.min(0.05, (t - last) / 1000); last = t; stepRef.current(dt); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}

// Ortak oyun çerçevesi: üstte geri + ad + puan, ortada oyun alanı, gerekirse altta düğmeler
function Frame({ game, score, onExit, children, controls, over, onRestart, hint }) {
  const best = Math.max(getBest(game.id), score || 0);
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: game.bg }}>
      <div className="shrink-0 flex items-center gap-2 px-3 pt-3 pb-2">
        <button onClick={() => { snd('pop'); onExit(); }} className="h-11 px-3 rounded-2xl bg-white border-4 border-white shadow-lg font-black text-indigo-600 flex items-center gap-1 active:scale-95"><span className="text-2xl leading-none">‹</span> oyunlar</button>
        <div className="flex-1 min-w-0 text-center font-black text-white text-lg truncate" style={{ textShadow: `0 2px 0 ${INK}` }}>{game.icon} {game.name}</div>
        <div className="flex flex-col items-end">
          <div className="px-3 py-1 rounded-xl bg-white/95 font-black text-slate-800 text-sm shadow">⭐ {score || 0}</div>
          <div className="text-[10px] font-black text-white/90 mt-0.5" style={{ textShadow: `0 1px 0 ${INK}` }}>rekor {best}</div>
        </div>
      </div>
      <div className="relative flex-1 min-h-0">
        {children}
        {over && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 p-4">
            <div className="ca-pop bg-white rounded-[2rem] border-4 border-white shadow-2xl px-6 py-5 text-center max-w-xs w-full">
              <div className="text-5xl">{over.icon || '🎉'}</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{over.title}</div>
              {over.text && <div className="text-sm font-bold text-slate-500 mt-1">{over.text}</div>}
              <div className="text-lg font-black text-amber-500 mt-2">⭐ {score || 0} {score >= best && score > 0 ? '· yeni rekor!' : ''}</div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { snd('pop'); onExit(); }} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-black">çık</button>
                <button onClick={() => { snd('pop'); onRestart(); }} className="flex-1 py-3 rounded-2xl text-white font-black shadow" style={{ background: 'linear-gradient(180deg,#fb923c,#f43f5e)' }}>tekrar ▶</button>
              </div>
            </div>
          </div>
        )}
        {hint && !over && <div className="pointer-events-none absolute left-0 right-0 bottom-2 text-center text-xs font-black text-white/90" style={{ textShadow: `0 1px 0 ${INK}` }}>{hint}</div>}
      </div>
      {controls && <div className="shrink-0 pl-12 pr-3 pb-4 pt-2">{controls}</div>}
    </div>
  );
}

const PadBtn = ({ children, onPress, className = '', wide = false }) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onPress(); }}
    className={`select-none touch-none h-16 ${wide ? 'flex-[2]' : 'flex-1'} rounded-3xl bg-white/95 border-4 border-white shadow-xl text-3xl font-black text-slate-700 active:scale-90 active:bg-amber-100 ${className}`}>
    {children}
  </button>
);

// Tuval bileşeni: mantıksal 360x600 alanı ekrana sığdırır
function Stage({ draw, onTap, onSwipe }) {
  const wrap = useRef(null);
  const cv = useRef(null);
  const s = useFit(wrap);
  const touch = useRef(null);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = LW * dpr; c.height = LH * dpr;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw.current = ctx;
  }, [draw]);
  const pos = (e) => { const r = cv.current.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * LW, y: (e.clientY - r.top) / r.height * LH }; };
  return (
    <div ref={wrap} className="absolute inset-0 flex items-center justify-center">
      <canvas ref={cv} className="touch-none rounded-3xl shadow-2xl border-4 border-white"
        style={{ width: LW * s, height: LH * s, background: '#fff' }}
        onPointerDown={(e) => { const p = pos(e); touch.current = { ...p, t: Date.now() }; if (onTap) onTap(p); }}
        onPointerUp={(e) => {
          const st = touch.current; touch.current = null;
          if (!st || !onSwipe) return;
          const p = pos(e); const dx = p.x - st.x, dy = p.y - st.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;
          onSwipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        }} />
    </div>
  );
}

const useKeys = (map) => {
  const ref = useRef(map); ref.current = map;
  useEffect(() => {
    const h = (e) => { const fn = ref.current[e.key]; if (fn) { e.preventDefault(); fn(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
};

const roundRect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

// ============================================================================
// 1) ARABA YARIŞI: şerit değiştir, engellere çarpma
// ============================================================================
function CarRace({ game, onExit }) {
  const ctx = useRef(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(null);
  const [run, setRun] = useState(0);
  const st = useRef(null);
  const lanes = [70, 180, 290];
  useEffect(() => { st.current = { lane: 1, x: lanes[1], obs: [], coins: [], t: 0, spawn: 0.8, speed: 260, road: 0, score: 0, alive: true }; setScore(0); setOver(null); }, [run]); // eslint-disable-line react-hooks/exhaustive-deps
  const move = (d) => { const s = st.current; if (!s || !s.alive) return; const nl = Math.max(0, Math.min(2, s.lane + d)); if (nl !== s.lane) { s.lane = nl; snd('whoosh'); } };
  useKeys({ ArrowLeft: () => move(-1), ArrowRight: () => move(1), a: () => move(-1), d: () => move(1) });
  useLoop((dt) => {
    const s = st.current, c = ctx.current; if (!s || !c) return;
    if (s.alive) {
      s.t += dt; s.speed = 260 + s.t * 9; s.road = (s.road + s.speed * dt) % 60;
      s.x += (lanes[s.lane] - s.x) * Math.min(1, dt * 14);
      s.spawn -= dt;
      if (s.spawn <= 0) {
        const free = [0, 1, 2]; const block = free.splice(rint(0, 2), 1)[0];
        s.obs.push({ lane: block, y: -60, kind: rint(0, 2) });
        if (s.t > 12 && Math.random() < 0.35) s.obs.push({ lane: free[rint(0, 1)], y: -200, kind: rint(0, 2) });
        if (Math.random() < 0.6) s.coins.push({ lane: free[rint(0, free.length - 1)], y: -120 });
        s.spawn = Math.max(0.45, 1.1 - s.t * 0.015);
      }
      s.obs.forEach(o => { o.y += s.speed * dt; });
      s.coins.forEach(o => { o.y += s.speed * dt; });
      s.obs = s.obs.filter(o => o.y < LH + 80);
      const carY = 500;
      for (const o of s.obs) if (Math.abs(lanes[o.lane] - s.x) < 46 && Math.abs(o.y - carY) < 62) { s.alive = false; snd('thud'); saveBest(game.id, Math.floor(s.score)); setOver({ icon: '💥', title: 'çarptın!', text: 'engellerden kaçmaya çalış' }); break; }
      s.coins = s.coins.filter(o => { if (Math.abs(lanes[o.lane] - s.x) < 40 && Math.abs(o.y - carY) < 50) { s.score += 5; snd('coin'); return false; } return o.y < LH + 40; });
      s.score += dt * 2;
      const sc = Math.floor(s.score); if (sc !== score) setScore(sc);
    }
    // çiz
    c.fillStyle = '#4ade80'; c.fillRect(0, 0, LW, LH);
    c.fillStyle = '#64748b'; c.fillRect(20, 0, 320, LH);
    c.fillStyle = '#fff'; c.fillRect(20, 0, 6, LH); c.fillRect(334, 0, 6, LH);
    c.fillStyle = '#fde047';
    for (let y = -60 + s.road; y < LH; y += 60) { c.fillRect(124, y, 6, 34); c.fillRect(232, y, 6, 34); }
    s.coins.forEach(o => { c.fillStyle = '#facc15'; c.beginPath(); c.arc(lanes[o.lane], o.y, 15, 0, 7); c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#fff'; c.fillRect(lanes[o.lane] - 3, o.y - 8, 4, 10); });
    s.obs.forEach(o => {
      const x = lanes[o.lane];
      if (o.kind === 0) { c.fillStyle = '#f97316'; c.beginPath(); c.moveTo(x, o.y - 30); c.lineTo(x + 26, o.y + 28); c.lineTo(x - 26, o.y + 28); c.closePath(); c.fill(); c.lineWidth = 4; c.strokeStyle = INK; c.stroke(); c.fillStyle = '#fff'; c.fillRect(x - 14, o.y + 2, 28, 7); }
      else if (o.kind === 1) { c.fillStyle = '#a16207'; roundRect(c, x - 34, o.y - 26, 68, 52, 8); c.fill(); c.lineWidth = 4; c.strokeStyle = INK; c.stroke(); c.beginPath(); c.moveTo(x - 34, o.y - 26); c.lineTo(x + 34, o.y + 26); c.stroke(); }
      else { drawCar(c, x, o.y, '#3b82f6', true); }
    });
    drawCar(c, s.x, 500, '#ef4444', false);
  }, true);
  return (
    <Frame game={game} score={score} onExit={onExit} over={over} onRestart={() => setRun(r => r + 1)} hint="şeridi değiştirmek için sağa / sola dokun"
      controls={<div className="flex gap-3"><PadBtn onPress={() => move(-1)}>⬅️</PadBtn><PadBtn onPress={() => move(1)}>➡️</PadBtn></div>}>
      <Stage draw={ctx} onTap={(p) => move(p.x < st.current?.x ? -1 : 1)} />
    </Frame>
  );
}
function drawCar(c, x, y, color, down) {
  c.save(); c.translate(x, y); if (down) c.rotate(Math.PI);
  c.fillStyle = INK; [[-28, -26], [18, -26], [-28, 14], [18, 14]].forEach(([a, b]) => { roundRect(c, a, b, 10, 18, 3); c.fill(); });
  c.fillStyle = color; roundRect(c, -22, -40, 44, 80, 14); c.fill(); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
  c.fillStyle = '#bae6fd'; roundRect(c, -15, -24, 30, 18, 5); c.fill(); c.stroke();
  c.fillStyle = '#fde047'; c.fillRect(-16, -40, 8, 5); c.fillRect(8, -40, 8, 5);
  c.restore();
}

// ============================================================================
// 2) DÜŞEN BLOKLAR: satırları doldur
// ============================================================================
const SHAPES = [
  { c: '#22d3ee', b: [[0, 1], [1, 1], [2, 1], [3, 1]] },
  { c: '#facc15', b: [[1, 0], [2, 0], [1, 1], [2, 1]] },
  { c: '#a855f7', b: [[1, 0], [0, 1], [1, 1], [2, 1]] },
  { c: '#22c55e', b: [[1, 0], [2, 0], [0, 1], [1, 1]] },
  { c: '#ef4444', b: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { c: '#3b82f6', b: [[0, 0], [0, 1], [1, 1], [2, 1]] },
  { c: '#f97316', b: [[2, 0], [0, 1], [1, 1], [2, 1]] },
];
function Blocks({ game, onExit }) {
  const COLS = 10, ROWS = 16, CELL = 34, OX = (LW - COLS * CELL) / 2, OY = 40;
  const ctx = useRef(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(null);
  const [run, setRun] = useState(0);
  const st = useRef(null);
  const newPiece = () => { const s = SHAPES[rint(0, SHAPES.length - 1)]; return { c: s.c, b: s.b.map(p => [...p]), x: 3, y: 0 }; };
  useEffect(() => { st.current = { grid: Array.from({ length: ROWS }, () => Array(COLS).fill(null)), p: newPiece(), next: newPiece(), drop: 0, score: 0, alive: true, lines: 0 }; setScore(0); setOver(null); }, [run]); // eslint-disable-line react-hooks/exhaustive-deps
  const fits = (s, b, x, y) => b.every(([a, c]) => { const X = a + x, Y = c + y; return X >= 0 && X < COLS && Y < ROWS && (Y < 0 || !s.grid[Y][X]); });
  const lock = (s) => {
    s.p.b.forEach(([a, c]) => { const Y = c + s.p.y; if (Y >= 0) s.grid[Y][a + s.p.x] = s.p.c; });
    const keep = s.grid.filter(r => r.some(v => !v));
    const cleared = ROWS - keep.length;
    while (keep.length < ROWS) keep.unshift(Array(COLS).fill(null));
    s.grid = keep;
    if (cleared) { s.score += [0, 10, 30, 60, 100][cleared]; s.lines += cleared; snd('sparkle'); } else snd('pop');
    s.p = s.next; s.next = newPiece();
    if (!fits(s, s.p.b, s.p.x, s.p.y)) { s.alive = false; snd('sad'); saveBest(game.id, s.score); setOver({ icon: '🧱', title: 'bloklar doldu!', text: `${s.lines} satır temizledin` }); }
    setScore(s.score);
  };
  const act = (k) => {
    const s = st.current; if (!s || !s.alive) return;
    if (k === 'left' && fits(s, s.p.b, s.p.x - 1, s.p.y)) s.p.x--;
    if (k === 'right' && fits(s, s.p.b, s.p.x + 1, s.p.y)) s.p.x++;
    if (k === 'down') { if (fits(s, s.p.b, s.p.x, s.p.y + 1)) s.p.y++; else lock(s); }
    if (k === 'drop') { while (fits(s, s.p.b, s.p.x, s.p.y + 1)) s.p.y++; lock(s); }
    if (k === 'rot') {
      const mx = Math.max(...s.p.b.map(p => p[0])), my = Math.max(...s.p.b.map(p => p[1]));
      const r = s.p.b.map(([a, c]) => [my - c, a]);
      void mx;
      for (const kick of [0, -1, 1, -2, 2]) if (fits(s, r, s.p.x + kick, s.p.y)) { s.p.b = r; s.p.x += kick; snd('tap'); break; }
    }
  };
  useKeys({ ArrowLeft: () => act('left'), ArrowRight: () => act('right'), ArrowDown: () => act('down'), ArrowUp: () => act('rot'), ' ': () => act('drop') });
  useLoop((dt) => {
    const s = st.current, c = ctx.current; if (!s || !c) return;
    if (s.alive) { s.drop += dt; const iv = Math.max(0.18, 0.75 - s.lines * 0.02); if (s.drop > iv) { s.drop = 0; act('down'); } }
    c.fillStyle = '#1e1b4b'; c.fillRect(0, 0, LW, LH);
    c.fillStyle = '#312e81'; c.fillRect(OX, OY, COLS * CELL, ROWS * CELL);
    const cell = (x, y, col) => { c.fillStyle = col; roundRect(c, OX + x * CELL + 2, OY + y * CELL + 2, CELL - 4, CELL - 4, 6); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(OX + x * CELL + 6, OY + y * CELL + 6, CELL - 16, 5); };
    s.grid.forEach((r, y) => r.forEach((v, x) => { if (v) cell(x, y, v); }));
    // gölge
    let gy = s.p.y; while (s.alive && fits(s, s.p.b, s.p.x, gy + 1)) gy++;
    c.globalAlpha = 0.25; s.p.b.forEach(([a, b2]) => { if (b2 + gy >= 0) cell(a + s.p.x, b2 + gy, s.p.c); }); c.globalAlpha = 1;
    s.p.b.forEach(([a, b2]) => { if (b2 + s.p.y >= 0) cell(a + s.p.x, b2 + s.p.y, s.p.c); });
    c.fillStyle = '#fff'; c.font = 'bold 16px sans-serif'; c.fillText('sıradaki:', 14, 26);
    s.next.b.forEach(([a, b2]) => { c.fillStyle = s.next.c; roundRect(c, 96 + a * 14, 12 + b2 * 14, 12, 12, 3); c.fill(); });
  }, true);
  return (
    <Frame game={game} score={score} onExit={onExit} over={over} onRestart={() => setRun(r => r + 1)}
      controls={<div className="flex gap-2"><PadBtn onPress={() => act('left')}>⬅️</PadBtn><PadBtn onPress={() => act('rot')}>🔄</PadBtn><PadBtn onPress={() => act('drop')}>⬇️</PadBtn><PadBtn onPress={() => act('right')}>➡️</PadBtn></div>}>
      <Stage draw={ctx} onSwipe={(d) => act(d === 'up' ? 'rot' : d === 'down' ? 'drop' : d)} onTap={() => act('rot')} />
    </Frame>
  );
}

// ============================================================================
// 3) YILAN: elmaları ye, kendine çarpma
// ============================================================================
function Snake({ game, onExit }) {
  const N = 15, CELL = 22, OX = (LW - N * CELL) / 2, OY = 120;
  const ctx = useRef(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(null);
  const [run, setRun] = useState(0);
  const st = useRef(null);
  const placeFood = (body) => { let f; do { f = [rint(0, N - 1), rint(0, N - 1)]; } while (body.some(p => p[0] === f[0] && p[1] === f[1])); return f; };
  useEffect(() => { const body = [[7, 7], [6, 7], [5, 7]]; st.current = { body, dir: [1, 0], next: [1, 0], food: placeFood(body), acc: 0, alive: true, score: 0 }; setScore(0); setOver(null); }, [run]); // eslint-disable-line react-hooks/exhaustive-deps
  const turn = (d) => { const s = st.current; if (!s) return; const m = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d]; if (m && !(m[0] === -s.dir[0] && m[1] === -s.dir[1])) s.next = m; };
  useKeys({ ArrowUp: () => turn('up'), ArrowDown: () => turn('down'), ArrowLeft: () => turn('left'), ArrowRight: () => turn('right') });
  useLoop((dt) => {
    const s = st.current, c = ctx.current; if (!s || !c) return;
    if (s.alive) {
      s.acc += dt;
      const iv = Math.max(0.09, 0.2 - s.score * 0.004);
      if (s.acc > iv) {
        s.acc = 0; s.dir = s.next;
        const h = [(s.body[0][0] + s.dir[0] + N) % N, (s.body[0][1] + s.dir[1] + N) % N];
        if (s.body.some(p => p[0] === h[0] && p[1] === h[1])) { s.alive = false; snd('thud'); saveBest(game.id, s.score); setOver({ icon: '🐍', title: 'yılan kendine çarptı!', text: `boyu ${s.body.length} oldu` }); }
        else {
          s.body.unshift(h);
          if (h[0] === s.food[0] && h[1] === s.food[1]) { s.score += 1; setScore(s.score); snd('coin'); s.food = placeFood(s.body); } else s.body.pop();
        }
      }
    }
    c.fillStyle = '#86efac'; c.fillRect(0, 0, LW, LH);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { c.fillStyle = (x + y) % 2 ? '#bbf7d0' : '#a7f3d0'; c.fillRect(OX + x * CELL, OY + y * CELL, CELL, CELL); }
    c.lineWidth = 4; c.strokeStyle = INK; c.strokeRect(OX, OY, N * CELL, N * CELL);
    c.font = '20px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('🍎', OX + s.food[0] * CELL + CELL / 2, OY + s.food[1] * CELL + CELL / 2 + 1);
    s.body.forEach(([x, y], i) => { c.fillStyle = i === 0 ? '#16a34a' : (i % 2 ? '#22c55e' : '#4ade80'); roundRect(c, OX + x * CELL + 1, OY + y * CELL + 1, CELL - 2, CELL - 2, 7); c.fill(); });
    const [hx, hy] = s.body[0]; c.fillStyle = '#fff'; c.beginPath(); c.arc(OX + hx * CELL + 7, OY + hy * CELL + 8, 3.5, 0, 7); c.arc(OX + hx * CELL + 15, OY + hy * CELL + 8, 3.5, 0, 7); c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(OX + hx * CELL + 7, OY + hy * CELL + 8, 1.6, 0, 7); c.arc(OX + hx * CELL + 15, OY + hy * CELL + 8, 1.6, 0, 7); c.fill();
    c.textAlign = 'start'; c.textBaseline = 'alphabetic';
  }, true);
  return (
    <Frame game={game} score={score} onExit={onExit} over={over} onRestart={() => setRun(r => r + 1)} hint="parmağını kaydır ya da oklara bas"
      controls={<div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto"><div /><PadBtn onPress={() => turn('up')}>⬆️</PadBtn><div /><PadBtn onPress={() => turn('left')}>⬅️</PadBtn><PadBtn onPress={() => turn('down')}>⬇️</PadBtn><PadBtn onPress={() => turn('right')}>➡️</PadBtn></div>}>
      <Stage draw={ctx} onSwipe={turn} />
    </Frame>
  );
}

// ============================================================================
// 4) UÇAN KUŞ: dokun, kuş zıplasın, borulara çarpma
// ============================================================================
function FlyBird({ game, onExit }) {
  const ctx = useRef(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(null);
  const [run, setRun] = useState(0);
  const st = useRef(null);
  useEffect(() => { st.current = { y: 280, v: 0, pipes: [], t: 0, spawn: 0.6, score: 0, alive: true, started: false, cloud: 0 }; setScore(0); setOver(null); }, [run]);
  const flap = () => { const s = st.current; if (!s || !s.alive) return; s.started = true; s.v = -330; snd('boing'); };
  useKeys({ ' ': flap, ArrowUp: flap });
  useLoop((dt) => {
    const s = st.current, c = ctx.current; if (!s || !c) return;
    s.cloud = (s.cloud + dt * 20) % (LW + 200);
    if (s.alive && s.started) {
      s.t += dt; s.v += 900 * dt; s.y += s.v * dt;
      s.spawn -= dt;
      if (s.spawn <= 0) { const gap = 190; s.pipes.push({ x: LW + 30, top: rnd(80, LH - 110 - gap), gap, passed: false }); s.spawn = 1.7; }
      s.pipes.forEach(p => { p.x -= 150 * dt; });
      s.pipes = s.pipes.filter(p => p.x > -80);
      for (const p of s.pipes) {
        if (!p.passed && p.x + 30 < 90) { p.passed = true; s.score += 1; setScore(s.score); snd('coin'); }
        if (90 + 16 > p.x - 30 && 90 - 16 < p.x + 30 && (s.y - 15 < p.top || s.y + 15 > p.top + p.gap)) s.alive = false;
      }
      if (s.y > LH - 70 || s.y < 0) s.alive = false;
      if (!s.alive) { snd('thud'); saveBest(game.id, s.score); setOver({ icon: '🐦', title: 'pat!', text: 'borulara değmeden uç' }); }
    }
    c.fillStyle = '#7dd3fc'; c.fillRect(0, 0, LW, LH);
    c.fillStyle = '#fff'; [[60, 90], [220, 160], [300, 60]].forEach(([x, y]) => { const X = ((x - s.cloud) % (LW + 200) + LW + 200) % (LW + 200) - 100; c.beginPath(); c.arc(X, y, 22, 0, 7); c.arc(X + 26, y - 8, 26, 0, 7); c.arc(X + 54, y, 20, 0, 7); c.fill(); });
    s.pipes.forEach(p => {
      c.fillStyle = '#22c55e'; c.lineWidth = 4; c.strokeStyle = INK;
      c.fillRect(p.x - 30, 0, 60, p.top); c.strokeRect(p.x - 30, -4, 60, p.top + 4);
      c.fillRect(p.x - 36, p.top - 24, 72, 24); c.strokeRect(p.x - 36, p.top - 24, 72, 24);
      const by = p.top + p.gap; c.fillRect(p.x - 30, by, 60, LH - by); c.strokeRect(p.x - 30, by, 60, LH - by + 4);
      c.fillRect(p.x - 36, by, 72, 24); c.strokeRect(p.x - 36, by, 72, 24);
    });
    c.fillStyle = '#facc15'; c.fillRect(0, LH - 60, LW, 60); c.fillStyle = '#84cc16'; c.fillRect(0, LH - 60, LW, 14);
    c.save(); c.translate(90, s.y); c.rotate(Math.max(-0.5, Math.min(1, s.v / 600)));
    c.fillStyle = '#fb923c'; c.beginPath(); c.ellipse(0, 0, 20, 16, 0, 0, 7); c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
    c.fillStyle = '#fdba74'; c.beginPath(); c.ellipse(-6, 4, 10, 6, -0.4, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(8, -5, 6, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(10, -5, 2.5, 0, 7); c.fill();
    c.fillStyle = '#ef4444'; c.beginPath(); c.moveTo(18, 0); c.lineTo(30, 4); c.lineTo(18, 8); c.closePath(); c.fill(); c.stroke();
    c.restore();
    if (!s.started && s.alive) { c.fillStyle = INK; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText('başlamak için dokun!', LW / 2, 220); c.textAlign = 'start'; }
  }, true);
  return (
    <Frame game={game} score={score} onExit={onExit} over={over} onRestart={() => setRun(r => r + 1)} hint="kuşu uçurmak için ekrana dokun">
      <Stage draw={ctx} onTap={flap} />
    </Frame>
  );
}

// ============================================================================
// 5) MEYVE YAKALA: sepeti kaydır, meyveleri topla, bombadan kaç
// ============================================================================
function FruitCatch({ game, onExit }) {
  const ctx = useRef(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(null);
  const [run, setRun] = useState(0);
  const st = useRef(null);
  const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒'];
  useEffect(() => { st.current = { x: LW / 2, items: [], spawn: 0, t: 0, score: 0, lives: 3, alive: true, target: LW / 2 }; setScore(0); setOver(null); }, [run]);
  const moveTo = (x) => { const s = st.current; if (s) s.target = Math.max(40, Math.min(LW - 40, x)); };
  const nudge = (d) => { const s = st.current; if (s) moveTo(s.target + d * 70); };
  useKeys({ ArrowLeft: () => nudge(-1), ArrowRight: () => nudge(1) });
  useLoop((dt) => {
    const s = st.current, c = ctx.current; if (!s || !c) return;
    if (s.alive) {
      s.t += dt; s.x += (s.target - s.x) * Math.min(1, dt * 12);
      s.spawn -= dt;
      if (s.spawn <= 0) { const bomb = s.t > 5 && Math.random() < 0.22; s.items.push({ x: rnd(30, LW - 30), y: -30, v: rnd(150, 210) + s.t * 3, e: bomb ? '💣' : FRUITS[rint(0, FRUITS.length - 1)], bomb }); s.spawn = Math.max(0.35, 0.9 - s.t * 0.01); }
      s.items.forEach(it => { it.y += it.v * dt; });
      s.items = s.items.filter(it => {
        if (it.y > 500 && it.y < 545 && Math.abs(it.x - s.x) < 52) {
          if (it.bomb) { s.lives -= 1; snd('thud'); } else { s.score += 1; setScore(s.score); snd('coin'); }
          return false;
        }
        if (it.y > LH + 30) { if (!it.bomb) { s.lives -= 1; snd('soft'); } return false; }
        return true;
      });
      if (s.lives <= 0) { s.alive = false; saveBest(game.id, s.score); setOver({ icon: '🧺', title: 'oyun bitti!', text: `${s.score} meyve topladın` }); }
    }
    const g = c.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#fef9c3'); g.addColorStop(1, '#bbf7d0'); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
    c.font = '34px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    s.items.forEach(it => c.fillText(it.e, it.x, it.y));
    c.font = '24px sans-serif'; c.fillText('❤️'.repeat(Math.max(0, s.lives)) + '🤍'.repeat(Math.max(0, 3 - s.lives)), LW / 2, 26);
    // sepet
    c.save(); c.translate(s.x, 535);
    c.fillStyle = '#b45309'; c.beginPath(); c.moveTo(-50, -18); c.lineTo(50, -18); c.lineTo(38, 26); c.lineTo(-38, 26); c.closePath(); c.fill(); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
    c.strokeStyle = '#78350f'; c.lineWidth = 3; for (let i = -30; i <= 30; i += 15) { c.beginPath(); c.moveTo(i, -16); c.lineTo(i * 0.8, 24); c.stroke(); }
    c.restore();
    c.textAlign = 'start'; c.textBaseline = 'alphabetic';
  }, true);
  return (
    <Frame game={game} score={score} onExit={onExit} over={over} onRestart={() => setRun(r => r + 1)} hint="sepeti parmağınla sürükle · bombaları yakalama!"
      controls={<div className="flex gap-3"><PadBtn onPress={() => nudge(-1)}>⬅️</PadBtn><PadBtn onPress={() => nudge(1)}>➡️</PadBtn></div>}>
      <DragStage draw={ctx} onMove={(p) => moveTo(p.x)} />
    </Frame>
  );
}
// Parmakla sürüklemeli tuval
function DragStage({ draw, onMove }) {
  const wrap = useRef(null);
  const cv = useRef(null);
  const s = useFit(wrap);
  const down = useRef(false);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = LW * dpr; c.height = LH * dpr;
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw.current = ctx;
  }, [draw]);
  const pos = (e) => { const r = cv.current.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * LW, y: (e.clientY - r.top) / r.height * LH }; };
  return (
    <div ref={wrap} className="absolute inset-0 flex items-center justify-center">
      <canvas ref={cv} className="touch-none rounded-3xl shadow-2xl border-4 border-white" style={{ width: LW * s, height: LH * s }}
        onPointerDown={(e) => { down.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {} onMove(pos(e)); }}
        onPointerMove={(e) => { if (down.current) onMove(pos(e)); }}
        onPointerUp={() => { down.current = false; }} onPointerCancel={() => { down.current = false; }} />
    </div>
  );
}

// ============================================================================
// 6) TUĞLA KIRMA: raketi kaydır, topla tuğlaları kır
// ============================================================================
function Bricks({ game, onExit }) {
  const ctx = useRef(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(null);
  const [run, setRun] = useState(0);
  const st = useRef(null);
  const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6'];
  const makeBricks = (lvl) => { const b = []; for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) b.push({ x: 14 + k * 48, y: 70 + r * 26, w: 44, h: 20, c: COLORS[r], hp: lvl > 1 && r < 2 ? 2 : 1 }); return b; };
  const resetBall = (s) => { s.ball = { x: s.px, y: 520, vx: rnd(-1, 1) * 120, vy: -320 - s.level * 20, stuck: true }; };
  useEffect(() => { const s = { px: LW / 2, target: LW / 2, bricks: makeBricks(1), level: 1, lives: 3, score: 0, alive: true }; resetBall(s); st.current = s; setScore(0); setOver(null); }, [run]); // eslint-disable-line react-hooks/exhaustive-deps
  const moveTo = (x) => { const s = st.current; if (!s) return; s.target = Math.max(45, Math.min(LW - 45, x)); };
  const launch = () => { const s = st.current; if (s && s.ball.stuck && s.alive) { s.ball.stuck = false; snd('boing'); } };
  useKeys({ ArrowLeft: () => moveTo((st.current?.target || 0) - 50), ArrowRight: () => moveTo((st.current?.target || 0) + 50), ' ': launch });
  useLoop((dt) => {
    const s = st.current, c = ctx.current; if (!s || !c) return;
    if (s.alive) {
      s.px += (s.target - s.px) * Math.min(1, dt * 16);
      const b = s.ball;
      if (b.stuck) { b.x = s.px; b.y = 532; }
      else {
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < 10) { b.x = 10; b.vx = Math.abs(b.vx); } if (b.x > LW - 10) { b.x = LW - 10; b.vx = -Math.abs(b.vx); }
        if (b.y < 10) { b.y = 10; b.vy = Math.abs(b.vy); }
        if (b.vy > 0 && b.y > 535 && b.y < 555 && Math.abs(b.x - s.px) < 50) { b.vy = -Math.abs(b.vy); b.vx = (b.x - s.px) * 7; snd('pop'); }
        for (const br of s.bricks) {
          if (br.hp > 0 && b.x > br.x - 9 && b.x < br.x + br.w + 9 && b.y > br.y - 9 && b.y < br.y + br.h + 9) {
            br.hp -= 1; s.score += 1; setScore(s.score); snd(br.hp ? 'tap' : 'chime');
            const ox = Math.min(b.x - (br.x - 9), br.x + br.w + 9 - b.x), oy = Math.min(b.y - (br.y - 9), br.y + br.h + 9 - b.y);
            if (ox < oy) b.vx = -b.vx; else b.vy = -b.vy;
            break;
          }
        }
        s.bricks = s.bricks.filter(br => br.hp > 0);
        if (b.y > LH + 20) { s.lives -= 1; snd('soft'); if (s.lives <= 0) { s.alive = false; saveBest(game.id, s.score); setOver({ icon: '🧱', title: 'top kaçtı!', text: `${s.level}. bölüme kadar geldin` }); } else resetBall(s); }
        if (!s.bricks.length) { s.level += 1; s.bricks = makeBricks(s.level); snd('fanfare'); resetBall(s); }
      }
    }
    c.fillStyle = '#0f172a'; c.fillRect(0, 0, LW, LH);
    s.bricks.forEach(br => { c.fillStyle = br.c; roundRect(c, br.x, br.y, br.w, br.h, 6); c.fill(); c.fillStyle = br.hp > 1 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'; c.fillRect(br.x + 4, br.y + 3, br.w - 8, 4); });
    c.fillStyle = '#e2e8f0'; roundRect(c, s.px - 45, 545, 90, 14, 7); c.fill();
    c.fillStyle = '#fde047'; c.beginPath(); c.arc(s.ball.x, s.ball.y, 9, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 15px sans-serif'; c.fillText(`bölüm ${s.level}   ${'❤️'.repeat(Math.max(0, s.lives))}`, 12, 30);
    if (s.ball.stuck && s.alive) { c.textAlign = 'center'; c.font = 'bold 20px sans-serif'; c.fillText('topu atmak için dokun', LW / 2, 420); c.textAlign = 'start'; }
  }, true);
  return (
    <Frame game={game} score={score} onExit={onExit} over={over} onRestart={() => setRun(r => r + 1)} hint="raketi parmağınla sürükle">
      <DragStage draw={ctx} onMove={(p) => { moveTo(p.x); launch(); }} />
    </Frame>
  );
}

// ============================================================================
// 7) HAFIZA KARTLARI: aynı resimleri eşleştir
// ============================================================================
const MEM_ICONS = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁', '🐷', '🐮', '🐔'];
function Memory({ game, onExit }) {
  const [level, setLevel] = useState(0); // 0: 6 çift, 1: 8 çift, 2: 10 çift
  const pairs = [6, 8, 10][level];
  const [run, setRun] = useState(0);
  const cards = useMemo(() => {
    const icons = [...MEM_ICONS].sort(() => Math.random() - 0.5).slice(0, pairs);
    return [...icons, ...icons].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, e }));
  }, [pairs, run]);
  const [open, setOpen] = useState([]);
  const [done, setDone] = useState([]);
  const [moves, setMoves] = useState(0);
  const [over, setOver] = useState(null);
  useEffect(() => { setOpen([]); setDone([]); setMoves(0); setOver(null); }, [cards]);
  const score = Math.max(0, pairs * 10 - Math.max(0, moves - pairs) * 2);
  const flip = (c) => {
    if (open.length === 2 || open.includes(c.id) || done.includes(c.e)) return;
    snd('tap');
    const o = [...open, c.id];
    setOpen(o);
    if (o.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = o.map(id => cards[id]);
      if (a.e === b.e) {
        setTimeout(() => {
          snd('coin');
          const nd = [...done, a.e]; setDone(nd); setOpen([]);
          if (nd.length === pairs) { snd('fanfare'); saveBest(game.id, score); setOver({ icon: '🧠', title: 'hepsini buldun!', text: `${moves + 1} denemede` }); }
        }, 350);
      } else setTimeout(() => setOpen([]), 800);
    }
  };
  const cols = pairs <= 6 ? 3 : 4;
  return (
    <Frame game={game} score={score} onExit={onExit} over={over} onRestart={() => setRun(r => r + 1)}
      controls={<div className="flex gap-2 justify-center">{['kolay', 'orta', 'zor'].map((l, i) => <button key={l} onClick={() => { snd('pop'); setLevel(i); setRun(r => r + 1); }} className={`px-4 py-2.5 rounded-2xl font-black text-sm border-4 border-white shadow ${level === i ? 'bg-amber-400 text-white' : 'bg-white/90 text-slate-600'}`}>{l}</button>)}</div>}>
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="grid gap-2 w-full max-w-sm" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {cards.map(c => {
            const shown = open.includes(c.id) || done.includes(c.e);
            return (
              <button key={c.id} onClick={() => flip(c)} className="aspect-square rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-4xl transition-all duration-300 active:scale-95"
                style={{ background: shown ? (done.includes(c.e) ? '#bbf7d0' : '#fff') : 'linear-gradient(135deg,#a855f7,#6366f1)', transform: shown ? 'rotateY(0deg)' : 'rotateY(180deg)' }}>
                <span style={{ transform: shown ? 'none' : 'rotateY(180deg)' }}>{shown ? c.e : '❓'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// 8) KÖSTEBEK YAKALA: çıkan köstebeğe dokun (30 saniye)
// ============================================================================
function Mole({ game, onExit }) {
  const [run, setRun] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [up, setUp] = useState({}); // delik -> 'mole' | 'bunny'
  const [hit, setHit] = useState(null);
  const [over, setOver] = useState(null);
  const scoreRef = useRef(0);
  useEffect(() => {
    setScore(0); scoreRef.current = 0; setTime(30); setUp({}); setOver(null);
    let left = 30;
    const clock = setInterval(() => { left -= 1; setTime(left); if (left <= 0) { clearInterval(clock); clearInterval(pop); setUp({}); snd('fanfare'); saveBest(game.id, scoreRef.current); setOver({ icon: '⏰', title: 'süre bitti!', text: `${scoreRef.current} köstebek yakaladın` }); } }, 1000);
    const pop = setInterval(() => {
      const h = rint(0, 8); const kind = Math.random() < 0.18 ? 'bunny' : 'mole';
      setUp(u => ({ ...u, [h]: kind }));
      setTimeout(() => setUp(u => { const n = { ...u }; if (n[h] === kind) delete n[h]; return n; }), rint(700, 1100));
    }, 650);
    return () => { clearInterval(clock); clearInterval(pop); };
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps
  const whack = (i) => {
    const k = up[i]; if (!k || over) return;
    if (k === 'mole') { scoreRef.current += 1; setScore(scoreRef.current); snd('pop'); } else { scoreRef.current = Math.max(0, scoreRef.current - 2); setScore(scoreRef.current); snd('sad'); }
    setHit(i); setTimeout(() => setHit(null), 200);
    setUp(u => { const n = { ...u }; delete n[i]; return n; });
  };
  return (
    <Frame game={game} score={score} onExit={onExit} over={over} onRestart={() => setRun(r => r + 1)} hint="köstebeğe dokun · tavşana dokunma!">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-4">
        <div className="px-4 py-1.5 rounded-full bg-white/95 font-black text-slate-700 shadow">⏱️ {time} sn</div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {Array.from({ length: 9 }).map((_, i) => (
            <button key={i} onPointerDown={() => whack(i)} className="relative aspect-square rounded-full overflow-hidden border-4 border-white shadow-xl touch-none" style={{ background: 'radial-gradient(circle at 50% 70%, #3f2a14 0%, #78350f 55%, #a16207 100%)' }}>
              <span className={`absolute inset-x-0 bottom-1 text-5xl transition-transform duration-150 ${up[i] ? 'translate-y-0' : 'translate-y-[110%]'} ${hit === i ? 'scale-75' : ''}`}>{up[i] === 'bunny' ? '🐰' : '🐹'}</span>
              {hit === i && <span className="absolute inset-0 flex items-center justify-center text-4xl">💥</span>}
            </button>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// 9) BALON PATLAT: yükselen balonları patlat (renkli olanlar puan, siyah olanlar ceza)
// ============================================================================
function Balloons({ game, onExit }) {
  const [run, setRun] = useState(0);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState([]);
  const [time, setTime] = useState(40);
  const [over, setOver] = useState(null);
  const scoreRef = useRef(0);
  const idRef = useRef(0);
  useEffect(() => {
    scoreRef.current = 0; setScore(0); setItems([]); setTime(40); setOver(null);
    let left = 40;
    const clock = setInterval(() => { left -= 1; setTime(left); if (left <= 0) { clearInterval(clock); clearInterval(sp); setItems([]); snd('fanfare'); saveBest(game.id, scoreRef.current); setOver({ icon: '🎈', title: 'süre bitti!', text: `${scoreRef.current} balon patlattın` }); } }, 1000);
    const sp = setInterval(() => {
      const id = ++idRef.current;
      const bad = Math.random() < 0.15;
      setItems(a => [...a.slice(-14), { id, x: rnd(5, 80), c: bad ? '#1f2937' : ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][rint(0, 6)], dur: rnd(3.2, 5), bad }]);
    }, 520);
    return () => { clearInterval(clock); clearInterval(sp); };
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps
  const popIt = (b) => {
    if (over) return;
    if (b.bad) { scoreRef.current = Math.max(0, scoreRef.current - 3); snd('thud'); } else { scoreRef.current += 1; snd('pop'); }
    setScore(scoreRef.current);
    setItems(a => a.map(x => x.id === b.id ? { ...x, popped: true } : x));
    setTimeout(() => setItems(a => a.filter(x => x.id !== b.id)), 250);
  };
  return (
    <Frame game={game} score={score} onExit={onExit} over={over} onRestart={() => setRun(r => r + 1)} hint="renkli balonları patlat · siyahlara dokunma!">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/95 font-black text-slate-700 shadow z-[2]">⏱️ {time} sn</div>
        {items.map(b => (
          <button key={b.id} onPointerDown={() => popIt(b)} className="absolute touch-none ca-mg-rise" style={{ left: `${b.x}%`, bottom: -120, animationDuration: `${b.dur}s` }}>
            {b.popped ? <span className="text-5xl">💥</span> : (
              <svg width="64" height="96" viewBox="0 0 64 96"><path d="M32 70 Q30 82 34 94" stroke={INK} strokeWidth="2" fill="none" /><ellipse cx="32" cy="34" rx="26" ry="32" fill={b.c} stroke={INK} strokeWidth="3" /><path d="M28 66 L36 66 L32 72 Z" fill={b.c} stroke={INK} strokeWidth="2" /><ellipse cx="22" cy="22" rx="6" ry="9" fill="#fff" opacity="0.5" />{b.bad && <text x="32" y="42" textAnchor="middle" fontSize="22">💀</text>}</svg>
            )}
          </button>
        ))}
      </div>
    </Frame>
  );
}

// ============================================================================
// 10) XOX: bilgisayara karşı (kolay rakip)
// ============================================================================
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winner = (b) => { for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { w: b[a], line: [a, c, d] }; return b.every(Boolean) ? { w: 'draw', line: [] } : null; };
function TicTac({ game, onExit }) {
  const [b, setB] = useState(Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(null);
  const [busy, setBusy] = useState(false);
  const scoreRef = useRef(0);
  const restart = () => { setB(Array(9).fill(null)); setOver(null); setBusy(false); };
  const finish = (r) => {
    if (r.w === 'X') { scoreRef.current += 3; snd('fanfare'); setOver({ icon: '🏆', title: 'kazandın!', text: 'harikasın' }); }
    else if (r.w === 'O') { snd('sad'); setOver({ icon: '🤖', title: 'robot kazandı', text: 'bir daha dene' }); }
    else { scoreRef.current += 1; snd('chime'); setOver({ icon: '🤝', title: 'berabere!', text: 'iyi oyundu' }); }
    setScore(scoreRef.current); saveBest(game.id, scoreRef.current);
  };
  const aiMove = (bd) => {
    const empty = bd.map((v, i) => v ? null : i).filter(v => v !== null);
    const tryWin = (p) => { for (const i of empty) { const t = [...bd]; t[i] = p; if (winner(t)?.w === p) return i; } return null; };
    // %30 ihtimalle rastgele oynar: çocuk kazanabilsin
    if (Math.random() < 0.3) return empty[rint(0, empty.length - 1)];
    return tryWin('O') ?? tryWin('X') ?? (bd[4] ? null : 4) ?? empty[rint(0, empty.length - 1)];
  };
  const play = (i) => {
    if (b[i] || over || busy) return;
    snd('tap');
    const nb = [...b]; nb[i] = 'X'; setB(nb);
    const r = winner(nb); if (r) { finish(r); return; }
    setBusy(true);
    setTimeout(() => { const j = aiMove(nb); const nb2 = [...nb]; nb2[j] = 'O'; setB(nb2); snd('pop'); setBusy(false); const r2 = winner(nb2); if (r2) finish(r2); }, 550);
  };
  const res = winner(b);
  return (
    <Frame game={game} score={score} onExit={onExit} over={over ? { ...over } : null} onRestart={restart} hint="sen ❌ ile oynuyorsun, robot ⭕ ile">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="grid grid-cols-3 gap-2 w-full max-w-[330px] bg-indigo-900/30 p-2 rounded-3xl">
          {b.map((v, i) => (
            <button key={i} onClick={() => play(i)} className={`aspect-square rounded-2xl border-4 border-white shadow-lg text-6xl font-black flex items-center justify-center active:scale-95 ${res?.line.includes(i) ? 'bg-amber-200' : 'bg-white/95'}`}>
              {v === 'X' ? <span className="text-rose-500">✕</span> : v === 'O' ? <span className="text-sky-500">◯</span> : ''}
            </button>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ============================================================================
// OYUN LİSTESİ ve OYUN MERKEZİ
// ============================================================================
export const MINI_GAMES = [
  { id: 'car', name: 'araba yarışı', icon: '🏎️', desc: 'engellere çarpma, altın topla', C: CarRace, bg: 'linear-gradient(180deg,#38bdf8,#22c55e)' },
  { id: 'blocks', name: 'düşen bloklar', icon: '🧱', desc: 'blokları yerleştir, satırı doldur', C: Blocks, bg: 'linear-gradient(180deg,#6366f1,#1e1b4b)' },
  { id: 'snake', name: 'yılan', icon: '🐍', desc: 'elmaları ye, uzadıkça uza', C: Snake, bg: 'linear-gradient(180deg,#22c55e,#15803d)' },
  { id: 'bird', name: 'uçan kuş', icon: '🐦', desc: 'dokun, borulara değmeden uç', C: FlyBird, bg: 'linear-gradient(180deg,#0ea5e9,#0369a1)' },
  { id: 'fruit', name: 'meyve yakala', icon: '🧺', desc: 'meyveleri topla, bombadan kaç', C: FruitCatch, bg: 'linear-gradient(180deg,#f59e0b,#ea580c)' },
  { id: 'bricks', name: 'tuğla kırma', icon: '🏓', desc: 'topla bütün tuğlaları kır', C: Bricks, bg: 'linear-gradient(180deg,#334155,#0f172a)' },
  { id: 'memory', name: 'hafıza kartları', icon: '🧠', desc: 'aynı hayvanları eşleştir', C: Memory, bg: 'linear-gradient(180deg,#c084fc,#7c3aed)' },
  { id: 'mole', name: 'köstebek yakala', icon: '🐹', desc: 'çıkan köstebeğe çabuk dokun', C: Mole, bg: 'linear-gradient(180deg,#84cc16,#4d7c0f)' },
  { id: 'balloons', name: 'balon patlat', icon: '🎈', desc: 'renkli balonları patlat', C: Balloons, bg: 'linear-gradient(180deg,#7dd3fc,#f0abfc)' },
  { id: 'xox', name: 'XOX', icon: '❌', desc: 'robota karşı üçünü yan yana diz', C: TicTac, bg: 'linear-gradient(180deg,#fb7185,#e11d48)' },
];

export function GamesHub({ onClose, allowed }) {
  const [cur, setCur] = useState(null);
  const list = MINI_GAMES.filter(g => !allowed || allowed[g.id] !== false);
  const G = cur && MINI_GAMES.find(g => g.id === cur);
  return (
    <div className="ca-game fixed inset-0 z-[96] overflow-hidden select-none" style={{ background: 'linear-gradient(160deg,#22d3ee 0%,#818cf8 50%,#f472b6 100%)' }}>
      {G ? <G.C key={G.id} game={G} onExit={() => setCur(null)} /> : (
        <div className="absolute inset-0 flex flex-col">
          <div className="shrink-0 flex items-center gap-2 px-3 pt-3 pb-2">
            <button onClick={() => { snd('pop'); onClose(); }} className="h-11 px-3 rounded-2xl bg-white border-4 border-white shadow-lg font-black text-indigo-600 flex items-center gap-1 active:scale-95"><span className="text-2xl leading-none">‹</span> harita 🗺️</button>
            <div className="flex-1 text-center font-black text-white text-2xl" style={{ textShadow: `0 2px 0 ${INK}` }}>🎮 oyunlar</div>
            <div className="w-[90px]" />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {list.map((g, i) => (
                <button key={g.id} onClick={() => { snd('tap'); setCur(g.id); }} className="ca-pop relative rounded-[1.8rem] border-4 border-white shadow-2xl p-3 text-left active:scale-95 overflow-hidden" style={{ background: g.bg, animationDelay: `${i * 0.04}s` }}>
                  <div className="text-5xl drop-shadow">{g.icon}</div>
                  <div className="font-black text-white text-base mt-1 leading-tight" style={{ textShadow: `0 1px 0 ${INK}` }}>{g.name}</div>
                  <div className="text-[11px] font-bold text-white/90 leading-snug mt-0.5">{g.desc}</div>
                  {getBest(g.id) > 0 && <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-black text-amber-600">🏆 {getBest(g.id)}</div>}
                </button>
              ))}
            </div>
            {list.length === 0 && <div className="text-center text-white font-black mt-10">öğretmenin şu an oyunları kapattı.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// Haritanın solundaki "oyunlar" sekmesi (ödev sekmesinin altında)
export function GamesTab({ onOpen }) {
  return (
    <button onClick={onOpen} aria-label="oyunlar"
      className="ca-game fixed left-0 pointer-events-auto flex flex-col items-center justify-center gap-0.5 rounded-r-3xl border-4 border-l-0 border-white shadow-2xl active:scale-95"
      style={{ zIndex: 60, top: 'calc(38% + 108px)', width: 66, height: 86, background: 'linear-gradient(160deg,#34d399 0%,#06b6d4 55%,#3b82f6 100%)' }}>
      <span className="text-3xl leading-none">🎮</span>
      <span className="text-[13px] font-extrabold text-white leading-none" style={{ textShadow: `0 1px 0 ${INK}` }}>oyunlar</span>
    </button>
  );
}
