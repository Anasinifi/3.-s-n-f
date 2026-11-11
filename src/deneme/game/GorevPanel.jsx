import React, { useEffect, useMemo, useState } from 'react';
import './game.css';
import { Avatar } from './Avatar';
import { StarShape, DiamondShape } from './Celebration';
import { getDisplayStatus, getRewardFor, getDiamondRewardFor } from './progress';
import { sfx, say } from './fx';
import { FancyAudioPlayer } from '../components/common/AudioPlayers';

// ============================================================================
// --- GRUP: ÖDEVLER (haritanın sol tarafındaki "ödev" sekmesi) ---
// ============================================================================
// * Öğretmenin "ödev" olarak yayınladığı testler burada liste hâlinde durur
//   (eski test listesi görünümü, daha renkli).
// * Yeni ödevler üstte; çözülenler "tamamladıklarım" sekmesinde durmaya devam eder.
// * Yanlışlı bitirilen ödevde "yanlışlarını çöz" düğmesi: sadece yanlış sorular gelir.

const CARD_COLORS = [
  ['#fb7185', '#f43f5e'], ['#fbbf24', '#f59e0b'], ['#34d399', '#10b981'], ['#60a5fa', '#3b82f6'],
  ['#a78bfa', '#8b5cf6'], ['#f472b6', '#ec4899'], ['#2dd4bf', '#14b8a6'], ['#fb923c', '#f97316'],
];

const dayLabel = (t) => {
  let d = null;
  if (t?.publishedAt) d = new Date(t.publishedAt);
  else if (t?.createdAt?.seconds) d = new Date(t.createdAt.seconds * 1000);
  if (!d || isNaN(d.getTime())) return '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const that = new Date(d); that.setHours(0, 0, 0, 0);
  const diff = Math.round((today - that) / 86400000);
  if (diff <= 0) return 'bugün';
  if (diff === 1) return 'dün';
  if (diff < 7) return `${diff} gün önce`;
  return `${that.getDate()}.${that.getMonth() + 1}`;
};

const STATUS = {
  new: { label: 'yeni!', cls: 'bg-orange-500', icon: '▶' },
  started: { label: 'devam et', cls: 'bg-amber-400', icon: '↻' },
  completed: { label: 'yanlışını düzelt', cls: 'bg-pink-500', icon: '✎' },
  perfect: { label: 'tamamlandı', cls: 'bg-green-500', icon: '✓' },
};

function RewardChips({ test, cfg, small = false }) {
  const r = getRewardFor(test, cfg);
  const d = getDiamondRewardFor(test, cfg);
  const sz = small ? 16 : 20;
  return (
    <span className="inline-flex items-center gap-1.5">
      {r.perfect > 0 && <span className="inline-flex items-center gap-0.5 bg-yellow-100 text-amber-700 rounded-full pl-0.5 pr-2 py-0.5 text-xs font-black border border-yellow-300"><StarShape size={sz} />{r.perfect}</span>}
      {d.perfect > 0 && <span className="inline-flex items-center gap-0.5 bg-cyan-100 text-cyan-700 rounded-full pl-0.5 pr-2 py-0.5 text-xs font-black border border-cyan-300"><DiamondShape size={sz} />{d.perfect}</span>}
    </span>
  );
}

