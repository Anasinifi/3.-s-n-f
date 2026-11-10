import React, { useMemo, useState } from 'react';
import { Avatar } from './Avatar';
import { FarScene, CarInterior } from './Scenes';
import { YardEditor } from './YardEditor';
import { VehicleArt } from './Vehicles';
import { LocationBackdrop } from './LocationArt';
import { ItemPicker } from './ItemPicker';
import { RoomEditor, DollHouse } from './RoomEditor';
import { SKIN_TONES, CAR_SLOTS, CAR_MOD_SLOTS, CATEGORY_BY_ID, THUMB_VIEWS, migrateRoom } from './catalog';
import { getHouseRooms, fitsBase } from './gameConfig';
import { sfx, say } from './fx';
import { ItemThumb } from './ItemPicker';
import { PaintedLayer, PaintCapture, PaintBar, PaintConfirm, MAX_STROKES } from './Paint';
import { Cloud, Oak, Pine, Bush, Flowers } from './MapArt';

// ============================================================================
// --- GRUP: KARAKTERİM / EVİM / ARABAM (STÜDYO) ---
// ============================================================================
const CHAR_CATS = [
  { id: 'base', label: 'Karakter', icon: '🧒' },
  { id: 'hair', label: 'Saç', icon: '💇' },
  { id: 'hairColor', label: 'Saç Rengi', icon: '🎨' },
  { id: 'top', label: 'Üst', icon: '👕' },
  { id: 'bottom', label: 'Alt', icon: '👖' },
  { id: 'shoes', label: 'Ayakkabı', icon: '👟' },
  { id: 'hat', label: 'Şapka', icon: '🎩' },
  { id: 'accessory', label: 'Aksesuar', icon: '🕶️' },
];

const CHAR_SLOT_CATS = ['hair', 'top', 'bottom', 'shoes', 'hat', 'accessory'];
const vtypeOf = (it) => it?.render?.vtype || 'car';
const VT = [['car', '🚗', 'arabam'], ['air', '🚁', 'uçan aracım'], ['sea', '⛵', 'teknem']];

// Araç ekranı arka planı: sade, canlı (gökyüzü, tepeler, ağaçlar, yol)
function VehicleStage({ vt }) {
  return (
    <svg viewBox="0 0 800 450" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vs_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={vt === 'air' ? '#38bdf8' : '#7dd3fc'} /><stop offset="1" stopColor="#fef9c3" /></linearGradient>
        <linearGradient id="vs_sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#0369a1" /></linearGradient>
      </defs>
      <rect x="0" y="0" width="800" height="450" fill="url(#vs_sky)" />
      <circle cx="680" cy="80" r="44" fill="#fde047" stroke="#facc15" strokeWidth="8" className="ca-sun" />
      <g className="ca-drift"><g transform="translate(150 90)"><Cloud s={1.2} /></g><g transform="translate(470 60)"><Cloud s={0.9} /></g></g>
      {vt === 'sea' ? (
        <g><rect x="0" y="250" width="800" height="200" fill="url(#vs_sea)" />{[60, 220, 400, 560, 700].map((x, i) => <path key={x} d={`M${x} ${290 + (i % 2) * 40} q12 -8 24 0 q12 -8 24 0`} stroke="#fff" strokeWidth="3" fill="none" className="ca-wave" />)}<path d="M0 252 Q200 236 400 250 T800 248" stroke="#fff" strokeWidth="4" fill="none" opacity="0.7" /></g>
      ) : (
        <g>
          <path d="M0 300 Q160 220 330 280 T640 255 T800 270 L800 450 L0 450 Z" fill="#86efac" />
          <path d="M0 330 Q220 290 420 320 T800 315 L800 450 L0 450 Z" fill="#4ade80" />
          <g transform="translate(90 330)"><Oak s={1.3} /></g><g transform="translate(220 300)"><Pine s={0.9} /></g><g transform="translate(700 325)"><Oak s={1.1} hue={2} /></g><g transform="translate(600 310)"><Pine s={0.8} hue={1} /></g>
          <g transform="translate(160 350)"><Bush s={0.9} flowers /></g><g transform="translate(560 352)"><Flowers s={1.4} seed={5} /></g>
          {vt === 'car' && <g><rect x="0" y="372" width="800" height="78" fill="#64748b" /><rect x="0" y="372" width="800" height="6" fill="#e2e8f0" />{Array.from({ length: 10 }).map((_, i) => <rect key={i} x={i * 90 + 10} y="409" width="50" height="6" rx="3" fill="#fde047" />)}</g>}
        </g>
      )}
    </svg>
  );
}

