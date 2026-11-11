import { getTestResponsesForChild } from '../utils/studentStats';
import { getAllMaps, DEFAULT_GAME_CONFIG, testChannel } from './gameConfig';
import { BUILTIN_MAPS } from './catalog';
import { getGeneratedWorld, GENERATED_WORLD_COUNT } from './worlds';

// ============================================================================
// --- GRUP: TEST İLERLEMESİ, YILDIZ HESABI VE ADA/HARİTA DAĞITIMI ---
// ============================================================================

// Testin durumu: 'new' (hiç girmedi) | 'started' (yarım/eski kayıt) | 'completed' (bitirdi) | 'perfect' (hepsi doğru)
export const getTestProgress = (child, test, responses) => {
  if (!test) return 'new';
  if (test.manualStatus === 'green') return 'perfect';
  const qIds = test.questionIds || [];
  if (qIds.length === 0) return 'new';
  const valid = getTestResponsesForChild(child, test, responses);
  if (valid.length === 0) return 'new';

  const attempts = new Map();
  valid.forEach(r => {
    if (!r.attemptId) return;
    if (r.testId && r.testId !== test.id) return;
    if (!attempts.has(r.attemptId)) attempts.set(r.attemptId, { total: Number(r.attemptTotal) || qIds.length, byQ: new Map() });
    const a = attempts.get(r.attemptId);
    if (!a.byQ.has(r.questionId)) a.byQ.set(r.questionId, r);
  });
  let best = 'started';
  for (const a of attempts.values()) {
    const answers = Array.from(a.byQ.values());
    if (a.total > 0 && answers.length >= a.total) {
      if (answers.every(x => x.isCorrect)) return 'perfect';
      best = 'completed';
    }
  }
  if (best === 'started') {
    // eski kayıtlar (attemptId yok): ardışık tam set doğruysa mükemmel say
    const legacy = valid.filter(r => !r.attemptId);
    let batch = [];
    for (const res of legacy) {
      if (batch.find(i => i.questionId === res.questionId)) {
        if (batch.length === qIds.length) { if (batch.every(i => i.isCorrect)) return 'perfect'; best = 'completed'; }
        batch = [];
      }
      batch.push(res);
    }
    if (batch.length === qIds.length) { if (batch.every(i => i.isCorrect)) return 'perfect'; best = 'completed'; }
  }
  return best;
};

export const getTestDifficulty = (test, cfg) => test?.difficulty || cfg?.defaultDifficulty || 'easy';

const has = (v) => v !== undefined && v !== '' && v !== null;

// YILDIZ ödülü. Ana (Sınıfım): yıldız SADECE ödev testlerinden (öğretmenin ayarladığı kadar, varsayılan
// hepsi doğru = 1); harita testleri yıldız vermez (elmas verir). Önceden kazanılan yıldızlar kasada kalır.
// Denemede: harita testleri zorluğa göre, ödev testleri "gorevStars" (varsayılan 0: ödev elmas verir).
export const getRewardFor = (test, cfg) => {
  const c = cfg || DEFAULT_GAME_CONFIG;
  if (c.appKind === 'ana') {
    if (testChannel(test, c) !== 'gorev') return { perfect: 0, completed: 0 };
    const g = c.anaGorevStars || { perfect: 1, completed: 0 };
    return { perfect: Number(g.perfect) || 0, completed: Number(g.completed) || 0 };
  }
  if (testChannel(test, c) === 'gorev') {
    const g = c.gorevStars || DEFAULT_GAME_CONFIG.gorevStars;
    return { perfect: Number(g.perfect) || 0, completed: Number(g.completed) || 0 };
  }
  const d = getTestDifficulty(test, c);
  const base = c.starRewards?.[d] || DEFAULT_GAME_CONFIG.starRewards.easy;
  return {
    perfect: has(test?.starPerfect) ? Number(test.starPerfect) : Number(base.perfect) || 0,
    completed: has(test?.starCompleted) ? Number(test.starCompleted) : Number(base.completed) || 0,
  };
};

