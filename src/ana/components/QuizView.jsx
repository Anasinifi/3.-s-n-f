import React, { useState, useRef, useEffect } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { Check, ArrowRight, X, Minimize, Maximize, Clock, CheckCircle } from 'lucide-react';
import { areDotLinesEqual, normalizeDotLines, DotGridPad } from '../activities/dotGrid';
import { areColorGridsEqual, normalizeColorCells, ColorGridPad } from '../activities/colorGrid';
import { checkSudokuValidAndComplete, SudokuGridPad } from '../activities/sudoku';
import { checkCodingQuestionAnswer, CodingActivityPad } from '../activities/coding';
import { checkPatternAnswer, ColorPatternPad } from '../activities/colorPattern';
import { checkSymmetryAnswer, SymmetryGridPad } from '../activities/symmetry';
import { checkMatrixShapeAnswer, MatrixShapePad } from '../activities/matrixShape';
import { checkMatrixPaintAnswer, MatrixPaintPad } from '../activities/matrixPaint';
import { checkNumberConnectAnswer, NumberConnectPad } from '../activities/numberConnect';
import { checkMazeAnswer, InteractiveMazePad } from '../activities/maze';
import { checkBarGraphAnswer, BarGraphActivityPad } from '../activities/barGraph';
import { checkSequenceAnswer, SequenceMemoryPad } from '../activities/sequenceMemory';
import { checkEventOrderAnswer, EventOrderPad } from '../activities/eventOrder';
import { checkMatchAnswer, MatchPairsPad } from '../activities/matchPairs';
import { speechTextOf } from '../activities/instructions';
import { TICK_TOCK_SOUND } from '../constants';
import { makeAudio } from '../utils/audioLevel';
import { FancyAudioPlayer, OptionAudioButton, SpeakButton, StoryPlayer, stopSpeak, storyPartsOf } from './common/AudioPlayers';
import { RenderTextWithHighlights } from './common/RenderTextWithHighlights';