export function Studio({ child, game, setGame, itemMap, items, balance, buy, onClose, initialTab = 'character', paintPrice = 5 }) {
  const [tab, setTab] = useState(initialTab);
  const [cat, setCat] = useState('top');
  const [preview, setPreview] = useState({});
  const [picker, setPicker] = useState(null);
  const [scene, setScene] = useState('far');
  const [zooming, setZooming] = useState(false);
  const [room, setRoom] = useState(null);
  const [carScene, setCarScene] = useState('out');
  const [vt, setVt] = useState('car');
  const vehSvgRef = React.useRef(null);
  const [toast, setToast] = useState('');
  const flash = (t) => { setToast(t); say(t); setTimeout(() => setToast(''), 1800); };

  // --- ELLE BOYAMA (yıldızla alınan boyama hakkı) ---
  const [paintAsk, setPaintAsk] = useState(null);   // boyanacak anahtar (onay bekliyor)
  const [painting, setPainting] = useState(null);   // şu an boyanan anahtar
  const [pColor, setPColor] = useState('#ef4444');
  const [pWidth, setPWidth] = useState(9);
  const askPaint = (key) => { say('boyama'); setPaintAsk(key); };
  const confirmPaint = () => {
    const key = paintAsk;
    setGame(g => ((g.paintTokens || 0) > 0 ? { ...g, paintTokens: g.paintTokens - 1 } : { ...g, spent: (Number(g.spent) || 0) + paintPrice }));
    setPaintAsk(null); setPainting(key); sfx('buy');
  };
  const addStroke = (st) => setGame(g => ({ ...g, paints: { ...(g.paints || {}), [painting]: [...(g.paints?.[painting] || []), st].slice(-MAX_STROKES) } }));
  const paintCtx = painting ? { key: painting, color: pColor, width: pWidth, onStroke: addStroke } : null;
  const paintBar = painting && (
    <PaintBar color={pColor} setColor={setPColor} width={pWidth} setWidth={setPWidth} count={(game.paints?.[painting] || []).length}
      onUndo={() => setGame(g => ({ ...g, paints: { ...(g.paints || {}), [painting]: (g.paints?.[painting] || []).slice(0, -1) } }))}
      onClear={() => setGame(g => ({ ...g, paints: { ...(g.paints || {}), [painting]: [] } }))}
      onDone={() => { setPainting(null); flash('harika boyadın!'); }} />
  );
  const [zoom, setZoom] = useState(1); // karakter yakınlaştırma

  const isOwned = (it) => !it || (Number(it.price) || 0) <= 0 || (game.owned || []).includes(it.id);
  // Karaktere özel parçalar (forBases) sadece o karakter seçiliyken görünür
  const byCat = useMemo(() => {
    const m = {};
    items.forEach(it => { if (CHAR_SLOT_CATS.includes(it.cat) && !fitsBase(it, game.base)) return; (m[it.cat] = m[it.cat] || []).push(it); });
    return m;
  }, [items, game.base]);

  const house = itemMap.get(game.house) || itemMap.get('house_shack');
  const rooms = getHouseRooms(house);
  const curRoom = room && rooms.includes(room) ? room : rooms[0];
  const car = game.car ? itemMap.get(game.car) : null;
  const air = game.air ? itemMap.get(game.air) : null;
  const sea = game.sea ? itemMap.get(game.sea) : null;
  const carPaint = game.carPaint ? itemMap.get(game.carPaint)?.render?.color : null;
  const carMods = Object.fromEntries(Object.entries(game.carMods || {}).map(([k, id]) => [k, itemMap.get(id)]).filter(([, v]) => v));
  const vehOf = (t) => (t === 'car' ? car : t === 'air' ? air : sea);

  // --- giydir / yerleştir ---
  const applyChar = (c, item) => {
    setPreview({});
    setGame(g => {
      if (c === 'base') {
        // yeni karaktere uymayan parçaları çıkar; saç uymuyorsa bu karaktere özel ilk saçı tak
        const nb = item?.id || 'base_kid';
        const equip = { ...g.equip };
        CHAR_SLOT_CATS.forEach(k => { if (equip[k] && !fitsBase(itemMap.get(equip[k]), nb)) equip[k] = null; });
        const curHair = itemMap.get(equip.hair);
        const dedicated = items.find(it => it.cat === 'hair' && Array.isArray(it.forBases) && it.forBases.includes(nb) && isOwned(it));
        if (dedicated && !(curHair?.forBases || []).includes(nb)) equip.hair = dedicated.id;
        if (!equip.hair) equip.hair = fitsBase(itemMap.get('hair_short'), nb) ? 'hair_short' : null;
        return { ...g, base: nb, equip };
      }
      if (c === 'hairColor') return { ...g, hairColor: item?.id || g.hairColor };
      return { ...g, equip: { ...g.equip, [c]: item ? item.id : null } };
    });
  };
  const currentCharId = (c) => (c === 'base' ? game.base : c === 'hairColor' ? game.hairColor : game.equip?.[c]);

  const openPicker = (p) => setPicker(p);

  const locationPicker = () => openPicker({
    title: 'Evin nerede olsun?', items: byCat.location || [], currentId: game.location,
    apply: (it) => { if (it) setGame(g => ({ ...g, location: it.id })); },
  });
  const fencePicker = () => openPicker({
    title: 'Çit', items: byCat.fence || [], currentId: game.garden?.fence, allowEmpty: true,
    apply: (it) => setGame(g => ({ ...g, garden: { ...g.garden, fence: it ? it.id : null } })),
  });
  const paintPicker = (c) => openPicker({
    title: c === 'wallPaint' ? 'Duvar Boyası' : 'Çatı Boyası', items: byCat[c] || [], currentId: game[c], allowEmpty: true,
    apply: (it) => setGame(g => ({ ...g, [c]: it ? it.id : null })),
  });
  const housePicker = () => openPicker({
    title: 'Evler', items: byCat.house || [], currentId: game.house,
    apply: (it) => { if (it) { setGame(g => ({ ...g, house: it.id })); setRoom(null); } },
  });
  // oda duvarı / zemini
  const surfacePicker = (kind) => {
    openPicker({
      title: kind === 'wallpaper' ? 'Oda Duvarı' : 'Zemin',
      items: byCat[kind] || [], currentId: migrateRoom(game.rooms?.[curRoom])[kind], allowEmpty: false,
      apply: (it) => setGame(g => ({ ...g, rooms: { ...g.rooms, [curRoom]: { ...migrateRoom(g.rooms?.[curRoom]), [kind]: it ? it.id : null } } })),
    });
  };
  const vehPicker = (t) => openPicker({
    title: t === 'car' ? 'Arabalar' : t === 'air' ? 'Uçan araçlar' : 'Tekneler', items: (byCat.car || []).filter(it => vtypeOf(it) === t), currentId: game[t],
    apply: (it) => { if (it) setGame(g => ({ ...g, [t]: it.id })); },
  });
  const carPaintPicker = () => openPicker({
    title: 'Araba Boyası', items: byCat.carPaint || [], currentId: game.carPaint, allowEmpty: true,
    apply: (it) => setGame(g => ({ ...g, carPaint: it ? it.id : null })),
  });
  const modPicker = (slot) => openPicker({
    title: CAR_MOD_SLOTS[slot]?.label || 'Modifiye', items: (byCat.carMod || []).filter(it => it.slot === slot), currentId: game.carMods?.[slot], allowEmpty: true,
    apply: (it) => setGame(g => ({ ...g, carMods: { ...(g.carMods || {}), [slot]: it ? it.id : null } })),
  });
  const carDecorPicker = (slotKey) => openPicker({
    title: CAR_SLOTS[slotKey]?.label || 'Süs', items: (byCat.carDecor || []).filter(it => it.slot === slotKey), currentId: game.carDecor?.[slotKey], allowEmpty: true,
    apply: (it) => setGame(g => ({ ...g, carDecor: { ...g.carDecor, [slotKey]: it ? it.id : null } })),
  });

  // --- EŞYALARIM: alınmış eşyayı kullan ---
  const useOwned = (it) => {
    say(it.name);
    const c = it.cat;
    if (['base', 'hairColor', ...CHAR_SLOT_CATS].includes(c)) { applyChar(c, it); flash('giydin!'); return; }
    if (c === 'house') { setGame(g => ({ ...g, house: it.id })); setRoom(null); flash('evin değişti!'); return; }
    if (c === 'location') { setGame(g => ({ ...g, location: it.id })); flash('evin taşındı!'); return; }
    if (c === 'car') { setGame(g => ({ ...g, [vtypeOf(it)]: it.id })); flash('aracın hazır!'); return; }
    if (c === 'carPaint') { setGame(g => ({ ...g, carPaint: it.id })); flash('araban boyandı!'); return; }
    if (c === 'carMod') { setGame(g => ({ ...g, carMods: { ...(g.carMods || {}), [it.slot]: it.id } })); flash('arabana takıldı!'); return; }
    if (c === 'wallPaint' || c === 'roofPaint') { setGame(g => ({ ...g, [c]: it.id })); flash('evin boyandı!'); return; }
    if (c === 'fence') { setGame(g => ({ ...g, garden: { ...g.garden, fence: it.id } })); flash('çit kondu!'); return; }
    flash('bunu evim bölümünden yerleştirebilirsin');
  };
  const isUsed = (it) => {
    const c = it.cat;
    if (c === 'base') return game.base === it.id;
    if (c === 'hairColor') return game.hairColor === it.id;
    if (CHAR_SLOT_CATS.includes(c)) return game.equip?.[c] === it.id;
    if (c === 'car') return game[vtypeOf(it)] === it.id;
    if (c === 'carMod') return game.carMods?.[it.slot] === it.id;
    if (['house', 'location', 'carPaint', 'wallPaint', 'roofPaint'].includes(c)) return game[c] === it.id;
    if (c === 'furniture') return Object.values(game.rooms || {}).some(r => migrateRoom(r).items.some(x => x.id === it.id));
    if (c === 'garden' || c === 'pet') return (game.yard?.items || []).some(x => x.id === it.id);
    return false;
  };
  const ownedItems = items.filter(it => (game.owned || []).includes(it.id));
  const ownedGroups = Array.from(new Set(ownedItems.map(it => it.cat))).map(c => ({ c, list: ownedItems.filter(it => it.cat === c) }));

  const zoomTo = (next) => {
    sfx('door');
    setZooming(true);
    setTimeout(() => { setScene(next); setZooming(false); }, 520);
  };

  const avatarEl = <Avatar game={game} itemMap={itemMap} preview={preview} size={120} bounce />;

  return (
    <div className="ca-game fixed inset-0 z-[70] flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg,#fdf2f8 0%,#ede9fe 60%,#e0e7ff 100%)' }}>
      {/* ÜST ÇUBUK */}
      <div className="shrink-0 p-2 sm:p-3 flex items-center gap-2">
        <button onClick={onClose} className="h-11 px-3 rounded-2xl bg-white shadow-lg font-extrabold text-slate-700 active:scale-95 flex items-center gap-1"><span className="text-xl">🗺️</span><span className="hidden sm:inline">haritaya dön</span></button>
        <div className="flex-1 flex justify-center">
          <div className="flex bg-white/80 rounded-2xl p-1 shadow">
            {[['character', '🧒', 'karakterim'], ['house', '🏠', 'evim'], ['car', '🚗', 'araçlarım'], ['mine', '🎒', 'eşyalarım']].map(([id, ic, lb]) => (
              <button key={id} onClick={() => { say(lb); setTab(id); setPreview({}); }} className={`px-2.5 sm:px-4 py-2 rounded-xl font-extrabold text-sm transition-all ${tab === id ? 'bg-indigo-500 text-white shadow' : 'text-slate-500'}`}>
                <span className="text-lg">{ic}</span> <span className="hidden sm:inline">{lb}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 bg-yellow-300 border-4 border-white rounded-full pl-2 pr-3 py-0.5 shadow-lg"><span className="text-lg">⭐</span><span className="text-lg font-extrabold text-amber-900">{balance >= 999999 ? "∞" : balance}</span></div>
      </div>

      {/* KARAKTERİM */}
      {tab === 'character' && (
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 p-2 sm:p-3 pt-0">
          <div className="md:w-[46%] h-[40vh] md:h-auto shrink-0 relative rounded-[2rem] overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 35%, #fff 0%, #fbcfe8 45%, #c4b5fd 100%)' }}>
            <div className="absolute top-2 left-0 right-0 text-center text-2xl font-extrabold text-slate-700 z-10 pointer-events-none">{child?.name}</div>
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[60%] h-8 rounded-[50%] bg-white/50" />
            <div className="absolute inset-0 overflow-auto ca-scroll pt-8 pb-2">
              <div className="mx-auto h-full transition-all duration-300" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, minHeight: '100%' }}>
                <Avatar game={game} itemMap={itemMap} preview={preview} fluid bounce={zoom === 1}
                  view={zoom > 1 && ['hair', 'hairColor', 'hat', 'accessory'].includes(cat) ? THUMB_VIEWS[cat] : undefined} />
              </div>
            </div>
            <div className="absolute right-2 bottom-2 flex flex-col gap-1.5 z-10">
              <button onClick={() => { sfx('tap'); setZoom(z => Math.min(3, z + 0.5)); }} className="w-12 h-12 rounded-2xl bg-white/90 shadow-lg text-2xl font-extrabold text-slate-600 active:scale-90">＋</button>
              <button onClick={() => { sfx('tap'); setZoom(z => Math.max(1, z - 0.5)); }} className="w-12 h-12 rounded-2xl bg-white/90 shadow-lg text-2xl font-extrabold text-slate-600 active:scale-90">－</button>
            </div>
            {Object.keys(preview).length > 0 && <div className="absolute bottom-2 left-2 bg-amber-400 text-amber-950 text-sm font-extrabold px-3 py-1 rounded-full z-10">deneme modu 👀</div>}
          </div>
          <div className="flex-1 min-h-0 min-w-0 flex flex-col">
            <div className="flex gap-1.5 overflow-x-auto ca-scroll pb-2 shrink-0">
              {CHAR_CATS.map(c => (
                <button key={c.id} onClick={() => { sfx('tap'); say(c.label); setCat(c.id); setPreview({}); }} className={`shrink-0 px-4 py-2.5 rounded-2xl font-extrabold text-base border-4 transition-all ${cat === c.id ? 'bg-white border-indigo-400 text-indigo-600 shadow' : 'bg-white/60 border-transparent text-slate-500'}`}>
                  <span className="text-2xl">{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto ca-scroll pb-4">
              {cat === 'base' && (
                <div className="mb-3 bg-white rounded-3xl p-3 shadow-sm">
                  <div className="text-sm font-extrabold text-slate-500 mb-2">ten rengi</div>
                  <div className="flex gap-2 flex-wrap">
                    {SKIN_TONES.map(s => (
                      <button key={s} onClick={() => { sfx('equip'); setGame(g => ({ ...g, skin: s })); }} className={`w-14 h-14 rounded-full border-4 shadow ${game.skin === s ? 'border-indigo-500 scale-110' : 'border-white'}`} style={{ background: s }} />
                    ))}
                  </div>
                </div>
              )}
              <ItemPicker
                inline
                key={cat}
                items={byCat[cat] || []}
                currentId={currentCharId(cat)}
                isOwned={isOwned}
                balance={balance}
                allowEmpty={cat === 'hat' || cat === 'accessory'}
                game={game}
                itemMap={itemMap}
                onBuy={buy}
                onPreview={(it) => setPreview(it ? (cat === 'base' ? { base: it.id } : cat === 'hairColor' ? { hairColor: it.id } : { [cat]: it.id }) : {})}
                onSelect={(it) => applyChar(cat, it)}
              />
            </div>
          </div>
        </div>
      )}

      {/* EVİM */}
      {tab === 'house' && (
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {scene === 'far' && (
            <div className="absolute inset-0 ca-zoom" style={{ transform: zooming ? 'scale(2.7)' : 'scale(1)', transformOrigin: '51% 62%', opacity: zooming ? 0.6 : 1 }}>
              <FarScene house={house} game={game} itemMap={itemMap} car={car} carPaint={carPaint} carMods={carMods} air={air} sea={sea}
                avatar={avatarEl} onHouse={() => zoomTo('house')}
                onCar={() => { setTab('car'); setVt('car'); setCarScene('out'); }} onAir={() => { setTab('car'); setVt('air'); }} onSea={() => { setTab('car'); setVt('sea'); }} />
              {!zooming && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2 flex-wrap px-2">
                  <button onClick={() => zoomTo('house')} className="px-4 py-3 rounded-2xl bg-white/95 shadow-lg font-extrabold text-slate-700 ca-bob">🔍 evine yakınlaş</button>
                  <button onClick={() => { say('evin nerede olsun'); locationPicker(); }} className="px-4 py-3 rounded-2xl bg-sky-500 shadow-lg font-extrabold text-white">📍 mekan</button>
                </div>
              )}
            </div>
          )}
          {scene === 'house' && (
            <YardEditor game={game} setGame={setGame} house={house} itemMap={itemMap} byCat={byCat} isOwned={isOwned} balance={balance} buy={buy}
              onDoor={() => { sfx('door'); say('içeri'); setScene('plan'); }}
              paint={painting === `house_${house?.id}` ? paintCtx : null} paintBar={paintBar} onAskPaint={() => askPaint(`house_${house?.id}`)}
              toolbar={<>
                <button onClick={() => { say('boya'); paintPicker('wallPaint'); }} className="h-14 px-3 rounded-2xl shadow-lg font-extrabold bg-pink-400 text-white active:scale-90">🖌️ duvar</button>
                <button onClick={() => { say('çatı'); paintPicker('roofPaint'); }} className="h-14 px-3 rounded-2xl shadow-lg font-extrabold bg-red-500 text-white active:scale-90">🔺 çatı</button>
                <button onClick={() => { say('çit'); fencePicker(); }} className="h-14 px-3 rounded-2xl shadow-lg font-extrabold bg-yellow-600 text-white active:scale-90">🚧 çit</button>
                <button onClick={() => { say('evler'); housePicker(); }} className="h-14 px-3 rounded-2xl shadow-lg font-extrabold bg-amber-400 text-amber-950 active:scale-90">🏠 ev</button>
                <button onClick={() => { say('mekan'); locationPicker(); }} className="h-14 px-3 rounded-2xl shadow-lg font-extrabold bg-sky-500 text-white active:scale-90">📍 mekan</button>
                <button onClick={() => { sfx('door'); say('içeri gir'); setScene('plan'); }} className="h-14 px-3 rounded-2xl shadow-lg font-extrabold bg-indigo-500 text-white active:scale-90">🚪 içeri</button>
                <button onClick={() => setScene('far')} className="h-14 px-3 rounded-2xl shadow-lg font-extrabold bg-white text-slate-600 active:scale-90">⬅</button>
              </>} />
          )}
          {scene === 'plan' && (
            <div className="absolute inset-0 flex flex-col ca-fadein" style={{ background: 'linear-gradient(180deg,#bae6fd 0%,#e0f2fe 60%,#86efac 100%)' }}>
              <div className="shrink-0 text-center pt-2">
                <div className="inline-block bg-white/90 rounded-full px-4 py-2 font-extrabold text-slate-700 shadow">hangi odayı düzenlemek istersin? 👇</div>
              </div>
              <div className="flex-1 min-h-0 p-2">
                <DollHouse game={game} itemMap={itemMap} rooms={rooms}
                  wallColor={game.wallPaint ? itemMap.get(game.wallPaint)?.render?.color : null}
                  roofColor={game.roofPaint ? itemMap.get(game.roofPaint)?.render?.color : null}
                  onOpenRoom={(rk) => { sfx('door'); setRoom(rk); setScene('room'); }} onSay={say} />
              </div>
              <div className="shrink-0 p-3 flex gap-2 justify-center flex-wrap">
                <button onClick={() => setScene('house')} className="px-4 py-3 rounded-2xl bg-white shadow-lg font-extrabold text-slate-600 active:scale-95">⬅ dışarı çık</button>
                <button onClick={housePicker} className="px-4 py-3 rounded-2xl bg-amber-400 shadow-lg font-extrabold text-amber-950 active:scale-95">🏠 daha büyük ev</button>
              </div>
            </div>
          )}
          {scene === 'room' && (
            <RoomEditor game={game} setGame={setGame} roomKey={curRoom} rooms={rooms} onChangeRoom={setRoom}
              itemMap={itemMap} byCat={byCat} isOwned={isOwned} balance={balance} buy={buy}
              onBack={() => setScene('plan')} onSurface={surfacePicker}
              paint={painting === `room_${curRoom}` ? paintCtx : null} paintBar={paintBar} onAskPaint={() => askPaint(`room_${curRoom}`)} />
          )}
        </div>
      )}

      {/* ARAÇLARIM: araba (modifiye + iç), uçan araç, tekne */}
      {tab === 'car' && (
        <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
          <div className="shrink-0 flex justify-center gap-1.5 px-2 pb-2">
            {VT.map(([id, ic, lb]) => (
              <button key={id} onClick={() => { say(lb); setVt(id); setCarScene('out'); }} className={`px-3 py-2 rounded-2xl font-extrabold text-sm border-4 ${vt === id ? 'bg-white border-indigo-400 text-indigo-600 shadow' : 'bg-white/60 border-transparent text-slate-500'}`}>
                <span className="text-xl">{ic}</span> {lb}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 relative">
          {!vehOf(vt) ? (
            <div className="absolute inset-0 overflow-y-auto ca-scroll p-3">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl p-4 text-center shadow mb-3">
                  <div className="text-xl font-extrabold text-slate-700">{vt === 'car' ? 'henüz araban yok' : vt === 'air' ? 'henüz uçan aracın yok' : 'henüz teknen yok'}</div>
                  <div className="text-sm font-bold text-slate-500">yıldız topla ve al! {vt === 'air' ? 'uçağın ya da helikopterin evinin üstünde uçar.' : vt === 'sea' ? 'teknen deniz ya da göl kenarındaki evinin önünde durur.' : ''}</div>
                </div>
                <ItemPicker inline items={(byCat.car || []).filter(it => vtypeOf(it) === vt)} currentId={null} isOwned={isOwned} balance={balance} game={game} itemMap={itemMap} onBuy={buy}
                  onSelect={(it) => it && setGame(g => ({ ...g, [vtypeOf(it)]: it.id }))} />
              </div>
            </div>
          ) : vt === 'car' && carScene === 'in' ? (
            <div className="absolute inset-0 flex flex-col ca-fadein bg-slate-800">
              <div className="flex-1 min-h-0 flex items-center justify-center p-2">
                <svg viewBox="0 0 400 250" className="w-full h-full max-w-4xl rounded-3xl"><CarInterior car={car} game={game} itemMap={itemMap} editable onSlot={(k) => { say(CAR_SLOTS[k]?.label); carDecorPicker(k); }} /></svg>
              </div>
              <div className="shrink-0 text-center text-[13px] font-bold text-white/70">+ işaretlerine dokun: arabana eşya koy</div>
              <div className="shrink-0 p-3 flex gap-2 justify-center">
                <button onClick={() => setCarScene('out')} className="px-4 py-3 rounded-2xl bg-white shadow-lg font-extrabold text-slate-600 active:scale-95">⬅ dışarı çık</button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col ca-fadein">
              <div className="flex-1 min-h-0 relative overflow-hidden">
                <VehicleStage vt={vt} />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <svg ref={vehSvgRef} viewBox={vt === 'sea' ? '0 0 240 130' : '-10 -30 260 170'} className={`w-full h-full max-w-2xl ${painting ? '' : vt === 'air' ? 'ca-hover' : vt === 'sea' ? 'ca-bobboat' : ''}`} style={{ overflow: 'visible', touchAction: painting ? 'none' : undefined }}>
                    <VehicleArt item={vehOf(vt)} paint={vt === 'car' ? carPaint : null} mods={vt === 'car' ? carMods : null} strokes={game.paints?.[`veh_${vehOf(vt)?.id}`]} onClick={vt === 'car' && !painting ? () => setCarScene('in') : undefined} />
                    {painting === `veh_${vehOf(vt)?.id}` && <PaintCapture svgRef={vehSvgRef} area={{ x: -10, y: -30, w: 260, h: 170 }} color={pColor} width={pWidth / 2} onStroke={addStroke} />}
                  </svg>
                </div>
              </div>
              <div className="shrink-0 p-2 flex gap-1.5 justify-center flex-wrap bg-white/70">
                {painting === `veh_${vehOf(vt)?.id}` ? paintBar : <>
                <button onClick={() => askPaint(`veh_${vehOf(vt)?.id}`)} className="h-12 px-3 rounded-2xl bg-gradient-to-b from-pink-400 to-fuchsia-500 shadow font-extrabold text-white active:scale-95">🖌️ fırça</button>
                {vt === 'car' && (
                  <>
                    <button onClick={() => { say('boya'); carPaintPicker(); }} className="h-12 px-3 rounded-2xl bg-pink-400 shadow font-extrabold text-white active:scale-95">🎨 boya</button>
                    {Object.entries(CAR_MOD_SLOTS).map(([k, v]) => (
                      <button key={k} onClick={() => { say(v.label); modPicker(k); }} className={`h-12 px-3 rounded-2xl shadow font-extrabold active:scale-95 ${game.carMods?.[k] ? 'bg-indigo-500 text-white' : 'bg-white text-slate-700'}`}>{v.icon} {v.label}</button>
                    ))}
                    <button onClick={() => { say('içine bak'); setCarScene('in'); }} className="h-12 px-3 rounded-2xl bg-indigo-600 shadow font-extrabold text-white active:scale-95">🔍 içi</button>
                  </>
                )}
                <button onClick={() => { say('değiştir'); vehPicker(vt); }} className="h-12 px-3 rounded-2xl bg-amber-400 shadow font-extrabold text-amber-950 active:scale-95">🔄 değiştir</button>
                </>}
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* EŞYALARIM: daha önce alınanlar */}
      {tab === 'mine' && (
        <div className="flex-1 min-h-0 overflow-y-auto ca-scroll p-3">
          <div className="max-w-3xl mx-auto space-y-3">
            {ownedGroups.length === 0 && (
              <div className="bg-white rounded-3xl p-6 text-center shadow">
                <div className="text-5xl">🎒</div>
                <div className="text-xl font-extrabold text-slate-700 mt-1">henüz bir şey almadın</div>
                <div className="text-sm font-bold text-slate-500">testleri çöz, yıldız topla, marketten al. aldıkların burada durur!</div>
              </div>
            )}
            {ownedGroups.map(({ c, list }) => (
              <div key={c} className="bg-white/80 rounded-3xl p-3 shadow-sm">
                <button onClick={() => say(CATEGORY_BY_ID[c]?.label)} className="text-lg font-extrabold text-slate-700 mb-2">{CATEGORY_BY_ID[c]?.icon} {CATEGORY_BY_ID[c]?.label} <span className="text-sm text-slate-400">({list.length})</span></button>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {list.map(it => (
                    <button key={it.id} onClick={() => useOwned(it)} className={`relative rounded-3xl border-4 p-1 flex flex-col items-center bg-white active:scale-95 ${isUsed(it) ? 'border-green-500' : 'border-slate-100'}`}>
                      <ItemThumb item={it} game={game} itemMap={itemMap} size={96} />
                      <div className="text-[12px] font-extrabold text-slate-700 leading-tight text-center line-clamp-2">{it.name}</div>
                      {isUsed(it) && <span className="absolute top-1.5 left-1.5 bg-green-500 text-white text-xs font-extrabold rounded-full w-7 h-7 flex items-center justify-center">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {paintAsk && <PaintConfirm price={paintPrice} tokens={game.paintTokens || 0} balance={balance} onYes={confirmPaint} onNo={() => setPaintAsk(null)} />}
      {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[130] bg-slate-900/85 text-white font-extrabold px-4 py-2 rounded-2xl ca-pop">{toast}</div>}

      {picker && (
        <ItemPicker
          title={picker.title}
          items={picker.items}
          currentId={picker.currentId}
          allowEmpty={picker.allowEmpty}
          isOwned={isOwned}
          balance={balance}
          game={game}
          itemMap={itemMap}
          onBuy={buy}
          onSelect={(it) => { picker.apply(it); setPicker(null); }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}
