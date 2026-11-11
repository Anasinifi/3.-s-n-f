// ============================================================================
// --- HAZIR SORU BANKASI ALTYAPISI (Kavram Soruları + BİLSEM Soruları) ---
// ============================================================================
// Bir banka şu yapıdadır:
//   kategoriler -> kavramlar -> soru kalıpları (gruplar) -> şablonlar (hazır sorular)
// Her grup: { key, text, gen, count }  ->  gen(key, i) bir şablon üretir.
// Panel (TemplateBankPanel) her bankayı aynı arayüzle gösterir.

import { buildUniqueList, slotFor } from './helpers';
import { make3DDataUrl } from './svg3d';

export const G = (key, text, gen, count = 50, extra = {}) => ({ key, text, gen, count, ...extra });

/**
 * @param {object} cfg
 *  id            : 'concept' | 'bilsem'
 *  title         : panel başlığı
 *  rootFolder    : otomatik klasör kökü
 *  fieldPrefix   : soru belgesindeki alan öneki (concept -> conceptGroupKey, conceptId, conceptTplIdx)
 *  settingsDoc   : settings/<ad> (ses + metin)
 *  mediaPrefix   : settings/<önek><grupKey> (soruya özel görsel + ses)
 *  categories    : [{ id, label, color, concepts: [{ id, label, groups: [G(...)] }] }]
 *  folderPath    : (grupBilgisi) => ['klasör', 'alt klasör', ...]
 *  unique        : true -> şablonlar imzaya (sig) göre tekrarsız üretilir
 *  maxOptions    : en fazla şık sayısı (varsayılan 3 — okul öncesi için 4 şık fazla)
 *  style3d       : true -> SVG görseller 3D / hacimli görünür (svg3d.js)
 *
 * Grup seçenekleri (G(..., extra)):
 *  tagLabel      : şablon etiketinin adı (ör. 'sayı')
 *  tagFolders    : true -> her etiket için otomatik ALT KLASÖR (ör. "sayı 5")
 *  speak         : sesli okunacak metin (varsayılan: soru metni)
 *
 * Şablon alanları (gen(...) dönüşü):
 *  options[j]    : görsel (string) ya da { image, text, tts, audio }  -> tts: şık telefonla okunur
 *  fields        : soru belgesine aynen eklenecek ek alanlar (ör. hikâye: storyId, storyText ...)
 */

// 4 (ya da daha çok) şıklı şablonu 3 şıka indirir:
// doğru şık + öncelik sırasındaki ilk yanlışlar kalır, doğru şıkkın yeri dengeli dağıtılır.
export const limitOptions = (t, max, key, i) => {
  if (!t || !Array.isArray(t.options) || t.options.length <= max || t.correctIndex === undefined || t.correctIndex < 0) return t;
  const correct = t.options[t.correctIndex];
  const wrongs = t.options.filter((_, k) => k !== t.correctIndex).slice(0, max - 1);
  const slot = slotFor(key + '#max' + max, i, max);
  const opts = [...wrongs];
  opts.splice(slot, 0, correct);
  return { ...t, options: opts, correctIndex: slot };
};
export const createBank = (cfg) => {
  const index = {};
  cfg.categories.forEach(cat => cat.concepts.forEach(con => con.groups.forEach(g => {
    index[g.key] = { ...g, conceptId: con.id, conceptLabel: con.label, categoryId: cat.id, categoryLabel: cat.label };
  })));

  const cache = {};
  const getTemplates = (groupKey) => {
    if (cache[groupKey]) return cache[groupKey];
    const g = index[groupKey];
    if (!g) return [];
    let raw;
    try {
      raw = cfg.unique
        ? buildUniqueList(groupKey, g.count, g.gen)
        : Array.from({ length: g.count }, (_, i) => { try { return g.gen(groupKey, i); } catch (e) { console.error('şablon üretilemedi', groupKey, i, e); return null; } });
    } catch (e) { console.error('şablonlar üretilemedi', groupKey, e); raw = []; }
    const list = [];
    const maxOpt = cfg.maxOptions || 3;
    const to3d = (img) => (cfg.style3d && typeof img === 'string' && img ? make3DDataUrl(img) : img);
    raw.forEach((t0, i) => {
      if (!t0) return;
      const t = limitOptions(t0, maxOpt, groupKey, i);
      const text = t.text || g.text;
      // şıklar nesneye çevrilir; slot = şıkkın üretildiği sıradaki yeri (yüklenen şık sesi/görseli buna bağlı kalır)
      let opts = t.options.map((img, k) => (typeof img === 'string' ? { text: '', image: to3d(img), audio: '', slot: k } : { text: '', audio: '', ...img, image: to3d(img.image || ''), slot: k }));
      let correctIndex = t.correctIndex;
      // Doğru şık dengesi: her 3 soruluk blokta doğru cevap A, B, C yerlerine birer kez (karışık sırayla) gelir
      if (cfg.balanceAnswers && correctIndex >= 0 && correctIndex < opts.length && opts.length > 1) {
        const target = slotFor(`${groupKey}#denge`, i, opts.length);
        const correct = opts[correctIndex];
        const rest = opts.filter((_, k) => k !== correctIndex);
        rest.splice(target, 0, correct);
        opts = rest; correctIndex = target;
      }
      list.push({
        id: i + 1,
        groupKey,
        title: `${g.conceptLabel} • ${g.label || g.text} #${i + 1}`,
        text,
        mainImage: to3d(t.mainImage || ''),
        mainImgName: t.mainImgName || '', // toplu görsel yüklemede soru görselinin adı (kodla da eşleşir)
        options: opts,
        correctIndex,
        tag: t.tag || '',
        speak: t.speak || g.speak || '', // sesli okunacak metin (ses yüklenmemişse)
        memory: t.memory || g.memory || null, // { seconds, prompt } -> hafıza sorusu
        fields: t.fields || null, // soru belgesine eklenecek ek alanlar (hikâye vb.)
        // şablon kendi yazı görünürlüğünü belirleyebilir (ders bankaları: yazılı / sesli şık karışımı)
        hideText: t.hideText,
        hideOptionText: t.hideOptionText
      });
    });
    cache[groupKey] = list;
    return list;
  };

  const countGroups = () => Object.keys(index).length;
  const countTemplates = () => Object.values(index).reduce((a, g) => a + g.count, 0);

  return {
    ...cfg,
    index,
    getTemplates,
    countGroups,
    countTemplates,
    folderPath: cfg.folderPath || ((g) => [g.conceptLabel, g.text]),
    // Şablonun klasör yolu: grup "tagFolders" ise her etiket (sayı, harf ...) ayrı alt klasör
    folderFor(g, t) {
      const base = (cfg.folderPath || ((x) => [x.conceptLabel, x.text]))(g);
      if (g.tagFolders && t && t.tag !== undefined && t.tag !== '') return [...base, `${g.tagLabel ? g.tagLabel + ' ' : ''}${t.tag}`];
      return base;
    }
  };
};
