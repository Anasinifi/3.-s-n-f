import { doc, getDocFromServer, setDoc } from 'firebase/firestore';
import { getDocCacheFirst } from '../utils/firebaseCache';
import { BUILTIN_ITEMS, BUILTIN_MAPS, STARTER_GAME, ROOM_TYPES, migrateRoom } from './catalog';

// ============================================================================
// --- GRUP: OYUN AYARLARI (settings/game_config) ---
// ============================================================================
// Yöneticinin değiştirebildiği her şey bu tek belgede durur:
//   starRewards   : kolay/orta/zor test için kaç yıldız (tam doğru / bitirdi)
//   unlockRule    : sonraki ada ne zaman açılır ('completed' = bitirince, 'perfect' = hepsi doğruysa)
//   islandsPerMap : haritası seçilmemiş testler otomatik dağıtılırken bir haritadaki ada sayısı
//   customMaps / mapOverrides     : yönetici haritaları + hazır haritaların gizleme/isim/sıra ayarları
//   customItems / itemOverrides   : yönetici eşyaları + hazır eşyaların fiyat/gizleme ayarları
//   ads           : reklam altyapısı ayarları (premium öğrencilere hiç reklam yok)

export const DEFAULT_GAME_CONFIG = {
  starRewards: {
    easy: { perfect: 3, completed: 1 },
    medium: { perfect: 5, completed: 2 },
    hard: { perfect: 8, completed: 3 },
  },
  defaultDifficulty: 'easy',
  unlockRule: 'completed',
  islandsPerMap: 8,
  welcomeStars: 0,
  paintPrice: 5,          // bir elle boyama hakkı kaç yıldız
  look3d: true,           // karakter / ev / araba / harita 3D (hacimli) görünsün
  customMaps: [],
  mapOverrides: {},
  customItems: [],
  itemOverrides: {},
  // Ekstra: test sonu animasyonları, açıklama ekranları ve oyun sesleri (fx.js)
  fx: { events: {}, explain: {}, sounds: {} },
  // Dünya kurucu: kategori bazında hazır eşyaları gizle ( { hair: true, top: true ... } )
  builtinHidden: {},
  // Yeni oyuncunun başlangıç eşyaları (boşsa hazır başlangıç)
  starter: {},
  ads: {
    enabled: false,          // reklam sistemi açık mı (sonraki aşama: şimdilik kapalı)
    testMode: true,          // gerçek reklam yerine "deneme reklamı" ekranı göster
    provider: 'test',        // 'test' | 'adsense' | 'admob' (ileride)
    intervalMinutes: 5,      // iki reklam arası en az süre
    studioIntervalMinutes: 5,// karakter/ev sayfasında kalınca kaç dakikada bir
    adDurationSeconds: 5,    // deneme reklamının süresi
    adClient: '',            // ileride: reklam sağlayıcı kimliği
    adSlot: '',              // ileride: reklam alanı kimliği
  },
};

const settingsRef = (db, appId) => doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'game_config');

export const mergeGameConfig = (raw) => {
  const r = raw || {};
  const d = DEFAULT_GAME_CONFIG;
  return {
    ...d,
    ...r,
    starRewards: {
      easy: { ...d.starRewards.easy, ...(r.starRewards?.easy || {}) },
      medium: { ...d.starRewards.medium, ...(r.starRewards?.medium || {}) },
      hard: { ...d.starRewards.hard, ...(r.starRewards?.hard || {}) },
    },
    customMaps: Array.isArray(r.customMaps) ? r.customMaps : [],
    mapOverrides: r.mapOverrides || {},
    customItems: Array.isArray(r.customItems) ? r.customItems : [],
    itemOverrides: r.itemOverrides || {},
    ads: { ...d.ads, ...(r.ads || {}) },
    fx: { events: { ...(r.fx?.events || {}) }, explain: { ...(r.fx?.explain || {}) }, sounds: { ...(r.fx?.sounds || {}) }, muteDefaults: !!r.fx?.muteDefaults },
    builtinHidden: { ...(r.builtinHidden || {}) },
    starter: { ...(r.starter || {}) },
  };
};

const LS_KEY = 'ca_game_config_cache';

export const loadGameConfig = async (db, appId, { serverFirst = false } = {}) => {
  try {
    const snap = serverFirst ? await getDocFromServer(settingsRef(db, appId)) : await getDocCacheFirst(settingsRef(db, appId));
    const cfg = mergeGameConfig(snap.exists() ? snap.data() : {});
    try { localStorage.setItem(LS_KEY, JSON.stringify(snap.exists() ? snap.data() : {})); } catch (_) {}
    return cfg;
  } catch (e) {
    try { return mergeGameConfig(JSON.parse(localStorage.getItem(LS_KEY) || '{}')); } catch (_) { return mergeGameConfig({}); }
  }
};

export const getCachedGameConfig = () => {
  try { return mergeGameConfig(JSON.parse(localStorage.getItem(LS_KEY) || '{}')); } catch (_) { return mergeGameConfig({}); }
};

export const saveGameConfig = async (db, appId, cfg) => {
  const clean = JSON.parse(JSON.stringify(cfg));
  await setDoc(settingsRef(db, appId), clean);
  try { localStorage.setItem(LS_KEY, JSON.stringify(clean)); } catch (_) {}
};

