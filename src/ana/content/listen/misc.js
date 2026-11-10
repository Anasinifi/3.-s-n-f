// ============================================================================
// --- SESLİ SORULAR: Sırayı takip et • Nezaket • Mekân • Neden-sonuç ---
// ============================================================================
// Şıklar SESLİ: yazı + telefonla okuma. Öğretmen her şıkka kendi sesini (ya da gerçek
// ses efektini) yönetici panelinden yükleyebilir.
import { makeRng, pick, shuffle, pickN } from '../helpers';

const cap = (s) => s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1);
const NAMES = ['Ayşe', 'Can', 'Ela', 'Mert', 'Defne', 'Ali', 'Zeynep', 'Efe', 'Elif', 'Kerem', 'Nil', 'Emir', 'Deniz', 'Yusuf', 'Mira', 'Arda', 'Duru', 'Lina'];
const sayOpt = (text, tts) => ({ text, tts: tts || text, image: '' });
const shuffled = (correct, wrongs, rng) => { const items = [correct, ...wrongs]; const order = shuffle([0, 1, 2], rng); return { options: order.map(k => items[k]), correctIndex: order.indexOf(0) }; };

// ============================================================================
// SIRAYI TAKİP ET (100): "Şimdi duyacağın sırayı aklında tut: Kedi, köpek, kuş."
// ============================================================================
const SOUNDS = ['kedi', 'köpek', 'kuş', 'inek', 'ördek', 'koyun', 'at', 'arı', 'kurbağa', 'tavuk', 'davul', 'zil', 'saat', 'telefon', 'trompet', 'araba', 'tren', 'yağmur'];
export const genFollowOrder = (n) => (key, i) => {
  const rng = makeRng(key, i);
  const seq = pickN(SOUNDS, n, rng);
  const say = (arr) => arr.map((x, k) => (k === 0 ? cap(x) : x)).join(', ');
  const show = (arr) => arr.map(cap).join(' - ');
  const swapAdj = (arr, k) => { const a = [...arr]; [a[k], a[k + 1]] = [a[k + 1], a[k]]; return a; };
  const cands = [swapAdj(seq, 0), swapAdj(seq, n - 2), [...seq].reverse(), seq.map((x, k) => (k === n - 1 ? pick(SOUNDS.filter(s => !seq.includes(s)), rng) : x))];
  const seen = new Set([seq.join()]); const wr = [];
  shuffle(cands, rng).forEach(c => { if (wr.length < 2 && !seen.has(c.join())) { seen.add(c.join()); wr.push(c); } });
  const speak = `Şimdi duyacağın sırayı aklında tut. || ${say(seq)}. || Hangi şıkta bu sıra doğru verilmiştir? || Şıkları dinle ve doğru olanı seç.`;
  return { ...shuffled(sayOpt(show(seq), say(seq)), wr.map(w => sayOpt(show(w), say(w))), rng), text: 'Duyduğun sırayı aklında tut. Hangi şıkta sıra doğru?', speak };
};

