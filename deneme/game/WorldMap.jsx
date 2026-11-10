import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar } from './Avatar';
import { DIFFICULTY_BY_ID, BUILTIN_MAPS } from './catalog';
import { getTestDifficulty } from './progress';
import { FancyAudioPlayer } from '../components/common/AudioPlayers';
import { Terrain, PathLayer, IslandBase, ClearingBase, PlanetBase, Landmark, TreeBarrier, Mist, GoalChest, bezPoint, seeded, hashStr, INK } from './MapArt';
import { sfx, say, isMuted, setMuted, getFxConfig } from './fx';
import { Celebration, StarShape } from './Celebration';

// ============================================================================
// --- GRUP: ADA ADA HARİTA EKRANI (gerçekçi çizgi film haritası) ---
// ============================================================================
// * Okyanus: adalar suyun üstünde, karakter bir adadan diğerine YÜZEREK geçer.
// * Orman: yolu kapatan ağacı karakter BALTAYLA KESER, ağaç devrilir, yol açılır.
// * Çöl: yürür · Buz: kayar · Şeker/Dinozor: taşlardan zıplar · Uzay: jetpack ile uçar.
// * Yeni ada açıldığında geçiş animasyonu bir kez oynar (telefonda hatırlanır).

export { seeded, hashStr };

