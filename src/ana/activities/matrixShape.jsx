import React, { useState } from 'react';
import { createSeededRng } from './shared';
import { EraserIcon } from '../components/common/Icons';

// ============================================================================
// --- GRUP: 8. ETKİLEŞİMLİ BİLEŞEN - TABLO OLUŞTURMA (MATRIX SHAPE) ---
// ============================================================================
export const OUTER_SHAPES = ['triangle', 'square', 'pentagon', 'hexagon', 'star'];

export const INNER_SHAPES = ['circle', 'diamond', 'heart', 'square'];

export const MATRIX_PALETTE = ['#dc2626', '#84cc16', '#8b5cf6', '#f59e0b', '#ec4899', '#94a3b8', '#06b6d4', '#3b82f6'];

export const generateMatrixShapeTemplates = (count = 200) => {
  const rng = createSeededRng(20260808);
  const templates = [];
  for (let i = 0; i < count; i++) {
    const outerShape = OUTER_SHAPES[i % OUTER_SHAPES.length];
    const innerShape = INNER_SHAPES[Math.floor(i / OUTER_SHAPES.length) % INNER_SHAPES.length];
    const shuffledColors = [...MATRIX_PALETTE].sort(() => rng() - 0.5);
    const colColors = shuffledColors.slice(0, 3);
    const rowColors = shuffledColors.slice(3, 6);
    const prefilledKey = `${Math.floor(rng() * 3)},${Math.floor(rng() * 3)}`;
    templates.push({
      id: i + 1,
      outerShape,
      innerShape,
      colColors,
      rowColors,
      prefilledKey
    });
  }
  return templates;
};

export const MATRIX_SHAPE_TEMPLATES = generateMatrixShapeTemplates(200);

export const CombinedShapeSvg = ({ outerShape = 'triangle', innerShape = 'circle', outerColor = '#dc2626', innerColor = '#eab308', outlineOnly = false, size = 46 }) => {
  const renderOuter = () => {
    const fill = outlineOnly ? '#ffffff' : outerColor;
    const stroke = outlineOnly ? '#1e293b' : outerColor;
    if (outerShape === 'square') return <rect x="12" y="12" width="76" height="76" rx="8" fill={fill} stroke={stroke} strokeWidth="5" />;
    if (outerShape === 'pentagon') return <polygon points="50,8 92,38 76,88 24,88 8,38" fill={fill} stroke={stroke} strokeWidth="5" />;
    if (outerShape === 'hexagon') return <polygon points="50,8 88,28 88,72 50,92 12,72 12,28" fill={fill} stroke={stroke} strokeWidth="5" />;
    if (outerShape === 'star') return <polygon points="50,6 63,35 95,38 70,59 78,90 50,73 22,90 30,59 5,38 37,35" fill={fill} stroke={stroke} strokeWidth="4" />;
    return <polygon points="50,10 90,86 10,86" fill={fill} stroke={stroke} strokeWidth="5" />;
  };

  const renderInner = () => {
    if (!innerShape) return null;
    const fill = outlineOnly ? '#ffffff' : innerColor;
    const stroke = outlineOnly ? '#1e293b' : '#ffffff';
    const cy = outerShape === 'triangle' ? 62 : outerShape === 'star' ? 55 : 52;
    // İç şekiller büyütüldü (çocukların kolayca görebilmesi için)
    if (innerShape === 'diamond') return <polygon points={`50,${cy - 22} 72,${cy} 50,${cy + 22} 28,${cy}`} fill={fill} stroke={stroke} strokeWidth="3.5" />;
    if (innerShape === 'square') return <rect x="32" y={cy - 18} width="36" height="36" rx="5" fill={fill} stroke={stroke} strokeWidth="3.5" />;
    if (innerShape === 'heart') return <path d={`M50 ${cy + 18} C26 ${cy + 3}, 24 ${cy - 18}, 40 ${cy - 18} C46 ${cy - 18}, 50 ${cy - 12}, 50 ${cy - 12} C50 ${cy - 12}, 54 ${cy - 18}, 60 ${cy - 18} C76 ${cy - 18}, 74 ${cy + 3}, 50 ${cy + 18} Z`} fill={fill} stroke={stroke} strokeWidth="3" />;
    return <circle cx="50" cy={cy} r="20" fill={fill} stroke={stroke} strokeWidth="3.5" />;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
      {renderOuter()}
      {renderInner()}
    </svg>
  );
};

export const generateMatrixShapeSvgDataUrl = (mData = {}) => {
  const c0 = mData.colColors?.[0] || '#dc2626';
  const c1 = mData.colColors?.[1] || '#84cc16';
  const c2 = mData.colColors?.[2] || '#8b5cf6';
  const r0 = mData.rowColors?.[0] || '#eab308';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240"><rect width="100%" height="100%" rx="20" fill="#ffffff" stroke="#1e293b" stroke-width="4"/><line x1="65" y1="10" x2="65" y2="230" stroke="#1e293b" stroke-width="3"/><line x1="10" y1="65" x2="230" y2="65" stroke="#1e293b" stroke-width="3"/><polygon points="92,18 112,55 72,55" fill="${c0}"/><polygon points="147,18 167,55 127,55" fill="${c1}"/><polygon points="202,18 222,55 182,55" fill="${c2}"/><circle cx="37" cy="95" r="16" fill="${r0}"/><polygon points="147,75 167,112 127,112" fill="${c1}"/><circle cx="147" cy="100" r="8" fill="${r0}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const checkMatrixShapeAnswer = (mData = {}, studentCells = {}) => {
  const prefilled = mData.prefilledKey || '1,1';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const key = `${r},${c}`;
      if (key === prefilled) continue;
      if (studentCells[key] !== key) return false;
    }
  }
  return true;
};

