// ============================================================================
// --- HİKÂYE SORULARI: blok halinde ve sırasıyla ---
// ============================================================================
// Aynı hikâyenin soruları (aynı storyId) her zaman birlikte ve 1., 2., 3. sırasıyla
// teste girer. Çocuk hikâyenin 3. sorusunu 1. sorusundan önce görmez.
// Aynı kalıp iki kez kaydedildiyse (kopyalar), her kopya kendi bloğunu oluşturur.

const partOf = (q) => Number(q?.storyPart) || 0;

// Bir hikâyenin sorularını kopyalara ayırır: [[1a, 2a, 3a], [1b, 2b, 3b]]
const splitCopies = (list) => {
  const byPart = new Map();
  [...list].sort((a, b) => partOf(a) - partOf(b) || String(a.id).localeCompare(String(b.id))).forEach(q => {
    const p = partOf(q);
    if (!byPart.has(p)) byPart.set(p, []);
    byPart.get(p).push(q);
  });
  const parts = [...byPart.keys()].sort((a, b) => a - b);
  const copies = Math.max(...parts.map(p => byPart.get(p).length));
  const out = [];
  for (let k = 0; k < copies; k++) out.push(parts.map(p => byPart.get(p)[k]).filter(Boolean));
  return out;
};

// Soru listesini birimlere böler: hikâye bloğu = tek birim, diğer her soru = tek birim.
// Dönüş: [{ key, ids: [...], folderId }]
export const buildUnits = (questions) => {
  const units = [];
  const byStory = new Map();
  questions.forEach(q => {
    if (q.storyId) {
      if (!byStory.has(q.storyId)) byStory.set(q.storyId, []);
      byStory.get(q.storyId).push(q);
    } else units.push({ key: `q:${q.id}`, ids: [q.id], folderId: q.folderId || null });
  });
  byStory.forEach((list, sid) => {
    splitCopies(list).forEach((copy, k) => units.push({ key: `s:${sid}#${k}`, ids: copy.map(q => q.id), folderId: copy[0]?.folderId || null, story: true }));
  });
  return units;
};

// Test sorularının sırasını düzeltir: bir hikâyenin soruları, ilk sorusunun bulunduğu yerde
// art arda ve 1-2-3 sırasıyla durur. Diğer soruların sırası değişmez.
export const normalizeStoryOrder = (ids, getQ) => {
  const seen = new Set();
  const out = [];
  ids.forEach(id => {
    if (seen.has(id)) return;
    const q = getQ(id);
    if (!q || !q.storyId) { seen.add(id); out.push(id); return; }
    const members = ids.filter(x => !seen.has(x) && getQ(x)?.storyId === q.storyId).map(getQ);
    // kopyalar varsa: önce 1. kopyanın tüm soruları, sonra 2. kopyanın...
    splitCopies(members).forEach(copy => copy.forEach(m => { seen.add(m.id); out.push(m.id); }));
  });
  return out;
};

// Bir hikâye sorusu teste eklenince: aynı hikâyenin diğer sorularını da bul (sırasıyla).
// Kopyalar varsa eklenen soruyla aynı klasördeki kopya tercih edilir.
export const storySiblingIds = (q, allQuestions, alreadySelected = []) => {
  if (!q?.storyId) return [q?.id].filter(Boolean);
  const same = allQuestions.filter(x => x.storyId === q.storyId);
  const copies = splitCopies(same);
  const sel = new Set(alreadySelected);
  const mine = copies.find(c => c.some(x => x.id === q.id)) || copies[0] || [q];
  // eksik bölüm varsa (ör. 2. soru silinmiş) aynı klasördeki başka kopyadan tamamla
  const parts = new Map(mine.map(x => [partOf(x), x]));
  same.forEach(x => {
    const p = partOf(x);
    if (!parts.has(p) && (x.folderId || null) === (q.folderId || null) && !sel.has(x.id)) parts.set(p, x);
  });
  return [...parts.keys()].sort((a, b) => a - b).map(p => parts.get(p).id);
};

// Sıralı listeyi bloklara böler: art arda gelen aynı hikâyenin soruları tek blok.
export const toBlocks = (ids, getQ) => {
  const out = [];
  ids.forEach(id => {
    const sid = getQ(id)?.storyId || null;
    const last = out[out.length - 1];
    if (sid && last && last.sid === sid) last.ids.push(id);
    else out.push({ sid, ids: [id] });
  });
  return out;
};

// Bloğu taşı: fromIdx'teki sorunun bloğu, toIdx konumuna (soru sırası cinsinden) taşınır.
export const moveBlock = (ids, getQ, fromIdx, toIdx) => {
  const blocks = toBlocks(normalizeStoryOrder(ids, getQ), getQ);
  const starts = []; let p = 0;
  blocks.forEach(b => { starts.push(p); p += b.ids.length; });
  const fb = starts.findIndex((s, i) => fromIdx >= s && fromIdx < s + blocks[i].ids.length);
  if (fb < 0) return ids;
  let ib = starts.filter(s => s < toIdx).length;
  const [moved] = blocks.splice(fb, 1);
  if (fb < ib) ib -= 1;
  blocks.splice(Math.max(0, Math.min(ib, blocks.length)), 0, moved);
  return blocks.flatMap(b => b.ids);
};

// Bloğu bir adım yukarı (-1) / aşağı (+1) taşı.
export const stepBlock = (ids, getQ, index, dir) => {
  const blocks = toBlocks(normalizeStoryOrder(ids, getQ), getQ);
  let p = 0; let bi = -1;
  blocks.forEach((b, i) => { if (index >= p && index < p + b.ids.length) bi = i; p += b.ids.length; });
  const ti = bi + dir;
  if (bi < 0 || ti < 0 || ti >= blocks.length) return ids;
  [blocks[bi], blocks[ti]] = [blocks[ti], blocks[bi]];
  return blocks.flatMap(b => b.ids);
};
