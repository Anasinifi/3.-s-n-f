import React, { useState, useEffect, useRef } from 'react';
import { createSeededRng } from './shared';
import { EraserIcon } from '../components/common/Icons';

// ============================================================================
// --- GRUP: 14. ETKİLEŞİMLİ BİLEŞEN - SIRAYI TAKİP ET (YANIP SÖNEN KARELER) ---
// ============================================================================
// Kareler belirli bir sırayla yanıp söner, çocuk aynı sırayı dokunarak tekrarlar.
//  * Kolay: kareler yan yana sırayla (soldan sağa veya sağdan sola) 3 kez yanar
//  * Orta : sıra karışık, 4 kez yanar
//  * Zor  : sıra karışık, 5 kez yanar

export const SEQUENCE_SQUARE_COUNTS = [3, 4, 5, 6];
export const SEQUENCE_LEVELS = {
  easy: { label: 'Kolay', length: 3, onMs: 750, offMs: 350 },
  medium: { label: 'Orta', length: 4, onMs: 650, offMs: 300 },
  hard: { label: 'Zor', length: 5, onMs: 600, offMs: 260 }
};

// Her şablon farklı bir renk takımı kullanır (aynı sıra bile farklı görünür)
export const SEQUENCE_PALETTES = [
  ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'],
  ['#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#84cc16', '#ef4444'],
  ['#0ea5e9', '#f43f5e', '#10b981', '#8b5cf6', '#f97316', '#facc15'],
  ['#22c55e', '#e11d48', '#2563eb', '#d97706', '#c026d3', '#0891b2'],
  ['#f97316', '#7c3aed', '#16a34a', '#db2777', '#0284c7', '#ca8a04']
];

const isStrictlySequential = (seq) => {
  if (seq.length < 2) return true;
  const step = seq[1] - seq[0];
  if (Math.abs(step) !== 1) return false;
  for (let i = 2; i < seq.length; i++) if (seq[i] - seq[i - 1] !== step) return false;
  return true;
};

export const generateSequenceTemplates = (squareCount = 4, level = 'easy', count = 100) => {
  const cfg = SEQUENCE_LEVELS[level] || SEQUENCE_LEVELS.easy;
  const k = squareCount;
  const rng = createSeededRng(k * 1000 + (level === 'easy' ? 1 : level === 'medium' ? 2 : 3) * 77);
  const templates = [];
  const seen = new Set();

  // Kolay seviyedeki olası sıralar (ardışık kareler)
  const easySeqs = [];
  for (let s = 0; s + cfg.length <= k; s++) {
    const asc = Array.from({ length: cfg.length }, (_, i) => s + i);
    easySeqs.push(asc);
    easySeqs.push([...asc].reverse());
  }

  let guard = 0;
  while (templates.length < count && guard < count * 200) {
    guard++;
    let seq;
    if (level === 'easy') {
      seq = easySeqs[templates.length % easySeqs.length];
    } else {
      seq = [];
      while (seq.length < cfg.length) {
        const nxt = Math.floor(rng() * k);
        if (seq.length > 0 && seq[seq.length - 1] === nxt) continue; // aynı kare art arda yanmasın
        seq.push(nxt);
      }
      if (isStrictlySequential(seq)) continue;
      // Zor seviyede en az bir "atlama" (komşu olmayan kareye geçiş) olsun
      if (level === 'hard' && k > 3 && !seq.some((v, i) => i > 0 && Math.abs(v - seq[i - 1]) >= 2)) continue;
    }
    const paletteIdx = Math.floor(templates.length / Math.max(1, level === 'easy' ? easySeqs.length : 1)) % SEQUENCE_PALETTES.length;
    const sig = `${seq.join('')}-${paletteIdx}`;
    if (seen.has(sig) && guard < count * 150) continue;
    seen.add(sig);
    templates.push({
      id: templates.length + 1,
      squareCount: k,
      level,
      sequence: [...seq],
      colors: SEQUENCE_PALETTES[paletteIdx].slice(0, k),
      onMs: cfg.onMs,
      offMs: cfg.offMs
    });
  }
  return templates;
};

