import React from 'react';
import { ROOM_SLOTS, GARDEN_SLOTS, CAR_SLOTS, migrateRoom, itemBaseSize, isFlatItem } from './catalog';
import { shade } from './Avatar';
import { Oak, Pine, Bush, Flowers, Cloud, ArtByName } from './MapArt';
import { HouseArt } from './HouseArt';
import { VehicleArt } from './Vehicles';
import { LocationBackdrop, LOCATION_SCENES } from './LocationArt';
import { YARD_DEFAULT_SIZE } from './catalog';
import { PaintedLayer, Strokes } from './Paint';
import { Avatar } from './Avatar';

// ============================================================================
// --- GRUP: EV / ODA / ARABA ÇİZİMLERİ ---
// ============================================================================

// Bir eşyayı verilen kutuya çizer (resim, emoji veya hazır çizim)
export function SlotItem({ item, box }) {
  if (!item) return null;
  const { x, y, w, h } = box;
  if (item.image) return <image href={item.image} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMax meet" />;
  const r = item.render || {};
  if (r.draw) return <g transform={`translate(${x} ${y})`}><Furniture r={r} w={w} h={h} /></g>;
  if (r.art) return <g transform={`translate(${x + w / 2} ${y + h})`}><ArtByName name={r.art} c={r.color} flowers={r.flowers} s={Math.min(w, h) / 80} /></g>;
  if (r.emoji) {
    const fs = Math.min(w, h) * 0.9;
    return <text x={x + w / 2} y={y + h * 0.92} fontSize={fs} textAnchor="middle" style={{ userSelect: 'none' }}>{r.emoji}</text>;
  }
  return null;
}

