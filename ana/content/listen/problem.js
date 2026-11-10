// ============================================================================
// --- SESLİ SORULAR: PROBLEM ÇÖZME (söylenen özelliklere uyanı bul) ---
// ============================================================================
// Tip 1: üç özellik de VAR  ->  "Cebi olan, çizgili ve üzerinde güneş resmi olan sarı tişörtü bul."
// Tip 2: iki özellik var, biri YOK -> "Kulpu olan, içinde portakal suyu olan ama pipeti olmayan bardağı bul."
// Şıklar aynı nesnenin çok benzer halleri: her yanlış şıkta tam bir özellik farklıdır.
import { card, OL, S, SN, lighten, darken } from '../art';
import { makeRng, pick, shuffle } from '../helpers';

const COLS = [
  { id: 'sari', adj: 'sarı', hex: '#facc15' }, { id: 'kirmizi', adj: 'kırmızı', hex: '#ef4444' }, { id: 'mavi', adj: 'mavi', hex: '#3b82f6' },
  { id: 'yesil', adj: 'yeşil', hex: '#22c55e' }, { id: 'mor', adj: 'mor', hex: '#a855f7' }, { id: 'turuncu', adj: 'turuncu', hex: '#f97316' }, { id: 'pembe', adj: 'pembe', hex: '#f472b6' }
];
const sun = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fde047" ${S} stroke-width="1.6"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const t = a * Math.PI / 180; return `<path d="M${(x + Math.cos(t) * (r + 2)).toFixed(1)},${(y + Math.sin(t) * (r + 2)).toFixed(1)} L${(x + Math.cos(t) * (r + 6)).toFixed(1)},${(y + Math.sin(t) * (r + 6)).toFixed(1)}" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>`; }).join('')}`;
const heart = (x, y, s = 1, c = '#ef4444') => `<path d="M${x},${y + 7 * s} C${x - 9 * s},${y + 1 * s} ${x - 9 * s},${y - 6 * s} ${x - 4 * s},${y - 7 * s} C${x - 1 * s},${y - 8 * s} ${x},${y - 5 * s} ${x},${y - 4 * s} C${x},${y - 5 * s} ${x + 1 * s},${y - 8 * s} ${x + 4 * s},${y - 7 * s} C${x + 9 * s},${y - 6 * s} ${x + 9 * s},${y + 1 * s} ${x},${y + 7 * s} Z" fill="${c}" ${S} stroke-width="1.5"/>`;
const star = (x, y, r = 7, c = '#facc15') => { const p = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r; const a = (-90 + i * 36) * Math.PI / 180; p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`); } return `<polygon points="${p.join(' ')}" fill="${c}" ${S} stroke-width="1.5"/>`; };

// Her nesne: 4 özellik (has / not ifadeleri) + çizim
const OBJECTS = [
  {
    id: 'tisort', noun: 'tişörtü', label: 'Tişört',
    feats: [
      { id: 'cep', has: 'cebi olan', not: 'cebi olmayan' },
      { id: 'gunes', has: 'üzerinde güneş resmi olan', not: 'üzerinde güneş resmi olmayan' },
      { id: 'cizgi', has: 'çizgili olan', not: 'çizgili olmayan' },
      { id: 'yaka', has: 'yakası olan', not: 'yakası olmayan' }
    ],
    draw: (f, c) => {
      const body = 'M30,16 C38,24 62,24 70,16 L92,30 L82,48 L72,42 L72,90 L28,90 L28,42 L18,48 L8,30 Z';
      let s = `<defs><clipPath id="tsb"><path d="${body}"/></clipPath></defs><path d="${body}" fill="${c}" ${S}/>`;
      if (f.cizgi) s += `<g clip-path="url(#tsb)">${[34, 48, 62, 76].map(y => `<rect x="0" y="${y}" width="100" height="6" fill="#fff" opacity=".85"/>`).join('')}</g><path d="${body}" fill="none" ${S}/>`;
      if (f.yaka) s += `<path d="M38,19 L50,32 L62,19 L56,17 L50,25 L44,17 Z" fill="#fff" ${S} stroke-width="1.8"/>`;
      else s += `<path d="M38,19 C42,26 58,26 62,19" ${SN} stroke-width="2"/>`;
      if (f.gunes) s += sun(50, 50, 8);
      if (f.cep) s += `<rect x="56" y="64" width="12" height="14" rx="2" fill="${lighten(c, 0.3)}" ${S} stroke-width="1.8"/><path d="M56,68 L68,68" ${SN} stroke-width="1.5"/>`;
      return s;
    }
  },
  {
    id: 'bardak', noun: 'bardağı', label: 'Bardak',
    feats: [
      { id: 'kulp', has: 'kulpu olan', not: 'kulpu olmayan' },
      { id: 'portakal', has: 'içinde portakal suyu olan', not: 'içi boş olan' },
      { id: 'pipet', has: 'pipeti olan', not: 'pipeti olmayan' },
      { id: 'kalp', has: 'üzerinde kalp resmi olan', not: 'üzerinde kalp resmi olmayan' }
    ],
    draw: (f, c) => {
      let s = '';
      if (f.pipet) s += `<path d="M58,40 L70,6 L80,6" ${SN} stroke="#ef4444" stroke-width="5"/>`;
      if (f.kulp) s += `<path d="M70,40 C90,40 90,72 68,70" ${SN} stroke-width="9"/><path d="M70,40 C90,40 90,72 68,70" fill="none" stroke="${c}" stroke-width="4.5"/>`;
      s += `<path d="M26,26 L74,26 L68,90 L32,90 Z" fill="${lighten(c, 0.55)}" ${S}/>`;
      if (f.portakal) s += `<path d="M28,40 L72,40 L68,88 L32,88 Z" fill="#fb923c"/><path d="M28,40 L72,40" stroke="#fdba74" stroke-width="3"/>`;
      s += `<path d="M26,26 L74,26 L68,90 L32,90 Z" fill="none" ${S}/><path d="M26,26 L74,26" stroke="${c}" stroke-width="5"/>`;
      if (f.pipet) s += `<path d="M58,40 L62,30" ${SN} stroke="#ef4444" stroke-width="5" opacity=".6"/>`;
      if (f.kalp) s += heart(50, 66, 1.1, '#ef4444');
      return s;
    }
  },
  {
    id: 'sapka', noun: 'şapkayı', label: 'Şapka',
    feats: [
      { id: 'fiyonk', has: 'fiyonklu olan', not: 'fiyonku olmayan' },
      { id: 'yildiz', has: 'üzerinde yıldız olan', not: 'üzerinde yıldız olmayan' },
      { id: 'ponpon', has: 'tepesinde ponponu olan', not: 'ponponu olmayan' },
      { id: 'serit', has: 'şeridi olan', not: 'şeridi olmayan' }
    ],
    draw: (f, c) => {
      let s = `<ellipse cx="50" cy="74" rx="44" ry="11" fill="${darken(c, 0.12)}" ${S}/><path d="M24,74 C24,36 32,24 50,24 C68,24 76,36 76,74 Z" fill="${c}" ${S}/>`;
      if (f.serit) s += `<path d="M25,62 C40,66 60,66 75,62 L75.5,70 C60,74 40,74 24.5,70 Z" fill="#fff" ${S} stroke-width="1.8"/>`;
      if (f.fiyonk) s += `<path d="M68,64 L82,56 L82,72 Z M68,64 L56,56 L56,72 Z" fill="#ec4899" ${S} stroke-width="1.8"/><circle cx="68" cy="64" r="3.5" fill="#be185d" ${S} stroke-width="1.5"/>`;
      if (f.yildiz) s += star(42, 44, 8);
      if (f.ponpon) s += `<circle cx="50" cy="20" r="8" fill="#fff" ${S}/>`;
      return s;
    }
  },
  {
    id: 'canta', noun: 'çantayı', label: 'Çanta',
    feats: [
      { id: 'cep', has: 'önünde cebi olan', not: 'cebi olmayan' },
      { id: 'aski', has: 'uzun askısı olan', not: 'askısı olmayan' },
      { id: 'kalp', has: 'üzerinde kalp resmi olan', not: 'üzerinde kalp resmi olmayan' },
      { id: 'anahtarlik', has: 'yıldız anahtarlığı olan', not: 'anahtarlığı olmayan' }
    ],
    draw: (f, c) => {
      let s = '';
      if (f.aski) s += `<path d="M28,40 C28,4 72,4 72,40" ${SN} stroke-width="7"/><path d="M28,40 C28,4 72,4 72,40" fill="none" stroke="${darken(c, 0.2)}" stroke-width="3.5"/>`;
      else s += `<path d="M40,36 C40,26 60,26 60,36" ${SN} stroke-width="5"/>`;
      s += `<rect x="18" y="36" width="64" height="54" rx="10" fill="${c}" ${S}/>`;
      if (f.cep) s += `<rect x="30" y="62" width="40" height="22" rx="5" fill="${lighten(c, 0.3)}" ${S} stroke-width="1.8"/><path d="M30,68 L70,68" ${SN} stroke-width="1.5"/>`;
      if (f.kalp) s += heart(50, 50, 1, '#ef4444');
      if (f.anahtarlik) s += `<path d="M78,44 L86,56" ${SN} stroke-width="1.8"/>${star(88, 62, 7)}`;
      return s;
    }
  },
  {
    id: 'pasta', noun: 'pastayı', label: 'Pasta',
    feats: [
      { id: 'mum', has: 'mumu olan', not: 'mumu olmayan' },
      { id: 'cilek', has: 'üstünde çilek olan', not: 'üstünde çilek olmayan' },
      { id: 'cikolata', has: 'çikolata soslu olan', not: 'çikolata sosu olmayan' },
      { id: 'kurdele', has: 'kurdeleli olan', not: 'kurdelesi olmayan' }
    ],
    draw: (f, c) => {
      let s = `<ellipse cx="50" cy="88" rx="42" ry="6" fill="#e2e8f0" ${S}/><rect x="16" y="46" width="68" height="40" rx="6" fill="${c}" ${S}/><ellipse cx="50" cy="46" rx="34" ry="8" fill="${lighten(c, 0.35)}" ${S}/>`;
      if (f.cikolata) s += `<path d="M16,48 C16,40 84,40 84,48 L84,56 C80,62 76,54 72,58 C68,64 64,54 58,60 C54,66 50,54 44,60 C40,64 36,54 30,58 C26,62 20,54 16,58 Z" fill="#78350f" ${S} stroke-width="1.8"/>`;
      if (f.kurdele) s += `<rect x="16" y="68" width="68" height="7" fill="#3b82f6" ${S} stroke-width="1.5"/>`;
      if (f.cilek) s += `<path d="M34,40 C30,30 40,28 42,36 C44,28 54,30 50,40 C48,46 38,46 34,40 Z" fill="#ef4444" ${S} stroke-width="1.5"/><path d="M38,30 L42,26 L46,30" ${SN} stroke="#16a34a" stroke-width="2.5"/>`;
      if (f.mum) s += `<rect x="60" y="22" width="7" height="20" fill="#60a5fa" ${S} stroke-width="1.5"/><path d="M63.5,12 C67,17 67,20 63.5,22 C60,20 60,17 63.5,12 Z" fill="#f97316" ${S} stroke-width="1.2"/>`;
      return s;
    }
  },
  // --- yeni nesneler ---
  {
    id: 'ev', noun: 'evi', label: 'Ev',
    feats: [
      { id: 'baca', has: 'bacası olan', not: 'bacası olmayan' },
      { id: 'yuvarlak', has: 'yuvarlak penceresi olan', not: 'yuvarlak penceresi olmayan' },
      { id: 'cicek', has: 'önünde çiçekler olan', not: 'önünde çiçek olmayan' },
      { id: 'bayrak', has: 'çatısında bayrak olan', not: 'bayrağı olmayan' }
    ],
    draw: (f, c) => {
      let s = '';
      if (f.bayrak) s += `<path d="M50,22 L50,4" ${SN} stroke-width="2"/><path d="M50,4 L64,8 L50,13 Z" fill="#ef4444" ${S} stroke-width="1.5"/>`;
      if (f.baca) s += `<circle cx="70" cy="12" r="3.5" fill="#cbd5e1"/><circle cx="76" cy="7" r="4.5" fill="#e2e8f0"/><rect x="64" y="20" width="10" height="20" fill="#7c2d12" ${S} stroke-width="2"/>`;
      s += `<rect x="22" y="46" width="56" height="42" fill="${c}" ${S}/><path d="M14,48 L50,20 L86,48 Z" fill="#92400e" ${S}/>`;
      s += `<rect x="44" y="64" width="12" height="24" rx="2" fill="#78350f" ${S} stroke-width="2"/>`;
      s += [28, 60].map(x => `<rect x="${x}" y="54" width="12" height="12" fill="#bae6fd" ${S} stroke-width="2"/><path d="M${x + 6},54 L${x + 6},66 M${x},60 L${x + 12},60" ${SN} stroke-width="1.4"/>`).join('');
      if (f.yuvarlak) s += `<circle cx="50" cy="38" r="6" fill="#bae6fd" ${S} stroke-width="2"/>`;
      if (f.cicek) s += [10, 90].map(x => `<path d="M${x},96 L${x},84" stroke="#16a34a" stroke-width="2.5"/><circle cx="${x}" cy="82" r="5" fill="#f472b6" ${S} stroke-width="1.5"/><circle cx="${x}" cy="82" r="1.8" fill="#facc15"/>`).join('');
      return s;
    }
  },
  {
    id: 'araba', noun: 'arabayı', label: 'Araba',
    feats: [
      { id: 'yildiz', has: 'kapısında yıldız olan', not: 'kapısında yıldız olmayan' },
      { id: 'far', has: 'farı yanan', not: 'farı yanmayan' },
      { id: 'anten', has: 'anteni olan', not: 'anteni olmayan' },
      { id: 'bavul', has: 'üstünde bavul olan', not: 'üstünde bavul olmayan' }
    ],
    draw: (f, c) => {
      let s = '';
      if (f.anten) s += `<path d="M68,38 L80,12" ${SN} stroke-width="2"/><circle cx="80" cy="12" r="2.5" fill="#ef4444" ${S} stroke-width="1"/>`;
      if (f.bavul) s += `<rect x="34" y="22" width="30" height="13" rx="2" fill="#a16207" ${S} stroke-width="2"/><path d="M44,22 L44,35 M54,22 L54,35" stroke="#713f12" stroke-width="2"/>`;
      if (f.far) s += `<path d="M90,58 L100,48 L100,72 Z" fill="#fde047" opacity=".75"/>`;
      s += `<path d="M28,54 L34,36 L66,36 L74,54 Z" fill="${c}" ${S}/><path d="M34,52 L38,40 L48,40 L48,52 Z M52,52 L52,40 L63,40 L68,52 Z" fill="#bae6fd" ${S} stroke-width="1.6"/>`;
      s += `<rect x="8" y="52" width="84" height="22" rx="7" fill="${c}" ${S}/>`;
      s += `<circle cx="89" cy="60" r="4" fill="${f.far ? '#fde047' : '#e2e8f0'}" ${S} stroke-width="1.6"/>`;
      if (f.yildiz) s += star(50, 63, 7, '#fff');
      s += [28, 72].map(x => `<circle cx="${x}" cy="76" r="9" fill="#1e293b" ${S}/><circle cx="${x}" cy="76" r="3.5" fill="#cbd5e1"/>`).join('');
      return s;
    }
  },
  {
    id: 'balon', noun: 'balonu', label: 'Balon',
    feats: [
      { id: 'yuz', has: 'gülen yüzü olan', not: 'yüzü olmayan' },
      { id: 'puan', has: 'puantiyeli olan', not: 'puantiyeli olmayan' },
      { id: 'fiyonk', has: 'ipinde fiyonk olan', not: 'ipinde fiyonk olmayan' },
      { id: 'bulut', has: 'yanında bulut olan', not: 'yanında bulut olmayan' }
    ],
    draw: (f, c) => {
      let s = `<path d="M50,72 C44,80 56,86 50,96" ${SN} stroke-width="2"/><path d="M46,74 L54,74 L50,68 Z" fill="${darken(c, 0.15)}" ${S} stroke-width="1.5"/><ellipse cx="50" cy="40" rx="26" ry="30" fill="${c}" ${S}/>`;
      if (f.puan) s += [[34, 24], [66, 24], [29, 46], [71, 46], [50, 15], [38, 62], [62, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#fff" ${S} stroke-width="1"/>`).join('');
      if (f.yuz) s += `<circle cx="42" cy="36" r="2.8" fill="#1e293b"/><circle cx="58" cy="36" r="2.8" fill="#1e293b"/><path d="M41,46 Q50,55 59,46" ${SN} stroke-width="2.2"/>`;
      if (f.fiyonk) s += `<path d="M50,84 L40,78 L40,90 Z M50,84 L60,78 L60,90 Z" fill="#ec4899" ${S} stroke-width="1.5"/><circle cx="50" cy="84" r="2.5" fill="#be185d"/>`;
      if (f.bulut) s += `<path d="M74,92 C66,92 66,82 74,82 C74,74 86,72 88,80 C96,78 98,92 90,92 Z" fill="#fff" ${S} stroke-width="1.8"/>`;
      return s;
    }
  },
  {
    id: 'dondurma', noun: 'dondurmayı', label: 'Dondurma',
    feats: [
      { id: 'iki', has: 'iki toplu olan', not: 'tek toplu olan' },
      { id: 'kiraz', has: 'tepesinde kiraz olan', not: 'kirazı olmayan' },
      { id: 'seker', has: 'renkli şekerli olan', not: 'şekeri olmayan' },
      { id: 'gofret', has: 'gofretli olan', not: 'gofreti olmayan' }
    ],
    draw: (f, c) => {
      const top = f.iki ? 30 : 50;
      let s = '';
      if (f.gofret) s += `<path d="M58,${top + 4} L72,${top - 22}" stroke="#78350f" stroke-width="7" stroke-linecap="round"/><path d="M58,${top + 4} L72,${top - 22}" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/>`;
      s += `<path d="M35,58 L50,96 L65,58 Z" fill="#f59e0b" ${S}/><path d="M40,64 L58,80 M46,60 L62,70 M60,64 L44,80 M54,60 L40,70" stroke="#b45309" stroke-width="1.5"/>`;
      if (f.iki) s += `<circle cx="50" cy="32" r="15" fill="${c}" ${S}/>`;
      s += `<circle cx="50" cy="50" r="17" fill="${c}" ${S}/>`;
      if (f.seker) { const ys = f.iki ? [26, 34, 46, 54] : [42, 48, 54, 46]; const xs = [42, 57, 40, 58]; const cs = ['#22c55e', '#3b82f6', '#ec4899', '#facc15']; s += xs.map((x, k) => `<rect x="${x}" y="${ys[k]}" width="5" height="2.6" rx="1.2" fill="${cs[k]}" ${S} stroke-width="0.8" transform="rotate(${k * 40 - 30} ${x} ${ys[k]})"/>`).join(''); }
      if (f.kiraz) s += `<path d="M50,${top - 18} C52,${top - 26} 58,${top - 28} 60,${top - 28}" ${SN} stroke="#16a34a" stroke-width="2"/><circle cx="50" cy="${top - 14}" r="5.5" fill="#dc2626" ${S} stroke-width="1.5"/>`;
      return s;
    }
  },
  {
    id: 'corap', noun: 'çorabı', label: 'Çorap',
    feats: [
      { id: 'cizgi', has: 'çizgili olan', not: 'çizgili olmayan' },
      { id: 'topuk', has: 'topuğu beyaz olan', not: 'topuğu beyaz olmayan' },
      { id: 'kalp', has: 'üzerinde kalp resmi olan', not: 'üzerinde kalp resmi olmayan' },
      { id: 'ponpon', has: 'ponponlu olan', not: 'ponponu olmayan' }
    ],
    draw: (f, c) => {
      const body = 'M34,16 L62,16 L62,58 L82,68 C94,73 92,92 80,92 L44,92 C32,92 28,80 34,70 Z';
      let s = `<defs><clipPath id="crb"><path d="${body}"/></clipPath></defs><path d="${body}" fill="${c}" ${S}/>`;
      if (f.cizgi) s += `<g clip-path="url(#crb)">${[28, 42, 56].map(y => `<rect x="0" y="${y}" width="100" height="6" fill="#fff" opacity=".85"/>`).join('')}</g><path d="${body}" fill="none" ${S}/>`;
      if (f.topuk) s += `<path d="M34,70 C28,80 32,92 44,92 L48,92 C42,86 42,76 46,70 Z" fill="#fff" ${S} stroke-width="2"/>`;
      s += `<rect x="31" y="10" width="34" height="11" rx="3" fill="${lighten(c, 0.35)}" ${S}/>`;
      if (f.kalp) s += heart(49, 42, 1, ['#ef4444', '#f472b6'].includes(c) ? '#fff' : '#ef4444');
      if (f.ponpon) s += `<circle cx="40" cy="7" r="5.5" fill="#fff" ${S} stroke-width="1.8"/><circle cx="56" cy="7" r="5.5" fill="#fff" ${S} stroke-width="1.8"/>`;
      return s;
    }
  }
];

