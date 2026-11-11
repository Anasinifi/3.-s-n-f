// ============================================================================
// --- BİLSEM SORULARI (3. seviye kitap konuları · her konu 100 özgün soru) ---
// ============================================================================
// Konular kitaptaki sırayla: Perspektif, Parça-Bütün, Yansıma, Benzeşim, Katlama, Matris,
// Küpler, Gölge, Dizilim, Şifreleme, Negatif, Kısa Süreli Bellek.
// Sorular kitaptakilerin kopyası değildir: aynı soru tarzında, bilgisayarla ÖZGÜN üretilir (4 şık).
import { G, createBank } from '../bank';
import { scaleTo } from '../dersler/common';
import { perDisc, perCubes, partWhole, mirrorCompo, mirrorRow, anaConcept, anaShape } from './topicsA';
import { foldPunch, foldOverlay, matrixRules, matrixLines, cubeCount, cubeNet, shadowOf } from './topicsB';
import { seqRotate, seqGrid, seqCount, cipherRule, cipherNumber, cipherSymbol, negative, memBars, memQuad, memGridAsk } from './topicsC';

const g = (key, label, gen, w = 10, extra = {}) => G(`bs3_${key}`, extra.text || label, gen, w, { label, ...extra });
const K = (id, label, groups) => ({ id, label, groups });
const T = (id, label, color, concepts) => ({ id, label, color, concepts });
const MEMO = { memory: { seconds: 10 } };