// --- HAZIR MOBİLYA ÇİZİMLERİ (kutu içinde 0..w, 0..h) ---
function Furniture({ r, w, h }) {
  const c = r.color || '#a16207';
  switch (r.draw) {
    case 'mattress':
      return (
        <g>
          <rect x="4" y={h - 30} width={w - 8} height="26" rx="8" fill="#a8a29e" />
          <rect x="22" y={h - 24} width="22" height="14" fill="#78716c" stroke="#57534e" strokeDasharray="3 2" />
          <rect x={w - 54} y={h - 26} width="26" height="10" rx="5" fill="#d6d3d1" />
          <path d={`M10 ${h - 6} L${w - 10} ${h - 6}`} stroke="#57534e" strokeWidth="2" />
        </g>
      );
    case 'bed':
      return (
        <g>
          <rect x="2" y={h - 72} width="16" height="72" rx="4" fill="#92400e" />
          <rect x={w - 14} y={h - 46} width="12" height="46" rx="4" fill="#92400e" />
          <rect x="10" y={h - 40} width={w - 18} height="26" rx="6" fill="#f8fafc" />
          <rect x="44" y={h - 44} width={w - 54} height="30" rx="8" fill={c} />
          <rect x="18" y={h - 48} width="30" height="16" rx="7" fill="#fff" stroke="#e2e8f0" />
          <rect x="6" y={h - 14} width={w - 10} height="8" fill="#78350f" />
        </g>
      );
    case 'sofa':
      return (
        <g>
          <rect x="10" y={h - 70} width={w - 20} height="40" rx="14" fill={shade(c, -20)} />
          <rect x="4" y={h - 44} width={w - 8} height="30" rx="10" fill={c} />
          <rect x="0" y={h - 56} width="22" height="44" rx="10" fill={shade(c, -10)} />
          <rect x={w - 22} y={h - 56} width="22" height="44" rx="10" fill={shade(c, -10)} />
          <rect x="12" y={h - 14} width="6" height="12" fill="#422006" /><rect x={w - 18} y={h - 14} width="6" height="12" fill="#422006" />
          <circle cx={w / 2 - 18} cy={h - 50} r="9" fill="#fde68a" /><circle cx={w / 2 + 18} cy={h - 50} r="9" fill="#a5f3fc" />
        </g>
      );
    case 'box':
      return (
        <g>
          <rect x={w / 2 - 28} y={h - 40} width="56" height="40" fill="#c08457" stroke="#8b5a2b" strokeWidth="2" />
          <rect x={w / 2 - 5} y={h - 40} width="10" height="40" fill="#e7c9a0" opacity="0.8" />
          <path d={`M${w / 2 - 28} ${h - 40} L${w / 2 - 36} ${h - 50} M${w / 2 + 28} ${h - 40} L${w / 2 + 36} ${h - 50}`} stroke="#8b5a2b" strokeWidth="3" />
        </g>
      );
    case 'table':
      return (
        <g>
          <rect x="4" y={h - 46} width={w - 8} height="10" rx="3" fill={c} />
          <rect x="12" y={h - 38} width="8" height="38" fill={shade(c, -30)} />
          <rect x={w - 20} y={h - 38} width="8" height="38" fill={shade(c, -30)} />
          <text x={w / 2} y={h - 50} fontSize="20" textAnchor="middle">🍎</text>
        </g>
      );
    case 'tv':
      return (
        <g>
          <rect x="8" y={h - 22} width={w - 16} height="22" rx="3" fill="#78350f" />
          <rect x={w / 2 - 34} y={h - 66} width="68" height="42" rx="5" fill="#111827" />
          <rect x={w / 2 - 30} y={h - 62} width="60" height="34" rx="3" fill="#38bdf8" className="ca-tv" />
          <text x={w / 2} y={h - 38} fontSize="18" textAnchor="middle">🐬</text>
        </g>
      );
    case 'lamp':
      return (
        <g>
          <circle cx={w / 2} cy="16" r="22" fill={c} opacity="0.25" className="ca-glow" />
          <path d={`M${w / 2 - 15} 30 L${w / 2 - 9} 6 L${w / 2 + 9} 6 L${w / 2 + 15} 30 Z`} fill={c} />
          <rect x={w / 2 - 2} y="30" width="4" height={h - 36} fill="#475569" />
          <ellipse cx={w / 2} cy={h - 4} rx="12" ry="4" fill="#475569" />
        </g>
      );
    case 'curtain':
      return (
        <g>
          <rect x="0" y="0" width={w} height="6" rx="3" fill="#78350f" />
          <path d={`M2 4 Q14 ${h / 2} 4 ${h} L20 ${h} Q30 ${h / 2} 22 4 Z`} fill={c} />
          <path d={`M${w - 2} 4 Q${w - 14} ${h / 2} ${w - 4} ${h} L${w - 20} ${h} Q${w - 30} ${h / 2} ${w - 22} 4 Z`} fill={c} />
        </g>
      );
    case 'frame':
      return (
        <g>
          <rect x="2" y="2" width={w - 4} height={h - 4} rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="5" />
          <text x={w / 2} y={h / 2 + 12} fontSize={Math.min(w, h) * 0.55} textAnchor="middle">{r.emoji || '🖼️'}</text>
        </g>
      );
    case 'rug':
      return <g><ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={c} /><ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 12} ry={h / 2 - 6} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6 4" /></g>;
    case 'rainbowRug':
      return <g>{['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'].map((col, i) => <ellipse key={col} cx={w / 2} cy={h / 2} rx={w / 2 - i * 9} ry={h / 2 - i * 3} fill={col} />)}</g>;
    case 'wardrobe':
      return (
        <g>
          <rect x="2" y="4" width={w - 4} height={h - 10} rx="5" fill={c} />
          <rect x="2" y="4" width={w - 4} height="10" rx="4" fill={shade(c, -25)} />
          <rect x="8" y="18" width={w / 2 - 10} height={h - 34} rx="3" fill={shade(c, 12)} />
          <rect x={w / 2 + 2} y="18" width={w / 2 - 10} height={h - 34} rx="3" fill={shade(c, 12)} />
          <circle cx={w / 2 - 6} cy={h / 2} r="3" fill="#fde047" /><circle cx={w / 2 + 6} cy={h / 2} r="3" fill="#fde047" />
          <rect x="8" y={h - 8} width="8" height="8" fill={shade(c, -40)} /><rect x={w - 16} y={h - 8} width="8" height="8" fill={shade(c, -40)} />
        </g>
      );
    case 'bookshelf': {
      const rows = 4, rh = (h - 10) / rows;
      const bc = ['#ef4444', '#3b82f6', '#22c55e', '#facc15', '#a855f7', '#f97316'];
      return (
        <g>
          <rect x="2" y="2" width={w - 4} height={h - 4} rx="3" fill={c} />
          {Array.from({ length: rows }).map((_, r) => (
            <g key={r}>
              <rect x="7" y={7 + r * rh} width={w - 14} height={rh - 5} fill={shade(c, -35)} />
              {Array.from({ length: 6 }).map((__, b) => <rect key={b} x={9 + b * ((w - 18) / 6)} y={9 + r * rh + (b % 3)} width={(w - 18) / 6 - 2} height={rh - 9 - (b % 3)} fill={bc[(b + r) % 6]} />)}
            </g>
          ))}
        </g>
      );
    }
    case 'desk':
      return (
        <g>
          <rect x="2" y={h - 50} width={w - 4} height="10" rx="3" fill={c} />
          <rect x="6" y={h - 40} width="10" height="40" fill={shade(c, -30)} />
          <rect x={w - 40} y={h - 40} width="34" height="40" rx="2" fill={shade(c, -15)} />
          <rect x={w - 36} y={h - 34} width="26" height="12" rx="2" fill={shade(c, 10)} /><rect x={w - 36} y={h - 18} width="26" height="12" rx="2" fill={shade(c, 10)} />
          <rect x="18" y={h - 66} width="34" height="16" rx="2" fill="#38bdf8" /><rect x="33" y={h - 52} width="4" height="4" fill="#475569" />
          <circle cx={w - 30} cy={h - 58} r="6" fill="#facc15" /><rect x={w - 31} y={h - 56} width="2" height="6" fill="#475569" />
        </g>
      );
    case 'chair':
      return (
        <g>
          <rect x="6" y="2" width={w - 12} height={h * 0.45} rx="6" fill={c} />
          <rect x="2" y={h * 0.5} width={w - 4} height="9" rx="3" fill={shade(c, -15)} />
          <rect x="5" y={h * 0.5 + 8} width="5" height={h * 0.5 - 8} fill={shade(c, -40)} /><rect x={w - 10} y={h * 0.5 + 8} width="5" height={h * 0.5 - 8} fill={shade(c, -40)} />
        </g>
      );
    case 'armchair':
      return (
        <g>
          <rect x="10" y="4" width={w - 20} height={h - 26} rx="14" fill={shade(c, -15)} />
          <rect x="6" y={h - 34} width={w - 12} height="22" rx="8" fill={c} />
          <rect x="0" y={h - 46} width="16" height="36" rx="8" fill={shade(c, 8)} /><rect x={w - 16} y={h - 46} width="16" height="36" rx="8" fill={shade(c, 8)} />
          <rect x="10" y={h - 12} width="6" height="12" fill="#422006" /><rect x={w - 16} y={h - 12} width="6" height="12" fill="#422006" />
        </g>
      );
    case 'fridge':
      return (
        <g>
          <rect x="2" y="2" width={w - 4} height={h - 4} rx="8" fill={c} />
          <path d={`M2 ${h * 0.36} L${w - 2} ${h * 0.36}`} stroke={shade(c, -40)} strokeWidth="3" />
          <rect x={w - 12} y="12" width="4" height={h * 0.18} rx="2" fill="#94a3b8" /><rect x={w - 12} y={h * 0.44} width="4" height={h * 0.3} rx="2" fill="#94a3b8" />
          <circle cx="16" cy={h * 0.55} r="5" fill="#f43f5e" /><rect x="12" y={h * 0.62} width="12" height="9" fill="#facc15" />
        </g>
      );
    case 'stove':
      return (
        <g>
          <rect x="2" y="12" width={w - 4} height={h - 14} rx="4" fill={c} />
          <rect x="2" y="6" width={w - 4} height="10" rx="3" fill="#475569" />
          <circle cx={w * 0.3} cy="10" r="6" fill="#1f2937" /><circle cx={w * 0.7} cy="10" r="6" fill="#1f2937" />
          <rect x="8" y="26" width={w - 16} height={h - 40} rx="4" fill="#1f2937" /><rect x="12" y="30" width={w - 24} height={h - 50} rx="3" fill="#f97316" opacity="0.5" />
          <rect x="12" y="20" width={w - 24} height="3" rx="1.5" fill="#94a3b8" />
        </g>
      );
    case 'toybox':
      return (
        <g>
          <rect x="2" y={h * 0.32} width={w - 4} height={h * 0.68 - 2} rx="5" fill={c} />
          <path d={`M2 ${h * 0.34} Q${w / 2} ${-h * 0.05} ${w - 2} ${h * 0.34} Z`} fill={shade(c, -20)} />
          <circle cx={w * 0.3} cy={h * 0.62} r={h * 0.12} fill="#facc15" /><rect x={w * 0.55} y={h * 0.5} width={h * 0.24} height={h * 0.24} fill="#3b82f6" />
        </g>
      );
    case 'aquarium':
      return (
        <g>
          <rect x="4" y={h - 18} width={w - 8} height="18" rx="3" fill="#78350f" />
          <rect x="2" y="4" width={w - 4} height={h - 20} rx="5" fill="#67e8f9" opacity="0.85" />
          <path d={`M6 ${h - 26} Q20 ${h - 34} 30 ${h - 26} T60 ${h - 26}`} stroke="#16a34a" strokeWidth="4" fill="none" />
          <g className="ca-wave"><path d={`M${w * 0.3} ${h * 0.4} q8 -7 16 0 q-8 7 -16 0 Z M${w * 0.3 + 16} ${h * 0.4} l7 -5 l0 10 Z`} fill="#f97316" /></g>
          <g className="ca-drift"><path d={`M${w * 0.6} ${h * 0.25} q6 -5 12 0 q-6 5 -12 0 Z M${w * 0.6 + 12} ${h * 0.25} l5 -4 l0 8 Z`} fill="#facc15" /></g>
          <circle cx={w * 0.8} cy={h * 0.5} r="2.5" fill="#fff" opacity="0.8" /><circle cx={w * 0.82} cy={h * 0.38} r="2" fill="#fff" opacity="0.8" />
          <rect x="2" y="4" width={w - 4} height="6" fill="#fff" opacity="0.4" />
        </g>
      );
    case 'bunk':
      return (
        <g>
          <rect x="2" y="2" width="8" height={h - 2} fill={shade(c, -25)} /><rect x={w - 10} y="2" width="8" height={h - 2} fill={shade(c, -25)} />
          <rect x="6" y={h * 0.32} width={w - 12} height="16" rx="4" fill={c} /><rect x="10" y={h * 0.32 - 10} width={w - 20} height="12" rx="5" fill="#f8fafc" />
          <rect x="6" y={h - 26} width={w - 12} height="16" rx="4" fill={c} /><rect x="10" y={h - 36} width={w - 20} height="12" rx="5" fill="#f8fafc" />
          {[0.45, 0.6, 0.75].map(k => <rect key={k} x={w - 26} y={h * k} width="16" height="3" fill={shade(c, -25)} />)}
          <rect x={w - 28} y={h * 0.32} width="3" height={h * 0.68} fill={shade(c, -25)} />
        </g>
      );
    default: return null;
  }
}

