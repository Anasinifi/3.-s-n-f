import React, { useRef, useState } from 'react';
import { createSeededRng } from './shared';
import { EraserIcon } from '../components/common/Icons';

// ============================================================================
// --- GRUP: 10. ETKİLEŞİMLİ BİLEŞEN - SIRALI ÇİZGİ (RENK SIRASINA GÖRE BİRLEŞTİRME) ---
// ============================================================================
// YENİ SİSTEM:
//  * Üstte sıra şeridi: hangi renkten hangisine gidileceği oklarla gösterilir.
//  * Altta (çizim alanında) şekillerde SAYI YOKTUR, sadece renk vardır.
//  * Daire yerine yıldız, kare, üçgen, kalp, baklava, altıgen, beşgen kullanılır.
//  * Orta: 5 şekil, konumları karışık ama çizgiler kesişmez.
//  * Zor : 6 şekil, konumlar tamamen karışık, çizgiler birbirini keser.
// Eski kayıtlı sorular (level alanı olmayan) eski görünümle (sayılı daireler) çalışır.

export const NUMBER_NODE_COLORS = ['#ef4444', '#f59e0b', '#38bdf8', '#8b5cf6', '#84cc16', '#ec4899'];
export const CONNECT_COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#0ea5e9', '#a855f7', '#ec4899', '#78350f'];
export const CONNECT_SHAPES = ['star', 'square', 'triangle', 'heart', 'diamond', 'hexagon', 'pentagon'];
export const CONNECT_SHAPE_LABELS = { star: 'Yıldız', square: 'Kare', triangle: 'Üçgen', heart: 'Kalp', diamond: 'Baklava', hexagon: 'Altıgen', pentagon: 'Beşgen', circle: 'Daire' };

const segIntersect = (a, b, c, d) => {
  const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = cross(c, d, a); const d2 = cross(c, d, b);
  const d3 = cross(a, b, c); const d4 = cross(a, b, d);
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
};

const countCrossings = (nodes) => {
  let cnt = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let j = i + 2; j < nodes.length - 1; j++) {
      if (segIntersect(nodes[i], nodes[i + 1], nodes[j], nodes[j + 1])) cnt++;
    }
  }
  return cnt;
};

const isMonotonic = (nodes, axis) => {
  let inc = true; let dec = true;
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i][axis] < nodes[i - 1][axis]) inc = false;
    if (nodes[i][axis] > nodes[i - 1][axis]) dec = false;
  }
  return inc || dec;
};

export const generateConnectTemplatesForLevel = (level = 'medium', count = 100) => {
  const rng = createSeededRng(level === 'medium' ? 13579246 : 24681357);
  const nodeCount = level === 'medium' ? 5 : 6;
  const templates = [];
  const seen = new Set();
  // 3x3 yerleşim yuvaları (çizim alanı 300x300, üst kısım 0-300)
  const slots = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) slots.push({ x: 55 + c * 95, y: 55 + r * 95 });

  let guard = 0;
  while (templates.length < count && guard < count * 400) {
    guard++;
    const shuffledSlots = [...slots].sort(() => rng() - 0.5).slice(0, nodeCount);
    const pts = shuffledSlots.map(s => ({
      x: Math.round(s.x + (rng() - 0.5) * 34),
      y: Math.round(s.y + (rng() - 0.5) * 34)
    }));
    const crossings = countCrossings(pts);
    if (level === 'medium') {
      if (crossings > 0) continue;
      if (isMonotonic(pts, 'y') || isMonotonic(pts, 'x')) continue;
    } else {
      if (crossings < 1) continue;
      let longJumps = 0;
      for (let i = 1; i < pts.length; i++) if (Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) > 150) longJumps++;
      if (longJumps < 2) continue;
    }
    const sig = pts.map(p => `${Math.round(p.x / 30)},${Math.round(p.y / 30)}`).join('|');
    if (seen.has(sig)) continue;
    seen.add(sig);

    const shape = CONNECT_SHAPES[templates.length % CONNECT_SHAPES.length];
    const colors = [...CONNECT_COLORS].sort(() => rng() - 0.5).slice(0, nodeCount);
    templates.push({
      id: templates.length + 1,
      level,
      shape,
      hideNumbers: true,
      nodes: pts.map((p, i) => ({ num: i + 1, x: p.x, y: p.y, color: colors[i] }))
    });
  }
  return templates;
};

