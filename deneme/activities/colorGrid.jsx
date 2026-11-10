import React, { useState, useEffect } from 'react';
import { createSeededRng, FOUR_MAIN_COLORS } from './shared';
import { EraserIcon } from '../components/common/Icons';

// --- KUTU BOYAMA ŞABLON ÜRETİCİSİ (4x4 ve 5x5 İçin 200'er Adet Benzersiz Şablon) ---
export const generateColorBoxTemplatesForSize = (n, count = 200) => {
  const rng = createSeededRng(n * 54321 + 1111);
  const templates = [];
  const seen = new Set();

  let attempts = 0;
  while (templates.length < count && attempts < count * 30) {
    attempts++;
    const cells = {};
    const totalCells = n * n;
    const minPaint = n === 4 ? 4 : 5;
    const maxPaint = n === 4 ? 10 : 14;
    const paintCount = minPaint + (templates.length % (maxPaint - minPaint + 1));
    const symmetric = templates.length % 3 === 0;

    let painted = 0;
    let innerAttempts = 0;
    while (painted < paintCount && innerAttempts < totalCells * 4) {
      innerAttempts++;
      const r = Math.floor(rng() * n);
      const c = Math.floor(rng() * n);
      const color = FOUR_MAIN_COLORS[Math.floor(rng() * FOUR_MAIN_COLORS.length)];
      const key = `${r},${c}`;
      if (!cells[key]) {
        cells[key] = color;
        painted++;
      }
      if (symmetric && painted < paintCount) {
        const symKey = `${r},${n - 1 - c}`;
        if (!cells[symKey]) {
          cells[symKey] = color;
          painted++;
        }
      }
    }

    const sig = Object.keys(cells)
      .sort()
      .map(k => `${k}:${cells[k]}`)
      .join('|');

    if (painted >= 3 && !seen.has(sig)) {
      seen.add(sig);
      templates.push({
        id: templates.length + 1,
        rows: n,
        cols: n,
        cells
      });
    }
  }
  return templates;
};

export const COLOR_BOX_TEMPLATES = {
  4: generateColorBoxTemplatesForSize(4, 200),
  5: generateColorBoxTemplatesForSize(5, 200)
};

// ============================================================================
// --- GRUP: 2. ETKİLEŞİMLİ BİLEŞEN - KUTU BOYAMA (COLOR GRID) ---
// ============================================================================
export const normalizeColorCells = (cells = {}) => {
  const result = {};
  if (!cells || typeof cells !== 'object') return result;
  Object.entries(cells).forEach(([key, val]) => {
    if (!val || typeof val !== 'string') return;
    const clean = val.trim().toLowerCase();
    if (clean && clean !== '#ffffff' && clean !== 'white' && clean !== 'transparent') {
      result[key] = clean;
    }
  });
  return result;
};

export const areColorGridsEqual = (cellsA = {}, cellsB = {}) => {
  const normA = normalizeColorCells(cellsA);
  const normB = normalizeColorCells(cellsB);
  const keysA = Object.keys(normA).sort();
  const keysB = Object.keys(normB).sort();
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k, i) => k === keysB[i] && normA[k] === normB[k]);
};

