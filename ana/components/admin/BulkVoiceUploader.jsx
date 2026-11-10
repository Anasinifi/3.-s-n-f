import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { Loader2, UploadCloud, CheckCircle2, AlertCircle, Download, X } from 'lucide-react';
import { buildVoiceIndex, matchFiles, voicesOfTemplate, foldKey } from '../../utils/voiceMatch';
import { measureGain, withGain } from '../../utils/audioLevel';

// ============================================================================
// --- DOSYA ADIYLA TOPLU SES YÜKLEME ---
// ============================================================================
// Ses dosyasının adı = okunacak metin. Dosyalar seçilince önce EŞLEŞTİRİLİR ve rapor
// gösterilir (hiçbir şey yüklenmez). "Yükle ve yerleştir" ile:
//   • soru sesi      -> o soruya (kalıbın bütün soruları aynı cümleyse kalıbın TOPLU SESİ olur)
//   • şık sesi       -> metni aynı olan şıkka (doğru şık kendi metniyle eşleşir, sıra karışmaz)
//   • hikâye girişi  -> ön ses 1 • hikâye -> ön ses 2
// Kayıtlı sorular da güncellenir; kayıtlı metni şablondan farklı olan eski sorulara dokunulmaz.

const SLOT_LABEL = { group: 'toplu ses', audio: 'soru sesi', storyIntro: 'hikâye girişi', story: 'hikâye' };
const slotLabel = (s) => SLOT_LABEL[s] || (/^a\d$/.test(s) ? 'şık sesi' : s);

const uploadAudio = async (file) => {
  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] || 'mp3').toLowerCase();
  const r = ref(storage, `uploads/audios/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`);
  const gain = await measureGain(file); // yüksek sesler çocuk cihazında kısılarak çalar
  await uploadBytes(r, file, { cacheControl: 'public,max-age=31536000', ...(file.type ? { contentType: file.type } : {}) });
  return withGain(await getDownloadURL(r), gain);
};

const downloadText = (name, text) => {
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
};

