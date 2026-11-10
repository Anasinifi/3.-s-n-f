import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { Loader2, Image as ImageIcon, CheckCircle2, AlertCircle, Download, X } from 'lucide-react';
import { buildImageIndex, matchFiles, foldKey } from '../../utils/voiceMatch';

// ============================================================================
// --- DOSYA ADIYLA TOPLU GÖRSEL YÜKLEME ---
// ============================================================================
// Görsel dosyasının adı = şıkkın metni (ör. "Kırmızı yün bir şapka.jpg").
// Dosyalar seçilince önce EŞLEŞTİRİLİR ve rapor gösterilir. Onaylanınca:
//   • görsel küçültülür (en fazla 360 piksel, JPG) -> az yer kaplar, hızlı açılır
//   • metni aynı olan bütün şıklara bağlanır (aynı şık birçok soruda geçiyorsa hepsine)
//   • kayıtlı sorular da güncellenir
// Kapsam: bütün sekme / bir kategori / bir konu / tek kalıp / öğretmenin gönderdiği sorular.

const IMG_EXT = /\.(jpe?g|png|webp|gif|svg|avif)$/i;
const MAX_SIDE = 360;

// Görseli küçült ve JPG yap (SVG ve hareketli GIF olduğu gibi kalır)
const shrink = (file) => new Promise((resolve) => {
  if (/svg|gif/i.test(file.type) || /\.(svg|gif)$/i.test(file.name)) { resolve(file); return; }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    try {
      const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h);
      c.toBlob(b => { URL.revokeObjectURL(url); resolve(b && b.size < file.size ? b : file); }, 'image/jpeg', 0.82);
    } catch (_) { URL.revokeObjectURL(url); resolve(file); }
  };
  img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
  img.src = url;
});

const uploadImage = async (file) => {
  const small = await shrink(file);
  const isJpg = small !== file || /jpe?g/i.test(file.type);
  const ext = isJpg ? 'jpg' : (file.name.match(/\.([a-z0-9]+)$/i)?.[1] || 'png').toLowerCase();
  const r = ref(storage, `uploads/images/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`);
  await uploadBytes(r, small, { cacheControl: 'public,max-age=31536000', contentType: isJpg ? 'image/jpeg' : (file.type || 'image/png') });
  return getDownloadURL(r);
};

const downloadText = (name, text) => {
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
};