// --- KATALOG: hazır eşyalar (yönetici ayarlarıyla) + yönetici eşyaları ---
export const getAllItems = (cfg, { includeHidden = false } = {}) => {
  const ov = cfg?.itemOverrides || {};
  const bh = cfg?.builtinHidden || {};
  const builtin = BUILTIN_ITEMS.map(it => ({ ...it, ...(bh[it.cat] ? { hidden: true } : {}), ...(ov[it.id] || {}) }));
  const custom = (cfg?.customItems || []).map(it => ({ ...it, builtin: false, price: Number(it.price) || 0 }));
  const all = [...builtin, ...custom];
  return includeHidden ? all : all.filter(it => !it.hidden);
};

export const getItemMap = (cfg) => {
  const m = new Map();
  getAllItems(cfg, { includeHidden: true }).forEach(it => m.set(it.id, it));
  return m;
};

// Bir evin oda listesi (hazır ev: rooms dizisi, yönetici evi: roomNames)
export const getHouseRooms = (houseItem) => {
  if (!houseItem) return ['oda'];
  if (Array.isArray(houseItem.rooms) && houseItem.rooms.length) return houseItem.rooms;
  if (houseItem.roomNames) {
    const list = String(houseItem.roomNames).split(',').map(s => s.trim()).filter(Boolean);
    if (list.length) return list.map((n, i) => `c${i}_${n}`);
  }
  return ['oda'];
};

export const getRoomInfo = (roomKey) => {
  if (ROOM_TYPES[roomKey]) return ROOM_TYPES[roomKey];
  const m = /^c\d+_(.+)$/.exec(roomKey || '');
  return { name: m ? m[1] : (roomKey || 'Oda'), emoji: '🚪' };
};

// --- HARİTALAR: hazır + yönetici haritaları (sıralı, gizliler hariç) ---
export const getAllMaps = (cfg, { includeHidden = false } = {}) => {
  const ov = cfg?.mapOverrides || {};
  const builtin = BUILTIN_MAPS.map((m, i) => ({ ...m, builtin: true, order: i, ...(ov[m.id] || {}) }));
  const custom = (cfg?.customMaps || []).map((m, i) => {
    const base = BUILTIN_MAPS.find(b => b.id === m.theme) || BUILTIN_MAPS[0];
    const decor = String(m.decor || '').split(/[\s,]+/).filter(Boolean);
    return {
      ...base,
      ...m,
      builtin: false,
      emoji: m.emoji || base.emoji,
      decor: decor.length ? decor : base.decor,
      toppers: decor.length ? decor : base.toppers,
      particle: m.particle || base.particle,
      order: m.order ?? (100 + i),
    };
  });
  const all = [...builtin, ...custom].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return includeHidden ? all : all.filter(m => !m.hidden);
};

// Eski bahçe (sol/sağ/evcil yerleri) -> serbest yerleşim
const OLD_GARDEN_POS = { garden_left: [44, 262], garden_right: [356, 262], pet: [300, 280] };
const migrateYard = (src) => {
  if (src?.yard && Array.isArray(src.yard.items)) return { items: src.yard.items.filter(x => x && x.id) };
  const items = [];
  Object.entries(OLD_GARDEN_POS).forEach(([k, [x, y]], i) => { if (src?.garden?.[k]) items.push({ uid: `g${i}`, id: src.garden[k], x, y, s: 1 }); });
  return { items };
};

// Eski kayıtlarda eksik alan kalmasın
export const normalizeGame = (g) => {
  const s = STARTER_GAME;
  const src = g || {};
  return {
    ...s,
    ...src,
    equip: { ...s.equip, ...(src.equip || {}) },
    owned: Array.isArray(src.owned) ? src.owned : [],
    garden: { ...s.garden, ...(src.garden || {}) },
    rooms: Object.fromEntries(Object.entries({ ...s.rooms, ...(src.rooms || {}) }).map(([k, v]) => [k, migrateRoom(v)])),
    carDecor: { ...(src.carDecor || {}) },
    carMods: { ...(src.carMods || {}) },
    yard: migrateYard(src),
    location: src.location || 'loc_meadow',
    paints: { ...(src.paints || {}) },
    paintTokens: Number(src.paintTokens) || 0,
    yardPos: { ...(src.yardPos || {}) },
    spent: Number(src.spent) || 0,
  };
};

// Yöneticinin seçtiği başlangıç eşyalarını yeni oyuncuya uygular
export const applyStarter = (game, cfg) => {
  const st = cfg?.starter || {};
  const g = { ...game, equip: { ...(game.equip || {}) } };
  if (st.base) g.base = st.base;
  ['hair', 'top', 'bottom', 'shoes', 'hat', 'accessory'].forEach(k => { if (st[k] !== undefined && st[k] !== '') g.equip[k] = st[k] || null; });
  if (st.house) g.house = st.house;
  return g;
};

// Bir parça (saç, kıyafet...) bu karaktere uygun mu? forBases boşsa her karaktere uyar.
export const fitsBase = (item, baseId) => !item || !Array.isArray(item.forBases) || item.forBases.length === 0 || item.forBases.includes(baseId);
