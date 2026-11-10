import React, { useState } from 'react';
import { FOUR_MAIN_COLORS } from './shared';
import { EraserIcon } from '../components/common/Icons';

// --- RENK ÖRÜNTÜSÜ ŞABLON ÜRETİCİSİ ---
export const generatePatternTemplates = () => {
  const C = FOUR_MAIN_COLORS;
  const buildList = (period, baseBoxes, targetCount = 200) => {
    const units = [];
    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) {
        if (period === 2 && a === b) continue;
        for (let c = 0; c < (period >= 3 ? 4 : 1); c++) {
          for (let d = 0; d < (period >= 4 ? 4 : 1); d++) {
            const unit = period === 2 ? [C[a], C[b]] : period === 3 ? [C[a], C[b], C[c]] : [C[a], C[b], C[c], C[d]];
            const uniqueInUnit = new Set(unit).size;
            if (uniqueInUnit < 2) continue;
            units.push(unit);
          }
        }
      }
    }

    const lengthOptions = period === 2 ? [5, 6, 7, 8] : period === 3 ? [6, 7, 8, 9] : [7, 8, 9, 10];
    const hiddenOptions = [
      (len) => [len - 1],
      (len) => [len - 2, len - 1],
      (len) => [len - 2],
      (len) => [len - 3, len - 1],
      (len) => [Math.max(1, len - 4), len - 1]
    ];

    const finalTemplates = [];
    let idx = 0;
    while (finalTemplates.length < targetCount && units.length > 0) {
      const unit = units[idx % units.length];
      const variantTier = Math.floor(idx / units.length);
      const len = lengthOptions[variantTier % lengthOptions.length] || baseBoxes;
      const shift = Math.floor(variantTier / lengthOptions.length) % period;
      const cells = [];
      for (let i = 0; i < len; i++) {
        cells.push(unit[(i + shift) % period]);
      }
      const hiddenFn = hiddenOptions[variantTier % hiddenOptions.length];
      const hiddenIndices = hiddenFn(len).filter(hi => hi >= 0 && hi < len);
      finalTemplates.push({
        id: finalTemplates.length + 1,
        period,
        cells,
        hiddenIndices: hiddenIndices.length > 0 ? hiddenIndices : [len - 1]
      });
      idx++;
    }
    return finalTemplates;
  };

  return {
    2: buildList(2, 6, 200),
    3: buildList(3, 6, 200),
    4: buildList(4, 8, 200)
  };
};

export const PATTERN_TEMPLATES = generatePatternTemplates();

