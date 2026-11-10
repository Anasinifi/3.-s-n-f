import React, { useState } from 'react';
import { createSeededRng } from './shared';
import { EraserIcon } from '../components/common/Icons';

// ============================================================================
// --- GRUP: 9. ETKİLEŞİMLİ BİLEŞEN - TABLO BOYAMA (MATRIX PAINT) ---
// ============================================================================
// YENİ SİSTEM: İç içe şekiller yerine ALTLI-ÜSTLÜ iki parçadan oluşan resimler
// (çatı + ev, top + külah, taç + gövde ...). Çocuk her parçaya ayrı ayrı ve
// kolayca dokunarak boyar. Sütun başlığı ÜST parçanın, satır başlığı ALT
// parçanın rengini gösterir (veya tam tersi - varyanta göre).
// Eski kayıtlı sorular (shapeType alanı olan) eski görünümle çalışmaya devam eder.

export const TABLE_PAINT_COLORS = ['#ef4444', '#38bdf8', '#eab308', '#22c55e', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];

const circlePath = (cx, cy, r) => `M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0 Z`;

// Her resim 100x100 alanda; "top" ve "bottom" parçaları birbirinin İÇİNDE DEĞİL, üst üste durur.
export const STACKED_FIGURES = [
  { id: 'house', name: 'Ev', top: ['M50,6 L94,46 L6,46 Z'], bottom: ['M16,48 L84,48 L84,94 L16,94 Z'] },
  { id: 'icecream', name: 'Dondurma', top: ['M20,46 C20,8 80,8 80,46 Z'], bottom: ['M22,48 L78,48 L50,96 Z'] },
  { id: 'tree', name: 'Ağaç', top: [circlePath(50, 32, 28)], bottom: ['M39,62 L61,62 L63,95 L37,95 Z'] },
  { id: 'mushroom', name: 'Mantar', top: ['M8,50 C8,8 92,8 92,50 Z'], bottom: ['M34,52 L66,52 L70,94 L30,94 Z'] },
  { id: 'rocket', name: 'Roket', top: ['M50,4 L74,40 L26,40 Z'], bottom: ['M26,42 L74,42 L74,78 L88,95 L12,95 L26,78 Z'] },
  { id: 'boat', name: 'Yelkenli', top: ['M47,6 L47,58 L12,58 Z', 'M53,10 L88,58 L53,58 Z'], bottom: ['M6,62 L94,62 L78,94 L22,94 Z'] },
  { id: 'cupcake', name: 'Kek', top: ['M16,50 C6,50 8,32 24,32 C24,12 50,10 54,22 C66,10 90,20 78,34 C94,36 92,50 84,50 Z'], bottom: ['M18,52 L82,52 L72,95 L28,95 Z'] },
  { id: 'snowman', name: 'Kardan Adam', top: [circlePath(50, 22, 18)], bottom: [circlePath(50, 68, 27)] },
  { id: 'lamp', name: 'Lamba', top: ['M30,8 L70,8 L88,50 L12,50 Z'], bottom: ['M43,52 L57,52 L57,78 L78,84 L78,95 L22,95 L22,84 L43,78 Z'] },
  { id: 'robot', name: 'Robot', top: ['M26,6 L74,6 L74,42 L26,42 Z'], bottom: ['M12,46 L88,46 L88,95 L12,95 Z'] },
  { id: 'tulip', name: 'Saksıda Çiçek', top: ['M26,8 L38,24 L50,6 L62,24 L74,8 L74,38 C74,58 26,58 26,38 Z'], bottom: ['M20,60 L80,60 L70,95 L30,95 Z'] },
  { id: 'trophy', name: 'Kupa', top: ['M12,6 L88,6 C88,52 12,52 12,6 Z'], bottom: ['M42,46 L58,46 L58,72 L78,80 L78,94 L22,94 L22,80 L42,72 Z'] },
  { id: 'castle', name: 'Kule', top: ['M14,6 L29,6 L29,17 L43,17 L43,6 L57,6 L57,17 L71,17 L71,6 L86,6 L86,36 L14,36 Z'], bottom: ['M20,38 L80,38 L80,95 L20,95 Z'] },
  { id: 'balloon', name: 'Uçan Balon', top: ['M50,4 C82,4 92,40 66,62 L34,62 C8,40 18,4 50,4 Z'], bottom: ['M32,70 L68,70 L63,95 L37,95 Z'] },
  { id: 'bucket', name: 'Kova ve Kum', top: ['M14,40 C14,14 86,14 86,40 Z'], bottom: ['M18,42 L82,42 L72,95 L28,95 Z'] },
  { id: 'tent', name: 'Çadır', top: ['M50,4 L76,40 L24,40 Z'], bottom: ['M22,42 L78,42 L96,95 L4,95 Z'] }
];

