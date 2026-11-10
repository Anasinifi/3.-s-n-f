import React from 'react';
import { createSeededRng } from './shared';
import { EraserIcon } from '../components/common/Icons';

// ============================================================================
// --- GRUP: 13. ETKİLEŞİMLİ BİLEŞEN - GRAFİK OLUŞTURMA (BAR GRAPH) ---
// ============================================================================
export const GRAPH_ICON_POOL = [
  '🦋', '☀️', '🐞', '🐝', '🍎', '🚗', '🎈', '🐟', '🌸', '⭐️',
  '🍓', '🐢', '🚀', '🍦', '🐸', '🍄', '⚽️', '🐱', '🐶', '🦖',
  '🍉', '🚁', '🦉', '🥕', '🐙', '🍒', '🦁', '⛵️', '🌵', '🍩'
];

export const generateBarGraphTemplatesForLevel = (level = 'easy', count = 200) => {
  const rng = createSeededRng((level === 'easy' ? 101 : level === 'medium' ? 202 : 303) * 54321);
  const templates = [];
  const itemTypesCount = level === 'easy' ? 3 : 4;
  const maxRows = level === 'easy' ? 4 : level === 'medium' ? 5 : 6;

  for (let idx = 0; idx < count; idx++) {
    const startOffset = (idx * 3) % GRAPH_ICON_POOL.length;
    const chosenIcons = [];
    for (let k = 0; k < itemTypesCount; k++) {
      chosenIcons.push(GRAPH_ICON_POOL[(startOffset + k * 2) % GRAPH_ICON_POOL.length]);
    }

    const counts = {};
    const scatteredItems = [];
    chosenIcons.forEach((ic, cIdx) => {
      const cnt = 1 + ((idx + cIdx * 2) % maxRows);
      counts[ic] = cnt;
      for (let m = 0; m < cnt; m++) {
        scatteredItems.push(ic);
      }
    });

    scatteredItems.sort(() => rng() - 0.5);

    templates.push({
      id: idx + 1,
      level,
      maxRows,
      icons: chosenIcons,
      counts,
      scatteredItems
    });
  }
  return templates;
};

export const BAR_GRAPH_TEMPLATES = {
  easy: generateBarGraphTemplatesForLevel('easy', 200),
  medium: generateBarGraphTemplatesForLevel('medium', 200),
  hard: generateBarGraphTemplatesForLevel('hard', 200)
};

// Öğretmenin yüklediği özel görseller (her sütun/nesne için). Dizi, icons ile aynı sıradadır.
export const getBarGraphIconImage = (gData = {}, icon, idx) => {
  const imgs = Array.isArray(gData.iconImages) ? gData.iconImages : [];
  const i = idx !== undefined ? idx : (gData.icons || []).indexOf(icon);
  return i >= 0 ? (imgs[i] || '') : '';
};

const escapeXml = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const generateBarGraphSvgDataUrl = (gData = {}) => {
  const icons = gData.icons || ['🦋', '☀️', '🐞', '🐝'];
  const counts = gData.counts || { '🦋': 4, '☀️': 3, '🐞': 1, '🐝': 2 };
  const iconAt = (ic, i, x, y, sz) => {
    const img = getBarGraphIconImage(gData, ic, i);
    if (img) return `<image href="${escapeXml(img)}" x="${x - sz / 2}" y="${y - sz * 0.8}" width="${sz}" height="${sz}" preserveAspectRatio="xMidYMid meet"/>`;
    return `<text x="${x}" y="${y}" font-size="${sz * 0.75}" text-anchor="middle">${ic}</text>`;
  };
  const topIcons = icons.map((ic, i) => iconAt(ic, i, 120 + (i - (icons.length - 1) / 2) * 44, 68, 34)).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240"><rect width="100%" height="100%" rx="20" fill="#ffffff" stroke="#1e293b" stroke-width="4"/><rect x="16" y="16" width="208" height="84" rx="10" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>${topIcons}<line x1="50" y1="115" x2="50" y2="205" stroke="#1e293b" stroke-width="3"/><line x1="30" y1="205" x2="220" y2="205" stroke="#1e293b" stroke-width="3"/>${icons.map((ic, i) => `<rect x="${64 + i * 38}" y="${205 - (counts[ic] || 2) * 16}" width="26" height="${(counts[ic] || 2) * 16}" fill="#38bdf8" stroke="#1e293b" stroke-width="1.5"/>${iconAt(ic, i, 77 + i * 38, 229, 22)}`).join('')}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const checkBarGraphAnswer = (gData = {}, studentCols = {}) => {
  const icons = gData.icons || [];
  const counts = gData.counts || {};
  return icons.every((ic, colIdx) => {
    const expected = Number(counts[ic]) || 0;
    const stuSelectedRows = Array.isArray(studentCols[colIdx]) ? studentCols[colIdx].length : Number(studentCols[colIdx]) || 0;
    return stuSelectedRows === expected;
  });
};

