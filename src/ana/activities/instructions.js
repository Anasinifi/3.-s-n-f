// ============================================================================
// --- ETKİLEŞİMLİ SORULARIN SESLİ YÖNERGELERİ ---
// ============================================================================
// Soru metni yazılmamış etkileşimli sorularda telefonla okunacak yönerge.
// (Öğrenci uygulamasında da kullanılır.)
export const interactiveInstruction = (q) => {
  if (!q) return '';
  const t = q.questionType || '';
  if (t === 'dot_grid' || q.dotGrid) return 'Örnekteki çizgileri noktaların üzerine aynen çiz.';
  if (t === 'color_grid' || q.colorGrid) return 'Örnekteki gibi kutuları boya.';
  if (t === 'sudoku_grid' || q.sudokuGrid) return 'Boş kutuları tamamla.';
  if (t === 'box_coding' || t === 'line_coding' || q.codingGrid) return q.codingGrid?.method === 'method2' ? 'Okları takip et ve yolu işaretle.' : 'Yolu takip et ve okları kutulara diz.';
  if (t === 'color_pattern' || q.patternGrid) return 'Örüntüdeki boş kutuları tamamla.';
  if (t === 'symmetry_grid' || q.symmetryGrid) return 'Simetriğini sağ tarafa boya.';
  if (t === 'matrix_shape' || q.matrixShapeGrid) return 'Tabloyu uygun şekillerle tamamla.';
  if (t === 'matrix_paint' || q.matrixPaintGrid) return 'Örnekteki gibi uygun renkleri boyayalım.';
  if (t === 'number_connect' || q.numberConnectGrid) return q.numberConnectGrid?.level ? 'Üstteki sıraya göre şekilleri birleştir.' : 'Sayıları sırasıyla birleştir.';
  if (t === 'interactive_maze' || q.mazeGrid) return 'Parmağınla doğru yolu çizerek havuca ulaş.';
  if (t === 'bar_graph' || q.barGraphGrid) return 'Resimleri say ve kaç tane varsa o kadar kutucuk boya.';
  if (t === 'sequence_memory' || q.sequenceGrid) return 'Kareler hangi sırayla yandıysa sen de öyle dokun.';
  if (t === 'match_pairs' || q.matchGrid) return 'Eşleştir. Önce soldan bir karta, sonra sağdan eşine dokun.';
  if (t === 'event_order' || q.eventOrderGrid) return 'Olayları oluş sırasına göre sırala. Önce olana ilk dokun.';
  return '';
};

// Soruda telefonla okunacak metin: önce ttsText, sonra (hafıza) soru metni, soru metni, etkileşimli yönerge
export const speechTextOf = (q) => (q ? (q.ttsText || (q.isMemory && q.memoryText) || q.text || interactiveInstruction(q) || '') : '');
