import React, { useState, useEffect, useRef } from 'react';
import { createSeededRng } from './shared';
import { EraserIcon } from '../components/common/Icons';

// ============================================================================
// --- GRUP: 11. ETKİLEŞİMLİ BİLEŞEN - LABİRENT (MAZE) ---
// ============================================================================
// ÖNEMLİ: Firestore iç içe dizileri (array içinde array) KABUL ETMEZ.
// Bu yüzden labirent duvarları "gridRows" alanında satır satır metin olarak
// ("0101...") saklanır. Eski "grid" (matris) biçimi sadece okunurken desteklenir.

// Seviyeler: Kolay = eski "zor" (9x9). Orta ve Zor bundan daha zordur.
export const MAZE_LEVELS = {
  easy: { size: 9, label: 'Kolay', algo: 'backtracker', candidates: 1, seed: 33 },
  medium: { size: 11, label: 'Orta', algo: 'backtracker', candidates: 6, seed: 44 },
  hard: { size: 13, label: 'Zor', algo: 'growing', candidates: 10, seed: 55 }
};

const DIRS4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const shuffleWithRng = (arr, rng) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Tek çözümlü (mükemmel) labirent - özyinelemeli geri izleme (uzun koridorlar)
const carveBacktracker = (n, rng) => {
  const grid = Array.from({ length: n }, () => Array(n).fill(1));
  const stack = [[0, 0]];
  grid[0][0] = 0;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const options = shuffleWithRng([[-2, 0], [2, 0], [0, -2], [0, 2]], rng).filter(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      return nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 1;
    });
    if (options.length === 0) { stack.pop(); continue; }
    const [dr, dc] = options[0];
    grid[r + dr / 2][c + dc / 2] = 0;
    grid[r + dr][c + dc] = 0;
    stack.push([r + dr, c + dc]);
  }
  return grid;
};

// Tek çözümlü labirent - "büyüyen ağaç" (uzun yol + çok sayıda yan dal ve çıkmaz sokak)
const carveGrowingTree = (n, rng, newestBias = 0.7) => {
  const grid = Array.from({ length: n }, () => Array(n).fill(1));
  grid[0][0] = 0;
  const active = [[0, 0]];
  while (active.length) {
    const idx = rng() < newestBias ? active.length - 1 : Math.floor(rng() * active.length);
    const [r, c] = active[idx];
    const options = shuffleWithRng([[-2, 0], [2, 0], [0, -2], [0, 2]], rng).filter(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      return nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 1;
    });
    if (options.length === 0) { active.splice(idx, 1); continue; }
    const [dr, dc] = options[0];
    grid[r + dr / 2][c + dc / 2] = 0;
    grid[r + dr][c + dc] = 0;
    active.push([r + dr, c + dc]);
  }
  return grid;
};

const solveMaze = (grid) => {
  const n = grid.length;
  const target = `${n - 1},${n - 1}`;
  const prev = new Map([['0,0', null]]);
  const queue = [[0, 0]];
  while (queue.length) {
    const [r, c] = queue.shift();
    if (`${r},${c}` === target) break;
    for (const [dr, dc] of DIRS4) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 0 && !prev.has(key)) {
        prev.set(key, `${r},${c}`);
        queue.push([nr, nc]);
      }
    }
  }
  if (!prev.has(target)) return [];
  const path = [];
  let cur = target;
  while (cur) { path.unshift(cur); cur = prev.get(cur); }
  return path;
};

const countDeadEnds = (grid) => {
  const n = grid.length;
  let count = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 0) continue;
      let open = 0;
      DIRS4.forEach(([dr, dc]) => { if (grid[r + dr]?.[c + dc] === 0) open++; });
      if (open === 1) count++;
    }
  }
  return count;
};

export const generateMazeTemplatesForLevel = (level = 'easy', count = 200) => {
  const cfg = MAZE_LEVELS[level] || MAZE_LEVELS.easy;
  const n = cfg.size;
  const rng = createSeededRng(cfg.seed * 99991);
  const templates = [];
  const seen = new Set();

  let guard = 0;
  while (templates.length < count && guard < count * 20) {
    guard++;
    let best = null;
    for (let k = 0; k < cfg.candidates; k++) {
      const grid = cfg.algo === 'growing' ? carveGrowingTree(n, rng, 0.85) : carveBacktracker(n, rng);
      const path = solveMaze(grid);
      if (path.length === 0) continue;
      // Zorluk puanı: çözüm yolunun uzunluğu + çıkmaz sokak sayısı
      const score = path.length * 2 + countDeadEnds(grid);
      if (!best || score > best.score) best = { grid, path, score };
    }
    if (!best) continue;
    const gridRows = best.grid.map(row => row.join(''));
    const sig = gridRows.join('|');
    if (seen.has(sig)) continue;
    seen.add(sig);
    templates.push({
      id: templates.length + 1,
      level,
      rows: n,
      cols: n,
      gridRows,
      solutionPath: best.path
    });
  }
  return templates;
};