export const NUMBER_CONNECT_TEMPLATES = {
  medium: generateConnectTemplatesForLevel('medium', 100),
  hard: generateConnectTemplatesForLevel('hard', 100)
};

const isNewConnectData = (d = {}) => Boolean(d.level || d.hideNumbers || d.shape);

// Şekil çizim yolu (merkez cx,cy ve yarıçap r için)
export const connectShapePath = (shape, cx, cy, r) => {
  const polygon = (sides, rot = -Math.PI / 2, rr = r) => {
    const pts = [];
    for (let i = 0; i < sides; i++) {
      const a = rot + (i * 2 * Math.PI) / sides;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
    }
    return `M${pts.join(' L')} Z`;
  };
  if (shape === 'square') return `M${cx - r * 0.85},${cy - r * 0.85} L${cx + r * 0.85},${cy - r * 0.85} L${cx + r * 0.85},${cy + r * 0.85} L${cx - r * 0.85},${cy + r * 0.85} Z`;
  if (shape === 'triangle') return polygon(3, -Math.PI / 2, r * 1.15);
  if (shape === 'diamond') return polygon(4, -Math.PI / 2, r * 1.1);
  if (shape === 'hexagon') return polygon(6, 0, r);
  if (shape === 'pentagon') return polygon(5, -Math.PI / 2, r * 1.05);
  if (shape === 'heart') {
    const s = r / 20;
    return `M${cx},${cy + 18 * s} C${cx - 24 * s},${cy + 2 * s} ${cx - 22 * s},${cy - 20 * s} ${cx - 10 * s},${cy - 18 * s} C${cx - 4 * s},${cy - 17 * s} ${cx},${cy - 11 * s} ${cx},${cy - 11 * s} C${cx},${cy - 11 * s} ${cx + 4 * s},${cy - 17 * s} ${cx + 10 * s},${cy - 18 * s} C${cx + 22 * s},${cy - 20 * s} ${cx + 24 * s},${cy + 2 * s} ${cx},${cy + 18 * s} Z`;
  }
  if (shape === 'star') {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? r * 1.2 : r * 0.52;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
    }
    return `M${pts.join(' L')} Z`;
  }
  return `M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0 Z`;
};

