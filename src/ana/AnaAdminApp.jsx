// ============================================================================
// YÖNETİCİ PROJESİ › SINIFIM YÖNETİCİ PANELİ
// ============================================================================
// Bu dosya eski projedeki App.jsx'in yönetici hâlidir. Yönetici uygulamasının
// kabuğu (src/App.jsx) sekme olarak gösterir. Firebase bağlantısı ortaktır
// (src/firebase.js); veri alanı bu klasördeki constants.js içindeki appId'dir.
import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocsFromServer, getDocsFromCache, getDocFromServer, getDocFromCache, query, where, onSnapshot, doc, updateDoc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { Loader2, Minimize, Maximize, ShieldCheck, Play, LogOut, Star } from 'lucide-react';
import { getDocsCacheFirst, getDocCacheFirst } from './utils/firebaseCache';
import { appId } from './constants';
import { isAdminEmail, ADMIN_LOGIN_EMAIL, pinToPassword } from '../adminConfig';
import { LoginView } from './components/LoginView';
import { QuizView } from './components/QuizView';
import { TestResult } from './components/TestResult';
import { AdminView } from './components/admin/AdminView';
import { QuestionModal } from './components/QuestionModal';
import { QuestionPreviewEditor } from './components/admin/QuestionPreviewEditor';
import { QuestionContentEditorModal } from './components/admin/QuestionContentEditorModal';
import { calculateStudentStars } from './utils/studentStats';
import { runPublishScheduleIfDue } from './utils/publishScheduler';
import { commitOpsInChunks } from './utils/firestoreBatch';
// --- SINIFIM ÖĞRENCİ EKRANI (dünyalar + ödevler): öğrenci uygulamasının aynısı ---
import { StudentGame } from '../deneme/game/StudentGame';
import { loadGameConfig, getCachedGameConfig, testChannel } from '../deneme/game/gameConfig';
import { setFxConfig } from '../deneme/game/fx';
import { GameCelebration, makeStartInfo, prepareTest, buildCelebration } from '../deneme/game/GameSession';
import { installLook3D, setLook3D } from '../deneme/game/look3d';