// ELMAS ödülü (kanala göre; testte elle verilmişse o)
export const getDiamondRewardFor = (test, cfg) => {
  const c = cfg || DEFAULT_GAME_CONFIG;
  const ch = testChannel(test, c);
  const base = c.diamondRewards?.[ch] || DEFAULT_GAME_CONFIG.diamondRewards[ch] || { perfect: 0, completed: 0 };
  return {
    perfect: has(test?.diamondPerfect) ? Number(test.diamondPerfect) : Number(base.perfect) || 0,
    completed: has(test?.diamondCompleted) ? Number(test.diamondCompleted) : Number(base.completed) || 0,
  };
};

export const starsForStatus = (status, reward) => status === 'perfect' ? reward.perfect : status === 'completed' ? reward.completed : 0;

export const getTestStars = (child, test, responses, cfg) => starsForStatus(getTestProgress(child, test, responses), getRewardFor(test, cfg));

// --- KAZANÇ KASASI ---
// Çocuğun kazandığı yıldız/elmas test test oyun kaydında saklanır: game.bank = { testId: [yıldız, elmas, haritaTesti(1/0), bitti(1/0)] }
// Böylece test silinse, yayından kalksa ya da uygulama güncellense de kazanılan yıldız ve elmaslar kaybolmaz.
const bankOf = (child) => (child?.game?.bank && typeof child.game.bank === 'object' ? child.game.bank : {});
// Kasada olup artık listede olmayan (silinmiş / yayından kalkmış) testlerin toplamı
const bankExtra = (child, tests, idx) => {
  const ids = new Set((tests || []).map(t => t && t.id));
  let sum = 0;
  Object.entries(bankOf(child)).forEach(([id, v]) => { if (!ids.has(id) && Array.isArray(v)) sum += Number(v[idx]) || 0; });
  return sum;
};
// Kasayı güncel testlerle birleştirir (değerler sadece artar). { bank, changed }
export const computeBank = (child, tests, responses, cfg) => {
  const old = bankOf(child);
  const bank = { ...old };
  // Sınıfım bir kerelik aktarma (bankv < 2): kural değişmeden önce haritadan kazanılan yıldızlar
  // (eski kural: her test hepsi doğru = 1) kasaya yazılır, böylece kaybolmaz.
  const legacy = (cfg?.appKind === 'ana') && Number(child?.game?.bankv || 0) < 2;
  let changed = legacy;
  (tests || []).forEach(t => {
    if (!t?.id) return;
    const st = getTestProgress(child, t, responses);
    const done = st === 'perfect' || st === 'completed' ? 1 : 0;
    const s = starsForStatus(st, legacy && isHaritaTest(t, cfg) ? { perfect: 1, completed: 0 } : getRewardFor(t, cfg));
    const d = t.isPublished !== false ? starsForStatus(st, getDiamondRewardFor(t, cfg)) : 0;
    if (!s && !d && !done) return;
    const o = Array.isArray(old[t.id]) ? old[t.id] : [0, 0, 0, 0];
    const nv = [Math.max(Number(o[0]) || 0, s), Math.max(Number(o[1]) || 0, d), isHaritaTest(t, cfg) ? 1 : 0, Math.max(Number(o[3]) || 0, done)];
    if (nv.some((v, i) => v !== o[i])) { bank[t.id] = nv; changed = true; }
  });
  return { bank, changed };
};
// Biten harita / ödev testi sayısı (kasadan; silinen testler de sayılır)
export const countBankDone = (bank) => {
  let map = 0, odev = 0;
  Object.values(bank || {}).forEach(v => { if (Array.isArray(v) && Number(v[3])) { if (Number(v[2])) map++; else odev++; } });
  return { map, odev };
};

// Kazanılan toplam yıldız (testlerden; kasadakiler dahil) + yöneticinin elle verdiği + hoş geldin
export const getEarnedStars = (child, tests, responses, cfg) => {
  if (!child) return 0;
  const bank = bankOf(child);
  let total = 0;
  (tests || []).forEach(t => { total += Math.max(getTestStars(child, t, responses, cfg), Number(bank[t.id]?.[0]) || 0); });
  total += bankExtra(child, tests, 0);
  return Math.max(0, total + (Number(child.manualStars) || 0) + (Number(cfg?.welcomeStars) || 0));
};