// ============================================================================
// --- GRUP: TEST ÇÖZME EKRANI (QUIZ VIEW) ---
// ============================================================================
export function QuizView({ child, test, questions, onComplete, saveResponse, exitQuiz, isFullscreen, toggleFullscreen, settings }) {
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, details: [] });

  // --- SORU LİSTESİ SABİTLENİR ---
  // Test başladıktan sonra soru listesi değişmez (arka planda veri yenilense bile
  // sorular kaymaz / kaybolmaz). Henüz hiç cevap verilmediyse ve yeni sorular
  // geldiyse liste tamamlanır.
  const liveQs = (test?.questionIds || [])
    .map(id => questions.find(item => item.id === id))
    .filter(Boolean);
  const frozenQsRef = useRef(null);
  if (!frozenQsRef.current || (frozenQsRef.current.length < liveQs.length && stats.details.length === 0 && idx === 0)) {
    frozenQsRef.current = liveQs;
  }
  const testQs = frozenQsRef.current;

  // Bu çözümün kimliği: aynı testin her denemesi ayrı gruplanır (yıldız hesabı için)
  const attemptIdRef = useRef(`${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`);
  // Aynı soruya iki kez cevap kaydedilmesini engeller (süre bitimi + dokunma aynı anda vb.)
  const lockedRef = useRef(false);
  const answeredIdsRef = useRef(new Set());
  const [selectedOptIndex, setSelectedOptIndex] = useState(null);
  const [phase, setPhase] = useState('ready');
  const [preAudioStep, setPreAudioStep] = useState(1);
  const [timer, setTimer] = useState(0);

  const [studentDotLines, setStudentDotLines] = useState([]);
  const [studentColorCells, setStudentColorCells] = useState({});
  const [studentSudokuCells, setStudentSudokuCells] = useState({});
  const [studentCodingArrows, setStudentCodingArrows] = useState([]);
  const [studentCodingMarkedCells, setStudentCodingMarkedCells] = useState([]);
  const [studentPatternAnswers, setStudentPatternAnswers] = useState({});
  const [studentSymmetryCells, setStudentSymmetryCells] = useState({});
  const [studentMatrixShapeCells, setStudentMatrixShapeCells] = useState({});
  const [studentMatrixPaintCells, setStudentMatrixPaintCells] = useState({});
  const [studentNumberConns, setStudentNumberConns] = useState([]);
  const [studentMazePath, setStudentMazePath] = useState(['0,0']);
  const [studentBarGraphCols, setStudentBarGraphCols] = useState({});
  const [studentSequence, setStudentSequence] = useState([]);
  const [studentEventOrder, setStudentEventOrder] = useState([]);
  const [studentMatch, setStudentMatch] = useState({});
  const [storyPlaying, setStoryPlaying] = useState(false); // soru ekranında hikâye tekrar dinleniyor (süre durur)

  const audioRef = useRef(null);
  const last10AudioRef = useRef(null);

  const q = testQs[idx];
  const isDotQuestion = Boolean(q && (q.questionType === 'dot_grid' || (q.dotGrid && q.dotGrid.rows)));
  const isColorGridQuestion = Boolean(q && (q.questionType === 'color_grid' || (q.colorGrid && q.colorGrid.rows)));
  const isSudokuQuestion = Boolean(q && (q.questionType === 'sudoku_grid' || (q.sudokuGrid && q.sudokuGrid.rows)));
  const isCodingQuestion = Boolean(q && (q.questionType === 'box_coding' || q.questionType === 'line_coding' || (q.codingGrid && q.codingGrid.rows)));
  const isPatternQuestion = Boolean(q && (q.questionType === 'color_pattern' || (q.patternGrid && q.patternGrid.cells)));
  const isSymmetryQuestion = Boolean(q && (q.questionType === 'symmetry_grid' || (q.symmetryGrid && q.symmetryGrid.size)));
  const isMatrixShapeQuestion = Boolean(q && (q.questionType === 'matrix_shape' || q.matrixShapeGrid));
  const isMatrixPaintQuestion = Boolean(q && (q.questionType === 'matrix_paint' || q.matrixPaintGrid));
  const isNumberConnectQuestion = Boolean(q && (q.questionType === 'number_connect' || q.numberConnectGrid));
  const isMazeQuestion = Boolean(q && (q.questionType === 'interactive_maze' || q.mazeGrid));
  const isBarGraphQuestion = Boolean(q && (q.questionType === 'bar_graph' || q.barGraphGrid));
  const isSequenceQuestion = Boolean(q && (q.questionType === 'sequence_memory' || q.sequenceGrid));
  const isEventOrderQuestion = Boolean(q && (q.questionType === 'event_order' || q.eventOrderGrid));
  const isMatchQuestion = Boolean(q && (q.questionType === 'match_pairs' || q.matchGrid));
  const isInteractiveGridQuestion = isMatchQuestion || isDotQuestion || isColorGridQuestion || isSudokuQuestion || isCodingQuestion || isPatternQuestion || isSymmetryQuestion || isMatrixShapeQuestion || isMatrixPaintQuestion || isNumberConnectQuestion || isMazeQuestion || isBarGraphQuestion || isSequenceQuestion || isEventOrderQuestion;
  // Şık sesi: yüklenmiş ses ya da telefonla okunacak şık metni
  // Ekranda yazı: hideText -> soru yazısı gizli • hideOptionText -> şık yazıları gizli (ses/okuma sürer)
  const qTextShown = q && q.hideText === true ? '' : (q?.text || '');
  const memTextShown = q && q.hideText === true ? '' : (q?.memoryText || '');
  const hideOptText = Boolean(q && q.hideOptionText === true);
  const optTextShown = (opt) => (hideOptText ? '' : (opt?.text || ''));
  // yazısı gizlenmiş ve resmi olmayan şık: "sesi dinle" düğmesiyle sesli okunur
  const optSpeech = (opt) => opt?.ttsText || (hideOptText && !opt?.image ? (opt?.text || '') : '');
  const hasAnyOptionAudio = Boolean(q && (q.options || []).some(opt => opt && (opt.audio || optSpeech(opt))));
  // Telefonla sesli okuma: ses yüklenmemişse soru metni okunur.
  // ttsOn: true -> açık, false -> kapalı, yok -> sadece özel okuma metni (ttsText) varsa açık (eski sorular)
  const speechText = speechTextOf(q);
  const ttsActive = Boolean(q && !q.audio && speechText && (q.ttsOn === true || (q.ttsOn === undefined && q.ttsText)));
  // Dinleme (hikâye) soruları: hikâye önce ayrı ekranda dinletilir.
  // Aynı hikâyenin 2. / 3. sorusunda (önceki soru aynı hikâyeyse) tekrar dinletilmez.
  const hasStory = Boolean(q && (q.storyAudio || q.storyText));
  // giriş (ön ses 1) ve hikâye (ön ses 2) ayrı: tekrar dinlemede sadece hikâye çalar
  const story = storyPartsOf(q);
  const storyAlreadyHeard = Boolean(q && q.storyId && idx > 0 && testQs[idx - 1]?.storyId === q.storyId);

  useEffect(() => {
      if (settings?.last10SecondsSound) {
        last10AudioRef.current = makeAudio(settings.last10SecondsSound);
        last10AudioRef.current.loop = true;
      }
      return () => {
          if (last10AudioRef.current) {
            last10AudioRef.current.pause();
            last10AudioRef.current.currentTime = 0;
          }
      }
  }, [settings?.last10SecondsSound]);

  // Sadece geri sayım (tik-tak / son 10 saniye) seslerini durdurur
  const stopTickAudio = () => {
      if (audioRef.current) audioRef.current.pause();
      if (last10AudioRef.current) {
        last10AudioRef.current.pause();
        last10AudioRef.current.currentTime = 0;
      }
  };
  // Tüm sesler + telefonla okuma
  const stopAllAudio = () => {
      stopSpeak();
      stopTickAudio();
  };

  useEffect(() => {
    if (!q) return;
    setFeedback(null);
    setSelectedOptIndex(null);
    setLocked(false);
    lockedRef.current = false;
    setStudentSequence([]);
    setStudentEventOrder([]);
    setStudentMatch({});
    setStoryPlaying(false);
    stopSpeak();
    setStudentDotLines([]);
    setStudentColorCells({});
    setStudentSudokuCells({});
    setStudentCodingArrows([]);
    setStudentCodingMarkedCells([]);
    setStudentPatternAnswers({});
    setStudentSymmetryCells({});
    setStudentMatrixShapeCells({});
    setStudentMatrixPaintCells({});
    setStudentNumberConns([]);
    setStudentMazePath(['0,0']);
    setStudentBarGraphCols({});
    stopAllAudio();

    if ((q.storyAudio || q.storyText) && !(q.storyId && idx > 0 && testQs[idx - 1]?.storyId === q.storyId)) {
      setPhase('story');
    }
    else startAfterStory();
  }, [idx, q?.id]);

  // Hikâyeden (ya da doğrudan) sonra: ön ses -> hafıza gözlemi -> soru
  function startAfterStory() {
    if (!q) return;
    if (q.preAudio1 || q.preAudio2 || q.preAudio) {
      setPhase('pre-audio');
      setPreAudioStep(1);
    }
    else if (q.isMemory) { setPhase('observation'); setTimer(q.memoryTime || 15); }
    else { setPhase('answer'); setTimer(q.timeLimit || 0); }
  }
  const handleStoryEnd = () => { clearTimeout(storyGapRef.current); stopSpeak(); startAfterStory(); };
  // Hikâye kendiliğinden bitince hemen soruya atlama: kısa bir nefes payı bırak
  const storyGapRef = useRef(null);
  const curQIdRef = useRef(null);
  curQIdRef.current = q?.id;
  const handleStoryAutoEnd = () => {
    const myId = q?.id;
    clearTimeout(storyGapRef.current);
    storyGapRef.current = setTimeout(() => { if (curQIdRef.current === myId) startAfterStory(); }, 900);
  };
  useEffect(() => () => clearTimeout(storyGapRef.current), []);

  // Zamanlayıcı: her saniye bir kez çalışır. Yan etkiler (süre bitti kaydı)
  // state güncelleyicisinin İÇİNDE değil, burada ve sadece bir kez yapılır.
  useEffect(() => {
    if (timer <= 0 || locked || phase === 'pre-audio' || phase === 'story' || storyPlaying) {
       stopTickAudio(); // telefonla okumaya (hikâye / soru) dokunma
       return;
    }

    if (timer === 10 && phase !== 'observation') {
       if (last10AudioRef.current && settings?.last10SecondsSound) {
         last10AudioRef.current.play().catch(()=>{});
       } else if (audioRef.current) {
         audioRef.current.currentTime = 0;
         audioRef.current.play().catch(()=>{});
       }
    }

    const tick = setTimeout(() => {
      if (timer <= 1) {
        if (phase === 'observation') { setPhase('answer'); setTimer(q?.timeLimit || 0); }
        else if (phase === 'answer') { setTimer(0); handleTimeout(); }
      } else {
        setTimer(timer - 1);
      }
    }, 1000);
    return () => clearTimeout(tick);
  }, [timer, phase, locked, q, settings, storyPlaying]);

  // Cevabı kilitler; zaten kilitliyse false döner (çift kayıt engeli)
  const beginSubmit = () => {
    if (lockedRef.current) return false;
    lockedRef.current = true;
    setLocked(true);
    return true;
  };

  const handleTimeout = () => {
      if (!beginSubmit()) return;
      setFeedback('timeout');

      if (settings?.wrongSound) {
          const audio = makeAudio(settings.wrongSound);
          audio.play().catch(()=>{});
      }

      handleAnswer("boş - süre doldu", false);
  };

  const handleClick = (opt, i) => {
    if (!beginSubmit()) return;
    stopAllAudio();

    setSelectedOptIndex(i);
    let isCorrect = false;
    if (q.correctIndex !== undefined) isCorrect = i === q.correctIndex;
    else isCorrect = String(opt.text).trim().toLowerCase() === String(q.correctText).trim().toLowerCase();

    if (isCorrect && settings?.correctSound) {
       const audio = makeAudio(settings.correctSound);
       audio.play().catch(()=>{});
    } else if (!isCorrect && settings?.wrongSound) {
       const audio = makeAudio(settings.wrongSound);
       audio.play().catch(()=>{});
    }

    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(opt.text || `seçenek ${i+1}`, isCorrect);
  };

  const playResultSound = (isCorrect) => {
    if (isCorrect && settings?.correctSound) {
      const audio = makeAudio(settings.correctSound);
      audio.play().catch(() => {});
    } else if (!isCorrect && settings?.wrongSound) {
      const audio = makeAudio(settings.wrongSound);
      audio.play().catch(() => {});
    }
  };

  const handleDotGridSubmit = () => {
    if (!q?.dotGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = areDotLinesEqual(studentDotLines, q.dotGrid.lines || []);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(normalizeDotLines(studentDotLines)), isCorrect);
  };

  const handleColorGridSubmit = () => {
    if (!q?.colorGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = areColorGridsEqual(studentColorCells, q.colorGrid.cells || {});
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(normalizeColorCells(studentColorCells)), isCorrect);
  };

  const handleSudokuGridSubmit = () => {
    if (!q?.sudokuGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkSudokuValidAndComplete(
      q.sudokuGrid.rows || 3,
      q.sudokuGrid.clues || {},
      studentSudokuCells,
      q.sudokuGrid.solution || {}
    );
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentSudokuCells), isCorrect);
  };

  const handleCodingGridSubmit = () => {
    if (!q?.codingGrid || !beginSubmit()) return;
    stopAllAudio();
    const payload = {
      arrows: studentCodingArrows,
      markedCells: studentCodingMarkedCells
    };
    const isCorrect = checkCodingQuestionAnswer(q.codingGrid, payload);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(payload), isCorrect);
  };

  const handlePatternSubmit = () => {
    if (!q?.patternGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkPatternAnswer(q.patternGrid, studentPatternAnswers);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentPatternAnswers), isCorrect);
  };

  const handleSymmetrySubmit = () => {
    if (!q?.symmetryGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkSymmetryAnswer(q.symmetryGrid, studentSymmetryCells);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentSymmetryCells), isCorrect);
  };

  const handleMatrixShapeSubmit = () => {
    if (!q?.matrixShapeGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkMatrixShapeAnswer(q.matrixShapeGrid, studentMatrixShapeCells);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentMatrixShapeCells), isCorrect);
  };

  const handleMatrixPaintSubmit = () => {
    if (!q?.matrixPaintGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkMatrixPaintAnswer(q.matrixPaintGrid, studentMatrixPaintCells);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentMatrixPaintCells), isCorrect);
  };

  const handleNumberConnectSubmit = () => {
    if (!q?.numberConnectGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkNumberConnectAnswer(q.numberConnectGrid, studentNumberConns);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentNumberConns), isCorrect);
  };

  const handleMazeSubmit = () => {
    if (!q?.mazeGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkMazeAnswer(q.mazeGrid, studentMazePath);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentMazePath), isCorrect);
  };

  const handleBarGraphSubmit = () => {
    if (!q?.barGraphGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkBarGraphAnswer(q.barGraphGrid, studentBarGraphCols);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentBarGraphCols), isCorrect);
  };

  const handleSequenceSubmit = () => {
    if (!q?.sequenceGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkSequenceAnswer(q.sequenceGrid, studentSequence);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentSequence), isCorrect);
  };

  const handleMatchSubmit = () => {
    if (!q?.matchGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkMatchAnswer(q.matchGrid, studentMatch);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentMatch), isCorrect);
  };

  const handleEventOrderSubmit = () => {
    if (!q?.eventOrderGrid || !beginSubmit()) return;
    stopAllAudio();
    const isCorrect = checkEventOrderAnswer(q.eventOrderGrid, studentEventOrder);
    playResultSound(isCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    handleAnswer(JSON.stringify(studentEventOrder), isCorrect);
  };

  const handleAnswer = (userChoice, isCorrect) => {
    if (!q || answeredIdsRef.current.has(q.id)) return;
    answeredIdsRef.current.add(q.id);
    const detail = { questionId: q.id, text: q.text, isCorrect, userChoice };
    setStats(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), wrong: prev.wrong + (isCorrect ? 0 : 1), details: [...prev.details, detail] }));
    saveResponse({
      childId: child?.childId || "preview",
      childName: child?.name || "Önizleme",
      testName: test.name,
      testId: test.id || "",
      attemptId: attemptIdRef.current,
      attemptTotal: testQs.length,
      questionIndex: idx,
      questionId: q.id,
      isCorrect,
      userChoice,
      clientTs: Date.now(),
      timestamp: serverTimestamp()
    });
  };

  const nextQuestion = () => {
    if (idx + 1 < testQs.length) setIdx(idx + 1);
    else onComplete({ testName: test.name, correctCount: stats.correct, wrongCount: stats.wrong, details: stats.details, totalQuestions: testQs.length });
  };

  const handlePreAudioEnd = () => {
      if (preAudioStep === 1 && q.preAudio2) {
        setPreAudioStep(2);
      } else {
          if (q.isMemory) { setPhase('observation'); setTimer(q.memoryTime || 15); }
          else { setPhase('answer'); setTimer(q.timeLimit || 0); }
      }
  };

  if (!q) return <div className="p-8 text-center font-bold text-slate-500">yükleniyor...</div>;

  const qScale = q.style?.qScale || 1;
  const textScale = q.style?.textScale || 1;
  const boxScale = q.style?.boxScale || 1;
  const imgScale = q.style?.imgScale || 1;
  const qContainerScale = q.style?.qContainerScale || 1;
  const qColor = q.style?.qColor || '#1e293b';
  const optColor = q.style?.optColor || '#334155';
  const optImgScale = q.style?.optImgScale || 1;
  const letterColors = q.style?.letterColors || {};

  const questionTextStyle = { fontSize: `${1.15 * qScale}rem`, lineHeight: 1.25, color: qColor };
  const questionContainerStyle = { padding: `${0.4 * qContainerScale}rem` };
  const questionImageStyle = { width: `${100 * imgScale}%`, maxWidth: '100%', height: 'auto', maxHeight: '45vh', objectFit: 'contain' };
  const optionButtonStyle = { padding: `${0.5 * boxScale}rem`, minHeight: `${4 * boxScale}rem` };
  const optionTextStyle = { fontSize: `${1.125 * textScale}rem`, color: optColor };

  const gridStatus = feedback === 'correct' ? 'correct' : (feedback === 'wrong' || feedback === 'timeout') ? 'wrong' : null;
  // Hafıza sorularında (BİLSEM bankası) resim gizlendikten sonra sorulacak soru 'memoryText' alanındadır
  const hasVisibleQuestionHeaderInAnswer = (!q.isMemory && Boolean(q.video || q.audio || ttsActive || q.customAttachmentImage || (!isInteractiveGridQuestion && q.image) || qTextShown)) || (q.isMemory && Boolean(memTextShown || q.audio || ttsActive)) || (hasStory && q.storyReplay);

  const renderInteractiveSubmitBar = (onSubmitFn) => (
    <div className="w-full max-w-sm mt-1">
      {!feedback ? (
        <button
          onClick={onSubmitFn}
          disabled={locked}
          className="w-full py-2.5 bg-green-500 hover:bg-green-600 border-b-4 border-green-700 text-white font-black rounded-2xl text-base sm:text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Check size={20} /> kontrol et
        </button>
      ) : (
        <button
          onClick={nextQuestion}
          className="w-full py-2.5 bg-indigo-600 border-b-4 border-indigo-800 text-white rounded-2xl flex flex-col items-center justify-center text-center shadow-lg active:scale-95 transition-all"
        >
          {feedback === 'timeout' && <span className="text-[10px] uppercase font-bold text-red-200 block">süre doldu</span>}
          <span className="font-black text-base sm:text-lg flex items-center gap-2">devam <ArrowRight size={18}/></span>
        </button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col h-full animate-in fade-in space-y-1 sm:space-y-2 ${isFullscreen ? 'p-1' : ''}`}>
       <audio ref={audioRef} src={TICK_TOCK_SOUND} preload="auto" />

       <div className="flex justify-between items-center px-2 shrink-0 h-8 sm:h-auto">
         <button
           onClick={exitQuiz}
           className="w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-slate-300 rounded-full text-slate-700 hover:text-red-600 hover:border-red-300 flex items-center justify-center shadow-sm active:scale-90 transition-all"
           title="Testten Çık"
         >
           <X size={15} strokeWidth={2.5} />
         </button>
         <div className="flex flex-col items-center">
             <span className="text-[7px] sm:text-[10px] font-black text-slate-400 uppercase line-clamp-1 max-w-[150px]">{test.name}</span>
             <div className="flex items-center gap-1 sm:gap-2"><span className="text-[10px] sm:text-sm font-black text-orange-500">soru {idx + 1}</span><span className="text-[8px] sm:text-xs font-bold text-slate-300">/ {testQs.length}</span></div>
         </div>
         <button
           onClick={toggleFullscreen}
           className="w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-indigo-400 rounded-full text-indigo-600 hover:bg-indigo-50 flex items-center justify-center shadow-sm active:scale-90 transition-all"
           title={isFullscreen ? "Küçült" : "Tam Ekran"}
         >
           {isFullscreen ? <Minimize size={14} strokeWidth={2.5} /> : <Maximize size={14} strokeWidth={2.5} />}
         </button>
       </div>

       <div className="h-1.5 bg-slate-200 w-full shrink-0"><div className="h-full bg-orange-400 transition-all duration-500" style={{ width: `${((idx + 1) / testQs.length) * 100}%` }} /></div>

       <div className={`flex-1 bg-white/80 backdrop-blur-md shadow-xl border-2 border-slate-100 flex flex-col relative ${isFullscreen ? 'rounded-xl' : 'rounded-[2rem]'} overflow-hidden`}>
         {timer <= 10 && timer > 0 && !locked && (
           <div className="absolute top-2 left-2 z-50 w-9 h-9 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">{timer}</span>
           </div>
         )}
         {(phase === 'observation' || (phase === 'answer' && q.timeLimit > 0 && !locked)) && (
           <div className="absolute top-0 left-0 w-full h-3 z-20 bg-slate-200/80 shadow-inner"><div className={`h-full rounded-r-full transition-all duration-1000 linear shadow-md ${phase === 'observation' ? 'bg-indigo-600' : 'bg-red-600'}`} style={{ width: `${(timer / (phase === 'observation' ? (q.memoryTime||15) : q.timeLimit)) * 100}%` }} /></div>
         )}
         {phase === 'story' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 animate-in zoom-in text-center">
               {q.storyImage ? <img src={q.storyImage} alt="" className="w-40 h-40 sm:w-52 sm:h-52 object-contain rounded-3xl" /> : <div className="text-5xl">📖👂</div>}
               {q.storyTitle && <div className="text-lg font-black text-indigo-700">{String(q.storyTitle).replace(/^\d+\.\s*/, '')}</div>}
               <div className="text-2xl font-black text-slate-800">hikâyeyi dikkatle dinle!</div>
               <StoryPlayer key={`story-${q.id}`} introSrc={story.introAudio} introText={story.introText} src={story.storyAudio} text={story.storyText} autoPlay={true} onEnded={handleStoryAutoEnd} label="hikâye" />
               <button onClick={handleStoryEnd} className="px-5 py-2 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow active:scale-95">sorulara geç ▶</button>
            </div>
         )}
         {phase === 'pre-audio' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in zoom-in">
               <div className="text-2xl font-black text-slate-800 text-center">
                 {preAudioStep === 1 ? "1. sesi dinle!" : "2. sesi dinle!"}
               </div>
               {preAudioStep === 1 ? (
                 <FancyAudioPlayer key="audio-1" src={q.preAudio1 || q.preAudio} autoPlay={true} onEnded={handlePreAudioEnd} label="di̇nle 1" color="orange" size="normal" />
               ) : (
                 <FancyAudioPlayer key="audio-2" src={q.preAudio2} autoPlay={true} onEnded={handlePreAudioEnd} label="di̇nle 2" color="indigo" size="normal" />
               )}
               <button onClick={handlePreAudioEnd} className="text-slate-400 font-bold text-xs underline">geç</button>
            </div>
         )}
         {phase === 'observation' && (
           <div className="flex-1 flex flex-col items-center justify-center p-2 overflow-y-auto custom-scrollbar">
               <div className="w-full flex flex-col items-center justify-center min-h-0 transition-all duration-300 relative" style={questionContainerStyle}>
                   {q.video && <video src={q.video} autoPlay muted loop className="max-h-[30vh] w-full bg-black rounded-lg" />}
                   {q.customAttachmentImage && <img src={q.customAttachmentImage} draggable="false" className="max-h-28 object-contain rounded-xl mb-1 shadow-sm" />}
                   {isDotQuestion ? (
                     <div className="my-1 flex flex-col items-center gap-2">
                       <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[11px] font-black uppercase flex items-center gap-1.5 border border-indigo-200">
                         <Clock size={14}/> dikkatlice bak! ({timer} sn)
                       </div>
                       <DotGridPad
                         rows={q.dotGrid?.rows || 3}
                         cols={q.dotGrid?.cols || 3}
                         lines={q.dotGrid?.lines || []}
                         readOnly={true}
                         size={Math.round(210 * imgScale)}
                         title=""
                       />
                       <button
                         type="button"
                         onClick={() => { setPhase('answer'); setTimer(q.timeLimit || 0); }}
                         className="px-5 py-2 bg-indigo-600 text-white font-black text-xs uppercase rounded-xl shadow hover:bg-indigo-700 active:scale-95 transition-all"
                       >
                         hemen çizmeye başla
                       </button>
                     </div>
                   ) : isColorGridQuestion ? (
                     <div className="my-1 flex flex-col items-center gap-2">
                       <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[11px] font-black uppercase flex items-center gap-1.5 border border-indigo-200">
                         <Clock size={14}/> dikkatlice bak! ({timer} sn)
                       </div>
                       <ColorGridPad
                         rows={q.colorGrid?.rows || 3}
                         cols={q.colorGrid?.cols || 3}
                         cells={q.colorGrid?.cells || {}}
                         readOnly={true}
                         size={Math.round(210 * imgScale)}
                         title=""
                       />
                       <button
                         type="button"
                         onClick={() => { setPhase('answer'); setTimer(q.timeLimit || 0); }}
                         className="px-5 py-2 bg-indigo-600 text-white font-black text-xs uppercase rounded-xl shadow hover:bg-indigo-700 active:scale-95 transition-all"
                       >
                         hemen boyamaya başla
                       </button>
                     </div>
                   ) : (
                     q.image && <img src={q.image} draggable="false" className="rounded-none shadow-sm transition-all duration-300 pointer-events-none" style={questionImageStyle} />
                   )}
                   {qTextShown && (
                       <h3 className="font-black text-center leading-tight transition-all duration-300 mt-1" style={{...questionTextStyle, color: undefined}}>
                           <RenderTextWithHighlights text={qTextShown} globalColor={qColor} highlights={letterColors.question} />
                       </h3>
                   )}
               </div>
           </div>
         )}
         {phase === 'answer' && (
           <div className={`flex-1 overflow-y-auto custom-scrollbar p-1.5 sm:p-2.5 flex flex-col ${isInteractiveGridQuestion ? 'justify-between' : 'justify-start'}`}>
               {(isInteractiveGridQuestion || hasVisibleQuestionHeaderInAnswer) && (
                 <div className="w-full flex flex-col items-center justify-center min-h-0 mb-1 transition-all duration-300 relative" style={isInteractiveGridQuestion ? { padding: '0.1rem' } : questionContainerStyle}>
                     {hasStory && q.storyReplay && !locked && (
                       <div className="absolute top-0 right-0 z-30">
                         {storyPlaying ? (
                           <div className="flex flex-col items-center bg-white/90 rounded-2xl p-1 shadow border border-orange-200">
                             <StoryPlayer key={`replay-${q.id}`} src={story.storyAudio} text={story.storyText} autoPlay={true} size="small" label="" onEnded={() => setStoryPlaying(false)} />
                             <button type="button" onClick={() => { stopSpeak(); setStoryPlaying(false); }} className="text-[10px] font-black text-slate-500 underline">kapat</button>
                           </div>
                         ) : (
                           <button type="button" onClick={() => { stopSpeak(); setStoryPlaying(true); }} className="px-2.5 py-1.5 rounded-xl bg-orange-100 border-2 border-orange-300 text-orange-700 text-[10px] sm:text-xs font-black shadow-sm active:scale-95">📖 hikâyeyi tekrar dinle</button>
                         )}
                       </div>
                     )}
                     {!q.isMemory && (
                       <>
                         {q.video && <video src={q.video} controls onContextMenu={e => !test.isPreview && e.preventDefault()} className="max-h-[25vh] w-full bg-black rounded-lg" />}
                         {q.audio && (
                             <div className="scale-[0.6] -mt-3 -mb-3 origin-center">
                                 <FancyAudioPlayer src={q.audio} autoPlay={true} label="" color="orange" size="small" />
                             </div>
                         )}
                         {ttsActive && !storyPlaying && (
                             <div className="scale-[0.8] -mt-2 -mb-2 origin-center">
                                 <SpeakButton key={q.id} text={speechText} autoPlay={true} />
                             </div>
                         )}
                         {q.customAttachmentImage && (
                           <img src={q.customAttachmentImage} draggable="false" className="max-h-28 object-contain rounded-xl mb-1 shadow-sm" />
                         )}
                         {!isInteractiveGridQuestion && q.image && <img src={q.image} draggable="false" className="rounded-none shadow-sm transition-all duration-300" style={questionImageStyle} />}
                         {qTextShown && (
                           <h3 className="font-black text-center leading-tight transition-all duration-300" style={{...questionTextStyle, color: undefined}}>
                              <RenderTextWithHighlights
                                   text={qTextShown}
                                   globalColor={qColor}
                                   highlights={letterColors.question}
                              />
                           </h3>
                         )}
                       </>
                      )}
                     {q.isMemory && q.memoryText && (
                       <>
                         {q.audio && (
                             <div className="scale-[0.6] -mt-3 -mb-3 origin-center">
                                 <FancyAudioPlayer src={q.audio} autoPlay={true} label="" color="orange" size="small" />
                             </div>
                         )}
                         {ttsActive && (
                             <div className="scale-[0.8] -mt-2 -mb-2 origin-center">
                                 <SpeakButton key={`m-${q.id}`} text={speechText} autoPlay={true} />
                             </div>
                         )}
                         {memTextShown && (
                           <h3 className="font-black text-center leading-tight transition-all duration-300" style={{...questionTextStyle, color: undefined}}>
                              <RenderTextWithHighlights text={memTextShown} globalColor={qColor} highlights={{}} />
                           </h3>
                         )}
                       </>
                     )}
                 </div>
               )}

               {isDotQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-1.5 p-1.5 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <div className="flex flex-col items-center justify-center gap-2 w-full">
                     {(!q.isMemory || feedback) && (
                       <DotGridPad rows={q.dotGrid?.rows || 3} cols={q.dotGrid?.cols || 3} lines={q.dotGrid?.lines || []} readOnly={true} size={Math.round(150 * imgScale)} title="" />
                     )}
                     <DotGridPad rows={q.dotGrid?.rows || 3} cols={q.dotGrid?.cols || 3} lines={studentDotLines} onChange={setStudentDotLines} readOnly={locked} size={Math.round(160 * boxScale)} title="" status={gridStatus} />
                   </div>
                   {renderInteractiveSubmitBar(handleDotGridSubmit)}
                 </div>
               ) : isColorGridQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-1.5 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-6 w-full">
                     {(!q.isMemory || feedback) && (
                       <ColorGridPad rows={q.colorGrid?.rows || 3} cols={q.colorGrid?.cols || 3} cells={q.colorGrid?.cells || {}} readOnly={true} size={Math.round(165 * imgScale)} title="" />
                     )}
                     <ColorGridPad rows={q.colorGrid?.rows || 3} cols={q.colorGrid?.cols || 3} cells={studentColorCells} onChange={setStudentColorCells} readOnly={locked} size={Math.round(170 * boxScale)} title="" status={gridStatus} />
                   </div>
                   {renderInteractiveSubmitBar(handleColorGridSubmit)}
                 </div>
               ) : isSudokuQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-1.5 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <SudokuGridPad gridSize={q.sudokuGrid?.rows || 3} symbols={q.sudokuGrid?.symbols} clues={q.sudokuGrid?.clues || {}} solution={q.sudokuGrid?.solution || {}} studentCells={studentSudokuCells} onChangeStudent={setStudentSudokuCells} readOnly={locked} size={Math.round(235 * boxScale)} title="boş kutuları tamamla" status={gridStatus} />
                   {renderInteractiveSubmitBar(handleSudokuGridSubmit)}
                 </div>
               ) : isCodingQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-1.5 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <CodingActivityPad
                     key={`coding-pad-${q.id}-${idx}`}
                     mode={q.codingGrid?.mode || (q.questionType === 'line_coding' ? 'line' : 'box')}
                     method={q.codingGrid?.method || 'method1'}
                     rows={q.codingGrid?.rows || 3}
                     cols={q.codingGrid?.cols || 3}
                     path={q.codingGrid?.path || ['0,0', '0,1', '1,1']}
                     startImage={q.codingGrid?.startImage}
                     targetImage={q.codingGrid?.targetImage}
                     studentArrows={studentCodingArrows}
                     onChangeStudentArrows={setStudentCodingArrows}
                     studentMarkedCells={studentCodingMarkedCells}
                     onChangeStudentMarkedCells={setStudentCodingMarkedCells}
                     readOnly={locked}
                     size={Math.round(230 * boxScale)}
                     title={q.codingGrid?.method === 'method2' ? 'okları takip et ve yolu işaretle' : 'yolu takip et ve okları kutulara diz'}
                     status={gridStatus}
                   />
                   {renderInteractiveSubmitBar(handleCodingGridSubmit)}
                 </div>
               ) : isPatternQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <ColorPatternPad cells={q.patternGrid?.cells || []} hiddenIndices={q.patternGrid?.hiddenIndices || []} studentAnswers={studentPatternAnswers} onChangeStudentAnswers={setStudentPatternAnswers} readOnly={locked} title="örüntüdeki boş kutuları tamamla" status={gridStatus} />
                   {renderInteractiveSubmitBar(handlePatternSubmit)}
                 </div>
               ) : isSymmetryQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <SymmetryGridPad gridSize={q.symmetryGrid?.size || 6} leftCells={q.symmetryGrid?.leftCells || {}} studentCells={studentSymmetryCells} onChangeStudentCells={setStudentSymmetryCells} readOnly={locked} size={Math.round(240 * boxScale)} title="simetriğini sağ tarafa boya" status={gridStatus} />
                   {renderInteractiveSubmitBar(handleSymmetrySubmit)}
                 </div>
               ) : isMatrixShapeQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <MatrixShapePad matrixData={q.matrixShapeGrid || {}} studentCells={studentMatrixShapeCells} onChangeStudentCells={setStudentMatrixShapeCells} readOnly={locked} title="tabloyu uygun şekillerle tamamla" status={gridStatus} />
                   {renderInteractiveSubmitBar(handleMatrixShapeSubmit)}
                 </div>
               ) : isMatrixPaintQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <MatrixPaintPad paintData={q.matrixPaintGrid || {}} studentCells={studentMatrixPaintCells} onChangeStudentCells={setStudentMatrixPaintCells} readOnly={locked} title="örnekteki gibi uygun renkleri boyayalım" status={gridStatus} />
                   {renderInteractiveSubmitBar(handleMatrixPaintSubmit)}
                 </div>
               ) : isNumberConnectQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <NumberConnectPad connectData={q.numberConnectGrid || {}} studentConnections={studentNumberConns} onChangeStudentConnections={setStudentNumberConns} readOnly={locked} size={Math.round(245 * boxScale)} title={q.numberConnectGrid?.level ? "üstteki sıraya göre şekilleri birleştir" : "sayıları sırasıyla (1-2-3-4-5) birleştir"} status={gridStatus} />
                   {renderInteractiveSubmitBar(handleNumberConnectSubmit)}
                 </div>
               ) : isMazeQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <InteractiveMazePad mazeData={q.mazeGrid || {}} studentPath={studentMazePath} onChangeStudentPath={setStudentMazePath} readOnly={locked} size={Math.round(245 * boxScale)} title="parmağınla doğru yolu çizerek havuca ulaş" status={gridStatus} />
                   {renderInteractiveSubmitBar(handleMazeSubmit)}
                 </div>
               ) : isBarGraphQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <BarGraphActivityPad graphData={q.barGraphGrid || {}} studentCols={studentBarGraphCols} onChangeStudentCols={setStudentBarGraphCols} readOnly={locked} title="resimleri say ve kaç tane varsa o kadar kutucuk boya" status={gridStatus} />
                   {renderInteractiveSubmitBar(handleBarGraphSubmit)}
                 </div>
               ) : isMatchQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <MatchPairsPad key={`mp-${q.id}-${idx}`} grid={q.matchGrid || {}} options={q.options || []} pairs={studentMatch} onChange={setStudentMatch} readOnly={locked} status={gridStatus} showAnswer={Boolean(feedback && feedback !== 'correct')} hideOptionText={hideOptText} title="soldan bir karta, sonra sağdan eşine dokun" />
                   {renderInteractiveSubmitBar(handleMatchSubmit)}
                 </div>
               ) : isEventOrderQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <EventOrderPad key={`eo-${q.id}-${idx}`} grid={q.eventOrderGrid || {}} picked={studentEventOrder} onChange={setStudentEventOrder} readOnly={locked} status={gridStatus} showAnswer={Boolean(feedback && feedback !== 'correct')} title="resimleri olay sırasına göre dokun: önce olan 1" />
                   {renderInteractiveSubmitBar(handleEventOrderSubmit)}
                 </div>
               ) : isSequenceQuestion ? (
                 <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50">
                   <SequenceMemoryPad key={`seq-${q.id}-${idx}`} seqData={q.sequenceGrid || {}} studentSequence={studentSequence} onChangeStudentSequence={setStudentSequence} readOnly={locked} size={Math.round(340 * boxScale)} title="kareler hangi sırayla yandıysa sen de öyle dokun" status={gridStatus} />
                   {renderInteractiveSubmitBar(handleSequenceSubmit)}
                 </div>
               ) : (
                 <div className={`grid grid-cols-2 gap-1 sm:gap-2 shrink-0 pb-2 p-2 border-2 border-slate-100 rounded-2xl bg-slate-50/50 ${hasVisibleQuestionHeaderInAnswer ? 'mt-1' : 'mt-0'}`}>
                    {(q.options || []).map((opt, i) => {
                        const isSelected = i === selectedOptIndex;
                        let isCorrectOpt = false;
                        if (q.correctIndex !== undefined) isCorrectOpt = i === q.correctIndex;
                        else isCorrectOpt = String(opt.text).trim().toLowerCase() === String(q.correctText).trim().toLowerCase();
                        let btnClass = "bg-white border-slate-200";
                        let customTextStyle = { ...optionTextStyle };

                        if (feedback) {
                            if (isCorrectOpt) { btnClass = "bg-green-500 border-green-600 text-white"; customTextStyle.color = 'white'; }
                            else if (isSelected) { btnClass = "bg-red-500 border-red-600 text-white"; customTextStyle.color = 'white'; }
                            else btnClass = "opacity-40 bg-slate-100";
                        }

                        const optHighlights = letterColors.options && letterColors.options[i] ? letterColors.options[i] : {};

                        if (hasAnyOptionAudio) {
                          return (
                            <div
                              key={i}
                              className={`relative border-2 border-b-4 rounded-xl transition-all ${btnClass} flex flex-col items-center justify-between shadow-sm text-center gap-1.5 p-2`}
                              style={optionButtonStyle}
                            >
                              <div className="flex flex-col items-center justify-center gap-1 w-full flex-1">
                                {(opt.audio || optSpeech(opt)) && <OptionAudioButton src={opt.audio} text={optSpeech(opt)} />}
                                {opt.image && <img src={opt.image} draggable="false" className="object-contain max-h-24" style={{ transform: `scale(${optImgScale})` }} />}
                                {optTextShown(opt) && (
                                  <span className="font-bold leading-tight" style={{...customTextStyle, color: undefined}}>
                                    <RenderTextWithHighlights
                                        text={optTextShown(opt)}
                                        globalColor={feedback && (isCorrectOpt || isSelected) ? 'white' : optColor}
                                        highlights={feedback && (isCorrectOpt || isSelected) ? {} : optHighlights}
                                    />
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={locked}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClick(opt, i);
                                }}
                                className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 ${
                                  feedback
                                    ? isCorrectOpt
                                      ? 'bg-white text-green-700'
                                      : isSelected
                                        ? 'bg-white text-red-600'
                                        : 'bg-slate-200 text-slate-500'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white border-b-2 border-indigo-800'
                                }`}
                              >
                                <CheckCircle size={15} />
                                <span>{feedback ? (isCorrectOpt ? 'Doğru Şık' : isSelected ? 'Seçimin' : 'Seç') : 'Bu Şıkkı Seç'}</span>
                              </button>
                            </div>
                          );
                        }

                        return (
                          <button key={i} disabled={locked} onClick={() => handleClick(opt, i)} className={`relative border-b-4 rounded-xl active:scale-95 transition-all ${btnClass} flex flex-col items-center justify-center shadow-sm text-center gap-0.5`} style={optionButtonStyle}>
                               {opt.image && <img src={opt.image} draggable="false" className="object-contain" style={{ height: optTextShown(opt) ? `${75 * optImgScale}%` : `${100 * optImgScale}%` }} />}
                               {optTextShown(opt) && (
                                   <span className="font-bold leading-tight" style={{...customTextStyle, color: undefined}}>
                                       <RenderTextWithHighlights
                                            text={optTextShown(opt)}
                                            globalColor={feedback && (isCorrectOpt || isSelected) ? 'white' : optColor}
                                            highlights={feedback && (isCorrectOpt || isSelected) ? {} : optHighlights}
                                       />
                                   </span>
                               )}
                          </button>
                        )
                    })}
                    {feedback && (
                        <button onClick={nextQuestion} className={`bg-indigo-600 border-b-4 border-indigo-800 text-white rounded-xl flex flex-col items-center justify-center text-center shadow-lg active:scale-95 transition-all hover:scale-[1.02] ${(q.options || []).length % 2 === 0 ? 'col-span-2' : ''}`} style={optionButtonStyle}>
                            {feedback === 'timeout' && <span className="text-[10px] uppercase font-bold text-red-200 block mb-1">süre doldu</span>}
                            <span className="font-black text-xl flex items-center gap-2">devam <ArrowRight size={20}/></span>
                        </button>
                    )}
                 </div>
               )}
           </div>
         )}
       </div>
    </div>
  );
}
