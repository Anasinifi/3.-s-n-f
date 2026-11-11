import React from 'react';

// ============================================================================
// --- GRUP: YARDIMCI BİLEŞENLER VE FONKSİYONLAR (TEXT HIGHLIGHT, STARS, AUDIO PLAYER) ---
// ============================================================================
export const RenderTextWithHighlights = ({ text, globalColor, highlights = {}, onLetterClick, isInteractive = false, baseStyle = {} }) => {
  if (!text) return null;
  const str = String(text);
  // Harfler tek tek renklendirilebilir; kelimeler satır sonunda BÖLÜNMEZ, "\n" yeni satır olur.
  const charSpan = (char, index) => {
    const charColor = highlights[index] ? highlights[index] : globalColor;
    return (
      <span
        key={index}
        onClick={(e) => {
          if (isInteractive && onLetterClick) {
            e.stopPropagation();
            onLetterClick(index);
          }
        }}
        style={{
          color: charColor,
          cursor: isInteractive ? 'pointer' : 'inherit',
          display: 'inline-block',
          whiteSpace: 'pre-wrap'
        }}
      >
        {char}
      </span>
    );
  };
  const out = [];
  const re = /\n|[ \t]+|[^\s]+/g; let m;
  while ((m = re.exec(str))) {
    const tok = m[0]; const at = m.index;
    if (tok === '\n') out.push(<br key={`br${at}`} />);
    else if (/^[ \t]+$/.test(tok)) out.push(...tok.split('').map((c, k) => charSpan(c, at + k)));
    else out.push(<span key={`w${at}`} style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>{tok.split('').map((c, k) => charSpan(c, at + k))}</span>);
  }
  return <span style={baseStyle}>{out}</span>;
};