// (eski sistem) harcanabilir yıldız = kazanılan - markette harcanan. Elmasa geçişte bir kez kullanılır.
export const getStarBalance = (child, tests, responses, cfg) => {
  const spent = Number(child?.game?.spent) || 0;
  return Math.max(0, getEarnedStars(child, tests, responses, cfg) - spent);
};

export const getTestDiamonds = (child, test, responses, cfg) => starsForStatus(getTestProgress(child, test, responses), getDiamondRewardFor(test, cfg));

// Kazanılan toplam elmas = testler + bitirilen haritaların ekstra ödülü + yönetici + hoş geldin + eski yıldızlardan çevrilen
export const getEarnedDiamonds = (child, tests, responses, cfg) => {
  if (!child) return 0;
  const g = child.game || {};
  let total = 0;
  const bank = bankOf(child);
  (tests || []).forEach(t => { total += Math.max(t.isPublished !== false ? getTestDiamonds(child, t, responses, cfg) : 0, Number(bank[t.id]?.[1]) || 0); });
  total += bankExtra(child, tests, 1);
  const bonus = (Array.isArray(g.mapBonus) ? g.mapBonus.length : 0) * (Number(cfg?.mapBonusDiamonds ?? 3) || 0);
  return Math.max(0, total + bonus + (Number(child.manualDiamonds) || 0) + (Number(cfg?.welcomeDiamonds) || 0) + (Number(g.legacyDiamonds) || 0));
};

// Harcanabilir elmas = kazanılan - markette harcanan
export const getDiamondBalance = (child, tests, responses, cfg) => {
  const spent = Number(child?.game?.dspent) || 0;
  return Math.max(0, getEarnedDiamonds(child, tests, responses, cfg) - spent);
};

// --- YANLIŞLARI ÇÖZ ---
// Testin her sorusu için çocuğun EN SON cevabına bakar; yanlış olan (ya da hiç cevaplanmamış)
// soruların listesini verir. Çocuk sadece bunları çözer; hepsi doğruysa test "tam" sayılır
// (cevaplar aynı testId ile, attemptTotal = yanlış sayısı olarak kaydedilir).
export const getWrongQuestionIds = (child, test, responses) => {
  if (!child || !test) return [];
  const qIds = test.questionIds || [];
  const valid = getTestResponsesForChild(child, test, responses).filter(r => !r.testId || r.testId === test.id);
  const last = new Map();
  valid.forEach(r => last.set(r.questionId, r)); // sıralı: sonuncusu kalır
  return qIds.filter(id => !last.has(id) || !last.get(id).isCorrect);
};

// Yanlışları çözme denemesi için testin kopyası (aynı kimlik, sadece yanlış sorular)
export const makeFixTest = (test, wrongIds) => {
  const set = new Set(wrongIds || []);
  const ids = (test?.questionIds || []).filter(id => set.has(id));
  return { ...test, questionIds: ids.length ? ids : (test?.questionIds || []), isFix: true, fullQuestionCount: (test?.questionIds || []).length };
};

// Liste / rozet için durum: başka testte cevaplanmış ortak sorular yüzünden
// hiç açılmamış test "yarım" görünmesin (bu testin kendi kaydı yoksa "yeni" sayılır)
export const getDisplayStatus = (child, test, responses) => {
  const st = getTestProgress(child, test, responses);
  if (st !== 'started') return st;
  const own = (responses || []).some(r => r.childId === child?.childId && r.testId === test?.id);
  return own ? 'started' : 'new';
};

// Kanal filtreleri
export const isHaritaTest = (t, cfg) => testChannel(t, cfg) === 'harita';
export const isGorevTest = (t, cfg) => testChannel(t, cfg) === 'gorev';

export const isTestDone = (status, cfg) => (cfg?.unlockRule === 'perfect' ? status === 'perfect' : (status === 'completed' || status === 'perfect'));

const testSortKey = (t) => {
  if (t.islandOrder !== undefined && t.islandOrder !== null && t.islandOrder !== '') return Number(t.islandOrder);
  const c = t.createdAt?.seconds;
  return c ? 1e6 + c / 1e4 : 9e9 - (t.order || 0);
};