export const BarGraphActivityPad = ({
  graphData = {},
  studentCols = {},
  onChangeStudentCols,
  readOnly = false,
  title = "",
  status = null
}) => {
  const icons = graphData.icons || ['🦋', '☀️', '🐞', '🐝'];
  const maxRows = Number(graphData.maxRows) || 5;
  const scatteredItems = graphData.scatteredItems || ['🦋', '☀️', '🦋', '🐞', '🐝', '☀️'];
  const colColors = ['#ec4899', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6'];

  // Emoji yerine öğretmenin yüklediği görsel varsa onu göster
  const renderIcon = (ic, idx, sizeClass) => {
    const img = getBarGraphIconImage(graphData, ic, idx);
    if (img) return <img src={img} draggable="false" className={`${sizeClass} object-contain select-none pointer-events-none`} alt="" />;
    return ic;
  };

  const handleBoxToggle = (colIdx, rowNumber) => {
    if (readOnly || !onChangeStudentCols) return;
    const next = { ...studentCols };
    const currentList = Array.isArray(next[colIdx]) ? [...next[colIdx]] : [];
    if (currentList.includes(rowNumber)) {
      next[colIdx] = currentList.filter(r => r !== rowNumber);
    } else {
      next[colIdx] = [...currentList, rowNumber];
    }
    onChangeStudentCols(next);
  };

  let borderClass = "border-slate-800 bg-white";
  if (status === 'correct') borderClass = "border-green-600 bg-green-50/30 ring-4 ring-green-200";
  else if (status === 'wrong') borderClass = "border-red-600 bg-red-50/30 ring-4 ring-red-200";

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto gap-2">
      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 px-2.5 py-0.5 bg-sky-50 border border-sky-200 rounded-full text-center">
          {title}
        </span>
      )}

      {/* Üst Kutu: Sayılacak Karışık Nesneler */}
      <div className="w-full border-2 border-slate-800 rounded-2xl bg-white p-3 shadow-sm flex flex-wrap items-center justify-center gap-2.5 min-h-[92px]">
        {scatteredItems.map((ic, idx) => (
          <span key={idx} className="text-2xl sm:text-3xl select-none transform hover:scale-110 transition-transform flex items-center">
            {renderIcon(ic, undefined, 'w-8 h-8 sm:w-9 sm:h-9')}
          </span>
        ))}
      </div>

      {/* Alt Tablo: Grafik Kutucukları */}
      <div className={`w-full border-2 ${borderClass} rounded-2xl overflow-hidden shadow-sm`}>
        {Array.from({ length: maxRows }).map((_, rIdx) => {
          const rowNum = maxRows - rIdx;
          return (
            <div key={rowNum} className="grid border-b border-slate-800" style={{ gridTemplateColumns: `48px repeat(${icons.length}, minmax(0, 1fr))` }}>
              <div className="border-r border-slate-800 flex items-center justify-center font-black text-base sm:text-lg text-slate-800 bg-slate-50 h-9 sm:h-10">
                {rowNum}
              </div>
              {icons.map((ic, colIdx) => {
                const selectedList = Array.isArray(studentCols[colIdx]) ? studentCols[colIdx] : [];
                const isPainted = selectedList.includes(rowNum);
                const activeColColor = colColors[colIdx % colColors.length];
                return (
                  <button
                    key={`${colIdx}-${rowNum}`}
                    type="button"
                    disabled={readOnly}
                    onClick={() => handleBoxToggle(colIdx, rowNum)}
                    style={{ backgroundColor: isPainted ? activeColColor : '#ffffff' }}
                    className={`border-r last:border-r-0 border-slate-800 h-9 sm:h-10 transition-colors ${!readOnly ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                  />
                );
              })}
            </div>
          );
        })}

        {/* En Alt Satır: İkon Başlıkları */}
        <div className="grid bg-slate-50" style={{ gridTemplateColumns: `48px repeat(${icons.length}, minmax(0, 1fr))` }}>
          <div className="border-r border-slate-800 h-11 flex items-center justify-center">
            {!readOnly && (
              <button
                type="button"
                onClick={() => onChangeStudentCols && onChangeStudentCols({})}
                className="p-1 rounded-lg bg-pink-50 border border-pink-300"
                title="Grafiği Temizle"
              >
                <EraserIcon size={16} />
              </button>
            )}
          </div>
          {icons.map((ic, colIdx) => (
            <div key={`icon-${colIdx}`} className="border-r last:border-r-0 border-slate-800 h-11 flex items-center justify-center text-2xl">
              {renderIcon(ic, colIdx, 'w-8 h-8')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
