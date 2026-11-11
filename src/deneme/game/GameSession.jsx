import React from 'react';
import { getTestProgress, getRewardFor, getDiamondRewardFor, starsForStatus, isTestDone, getTestDifficulty, getWrongQuestionIds, makeFixTest } from './progress';
import { resultEventKind, getFxConfig } from './fx';
import { testChannel, getItemMap, normalizeGame } from './gameConfig';
import { Celebration } from './Celebration';

// ============================================================================
// --- GRUP: TEST OTURUMU (başlat -> bitir -> kutlama -> yanlışları çöz) ---
// ============================================================================
// Üç uygulama (Sınıfım öğrenci, Deneme çocuk oyunu, yönetici deneme modu) aynı akışı kullanır.

// Test başlarken: önceki durum ve önceki ödül (kazanılan farkı hesaplamak için)
export const makeStartInfo = (child, test, responses, cfg, { fix = false } = {}) => {
  const prevStatus = getTestProgress(child, test, responses);
  return {
    baseTest: test,
    prevStatus,
    prevStars: starsForStatus(prevStatus, getRewardFor(test, cfg)),
    prevDiamonds: starsForStatus(prevStatus, getDiamondRewardFor(test, cfg)),
    startedAt: Date.now(),
    fix,
    channel: testChannel(test, cfg),
  };
};

// "Yanlışlarını çöz": sadece yanlış (ya da hiç cevaplanmamış) sorulardan oluşan deneme
export const prepareTest = (test, child, responses, { fix = false, wrongIds } = {}) => {
  if (!fix) return test;
  const ids = wrongIds && wrongIds.length ? wrongIds : getWrongQuestionIds(child, test, responses);
  return makeFixTest(test, ids);
};

// Test bitti: kutlama ekranının türü ve verileri
export const buildCelebration = (res, test, info, cfg) => {
  const total = res.totalQuestions || (res.correctCount + res.wrongCount);
  const allRight = res.correctCount >= total && res.wrongCount === 0;
  const newStatus = allRight ? 'perfect' : 'completed';
  const reward = getRewardFor(test, cfg);
  const dreward = getDiamondRewardFor(test, cfg);
  const effStatus = info?.prevStatus === 'perfect' ? 'perfect' : newStatus; // tam çözülmüş test geri düşmez
  const starsGained = Math.max(0, starsForStatus(effStatus, reward) - (info?.prevStars || 0));
  const diamondsGained = Math.max(0, starsForStatus(effStatus, dreward) - (info?.prevDiamonds || 0));
  const channel = info?.channel || testChannel(test, cfg);
  const unlockedNext = channel === 'harita' && !isTestDone(info?.prevStatus, cfg) && isTestDone(newStatus, cfg);
  const kind = resultEventKind(info?.prevStatus || 'new', newStatus);
  const wrongIds = (res.details || []).filter(d => !d.isCorrect).map(d => d.questionId);
  const showName = channel === 'gorev' || !!cfg?.showIslandNames;
  return {
    kind,
    test: info?.baseTest || test,
    data: {
      starsGained, diamondsGained, reward, dreward,
      difficulty: getTestDifficulty(test, cfg),
      correct: res.correctCount, wrong: res.wrongCount,
      testName: showName ? (res.testName || test?.name || '') : '',
      newStatus, unlockedNext, wrongIds, channel, isFix: !!info?.fix,
    },
  };
};

// Yanlışları çöz düğmesinin yazısı: hangi ödül eksikse onu söyler
export const fixTexts = (data) => {
  const r = data?.reward || {}; const d = data?.dreward || {};
  if ((Number(r.perfect) || 0) > (Number(r.completed) || 0)) return { label: '⭐ yanlışlarını çöz, yıldızını kap!', speech: 'yanlışlarını çöz, yıldızını kap!' };
  if ((Number(d.perfect) || 0) > (Number(d.completed) || 0)) return { label: '💎 yanlışlarını çöz, elmasını kap!', speech: 'yanlışlarını çöz, elmasını kap!' };
  return { label: '✎ yanlışlarını çöz!', speech: 'yanlışlarını çöz!' };
};

/**
 * Kutlama katmanı.
 * celebration: { kind, test, data }  ·  appKind: 'ana' | 'deneme'
 * onFix(test, wrongIds): yanlışları çöz  ·  onClose(): kapat
 */
export function GameCelebration({ celebration, cfg, child, settings, appKind = 'deneme', onClose, onFix, onRetry }) {
  if (!celebration) return null;
  const fx = getFxConfig(cfg);
  const ev = fx.events[celebration.kind];
  if (!ev || ev.enabled === false) { setTimeout(onClose, 0); return null; }
  const t = celebration.test;
  const data = celebration.data || {};
  const positive = ['first_perfect', 'retry_perfect', 'replay_perfect', 'map_done'].includes(celebration.kind);
  const canFix = !!onFix && t && celebration.kind !== 'exit' && data.newStatus !== 'perfect' && Number(data.wrong) > 0;
  const texts = fixTexts(data);
  // Sınıfım: öğretmenin yüklediği "başarı / gayret" sesi (olay için ayrı konuşma sesi seçilmediyse)
  const extraVoice = appKind === 'ana' && celebration.kind !== 'exit' ? (positive ? settings?.successAudio : settings?.failureAudio) : '';
  return (
    <Celebration
      key={`${celebration.kind}_${t?.id || ''}_${data.isFix ? 'f' : 'n'}_${celebration.at || ''}`}
      kind={celebration.kind}
      ev={ev}
      explain={fx.explain[data.difficulty || 'easy']}
      data={data}
      game={normalizeGame(child?.game)}
      itemMap={getItemMap(cfg)}
      onDone={onClose}
      onFixWrongs={canFix ? () => onFix(t, data.wrongIds) : null}
      fixLabel={texts.label}
      fixSpeech={texts.speech}
      onRetry={!canFix && onRetry && t && celebration.kind !== 'exit' && data.newStatus !== 'perfect' ? () => onRetry(t) : null}
      backLabel={data.channel === 'gorev' ? 'ödevlere dön 📋' : undefined}
      extraVoice={extraVoice}
    />
  );
}
