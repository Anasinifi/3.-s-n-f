import React from 'react';

// ============================================================================
// --- GRUP: ORTAK UI BİLEŞENLERİ (SİLGİ, OK VE ŞIK SES BUTONLARI) ---
// ============================================================================
// --- ÇOCUKLAR İÇİN SİLGİ SİMGESİ VE BELİRGİN KALIN OK SİMGESİ ---
export const EraserIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.24 3.56L20.44 7.76C21.22 8.54 21.22 9.81 20.44 10.59L11.59 19.44C10.81 20.22 9.54 20.22 8.76 19.44L3.56 14.24C2.78 13.46 2.78 12.19 3.56 11.41L12.41 2.56C13.19 1.78 14.46 1.78 15.24 2.56L16.24 3.56Z" fill="#f472b6" stroke="#be185d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 8.5L15.5 15.5" stroke="#be185d" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6.1 16.7L11.3 11.5L16.5 16.7L13.7 19.5C12.5 20.7 10.6 20.7 9.4 19.5L6.1 16.7Z" fill="#ffffff" stroke="#be185d" strokeWidth="2"/>
    <path d="M12 20H21" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const BoldArrowSvg = ({ dir = 'right', size = 26, color = '#1e293b' }) => {
  const rotation = dir === 'up' ? -90 : dir === 'down' ? 90 : dir === 'left' ? 180 : 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotation}deg)` }}
      className="shrink-0"
    >
      <path
        d="M3 9H13V4L22 12L13 20V15H3V9Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
