import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, where, doc, getDocsFromServer, getDocFromServer, setDoc, updateDoc, addDoc, serverTimestamp, getCountFromServer, deleteField } from 'firebase/firestore';
import { Loader2, PlusCircle, Music, Image as ImageIcon, Save, Layers, RotateCcw, FolderPlus, CheckCircle2 } from 'lucide-react';
import { CONCEPT_CATEGORIES, CONCEPT_GROUP_INDEX, getConceptTemplates, countConceptTemplates, countConceptGroups } from '../../activities/concepts';
import { findQuestionsByField, planOverwrite, removeIdsFromAllTests, mergeQuestionState, stripIdsFromTestState } from '../../utils/overwriteSave';
import { commitOpsInChunks } from '../../utils/firestoreBatch';
import { MediaUploader } from '../common/MediaUploader';

// ============================================================================
// --- GRUP: KAVRAM SORULARI PANELİ (EK-7 KAVRAM LİSTESİ) ---
// ============================================================================
// • Her soru kalıbı (ör. "Hangisi kapalıdır?") bir gruptur: 50 hazır soru.
// • SES: gruba bir kez yüklenir -> o kalıbın TÜM sorularına (kayıtlılar dahil) uygulanır.
//   Ses sadece kavram sorularına uygulanır, diğer şablonlara dokunmaz.
// • GÖRSEL: her soru ve her şık için AYRI AYRI değiştirilebilir (diğer sorulara yapışmaz).
//
// Firestore:
//   settings/concept_settings          -> { audio: { [grupKey]: url }, text: { [grupKey]: "özel metin" } }
//   settings/concept_media_<grupKey>   -> { images: { [şablonIdx]: { main, o0, o1, o2 } } }
//   questions/*                        -> conceptGroupKey, conceptId, conceptTplIdx alanlarıyla işaretlenir

const CAT_COLORS = {
  sky: 'bg-sky-600', indigo: 'bg-indigo-600', emerald: 'bg-emerald-600', violet: 'bg-violet-600', amber: 'bg-amber-500',
  rose: 'bg-rose-600', pink: 'bg-pink-500', orange: 'bg-orange-500', red: 'bg-red-600', teal: 'bg-teal-600'
};
const ROOT_FOLDER_NAME = 'Kavram Soruları';

