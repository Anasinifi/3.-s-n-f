# Çocuk Akademi · Birleşik Uygulama (öğrenci + yönetici)

Tek uygulama, tek adres. Arayüz, öğrenci uygulaması (ana_uygulama: dünyalar + ödevler) ve
yönetici projesiyle (yonetici-proje_3) aynıdır. Firebase projesi: **kariyer26**.

- **Öğrenci / veli:** giriş ekranına öğrenci numarasını yazar → dünyalar ve ödevler.
- **Öğretmen:** giriş ekranında "öğretmen girişi" → şifre **1234** → yönetici paneli (Sınıfım + Deneme).

## Kurulum
1. Bu klasörün **tamamını** GitHub deposunun köküne koyun (`package.json` en üstte olmalı).
2. `npm install` → `npm run dev` (deneme) → `npm run build` (yayın).
3. Firebase: `firestore-kurallar-TAMAMI.txt` içeriğini Firestore › Rules'a yapıştırıp yayınlayın.
   Authentication'da **Anonymous** ve **Email/Password** açık olmalı.

## Sınıfım paneli sekmeleri
sorular · etkileşimli sorular · **bilsem soruları** · **3. sınıf ingilizce** · 3. sınıf matematik ·
3. sınıf türkçe · 3. sınıf hayat bilgisi · 3. sınıf fen bilimleri · sesli sorular · yeni test · test arşivi · öğrenciler

### 3. sınıf İngilizce (4.500 soru)
Her ünite ayrı alt sekme (kitaptaki 6 tema), her birinde:
- 📗 **Kelimeler** (öğretici): eşleştirme (kelime–resim, ses–resim, İngilizce–Türkçe), dinle-resmi bul,
  resme bak-sesi bul, yazılış ve ses, doğru yazılış / eksik harf / karışık harf, anlamı, doğru-yanlış, gruba uymayan
- 📘 **Konu ve Kalıplar** (öğretici): boşluk doldurma, soru–cevap (+ eşleştirme), cümle–resim,
  kelimeleri sırala, diyalog, okuma ve dinleme metinleri (1. ünitede okul kuralları)
- Kelimeler + Kalıplar = **500 soru**, 📝 **Ünite Sonu Testi** = **200 soru** (şıkları yazılı, kitap tarzı 3 şık)
- **Genel Tekrar** alt sekmesi: 6 ünitenin hepsinden **300 soru** (4 şık)

### BİLSEM (1.200 soru)
Kitaptaki 12 konu × 100 özgün soru: Perspektif, Parça-Bütün, Yansıma, Benzeşim, Katlama, Matris,
Küpler, Gölge, Dizilim, Şifreleme, Negatif, Kısa Süreli Bellek. Hepsi 4 şık, bilgisayarla çizilir.
Eski BİLSEM ve eski İngilizce soruları kaldırıldı (kayıtlı eski sorular "sorular" sekmesinde durur, isterseniz silebilirsiniz).

### Her sekmede
- **TÜMÜNÜ KAYDET** (sekmenin tamamı) ve konu konu kaydetme. Tekrar kaydedince eskisinin üzerine yazar, kopya oluşmaz.
- **Dosya adıyla toplu ses yükle**: dosya adı = okunacak metin (liste: `Ses-listesi-Ingilizce-BILSEM.docx`).
- **Dosya adıyla toplu görsel yükle**: dosya adı = kod + tarif, ör. `3001 Voleybol oynayan çocuklar.jpg`
  (liste: `Gorsel-listesi-Ingilizce-BILSEM.docx`). Kodlar 3001'den başlar; eski kodlar (0001-2990) değişmedi.

## Yeni etkileşimli soru: Eşleştirme
Çocuk soldan bir karta, sonra sağdan eşine dokunur; eşleşenler aynı renk ve numarayı alır.
Sağ sütun sorunun şıklarıdır, bu yüzden toplu görsel ve ses yüklemesi eşleştirme sorularına da gider.

## Klasörler
```
src/
├─ App.jsx, firebase.js, adminConfig.js   Kabuk, kariyer26 bağlantısı, öğretmen şifresi
├─ ana/
│  ├─ content/ingilizce/   6 ünite verisi + soru üreticileri
│  ├─ content/bilsem3/     12 BİLSEM konusu
│  ├─ content/dersler/     Matematik, Türkçe, Hayat Bilgisi, Fen
│  ├─ activities/matchPairs.jsx   Eşleştirme etkinliği
│  └─ utils/imgCodes2.js   3001'den başlayan görsel kodları
└─ deneme/                 Deneme (oyun) paneli
```