export const getStackedFigure = (id) => STACKED_FIGURES.find(f => f.id === id) || STACKED_FIGURES[0];

export const generateMatrixPaintTemplates = (count = 200) => {
  const rng = createSeededRng(99887766);
  const templates = [];
  for (let i = 0; i < count; i++) {
    const variant = i % 2 === 0 ? 'col_top_row_bottom' : 'col_bottom_row_top';
    const figure = STACKED_FIGURES[Math.floor(i / 2) % STACKED_FIGURES.length].id;
    const shuffled = [...TABLE_PAINT_COLORS].sort(() => rng() - 0.5);
    const colColors = shuffled.slice(0, 3);
    const rowColors = shuffled.slice(3, 6);
    const prefilledKey = i % 3 === 0 ? `${Math.floor(rng() * 3)},${Math.floor(rng() * 3)}` : null;
    templates.push({ id: i + 1, variant, figure, colColors, rowColors, prefilledKey });
  }
  return templates;
};

export const MATRIX_PAINT_TEMPLATES = generateMatrixPaintTemplates(200);

const isStackedData = (d = {}) => Boolean(d.figure);

// Sütun/satır renginin hangi parçaya gideceğini döndürür
const getExpected = (d, r, c) => {
  const colColors = d.colColors || [];
  const rowColors = d.rowColors || [];
  if (d.variant === 'col_bottom_row_top') return { top: rowColors[r], bottom: colColors[c] };
  return { top: colColors[c], bottom: rowColors[r] };
};

const EMPTY_PART = '#ffffff';
const GHOST_PART = '#e2e8f0';

// --- Ortak parçalı resim (React) ---
export const StackedFigureSvg = ({ figureId, topFill = EMPTY_PART, bottomFill = EMPTY_PART, onPartClick, ghostTop = false, ghostBottom = false, className = '' }) => {
  const fig = getStackedFigure(figureId);
  const renderPart = (part, fill, ghost) => fig[part].map((d, i) => (
    <path
      key={`${part}-${i}`}
      d={d}
      fill={ghost ? GHOST_PART : fill}
      stroke={ghost ? '#94a3b8' : '#1e293b'}
      strokeWidth={ghost ? 3 : 4.5}
      strokeDasharray={ghost ? '6 5' : undefined}
      strokeLinejoin="round"
      onClick={onPartClick ? (e) => { e.stopPropagation(); onPartClick(part); } : undefined}
      style={onPartClick ? { cursor: 'pointer' } : undefined}
    />
  ));
  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
      {renderPart('bottom', bottomFill, ghostBottom)}
      {renderPart('top', topFill, ghostTop)}
    </svg>
  );
};

const figureSvgString = (figureId, topFill, bottomFill, ghostTop, ghostBottom, x, y, s) => {
  const fig = getStackedFigure(figureId);
  const part = (name, fill, ghost) => fig[name].map(d => `<path d="${d}" fill="${ghost ? GHOST_PART : fill}" stroke="${ghost ? '#94a3b8' : '#1e293b'}" stroke-width="${ghost ? 3 : 4.5}" ${ghost ? 'stroke-dasharray="6 5"' : ''} stroke-linejoin="round"/>`).join('');
  return `<g transform="translate(${x},${y}) scale(${s / 100})">${part('bottom', bottomFill, ghostBottom)}${part('top', topFill, ghostTop)}</g>`;
};

// --- ESKİ SİSTEM (geriye dönük uyumluluk) ---
export const TABLE_SHAPES = ['heart', 'diamond', 'star', 'circle'];

