// ============================================================================
// --- BİLSEM: PARÇA - BÜTÜN ---
// --- BİLSEM: RESMİN PARÇASI (resimden eksik parçayı bul) ---
// ============================================================================
import { card, put, obj, objKey, OBJ, COLORABLE, FACING, HEX, shapeInner, SHAPE_IDS, OL, S, txt, ART } from './draw';
import { makeRng, shuffle, pick, pickN, pickWrongs, result } from './common';

const ALL_SHAPES = [...SHAPE_IDS, 'damla', 'yarimay', 'ok'];
// Parça çizimi: 100x100 çizimin bir bölgesini (x,y,w,h) kırp, (tx,ty)'ye taşı
let clipSeq = 0;
const piece = (inner, x, y, w, h, tx, ty, s = 1, flip = false) => {
  const id = `p${(clipSeq++ % 100000).toString(36)}`;
  const fl = flip ? `translate(${x * 2 + w} 0) scale(-1 1)` : '';
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g transform="translate(${tx} ${ty}) scale(${s}) translate(${-x} ${-y})"><g transform="${fl}"><g clip-path="url(#${id})">${inner}</g></g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#94a3b8" stroke-width="${1.5 / s}" stroke-dasharray="${4 / s} ${3 / s}"/></g>`;
};
const wholeOpt = (key, inner) => ({ key, render: () => card(put(inner, 50, 50, 0.84)) });
const objInner = (k, c) => obj(k, c);

// Yarımlar: yan yana ayrık (dikey kesim) ya da üst-alt ayrık (yatay kesim)
const halvesScene = (inner, vertical, swap = false) => {
  const W = 220, H = 120; let s = '';
  if (vertical) {
    const a = piece(inner, 0, 0, 50, 100, 30, 10, 1), b = piece(inner, 50, 0, 50, 100, 140, 10, 1);
    s = swap ? piece(inner, 50, 0, 50, 100, 30, 10, 1) + piece(inner, 0, 0, 50, 100, 140, 10, 1) : a + b;
  } else {
    s = piece(inner, 0, 0, 100, 50, 10, 30, 1) + piece(inner, 0, 50, 100, 50, 110, 30, 1);
  }
  return card(s, { w: W, h: H, bg: '#f8fafc' });
};

// Çeyrekler: 4 parça ayrık; shuffled = parçaların yerleri karışık
const quartersScene = (inner, shuffled, rng) => {
  const Q = [[0, 0], [50, 0], [0, 50], [50, 50]];
  const slots = [[20, 8], [96, 8], [20, 84], [96, 84]];
  const order = shuffled ? shuffle([0, 1, 2, 3], rng) : [0, 1, 2, 3];
  if (shuffled && order.every((v, i) => v === i)) order.reverse();
  let s = '';
  order.forEach((qi, j) => { s += piece(inner, Q[qi][0], Q[qi][1], 50, 50, slots[j][0], slots[j][1], 1.2); });
  return card(s, { w: 180, h: 160, bg: '#f8fafc' });
};

// KOLAY A: şekil yarımları -> hangi şekil?
export const pwEasyShape = (key, seed) => {
  const rng = makeRng(key, seed);
  const sh = pick(ALL_SHAPES, rng); const c = pick(HEX, rng); const vertical = rng() < 0.6;
  const [o1, o2] = pickN(ALL_SHAPES.filter(x => x !== sh), 2, rng);
  return result({
    sig: `${sh}|${c}|${vertical}`, main: halvesScene(shapeInner(sh, c), vertical),
    correct: wholeOpt(sh + c, shapeInner(sh, c)),
    wrongs: [wholeOpt(o1 + c, shapeInner(o1, c)), wholeOpt(o2 + 'x', shapeInner(o2, pick(HEX, rng)))]
  });
};

// KOLAY B: nesne yarımları -> hangi nesne?
export const pwEasyObject = (key, seed) => {
  const rng = makeRng(key, seed);
  const k = pick(OBJ, rng); const c = pick(HEX, rng); const vertical = rng() < 0.7;
  const others = pickN(OBJ.filter(x => x !== k), 2, rng);
  return result({
    sig: `${objKey(k, c)}|${vertical}`, main: halvesScene(objInner(k, c), vertical),
    correct: wholeOpt(objKey(k, c), objInner(k, c)),
    wrongs: others.map(o => { const oc = pick(HEX, rng); return wholeOpt(objKey(o, oc), objInner(o, oc)); })
  });
};

