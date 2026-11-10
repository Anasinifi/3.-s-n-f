import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, Loader2, Minimize, Maximize } from 'lucide-react';
import '../game/game.css';
import { Avatar } from '../game/Avatar';
import { Particles } from '../game/WorldMap';
import { IslandBase, Palm, Bush } from '../game/MapArt';
import { SKIN_TONES, STARTER_GAME, THUMB_VIEWS } from '../game/catalog';
import { getItemMap } from '../game/gameConfig';

// ============================================================================
// --- GRUP: GİRİŞ EKRANI (ŞİFRESİZ BAŞLA / ZATEN ÜYEYİM / YÖNETİCİ) ---
// ============================================================================
// * "Oyuna Başla": şifre yok. Çocuk adını yazar, görünüşünü seçer, kimliği oluşur.
// * "Devam et": bu telefonda daha önce oynayan çocuk kaldığı yerden devam eder.
// * "Zaten üyeyim": numara + şifre ile (premium öğrenciler ve başka telefondan gelenler).
//   Eski usul öğretmenin eklediği öğrenciler (şifresiz) sadece numarayla girer.
// * Yönetici: "zaten üyeyim" kutusuna e-posta yazınca şifre alanı açılır (eskisi gibi).
// * İLERİDE: Google ile giriş butonu buraya eklenecek (identity.js -> signInWithGoogle).

const FREE_HAIRS = ['hair_messy', 'hair_short', 'hair_long'];
const FREE_HAIR_COLORS = ['hc_n0', 'hc_n1', 'hc_n2', 'hc_n3'];