export const MatrixShapePad = ({
  matrixData = {},
  studentCells = {},
  onChangeStudentCells,
  readOnly = false,
  title = "",
  status = null
}) => {
  const outerShape = matrixData.outerShape || 'triangle';
  const innerShape = matrixData.innerShape || 'circle';
  const colColors = matrixData.colColors || ['#dc2626', '#84cc16', '#8b5cf6'];
  const rowColors = matrixData.rowColors || ['#f59e0b', '#ec4899', '#94a3b8'];
  const prefilledKey = matrixData.prefilledKey || '1,1';

  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isErasing, setIsErasing] = useState(false);

  const allOptionKeys = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const k = `${r},${c}`;
      if (k !== prefilledKey) allOptionKeys.push(k);
    }
  }

  const handleCellClick = (r, c) => {
    if (readOnly || !onChangeStudentCells) return;
    const key = `${r},${c}`;
    if (key === prefilledKey) return;
    const next = { ...studentCells };
    if (isErasing) {
      delete next[key];
    } else if (selectedPiece) {
      Object.keys(next).forEach(k => { if (next[k] === selectedPiece) delete next[k]; });
      next[key] = selectedPiece;
    } else if (next[key]) {
      delete next[key];
    }
    onChangeStudentCells(next);
  };

  let borderClass = "border-slate-800 bg-white";
  if (status === 'correct') borderClass = "border-green-600 bg-green-50/30 ring-4 ring-green-200";
  else if (status === 'wrong') borderClass = "border-red-600 bg-red-50/30 ring-4 ring-red-200";

  return (
    <div className="flex flex-col items-center select-none w-full gap-2">
      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full">
          {title}
        </span>
      )}

      <div className={`grid grid-cols-4 border-2 ${borderClass} rounded-2xl overflow-hidden shadow-sm`} style={{ width: 'min(340px, 92vw)', height: 'min(340px, 92vw)' }}>
        <div className="border border-slate-800 flex items-center justify-center bg-slate-50">
          <CombinedShapeSvg outerShape={outerShape} innerShape={innerShape} outlineOnly={true} size="86%" />
        </div>
        {colColors.map((cc, cIdx) => (
          <div key={`col-${cIdx}`} className="border border-slate-800 flex items-center justify-center bg-white">
            <CombinedShapeSvg outerShape={outerShape} innerShape={null} outerColor={cc} size="90%" />
          </div>
        ))}

        {rowColors.map((rc, rIdx) => (
          <React.Fragment key={`row-${rIdx}`}>
            <div className="border border-slate-800 flex items-center justify-center bg-white">
              <CombinedShapeSvg outerShape={innerShape === 'circle' ? 'hexagon' : 'square'} innerShape={innerShape} outerColor="transparent" innerColor={rc} size="96%" />
            </div>
            {[0, 1, 2].map((cIdx) => {
              const cellKey = `${rIdx},${cIdx}`;
              const isPrefilled = cellKey === prefilledKey;
              const chosenPiece = isPrefilled ? cellKey : studentCells[cellKey];
              let pieceR = null, pieceC = null;
              if (chosenPiece) {
                [pieceR, pieceC] = chosenPiece.split(',').map(Number);
              }
              return (
                <button
                  key={cellKey}
                  type="button"
                  disabled={readOnly || isPrefilled}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  className={`border border-slate-800 flex items-center justify-center transition-all ${
                    isPrefilled ? 'bg-slate-100/70' : 'bg-white hover:bg-indigo-50/50 cursor-pointer'
                  }`}
                >
                  {chosenPiece !== undefined && pieceR !== null && (
                    <CombinedShapeSvg
                      outerShape={outerShape}
                      innerShape={innerShape}
                      outerColor={colColors[pieceC]}
                      innerColor={rowColors[pieceR]}
                      size="90%"
                    />
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {!readOnly && (
        <div className="flex flex-col items-center gap-1.5 bg-slate-50 p-2 rounded-2xl border-2 border-dashed border-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase">Alttan Parça Seç ve Tabloya Yerleştir:</span>
            <button
              type="button"
              onClick={() => { setIsErasing(!isErasing); setSelectedPiece(null); }}
              className={`p-1 rounded-lg border ${isErasing ? 'bg-pink-100 border-pink-500' : 'bg-white border-slate-300'}`}
              title="Silgi"
            >
              <EraserIcon size={18} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {allOptionKeys.map((k) => {
              const [pr, pc] = k.split(',').map(Number);
              const isUsed = Object.values(studentCells).includes(k);
              const isSel = !isErasing && selectedPiece === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => { setIsErasing(false); setSelectedPiece(k); }}
                  className={`p-1 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                    isSel ? 'border-indigo-600 bg-indigo-50 scale-110 shadow' : 'border-slate-400 bg-white'
                  } ${isUsed ? 'opacity-40' : ''}`}
                >
                  <CombinedShapeSvg
                    outerShape={outerShape}
                    innerShape={innerShape}
                    outerColor={colColors[pc]}
                    innerColor={rowColors[pr]}
                    size={58}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
