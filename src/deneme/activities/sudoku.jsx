import React, { useState, useEffect } from 'react';
import { EraserIcon } from '../components/common/Icons';

// --- SUDOKU ŞABLON ÜRETİCİSİ ---
export const generateSudokuTemplates = () => {
  const perms3 = [
    [1, 2, 3], [1, 3, 2], [2, 1, 3],
    [2, 3, 1], [3, 1, 2], [3, 2, 1]
  ];
  const templates3x3 = [];
  perms3.forEach((r0) => {
    const r1a = [r0[1], r0[2], r0[0]];
    const r2a = [r0[2], r0[0], r0[1]];
    templates3x3.push([r0, r1a, r2a]);
    templates3x3.push([r0, r2a, r1a]);
  });

  const base4a = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1]
  ];
  const base4b = [
    [1, 2, 3, 4],
    [2, 3, 4, 1],
    [3, 4, 1, 2],
    [4, 1, 2, 3]
  ];
  const symPerms4 = [
    [1, 2, 3, 4], [1, 2, 4, 3], [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3],
    [2, 1, 3, 4], [2, 1, 4, 3], [2, 3, 1, 4], [2, 4, 1, 3], [3, 1, 2, 4],
    [3, 2, 4, 1], [3, 4, 1, 2], [4, 1, 2, 3], [4, 2, 3, 1], [4, 3, 2, 1]
  ];
  const templates4x4 = [];
  for (let i = 0; i < 10; i++) {
    const sp = symPerms4[i];
    templates4x4.push(base4a.map(row => row.map(v => sp[v - 1])));
    templates4x4.push(base4b.map(row => row.map(v => sp[v - 1])));
  }

  const base5a = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 1],
    [3, 4, 5, 1, 2],
    [4, 5, 1, 2, 3],
    [5, 1, 2, 3, 4]
  ];
  const base5b = [
    [1, 2, 3, 4, 5],
    [3, 4, 5, 1, 2],
    [5, 1, 2, 3, 4],
    [2, 3, 4, 5, 1],
    [4, 5, 1, 2, 3]
  ];
  const symPerms5 = [
    [1, 2, 3, 4, 5], [2, 3, 4, 5, 1], [3, 4, 5, 1, 2], [4, 5, 1, 2, 3], [5, 1, 2, 3, 4]
  ];
  const templates5x5 = [];
  for (let i = 0; i < 5; i++) {
    const sp = symPerms5[i];
    templates5x5.push(base5a.map(row => row.map(v => sp[v - 1])));
    templates5x5.push(base5b.map(row => row.map(v => sp[v - 1])));
  }

  return { 3: templates3x3, 4: templates4x4, 5: templates5x5 };
};

export const SUDOKU_TEMPLATES = generateSudokuTemplates();

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

export const generateSudokuSvgDataUrl = (size = 3, clues = {}) => {
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
        cellsSvg += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2 + 8}" font-size="${Math.round(cellSize * 0.52)}" font-family="sans-serif" font-weight="900" fill="#1e1b4b" text-anchor="middle">${clueVal}</text>`;
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
  status = null
}) => {
  const n = Math.max(3, Math.min(5, Number(gridSize) || 3));
  const symbols = Array.from({ length: n }, (_, i) => String(i + 1));
  const [activeSymbol, setActiveSymbol] = useState('1');
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    if (!symbols.includes(activeSymbol)) setActiveSymbol('1');
  }, [n]);

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
