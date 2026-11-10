import React, { useState } from 'react';
import { ShieldCheck, Atom, User, Lock, Eye, EyeOff, AlertCircle, Loader2, Minimize, Maximize } from 'lucide-react';

// ============================================================================
// --- GRUP: GİRİŞ EKRANI (LOGIN VIEW) ---
// ============================================================================
export function LoginView({ onLogin, error, isProcessing, toggleFS, isFS }) {
  const [val, setVal] = useState("");
  const [pass, setPass] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // öğretmen girişi: e-posta yok, sadece şifre (düğmeyle açılır)
  const handleSubmit = () => {
      if (isAdminMode) { if (pass.trim()) onLogin('', pass.trim()); return; }
      if (val.trim()) onLogin(val.trim(), null);
  };

  return (
    <div className="max-w-md mx-auto my-auto bg-white p-8 rounded-[2.5rem] shadow-xl border-b-8 border-indigo-100 text-center space-y-6 animate-in zoom-in">
      <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center border-4 shadow-sm transition-colors duration-300 ${isAdminMode ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-orange-50 border-orange-100 text-orange-500'}`}>
        {isAdminMode ? <ShieldCheck size={48} /> : <Atom size={48} strokeWidth={1.5} />}
      </div>

      <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800">{isAdminMode ? 'yönetici girişi' : 'hoş geldiniz'}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{isAdminMode ? 'güvenli alan' : 'öğrenci paneli'}</p>
      </div>

      <div className="space-y-4 relative">
        {!isAdminMode ? (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
            <input
               type="text"
               inputMode="numeric"
               value={val} onChange={e => setVal(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
               placeholder="öğrenci numarası"
               className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-slate-700"
            />
          </div>
        ) : (
          <div className="relative animate-in slide-in-from-top-2 fade-in">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
            <input
              autoFocus
              type={showPass ? "text" : "password"}
              inputMode="numeric"
              value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="öğretmen şifresi"
              className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-slate-700"
            />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
              {showPass ? <Eye size={20}/> : <EyeOff size={20}/>}
            </button>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><AlertCircle size={16}/> {error}</div>}

        <button disabled={isProcessing} onClick={handleSubmit} className={`w-full text-white font-black py-4 rounded-2xl text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${isAdminMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
         {isProcessing ? <Loader2 className="animate-spin"/> : (isAdminMode ? "giriş" : "başla")}
        </button>

        <button type="button" onClick={() => { setIsAdminMode(m => !m); setPass(''); }} className="flex items-center justify-center gap-1.5 w-full text-slate-400 font-bold text-xs uppercase hover:text-indigo-600">
            {isAdminMode ? <><User size={14}/> öğrenci girişine dön</> : <><ShieldCheck size={14}/> öğretmen girişi</>}
        </button>

        <button onClick={toggleFS} className="flex items-center justify-center gap-2 w-full text-slate-400 font-bold text-xs uppercase pt-2 hover:text-indigo-600">
            {isFS ? <Minimize size={16}/> : <Maximize size={16}/>} {isFS ? "tam ekranı kapat" : "tam ekran yap"}
        </button>
      </div>
    </div>
  );
}
