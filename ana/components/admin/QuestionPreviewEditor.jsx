import React, { useState, useEffect, useRef } from 'react';
import { onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, ChevronLeft, ChevronRight, Save, Settings2, Move, Palette, ArrowRight, FolderOpen, Loader2, CheckCircle2 } from 'lucide-react';
import { appId } from '../../constants';
import { FancyAudioPlayer, OptionAudioButton } from '../common/AudioPlayers';
import { RenderTextWithHighlights } from '../common/RenderTextWithHighlights';
import { DotGridPad } from '../../activities/dotGrid';
import { ColorGridPad } from '../../activities/colorGrid';
import { SudokuGridPad } from '../../activities/sudoku';
import { CodingActivityPad } from '../../activities/coding';
import { ColorPatternPad } from '../../activities/colorPattern';
import { SymmetryGridPad } from '../../activities/symmetry';
import { MatrixShapePad } from '../../activities/matrixShape';
import { MatrixPaintPad } from '../../activities/matrixPaint';
import { NumberConnectPad } from '../../activities/numberConnect';
import { InteractiveMazePad } from '../../activities/maze';
import { BarGraphActivityPad } from '../../activities/barGraph';
import { SequenceMemoryPad } from '../../activities/sequenceMemory';

// ============================================================================
// --- GRUP: SORU ÖNİZLEME (PREVIEW) VE İÇERİK (CONTENT) EDİTÖR MODALLARI ---
// ============================================================================
// Toplu uygulamada seçilebilecek görünüm ayarları
const BULK_STYLE_FIELDS = [
  { key: 'imgScale', label: 'görsel boyutu' },
  { key: 'qContainerScale', label: 'soru kutusu' },
  { key: 'qScale', label: 'soru yazısı' },
  { key: 'boxScale', label: 'seçenek / etkinlik kutusu' },
  { key: 'optImgScale', label: 'seçenek görseli' },
  { key: 'textScale', label: 'seçenek yazısı' },
  { key: 'colors', label: 'yazı renkleri' },
  { key: 'letterColors', label: 'harf boyamaları (soruya özel!)' }
];

