// ============================================================================
// --- YÖNETİCİ AYARLARI ---
// ============================================================================
// Öğrenciler NUMARA ile, öğretmen giriş ekranındaki "öğretmen girişi" düğmesiyle sadece ŞİFRE ile girer
// (e-posta / Gmail yok). Varsayılan şifre: 1234
//
// Arka planda Firebase'de tek bir yönetici hesabı kullanılır (aşağıdaki e-posta, kimse yazmaz).
// İLK girişte bu hesap otomatik oluşturulur; Firebase Console'da sadece
// Authentication -> Sign-in method -> "Email/Password" ve "Anonymous" açık olmalı.
// Firebase en az 6 karakter istediği için şifre arka planda uzatılır (1234 -> ca-1234-yonetici).
// Şifreyi değiştirmek isterseniz: Firebase Console -> Authentication -> Users -> bu hesabı silin,
// sonra uygulamada yeni şifreyle ilk girişi yapın (hesap yeni şifreyle yeniden oluşur).
export const ADMIN_LOGIN_EMAIL = 'yonetici@kariyer26.app';
export const pinToPassword = (pin) => `ca-${String(pin).trim()}-yonetici`;
export const ADMIN_EMAILS = [ADMIN_LOGIN_EMAIL];

export const isAdminEmail = (email) => Boolean(email) && (ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.map(x => x.toLowerCase()).includes(String(email).toLowerCase()));

// Sekmelerin veri alanları (her panelin constants.js dosyasıyla aynı)
export const ANA_APP_ID = 'cocuk-akademi-pro-v33-fix-final';
export const DENEME_APP_ID = 'cocuk-akademi-test-projesi';