export const generateNumberConnectSvgDataUrl = (ncData = {}) => {
  const nodes = ncData.nodes || NUMBER_CONNECT_TEMPLATES.medium[0].nodes;
  if (!isNewConnectData(ncData)) {
    let lines = '';
    for (let i = 0; i < nodes.length - 1; i++) lines += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[i + 1].x}" y2="${nodes[i + 1].y}" stroke="#1e293b" stroke-width="5" />`;
    let circles = '';
    nodes.forEach((nd) => { circles += `<circle cx="${nd.x}" cy="${nd.y}" r="18" fill="${nd.color}" /><text x="${nd.x}" y="${nd.y + 6}" font-size="18" font-family="sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">${nd.num}</text>`; });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="240" height="240"><rect width="100%" height="100%" rx="24" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>${lines}${circles}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  const shape = ncData.shape || 'star';
  // Üst şerit (sıra)
  let legend = '';
  const step = 280 / nodes.length;
  nodes.forEach((nd, i) => {
    const x = 10 + step * (i + 0.5);
    legend += `<path d="${connectShapePath(shape, x, 34, 15)}" fill="${nd.color}" stroke="#1e293b" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (i < nodes.length - 1) legend += `<text x="${x + step / 2}" y="40" font-size="16" font-weight="900" fill="#334155" text-anchor="middle">›</text>`;
  });
  let board = '';
  nodes.forEach((nd) => {
    board += `<path d="${connectShapePath(shape, nd.x, nd.y, 19)}" fill="${nd.color}" stroke="#1e293b" stroke-width="3" stroke-linejoin="round"/>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" width="240" height="304"><rect width="100%" height="100%" rx="24" fill="#ffffff" stroke="#1e293b" stroke-width="4"/><rect x="8" y="8" width="284" height="56" rx="14" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>${legend}<g transform="translate(0,74)">${board}</g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const checkNumberConnectAnswer = (ncData = {}, studentConnections = []) => {
  const nodes = ncData.nodes || [];
  if (!Array.isArray(studentConnections) || studentConnections.length !== nodes.length - 1) return false;
  for (let i = 0; i < nodes.length - 1; i++) {
    if (studentConnections[i] !== `${i + 1}-${i + 2}`) return false;
  }
  return true;
};

export const NumberConnectPad = ({
  connectData = {},
  studentConnections = [],
  onChangeStudentConnections,
  readOnly = false,
  showSolution = false,
  size = 250,
  title = "",
  status = null
}) => {
  const svgRef = useRef(null);
  const nodes = connectData.nodes || NUMBER_CONNECT_TEMPLATES.medium[0].nodes;
  const isNew = isNewConnectData(connectData);
  const shape = isNew ? (connectData.shape || 'star') : 'circle';
  const [activeFrom, setActiveFrom] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState(null);
  const connsRef = useRef(studentConnections);
  connsRef.current = studentConnections;

  const displayConnections = showSolution
    ? nodes.slice(0, -1).map((nd, i) => `${nd.num}-${nodes[i + 1].num}`)
    : studentConnections;

  const usedNums = new Set();
  displayConnections.forEach(cn => cn.split('-').forEach(n => usedNums.add(Number(n))));
  const chainEnd = studentConnections.length > 0 ? Number(studentConnections[studentConnections.length - 1].split('-')[1]) : null;

  const getSvgPt = (clientX, clientY) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return { x: ((clientX - rect.left) * 300) / rect.width, y: ((clientY - rect.top) * 300) / rect.height };
  };

  const connectTo = (fromNum, toNum) => {
    const current = connsRef.current;
    const used = new Set();
    current.forEach(cn => cn.split('-').forEach(n => used.add(Number(n))));
    if (fromNum === toNum || used.has(toNum)) return false;
    const next = [...current, `${fromNum}-${toNum}`];
    connsRef.current = next;
    onChangeStudentConnections(next);
    return true;
  };

  const handleNodeDown = (num) => {
    if (readOnly || !onChangeStudentConnections) return;
    const current = connsRef.current;
    const end = current.length > 0 ? Number(current[current.length - 1].split('-')[1]) : null;
    if (current.length === 0) {
      if (activeFrom !== null && activeFrom !== num) {
        if (connectTo(activeFrom, num)) setActiveFrom(num);
      } else {
        setActiveFrom(num);
      }
    } else if (num === end) {
      setActiveFrom(num);
    } else if (activeFrom !== null) {
      if (connectTo(activeFrom, num)) setActiveFrom(num);
    }
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (readOnly || !isDragging || activeFrom === null) return;
    const pt = getSvgPt(e.clientX, e.clientY);
    setPointerPos(pt);
    if (!pt) return;
    const hit = nodes.find(n => n.num !== activeFrom && Math.hypot(pt.x - n.x, pt.y - n.y) <= 24);
    if (hit && connectTo(activeFrom, hit.num)) setActiveFrom(hit.num);
  };

  const endDrag = () => { setIsDragging(false); setPointerPos(null); };

  const handleUndo = () => {
    if (readOnly || !onChangeStudentConnections) return;
    const current = connsRef.current;
    if (current.length === 0) { setActiveFrom(null); return; }
    const next = current.slice(0, -1);
    connsRef.current = next;
    onChangeStudentConnections(next);
    setActiveFrom(next.length > 0 ? Number(next[next.length - 1].split('-')[1]) : Number(current[0].split('-')[0]));
  };

  let borderClass = "border-slate-800 bg-white";
  if (status === 'correct') borderClass = "border-green-600 bg-green-50/30 ring-4 ring-green-200";
  else if (status === 'wrong') borderClass = "border-red-600 bg-red-50/30 ring-4 ring-red-200";

  const activeNode = activeFrom !== null ? nodes.find(n => n.num === activeFrom) : null;
  const lineColor = status === 'correct' ? '#16a34a' : status === 'wrong' ? '#dc2626' : '#1e293b';

  return (
    <div className="flex flex-col items-center select-none w-full gap-2">
      {/* SIRA ŞERİDİ */}
      <div className="flex items-center justify-center gap-1 bg-white px-3 py-1.5 rounded-2xl border-2 border-slate-300 shadow-sm flex-wrap">
        {nodes.map((nd, i) => (
          <React.Fragment key={nd.num}>
            <div className="flex flex-col items-center">
              {isNew ? (
                <svg width="34" height="34" viewBox="0 0 40 40"><path d={connectShapePath(shape, 20, 20, 15)} fill={nd.color} stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" /></svg>
              ) : (
                <div style={{ backgroundColor: nd.color }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm">{nd.num}</div>
              )}
            </div>
            {i < nodes.length - 1 && <span className="text-slate-500 font-black text-lg leading-none">➜</span>}
          </React.Fragment>
        ))}
        {!readOnly && (
          <>
            <button type="button" onClick={handleUndo} className="ml-1 px-2 h-8 rounded-xl bg-slate-100 border border-slate-300 text-[10px] font-black text-slate-700" title="Son çizgiyi geri al">↶</button>
            <button
              type="button"
              onClick={() => { connsRef.current = []; onChangeStudentConnections && onChangeStudentConnections([]); setActiveFrom(null); }}
              className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-300 flex items-center justify-center"
              title="Çizgileri Temizle"
            >
              <EraserIcon size={18} />
            </button>
          </>
        )}
      </div>

      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-center">{title}</span>
      )}

      <div className={`relative rounded-2xl border-2 shadow-inner overflow-hidden ${borderClass}`} style={{ width: size, height: size, maxWidth: '88vw', maxHeight: '88vw' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 300 300"
          className="w-full h-full touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {displayConnections.map((conn, idx) => {
            const [n1, n2] = conn.split('-').map(Number);
            const p1 = nodes.find(n => n.num === n1);
            const p2 = nodes.find(n => n.num === n2);
            if (!p1 || !p2) return null;
            return <line key={idx} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={lineColor} strokeWidth="6" strokeLinecap="round" />;
          })}

          {isDragging && activeNode && pointerPos && !readOnly && (
            <line x1={activeNode.x} y1={activeNode.y} x2={pointerPos.x} y2={pointerPos.y} stroke="#6366f1" strokeWidth="4" strokeDasharray="6 6" />
          )}

          {nodes.map((nd) => {
            const isActive = !readOnly && activeFrom === nd.num;
            const isUsed = usedNums.has(nd.num);
            return (
              <g
                key={nd.num}
                onPointerDown={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  if (e.target.releasePointerCapture && e.pointerId !== undefined) {
                    try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
                  }
                  handleNodeDown(nd.num);
                }}
                className={readOnly ? "" : "cursor-pointer"}
              >
                <circle cx={nd.x} cy={nd.y} r="30" fill="transparent" />
                {isActive && <circle cx={nd.x} cy={nd.y} r="28" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="5 4" />}
                <path
                  d={connectShapePath(shape, nd.x, nd.y, isNew ? 20 : 20)}
                  fill={nd.color}
                  stroke={isUsed ? '#1e293b' : '#ffffff'}
                  strokeWidth={isNew ? 3.5 : 3}
                  strokeLinejoin="round"
                />
                {!isNew && (
                  <text x={nd.x} y={nd.y + 7} fontSize="20" fontWeight="900" fill="#ffffff" textAnchor="middle" pointerEvents="none">{nd.num}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {chainEnd === null && activeFrom === null && !readOnly && (
        <span className="text-[10px] font-bold text-slate-400">şeritteki ilk şekilden başla, parmağını sırayla diğerlerine götür</span>
      )}
    </div>
  );
};
