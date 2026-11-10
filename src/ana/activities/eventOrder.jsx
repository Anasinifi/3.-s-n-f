import React from 'react';
import { RotateCcw } from 'lucide-react';

// ============================================================================
// --- ETKİLEŞİMLİ: OLAY SIRALAMA ---
// ============================================================================
// Soru verisi (q.eventOrderGrid):
//   { items: [görsel, görsel, ...]  -> DOĞRU sırada (1., 2., 3. ...)
//     order: [2, 0, 1, ...]         -> ekranda gösterilen sıra (items içindeki indeksler)
//     level: 'easy' | 'medium' | 'hard', title?: 'Tohumdan çiçeğe' }
// Çocuk resimlere sırayla dokunur; her dokunuşta resmin üstüne 1, 2, 3 ... yazılır.
// Cevap: dokunulan ekran kutularının listesi (order indeksleri).
// Bu dosya öğrenci uygulamasında da vardır: içerik üretimi yönetici tarafındadır.

export const checkEventOrderAnswer = (grid, picked) => {
  const items = grid?.items || [];
  const order = grid?.order || items.map((_, i) => i);
  if (!Array.isArray(picked) || picked.length !== items.length) return false;
  return picked.every((boxIdx, k) => order[boxIdx] === k);
};

// Yönetici listesinde küçük önizleme: resimler doğru sırada, aralarında ok
export const generateEventOrderSvgDataUrl = (grid) => {
  const items = grid?.items || [];
  const n = items.length || 1; const cell = 90, gap = 22;
  const W = n * cell + (n - 1) * gap + 20, H = cell + 20;
  let s = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>`;
  items.forEach((img, i) => {
    const x = 10 + i * (cell + gap);
    s += `<image href="${String(img).replace(/"/g, '&quot;')}" x="${x}" y="10" width="${cell}" height="${cell}"/>`;
    if (i < n - 1) s += `<path d="M${x + cell + 4},${H / 2} L${x + cell + gap - 4},${H / 2}" stroke="#64748b" stroke-width="3" stroke-linecap="round"/><path d="M${x + cell + gap - 9},${H / 2 - 5} L${x + cell + gap - 3},${H / 2} L${x + cell + gap - 9},${H / 2 + 5}" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">${s}</svg>`)}`;
};

export function EventOrderPad({ grid, picked = [], onChange, readOnly = false, status = null, showAnswer = false, title = '' }) {
  const items = grid?.items || [];
  const order = grid?.order || items.map((_, i) => i);
  const n = items.length;
  const tap = (boxIdx) => {
    if (readOnly) return;
    const at = picked.indexOf(boxIdx);
    if (at >= 0) onChange(picked.slice(0, at)); // numaralı resme dokunursa o ve sonrası silinir
    else if (picked.length < n) onChange([...picked, boxIdx]);
  };
  const cols = n <= 3 ? 3 : n === 4 ? 4 : n <= 6 ? 3 : 4;
  return (
    <div className="w-full flex flex-col items-center gap-2">
      {title && <div className="text-[11px] font-black text-slate-500 uppercase text-center">{title}</div>}
      <div className="grid gap-2 sm:gap-3 w-full max-w-xl" style={{ gridTemplateColumns: `repeat(${Math.min(cols, n)}, minmax(0, 1fr))` }}>
        {order.map((itemIdx, boxIdx) => {
          const pos = picked.indexOf(boxIdx);
          const right = showAnswer ? itemIdx + 1 : null;
          const isWrongSpot = status && pos >= 0 && order[boxIdx] !== pos;
          return (
            <button key={boxIdx} type="button" disabled={readOnly} onClick={() => tap(boxIdx)}
              className={`relative aspect-square rounded-2xl border-4 bg-white shadow-sm transition-all active:scale-95 overflow-hidden ${
                pos >= 0 ? (status === 'correct' ? 'border-green-500' : isWrongSpot ? 'border-red-500' : 'border-indigo-500') : 'border-slate-200 hover:border-indigo-300'}`}>
              <img src={items[itemIdx]} draggable="false" className="w-full h-full object-contain pointer-events-none select-none" alt="" />
              {pos >= 0 && (
                <span className={`absolute top-1 left-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white font-black text-lg flex items-center justify-center shadow ${status === 'correct' ? 'bg-green-500' : isWrongSpot ? 'bg-red-500' : 'bg-indigo-600'}`}>{pos + 1}</span>
              )}
              {right && <span className="absolute bottom-1 right-1 px-1.5 rounded bg-green-600 text-white text-[10px] font-black">{right}.</span>}
            </button>
          );
        })}
      </div>
      {!readOnly && picked.length > 0 && (
        <button type="button" onClick={() => onChange([])} className="text-[11px] font-black text-slate-500 flex items-center gap-1 hover:text-indigo-600">
          <RotateCcw size={12} /> baştan sırala
        </button>
      )}
    </div>
  );
}
