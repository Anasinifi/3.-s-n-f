import { collection, query, where, getDocsFromServer, getDocFromServer, doc, addDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { STARTER_GAME } from './catalog';
import { applyStarter } from './gameConfig';

// ============================================================================
// --- GRUP: ŞİFRESİZ GİRİŞ, CİHAZ KİMLİĞİ VE OYUNCU KİMLİĞİ ---
// ============================================================================
// * Çocuk "Oyuna Başla" der, adını yazar -> children koleksiyonunda kaydı açılır.
// * Kayıt bu telefona bağlanır (localStorage). Aynı telefonda ilerleme devam eder.
// * Her çocuğa bir "oyuncu numarası" + 4 haneli "şifre" verilir.
//   Başka telefonda "Zaten üyeyim" ile numara (ya da isim) + şifre girilince ilerleme geri gelir.
//
// ŞİFRESİZ GİRİŞ NEDEN ÇALIŞMIYORDU?
//   Kayıt açmak için Firestore'a YAZMAK gerekir. Firebase kuralları anonim
//   kullanıcının children koleksiyonuna yazmasına izin vermiyorsa (permission-denied)
//   ya da Firebase'de "Anonim giriş" kapalıysa kayıt açılamıyor, ekranda sadece
//   "internet bağlantını kontrol et" yazıyordu.
//   ARTIK:
//    1) Hata kodu açık Türkçe mesajla gösterilir (ne yapılacağı yazar).
//    2) Kural yüzünden yazılamazsa çocuk YİNE oyuna girer: kayıt bu telefonda
//       "yerel oyuncu" olarak tutulur (local_...). Kurallar düzeltilince bir sonraki
//       girişte kayıt otomatik olarak Firestore'a taşınır.

const DEVICE_KEY = 'ca_device_id';
const CHILD_KEY = 'ca_device_child';
const LOCAL_CHILDREN_KEY = 'ca_local_children';

export const getDeviceId = () => {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch (_) { return 'dev_unknown'; }
};

// Bu telefona bağlı oyuncu (hızlı devam için küçük özet)
export const getSavedChild = () => {
  try { return JSON.parse(localStorage.getItem(CHILD_KEY) || 'null'); } catch (_) { return null; }
};
export const saveChildToDevice = (child) => {
  if (child?.isTest) return; // yönetici deneme oyuncusu cihazın "devam et" kaydını bozmasın
  try {
    localStorage.setItem(CHILD_KEY, JSON.stringify({ docId: child.id, childId: child.childId, name: child.name, game: child.game || null, isLocal: !!child.isLocal }));
  } catch (_) {}
  if (child?.isLocal) saveLocalChild(child);
};
export const forgetDeviceChild = () => { try { localStorage.removeItem(CHILD_KEY); } catch (_) {} };

// --- YEREL (telefonda tutulan) OYUNCULAR ---
const readLocalChildren = () => { try { return JSON.parse(localStorage.getItem(LOCAL_CHILDREN_KEY) || '{}'); } catch (_) { return {}; } };
const writeLocalChildren = (m) => { try { localStorage.setItem(LOCAL_CHILDREN_KEY, JSON.stringify(m)); } catch (_) {} };
const saveLocalChild = (child) => {
  if (!child?.id) return;
  const m = readLocalChildren();
  const clean = JSON.parse(JSON.stringify({ ...child, createdAt: null }));
  m[child.id] = clean;
  writeLocalChildren(m);
};
const getLocalChild = (id) => readLocalChildren()[id] || null;
const removeLocalChild = (id) => { const m = readLocalChildren(); delete m[id]; writeLocalChildren(m); };

const childrenCol = (db, appId) => collection(db, 'artifacts', appId, 'public', 'data', 'children');

const randomDigits = (n) => Array.from({ length: n }, (_, i) => (i === 0 ? 1 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 10))).join('');