// --- DÜZENLEME İŞARETİ (boş yer için +, dolu yer için hafif çerçeve) ---
function EditMarker({ box, filled, onClick, label }) {
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="transparent" />
      {!filled && (
        <g className="ca-pulse" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <circle cx={cx} cy={cy} r="15" fill="#fff" opacity="0.85" stroke="#6366f1" strokeWidth="3" strokeDasharray="5 3" />
          <text x={cx} y={cy + 7} fontSize="20" textAnchor="middle" fill="#6366f1" fontWeight="900">+</text>
        </g>
      )}
      <title>{label}</title>
    </g>
  );
}

// ============================================================================
// --- EV DIŞ GÖRÜNÜŞ (400x300) ---
// ============================================================================
function Fence({ r }) {
  const c = r?.color || '#a16207';
  if (r?.kind === 'hedge') {
    return <g>{Array.from({ length: 14 }).map((_, i) => <g key={i}><circle cx={i * 30 + 10} cy="266" r="16" fill={c} /><circle cx={i * 30 + 14} cy="258" r="3" fill={['#f472b6', '#facc15', '#fff'][i % 3]} /></g>)}</g>;
  }
  return (
    <g>
      <rect x="0" y="260" width="120" height="6" fill={c} /><rect x="280" y="260" width="120" height="6" fill={c} />
      {Array.from({ length: 6 }).map((_, i) => <path key={`l${i}`} d={`M${i * 20 + 4} 280 L${i * 20 + 4} 252 L${i * 20 + 10} 244 L${i * 20 + 16} 252 L${i * 20 + 16} 280 Z`} fill={c} stroke={shade(c, -30)} strokeWidth="1" />)}
      {Array.from({ length: 6 }).map((_, i) => <path key={`r${i}`} d={`M${284 + i * 20} 280 L${284 + i * 20} 252 L${290 + i * 20} 244 L${296 + i * 20} 252 L${296 + i * 20} 280 Z`} fill={c} stroke={shade(c, -30)} strokeWidth="1" />)}
    </g>
  );
}

