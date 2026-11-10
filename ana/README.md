# Çocuk Akademi — kaynak kod düzeni

```
src/
├─ App.jsx, main.jsx, firebase.js, constants.js
├─ components/                 Ekranlar (öğrenci + yönetici)
│  ├─ QuizView.jsx             Soru çözme ekranı (hafıza sorularında memoryText desteği)
│  └─ admin/
│     ├─ AdminView.jsx         Yönetici paneli (sekmeler, klasörler, etkileşimli sorular)
│     ├─ TemplateBankPanel.jsx Hazır soru bankası paneli (BİLSEM + ders sekmeleri ortak)
│     └─ ...
├─ activities/                 Etkileşimli soru bileşenleri (sudoku, labirent, kodlama...)
├─ content/                    HAZIR SORU ÜRETİCİLERİ (arayüzden bağımsız)
│  ├─ helpers.js               Tohumlu rastgele, şık dizme, tekrarsız liste
│  ├─ art.js                   SVG çizim kütüphanesi (nesneler, yüzler, efektler)
│  ├─ bank.js                  Banka altyapısı (kategori › kavram › kalıp › şablon)
│  ├─ dersler/                 3. sınıf: ingilizce, matematik, türkçe, hayat, fen (1000'er soru)
│  ├─ sudokuBank.js            Sudoku: 3x3/4x4/5x5 × kolay/orta/zor × 100
│  └─ bilsem/                  BİLSEM soruları: 17 konu × (1. / 2. / 3. sınıf) × 100
│     ├─ index.js              Katalog (konular, seviyeler, soru metinleri)
│     ├─ draw.js, common.js    Ortak çizim ve yardımcılar
│     ├─ matrices.js           Matrisler
│     ├─ folding.js            Katlama
│     ├─ memory.js             Hafıza + Kısa Süreli Bellek
│     ├─ parts.js              Parça-Bütün + Resmin Parçası
│     ├─ spatial.js            Perspektif + Küpler
│     └─ reasoning.js          Benzeşim + Şifreleme + Yansıma + Dizilim
└─ utils/                      Firestore toplu yazma, istatistik, zamanlayıcı...
```

Yeni bir hazır soru türü eklemek için: `content/` altında üreticiyi yaz, ilgili kataloğa `G(...)` ile kalıp ekle.
Panel, klasörleme, toplu ses ve tek soru sesi otomatik çalışır.
