import { doc, runTransaction, setDoc, serverTimestamp } from 'firebase/firestore';

// ============================================================================
// --- GRUP: ZAMANLI TEST YAYINLAMA (HER GÜN ŞU SAATTE SIRADAN N TEST) ---
// ============================================================================
// Ayar belgesi: settings/publish_schedule
// {
//   enabled: true,
//   time: '08:30',            // yerel saat
//   perDay: 2,                // her seferde yayınlanacak test sayısı
//   weekdays: [1,2,3,4,5],    // 0=Pazar ... 6=Cumartesi
//   queue: [testId, ...],     // sıradaki testler (sırayla yayınlanır)
//   lastRunDate: '2026-10-30',// en son işlenen gün
//   history: [{ date, testIds }]
// }
// Sunucu tarafında zamanlayıcı olmadığı için kontrol; uygulama açık olan her
// cihazda (yönetici veya öğrenci) belirli aralıklarla yapılır. İşlem bir
// "transaction" içinde olduğundan aynı test iki kez yayınlanmaz. Uygulama
// birkaç gün açılmazsa kaçırılan günlerin testleri de sırayla yayınlanır.

// ÖDEV ve HARİTA testleri için AYRI zamanlayıcı:
//   * uygulamanın eski (varsayılan) kanalı 'publish_schedule' belgesini kullanır
//     (Sınıfım: ödev · Deneme: harita) -> eski sıra olduğu gibi devam eder
//   * diğer kanal 'publish_schedule_gorev' / 'publish_schedule_harita' belgesini kullanır
const ANA_APP = 'cocuk-akademi-pro-v33-fix-final';
export const appKindOfId = (appId) => (appId === ANA_APP ? 'ana' : 'deneme');
export const scheduleDocName = (appId, channel) => {
  const legacy = appKindOfId(appId) === 'ana' ? 'gorev' : 'harita';
  return !channel || channel === legacy ? 'publish_schedule' : `publish_schedule_${channel}`;
};
export const getScheduleRef = (db, appId, docName = 'publish_schedule') => doc(db, 'artifacts', appId, 'public', 'data', 'settings', docName);

export const DEFAULT_SCHEDULE = {
  enabled: false,
  time: '08:30',
  perDay: 2,
  weekdays: [1, 2, 3, 4, 5],
  queue: [],
  lastRunDate: '',
  history: []
};

export const WEEKDAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