// ORTA A: dört parça (yerinde ama ayrık) -> hangi nesne? (renk çeldiricili)
export const pwMidQuarters = (key, seed) => {
  const rng = makeRng(key, seed);
  const k = pick(COLORABLE, rng); const c = pick(HEX, rng);
  const [o1, o2] = pickN(OBJ.filter(x => x !== k), 2, rng);
  return result({
    sig: objKey(k, c), main: quartersScene(objInner(k, c), false, rng),
    correct: wholeOpt(objKey(k, c), objInner(k, c)),
    wrongs: [wholeOpt(objKey(k, 'w'), objInner(k, pick(HEX.filter(h => h !== c), rng))), wholeOpt(o1, objInner(o1, c)), wholeOpt(o2 + 'b', objInner(o2, pick(HEX, rng)))]
  });
};

// ORTA B: iki renkli şekil yarımları -> hangisi? (renklerin yeri önemli)
const twoTone = (sh, cL, cR) => `<defs><clipPath id="tl"><rect x="0" y="0" width="50" height="100"/></clipPath><clipPath id="tr"><rect x="50" y="0" width="50" height="100"/></clipPath></defs><g clip-path="url(#tl)">${shapeInner(sh, cL)}</g><g clip-path="url(#tr)">${shapeInner(sh, cR)}</g>${shapeInner(sh, 'none')}`;
export const pwMidTwoTone = (key, seed) => {
  const rng = makeRng(key, seed);
  const sh = pick(['daire', 'kare', 'kalp', 'yildiz', 'esken', 'ucgen', 'damla'], rng); const [a, b] = pickN(HEX, 2, rng);
  const other = pick(ALL_SHAPES.filter(x => x !== sh), rng);
  return result({
    sig: `${sh}|${a}|${b}`, main: halvesScene(twoTone(sh, a, b), true),
    correct: wholeOpt(`${sh}${a}${b}`, twoTone(sh, a, b)),
    wrongs: [wholeOpt(`${sh}${b}${a}`, twoTone(sh, b, a)), wholeOpt(`${sh}${a}${a}`, shapeInner(sh, a)), wholeOpt(`${other}${a}${b}`, twoTone(other, a, b))]
  });
};

// ZOR A: dört parça, yerleri karışık -> hangi nesne? (ayna görüntüsü çeldirici)
export const pwHardShuffled = (key, seed) => {
  const rng = makeRng(key, seed);
  const k = pick(FACING.filter(x => ART[x]), rng); const c = pick(HEX, rng);
  const o1 = pick(OBJ.filter(x => x !== k), rng);
  return result({
    sig: objKey(k, c) + '|' + seed % 7, main: quartersScene(objInner(k, c), true, rng),
    correct: wholeOpt(objKey(k, c), objInner(k, c)),
    wrongs: [
      { key: 'flip', render: () => card(put(objInner(k, c), 50, 50, 0.84, 0, true)) },
      COLORABLE.includes(k)
        ? wholeOpt('color', objInner(k, pick(HEX.filter(h => h !== c), rng)))
        : { key: 'ud', render: () => card(put(objInner(k, c), 50, 50, 0.84, 180)) },
      wholeOpt(o1, objInner(o1, c))
    ]
  });
};

// ZOR B: bütün verilir -> hangi iki parça bu bütünü oluşturur?
const pairOpt = (key, leftInner, rightInner) => ({ key, render: () => card(piece(leftInner, 0, 0, 50, 100, 52, 10, 0.8) + piece(rightInner, 50, 0, 50, 100, 104, 10, 0.8), { w: 200, h: 100 }) });
export const pwHardPairs = (key, seed) => {
  const rng = makeRng(key, seed);
  const k = pick(FACING.filter(x => ART[x]), rng); const c = pick(HEX, rng); const left = rng() < 0.5;
  const me = left ? put(objInner(k, c), 50, 50, 1, 0, true) : objInner(k, c);
  const o = pick(OBJ.filter(x => x !== k), rng); const oth = objInner(o, pick(HEX, rng));
  const other2 = COLORABLE.includes(k) ? objInner(k, pick(HEX.filter(h => h !== c), rng)) : put(me, 50, 50, 1, 0, true);
  return result({
    sig: objKey(k, c) + left, main: card(put(me, 60, 50, 0.9), { w: 120, h: 100, bg: '#eef2ff' }),
    correct: pairOpt('ok', me, me),
    wrongs: [pairOpt('wo', me, oth), pairOpt('wc', other2, me), pairOpt('ll', me, put(me, 50, 50, 1, 0, true))]
  });
};

