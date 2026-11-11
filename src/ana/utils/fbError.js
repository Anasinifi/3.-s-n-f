// Firebase hatalarını öğretmenin anlayacağı Türkçe açıklamaya çevirir
export const fbErrorTr = (e) => {
  const code = String(e?.code || ''); const msg = String(e?.message || '');
  if (code.includes('permission-denied') || /insufficient permissions/i.test(msg))
    return 'İZİN YOK: Firebase güvenlik kuralları yazmaya izin vermiyor.\n\nÇözüm: Firebase Console → Firestore Database → Rules (Kurallar) sekmesine projedeki firestore.rules dosyasının tamamını yapıştırıp "Publish / Yayınla" deyin. Sonra çıkış yapıp 1234 ile tekrar girin.';
  if (/database .*does not exist|NOT_FOUND/i.test(msg) || code.includes('not-found'))
    return 'VERİTABANI YOK: Bu Firebase projesinde Firestore henüz oluşturulmamış.\n\nÇözüm: Firebase Console → Firestore Database → "Veritabanı oluştur" (Create database), konum: eur3 (Europe), "üretim modu". Sonra Rules sekmesine firestore.rules dosyasını yapıştırıp yayınlayın.';
  if (code.includes('unauthenticated'))
    return 'GİRİŞ YOK: Yönetici olarak giriş yapılmamış. Çıkış yapıp öğretmen girişinden 1234 ile tekrar girin.';
  if (code.includes('unavailable') || /offline/i.test(msg))
    return 'BAĞLANTI YOK: Firebase\'e ulaşılamıyor. İnternet bağlantınızı kontrol edin.';
  if (code.includes('resource-exhausted'))
    return 'KOTA DOLDU: Firebase günlük ücretsiz yazma sınırına ulaşıldı (Spark planında günde 20.000 yazma). Yarın tekrar deneyin ya da Blaze planına geçin.';
  return `Hata: ${code || ''} ${msg}`.trim();
};
// Sunucu yanıt vermezse (ör. veritabanı yoksa) sonsuza kadar beklememek için
export const withTimeout = (p, ms = 30000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('Firebase yanıt vermedi (veritabanı oluşturulmamış ya da bağlantı yok)'), { code: 'not-found' })), ms))]);
