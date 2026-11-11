import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { SlotItem, HouseExterior, CarExterior, RoomInterior } from './Scenes';
import { VehicleArt } from './Vehicles';
import { LocationBackdrop } from './LocationArt';
import { THUMB_VIEWS } from './catalog';
import { sfx, say } from './fx';
import { DiamondShape } from './Celebration';

// ============================================================================
// --- GRUP: EŞYA SEÇİCİ / MARKET KARTLARI ---
// ============================================================================
const CHAR_CATS = ['hair', 'top', 'bottom', 'shoes', 'hat', 'accessory', 'base', 'hairColor'];

// Bir eşyanın önizlemesi. Karakter eşyalarında sadece ilgili bölge (kafa, üst, ayak...) büyük gösterilir.
export function ItemThumb({ item, game, itemMap, size = 96, full = false }) {
  if (!item) return <div style={{ width: size, height: size }} className="flex items-center justify-center text-3xl text-slate-300">∅</div>;
  const r = item.render || {};
  const cat = item.cat;
  if (CHAR_CATS.includes(cat)) {
    const preview = cat === 'base' ? { base: item.id } : cat === 'hairColor' ? { hairColor: item.id } : { [cat]: item.id };
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center overflow-hidden">
        <Avatar game={game} itemMap={itemMap} preview={preview} fluid view={full ? undefined : THUMB_VIEWS[cat]} />
      </div>
    );
  }
  if (['wallPaint', 'roofPaint', 'carPaint', 'wallpaper', 'floor'].includes(cat) || (cat === 'carDecor' && item.slot === 'seat')) {
    if (item.image) return <img src={item.image} alt="" draggable="false" style={{ width: size * 0.84, height: size * 0.84 }} className="rounded-2xl object-cover mx-auto border-4 border-white shadow" />;
    return <div style={{ width: size, height: size }} className="flex items-center justify-center"><div className="rounded-full border-4 border-white shadow-md" style={{ width: size * 0.7, height: size * 0.7, background: r.color }} /></div>;
  }
  if (cat === 'house') {
    return <svg width={size} height={size} viewBox="30 0 340 280"><HouseExterior house={item} game={{ ...game, wallPaint: null, roofPaint: null, garden: {} }} itemMap={itemMap} showGround={false} hideYard /></svg>;
  }
  if (cat === 'car') {
    return <svg width={size} height={size} viewBox="0 -40 240 200"><VehicleArt item={item} /></svg>;
  }
  if (cat === 'carMod') {
    const demo = { render: { vtype: 'car', kind: 'sport', color: '#94a3b8' } };
    return <svg width={size} height={size} viewBox={item.slot === 'rims' ? '20 60 100 70' : item.slot === 'roof' ? '60 -20 160 120' : '0 -20 240 170'}><VehicleArt item={demo} mods={{ [item.slot]: item }} /></svg>;
  }
  if (cat === 'location') {
    return <div style={{ width: size, height: size }} className="rounded-2xl overflow-hidden"><svg width={size} height={size} viewBox="120 120 560 330" preserveAspectRatio="xMidYMid slice"><LocationBackdrop scene={item.render?.scene} id={`th_${item.id}`} /></svg></div>;
  }
  if (cat === 'fence' && !item.image) {
    return <div style={{ width: size, height: size }} className="flex items-center justify-center text-5xl">{r.kind === 'hedge' ? '🌿' : '🚧'}</div>;
  }
  return <svg width={size} height={size} viewBox="0 0 100 100"><SlotItem item={item} box={{ x: 6, y: 6, w: 88, h: 88 }} /></svg>;
}

