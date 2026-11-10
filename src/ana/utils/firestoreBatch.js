import { writeBatch } from 'firebase/firestore';

// ============================================================================
// --- GRUP: BOYUT KONTROLLÜ TOPLU YAZMA (FIRESTORE BATCH) ---
// ============================================================================
// Firestore bir toplu yazmada en fazla 500 işlem ve ~10 MB veri kabul eder.
// Görsel (SVG) içeren sorular büyük olduğu için 400'lük sabit gruplar bu
// sınırı aşıp TÜM aktarımın başarısız olmasına yol açıyordu. Bu yardımcı,
// işlemleri hem adet hem de tahmini boyuta göre güvenli parçalara böler.

export const MAX_DOC_BYTES = 1000000; // Firestore tek belge sınırı (~1 MB)

export const estimateDocBytes = (data) => {
  try {
    return JSON.stringify(data || {}).length + 256;
  } catch (_) {
    return 4096;
  }
};

/**
 * ops: [{ type: 'set' | 'update' | 'delete', ref, data, options }]
 * onProgress(doneCount, totalCount)
 * Dönüş: { written, skipped: [{ ref, reason }] }
 */
export const commitOpsInChunks = async (db, ops, { maxOps = 450, maxBytes = 6500000, onProgress } = {}) => {
  const skipped = [];
  let written = 0;
  let batch = writeBatch(db);
  let count = 0;
  let bytes = 0;

  const flush = async () => {
    if (count === 0) return;
    await batch.commit();
    written += count;
    if (onProgress) onProgress(written + skipped.length, ops.length);
    batch = writeBatch(db);
    count = 0;
    bytes = 0;
  };

  for (const op of ops) {
    const size = op.type === 'delete' ? 128 : estimateDocBytes(op.data);
    if (size > MAX_DOC_BYTES) {
      skipped.push({ ref: op.ref, reason: 'belge 1 MB sınırını aşıyor' });
      continue;
    }
    if (count >= maxOps || bytes + size > maxBytes) await flush();
    if (op.type === 'delete') batch.delete(op.ref);
    else if (op.type === 'update') batch.update(op.ref, op.data);
    else if (op.options) batch.set(op.ref, op.data, op.options);
    else batch.set(op.ref, op.data);
    count++;
    bytes += size;
  }
  await flush();
  return { written, skipped };
};
