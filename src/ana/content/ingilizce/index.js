// ============================================================================
// --- 3. SINIF İNGİLİZCE: SEKMELER ---
// ============================================================================
// 6 ünite (her biri ayrı sekme: 500 öğretici + 200 test = 700 soru) + Genel Tekrar (300 soru)
import { U1, U2, U3 } from './data1';
import { U4, U5, U6 } from './data2';
import { makeUnitBank, makeGeneralBank } from './gen';

export const ENGLISH_UNITS = [U1, U2, U3, U4, U5, U6];
export const ENGLISH_BANKS = [...ENGLISH_UNITS.map(makeUnitBank), makeGeneralBank(ENGLISH_UNITS)];