export function BulkVoiceUploader({ bank, categoryLabel, categoryKeys, groupField, tplField, textOverrides, groupAudios, loadOverrides, applyMediaChanges, applyGroupAudios, busy, setBusy }) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState('category');
  const [skipExisting, setSkipExisting] = useState(true);
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [report, setReport] = useState(null);

  const scopeKeys = () => (scope === 'category' ? categoryKeys : Object.keys(bank.index));

  const analyze = (list, sc = scope) => {
    if (!list.length) return;
    setBusy('sesler eşleştiriliyor...'); setReport(null);
    setTimeout(() => {
      try {
        const keys = sc === 'category' ? categoryKeys : Object.keys(bank.index);
        const index = buildVoiceIndex(bank, keys, textOverrides || {});
        setResult({ ...matchFiles(index, list), scope: sc });
      } catch (e) { console.error(e); alert('eşleştirme sırasında hata: ' + (e?.message || '')); }
      setBusy('');
    }, 30);
  };

  const onPick = (e) => {
    const list = Array.from(e.target.files || []).filter(f => /^audio\//.test(f.type) || /\.(mp3|wav|m4a|ogg|oga|aac|webm|flac)$/i.test(f.name));
    e.target.value = '';
    setFiles(list); analyze(list);
  };

  // Kayıtlı soru şablonla aynı mı? (aynı değilse eski kayıttır: ses bağlanmaz)
  const mismatches = { n: 0, examples: [] };
  const verifyDoc = (d, slots) => {
    const key = d[groupField]; const t = bank.getTemplates(key)?.[d[tplField]];
    if (!t) return false;
    const voices = voicesOfTemplate(t, (textOverrides || {})[key] || '');
    const want = (slot) => foldKey(voices.find(v => v.slot === slot)?.text || '');
    for (const s of slots) {
      let have = '';
      if (s === 'audio') have = foldKey(d.ttsText || d.memoryText || d.text);
      else if (/^a\d$/.test(s)) { const w = want(s); have = (d.options || []).some(o => foldKey(o.ttsText || o.text) === w) ? w : '-'; } // şık sırası dengelenmiş olabilir: metinle ara
      else if (s === 'story') have = foldKey(String(d.storyText || '').split('||').pop());
      else if (s === 'storyIntro') have = foldKey(d.storyIntro);
      else continue;
      if (have !== want(s)) {
        mismatches.n++;
        if (mismatches.examples.length < 8) mismatches.examples.push(`${bank.index[key]?.label || key} #${(d[tplField] || 0) + 1}`);
        return false;
      }
    }
    return true;
  };

  const run = async () => {
    if (!result?.ok?.length) return;
    const items = result.ok;
    if (!window.confirm(`${items.length} ses dosyası yüklenip yerine yerleştirilecek.${skipExisting ? '\nSesi zaten olan yerler atlanacak.' : '\nSesi olan yerlerin sesi DEĞİŞTİRİLECEK.'}\nDevam edilsin mi?`)) return;
    mismatches.n = 0; mismatches.examples = [];
    const rep = { uploaded: 0, skippedExisting: 0, failed: [], slots: {}, savedPatched: 0 };
    try {
      // 1) mevcut sesler (atlamak için)
      const keys = [...new Set(items.flatMap(it => it.voice.targets.map(t => t.key)))];
      const ovs = {};
      setBusy(`mevcut sesler okunuyor... 0/${keys.length}`);
      for (let i = 0; i < keys.length; i++) { ovs[keys[i]] = await loadOverrides(keys[i]); if (i % 10 === 0) setBusy(`mevcut sesler okunuyor... ${i + 1}/${keys.length}`); }
      const has = (t) => (t.slot === 'group' ? Boolean(groupAudios?.[t.key]) : Boolean(ovs[t.key]?.[t.idx]?.[t.slot]));
      const jobs = items.map(it => ({ ...it, targets: skipExisting ? it.voice.targets.filter(t => !has(t)) : it.voice.targets })).filter(j => {
        if (j.targets.length === 0) { rep.skippedExisting++; return false; }
        return true;
      });

      // 2) dosyaları yükle (aynı anda 3)
      let done = 0; let next = 0;
      const worker = async () => {
        while (next < jobs.length) {
          const j = jobs[next++];
          try { j.url = await uploadAudio(j.file); rep.uploaded++; }
          catch (e) { console.error(e); rep.failed.push(j.file.name); }
          done++; setBusy(`sesler yükleniyor... ${done}/${jobs.length}`);
        }
      };
      await Promise.all([worker(), worker(), worker()]);

      // 3) yerleştir: kalıp kalıp
      const perKey = new Map(); const groupEntries = [];
      jobs.filter(j => j.url).forEach(j => j.targets.forEach(t => {
        rep.slots[slotLabel(t.slot)] = (rep.slots[slotLabel(t.slot)] || 0) + (t.slot === 'group' ? (t.count || 1) : 1);
        if (t.slot === 'group') { groupEntries.push({ key: t.key, url: j.url }); return; }
        if (!perKey.has(t.key)) perKey.set(t.key, []);
        perKey.get(t.key).push({ idx: t.idx, slot: t.slot, url: j.url });
      }));
      const pk = [...perKey.entries()];
      for (let i = 0; i < pk.length; i++) {
        setBusy(`yerleştiriliyor... ${i + 1}/${pk.length} kalıp`);
        rep.savedPatched += await applyMediaChanges(pk[i][0], pk[i][1], verifyDoc);
      }
      if (groupEntries.length) { setBusy('toplu sesler yerleştiriliyor...'); rep.savedPatched += await applyGroupAudios(groupEntries, verifyDoc); }
    } catch (e) { console.error(e); alert('toplu yükleme yarıda kaldı: ' + (e?.message || '') + '\nTekrar çalıştırırsanız yerleşmiş sesler atlanır.'); }
    rep.mismatch = mismatches.n; rep.mismatchExamples = mismatches.examples;
    setBusy(''); setReport(rep);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full p-3 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center gap-2 hover:bg-orange-100">
        <UploadCloud size={16} /> dosya adıyla toplu ses yükle (adı = okunacak metin)
      </button>
    );
  }

  const r = result;
  return (
    <div className="p-4 rounded-3xl border-2 border-orange-300 bg-orange-50/60 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h5 className="font-black text-orange-700 text-xs uppercase flex items-center gap-2"><UploadCloud size={16} /> dosya adıyla toplu ses yükle</h5>
        <button type="button" onClick={() => { setOpen(false); setResult(null); setReport(null); setFiles([]); }} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
      </div>
      <p className="text-[11px] font-bold text-slate-600 leading-snug">
        Her ses dosyasının adı okunan metnin kendisi olmalı (ör. <i>Hangisi en öndedir.mp3</i>). Ad 250 karakterde kesilmiş olabilir; büyük/küçük harf, Türkçe karakter ve noktalama önemli değil.
        Dosyaları seçince önce eşleştirme raporu çıkar; onaylayınca yüklenir. Şık sesleri, şıkkın kendi metniyle eşleşir (doğru şık karışmaz). Aynı metin birçok soruda geçiyorsa tek dosya hepsine bağlanır.
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <select value={scope} onChange={e => { setScope(e.target.value); if (files.length) analyze(files, e.target.value); }} className="p-2 border-2 rounded-xl font-bold text-xs outline-none">
          <option value="category">bu kategori: {categoryLabel}</option>
          <option value="bank">bütün sekme: {bank.title}</option>
        </select>
        <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 cursor-pointer">
          <input type="checkbox" checked={skipExisting} onChange={e => setSkipExisting(e.target.checked)} /> sesi olanları atla
        </label>
        <label className={`ml-auto px-4 py-2 rounded-xl bg-orange-500 text-white font-black text-xs cursor-pointer shadow flex items-center gap-1.5 ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
          <UploadCloud size={14} /> ses dosyalarını seç
          <input type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg" multiple className="hidden" onChange={onPick} />
        </label>
      </div>

      {r && (
        <div className="bg-white rounded-2xl border p-3 space-y-2 text-xs">
          <div className="flex flex-wrap gap-2 font-black">
            <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 size={12} /> eşleşti: {r.ok.length}</span>
            {r.ambiguous.length > 0 && <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 flex items-center gap-1"><AlertCircle size={12} /> belirsiz: {r.ambiguous.length}</span>}
            {r.none.length > 0 && <span className="px-2 py-1 rounded-lg bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle size={12} /> bulunamadı: {r.none.length}</span>}
            {r.dup.length > 0 && <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600">aynı metne 2. dosya: {r.dup.length}</span>}
            <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700">dosyası olmayan ses: {r.missing.length}</span>
          </div>
          {r.ok.length > 0 && (
            <details><summary className="cursor-pointer font-black text-green-700">eşleşenler</summary>
              <ul className="mt-1 space-y-0.5 max-h-48 overflow-y-auto">{r.ok.slice(0, 300).map(({ file, voice, how }) => (
                <li key={file.name} className="font-bold text-slate-600 leading-tight"><span className="text-slate-400">{file.name}</span> → {[...new Set(voice.targets.map(t => slotLabel(t.slot)))].join(', ')} ({voice.targets.reduce((a, t) => a + (t.count || 1), 0)} yer){how === 'baş' ? ' • adın başıyla' : ''}</li>
              ))}</ul>
            </details>
          )}
          {r.ambiguous.length > 0 && (
            <details open><summary className="cursor-pointer font-black text-amber-700">belirsiz (adı daha uzun yazın)</summary>
              <ul className="mt-1 space-y-1 max-h-48 overflow-y-auto">{r.ambiguous.map(({ file, candidates, total }) => (
                <li key={file.name} className="font-bold text-slate-600 leading-tight"><span className="text-amber-700">{file.name}</span> → {total} metinle başlıyor: {candidates.map(c => `“${c.slice(0, 70)}…”`).join(' / ')}</li>
              ))}</ul>
            </details>
          )}
          {r.none.length > 0 && (
            <details open><summary className="cursor-pointer font-black text-red-700">bulunamadı (bu kapsamda böyle bir metin yok)</summary>
              <ul className="mt-1 max-h-40 overflow-y-auto">{r.none.map(({ file }) => <li key={file.name} className="font-bold text-slate-600">{file.name}</li>)}</ul>
            </details>
          )}
          {r.dup.length > 0 && (
            <details><summary className="cursor-pointer font-black text-slate-600">aynı metne ikinci dosya (kullanılmayacak)</summary>
              <ul className="mt-1 max-h-40 overflow-y-auto">{r.dup.map(({ file, other }) => <li key={file.name} className="font-bold text-slate-600">{file.name} <span className="text-slate-400">(kullanılan: {other.name})</span></li>)}</ul>
            </details>
          )}
          {r.missing.length > 0 && (
            <button type="button" onClick={() => downloadText(`eksik-sesler-${bank.id}.txt`, r.missing.map(v => v.text).join('\n'))} className="px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 font-black text-[11px] flex items-center gap-1.5 hover:bg-indigo-50">
              <Download size={12} /> dosyası olmayan {r.missing.length} sesin metnini indir
            </button>
          )}
          <button type="button" disabled={!!busy || r.ok.length === 0} onClick={run} className="w-full py-3 rounded-2xl bg-orange-500 text-white font-black text-xs shadow disabled:opacity-40 flex items-center justify-center gap-2">
            <UploadCloud size={16} /> {r.ok.length} sesi yükle ve yerleştir
          </button>
        </div>
      )}

      {busy && <div className="flex items-center gap-2 text-xs font-black text-orange-700"><Loader2 size={14} className="animate-spin" /> {busy}</div>}

      {report && (
        <div className="bg-white rounded-2xl border-2 border-green-300 p-3 text-xs font-bold text-slate-700 space-y-1">
          <div className="font-black text-green-700 flex items-center gap-1.5"><CheckCircle2 size={14} /> tamamlandı</div>
          <div>yüklenen dosya: {report.uploaded}{report.skippedExisting ? ` • sesi zaten olduğu için atlanan: ${report.skippedExisting}` : ''}</div>
          <div>yerleşen: {Object.entries(report.slots).map(([k, v]) => `${k} ${v}`).join(' • ') || '-'}</div>
          <div>güncellenen kayıtlı soru: {report.savedPatched}</div>
          {report.mismatch > 0 && <div className="text-amber-700">metni şablondan farklı olduğu için sesi bağlanmayan eski kayıtlı soru: {report.mismatch} ({report.mismatchExamples.join(', ')}{report.mismatch > report.mismatchExamples.length ? '…' : ''}). Bu soruları silip yeniden kaydederseniz sesler otomatik gelir.</div>}
          {report.failed.length > 0 && <div className="text-red-700">yüklenemeyen: {report.failed.join(', ')} — tekrar seçip çalıştırabilirsiniz.</div>}
        </div>
      )}
    </div>
  );
}
