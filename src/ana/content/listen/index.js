// ============================================================================
// --- SESLİ SORULAR BANKASI (telefon sesi ya da öğretmenin yüklediği ses) ---
// ============================================================================
// Problem çözme 600 (10 nesne × 2 tip × 30) • Bilmece 200 • Dinlediğini anlama 400 hikâye (1000 soru)
// Sırayı takip et 100 • Nezaket ve iletişim 100 • Mekân 100 • Neden-sonuç 100
// Nezaket, mekân, neden-sonuç ve hikâyelerin (2 soruluk görselli hariç) metinleri öğretmenin gönderdiği dosyalardan (userData.js).
// Tüm sorular telefonla okunabilir; her soruya / şıkka / hikâyeye ayrıca ses yüklenebilir.
import { G, createBank } from '../bank';
import { genAllThree, genTwoOneNot, PROBLEM_OBJECTS } from './problem';
import { genRiddle } from './riddles';
import { genUserProblem, USER_PROBLEM_GROUPS } from './problemUser';
import { genFollowOrder } from './misc';
import { genUserListen, userListenCount, genUserStory, userStoryCount } from './userData';

const C = (id, label, groups) => ({ id, label, groups });
// öğretmenin hikâyeleri (sekme: 1 = 2 soruluk görselli, 2 = 2 soruluk sesli, 3 = 3 soruluk görselli, 4 = 3 soruluk sesli)
const uStory = (key, label, sekme, mode) => G(`ls_${key}u`, 'Hikâyeyi dinle ve soruyu cevapla.', genUserStory(sekme, mode), userStoryCount(sekme), { label, tagLabel: 'hikâye', tagFolders: true, fromTeacher: true });

export const LISTEN_CATEGORIES = [
  { id: 'l_problem', label: 'Problem Çözme', color: 'indigo', concepts: [
    C('l_problem_3', 'Üç özellik (hepsi var)', PROBLEM_OBJECTS.map(o => G(`lp3_${o.id}`, 'Söylenen özelliklerin hepsine uyanı bul.', genAllThree(o.id), 30, { label: o.label }))),
    C('l_problem_21', 'İki var, bir yok', PROBLEM_OBJECTS.map(o => G(`lp21_${o.id}`, 'Söylenenlere uyanı bul: iki özellik var, bir özellik yok.', genTwoOneNot(o.id), 30, { label: o.label }))),
    // öğretmenin gönderdiği 200 soru (kategori kategori 10'ar)
    C('l_problem_u3', 'Üçü de var (gönderilen sorular)', USER_PROBLEM_GROUPS.filter(g => g.type === '3').map(g => G(g.key, 'Söylenen özelliklerin hepsine uyanı bul.', genUserProblem(g.from), 10, { label: g.label, fromTeacher: true }))),
    C('l_problem_u21', 'İki var, bir yok (gönderilen sorular)', USER_PROBLEM_GROUPS.filter(g => g.type === '21').map(g => G(g.key, 'Söylenenlere uyanı bul: iki özellik var, bir özellik yok.', genUserProblem(g.from), 10, { label: g.label, fromTeacher: true })))
  ] },
  { id: 'l_bilmece', label: 'Bilmeceler', color: 'amber', concepts: [
    C('l_bilmece', 'Bilmeceler', [
      G('lb_hayvan', 'Bilmeceyi dinle. Ben neyim?', genRiddle('hayvan'), 50, { label: 'Hayvanlar' }),
      G('lb_yiyecek', 'Bilmeceyi dinle. Ben neyim?', genRiddle('yiyecek'), 50, { label: 'Yiyecekler' }),
      G('lb_esya', 'Bilmeceyi dinle. Ben neyim?', genRiddle('esya'), 50, { label: 'Eşyalar' }),
      G('lb_doga', 'Bilmeceyi dinle. Ben neyim?', genRiddle('doga'), 50, { label: 'Doğa ve taşıtlar' })
    ])
  ] },
  { id: 'l_dinleme', label: 'Dinlediğini Anlama', color: 'sky', concepts: [
    C('l_din_gorsel', 'Şıklar görsel', [uStory('g2', '2 soruluk hikâyeler', 1, 'gorsel'), uStory('g3', '3 soruluk hikâyeler', 3, 'gorsel')]),
    C('l_din_sesli', 'Şıklar sesli', [uStory('s2', '2 soruluk hikâyeler', 2, 'sesli'), uStory('s3', '3 soruluk hikâyeler', 4, 'sesli')])
  ] },
  { id: 'l_sira', label: 'Sırayı Takip Et', color: 'fuchsia', concepts: [
    C('l_sira', 'Sesleri sırasıyla hatırla', [
      G('lsr_3', 'Duyduğun sırayı aklında tut. Hangi şıkta sıra doğru?', genFollowOrder(3), 60, { label: '3 sesli sıra' }),
      G('lsr_4', 'Duyduğun sırayı aklında tut. Hangi şıkta sıra doğru?', genFollowOrder(4), 40, { label: '4 sesli sıra' })
    ])
  ] },
  { id: 'l_nezaket', label: 'Nezaket ve İletişim', color: 'rose', concepts: [
    C('l_nezaket', 'Ne söylemeli?', [G('lnz2', 'Durumu dinle. Hangisini söylemeli?', genUserListen('nezaket'), userListenCount('nezaket'), { label: 'Nezaket sözleri', fromTeacher: true })])
  ] },
  { id: 'l_mekan', label: 'Mekân ve Zıtlık', color: 'teal', concepts: [
    C('l_mekan', 'Dikkatle dinle', [G('lmk2', 'Dinle ve doğru olanı seç.', genUserListen('mekan'), userListenCount('mekan'), { label: 'Mekân ve zıtlık', fromTeacher: true })])
  ] },
  { id: 'l_neden', label: 'Neden - Sonuç', color: 'emerald', concepts: [
    C('l_neden', 'Olayın devamı', [G('lns2', 'Olayı dinle. Sence sonra ne oldu?', genUserListen('neden'), userListenCount('neden'), { label: 'Olayın devamı', fromTeacher: true })])
  ] }
];

export const LISTEN_BANK = createBank({
  id: 'listen',
  title: 'sesli sorular (dinleme)',
  intro: 'Bütün sorular telefonun sesiyle okunur. İsterseniz her kalıba toplu ses, her soruya, her şıkka ve her hikâyeye kendi sesinizi yükleyebilirsiniz. Hikâye sorularında hikâye önce ayrı ekranda dinletilir, sonra sorular gelir. Her hikâye kendi alt klasörüne kaydedilir.',
  rootFolder: 'Sesli Sorular',
  fieldPrefix: 'listen',
  settingsDoc: 'listen_settings',
  mediaPrefix: 'listen_media_',
  categories: LISTEN_CATEGORIES,
  maxOptions: 3,
  style3d: true,
  hasStories: true,
  balanceAnswers: true, // doğru şık yerleri dengeli (A/B/C eşit)
  folderPath: (gr) => [gr.categoryLabel, gr.conceptLabel, gr.label || gr.text]
});