export const InnerTableShapeSvg = ({ shape = 'heart', fill = '#ffffff', size = 28 }) => {
  if (shape === 'diamond') {
    return (<svg width={size} height={size} viewBox="0 0 100 100"><polygon points="50,10 85,50 50,90 15,50" fill={fill} stroke="#1e293b" strokeWidth="6" /></svg>);
  }
  if (shape === 'star') {
    return (<svg width={size} height={size} viewBox="0 0 100 100"><polygon points="50,8 63,36 94,39 70,60 77,91 50,74 23,91 30,60 6,39 37,36" fill={fill} stroke="#1e293b" strokeWidth="5" /></svg>);
  }
  if (shape === 'circle') {
    return (<svg width={size} height={size} viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill={fill} stroke="#1e293b" strokeWidth="6" /></svg>);
  }
  return (<svg width={size} height={size} viewBox="0 0 100 100"><path d="M50 84 C20 64, 12 36, 30 22 C41 14, 50 25, 50 25 C50 25, 59 14, 70 22 C88 36, 80 64, 50 84 Z" fill={fill} stroke="#1e293b" strokeWidth="6" /></svg>);
};

export const generateMatrixPaintSvgDataUrl = (mpData = {}) => {
  if (isStackedData(mpData)) {
    const W = 240; const cell = 56; const off = 8;
    let g = '';
    for (let i = 0; i <= 4; i++) {
      g += `<line x1="${off + i * cell}" y1="${off}" x2="${off + i * cell}" y2="${off + 4 * cell}" stroke="#1e293b" stroke-width="${i === 1 ? 3 : 1.5}"/>`;
      g += `<line x1="${off}" y1="${off + i * cell}" x2="${off + 4 * cell}" y2="${off + i * cell}" stroke="#1e293b" stroke-width="${i === 1 ? 3 : 1.5}"/>`;
    }
    const colTop = mpData.variant !== 'col_bottom_row_top';
    (mpData.colColors || []).forEach((cc, c) => {
      g += figureSvgString(mpData.figure, colTop ? cc : EMPTY_PART, colTop ? EMPTY_PART : cc, !colTop, colTop, off + (c + 1) * cell + 6, off + 6, cell - 12);
    });
    (mpData.rowColors || []).forEach((rc, r) => {
      g += figureSvgString(mpData.figure, colTop ? EMPTY_PART : rc, colTop ? rc : EMPTY_PART, colTop, !colTop, off + 6, off + (r + 1) * cell + 6, cell - 12);
    });
    if (mpData.prefilledKey) {
      const [pr, pc] = mpData.prefilledKey.split(',').map(Number);
      const exp = getExpected(mpData, pr, pc);
      g += figureSvgString(mpData.figure, exp.top, exp.bottom, false, false, off + (pc + 1) * cell + 6, off + (pr + 1) * cell + 6, cell - 12);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}"><rect width="100%" height="100%" rx="20" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>${g}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  const c0 = mpData.colColors?.[0] || '#22c55e';
  const c1 = mpData.colColors?.[1] || '#f97316';
  const c2 = mpData.colColors?.[2] || '#ec4899';
  const r0 = mpData.rowColors?.[0] || '#38bdf8';
  const r1 = mpData.rowColors?.[1] || '#eab308';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240"><rect width="100%" height="100%" rx="20" fill="#ffffff" stroke="#1e293b" stroke-width="4"/><line x1="65" y1="10" x2="65" y2="230" stroke="#1e293b" stroke-width="3"/><line x1="10" y1="65" x2="230" y2="65" stroke="#1e293b" stroke-width="3"/><circle cx="95" cy="38" r="14" fill="${c0}" stroke="#1e293b" stroke-width="2"/><circle cx="150" cy="38" r="14" fill="${c1}" stroke="#1e293b" stroke-width="2"/><circle cx="205" cy="38" r="14" fill="${c2}" stroke="#1e293b" stroke-width="2"/><rect x="20" y="80" width="32" height="32" fill="${r0}" stroke="#1e293b" stroke-width="2"/><rect x="20" y="135" width="32" height="32" fill="${r1}" stroke="#1e293b" stroke-width="2"/><rect x="189" y="135" width="32" height="32" fill="${r1}" stroke="#1e293b" stroke-width="2"/><circle cx="205" cy="151" r="10" fill="${c2}" stroke="#1e293b" stroke-width="2"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const checkMatrixPaintAnswer = (mpData = {}, studentCells = {}) => {
  const prefilledKey = mpData.prefilledKey;
  if (isStackedData(mpData)) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const key = `${r},${c}`;
        if (key === prefilledKey) continue;
        const cell = studentCells[key] || {};
        const exp = getExpected(mpData, r, c);
        if ((cell.top || '').toLowerCase() !== (exp.top || '').toLowerCase()) return false;
        if ((cell.bottom || '').toLowerCase() !== (exp.bottom || '').toLowerCase()) return false;
      }
    }
    return true;
  }
  const variant = mpData.variant || 'col_shape_row_bg';
  const colColors = (mpData.colColors || []).map(c => c.toLowerCase());
  const rowColors = (mpData.rowColors || []).map(c => c.toLowerCase());
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const key = `${r},${c}`;
      if (key === prefilledKey) continue;
      const cell = studentCells[key] || {};
      const expectedBg = variant === 'col_shape_row_bg' ? rowColors[r] : colColors[c];
      const expectedShape = variant === 'col_shape_row_bg' ? colColors[c] : rowColors[r];
      if ((cell.bg || '').toLowerCase() !== expectedBg || (cell.shape || '').toLowerCase() !== expectedShape) return false;
    }
  }
  return true;
};