// ============================================================================
// NEZAKET VE İLETİŞİM (100)
// ============================================================================
// { s: senaryo (isim için {A}, {B}), q: soru, ok: doğru söz, no: [yanlış sözler] }
const POLITE = [
  { s: '{A} doğum gününde arkadaşı {B:abl} bir oyuncak hediye aldı.', q: '{A} hangisini söylemelidir?', ok: 'Teşekkür ederim.', no: ['Günaydın.', 'Güle güle.', 'Bunu istemiyorum!'] },
  { s: '{A} sabah okula geldi ve öğretmenini gördü.', q: '{A} öğretmenine ne demelidir?', ok: 'Günaydın öğretmenim.', no: ['İyi geceler.', 'Afiyet olsun.', 'Çekil önümden!'] },
  { s: '{A} koridorda koşarken yanlışlıkla {B:dat} çarptı.', q: '{A} ne söylemelidir?', ok: 'Özür dilerim, iyi misin?', no: ['Teşekkür ederim.', 'Önüne baksana!', 'Hoş geldin.'] },
  { s: '{A} teneffüste bahçede koşarken düştü ve dizi acıdı. Yanına arkadaşı {B} geldi.', q: 'İyi bir arkadaş olan {B} ne söylemiştir?', ok: 'İyi misin? Gel, seni öğretmene götüreyim.', no: ['Hahaha, nasıl da düştün!', 'Önüne baksana, oyunumu bozdun!', 'Ben gidiyorum.'] },
  { s: '{A} masada su içmek istiyor ama sürahi {B:gen} önünde duruyor.', q: '{A} nasıl istemelidir?', ok: 'Suyu bana verir misin lütfen?', no: ['Suyu ver hemen!', 'Güle güle.', 'İyi geceler.'] },
  { s: 'Akşam olmuş, {A} yatmaya gidiyor.', q: '{A} ailesine ne demelidir?', ok: 'İyi geceler.', no: ['Günaydın.', 'Afiyet olsun.', 'Hoş geldiniz.'] },
  { s: '{A} okuldan çıkıp eve gidiyor. Arkadaşlarına el sallıyor.', q: '{A} ne demelidir?', ok: 'Hoşça kalın, yarın görüşürüz.', no: ['Günaydın.', 'Afiyet olsun.', 'Geçmiş olsun.'] },
  { s: '{A:gen} evine misafir geldi. Kapıyı {A} açtı.', q: '{A} misafirlere ne demelidir?', ok: 'Hoş geldiniz.', no: ['Güle güle.', 'İyi geceler.', 'Neden geldiniz?'] },
  { s: '{A} yemek yiyen ailesinin yanına geldi.', q: '{A} ne demelidir?', ok: 'Afiyet olsun.', no: ['Geçmiş olsun.', 'İyi yolculuklar.', 'Bana da verin hemen!'] },
  { s: '{A:gen} arkadaşı {B} hastalanmış, okula gelemiyor. {A} onu telefonla aradı.', q: '{A} ne söylemelidir?', ok: 'Geçmiş olsun, çabuk iyileş.', no: ['Afiyet olsun.', 'İyi ki doğdun.', 'Oh olsun.'] },
  { s: 'Bugün {B:gen} doğum günü. {A} onu gördü.', q: '{A} ne söylemelidir?', ok: 'İyi ki doğdun!', no: ['Geçmiş olsun.', 'Güle güle.', 'Hoş geldin.'] },
  { s: '{A} kaydırak sırasında bekliyor. {B} sıranın önüne geçmek istiyor.', q: '{A} kibarca ne söylemelidir?', ok: 'Lütfen sıranı bekle, herkes bekliyor.', no: ['Çekil buradan!', 'Teşekkür ederim.', 'Afiyet olsun.'] },
  { s: '{A} {B:gen} boyalarını kullanmak istiyor.', q: '{A} ne demelidir?', ok: 'Boyalarını kullanabilir miyim?', no: ['Boyalarını aldım bile!', 'İyi geceler.', 'Geçmiş olsun.'] },
  { s: '{B}, {A:dat} yere düşen kalemini uzattı.', q: '{A} ne söylemelidir?', ok: 'Teşekkür ederim.', no: ['Özür dilerim.', 'Hoşça kal.', 'Bana dokunma!'] },
  { s: '{A} sınıfta konuşmak istiyor ama öğretmen başka birini dinliyor.', q: '{A} ne yapmalıdır?', ok: 'Parmağımı kaldırıp sıramı beklerim.', no: ['Bağırarak konuşurum.', 'Arkadaşımın sözünü keserim.', 'Sınıftan çıkarım.'] },
  { s: '{A}, {B:gen} yaptığı resmi gördü. Resim çok güzeldi.', q: '{A} ne söyleyebilir?', ok: 'Resmin çok güzel olmuş!', no: ['Hiç beğenmedim.', 'Benimki daha güzel!', 'Güle güle.'] },
  { s: '{A:gen} arkadaşı {B} oyuncağı kırıldığı için ağlıyor.', q: '{A} ne söyleyebilir?', ok: 'Üzülme, gel birlikte oynayalım.', no: ['Oh olsun!', 'Ağlama bebek gibi!', 'Afiyet olsun.'] },
  { s: '{A} yanlışlıkla {B:gen} kulesini devirdi.', q: '{A} ne söylemelidir?', ok: 'Özür dilerim, istersen birlikte yeniden yapalım.', no: ['Zaten kötüydü!', 'Teşekkür ederim.', 'Hoş geldin.'] },
  { s: '{A} servisten inerken şoför amcaya bakıyor.', q: '{A} ne demelidir?', ok: 'Teşekkürler, iyi günler!', no: ['Günaydın, iyi geceler.', 'Geçmiş olsun.', 'Hiçbir şey demem.'] },
  { s: '{A} parkta tanımadığı bir çocukla oynamak istiyor.', q: '{A} ne söyleyebilir?', ok: 'Merhaba, birlikte oynayabilir miyiz?', no: ['Bu salıncak benim, git!', 'İyi geceler.', 'Geçmiş olsun.'] },
  { s: '{A:gen} annesi ona sıcak bir çorba getirdi.', q: '{A} ne söylemelidir?', ok: 'Teşekkür ederim anneciğim.', no: ['Bunu sevmiyorum, götür!', 'Güle güle.', 'Hoş geldin.'] },
  { s: '{A} kapıdan çıkarken arkasından gelen yaşlı bir teyzeyi gördü.', q: '{A} ne yapmalıdır?', ok: 'Kapıyı tutup buyurun teyze derim.', no: ['Kapıyı hızla kapatırım.', 'Koşarak giderim.', 'Teyzeye gülerim.'] },
  { s: '{A} ile {B} aynı oyuncakla oynamak istiyor.', q: '{A} ne söyleyebilir?', ok: 'Sırayla oynayalım, önce sen al.', no: ['Benim! Vermem!', 'Oyuncağı saklarım.', 'İyi geceler.'] },
  { s: '{A} arkadaşı {B:gen} konuşmasını bölmek istiyor.', q: '{A} ne demelidir?', ok: 'Pardon, bir şey sorabilir miyim?', no: ['Sus, ben konuşacağım!', 'Teşekkür ederim.', 'Güle güle.'] },
  { s: '{A}, öğretmeninden bir yardım istedi ve öğretmeni ona yardım etti.', q: '{A} ne söylemelidir?', ok: 'Teşekkür ederim öğretmenim.', no: ['Günaydın.', 'Özür dilerim.', 'Geçmiş olsun.'] }
];
// Türkçe ekler (özel isim + kesme işareti): {A:gen} Ada'nın, {B:dat} Can'a, {B:abl} Mert'ten
const lastV = (w) => { const m = w.toLocaleLowerCase('tr-TR').match(/[aıoueiöü](?=[^aıoueiöü]*$)/); return m ? m[0] : 'e'; };
const endV = (w) => /[aıoueiöü]$/.test(w.toLocaleLowerCase('tr-TR'));
const h4 = (w) => ({ a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u', ö: 'ü', ü: 'ü' })[lastV(w)];
const h2 = (w) => (['a', 'ı', 'o', 'u'].includes(lastV(w)) ? 'a' : 'e');
const SFX = {
  gen: (w) => `${w}'${endV(w) ? 'n' : ''}${h4(w)}n`,
  dat: (w) => `${w}'${endV(w) ? 'y' : ''}${h2(w)}`,
  abl: (w) => `${w}'${/[çfhkpsşt]$/.test(w.toLocaleLowerCase('tr-TR')) ? 't' : 'd'}${h2(w)}n`
};
const fill = (s, A, B) => s.replace(/\{([AB]):(gen|dat|abl)\}/g, (_, who, k) => SFX[k](who === 'A' ? A : B)).replace(/\{A\}/g, A).replace(/\{B\}/g, B);
export const genPolite = () => (key, i) => {
  const rng = makeRng(key, i);
  const it = POLITE[i % POLITE.length];
  const A = NAMES[(i * 5 + Math.floor(i / POLITE.length)) % NAMES.length]; const B = pick(NAMES.filter(n => n !== A), rng);
  const scenario = fill(it.s, A, B); const q = fill(it.q, A, B);
  const wr = pickN(it.no, 2, rng);
  return { ...shuffled(sayOpt(it.ok), wr.map(w => sayOpt(w)), rng), text: q, speak: `${scenario} || ${q} || Şıkları dinle ve doğru olanı seç.` };
};

// ============================================================================
// MEKÂN (hikâyeleştirilmiş: altında, üstünde, içinde, arkasında ...) (100)
// ============================================================================
const LOCS = [
  { loc: 'masanın altında', dat: 'masanın altına' }, { loc: 'dolabın içinde', dat: 'dolabın içine' }, { loc: 'koltuğun üstünde', dat: 'koltuğun üstüne' },
  { loc: 'yatağın altında', dat: 'yatağın altına' }, { loc: 'sepetin içinde', dat: 'sepetin içine' }, { loc: 'kapının arkasında', dat: 'kapının arkasına' },
  { loc: 'kutunun içinde', dat: 'kutunun içine' }, { loc: 'perdenin arkasında', dat: 'perdenin arkasına' }, { loc: 'sandalyenin üstünde', dat: 'sandalyenin üstüne' },
  { loc: 'halının üstünde', dat: 'halının üstüne' }, { loc: 'ağacın tepesinde', dat: 'ağacın tepesine' }, { loc: 'çitin yanında', dat: 'çitin yanına' }
];
const CRITTERS = [['Kedi', 'Minnoş'], ['Köpek', 'Fındık'], ['Tavşan', 'Pamuk'], ['Kedi', 'Tekir'], ['Köpek', 'Boncuk'], ['Sincap', 'Fıstık'], ['Kedi', 'Duman'], ['Tavşan', 'Zıpzıp']];
const DOING = ['uyumayı çok severdi', 'oyun oynamayı çok severdi', 'dinlenmeyi çok severdi', 'saatlerce uzanmayı severdi'];
const TRIGGER = [
  'dışarıdan gürültülü bir ses gelince çok korktu ve hemen koşup',
  'gök gürleyince çok korktu ve hızla koşup',
  'eve misafirler gelince utandı ve sessizce',
  'elektrik süpürgesi çalışmaya başlayınca korktu ve koşarak',
  'saklambaç oynarken kimse bulamasın diye',
  'güneş çok ısıtınca serin bir yer aramaya başladı ve'
];
const placeStory = (i, rng) => {
  const [kind, name] = CRITTERS[i % CRITTERS.length];
  const [l1, l2, l3] = pickN(LOCS, 3, rng);
  const doing = DOING[i % DOING.length]; const trig = TRIGGER[(i * 7) % TRIGGER.length];
  const verb = trig.includes('saklambaç') ? 'saklandı' : trig.includes('serin') ? 'oraya uzandı' : 'saklandı';
  const text = `${kind} ${name} ${l1.loc} ${doing}. Ama bugün ${trig} ${l2.dat} ${verb}.`;
  return { name, l1, l2, l3, text };
};
export const genPlaceLast = () => (key, i) => {
  const rng = makeRng(key, i); const st = placeStory(i, rng);
  const q = `Hikâyeye göre ${st.name} en son nereye ${st.text.includes('uzandı') ? 'gitti' : 'saklandı'}?`;
  return { ...shuffled(sayOpt(cap(st.l2.dat)), [sayOpt(cap(st.l1.dat)), sayOpt(cap(st.l3.dat))], rng), text: q, speak: `${st.text} || ${q} || Şıkları dinle ve doğru olanı seç.` };
};
export const genPlaceFirst = () => (key, i) => {
  const rng = makeRng(key, i + 777); const st = placeStory(i + 3, rng);
  const q = `Hikâyenin başında ${st.name} nerede bulunuyordu?`;
  return { ...shuffled(sayOpt(cap(st.l1.loc)), [sayOpt(cap(st.l2.loc)), sayOpt(cap(st.l3.loc))], rng), text: q, speak: `${st.text} || ${q} || Şıkları dinle ve doğru olanı seç.` };
};

// ============================================================================
// NEDEN - SONUÇ (olayın devamı) (100)
// ============================================================================
// ok / no: [şıkta görünen ses açıklaması, telefonla okunacak cümle]
const CAUSE = [
  { s: 'Kışın çok soğuk bir sabahtı. {A} atkısını, kalın montunu ve eldivenlerini giyip bahçeye çıktı. Her yer bembeyazdı. {A} yere eğildi, elleriyle o beyaz şeyleri birleştirip yuvarlak bir top yaptı.', q: 'Sence {A} bahçede ne oynamaya başladı?', ok: ['Kar topu atma sesi ve çocuk gülüşmeleri', 'Arkadaşlarıyla kar topu oynadı.'], no: [['Su birikintisine zıplama sesi, şıp şıp', 'Su birikintisine zıpladı.'], ['Kuru yaprak hışırtısı', 'Kuru yaprakların üstünde yürüdü.']] },
  { s: '{A} balonunu çok büyük şişirdi. Balon kocaman oldu. {A} şişirmeye devam etti, devam etti...', q: 'Sence sonra ne oldu?', ok: ['Patlama sesi: Pat!', 'Balon pat diye patladı.'], no: [['Kuş cıvıltısı', 'Balon kuş gibi öttü.'], ['Kapı zili', 'Kapı zili çaldı.']] },
  { s: '{A} sabah uyandı. Kahvaltı masasında annesi ona bir bardak süt koydu. {A} çok susamıştı.', q: 'Sence {A} ne yaptı?', ok: ['Süt içme sesi: glu glu', 'Sütünü afiyetle içti.'], no: [['Horlama sesi', 'Hemen tekrar uyudu.'], ['Davul sesi', 'Davul çalmaya başladı.']] },
  { s: 'Gökyüzünü kara bulutlar kapladı. Rüzgâr esmeye başladı. {A} pencereden dışarı baktı.', q: 'Sence birazdan ne oldu?', ok: ['Yağmur sesi ve gök gürültüsü', 'Yağmur yağmaya başladı.'], no: [['Arı vızıltısı', 'Arılar bal yaptı.'], ['Dondurma arabası müziği', 'Dondurmacı geldi.']] },
  { s: '{A} dişlerini fırçalamadan uyumak üzereydi. Annesi onu çağırdı.', q: 'Sence annesi ne söyledi?', ok: ['Annenin sesi: Dişlerini fırçala!', 'Dişlerini fırçalamadan uyuma.'], no: [['Alkış sesi', 'Haydi parka gidelim.'], ['Telefon zili', 'Telefon çalıyor.']] },
  { s: '{A} çok acıkmıştı. Annesi fırından mis gibi kokan bir kek çıkardı.', q: 'Sence {A} ne yaptı?', ok: ['Yeme sesi: hap hap, mmm!', 'Bir dilim kek yedi.'], no: [['Uyuma sesi', 'Hemen uyudu.'], ['Bisiklet zili', 'Bisiklete bindi.']] },
  { s: '{A} kediye bir kâse süt koydu. Kedi kâsenin yanına geldi.', q: 'Sence kedi ne yaptı?', ok: ['Süt içme sesi: şap şap', 'Kedi sütü içti.'], no: [['Havlama sesi', 'Kedi havladı.'], ['Araba kornası', 'Kedi araba sürdü.']] },
  { s: '{A} parkta salıncağa bindi. Babası onu arkadan itti.', q: 'Sence sonra ne oldu?', ok: ['Salıncak gıcırtısı ve gülme sesi', 'Salıncak ileri geri sallandı, {A} güldü.'], no: [['Yağmur sesi', 'Kar yağdı.'], ['Horoz sesi', 'Sabah oldu.']] },
  { s: '{A} kapının zilini duydu. Kapıyı açınca karşısında büyükannesini gördü.', q: 'Sence {A} ne yaptı?', ok: ['Sevinç çığlığı ve sarılma', 'Büyükannesine sevinçle sarıldı.'], no: [['Kapı çarpma sesi', 'Kapıyı yüzüne kapattı.'], ['Horlama sesi', 'Kapıda uyudu.']] },
  { s: '{A} bahçedeki çiçeklerin solduğunu gördü. Elinde bir sulama kabı vardı.', q: 'Sence {A} ne yaptı?', ok: ['Su dökülme sesi: şırıl şırıl', 'Çiçekleri suladı.'], no: [['Top sektirme sesi', 'Top oynadı.'], ['Kâğıt yırtma sesi', 'Kâğıt yırttı.']] },
  { s: '{A} doğum günü pastasının önünde duruyordu. Pastanın üstünde mumlar yanıyordu. Herkes şarkı söyledi.', q: 'Sence {A} ne yaptı?', ok: ['Üfleme sesi ve alkışlar', 'Mumları üfledi, herkes alkışladı.'], no: [['Yağmur sesi', 'Yağmur yağdı.'], ['Köpek havlaması', 'Köpek gibi havladı.']] },
  { s: '{A} denizin kenarında kumdan kale yaptı. Büyük bir dalga geldi.', q: 'Sence kumdan kaleye ne oldu?', ok: ['Dalga sesi: şaaav', 'Dalga kumdan kaleyi yıktı.'], no: [['Kuş cıvıltısı', 'Kale uçup gitti.'], ['Saat tik takı', 'Kale saat oldu.']] },
  { s: '{A} buz gibi dondurmasını güneşin altında unuttu.', q: 'Sence dondurmaya ne oldu?', ok: ['Damlama sesi: damla damla', 'Dondurma eridi.'], no: [['Donma sesi', 'Dondurma büyüdü.'], ['Zil sesi', 'Dondurma şarkı söyledi.']] },
  { s: '{A} sabah alarmı duydu: dıt dıt dıt! Okula gitme zamanıydı.', q: 'Sence {A} ne yaptı?', ok: ['Esneme ve yataktan kalkma sesi', 'Uyanıp yataktan kalktı.'], no: [['Kar topu sesi', 'Kar topu oynadı.'], ['Dalga sesi', 'Denize girdi.']] },
  { s: '{A} kurdeleli bir hediye paketi aldı. Paketi açmak için kurdeleyi çekti.', q: 'Sence sonra ne oldu?', ok: ['Kâğıt hışırtısı ve sevinç sesi: Vay!', 'Paketi açtı ve çok sevindi.'], no: [['Yağmur sesi', 'Paket ıslandı.'], ['Horlama sesi', 'Paketin yanında uyudu.']] },
  { s: '{A} çok yorulmuştu. Akşam olmuş, gözleri kapanıyordu. Annesi ona bir masal okudu.', q: 'Sence {A} ne yaptı?', ok: ['Esneme ve hafif horlama', 'Uykuya daldı.'], no: [['Top sektirme sesi', 'Top oynamaya başladı.'], ['Koşma sesi', 'Dışarı koştu.']] },
  { s: '{A} bardağı masanın kenarına koydu. Kolu bardağa çarptı.', q: 'Sence ne oldu?', ok: ['Cam kırılma sesi: şangır', 'Bardak yere düşüp kırıldı.'], no: [['Kuş cıvıltısı', 'Bardak uçtu.'], ['Alkış sesi', 'Bardak alkışlandı.']] },
  { s: '{A} topa çok sert vurdu. Top kalecinin yanından geçip kaleye girdi.', q: 'Sence sonra ne oldu?', ok: ['Gol sesi ve alkışlar', 'Gol oldu, herkes alkışladı.'], no: [['Yağmur sesi', 'Yağmur yağdı.'], ['Horlama sesi', 'Herkes uyudu.']] },
  { s: '{A} köpeğine top attı. Köpeği kuyruğunu salladı.', q: 'Sence köpek ne yaptı?', ok: ['Havlama ve koşma sesi', 'Köpek koşup topu getirdi.'], no: [['Miyavlama sesi', 'Köpek miyavladı.'], ['Kuş sesi', 'Köpek uçtu.']] },
  { s: '{A} elleri çamur olunca lavaboya gitti ve sabunu aldı.', q: 'Sence {A} ne yaptı?', ok: ['Su akma sesi: şırıl şırıl', 'Ellerini sabunla yıkadı.'], no: [['Pasta yeme sesi', 'Kek yedi.'], ['Davul sesi', 'Davul çaldı.']] },
  { s: 'Tavuk kümeste yumurta üstünde günlerce bekledi. Bir sabah yumurta çatladı.', q: 'Sence yumurtadan ne çıktı?', ok: ['Civciv sesi: cik cik', 'Minik bir civciv çıktı.'], no: [['Havlama sesi', 'Bir köpek çıktı.'], ['Miyav sesi', 'Bir kedi çıktı.']] },
  { s: '{A} uçurtmasını aldı. Rüzgâr çok güzel esiyordu. Koşmaya başladı.', q: 'Sence uçurtmaya ne oldu?', ok: ['Rüzgâr sesi ve uçurtma hışırtısı', 'Uçurtma gökyüzüne yükseldi.'], no: [['Su sesi', 'Uçurtma denize düştü.'], ['Kapı zili', 'Uçurtma eve girdi.']] },
  { s: '{A} kediyi kuyruğundan çekmek istedi. Kedi tüylerini kabarttı.', q: 'Sence kedi ne yaptı?', ok: ['Kızgın kedi sesi: pıssst!', 'Kedi kızdı ve kaçtı.'], no: [['Kuş cıvıltısı', 'Kedi şarkı söyledi.'], ['Alkış sesi', 'Kedi alkışladı.']] },
  { s: 'Akşam oldu, güneş battı. Gökyüzü karardı.', q: 'Sence sonra ne oldu?', ok: ['Cırcır böceği sesi, sessiz gece', 'Gece oldu, yıldızlar çıktı.'], no: [['Horoz sesi', 'Sabah oldu.'], ['Okul zili', 'Teneffüs başladı.']] },
  { s: '{A} tencerenin altındaki ocağı açtı. Tenceredeki su ısınmaya başladı.', q: 'Sence suya ne oldu?', ok: ['Fokur fokur kaynama sesi', 'Su kaynamaya başladı.'], no: [['Buz kırılma sesi', 'Su buz oldu.'], ['Kuş sesi', 'Su uçtu.']] }
];
export const genCause = () => (key, i) => {
  const rng = makeRng(key, i);
  const it = CAUSE[i % CAUSE.length];
  const A = NAMES[(i * 3 + Math.floor(i / CAUSE.length) * 5) % NAMES.length];
  const scenario = fill(it.s, A, ''); const q = fill(it.q, A, '');
  const wr = it.no.map(([t, s]) => sayOpt(t, fill(s, A, '')));
  return { ...shuffled(sayOpt(it.ok[0], fill(it.ok[1], A, '')), wr, rng), text: q, speak: `${scenario} || ${q} || Olayın devamını anlatan sesi dinle ve doğru olanı seç.` };
};
export const POLITE_COUNT = POLITE.length;
export const CAUSE_COUNT = CAUSE.length;