export const SEQUENCE_TEMPLATES = {};
SEQUENCE_SQUARE_COUNTS.forEach(k => {
  SEQUENCE_TEMPLATES[k] = {
    easy: generateSequenceTemplates(k, 'easy', 100),
    medium: generateSequenceTemplates(k, 'medium', 100),
    hard: generateSequenceTemplates(k, 'hard', 100)
  };
});

export const buildSequencePayload = (tpl = {}, extra = {}) => ({
  squareCount: Number(tpl.squareCount) || 4,
  level: tpl.level || 'easy',
  sequence: (tpl.sequence || []).map(Number),
  colors: (tpl.colors || SEQUENCE_PALETTES[0]).slice(0, Number(tpl.squareCount) || 4),
  onMs: Number(tpl.onMs) || 700,
  offMs: Number(tpl.offMs) || 320,
  allowReplay: extra.allowReplay !== undefined ? Boolean(extra.allowReplay) : (tpl.allowReplay !== false)
});

export const checkSequenceAnswer = (seqData = {}, studentSequence = []) => {
  const target = (seqData.sequence || []).map(Number);
  if (!Array.isArray(studentSequence) || studentSequence.length !== target.length) return false;
  return target.every((v, i) => Number(studentSequence[i]) === v);
};

const lighten = (hex, amt = 0.55) => {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
  const r = (num >> 16) & 255; const g = (num >> 8) & 255; const b = num & 255;
  const mix = (v) => Math.round(v + (255 - v) * amt);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
};

