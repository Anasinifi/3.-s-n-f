// Eşleştirme sorusunun küçük önizleme resmi (yönetici listesi + soru bankası). Saf JS: içerik üreticileri de kullanır.
export const MATCH_COLORS = ['#6366f1', '#f97316', '#10b981', '#ec4899', '#0ea5e9', '#eab308'];
const COLORS = MATCH_COLORS;
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (s) => String(s || '').replace(/<\/?en>/gi, '').trim();

// Yönetici listesi için küçük resim: solda yazılar, sağda şıklar, aralarında doğru çizgiler
export const generateMatchSvgDataUrl = (grid, options = []) => {
  const left = grid?.left || [];
  const n = Math.max(left.length, options.length, 1);
  const rowH = 64, W = 320, H = n * rowH + 16;
  let s = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>`;
  left.forEach((l, i) => {
    const y = 8 + i * rowH;
    const col = COLORS[i % COLORS.length];
    s += `<rect x="10" y="${y + 6}" width="120" height="${rowH - 12}" rx="10" fill="#fff" stroke="${col}" stroke-width="3"/>`;
    const label = grid?.mode === 'audio-pic' ? '🔊' : clean(l.text);
    const fs = label.length > 14 ? 12 : label.length > 9 ? 15 : 18;
    s += `<text x="70" y="${y + rowH / 2}" font-size="${fs}" font-weight="800" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" fill="#1e293b">${esc(label)}</text>`;
    const ry = 8 + (l.ans ?? i) * rowH + rowH / 2;
    s += `<line x1="130" y1="${y + rowH / 2}" x2="210" y2="${ry}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;
  });
  options.forEach((o, j) => {
    const y = 8 + j * rowH;
    s += `<rect x="210" y="${y + 4}" width="100" height="${rowH - 8}" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>`;
    if (o?.image) s += `<image href="${esc(o.image)}" x="${232}" y="${y + 6}" width="${rowH - 12}" height="${rowH - 12}"/>`;
    else s += `<text x="260" y="${y + rowH / 2}" font-size="14" font-weight="800" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" fill="#1e293b">${esc(clean(o?.text))}</text>`;
  });
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${s}</svg>`)}`;
};