const TOPICS = [
  T('perspektif', '1. Perspektif', 'sky', [
    K('halka', 'Yukarıdan bakış', [g('per_d3', '3 halka', perDisc(3)), g('per_d4', '4 halka', perDisc(4)), g('per_d5', '5 halka (zor)', perDisc(5))]),
    K('kule', 'Küp kuleleri', [g('per_on', 'Önden bakış', perCubes('front', 3, 2, 3), 12), g('per_sag', 'Sağdan bakış', perCubes('right', 3, 3, 3), 12), g('per_ust', 'Üstten bakış', perCubes('top', 3, 3, 3), 12)])
  ]),
  T('parca', '2. Parça - Bütün', 'teal', [
    K('desen', 'Desenin eksik parçası', [g('pb_22', 'Basit desen', partWhole(2, 2, false)), g('pb_32', 'Geniş desen', partWhole(3, 2, false)), g('pb_23m', 'Karışık desen', partWhole(2, 3, true)), g('pb_33m', 'Karışık geniş desen (zor)', partWhole(3, 3, true))])
  ]),
  T('yansima', '3. Yansıma', 'cyan', [
    K('ayna', 'Ayna görüntüsü', [g('ya_h3', 'Şekil grubu', mirrorCompo('h', 3)), g('ya_h4', 'Kalabalık şekil grubu', mirrorCompo('h', 4))]),
    K('su', 'Su görüntüsü', [g('ya_v4', 'Şekil grubu', mirrorCompo('v', 4))]),
    K('sira', 'Sıra ve kelime', [g('ya_kel', 'Kelime', mirrorRow('word'), 8), g('ya_rak', 'Rakam treni', mirrorRow('digit'), 8), g('ya_sek', 'Şekil sırası', mirrorRow('shape'), 8)])
  ]),
  T('benzesim', '4. Benzeşim', 'violet', [
    K('nesne', 'Nesneler arası ilişki', [g('be_nes', 'Resimli benzeşim', anaConcept, 25)]),
    K('sekil', 'Şekil dönüşümü', [g('be_s1', 'Tek değişim', anaShape(1)), g('be_s2', 'İki değişim (zor)', anaShape(2))])
  ]),
  T('katlama', '5. Katlama', 'amber', [
    K('delik', 'Katla, del, aç', [g('ka_1', 'Bir katlama', foldPunch(1, 2, ['circle', 'square', 'rtri'])), g('ka_2', 'İki katlama', foldPunch(2, 2, ['circle', 'square', 'rtri', 'flag'])), g('ka_3', 'İki katlama, üç delik (zor)', foldPunch(2, 3, ['circle', 'rtri', 'flag']))]),
    K('seffaf', 'Şeffaf kart katlama', [g('ka_s1', 'Soldan sağa', foldOverlay(false, 2, 1)), g('ka_s2', 'Yukarıdan aşağı', foldOverlay(true, 2, 2))])
  ]),
  T('matris', '6. Matris', 'indigo', [
    K('kural', 'Şekil - renk - sayı', [g('ma_2', 'İki kural', matrixRules(['shape', 'color'])), g('ma_3', 'Üç kural (zor)', matrixRules(['shape', 'color', 'count']), 12)]),
    K('cizgi', 'Çizgi birleştirme', [g('ma_l2', 'Birleştir / farkı al', matrixLines(['xor', 'or'])), g('ma_l3', 'Ortak çizgi (zor)', matrixLines(['xor', 'or', 'and']))])
  ]),
  T('kupler', '7. Küpler', 'purple', [
    K('say', 'Küp sayma', [g('ku_s3', '3 sütun', cubeCount(3, 3)), g('ku_s4', '4 sütun (zor)', cubeCount(4, 4))]),
    K('acinim', 'Küp açınımı', [g('ku_a', 'Renkli açınım', cubeNet(false), 12), g('ku_am', 'İşaretli açınım (zor)', cubeNet(true))])
  ]),
  T('golge', '8. Gölge', 'slate', [
    K('grup', 'Şekil grubunun gölgesi', [g('go_3', '3 şekil', shadowOf(3, false)), g('go_4', '4 şekil (ince fark)', shadowOf(4, true)), g('go_5', '5 şekil (zor)', shadowOf(5, true))])
  ]),
  T('dizilim', '9. Dizilim', 'emerald', [
    K('don', 'Dönen şekil', [g('di_r', 'Dönme', seqRotate(false)), g('di_rd', 'Dönme + dolaşan nokta (zor)', seqRotate(true))]),
    K('izgara', 'Izgara deseni', [g('di_g', 'Kayan / dönen desen', seqGrid(['rot', 'shr', 'shd', 'rotb']))]),
    K('sayi', 'Sayı ve renk', [g('di_c', 'Artan sayı', seqCount)])
  ]),
  T('sifre', '10. Şifreleme', 'orange', [
    K('sembol', 'Harf - şekil', [g('si_sem', 'Şekille yazılan kelime', cipherSymbol)]),
    K('rakam', 'Harf - rakam', [g('si_rak', 'Kelimenin kodu', cipherNumber(false)), g('si_kar', 'Karışık kodlar (zor)', cipherNumber(true))]),
    K('kural', 'Gizli kural', [g('si_kur', 'Kelime = sayı', cipherRule)])
  ]),
  T('negatif', '11. Negatif', 'red', [
    K('neg', 'Renklerin yer değiştirmesi', [g('ne_1', 'Üç katmanlı desen', negative(false)), g('ne_2', 'Süslü desen (zor)', negative(true))])
  ]),
  T('bellek', '12. Kısa Süreli Bellek', 'pink', [
    K('resim', 'Gördüğün resim hangisi?', [g('be_bar', 'Renkli çubuklar', memBars, 10, MEMO), g('be_dort', 'Dört köşedeki şekiller', memQuad, 10, MEMO)]),
    K('soru', 'Resimle ilgili soru', [g('be_yok', 'Hangisi yoktu?', memGridAsk('missing'), 8, MEMO), g('be_yer', 'Hangi kutuda ne vardı?', memGridAsk('where'), 8, MEMO), g('be_say', 'Kaç tane vardı?', memGridAsk('count'), 8, MEMO)])
  ])
];
TOPICS.forEach(t => scaleTo([t], 100));

export const BILSEM_BANK = createBank({
  id: 'bilsem3',
  title: 'BİLSEM (3. seviye) · 12 konu × 100 soru',
  intro: 'Kitaptaki 12 konunun soru tarzında, bilgisayarla üretilmiş özgün sorular. Hepsi 4 şıklı.',
  rootFolder: 'BİLSEM',
  fieldPrefix: 'bilsem3',
  settingsDoc: 'bilsem3_settings',
  mediaPrefix: 'bilsem3_media_',
  categories: TOPICS,
  unique: true,
  maxOptions: 4,
  folderPath: (gr) => [gr.categoryLabel, gr.conceptLabel, gr.label]
});
