// ============================================================================
// --- GRUP: ÖĞRENCİ TEST DURUMU VE YILDIZ HESABI ---
// ============================================================================
// Yeni cevaplar "attemptId" (çözüm kimliği) ve "attemptTotal" (o çözümde
// gösterilen soru sayısı) bilgisiyle kaydedilir. Böylece:
//  * Aynı soruya yanlışlıkla iki cevap düşse bile çözüm doğru gruplanır,
//  * Testten silinmiş bir soru yüzünden çocuk 9 soru gördüyse, 9'unu da doğru
//    yaptığında testi tamamlamış sayılır (tekrar çözmek zorunda kalmaz).
// Eski cevaplar (attemptId olmayan) eski yöntemle değerlendirilmeye devam eder.

const responseTime = (r) => {
  if (r?.timestamp?.seconds !== undefined) return r.timestamp.seconds + (r.timestamp.nanoseconds || 0) / 1e9;
  if (r?.clientTs) return r.clientTs / 1000;
  return Number.MAX_SAFE_INTEGER / 1e6; // henüz sunucuya yazılmamış yeni cevap: en sona
};

export const getTestResponsesForChild = (child, test, responses) => {
  if (!child || !test) return [];
  const qIds = test.questionIds || [];
  return responses
    .filter(r => r.childId === child.childId && (r.testId === test.id || qIds.includes(r.questionId)))
    .sort((a, b) => responseTime(a) - responseTime(b));
};

export const getTestCompletion = (child, test, responses) => {
  if (!test) return 'new';
  if (test.manualStatus === 'green') return 'perfect';
  const qIds = test.questionIds || [];
  if (qIds.length === 0) return 'new';
  const qCount = qIds.length;

  const valid = getTestResponsesForChild(child, test, responses);
  if (valid.length === 0) return 'new';

  // 1) Yeni sistem: çözüm kimliğine göre grupla
  const attempts = new Map();
  valid.forEach(r => {
    if (!r.attemptId) return;
    if (r.testId && r.testId !== test.id) return;
    if (!attempts.has(r.attemptId)) attempts.set(r.attemptId, { total: Number(r.attemptTotal) || qCount, byQ: new Map() });
    const a = attempts.get(r.attemptId);
    if (!a.byQ.has(r.questionId)) a.byQ.set(r.questionId, r); // aynı soruya ikinci cevap sayılmaz
  });
  for (const a of attempts.values()) {
    const answers = Array.from(a.byQ.values());
    if (a.total > 0 && answers.length >= a.total && answers.every(x => x.isCorrect)) return 'perfect';
  }

  // 2) Eski sistem (attemptId olmayan cevaplar)
  const legacy = valid.filter(r => !r.attemptId);
  let currentBatch = [];
  for (const res of legacy) {
    if (currentBatch.find(item => item.questionId === res.questionId)) {
      if (currentBatch.length === qCount && currentBatch.every(i => i.isCorrect)) return 'perfect';
      currentBatch = [];
    }
    currentBatch.push(res);
  }
  if (currentBatch.length === qCount && currentBatch.every(i => i.isCorrect)) return 'perfect';

  return 'retry';
};

export const calculateStudentStars = (child, tests, responses) => {
  if (!child) return 0;
  let earnedStars = 0;
  tests.forEach(test => {
    if (getTestCompletion(child, test, responses) === 'perfect') earnedStars++;
  });
  const manualStars = child.manualStars || 0;
  return Math.max(0, earnedStars + manualStars);
};