const featsOf = (o, on) => Object.fromEntries(o.feats.map(f => [f.id, on.includes(f.id)]));
// şık: resim + ad (ad = toplu görsel yüklemede dosya adı): "Sarı tişört: cebi olan, çizgili olmayan, ..."
const objCard = (o, on, col) => ({
  image: card(o.draw(featsOf(o, on), col.hex)),
  imgName: `${col.adj.charAt(0).toLocaleUpperCase('tr-TR') + col.adj.slice(1)} ${o.label.toLocaleLowerCase('tr-TR')}: ${o.feats.map(f => (on.includes(f.id) ? f.has : f.not)).join(', ')}`
});
const joinTr = (parts) => (parts.length === 3 ? `${parts[0]}, ${parts[1]} ve ${parts[2]}` : parts.join(' ve '));

// Tip 1: üç özellik var
export const genAllThree = (oid) => (key, i) => {
  const rng = makeRng(key, i);
  const o = OBJECTS.find(x => x.id === oid);
  const combos = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
  const cb = combos[i % 4]; const col = COLS[Math.floor(i / 4) % COLS.length];
  const ids = cb.map(k => o.feats[k].id);
  const extra = (i * 7) % 2 ? o.feats.find(f => !ids.includes(f.id)).id : null; // dördüncü özellik bazen hepsinde olsun (çeldirici)
  const base = extra ? [...ids, extra] : ids;
  const miss = shuffle(ids, rng).slice(0, 2); // her yanlış şıkta bir istenen özellik eksik
  const sentence = `${joinTr(shuffle(cb, rng).map(k => o.feats[k].has))} ${col.adj} ${o.noun} bul.`;
  const text = sentence.charAt(0).toLocaleUpperCase('tr-TR') + sentence.slice(1);
  const slot = [0, 1, 2]; void slot;
  const correct = objCard(o, base, col);
  const wrongs = miss.map(m => objCard(o, base.filter(x => x !== m), col));
  const opts = [correct, ...wrongs]; const order = shuffle([0, 1, 2], rng);
  return { options: order.map(k => opts[k]), correctIndex: order.indexOf(0), text, speak: text };
};
// Tip 2: iki özellik var, bir özellik yok
export const genTwoOneNot = (oid) => (key, i) => {
  const rng = makeRng(key, i);
  const o = OBJECTS.find(x => x.id === oid);
  const combos = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
  const cb = combos[i % 4]; const notK = cb[Math.floor(i / 4) % 3];
  const yes = cb.filter(k => k !== notK);
  const col = COLS[(Math.floor(i / 12) + i) % COLS.length];
  const yesIds = yes.map(k => o.feats[k].id); const notId = o.feats[notK].id;
  const text0 = `${o.feats[yes[0]].has}, ${o.feats[yes[1]].has} ama ${o.feats[notK].not} ${col.adj} ${o.noun} bul.`;
  const text = text0.charAt(0).toLocaleUpperCase('tr-TR') + text0.slice(1);
  const correct = objCard(o, yesIds, col);
  const w1 = objCard(o, [...yesIds, notId], col); // olmaması gereken özellik de var
  const w2 = objCard(o, [pick(yesIds, rng) === yesIds[0] ? yesIds[1] : yesIds[0]], col); // istenen bir özellik eksik
  const opts = [correct, w1, w2]; const order = shuffle([0, 1, 2], rng);
  return { options: order.map(k => opts[k]), correctIndex: order.indexOf(0), text, speak: text };
};
export const PROBLEM_OBJECTS = OBJECTS.map(o => ({ id: o.id, label: o.label }));
