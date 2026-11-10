import React, { useEffect, useState, useRef } from 'react';
import { registerAdListener } from './ads';

// ============================================================================
// --- GRUP: REKLAM EKRANI (DENEME MODU + GERÇEK REKLAM YERİ) ---
// ============================================================================
export function AdOverlay() {
  const [req, setReq] = useState(null);
  const [left, setLeft] = useState(0);
  const insRef = useRef(null);

  useEffect(() => registerAdListener((r) => {
    setReq(r);
    setLeft(Math.max(3, Number(r.cfg?.adDurationSeconds) || 5));
  }), []);

  useEffect(() => {
    if (!req) return;
    const iv = setInterval(() => setLeft(l => (l > 0 ? l - 1 : 0)), 1000);
    // Gerçek reklam sağlayıcısı (AdSense) seçiliyse alanı doldurmayı dene
    if (req.cfg?.provider === 'adsense' && !req.cfg?.testMode) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
    }
    return () => clearInterval(iv);
  }, [req]);

  if (!req) return null;
  const close = () => { const d = req.done; setReq(null); d && d(); };
  const real = req.cfg?.provider === 'adsense' && !req.cfg?.testMode;

  return (
    <div className="ca-game fixed inset-0 z-[200000] bg-slate-900/90 flex items-center justify-center p-4">
      <div className="ca-pop bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl text-center">
        <div className="bg-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-widest py-1.5">reklam</div>
        <div className="p-6 min-h-[220px] flex flex-col items-center justify-center gap-3">
          {real ? (
            <ins ref={insRef} className="adsbygoogle" style={{ display: 'block', width: '100%', minHeight: 200 }}
              data-ad-client={req.cfg.adClient} data-ad-slot={req.cfg.adSlot} data-ad-format="auto" />
          ) : (
            <>
              <div className="text-6xl ca-bob">📣</div>
              <div className="text-xl font-extrabold text-slate-700">Deneme Reklamı</div>
              <div className="text-sm text-slate-500 font-semibold">Gerçek reklam bağlanınca burada görünecek.<br />Premium üyeler reklam görmez.</div>
            </>
          )}
        </div>
        <button disabled={left > 0} onClick={close}
          className={`w-full py-4 text-lg font-extrabold transition-all ${left > 0 ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white active:scale-95'}`}>
          {left > 0 ? `${left} sn sonra devam` : 'devam et ▶'}
        </button>
      </div>
    </div>
  );
}