// Büyüteç: eşyayı büyük göster, + / − ile yakınlaştır
export function ZoomModal({ item, game, itemMap, onClose, onPick, pickLabel }) {
  const [z, setZ] = useState(1);
  const [focus, setFocus] = useState(true);
  if (!item) return null;
  const isChar = CHAR_CATS.includes(item.cat);
  const preview = item.cat === 'base' ? { base: item.id } : item.cat === 'hairColor' ? { hairColor: item.id } : { [item.cat]: item.id };
  return (
    <div className="ca-game fixed inset-0 z-[140] bg-slate-900/70 flex items-center justify-center p-3" onClick={onClose}>
      <div className="ca-pop bg-white rounded-[2rem] w-full max-w-lg p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-extrabold text-slate-800 truncate">{item.name}</div>
          <button onClick={onClose} className="w-11 h-11 rounded-full bg-slate-100 font-extrabold text-slate-500 text-xl">✖</button>
        </div>
        <div className="relative rounded-3xl overflow-auto ca-scroll bg-gradient-to-b from-pink-50 to-indigo-100" style={{ height: '58vh' }}>
          <div style={{ width: `${z * 100}%`, height: `${z * 100}%`, minWidth: '100%', minHeight: '100%' }} className="flex items-center justify-center">
            {isChar
              ? <Avatar game={game} itemMap={itemMap} preview={preview} fluid view={focus ? THUMB_VIEWS[item.cat] : undefined} />
              : item.cat === 'furniture'
                ? <svg viewBox="0 0 400 250" width="100%" height="100%"><RoomInterior roomKey="__zoom" game={{ rooms: { __zoom: { items: [{ uid: 'z', id: item.id, x: 200, y: 232, s: 1.6 }] } } }} itemMap={itemMap} /></svg>
                : <ItemThumb item={item} game={game} itemMap={itemMap} size={360} />}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <button onClick={() => setZ(v => Math.max(1, +(v - 0.5).toFixed(1)))} className="w-14 h-14 rounded-2xl bg-slate-100 text-3xl font-extrabold text-slate-600 active:scale-90">−</button>
          <div className="w-16 text-center font-extrabold text-slate-500">{Math.round(z * 100)}%</div>
          <button onClick={() => setZ(v => Math.min(4, +(v + 0.5).toFixed(1)))} className="w-14 h-14 rounded-2xl bg-slate-100 text-3xl font-extrabold text-slate-600 active:scale-90">+</button>
          {isChar && item.cat !== 'base' && (
            <button onClick={() => setFocus(f => !f)} className="h-14 px-4 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold active:scale-95">{focus ? '🧍 tüm karakter' : '🔍 yakından'}</button>
          )}
          {onPick && <button onClick={() => { onPick(item); onClose(); }} className="h-14 px-5 rounded-2xl bg-green-500 text-white font-extrabold text-lg active:scale-95">{pickLabel || 'seç'}</button>}
        </div>
      </div>
    </div>
  );
}

/**
 * items: gösterilecek eşyalar
 * currentId: şu an seçili olan
 * isOwned(item), balance, onSelect(item|null), onBuy(item) -> bool
 * badge(item): kartın altında küçük not (ör. "salonda")
 */
