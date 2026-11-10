import React from 'react';

// ============================================================================
// --- GRUP: YARDIMCI BİLEŞENLER VE FONKSİYONLAR (TEXT HIGHLIGHT, STARS, AUDIO PLAYER) ---
// ============================================================================
export const RenderTextWithHighlights = ({ text, globalColor, highlights = {}, onLetterClick, isInteractive = false, baseStyle = {} }) => {
  if (!text) return null;
  const chars = String(text).split('');

  return (
    <span style={baseStyle}>
      {chars.map((char, index) => {
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
      })}
    </span>
  );
};