// ============================================================================
// --- GRUP: ANA UYGULAMA BİLEŞENİ (APP) - STATELER, HOOKLAR VE FONKSİYONLAR ---
// ============================================================================
export default function AnaAdminApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [currentChild, setCurrentChild] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const [inspectData, setInspectData] = useState(null);

  const [previewEditorQuestion, setPreviewEditorQuestion] = useState(null);
  const [contentEditorQuestion, setContentEditorQuestion] = useState(null);
  const [editorContextList, setEditorContextList] = useState([]);
  const [previewBulkFolderId, setPreviewBulkFolderId] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [welcomePlayed, setWelcomePlayed] = useState(false);

  // --- ÖĞRENCİ EKRANINI GÖRME (önizleme) ---
  // Öğrencinin gördüğü ekranın aynısı açılır. Hiçbir şey kaydedilmez:
  // cevaplar sadece bu cihazda tutulur, öğrencinin yıldızı ve karakteri değişmez.
  const [previewMode, setPreviewMode] = useState(null); // null | { includeUnpublished, real }
  const [previewResponses, setPreviewResponses] = useState([]);
  const [gameConfig, setGameConfig] = useState(() => getCachedGameConfig(appId));
  const [testStartInfo, setTestStartInfo] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [gorevOpen, setGorevOpen] = useState(false);
  useEffect(() => { setFxConfig(gameConfig); }, [gameConfig]);
  useEffect(() => { installLook3D(); }, []);
  useEffect(() => { setLook3D(gameConfig?.look3d !== false); }, [gameConfig]);
  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    loadGameConfig(db, appId, { serverFirst: true, kind: 'ana' }).then(c => { if (!cancelled) setGameConfig(c); });
    return () => { cancelled = true; };
  }, [user]);

  const [defaultStyle, setDefaultStyle] = useState({ qScale: 1, textScale: 1, boxScale: 1, imgScale: 1, qContainerScale: 1, qColor: '#1e293b', optColor: '#334155', optImgScale: 1 });

  const [appSettings, setAppSettings] = useState({
    welcomeAudio: "",
    welcomeAutoPlay: false,
    successAudio: "",
    failureAudio: "",
    correctSound: "",
    wrongSound: "",
    last10SecondsSound: ""
  });

  const [children, setChildren] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [responses, setResponses] = useState([]);
  const [folders, setFolders] = useState([]);

  const [loginError, setLoginError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [statsViewMode, setStatsViewMode] = useState('tests_list');
  const [statsSelectedTest, setStatsSelectedTest] = useState(null);
  const [statsSelectedStudent, setStatsSelectedStudent] = useState(null);

  const [adminResponsesFetched, setAdminResponsesFetched] = useState(false);
  const [adminTestsFetched, setAdminTestsFetched] = useState(false);
  const [adminChildrenFetched, setAdminChildrenFetched] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = "google";
    meta.content = "notranslate";
    document.head.appendChild(meta);

    const htmlTag = document.documentElement;
    htmlTag.setAttribute("translate", "no");
    htmlTag.classList.add("notranslate");

    return () => {
      if (document.head.contains(meta)) {
        document.head.removeChild(meta);
      }
    };
  }, []);

  useEffect(() => {
    const syncFS = () => {
      const fsActive = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      if (fsActive) setIsFullscreen(true);
    };
    document.addEventListener('fullscreenchange', syncFS);
    document.addEventListener('webkitfullscreenchange', syncFS);
    return () => {
      document.removeEventListener('fullscreenchange', syncFS);
      document.removeEventListener('webkitfullscreenchange', syncFS);
    };
  }, []);

  useEffect(() => {
    let backPressCount = 0;
    const handlePopState = (event) => {
      if (view === 'quiz' && activeTest) {
        window.history.pushState(null, null, window.location.href);
        alert("testten çıkmak için lütfen yukarıdaki 'x' butonunu kullanın.");
         return;
      }
      if (view === 'studentHome' || view === 'login') {
           if (backPressCount === 0) {
             window.history.pushState(null, null, window.location.href);
             backPressCount++;
             setTimeout(() => { backPressCount = 0; }, 2000);
           }
      }
    };
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [view, activeTest]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
        if (u) {
            if (!u.isAnonymous && u.email) {
              // birleşik uygulama: e-posta ile giren yalnızca yönetici listesindeyse yönetici olur
              if (!isAdminEmail(u.email)) { setLoginError('bu hesap yönetici olarak tanımlı değil.'); signOut(auth); return; }
              setIsAdmin(true);
              setView('admin');
            }
        } else {
          setView('login');
          setIsAdmin(false);
          setCurrentChild(null);
        }
    });
    return () => unsubscribe();
  }, []);

  const fetchAdminBasicData = async () => {
    try {
      setQuestions([]);
    } catch (e) { console.error("admin veri cekme hatasi", e); }
  };

  const fetchAdminTests = async () => {
      if (adminTestsFetched) return;
      try {
          // Testler başka cihazdan (ör. diğer sitede) eklenmiş olabilir: önbellek değil SUNUCU esas alınır
          const testsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tests');
          let tSnap;
          try { tSnap = await getDocsFromServer(testsRef); } catch (_) { tSnap = await getDocsCacheFirst(testsRef); }
          setTests(tSnap.docs.map(d => ({...d.data(), id: d.id})).sort((a,b) => (a.order||0) - (b.order||0)));
          setAdminTestsFetched(true);
      } catch (e) { console.error("test cekme hatasi", e); }
  };

  const fetchAdminChildren = async () => {
      if (adminChildrenFetched) return;
      try {
          const cSnap = await getDocsCacheFirst(collection(db, 'artifacts', appId, 'public', 'data', 'children'));
          setChildren(cSnap.docs.map(d => ({...d.data(), id: d.id})));
          setAdminChildrenFetched(true);
      } catch (e) { console.error("ogrenci cekme hatasi", e); }
  };

  const fetchAdminResponses = async () => {
      if (adminResponsesFetched) return;
      try {
          const rSnap = await getDocsCacheFirst(collection(db, 'artifacts', appId, 'public', 'data', 'responses'));
          setResponses(rSnap.docs.map(d => ({...d.data(), id: d.id})));
          setAdminResponsesFetched(true);
      } catch (e) { console.error("yanit cekme hatasi", e); }
  };

  const fetchStatsFromServer = async () => {
      try {
        const rSnap = await getDocsFromServer(collection(db, 'artifacts', appId, 'public', 'data', 'responses'));
        setResponses(rSnap.docs.map(d => ({...d.data(), id: d.id})));
        setAdminResponsesFetched(true);

        const tSnap = await getDocsFromServer(collection(db, 'artifacts', appId, 'public', 'data', 'tests'));
        setTests(tSnap.docs.map(d => ({...d.data(), id: d.id})).sort((a,b) => (a.order||0) - (b.order||0)));
        setAdminTestsFetched(true);

        const cSnap = await getDocsFromServer(collection(db, 'artifacts', appId, 'public', 'data', 'children'));
        setChildren(cSnap.docs.map(d => ({...d.data(), id: d.id})));
        setAdminChildrenFetched(true);
      } catch (e) {
        console.error("sunucudan analiz verileri cekilemedi", e);
      }
  };

  // Öğrenci verisi: ÖNCE sunucudan (güncel test içerikleri için), olmazsa önbellekten
  const serverFirst = async (q) => {
    try { return await getDocsFromServer(q); } catch (_) { return await getDocsCacheFirst(q); }
  };

  const fetchStudentData = async (childId) => {
    try {
      const tSnap = await serverFirst(query(collection(db, 'artifacts', appId, 'public', 'data', 'tests'), where('isPublished', '==', true)));
      const fetchedTests = tSnap.docs.map(d => ({...d.data(), id: d.id})).sort((a,b) => (a.order||0) - (b.order||0));
      setTests(fetchedTests);

      const rQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'responses'), where('childId', '==', childId));
      const rSnap = await serverFirst(rQuery);
      setResponses(rSnap.docs.map(d => ({...d.data(), id: d.id})));
    } catch (e) { console.error("ogrenci verisi hatasi", e); }
  };

  const fetchStudentDataFromServer = async (childId) => {
    try {
        const tSnap = await getDocsFromServer(query(collection(db, 'artifacts', appId, 'public', 'data', 'tests'), where('isPublished', '==', true)));
        const fetchedTests = tSnap.docs.map(d => ({...d.data(), id: d.id})).sort((a,b) => (a.order||0) - (b.order||0));
        setTests(fetchedTests);

        const rSnap = await getDocsFromServer(query(collection(db, 'artifacts', appId, 'public', 'data', 'responses'), where('childId', '==', childId)));
        setResponses(rSnap.docs.map(d => ({...d.data(), id: d.id})));
    } catch (e) { console.error("ogrenci sunucu verisi hatasi", e); }
  };

  // Testin TÜM sorularını eksiksiz getirir. Sonuç: { ok, missingIds, deletedIds }
  //  - Önce sunucudan (3 deneme), olmazsa önbellekten tamamlamaya çalışır.
  //  - Sunucuda gerçekten silinmiş sorular "deletedIds" olarak döner (test bunlarsız çözülür).
  //  - Ağ hatası yüzünden eksik kalan soru varsa ok=false döner ve test BAŞLATILMAZ.
  //    (Eskiden eksik sorular sessizce atlanıyor, çocuk 10 yerine 9 soru görüyordu.)
  // Aynı test için az önce başlamış yükleme varsa onu kullan (test kartına dokununca önceden yüklenir)
  const fetchMemoRef = useRef(new Map());
  const fetchTestQuestionsOnDemand = (inputTest) => {
    const key = inputTest?.id;
    const memo = key ? fetchMemoRef.current.get(key) : null;
    if (memo && Date.now() - memo.at < 60000) return memo.p;
    const p = loadTestQuestionsNow(inputTest);
    if (key) {
      fetchMemoRef.current.set(key, { at: Date.now(), p });
      p.then(r => { if (!r || r.ok === false) fetchMemoRef.current.delete(key); }, () => fetchMemoRef.current.delete(key));
    }
    return p;
  };
  // Testin TÜM sorularını eksiksiz getirir (hızlı: test belgesi ve soru grupları AYNI ANDA istenir)
  const loadTestQuestionsNow = async (inputTest) => {
    let test = inputTest;
    const found = new Map();
    const qCol = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
    const chunksOf = (arr) => { const out = []; for (let i = 0; i < arr.length; i += 30) out.push(arr.slice(i, i + 30)); return out; };
    const fetchChunk = async (chunk) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const snap = await getDocsFromServer(query(qCol, where('__name__', 'in', chunk)));
          snap.docs.forEach(d => found.set(d.id, { ...d.data(), id: d.id }));
          return;
        } catch (_) {
          await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
        }
      }
      try {
        const cacheSnap = await getDocsFromCache(query(qCol, where('__name__', 'in', chunk)));
        cacheSnap.docs.forEach(d => found.set(d.id, { ...d.data(), id: d.id }));
      } catch (_) {}
    };
    const ids0 = Array.from(new Set(inputTest?.questionIds || []));
    // Testin en güncel hâli (öğretmen soru eklediyse eski liste kullanılmasın) + bilinen sorular: paralel
    const testP = (async () => {
      if (!test?.id) return;
      try {
        const tSnap = await getDocFromServer(doc(db, 'artifacts', appId, 'public', 'data', 'tests', test.id));
        if (tSnap.exists()) {
          test = { ...test, ...tSnap.data(), id: test.id };
          setTests(prev => prev.map(t => t.id === test.id ? { ...t, ...test } : t));
        }
      } catch (_) {}
    })();
    await Promise.all([testP, ...chunksOf(ids0).map(fetchChunk)]);
    if (!test || !test.questionIds || test.questionIds.length === 0) return { ok: true, missingIds: [], deletedIds: [], test };
    const ids = Array.from(new Set(test.questionIds));
    // test güncellenmiş ve yeni soru eklenmişse sadece onları getir
    const extra = ids.filter(x => !found.has(x) && !ids0.includes(x));
    if (extra.length) await Promise.all(chunksOf(extra).map(fetchChunk));

    // Eksik kalanları kontrol et (aynı anda): silinmiş mi, yoksa ağ sorunu mu?
    const deletedIds = [];
    const missingIds = [];
    await Promise.all(ids.filter(x => !found.has(x)).map(async (id) => {
      const ref = doc(qCol, id);
      try {
        const snap = await getDocFromServer(ref);
        if (snap.exists()) found.set(id, { ...snap.data(), id });
        else deletedIds.push(id);
      } catch (_) {
        try {
          const cSnap = await getDocFromCache(ref);
          if (cSnap.exists()) found.set(id, { ...cSnap.data(), id });
          else missingIds.push(id);
        } catch (__) { missingIds.push(id); }
      }
    }));

    // İlk soruların resim ve seslerini arka planda önden indir (soru ekranı beklemeden açılsın)
    try {
      ids.slice(0, 4).map(id => found.get(id)).filter(Boolean).forEach(q => {
        [q.image, ...(q.options || []).map(o => o && o.image)].filter(u => u && /^https?:/.test(u)).forEach(u => { const im = new Image(); im.src = u; });
        [q.audio, q.storyAudio, q.storyIntroAudio, ...(q.options || []).map(o => o && o.audio)].filter(u => u && /^https?:/.test(u)).forEach(u => { const a = new Audio(); a.preload = 'auto'; a.src = u.split('#')[0]; });
      });
    } catch (_) {}

    const fetched = Array.from(found.values());
    setQuestions(prev => {
        const map = new Map(prev.map(p => [p.id, p]));
        fetched.forEach(nq => map.set(nq.id, nq));
        return Array.from(map.values());
    });
    if (missingIds.length > 0) console.error("bazı sorular yüklenemedi:", missingIds);
    return { ok: missingIds.length === 0 && fetched.length > 0, missingIds, deletedIds, test };
  };

  // --- ZAMANLI YAYIN KONTROLÜ (uygulama açıkken 5 dakikada bir) ---
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const check = async () => {
      const published = await runPublishScheduleIfDue(db, appId);
      if (cancelled || published.length === 0) return;
      if (isAdmin) {
        setTests(prev => prev.map(t => published.includes(t.id) ? { ...t, isPublished: true, publishedBySchedule: true } : t));
      } else if (currentChild) {
        fetchStudentDataFromServer(currentChild.childId);
      }
    };
    check();
    const iv = setInterval(check, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [user, isAdmin, currentChild]);

  // --- KLASÖRDEKİ TÜM SORULARA GÖRÜNÜM AYARINI TOPLU UYGULAMA ---
  const handleBulkApplyStyle = async (folderIds, styleSubset, onProgress, extra = null) => {
    const qCol = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
    const targets = [];
    for (let i = 0; i < folderIds.length; i += 30) {
      const chunk = folderIds.slice(i, i + 30);
      const snap = await getDocsFromServer(query(qCol, where('folderId', 'in', chunk)));
      snap.docs.forEach(d => targets.push({ ...d.data(), id: d.id }));
    }
    if (targets.length === 0) return 0;
    const ops = targets.map(q => {
      const merged = { ...(q.style || {}), ...styleSubset };
      return { type: 'update', ref: doc(qCol, q.id), data: { style: merged, ...(extra || {}) } };
    });
    await commitOpsInChunks(db, ops, { onProgress });
    const byId = new Map(targets.map(q => [q.id, { ...q, style: { ...(q.style || {}), ...styleSubset }, ...(extra || {}) }]));
    setQuestions(prev => {
      const map = new Map(prev.map(p => [p.id, p]));
      byId.forEach((v, k) => map.set(k, { ...(map.get(k) || {}), ...v }));
      return Array.from(map.values());
    });
    return targets.length;
  };

  useEffect(() => {
      if (!user || isAdmin || !currentChild) return;
      const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'sync'), (docSnap) => {
          if (docSnap.exists()) {
              fetchStudentDataFromServer(currentChild.childId);
          }
      });
      return () => unsub();
  }, [user, isAdmin, currentChild]);

  useEffect(() => {
    if (!user) return;
    const settingsRef = (docName) => doc(db, 'artifacts', appId, 'public', 'data', 'settings', docName);

    if (isAdmin) {
        const unsubStyle = onSnapshot(settingsRef('default_style'), (docSnap) => {
          if (docSnap.exists()) setDefaultStyle(docSnap.data());
        });
        const unsubGlobal = onSnapshot(settingsRef('global_config'), (docSnap) => {
          if (docSnap.exists()) setAppSettings(docSnap.data());
        });
        const unsubFolders = onSnapshot(settingsRef('folder_structure'), (docSnap) => {
          if (docSnap.exists()) setFolders(docSnap.data().list || []);
          else setFolders([]);
        });
        fetchAdminBasicData();
        return () => { unsubStyle(); unsubGlobal(); unsubFolders(); };
    } else {
        const loadStudentSettings = async () => {
           const cachedStyle = localStorage.getItem('app_default_style');
           if (cachedStyle) setDefaultStyle(JSON.parse(cachedStyle));

           const cachedGlobal = localStorage.getItem('app_global_config');
           if (cachedGlobal) setAppSettings(JSON.parse(cachedGlobal));

           try {
              const styleSnap = await getDocCacheFirst(settingsRef('default_style'));
              if (styleSnap.exists()) {
                  setDefaultStyle(styleSnap.data());
                  localStorage.setItem('app_default_style', JSON.stringify(styleSnap.data()));
              }
              const globalSnap = await getDocCacheFirst(settingsRef('global_config'));
              if (globalSnap.exists()) {
                  setAppSettings(globalSnap.data());
                  localStorage.setItem('app_global_config', JSON.stringify(globalSnap.data()));
              }
           } catch(e) { console.error("ayarlar cekilemedi", e); }
        };
        loadStudentSettings();
    }
  }, [user, isAdmin]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    const isCurrentlyFS = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isCurrentlyFS) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    }
    setIsFullscreen(true);
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    const isCurrentlyFS = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFullscreen && !isCurrentlyFS) {
      if (elem.requestFullscreen) elem.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen && document.webkitFullscreenElement) document.webkitExitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLogin = async (input, password) => {
    setLoginError("");
    setIsProcessing(true);
    try {
      if (password) {
        // öğretmen girişi: sadece şifre (ör. 1234) -> arka plandaki tek yönetici hesabı
        const pw = pinToPassword(password);
        try {
          await signInWithEmailAndPassword(auth, ADMIN_LOGIN_EMAIL, pw);
        } catch (err) {
          const c = err?.code || '';
          if (c === 'auth/user-not-found' || c === 'auth/invalid-credential' || c === 'auth/invalid-login-credentials') {
            // ilk giriş: hesap yoksa bu şifreyle oluştur; hesap varsa şifre yanlıştır
            try { await createUserWithEmailAndPassword(auth, ADMIN_LOGIN_EMAIL, pw); }
            catch (e2) { setLoginError(e2?.code === 'auth/email-already-in-use' ? 'şifre yanlış.' : (e2?.code === 'auth/operation-not-allowed' ? "Firebase'de Email/Password girişi kapalı." : 'giriş yapılamadı.')); return; }
          } else if (c === 'auth/wrong-password') { setLoginError('şifre yanlış.'); return; }
          else if (c === 'auth/too-many-requests') { setLoginError('çok fazla deneme. biraz sonra tekrar deneyin.'); return; }
          else throw err;
        }
      } else {
        await signInAnonymously(auth);
        const childrenRef = collection(db, 'artifacts', appId, 'public', 'data', 'children');
        const q = query(childrenRef, where('childId', '==', input.trim()));
        const querySnapshot = await getDocsCacheFirst(q);
        if (!querySnapshot.empty) {
            const childData = { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id };
            setCurrentChild(childData);

            await fetchStudentData(childData.childId);

            setWelcomePlayed(false);
            setView('studentHome');
        } else {
            await signOut(auth);
            setLoginError("öğrenci numarası bulunamadı.");
        }
      }
    } catch (e) {
      console.error(e);
      setLoginError("giriş yapılamadı. internet bağlantınızı kontrol edin.");
      if (!password) await signOut(auth);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ÖĞRENCİ EKRANINI GÖR ---
  // child verilirse o öğrencinin ekranı (gerçek yıldızları ve ilerlemesiyle), verilmezse boş bir deneme öğrencisi.
  const startStudentPreview = async (child, { includeUnpublished = false } = {}) => {
    await fetchAdminTests();
    // sadece bu öğrencinin cevapları okunur (bütün sınıfın değil)
    if (child) {
      try {
        const rSnap = await getDocsFromServer(query(collection(db, 'artifacts', appId, 'public', 'data', 'responses'), where('childId', '==', child.childId)));
        const mine = rSnap.docs.map(d => ({ ...d.data(), id: d.id }));
        setResponses(prev => [...prev.filter(r => r.childId !== child.childId), ...mine]);
      } catch (e) { console.error('öğrencinin cevapları okunamadı', e); }
    }
    const base = child
      ? { ...child, isTest: true }
      : { id: '__admin_test', childId: '__ADMIN_TEST__', name: 'deneme öğrencisi', isTest: true, game: null, manualStars: 0 };
    setCurrentChild(base);
    setPreviewResponses([]);
    setPreviewMode({ includeUnpublished, real: !!child });
    setCelebration(null); setGorevOpen(false); setActiveTest(null); setTestStartInfo(null);
    setWelcomePlayed(false);
    enterFullscreen();
    setView('studentHome');
  };
  const exitStudentPreview = () => {
    setPreviewMode(null); setCelebration(null); setActiveTest(null); setTestStartInfo(null);
    setGorevOpen(false); setPreviewResponses([]); setCurrentChild(null);
    setView('admin');
  };

  // Önizlemede verilen cevaplar Firestore'a YAZILMAZ, sadece ekranda görünür
  const studentResponses = previewMode ? [...responses, ...previewResponses] : responses;
  const studentTests = previewMode?.includeUnpublished ? tests.map(t => ({ ...t, isPublished: true })) : tests;

  const startTest = (t, opts = {}) => {
    enterFullscreen();
    setTestStartInfo(makeStartInfo(currentChild, t, studentResponses, gameConfig, opts));
    setActiveTest({ ...prepareTest(t, currentChild, studentResponses, opts), isPreview: false });
    setView('quiz');
  };
  const finishTestWithCelebration = (res) => {
    setCelebration({ ...buildCelebration(res, activeTest, testStartInfo, gameConfig), at: Date.now() });
    setActiveTest(null); setTestStartInfo(null);
    setView('studentHome');
  };
  const reloadAndStart = async (t, opts) => {
    setCelebration(null);
    const r = await fetchTestQuestionsOnDemand(t);
    if (r && r.ok === false) { alert('sorular yüklenemedi, internet bağlantını kontrol et.'); return; }
    startTest((r && r.test) || t, opts);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('login');
    setCurrentChild(null);
    setIsAdmin(false);
    setActiveTest(null);
    setTestResult(null);
    setInspectData(null);
    setWelcomePlayed(false);
    setPreviewMode(null);
    setTestStartInfo(null);
    setCelebration(null);
    setGorevOpen(false);
  };

  const saveQuestionStyle = async (questionId, newStyle, saveAsDefault, extra = {}) => {
    try {
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', questionId), {
         style: newStyle,
         ...extra
       });
       setQuestions(prev => prev.map(q => q.id === questionId ? {...q, style: newStyle, ...extra} : q));

       if (saveAsDefault) {
         const styleToSave = { ...newStyle };
         delete styleToSave.letterColors;
         await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'default_style'), styleToSave);
       }
    } catch(e) {
      console.error("stil kaydedilemedi", e);
    }
  };

  const handleSaveQuestionContent = async (qId, data) => {
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', qId), {
              ...data,
              updatedAt: serverTimestamp()
          });
          setQuestions(prev => prev.map(q => q.id === qId ? {...q, ...data} : q));
      } catch (e) {
          console.error("soru guncellenemedi", e);
          alert("hata: soru güncellenemedi.");
      }
  };

