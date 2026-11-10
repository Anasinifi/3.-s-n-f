// ============================================================================
// --- BİRLEŞİK UYGULAMA: FIREBASE BAĞLANTISI (YENİ PROJE) ---
// ============================================================================
// Öğrenci ekranı + yönetici paneli (Sınıfım + Deneme) bu tek bağlantıyı kullanır.
// Veriler Firestore'da ayrı alanlarda durur (her klasörün constants.js -> appId):
//   ana/    -> artifacts/cocuk-akademi-pro-v33-fix-final/...
//   deneme/ -> artifacts/cocuk-akademi-test-projesi/...
//
// Proje: kariyer26 (Firebase Console -> Proje ayarları -> Web uygulaması "kariyerfc26").
//    Ayrıca Authentication -> Sign-in method kısmında "Anonymous" ve "Email/Password" açık olmalı.
import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCA3Q-GlzhY50JMa1sBNpK9sNQogrSLDvM', // ⚠️ ekran görüntüsünden okundu: Firebase'den kopyalayıp üstüne yapıştırarak doğrulayın
  authDomain: 'kariyer26.firebaseapp.com',
  projectId: 'kariyer26',
  storageBucket: 'kariyer26.firebasestorage.app',
  messagingSenderId: '607674731138',
  appId: '1:607674731138:web:c4f11d29df1c1b6f18c29b',
};

// Anahtarlar doldurulmamışsa uygulama ekranda uyarı gösterir (çökmez)
export const FIREBASE_READY = !Object.values(firebaseConfig).some(v => String(v).includes('BURAYA'));

const app = initializeApp(firebaseConfig);

// önbellek: 200 mb (öğrenci telefonu + yönetici aynı uygulama)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: 209715200
  })
});

export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