export function QuestionPreviewEditor({ q, allQuestions, setQ, onClose, onSave, editorContextList, folders = [], initialBulkFolderId = null, onBulkApply }) {
  const [qScale, setQScale] = useState(q.style?.qScale || 1);
  const [textScale, setTextScale] = useState(q.style?.textScale || 1);
  const [boxScale, setBoxScale] = useState(q.style?.boxScale || 1);
  const [imgScale, setImgScale] = useState(q.style?.imgScale || 1);
  const [qContainerScale, setQContainerScale] = useState(q.style?.qContainerScale || 1);
  const [qColor, setQColor] = useState(q.style?.qColor || '#1e293b');
  const [optColor, setOptColor] = useState(q.style?.optColor || '#334155');

  const [optImgScale, setOptImgScale] = useState(q.style?.optImgScale || 1);

  const [letterColors, setLetterColors] = useState(q.style?.letterColors || { question: {}, options: {} });

  const [paintMode, setPaintMode] = useState(false);
  const [activeColor, setActiveColor] = useState('#EF4444');

  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const [presets, setPresets] = useState({});

  const isDotQuestion = Boolean(q.questionType === 'dot_grid' || (q.dotGrid && q.dotGrid.rows));
  const isColorGridQuestion = Boolean(q.questionType === 'color_grid' || (q.colorGrid && q.colorGrid.rows));
  const isSudokuQuestion = Boolean(q.questionType === 'sudoku_grid' || (q.sudokuGrid && q.sudokuGrid.rows));
  const isCodingQuestion = Boolean(q.questionType === 'box_coding' || q.questionType === 'line_coding' || (q.codingGrid && q.codingGrid.rows));
  const isPatternQuestion = Boolean(q.questionType === 'color_pattern' || (q.patternGrid && q.patternGrid.cells));
  const isSymmetryQuestion = Boolean(q.questionType === 'symmetry_grid' || (q.symmetryGrid && q.symmetryGrid.size));
  const isMatrixShapeQuestion = Boolean(q.questionType === 'matrix_shape' || q.matrixShapeGrid);
  const isMatrixPaintQuestion = Boolean(q.questionType === 'matrix_paint' || q.matrixPaintGrid);
  const isNumberConnectQuestion = Boolean(q.questionType === 'number_connect' || q.numberConnectGrid);
  const isMazeQuestion = Boolean(q.questionType === 'interactive_maze' || q.mazeGrid);
  const isBarGraphQuestion = Boolean(q.questionType === 'bar_graph' || q.barGraphGrid);
  const isSequenceQuestion = Boolean(q.questionType === 'sequence_memory' || q.sequenceGrid);
  const isInteractiveGridQuestion = isDotQuestion || isColorGridQuestion || isSudokuQuestion || isCodingQuestion || isPatternQuestion || isSymmetryQuestion || isMatrixShapeQuestion || isMatrixPaintQuestion || isNumberConnectQuestion || isMazeQuestion || isBarGraphQuestion || isSequenceQuestion;

  // --- TOPLU UYGULAMA (KLASÖR) DURUMU ---
  const [bulkOpen, setBulkOpen] = useState(Boolean(initialBulkFolderId));
  const [bulkFolderId, setBulkFolderId] = useState(initialBulkFolderId || q.folderId || '');
  const [bulkIncludeSub, setBulkIncludeSub] = useState(true);
  const [bulkFields, setBulkFields] = useState(() => {
    const init = {};
    BULK_STYLE_FIELDS.forEach(f => { init[f.key] = f.key !== 'letterColors'; });
    return init;
  });
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');

  const orderedFolderOptions = (() => {
    const out = [];
    const walk = (parentId, level) => {
      folders.filter(f => (f.parentId || null) === parentId).forEach(f => {
        out.push({ id: f.id, label: `${'\u00A0\u00A0'.repeat(level)}${level > 0 ? '└ ' : ''}${f.name}` });
        walk(f.id, level + 1);
      });
    };
    walk(null, 0);
    return out;
  })();

  const getDescendants = (rootId) => {
    const res = [rootId];
    const queue = [rootId];
    while (queue.length) {
      const cur = queue.shift();
      folders.filter(f => f.parentId === cur).forEach(ch => { if (!res.includes(ch.id)) { res.push(ch.id); queue.push(ch.id); } });
    }
    return res;
  };

  const bulkFolderName = folders.find(f => f.id === bulkFolderId)?.name || '';

  const handleBulkApply = async () => {
    if (!onBulkApply || !bulkFolderId) { alert('lütfen bir klasör seçin.'); return; }
    const subset = {};
    if (bulkFields.imgScale) subset.imgScale = imgScale;
    if (bulkFields.qContainerScale) subset.qContainerScale = qContainerScale;
    if (bulkFields.qScale) subset.qScale = qScale;
    if (bulkFields.boxScale) subset.boxScale = boxScale;
    if (bulkFields.optImgScale) subset.optImgScale = optImgScale;
    if (bulkFields.textScale) subset.textScale = textScale;
    if (bulkFields.colors) { subset.qColor = qColor; subset.optColor = optColor; }
    if (bulkFields.letterColors) subset.letterColors = letterColors;
    if (Object.keys(subset).length === 0) { alert('en az bir ayar seçin.'); return; }
    const targetFolders = bulkIncludeSub ? getDescendants(bulkFolderId) : [bulkFolderId];
    if (!window.confirm(`"${bulkFolderName}" klasörü${bulkIncludeSub ? ' ve alt klasörleri' : ''} içindeki TÜM sorulara bu görünüm ayarları uygulansın mı?`)) return;
    setBulkBusy(true);
    setBulkMsg('uygulanıyor...');
    try {
      const n = await onBulkApply(targetFolders, subset, (done, total) => setBulkMsg(`uygulanıyor... ${done}/${total}`));
      setBulkMsg(n > 0 ? `✓ ${n} soruya uygulandı` : 'klasörde soru bulunamadı');
    } catch (e) {
      console.error(e);
      setBulkMsg('hata oluştu');
    }
    setBulkBusy(false);
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'style_presets'), (s) => {
        if(s.exists()) setPresets(s.data());
    });
    return () => unsub();
  }, []);

  const [position, setPosition] = useState({ x: window.innerWidth > 768 ? window.innerWidth - 340 : 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [panelScale, setPanelScale] = useState(1);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const pinchStartDist = useRef(0);
  const startScale = useRef(1);

  useEffect(() => {
    setQScale(q.style?.qScale || 1);
    setTextScale(q.style?.textScale || 1);
    setBoxScale(q.style?.boxScale || 1);
    setImgScale(q.style?.imgScale || 1);
    setQContainerScale(q.style?.qContainerScale || 1);
    setQColor(q.style?.qColor || '#1e293b');
    setOptColor(q.style?.optColor || '#334155');
    setOptImgScale(q.style?.optImgScale || 1);
    setLetterColors(q.style?.letterColors || { question: {}, options: {} });
  }, [q]);

  const handleNav = (direction) => {
    let listToUse = (editorContextList && editorContextList.length > 0)
        ? editorContextList
        : [...allQuestions].sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));

    const currentIndex = listToUse.findIndex(item => item.id === q.id);
    if (currentIndex === -1) return;
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < listToUse.length) {
       setQ(listToUse[newIndex]);
    }
  };

  const handleSaveClick = async () => {
      setSaveStatus("kaydediliyor...");
      await onSave(q.id, { qScale, textScale, boxScale, imgScale, qContainerScale, qColor, optColor, letterColors, optImgScale }, saveAsDefault);
      setSaveStatus("kaydedildi!");
      setTimeout(() => setSaveStatus(""), 2000);
  };

  const handleLoadPreset = (slotId) => {
      const p = presets[slotId];
      if(!p) {
          alert(`${slotId}. kutu boş!`);
          return;
      }
      if(window.confirm(`${slotId}. kutudaki ayarları yüklemek istiyor musun?`)) {
          setQScale(p.qScale || 1);
          setTextScale(p.textScale || 1);
          setBoxScale(p.boxScale || 1);
          setImgScale(p.imgScale || 1);
          setQContainerScale(p.qContainerScale || 1);
          setQColor(p.qColor || '#1e293b');
          setOptColor(p.optColor || '#334155');
          setOptImgScale(p.optImgScale || 1);
          setLetterColors(p.letterColors || { question: {}, options: {} });
      }
  };

  const handleSavePreset = async (slotId) => {
      if(!window.confirm(`mevcut ayarları ${slotId}. kutuya kaydetmek istiyor musun? eski ayar silinir.`)) return;

      const styleData = { qScale, textScale, boxScale, imgScale, qContainerScale, qColor, optColor, optImgScale, letterColors };

      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'style_presets'), {
              ...presets,
              [slotId]: styleData
          });
          alert(`${slotId}. kutuya başarıyla kaydedildi!`);
      } catch (e) {
          console.error(e);
          alert("hata oluştu.");
      }
  };

  const handleLetterClick = (type, index, subIndex) => {
       if (!paintMode) return;
       const newColors = { ...letterColors };
       if (!newColors.question) newColors.question = {};
       if (!newColors.options) newColors.options = {};

       if (type === 'question') {
           if (newColors.question[index] === activeColor) {
               delete newColors.question[index];
           } else {
               newColors.question[index] = activeColor;
           }
       } else if (type === 'option') {
           if (!newColors.options[index]) newColors.options[index] = {};

           if (newColors.options[index][subIndex] === activeColor) {
               delete newColors.options[index][subIndex];
           } else {
               newColors.options[index][subIndex] = activeColor;
           }
       }
       setLetterColors(newColors);
  };

  const getDistance = (touch1, touch2) => {
    return Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
  };

  const handleMouseDown = (e) => {
      setIsDragging(true);
      dragStartPos.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y
      };
      e.preventDefault();
  };

  const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
          const target = e.target;
          if (target.closest('.drag-handle')) {
              setIsDragging(true);
              dragStartPos.current = {
                  x: e.touches[0].clientX - position.x,
                  y: e.touches[0].clientY - position.y
              };
          }
      } else if (e.touches.length === 2) {
          setIsDragging(false);
          pinchStartDist.current = getDistance(e.touches[0], e.touches[1]);
          startScale.current = panelScale;
      }
  };

  useEffect(() => {
      const handleMove = (e) => {
          if (isDragging && !e.touches) {
              setPosition({
                  x: e.clientX - dragStartPos.current.x,
                  y: e.clientY - dragStartPos.current.y
              });
          }
      };

      const handleTouchMoveGlobal = (e) => {
          if (e.touches.length === 1 && isDragging) {
              setPosition({
                  x: e.touches[0].clientX - dragStartPos.current.x,
                  y: e.touches[0].clientY - dragStartPos.current.y
              });
              e.preventDefault();
          } else if (e.touches.length === 2) {
              const dist = getDistance(e.touches[0], e.touches[1]);
              if (pinchStartDist.current > 0) {
                  const scaleChange = dist / pinchStartDist.current;
                  let newScale = startScale.current * scaleChange;
                  if (newScale < 0.5) newScale = 0.5;
                  if (newScale > 2.0) newScale = 2.0;
                  setPanelScale(newScale);
              }
              e.preventDefault();
          }
      };

      const handleEnd = () => {
          setIsDragging(false);
          pinchStartDist.current = 0;
      };

      if (isDragging || pinchStartDist.current > 0) {
          window.addEventListener('mousemove', handleMove);
          window.addEventListener('mouseup', handleEnd);
          window.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });
          window.addEventListener('touchend', handleEnd);
      }

      return () => {
          window.removeEventListener('mousemove', handleMove);
          window.removeEventListener('mouseup', handleEnd);
          window.removeEventListener('touchmove', handleTouchMoveGlobal);
          window.removeEventListener('touchend', handleEnd);
      };
  }, [isDragging, panelScale]);

  const questionTextStyle = { fontSize: `${1.25 * qScale}rem`, lineHeight: 1.3, color: qColor };
  const questionContainerStyle = { padding: `${0.5 * qContainerScale}rem` };
  const questionImageStyle = { width: `${100 * imgScale}%`, maxWidth: 'none', height: 'auto', maxHeight: 'none', objectFit: 'contain' };
  const optionButtonStyle = { padding: `${0.5 * boxScale}rem`, minHeight: `${4 * boxScale}rem` };
  const optionTextStyle = { fontSize: `${1.125 * textScale}rem`, color: optColor };

  const presetColors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#000000', '#ffffff'];
  const hasVisibleHeaderInPreview = Boolean(q.customAttachmentImage || (!isInteractiveGridQuestion && q.image) || q.text || q.audio);

  return (
    <div className="fixed inset-0 z-[200] bg-[#F8FAFC] w-full h-full flex flex-col font-sans">
       <div className="flex justify-between items-center px-4 py-2 shrink-0 bg-white border-b">
         <div className="flex items-center gap-2">
            <button onClick={onClose} className="flex items-center gap-2 text-slate-500 font-bold hover:text-red-500 transition-colors"><X size={24}/> <span className="hidden sm:inline">kapat</span></button>
         </div>

         <div className="flex items-center gap-4">
             <button onClick={() => handleNav(-1)} className="p-2 bg-slate-100 rounded-full hover:bg-indigo-100 text-slate-600 hover:text-indigo-600"><ChevronLeft size={24}/></button>
             <div className="flex flex-col items-center"><span className="text-[10px] font-black text-slate-400 uppercase">önizleme modu</span><div className="flex items-center gap-2"><span className="text-sm font-black text-orange-500">soru ıd</span><span className="text-xs font-bold text-slate-300">...{q.id.slice(-4)}</span></div></div>
             <button onClick={() => handleNav(1)} className="p-2 bg-slate-100 rounded-full hover:bg-indigo-100 text-slate-600 hover:text-indigo-600"><ChevronRight size={24}/></button>
         </div>

         <div className="flex items-center gap-2">
            {saveStatus && <span className="text-xs font-bold text-green-500 animate-pulse">{saveStatus}</span>}
            <button onClick={handleSaveClick} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:indigo-700 transition-all flex items-center gap-2"><Save size={18}/> <span className="hidden sm:inline">kaydet</span></button>
         </div>
       </div>
       <div className="h-1.5 bg-slate-200 w-full shrink-0"><div className="h-full bg-orange-400 w-1/2"></div></div>

       <div className="flex-1 overflow-hidden p-2 sm:p-4 md:p-6 flex flex-col relative">
         <div
            onTouchStart={handleTouchStart}
            style={{
               position: 'absolute',
               left: position.x,
               top: position.y,
               zIndex: 999,
               transform: `scale(${panelScale})`,
               transformOrigin: 'top left'
            }}
            className="bg-white/95 backdrop-blur-md shadow-2xl border-2 border-slate-200 p-0 rounded-2xl w-72 animate-in fade-in zoom-in duration-300 flex flex-col touch-none"
         >
            <div
               onMouseDown={handleMouseDown}
               className="drag-handle bg-slate-100 px-4 py-2 rounded-t-2xl border-b border-slate-200 cursor-move flex items-center justify-between group"
            >
               <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                   <Settings2 size={12}/> ayarlar ({Math.round(panelScale * 100)}%)
               </span>
               <Move size={16} className="text-slate-400 group-hover:text-indigo-600"/>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar" onMouseDown={e => e.stopPropagation()}>
               {/* KLASÖRE TOPLU UYGULA */}
               <div className={`border-2 rounded-xl overflow-hidden ${bulkOpen ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200 bg-white'}`}>
                   <button type="button" onClick={() => setBulkOpen(!bulkOpen)} className="w-full flex items-center justify-between px-3 py-2 text-left">
                       <span className="text-xs font-black text-emerald-700 uppercase flex items-center gap-1.5"><FolderOpen size={14}/> klasöre toplu uygula</span>
                       <span className="text-[10px] font-black text-emerald-600">{bulkOpen ? 'gizle' : 'aç'}</span>
                   </button>
                   {bulkOpen && (
                       <div className="px-3 pb-3 space-y-2 animate-in fade-in">
                           <p className="text-[9px] leading-tight text-slate-500">ayarları bu soruda deneyip beğenince, seçtiğiniz klasördeki tüm sorulara tek tıkla uygulayın.</p>
                           <select value={bulkFolderId} onChange={e => setBulkFolderId(e.target.value)} className="w-full p-1.5 rounded-lg border-2 border-emerald-200 text-xs font-bold bg-white outline-none">
                               <option value="">klasör seçin...</option>
                               {orderedFolderOptions.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                           </select>
                           <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                               <input type="checkbox" checked={bulkIncludeSub} onChange={e => setBulkIncludeSub(e.target.checked)} className="w-3.5 h-3.5" /> alt klasörler de dahil
                           </label>
                           <div className="grid grid-cols-2 gap-1">
                               {BULK_STYLE_FIELDS.map(f => (
                                   <label key={f.key} className={`flex items-center gap-1 text-[9px] font-bold rounded-md px-1.5 py-1 border cursor-pointer ${bulkFields[f.key] ? 'bg-white border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                       <input type="checkbox" checked={bulkFields[f.key]} onChange={e => setBulkFields(prev => ({ ...prev, [f.key]: e.target.checked }))} className="w-3 h-3" />
                                       {f.label}
                                   </label>
                               ))}
                           </div>
                           <button type="button" disabled={bulkBusy || !bulkFolderId} onClick={handleBulkApply} className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow">
                               {bulkBusy ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>}
                               {bulkFolderName ? `"${bulkFolderName}" klasörüne uygula` : 'klasöre uygula'}
                           </button>
                           {bulkMsg && <div className="text-[10px] font-black text-emerald-700 text-center">{bulkMsg}</div>}
                       </div>
                   )}
               </div>

               <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                   <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-black text-indigo-600 uppercase flex items-center gap-1"><Palette size={14}/> harf boyama</span>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={paintMode} onChange={(e) => setPaintMode(e.target.checked)} />
                          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                       </label>
                   </div>

                   {paintMode && (
                       <div className="animate-in slide-in-from-top-2 fade-in">
                           <p className="text-[9px] text-slate-500 mb-2 leading-tight">bir renk seç ve metindeki harflere tıkla.</p>
                           <div className="flex flex-wrap gap-1 mb-2">
                               {presetColors.map(c => (
                                   <button
                                     key={c}
                                     onClick={() => setActiveColor(c)}
                                     className={`w-5 h-5 rounded-full border border-slate-200 transition-transform ${activeColor === c ? 'scale-125 ring-2 ring-indigo-400 z-10' : 'hover:scale-110'}`}
                                     style={{ backgroundColor: c }}
                                 />
                               ))}
                               <input type="color" value={activeColor} onChange={(e) => setActiveColor(e.target.value)} className="w-5 h-5 rounded-full p-0 border-none cursor-pointer overflow-hidden"/>
                           </div>
                       </div>
                   )}
               </div>

               <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-black text-orange-600 uppercase flex items-center gap-1"><Save size={14}/> hazır şablonlar</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map(num => (
                            <div key={num} className="flex flex-col items-center gap-1">
                                <button
                                    onClick={() => handleLoadPreset(num)}
                                    title={`${num}. ayarı yükle`}
                                    className="w-full aspect-square bg-white border border-orange-200 rounded-lg flex items-center justify-center font-black text-orange-500 hover:bg-orange-500 hover:text-white transition-colors shadow-sm active:scale-95"
                                >
                                    {num}
                                </button>
                                <button
                                    onClick={() => handleSavePreset(num)}
                                    title="bu ayarı kaydet"
                                    className="text-[10px] text-slate-400 hover:text-indigo-600"
                                >
                                    <Save size={12}/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="text-[8px] text-center text-slate-400 mt-2">numaraya bas: yükle • diskete bas: kaydet</p>
               </div>

               <div className="space-y-2 pb-2 border-b">
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">soru yazısı rengi</span>
                      <input type="color" value={qColor} onChange={(e) => setQColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0"/>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">şık yazısı rengi</span>
                      <input type="color" value={optColor} onChange={(e) => setOptColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none p-0"/>
                  </div>
               </div>

                <div className="space-y-1"><div className="flex justify-between text-[10px] font-bold text-slate-500"><span>görsel boyutu</span><span>{imgScale.toFixed(1)}x</span></div><input type="range" min="0.5" max="2.0" step="0.1" value={imgScale} onChange={e => setImgScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/></div>

                <div className="space-y-1"><div className="flex justify-between text-[10px] font-bold text-slate-500"><span>soru kutusu</span><span>{qContainerScale.toFixed(1)}x</span></div><input type="range" min="0.5" max="5.0" step="0.1" value={qContainerScale} onChange={e => setQContainerScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"/></div>

                <div className="space-y-1"><div className="flex justify-between text-[10px] font-bold text-slate-500"><span>soru yazısı</span><span>{qScale.toFixed(1)}x</span></div><input type="range" min="0.5" max="6.0" step="0.1" value={qScale} onChange={e => setQScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"/></div>

                <div className="border-t my-2"></div>

                <div className="space-y-1"><div className="flex justify-between text-[10px] font-bold text-slate-500"><span>seçenek kutusu</span><span>{boxScale.toFixed(1)}x</span></div><input type="range" min="0.5" max="2.0" step="0.1" value={boxScale} onChange={e => setBoxScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"/></div>

                <div className="space-y-1"><div className="flex justify-between text-[10px] font-bold text-slate-500"><span>seçenek görseli</span><span>{optImgScale.toFixed(1)}x</span></div><input type="range" min="0.5" max="2.0" step="0.1" value={optImgScale} onChange={e => setOptImgScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"/></div>

                <div className="space-y-1"><div className="flex justify-between text-[10px] font-bold text-slate-500"><span>seçenek yazısı</span><span>{textScale.toFixed(1)}x</span></div><input type="range" min="0.5" max="6.0" step="0.1" value={textScale} onChange={e => setTextScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"/></div>

                <div className="flex items-center gap-2 mt-4 p-2 bg-slate-50 rounded-lg border border-slate-200"><input type="checkbox" id="saveDefault" checked={saveAsDefault} onChange={(e) => setSaveAsDefault(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"/><label htmlFor="saveDefault" className="text-[10px] font-bold text-slate-600 select-none cursor-pointer">bundan sonraki sorular için bu ayarı kaydet</label></div>
            </div>
         </div>

         <div className="flex-1 bg-white shadow-2xl border-2 border-slate-100 rounded-[2rem] flex flex-col relative overflow-hidden">
             {paintMode && (
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black py-1 px-3 rounded-full z-40 shadow-lg pointer-events-none animate-bounce">
                     boyama modu akti̇f
                 </div>
             )}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 flex flex-col justify-start">
               {(isInteractiveGridQuestion || hasVisibleHeaderInPreview) && (
                 <div className="w-full flex flex-col items-center justify-center min-h-0 mb-2 transition-all duration-300 overflow-hidden relative" style={questionContainerStyle}>
                     {q.customAttachmentImage && <img src={q.customAttachmentImage} draggable="false" className="max-h-28 object-contain rounded-xl mb-1 shadow-sm" />}
                     {!isInteractiveGridQuestion && q.image && <img src={q.image} draggable="false" className="rounded-none shadow-sm transition-all duration-300" style={questionImageStyle} />}
                     {q.audio && (
                         <div className="scale-[0.6] -mt-3 -mb-3 origin-center">
                             <FancyAudioPlayer src={q.audio} autoPlay={false} label="" color="orange" size="small" />
                         </div>
                     )}
                     {q.text && (
                         <h3 className="font-black text-center leading-tight transition-all duration-300 mt-1" style={{...questionTextStyle, color: undefined}}>
                             <RenderTextWithHighlights
                                 text={q.text}
                                 globalColor={qColor}
                                 highlights={letterColors.question}
                                 isInteractive={paintMode}
                                 onLetterClick={(idx) => handleLetterClick('question', idx)}
                             />
                         </h3>
                     )}
                 </div>
               )}

               {isDotQuestion ? (
                 <div className="flex flex-col items-center justify-center gap-3 py-2">
                   <DotGridPad rows={q.dotGrid?.rows || 3} cols={q.dotGrid?.cols || 3} lines={q.dotGrid?.lines || []} readOnly={true} size={Math.round(150 * imgScale)} title="" />
                   <DotGridPad rows={q.dotGrid?.rows || 3} cols={q.dotGrid?.cols || 3} lines={[]} onChange={() => {}} readOnly={false} size={Math.round(160 * boxScale)} title="" />
                 </div>
               ) : isColorGridQuestion ? (
                 <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
                   <ColorGridPad rows={q.colorGrid?.rows || 3} cols={q.colorGrid?.cols || 3} cells={q.colorGrid?.cells || {}} readOnly={true} size={Math.round(165 * imgScale)} title="" />
                   <ColorGridPad rows={q.colorGrid?.rows || 3} cols={q.colorGrid?.cols || 3} cells={{}} readOnly={true} size={Math.round(170 * boxScale)} title="" />
                 </div>
               ) : isSudokuQuestion ? (
                 <div className="flex justify-center py-4">
                   <SudokuGridPad gridSize={q.sudokuGrid?.rows || 3} symbols={q.sudokuGrid?.symbols} clues={q.sudokuGrid?.clues || {}} readOnly={true} size={Math.round(240 * boxScale)} title="sudoku önizleme" />
                 </div>
               ) : isCodingQuestion ? (
                 <div className="flex justify-center py-4">
                   <CodingActivityPad
                     key={`preview-coding-${q.id}`}
                     mode={q.codingGrid?.mode || (q.questionType === 'line_coding' ? 'line' : 'box')}
                     method={q.codingGrid?.method || 'method1'}
                     rows={q.codingGrid?.rows || 3}
                     cols={q.codingGrid?.cols || 3}
                     path={q.codingGrid?.path || []}
                     startImage={q.codingGrid?.startImage}
                     targetImage={q.codingGrid?.targetImage}
                     readOnly={true}
                     size={Math.round(240 * boxScale)}
                     title="kodlama önizleme"
                   />
                 </div>
               ) : isPatternQuestion ? (
                 <div className="flex justify-center py-4">
                   <ColorPatternPad cells={q.patternGrid?.cells || []} hiddenIndices={q.patternGrid?.hiddenIndices || []} readOnly={true} title="renk örüntüsü önizleme" />
                 </div>
               ) : isSymmetryQuestion ? (
                 <div className="flex justify-center py-4">
                   <SymmetryGridPad gridSize={q.symmetryGrid?.size || 6} leftCells={q.symmetryGrid?.leftCells || {}} readOnly={true} size={Math.round(240 * boxScale)} title="simetri önizleme" />
                 </div>
               ) : isMatrixShapeQuestion ? (
                 <div className="flex justify-center py-4">
                   <MatrixShapePad matrixData={q.matrixShapeGrid || {}} readOnly={true} title="tablo oluşturma önizleme" />
                 </div>
               ) : isMatrixPaintQuestion ? (
                 <div className="flex justify-center py-4">
                   <MatrixPaintPad paintData={q.matrixPaintGrid || {}} readOnly={true} title="tablo boyama önizleme" />
                 </div>
               ) : isNumberConnectQuestion ? (
                 <div className="flex justify-center py-4">
                   <NumberConnectPad connectData={q.numberConnectGrid || {}} readOnly={true} showSolution={true} size={Math.round(240 * boxScale)} title="sıralı çizgi önizleme" />
                 </div>
               ) : isMazeQuestion ? (
                 <div className="flex justify-center py-4">
                   <InteractiveMazePad mazeData={q.mazeGrid || {}} readOnly={true} size={Math.round(240 * boxScale)} title="labirent önizleme" />
                 </div>
               ) : isBarGraphQuestion ? (
                 <div className="flex justify-center py-4">
                   <BarGraphActivityPad graphData={q.barGraphGrid || {}} readOnly={true} title="grafik oluşturma önizleme" />
                 </div>
               ) : isSequenceQuestion ? (
                 <div className="flex justify-center py-4">
                   <SequenceMemoryPad seqData={q.sequenceGrid || {}} studentSequence={[]} onChangeStudentSequence={() => {}} readOnly={false} autoPlay={true} size={Math.round(340 * boxScale)} title="sırayı takip et önizleme" />
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-2 shrink-0 transition-all duration-300 pb-2">
                    {(q.options || []).map((opt, i) => (
                        <div key={i} className="bg-white border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center text-center shadow-sm hover:border-indigo-300 transition-all duration-300 border-b-4 gap-1 p-2" style={optionButtonStyle}>
                            {opt.audio && <OptionAudioButton src={opt.audio} small />}
                            {opt.image && <img src={opt.image} draggable="false" className="object-contain" style={{ height: opt.text ? `${75 * optImgScale}%` : `${100 * optImgScale}%` }} />}
                            {opt.text && (
                                <span className="font-bold leading-tight" style={{...optionTextStyle, color: undefined}}>
                                    <RenderTextWithHighlights
                                        text={opt.text}
                                        globalColor={optColor}
                                        highlights={letterColors.options && letterColors.options[i] ? letterColors.options[i] : {}}
                                        isInteractive={paintMode}
                                        onLetterClick={(charIdx) => handleLetterClick('option', i, charIdx)}
                                    />
                                </span>
                            )}
                        </div>
                      ))}
                    <button className={`bg-indigo-600 border-b-4 border-indigo-800 text-white rounded-xl flex flex-col items-center justify-center text-center shadow-lg active:scale-95 transition-all hover:scale-[1.02] ${(q.options || []).length % 2 === 0 ? 'col-span-2' : ''}`} style={optionButtonStyle}>
                        <span className="font-black text-xl flex items-center gap-2">devam <ArrowRight size={20}/></span>
                    </button>
                 </div>
               )}
             </div>
         </div>
       </div>
    </div>
  );
}