// Bahçe eşyasının boyutu ve çizimi (serbest yerleşim)
export const yardSize = (item) => (item?.size?.w ? { w: Number(item.size.w), h: Number(item.size.h) } : item?.cat === 'pet' ? { w: 46, h: 46 } : YARD_DEFAULT_SIZE);

export function YardItems({ game, itemMap, selectedUid, onItemDown }) {
  const items = (game.yard?.items || []).map(it => ({ it, item: itemMap.get(it.id) })).filter(x => x.item).sort((a, b) => a.it.y - b.it.y);
  return (
    <g>
      {items.map(({ it, item }) => {
        const { w, h } = yardSize(item);
        const s = Number(it.s) || 1;
        const sel = selectedUid === it.uid;
        return (
          <g key={it.uid} onPointerDown={onItemDown ? (e) => onItemDown(e, it) : undefined} className={onItemDown ? 'ca-roomitem' : ''}>
            <g transform={`translate(${it.x} ${it.y}) scale(${it.flip ? -s : s} ${s}) translate(${-w / 2} ${-h})`}>
              <SlotItem item={item} box={{ x: 0, y: 0, w, h }} />
              <rect x="0" y="0" width={w} height={h} fill="transparent" />
            </g>
            {sel && <rect x={it.x - w * s / 2 - 4} y={it.y - h * s - 4} width={w * s + 8} height={h * s + 8} rx="6" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="6 4" className="ca-selbox" pointerEvents="none" />}
          </g>
        );
      })}
    </g>
  );
}

// Evin mekanını (ada, sahil...) 400x300 ev çiziminin arkasına yerleştirir
export function HouseBackdrop({ scene, image }) {
  const L = LOCATION_SCENES[scene] || LOCATION_SCENES.meadow;
  if (image) return <g><rect x="-1200" y="-1200" width="2800" height="2800" fill={L.ground} /><image href={image} x="-200" y="-85" width="800" height="450" preserveAspectRatio="xMidYMid slice" /></g>;
  return (
    <g>
      <rect x="-1200" y="-1200" width="2800" height="1460" fill={L.sky[0]} />
      <rect x="-1200" y="255" width="2800" height="1400" fill={L.ground} />
      <svg x="-200" y="-85" width="800" height="450" viewBox="0 0 800 450" overflow="visible"><LocationBackdrop scene={scene} id="hb" /></svg>
    </g>
  );
}

export function HouseExterior({ house, game, itemMap, onDoor, showGround = true, extendBg = false, selectedUid, onItemDown, hideYard = false }) {
  const get = (id) => (id ? itemMap.get(id) : null);
  const wall = get(game.wallPaint)?.render?.color;
  const roof = get(game.roofPaint)?.render?.color;
  const garden = game.garden || {};
  const scene = get(game.location)?.render?.scene || 'meadow';
  return (
    <g>
      {extendBg && <HouseBackdrop scene={scene} image={get(game.location)?.image} />}
      {showGround && !extendBg && <g><rect x="0" y="250" width="400" height="50" fill="#86efac" /></g>}
      {(showGround || extendBg) && <path d="M176 300 L184 262 L216 262 L224 300 Z" fill="#e7e5e4" stroke="#2b2233" strokeOpacity="0.3" strokeWidth="2" />}
      <PaintedLayer strokes={game.paints?.[`house_${house?.id}`]}>
        {house?.image
          ? <g onClick={onDoor} style={{ cursor: onDoor ? 'pointer' : 'default' }}><image href={house.image} x="60" y="40" width="280" height="222" preserveAspectRatio="xMidYMax meet" /></g>
          : <HouseArt house={house} wallPaint={wall} roofPaint={roof} onDoor={onDoor} />}
      </PaintedLayer>
      {garden.fence && (get(garden.fence)?.image ? <SlotItem item={get(garden.fence)} box={GARDEN_SLOTS.fence} /> : <Fence r={get(garden.fence)?.render} />)}
      {!hideYard && <YardItems game={game} itemMap={itemMap} selectedUid={selectedUid} onItemDown={onItemDown} />}
    </g>
  );
}

