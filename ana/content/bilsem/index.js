// ============================================================================
// --- BİLSEM SORULARI BANKASI (İLKOKUL: 1. / 2. / 3. SINIF) ---
// ============================================================================
// 17 konu × (1. sınıf 100 + 2. sınıf 100 + 3. sınıf 100) = 5100 hazır soru.
// Seviyeler gerçek BİLSEM tanılama sınavına (1-3. sınıf) göre ayarlıdır: zor ve 4 şıklı.
// Konu klasörleri: "BİLSEM Soruları › <konu> › <sınıf> › <kalıp>".
// Not: eski okul öncesi kalıpları (b_...) bu bankada yok; yeni anahtarlar b3_... ile başlar.
// Her konu kendi dosyasında üretilir:
//   matrices.js  -> Matrisler
//   folding.js   -> Katlama
//   memory.js    -> Hafıza + Kısa Süreli Bellek
//   parts.js     -> Parça-Bütün + Resmin Parçası
//   spatial.js   -> Perspektif + Küpler
//   reasoning.js -> Benzeşim + Şifreleme + Yansıma + Dizilim
import { G, createBank } from '../bank';
import * as M from './matrices';
import * as F from './folding';
import * as H from './memory';
import * as P from './parts';
import * as SP from './spatial';
import * as R from './reasoning';
import * as X from './extra';

// Seviye yardımcıları: her seviye toplam 100 soru
const L = (id, label, groups) => ({ id, label, groups });
const g = (key, label, text, gen, count, extra = {}) => G(`b3_${key}`, text, gen, count, { label, ...extra });
const S1 = '1. Sınıf', S2 = '2. Sınıf', S3 = '3. Sınıf';
const mem = (seconds) => ({ memory: { seconds } });

const Q = {
  matris: 'Boş kutuya hangisi gelmeli?',
  katla: 'Kağıt açılınca nasıl görünür?',
  vardi: 'Hangisi resimde vardı?',
  yoktu: 'Hangisi resimde yoktu?',
  renkti: 'Bu nesne resimde hangi renkteydi?',
  vardiRenk: 'Hangisi resimde vardı? Rengine de dikkat et.',
  sekilOlur: 'Parçalar birleşince hangi şekil olur?',
  resimOlur: 'Parçalar birleşince hangi resim olur?',
  hangisiOlur: 'Parçalar birleşince hangisi olur?',
  karisikOlur: 'Karışık parçalar birleşince hangi resim olur?',
  ikiParca: 'Hangi iki parça birleşince yukarıdaki resim olur?',
  eksikParca: 'Resimdeki boş yere hangi parça gelmeli?',
  kuleUst: 'Kuleye yukarıdan bakınca ne görürsün?',
  kuleOn: 'Kuleye önden bakınca ne görürsün?',
  kulelerUst: 'Kulelere yukarıdan bakınca ne görürsün?',
  kulelerOn: 'Kulelere önden bakınca ne görürsün?',
  benzesim: 'Birinci resim nasıl değiştiyse üçüncü resim de öyle değişmeli. Hangisi gelmeli?',
  kacKup: 'Kaç tane küp var?',
  kacKupGizli: 'Kaç tane küp var? Arkada görünmeyenleri de say.',
  hangiKup: 'Hangisinde yukarıdaki sayı kadar küp var?',
  sifre: 'Anahtara bak. Resimlerin şifresi hangisi?',
  sifreGeri: 'Anahtara bak. Bu şifre hangi resimleri gösteriyor?',
  ilk: 'Sıranın başında (ilk) hangisi vardı?',
  son: 'Sıranın sonunda hangisi vardı?',
  ikinci: 'İkinci sırada hangisi vardı?',
  ucuncu: 'Üçüncü sırada hangisi vardı?',
  dorduncu: 'Dördüncü sırada hangisi vardı?',
  besinci: 'Beşinci sırada hangisi vardı?',
  sira: 'Gördüğün sıra hangisi?',
  ayna: 'Aynadaki görüntüsü hangisi?',
  su: 'Sudaki görüntüsü hangisi?',
  dizi: 'Sırada hangisi gelmeli?',
  donSag: 'Şekil ok yönünde (sağa) bir çeyrek dönünce nasıl görünür?',
  donSol: 'Şekil ok yönünde (sola) bir çeyrek dönünce nasıl görünür?',
  donTers: 'Şekil ters dönünce (yarım tur) nasıl görünür?',
  kenarKatla: 'Üstteki örneğe bak: parçalar kenarlarından katlanıyor. Alttaki şekil katlanınca hangisi olur?',
  cisimUst: 'Cisimlere yukarıdan bakınca ne görürsün?',
  cisimOn: 'Cisimlere önden bakınca ne görürsün?',
  gordun: 'Gördüğün hangisiydi?'
};

