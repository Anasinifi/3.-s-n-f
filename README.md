# Çocuk Akademi · Birleşik Uygulama (öğrenci + yönetici)

Eski iki proje (**ana-proje** = öğrenci/veli uygulaması, **yonetici-proje** = yönetici paneli) tek projede birleşti.
Tek adres, tek giriş ekranı:

| kim | giriş ekranına ne yazar | ne görür |
|---|---|---|
| öğrenci / veli | öğrenci numarası | testler, yıldızlar |
| öğretmen | **öğretmen girişi** düğmesi → şifre (varsayılan **1234**) | yönetici paneli: üstte **🏫 Sınıfım** ve **🎮 Deneme** sekmeleri |

## Yeni Firebase projesi
`src/firebase.js` içine yeni projenin anahtarları yazılır. Gönderdiğiniz `appId` ve `messagingSenderId` yazıldı;
**apiKey, authDomain, projectId, storageBucket** değerlerini Firebase Console → Proje ayarları → Web uygulaması → Config
kısmından kopyalayın. Bunlar girilmeden uygulama "firebase anahtarları eksik" uyarısı gösterir.
Firebase Console → Authentication → Sign-in method: **Anonymous** ve **Email/Password** açık olmalı.
İlk şifreli girişte yönetici hesabı kendiliğinden oluşur (e-posta gerekmez). Ayrıntı: `src/adminConfig.js`.

## Sınıfım paneli: sekmeler
- **sorular**, **etkileşimli sorular** (sudoku, labirent, kodlama ... aynen duruyor)
- **bilsem soruları** → artık **1. sınıf / 2. sınıf / 3. sınıf** seviyeleri: 17 konu × 300 = **5100** soru, 4 şıklı, zor
- **ingilizce** → 3. sınıf, 17 konu, **1000** soru
- **3. sınıf matematik** → 11 konu, **1000** soru
- **3. sınıf türkçe** → 12 konu, **1000** soru
- **3. sınıf hayat bilgisi** → 6 tema, **1000** soru
- **3. sınıf fen bilimleri** → 7 ünite, **1000** soru
- sesli sorular, yeni test, test arşivi, öğrenciler, ekstra, analiz
- ~~kavram soruları~~ kaldırıldı

Her ders sekmesinde konu → soru türü → kalıp seçilir, **tek soru** ya da **toplu** kaydedilir; sorular otomatik olarak
`<Ders> (3. Sınıf) › <konu> › <soru türü> › <kalıp>` klasörlerine yerleşir.

### Soru biçimleri (karışık)
yazılı soru + yazılı şık • resimli soru + yazılı şık • yazılı soru + resimli şık • **sesli soru** + resimli / yazılı şık •
**sesli şık** (şık yazısı gizli, "sesi dinle" düğmesiyle okunur) • resimli soru + sesli şık.
Ses yüklenmemişse soru ve şıklar **telefonun sesiyle** okunur. İngilizce sözcükler telefonun **İngilizce** sesiyle,
Türkçe yönergeler Türkçe sesle okunur (soru metninde `<en>...</en>` işaretiyle).

## Klasörler
```
src/
├─ App.jsx            Kabuk: öğrenci ↔ yönetici (yönetici girişinde Sınıfım / Deneme sekmeleri)
├─ firebase.js        Tek Firebase bağlantısı (YENİ PROJE ANAHTARLARI)
├─ adminConfig.js     Yönetici e-postaları, veri alanları
├─ shared/            4 şık → 3 şık bakım aracı
├─ ana/               Sınıfım: öğrenci ekranları + yönetici paneli
│  └─ content/
│     ├─ bilsem/      BİLSEM (1-3. sınıf)
│     ├─ dersler/     İngilizce, Matematik, Türkçe, Hayat Bilgisi, Fen (her biri 1000 soru)
│     └─ listen/ ...  sesli sorular, sudoku, olay sıralama
└─ deneme/            Deneme (çocuk oyunu) paneli
```

## Kurulum
`npm install` → `npm run dev` (deneme) → `npm run build` (yayın). Tailwind `index.html` içinden CDN ile yüklenir.
