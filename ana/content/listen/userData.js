// ============================================================================
// --- SESLİ SORULAR: öğretmenin gönderdiği sorular ---
// ============================================================================
// Neden-sonuç 100 • Nezaket 100 • Mekân ve zıtlık 100 • Hikâyeler (2 soruluk sesli 100,
// 3 soruluk görselli 100, 3 soruluk sesli 100). Metinler olduğu gibi kullanılır.
// Şıklar: yazı + telefonla okuma + resim (resim ancak üç şık da birbirinden farklı çizilebiliyorsa).
import { makeRng, shuffle } from '../helpers';
import { optionPictures, scene } from '../pic';
import LISTEN_DATA from './data/userListen.json';
import STORY_DATA from './data/userStories.json';

const NUM = { 2: 'iki', 3: 'üç' };

// --- Neden-sonuç / Nezaket / Mekân ---
// { s: durum, q: soru, i: yönerge, o: [3 şık], a: doğru şık (0..2) }
// Doğru şık yeri her soruda karışır (kaynakta hep ilk sırada olduğu için).
export const genUserListen = (kind) => (key, i) => {
  const it = LISTEN_DATA[kind][i];
  if (!it) return null;
  const rng = makeRng(key, i);
  const pics = optionPictures(it.o);
  const items = it.o.map((t, k) => ({ text: t, tts: t, image: pics[k] || '' }));
  const order = shuffle([0, 1, 2], rng);
  const speak = [it.s, it.q, it.i || 'Şıkları dinle ve doğru olanı seç.'].filter(Boolean).join(' || ');
  return {
    options: order.map(k => items[k]),
    correctIndex: order.indexOf(it.a),
    text: it.q,
    speak,
    mainImage: scene(`${it.s} ${it.q}`),
    fields: { style: { imgScale: 0.5 } } // sahne resmi küçük: şıklara yer kalsın
  };
};
export const userListenCount = (kind) => LISTEN_DATA[kind].length;

// --- Hikâyeler ---
// sekme 1: 2 soruluk görselli • 2: 2 soruluk sesli • 3: 3 soruluk görselli • 4: 3 soruluk sesli
const storiesOf = (sekme) => (STORY_DATA.find(x => x.sekme === sekme) || { stories: [] }).stories;
const coverCache = new Map();
const storyCover = (st) => {
  if (!coverCache.has(st.x)) coverCache.set(st.x, scene(`${st.t}. ${st.x}`));
  return coverCache.get(st.x);
};

export const genUserStory = (sekme, mode) => (key, i) => {
  const list = storiesOf(sekme);
  const parts = list[0]?.q.length || 3;
  const storyNo = Math.floor(i / parts); const part = i % parts;
  const st = list[storyNo]; if (!st) return null;
  const q = st.q[part]; if (!q) return null;
  let options;
  if (mode === 'gorsel') {
    const pics = optionPictures(q.o);
    options = q.o.map((t, k) => ({ text: t, tts: pics[k] ? '' : t, image: pics[k] || '' }));
  } else {
    options = q.o.map(t => ({ text: t, tts: t, image: '' }));
  }
  const cover = storyCover(st);
  return {
    options, correctIndex: q.a,
    text: q.q, speak: q.q, tag: String(storyNo + 1),
    mainImage: mode === 'gorsel' ? '' : (scene(q.q) || cover),
    fields: {
      storyId: `${key}-${storyNo + 1}`,
      storyIntro: `Hikâyeyi dikkatle dinleyelim. Sonra sana ${NUM[parts]} soru soracağım.`,
      storyText: st.x,
      storyTitle: `${storyNo + 1}. ${st.t}`,
      storyImage: cover,
      storyPart: part + 1, storyTotal: parts,
      ...(mode === 'gorsel' ? {} : { style: { imgScale: 0.5 } })
    }
  };
};
export const userStoryCount = (sekme) => storiesOf(sekme).reduce((a, s) => a + s.q.length, 0);
