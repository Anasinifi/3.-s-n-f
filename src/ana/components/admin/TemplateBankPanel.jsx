import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, where, doc, getDocsFromServer, getDocFromServer, setDoc, updateDoc, addDoc, serverTimestamp, getCountFromServer, deleteField } from 'firebase/firestore';
import { Loader2, PlusCircle, Music, Image as ImageIcon, Save, Layers, RotateCcw, FolderPlus, CheckCircle2, Brain, Volume2, BookOpen, Type } from 'lucide-react';
import { commitOpsInChunks } from '../../utils/firestoreBatch';
import { MediaUploader } from '../common/MediaUploader';
import { BulkVoiceUploader } from './BulkVoiceUploader';
import { BulkImageUploader } from './BulkImageUploader';

// ============================================================================
// --- GRUP: HAZIR SORU BANKASI PANELİ (Kavram Soruları + BİLSEM Soruları) ---
// ============================================================================
// • Her soru kalıbı (ör. "Hangisi evin yanındadır?") bir gruptur.
// • TOPLU SES: gruba bir kez yüklenir -> o kalıbın TÜM sorularına (kayıtlılar dahil) uygulanır.
// • TEK SORU SESİ: istenen soruya ayrıca ses eklenebilir; o soru toplu ses yerine kendi sesini kullanır.
// • GÖRSEL: her soru ve her şık için AYRI AYRI değiştirilebilir.
//
// Firestore (bank.settingsDoc / bank.mediaPrefix ile):
//   settings/<settingsDoc>              -> { audio: { [grupKey]: url }, text: { [grupKey]: "özel metin" } }
//   settings/<mediaPrefix><grupKey>     -> { images: { [şablonIdx]: { main, o0, o1, o2, o3, audio } } }
//   questions/*                         -> <prefix>GroupKey, <prefix>Id, <prefix>TplIdx alanlarıyla işaretlenir

const CAT_COLORS = {
  sky: 'bg-sky-600', indigo: 'bg-indigo-600', emerald: 'bg-emerald-600', violet: 'bg-violet-600', amber: 'bg-amber-500',
  rose: 'bg-rose-600', pink: 'bg-pink-500', orange: 'bg-orange-500', red: 'bg-red-600', teal: 'bg-teal-600',
  green: 'bg-green-600', fuchsia: 'bg-fuchsia-600', cyan: 'bg-cyan-600', lime: 'bg-lime-600', slate: 'bg-slate-700', purple: 'bg-purple-600'
};

