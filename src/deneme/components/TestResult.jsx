import React, { useRef, useEffect } from 'react';
import { makeAudio } from '../utils/audioLevel';
import { ThumbsUp } from 'lucide-react';
import { loadConfetti } from '../utils/confetti';
import { DEFAULT_APPLAUSE_SOUND } from '../constants';

// ============================================================================
// --- GRUP: TEST SONUÇ EKRANI (TEST RESULT) ---
// ============================================================================
export function TestResult({ result, onBack, settings }) {
  const score = Math.round((result.correctCount / (result.correctCount + result.wrongCount || 1)) * 100);
  const isPerfect = score === 100;
  const audioRef = useRef(null);

  useEffect(() => {
    let audioSrc = null;
    if (isPerfect) {
        loadConfetti().then(c => c({ particleCount: 150, spread: 70 }));
        audioSrc = settings?.successAudio || DEFAULT_APPLAUSE_SOUND;
    } else {
        audioSrc = settings?.failureAudio;
    }

    if (audioSrc) {
        const audio = makeAudio(audioSrc);
        audioRef.current = audio;
        audio.play().catch(e => console.log("otomatik ses çalma engellendi:", e));
    }

    return () => {
        if (audioRef.current) {
           audioRef.current.pause();
           audioRef.current.currentTime = 0;
        }
    };
  }, [isPerfect, settings]);

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 animate-in zoom-in">
      <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6">
         <div className="flex justify-center">
            {isPerfect ? <div className="text-8xl animate-bounce">🏆</div> : <div className="p-4 bg-orange-100 rounded-full text-orange-500 animate-pulse"><ThumbsUp size={64} /></div>}
         </div>
         <div>
             <h2 className="text-4xl font-black text-slate-800 tracking-tight">{isPerfect ? "mükemmel!" : "gayretin harika!"}</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{isPerfect ? `${result.testName} tamamlandı` : "biraz daha çalışmalısın"}</p>
         </div>
         {result.starsGained > 0 && (
           <div className="bg-yellow-50 border-4 border-yellow-300 rounded-3xl py-3 flex items-center justify-center gap-2 animate-in zoom-in">
             <span className="text-4xl">⭐</span>
             <span className="text-3xl font-black text-amber-600">+{result.starsGained}</span>
             <span className="text-xs font-bold text-amber-500 uppercase leading-tight text-left">yıldız<br/>kazandın</span>
           </div>
         )}
         {result.unlockedNext && <div className="text-sm font-black text-green-600">🏝️ yeni ada açıldı!</div>}
         <div className="grid grid-cols-2 gap-4"><div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100"><div className="text-4xl font-black text-green-600">{result.correctCount}</div><div className="text-[10px] font-bold text-green-400 uppercase">doğru</div></div><div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100"><div className="text-4xl font-black text-red-600">{result.wrongCount}</div><div className="text-[10px] font-bold text-red-400 uppercase">yanlış/boş</div></div></div>
         <button onClick={onBack} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] text-xl shadow-lg active:scale-95 transition-all">{result.isGame ? (result.unlockedNext ? 'sonraki adaya geç 🏝️' : 'haritaya dön 🗺️') : 'ana sayfaya dön'}</button>
      </div>
    </div>
  );
}
