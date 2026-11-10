// ============================================================================
// --- GRUP: UYGULAMA SABİTLERİ (APP ID VE SES DOSYALARI) ---
// ============================================================================
// BU KOD DENEME PROJESİ İÇİNDİR.
// Ana projedeki "deneme projesine aktar" butonu soruları ve klasörleri
// 'cocuk-akademi-test-projesi' alanına yazar. Deneme uygulaması da aynı alanı okur.
// Ana proje kimliği: 'cocuk-akademi-pro-v33-fix-final' (buraya YAZMAYIN, deneme verisi ana projeye karışır)
export const MAIN_APP_ID = 'cocuk-akademi-pro-v33-fix-final';
export const TEST_APP_ID = 'cocuk-akademi-test-projesi';
export const appId = TEST_APP_ID;
export const IS_DENEME = appId === TEST_APP_ID;

// Deneme projesinde yeni soru HAZIRLAMA ekranları gizli (sorular ana projeden kopyalanır).
// Soru DÜZENLEME araçları açık. Tekrar açmak için true yapın.
export const SHOW_QUESTION_CREATION = false;

export const TICK_TOCK_SOUND = "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.m4a";

export const DEFAULT_APPLAUSE_SOUND = "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.m4a";