export const toLocalDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseLocalDate = (str) => {
  const [y, m, d] = String(str).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const parseTime = (t) => {
  const [h, m] = String(t || '08:30').split(':').map(Number);
  return { h: isNaN(h) ? 8 : h, m: isNaN(m) ? 30 : m };
};

const hasTimePassed = (now, time) => {
  const { h, m } = parseTime(time);
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
};

// Ayar ilk açıldığında: saat bugün geçtiyse bugünü "işlenmiş" say (geriye dönük yayın yapmasın)
export const initialLastRunDate = (time, now = new Date()) => {
  if (hasTimePassed(now, time)) return toLocalDateStr(now);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return toLocalDateStr(y);
};

// Yayın yapılması gereken (kaçırılmış dahil) günleri döndürür
export const computeDueDates = (schedule, now = new Date(), maxDays = 14) => {
  if (!schedule || !schedule.enabled) return [];
  const weekdays = Array.isArray(schedule.weekdays) && schedule.weekdays.length > 0 ? schedule.weekdays : [0, 1, 2, 3, 4, 5, 6];
  const todayStr = toLocalDateStr(now);
  const start = schedule.lastRunDate ? parseLocalDate(schedule.lastRunDate) : parseLocalDate(initialLastRunDate(schedule.time, now));
  const dates = [];
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() + 1);
  let guard = 0;
  while (toLocalDateStr(cursor) <= todayStr && guard < 60) {
    guard++;
    const ds = toLocalDateStr(cursor);
    const isToday = ds === todayStr;
    if (weekdays.includes(cursor.getDay()) && (!isToday || hasTimePassed(now, schedule.time))) dates.push(ds);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates.slice(-maxDays);
};

// Bir sonraki yayınların önizlemesi (yönetici paneli için)
export const previewUpcoming = (schedule, testsById = {}, now = new Date(), days = 7) => {
  const out = [];
  if (!schedule) return out;
  const weekdays = Array.isArray(schedule.weekdays) && schedule.weekdays.length > 0 ? schedule.weekdays : [0, 1, 2, 3, 4, 5, 6];
  const perDay = Math.max(1, Number(schedule.perDay) || 1);
  const queue = [...(schedule.queue || [])].filter(id => testsById[id] && !testsById[id].isPublished);
  const cursor = new Date(now);
  if (hasTimePassed(now, schedule.time) || (schedule.lastRunDate && schedule.lastRunDate >= toLocalDateStr(now))) cursor.setDate(cursor.getDate() + 1);
  let qi = 0;
  let guard = 0;
  while (out.length < days && qi < queue.length && guard < 60) {
    guard++;
    if (weekdays.includes(cursor.getDay())) {
      const ids = queue.slice(qi, qi + perDay);
      qi += perDay;
      out.push({ date: toLocalDateStr(cursor), weekday: WEEKDAY_LABELS[cursor.getDay()], time: schedule.time, tests: ids.map(id => testsById[id]) });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
};

/**
 * Zamanı gelen testleri yayınlar. Yayınlanan test id'lerini döndürür.
 * Yetki hatası (ör. öğrenci cihazı yazamıyorsa) sessizce yok sayılır.
 */
export const runPublishScheduleIfDue = async (db, appId) => {
  const otherDoc = appKindOfId(appId) === 'ana' ? 'publish_schedule_harita' : 'publish_schedule_gorev';
  const a = await runScheduleDoc(db, appId, 'publish_schedule');
  const b = await runScheduleDoc(db, appId, otherDoc);
  const published = [...a, ...b];
  if (published.length > 0) {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'sync'), { lastUpdate: serverTimestamp() });
    } catch (_) {}
  }
  return published;
};

const runScheduleDoc = async (db, appId, docName) => {
  const ref = getScheduleRef(db, appId, docName);
  let published = [];
  try {
    published = await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return [];
      const schedule = { ...DEFAULT_SCHEDULE, ...snap.data() };
      if (!schedule.enabled) return [];
      const now = new Date();
      const due = computeDueDates(schedule, now);
      if (due.length === 0) return [];

      const perDay = Math.max(1, Number(schedule.perDay) || 1);
      const queue = [...(schedule.queue || [])];
      const wanted = due.length * perDay;

      // ÖNCE tüm okumalar (transaction kuralı)
      const candidates = [];
      let qi = 0;
      while (candidates.length < wanted && qi < queue.length) {
        const id = queue[qi++];
        const tRef = doc(db, 'artifacts', appId, 'public', 'data', 'tests', id);
        const tSnap = await tx.get(tRef);
        if (tSnap.exists() && !tSnap.data().isPublished) candidates.push({ id, ref: tRef });
      }
      const remainingQueue = queue.slice(qi);

      // SONRA yazmalar
      const nowIso = new Date().toISOString();
      candidates.forEach(c => tx.update(c.ref, { isPublished: true, publishedAt: nowIso, publishedBySchedule: true }));
      const historyEntries = [];
      due.forEach((d, i) => {
        const ids = candidates.slice(i * perDay, (i + 1) * perDay).map(c => c.id);
        if (ids.length > 0) historyEntries.push({ date: d, testIds: ids });
      });
      tx.update(ref, {
        queue: remainingQueue,
        lastRunDate: due[due.length - 1],
        history: [...(schedule.history || []), ...historyEntries].slice(-60)
      });
      return candidates.map(c => c.id);
    });
  } catch (e) {
    if (e && e.code !== 'permission-denied') console.warn('zamanlı yayın kontrolü yapılamadı:', e?.message || e);
    return [];
  }
  return published;
};