export const BILSEM_CATEGORIES = [
  { id: 'b3_matris', label: 'Matrisler', color: 'indigo', concepts: [
    L('b3_matris_1', S1, [g('mat_1_sekilrenk', '3x3 şekil + renk', Q.matris, M.matMidShapeColor, 50), g('mat_1_birkez', 'Her satırda bir kez', Q.matris, M.matMidLatin, 50)]),
    L('b3_matris_2', S2, [g('mat_2_buyukluk', 'Şekil + büyüklük', Q.matris, M.matHardSize, 50), g('mat_2_ikikural', 'İki kural birden', Q.matris, M.matHardDouble, 50)]),
    L('b3_matris_3', S3, [g('mat_3_ucekural', 'Üç kural birden', Q.matris, M.matTriple, 50), g('mat_3_adet', 'Adet + şekil + renk', Q.matris, M.matCount, 50)])
  ] },
  { id: 'b3_katlama', label: 'Katlama', color: 'amber', concepts: [
    L('b3_katlama_1', S1, [g('kat_1_iki', 'İki delik', Q.katla, F.foldMid, 50), g('kat_1_ikifarkli', 'İki farklı delik', Q.katla, F.foldMidMixed, 50)]),
    L('b3_katlama_2', S2, [g('kat_2_dorde', 'Dörde katlama', Q.katla, F.foldHardQuarter, 50), g('kat_2_uc', 'Üç farklı delik', Q.katla, F.foldHardThree, 50)]),
    L('b3_katlama_3', S3, [g('kat_3_dorde', 'Dörde katlama • 2-3 farklı delik', Q.katla, F.foldQuarterMixed, 50), g('kat_3_dort', 'Dört farklı delik', Q.katla, F.foldFourHoles, 50)])
  ] },
  { id: 'b3_hafiza', label: 'Hafıza', color: 'fuchsia', concepts: [
    L('b3_hafiza_1', S1, [g('haf_1_vardi', '6 nesne • vardı', Q.vardi, H.memG1Present, 50, mem(8)), g('haf_1_yoktu', '5 nesne • yoktu', Q.yoktu, H.memG1Absent, 50, mem(8))]),
    L('b3_hafiza_2', S2, [g('haf_2_renk', '5 nesne • hangi renkteydi', Q.renkti, H.memG2Color, 50, mem(9)), g('haf_2_dikkat', '6 nesne • renk çeldiricili', Q.vardiRenk, H.memG2Tricky, 50, mem(9))]),
    L('b3_hafiza_3', S3, [g('haf_3_renk', '6 nesne • hangi renkteydi', Q.renkti, H.memG3Color, 50, mem(9)), g('haf_3_dikkat', '8 nesne • renk çeldiricili', Q.vardiRenk, H.memG3Tricky, 50, mem(10))])
  ] },
  { id: 'b3_parca', label: 'Parça - Bütün', color: 'emerald', concepts: [
    L('b3_parca_1', S1, [g('pb_1_dort', 'Dört parça', Q.resimOlur, P.pwMidQuarters, 50), g('pb_1_ikirenk', 'İki renkli şekil', Q.hangisiOlur, P.pwMidTwoTone, 50)]),
    L('b3_parca_2', S2, [g('pb_2_karisik', 'Karışık dört parça', Q.karisikOlur, P.pwHardShuffled, 50), g('pb_2_donmus', 'Karışık + dönmüş parçalar', Q.karisikOlur, P.pwG2Rotated, 50)]),
    L('b3_parca_3', S3, [g('pb_3_dokuz', 'Karışık dokuz parça', Q.karisikOlur, P.pwG3Nine, 50), g('pb_3_ikinesne', 'Karışık parça • iki nesne', Q.karisikOlur, P.pwG3Quarter, 50)])
  ] },
  { id: 'b3_resim', label: 'Resmin Parçası', color: 'sky', concepts: [
    L('b3_resim_1', S1, [g('rp_1_9p', '9 parça', Q.eksikParca, P.ppMid, 50), g('rp_1_ters', '4 parça • ters çeldirici', Q.eksikParca, P.ppMidRot, 50)]),
    L('b3_resim_2', S2, [g('rp_2_ayna', '9 parça • ayna çeldirici', Q.eksikParca, P.ppHardFlip, 50), g('rp_2_ikisi', '9 parça • ayna + ters', Q.eksikParca, P.ppHardBoth, 50)]),
    L('b3_resim_3', S3, [g('rp_3_ayna', '16 parça • ayna çeldirici', Q.eksikParca, P.ppG3Flip, 50), g('rp_3_ikisi', '16 parça • ayna + ters', Q.eksikParca, P.ppG3Both, 50)])
  ] },
  { id: 'b3_perspektif', label: 'Perspektif', color: 'teal', concepts: [
    L('b3_persp_1', S1, [g('per_1_on', 'İki kule • önden', Q.kulelerOn, SP.perMidFront, 50), g('per_1_ust', 'İki kule • yukarıdan', Q.kulelerUst, SP.perMidTop, 50)]),
    L('b3_persp_2', S2, [g('per_2_on', 'Üç kule • önden', Q.kulelerOn, SP.perHardFront, 50), g('per_2_ust', 'Üç kule • yukarıdan', Q.kulelerUst, SP.perHardTop, 50)]),
    L('b3_persp_3', S3, [g('per_3_on', 'Dört kule • önden', Q.kulelerOn, SP.perG3Front, 50), g('per_3_ust', 'Dört kule • yukarıdan', Q.kulelerUst, SP.perG3Top, 50)])
  ] },
  { id: 'b3_benzesim', label: 'Benzeşim', color: 'orange', concepts: [
    L('b3_benz_1', S1, [g('ben_1_don', 'Döner / ters döner', Q.benzesim, R.anaMidTurn, 50), g('ben_1_sekil', 'Şekillerle', Q.benzesim, R.anaMidShape, 50)]),
    L('b3_benz_2', S2, [g('ben_2_iki', 'İki değişiklik', Q.benzesim, R.anaHardDouble, 50), g('ben_2_donus', 'Dönüş + değişiklik', Q.benzesim, R.anaHardTurn, 50)]),
    L('b3_benz_3', S3, [g('ben_3_uc', 'Üç değişiklik', Q.benzesim, R.anaG3Triple, 50), g('ben_3_donus', 'Dönüş + iki değişiklik', Q.benzesim, R.anaG3Turn, 50)])
  ] },
  { id: 'b3_kup', label: 'Küpler', color: 'violet', concepts: [
    L('b3_kup_1', S1, [g('kup_1_gizli', 'Gizli küpler (5-10)', Q.kacKupGizli, SP.cubeHardHidden, 50, { tagLabel: 'küp' }), g('kup_1_hangi', 'Sayı kadar küp (5-9)', Q.hangiKup, SP.cubeHardWhich, 50, { tagLabel: 'küp' })]),
    L('b3_kup_2', S2, [g('kup_2_gizli', 'Üç sıra, gizli küpler (8-14)', Q.kacKupGizli, SP.cubeVeryHardCount, 50, { tagLabel: 'küp' }), g('kup_2_hangi', 'Sayı kadar küp (9-12)', Q.hangiKup, SP.cubeVeryHardWhich, 50, { tagLabel: 'küp' })]),
    L('b3_kup_3', S3, [g('kup_3_gizli', 'Büyük yapı, gizli küpler (12-20)', Q.kacKupGizli, SP.cubeG3Count, 50, { tagLabel: 'küp' }), g('kup_3_hangi', 'Sayı kadar küp (12-18)', Q.hangiKup, SP.cubeG3Which, 50, { tagLabel: 'küp' })])
  ] },
  { id: 'b3_sifre', label: 'Şifreleme', color: 'rose', concepts: [
    L('b3_sifre_1', S1, [g('sif_1_4', '4 anahtar • 3 resim', Q.sifre, R.cipMid, 50), g('sif_1_geri', 'Şifreden resme (3)', Q.sifreGeri, R.cipMidBack, 50)]),
    L('b3_sifre_2', S2, [g('sif_2_5', '5 anahtar • 4 resim', Q.sifre, R.cipHard, 50), g('sif_2_geri', 'Şifreden resme (4)', Q.sifreGeri, R.cipHardBack, 50)]),
    L('b3_sifre_3', S3, [g('sif_3_6', '6 anahtar • 5 resim', Q.sifre, R.cipG3, 50), g('sif_3_geri', 'Şifreden resme (5)', Q.sifreGeri, R.cipG3Back, 50)])
  ] },
  { id: 'b3_ksb', label: 'Kısa Süreli Bellek', color: 'purple', concepts: [
    L('b3_ksb_1', S1, [g('ksb_1_sira', 'Sıra (4)', Q.sira, H.stmG1Order, 50, mem(8)), g('ksb_1_ucuncu', 'Üçüncü hangisi (5)', Q.ucuncu, H.stmG1Third, 50, mem(9))]),
    L('b3_ksb_2', S2, [g('ksb_2_sira', 'Sıra (5)', Q.sira, H.stmG2Order, 50, mem(9)), g('ksb_2_dorduncu', 'Dördüncü hangisi (6)', Q.dorduncu, H.stmG2Fourth, 50, mem(9))]),
    L('b3_ksb_3', S3, [g('ksb_3_sira', 'Sıra (6)', Q.sira, H.stmG3Order, 50, mem(10)), g('ksb_3_besinci', 'Beşinci hangisi (7)', Q.besinci, H.stmG3Fifth, 50, mem(10))])
  ] },
  { id: 'b3_yansima', label: 'Yansıma', color: 'cyan', concepts: [
    L('b3_yans_1', S1, [g('yan_1_tablo', '3x3 üç kare (2 renk)', Q.ayna, R.mirMidGrid, 50), g('yan_1_su', 'Sudaki yansıma', Q.su, R.mirMidWater, 50)]),
    L('b3_yans_2', S2, [g('yan_2_tablo', '3x3 dört kare (3 renk)', Q.ayna, R.mirHardGrid, 50), g('yan_2_su', '3x3 sudaki yansıma (5 kare)', Q.su, R.mirG2Water, 50)]),
    L('b3_yans_3', S3, [g('yan_3_tablo', '4x4 altı kare (3 renk)', Q.ayna, R.mirG3Grid, 50), g('yan_3_su', '4x4 sudaki yansıma', Q.su, R.mirG3Water, 50)])
  ] },
  { id: 'b3_hafiza2', label: 'Hafıza 2 (Hangisini Gördün?)', color: 'pink', concepts: [
    L('b3_haf2_1', S1, [g('haf2_1_2', 'İkili • renk / sıra', Q.gordun, X.mem2G1Two, 50, mem(4)), g('haf2_1_3', 'Üçlü • renk / sıra', Q.gordun, X.mem2G1Three, 50, mem(5))]),
    L('b3_haf2_2', S2, [g('haf2_2_2', 'İkili desen', Q.gordun, X.mem2G2Two, 50, mem(5)), g('haf2_2_3', 'Üçlü desen', Q.gordun, X.mem2G2Three, 50, mem(6))]),
    L('b3_haf2_3', S3, [g('haf2_3_3', 'Üçlü desen • kısa süre', Q.gordun, X.mem2G3Three, 50, mem(4)), g('haf2_3_4', 'Dörtlü desen', Q.gordun, X.mem2G3Four, 50, mem(6))])
  ] },
  { id: 'b3_dondurme', label: 'Döndürme', color: 'amber', concepts: [
    L('b3_don_1', S1, [g('don_1_sag', 'Kart • sağa çeyrek', Q.donSag, X.rotG1Right, 50), g('don_1_sol', 'Kart • sola çeyrek', Q.donSol, X.rotG1Left, 50)]),
    L('b3_don_2', S2, [g('don_2_sag', 'Tablo • sağa çeyrek', Q.donSag, X.rotG2Right, 50), g('don_2_sol', 'Tablo • sola çeyrek', Q.donSol, X.rotG2Left, 50)]),
    L('b3_don_3', S3, [g('don_3_sag', 'Üç renkli tablo • sağa çeyrek', Q.donSag, X.rotG3Right, 50), g('don_3_ters', 'Üç renkli tablo • ters', Q.donTers, X.rotG3Half, 50)])
  ] },
  { id: 'b3_katlama2', label: 'Şekil Katlama (kenardan katla)', color: 'orange', concepts: [
    L('b3_kat3_1', S1, [g('kat3_1_2', '2 parça', Q.kenarKatla, X.fold3G1a, 50), g('kat3_1_3', '3 parça', Q.kenarKatla, X.fold3G1b, 50)]),
    L('b3_kat3_2', S2, [g('kat3_2_3', '3 parça • içte / dışta', Q.kenarKatla, X.fold3G2a, 50), g('kat3_2_4', '4 parça • içte / dışta', Q.kenarKatla, X.fold3G2b, 50)]),
    L('b3_kat3_3', S3, [g('kat3_3_4', '4 parça • altıgen / sekizgen', Q.kenarKatla, X.fold3G3a, 50), g('kat3_3_5', '5 parça • altıgen / sekizgen', Q.kenarKatla, X.fold3G3b, 50)])
  ] },
  { id: 'b3_yansima2', label: 'Yansıma (Nesneler)', color: 'cyan', concepts: [
    L('b3_yans2_1', S1, [g('yan2_1_ayna', 'İki nesne • ayna', Q.ayna, X.mir2G1Mirror, 50), g('yan2_1_su', 'İki nesne • su', Q.su, X.mir2G1Water, 50)]),
    L('b3_yans2_2', S2, [g('yan2_2_ayna', 'Üç nesne • ayna', Q.ayna, X.mir2G2Mirror, 50), g('yan2_2_su', 'Üç nesne • su', Q.su, X.mir2G2Water, 50)]),
    L('b3_yans2_3', S3, [g('yan2_3_ayna', 'Dört nesne • ayna', Q.ayna, X.mir2G3Mirror, 50), g('yan2_3_su', 'Dört nesne • su', Q.su, X.mir2G3Water, 50)])
  ] },
  { id: 'b3_perspektif2', label: 'Perspektif 2', color: 'teal', concepts: [
    L('b3_persp2_1', S1, [g('per2_1_on', 'İki kule • önden', Q.cisimOn, X.per2G1Front, 50), g('per2_1_ust', 'İki kule • yukarıdan', Q.cisimUst, X.per2G1Top, 50)]),
    L('b3_persp2_2', S2, [g('per2_2_on', 'Üç kule • önden', Q.cisimOn, X.per2G2Front, 50), g('per2_2_ust', 'Üç kule • yukarıdan', Q.cisimUst, X.per2G2Top, 50)]),
    L('b3_persp2_3', S3, [g('per2_3_on', 'Dört kule • önden', Q.cisimOn, X.per2G3Front, 50), g('per2_3_ust', 'Dört kule • yukarıdan', Q.cisimUst, X.per2G3Top, 50)])
  ] },
  { id: 'b3_dizilim', label: 'Dizilim', color: 'lime', concepts: [
    L('b3_dizi_1', S1, [g('diz_1_abc', 'ABC / AABB', Q.dizi, R.seqMidABC, 50), g('diz_1_uzun', 'ABCD / AABC', Q.dizi, R.seqHardLong, 50)]),
    L('b3_dizi_2', S2, [g('diz_2_karma', 'ABAC / ABCB', Q.dizi, R.seqG2Long, 50), g('diz_2_don', 'Dönen şekil', Q.dizi, R.seqHardRotate, 50)]),
    L('b3_dizi_3', S3, [g('diz_3_uzun', 'ABBCC / AABCC', Q.dizi, R.seqG3Long, 50), g('diz_3_donrenk', 'Dönen + renk değiştiren', Q.dizi, R.seqG3RotColor, 50)])
  ] }
];

export const BILSEM_BANK = createBank({
  id: 'bilsem',
  title: 'bilsem soruları (1. / 2. / 3. sınıf)',
  intro: 'Her konuda 1. sınıf 100, 2. sınıf 100, 3. sınıf 100 hazır soru (17 konu, toplam 5100). Zorluk gerçek BİLSEM tanılama sınavına göre ayarlıdır, sorular 4 şıklıdır. Hafıza ve kısa süreli bellek soruları kendi gösterme süreleriyle kaydedilir.',
  rootFolder: 'BİLSEM Soruları',
  fieldPrefix: 'bilsem',
  settingsDoc: 'bilsem_settings',
  mediaPrefix: 'bilsem_media_',
  categories: BILSEM_CATEGORIES,
  unique: true,
  maxOptions: 4, // ilkokul: gerçek BİLSEM gibi 4 şık
  folderPath: (gr) => [gr.categoryLabel, gr.conceptLabel, gr.label || gr.text]
});