// Firebase hata kodunu yöneticinin/çocuğun anlayacağı mesaja çevirir
export const explainFirebaseError = (e) => {
  const code = String(e?.code || e?.message || '');
  if (code.includes('admin-restricted-operation') || code.includes('operation-not-allowed')) {
    return 'Firebase\'de "Anonim giriş" kapalı. Yönetici: Firebase Console → Authentication → Sign-in method → Anonymous → Etkinleştir.';
  }
  if (code.includes('permission-denied') || code.includes('insufficient permissions')) {
    return 'Firebase kuralları kayda izin vermiyor. Yönetici: firestore.rules dosyasındaki "children" kuralını ekleyin (DEGISIKLIKLER.md).';
  }
  if (code.includes('unavailable') || code.includes('network') || code.includes('failed-precondition')) {
    return 'internet bağlantısı yok gibi görünüyor. bağlantını kontrol edip tekrar dene.';
  }
  if (code.includes('quota') || code.includes('resource-exhausted')) return 'sunucu şu an çok yoğun, biraz sonra tekrar dene.';
  return `giriş yapılamadı (${code.slice(0, 60) || 'bilinmeyen hata'}).`;
};

const isPermissionError = (e) => /permission-denied|insufficient permissions/i.test(String(e?.code || e?.message || ''));

const generateUniqueChildId = async (db, appId) => {
  for (let i = 0; i < 8; i++) {
    const code = randomDigits(6);
    try {
      const snap = await getDocsFromServer(query(childrenCol(db, appId), where('childId', '==', code)));
      if (snap.empty) return code;
    } catch (_) {
      // liste okuma izni yoksa çakışma kontrolü yapılamaz; 6 haneli rastgele numara yeterince seyrek
      return code;
    }
  }
  return `${Date.now()}`.slice(-8);
};

const buildGame = ({ skin, hair, hairColor, cfg }) => {
  const base = applyStarter(STARTER_GAME, cfg);
  return {
    ...base,
    skin: skin || base.skin,
    hairColor: hairColor || base.hairColor,
    equip: { ...base.equip, hair: hair || base.equip.hair },
  };
};

// Yeni oyuncu oluştur (isim + ten rengi + saç)
// Dönüş: oyuncu kaydı. Firestore'a yazılamazsa isLocal: true olan yerel kayıt döner.
export const createGuestChild = async (db, appId, { name, skin, hair, hairColor, cfg }) => {
  const childId = await generateUniqueChildId(db, appId);
  const pin = randomDigits(4);
  const data = {
    name: String(name || '').trim().slice(0, 24) || 'Kahraman',
    childId,
    pin,
    photo: '',
    isGuest: true,
    premium: false,
    deviceIds: [getDeviceId()],
    createdAt: serverTimestamp(),
    game: buildGame({ skin, hair, hairColor, cfg }),
  };
  try {
    const ref = await addDoc(childrenCol(db, appId), data);
    return { ...data, id: ref.id };
  } catch (e) {
    if (!isPermissionError(e)) throw e;
    console.warn('children koleksiyonuna yazma izni yok, oyuncu bu telefonda yerel olarak tutuluyor.', e);
    const local = { ...data, createdAt: null, id: `local_${childId}`, isLocal: true };
    saveLocalChild(local);
    return local;
  }
};

// Yerel oyuncuyu Firestore'a taşımayı dener (kurallar düzeltildiyse). Başarılıysa yeni kaydı döner.
export const trySyncLocalChild = async (db, appId, child) => {
  if (!child?.isLocal) return child;
  try {
    const { id, isLocal, ...rest } = child;
    const ref = await addDoc(childrenCol(db, appId), { ...rest, createdAt: serverTimestamp(), migratedFromLocal: true });
    removeLocalChild(id);
    return { ...rest, id: ref.id };
  } catch (_) { return child; }
};

// Telefona kayıtlı oyuncuyu getir
export const loadChildByDocId = async (db, appId, docId) => {
  if (String(docId).startsWith('local_')) return getLocalChild(docId);
  const snap = await getDocFromServer(doc(childrenCol(db, appId), docId));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id };
};

