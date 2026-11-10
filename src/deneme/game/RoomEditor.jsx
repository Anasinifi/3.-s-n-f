import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RoomInterior } from './Scenes';
import { ItemPicker } from './ItemPicker';
import { migrateRoom, defaultPlacement } from './catalog';
import { getRoomInfo } from './gameConfig';
import { sfx, say } from './fx';
import { PaintCapture } from './Paint';

// ============================================================================
// --- GRUP: ODA DÜZENLEYİCİ (eşyaları sürükle-bırak, büyüt, çevir) ---
// ============================================================================
// * Eşyaya dokun -> seçilir. Parmağınla sürükle -> istediğin yere taşı (yatağın yerini değiştir).
// * Alttaki düğmeler: büyüt / küçült / çevir / kaldır.
// * "eşya ekle": marketten alınan ya da ücretsiz eşyalar odaya konur.
//   Ücretli bir eşya evde tek tanedir: başka odadaysa buraya taşınır.

const uid = () => `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function RoomEditor({ game, setGame, roomKey, rooms, onChangeRoom, itemMap, byCat, isOwned, balance, buy, onBack, onSurface, paint, paintBar, onAskPaint }) {
  const svgRef = useRef(null);
  const [sel, setSel] = useState(null);
  const [drag, setDrag] = useState(null); // { uid, x, y, ox, oy }
  const [picker, setPicker] = useState(false);
  const dragRef = useRef(null);
  dragRef.current = drag;

  useEffect(() => { setSel(null); }, [roomKey]);

  const room = migrateRoom(game.rooms?.[roomKey]);
  const updateRoom = (fn) => setGame(g => ({ ...g, rooms: { ...(g.rooms || {}), [roomKey]: fn(migrateRoom(g.rooms?.[roomKey])) } }));

  // hangi ücretli eşya hangi odada
  const placedWhere = useMemo(() => {
    const m = new Map();
    Object.entries(game.rooms || {}).forEach(([rk, r]) => migrateRoom(r).items.forEach(it => m.set(it.id, rk)));
    return m;
  }, [game.rooms]);

  const toSvg = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  };

  const onItemDown = (e, it) => {
    e.preventDefault(); e.stopPropagation();
    setSel(it.uid);
    const p = toSvg(e);
    setDrag({ uid: it.uid, x: it.x, y: it.y, ox: p.x - it.x, oy: p.y - it.y, moved: false });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e) => {
      const d = dragRef.current; if (!d) return;
      const p = toSvg(e);
      const x = Math.max(10, Math.min(390, p.x - d.ox));
      const y = Math.max(30, Math.min(250, p.y - d.oy));
      setDrag({ ...d, x, y, moved: true });
    };
    const up = () => {
      const d = dragRef.current;
      setDrag(null);
      if (d?.moved) {
        updateRoom(r => ({ ...r, items: r.items.map(it => it.uid === d.uid ? { ...it, x: Math.round(d.x), y: Math.round(d.y) } : it) }));
        sfx('place');
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    document.body.classList.add('ca-dragging');
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      document.body.classList.remove('ca-dragging');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!drag]);

  // sürüklerken gösterilen hâl
  const viewGame = drag
    ? { ...game, rooms: { ...game.rooms, [roomKey]: { ...room, items: room.items.map(it => it.uid === drag.uid ? { ...it, x: drag.x, y: drag.y } : it) } } }
    : game;

  const selected = room.items.find(it => it.uid === sel);
  const selItem = selected ? itemMap.get(selected.id) : null;
  const patchSel = (patch) => updateRoom(r => ({ ...r, items: r.items.map(it => it.uid === sel ? { ...it, ...patch } : it) }));

  const addItem = (item) => {
    if (!item) return;
    const priced = (Number(item.price) || 0) > 0;
    const pos = defaultPlacement(item);
    const newIt = { uid: uid(), id: item.id, x: pos.x, y: pos.y, s: 1 };
    setGame(g => {
      const allRooms = { ...(g.rooms || {}) };
      if (priced) {
        Object.keys(allRooms).forEach(rk => {
          const r = migrateRoom(allRooms[rk]);
          if (r.items.some(it => it.id === item.id)) allRooms[rk] = { ...r, items: r.items.filter(it => it.id !== item.id) };
        });
      }
      const cur = migrateRoom(allRooms[roomKey]);
      allRooms[roomKey] = { ...cur, items: [...cur.items, newIt] };
      return { ...g, rooms: allRooms };
    });
    setSel(newIt.uid);
    sfx('place');
  };

  const info = getRoomInfo(roomKey);
  const btn = 'h-14 min-w-[56px] px-3 rounded-2xl shadow-lg font-extrabold active:scale-90 flex items-center justify-center gap-1';

  return (
    <div className="absolute inset-0 flex flex-col ca-fadein bg-slate-800">
      <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto ca-scroll p-2">
        <button onClick={() => { say('ev planı'); onBack(); }} className="shrink-0 px-3 py-2.5 rounded-2xl font-extrabold text-sm bg-white text-slate-700">🏠 ev planı</button>
        {rooms.map(rk => {
          const ri = getRoomInfo(rk);
          return <button key={rk} onClick={() => { sfx('door'); say(ri.name); onChangeRoom(rk); }} className={`shrink-0 px-3 py-2.5 rounded-2xl font-extrabold text-sm ${roomKey === rk ? 'bg-amber-300 text-amber-950' : 'bg-white/20 text-white'}`}>{ri.emoji} {ri.name}</button>;
        })}
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center p-1.5" onPointerDown={() => setSel(null)}>
        <svg ref={svgRef} viewBox="0 0 400 250" className="w-full h-full max-w-5xl rounded-3xl" style={{ touchAction: 'none' }} preserveAspectRatio="xMidYMid meet">
          <RoomInterior key={roomKey} roomKey={roomKey} game={viewGame} itemMap={itemMap} selectedUid={paint ? null : sel} onItemDown={paint ? undefined : onItemDown} />
          {paint && <PaintCapture svgRef={svgRef} area={{ x: 0, y: 0, w: 400, h: 250 }} color={paint.color} width={paint.width} onStroke={paint.onStroke} />}
        </svg>
      </div>

      <div className="shrink-0 px-2 pb-1 text-center text-[13px] font-bold text-white/70">
        {selected ? `${selItem?.name || 'eşya'} seçili · sürükleyerek taşı` : `${info.emoji} ${info.name} · bir eşyaya dokun, sürükle, istediğin yere koy`}
      </div>

      <div className="shrink-0 p-2 pb-3 flex gap-2 justify-center flex-wrap">
        {paint ? paintBar : selected ? (
          <>
            <button onClick={() => { sfx('tap'); patchSel({ s: Math.min(2.6, +((Number(selected.s) || 1) + 0.15).toFixed(2)) }); }} className={`${btn} bg-white text-slate-700 text-2xl`}>＋</button>
            <button onClick={() => { sfx('tap'); patchSel({ s: Math.max(0.35, +((Number(selected.s) || 1) - 0.15).toFixed(2)) }); }} className={`${btn} bg-white text-slate-700 text-2xl`}>－</button>
            <button onClick={() => { sfx('tap'); patchSel({ flip: !selected.flip }); }} className={`${btn} bg-sky-400 text-white`}>↔ çevir</button>
            <button onClick={() => { sfx('tap'); updateRoom(r => ({ ...r, items: r.items.filter(it => it.uid !== sel) })); setSel(null); }} className={`${btn} bg-rose-500 text-white`}>🗑 kaldır</button>
            <button onClick={() => setSel(null)} className={`${btn} bg-green-500 text-white`}>✓ tamam</button>
          </>
        ) : (
          <>
            <button onClick={() => { sfx('tap'); say('eşya ekle'); setPicker(true); }} className={`${btn} bg-indigo-500 text-white px-5 text-lg`}>➕ eşya ekle</button>
            <button onClick={() => { say('duvar'); onSurface('wallpaper'); }} className={`${btn} bg-pink-400 text-white`}>🧱 duvar</button>
            {onAskPaint && <button onClick={onAskPaint} className={`${btn} bg-gradient-to-b from-pink-400 to-fuchsia-500 text-white`}>🖌️ fırça</button>}
            <button onClick={() => { say('zemin'); onSurface('floor'); }} className={`${btn} bg-amber-500 text-white`}>🟫 zemin</button>
          </>
        )}
      </div>

      {picker && (
        <ItemPicker
          title={`${info.name}: eşya ekle`}
          items={byCat.furniture || []}
          currentId={null}
          isOwned={isOwned}
          balance={balance}
          game={game}
          itemMap={itemMap}
          onBuy={buy}
          badge={(it) => {
            if ((Number(it.price) || 0) <= 0) return null;
            const where = placedWhere.get(it.id);
            if (!where) return null;
            return where === roomKey ? '📍 bu odada' : `📍 ${getRoomInfo(where).name}`;
          }}
          onSelect={(it) => { addItem(it); setPicker(false); }}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// --- EV PLANI (bebek evi kesiti): odaları gör, birine dokun, içine gir ---
// ============================================================================
export function DollHouse({ game, itemMap, rooms, onOpenRoom, wallColor, roofColor, onSay }) {
  const n = rooms.length;
  const cols = n === 1 ? 1 : 2;
  const rowsN = Math.ceil(n / cols);
  const CW = 400, CH = 250, G = 18, WALL = 22;
  const W = cols * CW + (cols - 1) * G + WALL * 2;
  const roofH = 150;
  const H = roofH + rowsN * CH + (rowsN - 1) * G + WALL + 30;
  const wall = wallColor || '#fde68a';
  const roof = roofColor || '#b91c1c';
  return (
    <svg viewBox={`-30 -10 ${W + 60} ${H + 20}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <path d={`M-20 ${roofH + 4} L${W / 2} 0 L${W + 20} ${roofH + 4} Z`} fill={roof} stroke="#2b2233" strokeWidth="6" strokeLinejoin="round" />
      {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${W / 2 - (i + 1) * (W / 12)} ${roofH - (roofH / 6) * (5 - i)} L${W / 2 + (i + 1) * (W / 12)} ${roofH - (roofH / 6) * (5 - i)}`} stroke="#000" strokeOpacity="0.15" strokeWidth="4" />)}
      <rect x="0" y={roofH} width={W} height={H - roofH - 26} fill={wall} stroke="#2b2233" strokeWidth="6" />
      <rect x="-24" y={H - 30} width={W + 48} height="26" rx="8" fill="#16a34a" stroke="#2b2233" strokeWidth="5" />
      {rooms.map((rk, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const x = WALL + c * (CW + G);
        const y = roofH + 10 + r * (CH + G);
        const info = getRoomInfo(rk);
        return (
          <g key={rk} onClick={() => { onSay?.(info.name); onOpenRoom(rk); }} style={{ cursor: 'pointer' }} className="ca-tap">
            <svg x={x} y={y} width={CW} height={CH} viewBox="0 0 400 250">
              <RoomInterior roomKey={rk} game={game} itemMap={itemMap} />
            </svg>
            <rect x={x} y={y} width={CW} height={CH} rx="14" fill="none" stroke="#2b2233" strokeWidth="5" />
            <g transform={`translate(${x + CW / 2} ${y + 22})`}>
              <rect x="-90" y="-20" width="180" height="40" rx="20" fill="#fff" stroke="#2b2233" strokeWidth="4" />
              <text x="0" y="9" fontSize="24" fontWeight="800" textAnchor="middle" fill="#334155">{info.emoji} {info.name}</text>
            </g>
            <g transform={`translate(${x + CW - 34} ${y + CH - 34})`}>
              <g className="ca-hint">
                <circle r="24" fill="#6366f1" stroke="#fff" strokeWidth="4" />
                <text y="9" fontSize="24" textAnchor="middle" fill="#fff" fontWeight="900">✎</text>
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