const PaletteBar = ({ palette, activeColor, setActiveColor, isErasing, setIsErasing }) => (
  <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white px-3 py-1.5 rounded-2xl border-2 border-slate-200 shadow-sm">
    {palette.map((color) => {
      const isSelected = !isErasing && activeColor.toLowerCase() === color.toLowerCase();
      return (
        <button
          key={color}
          type="button"
          onClick={() => { setIsErasing(false); setActiveColor(color); }}
          className={`w-9 h-9 rounded-xl border-2 transition-transform ${isSelected ? 'scale-110 ring-4 ring-indigo-400 border-white shadow-md z-10' : 'border-slate-300'}`}
          style={{ backgroundColor: color }}
        />
      );
    })}
    <button
      type="button"
      onClick={() => setIsErasing(true)}
      className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center ${isErasing ? 'bg-pink-100 border-pink-500 ring-4 ring-pink-200 scale-110' : 'bg-slate-50 border-slate-200'}`}
      title="Silgi"
    >
      <EraserIcon size={18} />
    </button>
  </div>
);

export const MatrixPaintPad = ({
  paintData = {},
  studentCells = {},
  onChangeStudentCells,
  readOnly = false,
  title = "",
  status = null
}) => {
  const stacked = isStackedData(paintData);
  const variant = paintData.variant || (stacked ? 'col_top_row_bottom' : 'col_shape_row_bg');
  const shapeType = paintData.shapeType || 'heart';
  const colColors = paintData.colColors || ['#22c55e', '#f97316', '#ec4899'];
  const rowColors = paintData.rowColors || ['#38bdf8', '#eab308', '#ef4444'];
  const prefilledKey = paintData.prefilledKey;

  const palette = Array.from(new Set([...colColors, ...rowColors]));
  const [activeColor, setActiveColor] = useState(palette[0] || '#ef4444');
  const [isErasing, setIsErasing] = useState(false);

  const paintPart = (r, c, part) => {
    if (readOnly || !onChangeStudentCells) return;
    const key = `${r},${c}`;
    if (key === prefilledKey) return;
    const next = { ...studentCells };
    const currentCell = { ...(next[key] || {}) };
    if (isErasing) delete currentCell[part];
    else currentCell[part] = activeColor;
    next[key] = currentCell;
    onChangeStudentCells(next);
  };

  let borderClass = "border-slate-800 bg-white";
  if (status === 'correct') borderClass = "border-green-600 bg-green-50/30 ring-4 ring-green-200";
  else if (status === 'wrong') borderClass = "border-red-600 bg-red-50/30 ring-4 ring-red-200";

  if (stacked) {
    const colTop = variant !== 'col_bottom_row_top';
    const dim = 'min(340px, 92vw)';
    return (
      <div className="flex flex-col items-center select-none w-full gap-2">
        {title && (
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full">{title}</span>
        )}
        {!readOnly && <PaletteBar palette={palette} activeColor={activeColor} setActiveColor={setActiveColor} isErasing={isErasing} setIsErasing={setIsErasing} />}

        <div className={`grid grid-cols-4 border-2 ${borderClass} rounded-xl overflow-hidden shadow-sm`} style={{ width: dim, height: dim }}>
          <div className="border border-slate-800 bg-slate-100 p-1.5 flex items-center justify-center">
            <StackedFigureSvg figureId={paintData.figure} ghostTop ghostBottom />
          </div>
          {colColors.map((cc, cIdx) => (
            <div key={`ch-${cIdx}`} className="border border-slate-800 border-b-[3px] bg-white p-1.5">
              <StackedFigureSvg figureId={paintData.figure} topFill={colTop ? cc : EMPTY_PART} bottomFill={colTop ? EMPTY_PART : cc} ghostTop={!colTop} ghostBottom={colTop} />
            </div>
          ))}

          {rowColors.map((rc, rIdx) => (
            <React.Fragment key={`rh-${rIdx}`}>
              <div className="border border-slate-800 border-r-[3px] bg-white p-1.5">
                <StackedFigureSvg figureId={paintData.figure} topFill={colTop ? EMPTY_PART : rc} bottomFill={colTop ? rc : EMPTY_PART} ghostTop={colTop} ghostBottom={!colTop} />
              </div>
              {[0, 1, 2].map((cIdx) => {
                const key = `${rIdx},${cIdx}`;
                const isPre = key === prefilledKey;
                const exp = getExpected(paintData, rIdx, cIdx);
                const topFill = isPre ? exp.top : (studentCells[key]?.top || EMPTY_PART);
                const bottomFill = isPre ? exp.bottom : (studentCells[key]?.bottom || EMPTY_PART);
                return (
                  <div key={key} className={`border border-slate-800 p-1 ${isPre ? 'bg-slate-100' : 'bg-white'}`}>
                    <StackedFigureSvg
                      figureId={paintData.figure}
                      topFill={topFill}
                      bottomFill={bottomFill}
                      onPartClick={!readOnly && !isPre ? (part) => paintPart(rIdx, cIdx, part) : undefined}
                    />
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // --- ESKİ GÖRÜNÜM (eski kayıtlı sorular için) ---
  const handlePaintTarget = (r, c, part, e) => { e.stopPropagation(); paintPart(r, c, part); };
  return (
    <div className="flex flex-col items-center select-none w-full gap-2">
      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 px-2.5 py-0.5 bg-amber-50 border border-amber-200 rounded-full">{title}</span>
      )}
      {!readOnly && <PaletteBar palette={palette} activeColor={activeColor} setActiveColor={setActiveColor} isErasing={isErasing} setIsErasing={setIsErasing} />}
      <div className={`grid grid-cols-4 border-2 ${borderClass} rounded-xl overflow-hidden shadow-sm`} style={{ width: 264, height: 264 }}>
        <div className="border border-slate-800 bg-slate-50" />
        {colColors.map((cc, cIdx) => (
          <div key={`ch-${cIdx}`} className="border border-slate-800 flex items-center justify-center bg-white">
            {variant === 'col_shape_row_bg' ? <InnerTableShapeSvg shape={shapeType} fill={cc} size={34} /> : <div className="w-10 h-10 border-2 border-slate-800" style={{ backgroundColor: cc }} />}
          </div>
        ))}
        {rowColors.map((rc, rIdx) => (
          <React.Fragment key={`rh-${rIdx}`}>
            <div className="border border-slate-800 flex items-center justify-center bg-white">
              {variant === 'col_shape_row_bg' ? <div className="w-10 h-10 border-2 border-slate-800" style={{ backgroundColor: rc }} /> : <InnerTableShapeSvg shape={shapeType} fill={rc} size={34} />}
            </div>
            {[0, 1, 2].map((cIdx) => {
              const key = `${rIdx},${cIdx}`;
              const isPre = key === prefilledKey;
              const expectedBg = variant === 'col_shape_row_bg' ? rowColors[rIdx] : colColors[cIdx];
              const expectedShape = variant === 'col_shape_row_bg' ? colColors[cIdx] : rowColors[rIdx];
              const bgFill = isPre ? expectedBg : (studentCells[key]?.bg || '#ffffff');
              const shapeFill = isPre ? expectedShape : (studentCells[key]?.shape || '#ffffff');
              return (
                <div key={key} className="border border-slate-800 flex items-center justify-center bg-white p-1.5">
                  <div onClick={(e) => handlePaintTarget(rIdx, cIdx, 'bg', e)} style={{ backgroundColor: bgFill }} className="w-11 h-11 border-2 border-slate-800 flex items-center justify-center cursor-pointer transition-colors">
                    <div onClick={(e) => handlePaintTarget(rIdx, cIdx, 'shape', e)} className="flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <InnerTableShapeSvg shape={shapeType} fill={shapeFill} size={28} />
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
