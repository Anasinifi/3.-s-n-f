

// ============================================================================
// --- GRUP: HARİCİ KÜTÜPHANE YÜKLEYİCİSİ (CONFETTI ANİMASYONU) ---
// ============================================================================
export const loadConfetti = () => {
  return new Promise((resolve) => {
    if (window.confetti) return resolve(window.confetti);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => resolve(window.confetti);
    document.head.appendChild(script);
  });
};