export function ItemPicker({ title, items, currentId, isOwned, balance, onSelect, onBuy, onClose, game, itemMap, allowEmpty = false, inline = false, onPreview, badge }) {
  const [confirm, setConfirm] = useState(null);
  const [shake, setShake] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [big, setBig] = useState(() => { try { return localStorage.getItem('ca_big_cards') !== '0'; } catch (_) { return true; } });
  const toggleBig = () => setBig(b => { try { localStorage.setItem('ca_big_cards', b ? '0' : '1'); } catch (_) {} return !b; });

  const tap = (item) => {
    if (!item) { sfx('tap'); onSelect(null); return; }
    say(item.name);
    if (isOwned(item)) { setConfirm(null); sfx('equip'); onSelect(item); return; }
    sfx('tap');
    onPreview?.(item);
    setConfirm(item);
  };
  const buy = () => {
    if (!confirm) return;
    if (balance < confirm.price) { setShake(confirm.id); setTimeout(() => setShake(null), 500); return; }
    if (onBuy(confirm)) { sfx('buy'); onSelect(confirm); setConfirm(null); }
  };

  const [onlyMine, setOnlyMine] = useState(false);
  const ownedCount = items.filter(it => isOwned(it)).length;
  const sorted = [...items].filter(it => !onlyMine || isOwned(it)).sort((a, b) => (isOwned(b) - isOwned(a)) || (a.price - b.price));
  const thumb = big ? 128 : 92;

  const grid = (
    <div>
      <div className="flex justify-between gap-2 mb-1.5">
        <div className="flex bg-white/80 rounded-xl p-0.5 shadow-sm">
          <button onClick={() => { say('hepsi'); setOnlyMine(false); }} className={`px-3 py-1.5 rounded-lg text-xs font-extrabold ${!onlyMine ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>🛍️ hepsi</button>
          <button onClick={() => { say('aldıklarım'); setOnlyMine(true); }} className={`px-3 py-1.5 rounded-lg text-xs font-extrabold ${onlyMine ? 'bg-green-500 text-white' : 'text-slate-500'}`}>🎒 aldıklarım ({ownedCount})</button>
        </div>
        <button onClick={toggleBig} className="px-3 py-1.5 rounded-xl bg-white/80 text-xs font-extrabold text-slate-500 shadow-sm active:scale-95">{big ? '🔎 küçük kartlar' : '🔍 büyük kartlar'}</button>
      </div>
      <div className={`grid gap-2 ${big ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'}`}>
        {allowEmpty && (
          <button onClick={() => tap(null)} className={`rounded-3xl border-4 p-1 flex flex-col items-center justify-center bg-white ${!currentId ? 'border-indigo-500' : 'border-slate-100'}`}>
            <div style={{ height: thumb }} className="flex items-center justify-center text-4xl text-slate-300">✖️</div>
            <div className="text-sm font-extrabold text-slate-500">boş bırak</div>
          </button>
        )}
        {sorted.map(it => {
          const owned = isOwned(it);
          const selected = currentId === it.id;
          const pending = confirm?.id === it.id;
          const note = badge?.(it);
          return (
            <div key={it.id} className="relative">
              <button onClick={() => tap(it)}
                className={`w-full relative rounded-3xl border-4 p-1.5 flex flex-col items-stretch bg-white transition-all active:scale-95 ${selected ? 'border-indigo-500 shadow-lg' : pending ? 'border-amber-400 shadow-md' : 'border-slate-100'} ${shake === it.id ? 'ca-wiggle' : ''}`}>
                {/* eşya: üstünde hiçbir etiket yok (fiyat aşağıda) */}
                <div className="relative rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: 'radial-gradient(circle at 50% 42%, #ffffff 0%, #f1f5ff 62%, #e0e7ff 100%)' }}>
                  <ItemThumb item={it} game={game} itemMap={itemMap} size={thumb} />
                </div>
                <div className={`${big ? 'text-sm' : 'text-[12px]'} mt-1 font-extrabold text-slate-700 leading-tight text-center line-clamp-2 min-h-[30px]`}>{it.name}</div>
                {note && <div className="text-[11px] font-extrabold text-indigo-500 text-center">{note}</div>}
                <div className="mt-1 h-8 flex items-center justify-between gap-1 pr-9">
                  {selected
                    ? <span className="inline-flex items-center gap-1 bg-indigo-500 text-white text-[11px] font-black rounded-full px-2 py-1">✓ seçili</span>
                    : owned
                      ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[11px] font-black rounded-full px-2 py-1 border border-green-200">🎒 senin</span>
                      : <span className="inline-flex items-center gap-0.5 bg-cyan-100 text-cyan-800 text-sm font-black rounded-full pl-0.5 pr-2 py-0.5 border-2 border-cyan-300 shadow-sm"><DiamondShape size={18} />{it.price}</span>}
                </div>
              </button>
              <button onClick={() => { sfx('tap'); setZoom(it); }} title="büyüt" className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white border-2 border-slate-200 shadow flex items-center justify-center text-base active:scale-90">🔍</button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const buyBar = confirm && (
    <div className="sticky bottom-0 mt-3 bg-amber-50 border-4 border-amber-300 rounded-3xl p-3 flex items-center gap-3 ca-pop">
      <ItemThumb item={confirm} game={game} itemMap={itemMap} size={64} />
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-slate-800 truncate text-lg">{confirm.name}</div>
        <div className={`text-sm font-bold ${balance >= confirm.price ? 'text-green-600' : 'text-red-500'}`}>
          {balance >= confirm.price ? 'almak ister misin?' : `${confirm.price - balance} elmas daha topla!`}
        </div>
      </div>
      <button onClick={() => { setConfirm(null); onPreview?.(null); }} className="px-3 py-3 rounded-xl bg-white font-extrabold text-slate-500">✖</button>
      <button onClick={buy} className={`px-4 py-3 rounded-2xl font-extrabold text-lg shadow ${balance >= confirm.price ? 'bg-green-500 text-white active:scale-95' : 'bg-slate-200 text-slate-400'}`}><span className="inline-flex items-center gap-1"><DiamondShape size={20} />{confirm.price} al</span></button>
    </div>
  );

  const zoomEl = zoom && (
    <ZoomModal item={zoom} game={game} itemMap={itemMap} onClose={() => setZoom(null)}
      onPick={(it) => tap(it)} pickLabel={isOwned(zoom) ? 'seç ✓' : `💎${zoom.price} - dene`} />
  );

  if (inline) return <div>{grid}{buyBar}{zoomEl}</div>;

  return (
    <>
    <div className="ca-game fixed inset-0 z-[120] bg-slate-900/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="ca-pop bg-slate-50 w-full max-w-2xl max-h-[86vh] rounded-t-[2rem] sm:rounded-[2rem] p-4 overflow-y-auto ca-scroll" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-extrabold text-slate-800">{title}</div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-cyan-300 text-cyan-900 font-extrabold rounded-full pl-1 pr-3 py-0.5 text-lg border-2 border-white shadow"><DiamondShape size={24} />{balance >= 999999 ? '∞' : balance}</span>
            <button onClick={onClose} className="w-11 h-11 rounded-full bg-white shadow font-extrabold text-slate-500 text-xl">✖</button>
          </div>
        </div>
        {items.length === 0 && !allowEmpty ? <div className="text-center text-slate-400 font-bold py-8">burada henüz eşya yok</div> : grid}
        {buyBar}
      </div>
    </div>
    {zoomEl}
    </>
  );
}