export function GorevPanel({ child, game, itemMap, tests, responses, cfg, stars, diamonds, kind = 'deneme', settings, onClose, onStart, onFix, loadingTestId, loadError, clearError, seenIds = [], onSeen, welcomePlayed, setWelcomePlayed }) {
  const [tab, setTab] = useState('active');
  const [selected, setSelected] = useState(null);
  const title = kind === 'ana' ? 'ödevlerim' : 'günlük ödevler';

  useEffect(() => { sfx('gorevWelcome'); }, []);

  const list = useMemo(() => tests.map((t, i) => ({ t, i, status: getDisplayStatus(child, t, responses) })), [tests, child, responses]);
  const active = list.filter(x => x.status !== 'perfect');
  const solved = list.filter(x => x.status === 'perfect');
  const seen = useMemo(() => new Set(seenIds || []), [seenIds]);

  // Panel açılınca görülen ödevler "yeni" rozetinden düşer (kısa gecikmeyle: çocuk rozeti bir kez görsün)
  useEffect(() => {
    const ids = tests.map(t => t.id).filter(id => !seen.has(id));
    if (!ids.length || !onSeen) return undefined;
    const tm = setTimeout(() => onSeen(ids), 2500);
    return () => clearTimeout(tm);
  }, [tests.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = tab === 'active' ? active : solved;
  const shouldAutoPlay = settings?.welcomeAutoPlay && !welcomePlayed;
  useEffect(() => { if (shouldAutoPlay) setWelcomePlayed?.(true); }, [shouldAutoPlay, setWelcomePlayed]);

  const sel = selected && list.find(x => x.t.id === selected);

  return (
    <div className="ca-game fixed inset-0 z-[90] overflow-hidden select-none ca-slidein-left" style={{ background: 'linear-gradient(160deg,#fdf2f8 0%,#ede9fe 38%,#e0f2fe 70%,#ecfccb 100%)' }}>
      {/* renkli hareketli lekeler */}
      <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full ca-blob pointer-events-none" style={{ background: 'radial-gradient(circle,#f9a8d4 0%,#f9a8d400 70%)' }} />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full ca-blob pointer-events-none" style={{ background: 'radial-gradient(circle,#a5b4fc 0%,#a5b4fc00 70%)', animationDelay: '-4s' }} />
      <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full ca-blob pointer-events-none" style={{ background: 'radial-gradient(circle,#86efac 0%,#86efac00 70%)', animationDelay: '-8s' }} />

      <div className="relative h-full flex flex-col max-w-2xl mx-auto">
        {/* ÜST */}
        <div className="shrink-0 px-3 flex items-center justify-between gap-2" style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}>
          <button onClick={() => { sfx('whoosh'); onClose(); }} className="h-12 pl-3 pr-4 rounded-2xl bg-white shadow-lg border-4 border-white text-lg font-extrabold text-indigo-600 active:scale-95 flex items-center gap-1">
            <span className="text-2xl leading-none">‹</span> harita 🗺️
          </button>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 bg-yellow-300 border-[3px] border-white rounded-full pl-0.5 pr-2 py-0.5 shadow-lg"><StarShape size={24} /><span className="text-lg font-extrabold text-amber-900">{stars}</span></div>
            <div className="flex items-center gap-0.5 bg-cyan-300 border-[3px] border-white rounded-full pl-0.5 pr-2 py-0.5 shadow-lg"><DiamondShape size={24} /><span className="text-lg font-extrabold text-cyan-900">{diamonds >= 999999 ? '∞' : diamonds}</span></div>
          </div>
        </div>

        {/* MERHABA KARTI */}
        <div className="shrink-0 mx-3 mt-2 rounded-[2rem] p-3 shadow-xl border-4 border-white relative overflow-hidden" style={{ background: 'linear-gradient(120deg,#f97316 0%,#ec4899 50%,#8b5cf6 100%)' }}>
          <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg,#fff 0 10px,transparent 10px 24px)' }} />
          <div className="relative flex items-center gap-3">
            <div className="w-20 h-24 shrink-0 bg-white/25 rounded-3xl flex items-end justify-center overflow-hidden">
              {child?.photo && kind === 'ana' ? <img src={child.photo} alt="" draggable="false" className="w-full h-full object-cover" /> : <div className="w-[76px] h-[92px] ca-bob"><Avatar game={game} itemMap={itemMap} fluid view="0 -34 200 270" /></div>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white/90 text-xs font-extrabold uppercase tracking-widest">{title}</div>
              <div className="text-white text-2xl font-black leading-tight truncate" style={{ textShadow: '0 2px 0 rgba(0,0,0,.25)' }} onClick={() => say(`merhaba ${child?.name || ''}`)}>merhaba, {child?.name}!</div>
              <div className="text-white/95 text-sm font-bold mt-0.5">{active.length ? `${active.length} ödevin seni bekliyor` : 'bütün ödevlerini bitirdin! 🎉'}</div>
            </div>
            {settings?.welcomeAudio && <div className="shrink-0"><FancyAudioPlayer src={settings.welcomeAudio} autoPlay={shouldAutoPlay} label="mesaj" color="orange" size="small" /></div>}
          </div>
        </div>

        {/* SEKMELER */}
        <div className="shrink-0 mx-3 mt-3 flex gap-2 bg-white/70 backdrop-blur p-1.5 rounded-2xl shadow">
          <button onClick={() => { sfx('tap'); say('ödevler'); setTab('active'); }} className={`flex-[3] py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'active' ? 'bg-gradient-to-b from-orange-400 to-pink-500 text-white shadow-lg' : 'text-slate-500'}`}>📋 ödevler ({active.length})</button>
          <button onClick={() => { sfx('tap'); say('tamamladıklarım'); setTab('solved'); }} className={`flex-[2] py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'solved' ? 'bg-gradient-to-b from-emerald-400 to-green-600 text-white shadow-lg' : 'text-slate-500'}`}>✅ bitenler ({solved.length})</button>
        </div>

        {/* LİSTE */}
        <div className="flex-1 min-h-0 overflow-y-auto ca-scroll px-3 pt-3 pb-24 space-y-2.5">
          {shown.map(({ t, i, status }, k) => {
            const [c1, c2] = CARD_COLORS[i % CARD_COLORS.length];
            const st = STATUS[status] || STATUS.new;
            const isNew = !seen.has(t.id) && status === 'new';
            const dl = dayLabel(t);
            return (
              <button key={t.id} onClick={() => { sfx('tap'); clearError?.(); setSelected(t.id); }} className="ca-cardin relative w-full text-left rounded-[1.6rem] p-[3px] shadow-lg active:scale-[0.98] transition-transform" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, animationDelay: `${Math.min(k, 8) * 0.05}s` }}>
                <div className="bg-white rounded-[1.4rem] p-3 flex items-center gap-3">
                  <div className="w-14 h-14 shrink-0 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-inner" style={{ background: `linear-gradient(160deg, ${c1}, ${c2})` }}>
                    <span className="text-[10px] leading-none opacity-90">ödev</span>
                    <span className="text-2xl leading-none">{k + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-slate-800 text-[15px] leading-tight line-clamp-2">{t.name}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full text-white ${st.cls}`}>{st.icon} {st.label}</span>
                      <span className="text-[11px] font-bold text-slate-400">{t.questionIds?.length || 0} soru</span>
                      {dl && <span className="text-[11px] font-bold text-indigo-400">· {dl}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1"><RewardChips test={t} cfg={cfg} small /><span className="text-2xl text-slate-300 font-black leading-none">›</span></div>
                </div>
                {isNew && <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full border-2 border-white shadow ca-ribbon">YENİ</span>}
              </button>
            );
          })}
          {tab === 'active' && active.length === 0 && (
            <div className="ca-pop bg-white/90 rounded-[2rem] p-8 text-center shadow-lg border-4 border-green-200">
              <div className="text-6xl">🏆</div>
              <div className="text-2xl font-black text-green-600 mt-2">harikasın!</div>
              <div className="text-sm font-bold text-slate-500 mt-1">bekleyen bütün ödevlerini bitirdin. yeni ödevler gelince burada görünecek.</div>
            </div>
          )}
          {tab === 'solved' && solved.length === 0 && (
            <div className="ca-pop bg-white/90 rounded-[2rem] p-8 text-center shadow-lg border-4 border-slate-100">
              <div className="text-6xl">⭐</div>
              <div className="text-xl font-black text-slate-500 mt-2">henüz yok</div>
              <div className="text-sm font-bold text-slate-400 mt-1">tamamladığın ödevler burada durur.</div>
            </div>
          )}
        </div>
      </div>

      {/* ÖDEV KARTI */}
      {sel && (() => {
        const { t, i, status } = sel;
        const [c1, c2] = CARD_COLORS[i % CARD_COLORS.length];
        const loading = loadingTestId === t.id;
        return (
          <div className="absolute inset-0 z-10 bg-slate-900/55 flex items-end sm:items-center justify-center p-3" onClick={() => setSelected(null)}>
            <div className="ca-pop bg-white w-full max-w-sm rounded-[2.2rem] p-5 text-center shadow-2xl border-4 border-white" onClick={e => e.stopPropagation()}>
              <div className="mx-auto -mt-14 w-24 h-24 rounded-[1.8rem] flex items-center justify-center text-5xl text-white shadow-xl border-4 border-white" style={{ background: `linear-gradient(160deg, ${c1}, ${c2})` }}>
                {status === 'perfect' ? '🏆' : status === 'completed' ? '✎' : '📋'}
              </div>
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-2">{title}</div>
              <div className="text-2xl font-black text-slate-800 leading-tight mt-1">{t.name}</div>
              <div className="flex justify-center items-center gap-2 mt-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-slate-100 text-slate-600">{t.questionIds?.length || 0} soru</span>
                <RewardChips test={t} cfg={cfg} />
              </div>
              <div className="mt-3 text-sm font-bold text-slate-500">
                {status === 'perfect' ? 'bu ödevi harika bitirdin! istersen tekrar çöz.' : status === 'completed' ? 'yanlışların vardı. sadece yanlışlarını çöz, ödülünü kap!' : 'ödeve hazır mısın?'}
              </div>
              {loadError && <div className="mt-3 bg-red-50 border-2 border-red-200 text-red-600 font-bold text-sm rounded-2xl p-2">{loadError}</div>}
              <div className="flex gap-2 mt-5">
                <button onClick={() => setSelected(null)} className="flex-1 py-4 rounded-2xl font-extrabold text-slate-500 bg-slate-100">geri</button>
                {status === 'completed' && onFix ? (
                  <button disabled={!!loadingTestId} onClick={() => { sfx('tap'); onFix(t); }} className="flex-[2] py-4 rounded-2xl font-extrabold text-white text-lg bg-gradient-to-b from-pink-400 to-fuchsia-600 shadow-lg active:scale-95 disabled:opacity-60 ca-nudge-soft">{loading ? 'yükleniyor...' : 'yanlışlarını çöz ⭐'}</button>
                ) : (
                  <button disabled={!!loadingTestId} onClick={() => { sfx('tap'); onStart(t); }} className={`flex-[2] py-4 rounded-2xl font-extrabold text-white text-xl shadow-lg active:scale-95 disabled:opacity-60 ${status === 'perfect' ? 'bg-gradient-to-b from-emerald-400 to-green-600' : 'bg-gradient-to-b from-orange-400 to-orange-600'}`}>{loading ? 'yükleniyor...' : status === 'perfect' ? 'tekrar çöz ↻' : 'başla ▶'}</button>
                )}
              </div>
              {status === 'completed' && onFix && <button disabled={!!loadingTestId} onClick={() => { sfx('tap'); onStart(t); }} className="mt-2 text-sm font-extrabold text-slate-400 underline">baştan çöz</button>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
