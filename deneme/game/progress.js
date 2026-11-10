import { getTestResponsesForChild } from '../utils/studentStats';
import { getAllMaps, DEFAULT_GAME_CONFIG } from './gameConfig';
import { BUILTIN_MAPS } from './catalog';

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

export const getRewardFor = (test, cfg) => {
  const c = cfg || DEFAULT_GAME_CONFIG;
  const d = getTestDifficulty(test, c);
  const base = c.starRewards?.[d] || DEFAULT_GAME_CONFIG.starRewards.easy;
  return {
    perfect: test?.starPerfect !== undefined && test?.starPerfect !== '' && test?.starPerfect !== null ? Number(test.starPerfect) : Number(base.perfect) || 0,
    completed: test?.starCompleted !== undefined && test?.starCompleted !== '' && test?.starCompleted !== null ? Number(test.starCompleted) : Number(base.completed) || 0,
  };
};

export const starsForStatus = (status, reward) => status === 'perfect' ? reward.perfect : status === 'completed' ? reward.completed : 0;

export const getTestStars = (child, test, responses, cfg) => starsForStatus(getTestProgress(child, test, responses), getRewardFor(test, cfg));

// Kazanılan toplam yıldız (testlerden) + yöneticinin elle verdiği + hoş geldin
export const getEarnedStars = (child, tests, responses, cfg) => {
  if (!child) return 0;
  let total = 0;
  (tests || []).forEach(t => { total += getTestStars(child, t, responses, cfg); });
  return total + (Number(child.manualStars) || 0) + (Number(cfg?.welcomeStars) || 0);
};

// Harcanabilir yıldız = kazanılan - markette harcanan
export const getStarBalance = (child, tests, responses, cfg) => {
  const spent = Number(child?.game?.spent) || 0;
  return Math.max(0, getEarnedStars(child, tests, responses, cfg) - spent);
};

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
  const published = (tests || []).filter(t => t.isPublished && (t.questionIds || []).length > 0);
  const sorted = [...published].sort((a, b) => testSortKey(a) - testSortKey(b));

  const unassigned = [];
  sorted.forEach(t => {
    const m = t.mapId && byId.get(t.mapId);
    if (m) m.tests.push(t); else unassigned.push(t);
  });
  maps.forEach(m => m.tests.sort((a, b) => testSortKey(a) - testSortKey(b)));

  let mi = 0;
  for (const t of unassigned) {
    while (mi < maps.length && maps[mi].tests.length >= per) mi++;
    if (mi >= maps.length) {
      const k = maps.length;
      const theme = BUILTIN_MAPS[k % BUILTIN_MAPS.length];
      const round = Math.floor(k / BUILTIN_MAPS.length) + 1;
      const extra = { ...theme, id: `auto_${k}`, name: `${theme.name} ${round}`, builtin: true, auto: true, tests: [] };
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
      return { test: t, status, done, state, stars: starsForStatus(status, getRewardFor(t, cfg)), reward: getRewardFor(t, cfg) };
    });
    const allDone = islands.every(x => x.done);
    prevAllDone = mapUnlocked && allDone;
    return { ...m, mapIdx, unlocked: mapUnlocked, allDone, islands, currentIdx };
  });
};