// "Zaten üyeyim": numara (ya da isim) + şifre
// Dönüş: { child } veya { error }
export const memberLogin = async (db, appId, code, pin) => {
  const c = String(code || '').trim();
  if (!c) return { error: 'oyuncu numaranı ya da adını yaz.' };
  const p = String(pin || '').trim();

  // Bu telefondaki yerel oyuncular
  const locals = Object.values(readLocalChildren()).filter(x => x.childId === c || String(x.name || '').toLocaleLowerCase('tr') === c.toLocaleLowerCase('tr'));
  const localHit = locals.find(x => !x.pin || String(x.pin) === p);
  if (localHit) return { child: localHit };

  const isNumber = /^\d+$/.test(c);
  let docs = [];
  if (isNumber) {
    const snap = await getDocsFromServer(query(childrenCol(db, appId), where('childId', '==', c)));
    docs = snap.docs;
  } else {
    // İsimle giriş: yazıldığı gibi ve baş harfi büyük hâliyle ara
    const variants = Array.from(new Set([c, c.charAt(0).toLocaleUpperCase('tr') + c.slice(1), c.toLocaleLowerCase('tr')]));
    for (const v of variants) {
      const snap = await getDocsFromServer(query(childrenCol(db, appId), where('name', '==', v)));
      snap.docs.forEach(d => { if (!docs.find(x => x.id === d.id)) docs.push(d); });
    }
  }
  if (docs.length === 0) return { error: isNumber ? 'bu numarayla bir oyuncu bulunamadı.' : 'bu isimde bir oyuncu bulunamadı. numaranla dene.' };

  const candidates = docs.map(d => ({ ...d.data(), id: d.id, _ref: d.ref }));
  let match;
  if (candidates.length === 1) {
    match = candidates[0];
    if (match.pin && String(match.pin) !== p) return { error: p ? 'şifre yanlış. tekrar dene.' : 'şifreni de yaz.' };
  } else {
    if (!p) return { error: 'bu isimde birden fazla oyuncu var. şifreni de yaz (ya da numaranla gir).' };
    match = candidates.find(x => String(x.pin || '') === p);
    if (!match) return { error: 'şifre yanlış. tekrar dene.' };
  }
  const { _ref, ...child } = match;
  try { await updateDoc(_ref, { deviceIds: arrayUnion(getDeviceId()), lastLoginAt: serverTimestamp() }); } catch (_) {}
  return { child };
};

// --- OYUN KAYDININ TELEFONDAKİ YEDEĞİ (her oyuncu için ayrı) ---
// Sınıfım uygulamasında Firestore kuralı henüz "game" alanına yazmaya izin vermiyorsa
// karakter / ev / harcanan elmas bu telefonda kaybolmasın diye.
const GAME_LS = (id) => `ca_game_${id}`;
export const saveGameLocal = (child) => {
  if (!child?.id || child.isTest || !child.game) return;
  try { localStorage.setItem(GAME_LS(child.id), JSON.stringify(child.game)); } catch (_) {}
};
export const loadGameLocal = (id) => { try { return JSON.parse(localStorage.getItem(GAME_LS(id)) || 'null'); } catch (_) { return null; } };
// Sunucudaki ile telefondaki kayıttan yeni olanı seç (ts: son değişiklik zamanı)
export const pickNewestGame = (serverGame, localGame) => {
  if (!localGame) return serverGame || null;
  if (!serverGame) return localGame;
  return (Number(localGame.ts) || 0) > (Number(serverGame.ts) || 0) ? localGame : serverGame;
};

// Oyun durumunu kaydet (karakter, ev, araba, harcanan elmas)
export const saveChildGame = async (db, appId, child, game) => {
  if (!child?.id) return;
  if (child.isTest) { try { localStorage.setItem('ca_admin_test_game', JSON.stringify(game)); } catch (_) {} return; }
  if (child.isLocal) { saveLocalChild({ ...child, game }); return; }
  try { localStorage.setItem(GAME_LS(child.id), JSON.stringify(game)); } catch (_) {}
  try {
    await updateDoc(doc(childrenCol(db, appId), child.id), { game, gameUpdatedAt: serverTimestamp() });
  } catch (e) {
    if (isPermissionError(e)) { console.warn('oyun kaydı sadece bu telefonda tutuldu (Firestore kuralı izin vermiyor).'); return; }
    throw e;
  }
};

// İLERİDE: Google ile giriş (şimdilik kapalı)
// export const signInWithGoogle = async (auth) => {
//   const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
//   const res = await signInWithPopup(auth, new GoogleAuthProvider());
//   return res.user; // -> children kaydında googleUid alanıyla eşleştir
// };
