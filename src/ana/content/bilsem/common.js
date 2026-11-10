// BİLSEM üreticileri için küçük ortak araçlar
import { makeRng, shuffle, pick, pickN, randInt } from '../helpers';

export { makeRng, shuffle, pick, pickN, randInt };

// Şık adaylarından: doğruyla aynı olmayan, birbirinden farklı N yanlış seç.
// cands: [{ key, render }] (öncelik sırasıyla). Yetmezse filler() ile tamamlanır.
export const pickWrongs = (correctKey, cands, n, filler) => {
  const seen = new Set([correctKey]); const out = [];
  for (const c of cands) { if (out.length >= n) break; if (!c || seen.has(c.key)) continue; seen.add(c.key); out.push(c); }
  let guard = 0;
  while (out.length < n && filler && guard++ < 60) { const c = filler(); if (c && !seen.has(c.key)) { seen.add(c.key); out.push(c); } }
  return out;
};

// Şablon sonucu: doğru şık başta (yer dengelemesi banka tarafından yapılır)
export const result = ({ sig, main, correct, wrongs, text, memory, tag }) => ({
  sig,
  mainImage: main || '',
  options: [correct.render ? correct.render() : correct, ...wrongs.map(w => (w.render ? w.render() : w))],
  correctIndex: 0,
  ...(text ? { text } : {}),
  ...(memory ? { memory } : {}),
  ...(tag ? { tag } : {})
});
