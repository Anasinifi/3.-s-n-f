// ============================================================================
// --- OYUN DÜNYASI: 3D / HACİMLİ GÖRÜNÜM ---
// ============================================================================
// Karakter, saç, kıyafet, ev, oda eşyası, araba, uçak, tekne, harita, ada, ağaç...
// hepsi SVG çizim. Bu dosya o çizimleri tek tek yeniden çizmeden 3D gösterir:
//   * Her dolu parçaya, kendi renginden üretilmiş ışık-gölge geçişi verilir
//     (sol üstten ışık, sağ altta gölge) -> parça yuvarlak / hacimli görünür.
//   * Büyük zeminler (gökyüzü, deniz, çimen) için daha yumuşak dikey geçiş kullanılır.
//   * Renkler korunur (kırmızı araba yine kırmızı), sadece ışıklandırma eklenir.
//   * Yeni eklenen hazır eşyalar da otomatik 3D olur; kod değişikliği gerekmez.
//   * Yöneticinin yüklediği resimler (PNG/JPG) olduğu gibi gösterilir.
// Çalışma şekli: ".ca-game" kutusunun içindeki SVG parçaları izlenir ve dolgu rengi
// paylaşılan bir ışık geçişine çevrilir. Bir kutuyu hariç tutmak için "ca-no3d" sınıfı.
// Yönetici: Oyun dünyası → Yıldızlar → "3D görünüm" kutusu (game_config.look3d).

const NS = 'http://www.w3.org/2000/svg';
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const SHAPES = 'path,circle,ellipse,rect,polygon';

let enabled = true;
let installed = false;
let defsEl = null;
const made = new Set();

const norm = (h) => {
  let x = h.trim().toLowerCase();
  if (x.length === 4) x = '#' + x[1] + x[1] + x[2] + x[2] + x[3] + x[3];
  return x;
};
const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixC = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
const lum = (h) => { const [r, g, b] = rgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

const ensureDefs = () => {
  if (defsEl && document.body.contains(defsEl)) return defsEl;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  // display:none KULLANMA: bazı tarayıcılar o zaman geçişleri çizmiyor
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  defsEl = document.createElementNS(NS, 'defs');
  svg.appendChild(defsEl);
  document.body.appendChild(svg);
  made.clear();
  return defsEl;
};

const stop = (parent, off, col) => {
  const s = document.createElementNS(NS, 'stop');
  s.setAttribute('offset', off);
  s.setAttribute('stop-color', col);
  parent.appendChild(s);
};

// Küçük / orta parçalar: yuvarlak ışık
const radialId = (c) => {
  const id = `ca3dr${c.slice(1)}`;
  if (made.has(id)) return id;
  const d = ensureDefs();
  const g = document.createElementNS(NS, 'radialGradient');
  g.setAttribute('id', id);
  g.setAttribute('cx', '38%'); g.setAttribute('cy', '30%'); g.setAttribute('r', '80%');
  g.setAttribute('fx', '30%'); g.setAttribute('fy', '22%');
  const L = lum(c);
  stop(g, '0%', mixC(c, '#ffffff', L > 0.8 ? 0.75 : 0.6));
  stop(g, '20%', mixC(c, '#ffffff', 0.22));
  stop(g, '55%', c);
  stop(g, '85%', mixC(c, '#000000', L < 0.15 ? 0.08 : 0.22));
  stop(g, '100%', mixC(c, '#000000', L < 0.15 ? 0.14 : 0.4));
  d.appendChild(g);
  made.add(id);
  return id;
};

// Büyük zeminler: yumuşak dikey ışık (üst açık, alt koyu)
const linearId = (c) => {
  const id = `ca3dl${c.slice(1)}`;
  if (made.has(id)) return id;
  const d = ensureDefs();
  const g = document.createElementNS(NS, 'linearGradient');
  g.setAttribute('id', id);
  g.setAttribute('x1', '0'); g.setAttribute('y1', '0'); g.setAttribute('x2', '0.25'); g.setAttribute('y2', '1');
  stop(g, '0%', mixC(c, '#ffffff', 0.22));
  stop(g, '55%', c);
  stop(g, '100%', mixC(c, '#000000', 0.16));
  d.appendChild(g);
  made.add(id);
  return id;
};

const viewSize = (svg) => {
  try {
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (vb && vb.width && vb.height) return [vb.width, vb.height];
    const r = svg.getBoundingClientRect();
    return [Math.max(1, r.width), Math.max(1, r.height)];
  } catch (_) { return null; }
};

// Gökyüzü / deniz / çimen gibi zeminler: çizimin neredeyse tüm enini kaplayan büyük parçalar
const isBig = (el) => {
  try {
    const svg = el.ownerSVGElement;
    if (!svg) return false;
    const vs = viewSize(svg);
    if (!vs) return false;
    const b = el.getBBox();
    return b.width >= vs[0] * 0.85 && b.width * b.height > vs[0] * vs[1] * 0.3;
  } catch (_) { return false; }
};

const skipEl = (el) => {
  if (!el.closest || !el.closest('.ca-game') || el.closest('.ca-no3d')) return true;
  if (el.closest('defs,clipPath,mask,pattern,symbol,marker')) return true;
  const op = el.getAttribute('opacity') || el.getAttribute('fill-opacity');
  if (op !== null && Number(op) < 0.99) return true;
  return false;
};

const shadeEl = (el) => {
  if (!enabled) return;
  const f = el.getAttribute('fill');
  if (!f || !HEX_RE.test(f.trim())) return;
  if (skipEl(el)) return;
  const c = norm(f);
  const L = lum(c);
  if (L > 0.97) return; // beyaz parıltı / göz akı
  if (L < 0.1 && (el.tagName === 'circle' || el.tagName === 'ellipse')) return; // göz bebeği
  const id = isBig(el) ? linearId(c) : radialId(c);
  el.setAttribute('data-f3', f);
  el.setAttribute('fill', `url(#${id})`);
};

const scan = (root) => {
  if (!enabled || !root || root.nodeType !== 1) return;
  if (root.matches && root.matches(SHAPES)) shadeEl(root);
  if (root.querySelectorAll) root.querySelectorAll(SHAPES).forEach(shadeEl);
};

const restoreAll = () => {
  document.querySelectorAll('[data-f3]').forEach(el => {
    el.setAttribute('fill', el.getAttribute('data-f3'));
    el.removeAttribute('data-f3');
  });
};

/** Uygulama açılışında bir kez çağrılır. */
export const installLook3D = () => {
  if (installed || typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;
  installed = true;
  const obs = new MutationObserver((list) => {
    if (!enabled) return;
    for (const m of list) {
      if (m.type === 'childList') m.addedNodes.forEach(scan);
      else if (m.type === 'attributes') {
        const el = m.target;
        const v = el.getAttribute('fill') || '';
        if (v.startsWith('url(')) continue;
        el.removeAttribute('data-f3');
        shadeEl(el);
      }
    }
  });
  const start = () => {
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['fill'] });
    document.querySelectorAll('.ca-game').forEach(scan);
  };
  if (document.body) start(); else window.addEventListener('DOMContentLoaded', start, { once: true });
};

/** 3D görünümü aç / kapat (yönetici ayarı). */
export const setLook3D = (on) => {
  const next = on !== false;
  if (next === enabled) return;
  enabled = next;
  if (!enabled) restoreAll();
  else if (typeof document !== 'undefined') document.querySelectorAll('.ca-game').forEach(scan);
};
