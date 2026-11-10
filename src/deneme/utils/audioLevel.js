// ============================================================================
// --- SES DÜZEYİ DENGELEME ---
// ============================================================================
// Yüklenirken (yönetim paneli) ses dosyasının konuşma düzeyi ölçülür. Hedef düzeyden yüksekse
// dosya adresinin sonuna kısma oranı eklenir: ...mp3?alt=media&token=..#g=0.55
// "#" sonrası sunucuya gitmez; dosya değişmez. Çocuk uygulaması bu oranla çalar (audio.volume).
// Sessiz kayıtlar yükseltilmez (tarayıcı sesi 1'in üstüne çıkaramaz), sadece yüksekler kısılır.

const TARGET_DB = -20;   // hedef konuşma düzeyi (dBFS, sessiz kısımlar hariç ortalama)
const MIN_GAIN = 0.3;    // en fazla bu kadar kısılır

// Adresteki kısma oranı (yoksa 1)
export const volumeOf = (src) => {
  const m = /#g=([0-9.]+)/.exec(String(src || ''));
  const v = m ? parseFloat(m[1]) : 1;
  return Number.isFinite(v) ? Math.min(1, Math.max(0.05, v)) : 1;
};

// Kısma oranını adrese yaz (1'e çok yakınsa yazmaz)
export const withGain = (url, g) => {
  const base = String(url || '').split('#')[0];
  return g && g < 0.97 ? `${base}#g=${g.toFixed(2)}` : base;
};

// new Audio(src) yerine: kısma oranıyla
export const makeAudio = (src) => {
  const a = new Audio(src);
  try { a.volume = volumeOf(src); } catch (_) {}
  return a;
};

// Dosyanın konuşma düzeyini ölç -> kısma oranı (0.3 .. 1). Çözülemezse 1.
export const measureGain = async (file) => {
  try {
    if (typeof window === 'undefined') return 1;
    const buf = await file.arrayBuffer();
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    let audio;
    if (Ctx) {
      const ctx = new Ctx(1, 44100, 44100);
      audio = await new Promise((res, rej) => { const p = ctx.decodeAudioData(buf, res, rej); if (p && p.then) p.then(res, rej); });
    } else {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      audio = await ctx.decodeAudioData(buf);
      try { ctx.close(); } catch (_) {}
    }
    const ch = []; for (let c = 0; c < audio.numberOfChannels; c++) ch.push(audio.getChannelData(c));
    const win = Math.max(256, Math.round(audio.sampleRate * 0.05));
    const gate = Math.pow(10, -45 / 20);
    let sum = 0, n = 0;
    for (let i = 0; i + win <= ch[0].length; i += win) {
      let s = 0;
      for (let k = i; k < i + win; k++) { let v = 0; for (let c = 0; c < ch.length; c++) v += ch[c][k]; v /= ch.length; s += v * v; }
      const rms = Math.sqrt(s / win);
      if (rms > gate) { sum += s; n += win; }
    }
    if (!n) return 1;
    const db = 20 * Math.log10(Math.sqrt(sum / n));
    const g = Math.pow(10, (TARGET_DB - db) / 20);
    return Math.max(MIN_GAIN, Math.min(1, g));
  } catch (_) { return 1; }
};
