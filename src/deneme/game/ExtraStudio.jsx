import React, { useEffect, useMemo, useState } from 'react';
import { MediaUploader } from '../components/common/MediaUploader';
import { FX_EVENTS, ANIMATIONS, GAME_SOUNDS, SYNTH_NAMES, DEFAULT_EVENTS, DEFAULT_EXPLAIN, getFxConfig, playSound, setFxConfig, sfx, say, wordKey } from './fx';
import { mergeGameConfig, saveGameConfig, getItemMap, normalizeGame } from './gameConfig';
import { DIFFICULTIES, ROOM_TYPES } from './catalog';
import { Celebration } from './Celebration';

// ============================================================================
// --- GRUP: YÖNETİCİ > EKSTRA > KUTLAMA VE SES STÜDYOSU ---
// ============================================================================
// * Her test sonu durumu için ayrı animasyon, efekt sesi, konuşma sesi, resim/gif, başlık ve mesaj.
// * Yanlışla bitirince çıkan "açıklama ekranı": kolay / orta / zor için ayrı metin, resim ve ses.
// * Oyun sesleri: satın alma, ağaç kesme, yüzme, kapı... her birine kendi sesinizi yükleyin.
// Kaydedince settings/game_config belgesinin "fx" alanına yazılır (deneme projesi alanı).

const box = 'bg-white p-4 sm:p-5 rounded-3xl border-2 border-indigo-50 shadow-sm';
const lbl = 'text-[10px] font-black text-slate-500 uppercase';
const inp = 'w-full p-2 border-2 rounded-xl font-bold outline-none focus:border-indigo-500 text-sm bg-white';
const btn = 'px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50';

const SYNTH_LABELS = { pop: 'pıt', coin: 'para', chime: 'zil', fanfare: 'fanfar', sparkle: 'pırıltı', boing: 'boing', whoosh: 'vuuş', splash: 'şıpırtı', chop: 'balta', thud: 'gümm', soft: 'yumuşak', sad: 'üzgün' };

