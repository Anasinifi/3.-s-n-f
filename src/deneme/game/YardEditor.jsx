import React, { useEffect, useRef, useState } from 'react';
import { HouseExterior, YardActors, actorDefaults } from './Scenes';
import { ItemPicker } from './ItemPicker';
import { PaintCapture } from './Paint';
import { sfx, say } from './fx';

// ============================================================================
// --- GRUP: BAHÇE DÜZENLEYİCİ ---
// ============================================================================
// * Ağaç, çiçek, salıncak... ekle, sürükle, büyüt, çevir, kaldır.
// * Araba, uçan araç, tekne ve karakterin YERİ de parmakla değiştirilir.
// * Fırça modunda evin dışı elle boyanır (boya evin dışına taşmaz).
const uid = () => `y${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const SPOTS = [[52, 270], [350, 272], [110, 292], [292, 292], [30, 296], [372, 296], [150, 300], [252, 300]];
const ACTOR_NAMES = { car: 'araban', air: 'uçan aracın', sea: 'teknen', me: 'sen' };

export function YardEditor({ game, setGame, house, itemMap, byCat, isOwned, balance, buy, onDoor, toolbar, paint, paintBar, onAskPaint }) {
  const svgRef = useRef(null);
  const [sel, setSel] = useState(null); // eşya uid'i ya da 'actor:car'
  const [drag, setDrag] = useState(null);
  const [picker, setPicker] = useState(null);
  const dragRef = useRef(null);
  dragRef.current = drag;
  const items = game.yard?.items || [];
  const setItems = (fn) => setGame(g => ({ ...g, yard: { items: fn(g.yard?.items || []) } }));
  const scene = itemMap.get(game.location)?.render?.scene || 'meadow';
  const defs = actorDefaults(scene);
  const actorPos = (k) => ({ ...defs[k], ...(game.yardPos?.[k] || {}) });
  const setActor = (k, patch) => setGame(g => ({ ...g, yardPos: { ...(g.yardPos || {}), [k]: { ...defs[k], ...(g.yardPos?.[k] || {}), ...patch } } }));

  useEffect(() => { if (paint) setSel(null); }, [!!paint]); // eslint-disable-line

  const toSvg = (e) => {
    const svg = svgRef.current; if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  };
  const startDrag = (e, id, x, y) => {
    e.preventDefault(); e.stopPropagation();
    setSel(id);
    const p = toSvg(e);
    setDrag({ id, x, y, ox: p.x - x, oy: p.y - y, moved: false });
  };
  const onItemDown = (e, it) => { if (!paint) startDrag(e, it.uid, it.x, it.y); };
  const onActorDown = (e, k) => { if (paint) return; const p = actorPos(k); say(ACTOR_NAMES[k]); startDrag(e, `actor:${k}`, p.x, p.y); };

  useEffect(() => {
    if (!drag) return;
    const move = (e) => {
      const d = dragRef.current; if (!d) return;
      const p = toSvg(e);
      const isAir = d.id === 'actor:air';
      setDrag({ ...d, x: Math.max(-80, Math.min(480, p.x - d.ox)), y: Math.max(isAir ? -60 : 120, Math.min(330, p.y - d.oy)), moved: true });
    };
    const up = () => {
      const d = dragRef.current; setDrag(null);
      if (!d?.moved) return;
      if (d.id.startsWith('actor:')) setActor(d.id.slice(6), { x: Math.round(d.x), y: Math.round(d.y) });
      else setItems(list => list.map(it => it.uid === d.id ? { ...it, x: Math.round(d.x), y: Math.round(d.y) } : it));
      sfx('place');
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!drag]);

  // sürüklerken gösterilen hâl
  let viewGame = game;
  if (drag) {
    if (drag.id.startsWith('actor:')) {
      const k = drag.id.slice(6);
      viewGame = { ...game, yardPos: { ...(game.yardPos || {}), [k]: { ...actorPos(k), x: drag.x, y: drag.y } } };
    } else viewGame = { ...game, yard: { items: items.map(it => it.uid === drag.id ? { ...it, x: drag.x, y: drag.y } : it) } };
  }

  const isActor = sel && sel.startsWith('actor:');
  const actorKey = isActor ? sel.slice(6) : null;
  const selected = isActor ? actorPos(actorKey) : items.find(it => it.uid === sel);
  const patchSel = (patch) => (isActor ? setActor(actorKey, patch) : setItems(list => list.map(it => it.uid === sel ? { ...it, ...patch } : it)));

  const add = (item) => {
    if (!item) return;
    const [x, y] = SPOTS[items.length % SPOTS.length];
    const n = { uid: uid(), id: item.id, x: x + ((items.length * 13) % 20) - 10, y, s: 1 };
    setItems(list => [...list, n]);
    setSel(n.uid);
    sfx('place');
  };

  const btn = 'h-14 min-w-[56px] px-3 rounded-2xl shadow-lg font-extrabold active:scale-90 flex items-center justify-center gap-1';
  const selName = isActor ? ACTOR_NAMES[actorKey] : itemMap.get(selected?.id)?.name;
  return (
    <div className="absolute inset-0 flex flex-col ca-fadein overflow-hidden" style={{ background: '#86efac' }}>
      <div className="flex-1 min-h-0 flex items-center justify-center p-1" onPointerDown={() => !paint && setSel(null)}>
        <svg ref={svgRef} viewBox="-30 -20 460 330" className="w-full h-full max-w-4xl" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'hidden', touchAction: 'none' }}>
          <HouseExterior extendBg house={house} game={viewGame} itemMap={itemMap} onDoor={paint ? undefined : onDoor} selectedUid={sel} onItemDown={onItemDown} />
          <YardActors game={viewGame} itemMap={itemMap} onDown={onActorDown} selected={sel} />
          {paint && <PaintCapture svgRef={svgRef} area={{ x: -30, y: -20, w: 460, h: 330 }} color={paint.color} width={paint.width} onStroke={paint.onStroke} />}
        </svg>
      </div>
      {!paint && (
        <div className="shrink-0 text-center text-[13px] font-bold text-slate-700 bg-white/70 py-1">
          {selected ? `${selName || 'eşya'} seçili · sürükleyerek taşı` : 'her şeye dokun, sürükle: ağaç, araba, tekne, hatta kendin! 🌳🚗'}
        </div>
      )}
      <div className="shrink-0 p-2 flex gap-2 justify-center flex-wrap bg-white/50">
        {paint ? paintBar : selected ? (
          <>
            <button onClick={() => patchSel({ s: Math.min(2.6, +((Number(selected.s) || 1) + 0.12).toFixed(2)) })} className={`${btn} bg-white text-slate-700 text-2xl`}>＋</button>
            <button onClick={() => patchSel({ s: Math.max(0.3, +((Number(selected.s) || 1) - 0.12).toFixed(2)) })} className={`${btn} bg-white text-slate-700 text-2xl`}>－</button>
            <button onClick={() => patchSel({ flip: !selected.flip })} className={`${btn} bg-sky-400 text-white`}>↔ çevir</button>
            {isActor
              ? <button onClick={() => { setGame(g => { const yp = { ...(g.yardPos || {}) }; delete yp[actorKey]; return { ...g, yardPos: yp }; }); setSel(null); }} className={`${btn} bg-amber-400 text-amber-950`}>↺ eski yerine</button>
              : <button onClick={() => { setItems(list => list.filter(it => it.uid !== sel)); setSel(null); sfx('tap'); }} className={`${btn} bg-rose-500 text-white`}>🗑 kaldır</button>}
            <button onClick={() => setSel(null)} className={`${btn} bg-green-500 text-white`}>✓ tamam</button>
          </>
        ) : (
          <>
            <button onClick={() => { say('bahçe'); setPicker('garden'); }} className={`${btn} bg-green-600 text-white`}>🌳 bahçe</button>
            <button onClick={() => { say('hayvanlar'); setPicker('pet'); }} className={`${btn} bg-amber-500 text-white`}>🐶 hayvan</button>
            {onAskPaint && <button onClick={onAskPaint} className={`${btn} bg-gradient-to-b from-pink-400 to-fuchsia-500 text-white`}>🖌️ fırça</button>}
            {toolbar}
          </>
        )}
      </div>
      {picker && (
        <ItemPicker title={picker === 'garden' ? 'Bahçeye ekle' : 'Bahçe dostu ekle'} items={byCat[picker] || []} currentId={null}
          isOwned={isOwned} balance={balance} game={game} itemMap={itemMap} onBuy={buy}
          onSelect={(it) => { add(it); setPicker(null); }} onClose={() => setPicker(null)} />
      )}
    </div>
  );
}