export function LoginView({ onLogin, onGuestCreate, onContinue, onMemberLogin, onEnterGame, savedChild, error, isProcessing, toggleFS, isFS, clearError }) {
  const [mode, setMode] = useState('home'); // home | new | look | card | member
  const [name, setName] = useState('');
  const [skin, setSkin] = useState(SKIN_TONES[1]);
  const [hair, setHair] = useState('hair_short');
  const [hairColor, setHairColor] = useState('hc_n1');
  const [created, setCreated] = useState(null);

  const [code, setCode] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const isAdminMode = code.includes('@');

  const itemMap = useMemo(() => getItemMap({}), []);
  const previewGame = { ...STARTER_GAME, skin, hairColor, equip: { ...STARTER_GAME.equip, hair } };

  useEffect(() => { clearError?.(); /* mod değişince eski hata silinsin */ }, [mode]); // eslint-disable-line

  const go = (m) => setMode(m);

  const create = async () => {
    const c = await onGuestCreate({ name: name.trim(), skin, hair, hairColor });
    if (c) { setCreated(c); setMode('card'); }
  };

  const submitMember = () => {
    if (isAdminMode) onLogin(code, pass);
    else onMemberLogin(code, pass);
  };

  const card = 'ca-pop w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 text-center relative';
  const bigBtn = 'w-full py-4 rounded-3xl text-2xl font-extrabold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2';

  return (
    <div className="ca-game fixed inset-0 z-[60] overflow-y-auto ca-scroll" style={{ background: 'linear-gradient(180deg,#7dd3fc 0%,#38bdf8 45%,#0ea5e9 70%,#0369a1 100%)' }}>
      <Particles kind="bubble" count={10} seed={5} />
      <svg className="absolute left-[-30px] bottom-[-10px] w-[220px] opacity-90 pointer-events-none" viewBox="-110 -110 220 160"><IslandBase seed={4} /><g transform="translate(-24 -6)"><Palm s={1.1} /></g><g transform="translate(30 -2)"><Bush s={0.8} flowers /></g></svg>
      <svg className="absolute right-[-40px] top-[8%] w-[180px] opacity-80 pointer-events-none" viewBox="-110 -110 220 160"><IslandBase seed={9} /><g transform="translate(10 -8)"><Palm s={0.9} flip /></g></svg>
      <div className="relative min-h-full flex flex-col items-center justify-center p-4 gap-4">
        <div className="text-center text-white drop-shadow-lg">
          <div className="text-4xl sm:text-5xl font-extrabold leading-none">Çocuk Akademi</div>
          <div className="text-lg font-bold opacity-90">ada ada macera ⭐</div>
        </div>

        {mode === 'home' && (
          <div className={card}>
            {savedChild ? (
              <>
                <div className="flex justify-center -mt-2"><Avatar game={{ ...STARTER_GAME, ...(savedChild.game || {}) }} itemMap={itemMap} size={110} bounce /></div>
                <div className="text-2xl font-extrabold text-slate-800 mt-1">tekrar hoş geldin, {savedChild.name}!</div>
                <button disabled={isProcessing} onClick={onContinue} className={`${bigBtn} mt-4 bg-gradient-to-b from-orange-400 to-orange-600 text-white`}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'devam et ▶'}
                </button>
                <button onClick={() => go('new')} className="mt-3 text-sm font-extrabold text-slate-400 hover:text-indigo-500">başka bir oyuncu olarak başla</button>
              </>
            ) : (
              <>
                <div className="text-6xl ca-bob">🧭</div>
                <div className="text-2xl font-extrabold text-slate-800 mt-1">maceraya hazır mısın?</div>
                <button onClick={() => go('new')} className={`${bigBtn} mt-5 bg-gradient-to-b from-orange-400 to-orange-600 text-white`}>oyuna başla ▶</button>
              </>
            )}
            <button onClick={() => go('member')} className="w-full mt-3 py-3 rounded-3xl text-lg font-extrabold bg-indigo-50 text-indigo-600 border-4 border-indigo-100 active:scale-95">🔑 zaten üyeyim</button>
            {error && <div className="mt-3 bg-red-50 text-red-500 p-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><AlertCircle size={16} /> {error}</div>}
          </div>
        )}

        {mode === 'new' && (
          <div className={card}>
            <button onClick={() => go('home')} className="absolute left-4 top-4 w-10 h-10 rounded-full bg-slate-100 font-extrabold text-slate-500">‹</button>
            <div className="text-5xl">👋</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">senin adın ne?</div>
            <input autoFocus value={name} maxLength={24} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && name.trim() && go('look')}
              placeholder="adını yaz" className="mt-4 w-full p-4 text-2xl text-center bg-slate-50 border-4 border-slate-100 rounded-3xl font-extrabold outline-none focus:border-orange-400 text-slate-700" />
            <button disabled={!name.trim()} onClick={() => go('look')} className={`${bigBtn} mt-4 bg-gradient-to-b from-orange-400 to-orange-600 text-white disabled:opacity-40`}>ileri ›</button>
          </div>
        )}

        {mode === 'look' && (
          <div className={card}>
            <button onClick={() => go('new')} className="absolute left-4 top-4 w-10 h-10 rounded-full bg-slate-100 font-extrabold text-slate-500">‹</button>
            <div className="text-xl font-extrabold text-slate-800">kendini seç, {name}!</div>
            <div className="flex justify-center h-[30vh] min-h-[180px]"><Avatar game={previewGame} itemMap={itemMap} fluid bounce /></div>
            <div className="text-sm font-extrabold text-slate-400 uppercase mt-1">ten rengi</div>
            <div className="flex justify-center gap-2 mt-1 flex-wrap">
              {SKIN_TONES.map(s => <button key={s} onClick={() => setSkin(s)} className={`w-12 h-12 rounded-full border-4 shadow ${skin === s ? 'border-indigo-500 scale-110' : 'border-white'}`} style={{ background: s }} />)}
            </div>
            <div className="text-sm font-extrabold text-slate-400 uppercase mt-3">saç</div>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {FREE_HAIRS.map(h => (
                <button key={h} onClick={() => setHair(h)} className={`aspect-square rounded-3xl border-4 bg-slate-50 overflow-hidden flex items-center justify-center ${hair === h ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100'}`}>
                  <Avatar game={{ ...previewGame, equip: { ...previewGame.equip, hair: h } }} itemMap={itemMap} fluid view={THUMB_VIEWS.hair} />
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-3 mt-3">
              {FREE_HAIR_COLORS.map(hc => <button key={hc} onClick={() => setHairColor(hc)} className={`w-12 h-12 rounded-full border-4 shadow ${hairColor === hc ? 'border-indigo-500 scale-110' : 'border-white'}`} style={{ background: itemMap.get(hc)?.render?.color }} />)}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-3">eski kıyafetlerle başlıyorsun 😄 yıldız topladıkça yenilerini alabilirsin!</div>
            <button disabled={isProcessing} onClick={create} className={`${bigBtn} mt-3 bg-gradient-to-b from-green-400 to-green-600 text-white`}>
              {isProcessing ? <Loader2 className="animate-spin" /> : 'maceraya başla! 🚀'}
            </button>
            {error && <div className="mt-3 bg-red-50 text-red-500 p-3 rounded-2xl font-bold text-sm">{error}</div>}
            {created === null && error && <div className="text-[11px] font-bold text-slate-400 mt-1">sorun sürerse yöneticine bu mesajı göster.</div>}
          </div>
        )}

        {mode === 'card' && created && (
          <div className={card}>
            <div className="text-5xl ca-starburst">🎉</div>
            <div className="text-2xl font-extrabold text-slate-800">kimliğin hazır!</div>
            <div className="mt-3 rounded-3xl p-4 text-left text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}>
              <div className="flex items-center gap-3">
                <div className="bg-white/25 rounded-2xl"><Avatar game={created.game} itemMap={itemMap} size={64} /></div>
                <div>
                  <div className="text-xs font-bold opacity-80 uppercase">oyuncu</div>
                  <div className="text-2xl font-extrabold leading-tight">{created.name}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-white/20 rounded-2xl p-2"><div className="text-[11px] font-bold opacity-80">numaran</div><div className="text-2xl font-extrabold tracking-widest">{created.childId}</div></div>
                <div className="bg-white/20 rounded-2xl p-2"><div className="text-[11px] font-bold opacity-80">şifren</div><div className="text-2xl font-extrabold tracking-widest">{created.pin}</div></div>
              </div>
            </div>
            {created.isLocal && <div className="text-xs font-bold text-amber-600 bg-amber-50 rounded-2xl p-2 mt-3">kaydın şimdilik bu telefonda tutuluyor. yönetici sunucu izinlerini açınca otomatik olarak sunucuya taşınacak.</div>}
            <div className="text-sm font-bold text-slate-500 mt-3">bu telefonda hep kaldığın yerden devam edersin. başka telefondan girmek için bu numarayı ve şifreyi bir büyüğüne yazdır.</div>
            <button onClick={onEnterGame} className={`${bigBtn} mt-4 bg-gradient-to-b from-orange-400 to-orange-600 text-white`}>haritaya git 🗺️</button>
          </div>
        )}

        {mode === 'member' && (
          <div className={card}>
            <button onClick={() => go('home')} className="absolute left-4 top-4 w-10 h-10 rounded-full bg-slate-100 font-extrabold text-slate-500">‹</button>
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center border-4 ${isAdminMode ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-amber-50 border-amber-100 text-amber-500'}`}>
              {isAdminMode ? <ShieldCheck size={40} /> : <span className="text-4xl">🔑</span>}
            </div>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">{isAdminMode ? 'yönetici girişi' : 'zaten üyeyim'}</div>
            <div className="space-y-3 mt-4">
              <input value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitMember()} inputMode={isAdminMode ? 'email' : 'text'}
                placeholder="oyuncu numaran ya da adın" className="w-full p-4 text-xl text-center bg-slate-50 border-4 border-slate-100 rounded-3xl font-extrabold outline-none focus:border-indigo-400 text-slate-700" />
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitMember()}
                  placeholder={isAdminMode ? 'yönetici şifresi' : 'şifren'} inputMode={isAdminMode ? 'text' : 'numeric'}
                  className="w-full p-4 pl-12 text-xl text-center bg-slate-50 border-4 border-slate-100 rounded-3xl font-extrabold outline-none focus:border-indigo-400 text-slate-700" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPass ? <Eye size={20} /> : <EyeOff size={20} />}</button>
              </div>
              {error && <div className="bg-red-50 text-red-500 p-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><AlertCircle size={16} /> {error}</div>}
              <button disabled={isProcessing} onClick={submitMember} className={`${bigBtn} text-white ${isAdminMode ? 'bg-indigo-600' : 'bg-gradient-to-b from-indigo-400 to-indigo-600'}`}>
                {isProcessing ? <Loader2 className="animate-spin" /> : (isAdminMode ? 'güvenli giriş' : 'giriş yap')}
              </button>
              <div className="text-xs font-bold text-slate-400">numaranı unuttuysan adını ve şifreni yazabilirsin · premium üyeler reklamsız oynar 👑</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button onClick={toggleFS} className="flex items-center gap-1.5 text-white/80 font-bold text-xs uppercase hover:text-white">
            {isFS ? <Minimize size={14} /> : <Maximize size={14} />} {isFS ? 'tam ekranı kapat' : 'tam ekran'}
          </button>
          {mode !== 'member' && <button onClick={() => { setCode(''); go('member'); }} className="text-white/60 font-bold text-xs uppercase hover:text-white">yönetici</button>}
        </div>
      </div>
    </div>
  );
}
