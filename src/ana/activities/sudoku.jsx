import React, { useState, useEffect } from 'react';
import { EraserIcon } from '../components/common/Icons';

// Hazır sudoku soruları artık src/content/sudokuBank.js içinde üretilir
// (3x3 / 4x4 / 5x5 • kolay / orta / zor • her biri 100 soru, 20 sembol teması).
export { getSudokuBank, SUDOKU_LEVELS, SUDOKU_THEMES, applySudokuTheme } from '../content/sudokuBank';

const defaultSymbols = (n) => Array.from({ length: n }, (_, i) => String(i + 1));
const isEmojiSymbol = (v) => /[^\x00-\x7F]/.test(String(v || ''));

// ============================================================================
// --- GRUP: 3. ETKİLEŞİMLİ BİLEŞEN - SUDOKU (SUDOKU GRID) ---
// ============================================================================
export const checkSudokuValidAndComplete = (size = 3, clues = {}, studentCells = {}, solution = {}) => {
  const n = Math.max(3, Math.min(5, Number(size) || 3));
  const combined = { ...(clues || {}), ...(studentCells || {}) };

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!combined[`${r},${c}`]) return false;
    }
  }

  for (let r = 0; r < n; r++) {
    const rowSet = new Set();
    for (let c = 0; c < n; c++) {
      const val = String(combined[`${r},${c}`]);
      if (rowSet.has(val)) return false;
      rowSet.add(val);
    }
  }
  for (let c = 0; c < n; c++) {
    const colSet = new Set();
    for (let r = 0; r < n; r++) {
      const val = String(combined[`${r},${c}`]);
      if (colSet.has(val)) return false;
      colSet.add(val);
    }
  }
  return true;
};

export const generateSudokuSvgDataUrl = (size = 3, clues = {}, symbols = null) => {
  const n = Math.max(3, Math.min(5, Number(size) || 3));
  const boxSize = 240;
  const pad = 20;
  const gap = 6;
  const cellSize = (boxSize - pad * 2 - gap * (n - 1)) / n;

  let cellsSvg = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const key = `${r},${c}`;
      const x = pad + c * (cellSize + gap);
      const y = pad + r * (cellSize + gap);
      const clueVal = clues?.[key];
      const fill = clueVal ? '#e0e7ff' : '#ffffff';
      const stroke = clueVal ? '#6366f1' : '#cbd5e1';
      cellsSvg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
      if (clueVal) {
        const emo = isEmojiSymbol(clueVal);
        cellsSvg += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2}" dominant-baseline="central" font-size="${Math.round(cellSize * (emo ? 0.6 : 0.52))}" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" font-weight="900" fill="#1e1b4b" text-anchor="middle">${clueVal}</text>`;
      } else {
        cellsSvg += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2 + 6}" font-size="${Math.round(cellSize * 0.4)}" font-family="sans-serif" font-weight="bold" fill="#cbd5e1" text-anchor="middle">?</text>`;
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boxSize} ${boxSize}" width="${boxSize}" height="${boxSize}"><rect width="100%" height="100%" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>${cellsSvg}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const SudokuGridPad = ({
  gridSize = 3,
  clues = {},
  solution = {},
  studentCells = {},
  onChangeClues,
  onChangeStudent,
  isTeacherEditor = false,
  readOnly = false,
  size = 240,
  title = "",
  status = null,
  symbols: symbolsProp = null
}) => {
  const n = Math.max(3, Math.min(5, Number(gridSize) || 3));
  const symbols = (Array.isArray(symbolsProp) && symbolsProp.length >= n) ? symbolsProp.slice(0, n).map(String) : defaultSymbols(n);
  const symKey = symbols.join('|');
  const [activeSymbol, setActiveSymbol] = useState(symbols[0]);
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    if (!symbols.includes(activeSymbol)) setActiveSymbol(symbols[0]);
  }, [n, symKey]);

  const handleCellClick = (r, c) => {
    if (readOnly) return;
    const key = `${r},${c}`;

    if (isTeacherEditor) {
      if (!onChangeClues) return;
      const nextClues = { ...clues };
      if (isErasing) {
        delete nextClues[key];
      } else if (nextClues[key]) {
        delete nextClues[key];
      } else {
        nextClues[key] = solution?.[key] || activeSymbol;
      }
      onChangeClues(nextClues);
    } else {
      if (clues && clues[key]) return;
      if (!onChangeStudent) return;
      const next = { ...studentCells };
      if (isErasing) {
        delete next[key];
      } else {
        if (next[key] === activeSymbol) delete next[key];
        else next[key] = activeSymbol;
      }
      onChangeStudent(next);
    }
  };

  let borderClass = "border-slate-200 bg-white";
  if (status === 'correct') borderClass = "border-green-500 bg-green-50/40 ring-4 ring-green-100";
  else if (status === 'wrong') borderClass = "border-red-500 bg-red-50/40 ring-4 ring-red-100";

  return (
    <div className="flex flex-col items-center select-none max-w-full">
      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-center">
          {title}
        </span>
      )}

      <div className="flex flex-col items-center justify-center gap-2">
        <div
          className={`relative rounded-3xl border-2 shadow-inner p-2.5 transition-all flex items-center justify-center ${borderClass}`}
          style={{ width: size, height: size, maxWidth: '90vw', maxHeight: '90vw' }}
        >
          <div
            className="w-full h-full grid gap-1.5 touch-none"
            style={{
              gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`
            }}
          >
            {Array.from({ length: n }).map((_, r) =>
              Array.from({ length: n }).map((__, c) => {
                const key = `${r},${c}`;
                const clueVal = clues?.[key];
                const solVal = solution?.[key];
                const stuVal = studentCells?.[key];

                let displayVal = "";
                let cellStyle = "bg-white border-slate-300 text-slate-800";

                if (clueVal) {
                  displayVal = clueVal;
                  cellStyle = "bg-indigo-100 border-indigo-400 text-indigo-950 font-black";
                } else if (isTeacherEditor) {
                  displayVal = "?";
                  cellStyle = "bg-amber-50/70 border-dashed border-amber-400 text-amber-500 font-black";
                } else if (stuVal) {
                  displayVal = stuVal;
                  cellStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-black";
                }

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={readOnly || (!isTeacherEditor && Boolean(clueVal))}
                    onClick={() => handleCellClick(r, c)}
                    title={isTeacherEditor ? (clueVal ? "Tıkla ve gizle (soru boşluğu yap)" : `Tıkla ve göster (${solVal || ''})`) : ""}
                    className={`w-full h-full rounded-xl border-2 flex items-center justify-center text-2xl sm:text-3xl transition-all ${cellStyle} ${
                      !readOnly && (isTeacherEditor || !clueVal) ? 'hover:border-indigo-500 active:scale-95 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {displayVal}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {!readOnly && !isTeacherEditor && (
          <div className="flex flex-row flex-nowrap items-center justify-center gap-1.5 bg-white px-3 py-1.5 rounded-2xl border-2 border-slate-200 shadow-sm">
            {symbols.map((sym) => {
              const isSelected = !isErasing && activeSymbol === sym;
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => { setIsErasing(false); setActiveSymbol(sym); }}
                  className={`w-10 h-10 rounded-xl border-2 text-lg font-black flex items-center justify-center transition-all ${
                    isSelected ? 'bg-emerald-600 text-white border-emerald-600 scale-110 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsErasing(true)}
              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                isErasing ? 'bg-pink-100 border-pink-500 ring-4 ring-pink-200 scale-110' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              title="Silgi"
            >
              <EraserIcon size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
