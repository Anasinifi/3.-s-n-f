import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './game.css';
import { WorldMap } from './WorldMap';
import { Studio } from './Studio';
import { GorevPanel } from './GorevPanel';
import { buildWorld, getWorldState, getStarBalance, getEarnedStars, getEarnedDiamonds, getDiamondBalance, computeBank, countBankDone, getDisplayStatus, isGorevTest } from './progress';
import { getAllItems, getItemMap, normalizeGame } from './gameConfig';
import { saveChildGame, saveChildToDevice, saveGameLocal } from './identity';
import { maybeShowAd } from './ads';
import { sfx, setBgMusic, stopBgMusic, isMusicOff, setMusicOff } from './fx';
import { GamesHub, GamesTab } from './MiniGames';

// ============================================================================
// --- GRUP: ÖĞRENCİ OYUN EKRANI (HARİTA + ÖDEVLER + KARAKTER/EV STÜDYOSU) ---
// ============================================================================
// * Harita: "harita" kanalındaki testler ada ada.
// * Sol taraftaki ÖDEV sekmesi: "ödev" kanalındaki testler (eski liste görünümü, renkli).
// * Yıldız: puan (öğretmen görür). Elmas: market parası (karakter, ev, araba eşyaları).
export function StudentGame({ db, appId, child, setChild, tests, responses, cfg, settings, onStartTest, fetchQuestionsOnDemand, enterFullscreen, onLogout, welcomePlayed, setWelcomePlayed, paused = false, testMode = false, unlockAll = false, onResetTest = null, gorevOpen: gorevOpenProp, setGorevOpen: setGorevOpenProp }) {
  const [game, setGameState] = useState(() => normalizeGame(child?.game));
  const [studio, setStudio] = useState(null); // null | 'character' | 'house' | 'car'
  const [loadingTestId, setLoadingTestId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [gorevOpenLocal, setGorevOpenLocal] = useState(false);
  const gorevOpen = gorevOpenProp !== undefined ? gorevOpenProp : gorevOpenLocal;
  const setGorevOpen = setGorevOpenProp || setGorevOpenLocal;
  const [notice, setNotice] = useState('');
  const saveTimer = useRef(null);
  const pending = useRef(null);
  const childRef = useRef(child);
  childRef.current = child;
  const kind = cfg?.appKind || 'deneme';

  useEffect(() => { setGameState(normalizeGame(child?.game)); }, [child?.id]);

  const items = useMemo(() => getAllItems(cfg), [cfg]);
  const itemMap = useMemo(() => getItemMap(cfg), [cfg]);

  const flush = useCallback(async () => {
    if (!pending.current) return;
    const g = pending.current;
    pending.current = null;
    try { await saveChildGame(db, appId, childRef.current, g); } catch (e) { console.error('oyun kaydedilemedi', e); }
  }, [db, appId]);

  useEffect(() => () => { clearTimeout(saveTimer.current); flush(); }, [flush]);

  const gameRef = useRef(game);
  gameRef.current = game;

  const setGame = useCallback((updater) => {
    const prev = gameRef.current;
    const next0 = typeof updater === 'function' ? updater(prev) : updater;
    const next = { ...next0, ts: Date.now() };
    gameRef.current = next;
    setGameState(next);
    pending.current = next;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 900);
    const updatedChild = { ...childRef.current, game: next };
    childRef.current = updatedChild;
    saveChildToDevice(updatedChild);
    saveGameLocal(updatedChild);
    setChild?.(updatedChild);
  }, [flush, setChild]);

  // --- KAZANÇ KASASI: test silinse / yayından kalksa da yıldız ve elmas kaybolmaz ---
  const bankInfo = useMemo(() => computeBank({ ...child, game }, tests, responses, cfg), [child, game, tests, responses, cfg]);
  const childWithGame = useMemo(() => ({ ...child, game: { ...game, bank: bankInfo.bank } }), [child, game, bankInfo]);
  const stars = getEarnedStars(childWithGame, tests, responses, cfg);
  // --- YÖNETİCİ ÖZETİ: yıldız, elmas ve biten harita/ödev testi sayısı oyun kaydına yazılır
  // (yönetici cevapları okumak zorunda kalmaz) ---
  const sumStars = Math.max(0, stars - (Number(child?.manualStars) || 0));
  const sumDia = Math.max(0, getEarnedDiamonds(childWithGame, tests, responses, cfg) - (Number(child?.manualDiamonds) || 0));
  const doneCounts = countBankDone(bankInfo.bank);
  useEffect(() => {
    if (testMode || unlockAll || !child?.id || child.isTest || !tests || tests.length === 0) return;
    if (!bankInfo.changed && game.tstars === sumStars && game.tdia === sumDia && game.tmap === doneCounts.map && game.todev === doneCounts.odev) return;
    const t = setTimeout(() => setGame(g => ({
      ...g,
      bank: computeBank({ ...childRef.current, game: g }, tests, responses, cfg).bank, bankv: 2,
      tstars: sumStars, tdia: sumDia, tmap: doneCounts.map, todev: doneCounts.odev,
    })), 1500);
    return () => clearTimeout(t);
  }, [bankInfo, sumStars, sumDia, doneCounts.map, doneCounts.odev, child?.id, tests?.length]); // eslint-disable-line react-hooks/exhaustive-deps
  // yönetici deneme modunda elmas sınırsız
  const diamonds = testMode ? 999999 : getDiamondBalance(childWithGame, tests, responses, cfg);

  // --- ELMASA GEÇİŞ (bir kez): eski sistemde biriktirilmiş harcanmamış yıldızlar elmasa çevrilir ---
  useEffect(() => {
    if (testMode || !child || (Number(game.dver) || 0) >= 2) return;
    if (!tests || tests.length === 0) return;
    const spent = Number(game.spent) || 0;
    if ((!responses || responses.length === 0) && spent > 0) return; // veri tam gelmemiş olabilir; sonra dene
    let legacy = 0;
    if (kind === 'deneme') {
      const starBal = getStarBalance(childWithGame, tests, responses, cfg);
      legacy = starBal > 0 ? Math.max(1, Math.round(starBal * (Number(cfg?.diamondPriceFactor) || 0.5))) : 0;
    }
    setGame(g => ({ ...g, dver: 2, legacyDiamonds: legacy }));
  }, [tests?.length, responses?.length, child?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const buy = (item) => {
    const price = Number(item?.price) || 0;
    if (!item || price > diamonds) return false;
    setGame(g => ({ ...g, owned: Array.from(new Set([...(g.owned || []), item.id])), dspent: (Number(g.dspent) || 0) + price }));
    sfx('diamond');
    return true;
  };

  const world = useMemo(() => {
    const w = getWorldState(buildWorld(tests, cfg), child, responses, cfg);
    if (!testMode && !unlockAll) return w;
    // deneme modu / yönetici önizlemesi: tüm haritalar ve adalar açık
    return w.map(m => ({ ...m, unlocked: true, islands: m.islands.map(isl => (isl.state === 'locked' ? { ...isl, state: 'current' } : isl)) }));
  }, [tests, cfg, child, responses, testMode, unlockAll]);

  // --- HARİTA BİTİRME ÖDÜLÜ (ekstra elmas): bitmiş her harita bir kez ödül verir ---
  const claimMap = useCallback((mapId) => {
    if (!mapId) return;
    if ((gameRef.current.mapBonus || []).includes(mapId)) return;
    setGame(g => ({ ...g, mapBonus: Array.from(new Set([...(g.mapBonus || []), mapId])) }));
  }, [setGame]);
  useEffect(() => {
    if (testMode) return;
    const done = world.filter(m => m.allDone && m.islands.length > 0).map(m => m.id);
    const missing = done.filter(id => !(game.mapBonus || []).includes(id));
    if (missing.length) setGame(g => ({ ...g, mapBonus: Array.from(new Set([...(g.mapBonus || []), ...missing])) }));
  }, [world]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- ÖDEVLER ---
  const gorevTests = useMemo(() => (tests || []).filter(t => t.isPublished && (t.questionIds || []).length > 0 && isGorevTest(t, cfg)), [tests, cfg]);
  const gorevNew = useMemo(() => gorevTests.filter(t => getDisplayStatus(child, t, responses) === 'new').length, [gorevTests, child, responses]);
  const prevNew = useRef(null);
  useEffect(() => {
    if (prevNew.current !== null && gorevNew > prevNew.current) {
      sfx('gorevNew');
      setNotice('yeni ödevin var! 📋');
      const tm = setTimeout(() => setNotice(''), 6000);
      prevNew.current = gorevNew;
      return () => clearTimeout(tm);
    }
    prevNew.current = gorevNew;
    return undefined;
  }, [gorevNew]);
  const markSeen = (ids) => setGame(g => ({ ...g, seenGorev: Array.from(new Set([...(g.seenGorev || []), ...ids])).slice(-600) }));

  // Sıradaki adanın testini önceden yükle: çocuk adaya dokununca test beklemeden açılır
  useEffect(() => {
    if (paused || !fetchQuestionsOnDemand || gorevOpen) return undefined;
    const cur = world.flatMap(m => (m.unlocked ? m.islands : [])).find(isl => isl.state === 'current');
    if (!cur?.test?.id) return undefined;
    const t = setTimeout(() => { try { fetchQuestionsOnDemand(cur.test); } catch (_) {} }, 1500);
    return () => clearTimeout(t);
  }, [world, paused, gorevOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- FON MÜZİĞİ: dünyada dünya müziği, ödev sayfasında ödev müziği; teste girince durur ---
  const music = cfg?.fx?.music || {};
  const [gamesOpen, setGamesOpen] = useState(false);
  const gamesOn = cfg?.games?.enabled !== false;
  const musicUrl = (paused || gamesOpen) ? '' : (gorevOpen ? (music.gorev || music.map || '') : (music.map || ''));
  const [musicOff, setMusicOffState] = useState(isMusicOff());
  useEffect(() => { setBgMusic(musicUrl, music.volume ?? 0.35); }, [musicUrl, music.volume]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopBgMusic(), []);
  const toggleMusic = () => { const off = !musicOff; setMusicOff(off); setMusicOffState(off); if (!off) setBgMusic(musicUrl, music.volume ?? 0.35); };

  // Test SADECE tüm soruları eksiksiz yüklendiğinde başlar
  const play = async (test, opts = {}) => {
    stopBgMusic(); // teste dokunur dokunmaz müzik durur
    if (enterFullscreen) enterFullscreen();
    setLoadError('');
    setLoadingTestId(test.id);
    const result = await fetchQuestionsOnDemand(test);
    setLoadingTestId(null);
    if (result && result.ok === false) { setLoadError('sorular tam yüklenemedi. internet bağlantını kontrol edip tekrar dene.'); setBgMusic(musicUrl, music.volume ?? 0.35); return; }
    onStartTest((result && result.test) || test, opts);
  };

  // Karakter/ev sayfasında uzun kalınca: 5 dakikada bir reklam (Sınıfım'da reklam yok)
  useEffect(() => {
    if (!studio || kind === 'ana') return undefined;
    const iv = setInterval(() => { maybeShowAd(childRef.current, cfg?.ads, 'studio_timer'); }, 20000);
    return () => clearInterval(iv);
  }, [studio, cfg, kind]);

  const closeStudio = async () => {
    setStudio(null);
    flush();
    if (kind !== 'ana') await maybeShowAd(childRef.current, cfg?.ads, 'studio_exit');
  };

  if (studio) {
    return (
      <Studio child={child} game={game} setGame={setGame} itemMap={itemMap} items={items} balance={diamonds} buy={buy} paintPrice={Number(cfg?.paintDiamonds ?? 2)}
        onClose={closeStudio} initialTab={studio} />
    );
  }

  return (
    <>
      <WorldMap
        world={world} child={child} game={game} itemMap={itemMap} cfg={cfg} balance={diamonds} stars={stars} diamonds={diamonds}
        onPlayIsland={(t) => play(t)} onFixIsland={(t) => play(t, { fix: true })}
        onOpenStudio={(t) => setStudio(t)} onLogout={async () => { await flush(); onLogout(); }}
        settings={settings} welcomePlayed={welcomePlayed} setWelcomePlayed={setWelcomePlayed}
        loadingTestId={gorevOpen ? null : loadingTestId} loadError={gorevOpen ? '' : loadError} clearError={() => setLoadError('')}
        paused={paused || gorevOpen}
        testMode={testMode}
        onResetTest={onResetTest ? () => { onResetTest(); setGame(normalizeGame(null)); } : null}
        gorevCount={gorevNew} onOpenGorev={() => { setLoadError(''); setGorevOpen(true); }} gorevLabel="ödev"
        onMapDone={claimMap}
      />
      {gamesOn && !gorevOpen && !paused && !gamesOpen && <GamesTab onOpen={() => { sfx('tap'); setGamesOpen(true); }} />}
      {gamesOpen && <GamesHub onClose={() => setGamesOpen(false)} allowed={Object.fromEntries(Object.keys(cfg?.games?.off || {}).map(k => [k, false]))} />}
      {musicUrl && (
        <button onClick={toggleMusic} aria-label={musicOff ? 'müziği aç' : 'müziği kapat'} style={{ zIndex: 95, left: 12, bottom: 52 }} className="ca-game fixed w-12 h-12 rounded-full bg-white/95 border-4 border-white shadow-xl flex items-center justify-center text-2xl active:scale-90">
          <span className={musicOff ? 'opacity-40' : 'ca-bob inline-block'}>🎵</span>
          {musicOff && <span className="absolute inset-0 flex items-center justify-center text-red-500 text-3xl font-black pointer-events-none">⁄</span>}
        </button>
      )}
      {notice && !gorevOpen && (
        <button onClick={() => { setNotice(''); setGorevOpen(true); }} className="ca-game fixed z-[70] left-[74px] ca-pop bg-white text-fuchsia-600 font-black text-sm px-4 py-2.5 rounded-2xl shadow-2xl border-4 border-fuchsia-300" style={{ top: 'calc(38% + 26px)' }}>{notice}</button>
      )}
      {gorevOpen && (
        <GorevPanel
          child={child} game={game} itemMap={itemMap} tests={gorevTests} responses={responses} cfg={cfg}
          stars={stars} diamonds={diamonds} kind={kind} settings={settings}
          onClose={() => { setLoadError(''); setGorevOpen(false); }}
          onStart={(t) => play(t)} onFix={(t) => play(t, { fix: true })}
          loadingTestId={loadingTestId} loadError={loadError} clearError={() => setLoadError('')}
          seenIds={game.seenGorev} onSeen={testMode ? null : markSeen}
          welcomePlayed={welcomePlayed} setWelcomePlayed={setWelcomePlayed}
        />
      )}
    </>
  );
}
