import { getDocsFromCache, getDocsFromServer, getDocFromCache, getDocFromServer } from 'firebase/firestore';

// ============================================================================
// --- GRUP: VERİTABANI (FİREBASE) ÖN BELLEK (CACHE) YARDIMCILARI ---
// ============================================================================
export const getDocsCacheFirst = async (q) => {
    try {
        const cacheSnap = await getDocsFromCache(q);
        if (!cacheSnap.empty) return cacheSnap;
        return await getDocsFromServer(q);
    } catch (e) {
        return await getDocsFromServer(q);
    }
};

export const getDocCacheFirst = async (docRef) => {
    try {
        const cacheSnap = await getDocFromCache(docRef);
        if (cacheSnap.exists()) return cacheSnap;
        return await getDocFromServer(docRef);
    } catch (e) {
        return await getDocFromServer(docRef);
    }
};
