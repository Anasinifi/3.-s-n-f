// ============================================================================
// --- GRUP: REKLAM VE PREMİUM ALTYAPISI ---
// ============================================================================
// KURALLAR (istenen davranış):
//  1) Premium öğrenciye HİÇ reklam gösterilmez.
//  2) Test ORTASINDA asla reklam yok.
//  3) Test bitince reklam gösterilir; ama son reklamın üzerinden
//     "intervalMinutes" (5 dk) geçmediyse gösterilmez.
//  4) Karakter/ev sayfasından çıkarken: son reklam 5 dk önceyse gösterilir.
//  5) Karakter/ev sayfasında uzun kalırsa: 5 dakikada bir gösterilir.
//  6) Uygulamaya ilk girişte sayaç başlar (girer girmez reklam çıkmaz).
//
// GERÇEK REKLAM BAĞLAMA (sonraki aşama):
//  provider === 'adsense' -> AdOverlay içinde <ins class="adsbygoogle"> alanı hazır,
//    index.html'e AdSense betiği eklenip adClient/adSlot yönetici panelinden girilir.
//  provider === 'admob'   -> uygulama mobil pakete çevrilirse (Capacitor vb.)
//    showProviderAd() içinde eklentinin "showInterstitial" çağrısı yapılır.

const LAST_AD_KEY = 'ca_last_ad_at';
const SESSION_START = Date.now();

export const isPremium = (child) => {
  if (!child?.premium) return false;
  if (!child.premiumUntil) return true;
  const until = typeof child.premiumUntil === 'string' ? new Date(child.premiumUntil) : (child.premiumUntil?.toDate ? child.premiumUntil.toDate() : new Date(child.premiumUntil));
  return !isNaN(until) ? until.getTime() >= Date.now() : true;
};

export const getLastAdAt = () => {
  let stored = 0;
  try { stored = Number(localStorage.getItem(LAST_AD_KEY)) || 0; } catch (_) {}
  return Math.max(stored, SESSION_START);
};

export const markAdShown = () => { try { localStorage.setItem(LAST_AD_KEY, String(Date.now())); } catch (_) {} };

export const minutesSinceLastAd = () => (Date.now() - getLastAdAt()) / 60000;

// reason: 'after_test' | 'studio_exit' | 'studio_timer'
export const shouldShowAd = (child, adsCfg, reason) => {
  if (!adsCfg?.enabled) return false;
  if (isPremium(child)) return false;
  const interval = reason === 'studio_timer' ? Number(adsCfg.studioIntervalMinutes) || 5 : Number(adsCfg.intervalMinutes) || 5;
  return minutesSinceLastAd() >= interval;
};

// --- Uygulama genelinde reklam isteği (App içindeki AdOverlay dinler) ---
let listener = null;
export const registerAdListener = (fn) => { listener = fn; return () => { if (listener === fn) listener = null; }; };

// Reklam gösterilecekse gösterir, bitince devam eder. Gösterilmezse hemen döner.
export const maybeShowAd = (child, adsCfg, reason) => new Promise((resolve) => {
  if (!shouldShowAd(child, adsCfg, reason) || !listener) return resolve(false);
  markAdShown();
  listener({ reason, cfg: adsCfg, done: () => resolve(true) });
});

// Yönetici panelinden "deneme reklamını göster" (kurallara bakmaz)
export const previewAd = (adsCfg) => new Promise((resolve) => {
  if (!listener) return resolve(false);
  listener({ reason: 'preview', cfg: { ...adsCfg, testMode: true }, done: () => resolve(true) });
});

// --- Premium abonelik altyapısı (sonraki aşama) ---
// Ödeme sağlayıcısı bağlanınca burası doldurulacak; başarılı ödemede
// children/{id} kaydına premium: true, premiumUntil: 'YYYY-AA-GG', premiumSource: 'abonelik' yazılır.
export const PREMIUM_PLANS = [
  { id: 'monthly', name: 'Aylık', months: 1 },
  { id: 'yearly', name: 'Yıllık', months: 12 },
];
export const startPremiumCheckout = async () => ({ ok: false, message: 'Premium abonelik yakında! Şimdilik öğretmeninden premium üyelik isteyebilirsin.' });