export function ExtraStudio({ db, appId, cfg, setCfg }) {
  const [fx, setFx] = useState(() => JSON.parse(JSON.stringify(mergeGameConfig(cfg).fx)));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState('first_perfect');
  const [preview, setPreview] = useState(null);
  const [sec, setSec] = useState('events');

  useEffect(() => { if (!dirty) setFx(JSON.parse(JSON.stringify(mergeGameConfig(cfg).fx))); }, [cfg]); // eslint-disable-line

  const full = useMemo(() => getFxConfig({ fx }), [fx]);
  const itemMap = useMemo(() => getItemMap(cfg), [cfg]);
  const game = normalizeGame(null);

  const setEv = (id, patch) => { setFx(f => ({ ...f, events: { ...f.events, [id]: { ...(f.events?.[id] || {}), ...patch } } })); setDirty(true); };
  const setEx = (d, patch) => { setFx(f => ({ ...f, explain: { ...f.explain, [d]: { ...(f.explain?.[d] || {}), ...patch } } })); setDirty(true); };
  const setSnd = (id, url) => { setFx(f => ({ ...f, sounds: { ...f.sounds, [id]: url } })); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      const next = { ...mergeGameConfig(cfg), fx };
      await saveGameConfig(db, appId, next);
      setCfg(mergeGameConfig(next));
      setFxConfig(next);
      setDirty(false);
    } catch (e) { console.error(e); alert('kaydedilemedi: ' + (e?.message || '')); }
    setSaving(false);
  };

  const sample = (id, diff = 'easy') => {
    const perfect = id.includes('perfect') || id === 'map_done';
    const r = { perfect: 3, completed: 1 };
    return {
      starsGained: id === 'first_perfect' ? 3 : id === 'retry_perfect' ? 2 : id === 'first_completed' ? 1 : 0,
      reward: r, difficulty: diff, correct: perfect ? 10 : 8, wrong: perfect ? 0 : 2,
      testName: 'Örnek Test', newStatus: perfect ? 'perfect' : 'completed', unlockedNext: id === 'first_completed' || id === 'first_perfect',
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
        {[['events', '🎉 test sonu animasyonları'], ['explain', '⭐ "tam çözersen" açıklaması'], ['sounds', '🔊 oyun sesleri']].map(([id, l]) => (
          <button key={id} onClick={() => setSec(id)} className={`flex-1 min-w-[150px] py-2 px-2 rounded-xl text-xs font-black ${sec === id ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {sec === 'events' && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 px-1">her durum için ayrı animasyon ve ses seçin. "efekt sesi" animasyonla birlikte çalar; "konuşma sesi" (ör. kendi sesinizle "aferin!") hemen ardından çalar. resim/gif yüklerseniz animasyonun üstünde görünür.</p>
          {FX_EVENTS.map(e => {
            const ev = full.events[e.id];
            const isOpen = open === e.id;
            return (
              <div key={e.id} className={`${box} !p-3 ${ev.enabled === false ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setOpen(isOpen ? null : e.id)}>
                  <span className="text-2xl">{e.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-slate-800">{e.label}</div>
                    <div className="text-[11px] font-bold text-slate-400 truncate">{e.hint} · {ANIMATIONS.find(a => a.id === ev.anim)?.label}</div>
                  </div>
                  <button onClick={(x) => { x.stopPropagation(); setPreview({ kind: e.id, diff: 'easy' }); }} className={`${btn} bg-slate-800 text-white`}>▶ önizle</button>
                  <span className="text-slate-400 font-black">{isOpen ? '▲' : '▼'}</span>
                </div>
                {isOpen && (
                  <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-600 sm:col-span-2"><input type="checkbox" checked={ev.enabled !== false} onChange={x => setEv(e.id, { enabled: x.target.checked })} /> bu ekran gösterilsin</label>
                    <div><div className={lbl}>animasyon</div>
                      <select className={inp} value={ev.anim} onChange={x => setEv(e.id, { anim: x.target.value })}>{ANIMATIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</select>
                    </div>
                    <div><div className={lbl}>hazır ses (dosya yüklemezseniz)</div>
                      <div className="flex gap-1">
                        <select className={inp} value={ev.synth || ''} onChange={x => setEv(e.id, { synth: x.target.value })}>
                          <option value="">sessiz</option>
                          {SYNTH_NAMES.map(n => <option key={n} value={n}>{SYNTH_LABELS[n] || n}</option>)}
                        </select>
                        <button onClick={() => playSound(ev.sound || ev.synth)} className={`${btn} bg-slate-100`}>🔈</button>
                      </div>
                    </div>
                    <div><div className={lbl}>başlık</div><input className={inp} value={ev.title || ''} onChange={x => setEv(e.id, { title: x.target.value })} placeholder={DEFAULT_EVENTS[e.id]?.title} /></div>
                    <div><div className={lbl}>mesaj</div><textarea rows={2} className={inp} value={ev.message || ''} onChange={x => setEv(e.id, { message: x.target.value })} placeholder={DEFAULT_EVENTS[e.id]?.message} /></div>
                    <MediaUploader label="efekt sesi (alkış, patlama...)" value={ev.sound || ''} onChange={v => setEv(e.id, { sound: v })} id={`fx-snd-${e.id}`} type="audio" small />
                    <MediaUploader label="konuşma sesi (sizin sesiniz)" value={ev.voice || ''} onChange={v => setEv(e.id, { voice: v })} id={`fx-voice-${e.id}`} type="audio" small />
                    <div className="sm:col-span-2"><MediaUploader label="resim / gif (isteğe bağlı, animasyonun üstünde)" value={ev.image || ''} onChange={v => setEv(e.id, { image: v })} id={`fx-img-${e.id}`} small /></div>
                    {(e.id === 'first_completed' || e.id === 'retry_completed') && (
                      <label className="flex items-center gap-2 text-xs font-black text-amber-700 sm:col-span-2"><input type="checkbox" checked={!!ev.showExplain} onChange={x => setEv(e.id, { showExplain: x.target.checked })} /> altında "tam çözersen kaç yıldız olur" açıklaması çıksın</label>
                    )}
                    <div className="sm:col-span-2 flex gap-2 flex-wrap">
                      {(ev.sound || ev.voice || ev.image) && <button onClick={() => setEv(e.id, { sound: '', voice: '', image: '' })} className={`${btn} bg-red-50 text-red-500`}>yüklenenleri kaldır</button>}
                      <button onClick={() => { setFx(f => { const n = { ...f, events: { ...f.events } }; delete n.events[e.id]; return n; }); setDirty(true); }} className={`${btn} bg-slate-100 text-slate-500`}>varsayılana dön</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sec === 'explain' && (
        <div className="space-y-3">
          <div className={box}>
            <h4 className="font-black text-indigo-600 text-sm mb-1">yanlışla bitirince çıkan açıklama</h4>
            <p className="text-[11px] font-bold text-slate-500">çocuk testi yanlışla bitirince "1 yıldız aldın, yanlışlarını düzeltip TAM çözersen 3 yıldız olur" gibi bir ekran görür: dolu ve boş yıldızlar, "tam çöz" oku. metinde şunları kullanabilirsiniz: <b>{'{kazandin}'}</b> (aldığı yıldız), <b>{'{tam}'}</b> (tam çözünce toplam), <b>{'{eksik}'}</b> (kalan), <b>{'{zorluk}'}</b>.</p>
          </div>
          {DIFFICULTIES.map(d => {
            const ex = full.explain[d.id];
            return (
              <div key={d.id} className={box + ' grid sm:grid-cols-2 gap-3'}>
                <div className="sm:col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm"><span className="w-3 h-3 rounded-full" style={{ background: d.color }} />{d.label} test</div>
                  <button onClick={() => setPreview({ kind: 'first_completed', diff: d.id })} className={`${btn} bg-slate-800 text-white`}>▶ önizle</button>
                </div>
                <div className="sm:col-span-2"><div className={lbl}>metin</div><textarea rows={2} className={inp} value={ex.text || ''} onChange={x => setEx(d.id, { text: x.target.value })} placeholder={DEFAULT_EXPLAIN[d.id].text} /></div>
                <MediaUploader label="açıklama sesi (sizin anlatımınız)" value={ex.voice || ''} onChange={v => setEx(d.id, { voice: v })} id={`fx-exv-${d.id}`} type="audio" small />
                <MediaUploader label="açıklama resmi (isteğe bağlı)" value={ex.image || ''} onChange={v => setEx(d.id, { image: v })} id={`fx-exi-${d.id}`} small />
              </div>
            );
          })}
        </div>
      )}

      {sec === 'sounds' && (
        <div className={box}>
          <h4 className="font-black text-indigo-600 text-sm mb-1">oyun içi sesler</h4>
          <p className="text-[11px] font-bold text-slate-500 mb-3">yüklemediğiniz sesler için tarayıcıda üretilen hazır sesler çalar. çocuk menüden sesleri kapatabilir.</p>
          <label className="flex items-center gap-2 text-xs font-black text-slate-600 mb-3"><input type="checkbox" checked={!!fx.muteDefaults} onChange={x => { setFx(f => ({ ...f, muteDefaults: x.target.checked })); setDirty(true); }} /> hazır sesleri kapat (sadece yüklediğim sesler çalsın)</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {GAME_SOUNDS.map(s => (
              <div key={s.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-black text-slate-700">{s.label}</div>
                  <button onClick={() => playSound(fx.sounds?.[s.id] || s.synth)} className={`${btn} !py-1 bg-white border`}>🔈 dinle</button>
                </div>
                <MediaUploader label={`${s.label} sesi`} value={fx.sounds?.[s.id] || ''} onChange={v => setSnd(s.id, v)} id={`fx-gs-${s.id}`} type="audio" small />
              </div>
            ))}
          </div>
          <h4 className="font-black text-indigo-600 text-sm mt-6 mb-1">🗣️ kelime sesleri (okuma bilmeyen çocuklar için)</h4>
          <p className="text-[11px] font-bold text-slate-500 mb-3">çocuk "salon", "mutfak", "saç", "evim" gibi bir yazıya dokununca kelime sesli okunur. ses yüklemezseniz telefonun Türkçe sesi okur; kendi sesinizi yüklerseniz o çalar. eşya adları da dokununca okunur.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {Array.from(new Set([...Object.values(ROOM_TYPES).map(r => r.name), ...(cfg?.customItems || []).filter(i => i.cat === 'house' && i.roomNames).flatMap(i => String(i.roomNames).split(',').map(x => x.trim()).filter(Boolean)), 'karakterim', 'evim', 'araçlarım', 'eşyalarım', 'ev planı', 'eşya ekle', 'duvar', 'zemin', 'bahçe', 'hayvanlar', 'mekan', 'çatı', 'boya', 'arabam', 'uçan aracım', 'teknem', 'Karakter', 'Saç', 'Saç Rengi', 'Üst', 'Alt', 'Ayakkabı', 'Şapka', 'Aksesuar']))
              .map(w => (
                <div key={w} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-black text-slate-700">"{w}"</div>
                    <button onClick={() => (fx.sounds?.[wordKey(w)] ? playSound(fx.sounds[wordKey(w)]) : say(w))} className={`${btn} !py-1 bg-white border`}>🔈 dinle</button>
                  </div>
                  <MediaUploader label={`"${w}" sesi`} value={fx.sounds?.[wordKey(w)] || ''} onChange={v => setSnd(wordKey(w), v)} id={`fx-w-${wordKey(w)}`} type="audio" small />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className={`flex items-center justify-between gap-2 p-3 rounded-2xl border-2 sticky bottom-3 z-30 shadow-lg ${dirty ? 'bg-amber-50 border-amber-300' : 'bg-green-50 border-green-200'}`}>
        <span className={`text-xs font-black ${dirty ? 'text-amber-700' : 'text-green-700'}`}>{dirty ? 'kaydedilmemiş değişiklik var' : 'kutlama ve ses ayarları güncel'}</span>
        <div className="flex gap-2">
          {dirty && <button onClick={() => { setFx(JSON.parse(JSON.stringify(mergeGameConfig(cfg).fx))); setDirty(false); }} className={`${btn} bg-white text-slate-500`}>geri al</button>}
          <button onClick={save} disabled={!dirty || saving} className={`${btn} bg-indigo-600 text-white`}>{saving ? 'kaydediliyor...' : 'kaydet'}</button>
        </div>
      </div>

      {preview && (
        <Celebration preview kind={preview.kind} ev={full.events[preview.kind]} explain={full.explain[preview.diff]} data={sample(preview.kind, preview.diff)}
          game={game} itemMap={itemMap} onDone={() => setPreview(null)} onRetry={() => setPreview(null)} />
      )}
    </div>
  );
}