export function ConceptQuestionsPanel({
  db, appId, folders, orderedFolders, qFolderId, setQFolderId, qTimeLimit, setQTimeLimit, isMem, setIsMem, memTime, setMemTime,
  keepSettingsPinned, setKeepSettingsPinned, defaultStyle, setQuestions, setTests
}) {
  const [catId, setCatId] = useState(CONCEPT_CATEGORIES[0].id);
  const [conceptId, setConceptId] = useState(CONCEPT_CATEGORIES[0].concepts[0].id);
  const [groupKey, setGroupKey] = useState(CONCEPT_CATEGORIES[0].concepts[0].groups[0].key);
  const [tplIdx, setTplIdx] = useState(0);
  const [conceptSettings, setConceptSettings] = useState({ audio: {}, text: {} });
  const [media, setMedia] = useState({});            // seçili grubun görsel değişiklikleri
  const [mediaLoading, setMediaLoading] = useState(false);
  const [savedCounts, setSavedCounts] = useState({});
  const [busy, setBusy] = useState('');
  const [textDraft, setTextDraft] = useState('');
  const localFoldersRef = useRef([]); // anlık yazılan klasörler (snapshot gelmeden tekrar oluşmasın)
  const [autoFolder, setAutoFolder] = useState(() => localStorage.getItem('ca_concept_auto_folder') !== 'false');

  useEffect(() => { try { localStorage.setItem('ca_concept_auto_folder', String(autoFolder)); } catch (_) {} }, [autoFolder]);

  const settingsRef = (name) => doc(db, 'artifacts', appId, 'public', 'data', 'settings', name);
  const qCol = collection(db, 'artifacts', appId, 'public', 'data', 'questions');

  const category = CONCEPT_CATEGORIES.find(c => c.id === catId) || CONCEPT_CATEGORIES[0];
  const concept = category.concepts.find(c => c.id === conceptId) || category.concepts[0];
  const group = CONCEPT_GROUP_INDEX[groupKey];
  const templates = useMemo(() => getConceptTemplates(groupKey), [groupKey]);
  const tpl = templates[tplIdx] || templates[0];
  const groupAudio = conceptSettings.audio?.[groupKey] || '';
  const groupText = conceptSettings.text?.[groupKey] || '';

  // --- Ayarları yükle (ses + özel metinler) ---
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocFromServer(settingsRef('concept_settings'));
        if (snap.exists()) { const d = snap.data(); setConceptSettings({ audio: d.audio || {}, text: d.text || {} }); }
      } catch (e) { console.warn('kavram ayarları okunamadı', e); }
    })();
  }, [appId]);

  // --- Grup değişince görsel değişikliklerini ve kayıtlı sayısını yükle ---
  useEffect(() => {
    let alive = true;
    setTplIdx(0);
    setMediaLoading(true);
    setTextDraft(conceptSettings.text?.[groupKey] || '');
    (async () => {
      try {
        const snap = await getDocFromServer(settingsRef(`concept_media_${groupKey}`));
        if (alive) setMedia(snap.exists() ? (snap.data().images || {}) : {});
      } catch (e) { if (alive) setMedia({}); }
      if (alive) setMediaLoading(false);
      refreshCount(groupKey);
    })();
    return () => { alive = false; };
  }, [groupKey]);

  useEffect(() => { setTextDraft(conceptSettings.text?.[groupKey] || ''); }, [conceptSettings.text]);

  const refreshCount = async (key) => {
    try {
      const c = await getCountFromServer(query(qCol, where('conceptGroupKey', '==', key)));
      setSavedCounts(prev => ({ ...prev, [key]: c.data().count }));
    } catch (e) { /* sayım desteklenmiyorsa sessizce geç */ }
  };

  const selectCategory = (cid) => {
    const cat = CONCEPT_CATEGORIES.find(c => c.id === cid);
    setCatId(cid); setConceptId(cat.concepts[0].id); setGroupKey(cat.concepts[0].groups[0].key);
  };
  const selectConcept = (con) => { setConceptId(con.id); setGroupKey(con.groups[0].key); };

  // --- Bir şablonu soru belgesine dönüştür ---
  const buildPayload = (key, t, idx, overrides, audioUrl, textOverride) => {
    const g = CONCEPT_GROUP_INDEX[key];
    const ov = overrides?.[idx] || {};
    return {
      name: t.title,
      text: (textOverride || t.text || '').trim(),
      image: ov.main || t.mainImage || '',
      options: t.options.map((o, j) => ({ text: '', image: ov[`o${j}`] || o.image, audio: '' })),
      correctText: '',
      correctIndex: t.correctIndex,
      audio: audioUrl || '',
      video: '', preAudio1: '', preAudio2: '', customAttachmentImage: '',
      conceptGroupKey: key,
      conceptId: g.conceptId,
      conceptTplIdx: idx
    };
  };

  // --- Otomatik klasör: Kavram Soruları > Kavram > Soru kalıbı ---
  const ensureFolders = async (keys) => {
    if (!autoFolder) return {};
    let list = [...(folders || [])];
    localFoldersRef.current.forEach(f => { if (!list.some(x => x.id === f.id)) list.push(f); });
    let changed = false;
    const findOrAdd = (name, parentId) => {
      let f = list.find(x => x.name === name && (x.parentId || null) === (parentId || null));
      if (!f) { f = { id: `folder_${Date.now()}_${Math.floor(Math.random() * 1e6)}`, name, parentId: parentId || null }; list.push(f); changed = true; }
      return f.id;
    };
    const rootId = findOrAdd(ROOT_FOLDER_NAME, null);
    const map = {};
    keys.forEach(k => {
      const g = CONCEPT_GROUP_INDEX[k];
      // Kök › Kategori › Kavram › Soru kalıbı (kategori katmanı olmadan kavramlar yan yana diziliyordu)
      const catId = g.categoryLabel ? findOrAdd(g.categoryLabel, rootId) : rootId;
      const conId = findOrAdd(g.conceptLabel, catId);
      map[k] = findOrAdd(g.text, conId);
    });
    if (changed) await setDoc(settingsRef('folder_structure'), { list });
    localFoldersRef.current = list;
    return map;
  };

  const commonFields = (folderId) => ({
    timeLimit: Number(qTimeLimit),
    isMemory: isMem,
    memoryTime: Number(memTime),
    folderId: folderId || null,
    style: defaultStyle,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  const loadOverrides = async (key) => {
    if (key === groupKey) return media;
    try { const s = await getDocFromServer(settingsRef(`concept_media_${key}`)); return s.exists() ? (s.data().images || {}) : {}; } catch (_) { return {}; }
  };

  // --- Tek soruyu kaydet (daha önce kaydedildiyse üzerine yazılır) ---
  const saveSingle = async () => {
    if (!tpl) return;
    setBusy('tek soru kaydediliyor...');
    try {
      const existing = (await findQuestionsByField(db, appId, 'conceptGroupKey', [groupKey])).filter(e => Number(e.data.conceptTplIdx) === tplIdx);
      if (existing.length > 0 && !window.confirm(`"${tpl.title}" daha önce kaydedilmiş.\n\nÜzerine kaydedilsin mi? Eski soru silinip yerine yenisi yazılır (testlerdeki yeri korunur).`)) { setBusy(''); return; }
      const fmap = await ensureFolders([groupKey]);
      const folderId = autoFolder ? fmap[groupKey] : qFolderId;
      const data = { ...buildPayload(groupKey, tpl, tplIdx, media, groupAudio, groupText), ...commonFields(folderId) };
      const plan = planOverwrite(db, appId, [{ matchKey: `${groupKey}|${tplIdx}`, data }], existing, e => `${e.data.conceptGroupKey}|${e.data.conceptTplIdx}`);
      await commitOpsInChunks(db, plan.ops);
      const testIds = await removeIdsFromAllTests(db, appId, plan.deletedIds);
      setQuestions(prev => mergeQuestionState(prev, plan.created, plan.deletedIds));
      if (setTests && testIds.length) setTests(prev => stripIdsFromTestState(prev, plan.deletedIds));
      refreshCount(groupKey);
      alert(existing.length > 0 ? `"${tpl.title}" üzerine kaydedildi.` : `"${tpl.title}" kaydedildi.`);
    } catch (e) { console.error(e); alert('kaydedilirken hata oluştu: ' + (e?.message || '')); }
    setBusy('');
  };

  // --- Bir veya birden çok grubu toplu kaydet (daha önce kaydedilenlerin ÜZERİNE yazar) ---
  const saveGroups = async (keys, label) => {
    const total = keys.reduce((a, k) => a + (CONCEPT_GROUP_INDEX[k]?.count || 0), 0);
    const target = autoFolder ? `"${ROOT_FOLDER_NAME} › kategori › kavram › soru kalıbı" klasörlerine (otomatik)` : `"${(folders || []).find(f => f.id === qFolderId)?.name || 'Havuz (Ana Dizin)'}" klasörüne`;
    setBusy('daha önce kaydedilen sorular kontrol ediliyor...');
    let existing = [];
    try { existing = await findQuestionsByField(db, appId, 'conceptGroupKey', keys); }
    catch (e) { console.error(e); setBusy(''); alert('kayıtlı sorular kontrol edilemedi: ' + (e?.message || '')); return; }
    setBusy('');
    let msg = `${label ? `${label}\n\n` : ''}${total} kavram sorusu ${target} kaydedilsin mi?\n(${qTimeLimit} sn, ${isMem ? `hafıza ${memTime} sn` : 'daimi göster'})`;
    if (existing.length > 0) msg += `\n\n⚠️ DİKKAT: Bunlardan ${existing.length} soru daha önce kaydedilmiş.\nTAMAM derseniz ÜZERİNE kaydedilir: eski sorular silinip yerine yenileri yazılır, klasörleri de yeniden düzenlenir.\nTestlere eklenmiş sorular testteki yerinde kalır.`;
    if (!window.confirm(msg)) return;
    setBusy(`hazırlanıyor... 0/${total}`);
    try {
      const fmap = await ensureFolders(keys);
      const items = [];
      for (const k of keys) {
        const list = getConceptTemplates(k);
        const ov = await loadOverrides(k);
        const audioUrl = conceptSettings.audio?.[k] || '';
        const textOv = conceptSettings.text?.[k] || '';
        list.forEach((t, idx) => {
          const data = { ...buildPayload(k, t, idx, ov, audioUrl, textOv), ...commonFields(autoFolder ? fmap[k] : qFolderId) };
          items.push({ matchKey: `${k}|${idx}`, data });
        });
      }
      const plan = planOverwrite(db, appId, items, existing, e => `${e.data.conceptGroupKey}|${e.data.conceptTplIdx}`);
      const res = await commitOpsInChunks(db, plan.ops, { onProgress: (d, t) => setBusy(`kaydediliyor... ${d}/${t}`) });
      const testIds = await removeIdsFromAllTests(db, appId, plan.deletedIds);
      setQuestions(prev => mergeQuestionState(prev, plan.created, plan.deletedIds));
      if (setTests && testIds.length) setTests(prev => stripIdsFromTestState(prev, plan.deletedIds));
      setSavedCounts(prev => { const n = { ...prev }; keys.forEach(k => { n[k] = getConceptTemplates(k).length; }); return n; });
      const yeni = plan.created.length - plan.updatedIds.length;
      alert(`${plan.created.length} kavram sorusu kaydedildi.${plan.updatedIds.length ? `\n${plan.updatedIds.length} soru eskisinin üzerine yazıldı, ${yeni} soru yeni eklendi.` : ''}${plan.deletedIds.length ? `\n${plan.deletedIds.length} fazla kopya silindi.` : ''}${res.skipped.length ? `\n${res.skipped.length} soru boyut sınırı nedeniyle atlandı.` : ''}`);
    } catch (e) { console.error(e); alert('toplu kayıt sırasında hata oluştu: ' + (e?.message || '')); }
    setBusy('');
  };

  // --- Kayıtlı sorulardaki ilgili alanları güncelle ---
  const updateSavedQuestions = async (key, buildPatch, filterFn) => {
    const snap = await getDocsFromServer(query(qCol, where('conceptGroupKey', '==', key)));
    const docs = snap.docs.filter(d => !filterFn || filterFn(d.data()));
    if (docs.length === 0) return 0;
    const ops = docs.map(d => ({ type: 'update', ref: d.ref, data: { ...buildPatch(d.data()), updatedAt: serverTimestamp() } }));
    await commitOpsInChunks(db, ops, { onProgress: (a, b) => setBusy(`kayıtlı sorular güncelleniyor... ${a}/${b}`) });
    const patches = new Map(docs.map(d => [d.id, buildPatch(d.data())]));
    setQuestions(prev => prev.map(q => patches.has(q.id) ? { ...q, ...patches.get(q.id) } : q));
    return docs.length;
  };

  // --- GRUP SESİ: tüm kalıba uygula ---
  const handleGroupAudio = async (url) => {
    setBusy('ses kaydediliyor...');
    try {
      if (url) await setDoc(settingsRef('concept_settings'), { audio: { [groupKey]: url } }, { merge: true });
      else await updateDoc(settingsRef('concept_settings'), { [`audio.${groupKey}`]: deleteField() }).catch(() => {});
      setConceptSettings(prev => { const audio = { ...(prev.audio || {}) }; if (url) audio[groupKey] = url; else delete audio[groupKey]; return { ...prev, audio }; });
      const n = await updateSavedQuestions(groupKey, () => ({ audio: url || '' }));
      if (n > 0) alert(`ses "${group.text}" kalıbındaki kayıtlı ${n} soruya da ${url ? 'eklendi' : 'kaldırıldı'}.`);
    } catch (e) { console.error(e); alert('ses kaydedilemedi: ' + (e?.message || '')); }
    setBusy('');
  };

  // --- GRUP METNİ (isteğe bağlı) ---
  const handleGroupText = async () => {
    const val = textDraft.trim();
    setBusy('metin kaydediliyor...');
    try {
      await setDoc(settingsRef('concept_settings'), { text: { [groupKey]: val } }, { merge: true });
      setConceptSettings(prev => ({ ...prev, text: { ...(prev.text || {}), [groupKey]: val } }));
      const n = await updateSavedQuestions(groupKey, () => ({ text: val || group.text }));
      alert(`soru metni kaydedildi.${n ? ` Kayıtlı ${n} soru da güncellendi.` : ''}`);
    } catch (e) { console.error(e); alert('metin kaydedilemedi'); }
    setBusy('');
  };

  // --- SORUYA ÖZEL GÖRSEL (sadece bu şablon / bu şık) ---
  const handleImage = async (slot, url) => {
    const idx = tplIdx;
    setBusy('görsel kaydediliyor...');
    try {
      const next = { ...media, [idx]: { ...(media[idx] || {}) } };
      if (url) next[idx][slot] = url; else delete next[idx][slot];
      if (Object.keys(next[idx]).length === 0) delete next[idx];
      await setDoc(settingsRef(`concept_media_${groupKey}`), { images: next });
      setMedia(next);
      const t = templates[idx];
      await updateSavedQuestions(groupKey, () => {
        const ov = next[idx] || {};
        return { image: ov.main || t.mainImage || '', options: t.options.map((o, j) => ({ text: '', image: ov[`o${j}`] || o.image, audio: '' })) };
      }, (d) => d.conceptTplIdx === idx);
    } catch (e) { console.error(e); alert('görsel kaydedilemedi: ' + (e?.message || '')); }
    setBusy('');
  };

  const ov = media[tplIdx] || {};
  const conceptTotal = concept.groups.reduce((a, g) => a + g.count, 0);
  const categoryTotal = category.concepts.reduce((a, c) => a + c.groups.reduce((x, g) => x + g.count, 0), 0);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-indigo-50 shadow-lg space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2"><Layers size={16} /> kavram soruları (EK-7)</h4>
        <span className="text-[10px] font-black text-slate-400 uppercase">{countConceptGroups()} soru kalıbı • {countConceptTemplates()} hazır soru</span>
      </div>

      {/* AYARLAR */}
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 items-center">
        <button type="button" onClick={() => setAutoFolder(!autoFolder)} className={`px-3 py-2 rounded-xl text-[10px] font-black border flex items-center gap-1.5 ${autoFolder ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-500'}`} title="Açıkken sorular 'Kavram Soruları › Kavram › Soru kalıbı' klasörlerine otomatik yerleşir">
          <FolderPlus size={14} /> otomatik klasör {autoFolder ? '(açık)' : '(kapalı)'}
        </button>
        {!autoFolder && (
          <select value={qFolderId} onChange={e => setQFolderId(e.target.value)} className="p-2 border-2 rounded-xl font-bold outline-none text-xs max-w-[220px]">
            <option value="">havuz (ana dizin)</option>
            {orderedFolders.map(f => <option key={f.id} value={f.id}>{f.displayName}</option>)}
          </select>
        )}
        <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-500">süre (sn):</label><input type="number" className="w-16 p-2 rounded-lg border font-bold text-center" value={qTimeLimit} onChange={e => setQTimeLimit(e.target.value)} /></div>
        <button type="button" onClick={() => setIsMem(!isMem)} className={`px-3 py-2 rounded-lg text-[10px] font-bold border ${isMem ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>{isMem ? 'hafıza modu açık' : 'hafıza modu kapalı'}</button>
        {isMem && <input type="number" className="w-16 p-2 rounded-lg border font-bold text-center" value={memTime} onChange={e => setMemTime(e.target.value)} />}
        <button type="button" onClick={() => setKeepSettingsPinned(!keepSettingsPinned)} className={`ml-auto px-3 py-2 rounded-xl text-xs font-black border ${keepSettingsPinned ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-500'}`}>📌 ayarları sabitle {keepSettingsPinned ? '(aktif)' : '(kapalı)'}</button>
      </div>

      {/* KATEGORİLER */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {CONCEPT_CATEGORIES.map(c => (
          <button key={c.id} type="button" onClick={() => selectCategory(c.id)} className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all ${catId === c.id ? `${CAT_COLORS[c.color] || 'bg-indigo-600'} text-white shadow` : 'bg-white/70 text-slate-600 hover:bg-slate-200'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* KAVRAMLAR */}
      <div className="flex flex-wrap gap-1.5">
        {category.concepts.map(con => (
          <button key={con.id} type="button" onClick={() => selectConcept(con)} className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${concept.id === con.id ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            {con.label}
          </button>
        ))}
      </div>

      {/* SORU KALIPLARI (GRUPLAR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {concept.groups.map(g => {
          const hasAudio = Boolean(conceptSettings.audio?.[g.key]);
          const saved = savedCounts[g.key];
          return (
            <button key={g.key} type="button" onClick={() => setGroupKey(g.key)} className={`text-left p-3 rounded-2xl border-2 transition-all ${groupKey === g.key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}>
              <div className="font-black text-sm text-slate-800">{conceptSettings.text?.[g.key] || g.text}</div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{g.count} soru</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${hasAudio ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-700'}`}><Music size={10} /> {hasAudio ? 'ses var' : 'ses yok'}</span>
                {saved > 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">{saved} kayıtlı</span>}
              </div>
            </button>
          );
        })}
      </div>

      {group && tpl && (
        <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 space-y-4">
          {/* GRUP SESİ VE METNİ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-2xl border space-y-1">
              <MediaUploader label={`🔊 kalıp sesi → "${group.text}" (${group.count} sorunun hepsine)`} value={groupAudio} onChange={handleGroupAudio} type="audio" id={`concept-aud-${groupKey}`} />
              <p className="text-[9px] text-slate-400 font-bold leading-tight">Ses sadece bu kavram kalıbına uygulanır; daha önce kaydedilmiş soruları da günceller. Diğer şablonlara eklenmez.</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">soru metni (isteğe bağlı, tüm kalıba)</label>
              <input value={textDraft} onChange={e => setTextDraft(e.target.value)} placeholder={group.text} className="w-full p-2.5 border-2 rounded-xl font-bold text-sm outline-none focus:border-indigo-500" />
              <button type="button" disabled={!!busy || textDraft.trim() === groupText} onClick={handleGroupText} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black disabled:opacity-40">metni kaydet</button>
            </div>
          </div>

          {/* ŞABLON NUMARALARI */}
          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
            {templates.map((t, idx) => (
              <button key={t.id} type="button" onClick={() => setTplIdx(idx)} className={`relative w-10 h-7 rounded-lg text-[10px] font-black border transition-all ${tplIdx === idx ? 'bg-indigo-600 text-white border-indigo-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-indigo-50'}`}>
                {idx + 1}
                {media[idx] && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 border border-white" title="özel görsel var" />}
              </button>
            ))}
          </div>

          {/* ÖNİZLEME + SORUYA ÖZEL GÖRSELLER */}
          <div className="bg-white p-4 rounded-2xl border space-y-3 relative">
            {mediaLoading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-10"><Loader2 className="animate-spin text-indigo-500" /></div>}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-600">#{tplIdx + 1} • {groupText || group.text}</span>
              <span className="text-[9px] font-bold text-pink-600 flex items-center gap-1"><ImageIcon size={12} /> buradan yüklenen görsel SADECE bu soruya uygulanır</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              {(ov.main || tpl.mainImage) && <img src={ov.main || tpl.mainImage} className="max-h-40 max-w-full object-contain border rounded-2xl p-1" alt="üst görsel" />}
              <div className="w-full max-w-xs">
                <MediaUploader small label={tpl.mainImage ? 'üst görseli değiştir' : 'üst görsel ekle (isteğe bağlı)'} value={ov.main || ''} onChange={(url) => handleImage('main', url)} id={`concept-main-${groupKey}-${tplIdx}`} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {tpl.options.map((opt, j) => {
                const img = ov[`o${j}`] || opt.image;
                const isCorrect = j === tpl.correctIndex;
                return (
                  <div key={j} className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1.5 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
                    <img src={img} className="w-full max-w-[150px] aspect-square object-contain" alt={`şık ${j + 1}`} />
                    <span className={`text-[9px] font-black uppercase ${isCorrect ? 'text-green-700' : 'text-slate-500'}`}>{isCorrect ? '✓ doğru cevap' : `şık ${j + 1}`}</span>
                    <MediaUploader small label="görseli değiştir" value={ov[`o${j}`] || ''} onChange={(url) => handleImage(`o${j}`, url)} id={`concept-o${j}-${groupKey}-${tplIdx}`} />
                    {ov[`o${j}`] && (
                      <button type="button" onClick={() => handleImage(`o${j}`, '')} className="text-[9px] font-black text-slate-500 flex items-center gap-1 hover:text-red-500"><RotateCcw size={10} /> hazır görsele dön</button>
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
            <button type="button" disabled={!!busy} onClick={() => saveGroups(Object.keys(CONCEPT_GROUP_INDEX), '"Kavram Soruları" sekmesinin TAMAMI')} className="flex-1 min-w-[160px] py-3 rounded-2xl bg-rose-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow disabled:opacity-50" title="Bu sekmedeki bütün hazır soruları kaydeder; daha önce kaydedilenlerin üzerine yazar">
              <Layers size={16} /> sekmenin tamamı ({countConceptTemplates()} soru)
            </button>
          </div>
          {busy && <div className="flex items-center gap-2 text-xs font-black text-indigo-600"><Loader2 size={14} className="animate-spin" /> {busy}</div>}
        </div>
      )}
    </div>
  );
}