// ---------------------------------------------------------------------------
// RESMİN PARÇASI: resim karelere bölünür, bir kare eksik -> eksik parça hangisi?
// ---------------------------------------------------------------------------
const SKY = ['#bae6fd', '#e0f2fe', '#fde68a', '#fbcfe8', '#ddd6fe'];
const GROUNDS = ['#86efac', '#fcd34d', '#a7f3d0', '#fdba74'];
// 120x120 resim: gökyüzü + zemin + güneş/bulut + büyük nesne + küçük süsler (simetrik olmayan)
const SMALL = ['flower', 'mushroom', 'apple', 'ball', 'star', 'heart', 'strawberry', 'leaf', 'chick', 'giftBox', 'cup', 'lollipop'];
const pictureSvg = (rng) => {
  // 3x3'lük her bölgede ayırt edilebilir bir şey olsun: güneş, uçan nesne, bulut / büyük nesne / iki küçük nesne
  const k = pick(FACING.filter(x => ART[x]), rng); const c = pick(HEX, rng);
  const [a, b2] = pickN(SMALL, 2, rng); const flyer = pick(['bird', 'balloon', 'kite', 'butterfly', 'airplane'], rng);
  const sky = pick(SKY, rng), gr = pick(GROUNDS, rng);
  let s = `<rect x="0" y="0" width="120" height="120" fill="${sky}"/><rect x="0" y="82" width="120" height="38" fill="${gr}"/>`;
  s += put(ART.sun(), 16, 16, 0.26) + put(obj(flyer, pick(HEX, rng)), 60, 15, 0.22) + put(ART.cloud(), 102, 18, 0.28);
  s += `<path d="M0,98 L120,108" stroke="#fff" stroke-width="3" opacity=".6"/>`;
  s += put(obj(k, c), 60, 60, 0.74);
  s += put(obj(a, pick(HEX, rng)), 16, 102, 0.24) + put(obj(b2, pick(HEX, rng)), 104, 102, 0.24);
  return { svg: s, sig: `${k}${c}${a}${b2}${flyer}${sky}${gr}` };
};
const tileRect = (n, idx) => { const t = 120 / n; return { x: (idx % n) * t, y: Math.floor(idx / n) * t, t }; };
const tileOpt = (pic, n, idx, flip = false, rot = 0) => {
  const { x, y, t } = tileRect(n, idx);
  const key = `${idx}|${flip}|${rot}`;
  return { key, render: () => {
    const id = 'tc';
    const s = 86 / t;
    const fl = flip ? `translate(${2 * x + t} 0) scale(-1 1)` : '';
    return card(`<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${t}" height="${t}"/></clipPath></defs><g transform="translate(50 50) rotate(${rot}) translate(-43 -43) scale(${s}) translate(${-x} ${-y})"><g transform="${fl}"><g clip-path="url(#${id})">${pic}</g></g></g><rect x="7" y="7" width="86" height="86" fill="none" stroke="${OL}" stroke-width="2.5"/>`);
  } };
};
const pictureMain = (pic, n, missing) => {
  const { x, y, t } = tileRect(n, missing);
  let grid = '';
  for (let j = 1; j < n; j++) { const p = (120 / n) * j; grid += `<path d="M${p},0 L${p},120 M0,${p} L120,${p}" stroke="#fff" stroke-width="1.5" opacity=".9"/>`; }
  return card(`<g transform="translate(10 10) scale(1.5)">${pic}${grid}<rect x="${x}" y="${y}" width="${t}" height="${t}" fill="#fff" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="4 3"/>${txt(x + t / 2, y + t / 2 + 1, '?', t * 0.5, '#d97706')}<rect x="0" y="0" width="120" height="120" fill="none" stroke="${OL}" stroke-width="2"/></g>`, { w: 200, h: 200, bg: '#ffffff' });
};
const makePicture = (n, m, { flipWrong = false, rotWrong = false } = {}) => (key, seed) => {
  const rng = makeRng(key, seed);
  const pic = pictureSvg(rng);
  // ayna/ters çeldiricide eksik parça büyük nesneden seçilir (simetrik güneş/bulut parçası ayna ile aynı görünürdü)
  const missing = (flipWrong || rotWrong) ? (n === 4 ? pick([5, 6, 9, 10], rng) : n === 3 ? pick([3, 4, 5], rng) : pick([2, 3], rng)) : Math.floor(rng() * n * n);
  const others = shuffle([...Array(n * n).keys()].filter(i => i !== missing), rng);
  const cands = [];
  if (flipWrong) cands.push(tileOpt(pic.svg, n, missing, true));
  if (rotWrong) cands.push(tileOpt(pic.svg, n, missing, false, 180));
  others.forEach(i => cands.push(tileOpt(pic.svg, n, i)));
  return result({
    sig: `${pic.sig}|${missing}`, main: pictureMain(pic.svg, n, missing),
    correct: tileOpt(pic.svg, n, missing), wrongs: pickWrongs(`${missing}|false|0`, cands, m - 1)
  });
};
export const ppEasy = makePicture(2, 3);
export const ppEasy4 = makePicture(2, 4);
export const ppMid = makePicture(3, 4);
export const ppMidRot = makePicture(2, 4, { rotWrong: true });
export const ppHardFlip = makePicture(3, 4, { flipWrong: true });
export const ppHardBoth = makePicture(3, 4, { flipWrong: true, rotWrong: true });

