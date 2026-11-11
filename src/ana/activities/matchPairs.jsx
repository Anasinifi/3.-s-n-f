import React, { useState } from 'react';
import { RotateCcw, Volume2 } from 'lucide-react';
import { speakTr, stopSpeak } from '../components/common/AudioPlayers';
import { makeAudio } from '../utils/audioLevel';

// ============================================================================
// --- ETKİLEŞİMLİ: EŞLEŞTİRME ---
// ============================================================================
// Soru verisi:
//   q.questionType = 'match_pairs'
//   q.matchGrid = { left: [{ text, say, ans }], mode: 'word-pic' | 'audio-pic' | 'word-tr' | 'pic-word' }
//   q.options   = SAĞ sütun (görsel / yazı / ses). Toplu görsel ve ses yüklemesi bu şıklara gider.
// left[i].ans: soldaki i. kartın eşi olan şıkkın (q.options) sırası.
// Çocuk önce soldan bir karta, sonra sağdan eşine dokunur. Eşleşenler aynı renk ve numarayı alır.
// Cevap: { [solSıra]: şıkSırası }

import { MATCH_COLORS as COLORS } from './matchSvg';

export const checkMatchAnswer = (grid, pairs) => {
  const left = grid?.left || [];
  if (!left.length || !pairs) return false;
  return left.every((l, i) => pairs[i] === l.ans);
};

const clean = (s) => String(s || '').replace(/<\/?en>/gi, '').trim();
export { generateMatchSvgDataUrl } from './matchSvg';

// Bir şeyi seslendir: yüklenmiş ses varsa o, yoksa telefonun sesi
let current = null;
const play = (audio, text) => {
  try { if (current) { current.pause(); current = null; } } catch (_) {}
  stopSpeak();
  if (audio) { try { current = makeAudio(audio); current.play().catch(() => {}); return; } catch (_) {} }
  if (text) speakTr(text);
};

export function MatchPairsPad({ grid, options = [], pairs = {}, onChange, readOnly = false, status = null, showAnswer = false, hideOptionText = false, title = '' }) {
  const left = grid?.left || [];
  const mode = grid?.mode || 'word-pic';
  const [sel, setSel] = useState(0); // ilk sol kart seçili başlar
  const usedBy = {}; Object.entries(pairs).forEach(([l, o]) => { usedBy[o] = Number(l); });

  const tapLeft = (i) => {
    const l = left[i];
    const opt = options[l.ans] || {};
    // sesli kartta ya da İngilizce kelimede: dokununca okunur
    if (mode === 'audio-pic' || l.say) play(mode === 'audio-pic' ? opt.audio : '', l.say || opt.ttsText || opt.text);
    if (readOnly) return;
    if (pairs[i] !== undefined) { const p = { ...pairs }; delete p[i]; onChange(p); }
    setSel(i);
  };
  const tapRight = (j) => {
    const o = options[j] || {};
    if (o.audio || (hideOptionText && !o.image)) play(o.audio, o.ttsText || o.text);
    if (readOnly) return;
    if (sel === null) {
      if (usedBy[j] !== undefined) { const p = { ...pairs }; delete p[usedBy[j]]; onChange(p); }
      return;
    }
    const p = { ...pairs };
    if (usedBy[j] !== undefined) delete p[usedBy[j]];
    p[sel] = j;
    onChange(p);
    // sıradaki eşleşmemiş sol kartı seç
    const nextFree = left.findIndex((_, k) => k !== sel && p[k] === undefined);
    setSel(nextFree >= 0 ? nextFree : null);
  };

  const leftColor = (i) => COLORS[i % COLORS.length];
  const isWrong = (i) => status && pairs[i] !== undefined && pairs[i] !== left[i].ans;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {title && <div className="text-[11px] font-black text-slate-500 uppercase text-center">{title}</div>}
      <div className="w-full max-w-xl grid grid-cols-2 gap-x-6 gap-y-2">
        <div className="flex flex-col gap-2">
          {left.map((l, i) => {
            const paired = pairs[i] !== undefined;
            const c = leftColor(i);
            const border = status ? (paired && !isWrong(i) ? '#22c55e' : '#ef4444') : (paired || sel === i ? c : '#e2e8f0');
            return (
              <button key={i} type="button" onClick={() => tapLeft(i)}
                className={`relative min-h-[64px] rounded-2xl border-4 bg-white shadow-sm px-2 py-2 flex items-center justify-center font-black text-slate-800 active:scale-95 transition-all ${sel === i && !readOnly ? 'scale-[1.03] shadow-lg' : ''}`}
                style={{ borderColor: border, background: sel === i && !readOnly ? '#eef2ff' : '#fff' }}>
                {mode === 'audio-pic'
                  ? <span className="flex items-center gap-1.5 text-orange-500"><Volume2 size={26} /><span className="text-sm text-slate-500">{i + 1}</span></span>
                  : <span className="text-base sm:text-lg leading-tight text-center break-words">{clean(l.text)}</span>}
                {paired && <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-white text-sm font-black flex items-center justify-center shadow" style={{ background: status ? (isWrong(i) ? '#ef4444' : '#22c55e') : c }}>{i + 1}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {options.map((o, j) => {
            const owner = usedBy[j];
            const c = owner !== undefined ? leftColor(owner) : null;
            const answerOf = showAnswer ? left.findIndex(l => l.ans === j) : -1;
            return (
              <button key={j} type="button" onClick={() => tapRight(j)}
                className="relative min-h-[64px] rounded-2xl border-4 bg-white shadow-sm p-1 flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{ borderColor: c || '#e2e8f0' }}>
                {owner !== undefined && <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-white text-sm font-black flex items-center justify-center shadow" style={{ background: status ? (isWrong(owner) ? '#ef4444' : '#22c55e') : c }}>{owner + 1}</span>}
                {o.image && <img src={o.image} alt="" draggable="false" className="h-16 sm:h-20 w-auto max-w-[70%] object-contain pointer-events-none select-none" />}
                {!hideOptionText && o.text && <span className="text-sm sm:text-base font-black text-slate-800 leading-tight text-center">{clean(o.text)}</span>}
                {hideOptionText && !o.image && <Volume2 size={24} className="text-orange-500" />}
                {answerOf >= 0 && <span className="absolute bottom-0.5 right-1 px-1.5 rounded bg-green-600 text-white text-[10px] font-black">{answerOf + 1}</span>}
              </button>
            );
          })}
        </div>
      </div>
      {!readOnly && Object.keys(pairs).length > 0 && (
        <button type="button" onClick={() => { onChange({}); setSel(0); }} className="text-[11px] font-black text-slate-500 flex items-center gap-1 hover:text-indigo-600">
          <RotateCcw size={12} /> baştan eşleştir
        </button>
      )}
    </div>
  );
}
