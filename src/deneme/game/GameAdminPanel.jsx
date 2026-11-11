import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, updateDoc, addDoc, serverTimestamp, query, where, getDocsFromServer } from 'firebase/firestore';
import { MediaUploader, uploadMediaFile } from '../components/common/MediaUploader';
import { commitOpsInChunks } from '../utils/firestoreBatch';
import { CAR_MOD_SLOTS } from './catalog';
import { CATEGORIES, CATEGORY_BY_ID, ROOM_SLOTS, CAR_SLOTS, BUILTIN_MAPS, PARTICLES, DIFFICULTIES, STARTER_GAME, MAP_ARTS, CROSSINGS, THUMB_VIEWS } from './catalog';
import { RoomInterior } from './Scenes';
import { SAMPLE_ITEMS, SAMPLE_MAP, downloadTemplate } from './samplePack';
import { getAllItems, getItemMap, getAllMaps, saveGameConfig, mergeGameConfig, normalizeGame, applyStarter, testChannel, diamondPriceOf } from './gameConfig';
import { buildWorld, getStarBalance, getEarnedStars, getDiamondBalance, getRewardFor, getDiamondRewardFor, storedStars, storedDiamondBalance } from './progress';
import { MINI_GAMES } from './MiniGames';
import { getGeneratedWorld, GENERATED_WORLD_COUNT, PLACE_COUNT } from './worlds';
import { WorldThumb } from './WorldArt';
import { DiamondShape, StarShape } from './Celebration';
import { ItemThumb } from './ItemPicker';
import { Avatar } from './Avatar';
import { previewAd } from './ads';

// ============================================================================
// --- GRUP: YÖNETİCİ - OYUN DÜNYASI PANELİ ---
// ============================================================================
// Sekmeler: Yıldızlar | Haritalar & Adalar | Market & Eşyalar | Premium Öğrenciler | Reklam
// Ayarlar "kaydet" denince settings/game_config belgesine yazılır.
// Test atamaları (harita, zorluk, ada sırası) doğrudan test belgelerine yazılır.

const SUBTABS = [
  ['stars', '⭐ Yıldız & 💎 Elmas'],
  ['maps', '🗺️ Haritalar & Adalar'],
  ['items', '🧱 Dünya Kurucu & Market'],
  ['premium', '👑 Premium Öğrenciler'],
  ['ads', '📣 Reklam'],
];

const box = 'bg-white p-4 sm:p-5 rounded-3xl border-2 border-indigo-50 shadow-sm';
const lbl = 'text-[10px] font-black text-slate-500 uppercase';
const inp = 'w-full p-2 border-2 rounded-xl font-bold outline-none focus:border-indigo-500 text-sm bg-white';
const btn = 'px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50';

