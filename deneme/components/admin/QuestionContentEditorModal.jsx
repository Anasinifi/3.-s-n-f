import React, { useState, useEffect } from 'react';
import { Edit2, ChevronLeft, ChevronRight, X, Loader2, Save } from 'lucide-react';
import { normalizeDotLines, generateDotGridSvgDataUrl, DotGridPad } from '../../activities/dotGrid';
import { normalizeColorCells, generateColorGridSvgDataUrl, ColorGridPad } from '../../activities/colorGrid';
import { MediaUploader } from '../common/MediaUploader';

export function QuestionContentEditorModal({ q, allQuestions, setQ, onClose, onSave, editorContextList }) {
    const [qName, setQName] = useState("");
    const [qText, setQText] = useState("");
    const [qImg, setQImg] = useState("");
    const [qCustomAttachmentImg, setQCustomAttachmentImg] = useState("");
    const [qVid, setQVid] = useState("");
    const [qAud, setQAud] = useState("");
    const [qPreAud1, setQPreAud1] = useState("");
    const [qPreAud2, setQPreAud2] = useState("");
    const [qTimeLimit, setQTimeLimit] = useState(75);
    const [isMem, setIsMem] = useState(false);
    const [memTime, setMemTime] = useState(15);
    const [qOpts, setQOpts] = useState([]);
    const [correctIdx, setCorrectIdx] = useState(0);
    const [dotRows, setDotRows] = useState(3);
    const [dotCols, setDotCols] = useState(3);
    const [dotLines, setDotLines] = useState([]);
    const [boxRows, setBoxRows] = useState(3);
    const [boxCols, setBoxCols] = useState(3);
    const [boxCells, setBoxCells] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState("");

    const isDotQuestion = Boolean(q.questionType === 'dot_grid' || (q.dotGrid && q.dotGrid.rows));
    const isColorGridQuestion = Boolean(q.questionType === 'color_grid' || (q.colorGrid && q.colorGrid.rows));
    const isOtherInteractive = Boolean(
      q.questionType === 'sudoku_grid' || q.sudokuGrid ||
      q.questionType === 'box_coding' || q.questionType === 'line_coding' || q.codingGrid ||
      q.questionType === 'color_pattern' || q.patternGrid ||
      q.questionType === 'symmetry_grid' || q.symmetryGrid ||
      q.questionType === 'matrix_shape' || q.matrixShapeGrid ||
      q.questionType === 'matrix_paint' || q.matrixPaintGrid ||
      q.questionType === 'number_connect' || q.numberConnectGrid ||
      q.questionType === 'interactive_maze' || q.mazeGrid ||
      q.questionType === 'bar_graph' || q.barGraphGrid ||
      q.questionType === 'sequence_memory' || q.sequenceGrid
    );

    useEffect(() => {
        setQName(q.name || "");
        setQText(q.text || "");
        setQImg(q.image || "");
        setQCustomAttachmentImg(q.customAttachmentImage || "");
        setQVid(q.video || "");
        setQAud(q.audio || "");
        setQPreAud1(q.preAudio1 || q.preAudio || "");
        setQPreAud2(q.preAudio2 || "");
        setQTimeLimit(q.timeLimit || 75);
        setIsMem(q.isMemory || false);
        setMemTime(q.memoryTime || 15);
        const normalizedOpts = (q.options || [{text:"",image:"",audio:""}, {text:"",image:"",audio:""}, {text:"",image:"",audio:""}]).map(o => ({
          text: o.text || "",
          image: o.image || "",
          audio: o.audio || ""
        }));
        setQOpts(normalizedOpts);
        setCorrectIdx(q.correctIndex !== undefined ? q.correctIndex : 0);
        setDotRows(q.dotGrid?.rows || 3);
        setDotCols(q.dotGrid?.cols || 3);
        setDotLines(q.dotGrid?.lines || []);
        setBoxRows(q.colorGrid?.rows || 3);
        setBoxCols(q.colorGrid?.cols || 3);
        setBoxCells(q.colorGrid?.cells || {});
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

    const handleSave = async () => {
        if (isDotQuestion) {
            const normalized = normalizeDotLines(dotLines);
            if (normalized.length === 0) {
                alert("lütfen en az bir çizgi çizin.");
                return;
            }
            setIsSaving(true);
            setSaveFeedback("kaydediliyor...");
            const safeR = Math.max(1, Math.min(10, Number(dotRows) || 3));
            const safeC = Math.max(1, Math.min(10, Number(dotCols) || 3));
            const svgPreview = generateDotGridSvgDataUrl(safeR, safeC, normalized);
            const data = {
                name: qName.trim() || `${safeR}x${safeC} noktalı soru`,
                text: qText.trim(),
                image: svgPreview,
                customAttachmentImage: qCustomAttachmentImg || "",
                video: qVid || "",
                audio: qAud || "",
                preAudio1: qPreAud1 || "",
                preAudio2: qPreAud2 || "",
                timeLimit: Number(qTimeLimit),
                isMemory: isMem,
                memoryTime: Number(memTime),
                questionType: 'dot_grid',
                dotGrid: { rows: safeR, cols: safeC, lines: normalized },
                options: [],
                correctText: 'dot_grid',
                correctIndex: 0
            };
            await onSave(q.id, data);
            setIsSaving(false);
            setSaveFeedback("kaydedildi!");
            setTimeout(() => setSaveFeedback(""), 2000);
            return;
        }

        if (isColorGridQuestion) {
            const normalizedCells = normalizeColorCells(boxCells);
            if (Object.keys(normalizedCells).length === 0) {
                alert("lütfen en az bir kutuyu boyayın.");
                return;
            }
            setIsSaving(true);
            setSaveFeedback("kaydediliyor...");
            const safeR = Math.max(1, Math.min(10, Number(boxRows) || 3));
            const safeC = Math.max(1, Math.min(10, Number(boxCols) || 3));
            const svgPreview = generateColorGridSvgDataUrl(safeR, safeC, normalizedCells);
            const data = {
                name: qName.trim() || `${safeR}x${safeC} kutu boyama`,
                text: qText.trim(),
                image: svgPreview,
                customAttachmentImage: qCustomAttachmentImg || "",
                video: qVid || "",
                audio: qAud || "",
                preAudio1: qPreAud1 || "",
                preAudio2: qPreAud2 || "",
                timeLimit: Number(qTimeLimit),
                isMemory: isMem,
                memoryTime: Number(memTime),
                questionType: 'color_grid',
                colorGrid: { rows: safeR, cols: safeC, cells: normalizedCells },
                options: [],
                correctText: 'color_grid',
                correctIndex: 0
            };
            await onSave(q.id, data);
            setIsSaving(false);
            setSaveFeedback("kaydedildi!");
            setTimeout(() => setSaveFeedback(""), 2000);
            return;
        }

        if (isOtherInteractive) {
            setIsSaving(true);
            setSaveFeedback("kaydediliyor...");
            const data = {
                name: qName.trim(),
                text: qText.trim(),
                customAttachmentImage: qCustomAttachmentImg || "",
                video: qVid || "",
                audio: qAud || "",
                preAudio1: qPreAud1 || "",
                preAudio2: qPreAud2 || "",
                timeLimit: Number(qTimeLimit),
                isMemory: isMem,
                memoryTime: Number(memTime)
            };
            await onSave(q.id, data);
            setIsSaving(false);
            setSaveFeedback("kaydedildi!");
            setTimeout(() => setSaveFeedback(""), 2000);
            return;
        }

        if (correctIdx === null) { console.warn("doğru cevap seçili değil"); return; }
        setIsSaving(true);
        setSaveFeedback("kaydediliyor...");
        const data = {
            name: qName.trim(),
            text: qText.trim(), image: qImg || "", video: qVid || "", audio: qAud || "",
            preAudio1: qPreAud1 || "", preAudio2: qPreAud2 || "",
            timeLimit: Number(qTimeLimit), isMemory: isMem, memoryTime: Number(memTime), options: qOpts,
            correctText: qOpts[correctIdx].text, correctIndex: correctIdx
        };
        await onSave(q.id, data);
        setIsSaving(false);
        setSaveFeedback("kaydedildi!");
        setTimeout(() => setSaveFeedback(""), 2000);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2rem] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
               <div className="flex justify-between items-center p-4 sm:p-6 border-b shrink-0 bg-slate-50">
                  <div className="flex items-center gap-2">
                      <h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><Edit2 size={24} className="text-indigo-600"/> soruyu düzenle</h3>
                  </div>

                  <div className="flex items-center gap-4">
                      <button onClick={() => handleNav(-1)} className="p-2 bg-white border rounded-full hover:bg-indigo-100 hover:text-indigo-600 shadow-sm"><ChevronLeft size={24}/></button>
                      <span className="text-xs font-black text-slate-400">...{q.id.slice(-4)}</span>
                      <button onClick={() => handleNav(1)} className="p-2 bg-white border rounded-full hover:bg-indigo-100 hover:text-indigo-600 shadow-sm"><ChevronRight size={24}/></button>
                  </div>

                  <button onClick={onClose} className="p-2 bg-white rounded-full border hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
              </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <input
                      placeholder="soru adı (sadece yönetici görür, isteğe bağlı)..."
                      className="w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-colors"
                      value={qName}
                      onChange={e => setQName(e.target.value)}
                  />
                  <textarea
                      placeholder="soru metni (çocukların göreceği yazı, isteğe bağlı)..."
                      className="w-full p-4 border-2 rounded-2xl font-bold outline-none h-32 focus:border-indigo-500 transition-colors"
                      value={qText}
                      onChange={e => setQText(e.target.value)}
                  />

                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2"><label className="text-xs font-black text-slate-500 uppercase">süre (sn):</label><input type="number" className="w-20 p-2 rounded-lg border font-bold text-center" value={qTimeLimit} onChange={e => setQTimeLimit(e.target.value)} /></div>
                      <div className="w-px h-8 bg-slate-300 mx-2"></div>
                      <button onClick={() => setIsMem(!isMem)} className={`px-3 py-2 rounded-lg text-xs font-black border transition-colors ${isMem ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>{isMem ? 'süreli görme (hafıza) açık' : 'daimi göster (hafıza kapalı)'}</button>
                      {isMem && <input type="number" placeholder="bakma (sn)" className="w-20 p-2 rounded-lg border font-bold text-center" value={memTime} onChange={e => setMemTime(e.target.value)} />}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {(!isDotQuestion && !isColorGridQuestion && !isOtherInteractive) ? (
                        <MediaUploader label="görsel" value={qImg} onChange={setQImg} id="modal-q1" small/>
                      ) : (
                        <MediaUploader label="ek soru görseli" value={qCustomAttachmentImg} onChange={setQCustomAttachmentImg} id="modal-q-custom-img" small/>
                      )}
                      <MediaUploader label="ön ses 1" value={qPreAud1} onChange={setQPreAud1} id="modal-q4-1" type="audio" small/>
                      <MediaUploader label="ön ses 2" value={qPreAud2} onChange={setQPreAud2} id="modal-q4-2" type="audio" small/>
                      <MediaUploader label="video" value={qVid} onChange={setQVid} type="video" id="modal-q2" small/>
                      <MediaUploader label="ses" value={qAud} onChange={setQAud} type="audio" id="modal-q3" small/>
                  </div>

                  {isDotQuestion ? (
                      <div className="bg-slate-50 p-4 rounded-2xl border space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-xs font-black text-slate-500 uppercase">nokta tablosu boyutu:</span>
                              <div className="flex items-center gap-2">
                                  <input type="number" min="1" max="10" value={dotRows} onChange={e => { setDotRows(e.target.value); setDotLines([]); }} className="w-16 p-1.5 rounded-lg border font-black text-center" />
                                  <span className="font-black">×</span>
                                  <input type="number" min="1" max="10" value={dotCols} onChange={e => { setDotCols(e.target.value); setDotLines([]); }} className="w-16 p-1.5 rounded-lg border font-black text-center" />
                              </div>
                          </div>
                          <div className="flex justify-center">
                              <DotGridPad rows={dotRows} cols={dotCols} lines={dotLines} onChange={setDotLines} size={240} title="noktalı çi̇zi̇mi̇ düzenle" />
                          </div>
                      </div>
                  ) : isColorGridQuestion ? (
                      <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100 space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-xs font-black text-slate-500 uppercase">kutu tablosu boyutu (1-10):</span>
                              <div className="flex items-center gap-2">
                                  <input type="number" min="1" max="10" value={boxRows} onChange={e => { setBoxRows(e.target.value); setBoxCells({}); }} className="w-16 p-1.5 rounded-lg border font-black text-center" />
                                  <span className="font-black">×</span>
                                  <input type="number" min="1" max="10" value={boxCols} onChange={e => { setBoxCols(e.target.value); setBoxCells({}); }} className="w-16 p-1.5 rounded-lg border font-black text-center" />
                              </div>
                          </div>
                          <div className="flex justify-center">
                              <ColorGridPad rows={boxRows} cols={boxCols} cells={boxCells} onChange={setBoxCells} size={240} title="kutu boyamayı düzenle" />
                          </div>
                      </div>
                  ) : isOtherInteractive ? (
                      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-center text-xs font-bold text-indigo-700">
                        Tablo/şablon detaylarını değiştirmek için soru kartındaki kalem (düzenle) ikonuna tıklayarak Etkileşimli Sorular sekmesinde açabilirsiniz.
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {qOpts.map((o, i) => (
                              <div key={i} className={`p-4 border-2 rounded-2xl transition-all space-y-2 ${correctIdx === i ? 'border-green-500 bg-green-50' : 'bg-white border-slate-200'}`}>
                                   <div className="flex justify-between items-center mb-1">
                                       <span className="text-xs font-black text-slate-400 uppercase">seçenek {i+1}</span>
                                       <button type="button" onClick={() => setCorrectIdx(i)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${correctIdx === i ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'}`}>{correctIdx === i ? 'doğru cevap' : 'i̇şaretle'}</button>
                                   </div>
                                   <input placeholder={`seçenek metni`} className="w-full p-2 bg-transparent text-sm font-bold border-b outline-none" value={o.text} onChange={e => {const n = [...qOpts]; n[i].text = e.target.value; setQOpts(n)}} />
                                   <div className="grid grid-cols-2 gap-2">
                                     <MediaUploader label="görsel" small value={o.image} onChange={v => {const n = [...qOpts]; n[i].image = v; setQOpts(n)}} id={`modal-o-${i}`} />
                                     <MediaUploader label="şık sesi" small type="audio" value={o.audio || ""} onChange={v => {const n = [...qOpts]; n[i].audio = v; setQOpts(n)}} id={`modal-o-aud-${i}`} />
                                  </div>
                              </div>
                          ))}
                    </div>
                  )}
            </div>

               <div className="p-6 border-t bg-slate-50 shrink-0 flex items-center gap-4">
                  {saveFeedback && <span className="font-bold text-green-600 animate-pulse">{saveFeedback}</span>}
                  <button disabled={isSaving} onClick={handleSave} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                      {isSaving ? <Loader2 className="animate-spin"/> : <><Save size={20}/> deği̇şi̇kli̇kleri̇ kaydet</>}
                  </button>
              </div>
          </div>
        </div>
    );
}
