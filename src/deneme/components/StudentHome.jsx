import React, { useState, useEffect } from 'react';
import { CheckCircle, Play, Loader2, Star, School, BookOpen, RefreshCw, ChevronRight, Trophy } from 'lucide-react';
import { calculateStudentStars, getTestCompletion } from '../utils/studentStats';
import { FancyAudioPlayer } from './common/AudioPlayers';

// ============================================================================
// --- GRUP: ÖĞRENCİ ANA SAYFASI (STUDENT HOME) ---
// ============================================================================
export function StudentHome({ child, tests, questions, responses, onStartTest, enterFullscreen, onInspect, settings, welcomePlayed, setWelcomePlayed, fetchQuestionsOnDemand }) {
  const [loadingTestId, setLoadingTestId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedTest, setSelectedTest] = useState(null);
  // Test kartına dokununca sorular hemen arka planda yüklenmeye başlar: "testi çöz"e basınca beklemeden açılır
  useEffect(() => {
    if (selectedTest && fetchQuestionsOnDemand) { try { fetchQuestionsOnDemand(selectedTest); } catch (_) {} }
  }, [selectedTest?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const publishedTests = tests.filter(t => t.isPublished);

  const totalStars = calculateStudentStars(child, tests, responses);
  const shouldAutoPlay = settings?.welcomeAutoPlay && !welcomePlayed;

  useEffect(() => {
    if (shouldAutoPlay) setWelcomePlayed(true);
  }, [shouldAutoPlay, setWelcomePlayed]);

  const getTestStatus = (test) => getTestCompletion(child, test, responses);

  const [loadError, setLoadError] = useState("");

  // Test SADECE tüm soruları eksiksiz yüklendiğinde başlar (eksik soruyla başlamaz)
  const handleStartClick = async (test) => {
      if (enterFullscreen) enterFullscreen();
      setLoadError("");
      setLoadingTestId(test.id);
      const result = await fetchQuestionsOnDemand(test);
      setLoadingTestId(null);
      if (result && result.ok === false) {
        setLoadError("sorular tam yüklenemedi. internet bağlantını kontrol edip tekrar dene.");
        return;
      }
      onStartTest((result && result.test) || test, false);
  };

  const activeTestsList = publishedTests.filter(t => getTestStatus(t) !== 'perfect');
  const solvedTestsList = publishedTests.filter(t => getTestStatus(t) === 'perfect');

  if (selectedTest) {
      const status = getTestStatus(selectedTest);
      const isSolved = status === 'perfect';
      return (
          <div className="w-full max-w-2xl mx-auto space-y-4 text-center animate-in fade-in pb-20 mt-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border-b-8 border-indigo-100 flex flex-col items-center gap-4">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white ${isSolved ? 'bg-green-500' : 'bg-orange-500'}`}>
                      {isSolved ? <CheckCircle size={40}/> : <Play size={40}/>}
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">{selectedTest.name}</h2>
                  <p className="text-slate-500 font-bold">
                      {isSolved ? "bu testi daha önce harika bir şekilde tamamladın. tekrar çözmek ister misin?" : "testi çözmeye hazır mısın?"}
                  </p>
                  {loadError && (
                      <div className="w-full bg-red-50 border-2 border-red-200 text-red-600 font-bold text-sm rounded-2xl p-3">{loadError}</div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                      <button onClick={() => setSelectedTest(null)} className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200">
                          geri dön
                      </button>
                      <button onClick={() => handleStartClick(selectedTest)} disabled={loadingTestId !== null} className={`flex-[2] py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 ${isSolved ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                          {loadingTestId === selectedTest.id ? <Loader2 className="animate-spin"/> : (isSolved ? "tekrar çöz" : "testi çöz")}
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 text-center animate-in fade-in pb-20">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border-b-8 border-orange-100 flex flex-col relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between gap-4 px-2">
            <div className="flex flex-col items-center justify-center animate-in zoom-in duration-500">
              <Star size={64} className="text-yellow-400 fill-yellow-400 drop-shadow-xl animate-pulse" />
              <span className="font-black text-3xl text-slate-700 -mt-2 drop-shadow-sm">{totalStars}</span>
          </div>
            <div className="relative shrink-0">
              {child.photo ? (
                <img src={child.photo} draggable="false" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" alt={child.name} />
                ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl flex items-center justify-center bg-indigo-50 text-indigo-500">
                    <School size={64} strokeWidth={1.5} />
                </div>
                )}
          </div>
            <div className="flex flex-col items-center justify-center">
              {settings && settings.welcomeAudio && (
                  <FancyAudioPlayer
                    src={settings.welcomeAudio}
                    autoPlay={shouldAutoPlay}
                    label="mesaj"
                    color="orange"
                    size="small"
                  />
                )}
          </div>
        </div>
        <div className="relative z-10 mt-4">
          <h2 className="text-2xl font-black text-slate-800">merhaba, {child.name}!</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">iyi dersler</p>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-200 p-1 rounded-2xl">
        <button onClick={() => setActiveTab('active')} className={`flex-[3] flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'active' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:bg-slate-300'}`}>
          <BookOpen size={16}/> <span className="hidden sm:inline">aktif testler</span>
        </button>
        <button onClick={() => setActiveTab('solved')} className={`flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'solved' ? 'bg-white text-green-600 shadow' : 'text-slate-500 hover:bg-slate-300'}`}>
          <CheckCircle size={14}/> <span className="hidden sm:inline">çözülmüş testler</span>
        </button>
      </div>

      <div className="grid gap-3">
        {(activeTab === 'active' ? activeTestsList : solvedTestsList).map((t, index) => {
          const status = getTestStatus(t);
          let borderClass = "border-slate-200";
          let icon = <BookOpen size={20}/>;
          let statusText = "";
          let iconBg = "bg-slate-100 text-slate-400";

          if (status === 'new') { borderClass = "border-orange-400 ring-2 ring-orange-100"; iconBg = "bg-orange-500 text-white animate-pulse"; statusText = "başla"; icon = <Play size={20} fill="currentColor"/>; }
          else if (status === 'retry') { borderClass = "border-yellow-400"; iconBg = "bg-yellow-400 text-white"; statusText = "tekrar et"; icon = <RefreshCw size={20}/>; }
          else if (status === 'perfect') { borderClass = "border-green-400"; iconBg = "bg-green-500 text-white"; statusText = "çözüldü"; icon = <CheckCircle size={20}/>; }

          return (
            <button key={t.id} onClick={() => { if (enterFullscreen) enterFullscreen(); setSelectedTest(t); }} className={`bg-white p-4 rounded-2xl shadow-sm border-b-4 flex justify-between items-center transition-all active:scale-95 ${borderClass}`}>
              <div className="flex items-center gap-3">
               <div className="w-8 flex items-center justify-center font-black text-2xl text-slate-300">
                   {index + 1}.
               </div>
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${iconBg}`}>
                  {icon}
               </div>
               <div className="text-left">
                <div className="font-black text-slate-800 text-sm line-clamp-1">{t.name}</div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase border px-1.5 rounded">{t.questionIds?.length || 0} soru</span>
                    {statusText && <span className={`text-[9px] font-black px-2 py-0.5 rounded text-white ${status === 'new' ? 'bg-orange-400' : (status === 'perfect' ? 'bg-green-500' : 'bg-yellow-400')}`}>{statusText}</span>}
                </div>
               </div>
              </div>
              <ChevronRight className="text-slate-300"/>
            </button>
          );
        })}

        {activeTab === 'active' && activeTestsList.length === 0 && (
            <div className="bg-green-50 text-green-600 p-8 rounded-2xl border-2 border-green-100 mt-4 flex flex-col items-center justify-center gap-2 animate-in zoom-in">
                <Trophy size={48} className="text-green-500 animate-bounce"/>
                <span className="font-black text-xl">harikasın!</span>
                <span className="text-sm font-bold opacity-80">bekleyen tüm testleri bitirdin.</span>
            </div>
        )}

        {activeTab === 'solved' && solvedTestsList.length === 0 && (
            <div className="bg-slate-50 text-slate-400 p-8 rounded-2xl border-2 border-slate-100 mt-4 flex flex-col items-center justify-center gap-2 animate-in zoom-in">
                <Star size={48} className="text-slate-300"/>
                <span className="font-black text-xl">henüz yok</span>
                <span className="text-sm font-bold opacity-80">tamamladığın testler burada görünecek.</span>
            </div>
        )}
      </div>
    </div>
  );
}
