import React, { useRef, useState, useId } from 'react';
import { sfx, say } from './fx';

// ============================================================================
// --- GRUP: ELLE BOYAMA (araç, evin dışı, oda) ---
// ============================================================================
// * Her boyama oturumu 1 "boyama hakkı" harcar. Hak yoksa yıldızla alınır (varsayılan 5 yıldız).
// * Fırça izleri game.paints[anahtar] içinde saklanır: [{ d, c, w }]
//   anahtar: 'veh_<id>' | 'house_<id>' | 'room_<oda>'
// * Araç ve ev boyamasında boya sadece nesnenin üstüne gelir (dışarı taşmaz).

export const PAINT_COLORS = ['#ef4444', '#f97316', '#facc15', '#a3e635', '#22c55e', '#14b8a6', '#38bdf8', '#3b82f6', '#8b5cf6', '#ec4899', '#f9a8d4', '#ffffff', '#9ca3af', '#111827', '#92400e', '#fde68a'];
export const PAINT_SIZES = [[4, 'ince'], [9, 'orta'], [18, 'kalın']];
export const MAX_STROKES = 100;

export function Strokes({ strokes }) {
  return (strokes || []).map((s, i) => (
    <path key={i} d={s.d} stroke={s.c} strokeWidth={s.w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={s.c === 'erase' ? 0 : 0.9} />
  ));
}

// Boyayı sadece "art" çiziminin üstünde gösterir (maske)
export function PaintedLayer({ strokes, children }) {
  const uid = `pl${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const has = strokes && strokes.length > 0;
  return (
    <g>
      {children}
      {has && (
        <g pointerEvents="none">
          <defs>
            <filter id={`${uid}w`}><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" /></filter>
            <mask id={`${uid}m`} maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="7000"><g filter={`url(#${uid}w)`}>{children}</g></mask>
          </defs>
          <g mask={`url(#${uid}m)`}><Strokes strokes={strokes} /></g>
        </g>
      )}
    </g>
  );
}

// Parmakla çizim alanı (hedef svg'nin içine konur)
export function PaintCapture({ svgRef, area, color, width, onStroke }) {
  const [live, setLive] = useState(null);
  const pts = useRef([]);
  const toSvg = (e) => {
    const svg = svgRef.current; if (!svg) return null;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10];
  };
  const path = (arr) => arr.length === 1 ? `M${arr[0][0]} ${arr[0][1]} l0.1 0` : `M${arr.map(p => p.join(' ')).join(' L')}`;
  const down = (e) => {
    e.preventDefault(); e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = toSvg(e); if (!p) return;
    pts.current = [p];
    setLive(path(pts.current));
  };
  const move = (e) => {
    if (!pts.current.length) return;
    const p = toSvg(e); if (!p) return;
    const last = pts.current[pts.current.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 2.5) return;
    if (pts.current.length > 90) return;
    pts.current.push(p);
    setLive(path(pts.current));
  };
  const up = () => {
    if (pts.current.length) { onStroke({ d: path(pts.current), c: color, w: width }); sfx('place'); }
    pts.current = []; setLive(null);
  };
  return (
    <g>
      {live && <path d={live} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" pointerEvents="none" />}
      <rect x={area.x} y={area.y} width={area.w} height={area.h} fill="transparent" style={{ cursor: 'crosshair', touchAction: 'none' }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
    </g>
  );
}

// Alt çubuk: renkler, fırça kalınlığı, geri al, temizle, bitti
export function PaintBar({ color, setColor, width, setWidth, onUndo, onClear, onDone, count }) {
  return (
    <div className="w-full bg-white/95 rounded-3xl shadow-xl p-2 space-y-2">
      <div className="flex flex-wrap justify-center gap-1.5">
        {PAINT_COLORS.map(c => (
          <button key={c} onClick={() => { sfx('tap'); setColor(c); }} className={`w-9 h-9 rounded-full border-4 shadow ${color === c ? 'border-indigo-500 scale-110' : 'border-white'}`} style={{ background: c }} aria-label={c} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-1.5">
        {PAINT_SIZES.map(([w, l]) => (
          <button key={w} onClick={() => { say(l); setWidth(w); }} className={`h-11 px-3 rounded-2xl font-extrabold text-sm flex items-center gap-1.5 ${width === w ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <span className="rounded-full bg-current inline-block" style={{ width: Math.max(4, w * 0.8), height: Math.max(4, w * 0.8) }} /> {l}
          </button>
        ))}
        <button onClick={() => { say('geri al'); onUndo(); }} className="h-11 px-3 rounded-2xl font-extrabold text-sm bg-amber-100 text-amber-700">↶ geri al</button>
        <button onClick={() => { if (window.confirm('bu boyamanın hepsi silinsin mi?')) onClear(); }} className="h-11 px-3 rounded-2xl font-extrabold text-sm bg-rose-100 text-rose-600">🧽 temizle</button>
        <button onClick={() => { say('bitti'); onDone(); }} className="h-11 px-4 rounded-2xl font-extrabold text-sm bg-green-500 text-white">✓ bitti</button>
      </div>
      {count >= MAX_STROKES && <div className="text-center text-xs font-bold text-rose-500">çok fazla çizgi oldu, biraz temizle</div>}
    </div>
  );
}

// "Boyamaya başla" onayı
export function PaintConfirm({ price, tokens, balance, onYes, onNo }) {
  const free = tokens > 0;
  const can = free || balance >= price;
  return (
    <div className="ca-game fixed inset-0 z-[140] bg-slate-900/60 flex items-center justify-center p-4" onClick={onNo}>
      <div className="ca-pop bg-white rounded-[2rem] p-6 w-full max-w-sm text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-6xl">🖌️</div>
        <div className="text-2xl font-extrabold text-slate-800 mt-1">kendin boya!</div>
        <div className="text-base font-bold text-slate-500 mt-1">
          {free ? <>bir boyama hakkın var. kullanmak ister misin? <b>({tokens} hak)</b></> : <>bir boyama hakkı <b className="text-amber-600">⭐ {price}</b> yıldız.</>}
        </div>
        {!can && <div className="mt-2 text-sm font-extrabold text-rose-500">{price - balance} yıldız daha topla!</div>}
        <div className="flex gap-2 mt-5">
          <button onClick={onNo} className="flex-1 py-4 rounded-2xl bg-slate-100 font-extrabold text-slate-500">vazgeç</button>
          <button disabled={!can} onClick={onYes} className="flex-[1.5] py-4 rounded-2xl bg-gradient-to-b from-pink-400 to-pink-600 text-white font-extrabold text-lg disabled:opacity-40">{free ? 'boyamaya başla' : `⭐${price} ile başla`}</button>
        </div>
      </div>
    </div>
  );
}
