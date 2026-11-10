import React, { useState } from 'react';
import { collection, getDocsFromServer, query, where, orderBy, limit, startAfter, documentId, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Scissors } from 'lucide-react';

// ============================================================================
// --- BAKIM: 4 ŞIKLI KAYITLI SORULARI 3 ŞIKA ÇEVİR ---
// ============================================================================
// Yeni üretilen hazır sorular (BİLSEM, gölge, kavram) zaten 3 şıklı.
// Bu araç DAHA ÖNCE kaydedilmiş 4 şıklı soruları da 3 şıka indirir:
//   * doğru şık KORUNUR, yanlış şıklardan biri (sondaki) çıkarılır
//   * doğru şıkkın yeni sırası (correctIndex) otomatik düzeltilir
//   * şıklara ait renkli harf ayarları da birlikte kaydırılır
// Önce "tara" ile kaç soru etkileneceği görülür, sonra "dönüştür" denir.
// Not: Eski cevap kayıtlarında (analiz) öğrencinin seçtiği şık numarası değişmez;
// dönüştürülen sorularda eski cevapların "hangi şık" gösterimi kayabilir.

const SCOPES = [
  { id: 'bilsem', label: 'BİLSEM soruları', hint: 'hazır BİLSEM bankasından kaydedilenler' },
  { id: 'shadow', label: 'Gölge bulma soruları', hint: 'adı "… Gölge Bulma" ile başlayanlar' },
  { id: 'all', label: 'TÜM 4 şıklı sorular', hint: 'elle yazdığınız sorular dahil' }
];

const canTrim = (q) => Array.isArray(q.options) && q.options.length === 4
  && Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4
  && !q.questionType; // etkileşimli sorulara (sudoku, labirent...) dokunma

const isShadow = (q) => /G[öo]lge Bulma/i.test(q.name || '');

// Bir soruyu 3 şıka indirir (sondaki yanlış şık çıkar)
export const trimQuestion = (q) => {
  const drop = [3, 2, 1, 0].find(k => k !== q.correctIndex);
  const options = q.options.filter((_, k) => k !== drop);
  const correctIndex = q.correctIndex > drop ? q.correctIndex - 1 : q.correctIndex;
  const patch = { options, correctIndex };
  const lc = q.style && q.style.letterColors && q.style.letterColors.options;
  if (lc) {
    let next;
    if (Array.isArray(lc)) next = lc.filter((_, k) => k !== drop);
    else {
      next = {};
      Object.keys(lc).forEach(k => { const n = Number(k); if (n === drop) return; next[n > drop ? n - 1 : n] = lc[k]; });
    }
    patch.style = { ...q.style, letterColors: { ...q.style.letterColors, options: next } };
  }
  return patch;
};

export function OptionTrimTool({ db, appId, label }) {
  const [scope, setScope] = useState('bilsem');
  const [busy, setBusy] = useState('');
  const [found, setFound] = useState(null); // [{ id, data }]
  const [done, setDone] = useState(null);

  const qCol = collection(db, 'artifacts', appId, 'public', 'data', 'questions');

  const scan = async () => {
    setFound(null); setDone(null);
    const out = [];
    try {
      if (scope === 'bilsem') {
        setBusy('BİLSEM soruları taranıyor...');
        const snap = await getDocsFromServer(query(qCol, where('bilsemGroupKey', '>=', '')));
        snap.docs.forEach(d => { const q = d.data(); if (canTrim(q)) out.push({ id: d.id, data: q }); });
      } else {
        // sayfa sayfa tara (çok soru olsa da tarayıcı yorulmasın)
        let last = null; let page = 0; let seen = 0;
        for (;;) {
          page++;
          setBusy(`sorular taranıyor... ${seen}`);
          const parts = [orderBy(documentId()), limit(250)];
          if (last) parts.push(startAfter(last));
          const snap = await getDocsFromServer(query(qCol, ...parts));
          if (snap.empty) break;
          snap.docs.forEach(d => {
            const q = d.data();
            if (!canTrim(q)) return;
            if (scope === 'shadow' && !isShadow(q)) return;
            out.push({ id: d.id, data: q });
          });
          seen += snap.size;
          last = snap.docs[snap.docs.length - 1];
          if (snap.size < 250 || page > 400) break;
        }
      }
      setFound(out);
    } catch (e) {
      console.error(e);
      alert('tarama yapılamadı: ' + (e?.message || ''));
    }
    setBusy('');
  };

  const run = async () => {
    if (!found || found.length === 0) return;
    if (!window.confirm(`${label}: ${found.length} soru 3 şıka indirilecek. Doğru şıklar korunur, birer yanlış şık silinir. Devam edilsin mi?`)) return;
    let ok = 0; let fail = 0;
    for (let i = 0; i < found.length; i++) {
      const { id, data } = found[i];
      setBusy(`dönüştürülüyor... ${i + 1}/${found.length}`);
      try {
        await updateDoc(doc(qCol, id), { ...trimQuestion(data), updatedAt: serverTimestamp() });
        ok++;
      } catch (e) { console.error(e); fail++; }
    }
    setBusy('');
    setDone({ ok, fail });
    setFound(null);
  };

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 space-y-3">
      <div className="flex items-center gap-2 font-black text-amber-900"><Scissors size={18} /> {label}: 4 şıklı kayıtlı soruları 3 şıka çevir</div>
      <p className="text-xs font-bold text-amber-800/80">Yeni üretilen hazır sorular zaten 3 şıklı. Bu araç daha önce kaydedilmiş soruları düzeltir. Doğru şık korunur. Etkileşimli sorulara (sudoku, labirent, kodlama…) dokunulmaz.</p>
      <div className="flex flex-wrap gap-2">
        {SCOPES.map(s => (
          <button key={s.id} type="button" onClick={() => { setScope(s.id); setFound(null); setDone(null); }}
            className={`px-3 py-2 rounded-xl text-xs font-black border-2 text-left ${scope === s.id ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-600 border-amber-100'}`}>
            {s.label}<div className={`text-[10px] font-bold ${scope === s.id ? 'text-white/80' : 'text-slate-400'}`}>{s.hint}</div>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={!!busy} onClick={scan} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-black disabled:opacity-50">1) tara</button>
        <button type="button" disabled={!!busy || !found || found.length === 0} onClick={run} className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-black disabled:opacity-40">2) {found ? `${found.length} soruyu ` : ''}3 şıka çevir</button>
        {busy && <span className="text-xs font-black text-amber-800 flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> {busy}</span>}
        {found && !busy && <span className="text-xs font-black text-slate-700">{found.length} adet 4 şıklı soru bulundu.</span>}
        {done && <span className="text-xs font-black text-green-700">✓ {done.ok} soru 3 şıklı oldu{done.fail ? ` · ${done.fail} hata` : ''}. Açık paneldeki listeyi yenilemek için sayfayı yenileyin.</span>}
      </div>
    </div>
  );
}