// ============================================================================
// --- GRUP: ANA UYGULAMA BİLEŞENİ (APP) - RENDER (RETURN) KISMI ---
// ============================================================================
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

  return (
    <div
      translate="no"
      onContextMenu={(e) => view !== 'admin' && e.preventDefault()}
      onDragStart={(e) => view !== 'admin' && e.preventDefault()}
      className={`notranslate font-sans text-slate-900 text-left flex flex-col overflow-x-hidden transition-all duration-300 ${view !== 'admin' ? 'select-none' : ''} ${isFullscreen || view === 'quiz' ? 'fixed inset-0 z-[9999] bg-[#F8FAFC] w-screen h-screen' : 'min-h-[100dvh] bg-[#F8FAFC]'}`}
    >
      {view !== 'quiz' && (
        <button
          onClick={toggleFullscreen}
          className="fixed bottom-3 left-3 z-[100000] w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-indigo-400 rounded-xl text-indigo-600 hover:bg-indigo-50 shadow-md flex items-center justify-center active:scale-90 transition-all"
          title={isFullscreen ? "küçült" : "tam ekran"}
        >
          {isFullscreen ? <Minimize size={14} strokeWidth={2.5}/> : <Maximize size={14} strokeWidth={2.5}/>}
        </button>
      )}

      {previewMode && view === 'studentHome' && (
        <div className="fixed bottom-3 right-3 z-[150001] flex items-center gap-2 bg-amber-400 text-amber-950 rounded-2xl pl-3 pr-2 py-1.5 shadow-2xl border-2 border-white">
          <span className="text-[11px] font-black leading-tight">öğrenci ekranı · önizleme<br /><span className="font-bold opacity-80">hiçbir şey kaydedilmiyor</span></span>
          <button onClick={exitStudentPreview} className="px-3 py-1.5 rounded-xl bg-white text-amber-700 text-xs font-black shadow active:scale-95">panele dön</button>
        </div>
      )}

      {view !== 'login' && view !== 'studentHome' && !activeTest && !testResult && !inspectData && !previewEditorQuestion && !contentEditorQuestion && (
        <header className="bg-white border-b px-4 py-3 sticky top-0 z-[50] flex justify-between items-center shadow-sm shrink-0 pr-20">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl text-white ${isAdmin ? 'bg-indigo-600' : 'bg-orange-500'}`}>{isAdmin ? <ShieldCheck size={20} /> : <Play size={20} />}</div>
            <span className="font-black text-lg tracking-tight text-slate-800 line-clamp-1 max-w-[150px] sm:max-w-none">{isAdmin ? 'yönetim paneli · sınıfım' : (currentChild?.name || 'öğrenci')}</span>
            {!isAdmin && currentChild && (
              <span className="ml-1 flex items-center gap-1 bg-yellow-50 border-2 border-yellow-300 text-yellow-700 rounded-full pl-1.5 pr-2.5 py-0.5 font-black text-base shadow-sm" title="yıldızların">
                <Star size={18} className="text-yellow-400 fill-yellow-400" /> {calculateStudentStars(currentChild, tests, responses)}
              </span>
            )}
          </div>
          <button onClick={handleLogout} className="bg-red-50 text-red-500 p-2 sm:px-4 sm:py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100 transition"><LogOut size={18} /> <span className="hidden sm:inline">çıkış</span></button>
       </header>
      )}

     {activeTest?.isPreview && (
        <div className="bg-amber-100 text-amber-800 text-center text-xs font-black py-1 sticky top-[60px] z-[49]">
          öni̇zleme modu - kaydedi̇lmi̇yor
        </div>
      )}

      <main className={`flex-1 w-full mx-auto flex flex-col justify-start ${isFullscreen || view === 'quiz' ? 'p-1.5 max-w-full' : 'p-3 sm:p-6 md:p-8 max-w-4xl'}`}>
        {view === 'login' && <LoginView onLogin={handleLogin} error={loginError} isProcessing={isProcessing} toggleFS={toggleFullscreen} isFS={isFullscreen} />}

        {view === 'studentHome' && currentChild && (
         <StudentGame
            db={db}
            appId={appId}
            child={currentChild}
            setChild={setCurrentChild}
            tests={studentTests}
            responses={studentResponses}
            cfg={gameConfig}
            settings={appSettings}
            onStartTest={startTest}
            paused={!!celebration}
            enterFullscreen={enterFullscreen}
            fetchQuestionsOnDemand={fetchTestQuestionsOnDemand}
            onLogout={previewMode ? exitStudentPreview : handleLogout}
            welcomePlayed={welcomePlayed}
            setWelcomePlayed={setWelcomePlayed}
            gorevOpen={gorevOpen}
            setGorevOpen={setGorevOpen}
            testMode={!!previewMode && !previewMode.real}
            unlockAll={!!previewMode}
         />
        )}

        {view === 'quiz' && activeTest && (
          <QuizView
            child={currentChild}
            test={activeTest}
            questions={questions}
            settings={appSettings}
            onComplete={(res) => {
              if (activeTest.isPreview) {
               setView('admin');
               setActiveTest(null);
              } else if (currentChild && testStartInfo) {
               finishTestWithCelebration(res);
              } else {
               setTestResult(res);
               setView('testResult');
              }
            }}
            saveResponse={(data) => {
              if (activeTest.isPreview) return;
              // önizleme: cevap Firestore'a yazılmaz, öğrencinin kaydı bozulmaz
              if (previewMode) { setPreviewResponses(prev => [...prev, { ...data, timestamp: null, id: `pv_${Date.now()}_${prev.length}` }]); return; }
              addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'responses'), data).then(docRef => {
                  setResponses(prev => [...prev, {...data, id: docRef.id}]);
              });
            }}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            exitQuiz={() => {
              const exitedTest = activeTest;
              const wasStudentTest = !activeTest?.isPreview && currentChild;
              setActiveTest(null); setTestStartInfo(null);
              setView(isAdmin && !previewMode && !currentChild ? 'admin' : 'studentHome');
              if (wasStudentTest) {
                const ch = testChannel(exitedTest, gameConfig);
                setCelebration({ kind: 'exit', test: exitedTest, at: Date.now(), data: { testName: ch === 'gorev' || gameConfig?.showIslandNames ? exitedTest?.name : '', channel: ch } });
              }
            }}
          />
        )}

        {view === 'testResult' && <TestResult result={testResult} settings={appSettings} onBack={() => { setTestResult(null); setActiveTest(null); setView(isAdmin ? 'admin' : 'studentHome'); }} />}

        {view === 'admin' && (
         <AdminView
            childrenList={children} setChildrenList={setChildren}
            questions={questions} setQuestions={setQuestions}
            tests={tests} setTests={setTests}
            responses={responses} setResponses={setResponses}
            folders={folders}
            appId={appId}
            onPreviewLoaded={(t) => { enterFullscreen(); setActiveTest({ ...t, isPreview: true }); setView('quiz'); }}
            onPreview={async (t) => { enterFullscreen(); const r = await fetchTestQuestionsOnDemand(t); if (r && r.ok === false) { alert("bazı sorular yüklenemedi, bağlantıyı kontrol edin."); } setActiveTest({...(r?.test || t), isPreview: true}); setView('quiz'); }}
            db={db}
            onOpenPreviewEditor={(q, list, opts) => { setPreviewBulkFolderId(opts?.bulkFolderId || null); setPreviewEditorQuestion(q); setEditorContextList(list); }}
            onOpenContentEditor={(q, list) => { setContentEditorQuestion(q); setEditorContextList(list); }}
            setPreviewEditorQuestion={setPreviewEditorQuestion}
            setContentEditorQuestion={setContentEditorQuestion}
            defaultStyle={defaultStyle}
            statsViewMode={statsViewMode}
            setStatsViewMode={setStatsViewMode}
            statsSelectedTest={statsSelectedTest}
            setStatsSelectedTest={setStatsSelectedTest}
            statsSelectedStudent={statsSelectedStudent}
            setStatsSelectedStudent={setStatsSelectedStudent}
            settings={appSettings}
            onInspect={(data) => setInspectData(data)}
            fetchAdminTests={fetchAdminTests}
            fetchAdminChildren={fetchAdminChildren}
            fetchAdminResponses={fetchAdminResponses}
            fetchStatsFromServer={fetchStatsFromServer}
            fetchTestQuestionsOnDemand={fetchTestQuestionsOnDemand}
            onViewAsStudent={startStudentPreview}
         />
        )}
      </main>

      {celebration && currentChild && view === 'studentHome' && (
        <GameCelebration
          celebration={celebration} cfg={gameConfig} child={currentChild} settings={appSettings} appKind="ana"
          onClose={() => setCelebration(null)}
          onFix={(t, wrongIds) => reloadAndStart(t, { fix: true, wrongIds })}
          onRetry={(t) => reloadAndStart(t)}
        />
      )}

      {inspectData && (
       <QuestionModal
        initialResultIndex={inspectData.index}
        results={inspectData.results}
        allQuestions={questions}
        onClose={() => setInspectData(null)}
       />
      )}

      {previewEditorQuestion && (
       <QuestionPreviewEditor
         q={previewEditorQuestion}
         allQuestions={questions}
         editorContextList={editorContextList}
         setQ={setPreviewEditorQuestion}
         onClose={() => { setPreviewEditorQuestion(null); setPreviewBulkFolderId(null); }}
         onSave={saveQuestionStyle}
         folders={folders}
         initialBulkFolderId={previewBulkFolderId}
         onBulkApply={handleBulkApplyStyle}
        />
      )}

      {contentEditorQuestion && (
          <QuestionContentEditorModal
             q={contentEditorQuestion}
             allQuestions={questions}
             editorContextList={editorContextList}
             setQ={setContentEditorQuestion}
             onClose={() => setContentEditorQuestion(null)}
             onSave={handleSaveQuestionContent}
            />
      )}
    </div>
  );
}
