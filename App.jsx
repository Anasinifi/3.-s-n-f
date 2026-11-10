import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ShieldCheck, LogOut, School, Globe, AlertTriangle } from 'lucide-react';
import { auth, db, FIREBASE_READY } from './firebase';
import { isAdminEmail, ANA_APP_ID, DENEME_APP_ID } from './adminConfig';
import AnaAdminApp from './ana/AnaAdminApp';
import DenemeAdminApp from './deneme/DenemeAdminApp';
import { OptionTrimTool } from './shared/OptionTrimTool';

// ============================================================================
// --- ÇOCUK AKADEMİ · BİRLEŞİK UYGULAMA (öğrenci + yönetici) ---
// ============================================================================
// Tek uygulama, tek adres:
//   • Öğrenci / veli: giriş ekranına ÖĞRENCİ NUMARASI yazar -> testleri çözer.
//   • Öğretmen: giriş ekranındaki "öğretmen girişi" düğmesi -> sadece şifre (1234) -> yönetici paneli.
//     Yönetici girişinden sonra üstte iki sekme: 🏫 Sınıfım (sorular, bankalar, testler) ve 🎮 Deneme.
// Eski "ana-proje" (öğrenci) ve "yonetici-proje" (yönetici) burada birleşti.

const TABS = [
  { id: 'ana', label: 'Sınıfım', sub: 'sorular · testler · öğrenciler', icon: School, color: 'indigo', appId: ANA_APP_ID },
  { id: 'deneme', label: 'Deneme', sub: 'çocuk oyunu (apk)', icon: Globe, color: 'fuchsia', appId: DENEME_APP_ID }
];

const readTab = () => { try { return localStorage.getItem('admin_active_tab') || 'ana'; } catch (_) { return 'ana'; } };

function SetupNotice() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-amber-50 p-4">
      <div className="max-w-lg bg-white p-6 rounded-3xl shadow-xl border-b-8 border-amber-200 space-y-3 text-slate-700">
        <div className="flex items-center gap-2 text-amber-600 font-black text-xl"><AlertTriangle /> firebase anahtarları eksik</div>
        <p className="font-bold text-sm">src/firebase.js dosyasında apiKey, authDomain, projectId ve storageBucket değerlerini yeni Firebase projenizden kopyalayıp yapıştırın.</p>
        <p className="text-xs text-slate-500">Firebase Console → Proje ayarları → Uygulamalarınız → Web uygulaması → Config.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const [tab, setTab] = useState(readTab);
  const [mounted, setMounted] = useState(() => ({ [readTab()]: true }));
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => (FIREBASE_READY ? onAuthStateChanged(auth, (u) => setUser(u || null)) : undefined), []);

  if (!FIREBASE_READY) return <SetupNotice />;

  const isAdmin = Boolean(user && !user.isAnonymous && isAdminEmail(user.email));

  // Öğrenci (ya da henüz giriş yapılmamış): sadece uygulamanın kendisi
  if (!isAdmin) return <AnaAdminApp key="ogrenci" />;

  const go = (id) => {
    setTab(id);
    setMounted(m => ({ ...m, [id]: true }));
    try { localStorage.setItem('admin_active_tab', id); } catch (_) {}
    window.scrollTo({ top: 0 });
  };
  const active = TABS.find(t => t.id === tab) || TABS[0];

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC]">
      {/* --- ÜST: YÖNETİCİ SEKMELERİ --- */}
      <div className="bg-slate-900 text-white px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <ShieldCheck size={20} className="text-indigo-300" />
          <span className="font-black tracking-tight">çocuk akademi · yönetim</span>
        </div>
        <div className="flex gap-1.5 flex-1 min-w-[260px]">
          {TABS.map(t => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => go(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-black text-sm transition-all ${on ? (t.color === 'indigo' ? 'bg-indigo-500 text-white shadow' : 'bg-fuchsia-500 text-white shadow') : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                <Icon size={18} />
                <span>{t.label}</span>
                <span className={`hidden md:inline text-[10px] font-bold ${on ? 'text-white/80' : 'text-white/40'}`}>{t.sub}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => setToolsOpen(o => !o)} className={`px-3 py-2 rounded-xl text-xs font-black ${toolsOpen ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>bakım</button>
        <span className="hidden lg:inline text-[11px] text-white/50 font-bold">{user.email}</span>
        <button onClick={() => signOut(auth)} className="bg-red-500/90 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1"><LogOut size={14} /> çıkış</button>
      </div>

      {toolsOpen && (
        <div className="max-w-4xl mx-auto p-3">
          <OptionTrimTool db={db} appId={active.appId} label={active.label} />
        </div>
      )}

      {/* --- PANELLER: ilk açılışta yüklenir, sekme değişince durumu korunur --- */}
      <div style={{ display: tab === 'ana' ? 'block' : 'none' }}>{mounted.ana && <AnaAdminApp key="yonetici" />}</div>
      <div style={{ display: tab === 'deneme' ? 'block' : 'none' }}>{mounted.deneme && <DenemeAdminApp />}</div>

      <button onClick={() => go(tab === 'ana' ? 'deneme' : 'ana')}
        className="fixed bottom-3 right-3 z-[9000] bg-slate-900 text-white text-xs font-black px-3 py-2 rounded-full shadow-lg border-2 border-white/20 hover:bg-slate-800"
        title="diğer panele geç">
        ⇄ {tab === 'ana' ? 'Deneme' : 'Sınıfım'}
      </button>
    </div>
  );
}