export const MAZE_TEMPLATES = {
  easy: generateMazeTemplatesForLevel('easy', 200),
  medium: generateMazeTemplatesForLevel('medium', 200),
  hard: generateMazeTemplatesForLevel('hard', 200)
};

// Herhangi bir biçimden (gridRows / eski grid matrisi) duvar matrisini çıkarır
export const getMazeMatrix = (mazeData = {}) => {
  if (Array.isArray(mazeData.gridRows) && mazeData.gridRows.length > 0) {
    return mazeData.gridRows.map(row => String(row).split('').map(Number));
  }
  if (Array.isArray(mazeData.grid) && mazeData.grid.length > 0) {
    if (Array.isArray(mazeData.grid[0])) return mazeData.grid.map(row => row.map(Number));
    if (typeof mazeData.grid[0] === 'string') return mazeData.grid.map(row => row.split('').map(Number));
  }
  return MAZE_TEMPLATES.easy[0].gridRows.map(row => row.split('').map(Number));
};

// Firestore'a kaydedilecek temiz (iç içe dizi içermeyen) labirent verisi
export const buildMazePayload = (mazeData = {}, extra = {}) => {
  const matrix = getMazeMatrix(mazeData);
  const n = matrix.length;
  return {
    level: mazeData.level || 'easy',
    rows: n,
    cols: n,
    gridRows: matrix.map(row => row.join('')),
    solutionPath: Array.isArray(mazeData.solutionPath) ? mazeData.solutionPath.map(String) : solveMaze(matrix),
    startImage: extra.startImage !== undefined ? extra.startImage : (mazeData.startImage || ''),
    endImage: extra.endImage !== undefined ? extra.endImage : (mazeData.endImage || '')
  };
};

const escapeXml = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export const generateMazeSvgDataUrl = (mazeData = {}) => {
  const grid = getMazeMatrix(mazeData);
  const n = grid.length;
  const box = 240;
  const pad = 14;
  const cellS = (box - pad * 2) / n;
  let rects = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const isWall = grid[r]?.[c] === 1;
      rects += `<rect x="${pad + c * cellS}" y="${pad + r * cellS}" width="${cellS}" height="${cellS}" fill="${isWall ? '#1e293b' : '#ffffff'}" stroke="#cbd5e1" stroke-width="0.6" />`;
    }
  }
  const iconSize = cellS * 0.95;
  const putIcon = (img, emoji, r, c) => {
    const x = pad + c * cellS + (cellS - iconSize) / 2;
    const y = pad + r * cellS + (cellS - iconSize) / 2;
    if (img) return `<image href="${escapeXml(img)}" x="${x}" y="${y}" width="${iconSize}" height="${iconSize}" preserveAspectRatio="xMidYMid meet" />`;
    return `<text x="${pad + (c + 0.5) * cellS}" y="${pad + (r + 0.78) * cellS}" font-size="${Math.round(cellS * 0.8)}" text-anchor="middle">${emoji}</text>`;
  };
  rects += putIcon(mazeData.startImage, '🐰', 0, 0);
  rects += putIcon(mazeData.endImage, '🥕', n - 1, n - 1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}" width="${box}" height="${box}"><rect width="100%" height="100%" rx="20" fill="#ffffff" stroke="#1e293b" stroke-width="4"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const checkMazeAnswer = (mazeData = {}, studentPath = []) => {
  const grid = getMazeMatrix(mazeData);
  const n = grid.length;
  if (!Array.isArray(studentPath) || studentPath.length < 2) return false;
  if (studentPath[0] !== '0,0' || studentPath[studentPath.length - 1] !== `${n - 1},${n - 1}`) return false;

  for (let i = 0; i < studentPath.length; i++) {
    const [r, c] = studentPath[i].split(',').map(Number);
    if (grid[r]?.[c] !== 0) return false;
    if (i > 0) {
      const [pr, pc] = studentPath[i - 1].split(',').map(Number);
      if (Math.abs(r - pr) + Math.abs(c - pc) !== 1) return false;
    }
  }
  return true;
};