export const generateColorGridSvgDataUrl = (rows = 3, cols = 3, cells = {}) => {
  const safeRows = Math.max(1, Math.min(10, Number(rows) || 3));
  const safeCols = Math.max(1, Math.min(10, Number(cols) || 3));
  const size = 240;
  const pad = 20;
  const gap = 6;
  const maxDim = Math.max(safeRows, safeCols);
  const cellSize = (size - pad * 2 - gap * (maxDim - 1)) / maxDim;
  const totalW = cellSize * safeCols + gap * (safeCols - 1);
  const totalH = cellSize * safeRows + gap * (safeRows - 1);
  const startX = (size - totalW) / 2;
  const startY = (size - totalH) / 2;
  const normCells = normalizeColorCells(cells);

  let rectsSvg = '';
  for (let r = 0; r < safeRows; r++) {
    for (let c = 0; c < safeCols; c++) {
      const x = startX + c * (cellSize + gap);
      const y = startY + r * (cellSize + gap);
      const fill = normCells[`${r},${c}`] || '#f8fafc';
      rectsSvg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="8" fill="${fill}" stroke="#cbd5e1" stroke-width="2" />`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="100%" height="100%" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>${rectsSvg}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const ColorGridPad = ({
  rows = 3,
  cols = 3,
  cells = {},
  onChange,
  readOnly = false,
  size = 195,
  title = "",
  status = null
}) => {
  const safeRows = Math.max(1, Math.min(10, Number(rows) || 3));
  const safeCols = Math.max(1, Math.min(10, Number(cols) || 3));
  const normCells = normalizeColorCells(cells);

  const [activeColor, setActiveColor] = useState(FOUR_MAIN_COLORS[0]);
  const [isErasing, setIsErasing] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);

  useEffect(() => {
    const up = () => setIsPointerDown(false);
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);

  const paintCell = (r, c, toggleIfSame = false) => {
    if (readOnly || !onChange) return;
    const key = `${r},${c}`;
    const next = { ...normCells };

    if (isErasing) {
      delete next[key];
    } else {
      const targetColor = activeColor.toLowerCase();
      if (toggleIfSame && next[key] === targetColor) {
        delete next[key];
      } else {
        next[key] = targetColor;
      }
    }
    onChange(next);
  };

  let borderClass = "border-slate-200 bg-white";
  if (status === 'correct') borderClass = "border-green-500 bg-green-50/40 ring-4 ring-green-100";
  else if (status === 'wrong') borderClass = "border-red-500 bg-red-50/40 ring-4 ring-red-100";

  const maxDim = Math.max(safeRows, safeCols);
  const isCompactSize = size < 135;
  const gapPx = isCompactSize ? 4 : 6;
  const padPx = isCompactSize ? 12 : 20;
  const cellPx = Math.max(14, Math.min(62, Math.floor((size - padPx) / maxDim)));
  const gridW = cellPx * safeCols + (safeCols - 1) * gapPx + padPx;
  const gridH = cellPx * safeRows + (safeRows - 1) * gapPx + padPx;

  return (
    <div className="flex flex-col items-center select-none max-w-full">
      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-center">
          {title}
        </span>
      )}

      {!readOnly && (
        <div className="flex flex-row items-center justify-center gap-2 mb-1.5 bg-white px-3 py-1 rounded-2xl border-2 border-slate-200 shadow-sm">
          {FOUR_MAIN_COLORS.map((color) => {
            const isSelected = !isErasing && activeColor.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                onClick={() => { setIsErasing(false); setActiveColor(color); }}
                className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                  isSelected ? 'scale-110 ring-4 ring-indigo-400 border-white shadow-md z-10' : 'border-slate-200 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
          <button
            type="button"
            onClick={() => setIsErasing(true)}
            className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
              isErasing ? 'bg-pink-100 border-pink-500 ring-4 ring-pink-200 scale-110' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
            title="Silgi"
          >
            <EraserIcon size={22} />
          </button>
        </div>
      )}

      <div
        className={`relative rounded-2xl sm:rounded-3xl border-2 shadow-inner transition-all flex items-center justify-center ${isCompactSize ? 'p-1.5' : 'p-2.5'} ${borderClass}`}
        style={{ width: gridW, height: gridH, maxWidth: '84vw' }}
        onPointerLeave={() => setIsPointerDown(false)}
      >
        <div
          className={`w-full h-full grid touch-none ${isCompactSize ? 'gap-1' : 'gap-1.5'}`}
          style={{
            gridTemplateColumns: `repeat(${safeCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${safeRows}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: safeRows }).map((_, r) =>
            Array.from({ length: safeCols }).map((__, c) => {
              const key = `${r},${c}`;
              const cellColor = normCells[key] || '#f8fafc';
              return (
                <div
                  key={key}
                  onPointerDown={(e) => {
                    if (readOnly) return;
                    e.preventDefault();
                    setIsPointerDown(true);
                    paintCell(r, c, true);
                  }}
                  onPointerEnter={() => {
                    if (readOnly || !isPointerDown) return;
                    paintCell(r, c, false);
                  }}
                  className={`w-full h-full ${isCompactSize ? 'rounded-lg' : 'rounded-xl'} border-2 transition-colors ${
                    readOnly ? 'border-slate-300' : 'border-slate-300 hover:border-indigo-400 cursor-pointer active:scale-95'
                  }`}
                  style={{ backgroundColor: cellColor }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
