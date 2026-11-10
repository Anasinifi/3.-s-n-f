

// ============================================================================
// --- GRUP: SABİT RENKLER VE RASTGELE SAYI ÜRETİCİ (RNG) ---
// ============================================================================
// --- 4 ANA RENK PALETİ (Kırmızı, Mavi, Yeşil, Sarı) ---
export const FOUR_MAIN_COLORS = [
  '#ef4444', // Kırmızı
  '#3b82f6', // Mavi
  '#22c55e', // Yeşil
  '#eab308'  // Sarı
];

// --- DETERMINISTIK RASTGELE ÜRETİCİ ---
export const createSeededRng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