// Yayındaki testleri haritalara dağıtır.
// Haritası seçilmiş testler o haritaya gider, seçilmemişler sırayla boş yerlere dolar.
// Yer kalmazsa hazır temalardan "Sihirli Orman 2" gibi yeni haritalar otomatik açılır.
export const buildWorld = (tests, cfg) => {
  const c = cfg || DEFAULT_GAME_CONFIG;
  const per = Math.max(1, Number(c.islandsPerMap) || 8);
  const maps = getAllMaps(c).map(m => ({ ...m, tests: [] }));
  const byId = new Map(maps.map(m => [m.id, m]));
  // haritada SADECE harita kanalındaki testler (ödevler sol taraftaki "ödev" sekmesinde)
  const published = (tests || []).filter(t => t.isPublished && (t.questionIds || []).length > 0 && isHaritaTest(t, c));
  const sorted = [...published].sort((a, b) => testSortKey(a) - testSortKey(b));

  const unassigned = [];
  sorted.forEach(t => {
    const m = t.mapId && byId.get(t.mapId);
    if (m) m.tests.push(t); else unassigned.push(t);
  });
  maps.forEach(m => m.tests.sort((a, b) => testSortKey(a) - testSortKey(b)));

  let mi = 0;
  const autoBase = maps.length;
  for (const t of unassigned) {
    while (mi < maps.length && maps[mi].tests.length >= per) mi++;
    if (mi >= maps.length) {
      // Yer kalmadı: 1000 farklı dünyadan sıradaki açılır (ilk 100+ dünyanın hepsi ayrı mekân)
      const k = maps.length;
      const gi = k - autoBase;
      const gw = getGeneratedWorld(gi % GENERATED_WORLD_COUNT);
      const round = Math.floor(gi / GENERATED_WORLD_COUNT);
      const extra = { ...gw, id: `auto_${k}`, name: round ? `${gw.name} ${round + 1}` : gw.name, builtin: true, auto: true, tests: [] };
      maps.push(extra);
      byId.set(extra.id, extra);
    }
    maps[mi].tests.push(t);
  }
  return maps.filter(m => m.tests.length > 0);
};

// Her ada için durum: 'locked' | 'current' | 'done'
export const getWorldState = (world, child, responses, cfg) => {
  let prevAllDone = true;
  return world.map((m, mapIdx) => {
    const mapUnlocked = prevAllDone;
    let prevDone = mapUnlocked;
    let currentIdx = -1;
    const islands = m.tests.map((t, i) => {
      const status = getTestProgress(child, t, responses);
      const done = isTestDone(status, cfg);
      let state = 'locked';
      if (done) state = 'done';
      else if (prevDone) { state = 'current'; if (currentIdx < 0) currentIdx = i; }
      // bitmiş adadan sonraki ilk bitmemiş ada açık; ondan sonrakiler kilitli
      prevDone = done;
      return { test: t, status, done, state, stars: starsForStatus(status, getRewardFor(t, cfg)), reward: getRewardFor(t, cfg), dreward: getDiamondRewardFor(t, cfg) };
    });
    const allDone = islands.length > 0 && islands.every(x => x.done);
    prevAllDone = mapUnlocked && allDone;
    return { ...m, mapIdx, unlocked: mapUnlocked, allDone, islands, currentIdx };
  });
};

// --- YÖNETİCİ İÇİN HAZIR ÖZET (okuma tasarrufu) ---
// Öğrencinin cihazı kendi yıldız/elmasını hesaplayıp oyun kaydına yazar (game.tstars, game.tdia).
// Yönetici böylece hiçbir cevap okumadan, sadece öğrenci kaydından yıldızı görür.
// Yöneticinin verdiği manuel yıldız / hediye elmas hep güncel kalsın diye özetin içine katılmaz.
export const storedStars = (child) => {
  const v = child?.game?.tstars;
  return v == null ? null : Math.max(0, (Number(v) || 0) + (Number(child.manualStars) || 0));
};
export const storedDiamondBalance = (child) => {
  const v = child?.game?.tdia;
  return v == null ? null : Math.max(0, (Number(v) || 0) + (Number(child.manualDiamonds) || 0) - (Number(child.game?.dspent) || 0));
};