export const InteractiveMazePad = ({
  mazeData = {},
  studentPath = ['0,0'],
  onChangeStudentPath,
  readOnly = false,
  size = 250,
  title = "",
  status = null
}) => {
  const grid = getMazeMatrix(mazeData);
  const n = grid.length;
  const activePath = studentPath && studentPath.length > 0 ? studentPath : ['0,0'];
  const [isDrawing, setIsDrawing] = useState(false);
  const pathRef = useRef(activePath);
  pathRef.current = activePath;

  useEffect(() => {
    const up = () => setIsDrawing(false);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  const stepIntoCell = (r, c) => {
    if (readOnly || !onChangeStudentPath) return;
    if (grid[r]?.[c] !== 0) return;
    const current = pathRef.current;
    const key = `${r},${c}`;
    const existingIdx = current.indexOf(key);
    let next = null;
    if (existingIdx !== -1) {
      if (existingIdx === current.length - 1) return;
      next = current.slice(0, existingIdx + 1);
    } else {
      const lastKey = current[current.length - 1] || '0,0';
      const [lr, lc] = lastKey.split(',').map(Number);
      if (Math.abs(r - lr) + Math.abs(c - lc) === 1) next = [...current, key];
    }
    if (next) {
      pathRef.current = next;
      onChangeStudentPath(next);
    }
  };

  // Dokunmatik ekranda parmağın altındaki hücreyi bulur (sürükleyerek çizim)
  const handlePointerMove = (e) => {
    if (readOnly || !isDrawing) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cellEl = el && el.closest ? el.closest('[data-maze-cell]') : null;
    if (!cellEl) return;
    const [r, c] = cellEl.getAttribute('data-maze-cell').split(',').map(Number);
    stepIntoCell(r, c);
  };

  let borderClass = "border-slate-800 bg-white";
  if (status === 'correct') borderClass = "border-green-600 bg-green-50/40 ring-4 ring-green-200";
  else if (status === 'wrong') borderClass = "border-red-600 bg-red-50/40 ring-4 ring-red-200";

  const pathSet = new Set(activePath);
  // Büyük labirentlerde hücreler parmakla seçilebilecek büyüklükte kalsın
  const effSize = Math.max(Number(size) || 250, n * 25);
  const dim = `min(${effSize}px, 94vw, 66vh)`;
  const emojiSize = n >= 13 ? 'text-sm sm:text-base' : n >= 11 ? 'text-base sm:text-lg' : 'text-lg sm:text-xl';

  const renderEndpoint = (img, emoji) => (
    img
      ? <img src={img} draggable="false" className="w-[88%] h-[88%] object-contain pointer-events-none select-none" alt="" />
      : <span className={`${emojiSize} select-none pointer-events-none leading-none`}>{emoji}</span>
  );

  return (
    <div className="flex flex-col items-center select-none w-full gap-2">
      <div className="flex items-center gap-2">
        {title && (
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 px-2.5 py-0.5 bg-teal-50 border border-teal-200 rounded-full">
            {title}
          </span>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={() => { pathRef.current = ['0,0']; onChangeStudentPath && onChangeStudentPath(['0,0']); }}
            className="px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-300 flex items-center gap-1 text-[10px] font-black text-pink-700"
            title="Yolu Sıfırla"
          >
            <EraserIcon size={16} /> Baştan Başla
          </button>
        )}
      </div>

      <div
        className={`relative rounded-2xl border-2 shadow-inner p-1.5 transition-all ${borderClass}`}
        style={{ width: dim, height: dim }}
        onPointerLeave={() => setIsDrawing(false)}
      >
        <div
          className="w-full h-full grid border-2 border-slate-800 touch-none"
          style={{
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`
          }}
          onPointerMove={handlePointerMove}
        >
          {Array.from({ length: n }).map((_, r) =>
            Array.from({ length: n }).map((__, c) => {
              const key = `${r},${c}`;
              const isWall = grid[r]?.[c] === 1;
              const isStart = r === 0 && c === 0;
              const isEnd = r === n - 1 && c === n - 1;
              const isVisited = pathSet.has(key);

              const bgClass = isWall ? 'bg-slate-800 border-slate-900' : isVisited ? 'bg-emerald-400 border-emerald-500' : 'bg-white border-slate-200';

              return (
                <div
                  key={key}
                  data-maze-cell={key}
                  onPointerDown={(e) => {
                    if (readOnly) return;
                    e.preventDefault();
                    setIsDrawing(true);
                    stepIntoCell(r, c);
                  }}
                  className={`w-full h-full border-[0.5px] flex items-center justify-center overflow-hidden transition-colors ${bgClass} ${!readOnly && !isWall ? 'cursor-pointer' : ''}`}
                >
                  {isStart && renderEndpoint(mazeData.startImage, '🐰')}
                  {isEnd && renderEndpoint(mazeData.endImage, '🥕')}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
