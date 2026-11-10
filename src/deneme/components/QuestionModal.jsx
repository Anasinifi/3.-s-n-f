import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { FancyAudioPlayer, OptionAudioButton } from './common/AudioPlayers';
import { RenderTextWithHighlights } from './common/RenderTextWithHighlights';
import { DotGridPad } from '../activities/dotGrid';
import { ColorGridPad } from '../activities/colorGrid';
import { SudokuGridPad } from '../activities/sudoku';
import { CodingActivityPad } from '../activities/coding';
import { ColorPatternPad } from '../activities/colorPattern';
import { SymmetryGridPad } from '../activities/symmetry';
import { MatrixShapePad } from '../activities/matrixShape';
import { MatrixPaintPad } from '../activities/matrixPaint';
import { NumberConnectPad } from '../activities/numberConnect';
import { InteractiveMazePad } from '../activities/maze';
import { BarGraphActivityPad } from '../activities/barGraph';
import { SequenceMemoryPad } from '../activities/sequenceMemory';

// ============================================================================
// --- GRUP: ÖĞRENCİ CEVAP DETAY MODALI (QUESTION MODAL) ---
// ============================================================================
export function QuestionModal({ initialResultIndex, results, allQuestions, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialResultIndex || 0);

  const currentResult = results[currentIndex];
  const q = allQuestions.find(item => item.id === currentResult.questionId);

  if (!q) return null;
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
  const isAnyInteractive = isDotQuestion || isColorGridQuestion || isSudokuQuestion || isCodingQuestion || isPatternQuestion || isSymmetryQuestion || isMatrixShapeQuestion || isMatrixPaintQuestion || isNumberConnectQuestion || isMazeQuestion || isBarGraphQuestion || isSequenceQuestion;

  let parsedStudentData = null;
  if (currentResult?.userChoice) {
    try {
      parsedStudentData = JSON.parse(currentResult.userChoice);
    } catch (_) {}
  }

  const nextQuestion = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const qScale = q.style?.qScale || 1;
  const textScale = q.style?.textScale || 1;
  const boxScale = q.style?.boxScale || 1;
  const imgScale = q.style?.imgScale || 1;
  const qContainerScale = q.style?.qContainerScale || 1;
  const qColor = q.style?.qColor || '#1e293b';
  const optColor = q.style?.optColor || '#334155';
  const optImgScale = q.style?.optImgScale || 1;
  const letterColors = q.style?.letterColors || {};

  const questionTextStyle = { fontSize: `${1.25 * qScale}rem`, lineHeight: 1.3, color: qColor };
  const questionContainerStyle = { padding: `${0.5 * qContainerScale}rem` };
  const questionImageStyle = { width: `${100 * imgScale}%`, maxWidth: '100%', height: 'auto', maxHeight: '50vh', objectFit: 'contain' };
  const optionButtonStyle = { padding: `${0.5 * boxScale}rem`, minHeight: `${4 * boxScale}rem` };
  const optionTextStyle = { fontSize: `${1.125 * textScale}rem`, color: optColor };

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[200] flex flex-col animate-in fade-in" onClick={(e) => e.stopPropagation()}>
       <div className="flex justify-between items-center px-4 py-2 bg-white border-b shrink-0">
         <div className="flex items-center gap-2">
             <span className="font-black text-slate-800 text-sm">sonuç i̇nceleme</span>
             <span className="text-xs font-bold text-slate-400">({currentIndex + 1} / {results.length})</span>
         </div>
         <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"><X size={20}/></button>
       </div>

       <div className="flex-1 overflow-hidden relative flex flex-col">
         <button
           onClick={prevQuestion}
           disabled={currentIndex === 0}
           className="absolute left-2 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/80 backdrop-blur-sm shadow-lg rounded-full border text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-all"
         >
           <ChevronLeft size={32} />
         </button>

         <button
           onClick={nextQuestion}
           disabled={currentIndex === results.length - 1}
           className="absolute right-2 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/80 backdrop-blur-sm shadow-lg rounded-full border text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-all"
         >
           <ChevronRight size={32} />
         </button>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 pb-20">
             <div className="w-full flex flex-col items-center justify-center min-h-0 mb-4 transition-all duration-300" style={questionContainerStyle}>
                {q.customAttachmentImage && <img src={q.customAttachmentImage} draggable="false" className="max-h-28 object-contain rounded-xl mb-2 shadow-sm" />}
                {!isAnyInteractive && q.image && <img src={q.image} draggable="false" className="rounded-xl shadow-sm mb-2" style={questionImageStyle} />}
                {q.audio && <FancyAudioPlayer src={q.audio} autoPlay={false} label="di̇nle" color="indigo" size="small" />}

                {q.text && (
                  <h3 className="font-black text-center leading-tight transition-all duration-300 mt-2" style={{...questionTextStyle, color: undefined}}>
                      <RenderTextWithHighlights
                        text={q.text}
                        globalColor={qColor}
                        highlights={letterColors.question}
                      />
                   </h3>
                )}
             </div>

             {isDotQuestion ? (
               <div className="flex flex-col items-center justify-center gap-4 max-w-3xl mx-auto">
                 <DotGridPad rows={q.dotGrid?.rows || 3} cols={q.dotGrid?.cols || 3} lines={q.dotGrid?.lines || []} readOnly={true} size={185} title="" />
                 <DotGridPad rows={q.dotGrid?.rows || 3} cols={q.dotGrid?.cols || 3} lines={Array.isArray(parsedStudentData) ? parsedStudentData : []} readOnly={true} size={185} title="" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isColorGridQuestion ? (
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-3xl mx-auto">
                 <ColorGridPad rows={q.colorGrid?.rows || 3} cols={q.colorGrid?.cols || 3} cells={q.colorGrid?.cells || {}} readOnly={true} size={165} title="" />
                 <ColorGridPad rows={q.colorGrid?.rows || 3} cols={q.colorGrid?.cols || 3} cells={parsedStudentData || {}} readOnly={true} size={170} title="" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isSudokuQuestion ? (
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-3xl mx-auto">
                 <SudokuGridPad gridSize={q.sudokuGrid?.rows || 3} clues={q.sudokuGrid?.clues || {}} studentCells={parsedStudentData || {}} readOnly={true} size={240} title="öğrenci̇ni̇n sudoku cevabı" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isCodingQuestion ? (
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-3xl mx-auto">
                 <CodingActivityPad
                   key={`modal-coding-${q.id}-${currentIndex}`}
                   mode={q.codingGrid?.mode || (q.questionType === 'line_coding' ? 'line' : 'box')}
                   method={q.codingGrid?.method || 'method1'}
                   rows={q.codingGrid?.rows || 3}
                   cols={q.codingGrid?.cols || 3}
                   path={q.codingGrid?.path || []}
                   startImage={q.codingGrid?.startImage}
                   targetImage={q.codingGrid?.targetImage}
                   studentArrows={parsedStudentData?.arrows || []}
                   studentMarkedCells={parsedStudentData?.markedCells || []}
                   readOnly={true}
                   size={240}
                   title="öğrenci̇ni̇n kodlama cevabı"
                   status={currentResult.isCorrect ? 'correct' : 'wrong'}
                 />
               </div>
             ) : isPatternQuestion ? (
               <div className="flex flex-col items-center justify-center gap-6 max-w-3xl mx-auto">
                 <ColorPatternPad cells={q.patternGrid?.cells || []} hiddenIndices={q.patternGrid?.hiddenIndices || []} studentAnswers={parsedStudentData || {}} readOnly={true} title="öğrenci̇ni̇n örüntü cevabı" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isSymmetryQuestion ? (
               <div className="flex justify-center max-w-3xl mx-auto">
                 <SymmetryGridPad gridSize={q.symmetryGrid?.size || 6} leftCells={q.symmetryGrid?.leftCells || {}} studentCells={parsedStudentData || {}} readOnly={true} size={240} title="öğrenci̇ni̇n si̇metri̇ cevabı" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isMatrixShapeQuestion ? (
               <div className="flex justify-center max-w-3xl mx-auto">
                 <MatrixShapePad matrixData={q.matrixShapeGrid || {}} studentCells={parsedStudentData || {}} readOnly={true} title="öğrenci̇ni̇n tablo cevabı" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isMatrixPaintQuestion ? (
               <div className="flex justify-center max-w-3xl mx-auto">
                 <MatrixPaintPad paintData={q.matrixPaintGrid || {}} studentCells={parsedStudentData || {}} readOnly={true} title="öğrenci̇ni̇n tablo boyama cevabı" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isNumberConnectQuestion ? (
               <div className="flex justify-center max-w-3xl mx-auto">
                 <NumberConnectPad connectData={q.numberConnectGrid || {}} studentConnections={Array.isArray(parsedStudentData) ? parsedStudentData : []} readOnly={true} size={240} title="öğrenci̇ni̇n çi̇zgi̇ cevabı" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isMazeQuestion ? (
               <div className="flex justify-center max-w-3xl mx-auto">
                 <InteractiveMazePad mazeData={q.mazeGrid || {}} studentPath={Array.isArray(parsedStudentData) ? parsedStudentData : ['0,0']} readOnly={true} size={240} title="öğrenci̇ni̇n labi̇rent yolu" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isBarGraphQuestion ? (
               <div className="flex justify-center max-w-3xl mx-auto">
                 <BarGraphActivityPad graphData={q.barGraphGrid || {}} studentCols={parsedStudentData || {}} readOnly={true} title="öğrenci̇ni̇n grafi̇k cevabı" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : isSequenceQuestion ? (
               <div className="flex justify-center max-w-3xl mx-auto">
                 <SequenceMemoryPad seqData={q.sequenceGrid || {}} studentSequence={Array.isArray(parsedStudentData) ? parsedStudentData : []} readOnly={true} autoPlay={false} showAnswerKey={true} title="öğrencinin dokunma sırası" status={currentResult.isCorrect ? 'correct' : 'wrong'} />
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-3xl mx-auto">
                 {(q.options || []).map((o, i) => {
                   let isCorrectOption = false;
                   if (q.correctIndex !== undefined) isCorrectOption = i === q.correctIndex;
                   else isCorrectOption = String(o.text).trim().toLowerCase() === String(q.correctText).trim().toLowerCase();

                   const isUserSelection = currentResult.userChoice === (o.text || `seçenek ${i+1}`);

                   let btnClass = "bg-white border-slate-200 opacity-60";
                   let currentTextStyle = { ...optionTextStyle };

                   if (isCorrectOption) {
                     btnClass = "bg-green-500 border-green-600 text-white ring-4 ring-green-100 opacity-100";
                     currentTextStyle.color = 'white';
                   } else if (isUserSelection && !isCorrectOption) {
                     btnClass = "bg-red-500 border-red-600 text-white ring-4 ring-red-100 opacity-100";
                     currentTextStyle.color = 'white';
                   }

                   const optHighlights = letterColors.options && letterColors.options[i] ? letterColors.options[i] : {};

                   return (
                     <div key={i} className={`relative border-b-4 rounded-xl transition-all ${btnClass} flex flex-col items-center justify-center shadow-sm text-center gap-1 p-2`} style={optionButtonStyle}>
                           {o.audio && <OptionAudioButton src={o.audio} small />}
                           {o.image && <img src={o.image} draggable="false" className="object-contain" style={{ height: o.text ? `${75 * optImgScale}%` : `${100 * optImgScale}%` }} />}

                           {o.text && (
                             <span className="font-bold leading-tight" style={{...currentTextStyle, color: undefined}}>
                                <RenderTextWithHighlights
                                    text={o.text}
                                    globalColor={(isCorrectOption || (isUserSelection && !isCorrectOption)) ? 'white' : optColor}
                                    highlights={(isCorrectOption || (isUserSelection && !isCorrectOption)) ? {} : optHighlights}
                                />
                             </span>
                           )}

                           {isUserSelection && !isCorrectOption && <div className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-0.5"><X size={12} strokeWidth={4}/></div>}
                           {isCorrectOption && <div className="absolute top-1 right-1 bg-white text-green-500 rounded-full p-0.5"><Check size={12} strokeWidth={4}/></div>}
                      </div>
                   )
                 })}
               </div>
             )}

         </div>
       </div>
    </div>
  );
}