export function BulkImageUploader({ bank, category, concept, groupKey, tplField, groupField, loadOverrides, applyMediaChanges, busy, setBusy }) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState('category');
  const [skipExisting, setSkipExisting] = useState(false);
  const [withMain, setWithMain] = useState(false);
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [report, setReport] = useState(null);

  const allKeys = Object.keys(bank.index);
  const teacherKeys = allKeys.filter(k => bank.index[k].fromTeacher);
  const SCOPES = [
    { id: 'bank', label: `bütün sekme: ${bank.title}`, keys: () => allKeys },
    { id: 'category', label: `bu kategori: ${category.label}`, keys: () => category.concepts.flatMap(c => c.groups.map(g => g.key)) },
    { id: 'concept', label: `bu konu: ${concept.label}`, keys: () => concept.groups.map(g => g.key) },
    { id: 'group', label: `sadece bu kalıp: ${bank.index[groupKey]?.label || bank.index[groupKey]?.text || groupKey}`, keys: () => [groupKey] },
    ...(teacherKeys.length ? [{ id: 'teacher', label: 'sadece benim gönderdiğim sorular', keys: () => teacherKeys }] : [])
  ];
  const keysOf = (sc) => (SCOPES.find(s => s.id === sc) || SCOPES[1]).keys();

  const analyze = (list, sc = scope, wm = withMain) => {
    if (!list.length) return;
    setBusy('görseller eşleştiriliyor...'); setReport(null);
    setTimeout(() => {
      try {
        const index = buildImageIndex(bank, keysOf(sc), { withMain: wm });
        setResult({ ...matchFiles(index, list), scope: sc });
      } catch (e) { console.error(e); alert('eşleştirme sırasında hata: ' + (e?.message || '')); }
      setBusy('');
    }, 30);
  };

  const onPick = (e) => {
    const list = Array.from(e.target.files || []).filter(f => /^image\//.test(f.type) || IMG_EXT.test(f.name));
    e.target.value = '';
    setFiles(list); analyze(list);
  };

  // Kayıtlı soru hâlâ bu şablon mu? (şık metni kayıtta varsa evet)
  const verifyDoc = (d, slots) => {
    const key = d[groupField]; const t = bank.getTemplates(key)?.[d[tplField]];
    if (!t) return false;
    for (const s of slots) {
      if (!/^o\d$/.test(s)) continue;
      const o = (t.options || []).find((x, j) => `o${x.slot ?? j}` === s);
      const w = foldKey(o?.text || o?.tts || '');
      if (!w) continue; // yazısız (sadece resim) şık: adı imgName, kayıtta metin yok -> şablon numarasıyla kabul
      if (!(d.options || []).some(x => foldKey(x.text || x.ttsText) === w)) return false;
    }
    return true;
  };

  const run = async () => {
    if (!result?.ok?.length) return;
    const items = result.ok;
    if (!window.confirm(`${items.length} görsel küçültülüp yüklenecek ve şıklara yerleştirilecek.${skipExisting ? '\nKendi görseli olan şıklar atlanacak.' : '\nDaha önce yüklenmiş şık görselleri DEĞİŞTİRİLECEK.'}\nDevam edilsin mi?`)) return;
    const rep = { uploaded: 0, skippedExisting: 0, failed: [], placed: 0, main: 0, savedPatched: 0, bytes: 0 };
    try {
      const keys = [...new Set(items.flatMap(it => it.voice.targets.map(t => t.key)))];
      const ovs = {};
      if (skipExisting) {
        for (let i = 0; i < keys.length; i++) { ovs[keys[i]] = await loadOverrides(keys[i]); if (i % 10 === 0) setBusy(`mevcut görseller okunuyor... ${i + 1}/${keys.length}`); }
      }
      const has = (t) => Boolean(ovs[t.key]?.[t.idx]?.[t.slot]);
      const jobs = items.map(it => ({ ...it, targets: skipExisting ? it.voice.targets.filter(t => !has(t)) : it.voice.targets })).filter(j => {
        if (j.targets.length === 0) { rep.skippedExisting++; return false; }
        return true;
      });
      let done = 0; let next = 0;
      const worker = async () => {
        while (next < jobs.length) {
          const j = jobs[next++];
          try { j.url = await uploadImage(j.file); rep.uploaded++; }
          catch (e) { console.error(e); rep.failed.push(j.file.name); }
          done++; setBusy(`görseller yükleniyor... ${done}/${jobs.length}`);
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      const perKey = new Map();
      jobs.filter(j => j.url).forEach(j => j.targets.forEach(t => {
        if (t.slot === 'main') rep.main++; else rep.placed++;
        if (!perKey.has(t.key)) perKey.set(t.key, []);
        perKey.get(t.key).push({ idx: t.idx, slot: t.slot, url: j.url });
      }));
      const pk = [...perKey.entries()];
      for (let i = 0; i < pk.length; i++) {
        setBusy(`yerleştiriliyor... ${i + 1}/${pk.length} kalıp`);
        rep.savedPatched += await applyMediaChanges(pk[i][0], pk[i][1], verifyDoc);
      }
    } catch (e) { console.error(e); alert('toplu görsel yükleme yarıda kaldı: ' + (e?.message || '') + '\nTekrar çalıştırabilirsiniz.'); }
    setBusy(''); setReport(rep);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full p-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-100">
        <ImageIcon size={16} /> dosya adıyla toplu görsel yükle (adı = numara + şık metni)
      </button>
    );
  }

  const r = result;
  const targetCount = (v) => v.targets.length;
  return (
    <div className="p-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50/60 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h5 className="font-black text-emerald-700 text-xs uppercase flex items-center gap-2"><ImageIcon size={16} /> dosya adıyla toplu görsel yükle</h5>
        <button type="button" onClick={() => { setOpen(false); setResult(null); setReport(null); setFiles([]); }} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
      </div>
      <p className="text-[11px] font-bold text-slate-600 leading-snug">
        Görselin adı, Word listesindeki numara + şık adı olmalı (ör. <i>0123 Kırmızı yün bir şapka.jpg</i>). Numara varsa görsel kesin yerini bulur, adın geri kalanı kısaltılsa da olur. Numarasız ad (yalnızca şık metni) da çalışır. Büyük/küçük harf, Türkçe karakter ve noktalama önemli değil.
        Önce eşleştirme raporu çıkar, onaylayınca yüklenir. Görseller yüklenirken küçültülür (en fazla {MAX_SIDE} piksel, JPG). Aynı şık metni birçok soruda geçiyorsa tek görsel hepsine bağlanır.
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <select value={scope} onChange={e => { setScope(e.target.value); if (files.length) analyze(files, e.target.value); }} className="p-2 border-2 rounded-xl font-bold text-xs outline-none max-w-full">
          {SCOPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 cursor-pointer">
          <input type="checkbox" checked={skipExisting} onChange={e => setSkipExisting(e.target.checked)} /> kendi görseli olanları atla
        </label>
        <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 cursor-pointer" title="Dosya adı soru cümlesiyle aynıysa o sorunun üst görseli yapılır">
          <input type="checkbox" checked={withMain} onChange={e => { setWithMain(e.target.checked); if (files.length) analyze(files, scope, e.target.checked); }} /> soru metniyle eşleşeni üst görsel yap
        </label>
        <label className={`ml-auto px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs cursor-pointer shadow flex items-center gap-1.5 ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
          <ImageIcon size={14} /> görselleri seç
          <input type="file" accept="image/*,.jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={onPick} />
        </label>
      </div>

      {r && (
        <div className="bg-white rounded-2xl border p-3 space-y-2 text-xs">
          <div className="flex flex-wrap gap-2 font-black">
            <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 size={12} /> eşleşti: {r.ok.length} ({r.ok.reduce((a, x) => a + targetCount(x.voice), 0)} şık)</span>
            {r.ambiguous.length > 0 && <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 flex items-center gap-1"><AlertCircle size={12} /> belirsiz: {r.ambiguous.length}</span>}
            {r.none.length > 0 && <span className="px-2 py-1 rounded-lg bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle size={12} /> bulunamadı: {r.none.length}</span>}
            {r.dup.length > 0 && <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600">aynı metne 2. dosya: {r.dup.length}</span>}
            <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700">görseli gelmeyen metin: {r.missing.length}</span>
          </div>
          {r.ok.length > 0 && (
            <details><summary className="cursor-pointer font-black text-green-700">eşleşenler</summary>
              <ul className="mt-1 space-y-0.5 max-h-48 overflow-y-auto">{r.ok.slice(0, 400).map(({ file, voice }) => (
                <li key={file.name} className="font-bold text-slate-600 leading-tight"><span className="text-slate-400">{file.name}</span> → {voice.code ? <b className="text-emerald-700">{voice.code} </b> : null}{voice.text.slice(0, 50)} • {voice.targets.some(t => t.slot === 'main') ? 'üst görsel' : 'şık görseli'} ({targetCount(voice)} yer)</li>
              ))}</ul>
            </details>
          )}
          {r.ambiguous.length > 0 && (
            <details open><summary className="cursor-pointer font-black text-amber-700">belirsiz (adı daha uzun yazın)</summary>
              <ul className="mt-1 space-y-1 max-h-48 overflow-y-auto">{r.ambiguous.map(({ file, candidates, total }) => (
                <li key={file.name} className="font-bold text-slate-600 leading-tight"><span className="text-amber-700">{file.name}</span> → {total} metinle başlıyor: {candidates.map(c => `“${c.slice(0, 60)}…”`).join(' / ')}</li>
              ))}</ul>
            </details>
          )}
          {r.none.length > 0 && (
            <details><summary className="cursor-pointer font-black text-red-700">bulunamadı (bu kapsamda böyle bir şık yok)</summary>
              <ul className="mt-1 max-h-40 overflow-y-auto">{r.none.map(({ file }) => <li key={file.name} className="font-bold text-slate-600">{file.name}</li>)}</ul>
            </details>
          )}
          {r.missing.length > 0 && (
            <button type="button" onClick={() => downloadText(`gorseli-olmayan-siklar-${bank.id}.txt`, r.missing.map(v => (v.code ? v.code + ' ' : '') + v.text).join('\n'))} className="px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 font-black text-[11px] flex items-center gap-1.5 hover:bg-indigo-50">
              <Download size={12} /> görseli gelmeyen {r.missing.length} şık metnini indir
            </button>
          )}
          <button type="button" disabled={!!busy || r.ok.length === 0} onClick={run} className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs shadow disabled:opacity-40 flex items-center justify-center gap-2">
            <ImageIcon size={16} /> {r.ok.length} görseli yükle ve yerleştir
          </button>
        </div>
      )}

      {busy && <div className="flex items-center gap-2 text-xs font-black text-emerald-700"><Loader2 size={14} className="animate-spin" /> {busy}</div>}

      {report && (
        <div className="bg-white rounded-2xl border-2 border-green-300 p-3 text-xs font-bold text-slate-700 space-y-1">
          <div className="font-black text-green-700 flex items-center gap-1.5"><CheckCircle2 size={14} /> tamamlandı</div>
          <div>yüklenen görsel: {report.uploaded}{report.skippedExisting ? ` • kendi görseli olduğu için atlanan: ${report.skippedExisting}` : ''}</div>
          <div>yerleşen şık görseli: {report.placed}{report.main ? ` • üst görsel: ${report.main}` : ''}</div>
          <div>güncellenen kayıtlı soru: {report.savedPatched}</div>
          {report.failed.length > 0 && <div className="text-red-700">yüklenemeyen: {report.failed.join(', ')} — tekrar seçip çalıştırabilirsiniz.</div>}
        </div>
      )}
    </div>
  );
}
