import React, { useState, useEffect } from 'react';
import { BoldArrowSvg, EraserIcon } from '../components/common/Icons';

// --- KODLAMA ŞABLON ÜRETİCİSİ ---
export const getArrowsFromPath = (path = []) => {
  const arrows = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [r1, c1] = path[i].split(',').map(Number);
    const [r2, c2] = path[i + 1].split(',').map(Number);
    if (r2 === r1 - 1 && c2 === c1) arrows.push('up');
    else if (r2 === r1 + 1 && c2 === c1) arrows.push('down');
    else if (r2 === r1 && c2 === c1 - 1) arrows.push('left');
    else if (r2 === r1 && c2 === c1 + 1) arrows.push('right');
  }
  return arrows;
};

export const generateCodingTemplatesForSize = (n, targetCount = 200) => {
  const allPaths = [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const minLen = n === 3 ? 3 : n === 4 ? 4 : n === 5 ? 5 : 6;
  const maxLen = n === 3 ? 6 : n === 4 ? 7 : n === 5 ? 8 : 10;

  const dfs = (r, c, visited, currentPath) => {
    if (allPaths.length >= targetCount) return;
    if (currentPath.length >= minLen && currentPath.length <= maxLen) {
      allPaths.push([...currentPath]);
      if (allPaths.length >= targetCount) return;
    }
    if (currentPath.length >= maxLen) return;

    const shift = (r * 3 + c * 5 + currentPath.length) % 4;
    for (let i = 0; i < 4; i++) {
      const [dr, dc] = dirs[(i + shift) % 4];
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited.has(key)) {
        let adjVisitedCount = 0;
        for (const [ar, ac] of dirs) {
          const checkKey = `${nr + ar},${nc + ac}`;
          if (visited.has(checkKey) && checkKey !== `${r},${c}`) adjVisitedCount++;
        }
        if (adjVisitedCount === 0) {
          visited.add(key);
          currentPath.push(key);
          dfs(nr, nc, visited, currentPath);
          currentPath.pop();
          visited.delete(key);
          if (allPaths.length >= targetCount) return;
        }
      }
    }
  };

  for (let sr = 0; sr < n; sr++) {
    for (let sc = 0; sc < n; sc++) {
      if (allPaths.length >= targetCount) break;
      const startKey = `${sr},${sc}`;
      dfs(sr, sc, new Set([startKey]), [startKey]);
    }
  }

  return allPaths.slice(0, targetCount).map((path, idx) => ({
    id: idx + 1,
    rows: n,
    cols: n,
    path,
    arrows: getArrowsFromPath(path)
  }));
};

export const CODING_TEMPLATES = {
  3: generateCodingTemplatesForSize(3, 100),
  4: generateCodingTemplatesForSize(4, 200),
  5: generateCodingTemplatesForSize(5, 200),
  6: generateCodingTemplatesForSize(6, 200)
};

// ============================================================================
// --- GRUP: 4 & 5. ETKİLEŞİMLİ BİLEŞEN - KODLAMA (CODING ACTIVITY) ---
// ============================================================================
export const buildSegmentArrowSvgString = (x1, y1, x2, y2, color = '#000000') => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return '';
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  const startOffset = len * 0.16;
  const endOffset = len * 0.16;
  const sx = x1 + ux * startOffset;
  const sy = y1 + uy * startOffset;
  const tipX = x2 - ux * endOffset;
  const tipY = y2 - uy * endOffset;

  const headLen = Math.min(13, len * 0.28);
  const headWidth = Math.min(8, len * 0.19);
  const shaftEndX = tipX - ux * (headLen * 0.7);
  const shaftEndY = tipY - uy * (headLen * 0.7);

  const b1x = tipX - ux * headLen + px * headWidth;
  const b1y = tipY - uy * headLen + py * headWidth;
  const b2x = tipX - ux * headLen - px * headWidth;
  const b2y = tipY - uy * headLen - py * headWidth;

  return `<line x1="${sx}" y1="${sy}" x2="${shaftEndX}" y2="${shaftEndY}" stroke="${color}" stroke-width="4" stroke-linecap="round" /><polygon points="${tipX},${tipY} ${b1x},${b1y} ${b2x},${b2y}" fill="${color}" />`;
};