// ============================================================================
// --- GRUP: 6. ETKİLEŞİMLİ BİLEŞEN - RENK ÖRÜNTÜLERİ (COLOR PATTERN) ---
// ============================================================================
export const generatePatternSvgDataUrl = (cells = [], hiddenIndices = []) => {
  const hiddenSet = new Set(hiddenIndices || []);
  const count = Math.max(4, cells.length || 6);
  const w = 260;
  const h = 100;
  const pad = 14;
  const gap = count > 6 ? 3 : 5;
  const boxSize = Math.min(36, (w - pad * 2 - gap * (count - 1)) / count);
  const totalW = boxSize * count + gap * (count - 1);
  const startX = (w - totalW) / 2;
  const startY = (h - boxSize) / 2;

  let rects = '';
  for (let i = 0; i < count; i++) {
    const x = startX + i * (boxSize + gap);
    const isHidden = hiddenSet.has(i);
    const fill = isHidden ? '#ffffff' : (cells[i] || '#ef4444');
    rects += `<rect x="${x}" y="${startY}" width="${boxSize}" height="${boxSize}" rx="6" fill="${fill}" stroke="#1e293b" stroke-width="2" />`;
    if (isHidden) {
      rects += `<text x="${x + boxSize / 2}" y="${startY + boxSize / 2 + 5}" font-size="${count > 6 ? 12 : 16}" font-family="sans-serif" font-weight="900" fill="#94a3b8" text-anchor="middle">?</text>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="100%" height="100%" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const checkPatternAnswer = (patternData = {}, studentAnswers = {}) => {
  const cells = patternData.cells || [];
  const hiddenIndices = patternData.hiddenIndices || [];
  if (hiddenIndices.length === 0) return true;
  return hiddenIndices.every((idx) => {
    const expected = (cells[idx] || '').toLowerCase();
    const given = (studentAnswers[idx] || '').toLowerCase();
    return expected === given;
  });
};

export const ColorPatternPad = ({
  cells = [],
  hiddenIndices = [],
  studentAnswers = {},
  onChangeCells,
  onChangeHiddenIndices,
  onChangeStudentAnswers,
  isTeacherEditor = false,
  teacherMode = 'hide',
  readOnly = false,
  title = "",
  status = null
}) => {
  const [activeColor, setActiveColor] = useState(FOUR_MAIN_COLORS[0]);
  const [isErasing, setIsErasing] = useState(false);
  const hiddenSet = new Set(hiddenIndices || []);

  const handleBoxClick = (idx) => {
    if (readOnly) return;

    if (isTeacherEditor) {
      if (teacherMode === 'hide' || isErasing) {
        if (!onChangeHiddenIndices) return;
        if (hiddenSet.has(idx)) {
          onChangeHiddenIndices(hiddenIndices.filter(i => i !== idx));
        } else {
          onChangeHiddenIndices([...hiddenIndices, idx]);
        }
      } else {
        if (!onChangeCells) return;
        const next = [...cells];
        next[idx] = activeColor;
        onChangeCells(next);
        if (hiddenSet.has(idx) && onChangeHiddenIndices) {
          onChangeHiddenIndices(hiddenIndices.filter(i => i !== idx));
        }
      }
    } else {
      if (!hiddenSet.has(idx) || !onChangeStudentAnswers) return;
      const next = { ...studentAnswers };
      if (isErasing) {
        delete next[idx];
      } else {
        if (next[idx] === activeColor) delete next[idx];
        else next[idx] = activeColor;
      }
      onChangeStudentAnswers(next);
    }
  };

  let borderClass = "border-slate-200 bg-white";
  if (status === 'correct') borderClass = "border-green-500 bg-green-50/40 ring-4 ring-green-100";
  else if (status === 'wrong') borderClass = "border-red-500 bg-red-50/40 ring-4 ring-red-100";

  const isCompact = cells.length > 6;

  return (
    <div className="flex flex-col items-center select-none w-full">
      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 mb-1.5 px-2.5 py-0.5 bg-pink-50 border border-pink-200 rounded-full text-center">
          {title}
        </span>
      )}

      <div className="flex flex-col items-center justify-center gap-2.5 w-full">
        <div
          className={`flex flex-row flex-nowrap items-center justify-center w-full max-w-[96vw] rounded-3xl border-2 shadow-inner ${
            isCompact ? 'gap-1 sm:gap-1.5 p-2 sm:p-3' : 'gap-1.5 sm:gap-2.5 p-3 sm:p-4'
          } ${borderClass}`}
        >
          {cells.map((color, idx) => {
            const isHidden = hiddenSet.has(idx);
            const stuColor = studentAnswers?.[idx];

            let displayBg = color;
            if (isHidden) {
              if (isTeacherEditor) displayBg = '#f8fafc';
              else displayBg = stuColor || '#ffffff';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={readOnly || (!isTeacherEditor && !isHidden)}
                onClick={() => handleBoxClick(idx)}
                style={{ backgroundColor: displayBg }}
                className={`${
                  isCompact
                    ? 'flex-1 min-w-0 max-w-[44px] rounded-xl'
                    : 'flex-1 min-w-[36px] max-w-[60px] rounded-2xl'
                } aspect-square border-2 flex items-center justify-center transition-all ${
                  isHidden
                    ? 'border-dashed border-slate-500 shadow-sm'
                    : 'border-slate-800 shadow-sm'
                } ${!readOnly && (isTeacherEditor || isHidden) ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default'}`}
              >
                {isHidden && (!stuColor || isTeacherEditor) && (
                  <span className={`${isCompact ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'} font-black text-slate-400`}>?</span>
                )}
              </button>
            );
          })}
        </div>

        {!readOnly && (!isTeacherEditor || teacherMode === 'paint') && (
          <div className="flex flex-row flex-nowrap items-center justify-center gap-2 bg-white px-3 py-1 rounded-2xl border-2 border-slate-200 shadow-sm">
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
      </div>
    </div>
  );
};