export const generateSequenceSvgDataUrl = (seqData = {}) => {
  const k = Number(seqData.squareCount) || 4;
  const colors = seqData.colors || SEQUENCE_PALETTES[0];
  const seq = seqData.sequence || [];
  const W = 240;
  const cols = k === 6 ? 3 : k;
  const rows = k === 6 ? 2 : 1;
  const sq = Math.min(54, (W - 30) / cols - 8);
  const gridW = cols * (sq + 8) - 8;
  const startX = (W - gridW) / 2;
  const startY = rows === 2 ? 30 : 60;
  let out = '';
  for (let i = 0; i < k; i++) {
    const cx = startX + (i % cols) * (sq + 8);
    const cy = startY + Math.floor(i / cols) * (sq + 8);
    out += `<rect x="${cx}" y="${cy}" width="${sq}" height="${sq}" rx="10" fill="${lighten(colors[i] || '#94a3b8', 0.5)}" stroke="#1e293b" stroke-width="2.5"/>`;
  }
  // Alt satır: yanma sırası (renkli noktalar ve oklar)
  const dotY = 200;
  const step = Math.min(40, (W - 30) / Math.max(1, seq.length));
  const dotsW = step * (seq.length - 1);
  seq.forEach((v, i) => {
    const x = W / 2 - dotsW / 2 + i * step;
    out += `<circle cx="${x}" cy="${dotY}" r="12" fill="${colors[v] || '#94a3b8'}" stroke="#1e293b" stroke-width="2"/><text x="${x}" y="${dotY + 5}" font-size="13" font-family="sans-serif" font-weight="900" fill="#fff" text-anchor="middle">${i + 1}</text>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}"><rect width="100%" height="100%" rx="20" fill="#ffffff" stroke="#1e293b" stroke-width="4"/><text x="${W / 2}" y="${rows === 2 ? 20 : 40}" font-size="13" font-family="sans-serif" font-weight="900" fill="#475569" text-anchor="middle">SIRAYI TAKİP ET (${seq.length} kez)</text>${out}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const SequenceMemoryPad = ({
  seqData = {},
  studentSequence = [],
  onChangeStudentSequence,
  readOnly = false,
  autoPlay = true,
  showAnswerKey = false,
  title = "",
  status = null,
  size = 320
}) => {
  const k = Number(seqData.squareCount) || 4;
  const colors = seqData.colors || SEQUENCE_PALETTES[0];
  const sequence = (seqData.sequence || []).map(Number);
  const onMs = Number(seqData.onMs) || 700;
  const offMs = Number(seqData.offMs) || 320;
  const allowReplay = seqData.allowReplay !== false;

  const [litIndex, setLitIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = () => { timersRef.current.forEach(t => clearTimeout(t)); timersRef.current = []; };

  const playSequence = (initialDelay = 600) => {
    clearTimers();
    setIsPlaying(true);
    setLitIndex(null);
    let t = initialDelay;
    sequence.forEach((sqIdx) => {
      timersRef.current.push(setTimeout(() => setLitIndex(sqIdx), t));
      t += onMs;
      timersRef.current.push(setTimeout(() => setLitIndex(null), t));
      t += offMs;
    });
    timersRef.current.push(setTimeout(() => { setIsPlaying(false); setHasWatched(true); }, t));
  };

  useEffect(() => {
    if (autoPlay && !readOnly) playSequence(800);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqData && sequence.join(','), k, autoPlay, readOnly]);

  const handleTap = (i) => {
    if (readOnly || isPlaying || !onChangeStudentSequence) return;
    if (studentSequence.length >= sequence.length) return;
    clearTimers();
    setLitIndex(i);
    timersRef.current.push(setTimeout(() => setLitIndex(null), 260));
    onChangeStudentSequence([...studentSequence, i]);
  };

  const handleReplay = () => {
    if (readOnly || isPlaying) return;
    if (onChangeStudentSequence) onChangeStudentSequence([]);
    playSequence(300);
  };

  let borderClass = "border-slate-800 bg-white";
  if (status === 'correct') borderClass = "border-green-600 bg-green-50/40 ring-4 ring-green-200";
  else if (status === 'wrong') borderClass = "border-red-600 bg-red-50/40 ring-4 ring-red-200";

  const cols = k === 6 ? 3 : k;
  const boxW = `min(${size}px, 92vw)`;

  return (
    <div className="flex flex-col items-center select-none w-full gap-2">
      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-800 px-2.5 py-0.5 bg-fuchsia-50 border border-fuchsia-200 rounded-full text-center">
          {title}
        </span>
      )}

      {!readOnly && (
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border ${isPlaying ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {isPlaying ? '👀 dikkatle izle...' : hasWatched || !autoPlay ? '👆 şimdi sen dokun' : 'hazırlan...'}
          </div>
          {allowReplay && (
            <button type="button" onClick={handleReplay} disabled={isPlaying} className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-300 text-[10px] font-black text-indigo-700 disabled:opacity-40">
              ▶ tekrar izle
            </button>
          )}
          <button
            type="button"
            onClick={() => onChangeStudentSequence && onChangeStudentSequence([])}
            disabled={isPlaying || studentSequence.length === 0}
            className="p-1 rounded-xl bg-pink-50 border border-pink-300 disabled:opacity-40"
            title="Temizle"
          >
            <EraserIcon size={18} />
          </button>
        </div>
      )}

      <div className={`rounded-3xl border-2 shadow-inner p-3 sm:p-4 transition-all ${borderClass}`} style={{ width: boxW }}>
        <div className="grid gap-2.5 sm:gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: k }).map((_, i) => {
            const base = colors[i] || '#94a3b8';
            const isLit = litIndex === i;
            return (
              <button
                key={i}
                type="button"
                onPointerDown={(e) => { e.preventDefault(); handleTap(i); }}
                disabled={readOnly}
                className="aspect-square rounded-2xl border-4 transition-all duration-150"
                style={{
                  backgroundColor: isLit ? base : lighten(base, 0.62),
                  borderColor: isLit ? '#ffffff' : '#1e293b',
                  transform: isLit ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isLit ? `0 0 0 4px ${base}, 0 0 28px 8px ${base}` : '0 2px 0 rgba(15,23,42,0.35)',
                  cursor: readOnly || isPlaying ? 'default' : 'pointer'
                }}
                aria-label={`kare ${i + 1}`}
              />
            );
          })}
        </div>

        {/* Çocuğun dokunduğu sıra */}
        <div className="flex items-center justify-center gap-1.5 mt-3 min-h-[28px]">
          {sequence.map((_, i) => {
            const val = studentSequence[i];
            const filled = val !== undefined;
            return (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: filled ? (colors[val] || '#94a3b8') : '#ffffff' }}
              >
                {filled ? i + 1 : ''}
              </div>
            );
          })}
        </div>

        {(showAnswerKey || (readOnly && status)) && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="text-[9px] font-black uppercase text-slate-500 mr-1">doğru sıra:</span>
            {sequence.map((v, i) => (
              <div key={i} className="w-5 h-5 rounded-md border-2 border-slate-700 flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: colors[v] || '#94a3b8' }}>
                {i + 1}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