// Arka planda hafif efekt (ateş böceği, kar...). Emoji değil.
export function Particles({ kind, count = 18, seed = 1 }) {
  const list = useMemo(() => {
    const r = seeded(seed + 11);
    return Array.from({ length: count }).map((_, i) => ({
      left: r() * 100, top: r() * 100, size: kind === 'bubble' ? 8 + r() * 18 : kind === 'firefly' || kind === 'ember' ? 4 + r() * 4 : 3 + r() * 5,
      dur: kind === 'sand' ? 4 + r() * 5 : kind === 'firefly' || kind === 'star' || kind === 'sparkle' ? 3 + r() * 4 : 7 + r() * 9,
      delay: -r() * 12, key: i,
    }));
  }, [kind, count, seed]);
  if (!kind || kind === 'none') return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {list.map(p => (
        <span key={p.key} className={`ca-particle ca-p-${kind}`}
          style={{
            left: kind === 'sand' ? undefined : `${p.left}%`,
            top: kind === 'bubble' || kind === 'ember' ? undefined : kind === 'snow' ? undefined : `${p.top}%`,
            width: kind === 'sand' ? p.size * 6 : p.size, height: kind === 'sand' ? 2 : p.size,
            animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`,
          }} />
      ))}
    </div>
  );
}

const SEEN_KEY = (child) => `ca_seen_cross_${child?.childId || child?.id || 'x'}`;
const readSeen = (child) => { try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY(child)) || '[]')); } catch (_) { return new Set(); } };
const addSeen = (child, id) => { try { const s = readSeen(child); s.add(id); localStorage.setItem(SEEN_KEY(child), JSON.stringify(Array.from(s).slice(-400))); } catch (_) {} };

const ARTS = { map_forest: 'forest', map_ocean: 'ocean', map_candy: 'candy', map_desert: 'desert', map_ice: 'ice', map_dino: 'dino', map_space: 'space' };
const CROSS = { forest: 'chop', ocean: 'swim', candy: 'hop', desert: 'walk', ice: 'slide', dino: 'hop', space: 'fly' };
const CHAR = 74; // haritadaki karakter boyu (genişlik)

// Karakterin elindeki balta
function Axe() {
  return (
    <svg width="44" height="70" viewBox="0 0 44 70" className="ca-axe" style={{ overflow: 'visible' }}>
      <rect x="5" y="8" width="6" height="58" rx="3" fill="#a0703c" stroke={INK} strokeWidth="2.5" />
      <path d="M8 6 Q30 -2 38 14 Q28 22 8 22 Z" fill="#cbd5e1" stroke={INK} strokeWidth="2.5" />
      <path d="M30 6 Q36 12 34 18" stroke="#fff" strokeWidth="2" fill="none" />
    </svg>
  );
}

function Jetpack() {
  return (
    <svg width="40" height="56" viewBox="0 0 40 56" style={{ overflow: 'visible' }}>
      <rect x="4" y="0" width="12" height="28" rx="5" fill="#94a3b8" stroke={INK} strokeWidth="2.5" />
      <rect x="24" y="0" width="12" height="28" rx="5" fill="#94a3b8" stroke={INK} strokeWidth="2.5" />
      <path d="M6 28 Q10 56 14 28 Z M26 28 Q30 56 34 28 Z" fill="#fb923c" className="ca-flame" />
      <path d="M8 28 Q10 44 12 28 Z M28 28 Q30 44 32 28 Z" fill="#fde047" className="ca-flame" />
    </svg>
  );
}

export function WorldMap({ world, child, game, itemMap, cfg, balance, onPlayIsland, onOpenStudio, onLogout, settings, welcomePlayed, setWelcomePlayed, loadingTestId, loadError, clearError, paused = false, testMode = false, onResetTest = null }) {
  const firstActive = Math.max(0, world.findIndex(m => m.unlocked && !m.allDone));
  const lastUnlocked = world.reduce((acc, m, i) => (m.unlocked ? i : acc), 0);
  const [mapIdx, setMapIdx] = useState(world.length ? (world.findIndex(m => m.unlocked && !m.allDone) >= 0 ? firstActive : lastUnlocked) : 0);
  const [card, setCard] = useState(null);
  const [toast, setToast] = useState('');
  const [wiggle, setWiggle] = useState(null);
  const [menu, setMenu] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [width, setWidth] = useState(Math.min(typeof window !== 'undefined' ? window.innerWidth : 400, 560));
  const [travel, setTravel] = useState(null); // { from, to, kind, phase, t }
  const [seenTick, setSeenTick] = useState(0);
  const [mapDone, setMapDone] = useState(null);
  const scrollRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const on = () => setWidth(Math.min(window.innerWidth, 560));
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  const shouldAutoPlay = settings?.welcomeAutoPlay && !welcomePlayed;
  useEffect(() => { if (shouldAutoPlay) setWelcomePlayed?.(true); }, [shouldAutoPlay, setWelcomePlayed]);

  const map = world[Math.min(mapIdx, Math.max(0, world.length - 1))] || { ...BUILTIN_MAPS[0], islands: [], unlocked: true, allDone: false, currentIdx: -1 };
  const islands = map?.islands || [];
  const art = map.art || ARTS[map.theme] || ARTS[map.id] || 'ocean';
  const crossing = map.crossing || CROSS[art] || 'walk';
  const GAP = 200, TOP = 250, BOTTOM = 170;
  const H = Math.max(islands.length * GAP + TOP + BOTTOM, typeof window !== 'undefined' ? window.innerHeight : 700);
  const pos = (i) => ({ x: width / 2 + (width * 0.25) * Math.sin(i * 1.15 + 0.5), y: H - BOTTOM - i * GAP });
  const pts = useMemo(() => islands.map((_, i) => pos(i)), [islands.length, width, H]); // eslint-disable-line react-hooks/exhaustive-deps
  const seed = hashStr(map.id || 'x');
  const seen = useMemo(() => readSeen(child), [child?.childId, seenTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Karakterin durduğu ada
  const restIdx = map.currentIdx >= 0 ? map.currentIdx : (map.allDone ? islands.length - 1 : 0);
  // Henüz izlenmemiş geçiş var mı? (önceki adadan bu adaya)
  const pendingIdx = (restIdx > 0 && islands[restIdx] && islands[restIdx].state !== 'locked' && !seen.has(islands[restIdx].test.id) && map.currentIdx === restIdx) ? restIdx : -1;

  // Mevcut adaya kaydır
  useEffect(() => {
    if (!scrollRef.current || !map) return;
    const ci = pendingIdx > 0 ? pendingIdx - 1 : restIdx;
    const y = (pts[ci]?.y ?? H) - scrollRef.current.clientHeight * 0.6;
    scrollRef.current.scrollTop = Math.max(0, y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapIdx, world.length, map?.currentIdx, width]);

  // --- GEÇİŞ ANİMASYONU ---
  useEffect(() => {
    if (paused || travel || pendingIdx < 1 || !pts[pendingIdx]) return;
    const t0 = setTimeout(() => startTravel(pendingIdx - 1, pendingIdx), 500);
    return () => clearTimeout(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, pendingIdx, mapIdx, !!travel]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const startTravel = (from, to) => {
    const kind = crossing;
    const steps = kind === 'chop'
      ? [['walk1', 1300, 0, 0.4], ['chop', 1900, 0.4, 0.4], ['fall', 1000, 0.4, 0.4], ['walk2', 1500, 0.4, 1]]
      : [['move', kind === 'swim' ? 3000 : kind === 'fly' ? 2200 : 2400, 0, 1]];
    let si = 0, stepStart = performance.now();
    const fired = new Set();
    const fire = (key, fn) => { if (!fired.has(key)) { fired.add(key); fn(); } };
    if (kind === 'swim') sfx('splash');
    if (kind === 'fly') sfx('fly');
    if (kind === 'slide') sfx('whoosh');
    const tick = (now) => {
      const [phase, dur, a, b] = steps[si];
      const k = Math.min(1, (now - stepStart) / dur);
      const ease = phase === 'move' || phase.startsWith('walk') ? (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) : k;
      const t = a + (b - a) * ease;
      if (phase === 'chop') { [0.12, 0.42, 0.72].forEach((m, i) => { if (k >= m) fire(`c${i}`, () => sfx('chop')); }); }
      if (phase === 'fall' && k > 0.1) fire('fall', () => sfx('treeFall'));
      if (kind === 'hop') [0.2, 0.35, 0.5, 0.65, 0.8].forEach((m, i) => { if (t >= m) fire(`h${i}`, () => sfx('hop')); });
      setTravel({ from, to, kind, phase, t, k });
      // kamera karakteri takip etsin
      const p = bezPoint(pts[from], pts[to], t);
      if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, p.y - scrollRef.current.clientHeight * 0.55);
      if (k >= 1) {
        si += 1; stepStart = now;
        if (si >= steps.length) {
          if (kind === 'swim') sfx('splash');
          sfx('unlock');
          addSeen(child, islands[to].test.id);
          setSeenTick(x => x + 1);
          setTravel(null);
          showToast('yeni adaya ulaştın! 🏝️');
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // --- HARİTA BİTTİ KUTLAMASI (bir kez) ---
  useEffect(() => {
    if (paused || travel || !map.allDone || !islands.length) return;
    const key = `map_done_${map.id}`;
    if (seen.has(key)) return;
    const fx = getFxConfig(cfg);
    addSeen(child, key);
    setSeenTick(x => x + 1);
    if (fx.events.map_done?.enabled !== false) setMapDone(fx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, !!travel, map.allDone, map.id]);

  const showToast = (t) => { setToast(t); setTimeout(() => setToast(''), 1800); };

  const tapIsland = (isl, i) => {
    if (travel) return;
    sfx('tap');
    if (isl.state === 'locked') {
      setWiggle(i); setTimeout(() => setWiggle(null), 500);
      showToast(crossing === 'chop' ? 'yol kapalı! önce önceki adayı bitir 🌲' : 'önce önceki adayı tamamla! 🏝️');
      return;
    }
    clearError?.();
    setCard({ ...isl, index: i });
  };

  const goMap = (dir) => {
    if (travel) return;
    const n = mapIdx + dir;
    if (n < 0 || n >= world.length) return;
    if (!world[n].unlocked) { showToast('bu haritayı açmak için önceki haritayı bitir! 🔒'); return; }
    sfx('whoosh');
    setMapIdx(n);
  };

  // Karakterin konumu ve hâli
  let charPos, charMode = 'rest', flip = false;
  if (travel && pts[travel.from] && pts[travel.to]) {
    const p = bezPoint(pts[travel.from], pts[travel.to], travel.t);
    const ahead = bezPoint(pts[travel.from], pts[travel.to], Math.min(1, travel.t + 0.02));
    flip = ahead.x < p.x - 0.2;
    charPos = { ...p };
    charMode = travel.kind === 'chop' ? (travel.phase === 'chop' ? 'chop' : travel.phase === 'fall' ? 'watch' : 'walk') : travel.kind;
    if (travel.kind === 'hop') charPos.y -= Math.abs(Math.sin(travel.t * Math.PI * 6)) * 26;
    if (travel.kind === 'fly') charPos.y -= Math.sin(travel.t * Math.PI) * 70;
    if (travel.kind === 'chop' && (travel.phase === 'chop' || travel.phase === 'fall')) charPos.x += flip ? 34 : -34;
  } else if (pts[pendingIdx > 0 ? pendingIdx - 1 : restIdx]) {
    const base = pts[pendingIdx > 0 ? pendingIdx - 1 : restIdx];
    charPos = { x: base.x + (art === 'space' ? 0 : 36), y: base.y + (art === 'space' ? -58 : 8) };
    flip = false;
  }

  // Ağaç engelinin durumu (geçiş i: i-1 -> i)
  const barrierState = (i) => {
    if (travel && travel.to === i && travel.kind === 'chop') {
      if (travel.phase === 'walk1') return 'closed';
      if (travel.phase === 'chop') return 'chopping';
      if (travel.phase === 'fall') return 'falling';
      return 'open';
    }
    if (i === pendingIdx) return 'closed';
    return islands[i]?.state === 'locked' ? 'closed' : 'open';
  };
  const openUpTo = (() => {
    let n = 0;
    for (let i = 1; i < islands.length; i++) if (islands[i].state !== 'locked' && i !== pendingIdx) n = i;
    return n;
  })();

  const customBg = map?.bgImage;

  return (
    <div className="ca-game fixed inset-0 z-[60] overflow-hidden select-none" style={{ background: art === 'space' ? '#020617' : '#0288d1' }}>
      {/* ÜST ÇUBUK */}
      {/* Dar telefonlarda sağdaki ☰ menü ekran dışına taşmasın: harita adı küçülür, sağ grup hep görünür */}
      <div className="absolute top-0 inset-x-0 z-[25] px-2 sm:px-3 flex items-start justify-between gap-1.5 pointer-events-none" style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}>
        <div className="pointer-events-auto min-w-0 flex-1 max-w-[62%] flex items-center gap-0.5 bg-white/90 backdrop-blur rounded-full p-1 shadow-lg border-2 border-white">
          <button onClick={() => goMap(-1)} disabled={mapIdx === 0} className="shrink-0 w-9 h-9 rounded-full text-2xl font-black text-slate-600 disabled:opacity-25 active:scale-90">‹</button>
          <div className="min-w-0 flex-1 px-0.5 text-center leading-tight" onClick={() => say(map?.name)}>
            <div className="text-[15px] font-extrabold text-slate-800 truncate">{map?.emoji} {map?.name || 'Harita'}</div>
            <div className="text-[11px] font-bold text-slate-500">harita {mapIdx + 1}/{Math.max(1, world.length)}</div>
          </div>
          <button onClick={() => goMap(1)} disabled={mapIdx >= world.length - 1} className="shrink-0 w-9 h-9 rounded-full text-2xl font-black text-slate-600 disabled:opacity-25 active:scale-90">
            {mapIdx < world.length - 1 && !world[mapIdx + 1]?.unlocked ? '🔒' : '›'}
          </button>
        </div>
        <div className="pointer-events-auto shrink-0 flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-yellow-300 border-4 border-white rounded-full pl-1 pr-2.5 py-0.5 shadow-lg">
            <StarShape size={24} /><span className="text-lg font-extrabold text-amber-900">{balance >= 999999 ? '∞' : balance}</span>
          </div>
          <button aria-label="menü" onClick={() => { sfx('tap'); setMenu(m => !m); }} className="shrink-0 w-11 h-11 rounded-full bg-white shadow-lg active:scale-90 border-2 border-white flex flex-col items-center justify-center gap-[4px]">
            {[0, 1, 2].map(i => <span key={i} className="block w-5 h-[3px] rounded-full bg-slate-700" />)}
          </button>
        </div>
      </div>

      {testMode && (
        <button onClick={() => onLogout?.()} className="absolute top-[70px] left-1/2 -translate-x-1/2 z-20 bg-indigo-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg border-2 border-white whitespace-nowrap">🛠 yönetici deneme modu · ∞ yıldız · panele dön</button>
      )}
      {menu && (
        <div className="absolute top-16 right-3 z-30 bg-white rounded-3xl shadow-2xl p-4 w-64 ca-pop">
          <div className="text-sm font-bold text-slate-500">oyuncu</div>
          <div className="text-xl font-extrabold text-slate-800">{child?.name}</div>
          <div className="mt-2 bg-indigo-50 rounded-2xl p-3 text-sm text-indigo-900 font-bold leading-relaxed">
            numaran: <span className="font-extrabold tracking-wider">{child?.childId}</span><br />
            {child?.pin ? <>şifren: <span className="font-extrabold tracking-wider">{child.pin}</span></> : <span className="text-indigo-500">şifre yok</span>}
            <div className="text-[11px] text-indigo-500 mt-1">başka telefondan "zaten üyeyim" ile bu bilgilerle girebilirsin.</div>
          </div>
          {child?.premium && <div className="mt-2 text-center text-sm font-extrabold text-amber-600">👑 premium üye</div>}
          <button onClick={() => { const m = !muted; setMuted(m); setMutedState(m); if (!m) sfx('tap'); }} className="mt-3 w-full py-2.5 rounded-2xl bg-slate-100 text-slate-600 font-extrabold">{muted ? '🔇 sesler kapalı' : '🔊 sesler açık'}</button>
          {testMode && onResetTest && <button onClick={() => { if (window.confirm('deneme ilerlemesi (çözülen testler, karakter, ev) sıfırlansın mı?')) { onResetTest(); setMenu(false); } }} className="mt-2 w-full py-2.5 rounded-2xl bg-amber-50 text-amber-700 font-extrabold">↺ deneme ilerlemesini sıfırla</button>}
          <button onClick={() => { setMenu(false); onLogout?.(); }} className={`mt-2 w-full py-2.5 rounded-2xl font-extrabold ${testMode ? 'bg-indigo-600 text-white' : 'bg-red-50 text-red-500'}`}>{testMode ? '🛠 yönetici paneline dön' : 'çıkış'}</button>
        </div>
      )}

      {/* HARİTA */}
      <div ref={scrollRef} className="absolute inset-0 overflow-y-auto overflow-x-hidden ca-scroll" onClick={() => menu && setMenu(false)}>
        <div className="relative mx-auto" style={{ width, height: H }}>
          <svg className="absolute inset-0" width={width} height={H} style={{ overflow: 'hidden' }}>
            {customBg
              ? <image href={customBg} x="0" y="0" width={width} height={H} preserveAspectRatio="xMidYMid slice" />
              : <Terrain art={art} W={width} H={H} pts={pts} seed={seed} />}
            <PathLayer art={art} pts={pts} openUpTo={openUpTo} />

            {/* haritanın sonu: sandık */}
            <g transform={`translate(${width / 2} ${TOP - 70})`}>
              <GoalChest open={map.allDone} />
            </g>

            {/* orman: yolu kapatan ağaçlar */}
            {crossing === 'chop' && islands.map((isl, i) => {
              if (i === 0) return null;
              const m = bezPoint(pts[i - 1], pts[i], 0.5);
              return <g key={`b${i}`} transform={`translate(${m.x} ${m.y + 14})`}><TreeBarrier state={barrierState(i)} flip={pts[i].x < pts[i - 1].x} /></g>;
            })}

            {/* adalar */}
            {islands.map((isl, i) => {
              const p = pts[i];
              const locked = isl.state === 'locked';
              return (
                <g key={isl.test.id} transform={`translate(${p.x} ${p.y})`}>
                <g className={wiggle === i ? 'ca-wiggle' : ''} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                  {map.islandImage
                    ? <image href={map.islandImage} x="-80" y="-90" width="160" height="130" preserveAspectRatio="xMidYMid meet" style={{ filter: locked ? 'grayscale(1)' : 'none' }} />
                    : (
                      <g>
                        {art === 'ocean' ? <IslandBase seed={seed + i * 7} />
                          : art === 'space' ? <PlanetBase seed={seed + i * 7} idx={i} />
                            : <ClearingBase seed={seed + i * 7}
                                fill={{ forest: '#a8d97a', desert: '#f9dc94', ice: '#ffffff', candy: '#fff0f6', dino: '#b5d77a' }[art]}
                                stroke={{ forest: '#6fae45', desert: '#d9a748', ice: '#93c5fd', candy: '#f472b6', dino: '#7c9a3e' }[art]} />}
                        <g transform={`translate(${art === 'space' ? 0 : -20} -4)`}><Landmark art={art} idx={i} /></g>
                      </g>
                    )}
                  {locked && <g transform="translate(0 -10)"><Mist /></g>}
                  {isl.state === 'current' && !travel && pendingIdx !== i && (
                    <ellipse cx="0" cy="6" rx="66" ry="30" fill="none" stroke="#fde047" strokeWidth="5" strokeDasharray="12 8" className="ca-selbox" />
                  )}
                </g>
                </g>
              );
            })}

            {/* okyanus: martılar */}
            {art === 'ocean' && [0.2, 0.55, 0.85].map((k, i) => (
              <g key={`g${i}`} transform={`translate(0 ${H * k})`}>
                <g className="ca-gull" style={{ animationDelay: `${-i * 7}s` }}>
                  <path d="M-12 0 Q-6 -8 0 0 Q6 -8 12 0" stroke={INK} strokeWidth="3" fill="none" className="ca-flap" />
                </g>
              </g>
            ))}
          </svg>

          {/* ada etiketleri ve dokunma alanları */}
          {islands.map((isl, i) => {
            const p = pts[i];
            const diff = DIFFICULTY_BY_ID[getTestDifficulty(isl.test, cfg)] || DIFFICULTY_BY_ID.easy;
            const isCurrent = isl.state === 'current';
            return (
              <div key={isl.test.id} className="absolute" style={{ left: p.x - 80, top: p.y - 100, width: 160, height: 150 }}>
                <button onClick={() => tapIsland(isl, i)} className="ca-island absolute inset-0" aria-label={isl.test.name} />
                <span className={`pointer-events-none absolute w-12 h-12 rounded-full border-[5px] flex items-center justify-center text-lg font-extrabold shadow-lg ${isl.state === 'done' ? 'bg-green-500 text-white' : isCurrent ? 'bg-orange-500 text-white ca-current-ring' : 'bg-slate-500 text-white'}`}
                  style={{ left: -4, top: 46, borderColor: diff.color }} title={diff.label}>
                  {isl.state === 'done' ? '✓' : isl.state === 'locked' ? '🔒' : i + 1}
                </span>
                <div className="pointer-events-none absolute text-center" style={{ top: 136, left: -8, width: 176 }}>
                  <div className={`inline-block max-w-full px-3 py-0.5 rounded-full text-[13px] font-extrabold shadow-md leading-tight line-clamp-2 border-2 ${isl.state === 'locked' ? 'bg-white/75 text-slate-500 border-white/60' : 'bg-white text-slate-800 border-white'}`}>{isl.test.name}</div>
                  {isl.state === 'done' && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(5, Math.max(1, isl.reward.perfect)) }).map((_, k, arr) => {
                        const filled = isl.status === 'perfect' || k < Math.round(arr.length * (isl.reward.completed / Math.max(1, isl.reward.perfect)));
                        return <StarShape key={k} size={18} filled={filled} />;
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* KARAKTER */}
          {charPos && (
            <div className="absolute pointer-events-none z-10" style={{ left: charPos.x - CHAR / 2, top: charPos.y - CHAR * 1.36, width: CHAR }}>
              {charMode === 'swim' ? (
                <div className="relative">
                  <div className="overflow-hidden ca-swimbob" style={{ height: CHAR * 0.86, transform: flip ? 'scaleX(-1)' : undefined }}>
                    <Avatar game={game} itemMap={itemMap} size={CHAR} />
                  </div>
                  <svg className="absolute left-1/2 -translate-x-1/2" style={{ top: CHAR * 0.74 }} width="120" height="40" viewBox="-60 -20 120 40">
                    <ellipse rx="40" ry="10" fill="#4fc3f7" stroke="#fff" strokeWidth="3" />
                    <ellipse rx="30" ry="8" fill="none" stroke="#fff" strokeWidth="2" className="ca-ripple" />
                    <ellipse rx="30" ry="8" fill="none" stroke="#fff" strokeWidth="2" className="ca-ripple" style={{ animationDelay: '.6s' }} />
                    {[-1, 1].map(s => <path key={s} d={`M${s * 30} -2 q${s * 6} -10 ${s * 12} -4`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" className="ca-flap" />)}
                  </svg>
                </div>
              ) : (
                <div className="relative" style={{ transform: charMode === 'slide' ? `rotate(${flip ? 10 : -10}deg)` : undefined }}>
                  {charMode === 'fly' && <div className="absolute left-1/2 -translate-x-1/2" style={{ top: CHAR * 0.62 }}><Jetpack /></div>}
                  <div className={charMode === 'walk' || charMode === 'hop' ? 'ca-walkbob' : charMode === 'rest' ? 'ca-bob' : ''} style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
                    <Avatar game={game} itemMap={itemMap} size={CHAR} />
                  </div>
                  {charMode === 'chop' && (
                    <>
                      <div className="absolute" style={{ top: CHAR * 0.42, [flip ? 'left' : 'right']: -26, transform: flip ? 'scaleX(-1)' : undefined }}><Axe /></div>
                      {[0, 1, 2].map(k => <span key={k} className="ca-chip absolute w-2.5 h-2 rounded-sm" style={{ background: '#e3b778', border: `1.5px solid ${INK}`, top: CHAR * 0.8, [flip ? 'left' : 'right']: -34, '--sx': `${(flip ? -1 : 1) * (14 + k * 10)}px`, '--sy': `${-20 - k * 8}px`, animationDelay: `${k * 0.18}s` }} />)}
                    </>
                  )}
                  {charMode === 'slide' && <svg className="absolute" style={{ bottom: -4, left: 0 }} width={CHAR} height="14"><path d={`M4 10 L${CHAR - 4} 10`} stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" /></svg>}
                </div>
              )}
            </div>
          )}

          {islands.length === 0 && (
            <div className="absolute inset-x-6 top-1/3 bg-white/90 rounded-3xl p-6 text-center shadow-xl">
              <div className="text-5xl">🏝️</div>
              <div className="text-xl font-extrabold text-slate-700 mt-2">yakında yeni adalar geliyor!</div>
            </div>
          )}

          {map.allDone && mapIdx < world.length - 1 && (
            <div className="absolute left-1/2 -translate-x-1/2 text-center z-10" style={{ top: TOP - 40 }}>
              <button onClick={() => goMap(1)} className="bg-amber-400 text-amber-950 font-extrabold px-5 py-3 rounded-2xl shadow-lg active:scale-95 border-4 border-white">sonraki harita ›</button>
            </div>
          )}
        </div>
      </div>

      <Particles kind={art === 'ocean' ? 'none' : map?.particle} seed={seed} count={12} />

      {/* ALT: KARAKTERİM / EVİM */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-3 flex items-end justify-between pointer-events-none">
        <div className="pointer-events-auto pl-10">
          {settings?.welcomeAudio && <FancyAudioPlayer src={settings.welcomeAudio} autoPlay={shouldAutoPlay} label="mesaj" color="orange" size="small" />}
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button onClick={() => { sfx('door'); onOpenStudio('house'); }} className="w-[74px] h-[74px] rounded-3xl bg-white border-4 border-amber-300 shadow-xl flex flex-col items-center justify-center active:scale-90">
            <svg width="40" height="34" viewBox="0 0 40 34"><path d="M6 16 L6 32 L34 32 L34 16" fill="#fde68a" stroke={INK} strokeWidth="2.5" /><path d="M2 18 L20 3 L38 18 Z" fill="#ef4444" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" /><rect x="16" y="20" width="8" height="12" fill="#7a4a24" stroke={INK} strokeWidth="2" /></svg>
            <span className="text-[11px] font-extrabold text-slate-600">evim</span>
          </button>
          <button onClick={() => { sfx('tap'); onOpenStudio('character'); }} className="w-[74px] h-[74px] rounded-3xl bg-white border-4 border-pink-300 shadow-xl flex flex-col items-center justify-center overflow-hidden active:scale-90">
            <div className="w-[60px] h-[52px]"><Avatar game={game} itemMap={itemMap} fluid view="20 -30 160 150" outline={false} /></div>
            <span className="text-[11px] font-extrabold text-slate-600 -mt-0.5">karakter</span>
          </button>
        </div>
      </div>

      {toast && <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/85 text-white font-extrabold px-4 py-2 rounded-2xl ca-pop whitespace-nowrap">{toast}</div>}

      {/* ADA KARTI */}
      {card && (
        <div className="absolute inset-0 z-50 bg-slate-900/50 flex items-end sm:items-center justify-center p-3" onClick={() => setCard(null)}>
          <div className="ca-pop bg-white w-full max-w-sm rounded-[2rem] p-6 pt-4 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <svg width="150" height="96" viewBox="-80 -90 160 110" className="mx-auto -mt-16" style={{ overflow: 'visible' }}>
              {art === 'ocean' ? <IslandBase seed={seed + card.index * 7} /> : art === 'space' ? <PlanetBase seed={seed + card.index * 7} idx={card.index} /> : <ClearingBase seed={seed + card.index * 7} />}
              <g transform="translate(-6 -6)"><Landmark art={art} idx={card.index} /></g>
            </svg>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-1">{map.name} · ada {card.index + 1}</div>
            <div className="text-2xl font-extrabold text-slate-800 leading-tight mt-1">{card.test.name}</div>
            {(() => {
              const diff = DIFFICULTY_BY_ID[getTestDifficulty(card.test, cfg)] || DIFFICULTY_BY_ID.easy;
              return (
                <div className="flex justify-center gap-2 mt-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-sm font-extrabold text-white" style={{ background: diff.color }}>{diff.label}</span>
                  <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-slate-100 text-slate-600">{card.test.questionIds?.length || 0} soru</span>
                </div>
              );
            })()}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className={`rounded-2xl p-2 border-2 ${card.status === 'perfect' ? 'bg-yellow-50 border-yellow-300' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-center gap-1 text-xl font-extrabold text-amber-600"><StarShape size={24} /> {card.reward.perfect}</div>
                <div className="text-[12px] font-bold text-slate-500">hepsi doğru</div>
              </div>
              <div className={`rounded-2xl p-2 border-2 ${card.status === 'completed' ? 'bg-yellow-50 border-yellow-300' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-center gap-1 text-xl font-extrabold text-amber-600"><StarShape size={24} /> {card.reward.completed}</div>
                <div className="text-[12px] font-bold text-slate-500">yanlışla bitirince</div>
              </div>
            </div>
            {card.status === 'perfect' && <div className="mt-3 text-sm font-bold text-green-600">bu adayı harika bitirdin! istersen tekrar oyna.</div>}
            {card.status === 'completed' && <div className="mt-3 text-sm font-extrabold text-amber-600">yanlışların vardı. hepsini doğru yaparsan {card.reward.perfect - card.reward.completed} yıldız daha kazanırsın!</div>}
            {loadError && <div className="mt-3 bg-red-50 border-2 border-red-200 text-red-600 font-bold text-sm rounded-2xl p-2">{loadError}</div>}
            <div className="flex gap-2 mt-5">
              <button onClick={() => setCard(null)} className="flex-1 py-4 rounded-2xl font-extrabold text-slate-500 bg-slate-100">geri</button>
              <button disabled={!!loadingTestId} onClick={() => { sfx('tap'); onPlayIsland(card.test); }} className="flex-[2] py-4 rounded-2xl font-extrabold text-white text-xl bg-gradient-to-b from-orange-400 to-orange-600 shadow-lg active:scale-95 disabled:opacity-60">
                {loadingTestId === card.test.id ? 'yükleniyor...' : card.status === 'completed' ? 'düzeltmeye git ↻' : card.state === 'done' ? 'tekrar oyna ▶' : 'başla ▶'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mapDone && (
        <Celebration kind="map_done" ev={mapDone.events.map_done} data={{ testName: map.name, starsGained: 0 }} game={game} itemMap={itemMap}
          onDone={() => { setMapDone(null); if (mapIdx < world.length - 1 && world[mapIdx + 1]?.unlocked) setMapIdx(mapIdx + 1); }} />
      )}
    </div>
  );
}