// İLKOKUL (1-3. sınıf) EK KALIPLARI: 16 parçalı resim
export const ppG3Flip = makePicture(4, 4, { flipWrong: true });
export const ppG3Both = makePicture(4, 4, { flipWrong: true, rotWrong: true });

// ============================================================================
// İLKOKUL (1-3. sınıf) EK KALIPLARI: parça - bütün
// ============================================================================
// İki nesneli kompozisyon (büyük nesne + köşede küçük nesne) -> çeldiriciler ince farklı
const SPOTS4 = [[22, 22], [78, 22], [22, 78], [78, 78]];
const compo = (v) => put(obj(v.k, v.c), 50, 54, 0.78, 0, v.f) + put(obj(v.s, v.sc), SPOTS4[v.p][0], SPOTS4[v.p][1], 0.3);
const compoKey = (v) => `${v.k}${v.c}${v.f ? 1 : 0}|${v.s}${v.sc}${v.p}`;
const compoOpt = (v) => ({ key: compoKey(v), render: () => card(put(compo(v), 50, 50, 0.9)) });
const makeCompo = (rng) => {
  const k = pick(FACING.filter(x => ART[x] && COLORABLE.includes(x)), rng) || pick(FACING.filter(x => ART[x]), rng);
  return { k, c: pick(HEX, rng), f: rng() < 0.5, s: pick(['star', 'heart', 'apple', 'flower', 'ball', 'leaf'], rng), sc: pick(HEX, rng), p: Math.floor(rng() * 4) };
};
const compoWrongs = (v, rng) => [
  { ...v, f: !v.f },
  { ...v, p: (v.p + 1) % 4 },
  { ...v, p: 3 - v.p },
  { ...v, c: pick(HEX.filter(h => h !== v.c), rng) },
  { ...v, s: pick(['star', 'heart', 'apple', 'flower', 'ball', 'leaf'].filter(x => x !== v.s), rng) }
].map(compoOpt);
// 9 parça (3x3), yerleri karışık
const ninthsScene = (inner, rng) => {
  const order = shuffle([...Array(9).keys()], rng);
  const t = 100 / 3; let s = '';
  order.forEach((qi, j) => {
    const sx = (qi % 3) * t, sy = Math.floor(qi / 3) * t;
    s += piece(inner, sx, sy, t, t, 12 + (j % 3) * 46, 10 + Math.floor(j / 3) * 46, 1.2);
  });
  return card(s, { w: 164, h: 160, bg: '#f8fafc' });
};
// 4 parça, karışık ve bazıları döndürülmüş
const rotQuartersScene = (inner, rng) => {
  const Q = [[0, 0], [50, 0], [0, 50], [50, 50]];
  const slots = [[20, 8], [96, 8], [20, 84], [96, 84]];
  const order = shuffle([0, 1, 2, 3], rng);
  let s = '';
  order.forEach((qi, j) => {
    const rot = pick([0, 0, 90, 180, 270], rng);
    const p = piece(inner, Q[qi][0], Q[qi][1], 50, 50, 0, 0, 1.2);
    s += `<g transform="translate(${slots[j][0] + 30} ${slots[j][1] + 30}) rotate(${rot}) translate(-30 -30)">${p}</g>`;
  });
  return card(s, { w: 180, h: 160, bg: '#f8fafc' });
};
export const pwG2Rotated = (key, seed) => {
  const rng = makeRng(key, seed); const v = makeCompo(rng);
  return result({ sig: compoKey(v) + 'r', main: rotQuartersScene(compo(v), rng), correct: compoOpt(v), wrongs: pickWrongs(compoKey(v), shuffle(compoWrongs(v, rng), rng), 3) });
};
export const pwG3Nine = (key, seed) => {
  const rng = makeRng(key, seed); const v = makeCompo(rng);
  return result({ sig: compoKey(v) + 'n', main: ninthsScene(compo(v), rng), correct: compoOpt(v), wrongs: pickWrongs(compoKey(v), shuffle(compoWrongs(v, rng), rng), 3) });
};
export const pwG3Quarter = (key, seed) => {
  const rng = makeRng(key, seed); const v = makeCompo(rng);
  return result({ sig: compoKey(v) + 'q', main: quartersScene(compo(v), true, rng), correct: compoOpt(v), wrongs: pickWrongs(compoKey(v), shuffle(compoWrongs(v, rng), rng), 3) });
};