// ============================================================================
// --- ODA İÇİ (400x250) - derinlikli oda + serbest yerleşimli eşyalar ---
// ============================================================================
// Arka duvar x:50-350 y:0-175, yan duvarlar eğik, zemin y:175-250.
// Eşyalar: room.items = [{ uid, id, x, y, s, flip }]  (x,y = alt orta nokta)
export const ROOM_FLOOR_Y = 175;

export function placedTransform(it, item) {
  const { w, h } = itemBaseSize(item);
  const s = Number(it.s) || 1;
  return { w, h, s, transform: `translate(${it.x} ${it.y}) scale(${it.flip ? -s : s} ${s}) translate(${-w / 2} ${-h})` };
}

export function RoomInterior({ roomKey, game, itemMap, editable, onSlot, selectedUid, onItemDown, hideItems = false }) {
  const get = (id) => (id ? itemMap.get(id) : null);
  const room = migrateRoom((game.rooms || {})[roomKey]);
  const wp = get(room.wallpaper) || { render: { color: '#fef3c7' } };
  const fl = get(room.floor) || { render: { color: '#d6a46c', pattern: 'planks' } };
  const wc = wp.render?.color || '#fef3c7';
  const fc = fl.render?.color || '#d6a46c';
  const pid = `rp_${String(roomKey).replace(/[^a-zA-Z0-9_]/g, '_')}`;
  const BACK = 'M50 0 L350 0 L350 175 L50 175 Z';
  const FLOOR = 'M50 175 L350 175 L400 250 L0 250 Z';
  const LEFT = 'M0 0 L50 0 L50 175 L0 250 Z';
  const RIGHT = 'M350 0 L400 0 L400 250 L350 175 Z';
  const placed = (room.items || [])
    .map(it => ({ it, item: get(it.id) }))
    .filter(x => x.item)
    .sort((a, b) => (isFlatItem(b.item) - isFlatItem(a.item)) || (a.it.y - b.it.y));
  return (
    <g clipPath={`url(#${pid}_clip)`}>
      <defs>
        <clipPath id={`${pid}_clip`}><rect x="0" y="0" width="400" height="250" rx="14" /></clipPath>
        <clipPath id={`${pid}_back`}><path d={BACK} /></clipPath>
        <clipPath id={`${pid}_floor`}><path d={FLOOR} /></clipPath>
        <pattern id={`${pid}_dots`} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="4" fill="#fff" opacity="0.7" /></pattern>
        <pattern id={`${pid}_stars`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M12 6 L14 12 L20 12 L15 16 L17 22 L12 18 L7 22 L9 16 L4 12 L10 12 Z" fill="#fde047" /><circle cx="30" cy="34" r="1.6" fill="#fff" /></pattern>
        <pattern id={`${pid}_stripes`} width="24" height="24" patternUnits="userSpaceOnUse"><rect width="12" height="24" fill="#fff" opacity="0.45" /></pattern>
        <pattern id={`${pid}_hearts`} width="34" height="34" patternUnits="userSpaceOnUse"><path d="M17 26 C6 18 8 9 13 9 C15 9 17 11 17 12 C17 11 19 9 21 9 C26 9 28 18 17 26 Z" fill="#f472b6" opacity="0.7" /></pattern>
        <pattern id={`${pid}_checks`} width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 15 L30 15 M15 0 L15 30" stroke="#fff" strokeWidth="5" opacity="0.6" /></pattern>
        <pattern id={`${pid}_waves`} width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q10 2 20 10 T40 10" stroke="#fff" strokeWidth="3" fill="none" opacity="0.7" /></pattern>
        <pattern id={`${pid}_clouds`} width="70" height="50" patternUnits="userSpaceOnUse"><g fill="#fff" opacity="0.85"><circle cx="20" cy="22" r="8" /><circle cx="30" cy="18" r="10" /><circle cx="40" cy="23" r="7" /><rect x="14" y="22" width="32" height="8" rx="4" /></g></pattern>
        <pattern id={`${pid}_flowers`} width="36" height="36" patternUnits="userSpaceOnUse"><g transform="translate(18 18)">{[0, 72, 144, 216, 288].map(a => <circle key={a} cx={Math.cos(a * Math.PI / 180) * 5} cy={Math.sin(a * Math.PI / 180) * 5} r="4" fill="#fff" />)}<circle r="3" fill="#facc15" /></g></pattern>
        <pattern id={`${pid}_dino`} width="60" height="44" patternUnits="userSpaceOnUse"><path d="M10 34 Q12 20 26 20 Q34 12 40 16 Q44 20 38 24 L38 34 L34 34 L33 28 L22 28 L20 34 Z" fill="#16a34a" opacity="0.55" /></pattern>
        <pattern id={`${pid}_tiles`} width="34" height="16" patternUnits="userSpaceOnUse"><rect width="34" height="16" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" /></pattern>
        <pattern id={`${pid}_grass`} width="16" height="10" patternUnits="userSpaceOnUse"><path d="M3 10 l2 -6 l2 6 M10 10 l2 -5 l2 5" stroke="#166534" strokeWidth="1.5" fill="none" /></pattern>
        <pattern id={`${pid}_sand`} width="14" height="10" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#b45309" opacity="0.4" /><circle cx="10" cy="7" r="1" fill="#b45309" opacity="0.4" /></pattern>
        <pattern id={`${pid}_water`} width="40" height="14" patternUnits="userSpaceOnUse"><path d="M0 7 Q10 2 20 7 T40 7" stroke="#fff" strokeWidth="2" fill="none" opacity="0.8" /></pattern>
        <pattern id={`${pid}_checker`} width="40" height="40" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#475569" opacity="0.45" /><rect x="20" y="20" width="20" height="20" fill="#475569" opacity="0.45" /></pattern>
        <linearGradient id={`${pid}_shadeTop`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.18" /><stop offset="0.4" stopColor="#000" stopOpacity="0" /></linearGradient>
        <linearGradient id={`${pid}_light`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffbe6" stopOpacity="0.55" /><stop offset="1" stopColor="#fffbe6" stopOpacity="0" /></linearGradient>
        <filter id={`${pid}_ink`} x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="d" /><feFlood floodColor="#2b2233" result="c" />
          <feComposite in="c" in2="d" operator="in" result="o" /><feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* arka duvar */}
      <g clipPath={`url(#${pid}_back)`}>
        {wp.image ? <image href={wp.image} x="50" y="0" width="300" height="175" preserveAspectRatio="xMidYMid slice" /> : <rect x="50" y="0" width="300" height="175" fill={wc} />}
        {wp.render?.pattern === 'dots' && <rect x="50" y="0" width="300" height="175" fill={`url(#${pid}_dots)`} />}
        {wp.render?.pattern === 'stars' && <rect x="50" y="0" width="300" height="175" fill={`url(#${pid}_stars)`} />}
        {['stripes', 'hearts', 'checks', 'waves', 'clouds', 'flowers', 'dino'].includes(wp.render?.pattern) && <rect x="50" y="0" width="300" height="175" fill={`url(#${pid}_${wp.render.pattern})`} />}
        {wp.render?.pattern === 'cracks' && <g stroke={shade(wc, -45)} strokeWidth="2" fill="none"><path d="M80 20 L92 44 L86 60 L98 80" /><path d="M250 110 L262 126 L256 140" /><path d="M140 140 L154 156" /></g>}
      </g>
      {/* yan duvarlar (biraz daha koyu) */}
      <path d={LEFT} fill={wp.image ? shade('#e7e5e4', -30) : shade(wc, -28)} />
      <path d={RIGHT} fill={wp.image ? shade('#e7e5e4', -30) : shade(wc, -28)} />
      {/* zemin */}
      <g clipPath={`url(#${pid}_floor)`}>
        {fl.image ? <image href={fl.image} x="0" y="175" width="400" height="75" preserveAspectRatio="xMidYMid slice" /> : <rect x="0" y="175" width="400" height="75" fill={fc} />}
        {fl.render?.pattern === 'planks' && Array.from({ length: 13 }).map((_, i) => <path key={i} d={`M${50 + i * 25} 175 L${-20 + i * 36} 250`} stroke={shade(fc, -28)} strokeWidth="1.6" />)}
        {fl.render?.pattern === 'old' && <g stroke={shade(fc, -32)} strokeWidth="2"><path d="M30 196 L370 196 M12 220 L388 220 M0 240 L400 240" /><path d="M120 196 L116 220 M260 220 L264 240" /></g>}
        {fl.render?.pattern === 'checker' && <rect x="0" y="175" width="400" height="75" fill={`url(#${pid}_checker)`} />}
        {['tiles', 'grass', 'sand', 'water'].includes(fl.render?.pattern) && <rect x="0" y="175" width="400" height="75" fill={`url(#${pid}_${fl.render.pattern})`} />}
        {fl.render?.pattern === 'carpet' && <rect x="0" y="175" width="400" height="75" fill="#fff" opacity="0.08" />}
      </g>
      {/* süpürgelik ve köşe çizgileri */}
      <path d="M50 171 L350 171 L350 177 L50 177 Z" fill={shade(wp.image ? '#d6d3d1' : wc, -45)} />
      <path d="M50 0 L50 175 L0 250 M350 0 L350 175 L400 250" stroke="#2b2233" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      {/* pencere + ışık */}
      <path d="M302 98 L366 98 L380 250 L250 250 Z" fill={`url(#${pid}_light)`} />
      <g>
        <rect x="302" y="34" width="64" height="64" rx="5" fill="#bae6fd" stroke="#fff" strokeWidth="5" />
        <rect x="302" y="34" width="64" height="64" rx="5" fill="none" stroke="#2b2233" strokeOpacity="0.5" strokeWidth="1.5" />
        <circle cx="350" cy="52" r="8" fill="#fde047" />
        <path d="M310 84 Q322 70 334 84 Q346 74 358 84 L358 94 L310 94 Z" fill="#86efac" />
        <path d="M334 34 L334 98 M302 66 L366 66" stroke="#fff" strokeWidth="4" />
        <rect x="296" y="98" width="76" height="6" rx="2" fill="#f8fafc" stroke="#2b2233" strokeOpacity="0.4" />
      </g>
      {/* çocuğun elle boyadığı izler (duvar ve zeminde, eşyaların altında) */}
      <g pointerEvents="none"><Strokes strokes={game.paints?.[`room_${roomKey}`]} /></g>
      <rect x="0" y="0" width="400" height="250" fill={`url(#${pid}_shadeTop)`} pointerEvents="none" />

      {/* eşyalar */}
      {!hideItems && placed.map(({ it, item }) => {
        const t = placedTransform(it, item);
        const floorItem = it.y > ROOM_FLOOR_Y + 4 && !isFlatItem(item);
        const sel = selectedUid === it.uid;
        return (
          <g key={it.uid} className={onItemDown ? 'ca-roomitem' : ''} onPointerDown={onItemDown ? (e) => onItemDown(e, it) : undefined}>
            {floorItem && <ellipse cx={it.x} cy={it.y - 1} rx={t.w * t.s * 0.42} ry={Math.max(3, t.w * t.s * 0.07)} fill="#000" opacity="0.18" />}
            <g transform={t.transform} filter={item.image ? undefined : `url(#${pid}_ink)`}>
              <SlotItem item={item} box={{ x: 0, y: 0, w: t.w, h: t.h }} />
              <rect x="0" y="0" width={t.w} height={t.h} fill="transparent" />
            </g>
            {sel && <rect x={it.x - t.w * t.s / 2 - 4} y={it.y - t.h * t.s - 4} width={t.w * t.s + 8} height={t.h * t.s + 8} rx="6" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="6 4" className="ca-selbox" pointerEvents="none" />}
          </g>
        );
      })}
      {editable && onSlot && Object.entries(ROOM_SLOTS).map(([k, box]) => <EditMarker key={k} box={box} filled={false} onClick={() => onSlot?.(k)} label={box.label} />)}
    </g>
  );
}

// ============================================================================
// --- ARABA DIŞ (220x120) ---
// ============================================================================
// (eski 220x120 ölçüsüyle uyumlu) her türlü aracı çizer
export function CarExterior({ car, paint, mods, onClick }) {
  if (!car) return null;
  return <g transform="scale(0.9167)"><VehicleArt item={car} paint={paint} mods={mods} onClick={onClick} /></g>;
}

// --- ARABA İÇİ (400x250) ---
export function CarInterior({ car, game, itemMap, editable, onSlot }) {
  const get = (id) => (id ? itemMap.get(id) : null);
  const deco = game.carDecor || {};
  const paint = get(game.carPaint)?.render?.color || car?.render?.color || '#38bdf8';
  const seat = get(deco.seat)?.render?.color || '#57534e';
  return (
    <g>
      <rect x="0" y="0" width="400" height="250" fill={shade(paint, -50)} />
      <path d="M40 20 Q200 -4 360 20 L330 120 L70 120 Z" fill="#7dd3fc" />
      <path d="M40 20 Q200 -4 360 20 L330 120 L70 120 Z" fill="url(#ci_sky)" opacity="0.6" />
      <defs><linearGradient id="ci_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0f2fe" /><stop offset="1" stopColor="#4ade80" /></linearGradient></defs>
      <g className="ca-drift"><text x="90" y="56" fontSize="26">☁️</text><text x="270" y="44" fontSize="20">☁️</text></g>
      <path d="M0 120 L400 120 L400 170 Q200 150 0 170 Z" fill={shade(paint, -20)} />
      <rect x="0" y="118" width="400" height="10" fill={paint} />
      <rect x="168" y="20" width="64" height="16" rx="6" fill="#1f2937" />
      <g transform="translate(110 150)"><circle r="44" fill="none" stroke="#1f2937" strokeWidth="12" /><circle r="10" fill="#1f2937" /><path d="M-40 0 L40 0 M0 0 L0 40" stroke="#1f2937" strokeWidth="8" /></g>
      <rect x="0" y="196" width="150" height="60" rx="18" fill={seat} />
      <rect x="250" y="196" width="150" height="60" rx="18" fill={seat} />
      <rect x="224" y="136" width="40" height="18" rx="4" fill="#0f172a" /><circle cx="236" cy="145" r="4" fill="#22c55e" /><circle cx="252" cy="145" r="4" fill="#f59e0b" />
      {['dash', 'mirror', 'back'].map(k => <SlotItem key={k} item={get(deco[k])} box={CAR_SLOTS[k]} />)}
      {deco.mirror && <path d="M200 36 L200 44" stroke="#475569" strokeWidth="2" />}
      {editable && ['dash', 'mirror', 'back'].map(k => <EditMarker key={k} box={CAR_SLOTS[k]} filled={!!deco[k]} onClick={() => onSlot?.(k)} label={CAR_SLOTS[k].label} />)}
      {editable && <EditMarker box={{ x: 300, y: 200, w: 60, h: 40 }} filled={!!deco.seat} onClick={() => onSlot?.('seat')} label="Koltuk kılıfı" />}
    </g>
  );
}

// ============================================================================
// --- UZAKTAN GÖRÜNÜŞ (800x450): gökyüzü, tepeler, ev, araba ---
// ============================================================================
// --- EVİN ÖNÜNDEKİ OYNAK ŞEYLER: araba, uçan araç, tekne, karakter (yerleri değiştirilebilir) ---
// Konumlar ev tuvali (400x300) koordinatındadır: game.yardPos = { car, air, sea, me: { x, y, s, flip } }
export const actorDefaults = (scene) => {
  const L = LOCATION_SCENES[scene] || LOCATION_SCENES.meadow;
  const boat = L.boat ? [(L.boat[0] - 230) / 0.85, (L.boat[1] - 120) / 0.85 + 6] : [-60, 300];
  return { car: { x: 372, y: 302, s: 0.72 }, air: { x: 300, y: 36, s: 0.62 }, sea: { x: boat[0], y: boat[1], s: 0.72 }, me: { x: 22, y: 304, s: 1 } };
};

export function YardActors({ game, itemMap, onDown, selected, hideMe = false }) {
  const get = (id) => (id ? itemMap.get(id) : null);
  const scene = get(game.location)?.render?.scene || 'meadow';
  const def = actorDefaults(scene);
  const pos = (k) => ({ ...def[k], ...(game.yardPos?.[k] || {}) });
  const carMods = Object.fromEntries(Object.entries(game.carMods || {}).map(([k, id]) => [k, get(id)]).filter(([, v]) => v));
  const actors = [];
  const car = get(game.car), air = get(game.air), sea = get(game.sea);
  if (sea) actors.push({ k: 'sea', item: sea });
  if (car) actors.push({ k: 'car', item: car });
  if (!hideMe) actors.push({ k: 'me' });
  if (air) actors.push({ k: 'air', item: air });
  const sorted = actors.map(a => ({ ...a, p: pos(a.k) })).sort((a, b) => (a.k === 'air') - (b.k === 'air') || a.p.y - b.p.y);
  return (
    <g>
      {sorted.map(({ k, item, p }) => {
        const s = Number(p.s) || 1;
        const sel = selected === `actor:${k}`;
        const handler = onDown ? (e) => onDown(e, k) : undefined;
        if (k === 'me') {
          const w = 70 * s, h = 95 * s;
          return (
            <g key={k} data-actor={k} onPointerDown={handler} className={onDown ? 'ca-roomitem' : ''}>
              <g transform={`translate(${p.x - w / 2} ${p.y - h})`}><g transform={p.flip ? `translate(${w} 0) scale(-1 1)` : undefined}><Avatar game={game} itemMap={itemMap} size={w} /></g></g>
              <rect x={p.x - w / 2} y={p.y - h} width={w} height={h} fill="transparent" />
              {sel && <rect x={p.x - w / 2 - 4} y={p.y - h - 4} width={w + 8} height={h + 8} rx="6" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="6 4" className="ca-selbox" pointerEvents="none" />}
            </g>
          );
        }
        const w = 240 * s, h = 130 * s;
        return (
          <g key={k} data-actor={k} onPointerDown={handler} className={onDown ? 'ca-roomitem' : ''}>
            <g transform={`translate(${p.x} ${p.y}) scale(${p.flip ? -s : s} ${s}) translate(-120 -124)`}>
              <g className={k === 'air' ? 'ca-hover' : k === 'sea' ? 'ca-bobboat' : undefined}>
                <VehicleArt item={item} paint={k === 'car' && game.carPaint ? get(game.carPaint)?.render?.color : null} mods={k === 'car' ? carMods : null} strokes={game.paints?.[`veh_${item.id}`]} />
              </g>
              <rect x="0" y="0" width="240" height="130" fill="transparent" />
            </g>
            {sel && <rect x={p.x - w / 2 - 4} y={p.y - h - 2} width={w + 8} height={h + 8} rx="6" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="6 4" className="ca-selbox" pointerEvents="none" />}
          </g>
        );
      })}
    </g>
  );
}

export function FarScene({ house, game, itemMap, onHouse, onCar, onAir, onSea }) {
  const locItem = itemMap.get(game.location);
  const scene = locItem?.render?.scene || 'meadow';
  return (
    <svg viewBox="40 60 720 390" className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
      {locItem?.image ? <image href={locItem.image} x="0" y="0" width="800" height="450" preserveAspectRatio="xMidYMid slice" /> : <LocationBackdrop scene={scene} id="far" />}
      <g onClick={onHouse} style={{ cursor: 'pointer' }} className="ca-tap">
        <svg x="230" y="120" width="340" height="255" viewBox="0 0 400 300" overflow="visible">
          <HouseExterior house={house} game={game} itemMap={itemMap} showGround={false} />
        </svg>
        <g transform="translate(410 120)"><g className="ca-hint"><circle r="18" fill="#fff" stroke="#6366f1" strokeWidth="3" /><text y="7" fontSize="18" textAnchor="middle">🔍</text></g></g>
      </g>
      {/* araba, uçan araç, tekne ve karakter: çocuğun bahçede koyduğu yerlerde */}
      <g transform="translate(230 120) scale(0.85)" onClick={(e) => { const t = e.target.closest?.('[data-actor]'); const k = t?.getAttribute('data-actor'); if (k === 'car') onCar?.(); if (k === 'air') onAir?.(); if (k === 'sea') onSea?.(); }}>
        <YardActors game={game} itemMap={itemMap} />
      </g>
    </svg>
  );
}