export const generateCodingGridSvgDataUrl = (codingData = {}) => {
  const n = Math.max(3, Math.min(6, Number(codingData.rows) || 3));
  const mode = codingData.mode || 'box';
  const method = codingData.method || 'method1';
  const path = codingData.path || ['0,0', '0,1', '1,1'];
  const startKey = path[0] || '0,0';
  const targetKey = path[path.length - 1] || `${n - 1},${n - 1}`;
  const pathSet = new Set(path);
  const size = 240;
  const pad = 28;

  let svgInner = '';
  if (mode === 'line') {
    const step = (size - pad * 2) / (n - 1);
    const getX = (c) => pad + c * step;
    const getY = (r) => pad + r * step;

    for (let r = 0; r < n - 1; r++) {
      for (let c = 0; c < n - 1; c++) {
        const bx = getX(c) + 1.5;
        const by = getY(r) + 1.5;
        const bw = Math.max(4, step - 3);
        svgInner += `<rect x="${bx}" y="${by}" width="${bw}" height="${bw}" fill="#ffffff" stroke="#3b82f6" stroke-width="2" />`;
      }
    }
    for (let i = 0; i < path.length - 1; i++) {
      const [r1, c1] = path[i].split(',').map(Number);
      const [r2, c2] = path[i + 1].split(',').map(Number);
      if (method === 'method3') {
        svgInner += `<line x1="${getX(c1)}" y1="${getY(r1)}" x2="${getX(c2)}" y2="${getY(r2)}" stroke="#000000" stroke-width="6" stroke-linecap="round" />`;
      } else {
        svgInner += buildSegmentArrowSvgString(getX(c1), getY(r1), getX(c2), getY(r2), '#000000');
      }
    }
    const [sr, sc] = startKey.split(',').map(Number);
    const [tr, tc] = targetKey.split(',').map(Number);
    svgInner += `<text x="${getX(sc)}" y="${getY(sr) + 8}" font-size="24" text-anchor="middle">🐶</text>`;
    svgInner += `<text x="${getX(tc)}" y="${getY(tr) + 8}" font-size="24" text-anchor="middle">🦴</text>`;
  } else {
    const gap = 4;
    const cellSize = (size - pad * 2 - gap * (n - 1)) / n;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const key = `${r},${c}`;
        const x = pad + c * (cellSize + gap);
        const y = pad + r * (cellSize + gap);
        const isPath = pathSet.has(key) && key !== startKey && key !== targetKey;
        const fill = isPath ? '#84cc16' : '#ffffff';
        svgInner += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="#1e293b" stroke-width="2" />`;
        if (key === startKey) {
          svgInner += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2 + 8}" font-size="${Math.round(cellSize * 0.55)}" text-anchor="middle">🐶</text>`;
        } else if (key === targetKey) {
          svgInner += `<text x="${x + cellSize / 2}" y="${y + cellSize / 2 + 8}" font-size="${Math.round(cellSize * 0.55)}" text-anchor="middle">🦴</text>`;
        }
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="100%" height="100%" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>${svgInner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const checkCodingQuestionAnswer = (codingData = {}, studentResponse = {}) => {
  const method = codingData.method || 'method1';
  const targetPath = codingData.path || [];
  const targetArrows = codingData.arrows || getArrowsFromPath(targetPath);

  if (method === 'method1' || method === 'method3') {
    const stuArrows = studentResponse.arrows || [];
    if (stuArrows.length !== targetArrows.length) return false;
    return targetArrows.every((dir, idx) => stuArrows[idx] === dir);
  } else {
    const stuMarked = new Set(studentResponse.markedCells || []);
    const startKey = targetPath[0];
    const middlePath = targetPath.slice(1, -1);

    const stuWithoutStart = Array.from(stuMarked).filter(k => k !== startKey);
    const expectedWithEnd = new Set(targetPath.slice(1));
    const expectedMiddleOnly = new Set(middlePath);

    const matchWithEnd =
      stuWithoutStart.length === expectedWithEnd.size &&
      stuWithoutStart.every(k => expectedWithEnd.has(k));

    const matchMiddleOnly =
      expectedMiddleOnly.size > 0 &&
      stuWithoutStart.length === expectedMiddleOnly.size &&
      stuWithoutStart.every(k => expectedMiddleOnly.has(k));

    return matchWithEnd || matchMiddleOnly;
  }
};

export const CodingActivityPad = ({
  mode = 'box',
  method = 'method1',
  rows = 3,
  cols = 3,
  path = ['0,0', '0,1', '1,1'],
  startImage = "",
  targetImage = "",
  studentArrows = [],
  onChangeStudentArrows,
  studentMarkedCells = [],
  onChangeStudentMarkedCells,
  isTeacherEditor = false,
  onChangeTeacherPath,
  readOnly = false,
  size = 240,
  title = "",
  status = null
}) => {
  const nR = Math.max(2, Math.min(6, Number(rows) || 3));
  const nC = Math.max(2, Math.min(6, Number(cols) || 3));
  const correctArrows = getArrowsFromPath(path);
  const startKey = path[0] || '0,0';
  const targetKey = path[path.length - 1] || `${nR - 1},${nC - 1}`;

  const [activeSlotIdx, setActiveSlotIdx] = useState(0);
  const [isLinePointerDown, setIsLinePointerDown] = useState(false);

  useEffect(() => {
    const up = () => setIsLinePointerDown(false);
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);

  useEffect(() => {
    setActiveSlotIdx(0);
  }, [path.join('|'), mode, method]);

  useEffect(() => {
    if (!studentArrows || studentArrows.length === 0 || studentArrows.every(a => !a)) {
      setActiveSlotIdx(0);
    }
  }, [studentArrows]);

  const handleTeacherCellClick = (r, c) => {
    if (!isTeacherEditor || !onChangeTeacherPath) return;
    const key = `${r},${c}`;
    const existingIdx = path.indexOf(key);
    if (existingIdx !== -1) {
      if (existingIdx === 0 && path.length === 1) return;
      onChangeTeacherPath(path.slice(0, existingIdx + 1));
      return;
    }
    if (path.length === 0) {
      onChangeTeacherPath([key]);
      return;
    }
    const [lastR, lastC] = path[path.length - 1].split(',').map(Number);
    const dist = Math.abs(r - lastR) + Math.abs(c - lastC);
    if (dist === 1) {
      onChangeTeacherPath([...path, key]);
    } else {
      onChangeTeacherPath([key]);
    }
  };

  const handleStudentCellToggle = (r, c) => {
    if (readOnly || isTeacherEditor || method !== 'method2' || !onChangeStudentMarkedCells) return;
    const key = `${r},${c}`;
    if (key === startKey) return;
    const existsIdx = studentMarkedCells.indexOf(key);
    if (existsIdx !== -1) {
      if (mode === 'line') {
        onChangeStudentMarkedCells(studentMarkedCells.slice(0, existsIdx));
      } else {
        onChangeStudentMarkedCells(studentMarkedCells.filter(k => k !== key));
      }
      return;
    }
    if (mode === 'line') {
      const chain = [startKey, ...studentMarkedCells];
      const lastKey = chain[chain.length - 1];
      const [lr, lc] = lastKey.split(',').map(Number);
      if (Math.abs(r - lr) + Math.abs(c - lc) === 1) {
        onChangeStudentMarkedCells([...studentMarkedCells, key]);
      }
    } else {
      onChangeStudentMarkedCells([...studentMarkedCells, key]);
    }
  };

  // Çizgiye dokunulduğunda veya parmakla üzerinden geçildiğinde otomatik ok/yol koyar
  const handleLineSegmentClick = (kA, kB, isDragMove = false) => {
    if (readOnly) return;
    if (isTeacherEditor && onChangeTeacherPath) {
      const lastKey = path[path.length - 1];
      if (lastKey === kA && !path.includes(kB)) {
        onChangeTeacherPath([...path, kB]);
      } else if (lastKey === kB && !path.includes(kA)) {
        onChangeTeacherPath([...path, kA]);
      } else if (!isDragMove && path.length >= 2 && path[path.length - 2] === kA && lastKey === kB) {
        onChangeTeacherPath(path.slice(0, -1));
      } else if (!isDragMove && path.length >= 2 && path[path.length - 2] === kB && lastKey === kA) {
        onChangeTeacherPath(path.slice(0, -1));
      } else if (!isDragMove) {
        const idxA = path.indexOf(kA);
        const idxB = path.indexOf(kB);
        if (idxA !== -1 && !path.includes(kB)) {
          onChangeTeacherPath([...path.slice(0, idxA + 1), kB]);
        } else if (idxB !== -1 && !path.includes(kA)) {
          onChangeTeacherPath([...path.slice(0, idxB + 1), kA]);
        }
      }
      return;
    }
    if (!isTeacherEditor && method === 'method2' && onChangeStudentMarkedCells) {
      const chain = [startKey, ...studentMarkedCells];
      const lastKey = chain[chain.length - 1];
      if (lastKey === kA && !chain.includes(kB)) {
        onChangeStudentMarkedCells([...studentMarkedCells, kB]);
      } else if (lastKey === kB && !chain.includes(kA)) {
        onChangeStudentMarkedCells([...studentMarkedCells, kA]);
      } else if (!isDragMove && chain.length >= 2 && chain[chain.length - 2] === kA && lastKey === kB) {
        onChangeStudentMarkedCells(studentMarkedCells.slice(0, -1));
      } else if (!isDragMove && chain.length >= 2 && chain[chain.length - 2] === kB && lastKey === kA) {
        onChangeStudentMarkedCells(studentMarkedCells.slice(0, -1));
      } else if (!isDragMove) {
        const idxA = chain.indexOf(kA);
        const idxB = chain.indexOf(kB);
        if (idxA !== -1 && !chain.includes(kB)) {
          const nextChain = [...chain.slice(0, idxA + 1), kB];
          onChangeStudentMarkedCells(nextChain.slice(1));
        } else if (idxB !== -1 && !chain.includes(kA)) {
          const nextChain = [...chain.slice(0, idxB + 1), kA];
          onChangeStudentMarkedCells(nextChain.slice(1));
        }
      }
    }
  };

  const handleArrowPick = (dir) => {
    if (readOnly || !onChangeStudentArrows) return;
    const totalSlots = correctArrows.length;
    if (totalSlots === 0) return;

    const next = [...studentArrows];
    while (next.length < totalSlots) next.push(null);

    const targetSlot = activeSlotIdx < totalSlots ? activeSlotIdx : totalSlots - 1;
    next[targetSlot] = dir;
    onChangeStudentArrows(next);

    const nextEmpty = next.findIndex((val, i) => i > targetSlot && !val);
    if (nextEmpty !== -1) setActiveSlotIdx(nextEmpty);
    else if (targetSlot + 1 < totalSlots) setActiveSlotIdx(targetSlot + 1);
  };

  const handleEraseArrowSlot = () => {
    if (readOnly || !onChangeStudentArrows) return;
    const next = [...studentArrows];
    if (next[activeSlotIdx]) {
      next[activeSlotIdx] = null;
      onChangeStudentArrows(next);
    } else if (activeSlotIdx > 0) {
      next[activeSlotIdx - 1] = null;
      setActiveSlotIdx(activeSlotIdx - 1);
      onChangeStudentArrows(next);
    }
  };

  let borderClass = "border-slate-200 bg-white";
  if (status === 'correct') borderClass = "border-green-500 bg-green-50/40 ring-4 ring-green-100";
  else if (status === 'wrong') borderClass = "border-red-500 bg-red-50/40 ring-4 ring-red-100";

  const isArrowFindingMethod = method === 'method1' || method === 'method3';
  const showTeacherPathOnGrid = isTeacherEditor || isArrowFindingMethod;
  const displayedPathSet = new Set(showTeacherPathOnGrid ? path : studentMarkedCells);

  const getLineSegmentsToRender = () => {
    if (showTeacherPathOnGrid) {
      const segs = [];
      for (let i = 0; i < path.length - 1; i++) {
        segs.push([path[i], path[i + 1]]);
      }
      return segs;
    } else {
      const ordered = [startKey, ...studentMarkedCells];
      const segs = [];
      for (let i = 0; i < ordered.length - 1; i++) {
        const [r1, c1] = ordered[i].split(',').map(Number);
        const [r2, c2] = ordered[i + 1].split(',').map(Number);
        if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
          segs.push([ordered[i], ordered[i + 1]]);
        }
      }
      return segs;
    }
  };

  const lineSegments = mode === 'line' ? getLineSegmentsToRender() : [];

  const renderReactArrowOnSegment = (x1, y1, x2, y2, key) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return null;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;

    const startOffset = len * 0.16;
    const endOffset = len * 0.16;
    const sx = x1 + ux * startOffset;
    const sy = y1 + uy * startOffset;
    const tipX = x2 - ux * endOffset;
    const tipY = y2 - uy * endOffset;

    const headLen = Math.min(16, len * 0.28);
    const headWidth = Math.min(10, len * 0.2);
    const shaftEndX = tipX - ux * (headLen * 0.65);
    const shaftEndY = tipY - uy * (headLen * 0.65);

    const b1x = tipX - ux * headLen + px * headWidth;
    const b1y = tipY - uy * headLen + py * headWidth;
    const b2x = tipX - ux * headLen - px * headWidth;
    const b2y = tipY - uy * headLen - py * headWidth;

    return (
      <g key={key} className="pointer-events-none">
        <line
          x1={sx}
          y1={sy}
          x2={shaftEndX}
          y2={shaftEndY}
          stroke="#000000"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <polygon
          points={`${tipX},${tipY} ${b1x},${b1y} ${b2x},${b2y}`}
          fill="#000000"
        />
      </g>
    );
  };

  const renderReactPlainLineOnSegment = (x1, y1, x2, y2, key) => {
    return (
      <line
        key={key}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#000000"
        strokeWidth="6.5"
        strokeLinecap="round"
        className="pointer-events-none"
      />
    );
  };

  const allGridSegments = [];
  if (mode === 'line' && (isTeacherEditor || method === 'method2')) {
    for (let r = 0; r < nR; r++) {
      for (let c = 0; c < nC; c++) {
        if (c + 1 < nC) allGridSegments.push([`${r},${c}`, `${r},${c + 1}`]);
        if (r + 1 < nR) allGridSegments.push([`${r},${c}`, `${r + 1},${c}`]);
      }
    }
  }

  return (
    <div className="flex flex-col items-center select-none w-full">
      {title && (
        <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 mb-1 px-2.5 py-0.5 bg-purple-50 border border-purple-200 rounded-full text-center">
          {title}
        </span>
      )}

      {(method === 'method2' || isTeacherEditor) && correctArrows.length > 0 && (
        <div className="flex flex-row flex-nowrap items-center justify-center gap-1 mb-1.5 bg-slate-100 px-2.5 py-1 rounded-2xl border-2 border-slate-200 max-w-[95vw] overflow-x-auto">
          <span className="text-[10px] font-black text-slate-500 uppercase mr-1 shrink-0">Oklar:</span>
          {correctArrows.map((dir, i) => (
            <div key={i} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 border-2 border-amber-600 shadow-sm flex items-center justify-center shrink-0">
              <BoldArrowSvg dir={dir} size={20} color="#1e293b" />
            </div>
          ))}
          {!readOnly && !isTeacherEditor && method === 'method2' && (
            <button
              type="button"
              onClick={() => onChangeStudentMarkedCells && onChangeStudentMarkedCells([])}
              className="w-8 h-8 sm:w-9 sm:h-9 ml-1 rounded-xl bg-pink-50 hover:bg-pink-100 border-2 border-pink-300 flex items-center justify-center active:scale-90 transition-all shadow-sm shrink-0"
              title="Yolu Temizle"
            >
              <EraserIcon size={20} />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col items-center justify-center w-full">
        {mode === 'line' ? (
          <div
            className={`relative rounded-3xl border-2 shadow-inner p-3 transition-all ${borderClass}`}
            style={{ width: size, height: size, maxWidth: '90vw', maxHeight: '90vw' }}
            onPointerLeave={() => setIsLinePointerDown(false)}
          >
            <svg className="absolute inset-0 w-full h-full touch-none" viewBox="0 0 300 300">
              {Array.from({ length: nR - 1 }).map((_, r) =>
                Array.from({ length: nC - 1 }).map((__, c) => {
                  const stepW = 224 / (nC - 1);
                  const stepH = 224 / (nR - 1);
                  const bx = 38 + c * stepW + 1.5;
                  const by = 38 + r * stepH + 1.5;
                  return (
                    <rect
                      key={`box-${r}-${c}`}
                      x={bx}
                      y={by}
                      width={Math.max(4, stepW - 3)}
                      height={Math.max(4, stepH - 3)}
                      fill="#ffffff"
                      stroke="#3b82f6"
                      strokeWidth="2.2"
                      className="pointer-events-none"
                    />
                  );
                })
              )}

              {lineSegments.map(([k1, k2], idx) => {
                const [r1, c1] = k1.split(',').map(Number);
                const [r2, c2] = k2.split(',').map(Number);
                const x1 = nC <= 1 ? 150 : 38 + (c1 * 224) / (nC - 1);
                const y1 = nR <= 1 ? 150 : 38 + (r1 * 224) / (nR - 1);
                const x2 = nC <= 1 ? 150 : 38 + (c2 * 224) / (nC - 1);
                const y2 = nR <= 1 ? 150 : 38 + (r2 * 224) / (nR - 1);
                if (method === 'method3') {
                  return renderReactPlainLineOnSegment(x1, y1, x2, y2, `seg-line-${idx}`);
                }
                return renderReactArrowOnSegment(x1, y1, x2, y2, `seg-arrow-${idx}`);
              })}

              {/* Çizgilerin Tam Üzerinde Geniş Dokunma Alanı: Noktaya Değil Çizgiye Dokununca da Ok/Yol Koyar */}
              {!readOnly && (isTeacherEditor || method === 'method2') && allGridSegments.map(([kA, kB], idx) => {
                const [r1, c1] = kA.split(',').map(Number);
                const [r2, c2] = kB.split(',').map(Number);
                const x1 = nC <= 1 ? 150 : 38 + (c1 * 224) / (nC - 1);
                const y1 = nR <= 1 ? 150 : 38 + (r1 * 224) / (nR - 1);
                const x2 = nC <= 1 ? 150 : 38 + (c2 * 224) / (nC - 1);
                const y2 = nR <= 1 ? 150 : 38 + (r2 * 224) / (nR - 1);
                return (
                  <line
                    key={`hit-seg-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth="36"
                    strokeLinecap="round"
                    className="cursor-pointer"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      if (e.target.releasePointerCapture && e.pointerId !== undefined) {
                        try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
                      }
                      setIsLinePointerDown(true);
                      handleLineSegmentClick(kA, kB, false);
                    }}
                    onPointerEnter={() => {
                      if (isLinePointerDown) {
                        handleLineSegmentClick(kA, kB, true);
                      }
                    }}
                  />
                );
              })}
            </svg>

            {Array.from({ length: nR }).map((_, r) =>
              Array.from({ length: nC }).map((__, c) => {
                const key = `${r},${c}`;
                const leftPct = nC <= 1 ? 50 : 12.66 + (c * 74.66) / (nC - 1);
                const topPct = nR <= 1 ? 50 : 12.66 + (r * 74.66) / (nR - 1);
                const isStart = key === startKey;
                const isTarget = key === targetKey;
                const nodeSize = Math.max(nR, nC) >= 5 ? 24 : 28;

                if (!isStart && !isTarget && !isTeacherEditor && isArrowFindingMethod) {
                  return null;
                }

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={readOnly || (!isTeacherEditor && isArrowFindingMethod)}
                    onPointerDown={(e) => {
                      if (readOnly) return;
                      if (e.target.releasePointerCapture && e.pointerId !== undefined) {
                        try { e.target.releasePointerCapture(e.pointerId); } catch (_) {}
                      }
                      setIsLinePointerDown(true);
                      if (isTeacherEditor) handleTeacherCellClick(r, c);
                      else handleStudentCellToggle(r, c);
                    }}
                    onPointerEnter={() => {
                      if (!readOnly && isLinePointerDown) {
                        if (isTeacherEditor) handleTeacherCellClick(r, c);
                        else handleStudentCellToggle(r, c);
                      }
                    }}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: nodeSize,
                      height: nodeSize,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className={`absolute rounded-full flex items-center justify-center transition-all ${
                      isStart || isTarget
                        ? 'bg-transparent z-20 scale-110'
                        : (isTeacherEditor || method === 'method2')
                          ? 'bg-transparent hover:bg-blue-200/40 cursor-pointer z-10'
                          : 'pointer-events-none'
                    }`}
                  >
                    {isStart && (startImage ? <img src={startImage} className="w-9 h-9 object-contain drop-shadow" alt="köpek" /> : <span className="text-2xl sm:text-3xl drop-shadow">🐶</span>)}
                    {isTarget && !isStart && (targetImage ? <img src={targetImage} className="w-9 h-9 object-contain drop-shadow" alt="kemik" /> : <span className="text-2xl sm:text-3xl drop-shadow">🦴</span>)}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div
            className={`relative rounded-2xl border-2 border-slate-800 shadow-inner p-1.5 transition-all flex items-center justify-center ${borderClass}`}
            style={{ width: size, height: size, maxWidth: '90vw', maxHeight: '90vw' }}
          >
            <div
              className="w-full h-full grid gap-1 touch-none"
              style={{
                gridTemplateColumns: `repeat(${nC}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${nR}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: nR }).map((_, r) =>
                Array.from({ length: nC }).map((__, c) => {
                  const key = `${r},${c}`;
                  const isStart = key === startKey;
                  const isTarget = key === targetKey;
                  const isMarked = displayedPathSet.has(key);

                  let cellBg = "bg-white border-slate-800";
                  if (isMarked && !isStart && !isTarget) {
                    cellBg = "bg-[#84cc16] border-slate-900";
                  } else if (isMarked && isTarget && !showTeacherPathOnGrid) {
                    cellBg = "bg-[#84cc16] border-slate-900";
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={readOnly || (!isTeacherEditor && isArrowFindingMethod)}
                      onClick={() => isTeacherEditor ? handleTeacherCellClick(r, c) : handleStudentCellToggle(r, c)}
                      className={`w-full h-full border-2 flex items-center justify-center transition-all ${cellBg} ${
                        !readOnly && (isTeacherEditor || method === 'method2') ? 'hover:opacity-80 active:scale-95 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      {isStart && (startImage ? <img src={startImage} className="w-9 h-9 object-contain" alt="köpek" /> : <span className="text-2xl sm:text-3xl">🐶</span>)}
                      {isTarget && !isStart && (targetImage ? <img src={targetImage} className="w-9 h-9 object-contain" alt="kemik" /> : <span className="text-2xl sm:text-3xl">🦴</span>)}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {!isTeacherEditor && isArrowFindingMethod && correctArrows.length > 0 && (
        <div className="flex flex-col items-center gap-1.5 mt-1.5 w-full">
          <div className="flex flex-row flex-nowrap items-center justify-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-2xl border-2 border-slate-200 max-w-[95vw] overflow-x-auto">
            {Array.from({ length: correctArrows.length }).map((_, i) => {
              const stuDir = studentArrows[i];
              const isSelectedSlot = !readOnly && activeSlotIdx === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={readOnly}
                  onClick={() => setActiveSlotIdx(i)}
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                    stuDir
                      ? 'bg-amber-400 border-amber-600 shadow-sm'
                      : 'bg-white border-slate-300'
                  } ${isSelectedSlot ? 'ring-4 ring-indigo-400 scale-105 z-10' : ''}`}
                >
                  {stuDir ? (
                    <BoldArrowSvg dir={stuDir} size={20} color="#1e293b" />
                  ) : (
                    <span className="text-xs font-black text-slate-300">{i + 1}</span>
                  )}
                </button>
              );
            })}
          </div>

          {!readOnly && (
            <div className="flex flex-row flex-nowrap items-center justify-center gap-1.5 bg-white px-2.5 py-1 rounded-2xl border-2 border-slate-200 shadow-sm">
              {['up', 'down', 'left', 'right'].map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => handleArrowPick(dir)}
                  className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-800 shadow flex items-center justify-center active:scale-90 transition-all shrink-0"
                  title="Ok Ekle"
                >
                  <BoldArrowSvg dir={dir} size={22} color="#ffffff" />
                </button>
              ))}
              <button
                type="button"
                onClick={handleEraseArrowSlot}
                className="w-9 h-9 rounded-xl bg-pink-50 hover:bg-pink-100 border-2 border-pink-300 flex items-center justify-center active:scale-90 transition-all shrink-0"
                title="Silgi"
              >
                <EraserIcon size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
