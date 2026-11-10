import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './game.css';
import { WorldMap } from './WorldMap';
import { Studio } from './Studio';
import { buildWorld, getWorldState, getStarBalance } from './progress';
import { getAllItems, getItemMap, normalizeGame } from './gameConfig';
import { saveChildGame, saveChildToDevice } from './identity';
import { maybeShowAd } from './ads';

// ============================================================================
// --- GRUP: ÖĞRENCİ OYUN EKRANI (HARİTA + KARAKTER/EV STÜDYOSU) ---
// ============================================================================
export function StudentGame({ db, appId, child, setChild, tests, responses, cfg, settings, onStartTest, fetchQuestionsOnDemand, enterFullscreen, onLogout, welcomePlayed, setWelcomePlayed, paused = false, testMode = false, onResetTest = null }) {
  const [game, setGameState] = useState(() => normalizeGame(child?.game));
  const [studio, setStudio] = useState(null); // null | 'character' | 'house' | 'car'
  const [loadingTestId, setLoadingTestId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const saveTimer = useRef(null);
  const pending = useRef(null);
  const childRef = useRef(child);
  childRef.current = child;

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
    const next = typeof updater === 'function' ? updater(prev) : updater;
    gameRef.current = next;
    setGameState(next);
    pending.current = next;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 900);
    const updatedChild = { ...childRef.current, game: next };
    childRef.current = updatedChild;
    saveChildToDevice(updatedChild);
    setChild?.(updatedChild);
  }, [flush, setChild]);

  const childWithGame = useMemo(() => ({ ...child, game }), [child, game]);
  // yönetici deneme modunda yıldız sınırsız
  const balance = testMode ? 999999 : getStarBalance(childWithGame, tests, responses, cfg);

  const buy = (item) => {
    const price = Number(item?.price) || 0;
    if (!item || price > balance) return false;
    setGame(g => ({ ...g, owned: Array.from(new Set([...(g.owned || []), item.id])), spent: (Number(g.spent) || 0) + price }));
    return true;
  };

  const world = useMemo(() => {
    const w = getWorldState(buildWorld(tests, cfg), child, responses, cfg);
    if (!testMode) return w;
    // deneme modu: tüm haritalar ve adalar açık
    return w.map(m => ({ ...m, unlocked: true, islands: m.islands.map(isl => (isl.state === 'locked' ? { ...isl, state: 'current' } : isl)) }));
  }, [tests, cfg, child, responses, testMode]);

  // Sıradaki adanın testini önceden yükle: çocuk adaya dokununca test beklemeden açılır
  useEffect(() => {
    if (paused || !fetchQuestionsOnDemand) return undefined;
    const cur = world.flatMap(m => (m.unlocked ? m.islands : [])).find(isl => isl.state === 'current');
    if (!cur?.test?.id) return undefined;
    const t = setTimeout(() => { try { fetchQuestionsOnDemand(cur.test); } catch (_) {} }, 1500);
    return () => clearTimeout(t);
  }, [world, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // Test SADECE tüm soruları eksiksiz yüklendiğinde başlar
  const playIsland = async (test) => {
    if (enterFullscreen) enterFullscreen();
    setLoadError('');
    setLoadingTestId(test.id);
    const result = await fetchQuestionsOnDemand(test);
    setLoadingTestId(null);
    if (result && result.ok === false) { setLoadError('sorular tam yüklenemedi. internet bağlantını kontrol edip tekrar dene.'); return; }
    onStartTest((result && result.test) || test);
  };

  // Karakter/ev sayfasında uzun kalınca: 5 dakikada bir reklam
  useEffect(() => {
    if (!studio) return;
    const iv = setInterval(() => { maybeShowAd(childRef.current, cfg?.ads, 'studio_timer'); }, 20000);
    return () => clearInterval(iv);
  }, [studio, cfg]);

  const closeStudio = async () => {
    setStudio(null);
    flush();
    await maybeShowAd(childRef.current, cfg?.ads, 'studio_exit');
  };

  if (studio) {
    return (
      <Studio child={child} game={game} setGame={setGame} itemMap={itemMap} items={items} balance={balance} buy={buy} paintPrice={Number(cfg?.paintPrice ?? 5)}
        onClose={closeStudio} initialTab={studio} />
    );
  }

  return (
    <WorldMap
      world={world} child={child} game={game} itemMap={itemMap} cfg={cfg} balance={balance}
      onPlayIsland={playIsland} onOpenStudio={(t) => setStudio(t)} onLogout={async () => { await flush(); onLogout(); }}
      settings={settings} welcomePlayed={welcomePlayed} setWelcomePlayed={setWelcomePlayed}
      loadingTestId={loadingTestId} loadError={loadError} clearError={() => setLoadError('')}
      paused={paused}
      testMode={testMode}
      onResetTest={onResetTest ? () => { onResetTest(); setGame(normalizeGame(null)); } : null}
    />
  );
}