export function TemplateBankPanel({
  bank, db, appId, folders, orderedFolders, qFolderId, setQFolderId, qTimeLimit, setQTimeLimit, isMem, setIsMem, memTime, setMemTime,
  keepSettingsPinned, setKeepSettingsPinned, defaultStyle, setQuestions
}) {
  const CATS = bank.categories;
  const F = {
    group: `${bank.fieldPrefix}GroupKey`,
    id: `${bank.fieldPrefix}Id`,
    tpl: `${bank.fieldPrefix}TplIdx`
  };
  const lsKey = `ca_${bank.id}_auto_folder`;
  const lsTts = `ca_${bank.id}_tts_on`;
  const lsReplay = `ca_${bank.id}_story_replay`;

  const [catId, setCatId] = useState(CATS[0].id);
  const [conceptId, setConceptId] = useState(CATS[0].concepts[0].id);
  const [groupKey, setGroupKey] = useState(CATS[0].concepts[0].groups[0].key);
  const [tplIdx, setTplIdx] = useState(0);
  const [tagFilter, setTagFilter] = useState('');
  const [bankSettings, setBankSettings] = useState({ audio: {}, text: {} });
  const [media, setMedia] = useState({});            // seçili grubun soruya özel görsel/ses değişiklikleri
  const [mediaLoading, setMediaLoading] = useState(false);
  const [savedCounts, setSavedCounts] = useState({});
  const [busy, setBusy] = useState('');
  const [textDraft, setTextDraft] = useState('');
  const localFoldersRef = useRef([]); // anlık yazılan klasörler (snapshot gelmeden tekrar oluşmasın)
  const [autoFolder, setAutoFolder] = useState(() => { try { return localStorage.getItem(lsKey) !== 'false'; } catch (_) { return true; } });
  // Telefonla sesli okuma (ses yüklenmemiş sorularda soru metni okunur) — kayıt sırasında soruya yazılır
  const [ttsOn, setTtsOn] = useState(() => { try { return localStorage.getItem(lsTts) !== 'false'; } catch (_) { return true; } });
  // Hikâye soruları: çocuk soru ekranında hikâyeyi tekrar dinleyebilsin mi?
  const [storyReplay, setStoryReplay] = useState(() => { try { return localStorage.getItem(lsReplay) !== 'false'; } catch (_) { return true; } });

  useEffect(() => { try { localStorage.setItem(lsKey, String(autoFolder)); } catch (_) {} }, [autoFolder]);
  useEffect(() => { try { localStorage.setItem(lsTts, String(ttsOn)); } catch (_) {} }, [ttsOn]);
  useEffect(() => { try { localStorage.setItem(lsReplay, String(storyReplay)); } catch (_) {} }, [storyReplay]);
  // Ekranda yazı: soru yazısı varsayılan GÖRÜNÜR, şık yazısı varsayılan GİZLİ (çocuklar okuma bilmiyor).
  // Kayıttan sonra 'sorular' sekmesinde klasör klasör açılıp kapatılabilir.
  const [showQText, setShowQText] = useState(() => { try { return localStorage.getItem(`${lsReplay}_qtext`) !== 'false'; } catch (_) { return true; } });
  const [showOptText, setShowOptText] = useState(() => { try { return localStorage.getItem(`${lsReplay}_otext`) === 'true'; } catch (_) { return false; } });
  useEffect(() => { try { localStorage.setItem(`${lsReplay}_qtext`, String(showQText)); } catch (_) {} }, [showQText]);
  useEffect(() => { try { localStorage.setItem(`${lsReplay}_otext`, String(showOptText)); } catch (_) {} }, [showOptText]);

  const settingsRef = (name) => doc(db, 'artifacts', appId, 'public', 'data', 'settings', name);
  const qCol = collection(db, 'artifacts', appId, 'public', 'data', 'questions');

  const category = CATS.find(c => c.id === catId) || CATS[0];
  const concept = category.concepts.find(c => c.id === conceptId) || category.concepts[0];
  const group = bank.index[groupKey];
  const templates = useMemo(() => bank.getTemplates(groupKey), [groupKey]);
  const tags = useMemo(() => [...new Set(templates.map(t => t.tag).filter(Boolean))], [templates]);
  const tpl = templates[tplIdx] || templates[0];
  const groupAudio = bankSettings.audio?.[groupKey] || '';
  const groupText = bankSettings.text?.[groupKey] || '';

  // --- Ayarları yükle (ses + özel metinler) ---
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocFromServer(settingsRef(bank.settingsDoc));
        if (snap.exists()) { const d = snap.data(); setBankSettings({ audio: d.audio || {}, text: d.text || {} }); }
      } catch (e) { console.warn('banka ayarları okunamadı', e); }
    })();
  }, [appId, bank.id]);

  // --- Grup değişince soruya özel görsel/ses değişikliklerini ve kayıtlı sayısını yükle ---
  useEffect(() => {
    let alive = true;
    setTplIdx(0);
    setTagFilter('');
    setMediaLoading(true);
    setTextDraft(bankSettings.text?.[groupKey] || '');
    (async () => {
      try {
        const snap = await getDocFromServer(settingsRef(`${bank.mediaPrefix}${groupKey}`));
        if (alive) setMedia(snap.exists() ? (snap.data().images || {}) : {});
      } catch (e) { if (alive) setMedia({}); }
      if (alive) setMediaLoading(false);
      refreshCount(groupKey);
    })();
    return () => { alive = false; };
  }, [groupKey]);

  useEffect(() => { setTextDraft(bankSettings.text?.[groupKey] || ''); }, [bankSettings.text]);

  const refreshCount = async (key) => {
    try {
      const c = await getCountFromServer(query(qCol, where(F.group, '==', key)));
      setSavedCounts(prev => ({ ...prev, [key]: c.data().count }));
    } catch (e) { /* sayım desteklenmiyorsa sessizce geç */ }
  };

  const selectCategory = (cid) => {
    const cat = CATS.find(c => c.id === cid);
    setCatId(cid); setConceptId(cat.concepts[0].id); setGroupKey(cat.concepts[0].groups[0].key);
  };
  const selectConcept = (con) => { setConceptId(con.id); setGroupKey(con.groups[0].key); };

  // --- Bir şablonu soru belgesine dönüştür ---
  // Ses önceliği: soruya özel ses > kalıp (toplu) sesi
  // Şıkları soru belgesine çevir: görsel / şık sesi (yüklenen) / telefonla okunacak şık metni
  // ov anahtarı şıkkın kendi yeri (slot): şıklar dengelemeyle yer değiştirse de yüklenen ses / görsel doğru şıkta kalır
  const buildOptions = (t, ov) => t.options.map((o, j) => ({
    text: o.text || '',
    image: ov[`o${o.slot ?? j}`] || o.image || '',
    audio: ov[`a${o.slot ?? j}`] || o.audio || '',
    ttsText: o.tts || ''
  }));
  const buildPayload = (key, t, idx, overrides, audioUrl, textOverride) => {
    const g = bank.index[key];
    const ov = overrides?.[idx] || {};
    const text = (textOverride || t.text || '').trim();
    const base = {
      name: t.title,
      text,
      image: ov.main || t.mainImage || '',
      options: buildOptions(t, ov),
      correctText: '',
      correctIndex: t.correctIndex,
      audio: ov.audio || audioUrl || '',
      // ses yüklenmemişse bu metin telefonun sesiyle okunur (ttsOn ile açılıp kapatılır)
      ttsText: (textOverride ? '' : t.speak) || text,
      ttsOn: Boolean(ttsOn),
      // soru / şık yazısı ekranda gizli mi (şablon kendisi belirlediyse o geçerli: ders bankaları)
      hideText: typeof t.hideText === 'boolean' ? t.hideText : !showQText,
      hideOptionText: typeof t.hideOptionText === 'boolean' ? t.hideOptionText : !showOptText,
      video: '', preAudio1: '', preAudio2: '', customAttachmentImage: '',
      [F.group]: key,
      [F.id]: g.conceptId,
      [F.tpl]: idx
    };
    // Hafıza soruları: önce resim gösterilir (gözlem), sonra soru sorulur
    if (t.memory) {
      base.text = t.memory.observeText || 'Resme dikkatlice bak!';
      base.memoryText = text;
    }
    // Hikâye / dinleme soruları ve diğer ek alanlar
    if (t.fields) {
      Object.assign(base, t.fields);
      if (t.fields.storyText || t.fields.storyAudio) base.storyReplay = Boolean(storyReplay);
    }
    if (ov.story) base.storyAudio = ov.story; // hikâye sesi (ön ses 2)
    if (ov.storyIntro) base.storyIntroAudio = ov.storyIntro; // hikâye giriş sesi (ön ses 1)
    return base;
  };

  // --- Otomatik klasör: Kök › (bankanın klasör yolu) [› etiket alt klasörü: sayı 5, harf A ...] ---
  // Dönüş: (grupKey, şablon) -> klasör id
  const ensureFolders = async (keys) => {
    if (!autoFolder) return () => qFolderId || null;
    let list = [...(folders || [])];
    localFoldersRef.current.forEach(f => { if (!list.some(x => x.id === f.id)) list.push(f); });
    let changed = false;
    const findOrAdd = (name, parentId) => {
      let f = list.find(x => x.name === name && (x.parentId || null) === (parentId || null));
      if (!f) { f = { id: `folder_${Date.now()}_${Math.floor(Math.random() * 1e6)}`, name, parentId: parentId || null }; list.push(f); changed = true; }
      return f.id;
    };
    const rootId = findOrAdd(bank.rootFolder, null);
    const map = {};
    const pathTo = (names) => { let pid = rootId; names.forEach(name => { pid = findOrAdd(name, pid); }); return pid; };
    keys.forEach(k => {
      const g = bank.index[k];
      map[k] = pathTo(bank.folderPath(g));
      if (g.tagFolders) bank.getTemplates(k).forEach(t => { if (t.tag !== undefined && t.tag !== '') map[`${k}||${t.tag}`] = pathTo(bank.folderFor(g, t)); });
    });
    if (changed) await setDoc(settingsRef('folder_structure'), { list });
    localFoldersRef.current = list;
    return (k, t) => (t && t.tag !== undefined && map[`${k}||${t.tag}`]) || map[k];
  };

  const commonFields = (folderId, t) => ({
    timeLimit: Number(qTimeLimit),
    isMemory: t?.memory ? true : isMem,
    memoryTime: t?.memory ? Number(t.memory.seconds) : Number(memTime),
    folderId: folderId || null,
    // şablonun kendi görünüm ayarı (ör. sahne resmi küçük) varsayılanın üstüne eklenir
    style: t?.fields?.style ? { ...(defaultStyle || {}), ...t.fields.style } : defaultStyle,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  const loadOverrides = async (key) => {
    if (key === groupKey) return media;
    try { const s = await getDocFromServer(settingsRef(`${bank.mediaPrefix}${key}`)); return s.exists() ? (s.data().images || {}) : {}; } catch (_) { return {}; }
  };

  // --- Tek soruyu kaydet ---
  const saveSingle = async () => {
    if (!tpl) return;
    setBusy('tek soru kaydediliyor...');
    try {
      const folderOf = await ensureFolders([groupKey]);
      const folderId = autoFolder ? folderOf(groupKey, tpl) : qFolderId;
      const data = { ...buildPayload(groupKey, tpl, tplIdx, media, groupAudio, groupText), ...commonFields(folderId, tpl) };
      const ref = await addDoc(qCol, data);
      setQuestions(prev => [{ ...data, id: ref.id, createdAt: { seconds: Math.floor(Date.now() / 1000) } }, ...prev]);
      refreshCount(groupKey);
      alert(`"${tpl.title}" kaydedildi.`);
    } catch (e) { console.error(e); alert('kaydedilirken hata oluştu: ' + (e?.message || '')); }
    setBusy('');
  };

  // --- Bir veya birden çok grubu toplu kaydet ---
  const saveGroups = async (keys, note = '') => {
    const total = keys.reduce((a, k) => a + (bank.index[k]?.count || 0), 0);
    const already = keys.reduce((a, k) => a + (savedCounts[k] || 0), 0);
    const target = autoFolder ? `"${bank.rootFolder} › ..." klasörlerine (otomatik)` : `"${(folders || []).find(f => f.id === qFolderId)?.name || 'Havuz (Ana Dizin)'}" klasörüne`;
    let msg = `${total} soru ${target} kaydedilsin mi?\n(${qTimeLimit} sn, ${isMem ? `hafıza ${memTime} sn` : 'daimi göster'}; hafıza sorularında kendi süreleri kullanılır)\nTelefonla sesli okuma: ${ttsOn ? 'AÇIK' : 'KAPALI'} • soru yazısı: ${showQText ? 'görünür' : 'gizli'} • şık yazısı: ${showOptText ? 'görünür' : 'gizli'}${bank.hasStories ? ` • hikâyeyi tekrar dinleme: ${storyReplay ? 'AÇIK' : 'KAPALI'}` : ''}`;
    if (already > 0) msg += `\n\n⚠️ Bu kalıplardan daha önce ${already} soru kaydedilmiş. Tekrar kaydederseniz kopyalar oluşur.`;
    if (note) msg += note;
    if (!window.confirm(msg)) return;
    setBusy(`hazırlanıyor... 0/${total}`);
    try {
      const folderOf = await ensureFolders(keys);
      const ops = []; const created = [];
      for (const k of keys) {
        const list = bank.getTemplates(k);
        const ov = await loadOverrides(k);
        const audioUrl = bankSettings.audio?.[k] || '';
        const textOv = bankSettings.text?.[k] || '';
        list.forEach((t, idx) => {
          const ref = doc(qCol);
          const data = { ...buildPayload(k, t, idx, ov, audioUrl, textOv), ...commonFields(autoFolder ? folderOf(k, t) : qFolderId, t) };
          ops.push({ type: 'set', ref, data });
          created.push({ ...data, id: ref.id, createdAt: { seconds: Math.floor(Date.now() / 1000) } });
        });
      }
      const res = await commitOpsInChunks(db, ops, { onProgress: (d, t) => setBusy(`kaydediliyor... ${d}/${t}`) });
      setQuestions(prev => [...created, ...prev]);
      keys.forEach(k => refreshCount(k));
      alert(`${res.written} soru kaydedildi.${res.skipped.length ? `\n${res.skipped.length} soru boyut sınırı nedeniyle atlandı.` : ''}`);
    } catch (e) { console.error(e); alert('toplu kayıt sırasında hata oluştu: ' + (e?.message || '')); }
    setBusy('');
  };

  // --- BANKANIN TAMAMINI TEK SEFERDE KAYDET (ör. İngilizce'nin 1000 sorusu) ---
  // Daha önce kaydedilmiş kalıplar atlanır (kopya oluşmaz); yarıda kalırsa tekrar basmak kalanları kaydeder.
  const saveWholeBank = async () => {
    const allKeys = Object.keys(bank.index);
    setBusy('kayıtlı sorular kontrol ediliyor...');
    const counts = {};
    try {
      for (let i = 0; i < allKeys.length; i += 15) {
        const part = allKeys.slice(i, i + 15);
        const res = await Promise.all(part.map(k => getCountFromServer(query(qCol, where(F.group, '==', k))).then(c => c.data().count).catch(() => 0)));
        part.forEach((k, j) => { counts[k] = res[j]; });
        setBusy(`kayıtlı sorular kontrol ediliyor... ${Math.min(i + 15, allKeys.length)}/${allKeys.length}`);
      }
    } catch (e) { console.warn(e); }
    setSavedCounts(prev => ({ ...prev, ...counts }));
    setBusy('');
    const todo = allKeys.filter(k => !(counts[k] > 0));
    const skippedGroups = allKeys.length - todo.length;
    if (todo.length === 0) { alert('Bu bankanın bütün kalıpları daha önce kaydedilmiş. Yeni soru eklenmedi.'); return; }
    await saveGroups(todo, skippedGroups ? `\n\n(${skippedGroups} kalıp daha önce kaydedildiği için atlanacak.)` : '');
  };

  // --- Kayıtlı sorulardaki ilgili alanları güncelle ---
  const updateSavedQuestions = async (key, buildPatch, filterFn) => {
    const snap = await getDocsFromServer(query(qCol, where(F.group, '==', key)));
    const docs = snap.docs.filter(d => !filterFn || filterFn(d.data()));
    if (docs.length === 0) return 0;
    const ops = docs.map(d => ({ type: 'update', ref: d.ref, data: { ...buildPatch(d.data()), updatedAt: serverTimestamp() } }));
    await commitOpsInChunks(db, ops, { onProgress: (a, b) => setBusy(`kayıtlı sorular güncelleniyor... ${a}/${b}`) });
    const patches = new Map(docs.map(d => [d.id, buildPatch(d.data())]));
    setQuestions(prev => prev.map(q => patches.has(q.id) ? { ...q, ...patches.get(q.id) } : q));
    return docs.length;
  };

  // --- TOPLU SES: tüm kalıba uygula (kendi sesi olan sorulara dokunmaz) ---
  const handleGroupAudio = async (url) => {
    setBusy('ses kaydediliyor...');
    try {
      if (url) await setDoc(settingsRef(bank.settingsDoc), { audio: { [groupKey]: url } }, { merge: true });
      else await updateDoc(settingsRef(bank.settingsDoc), { [`audio.${groupKey}`]: deleteField() }).catch(() => {});
      setBankSettings(prev => { const audio = { ...(prev.audio || {}) }; if (url) audio[groupKey] = url; else delete audio[groupKey]; return { ...prev, audio }; });
      const n = await updateSavedQuestions(groupKey, () => ({ audio: url || '' }), (d) => !media[d[F.tpl]]?.audio);
      if (n > 0) alert(`ses "${group.text}" kalıbındaki kayıtlı ${n} soruya da ${url ? 'eklendi' : 'kaldırıldı'}. (Kendi sesi olan sorular değişmedi.)`);
    } catch (e) { console.error(e); alert('ses kaydedilemedi: ' + (e?.message || '')); }
    setBusy('');
  };

  // --- ÜST KLASÖR (KONU) SESİ: konudaki TÜM kalıplara aynı ses ---
  const handleConceptAudio = async (url) => {
    const keys = concept.groups.map(g => g.key);
    if (!window.confirm(`Bu ses "${concept.label}" konusundaki ${keys.length} kalıbın hepsine (kayıtlı sorular dahil) ${url ? 'eklenecek' : 'kaldırılacak'}. Kalıpların kendi toplu sesleri varsa onların yerine geçer. Devam edilsin mi?`)) return;
    setBusy('konu sesi kaydediliyor...');
    try {
      if (url) await setDoc(settingsRef(bank.settingsDoc), { audio: Object.fromEntries(keys.map(k => [k, url])) }, { merge: true });
      else await updateDoc(settingsRef(bank.settingsDoc), Object.fromEntries(keys.map(k => [`audio.${k}`, deleteField()]))).catch(() => {});
      setBankSettings(prev => { const audio = { ...(prev.audio || {}) }; keys.forEach(k => { if (url) audio[k] = url; else delete audio[k]; }); return { ...prev, audio }; });
      let n = 0;
      for (const k of keys) {
        const ov = await loadOverrides(k);
        n += await updateSavedQuestions(k, () => ({ audio: url || '' }), (d) => !ov[d[F.tpl]]?.audio);
      }
      alert(`konu sesi ${url ? 'eklendi' : 'kaldırıldı'}.${n ? ` Kayıtlı ${n} soru da güncellendi.` : ''}`);
    } catch (e) { console.error(e); alert('konu sesi kaydedilemedi: ' + (e?.message || '')); }
    setBusy('');
  };

  // --- KALIP METNİ (isteğe bağlı) ---
  const handleGroupText = async () => {
    const val = textDraft.trim();
    setBusy('metin kaydediliyor...');
    try {
      await setDoc(settingsRef(bank.settingsDoc), { text: { [groupKey]: val } }, { merge: true });
      setBankSettings(prev => ({ ...prev, text: { ...(prev.text || {}), [groupKey]: val } }));
      const n = await updateSavedQuestions(groupKey, (d) => (d.memoryText !== undefined ? { memoryText: val || group.text, ttsText: val || group.text } : { text: val || group.text, ttsText: val || group.text }));
      alert(`soru metni kaydedildi.${n ? ` Kayıtlı ${n} soru da güncellendi.` : ''}`);
    } catch (e) { console.error(e); alert('metin kaydedilemedi'); }
    setBusy('');
  };

  // --- SORUYA ÖZEL GÖRSEL / SES: bir kalıptaki şablonlara değişiklikleri uygula ---
  // changes: [{ idx, slot, url }]  slot: audio | story | storyIntro | main | o0..o3 | a0..a3
  // Kayıtlı sorularda SADECE değişen alanlar güncellenir (elle yapılmış başka düzenlemeler korunur).
  // verifyDoc(d, slots): kayıtlı soru şablonla aynı mı? (değilse o soruya dokunulmaz)
  const applyMediaChanges = async (key, changes, verifyDoc) => {
    if (!changes.length) return 0;
    const cur = key === groupKey ? media : await loadOverrides(key);
    const next = { ...cur };
    const slotsByIdx = new Map();
    changes.forEach(({ idx, slot, url }) => {
      next[idx] = { ...(next[idx] || {}) };
      if (url) next[idx][slot] = url; else delete next[idx][slot];
      if (Object.keys(next[idx]).length === 0) delete next[idx];
      if (!slotsByIdx.has(idx)) slotsByIdx.set(idx, new Set());
      slotsByIdx.get(idx).add(slot);
    });
    await setDoc(settingsRef(`${bank.mediaPrefix}${key}`), { images: next });
    if (key === groupKey) setMedia(next);
    const tpls = bank.getTemplates(key);
    const gAudio = bankSettings.audio?.[key] || '';
    return updateSavedQuestions(key, (d) => {
      const i = d[F.tpl]; const slots = slotsByIdx.get(i) || new Set(); const ov = next[i] || {}; const t = tpls[i];
      const patch = {};
      if (slots.has('audio')) patch.audio = ov.audio || gAudio || '';
      if (slots.has('story')) patch.storyAudio = ov.story || '';
      if (slots.has('storyIntro')) patch.storyIntroAudio = ov.storyIntro || '';
      if ([...slots].some(s => s === 'main' || /^[oa]\d$/.test(s)) && t) {
        patch.image = ov.main || t.mainImage || '';
        patch.options = buildOptions(t, ov);
        patch.correctIndex = t.correctIndex;
      }
      return patch;
    }, (d) => slotsByIdx.has(d[F.tpl]) && (!verifyDoc || verifyDoc(d, slotsByIdx.get(d[F.tpl]))));
  };

  // TOPLU SES (birden çok kalıba birden): entries = [{ key, url }] • kendi sesi olan sorulara dokunmaz
  const applyGroupAudios = async (entries, verifyDoc) => {
    if (!entries.length) return 0;
    await setDoc(settingsRef(bank.settingsDoc), { audio: Object.fromEntries(entries.map(e => [e.key, e.url])) }, { merge: true });
    setBankSettings(prev => ({ ...prev, audio: { ...(prev.audio || {}), ...Object.fromEntries(entries.map(e => [e.key, e.url])) } }));
    let n = 0;
    for (const { key, url } of entries) {
      const ov = await loadOverrides(key);
      n += await updateSavedQuestions(key, () => ({ audio: url }), (d) => !ov[d[F.tpl]]?.audio && (!verifyDoc || verifyDoc(d, new Set(['audio']))));
    }
    return n;
  };

  // Hikâye sesi: aynı hikâyenin bütün sorularına • giriş sesi: kalıptaki aynı giriş cümlesine sahip bütün sorulara
  const storyScope = (slot, idx) => {
    const t = templates[idx];
    if (slot === 'story' && t?.fields?.storyId) return templates.map((x, i) => (x.fields?.storyId === t.fields.storyId ? i : -1)).filter(i => i >= 0);
    if (slot === 'storyIntro' && t?.fields?.storyIntro) return templates.map((x, i) => (x.fields?.storyIntro === t.fields.storyIntro ? i : -1)).filter(i => i >= 0);
    return [idx];
  };

  const handleMedia = async (slot, url) => {
    setBusy(slot === 'audio' || slot === 'story' || slot === 'storyIntro' || /^a\d$/.test(slot) ? 'ses kaydediliyor...' : 'görsel kaydediliyor...');
    try {
      const idxs = storyScope(slot, tplIdx);
      await applyMediaChanges(groupKey, idxs.map(idx => ({ idx, slot, url })));
    } catch (e) { console.error(e); alert('kaydedilemedi: ' + (e?.message || '')); }
    setBusy('');
  };

  const ov = media[tplIdx] || {};
  const conceptTotal = concept.groups.reduce((a, g) => a + g.count, 0);
  const categoryTotal = category.concepts.reduce((a, c) => a + c.groups.reduce((x, g) => x + g.count, 0), 0);
  const visibleIdx = templates.map((t, i) => i).filter(i => !tagFilter || templates[i].tag === tagFilter);
  const ownAudioCount = Object.values(media).filter(m => m?.audio).length;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-indigo-50 shadow-lg space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2"><Layers size={16} /> {bank.title}</h4>
        <span className="text-[10px] font-black text-slate-400 uppercase">{bank.countGroups()} soru kalıbı • {bank.countTemplates()} hazır soru</span>
      </div>
      {bank.intro && <p className="text-[11px] font-bold text-slate-500 leading-snug -mt-2">{bank.intro}</p>}

      {/* AYARLAR */}
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 items-center">
        <button type="button" onClick={() => setAutoFolder(!autoFolder)} className={`px-3 py-2 rounded-xl text-[10px] font-black border flex items-center gap-1.5 ${autoFolder ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-500'}`} title={`Açıkken sorular '${bank.rootFolder} › ...' klasörlerine otomatik yerleşir`}>
          <FolderPlus size={14} /> otomatik klasör {autoFolder ? '(açık)' : '(kapalı)'}
        </button>
        {!autoFolder && (
          <select value={qFolderId} onChange={e => setQFolderId(e.target.value)} className="p-2 border-2 rounded-xl font-bold outline-none text-xs max-w-[220px]">
            <option value="">havuz (ana dizin)</option>
            {orderedFolders.map(f => <option key={f.id} value={f.id}>{f.displayName}</option>)}
          </select>
        )}
        <button type="button" onClick={() => setTtsOn(!ttsOn)} className={`px-3 py-2 rounded-xl text-[10px] font-black border flex items-center gap-1.5 ${ttsOn ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-slate-500'}`} title="Açıkken kaydedilen sorular (ses yüklenmemişse) telefonun Türkçe sesiyle okunur. Kayıttan sonra da 'sorular' sekmesinden toplu açıp kapatabilirsiniz.">
          <Volume2 size={14} /> telefonla oku {ttsOn ? '(açık)' : '(kapalı)'}
        </button>
        <button type="button" onClick={() => setShowQText(!showQText)} className={`px-3 py-2 rounded-xl text-[10px] font-black border flex items-center gap-1.5 ${showQText ? 'bg-violet-600 text-white border-violet-700' : 'bg-white text-slate-500'}`} title="Kaydedilen sorularda soru yazısı ekranda görünsün mü? Ses / telefonla okuma bundan etkilenmez.">
          <Type size={14} /> soru yazısı {showQText ? '(görünür)' : '(gizli)'}
        </button>
        <button type="button" onClick={() => setShowOptText(!showOptText)} className={`px-3 py-2 rounded-xl text-[10px] font-black border flex items-center gap-1.5 ${showOptText ? 'bg-violet-600 text-white border-violet-700' : 'bg-white text-slate-500'}`} title="Kaydedilen sorularda şıkların altında yazı görünsün mü? Gizliyken resmi olmayan şık 'sesi dinle' düğmesiyle sesli okunur.">
          <Type size={14} /> şık yazısı {showOptText ? '(görünür)' : '(gizli)'}
        </button>
        {bank.hasStories && (
          <button type="button" onClick={() => setStoryReplay(!storyReplay)} className={`px-3 py-2 rounded-xl text-[10px] font-black border flex items-center gap-1.5 ${storyReplay ? 'bg-sky-600 text-white border-sky-700' : 'bg-white text-slate-500'}`} title="Açıkken çocuk soru ekranında 'hikâyeyi tekrar dinle' düğmesini görür.">
            <BookOpen size={14} /> hikâyeyi tekrar dinleme {storyReplay ? '(açık)' : '(kapalı)'}
          </button>
        )}
        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-500">süre (sn):</label><input type="number" className="w-16 p-2 rounded-lg border font-bold text-center" value={qTimeLimit} onChange={e => setQTimeLimit(e.target.value)} /></div>
        <button type="button" onClick={() => setIsMem(!isMem)} className={`px-3 py-2 rounded-lg text-[10px] font-bold border ${isMem ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>{isMem ? 'hafıza modu açık' : 'hafıza modu kapalı'}</button>
        {isMem && <input type="number" className="w-16 p-2 rounded-lg border font-bold text-center" value={memTime} onChange={e => setMemTime(e.target.value)} />}
        <button type="button" onClick={() => setKeepSettingsPinned(!keepSettingsPinned)} className={`ml-auto px-3 py-2 rounded-xl text-xs font-black border ${keepSettingsPinned ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-500'}`}>📌 ayarları sabitle {keepSettingsPinned ? '(aktif)' : '(kapalı)'}</button>
      </div>

      {/* DOSYA ADIYLA TOPLU SES */}
      <BulkVoiceUploader
        bank={bank} categoryLabel={category.label} categoryKeys={category.concepts.flatMap(c => c.groups.map(g => g.key))}
        groupField={F.group} tplField={F.tpl} textOverrides={bankSettings.text} groupAudios={bankSettings.audio}
        loadOverrides={loadOverrides} applyMediaChanges={applyMediaChanges} applyGroupAudios={applyGroupAudios}
        busy={busy} setBusy={setBusy}
      />

      {/* DOSYA ADIYLA TOPLU GÖRSEL (şık metni) */}
      <BulkImageUploader
        bank={bank} category={category} concept={concept} groupKey={groupKey}
        groupField={F.group} tplField={F.tpl}
        loadOverrides={loadOverrides} applyMediaChanges={applyMediaChanges}
        busy={busy} setBusy={setBusy}
      />

      {/* KATEGORİLER */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {CATS.map(c => (
          <button key={c.id} type="button" onClick={() => selectCategory(c.id)} className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all ${catId === c.id ? `${CAT_COLORS[c.color] || 'bg-indigo-600'} text-white shadow` : 'bg-white/70 text-slate-600 hover:bg-slate-200'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* KAVRAMLAR / SEVİYELER */}
      <div className="flex flex-wrap gap-1.5">
        {category.concepts.map(con => (
          <button key={con.id} type="button" onClick={() => selectConcept(con)} className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${concept.id === con.id ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            {con.label} <span className="opacity-60 text-[10px]">({con.groups.reduce((a, g) => a + g.count, 0)})</span>
          </button>
        ))}
      </div>

      {/* SORU KALIPLARI (GRUPLAR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {concept.groups.map(g => {
          const hasAudio = Boolean(bankSettings.audio?.[g.key]);
          const saved = savedCounts[g.key];
          return (
            <button key={g.key} type="button" onClick={() => setGroupKey(g.key)} className={`text-left p-3 rounded-2xl border-2 transition-all ${groupKey === g.key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
              {g.label && <div className="text-[10px] font-black text-indigo-500 uppercase">{g.label}</div>}
              <div className="font-black text-sm text-slate-800">{bankSettings.text?.[g.key] || g.text}</div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{g.count} soru</span>
                {g.memory && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 flex items-center gap-0.5"><Brain size={10} /> hafıza {g.memory.seconds} sn</span>}
                {g.tagFolders && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-0.5"><FolderPlus size={10} /> her {g.tagLabel || 'etiket'} ayrı klasör</span>}
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${hasAudio ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-700'}`}><Music size={10} /> {hasAudio ? 'ses var' : 'ses yok'}</span>
                {saved > 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">{saved} kayıtlı</span>}
              </div>
            </button>
          );
        })}
      </div>

      {group && tpl && (
        <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 space-y-4">
          {/* ÜST KLASÖR (KONU) SESİ */}
          {concept.groups.length > 1 && (
            <div className="bg-white p-3 rounded-2xl border border-violet-200 space-y-1">
              <MediaUploader label={`🔊 konu sesi (üst klasör) → "${concept.label}" içindeki ${concept.groups.length} kalıbın hepsine`} value="" onChange={handleConceptAudio} type="audio" id={`${bank.id}-caud-${concept.id}`} />
              <p className="text-[9px] text-slate-400 font-bold leading-tight">Aynı sesi konudaki tüm kalıplara (alt klasörlere) tek seferde ekler. Her kalıba ayrı ses için aşağıdaki "toplu ses" alanını kullanın.</p>
            </div>
          )}
          {/* TOPLU SES VE METİN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-2xl border space-y-1">
              <MediaUploader label={`🔊 toplu ses → "${group.text}" (${group.count} sorunun hepsine)`} value={groupAudio} onChange={handleGroupAudio} type="audio" id={`${bank.id}-aud-${groupKey}`} />
              <p className="text-[9px] text-slate-400 font-bold leading-tight">Toplu ses bu kalıbın tüm sorularına (kayıtlı olanlar dahil) eklenir. Kendi sesi olan sorular kendi seslerini korur.{ownAudioCount > 0 ? ` Bu kalıpta ${ownAudioCount} sorunun kendi sesi var.` : ''}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">soru metni (isteğe bağlı, tüm kalıba)</label>
              <input value={textDraft} onChange={e => setTextDraft(e.target.value)} placeholder={group.text} className="w-full p-2.5 border-2 rounded-xl font-bold text-sm outline-none focus:border-indigo-500" />
              <button type="button" disabled={!!busy || textDraft.trim() === groupText} onClick={handleGroupText} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black disabled:opacity-40">metni kaydet</button>
            </div>
          </div>

          {/* ETİKET FİLTRESİ (ör. sayı) */}
          {tags.length > 1 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase mr-1">{group.tagLabel || 'filtre'}:</span>
              <button type="button" onClick={() => setTagFilter('')} className={`px-2 py-1 rounded-lg text-[10px] font-black border ${!tagFilter ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>hepsi</button>
              {tags.map(tg => (
                <button key={tg} type="button" onClick={() => { setTagFilter(tg); const first = templates.findIndex(t => t.tag === tg); if (first >= 0) setTplIdx(first); }} className={`min-w-[28px] px-2 py-1 rounded-lg text-[10px] font-black border ${tagFilter === tg ? 'bg-violet-600 text-white border-violet-700' : 'bg-white text-slate-600 hover:bg-violet-50'}`}>{tg}</button>
              ))}
            </div>
          )}

          {/* ŞABLON NUMARALARI */}
          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
            {visibleIdx.map(idx => (
              <button key={idx} type="button" onClick={() => setTplIdx(idx)} title={templates[idx].tag ? `${group.tagLabel || ''} ${templates[idx].tag}` : ''} className={`relative w-10 h-7 rounded-lg text-[10px] font-black border transition-all ${tplIdx === idx ? 'bg-indigo-600 text-white border-indigo-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-indigo-50'}`}>
                {idx + 1}
                {media[idx] && (media[idx].main || media[idx].o0 || media[idx].o1 || media[idx].o2 || media[idx].o3 || media[idx].a0 || media[idx].a1 || media[idx].a2 || media[idx].a3 || media[idx].story || media[idx].storyIntro) && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 border border-white" title="özel görsel var" />}
                {media[idx]?.audio && <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 border border-white" title="kendi sesi var" />}
              </button>
            ))}
          </div>

          {/* ÖNİZLEME + SORUYA ÖZEL GÖRSEL / SES */}
          <div className="bg-white p-4 rounded-2xl border space-y-3 relative">
            {mediaLoading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-10"><Loader2 className="animate-spin text-indigo-500" /></div>}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-600">#{tplIdx + 1} • {groupText || tpl.text}{tpl.tag ? ` • ${group.tagLabel || ''} ${tpl.tag}` : ''}</span>
              <span className="text-[9px] font-bold text-pink-600 flex items-center gap-1"><ImageIcon size={12} /> buradan yüklenen görsel/ses SADECE bu soruya uygulanır</span>
            </div>
            {tpl.memory && (
              <div className="text-[10px] font-black text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                <Brain size={12} /> hafıza sorusu: üstteki resim {tpl.memory.seconds} sn gösterilir, sonra gizlenir ve soru sorulur.
              </div>
            )}

            {/* tek soru sesi */}
            <div className="bg-green-50/60 border border-green-200 rounded-2xl p-2.5 space-y-1">
              <MediaUploader small label={ov.audio ? '🔊 bu sorunun kendi sesi' : '🔊 bu soruya ayrı ses ekle (isteğe bağlı)'} value={ov.audio || ''} onChange={(url) => handleMedia('audio', url)} type="audio" id={`${bank.id}-qaud-${groupKey}-${tplIdx}`} />
              <p className="text-[9px] font-bold text-green-700 leading-tight">{ov.audio ? 'Bu soru toplu ses yerine kendi sesini kullanır. Silersen toplu sese döner.' : groupAudio ? 'Şu an bu soruda toplu ses çalar.' : 'Bu kalıpta henüz toplu ses yok.'}</p>
            </div>

            {(tpl.fields?.storyText || tpl.fields?.storyId) && (
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-2.5 space-y-1.5">
                <div className="text-[10px] font-black text-sky-800 uppercase flex items-center gap-1"><BookOpen size={12} /> {tpl.fields.storyTitle || 'hikâye'} {tpl.fields.storyPart ? `• ${tpl.fields.storyPart}. soru / ${tpl.fields.storyTotal}` : ''}</div>
                {tpl.fields.storyIntro && (
                  <div className="bg-white rounded-xl border border-sky-100 p-2 space-y-1">
                    <div className="text-[9px] font-black text-sky-700 uppercase">ön ses 1 • giriş</div>
                    <p className="text-[11px] font-bold text-slate-600 leading-snug">{tpl.fields.storyIntro}</p>
                    <MediaUploader small label={ov.storyIntro ? '🔊 giriş sesi (yüklendi)' : '🔊 giriş sesini yükle (isteğe bağlı)'} value={ov.storyIntro || ''} onChange={(url) => handleMedia('storyIntro', url)} type="audio" id={`${bank.id}-sintro-${groupKey}-${tplIdx}`} />
                    <p className="text-[9px] font-bold text-sky-600 leading-tight">Giriş cümlesi bu kalıptaki bütün hikâyelerde aynı: bir kez yükleyin, hepsine uygulanır.</p>
                  </div>
                )}
                <div className="bg-white rounded-xl border border-sky-100 p-2 space-y-1">
                  <div className="text-[9px] font-black text-sky-700 uppercase">ön ses 2 • hikâye</div>
                  {tpl.fields.storyText && <p className="text-[11px] font-bold text-slate-600 leading-snug max-h-40 overflow-y-auto">{String(tpl.fields.storyText).replace(/\s*\|\|\s*/g, ' ')}</p>}
                  <MediaUploader small label={ov.story ? '📖 hikâye sesi (yüklendi)' : '📖 hikâyeyi kendi sesinle yükle (isteğe bağlı)'} value={ov.story || ''} onChange={(url) => handleMedia('story', url)} type="audio" id={`${bank.id}-story-${groupKey}-${tplIdx}`} />
                  <p className="text-[9px] font-bold text-sky-600 leading-tight">Bir kez yükleyin: bu hikâyenin bütün sorularına uygulanır.</p>
                </div>
                <p className="text-[9px] font-bold text-sky-700 leading-tight">Ses yüklenmezse telefonun sesiyle okunur. Çocuk önce girişi, sonra hikâyeyi dinler. "Hikâyeyi tekrar dinle" sadece hikâyeyi çalar.</p>
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              {(ov.main || tpl.mainImage) && <img src={ov.main || tpl.mainImage} className="max-h-48 max-w-full object-contain border rounded-2xl p-1" alt="üst görsel" />}
              <div className="w-full max-w-xs">
                <MediaUploader small label={tpl.mainImage ? 'üst görseli değiştir' : 'üst görsel ekle (isteğe bağlı)'} value={ov.main || ''} onChange={(url) => handleMedia('main', url)} id={`${bank.id}-main-${groupKey}-${tplIdx}`} />
              </div>
            </div>

            <div className={`grid gap-2 sm:gap-3 ${tpl.options.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
              {tpl.options.map((opt, j) => {
                const sl = opt.slot ?? j; // şıkkın kendi yeri: yüklenen ses/görsel buna bağlı
                const img = ov[`o${sl}`] || opt.image;
                const isCorrect = j === tpl.correctIndex;
                return (
                  <div key={j} className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1.5 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
                    {img && <img src={img} className="w-full max-w-[150px] aspect-square object-contain" alt={`şık ${j + 1}`} />}
                    {opt.text && <span className="font-black text-lg text-center leading-tight">{opt.text}</span>}
                    {opt.tts && opt.tts !== opt.text && <span className="text-[10px] font-bold text-orange-700 text-center leading-tight">🔊 "{opt.tts}"</span>}
                    <span className={`text-[9px] font-black uppercase ${isCorrect ? 'text-green-700' : 'text-slate-500'}`}>{isCorrect ? '✓ doğru cevap' : `şık ${j + 1}`}</span>
                    <MediaUploader small label="görseli değiştir" value={ov[`o${sl}`] || ''} onChange={(url) => handleMedia(`o${sl}`, url)} id={`${bank.id}-o${j}-${groupKey}-${tplIdx}`} />
                    <MediaUploader small type="audio" label={ov[`a${sl}`] ? 'şık sesi (yüklendi)' : opt.tts ? 'şık sesi yükle (yoksa telefon okur)' : 'şık sesi yükle'} value={ov[`a${sl}`] || ''} onChange={(url) => handleMedia(`a${sl}`, url)} id={`${bank.id}-a${j}-${groupKey}-${tplIdx}`} />
                    {ov[`o${sl}`] && (
                      <button type="button" onClick={() => handleMedia(`o${sl}`, '')} className="text-[9px] font-black text-slate-500 flex items-center gap-1 hover:text-red-500"><RotateCcw size={10} /> hazır görsele dön</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* KAYDETME */}
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!!busy} onClick={saveSingle} className="flex-1 min-w-[160px] py-3 rounded-2xl bg-white border-2 border-indigo-600 text-indigo-700 font-black text-xs flex items-center justify-center gap-1.5 disabled:opacity-50">
              <PlusCircle size={16} /> bu soruyu kaydet (#{tplIdx + 1})
            </button>
            <button type="button" disabled={!!busy} onClick={() => saveGroups([groupKey])} className="flex-1 min-w-[160px] py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow disabled:opacity-50">
              <Save size={16} /> bu kalıbın {group.count} sorusunu kaydet
            </button>
            {concept.groups.length > 1 && (
              <button type="button" disabled={!!busy} onClick={() => saveGroups(concept.groups.map(g => g.key))} className="flex-1 min-w-[160px] py-3 rounded-2xl bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow disabled:opacity-50">
                <Layers size={16} /> "{concept.label}" tümü ({conceptTotal} soru)
              </button>
            )}
            <button type="button" disabled={!!busy} onClick={() => saveGroups(category.concepts.flatMap(c => c.groups.map(g => g.key)))} className="flex-1 min-w-[160px] py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow disabled:opacity-50">
              <CheckCircle2 size={16} /> "{category.label}" kategorisi ({categoryTotal} soru)
            </button>
            <button type="button" disabled={!!busy} onClick={saveWholeBank} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50">
              <Layers size={18} /> TÜMÜNÜ KAYDET: {bank.title} — bütün konular ({bank.countTemplates()} soru)
            </button>
          </div>
          {busy && <div className="flex items-center gap-2 text-xs font-black text-indigo-600"><Loader2 size={14} className="animate-spin" /> {busy}</div>}
        </div>
      )}
    </div>
  );
}