const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function GameAdminPanel({ db, appId, cfg, setCfg, tests, setTests, fetchAdminTests, childrenList, setChildrenList, fetchAdminChildren, responses, fetchAdminResponses, onStartTestMode }) {
  const [sub, setSub] = useState('stars');
  const isAna = (cfg?.appKind || mergeGameConfig(cfg).appKind) === 'ana';
  // Sınıfım: reklam ve premium yok (öğrenciler öğretmen panelinden yönetilir)
  const subtabs = isAna ? SUBTABS.filter(([id]) => id !== 'premium' && id !== 'ads') : SUBTABS;
  const [draft, setDraft] = useState(() => mergeGameConfig(cfg));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!dirty) setDraft(mergeGameConfig(cfg)); }, [cfg]); // eslint-disable-line
  useEffect(() => { fetchAdminTests?.(); }, []); // eslint-disable-line
  useEffect(() => { if (sub === 'premium') { fetchAdminChildren?.(); } }, [sub]); // cevaplar okunmaz: yıldız/elmas öğrenci kaydındaki özetten gelir // eslint-disable-line

  const upd = (fn) => { setDraft(d => { const n = fn(JSON.parse(JSON.stringify(d))); return n; }); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      await saveGameConfig(db, appId, draft);
      setCfg(mergeGameConfig(draft));
      setDirty(false);
    } catch (e) { console.error(e); alert('kaydedilemedi: ' + (e?.message || '')); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
        {subtabs.map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)} className={`flex-1 min-w-[120px] py-2 px-2 rounded-xl text-xs font-black transition-all ${sub === id ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}>{label}</button>
        ))}
      </div>

      {sub !== 'premium' && (
        <div className={`flex items-center justify-between gap-2 p-3 rounded-2xl border-2 ${dirty ? 'bg-amber-50 border-amber-300' : 'bg-green-50 border-green-200'}`}>
          <span className={`text-xs font-black ${dirty ? 'text-amber-700' : 'text-green-700'}`}>{dirty ? 'kaydedilmemiş değişiklik var' : 'oyun ayarları güncel'}</span>
          <div className="flex gap-2">
            {dirty && <button onClick={() => { setDraft(mergeGameConfig(cfg)); setDirty(false); }} className={`${btn} bg-white text-slate-500`}>geri al</button>}
            <button onClick={save} disabled={!dirty || saving} className={`${btn} bg-indigo-600 text-white`}>{saving ? 'kaydediliyor...' : 'oyun ayarlarını kaydet'}</button>
          </div>
        </div>
      )}

      {sub === 'stars' && <StarsTab draft={draft} upd={upd} />}
      {sub === 'maps' && <MapsTab draft={draft} upd={upd} db={db} appId={appId} tests={tests} setTests={setTests} />}
      {sub === 'items' && <ItemsTab draft={draft} upd={upd} />}
      {isAna && <div className="text-[11px] font-bold text-slate-400 text-center">Sınıfım oyun ayarları · öğrenci uygulamasında reklam yoktur.</div>}
      {sub === 'premium' && <PremiumTab db={db} appId={appId} childrenList={childrenList} setChildrenList={setChildrenList} tests={tests} responses={responses} cfg={draft} onStartTestMode={onStartTestMode} />}
      {sub === 'ads' && <AdsTab draft={draft} upd={upd} />}
    </div>
  );
}

// ----------------------------------------------------------------------------
// ⭐ YILDIZ KURALLARI
// ----------------------------------------------------------------------------
function StarsTab({ draft, upd }) {
  const isAna = draft.appKind === 'ana';
  const num = (v) => (v === '' ? 0 : Number(v));
  const gm = draft.games || { enabled: true, off: {} };
  return (
    <div className="space-y-4">
      <div className={box + ' border-cyan-200 bg-cyan-50/50'}>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-5 h-5" checked={gm.enabled !== false} onChange={e => upd(x => { x.games = { ...(x.games || {}), enabled: e.target.checked, off: { ...(x.games?.off || {}) } }; return x; })} />
          <span className="font-black text-cyan-800 text-sm">🎮 oyunlar sekmesi {gm.enabled !== false ? 'açık' : 'kapalı'}</span>
        </label>
        <p className="text-[11px] font-bold text-slate-500 mt-1">haritanın solunda, ödev sekmesinin altında görünür. oyunlar internetsiz çalışır, okuma harcamaz. istemediğiniz oyunun işaretini kaldırın:</p>
        {gm.enabled !== false && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {MINI_GAMES.map(g => (
              <label key={g.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-black cursor-pointer ${gm.off?.[g.id] ? 'bg-white text-slate-400' : 'bg-cyan-100 border-cyan-300 text-cyan-900'}`}>
                <input type="checkbox" checked={!gm.off?.[g.id]} onChange={e => upd(x => { const off = { ...(x.games?.off || {}) }; if (e.target.checked) delete off[g.id]; else off[g.id] = true; x.games = { enabled: true, ...(x.games || {}), off }; return x; })} />
                {g.icon} {g.name}
              </label>
            ))}
          </div>
        )}
      </div>
      {isAna ? (
        <div className={box + ' border-amber-200 bg-amber-50/50'}>
          <h4 className="font-black text-amber-700 text-sm mb-1">⭐ yıldız (Sınıfım) · sadece ödev testleri</h4>
          <p className="text-xs text-slate-600 font-bold mb-2">haritadaki testler yıldız <b>vermez</b> (elmas verir). yıldızı sadece <b>ödev</b> sayfasındaki testler verir; kaç yıldız verileceğini aşağıdan ayarlayın. çocukların daha önce kazandığı yıldızlar silinmez.</p>
          <div className="grid grid-cols-2 gap-2 max-w-sm mb-2">
            <div><div className={lbl}>ödev hepsi doğru 🌟</div><input type="number" min="0" className={inp + ' text-center'} value={draft.anaGorevStars?.perfect ?? 1} onChange={e => upd(x => { x.anaGorevStars = { ...(x.anaGorevStars || {}), perfect: num(e.target.value) }; return x; })} /></div>
            <div><div className={lbl}>ödev yanlışla bitti ⭐</div><input type="number" min="0" className={inp + ' text-center'} value={draft.anaGorevStars?.completed ?? 0} onChange={e => upd(x => { x.anaGorevStars = { ...(x.anaGorevStars || {}), completed: num(e.target.value) }; return x; })} /></div>
          </div>
        </div>
      ) : (
        <div className={box}>
          <h4 className="font-black text-indigo-600 text-sm mb-1">⭐ HARİTA testlerinden kazanılan yıldız</h4>
          <p className="text-xs text-slate-500 font-bold mb-3">"hepsi doğru": testteki bütün soruları doğru yaparsa. "bitirdi": testi sonuna kadar çözdü ama yanlışı var. çocuk bir testten en fazla bir kez kazanır; sonra sadece yanlışlarını çözüp hepsini doğru yaparsa aradaki farkı alır.</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div />
            <div className={lbl}>hepsi doğru 🌟</div>
            <div className={lbl}>bitirdi ⭐</div>
            {DIFFICULTIES.map(d => (
              <React.Fragment key={d.id}>
                <div className="flex items-center gap-2 font-black text-sm"><span className="w-3 h-3 rounded-full" style={{ background: d.color }} />{d.label} test</div>
                <input type="number" min="0" className={inp + ' text-center'} value={draft.starRewards[d.id].perfect} onChange={e => upd(x => { x.starRewards[d.id].perfect = Number(e.target.value); return x; })} />
                <input type="number" min="0" className={inp + ' text-center'} value={draft.starRewards[d.id].completed} onChange={e => upd(x => { x.starRewards[d.id].completed = Number(e.target.value); return x; })} />
              </React.Fragment>
            ))}
            <div className="flex items-center gap-2 font-black text-sm">📋 ödev testleri</div>
            <input type="number" min="0" className={inp + ' text-center'} value={draft.gorevStars?.perfect ?? 0} onChange={e => upd(x => { x.gorevStars = { ...(x.gorevStars || {}), perfect: num(e.target.value) }; return x; })} />
            <input type="number" min="0" className={inp + ' text-center'} value={draft.gorevStars?.completed ?? 0} onChange={e => upd(x => { x.gorevStars = { ...(x.gorevStars || {}), completed: num(e.target.value) }; return x; })} />
          </div>
          <p className="text-[11px] text-slate-400 font-bold mt-2">günlük ödevler yıldız değil elmas kazandırır (ödev yıldızı 0). isterseniz ödevlere de yıldız verebilirsiniz.</p>
        </div>
      )}

      <div className={box + ' border-cyan-200'}>
        <h4 className="font-black text-cyan-700 text-sm mb-1 flex items-center gap-1"><DiamondShape size={20} /> elmas (karakter, ev, araba eşyaları elmasla alınır)</h4>
        <p className="text-xs text-slate-500 font-bold mb-3">çocuk testi bitirince yıldızın yanında elmas da alır. elmaslar markette harcanır. yanlışla bitiren çocuk sadece yanlışlarını çözüp kalan elmasını da alır.</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div />
          <div className={lbl}>hepsi doğru 💎</div>
          <div className={lbl}>bitirdi 💎</div>
          {[['gorev', '📋 ödev testi'], ['harita', '🗺️ harita testi (ada)']].map(([ch, label]) => (
            <React.Fragment key={ch}>
              <div className="flex items-center gap-2 font-black text-sm">{label}</div>
              <input type="number" min="0" className={inp + ' text-center'} value={draft.diamondRewards?.[ch]?.perfect ?? 0} onChange={e => upd(x => { x.diamondRewards = { ...(x.diamondRewards || {}), [ch]: { ...(x.diamondRewards?.[ch] || {}), perfect: num(e.target.value) } }; return x; })} />
              <input type="number" min="0" className={inp + ' text-center'} value={draft.diamondRewards?.[ch]?.completed ?? 0} onChange={e => upd(x => { x.diamondRewards = { ...(x.diamondRewards || {}), [ch]: { ...(x.diamondRewards?.[ch] || {}), completed: num(e.target.value) } }; return x; })} />
            </React.Fragment>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div><div className={lbl}>bir haritanın bütün adalarını bitirince EKSTRA elmas (büyük ödül)</div><input type="number" min="0" className={inp} value={draft.mapBonusDiamonds ?? 3} onChange={e => upd(x => { x.mapBonusDiamonds = num(e.target.value); return x; })} /></div>
          <div><div className={lbl}>yeni oyuncuya hoş geldin elması</div><input type="number" min="0" className={inp} value={draft.welcomeDiamonds ?? 0} onChange={e => upd(x => { x.welcomeDiamonds = num(e.target.value); return x; })} /></div>
          <div><div className={lbl}>bir elle boyama hakkı kaç elmas? (araç, ev, oda boyama)</div><input type="number" min="0" className={inp} value={draft.paintDiamonds ?? 2} onChange={e => upd(x => { x.paintDiamonds = num(e.target.value); return x; })} /></div>
          <div><div className={lbl}>hazır eşyaların elmas fiyatı = eski yıldız fiyatı ×</div><input type="number" min="0.05" step="0.05" className={inp} value={draft.diamondPriceFactor ?? 0.5} onChange={e => upd(x => { x.diamondPriceFactor = Number(e.target.value) || 0.5; return x; })} /><div className="text-[10px] text-slate-400 font-bold mt-1">0.5 = yarı fiyat. elle fiyat verdiğiniz eşyalar bundan etkilenmez. toplu fiyat: "Dünya Kurucu & Market".</div></div>
        </div>
      </div>

      <div className={box + ' grid sm:grid-cols-2 gap-4'}>
        <div>
          <div className={lbl}>sonraki ada ne zaman açılsın?</div>
          <select className={inp} value={draft.unlockRule} onChange={e => upd(x => { x.unlockRule = e.target.value; return x; })}>
            <option value="completed">testi bitirince (yanlışı olsa da)</option>
            <option value="perfect">sadece hepsi doğruysa</option>
          </select>
        </div>
        {!isAna && <div>
          <div className={lbl}>zorluğu seçilmemiş testler</div>
          <select className={inp} value={draft.defaultDifficulty} onChange={e => upd(x => { x.defaultDifficulty = e.target.value; return x; })}>
            {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>}
        <div>
          <div className={lbl}>bir haritada kaç ada olsun? (otomatik dağıtım)</div>
          <input type="number" min="1" max="40" className={inp} value={draft.islandsPerMap} onChange={e => upd(x => { x.islandsPerMap = Number(e.target.value); return x; })} />
        </div>
        <div>
          <div className={lbl}>haritada adaların altında test adı yazsın mı?</div>
          <label className="flex items-center gap-2 font-bold text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 cursor-pointer">
            <input type="checkbox" checked={!!draft.showIslandNames} onChange={e => upd(x => { x.showIslandNames = e.target.checked; return x; })} />
            {draft.showIslandNames ? 'evet: test adı görünür' : 'hayır: sadece ada numarası (ödevlerde ad görünür)'}
          </label>
        </div>
        <div>
          <div className={lbl}>3D görünüm (karakter, ev, araba, harita)</div>
          <label className="flex items-center gap-2 font-bold text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 cursor-pointer">
            <input type="checkbox" checked={draft.look3d !== false} onChange={e => upd(x => { x.look3d = e.target.checked; return x; })} />
            {draft.look3d !== false ? 'açık: çizimler ışık-gölgeli, hacimli' : 'kapalı: düz çizim'}
          </label>
        </div>
        {!isAna && <div>
          <div className={lbl}>yeni oyuncuya hoş geldin yıldızı</div>
          <input type="number" min="0" className={inp} value={draft.welcomeStars} onChange={e => upd(x => { x.welcomeStars = Number(e.target.value); return x; })} />
        </div>}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 🗺️ HARİTALAR & ADALAR
// ----------------------------------------------------------------------------
function MapsTab({ draft, upd, db, appId, tests, setTests }) {
  const maps = getAllMaps(draft, { includeHidden: true });
  const visibleMaps = maps.filter(m => !m.hidden);
  const [form, setForm] = useState(null);
  const [edits, setEdits] = useState({});
  const [savingTests, setSavingTests] = useState(false);
  const [showUnpublished, setShowUnpublished] = useState(false);

  const merged = tests.map(t => ({ ...t, ...(edits[t.id] || {}) }));
  const world = buildWorld(merged, draft);
  const unpublished = merged.filter(t => !t.isPublished || !(t.questionIds || []).length);
  const gorevList = merged.filter(t => t.isPublished && (t.questionIds || []).length && testChannel(t, draft) === 'gorev');
  const [galPage, setGalPage] = useState(0);
  const GAL = 24;
  const editTest = (id, patch) => setEdits(e => ({ ...e, [id]: { ...(e[id] || {}), ...patch } }));

  const saveTests = async () => {
    const ids = Object.keys(edits);
    if (!ids.length) return;
    setSavingTests(true);
    try {
      const ops = ids.map(id => ({ type: 'update', ref: doc(db, 'artifacts', appId, 'public', 'data', 'tests', id), data: { ...edits[id], updatedAt: serverTimestamp() } }));
      await commitOpsInChunks(db, ops);
      setTests(prev => prev.map(t => edits[t.id] ? { ...t, ...edits[t.id] } : t));
      setEdits({});
    } catch (e) { console.error(e); alert('test ayarları kaydedilemedi.'); }
    setSavingTests(false);
  };

  const setOv = (id, patch) => upd(x => {
    const m = getAllMaps(x, { includeHidden: true }).find(mm => mm.id === id);
    if (m && !m.builtin) x.customMaps = x.customMaps.map(cm => cm.id === id ? { ...cm, ...patch } : cm);
    else x.mapOverrides[id] = { ...(x.mapOverrides[id] || {}), ...patch };
    return x;
  });

  const moveTest = (mapTests, idx, dir) => {
    const list = [...mapTests];
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    [list[idx], list[j]] = [list[j], list[idx]];
    list.forEach((t, i) => editTest(t.id, { islandOrder: i + 1 }));
  };

  const renderTestRow = ({ t, idx, list }) => {
    const reward = getRewardFor(t, draft);
    return (
      <div key={t.id} className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border ${edits[t.id] ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
        {list && <div className="flex flex-col">
          <button onClick={() => moveTest(list, idx, -1)} className="text-xs leading-none px-1 text-slate-400 hover:text-indigo-600">▲</button>
          <button onClick={() => moveTest(list, idx, 1)} className="text-xs leading-none px-1 text-slate-400 hover:text-indigo-600">▼</button>
        </div>}
        <span className="w-7 h-7 rounded-full bg-white border flex items-center justify-center text-xs font-black text-slate-500">{list ? idx + 1 : '–'}</span>
        <span className="flex-1 min-w-[140px] text-sm font-black text-slate-700 truncate">{t.name} <span className="text-[10px] text-slate-400">({(t.questionIds || []).length} soru)</span></span>
        <select className="p-1.5 border rounded-lg text-xs font-bold bg-white" value={t.mapId || ''} onChange={e => editTest(t.id, { mapId: e.target.value || null })}>
          <option value="">otomatik harita</option>
          {visibleMaps.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
        </select>
        <select className="p-1.5 border rounded-lg text-xs font-bold bg-white" value={t.difficulty || ''} onChange={e => editTest(t.id, { difficulty: e.target.value || null })}>
          <option value="">zorluk: varsayılan</option>
          {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <select className={`p-1.5 border rounded-lg text-xs font-black ${testChannel(t, draft) === 'gorev' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`} value={testChannel(t, draft)} onChange={e => editTest(t.id, { channel: e.target.value })} title="bu test haritada mı, ödevlerde mi?">
          <option value="harita">🗺️ harita</option>
          <option value="gorev">📋 ödev</option>
        </select>
        <span className="text-[10px] font-black text-amber-600 whitespace-nowrap" title="hepsi doğru / bitirdi">🌟{reward.perfect} / ⭐{reward.completed} · 💎{getDiamondRewardFor(t, draft).perfect}</span>
        <input type="number" min="0" placeholder="özel 🌟" title="bu test için özel yıldız (hepsi doğru) - boş bırakılırsa zorluk ayarı geçerli" className="w-16 p-1.5 border rounded-lg text-xs font-bold" value={t.starPerfect ?? ''} onChange={e => editTest(t.id, { starPerfect: e.target.value === '' ? null : Number(e.target.value) })} />
        <input type="number" min="0" placeholder="özel ⭐" title="bu test için özel yıldız (bitirdi)" className="w-16 p-1.5 border rounded-lg text-xs font-bold" value={t.starCompleted ?? ''} onChange={e => editTest(t.id, { starCompleted: e.target.value === '' ? null : Number(e.target.value) })} />
      </div>
    );
  };

  const saveForm = () => {
    if (!form?.name?.trim()) return alert('harita adı yazın.');
    upd(x => {
      const data = { ...form, name: form.name.trim() };
      if (form.id && x.customMaps.some(m => m.id === form.id)) x.customMaps = x.customMaps.map(m => m.id === form.id ? data : m);
      else x.customMaps.push({ ...data, id: uid('map'), order: 100 + x.customMaps.length });
      return x;
    });
    setForm(null);
  };

  return (
    <div className="space-y-4">
      <div className={box + ' border-emerald-200'}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h4 className="font-black text-emerald-700 text-sm">🌍 {GENERATED_WORLD_COUNT} otomatik dünya · {PLACE_COUNT} farklı mekân</h4>
          <div className="flex items-center gap-1">
            <button onClick={() => setGalPage(p => Math.max(0, p - 1))} className={`${btn} bg-slate-100 text-slate-600`}>‹</button>
            <span className="text-xs font-black text-slate-500 w-24 text-center">{galPage * GAL + 1}-{Math.min(GENERATED_WORLD_COUNT, (galPage + 1) * GAL)}</span>
            <button onClick={() => setGalPage(p => Math.min(Math.ceil(GENERATED_WORLD_COUNT / GAL) - 1, p + 1))} className={`${btn} bg-slate-100 text-slate-600`}>›</button>
          </div>
        </div>
        <p className="text-[11px] font-bold text-slate-500 mb-3">yukarıdaki hazır haritalar ve sizin haritalarınız dolunca sıradaki testler otomatik olarak yeni dünyalara yerleşir. ilk {PLACE_COUNT} dünyanın her biri ayrı bir mekândır; sonra aynı mekânlar gece, kış, bahar, gün batımı, sonbahar, festival, büyülü gibi başka konseptlerle (farklı renk, hava ve süslerle) gelir.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {Array.from({ length: GAL }).map((_, k) => {
            const i = galPage * GAL + k;
            if (i >= GENERATED_WORLD_COUNT) return null;
            const w = getGeneratedWorld(i);
            return (
              <div key={i} className="rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                <WorldThumb wt={w.wt} w={150} h={96} seed={i + 3} />
                <div className="px-1.5 py-1 text-[10px] font-black text-slate-600 leading-tight truncate" title={w.name}>{i + 1}. {w.emoji} {w.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={box}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-black text-indigo-600 text-sm">haritalar (sıra küçükten büyüğe)</h4>
          <button onClick={() => setForm({ name: '', emoji: '🏝️', theme: 'map_forest', art: 'forest', crossing: 'chop', bgImage: '', islandImage: '', decor: '', particle: '' })} className={`${btn} bg-indigo-600 text-white`}>+ yeni harita ekle</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {maps.map(m => (
            <div key={m.id} className={`flex items-center gap-2 p-2 rounded-2xl border-2 ${m.hidden ? 'opacity-50 border-dashed' : 'border-slate-100'}`}>
              <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-2xl" style={m.bgImage ? { backgroundImage: `url(${m.bgImage})`, backgroundSize: 'cover' } : { background: `linear-gradient(180deg, ${(m.sky || ['#bae6fd', '#7dd3fc', '#38bdf8']).join(', ')})` }}>{m.emoji}</div>
              <div className="flex-1 min-w-0">
                <input className="w-full font-black text-sm text-slate-700 bg-transparent outline-none border-b border-transparent focus:border-indigo-300" value={m.name} onChange={e => setOv(m.id, { name: e.target.value })} />
                <div className="text-[10px] font-bold text-slate-400">{m.builtin ? 'hazır harita' : 'sizin haritanız'} · {(MAP_ARTS.find(a => a.id === m.art) || {}).label || ''} · {(CROSSINGS.find(c => c.id === m.crossing) || {}).label || ''}</div>
              </div>
              <input type="number" title="sıra" className="w-12 p-1 border rounded-lg text-xs font-bold text-center" value={m.order ?? 0} onChange={e => setOv(m.id, { order: Number(e.target.value) })} />
              <button onClick={() => setOv(m.id, { hidden: !m.hidden })} className={`${btn} ${m.hidden ? 'bg-slate-200 text-slate-500' : 'bg-green-100 text-green-700'}`}>{m.hidden ? 'gizli' : 'açık'}</button>
              {!m.builtin && <button onClick={() => setForm({ ...m })} className={`${btn} bg-blue-50 text-blue-600`}>düzenle</button>}
              {!m.builtin && <button onClick={() => window.confirm('harita silinsin mi? (bu haritadaki testler otomatik dağıtıma döner)') && upd(x => { x.customMaps = x.customMaps.filter(c => c.id !== m.id); return x; })} className={`${btn} bg-red-50 text-red-500`}>sil</button>}
            </div>
          ))}
        </div>
        {form && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-100 grid sm:grid-cols-2 gap-3">
            <div><div className={lbl}>harita adı</div><input className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ör. Dev Mantarlar Vadisi" /></div>
            <div><div className={lbl}>simge (emoji)</div><input className={inp} value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} /></div>
            <div><div className={lbl}>renk teması (ada ve gökyüzü renkleri)</div>
              <select className={inp} value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })}>{BUILTIN_MAPS.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}</select>
            </div>
            <div><div className={lbl}>arazi çizimi</div>
              <select className={inp} value={form.art || ''} onChange={e => setForm({ ...form, art: e.target.value })}><option value="">temanınki</option>{MAP_ARTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</select>
            </div>
            <div><div className={lbl}>adalar arası geçiş</div>
              <select className={inp} value={form.crossing || ''} onChange={e => setForm({ ...form, crossing: e.target.value })}><option value="">araziye göre</option>{CROSSINGS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
            </div>
            <div><div className={lbl}>havada hafif efekt</div>
              <select className={inp} value={form.particle || ''} onChange={e => setForm({ ...form, particle: e.target.value })}><option value="">temanınki</option>{PARTICLES.map(p => <option key={p} value={p}>{p}</option>)}</select>
            </div>
            <MediaUploader label="arka plan resmi (isteğe bağlı - çizili arazinin yerine geçer, uzun dikey resim önerilir)" value={form.bgImage || ''} onChange={v => setForm({ ...form, bgImage: v })} id="gm-bg" />
            <MediaUploader label="ada resmi (isteğe bağlı, şeffaf png - her ada bu resimle çizilir)" value={form.islandImage || ''} onChange={v => setForm({ ...form, islandImage: v })} id="gm-isl" />
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button onClick={() => setForm(null)} className={`${btn} bg-white text-slate-500`}>vazgeç</button>
              <button onClick={saveForm} className={`${btn} bg-indigo-600 text-white`}>haritayı listeye ekle</button>
            </div>
          </div>
        )}
      </div>

      <div className={box}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h4 className="font-black text-indigo-600 text-sm">adalar (yayındaki testler)</h4>
            <p className="text-[11px] font-bold text-slate-500">haritası "otomatik" olan testler sırayla boş haritalara dolar. ▲▼ ile ada sırasını değiştirin.</p>
          </div>
          <button onClick={saveTests} disabled={!Object.keys(edits).length || savingTests} className={`${btn} bg-green-600 text-white`}>{savingTests ? 'kaydediliyor...' : `test ayarlarını kaydet (${Object.keys(edits).length})`}</button>
        </div>
        <div className="space-y-4">
          {world.map(m => (
            <div key={m.id}>
              <div className="font-black text-slate-700 text-sm mb-1.5">{m.emoji} {m.name} <span className="text-[10px] text-slate-400">({m.tests.length} ada{m.auto ? ' · otomatik açılan harita' : ''})</span></div>
              <div className="space-y-1.5">{m.tests.map((t, i) => renderTestRow({ t, idx: i, list: m.tests }))}</div>
            </div>
          ))}
          {world.length === 0 && <div className="text-center text-slate-400 font-bold text-sm py-6">yayında soru içeren test yok.</div>}
        </div>
        {gorevList.length > 0 && (
          <div className="mt-4">
            <div className="font-black text-pink-700 text-sm mb-1.5">📋 ödev testleri <span className="text-[10px] text-slate-400">({gorevList.length} · haritada görünmez, çocukta sol taraftaki "ödev" sekmesinde)</span></div>
            <div className="space-y-1.5">{gorevList.map(t => renderTestRow({ t }))}</div>
          </div>
        )}
        <button onClick={() => setShowUnpublished(s => !s)} className="mt-4 text-xs font-black text-slate-400 hover:text-indigo-600">{showUnpublished ? '▼' : '▶'} yayında olmayan testler ({unpublished.length})</button>
        {showUnpublished && <div className="space-y-1.5 mt-2 opacity-70">{unpublished.map(t => renderTestRow({ t }))}</div>}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 🧱 DÜNYA KURUCU & MARKET
// ----------------------------------------------------------------------------
// * Her şey resimle eklenebilir: karakter, saç, kıyafet, şapka, aksesuar, ev, oda eşyası,
//   bahçe, evcil hayvan, araba, araba süsü, duvar kağıdı, zemin.
// * "Toplu yükle": bir kategoriye birden çok resmi tek seferde ekler (dosya adı = eşya adı).
// * "Karakter şablonu": 200x260 tuval. Kıyafet/saç/şapkayı bu tuvale çizip şeffaf PNG kaydedin;
//   "yerleşim: şablon" seçince her parça her karaktere tam oturur.
// * "Hazırları gizle": o kategoride sadece sizin eşyalarınız görünür (sıfırdan dünya).
// * "Örnek dünya": nasıl yapıldığını görmeniz için hazır bir örnek paket ekler.

const EMPTY_ITEM = { cat: 'top', name: '', price: 5, image: '', emoji: '', color: '#ef4444', slot: '', roomNames: '', fit: 'template', adjust: { x: 0, y: 0, s: 1 } };
const CHAR_CATS = ['base', 'hair', 'top', 'bottom', 'shoes', 'hat', 'accessory'];
const COLOR_CATS = ['hairColor', 'wallPaint', 'roofPaint', 'carPaint', 'wallpaper', 'floor'];
const fileBaseName = (n) => String(n || '').replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').trim().slice(0, 40) || 'yeni eşya';

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label className="block text-[10px] font-black text-slate-500">
      <div className="flex justify-between"><span>{label}</span><span className="text-indigo-600">{Number(value).toFixed(step < 1 ? 2 : 0)}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-indigo-600" />
    </label>
  );
}

function ItemsTab({ draft, upd }) {
  const [cat, setCat] = useState('top');
  const [form, setForm] = useState(null);
  const [bulk, setBulk] = useState(null); // { cat, price, slot, fit, files, progress }
  const [dragStart, setDragStart] = useState(null);
  const [pvBase, setPvBase] = useState('');   // önizlemede hangi karakter
  const [pvHair, setPvHair] = useState('');   // karakter eklerken hangi saçla
  const [fitScope, setFitScope] = useState('all'); // ince ayar: 'all' | 'base'
  const all = getAllItems(draft, { includeHidden: true });
  const itemMap = useMemo(() => getItemMap(draft), [draft]);
  const game = useMemo(() => applyStarter(normalizeGame(STARTER_GAME), draft), [draft]);
  const list = all.filter(i => i.cat === cat);
  const catInfo = CATEGORY_BY_ID[cat];

  // fiyatlar ELMAS (dprice). eski yıldız fiyatı (price) dokunulmadan kalır.
  const setPrice = (it, price) => upd(x => {
    const v = price === '' ? null : Math.max(0, Math.round(Number(price) || 0));
    if (it.builtin) x.itemOverrides[it.id] = { ...(x.itemOverrides[it.id] || {}), dprice: v };
    else x.customItems = x.customItems.map(c => c.id === it.id ? { ...c, dprice: v } : c);
    return x;
  });
  // --- TOPLU ELMAS FİYATI ---
  const [bp, setBp] = useState({ scope: 'cat', mode: 'same', value: 2, pct: 50, min: 1, max: 30, free: false });
  const applyBulkPrice = () => {
    const scopeItems = (bp.scope === 'all' ? all : list).filter(it => bp.free || (Number(it.starPrice) || 0) > 0 || (Number(it.price) || 0) > 0);
    if (!scopeItems.length) return alert('değiştirilecek eşya yok.');
    let calc;
    if (bp.mode === 'same') calc = () => Math.max(0, Math.round(Number(bp.value) || 0));
    else if (bp.mode === 'pct') calc = (it) => Math.max(1, Math.round((Number(it.price) || 0) * (Number(bp.pct) || 100) / 100));
    else if (bp.mode === 'range') {
      const sorted = [...scopeItems].sort((a, b) => (Number(a.starPrice) || 0) - (Number(b.starPrice) || 0));
      const rank = new Map(sorted.map((it, i) => [it.id, sorted.length > 1 ? i / (sorted.length - 1) : 0]));
      const lo = Math.max(0, Number(bp.min) || 0), hi = Math.max(lo, Number(bp.max) || lo);
      calc = (it) => Math.round(lo + (hi - lo) * rank.get(it.id));
    } else calc = () => null; // 'reset': elle verilen fiyatları kaldır (oran geçerli olur)
    const label = bp.mode === 'reset' ? 'elle verilen elmas fiyatları kaldırılsın (hazır oran geçerli olsun)' : 'yeni elmas fiyatı verilsin';
    if (!window.confirm(`${scopeItems.length} eşyaya ${label} mi?`)) return;
    upd(x => {
      scopeItems.forEach(it => {
        const v = calc(it);
        if (it.builtin) x.itemOverrides[it.id] = { ...(x.itemOverrides[it.id] || {}), dprice: v };
        else x.customItems = x.customItems.map(c => c.id === it.id ? { ...c, dprice: v } : c);
      });
      return x;
    });
  };
  const toggleHide = (it) => upd(x => {
    if (it.builtin) x.itemOverrides[it.id] = { ...(x.itemOverrides[it.id] || {}), hidden: !it.hidden };
    else x.customItems = x.customItems.map(c => c.id === it.id ? { ...c, hidden: !it.hidden } : c);
    return x;
  });
  const hideAllBuiltin = (c, on) => upd(x => {
    x.builtinHidden = { ...(x.builtinHidden || {}), [c]: on };
    // tek tek gizleme ayarları toplu ayarı ezmesin
    Object.keys(x.itemOverrides || {}).forEach(id => { if (itemMap.get(id)?.cat === c && x.itemOverrides[id]) delete x.itemOverrides[id].hidden; });
    return x;
  });

  const isColorCat = COLOR_CATS.includes(form?.cat);
  const isCharCat = CHAR_CATS.includes(form?.cat);
  const slotOptions = form?.cat === 'furniture' ? ROOM_SLOTS : form?.cat === 'carDecor' ? CAR_SLOTS : form?.cat === 'carMod' ? CAR_MOD_SLOTS : null;

  const toItem = (f) => ({
    id: f.id || uid('it'), cat: f.cat, name: String(f.name || '').trim(), price: Number(f.price) || 0, dprice: Number(f.price) || 0,
    image: f.image || '', slot: f.slot || '', roomNames: f.roomNames || '',
    render: { color: f.color || '', emoji: f.emoji || '', ...(f.cat === 'car' ? { vtype: f.vtype || 'car' } : {}), ...(f.cat === 'location' ? { scene: f.scene || 'meadow', water: ['island', 'beach', 'lake', 'river', 'cliff'].includes(f.scene) } : {}) },
    adjust: { x: Number(f.adjust?.x) || 0, y: Number(f.adjust?.y) || 0, s: Number(f.adjust?.s) || 1 },
    hidden: !!f.hidden,
    ...(CHAR_CATS.includes(f.cat) ? { fit: f.fit || 'template' } : {}),
    ...(f.cat === 'base' ? { clothFit: f.clothFit || {}, headFit: f.headFit || {}, hidesClothes: !!f.hidesClothes, showHair: f.showHair !== false } : {}),
    ...(f.cat === 'hat' ? { hideHair: f.hideHair || 'none' } : {}),
    ...(f.cat === 'top' ? { coversBottom: !!f.coversBottom } : {}),
    ...(CHAR_CATS.includes(f.cat) && f.cat !== 'base' ? { fitByBase: f.fitByBase || {}, forBases: Array.isArray(f.forBases) ? f.forBases : [] } : {}),
    ...(f.cat === 'furniture' ? { size: { w: Number(f.size?.w) || 64, h: Number(f.size?.h) || 64 }, flat: !!f.flat } : {}),
  });
  // karakter düzenlenirken önizleme kendi id'siyle (saçların o karaktere özel ayarı görünsün)
  const pid = form?.cat === 'base' && form?.id ? form.id : '__preview';
  const formItem = form ? { ...toItem(form), id: pid, builtin: false } : null;
  const baseList = all.filter(i => i.cat === 'base');
  const adjKey = form && form.cat !== 'base' && fitScope === 'base' && pvBase ? pvBase : null;
  const curAdj = form ? (adjKey ? (form.fitByBase?.[adjKey] || form.adjust || {}) : (form.adjust || {})) : {};
  const setAdj = (patch) => setForm(f => adjKey
    ? { ...f, fitByBase: { ...(f.fitByBase || {}), [adjKey]: { x: 0, y: 0, s: 1, ...(f.fitByBase?.[adjKey] || f.adjust || {}), ...patch } } }
    : { ...f, adjust: { ...(f.adjust || {}), ...patch } });
  const pvPreview = form?.cat === 'base' ? { base: pid, ...(pvHair ? { hair: pvHair } : {}) } : form ? { [form.cat]: '__preview', ...(pvBase ? { base: pvBase } : {}) } : {};
  const previewMap = useMemo(() => { const m = new Map(itemMap); if (formItem) m.set(formItem.id, formItem); return m; }, [itemMap, form]); // eslint-disable-line

  const saveForm = () => {
    if (!form.name.trim()) return alert('eşya adı yazın.');
    if (!isColorCat && !form.image && !form.emoji) return alert('bir resim yükleyin ya da emoji yazın.');
    if ((form.cat === 'carDecor' || form.cat === 'carMod') && !form.slot) return alert('konacağı yeri seçin.');
    const data = toItem(form);
    upd(x => {
      if (form.id && x.customItems.some(c => c.id === form.id)) x.customItems = x.customItems.map(c => c.id === form.id ? data : c);
      else x.customItems.push(data);
      return x;
    });
    setCat(form.cat);
    setForm(null);
  };

  const editItem = (it) => setForm({ ...EMPTY_ITEM, ...it, emoji: it.render?.emoji || '', color: it.render?.color || '#ef4444', fit: it.fit || 'box', vtype: it.render?.vtype || 'car', scene: it.render?.scene || 'meadow' });

  // --- toplu yükleme ---
  const runBulk = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setBulk(b => ({ ...b, progress: `0/${arr.length}` }));
    const created = [];
    for (let i = 0; i < arr.length; i++) {
      try {
        const url = await uploadMediaFile(arr[i], 'image');
        created.push(toItem({ ...EMPTY_ITEM, cat: bulk.cat, name: fileBaseName(arr[i].name), price: bulk.price, image: url, slot: bulk.slot, fit: bulk.fit, size: { w: 70, h: 70 } }));
      } catch (e) { console.error(e); }
      setBulk(b => ({ ...b, progress: `${i + 1}/${arr.length}` }));
    }
    upd(x => { x.customItems.push(...created); return x; });
    setCat(bulk.cat);
    setBulk(null);
    alert(`${created.length} eşya eklendi. fiyatları ve isimleri aşağıdan düzenleyip "oyun ayarlarını kaydet" deyin.`);
  };

  const addSample = () => {
    if (!window.confirm('örnek dünya eklensin mi? (tilki karakter, korsan kıyafetleri, ağaç ev, korsan gemisi, hamak, sandık, papağan, "Korsan Koyu" haritası)')) return;
    upd(x => {
      const ids = new Set(SAMPLE_ITEMS.map(i => i.id));
      x.customItems = [...x.customItems.filter(c => !ids.has(c.id)), ...SAMPLE_ITEMS];
      if (!x.customMaps.some(m => m.id === SAMPLE_MAP.id)) x.customMaps.push(SAMPLE_MAP);
      return x;
    });
    setCat('top');
  };
  const removeSample = () => upd(x => { x.customItems = x.customItems.filter(c => !c.sample); x.customMaps = x.customMaps.filter(m => m.id !== SAMPLE_MAP.id); return x; });

  // önizlemede sürükleyerek konum ayarı
  const onPrevDown = (e) => { if (!isCharCat || !form?.image) return; e.currentTarget.setPointerCapture?.(e.pointerId); setDragStart({ x: e.clientX, y: e.clientY, ax: Number(curAdj.x) || 0, ay: Number(curAdj.y) || 0, w: e.currentTarget.clientWidth }); };
  const onPrevMove = (e) => {
    if (!dragStart) return;
    const k = 220 / Math.max(80, dragStart.w);
    setAdj({ x: Math.round(dragStart.ax + (e.clientX - dragStart.x) * k), y: Math.round(dragStart.ay + (e.clientY - dragStart.y) * k) });
  };

  const starterCats = ['base', 'hair', 'top', 'bottom', 'shoes', 'house'];
  const hasSample = draft.customItems.some(c => c.sample);

  return (
    <div className="space-y-4">
      <div className={box}>
        <h4 className="font-black text-indigo-600 text-sm mb-1">🧱 dünya kurucu</h4>
        <p className="text-[11px] font-bold text-slate-500 mb-3">her şeyi kendi resimlerinizle ekleyebilirsiniz: karakter, saç, kıyafet, ev, oda eşyası, araba... "hazırları gizle" ile sadece sizin dünyanız görünür.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button onClick={() => setForm({ ...EMPTY_ITEM, cat, fit: CHAR_CATS.includes(cat) ? 'template' : 'box' })} className="p-3 rounded-2xl bg-indigo-600 text-white font-black text-xs active:scale-95">➕ resimli yeni eşya</button>
          <button onClick={() => setBulk({ cat, price: 2, slot: cat === 'furniture' ? '' : '', fit: 'template' })} className="p-3 rounded-2xl bg-sky-500 text-white font-black text-xs active:scale-95">📦 toplu resim yükle</button>
          <button onClick={() => downloadTemplate('png')} className="p-3 rounded-2xl bg-emerald-500 text-white font-black text-xs active:scale-95">📐 karakter şablonu (png)</button>
          {hasSample
            ? <button onClick={removeSample} className="p-3 rounded-2xl bg-rose-100 text-rose-600 font-black text-xs active:scale-95">🗑 örnek dünyayı kaldır</button>
            : <button onClick={addSample} className="p-3 rounded-2xl bg-amber-400 text-amber-950 font-black text-xs active:scale-95">🎁 örnek dünya ekle</button>}
        </div>
        <details className="mt-3 bg-slate-50 rounded-2xl p-3 text-[11px] font-bold text-slate-600">
          <summary className="cursor-pointer font-black text-slate-700">❓ kendi karakterimi ve kıyafetlerimi nasıl eklerim? (saç-kıyafet uyumu)</summary>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li><b>şablonu indirin</b> (📐). 200×260 oranında bir tuval; üstünde gri bir çocuk silüeti ve her parçanın kutusu var.</li>
            <li><b>karakter</b> (gövde + kafa, kıyafetsiz) çizin, şeffaf PNG kaydedin, kategori "Karakter", yerleşim "şablon" seçin. silüete ne kadar yakın çizerseniz hazır kıyafetler o kadar iyi oturur; oturmazsa "kıyafetleri karaktere uydur" kaydırıcılarıyla ayarlayın. <b>kıyafetler otomatik olarak yeni karaktere giydirilir.</b></li>
            <li><b>kıyafet, saç, şapka</b>: aynı şablonda SADECE o parçayı çizin (gerisi şeffaf). saç ayrı bir katmandır: hangi kıyafet giyilirse giyilsin üste gelir, yani her kıyafet için ayrı saç çizmeniz <u>gerekmez</u>.</li>
            <li>şapka saçı kapatıyorsa şapkada "saçı kısalt" ya da "saçı gizle" seçin.</li>
            <li>kıyafetleri karakterin üstüne çizilmiş hazır görseller kullanacaksanız (her kıyafet için ayrı tam karakter): kategori "Karakter", "kıyafet katmanlarını gizle" işaretli. saç yine ayrı katman olarak eklenebilir.</li>
          </ol>
        </details>
      </div>

      <div className={box}>
        {['character', 'house', 'car'].map(g => (
          <div key={g} className="flex flex-wrap gap-1 mb-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase w-16 pt-1.5">{g === 'character' ? 'karakter' : g === 'house' ? 'ev' : 'araba'}</span>
            {CATEGORIES.filter(c => c.group === g).map(c => (
              <button key={c.id} onClick={() => setCat(c.id)} className={`px-2 py-1 rounded-lg text-[11px] font-black border ${cat === c.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>{c.icon} {c.label}{draft.builtinHidden?.[c.id] ? ' ·sizin' : ''}</button>
            ))}
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 p-2 rounded-xl bg-slate-50">
          <span className="font-black text-sm text-slate-700">{catInfo?.icon} {catInfo?.label} <span className="text-[10px] text-slate-400">({list.length})</span></span>
          <label className="flex items-center gap-2 text-[11px] font-black text-slate-600"><input type="checkbox" checked={!!draft.builtinHidden?.[cat]} onChange={e => hideAllBuiltin(cat, e.target.checked)} /> bu kategoride hazır eşyaları gizle (sadece benimkiler)</label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
          {list.map(it => (
            <div key={it.id} className={`rounded-2xl border-2 p-2 flex flex-col items-center ${it.hidden ? 'opacity-40 border-dashed' : 'border-slate-100'}`}>
              <ItemThumb item={it} game={game} itemMap={itemMap} size={96} />
              <div className="text-[11px] font-black text-slate-700 text-center leading-tight min-h-[28px]">{it.name}{it.slot ? <span className="block text-[9px] text-slate-400">{(ROOM_SLOTS[it.slot] || CAR_SLOTS[it.slot])?.label}</span> : null}{!it.builtin && <span className="block text-[9px] text-indigo-400">{it.sample ? 'örnek' : 'sizin'}</span>}</div>
              <div className="flex items-center gap-1 mt-1" title={`eski yıldız fiyatı: ${it.starPrice ?? '-'}`}>
                <DiamondShape size={16} />
                <input type="number" min="0" className={`w-14 p-1 border rounded-lg text-xs font-black text-center ${it.dprice !== undefined && it.dprice !== null && it.dprice !== '' ? 'border-cyan-400 bg-cyan-50' : ''}`} value={it.price} onChange={e => setPrice(it, e.target.value)} />
              </div>
              <div className="flex gap-1 mt-1.5 flex-wrap justify-center">
                <button onClick={() => toggleHide(it)} className={`${btn} !px-2 !py-1 ${it.hidden ? 'bg-slate-200 text-slate-500' : 'bg-green-100 text-green-700'}`}>{it.hidden ? 'gizli' : 'satışta'}</button>
                {!it.builtin && <button onClick={() => editItem(it)} className={`${btn} !px-2 !py-1 bg-blue-50 text-blue-600`}>düzenle</button>}
                {!it.builtin && <button onClick={() => window.confirm(`"${it.name}" silinsin mi?`) && upd(x => { x.customItems = x.customItems.filter(c => c.id !== it.id); return x; })} className={`${btn} !px-2 !py-1 bg-red-50 text-red-500`}>sil</button>}
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="col-span-full text-center text-slate-400 font-bold text-sm py-6">bu kategoride eşya yok · ➕ ile ekleyin</div>}
        </div>
        <p className="text-[11px] font-bold text-slate-400 mt-3">fiyatlar ELMAS'tır. fiyatı 0 olan eşyalar herkese ücretsizdir. mavi çerçeveli fiyatı siz verdiniz; diğerleri eski yıldız fiyatı × oran. gizlenen eşya markette görünmez; daha önce alan çocuklarda kalır.</p>
      </div>

      <div className={box + ' border-cyan-200'}>
        <h4 className="font-black text-cyan-700 text-sm mb-1 flex items-center gap-1"><DiamondShape size={18} /> toplu elmas fiyatı</h4>
        <p className="text-[11px] font-bold text-slate-500 mb-3">bir kategorideki ya da bütün eşyaların fiyatını tek seferde değiştirin. sonra "oyun ayarlarını kaydet".</p>
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div><div className={lbl}>hangi eşyalar</div>
            <select className={inp} value={bp.scope} onChange={e => setBp({ ...bp, scope: e.target.value })}>
              <option value="cat">bu kategori ({catInfo?.label})</option>
              <option value="all">bütün eşyalar</option>
            </select>
          </div>
          <div><div className={lbl}>nasıl</div>
            <select className={inp} value={bp.mode} onChange={e => setBp({ ...bp, mode: e.target.value })}>
              <option value="same">hepsine aynı fiyat</option>
              <option value="pct">şimdiki fiyatın yüzdesi</option>
              <option value="range">ucuzdan pahalıya aralığa yay</option>
              <option value="reset">elle verilenleri sil (oran geçerli)</option>
            </select>
          </div>
          {bp.mode === 'same' && <div><div className={lbl}>elmas</div><input type="number" min="0" className={inp} value={bp.value} onChange={e => setBp({ ...bp, value: e.target.value })} /></div>}
          {bp.mode === 'pct' && <div><div className={lbl}>yüzde (50 = yarıya indir)</div><input type="number" min="1" className={inp} value={bp.pct} onChange={e => setBp({ ...bp, pct: e.target.value })} /></div>}
          {bp.mode === 'range' && <div className="grid grid-cols-2 gap-2"><div><div className={lbl}>en ucuz</div><input type="number" min="0" className={inp} value={bp.min} onChange={e => setBp({ ...bp, min: e.target.value })} /></div><div><div className={lbl}>en pahalı</div><input type="number" min="0" className={inp} value={bp.max} onChange={e => setBp({ ...bp, max: e.target.value })} /></div></div>}
          {bp.mode === 'reset' && <div className="text-[11px] font-bold text-slate-500">oran: eski yıldız fiyatı × {draft.diamondPriceFactor ?? 0.5}</div>}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-500"><input type="checkbox" checked={bp.free} onChange={e => setBp({ ...bp, free: e.target.checked })} /> ücretsizleri de değiştir</label>
            <button onClick={applyBulkPrice} className={`${btn} bg-cyan-600 text-white`}>uygula</button>
          </div>
        </div>
      </div>

      <div className={box}>
        <h4 className="font-black text-indigo-600 text-sm mb-1">yeni oyuncunun başlangıcı</h4>
        <p className="text-[11px] font-bold text-slate-500 mb-3">kendi dünyanızı kurduysanız yeni oyuncular sizin karakterinizle / evinizle başlasın. boş bırakılırsa hazır başlangıç (eski kıyafetler, kulübe) kullanılır.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {starterCats.map(c => (
            <div key={c}><div className={lbl}>{CATEGORY_BY_ID[c]?.label}</div>
              <select className={inp} value={draft.starter?.[c] || ''} onChange={e => upd(x => { x.starter = { ...(x.starter || {}), [c]: e.target.value }; return x; })}>
                <option value="">hazır başlangıç</option>
                {all.filter(i => i.cat === c).map(i => <option key={i.id} value={i.id}>{i.name}{i.builtin ? '' : ' (sizin)'}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {bulk && (
        <div className={box + ' border-sky-200'}>
          <h4 className="font-black text-sky-600 text-sm mb-2">📦 toplu resim yükle</h4>
          <div className="grid sm:grid-cols-4 gap-3 items-end">
            <div><div className={lbl}>kategori</div><select className={inp} value={bulk.cat} onChange={e => setBulk({ ...bulk, cat: e.target.value })}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
            <div><div className={lbl}>elmas fiyatı (hepsi)</div><input type="number" min="0" className={inp} value={bulk.price} onChange={e => setBulk({ ...bulk, price: e.target.value })} /></div>
            {(bulk.cat === 'furniture' || bulk.cat === 'carDecor') && <div><div className={lbl}>ilk konacağı yer</div><select className={inp} value={bulk.slot} onChange={e => setBulk({ ...bulk, slot: e.target.value })}><option value="">{bulk.cat === 'furniture' ? 'odanın ortası' : 'seçin'}</option>{Object.entries(bulk.cat === 'furniture' ? ROOM_SLOTS : CAR_SLOTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>}
            {CHAR_CATS.includes(bulk.cat) && <div><div className={lbl}>yerleşim</div><select className={inp} value={bulk.fit} onChange={e => setBulk({ ...bulk, fit: e.target.value })}><option value="template">şablon (200×260 tuval)</option><option value="box">parçanın kutusuna sığdır</option></select></div>}
          </div>
          <label className={`mt-3 flex items-center justify-center gap-2 p-5 rounded-2xl border-4 border-dashed font-black text-sm cursor-pointer ${bulk.progress ? 'border-slate-200 text-slate-400' : 'border-sky-300 text-sky-600 hover:bg-sky-50'}`}>
            {bulk.progress ? `yükleniyor... ${bulk.progress}` : 'resimleri seçin (birden fazla seçebilirsiniz)'}
            <input type="file" accept="image/*" multiple hidden disabled={!!bulk.progress} onChange={e => runBulk(e.target.files)} />
          </label>
          <div className="flex justify-end mt-2"><button onClick={() => setBulk(null)} disabled={!!bulk.progress} className={`${btn} bg-white border text-slate-500`}>kapat</button></div>
        </div>
      )}

      {form && (
        <div className={box + ' border-indigo-200'}>
          <h4 className="font-black text-indigo-600 text-sm mb-3">{form.id ? 'eşyayı düzenle' : 'yeni eşya'}</h4>
          <div className="grid md:grid-cols-[1fr_280px] gap-4">
            <div className="grid sm:grid-cols-2 gap-3 content-start">
              <div><div className={lbl}>kategori</div>
                <select className={inp} value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value, slot: '' })}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div><div className={lbl}>adı</div><input className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><div className={lbl}>fiyat (elmas)</div><input type="number" min="0" className={inp} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              {slotOptions && (
                <div><div className={lbl}>{form.cat === 'furniture' ? 'odada ilk konacağı yer (sonra sürüklenir)' : 'nereye konacak?'}</div>
                  <select className={inp} value={form.slot} onChange={e => setForm({ ...form, slot: e.target.value })}>
                    <option value="">{form.cat === 'furniture' ? 'odanın ortası' : 'seçin'}</option>
                    {Object.entries(slotOptions).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              )}
              {form.cat === 'car' && <div><div className={lbl}>araç türü</div><select className={inp} value={form.vtype || 'car'} onChange={e => setForm({ ...form, vtype: e.target.value })}><option value="car">🚗 kara aracı (evin önünde durur)</option><option value="air">🚁 uçan araç (evin üstünde uçar)</option><option value="sea">⛵ tekne (su kenarındaki evin önünde)</option></select></div>}
              {form.cat === 'location' && <div><div className={lbl}>resim yoksa hangi hazır manzara</div><select className={inp} value={form.scene || 'meadow'} onChange={e => setForm({ ...form, scene: e.target.value })}>{['meadow', 'island', 'beach', 'forest', 'mountain', 'snow', 'desert', 'lake', 'city', 'farm', 'candy', 'moon', 'jungle', 'river', 'cliff', 'night'].map(x => <option key={x} value={x}>{x}</option>)}</select></div>}
              {form.cat === 'house' && <div className="sm:col-span-2"><div className={lbl}>odalar (virgülle) - ör: salon, yatak odası, mutfak</div><input className={inp} value={form.roomNames} onChange={e => setForm({ ...form, roomNames: e.target.value })} /></div>}
              {isColorCat && <div><div className={lbl}>renk</div><input type="color" className="w-full h-10 rounded-xl border-2" value={form.color || '#ef4444'} onChange={e => setForm({ ...form, color: e.target.value })} /></div>}
              {form.cat === 'carDecor' && form.slot === 'seat' && <div><div className={lbl}>koltuk rengi</div><input type="color" className="w-full h-10 rounded-xl border-2" value={form.color || '#ef4444'} onChange={e => setForm({ ...form, color: e.target.value })} /></div>}
              {!isColorCat && !isCharCat && form.cat !== 'house' && form.cat !== 'car' && <div><div className={lbl}>ya da emoji</div><input className={inp} value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="🦄" /></div>}
              <div className="sm:col-span-2">
                <MediaUploader label={isCharCat ? 'resim (şeffaf png)' : 'resim (şeffaf png önerilir)'} value={form.image} onChange={v => setForm({ ...form, image: v })} id="gi-img" />
              </div>

              {isCharCat && (
                <div className="sm:col-span-2 bg-slate-50 p-3 rounded-2xl space-y-2">
                  <div><div className={lbl}>yerleşim</div>
                    <select className={inp} value={form.fit || 'template'} onChange={e => setForm({ ...form, fit: e.target.value })}>
                      <option value="template">şablon: resim 200×260 karakter tuvaline çizildi (önerilen)</option>
                      <option value="box">kutu: resim sadece o parça, kutuya sığdır</option>
                    </select>
                  </div>
                  {/* KARAKTER + SAÇ EŞLEŞTİRME */}
                  <div className="bg-white border-2 border-indigo-100 rounded-xl p-2 space-y-2">
                    {form.cat !== 'base' ? (
                      <div><div className={lbl}>önizlemede hangi karakterin üstünde görelim?</div>
                        <select className={inp} value={pvBase} onChange={e => { setPvBase(e.target.value); if (!e.target.value) setFitScope('all'); }}>
                          <option value="">başlangıç karakteri</option>
                          {baseList.map(b => <option key={b.id} value={b.id}>{b.name}{b.builtin ? '' : ' (sizin)'}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div><div className={lbl}>önizlemede hangi saçla görelim?</div>
                        <select className={inp} value={pvHair} onChange={e => setPvHair(e.target.value)}>
                          <option value="">şu anki başlangıç saçı</option>
                          {all.filter(i => i.cat === 'hair').map(h => <option key={h.id} value={h.id}>{h.name}{h.builtin ? '' : ' (sizin)'}</option>)}
                        </select>
                        <div className="text-[10px] font-bold text-slate-400 mt-1">saçın kafaya oturmuyorsa aşağıdaki "saç / şapka / gözlük konumu" ile ayarlayın (bu karakterdeki TÜM saçlar kayar). tek bir saçı ayarlamak için o saçı düzenleyip bu karakteri seçin.</div>
                      </div>
                    )}
                    {form.cat !== 'base' && pvBase && (
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => setFitScope('all')} className={`${btn} ${fitScope === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>ince ayar: tüm karakterler</button>
                        <button onClick={() => setFitScope('base')} className={`${btn} ${fitScope === 'base' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-500'}`}>ince ayar: sadece "{itemMap.get(pvBase)?.name}"</button>
                        {form.fitByBase?.[pvBase] && <button onClick={() => setForm(f => { const n = { ...(f.fitByBase || {}) }; delete n[pvBase]; return { ...f, fitByBase: n }; })} className={`${btn} bg-red-50 text-red-500`}>bu karakterin özel ayarını sil</button>}
                      </div>
                    )}
                    {form.cat !== 'base' && (
                      <div>
                        <div className={lbl}>bu parça hangi karakterlerde görünsün? (hiçbiri seçilmezse hepsinde)</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {baseList.map(b => {
                            const on = (form.forBases || []).includes(b.id);
                            return <button key={b.id} onClick={() => setForm(f => ({ ...f, forBases: on ? (f.forBases || []).filter(x => x !== b.id) : [...(f.forBases || []), b.id] }))} className={`px-2 py-1 rounded-lg text-[11px] font-black border ${on ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-slate-500 border-slate-200'}`}>{on ? '✓ ' : ''}{b.name}</button>;
                          })}
                        </div>
                        {(form.forBases || []).length > 0 && <div className="text-[10px] font-bold text-pink-600 mt-1">çocuk bu karakteri seçince bu parça çıkar; karakteri seçince (aldıysa) otomatik takılır.</div>}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-black text-slate-500">ince ayar{adjKey ? ` (sadece ${itemMap.get(adjKey)?.name})` : ''} · önizlemede resmi parmağınızla da sürükleyebilirsiniz</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Slider label="sağa/sola" value={Number(curAdj.x) || 0} min={-60} max={60} step={1} onChange={v => setAdj({ x: v })} />
                    <Slider label="yukarı/aşağı" value={Number(curAdj.y) || 0} min={-60} max={60} step={1} onChange={v => setAdj({ y: v })} />
                    <Slider label="büyüklük" value={Number(curAdj.s) || 1} min={0.4} max={2} step={0.02} onChange={v => setAdj({ s: v })} />
                  </div>
                  {form.cat === 'base' && (
                    <div className="border-t pt-2 space-y-2">
                      <div className="text-[11px] font-black text-indigo-600">kıyafetleri bu karaktere uydur (otomatik giydirme)</div>
                      <div className="grid grid-cols-4 gap-2">
                        {[['x', 'sağ/sol', -40, 40, 1, 0], ['y', 'yukarı/aşağı', -40, 40, 1, 0], ['sx', 'genişlik', 0.6, 1.6, 0.02, 1], ['sy', 'boy', 0.6, 1.6, 0.02, 1]].map(([k, l, mn, mx, st, df]) => (
                          <Slider key={k} label={l} value={form.clothFit?.[k] ?? df} min={mn} max={mx} step={st} onChange={v => setForm({ ...form, clothFit: { ...(form.clothFit || {}), [k]: v } })} />
                        ))}
                      </div>
                      <div className="text-[11px] font-black text-indigo-600">saç / şapka / gözlük konumu</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[['x', 'sağ/sol', -40, 40, 1, 0], ['y', 'yukarı/aşağı', -40, 40, 1, 0], ['s', 'büyüklük', 0.6, 1.6, 0.02, 1]].map(([k, l, mn, mx, st, df]) => (
                          <Slider key={k} label={l} value={form.headFit?.[k] ?? df} min={mn} max={mx} step={st} onChange={v => setForm({ ...form, headFit: { ...(form.headFit || {}), [k]: v } })} />
                        ))}
                      </div>
                      <label className="flex items-center gap-2 text-[11px] font-black text-slate-600"><input type="checkbox" checked={form.showHair !== false} onChange={e => setForm({ ...form, showHair: e.target.checked })} /> seçilen saç bu karakterde görünsün</label>
                      <label className="flex items-center gap-2 text-[11px] font-black text-slate-600"><input type="checkbox" checked={!!form.hidesClothes} onChange={e => setForm({ ...form, hidesClothes: e.target.checked })} /> kıyafet katmanlarını gizle (resimde kıyafet zaten çizili)</label>
                    </div>
                  )}
                  {form.cat === 'hat' && (
                    <div><div className={lbl}>şapka takılınca saç</div>
                      <select className={inp} value={form.hideHair || 'none'} onChange={e => setForm({ ...form, hideHair: e.target.value })}>
                        <option value="none">saç olduğu gibi kalsın</option><option value="short">saçı kısalt (şapka altına sığsın)</option><option value="all">saçı tamamen gizle</option>
                      </select>
                    </div>
                  )}
                  {form.cat === 'top' && <label className="flex items-center gap-2 text-[11px] font-black text-slate-600"><input type="checkbox" checked={!!form.coversBottom} onChange={e => setForm({ ...form, coversBottom: e.target.checked })} /> elbise gibi: alt giysiyi gizle</label>}
                </div>
              )}
              {form.cat === 'furniture' && (
                <div className="sm:col-span-2 bg-slate-50 p-3 rounded-2xl grid grid-cols-3 gap-2 items-end">
                  <Slider label="genişlik" value={Number(form.size?.w) || 64} min={20} max={240} step={2} onChange={v => setForm({ ...form, size: { ...(form.size || {}), w: v } })} />
                  <Slider label="yükseklik" value={Number(form.size?.h) || 64} min={20} max={200} step={2} onChange={v => setForm({ ...form, size: { ...(form.size || {}), h: v } })} />
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-600"><input type="checkbox" checked={!!form.flat} onChange={e => setForm({ ...form, flat: e.target.checked })} /> halı gibi yere serilir</label>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center bg-gradient-to-b from-pink-50 to-indigo-50 rounded-2xl p-3 select-none">
              <div className={lbl + ' mb-1'}>önizleme</div>
              {isCharCat ? (
                <div className="w-full aspect-[220/300] touch-none cursor-move" onPointerDown={onPrevDown} onPointerMove={onPrevMove} onPointerUp={() => setDragStart(null)} onPointerCancel={() => setDragStart(null)}>
                  <Avatar game={game} itemMap={previewMap} preview={pvPreview} fluid />
                </div>
              ) : form.cat === 'furniture' ? (
                <svg viewBox="0 0 400 250" className="w-full rounded-xl"><RoomInterior roomKey="__pv" game={{ rooms: { __pv: { items: [{ uid: 'p', id: formItem.id, x: 200, y: 232, s: 1 }] } } }} itemMap={previewMap} /></svg>
              ) : <ItemThumb item={formItem} game={game} itemMap={previewMap} size={200} />}
              {isCharCat && form.cat !== 'base' && (
                <div className="w-full mt-2">
                  <div className={lbl}>yakından</div>
                  <div className="w-full aspect-square bg-white rounded-xl"><Avatar game={game} itemMap={previewMap} preview={pvPreview} fluid view={THUMB_VIEWS[form.cat]} /></div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={() => setForm(null)} className={`${btn} bg-white text-slate-500 border`}>vazgeç</button>
            <button onClick={saveForm} className={`${btn} bg-indigo-600 text-white`}>eşyayı listeye ekle</button>
          </div>
          <p className="text-[11px] font-bold text-amber-600 mt-2 text-right">listeye ekledikten sonra yukarıdan "oyun ayarlarını kaydet" demeyi unutmayın.</p>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 👑 PREMIUM ÖĞRENCİLER
// ----------------------------------------------------------------------------
function PremiumTab({ db, appId, childrenList, setChildrenList, tests, responses, cfg, onStartTestMode }) {
  const [withUnpublished, setWithUnpublished] = useState(false);
  const [search, setSearch] = useState('');
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [rowEdits, setRowEdits] = useState({});
  const [busy, setBusy] = useState(null);
  const [nf, setNf] = useState({ name: '', childId: '', pin: '', premium: true, premiumUntil: '' });

  const rand = (n) => Array.from({ length: n }, (_, i) => (i === 0 ? 1 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 10))).join('');
  const childrenCol = collection(db, 'artifacts', appId, 'public', 'data', 'children');

  const list = [...childrenList]
    .filter(c => !onlyPremium || c.premium)
    .filter(c => !search.trim() || `${c.name} ${c.childId}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0) || String(a.name).localeCompare(String(b.name), 'tr'));

  const val = (c, k) => (rowEdits[c.id] && k in rowEdits[c.id] ? rowEdits[c.id][k] : c[k]);
  const edit = (c, patch) => setRowEdits(r => ({ ...r, [c.id]: { ...(r[c.id] || {}), ...patch } }));

  const saveRow = async (c) => {
    const patch = rowEdits[c.id];
    if (!patch) return;
    setBusy(c.id);
    try {
      const data = { ...patch };
      if ('premium' in data) data.premiumSource = data.premium ? 'yonetici' : '';
      await updateDoc(doc(childrenCol, c.id), data);
      setChildrenList(prev => prev.map(x => x.id === c.id ? { ...x, ...data } : x));
      setRowEdits(r => { const n = { ...r }; delete n[c.id]; return n; });
    } catch (e) { console.error(e); alert('kaydedilemedi.'); }
    setBusy(null);
  };

  const addMember = async () => {
    const name = nf.name.trim(); const code = nf.childId.trim();
    if (!name || !code) return alert('ad ve numara gerekli.');
    setBusy('new');
    try {
      const ex = await getDocsFromServer(query(childrenCol, where('childId', '==', code)));
      if (!ex.empty) { alert('bu numara başka bir öğrencide kayıtlı.'); setBusy(null); return; }
      const data = { name, childId: code, pin: nf.pin.trim(), photo: '', isGuest: false, premium: !!nf.premium, premiumSource: nf.premium ? 'yonetici' : '', premiumUntil: nf.premiumUntil || '', deviceIds: [], createdAt: serverTimestamp(), game: STARTER_GAME };
      const ref = await addDoc(childrenCol, data);
      setChildrenList(prev => [...prev, { ...data, id: ref.id }]);
      setNf({ name: '', childId: '', pin: '', premium: true, premiumUntil: '' });
    } catch (e) { console.error(e); alert('eklenemedi.'); }
    setBusy(null);
  };

  const premiumCount = childrenList.filter(c => c.premium).length;

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-3xl border-2 border-indigo-200 shadow-sm bg-gradient-to-r from-indigo-50 to-pink-50">
        <h4 className="font-black text-indigo-700 text-sm mb-1">🎮 uygulamayı çocuk gibi dene</h4>
        <ul className="text-[11px] font-bold text-slate-600 list-disc pl-5 space-y-0.5 mb-3">
          <li>sınırsız yıldız (∞): marketten her şeyi alıp deneyebilirsiniz.</li>
          <li>tüm haritalar ve adalar açık; istediğiniz testi çözebilirsiniz.</li>
          <li>normal (premium olmayan) çocuk gibi davranır: reklam ayarı açıksa reklam da görürsünüz.</li>
          <li>cevaplarınız sunucuya yazılmaz; çocukların istatistikleri ve yıldızları etkilenmez. ilerlemeniz sadece bu cihazda tutulur.</li>
          <li>dönmek için haritadaki mor "panele dön" düğmesi ya da ☰ menü.</li>
        </ul>
        <label className="flex items-center gap-2 text-xs font-black text-slate-600 mb-3"><input type="checkbox" checked={withUnpublished} onChange={e => setWithUnpublished(e.target.checked)} /> yayında olmayan testleri de göster</label>
        <button onClick={() => onStartTestMode?.({ includeUnpublished: withUnpublished })} disabled={!onStartTestMode} className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-lg active:scale-95">▶ çocuk gibi siteye gir</button>
      </div>
      <div className={box}>
        <h4 className="font-black text-indigo-600 text-sm mb-1">yeni üye öğrenci ekle</h4>
        <p className="text-[11px] font-bold text-slate-500 mb-3">çocuk giriş ekranında "zaten üyeyim" deyip bu numara ve şifreyle girer. premium ise reklam görmez.</p>
        <div className="grid sm:grid-cols-5 gap-2 items-end">
          <div className="sm:col-span-2"><div className={lbl}>ad soyad</div><input className={inp} value={nf.name} onChange={e => setNf({ ...nf, name: e.target.value })} /></div>
          <div><div className={lbl}>numara</div><div className="flex gap-1"><input className={inp} value={nf.childId} onChange={e => setNf({ ...nf, childId: e.target.value })} /><button onClick={() => setNf({ ...nf, childId: rand(6) })} className={`${btn} bg-slate-100`}>🎲</button></div></div>
          <div><div className={lbl}>şifre</div><div className="flex gap-1"><input className={inp} value={nf.pin} onChange={e => setNf({ ...nf, pin: e.target.value })} /><button onClick={() => setNf({ ...nf, pin: rand(4) })} className={`${btn} bg-slate-100`}>🎲</button></div></div>
          <div><div className={lbl}>premium bitiş (boş = süresiz)</div><input type="date" className={inp} value={nf.premiumUntil} onChange={e => setNf({ ...nf, premiumUntil: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-xs font-black text-amber-700"><input type="checkbox" checked={nf.premium} onChange={e => setNf({ ...nf, premium: e.target.checked })} /> 👑 premium</label>
          <button onClick={addMember} disabled={busy === 'new'} className={`${btn} bg-indigo-600 text-white sm:col-span-4`}>{busy === 'new' ? 'ekleniyor...' : 'öğrenciyi ekle'}</button>
        </div>
      </div>

      <div className={box}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h4 className="font-black text-indigo-600 text-sm flex-1">tüm oyuncular ({childrenList.length}) · premium: {premiumCount}</h4>
          <input className={inp + ' !w-48'} placeholder="ad veya numara ara" value={search} onChange={e => setSearch(e.target.value)} />
          <label className="flex items-center gap-1 text-xs font-black text-slate-500"><input type="checkbox" checked={onlyPremium} onChange={e => setOnlyPremium(e.target.checked)} /> sadece premium</label>
        </div>
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
          {list.map(c => {
            const dirty = !!rowEdits[c.id];
            const starsEarned = storedStars(c) ?? '—';
            const dBal = storedDiamondBalance(c) ?? '—';
            return (
              <div key={c.id} className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border ${val(c, 'premium') ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex-1 min-w-[150px]">
                  <div className="font-black text-sm text-slate-700">{val(c, 'premium') ? '👑 ' : ''}{c.name} {c.isGuest && <span className="text-[9px] font-black bg-sky-100 text-sky-600 rounded px-1">kendi kaydoldu</span>}</div>
                  <div className="text-[10px] font-bold text-slate-400">numara: {c.childId} · ⭐ {starsEarned} · 💎 {dBal} (harcanan {c.game?.dspent || 0})</div>
                </div>
                <label className="text-[10px] font-black text-cyan-600" title="yöneticinin hediye ettiği elmas (eksi de yazılabilir)">💎 hediye<input type="number" className="block w-16 p-1 border rounded-lg text-xs font-bold" value={val(c, 'manualDiamonds') ?? ''} onChange={e => edit(c, { manualDiamonds: e.target.value === '' ? 0 : Number(e.target.value) })} placeholder="0" /></label>
                <label className="text-[10px] font-black text-slate-500">şifre<input className="block w-20 p-1 border rounded-lg text-xs font-bold" value={val(c, 'pin') || ''} onChange={e => edit(c, { pin: e.target.value })} placeholder="yok" /></label>
                <label className="text-[10px] font-black text-slate-500">bitiş<input type="date" className="block p-1 border rounded-lg text-xs font-bold" value={val(c, 'premiumUntil') || ''} onChange={e => edit(c, { premiumUntil: e.target.value })} /></label>
                <button onClick={() => edit(c, { premium: !val(c, 'premium') })} className={`${btn} ${val(c, 'premium') ? 'bg-amber-400 text-amber-950' : 'bg-white border text-slate-500'}`}>{val(c, 'premium') ? '👑 premium' : 'normal'}</button>
                <button onClick={() => saveRow(c)} disabled={!dirty || busy === c.id} className={`${btn} ${dirty ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-300'}`}>{busy === c.id ? '...' : 'kaydet'}</button>
              </div>
            );
          })}
          {list.length === 0 && <div className="text-center text-slate-400 font-bold text-sm py-6">öğrenci bulunamadı</div>}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 📣 REKLAM AYARLARI
// ----------------------------------------------------------------------------
function AdsTab({ draft, upd }) {
  const a = draft.ads;
  const set = (patch) => upd(x => { x.ads = { ...x.ads, ...patch }; return x; });
  return (
    <div className="space-y-4">
      <div className={box}>
        <h4 className="font-black text-indigo-600 text-sm mb-1">reklam altyapısı</h4>
        <ul className="text-[11px] font-bold text-slate-500 list-disc pl-5 space-y-0.5 mb-3">
          <li>premium öğrencilere hiç reklam gösterilmez.</li>
          <li>test ortasında asla reklam yok. test bitince, son reklamdan en az "aralık" kadar geçtiyse reklam çıkar.</li>
          <li>karakter/ev sayfasından çıkarken ve o sayfada uzun kalınca da aynı kural geçerli.</li>
          <li>şu an "deneme reklamı" ekranı var; gerçek reklam sağlayıcısı sonraki aşamada bağlanacak.</li>
        </ul>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 font-black text-sm p-3 rounded-xl bg-slate-50"><input type="checkbox" checked={!!a.enabled} onChange={e => set({ enabled: e.target.checked })} /> reklamlar açık</label>
          <label className="flex items-center gap-2 font-black text-sm p-3 rounded-xl bg-slate-50"><input type="checkbox" checked={!!a.testMode} onChange={e => set({ testMode: e.target.checked })} /> deneme modu (gerçek reklam yerine örnek ekran)</label>
          <div><div className={lbl}>iki reklam arası en az (dakika)</div><input type="number" min="1" className={inp} value={a.intervalMinutes} onChange={e => set({ intervalMinutes: Number(e.target.value) })} /></div>
          <div><div className={lbl}>karakter/ev sayfasında kaç dakikada bir</div><input type="number" min="1" className={inp} value={a.studioIntervalMinutes} onChange={e => set({ studioIntervalMinutes: Number(e.target.value) })} /></div>
          <div><div className={lbl}>reklam en az kaç saniye (deneme)</div><input type="number" min="3" className={inp} value={a.adDurationSeconds} onChange={e => set({ adDurationSeconds: Number(e.target.value) })} /></div>
          <div><div className={lbl}>sağlayıcı</div>
            <select className={inp} value={a.provider} onChange={e => set({ provider: e.target.value })}>
              <option value="test">deneme</option><option value="adsense">google adsense (web)</option><option value="admob">admob (mobil uygulama - ileride)</option>
            </select>
          </div>
          <div><div className={lbl}>reklam istemci kimliği (ca-pub-...)</div><input className={inp} value={a.adClient} onChange={e => set({ adClient: e.target.value })} /></div>
          <div><div className={lbl}>reklam alanı kimliği</div><input className={inp} value={a.adSlot} onChange={e => set({ adSlot: e.target.value })} /></div>
        </div>
        <button onClick={() => previewAd(a)} className={`${btn} mt-3 bg-slate-800 text-white`}>📣 deneme reklamını göster</button>
      </div>
    </div>
  );
}
