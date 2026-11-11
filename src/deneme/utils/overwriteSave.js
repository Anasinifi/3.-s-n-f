import { collection, query, where, getDocsFromServer, doc } from 'firebase/firestore';
import { commitOpsInChunks } from './firestoreBatch';

// ============================================================================
// --- ÜZERİNE KAYDETME (hazır soru bankaları ve etkileşimli şablonlar) ---
// ============================================================================
// Aynı hazır soru ikinci kez kaydedilince kopya oluşmasın diye: var olan kayıt
// bulunur ve AYNI belge kimliğiyle yeniden yazılır (eskisi gider, yenisi gelir).
// Kimlik değişmediği için soru testlerdeki yerinde kalır. Fazlalık kopyalar
// silinir ve testlerin soru listesinden de çıkarılır.

const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };

// Bir alanın değeri verilen listede olan soruları getirir ('in' sorgusu 30'luk parçalarla)
export const findQuestionsByField = async (db, appId, field, values) => {
  const qCol = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
  const uniq = Array.from(new Set((values || []).filter(v => v !== undefined && v !== null && v !== '')));
  const found = new Map();
  for (const part of chunk(uniq, 30)) {
    const snap = await getDocsFromServer(query(qCol, where(field, 'in', part)));
    snap.docs.forEach(d => found.set(d.id, { id: d.id, ref: d.ref, data: d.data() }));
  }
  return Array.from(found.values());
};

/**
 * items: [{ matchKey, data }]  — matchKey: aynı soruyu tanıtan anahtar (ör. "grup|sıra")
 * existing: [{ id, ref, data }] — daha önce kaydedilmiş sorular
 * existingKeyOf(e): eski kaydın anahtarı (bulunamazsa null)
 * Dönüş: { ops, created, updatedIds, deletedIds }
 */
export const planOverwrite = (db, appId, items, existing, existingKeyOf) => {
  const qCol = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
  const byKey = new Map();
  const extras = [];
  existing.forEach(e => {
    const k = existingKeyOf(e);
    if (k && !byKey.has(k)) byKey.set(k, e); else extras.push(e);
  });
  const ops = []; const created = []; const updatedIds = [];
  items.forEach(({ matchKey, data }) => {
    const old = matchKey ? byKey.get(matchKey) : null;
    if (old) byKey.delete(matchKey);
    const ref = old ? old.ref : doc(qCol);
    ops.push({ type: 'set', ref, data });
    if (old) updatedIds.push(ref.id);
    created.push({ ...data, id: ref.id, createdAt: { seconds: Math.floor(Date.now() / 1000) } });
  });
  // Eşleşmeyen eski kayıtlar (kopyalar, artık olmayan şablonlar) silinir
  byKey.forEach(e => extras.push(e));
  extras.forEach(e => ops.push({ type: 'delete', ref: e.ref }));
  return { ops, created, updatedIds, deletedIds: extras.map(e => e.id) };
};

// Silinen soruları testlerin soru listesinden çıkarır (testte "hayalet" soru kalmasın)
export const removeIdsFromAllTests = async (db, appId, ids) => {
  if (!ids || ids.length === 0) return [];
  const idSet = new Set(ids);
  const snap = await getDocsFromServer(collection(db, 'artifacts', appId, 'public', 'data', 'tests'));
  const affected = snap.docs.filter(d => (d.data().questionIds || []).some(id => idSet.has(id)));
  if (affected.length === 0) return [];
  const ops = affected.map(d => ({ type: 'update', ref: d.ref, data: { questionIds: (d.data().questionIds || []).filter(id => !idSet.has(id)) } }));
  await commitOpsInChunks(db, ops);
  return affected.map(d => d.id);
};

// Ekrandaki soru listesini güncelle: üzerine yazılanlar yenilenir, silinenler çıkar, yeniler eklenir
export const mergeQuestionState = (prev, created, deletedIds) => {
  const gone = new Set([...(deletedIds || []), ...created.map(c => c.id)]);
  return [...created, ...prev.filter(q => !gone.has(q.id))];
};

// Testlerin ekrandaki halinden silinen soru kimliklerini çıkar
export const stripIdsFromTestState = (prev, ids) => {
  if (!ids || ids.length === 0) return prev;
  const s = new Set(ids);
  return prev.map(t => (t.questionIds || []).some(id => s.has(id)) ? { ...t, questionIds: t.questionIds.filter(id => !s.has(id)) } : t);
};
