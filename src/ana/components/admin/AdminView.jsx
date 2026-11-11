import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, query, where, getDocsFromServer, doc, getDocFromServer, setDoc, writeBatch, serverTimestamp, orderBy, limit, updateDoc, addDoc, getDocs, deleteDoc, getCountFromServer } from 'firebase/firestore';
import { Layers, EyeOff, Loader2, Image as ImageIcon, Folder, ListChecks, Eye, Edit2, Trash2, FolderOpen, CheckSquare, ClipboardPaste, FolderPlus, CheckCircle, PlusCircle, Copy, Scissors, Atom, Play, ArrowRight, MinusCircle, History, GripVertical, CircleSlash, Globe, Users, User, Settings2, Send, Volume1, Music, Trophy, BarChart2, RefreshCw, Star, Minus, Plus, ChevronLeft, CheckCircle2, X, Check, Palette, Clock, CalendarClock, Shuffle, UploadCloud, ChevronUp, ChevronDown } from 'lucide-react';
import { DOT_TEMPLATES, DOT_LEVEL_LABELS, generateDotGridSvgDataUrl, normalizeDotLines, DotGridPad } from '../../activities/dotGrid';
import { COLOR_BOX_TEMPLATES, generateColorGridSvgDataUrl, normalizeColorCells, ColorGridPad } from '../../activities/colorGrid';
import { generateSudokuSvgDataUrl, SudokuGridPad } from '../../activities/sudoku';
import { getSudokuBank, SUDOKU_LEVELS, SUDOKU_THEMES, applySudokuTheme } from '../../content/sudokuBank';
import { CODING_TEMPLATES, generateCodingGridSvgDataUrl, getArrowsFromPath, CodingActivityPad } from '../../activities/coding';
import { PATTERN_TEMPLATES, generatePatternSvgDataUrl, ColorPatternPad } from '../../activities/colorPattern';
import { SYMMETRY_TEMPLATES, generateSymmetrySvgDataUrl, SymmetryGridPad } from '../../activities/symmetry';
import { MATRIX_SHAPE_TEMPLATES, generateMatrixShapeSvgDataUrl, MatrixShapePad } from '../../activities/matrixShape';
import { MATRIX_PAINT_TEMPLATES, generateMatrixPaintSvgDataUrl, MatrixPaintPad } from '../../activities/matrixPaint';
import { NUMBER_CONNECT_TEMPLATES, generateNumberConnectSvgDataUrl, NumberConnectPad } from '../../activities/numberConnect';
import { MAZE_TEMPLATES, MAZE_LEVELS, buildMazePayload, generateMazeSvgDataUrl, InteractiveMazePad } from '../../activities/maze';
import { BAR_GRAPH_TEMPLATES, generateBarGraphSvgDataUrl, BarGraphActivityPad } from '../../activities/barGraph';
import { SHADOW_QUIZ_TEMPLATES, SHADOW_LEVELS } from '../../activities/shadow';
import { SEQUENCE_TEMPLATES, SEQUENCE_LEVELS, SEQUENCE_SQUARE_COUNTS, buildSequencePayload, generateSequenceSvgDataUrl, SequenceMemoryPad } from '../../activities/sequenceMemory';
import { EventOrderPad, generateEventOrderSvgDataUrl } from '../../activities/eventOrder';
import { speechTextOf } from '../../activities/instructions';
import { buildUnits, normalizeStoryOrder, storySiblingIds, moveBlock, stepBlock } from '../../utils/storyOrder';
import { EVENT_ORDER_LEVELS, EVENT_ORDER_TEXT, getEventOrderTemplates, buildEventOrderPayload } from '../../content/eventOrderBank';
import { commitOpsInChunks } from '../../utils/firestoreBatch';
import { findQuestionsByField, planOverwrite, removeIdsFromAllTests, mergeQuestionState, stripIdsFromTestState } from '../../utils/overwriteSave';
import { getScheduleRef, scheduleDocName, DEFAULT_SCHEDULE, WEEKDAY_LABELS, initialLastRunDate, previewUpcoming } from '../../utils/publishScheduler';
import { MediaUploader } from '../common/MediaUploader';
import { TemplateBankPanel } from './TemplateBankPanel';
import { ENGLISH_BANKS } from '../../content/ingilizce';
import { MATH_BANK } from '../../content/dersler/matematik';
import { TURKISH_BANK } from '../../content/dersler/turkce';
import { HAYAT_BANK } from '../../content/dersler/hayat';
import { FEN_BANK } from '../../content/dersler/fen';

// 3. sınıf ders bankaları: sekme id -> banka (her biri 1000 hazır soru)
// İngilizce: her ünite AYRI alt sekme (500 öğretici + 200 test) + Genel Tekrar (300)
const SUBJECT_TABS = [
  { id: 'eng_questions', label: '3. sınıf ingilizce', banks: ENGLISH_BANKS, subLabel: (b, i) => (i < 6 ? `${i + 1}. ünite` : 'genel tekrar'), subSub: (b) => b.title.split('·').pop().trim() },
  { id: 'mat_questions', label: '3. sınıf matematik', bank: MATH_BANK },
  { id: 'trk_questions', label: '3. sınıf türkçe', bank: TURKISH_BANK },
  { id: 'hb_questions', label: '3. sınıf hayat bilgisi', bank: HAYAT_BANK },
  { id: 'fen_questions', label: '3. sınıf fen bilimleri', bank: FEN_BANK }
];
const SUBJECT_TAB_IDS = SUBJECT_TABS.map(t => t.id);
import { BILSEM_BANK } from '../../content/bilsem3';
import { LISTEN_BANK } from '../../content/listen';
import { calculateStudentStars } from '../../utils/studentStats';
// Sınıfım oyun dünyası ayarları (dünyalar, elmas, market, test sonu efektleri) - deneme ile aynı modüller
import { GameAdminPanel } from '../../../deneme/game/GameAdminPanel';
import { ExtraStudio } from '../../../deneme/game/ExtraStudio';
import { loadGameConfig, mergeGameConfig } from '../../../deneme/game/gameConfig';
import { ref as storageRefOf, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { measureGain, withGain } from '../../utils/audioLevel';
import { storedStars, getEarnedStars, computeBank } from '../../../deneme/game/progress';

// ============================================================================
// --- GRUP: YÖNETİCİ PANELİ (ADMIN VIEW) - STATE VE DEĞİŞKENLER ---
// ============================================================================
export function AdminView({ childrenList, setChildrenList, questions, setQuestions, tests, setTests, responses, setResponses, folders, appId, onPreview, db, defaultStyle, statsViewMode, setStatsViewMode, statsSelectedTest, setStatsSelectedTest, statsSelectedStudent, setStatsSelectedStudent, onOpenPreviewEditor, onOpenContentEditor, settings, setPreviewEditorQuestion, setContentEditorQuestion, onInspect, fetchAdminTests, fetchAdminChildren, fetchAdminResponses, fetchStatsFromServer, fetchTestQuestionsOnDemand, onViewAsStudent, onPreviewLoaded }) {
  const [tab, setTab] = useState('questions');
  const [subBank, setSubBank] = useState({}); // ders sekmesinin alt sekmesi (ör. İngilizce ünitesi)
  const [studentsSub, setStudentsSub] = useState('list'); // öğrenciler sekmesinin içi: list | stars | extra
  const [studentsFolderOpen, setStudentsFolderOpen] = useState(false);
  const [starBusy, setStarBusy] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [qName, setQName] = useState("");
  const [qText, setQText] = useState("");
  const [qImg, setQImg] = useState("");
  const [qVid, setQVid] = useState("");
  const [qAud, setQAud] = useState("");
  const [qPreAud1, setQPreAud1] = useState("");
  const [qPreAud2, setQPreAud2] = useState("");
  const [qCustomAttachmentImg, setQCustomAttachmentImg] = useState("");

  // --- SABİTLENEBİLİR SORU AYARLARI (SÜRE, HAFIZA MODU VE KLASÖR YERİ) ---
  const [keepSettingsPinned, setKeepSettingsPinned] = useState(() => {
    const saved = localStorage.getItem('ca_keep_settings_pinned');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [qTimeLimit, setQTimeLimit] = useState(() => Number(localStorage.getItem('ca_pinned_timeLimit')) || 75);
  const [isMem, setIsMem] = useState(() => localStorage.getItem('ca_pinned_isMem') === 'true');
  const [memTime, setMemTime] = useState(() => Number(localStorage.getItem('ca_pinned_memTime')) || 15);
  const [qFolderId, setQFolderId] = useState(() => localStorage.getItem('ca_pinned_folderId') || "");

  useEffect(() => {
    localStorage.setItem('ca_keep_settings_pinned', JSON.stringify(keepSettingsPinned));
    if (keepSettingsPinned) {
      localStorage.setItem('ca_pinned_timeLimit', String(qTimeLimit));
      localStorage.setItem('ca_pinned_isMem', String(isMem));
      localStorage.setItem('ca_pinned_memTime', String(memTime));
      localStorage.setItem('ca_pinned_folderId', String(qFolderId));
    }
  }, [keepSettingsPinned, qTimeLimit, isMem, memTime, qFolderId]);

  const [qOpts, setQOpts] = useState([{text:"",image:"",audio:""}, {text:"",image:"",audio:""}, {text:"",image:"",audio:""}]);
  const [correctIdx, setCorrectIdx] = useState(null);

  // 13 Alt Sekme: 'dot' | 'color_box' | 'sudoku' | 'box_coding' | 'line_coding' | 'color_pattern' | 'symmetry' | 'matrix_shape' | 'matrix_paint' | 'number_connect' | 'maze' | 'shadow_quiz' | 'bar_graph'
  const [gridSubTab, setGridSubTab] = useState('dot');

  // 1. Nokta Birleştirme State'leri
  const [dotRows, setDotRows] = useState(3);
  const [dotCols, setDotCols] = useState(3);
  const [dotLines, setDotLines] = useState(() => DOT_TEMPLATES[3]?.[0]?.lines || []);
  const [dotTemplateIdx, setDotTemplateIdx] = useState(0);
  const [dotLevelFilter, setDotLevelFilter] = useState('easy');

  // 2. Kutu Boyama State'leri
  const [boxRows, setBoxRows] = useState(4);
  const [boxCols, setBoxCols] = useState(4);
  const [boxCells, setBoxCells] = useState(() => COLOR_BOX_TEMPLATES[4]?.[0]?.cells || {});
  const [boxTemplateIdx, setBoxTemplateIdx] = useState(0);

  // 3. Sudoku State'leri
  // Hazır banka: boyut (3/4/5) × seviye (kolay/orta/zor) × 100 soru
  const [sudokuSize, setSudokuSize] = useState(3);
  const [sudokuLevel, setSudokuLevel] = useState('kolay');
  const [sudokuThemeMode, setSudokuThemeMode] = useState('auto'); // 'auto' = 20 tema karışık, ya da tema id
  const [sudokuTemplateIdx, setSudokuTemplateIdx] = useState(0);
  const firstSudoku = getSudokuBank(3, 'kolay')[0];
  const [sudokuClues, setSudokuClues] = useState(() => ({ ...(firstSudoku?.clues || {}) }));
  const [sudokuSolution, setSudokuSolution] = useState(() => ({ ...(firstSudoku?.solution || {}) }));
  const [sudokuSymbols, setSudokuSymbols] = useState(() => firstSudoku?.symbols || ['1', '2', '3']);

  // 4 & 5. Kutu Kodlama ve Çizgi Kodlama State'leri
  const [codingSize, setCodingSize] = useState(3);
  const [codingMethod, setCodingMethod] = useState('method1');
  const [codingTemplateIdx, setCodingTemplateIdx] = useState(0);
  const [codingPath, setCodingPath] = useState(() => CODING_TEMPLATES[3]?.[0]?.path || ['0,0', '0,1', '1,1', '2,1']);
  const [codingStartImg, setCodingStartImg] = useState("");
  const [codingTargetImg, setCodingTargetImg] = useState("");

  // 6. Renk Örüntüleri State'leri
  const [patternType, setPatternType] = useState(2);
  const [patternTemplateIdx, setPatternTemplateIdx] = useState(0);
  const [patternCells, setPatternCells] = useState(() => PATTERN_TEMPLATES[2]?.[0]?.cells || ['#ef4444', '#3b82f6', '#ef4444', '#3b82f6', '#ef4444', '#3b82f6']);
  const [patternHiddenIndices, setPatternHiddenIndices] = useState([4, 5]);
  const [patternTeacherMode, setPatternTeacherMode] = useState('hide');

  // 7. Simetri Çalışması State'leri (6x6, 7x7, 8x8 - 200'er Şablon)
  const [symmetrySize, setSymmetrySize] = useState(6);
  const [symmetryTemplateIdx, setSymmetryTemplateIdx] = useState(0);
  const [symmetryLeftCells, setSymmetryLeftCells] = useState(() => SYMMETRY_TEMPLATES[6]?.[0]?.leftCells || {});

  // 8. Tablo Oluşturma (Şekil Birleştirme Matrisi - 200 Şablon)
  const [matrixShapeTplIdx, setMatrixShapeTplIdx] = useState(0);
  const [matrixShapeData, setMatrixShapeData] = useState(() => MATRIX_SHAPE_TEMPLATES[0]);

  // 9. Tablo Boyama (Uygun Renkleri Boyayalım - 200 Şablon)
  const [matrixPaintTplIdx, setMatrixPaintTplIdx] = useState(0);
  const [matrixPaintData, setMatrixPaintData] = useState(() => MATRIX_PAINT_TEMPLATES[0]);

  // 10. Sıralı Çizgi (Renk sırasına göre birleştirme - Orta / Zor 100'er Şablon)
  const [numberConnectLevel, setNumberConnectLevel] = useState('medium');
  const [numberConnectTplIdx, setNumberConnectTplIdx] = useState(0);
  const [numberConnectData, setNumberConnectData] = useState(() => NUMBER_CONNECT_TEMPLATES.medium[0]);

  // 11. Etkileşimli Labirent (Kolay / Orta / Zor - 200'er Şablon)
  const [mazeLevel, setMazeLevel] = useState('easy');
  const [mazeTplIdx, setMazeTplIdx] = useState(0);
  const [mazeData, setMazeData] = useState(() => MAZE_TEMPLATES.easy[0]);
  const [mazeStartImg, setMazeStartImg] = useState("");
  const [mazeEndImg, setMazeEndImg] = useState("");

  // 14. Sırayı Takip Et (Yanıp Sönen Kareler - 3/4/5/6 kare, Kolay/Orta/Zor)
  const [seqCount, setSeqCount] = useState(4);
  const [seqLevel, setSeqLevel] = useState('easy');
  const [seqTplIdx, setSeqTplIdx] = useState(0);
  const [seqAllowReplay, setSeqAllowReplay] = useState(true);
  // 15. Olay sıralama
  const [eoLevel, setEoLevel] = useState('easy');
  const [eoTplIdx, setEoTplIdx] = useState(0);
  const [seqPreviewKey, setSeqPreviewKey] = useState(0);

  // 12. Gölge Bulma Test Soruları (Kolay / Orta / Zor - 300'er Şablon, 3 şık)
  const [shadowLevel, setShadowLevel] = useState('medium');
  const [shadowTplIdx, setShadowTplIdx] = useState(0);

  // 13. Grafik Oluşturma (Kolay / Orta / Zor - 200'er Şablon)
  const [barGraphLevel, setBarGraphLevel] = useState('easy');
  const [barGraphTplIdx, setBarGraphTplIdx] = useState(0);
  const [barGraphData, setBarGraphData] = useState(() => BAR_GRAPH_TEMPLATES.easy[0]);
  const [barGraphIconImages, setBarGraphIconImages] = useState([]);

  // Kayıtlı Sorular Sekme ve Tasarruf Modu State'leri
  const [questionDisplayTab, setQuestionDisplayTab] = useState('saving');
  const [loadingQuestionsTab, setLoadingQuestionsTab] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [tName, setTName] = useState("");
  const [tSelectedQs, setTSelectedQs] = useState([]);
  const [editingT, setEditingT] = useState(null);

  // --- TEST OLUŞTURMA ROBOTU STATE'LERİ ---
  const [showRobotPanel, setShowRobotPanel] = useState(false);
  const [robotQuestionsPerTest, setRobotQuestionsPerTest] = useState(10);
  const [robotTestCount, setRobotTestCount] = useState(5);
  const [robotBaseName, setRobotBaseName] = useState("Deneme Testi");
  const [robotStartNumber, setRobotStartNumber] = useState(1);
  const [robotPublishImmediately, setRobotPublishImmediately] = useState(false);
  const [robotIncludeSubfolders, setRobotIncludeSubfolders] = useState(true);
  const [isRobotRunning, setIsRobotRunning] = useState(false);
  const [robotShuffleInside, setRobotShuffleInside] = useState(true);
  // Klasöre özel kurallar: { [folderId]: { mode: 'auto' | 'count' | 'percent', value, ignoreUsage } }
  const [robotFolderRules, setRobotFolderRules] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ca_robot_folder_rules') || '{}'); } catch (_) { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem('ca_robot_folder_rules', JSON.stringify(robotFolderRules)); } catch (_) {}
  }, [robotFolderRules]);

  // --- ZAMANLI YAYIN ---
  // --- TEST KANALI: ÖDEV (sol taraftaki ödev listesi) / HARİTA (ada ada) ---
  // Kanalı seçilmemiş eski testler: Sınıfım: ödev
  const LEGACY_CHANNEL = 'gorev';
  const chanOf = (t) => (t?.channel === 'gorev' || t?.channel === 'harita' ? t.channel : LEGACY_CHANNEL);
  const [testChannelTab, setTestChannelTab] = useState(LEGACY_CHANNEL);
  const schedDoc = scheduleDocName(appId, testChannelTab);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [scheduleDirty, setScheduleDirty] = useState(false);

  // --- AKTARIM İLERLEMESİ ---
  const [copyProgress, setCopyProgress] = useState("");

  // --- SEÇİLENLER LİSTESİNDE SÜRÜKLE-BIRAK ---
  const [selDragIdx, setSelDragIdx] = useState(null);
  const [selDragOverIdx, setSelDragOverIdx] = useState(null);

  const [stdName, setStdName] = useState("");
  const [stdId, setStdId] = useState("");
  const [stdPhoto, setStdPhoto] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [testToDelete, setTestToDelete] = useState(null);
  const [localSettings, setLocalSettings] = useState({
        welcomeAudio: "", welcomeAutoPlay: false, successAudio: "", failureAudio: "",
        correctSound: "", wrongSound: "", last10SecondsSound: ""
  });

  const [clipboardQIds, setClipboardQIds] = useState([]);
  const [clipboardFolderIds, setClipboardFolderIds] = useState([]);
  const [clipboardAction, setClipboardAction] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState([]);

  const [selectedPoolQs, setSelectedPoolQs] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  // --- SEÇİMLERİM: kaydedilmiş klasör / soru seçimleri (settings/folder_selections) ---
  const [selPanel, setSelPanel] = useState(false);
  const [savedSels, setSavedSels] = useState(null); // null = henüz okunmadı
  const [selName, setSelName] = useState('');
  const selDocRef = () => doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'folder_selections');
  const toggleSelPanel = async () => {
    setSelPanel(o => !o);
    if (savedSels !== null) return;
    try { const snap = await getDocFromServer(selDocRef()); setSavedSels(snap.exists() ? (snap.data().list || []) : []); }
    catch (e) { console.error('seçimler okunamadı', e); setSavedSels([]); }
  };
  const writeSels = async (list) => {
    setSavedSels(list);
    try { await setDoc(selDocRef(), { list, updatedAt: serverTimestamp() }); }
    catch (e) { console.error(e); alert('seçimler kaydedilemedi.'); }
  };
  const saveCurrentSel = () => {
    if (!selectedFolders.length && !selectedPoolQs.length) { alert('önce klasör (veya soru) kutucuklarını işaretleyin.'); return; }
    const list = savedSels || [];
    const name = selName.trim() || `seçim ${list.length + 1}`;
    writeSels([...list, { id: Date.now().toString(36), name, folders: [...selectedFolders], qs: [...selectedPoolQs] }]);
    setSelName('');
  };
  const applySel = (sel) => {
    const live = new Set(folders.map(f => f.id));
    setSelectedFolders((sel.folders || []).filter(id => live.has(id)));
    setSelectedPoolQs([...(sel.qs || [])]);
  };
  const deleteSel = (sel) => { if (window.confirm(`"${sel.name}" seçimi silinsin mi?`)) writeSels((savedSels || []).filter(x => x.id !== sel.id)); };
  const [bulkName, setBulkName] = useState("");

  // --- SEÇİLİ KLASÖR VEYA SORULAR İÇİN TOPLU SÜRE VE HAFIZA DEĞİŞTİRME STATE'LERİ ---
  const [bulkTimeLimit, setBulkTimeLimit] = useState(75);
  const [bulkMemoryMode, setBulkMemoryMode] = useState('no_change'); // 'no_change' | 'enable' | 'disable'
  const [bulkMemoryTime, setBulkMemoryTime] = useState(15);
  // Seçili klasör/sorulara toplu ses (ön ses 1, ön ses 2, soru sesi)
  const [bulkAudioSlot, setBulkAudioSlot] = useState('preAudio1');
  const [bulkAudioUrl, setBulkAudioUrl] = useState('');
  // Yeni kaydedilen sorular (elle yazılan + etkileşimli) telefonla sesli okunsun mu?
  const [ttsDefaultOn, setTtsDefaultOn] = useState(() => { try { return localStorage.getItem('ca_tts_default_on') !== 'false'; } catch (_) { return true; } });
  useEffect(() => { try { localStorage.setItem('ca_tts_default_on', String(ttsDefaultOn)); } catch (_) {} }, [ttsDefaultOn]);

  const [loadedFolders, setLoadedFolders] = useState([]);
  const [loadedTests, setLoadedTests] = useState([]);

  const [flashingQIds, setFlashingQIds] = useState([]);
  const [detailModalQ, setDetailModalQ] = useState(null);

// ============================================================================
// --- GRUP: YÖNETİCİ PANELİ - YARDIMCI FONKSİYONLAR VE KOPYALAMA (COPY/PASTE) ---
// ============================================================================
  // --- DENEME PROJESİNE AKTARMA (SINIRSIZ) ---
  // Eskiden 400'lük sabit gruplar Firestore'un ~10 MB toplu yazma sınırına
  // takılıyor, çok soru seçilince aktarım hata veriyordu. Artık boyuta göre
  // otomatik parçalanıyor; istenirse TÜM sorular tek tuşla aktarılabiliyor.
  const TEST_APP_ID = 'cocuk-akademi-test-projesi';

  const copyQuestionsToTestProject = async (finalQuestionsToCopy, foldersToCopy) => {
    const testFolderRef = doc(db, 'artifacts', TEST_APP_ID, 'public', 'data', 'settings', 'folder_structure');
    let testFolders = [];
    try {
      const testFolderSnap = await getDocFromServer(testFolderRef);
      if (testFolderSnap.exists()) testFolders = testFolderSnap.data().list || [];
    } catch (e) { console.log("Deneme projesinde henüz klasör ayarı yok, sorun değil."); }

    const mergedFoldersMap = new Map();
    testFolders.forEach(f => mergedFoldersMap.set(f.id, f));
    foldersToCopy.forEach(f => mergedFoldersMap.set(f.id, f));
    await setDoc(testFolderRef, { list: Array.from(mergedFoldersMap.values()) });

    const ops = finalQuestionsToCopy.map(q => {
      const { id, ...cleanData } = q;
      return { type: 'set', ref: doc(db, 'artifacts', TEST_APP_ID, 'public', 'data', 'questions', q.id), data: { ...cleanData, copiedAt: serverTimestamp() } };
    });
    setCopyProgress(`aktarılıyor... 0/${ops.length}`);
    const result = await commitOpsInChunks(db, ops, { onProgress: (done, total) => setCopyProgress(`aktarılıyor... ${done}/${total}`) });
    setCopyProgress("");
    return result;
  };

  const collectFoldersWithParents = (questionList) => {
    const allNeededFoldersMap = new Map();
    const addFolderWithParents = (fId) => {
      if (!fId || allNeededFoldersMap.has(fId)) return;
      const folderObj = folders.find(f => f.id === fId);
      if (folderObj) {
        allNeededFoldersMap.set(folderObj.id, folderObj);
        if (folderObj.parentId) addFolderWithParents(folderObj.parentId);
      }
    };
    questionList.forEach(q => addFolderWithParents(q.folderId));
    return Array.from(allNeededFoldersMap.values());
  };

  const handleCopyToTestEnvironment = async () => {
    if (selectedPoolQs.length === 0 && selectedFolders.length === 0) {
      alert("Lütfen deneme ortamına aktarmak istediğiniz soruları veya klasörleri seçin.");
      return;
    }

    setIsSaving(true);
    try {
      let allTargetFolders = [];
      selectedFolders.forEach(fId => {
        allTargetFolders = [...allTargetFolders, ...getAllDescendantFolderIds(fId)];
      });
      const uniqueFolderIds = [...new Set(allTargetFolders)];

      let folderQuestions = [];
      if (uniqueFolderIds.length > 0) {
        const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
        for (let i = 0; i < uniqueFolderIds.length; i += 30) {
          const chunk = uniqueFolderIds.slice(i, i + 30);
          const snap = await getDocsFromServer(query(qRef, where('folderId', 'in', chunk)));
          snap.docs.forEach(d => folderQuestions.push({ ...d.data(), id: d.id }));
        }
      }

      const individuallySelectedQs = selectedPoolQs.map(id => questions.find(q => q.id === id)).filter(Boolean);
      const allQuestionsToCopyMap = new Map();
      [...folderQuestions, ...individuallySelectedQs].forEach(q => allQuestionsToCopyMap.set(q.id, q));
      const finalQuestionsToCopy = Array.from(allQuestionsToCopyMap.values());

      if (finalQuestionsToCopy.length === 0) {
        alert("Seçilen klasörlerde soru bulunamadı.");
        setIsSaving(false);
        return;
      }

      if (!window.confirm(`KLASÖR YAPISIYLA BİRLİKTE toplam ${finalQuestionsToCopy.length} soruyu Deneme Projesine kopyalamak istediğinize emin misiniz?`)) {
        setIsSaving(false);
        return;
      }

      const result = await copyQuestionsToTestProject(finalQuestionsToCopy, collectFoldersWithParents(finalQuestionsToCopy));
      alert(`Harika! Klasörler HİÇ BOZULMADAN ${result.written} soru Deneme (Test) projesine aktarıldı!${result.skipped.length ? `\n\n${result.skipped.length} soru 1 MB sınırını aştığı için atlandı.` : ''}`);
    } catch (error) {
      console.error("Kopyalama hatası:", error);
      alert("Kopyalama sırasında bir hata oluştu: " + (error?.message || ''));
    }
    setCopyProgress("");
    setIsSaving(false);
  };

  // Tüm soru havuzunu (ve tüm klasör yapısını) deneme projesine aktarır
  const handleCopyAllToTestEnvironment = async () => {
    if (!window.confirm("TÜM sorular ve TÜM klasör yapısı Deneme Projesine kopyalansın mı? (soru sayısı fazlaysa birkaç dakika sürebilir)")) return;
    setIsSaving(true);
    try {
      setCopyProgress("sorular okunuyor...");
      const snap = await getDocsFromServer(collection(db, 'artifacts', appId, 'public', 'data', 'questions'));
      const all = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      if (all.length === 0) { alert("aktarılacak soru bulunamadı."); setIsSaving(false); setCopyProgress(""); return; }
      const result = await copyQuestionsToTestProject(all, folders);
      alert(`Tamamlandı! ${result.written} soru ve ${folders.length} klasör Deneme projesine aktarıldı.${result.skipped.length ? `\n${result.skipped.length} soru 1 MB sınırını aştığı için atlandı.` : ''}`);
    } catch (error) {
      console.error("Toplu kopyalama hatası:", error);
      alert("Kopyalama sırasında bir hata oluştu: " + (error?.message || ''));
    }
    setCopyProgress("");
    setIsSaving(false);
  };

  useEffect(() => {
    if (gridSubTab === 'box_coding' && codingMethod === 'method3') {
      setCodingMethod('method1');
    }
  }, [gridSubTab, codingMethod]);

// ============================================================================
// --- GRUP: YÖNETİCİ PANELİ - ŞABLON UYGULAMA (TEMPLATE) FONKSİYONLARI ---
// ============================================================================
  const applyDotTemplate = (sizeNum, tplIndex) => {
    const list = DOT_TEMPLATES[sizeNum];
    if (!list || list.length === 0) {
      setDotRows(sizeNum);
      setDotCols(sizeNum);
      setDotLines([]);
      setDotTemplateIdx(0);
      return;
    }
    const item = list[tplIndex % list.length] || list[0];
    setDotRows(sizeNum);
    setDotCols(sizeNum);
    setDotTemplateIdx(tplIndex);
    setDotLines([...(item.lines || [])]);
  };

  const applyColorBoxTemplate = (sizeNum, tplIndex) => {
    const list = COLOR_BOX_TEMPLATES[sizeNum];
    if (!list || list.length === 0) {
      setBoxRows(sizeNum);
      setBoxCols(sizeNum);
      setBoxCells({});
      setBoxTemplateIdx(0);
      return;
    }
    const item = list[tplIndex % list.length] || list[0];
    setBoxRows(sizeNum);
    setBoxCols(sizeNum);
    setBoxTemplateIdx(tplIndex);
    setBoxCells({ ...(item.cells || {}) });
  };

  // Bankadan bir sudoku getir (tema seçimi uygulanmış haliyle)
  const getSudokuTpl = (sizeNum, level, tplIndex, themeMode = sudokuThemeMode) => {
    const list = getSudokuBank(sizeNum, level);
    const base = list[tplIndex % list.length] || list[0];
    if (!base) return null;
    return themeMode === 'auto' ? base : applySudokuTheme(base, themeMode);
  };
  const applySudokuTemplate = (sizeNum, tplIndex, level = sudokuLevel, themeMode = sudokuThemeMode) => {
    const t = getSudokuTpl(sizeNum, level, tplIndex, themeMode);
    if (!t) return;
    setSudokuSize(sizeNum);
    setSudokuLevel(level);
    setSudokuThemeMode(themeMode);
    setSudokuTemplateIdx(tplIndex);
    setSudokuSolution({ ...t.solution });
    setSudokuClues({ ...t.clues });
    setSudokuSymbols(t.symbols);
  };
  const sudokuQuestionFromTpl = (t, idx) => ({
    name: `${t.size}x${t.size} Sudoku • ${SUDOKU_LEVELS.find(l => l.id === t.level)?.label || ''} #${idx + 1} (${t.themeLabel})`,
    text: qText.trim() || "Boş kutuları tamamla. Her satırda ve her sütunda her resim bir kez olmalı.",
    image: generateSudokuSvgDataUrl(t.size, t.clues, t.symbols),
    questionType: 'sudoku_grid',
    sudokuGrid: { rows: t.size, cols: t.size, clues: t.clues, solution: t.solution, symbols: t.symbols, level: t.level, theme: t.themeId },
    options: [],
    correctText: 'sudoku_grid',
    correctIndex: 0
  });

  const applyCodingTemplate = (sizeNum, tplIndex) => {
    const list = CODING_TEMPLATES[sizeNum] || CODING_TEMPLATES[3];
    const item = list[tplIndex % list.length] || list[0];
    setCodingSize(sizeNum);
    setCodingTemplateIdx(tplIndex);
    setCodingPath([...(item.path || ['0,0', '0,1', '1,1'])]);
  };

  const applyPatternTemplate = (pType, tplIndex) => {
    const list = PATTERN_TEMPLATES[pType] || PATTERN_TEMPLATES[2];
    const item = list[tplIndex % list.length] || list[0];
    setPatternType(pType);
    setPatternTemplateIdx(tplIndex);
    setPatternCells([...item.cells]);
    setPatternHiddenIndices(item.hiddenIndices ? [...item.hiddenIndices] : [item.cells.length - 2, item.cells.length - 1]);
  };

  const applySymmetryTemplate = (sz, tplIndex) => {
    const list = SYMMETRY_TEMPLATES[sz] || SYMMETRY_TEMPLATES[6];
    const item = list[tplIndex % list.length] || list[0];
    setSymmetrySize(sz);
    setSymmetryTemplateIdx(tplIndex);
    setSymmetryLeftCells({ ...(item.leftCells || {}) });
  };

  const applyMatrixShapeTemplate = (tplIndex) => {
    const item = MATRIX_SHAPE_TEMPLATES[tplIndex % MATRIX_SHAPE_TEMPLATES.length] || MATRIX_SHAPE_TEMPLATES[0];
    setMatrixShapeTplIdx(tplIndex);
    setMatrixShapeData({ ...item });
  };

  const applyMatrixPaintTemplate = (tplIndex) => {
    const item = MATRIX_PAINT_TEMPLATES[tplIndex % MATRIX_PAINT_TEMPLATES.length] || MATRIX_PAINT_TEMPLATES[0];
    setMatrixPaintTplIdx(tplIndex);
    setMatrixPaintData({ ...item });
  };

  const applyNumberConnectTemplate = (lvl, tplIndex) => {
    const list = NUMBER_CONNECT_TEMPLATES[lvl] || NUMBER_CONNECT_TEMPLATES.medium;
    const item = list[tplIndex % list.length] || list[0];
    setNumberConnectLevel(lvl);
    setNumberConnectTplIdx(tplIndex);
    setNumberConnectData({ ...item });
  };

  const applySequenceTemplate = (cnt, lvl, tplIndex) => {
    setSeqCount(cnt);
    setSeqLevel(lvl);
    setSeqTplIdx(tplIndex);
    setSeqPreviewKey(k => k + 1);
  };
  const currentSeqTemplate = (() => {
    const list = SEQUENCE_TEMPLATES[seqCount]?.[seqLevel] || [];
    return list[seqTplIdx % Math.max(1, list.length)] || list[0];
  })();

  const applyMazeTemplate = (lvl, tplIndex) => {
    const list = MAZE_TEMPLATES[lvl] || MAZE_TEMPLATES.easy;
    const item = list[tplIndex % list.length] || list[0];
    setMazeLevel(lvl);
    setMazeTplIdx(tplIndex);
    setMazeData({ ...item });
  };

  const applyBarGraphTemplate = (lvl, tplIndex) => {
    const list = BAR_GRAPH_TEMPLATES[lvl] || BAR_GRAPH_TEMPLATES.easy;
    const item = list[tplIndex % list.length] || list[0];
    setBarGraphLevel(lvl);
    setBarGraphTplIdx(tplIndex);
    setBarGraphData({ ...item });
  };

  // ==========================================================================
  // --- ETKİLEŞİMLİ ŞABLONLARI KAYDETME (üzerine yazmalı + otomatik klasör) ---
  // ==========================================================================
  // Her şablon kalıcı bir kimlik alır (ixKey: "dot|4|17" gibi). Aynı şablon tekrar
  // kaydedilince yeni kopya oluşmaz; eski kaydın ÜZERİNE yazılır (kimlik aynı kaldığı
  // için testlerdeki yeri korunur). Bu sistemden önce kaydedilmiş sorular, aynı ad
  // veya aynı resimle eşleşirse onların da üzerine yazılır.
  const IX_ROOT_FOLDER = 'Etkileşimli Sorular';
  const [ixBusy, setIxBusy] = useState('');

  // "Etkileşimli Sorular › Noktalı Çizim › 4x4 › Kolay" gibi klasör yollarını oluşturur
  const ensureIxFolders = async (paths) => {
    let list = [...folders];
    let changed = false;
    const findOrAdd = (name, parentId) => {
      let f = list.find(x => x.name === name && (x.parentId || null) === (parentId || null));
      if (!f) { f = { id: `folder_${Date.now()}_${Math.floor(Math.random() * 1e6)}`, name, parentId: parentId || null }; list.push(f); changed = true; }
      return f.id;
    };
    const rootId = findOrAdd(IX_ROOT_FOLDER, null);
    const map = new Map();
    paths.forEach(p => {
      const k = (p || []).join(' › ');
      if (map.has(k)) return;
      let pid = rootId; (p || []).forEach(name => { pid = findOrAdd(name, pid); });
      map.set(k, pid);
    });
    if (changed) await saveFolders(list);
    return (p) => map.get((p || []).join(' › ')) || rootId;
  };

  /**
   * entries: [{ key, path: ['Noktalı Çizim', '4x4', 'Kolay'], setId, legacyType, build: () => soruNesnesi }]
   * light: true ise yeni sorular ekrandaki listeye eklenmez (binlerce soruda ekran donmasın)
   */
  const saveInteractiveEntries = async (entries, { label, light = false } = {}) => {
    if (!entries || entries.length === 0) return;
    const setIds = Array.from(new Set(entries.map(e => e.setId)));
    const legacyTypes = Array.from(new Set(entries.map(e => e.legacyType).filter(Boolean)));
    const wantKeys = new Set(entries.map(e => e.key));
    setIsSaving(true);
    setIxBusy('daha önce kaydedilenler kontrol ediliyor...');
    try {
      const keyed = (await findQuestionsByField(db, appId, 'ixSet', setIds)).filter(e => wantKeys.has(e.data.ixKey));
      const legacy = legacyTypes.length ? (await findQuestionsByField(db, appId, 'questionType', legacyTypes)).filter(e => !e.data.ixKey) : [];
      setIxBusy('');
      // Eski sistemle kaydedilmiş sorular: aynı ad veya aynı resim → aynı şablon
      const legacyByName = new Map(); const legacyByImg = new Map();
      legacy.forEach(e => {
        if (e.data.name && !legacyByName.has(`${e.data.questionType}|${e.data.name}`)) legacyByName.set(`${e.data.questionType}|${e.data.name}`, e);
        if (e.data.image && !legacyByImg.has(e.data.image)) legacyByImg.set(e.data.image, e);
      });
      const keyedKeys = new Set(keyed.map(e => e.data.ixKey));
      const usedLegacy = new Set();
      const built = entries.map(en => ({ en, obj: en.build() }));
      const legacyMatched = [];
      built.forEach(({ en, obj }) => {
        if (keyedKeys.has(en.key)) return;
        const hit = legacyByName.get(`${obj.questionType}|${obj.name}`) || (obj.image ? legacyByImg.get(obj.image) : null);
        if (hit && !usedLegacy.has(hit.id)) { usedLegacy.add(hit.id); legacyMatched.push({ ...hit, __key: en.key }); }
      });
      const already = keyed.length + legacyMatched.length;
      const target = qFolderId ? `"${folders.find(f => f.id === qFolderId)?.name || 'seçili'}" klasörüne` : `"${IX_ROOT_FOLDER} › ..." klasörlerine (otomatik)`;
      let msg = `${label ? `${label}\n\n` : ''}${entries.length} soru ${target} kaydedilsin mi?\n(${qTimeLimit} sn, ${isMem ? `hafıza ${memTime} sn` : 'daimi göster'})`;
      if (already > 0) msg += `\n\n⚠️ DİKKAT: Bunlardan ${already} soru daha önce kaydedilmiş.\nTAMAM derseniz ÜZERİNE kaydedilir: eski sorular silinip yerine yenileri yazılır.\nTestlere eklenmiş sorular testteki yerinde kalır.`;
      if (!window.confirm(msg)) { setIsSaving(false); return; }
      setIxBusy('klasörler hazırlanıyor...');
      const folderOf = qFolderId ? (() => qFolderId) : await ensureIxFolders(entries.map(e => e.path));
      const items = built.map(({ en, obj }) => ({
        matchKey: en.key,
        data: {
          ...obj,
          ttsText: obj.ttsText || obj.text || '',
          ttsOn: obj.ttsOn !== undefined ? obj.ttsOn : Boolean(ttsDefaultOn && (obj.ttsText || obj.text)),
          timeLimit: Number(qTimeLimit),
          isMemory: isMem,
          memoryTime: Number(memTime),
          folderId: folderOf(en.path) || null,
          style: defaultStyle,
          ixSet: en.setId,
          ixKey: en.key,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      }));
      const plan = planOverwrite(db, appId, items, [...keyed, ...legacyMatched], e => e.__key || e.data.ixKey);
      const res = await commitOpsInChunks(db, plan.ops, { onProgress: (d, t) => setIxBusy(`kaydediliyor... ${d}/${t}`) });
      await removeIdsFromAllTests(db, appId, plan.deletedIds);
      setTests(prev => stripIdsFromTestState(prev, plan.deletedIds));
      if (light) {
        const byId = new Map(plan.created.map(c => [c.id, c])); const gone = new Set(plan.deletedIds);
        setQuestions(prev => prev.filter(q => !gone.has(q.id)).map(q => byId.get(q.id) || q));
      } else {
        setQuestions(prev => mergeQuestionState(prev, plan.created, plan.deletedIds));
      }
      const yeni = plan.created.length - plan.updatedIds.length;
      alert(`${plan.created.length} soru kaydedildi.${plan.updatedIds.length ? `\n${plan.updatedIds.length} soru eskisinin üzerine yazıldı, ${yeni} soru yeni eklendi.` : ''}${plan.deletedIds.length ? `\n${plan.deletedIds.length} fazla kopya silindi.` : ''}${res.skipped.length ? `\n${res.skipped.length} soru boyut sınırı nedeniyle atlandı.` : ''}`);
    } catch (e) {
      console.error('Toplu kayıt hatası:', e);
      alert('Toplu kayıt sırasında hata oluştu: ' + (e?.message || ''));
    }
    setIxBusy('');
    setIsSaving(false);
  };

  // --- BÜTÜN ETKİLEŞİMLİ ŞABLONLAR (15 alt sekme, tüm boyut ve seviyeler) ---
  // Alt sekmelerdeki düğmelerle AYNI soru üretilir ve aynı kimliği alır; böylece
  // önce tek tek kaydedilmiş olanların da üzerine yazılır.
  const buildAllInteractiveEntries = () => {
    const T = (def) => qText.trim() || def;
    const out = [];
    const push = (setId, legacyType, key, path, build) => out.push({ setId, legacyType, key, path, build });
    // 1. Noktalı çizim
    Object.keys(DOT_TEMPLATES).map(Number).forEach(r => (DOT_TEMPLATES[r] || []).forEach((tpl, i) => push('dot', 'dot_grid', `dot|${r}|${i}`, ['Noktalı Çizim', `${r}x${r}`, DOT_LEVEL_LABELS[tpl.difficulty] || 'Kolay'], () => ({
      name: `${r}x${r} Noktalı Çizim #${i + 1} (${DOT_LEVEL_LABELS[tpl.difficulty] || 'Kolay'})`,
      text: T("Noktaları birleştirerek şekli tamamlayalım."),
      image: generateDotGridSvgDataUrl(r, r, tpl.lines),
      questionType: 'dot_grid',
      dotGrid: { rows: r, cols: r, lines: tpl.lines, difficulty: tpl.difficulty || 'easy' },
      options: [], correctText: 'dot_grid', correctIndex: 0
    }))));
    // 2. Kutu boyama
    Object.keys(COLOR_BOX_TEMPLATES).map(Number).forEach(r => (COLOR_BOX_TEMPLATES[r] || []).forEach((tpl, i) => push('color_box', 'color_grid', `color_box|${r}|${i}`, ['Kutu Boyama', `${r}x${r}`], () => ({
      name: `${r}x${r} Kutu Boyama #${i + 1}`,
      text: T("Örnekteki gibi kutuları uygun renklerle boyayalım."),
      image: generateColorGridSvgDataUrl(r, r, tpl.cells),
      questionType: 'color_grid',
      colorGrid: { rows: r, cols: r, cells: tpl.cells },
      options: [], correctText: 'color_grid', correctIndex: 0
    }))));
    // 3. Sudoku
    [3, 4, 5].forEach(sz => SUDOKU_LEVELS.forEach(l => getSudokuBank(sz, l.id).forEach((_, i) => push('sudoku', 'sudoku_grid', `sudoku|${sz}|${l.id}|${i}`, ['Sudoku', `${sz}x${sz}`, l.label], () => sudokuQuestionFromTpl(getSudokuTpl(sz, l.id, i), i)))));
    // 4-5. Kutu ve çizgi kodlama
    ['box_coding', 'line_coding'].forEach(mode => Object.keys(CODING_TEMPLATES).map(Number).forEach(sz => (CODING_TEMPLATES[sz] || []).forEach((tpl, i) => push(mode, mode, `${mode}|${sz}|${i}`, [mode === 'line_coding' ? 'Çizgi Kodlama' : 'Kutu Kodlama', `${sz}x${sz}`], () => {
      const isLine = mode === 'line_coding';
      const effMethod = (!isLine && codingMethod === 'method3') ? 'method1' : codingMethod;
      const codingData = { mode: isLine ? 'line' : 'box', method: effMethod, rows: sz, cols: sz, path: tpl.path, arrows: tpl.arrows, startImage: codingStartImg || "", targetImage: codingTargetImg || "" };
      return {
        name: `${sz}x${sz} ${isLine ? 'Çizgi Kodlama' : 'Kutu Kodlama'} #${i + 1}`,
        text: T("Köpeği kemiğe ulaştırmak için doğru adımları sırasıyla seç."),
        image: generateCodingGridSvgDataUrl(codingData),
        questionType: isLine ? 'line_coding' : 'box_coding',
        codingGrid: codingData,
        options: [], correctText: isLine ? 'line_coding' : 'box_coding', correctIndex: 0
      };
    }))));
    // 6. Renk örüntüsü
    Object.keys(PATTERN_TEMPLATES).forEach(pt => (PATTERN_TEMPLATES[pt] || []).forEach((tpl, i) => push('color_pattern', 'color_pattern', `color_pattern|${pt}|${i}`, ['Renk Örüntüsü', `${pt}'li`], () => ({
      name: `${pt}'li Renk Örüntüsü #${i + 1}`,
      text: T("Örüntüdeki boş kutuları uygun renkle tamamla."),
      image: generatePatternSvgDataUrl(tpl.cells, tpl.hiddenIndices),
      questionType: 'color_pattern',
      patternGrid: { period: tpl.period, cells: tpl.cells, hiddenIndices: tpl.hiddenIndices },
      options: [], correctText: 'color_pattern', correctIndex: 0
    }))));
    // 7. Simetri
    Object.keys(SYMMETRY_TEMPLATES).map(Number).forEach(sz => (SYMMETRY_TEMPLATES[sz] || []).forEach((tpl, i) => push('symmetry', 'symmetry_grid', `symmetry|${sz}|${i}`, ['Simetri', `${sz}x${sz}`], () => ({
      name: `${sz}x${sz} Simetri #${i + 1} (${tpl.title})`,
      text: T("Sol taraftaki şeklin simetriğini sağ tarafa boyayalım."),
      image: generateSymmetrySvgDataUrl({ size: sz, leftCells: tpl.leftCells }),
      questionType: 'symmetry_grid',
      symmetryGrid: { size: sz, leftCells: tpl.leftCells },
      options: [], correctText: 'symmetry_grid', correctIndex: 0
    }))));
    // 8-9. Tablo oluşturma / boyama
    MATRIX_SHAPE_TEMPLATES.forEach((tpl, i) => push('matrix_shape', 'matrix_shape', `matrix_shape|${i}`, ['Tablo Oluşturma'], () => ({
      name: `Tablo Oluşturma #${i + 1}`,
      text: T("Satır ve sütundaki şekilleri birleştirerek tabloyu tamamla."),
      image: generateMatrixShapeSvgDataUrl(tpl),
      questionType: 'matrix_shape', matrixShapeGrid: tpl,
      options: [], correctText: 'matrix_shape', correctIndex: 0
    })));
    MATRIX_PAINT_TEMPLATES.forEach((tpl, i) => push('matrix_paint', 'matrix_paint', `matrix_paint|${i}`, ['Tablo Boyama'], () => ({
      name: `Tablo Boyama #${i + 1}`,
      text: T("Örnekteki gibi uygun renkleri boyayalım."),
      image: generateMatrixPaintSvgDataUrl(tpl),
      questionType: 'matrix_paint', matrixPaintGrid: tpl,
      options: [], correctText: 'matrix_paint', correctIndex: 0
    })));
    // 10. Sıralı çizgi
    Object.keys(NUMBER_CONNECT_TEMPLATES).forEach(lvl => (NUMBER_CONNECT_TEMPLATES[lvl] || []).forEach((tpl, i) => push('number_connect', 'number_connect', `number_connect|${lvl}|${i}`, ['Sıralı Çizgi', lvl === 'hard' ? 'Zor' : 'Orta'], () => {
      const { id: _i, ...data } = tpl;
      return {
        name: `${lvl === 'hard' ? 'Zor' : 'Orta'} Sıralı Çizgi #${i + 1}`,
        text: T("Üstteki sıraya bak. Şekilleri aynı renk sırasıyla çizgiyle birleştir."),
        image: generateNumberConnectSvgDataUrl(data),
        questionType: 'number_connect', numberConnectGrid: data,
        options: [], correctText: 'number_connect', correctIndex: 0
      };
    })));
    // 11. Labirent
    Object.keys(MAZE_TEMPLATES).forEach(lvl => (MAZE_TEMPLATES[lvl] || []).forEach((tpl, i) => push('maze', 'interactive_maze', `maze|${lvl}|${i}`, ['Labirent', MAZE_LEVELS[lvl]?.label || 'Kolay'], () => {
      const payload = buildMazePayload(tpl, { startImage: mazeStartImg || "", endImage: mazeEndImg || "" });
      return {
        name: `${MAZE_LEVELS[lvl]?.label || 'Kolay'} Labirent #${i + 1}`,
        text: T("Parmağınla doğru yolu takip ederek başlangıçtan hedefe ulaş."),
        image: generateMazeSvgDataUrl(payload),
        questionType: 'interactive_maze', mazeGrid: payload,
        options: [], correctText: 'interactive_maze', correctIndex: 0
      };
    })));
    // 12. Gölge bulma
    Object.keys(SHADOW_QUIZ_TEMPLATES).forEach(lvl => (SHADOW_QUIZ_TEMPLATES[lvl] || []).forEach((tpl, i) => push('shadow_quiz', null, `shadow_quiz|${lvl}|${i}`, ['Gölge Bulma', ({ easy: 'Kolay', medium: 'Orta', hard: 'Zor' })[lvl] || 'Orta'], () => ({
      name: tpl.title,
      text: T("Yukarıdaki resmin doğru gölgesi hangisidir?"),
      image: qCustomAttachmentImg || tpl.mainImage,
      options: tpl.options, correctText: "", correctIndex: tpl.correctIndex
    }))));
    // 13. Grafik oluşturma
    Object.keys(BAR_GRAPH_TEMPLATES).forEach(lvl => (BAR_GRAPH_TEMPLATES[lvl] || []).forEach((tpl, i) => push('bar_graph', 'bar_graph', `bar_graph|${lvl}|${i}`, ['Grafik Oluşturma', lvl === 'easy' ? 'Kolay' : lvl === 'medium' ? 'Orta' : 'Zor'], () => ({
      name: `${lvl === 'easy' ? 'Kolay' : lvl === 'medium' ? 'Orta' : 'Zor'} Grafik Oluşturma #${i + 1}`,
      text: T("Resimleri say ve kaç tane varsa o kadar kutucuk boya."),
      image: generateBarGraphSvgDataUrl(buildBarGraphPayload(tpl)),
      questionType: 'bar_graph', barGraphGrid: buildBarGraphPayload(tpl),
      options: [], correctText: 'bar_graph', correctIndex: 0
    }))));
    // 14. Sırayı takip et
    Object.keys(SEQUENCE_TEMPLATES).forEach(cnt => Object.keys(SEQUENCE_TEMPLATES[cnt] || {}).forEach(lvl => (SEQUENCE_TEMPLATES[cnt][lvl] || []).forEach((tpl, i) => push('sequence_memory', 'sequence_memory', `sequence_memory|${cnt}|${lvl}|${i}`, ['Sırayı Takip Et', `${cnt} Kare`, SEQUENCE_LEVELS[lvl]?.label || lvl], () => {
      const payload = buildSequencePayload(tpl, { allowReplay: seqAllowReplay });
      return {
        name: `${cnt} Kare - ${SEQUENCE_LEVELS[lvl]?.label || lvl} Sırayı Takip Et #${i + 1}`,
        text: T("Kareler hangi sırayla yandı? Sen de aynı sırayla dokun."),
        image: generateSequenceSvgDataUrl(payload),
        questionType: 'sequence_memory', sequenceGrid: payload,
        options: [], correctText: 'sequence_memory', correctIndex: 0
      };
    }))));
    // 15. Olay sıralama
    Object.keys(EVENT_ORDER_LEVELS).forEach(lvl => getEventOrderTemplates(lvl).forEach((tpl, i) => push('event_order', 'event_order', `event_order|${lvl}|${i}`, ['Olay Sıralama', EVENT_ORDER_LEVELS[lvl].label], () => {
      const payload = buildEventOrderPayload(tpl);
      return {
        name: `${EVENT_ORDER_LEVELS[lvl].label} Olay Sıralama #${i + 1} • ${tpl.title}`,
        text: T(EVENT_ORDER_TEXT),
        ttsText: T(EVENT_ORDER_TEXT),
        ttsOn: true,
        image: generateEventOrderSvgDataUrl(payload),
        questionType: 'event_order', eventOrderGrid: payload,
        options: [], correctText: 'event_order', correctIndex: 0
      };
    })));
    return out;
  };
  const saveAllInteractive = async () => {
    const all = buildAllInteractiveEntries();
    await saveInteractiveEntries(all, { label: '"Etkileşimli Sorular" sekmesinin TAMAMI (15 etkinlik, bütün boyut ve seviyeler)', light: true });
  };

  // Alt sekmelerdeki "şablonları soruya dönüştür" düğmeleri.
  // opts: { setId, legacyType, keyOf(tpl, idx), path | pathOf(tpl, idx) }
  const handleBulkGenerateQuestions = async (itemsArray, buildQuestionObjectFn, labelText, opts = {}) => {
    const entries = (itemsArray || []).map((tpl, idx) => ({
      key: opts.keyOf ? opts.keyOf(tpl, idx) : `${opts.setId || 'ix'}|${labelText}|${idx}`,
      path: opts.pathOf ? opts.pathOf(tpl, idx) : (opts.path || [labelText]),
      setId: opts.setId || 'ix',
      legacyType: opts.legacyType,
      build: () => buildQuestionObjectFn(tpl, idx)
    }));
    await saveInteractiveEntries(entries, { label: `"${labelText}"` });
  };

  useEffect(() => {
    if(settings) {
      setLocalSettings({
          welcomeAudio: settings.welcomeAudio || "",
          welcomeAutoPlay: settings.welcomeAutoPlay || false,
          successAudio: settings.successAudio || "",
          failureAudio: settings.failureAudio || "",
          correctSound: settings.correctSound || "",
          wrongSound: settings.wrongSound || "",
          last10SecondsSound: settings.last10SecondsSound || ""
       });
    }
  }, [settings]);

  useEffect(() => {
    if (tab === 'questions' || tab === 'dot_questions' || SUBJECT_TAB_IDS.includes(tab) || tab === 'bilsem_questions' || tab === 'listen_questions' || tab === 'test_archive' || tab === 'tests') {
       if (fetchAdminTests) fetchAdminTests();
    }
    if (tab === 'students') {
       if (fetchAdminChildren) fetchAdminChildren();
    }
    if (tab === 'stats') {
       if (fetchAdminTests) fetchAdminTests();
       if (fetchAdminChildren) fetchAdminChildren();
       if (fetchAdminResponses) fetchAdminResponses();
    }
  }, [tab]);

  const handleTabClick = (newTab) => {
    setTab(newTab);
  };

  // --- SINIFIM OYUN AYARLARI (settings/game_config, appKind: 'ana') ---
  const [anaGameCfg, setAnaGameCfg] = useState(() => mergeGameConfig({}, 'ana'));
  const [anaGameCfgLoaded, setAnaGameCfgLoaded] = useState(false);
  useEffect(() => {
    if ((tab !== 'game' && tab !== 'game_fx') || anaGameCfgLoaded) return;
    loadGameConfig(db, appId, { serverFirst: true, kind: 'ana' }).then(c => { setAnaGameCfg(c); setAnaGameCfgLoaded(true); });
  }, [tab, anaGameCfgLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFetchStats = async () => {
    setIsSaving(true);
    if (fetchStatsFromServer) await fetchStatsFromServer();
    setIsSaving(false);
  };

  const handleLoadFolder = async (fId, force = false) => {
    if (!force && loadedFolders.includes(fId)) return;
    try {
      const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
      let newQs = [];
      if (fId === null) {
          const snap = await getDocsFromServer(query(qRef, orderBy('createdAt', 'desc')));
          newQs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      } else {
          const qQuery = query(qRef, where('folderId', '==', fId));
          const snap = await getDocsFromServer(qQuery);
          newQs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      }
      setQuestions(prev => {
         const map = new Map(prev.map(p => [p.id, p]));
         newQs.forEach(nq => map.set(nq.id, nq));
         return Array.from(map.values());
      });
      if (!loadedFolders.includes(fId)) {
         setLoadedFolders(prev => [...prev, fId]);
      }
    } catch(e) { console.error("klasör soruları yüklenirken hata:", e); }
  };

  const handleLoadTestQs = async (test) => {
    if (!test.questionIds || test.questionIds.length === 0) return;
    if (loadedTests.includes(test.id)) return;

    const missingIds = test.questionIds.filter(id => !questions.some(q => q.id === id));
    if (missingIds.length > 0) {
       let fetched = [];
       for (let i = 0; i < missingIds.length; i += 30) {
          const chunk = missingIds.slice(i, i + 30);
          const qQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), where('__name__', 'in', chunk));
          const snap = await getDocsFromServer(qQuery);
          fetched = [...fetched, ...snap.docs.map(d => ({ ...d.data(), id: d.id }))];
       }
       setQuestions(prev => {
          const map = new Map(prev.map(p => [p.id, p]));
          fetched.forEach(nq => map.set(nq.id, nq));
          return Array.from(map.values());
       });
    }
    setLoadedTests(prev => [...prev, test.id]);
  };

  const handleLoadAllQuestions = async () => {
    const snap = await getDocsFromServer(query(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), orderBy('createdAt', 'desc')));
    setQuestions(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    alert("tüm sorular başarıyla çekildi.");
  };

  const handleQuestionTabSelect = async (mode) => {
    setQuestionDisplayTab(mode);
    if (mode === 'saving') return;

    setLoadingQuestionsTab(true);
    try {
      const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
      let qQuery;
      if (mode === 'last30') {
        qQuery = query(qRef, orderBy('createdAt', 'desc'), limit(30));
      } else if (mode === 'last100') {
        qQuery = query(qRef, orderBy('createdAt', 'desc'), limit(100));
      } else {
        qQuery = query(qRef, orderBy('createdAt', 'desc'));
      }
      const snap = await getDocsFromServer(qQuery);
      const fetched = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setQuestions(prev => {
        const map = new Map(prev.map(item => [item.id, item]));
        fetched.forEach(item => map.set(item.id, item));
        return Array.from(map.values());
      });
    } catch (e) {
      console.error("sorular çekilirken hata:", e);
    } finally {
      setLoadingQuestionsTab(false);
    }
  };

  const getDisplayImage = (q) => {
      if (q.customAttachmentImage) return q.customAttachmentImage;
      if (q.questionType === 'dot_grid' || (q.dotGrid && q.dotGrid.rows)) {
          return generateDotGridSvgDataUrl(q.dotGrid?.rows || 3, q.dotGrid?.cols || 3, q.dotGrid?.lines || []);
      }
      if (q.questionType === 'color_grid' || (q.colorGrid && q.colorGrid.rows)) {
          return generateColorGridSvgDataUrl(q.colorGrid?.rows || 3, q.colorGrid?.cols || 3, q.colorGrid?.cells || {});
      }
      if (q.questionType === 'sudoku_grid' || (q.sudokuGrid && q.sudokuGrid.rows)) {
          return generateSudokuSvgDataUrl(q.sudokuGrid?.rows || 3, q.sudokuGrid?.clues || {}, q.sudokuGrid?.symbols);
      }
      if (q.questionType === 'box_coding' || q.questionType === 'line_coding' || (q.codingGrid && q.codingGrid.rows)) {
          return generateCodingGridSvgDataUrl(q.codingGrid || {});
      }
      if (q.questionType === 'color_pattern' || (q.patternGrid && q.patternGrid.cells)) {
          return generatePatternSvgDataUrl(q.patternGrid?.cells || [], q.patternGrid?.hiddenIndices || []);
      }
      if (q.questionType === 'symmetry_grid' || (q.symmetryGrid && q.symmetryGrid.size)) {
          return generateSymmetrySvgDataUrl(q.symmetryGrid || {});
      }
      if (q.questionType === 'matrix_shape' || q.matrixShapeGrid) {
          return generateMatrixShapeSvgDataUrl(q.matrixShapeGrid || {});
      }
      if (q.questionType === 'matrix_paint' || q.matrixPaintGrid) {
          return generateMatrixPaintSvgDataUrl(q.matrixPaintGrid || {});
      }
      if (q.questionType === 'number_connect' || q.numberConnectGrid) {
          return generateNumberConnectSvgDataUrl(q.numberConnectGrid || {});
      }
      if (q.questionType === 'interactive_maze' || q.mazeGrid) {
          return generateMazeSvgDataUrl(q.mazeGrid || {});
      }
      if (q.questionType === 'bar_graph' || q.barGraphGrid) {
          return generateBarGraphSvgDataUrl(q.barGraphGrid || {});
      }
      if (q.questionType === 'sequence_memory' || q.sequenceGrid) {
          return generateSequenceSvgDataUrl(q.sequenceGrid || {});
      }
      if (q.questionType === 'event_order' || q.eventOrderGrid) {
          return generateEventOrderSvgDataUrl(q.eventOrderGrid || {});
      }
      if (q.image) return q.image;
      if (q.options && q.correctIndex !== undefined && q.options[q.correctIndex]?.image) {
          return q.options[q.correctIndex].image;
      }
      return null;
  };

  const getQuestionIncludedTests = (qId) => {
      const list = [];
      tests.forEach(t => {
          if (t.id === editingT) return;
          if ((t.questionIds || []).includes(qId)) {
              list.push(t.name);
          }
      });
      if (tSelectedQs.includes(qId)) {
          const currentActiveName = tName.trim()
              ? `${tName.trim()} (düzenleniyor)`
              : editingT
                  ? `${tests.find(t => t.id === editingT)?.name || 'test'} (düzenleniyor)`
                  : 'yeni test (seçili)';
          list.push(currentActiveName);
      }
      return list;
  };

  const triggerQuestionGreenFlash = (qId) => {
      setFlashingQIds(prev => (prev.includes(qId) ? prev : [...prev, qId]));
      setTimeout(() => {
          setFlashingQIds(prev => prev.filter(id => id !== qId));
      }, 1000);
  };

  // Hikâye soruları: aynı hikâyenin soruları birlikte ve 1-2-3 sırasıyla durur
  const qLookup = (id) => questions.find(item => item.id === id);
  // Sorular yüklendikçe seçili listeyi düzelt (eski testlerde ters kaydedilmiş hikâyeler hemen doğru görünür)
  useEffect(() => {
    if (tSelectedQs.length < 2) return;
    const byId = new Map(questions.map(q => [q.id, q]));
    setTSelectedQs(prev => { const n = normalizeStoryOrder(prev, (id) => byId.get(id)); return n.join('|') === prev.join('|') ? prev : n; });
  }, [questions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddQuestionToTest = (qId) => {
      const q = qLookup(qId);
      setTSelectedQs(prev => {
          if (q?.storyId) {
              // hikâyenin diğer soruları da sırasıyla eklenir
              const ids = storySiblingIds(q, questions, prev).filter(id => !prev.includes(id));
              return normalizeStoryOrder([...prev, ...ids], qLookup);
          }
          return prev.includes(qId) ? prev : [...prev, qId];
      });
      triggerQuestionGreenFlash(qId);
  };

  // Yukarı / aşağı oklar: hikâye soruları blok halinde taşınır
  const moveQuestion = (index, direction) => {
      setTSelectedQs(prev => stepBlock(prev, qLookup, index, direction));
  };

  // Seçilenler listesinde sürükleyerek yer değiştirme (hikâye bloğu bölünmez)
  const reorderSelected = (fromIdx, toIdx) => {
    if (fromIdx === null || toIdx === null || fromIdx === toIdx) return;
    setTSelectedQs(prev => moveBlock(prev, qLookup, fromIdx, toIdx));
  };

  const sortedChildrenList = [...childrenList].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  // --- YILDIZLAR (okuma tasarruflu) ---
  // Cevaplar okunmaz. Yıldız, öğrencinin kendi cihazının oyun kaydına yazdığı özetten gelir
  // (öğrenci kaydı başına 1 okuma). Yeni sürümle henüz girmemiş öğrenci için "hesapla" düğmesi
  // sadece o öğrencinin cevaplarını okur ve sonucu kaydına yazar (bir daha okunmaz).
  const refreshChildrenFromServer = async () => {
    setIsSaving(true);
    try {
      const snap = await getDocsFromServer(collection(db, 'artifacts', appId, 'public', 'data', 'children'));
      setChildrenList(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch (e) { console.error(e); alert('öğrenciler yenilenemedi.'); }
    setIsSaving(false);
  };
  const computeStarsFor = async (child) => {
    setStarBusy(child.id);
    try {
      let tlist = tests;
      if (!tlist.length) {
        const ts = await getDocsFromServer(collection(db, 'artifacts', appId, 'public', 'data', 'tests'));
        tlist = ts.docs.map(d => ({ ...d.data(), id: d.id }));
      }
      const snap = await getDocsFromServer(query(collection(db, 'artifacts', appId, 'public', 'data', 'responses'), where('childId', '==', child.childId)));
      const resp = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      // öğrenci uygulamasıyla aynı kural: yıldız sadece ödev testlerinden (ayarlanan miktarda); kasadaki eski yıldızlar korunur
      const cfgA = anaGameCfgLoaded ? anaGameCfg : await loadGameConfig(db, appId, { serverFirst: true, kind: 'ana' });
      const pub = tlist.filter(t => t.isPublished !== false);
      const bank = computeBank(child, pub, resp, cfgA).bank; // eski haritadan kazanılan yıldızlar da sayılır
      const earned = Math.max(0, getEarnedStars({ ...child, manualStars: 0, game: { ...(child.game || {}), bank } }, pub, resp, { ...cfgA, welcomeStars: 0 }));
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'children', child.id), { 'game.tstars': earned });
      setChildrenList(prev => prev.map(c => c.id === child.id ? { ...c, game: { ...(c.game || {}), tstars: earned } } : c));
    } catch (e) { console.error(e); alert('yıldız hesaplanamadı.'); }
    setStarBusy(null);
  };

  // Soru kaydedildiğinde eğer "Sabitle" (keepSettingsPinned) açıksa Süre, Hafıza ve Klasör ayarlarına DOKUNMAZ!
  const resetQ = () => {
    setEditingQ(null); setQName(""); setQText(""); setQImg(""); setQVid(""); setQAud("");
    setQPreAud1(""); setQPreAud2(""); setQCustomAttachmentImg("");
    if (!keepSettingsPinned) {
      setQTimeLimit(75);
      setIsMem(false);
      setMemTime(15);
      setQFolderId("");
    }
    setQOpts([{text:"",image:"",audio:""}, {text:"",image:"",audio:""}, {text:"",image:"",audio:""}]); setCorrectIdx(null);
  };

  const startEditQ = (q) => {
    setEditingQ(q.id); setQName(q.name || ""); setQText(q.text || ""); setQImg(q.image || "");
    setQVid(q.video || ""); setQAud(q.audio || ""); setQPreAud1(q.preAudio1 || q.preAudio || "");
    setQPreAud2(q.preAudio2 || ""); setQCustomAttachmentImg(q.customAttachmentImage || "");
    setQTimeLimit(q.timeLimit || 75); setIsMem(q.isMemory || false);
    setMemTime(q.memoryTime || 15);
    setQFolderId(q.folderId || "");

    if (q.questionType === 'dot_grid' || (q.dotGrid && q.dotGrid.rows)) {
      setDotRows(q.dotGrid?.rows || 3);
      setDotCols(q.dotGrid?.cols || 3);
      setDotLines(q.dotGrid?.lines || []);
      setTab('dot_questions');
      setGridSubTab('dot');
    } else if (q.questionType === 'color_grid' || (q.colorGrid && q.colorGrid.rows)) {
      setBoxRows(q.colorGrid?.rows || 3);
      setBoxCols(q.colorGrid?.cols || 3);
      setBoxCells(q.colorGrid?.cells || {});
      setTab('dot_questions');
      setGridSubTab('color_box');
    } else if (q.questionType === 'sudoku_grid' || (q.sudokuGrid && q.sudokuGrid.rows)) {
      setSudokuSize(q.sudokuGrid?.rows || 3);
      setSudokuClues(q.sudokuGrid?.clues || {});
      setSudokuSolution(q.sudokuGrid?.solution || {});
      setSudokuSymbols(q.sudokuGrid?.symbols || Array.from({ length: q.sudokuGrid?.rows || 3 }, (_, i) => String(i + 1)));
      if (q.sudokuGrid?.level) setSudokuLevel(q.sudokuGrid.level);
      setTab('dot_questions');
      setGridSubTab('sudoku');
    } else if (q.questionType === 'box_coding' || q.questionType === 'line_coding' || (q.codingGrid && q.codingGrid.rows)) {
      const mode = q.codingGrid?.mode || (q.questionType === 'line_coding' ? 'line' : 'box');
      setCodingSize(q.codingGrid?.rows || 3);
      setCodingMethod(q.codingGrid?.method || 'method1');
      setCodingPath(q.codingGrid?.path || ['0,0', '0,1', '1,1']);
      setCodingStartImg(q.codingGrid?.startImage || "");
      setCodingTargetImg(q.codingGrid?.targetImage || "");
      setTab('dot_questions');
      setGridSubTab(mode === 'line' ? 'line_coding' : 'box_coding');
    } else if (q.questionType === 'color_pattern' || (q.patternGrid && q.patternGrid.cells)) {
      setPatternType(q.patternGrid?.period || 2);
      setPatternCells(q.patternGrid?.cells || []);
      setPatternHiddenIndices(q.patternGrid?.hiddenIndices || []);
      setTab('dot_questions');
      setGridSubTab('color_pattern');
    } else if (q.questionType === 'symmetry_grid' || (q.symmetryGrid && q.symmetryGrid.size)) {
      setSymmetrySize(q.symmetryGrid?.size || 6);
      setSymmetryLeftCells(q.symmetryGrid?.leftCells || {});
      setTab('dot_questions');
      setGridSubTab('symmetry');
    } else if (q.questionType === 'matrix_shape' || q.matrixShapeGrid) {
      setMatrixShapeData(q.matrixShapeGrid);
      setTab('dot_questions');
      setGridSubTab('matrix_shape');
    } else if (q.questionType === 'matrix_paint' || q.matrixPaintGrid) {
      setMatrixPaintData(q.matrixPaintGrid);
      setTab('dot_questions');
      setGridSubTab('matrix_paint');
    } else if (q.questionType === 'number_connect' || q.numberConnectGrid) {
      setNumberConnectLevel(q.numberConnectGrid?.level || 'medium');
      setNumberConnectData(q.numberConnectGrid);
      setTab('dot_questions');
      setGridSubTab('number_connect');
    } else if (q.questionType === 'interactive_maze' || q.mazeGrid) {
      setMazeLevel(q.mazeGrid?.level || 'easy');
      setMazeData(q.mazeGrid);
      setMazeStartImg(q.mazeGrid?.startImage || "");
      setMazeEndImg(q.mazeGrid?.endImage || "");
      setTab('dot_questions');
      setGridSubTab('maze');
    } else if (q.questionType === 'bar_graph' || q.barGraphGrid) {
      setBarGraphLevel(q.barGraphGrid?.level || 'easy');
      setBarGraphData(q.barGraphGrid);
      setBarGraphIconImages(Array.isArray(q.barGraphGrid?.iconImages) ? q.barGraphGrid.iconImages : []);
      setTab('dot_questions');
      setGridSubTab('bar_graph');
    } else if (q.questionType === 'sequence_memory' || q.sequenceGrid) {
      const sg = q.sequenceGrid || {};
      setSeqCount(sg.squareCount || 4);
      setSeqLevel(sg.level || 'easy');
      setSeqAllowReplay(sg.allowReplay !== false);
      setTab('dot_questions');
      setGridSubTab('sequence_memory');
    } else if (q.questionType === 'event_order' || q.eventOrderGrid) {
      setEoLevel(q.eventOrderGrid?.level || 'easy');
      setTab('dot_questions');
      setGridSubTab('event_order');
    } else {
      const normalizedOpts = (q.options || [{text:"",image:"",audio:""}, {text:"",image:"",audio:""}, {text:"",image:"",audio:""}]).map(o => ({
        text: o.text || "",
        image: o.image || "",
        audio: o.audio || "",
        ...(o.ttsText ? { ttsText: o.ttsText } : {}) // telefonla okunan şık metni korunsun
      }));
      setQOpts(normalizedOpts);
      const cIdx = q.correctIndex !== undefined ? q.correctIndex : (q.options || []).findIndex(o => o.text === q.correctText);
      setCorrectIdx(cIdx !== -1 ? cIdx : null);
      setTab('questions');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveQ = async () => {
      if (correctIdx === null) { console.warn("lütfen doğru cevabı seçin."); return; }
      setIsSaving(true);
      const d = {
          name: qName.trim(),
          text: qText.trim(), image: qImg || "", video: qVid || "", audio: qAud || "",
          preAudio1: qPreAud1 || "", preAudio2: qPreAud2 || "",
          timeLimit: Number(qTimeLimit), isMemory: isMem, memoryTime: Number(memTime), options: qOpts,
          correctText: qOpts[correctIdx].text, correctIndex: correctIdx,
          ttsText: qText.trim(), ttsOn: Boolean(ttsDefaultOn && qText.trim()),
          folderId: qFolderId || null,
          updatedAt: serverTimestamp(),
          style: editingQ ? undefined : defaultStyle
      };
      if (editingQ) delete d.style;
      try {
          if (editingQ) {
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', editingQ), d);
              setQuestions(prev => prev.map(item => item.id === editingQ ? { ...item, ...d, id: editingQ } : item));
          } else {
              const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), {...d, createdAt: serverTimestamp()});
              setQuestions(prev => [{ ...d, id: docRef.id, createdAt: {seconds: Math.floor(Date.now() / 1000)} }, ...prev]);
          }
          resetQ();
      } catch(e) { console.error(e); }
      setIsSaving(false);
  };

  const persistInteractivePayload = async (payload) => {
    setIsSaving(true);
    const d = {
      ...payload,
      ttsText: payload.ttsText || payload.text || '',
      ttsOn: payload.ttsOn !== undefined ? payload.ttsOn && ttsDefaultOn : ttsDefaultOn,
      customAttachmentImage: qCustomAttachmentImg || "",
      video: qVid || "",
      audio: qAud || "",
      preAudio1: qPreAud1 || "",
      preAudio2: qPreAud2 || "",
      timeLimit: Number(qTimeLimit),
      isMemory: isMem,
      memoryTime: Number(memTime),
      folderId: qFolderId || null,
      updatedAt: serverTimestamp(),
      style: editingQ ? undefined : defaultStyle
    };
    if (editingQ) delete d.style;
    try {
      if (editingQ) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', editingQ), d);
        setQuestions(prev => prev.map(item => item.id === editingQ ? { ...item, ...d, id: editingQ } : item));
      } else {
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), { ...d, createdAt: serverTimestamp() });
        setQuestions(prev => [{ ...d, id: docRef.id, createdAt: { seconds: Math.floor(Date.now() / 1000) } }, ...prev]);
      }
      resetQ();
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const saveDotQ = async () => {
    const normalized = normalizeDotLines(dotLines);
    if (normalized.length === 0) {
      alert("lütfen noktaları birleştirerek en az bir çizgi çizin.");
      return;
    }
    const safeR = Math.max(1, Math.min(10, Number(dotRows) || 3));
    const safeC = Math.max(1, Math.min(10, Number(dotCols) || 3));
    const svgPreview = generateDotGridSvgDataUrl(safeR, safeC, normalized);
    await persistInteractivePayload({
      name: qName.trim() || `${safeR}x${safeC} noktalı soru`,
      text: qText.trim(),
      image: svgPreview,
      questionType: 'dot_grid',
      dotGrid: { rows: safeR, cols: safeC, lines: normalized },
      options: [],
      correctText: 'dot_grid',
      correctIndex: 0
    });
  };

  const saveColorBoxQ = async () => {
    const normalizedCells = normalizeColorCells(boxCells);
    if (Object.keys(normalizedCells).length === 0) {
      alert("lütfen en az bir kutuyu boyayın.");
      return;
    }
    const safeR = Math.max(1, Math.min(10, Number(boxRows) || 3));
    const safeC = Math.max(1, Math.min(10, Number(boxCols) || 3));
    const svgPreview = generateColorGridSvgDataUrl(safeR, safeC, normalizedCells);
    await persistInteractivePayload({
      name: qName.trim() || `${safeR}x${safeC} kutu boyama`,
      text: qText.trim(),
      image: svgPreview,
      questionType: 'color_grid',
      colorGrid: { rows: safeR, cols: safeC, cells: normalizedCells },
      options: [],
      correctText: 'color_grid',
      correctIndex: 0
    });
  };

  const saveSudokuQ = async () => {
    const n = Math.max(3, Math.min(5, Number(sudokuSize) || 3));
    if (Object.keys(sudokuClues).length >= n * n) {
      alert("Lütfen tablodaki bazı sayıların üzerine tıklayarak silin ki çocukların dolduracağı boş kutular (?) oluşsun.");
      return;
    }
    const svgPreview = generateSudokuSvgDataUrl(n, sudokuClues, sudokuSymbols);
    await persistInteractivePayload({
      name: qName.trim() || `${n}x${n} Sudoku • ${SUDOKU_LEVELS.find(l => l.id === sudokuLevel)?.label || ''} #${sudokuTemplateIdx + 1}`,
      text: qText.trim() || "Boş kutuları tamamla. Her satırda ve her sütunda her resim bir kez olmalı.",
      image: svgPreview,
      questionType: 'sudoku_grid',
      sudokuGrid: { rows: n, cols: n, clues: sudokuClues, solution: sudokuSolution, symbols: sudokuSymbols, level: sudokuLevel },
      options: [],
      correctText: 'sudoku_grid',
      correctIndex: 0
    });
  };

  const saveCodingQ = async () => {
    if (!codingPath || codingPath.length < 2) {
      alert("Lütfen en az 2 adımlık bir yol belirleyin.");
      return;
    }
    const isLine = gridSubTab === 'line_coding';
    const effectiveMethod = (!isLine && codingMethod === 'method3') ? 'method1' : codingMethod;
    const n = Math.max(3, Math.min(6, Number(codingSize) || 3));
    const arrows = getArrowsFromPath(codingPath);
    const codingData = {
      mode: isLine ? 'line' : 'box',
      method: effectiveMethod,
      rows: n,
      cols: n,
      path: codingPath,
      arrows,
      startImage: codingStartImg || "",
      targetImage: codingTargetImg || ""
    };
    const svgPreview = generateCodingGridSvgDataUrl(codingData);
    const methodLabel = effectiveMethod === 'method1' ? '1. Yöntem' : effectiveMethod === 'method2' ? '2. Yöntem' : '3. Yöntem - Oksuz Yol';
    await persistInteractivePayload({
      name: qName.trim() || `${n}x${n} ${isLine ? 'Çizgi Kodlama' : 'Kutu Kodlama'} (${methodLabel})`,
      text: qText.trim(),
      image: svgPreview,
      questionType: isLine ? 'line_coding' : 'box_coding',
      codingGrid: codingData,
      options: [],
      correctText: isLine ? 'line_coding' : 'box_coding',
      correctIndex: 0
    });
  };

  const savePatternQ = async () => {
    if (!patternHiddenIndices || patternHiddenIndices.length === 0) {
      alert("Lütfen örüntüdeki bazı kutulara tıklayarak gizleyin (?) ki çocuklar tamamlasın.");
      return;
    }
    const svgPreview = generatePatternSvgDataUrl(patternCells, patternHiddenIndices);
    await persistInteractivePayload({
      name: qName.trim() || `${patternType}'li Renk Örüntüsü`,
      text: qText.trim(),
      image: svgPreview,
      questionType: 'color_pattern',
      patternGrid: { period: patternType, cells: patternCells, hiddenIndices: patternHiddenIndices },
      options: [],
      correctText: 'color_pattern',
      correctIndex: 0
    });
  };

  const saveSymmetryQ = async () => {
    const symData = { size: symmetrySize, leftCells: symmetryLeftCells };
    const svgPreview = generateSymmetrySvgDataUrl(symData);
    await persistInteractivePayload({
      name: qName.trim() || `${symmetrySize}x${symmetrySize} Simetri Çalışması #${symmetryTemplateIdx + 1}`,
      text: qText.trim(),
      image: svgPreview,
      questionType: 'symmetry_grid',
      symmetryGrid: symData,
      options: [],
      correctText: 'symmetry_grid',
      correctIndex: 0
    });
  };

  const saveMatrixShapeQ = async () => {
    const svgPreview = generateMatrixShapeSvgDataUrl(matrixShapeData);
    await persistInteractivePayload({
      name: qName.trim() || `Tablo Oluşturma (Şekil Matrisi) #${matrixShapeTplIdx + 1}`,
      text: qText.trim(),
      image: svgPreview,
      questionType: 'matrix_shape',
      matrixShapeGrid: matrixShapeData,
      options: [],
      correctText: 'matrix_shape',
      correctIndex: 0
    });
  };

  const saveMatrixPaintQ = async () => {
    const svgPreview = generateMatrixPaintSvgDataUrl(matrixPaintData);
    await persistInteractivePayload({
      name: qName.trim() || `Tablo Boyama #${matrixPaintTplIdx + 1}`,
      text: qText.trim(),
      image: svgPreview,
      questionType: 'matrix_paint',
      matrixPaintGrid: matrixPaintData,
      options: [],
      correctText: 'matrix_paint',
      correctIndex: 0
    });
  };

  const saveNumberConnectQ = async () => {
    const svgPreview = generateNumberConnectSvgDataUrl(numberConnectData);
    const lvlLabel = numberConnectData?.level === 'hard' ? 'Zor' : numberConnectData?.level === 'medium' ? 'Orta' : '';
    await persistInteractivePayload({
      name: qName.trim() || `${lvlLabel ? lvlLabel + ' ' : ''}Sıralı Çizgi #${numberConnectTplIdx + 1}`,
      text: qText.trim(),
      image: svgPreview,
      questionType: 'number_connect',
      numberConnectGrid: numberConnectData,
      options: [],
      correctText: 'number_connect',
      correctIndex: 0
    });
  };

  // DÜZELTME: Labirent artık kaydediliyor. Eskiden duvar matrisi (dizi içinde dizi)
  // olduğu için Firestore kaydı reddediyordu. buildMazePayload satırları metne çevirir.
  const saveMazeQ = async () => {
    const payload = buildMazePayload({ ...mazeData, level: mazeData?.level || mazeLevel }, { startImage: mazeStartImg || "", endImage: mazeEndImg || "" });
    const svgPreview = generateMazeSvgDataUrl(payload);
    const lvlLabel = MAZE_LEVELS[payload.level]?.label || 'Kolay';
    await persistInteractivePayload({
      name: qName.trim() || `${lvlLabel} Labirent #${mazeTplIdx + 1}`,
      text: qText.trim(),
      image: svgPreview,
      questionType: 'interactive_maze',
      mazeGrid: payload,
      options: [],
      correctText: 'interactive_maze',
      correctIndex: 0
    });
  };

  const saveShadowQuizQ = async () => {
    const list = SHADOW_QUIZ_TEMPLATES[shadowLevel] || SHADOW_QUIZ_TEMPLATES.medium;
    const item = list[shadowTplIdx % list.length] || list[0];
    await persistInteractivePayload({
      name: qName.trim() || item.title,
      text: qText.trim() || "Yukarıdaki resmin doğru gölgesi hangisidir?",
      image: qCustomAttachmentImg || item.mainImage,
      options: item.options,
      correctText: "",
      correctIndex: item.correctIndex
    });
  };

  const buildBarGraphPayload = (tpl) => {
    const icons = tpl?.icons || [];
    const iconImages = icons.map((_, i) => barGraphIconImages[i] || "");
    const { id: _ignoredId, ...rest } = tpl || {};
    return { ...rest, iconImages };
  };

  const saveSequenceQ = async () => {
    if (!currentSeqTemplate) return;
    const payload = buildSequencePayload(currentSeqTemplate, { allowReplay: seqAllowReplay });
    await persistInteractivePayload({
      name: qName.trim() || `${seqCount} Kare - ${SEQUENCE_LEVELS[seqLevel].label} Sırayı Takip Et #${seqTplIdx + 1}`,
      text: qText.trim(),
      image: generateSequenceSvgDataUrl(payload),
      questionType: 'sequence_memory',
      sequenceGrid: payload,
      options: [],
      correctText: 'sequence_memory',
      correctIndex: 0
    });
  };

  const saveEventOrderQ = async () => {
    const list = getEventOrderTemplates(eoLevel);
    const tpl = list[eoTplIdx] || list[0];
    if (!tpl) return;
    const payload = buildEventOrderPayload(tpl);
    await persistInteractivePayload({
      name: qName.trim() || `${EVENT_ORDER_LEVELS[eoLevel].label} Olay Sıralama #${eoTplIdx + 1} • ${tpl.title}`,
      text: qText.trim() || EVENT_ORDER_TEXT,
      ttsText: qText.trim() || EVENT_ORDER_TEXT,
      ttsOn: true,
      image: generateEventOrderSvgDataUrl(payload),
      questionType: 'event_order',
      eventOrderGrid: payload,
      options: [],
      correctText: 'event_order',
      correctIndex: 0
    });
  };

  const saveBarGraphQ = async () => {
    const barPayload = buildBarGraphPayload(barGraphData);
    const svgPreview = generateBarGraphSvgDataUrl(barPayload);
    const lvlLabel = barGraphLevel === 'easy' ? 'Kolay' : barGraphLevel === 'medium' ? 'Orta' : 'Zor';
    await persistInteractivePayload({
      name: qName.trim() || `${lvlLabel} Grafik Oluşturma #${barGraphTplIdx + 1}`,
      text: qText.trim(),
      image: svgPreview,
      questionType: 'bar_graph',
      barGraphGrid: barPayload,
      options: [],
      correctText: 'bar_graph',
      correctIndex: 0
    });
  };

  // --- TEST OLUŞTURMA ROBOTU FONKSİYONU ---
  const getAllDescendantFolderIds = (rootFolderId) => {
    const result = [rootFolderId];
    const queue = [rootFolderId];
    while (queue.length > 0) {
      const curr = queue.shift();
      const children = folders.filter(f => f.parentId === curr);
      children.forEach(ch => {
        if (!result.includes(ch.id)) {
          result.push(ch.id);
          queue.push(ch.id);
        }
      });
    }
    return result;
  };

  // --- SEÇİLİ KLASÖRLERDEKİ SORU SAYISI ---
  // Soruları tek tek okumaz: Firestore "sayım" sorgusu kullanır (30 klasöre kadar 1 sorgu,
  // 1000 soruya kadar 1 okuma ücreti). Aynı seçim tekrar sayılmaz (önbellek).
  const [folderQCount, setFolderQCount] = useState({ key: '', count: null, loading: false });
  const folderCountCache = React.useRef(new Map());
  useEffect(() => {
    if (!selectedFolders.length) { setFolderQCount({ key: '', count: null, loading: false }); return; }
    const ids = Array.from(new Set(selectedFolders.flatMap(fId => getAllDescendantFolderIds(fId)))).sort();
    const key = ids.join('|');
    if (folderCountCache.current.has(key)) { setFolderQCount({ key, count: folderCountCache.current.get(key), loading: false }); return; }
    setFolderQCount(prev => ({ ...prev, key, loading: true }));
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
        let total = 0;
        for (let i = 0; i < ids.length; i += 30) {
          const snap = await getCountFromServer(query(qRef, where('folderId', 'in', ids.slice(i, i + 30))));
          total += snap.data().count;
        }
        folderCountCache.current.set(key, total);
        if (!cancelled) setFolderQCount({ key, count: total, loading: false });
      } catch (e) { console.warn('soru sayımı yapılamadı', e); if (!cancelled) setFolderQCount({ key, count: null, loading: false }); }
    }, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [selectedFolders.join('|'), folders]);
  const folderQCountText = !selectedFolders.length ? '' : folderQCount.loading ? ' · sayılıyor…' : folderQCount.count == null ? '' : ` · ${folderQCount.count} soru`;

  // --- SEÇİLİ KLASÖR VEYA SORULARIN SÜRESİNİ VE HAFIZA ÖZELLİĞİNİ TOPLU DEĞİŞTİRME ---
  const handleBulkUpdateSettingsForSelection = async () => {
    if (selectedPoolQs.length === 0 && selectedFolders.length === 0) {
      alert("Lütfen önce süre veya hafıza özelliğini değiştirmek istediğiniz klasörleri veya soruları işaretleyin.");
      return;
    }

    setIsSaving(true);
    try {
      let targetFolderSet = new Set();
      selectedFolders.forEach(fId => {
        getAllDescendantFolderIds(fId).forEach(subId => targetFolderSet.add(subId));
      });
      const folderIdsArray = Array.from(targetFolderSet);

      const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
      const fetchedMap = new Map(questions.map(q => [q.id, q]));

      // Seçili klasörlerin içindeki tüm soruları sunucudan da garantiye alarak çek
      for (let i = 0; i < folderIdsArray.length; i += 30) {
        const chunk = folderIdsArray.slice(i, i + 30);
        if (chunk.length > 0) {
          const snap = await getDocsFromServer(query(qRef, where('folderId', 'in', chunk)));
          snap.docs.forEach(d => fetchedMap.set(d.id, { ...d.data(), id: d.id }));
        }
      }

      const allKnownQuestions = Array.from(fetchedMap.values());
      const targetQuestions = allKnownQuestions.filter(
        q => selectedPoolQs.includes(q.id) || (q.folderId && targetFolderSet.has(q.folderId))
      );

      if (targetQuestions.length === 0) {
        alert("Seçilen klasörlerde güncellenecek soru bulunamadı.");
        setIsSaving(false);
        return;
      }

      const updateFields = {};
      if (Number(bulkTimeLimit) > 0) {
        updateFields.timeLimit = Number(bulkTimeLimit);
      }
      if (bulkMemoryMode === 'enable') {
        updateFields.isMemory = true;
        updateFields.memoryTime = Number(bulkMemoryTime) || 15;
      } else if (bulkMemoryMode === 'disable') {
        updateFields.isMemory = false;
      }

      const summaryText = [
        `Süre: ${updateFields.timeLimit || 75} sn`,
        bulkMemoryMode === 'enable'
          ? `Hafıza Modu: Açık (${updateFields.memoryTime} sn)`
          : bulkMemoryMode === 'disable'
            ? 'Hafıza Modu: Kapalı (Daimi Göster)'
            : 'Hafıza Modu: Değiştirilmeyecek'
      ].join(' | ');

      if (!window.confirm(`Seçilen klasör ve sorulardaki TOPLAM ${targetQuestions.length} SORUNUN ayarlarını şu şekilde topluca değiştirmek istediğinize emin misiniz?\n\n${summaryText}`)) {
        setIsSaving(false);
        return;
      }

      for (let i = 0; i < targetQuestions.length; i += 400) {
        const chunk = targetQuestions.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach(q => {
          const ref = doc(db, 'artifacts', appId, 'public', 'data', 'questions', q.id);
          batch.update(ref, { ...updateFields, updatedAt: serverTimestamp() });
        });
        await batch.commit();
      }

      const targetIdsSet = new Set(targetQuestions.map(q => q.id));
      setQuestions(allKnownQuestions.map(q => targetIdsSet.has(q.id) ? { ...q, ...updateFields } : q));
      alert(`Harika! Toplam ${targetQuestions.length} sorunun süre ve hafıza ayarları başarıyla güncellendi!`);
    } catch (e) {
      console.error("Toplu ayar güncelleme hatası:", e);
      alert("Sorular güncellenirken bir hata oluştu.");
    }
    setIsSaving(false);
  };

  // --- SEÇİLİ KLASÖR / SORULARA TOPLU YAMA (ses, telefonla okuma, hikâye tekrarı) ---
  // buildPatch(soru) -> güncellenecek alanlar (null dönerse o soru atlanır)
  const handleBulkPatchSelection = async (buildPatch, describe) => {
    if (selectedPoolQs.length === 0 && selectedFolders.length === 0) {
      alert("Lütfen önce klasörleri veya soruları işaretleyin.");
      return;
    }
    setIsSaving(true);
    try {
      const targetFolderSet = new Set();
      selectedFolders.forEach(fId => { getAllDescendantFolderIds(fId).forEach(subId => targetFolderSet.add(subId)); });
      const folderIdsArray = Array.from(targetFolderSet);
      const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
      const fetchedMap = new Map(questions.map(q => [q.id, q]));
      for (let i = 0; i < folderIdsArray.length; i += 30) {
        const chunk = folderIdsArray.slice(i, i + 30);
        if (chunk.length > 0) {
          const snap = await getDocsFromServer(query(qRef, where('folderId', 'in', chunk)));
          snap.docs.forEach(d => fetchedMap.set(d.id, { ...d.data(), id: d.id }));
        }
      }
      const allKnownQuestions = Array.from(fetchedMap.values());
      const patches = new Map();
      allKnownQuestions
        .filter(q => selectedPoolQs.includes(q.id) || (q.folderId && targetFolderSet.has(q.folderId)))
        .forEach(q => { const p = buildPatch(q); if (p) patches.set(q.id, p); });
      if (patches.size === 0) { alert("Seçimde güncellenecek soru bulunamadı."); setIsSaving(false); return; }
      if (!window.confirm(`Seçilen klasör ve sorulardaki ${patches.size} soruya şu işlem uygulanacak:\n\n${describe}\n\nDevam edilsin mi?`)) { setIsSaving(false); return; }
      const ops = Array.from(patches.entries()).map(([id, p]) => ({ type: 'update', ref: doc(db, 'artifacts', appId, 'public', 'data', 'questions', id), data: { ...p, updatedAt: serverTimestamp() } }));
      await commitOpsInChunks(db, ops);
      setQuestions(allKnownQuestions.map(q => patches.has(q.id) ? { ...q, ...patches.get(q.id) } : q));
      alert(`${patches.size} soru güncellendi.`);
    } catch (e) {
      console.error("Toplu güncelleme hatası:", e);
      alert("Sorular güncellenirken bir hata oluştu.");
    }
    setIsSaving(false);
  };
  const BULK_AUDIO_SLOTS = { preAudio1: 'ön ses 1 (ilk çalar)', preAudio2: 'ön ses 2 (ikinci çalar)', audio: 'soru sesi' };

  // --- ETKİLEŞİMLİ SORULARA TOPLU SES (etkinlik etkinlik) ---
  // [etkinlik kimliği (ixSet), eski soru tipi, ad, varsayılan yönerge]
  const IX_AUDIO_ACTS = [
    ['dot', 'dot_grid', '1. Noktalı Çizim', 'Noktaları birleştirerek şekli tamamlayalım.'],
    ['color_box', 'color_grid', '2. Kutu Boyama', 'Örnekteki gibi kutuları uygun renklerle boyayalım.'],
    ['sudoku', 'sudoku_grid', '3. Sudoku', 'Boş kutuları tamamla. Her satırda ve her sütunda her resim bir kez olmalı.'],
    ['box_coding', 'box_coding', '4. Kutu Kodlama', 'Köpeği kemiğe ulaştırmak için doğru adımları sırasıyla seç.'],
    ['line_coding', 'line_coding', '5. Çizgi Kodlama', 'Köpeği kemiğe ulaştırmak için doğru adımları sırasıyla seç.'],
    ['color_pattern', 'color_pattern', '6. Renk Örüntüsü', 'Örüntüdeki boş kutuları uygun renkle tamamla.'],
    ['symmetry', 'symmetry_grid', '7. Simetri Çalışması', 'Sol taraftaki şeklin simetriğini sağ tarafa boyayalım.'],
    ['matrix_shape', 'matrix_shape', '8. Tablo Oluşturma', 'Satır ve sütundaki şekilleri birleştirerek tabloyu tamamla.'],
    ['matrix_paint', 'matrix_paint', '9. Tablo Boyama', 'Örnekteki gibi uygun renkleri boyayalım.'],
    ['number_connect', 'number_connect', '10. Sıralı Çizgi', 'Üstteki sıraya bak. Şekilleri aynı renk sırasıyla çizgiyle birleştir.'],
    ['maze', 'interactive_maze', '11. Labirent', 'Parmağınla doğru yolu takip ederek başlangıçtan hedefe ulaş.'],
    ['shadow_quiz', null, '12. Gölge Bulma Testi', 'Yukarıdaki resmin doğru gölgesi hangisidir?'],
    ['bar_graph', 'bar_graph', '13. Grafik Oluşturma', 'Resimleri say ve kaç tane varsa o kadar kutucuk boya.'],
    ['sequence_memory', 'sequence_memory', '14. Sırayı Takip Et', 'Kareler hangi sırayla yandı? Sen de aynı sırayla dokun.'],
    ['event_order', 'event_order', '15. Olay Sıralama', EVENT_ORDER_TEXT],
  ];
  const [ixAudioAct, setIxAudioAct] = useState('dot');
  const [ixAudioSlot, setIxAudioSlot] = useState('audio');
  const [ixAudioUrl, setIxAudioUrl] = useState('');
  // bir etkinliğin bütün sorularına sesi yazar (soru sayısını döner)
  const applyAudioToAct = async (act, slot, val, onlyWithAudio = false) => {
    const keyed = await findQuestionsByField(db, appId, 'ixSet', [act[0]]);
    const legacy = act[1] ? await findQuestionsByField(db, appId, 'questionType', [act[1]]) : [];
    const found = new Map();
    [...keyed, ...legacy].forEach(e => found.set(e.id, e));
    let list = Array.from(found.values());
    if (onlyWithAudio) list = list.filter(e => e.data && e.data[slot]);
    if (!list.length) return 0;
    await commitOpsInChunks(db, list.map(e => ({ type: 'update', ref: doc(db, 'artifacts', appId, 'public', 'data', 'questions', e.id), data: { [slot]: val, updatedAt: serverTimestamp() } })));
    const ids = new Set(list.map(e => e.id));
    setQuestions(prev => prev.map(q => ids.has(q.id) ? { ...q, [slot]: val } : q));
    return list.length;
  };
  const applyIxAudio = async (remove) => {
    const act = IX_AUDIO_ACTS.find(a => a[0] === ixAudioAct);
    if (!act || (!remove && !ixAudioUrl)) return;
    if (!window.confirm(`"${act[2]}" etkinliğinin bütün sorularına:\n\n"${BULK_AUDIO_SLOTS[ixAudioSlot]}" ${remove ? 'KALDIRILACAK' : 'olarak yüklenen ses eklenecek'}.\n\nDevam edilsin mi?`)) return;
    setIsSaving(true);
    try {
      const n = await applyAudioToAct(act, ixAudioSlot, remove ? '' : ixAudioUrl, remove);
      alert(n ? `${n} soru güncellendi.` : (remove ? `"${act[2]}" sorularında kaldırılacak ses yok.` : `"${act[2]}" etkinliğinde kayıtlı soru bulunamadı. önce soruları kaydedin.`));
    } catch (e) {
      console.error('etkileşimli toplu ses hatası', e);
      alert('sesler eklenirken hata oluştu.');
    } finally { setIsSaving(false); }
  };

  // --- BÜTÜN SESLERİ BİRDEN SEÇ: her ses uygun etkinliğe kendiliğinden yerleşir ---
  // eşleştirme: 1) dosya adındaki sıra numarası (1-15)  2) dosya adındaki kelimeler (yönerge metniyle)  3) kalanlar dosya sırasıyla
  const [ixMulti, setIxMulti] = useState(null); // null | { files: File[], map: { actId: fileIndex|'' } }
  const trNorm = (t) => String(t || '').normalize('NFC').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const matchIxFiles = (files) => {
    const acts = IX_AUDIO_ACTS;
    const actWords = acts.map(a => new Set(trNorm(`${a[2].replace(/^\d+\.\s*/, '')} ${a[3]}`).split(' ').filter(w => w.length > 2)));
    const map = {};
    const used = new Set();
    const cands = files.map((f, fi) => {
      const base = trNorm(f.name.replace(/\.[^.]+$/, ''));
      const nums = (base.match(/\b\d{1,2}\b/g) || []).map(Number).filter(n => n >= 1 && n <= acts.length);
      if (nums.length) return { fi, acts: [nums[0] - 1], how: 'num' };
      const words = base.split(' ').filter(w => w.length > 2);
      const scores = actWords.map(set => words.filter(w => set.has(w)).length);
      const best = Math.max(0, ...scores);
      return { fi, acts: best >= 2 ? scores.map((sc, ai) => (sc === best ? ai : -1)).filter(ai => ai >= 0) : [], how: 'text' };
    });
    // 1-2) numara ve kelime eşleşmeleri (aynı metinli etkinlikler aynı sesi alabilir)
    ['num', 'text'].forEach(how => cands.filter(c => c.how === how && c.acts.length).forEach(c => {
      c.acts.forEach(ai => { if (map[acts[ai][0]] === undefined) { map[acts[ai][0]] = c.fi; used.add(c.fi); } });
    }));
    // 3) kalan dosyalar kalan etkinliklere sırayla
    const restFiles = files.map((_, fi) => fi).filter(fi => !used.has(fi));
    acts.forEach(a => { if (map[a[0]] === undefined && restFiles.length) map[a[0]] = restFiles.shift(); });
    acts.forEach(a => { if (map[a[0]] === undefined) map[a[0]] = ''; });
    return map;
  };
  const onPickIxFiles = (e) => {
    const files = Array.from(e.target.files || []).sort((a, b) => a.name.localeCompare(b.name, 'tr', { numeric: true }));
    e.target.value = '';
    if (!files.length) return;
    setIxMulti({ files, map: matchIxFiles(files) });
  };
  const applyIxMulti = async () => {
    if (!ixMulti) return;
    const pairs = IX_AUDIO_ACTS.filter(a => ixMulti.map[a[0]] !== '' && ixMulti.map[a[0]] !== undefined);
    if (!pairs.length) { alert('hiçbir etkinliğe ses seçilmedi.'); return; }
    if (!window.confirm(`${pairs.length} etkinliğin bütün sorularına "${BULK_AUDIO_SLOTS[ixAudioSlot]}" olarak sesler eklenecek:\n\n${pairs.map(a => `${a[2]}  ←  ${ixMulti.files[ixMulti.map[a[0]]].name}`).join('\n')}\n\nDevam edilsin mi?`)) return;
    setIsSaving(true);
    const urlOf = new Map();
    const report = [];
    try {
      for (const a of pairs) {
        const fi = ixMulti.map[a[0]];
        setIxBusy(`${a[2]} yükleniyor...`);
        if (!urlOf.has(fi)) {
          const file = ixMulti.files[fi];
          const sRef = storageRefOf(storage, `uploads/audios/${Date.now()}_${file.name}`);
          const gain = await measureGain(file);
          await uploadBytes(sRef, file, { cacheControl: 'public,max-age=31536000' });
          urlOf.set(fi, withGain(await getDownloadURL(sRef), gain));
        }
        const n = await applyAudioToAct(a, ixAudioSlot, urlOf.get(fi));
        report.push(`${a[2]}: ${n ? `${n} soru` : 'kayıtlı soru yok'}`);
      }
      setIxMulti(null);
      alert(`sesler yerleştirildi:\n\n${report.join('\n')}`);
    } catch (e) {
      console.error('toplu ses yerleştirme hatası', e);
      alert(`bir hata oluştu. tamamlananlar:\n${report.join('\n') || '-'}`);
    } finally { setIsSaving(false); setIxBusy(''); }
  };
  const ttsTextOf = (q) => speechTextOf(q);

  // Robot kuralları için kök klasörler: seçili olup üst klasörü seçili olmayanlar
  const getRobotRuleRoots = () => selectedFolders.filter(fId => {
    const f = folders.find(x => x.id === fId);
    return f && !(f.parentId && selectedFolders.includes(f.parentId));
  });

  const updateRobotRule = (folderId, patch) => {
    setRobotFolderRules(prev => ({ ...prev, [folderId]: { mode: 'auto', value: '', ignoreUsage: false, ...(prev[folderId] || {}), ...patch } }));
  };

  const handleRunTestRobot = async () => {
    const targetFolderSet = new Set();
    selectedFolders.forEach(fId => {
      if (robotIncludeSubfolders) {
        getAllDescendantFolderIds(fId).forEach(subId => targetFolderSet.add(subId));
      } else {
        targetFolderSet.add(fId);
      }
    });

    if (targetFolderSet.size === 0 && selectedPoolQs.length === 0) {
      alert("Lütfen aşağıdaki klasör ağacından en az 1 klasör (veya soru) kutucuğunu işaretleyin.");
      return;
    }
    const robotFolderChoice = await askSaveFolder('robotun oluşturacağı testler hangi klasöre kaydedilsin?');
    if (robotFolderChoice === undefined) return;

    const qPerTest = Math.max(1, Number(robotQuestionsPerTest) || 10);
    const numTests = Math.max(1, Number(robotTestCount) || 1);
    const startNo = Math.max(1, Number(robotStartNumber) || 1);
    const prefix = (robotBaseName || "Test").trim();

    setIsRobotRunning(true);
    try {
      const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
      const folderIdsArray = Array.from(targetFolderSet);
      const fetchedQuestionsMap = new Map(questions.map(q => [q.id, q]));

      for (let i = 0; i < folderIdsArray.length; i += 30) {
        const chunk = folderIdsArray.slice(i, i + 30);
        if (chunk.length > 0) {
          const snap = await getDocsFromServer(query(qRef, where('folderId', 'in', chunk)));
          snap.docs.forEach(d => fetchedQuestionsMap.set(d.id, { ...d.data(), id: d.id }));
        }
      }

      const allAvailableQuestions = Array.from(fetchedQuestionsMap.values());
      setQuestions(allAvailableQuestions);

      const candidateQuestions = allAvailableQuestions.filter(
        q => (q.folderId && targetFolderSet.has(q.folderId)) || selectedPoolQs.includes(q.id)
      );

      if (candidateQuestions.length === 0) {
        alert("Seçtiğiniz klasörlerde hiç soru bulunamadı!");
        setIsRobotRunning(false);
        return;
      }

      if (candidateQuestions.length < qPerTest) {
        if (!window.confirm(`Seçilen klasörlerde toplam ${candidateQuestions.length} soru var (istediğiniz: ${qPerTest}). Testler ${candidateQuestions.length} soruluk olarak oluşturulsun mu?`)) {
          setIsRobotRunning(false);
          return;
        }
      }

      const effectiveQPerTest = Math.min(qPerTest, candidateQuestions.length);

      const usageCount = {};
      candidateQuestions.forEach(q => { usageCount[q.id] = 0; });
      tests.forEach(t => {
        (t.questionIds || []).forEach(qid => {
          if (usageCount[qid] !== undefined) usageCount[qid]++;
        });
      });

      const shuffleArray = (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      };

      // --- KLASÖR KURALLARI ---
      // Kural kökü: seçili klasörlerden, üst klasörü seçili OLMAYANLAR
      const ruleRoots = getRobotRuleRoots();
      const folderToRoot = new Map();
      ruleRoots.forEach(rootId => {
        const covered = robotIncludeSubfolders ? getAllDescendantFolderIds(rootId) : [rootId];
        covered.forEach(fid => { if (!folderToRoot.has(fid)) folderToRoot.set(fid, rootId); });
      });
      const ruleOf = (rootId) => robotFolderRules[rootId] || { mode: 'auto', value: '', ignoreUsage: false };
      const ignoreUsageFor = (q) => {
        const root = folderToRoot.get(q.folderId);
        return Boolean(root && ruleOf(root).ignoreUsage);
      };
      const quotaRules = ruleRoots
        .map(rootId => ({ rootId, rule: ruleOf(rootId) }))
        .filter(({ rule }) => (rule.mode === 'count' || rule.mode === 'percent') && Number(rule.value) > 0)
        .map(({ rootId, rule }) => ({
          rootId,
          ignoreUsage: Boolean(rule.ignoreUsage),
          quota: rule.mode === 'count'
            ? Math.round(Number(rule.value))
            : Math.round((Number(rule.value) / 100) * effectiveQPerTest)
        }))
        .filter(r => r.quota > 0);
      const quotaRootSet = new Set(quotaRules.map(r => r.rootId));

      // --- BİRİMLER: hikâye soruları tek blok (1-2-3 sırasıyla), diğer sorular tek tek ---
      const qById = new Map(candidateQuestions.map(q => [q.id, q]));
      const allUnits = buildUnits(candidateQuestions);
      const unitsOfPool = (pool) => {
        const ids = new Set(pool.map(q => q.id));
        return allUnits.filter(u => u.ids.every(id => ids.has(id)));
      };
      const useOfQ = (id) => { const q = qById.get(id); return q && ignoreUsageFor(q) ? 0 : (usageCount[id] || 0); };
      const useOfUnit = (u) => Math.max(...u.ids.map(useOfQ));
      let storyTooBig = false;

      // Havuzdan, alt klasörlere eşit dağıtarak ve (gerekiyorsa) en az kullanılandan seçer.
      // Hikâye bloğu sığmıyorsa bölünmez: başka birim seçilir. Dönüş: birim listesi.
      const pickBalanced = (pool, n, chosenSet, testIsEmpty) => {
        const picked = []; let count = 0;
        const buckets = new Map();
        unitsOfPool(pool).forEach(u => {
          if (u.ids.some(id => chosenSet.has(id))) return;
          const k = u.folderId || '__root__';
          if (!buckets.has(k)) buckets.set(k, []);
          buckets.get(k).push(u);
        });
        while (count < n) {
          let pickedAny = false;
          for (const bKey of shuffleArray(Array.from(buckets.keys()))) {
            if (count >= n) break;
            const room = n - count;
            const fits = (u) => u.ids.length <= room || (testIsEmpty && count === 0 && u.ids.length > effectiveQPerTest);
            const bucketUnits = buckets.get(bKey).filter(u => !u.ids.some(id => chosenSet.has(id)) && fits(u));
            if (bucketUnits.length === 0) continue;
            const minUse = Math.min(...bucketUnits.map(useOfUnit));
            const least = bucketUnits.filter(u => useOfUnit(u) === minUse);
            const chosen = least[Math.floor(Math.random() * least.length)];
            chosen.ids.forEach(id => { chosenSet.add(id); usageCount[id] = (usageCount[id] || 0) + 1; });
            if (chosen.ids.length > effectiveQPerTest) storyTooBig = true;
            picked.push(chosen.ids);
            count += chosen.ids.length;
            pickedAny = true;
          }
          if (!pickedAny) break;
        }
        return picked;
      };

      const generatedTestsPayload = [];
      let quotaShortfall = false;

      for (let tIdx = 0; tIdx < numTests; tIdx++) {
        const chosenSet = new Set();
        let chosenUnits = [];
        const countChosen = () => chosenUnits.reduce((a, u) => a + u.length, 0);

        // 1) Kotalı klasörler (adet veya yüzde)
        for (const qr of quotaRules) {
          const room = effectiveQPerTest - countChosen();
          if (room <= 0) break;
          const pool = candidateQuestions.filter(q => folderToRoot.get(q.folderId) === qr.rootId);
          const want = Math.min(qr.quota, room);
          const got = pickBalanced(pool, want, chosenSet, countChosen() === 0);
          if (got.reduce((a, u) => a + u.length, 0) < want) quotaShortfall = true;
          chosenUnits.push(...got);
        }

        // 2) Kalan yerler: kotası olmayan klasörlerden otomatik ve dengeli
        let remaining = effectiveQPerTest - countChosen();
        if (remaining > 0) {
          const autoPool = candidateQuestions.filter(q => !quotaRootSet.has(folderToRoot.get(q.folderId)));
          chosenUnits.push(...pickBalanced(autoPool, remaining, chosenSet, countChosen() === 0));
        }
        // 3) Hâlâ eksik varsa (otomatik havuz yetmediyse) tüm seçili sorulardan tamamla
        remaining = effectiveQPerTest - countChosen();
        if (remaining > 0) chosenUnits.push(...pickBalanced(candidateQuestions, remaining, chosenSet, countChosen() === 0));

        // Test içinde karıştırma blokları bölmez: hikâye soruları hep 1-2-3 sırasıyla kalır
        if (robotShuffleInside) chosenUnits = shuffleArray(chosenUnits);
        let chosenIdsForThisTest = normalizeStoryOrder(chosenUnits.flat(), (id) => qById.get(id));
        if (chosenIdsForThisTest.length === 0) continue;

        generatedTestsPayload.push({
          name: numTests === 1 && startNo === 1 ? prefix : `${prefix} ${startNo + tIdx}`,
          questionIds: chosenIdsForThisTest,
          isPublished: robotPublishImmediately,
          channel: testChannelTab
        });
      }
      if (quotaShortfall) console.warn("bazı klasörlerde kota kadar soru bulunamadı; eksikler diğer klasörlerden tamamlandı.");

      let currentTestsList = [...tests].sort((a, b) => (a.order || 0) - (b.order || 0));
      const shiftAmount = generatedTestsPayload.length;

      const allOps = [];
      currentTestsList.forEach((t, idx) => {
        const newOrder = idx + shiftAmount;
        allOps.push({
          type: 'update',
          ref: doc(db, 'artifacts', appId, 'public', 'data', 'tests', t.id),
          data: { order: newOrder }
        });
      });

      const createdTestObjects = [];
      generatedTestsPayload.forEach((tp, idx) => {
        const newRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'tests'));
        const docData = {
          name: tp.name,
          questionIds: tp.questionIds,
          isPublished: tp.isPublished,
          channel: tp.channel || testChannelTab,
          folderId: robotFolderChoice || null,
          order: idx,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        allOps.push({
          type: 'set',
          ref: newRef,
          data: docData
        });
        createdTestObjects.push({
          ...docData,
          id: newRef.id,
          createdAt: { seconds: Math.floor(Date.now() / 1000) }
        });
      });

      for (let i = 0; i < allOps.length; i += 400) {
        const chunkOps = allOps.slice(i, i + 400);
        const batch = writeBatch(db);
        chunkOps.forEach(op => {
          if (op.type === 'update') batch.update(op.ref, op.data);
          else batch.set(op.ref, op.data);
        });
        await batch.commit();
      }

      const updatedExisting = currentTestsList.map((t, idx) => ({ ...t, order: idx + shiftAmount }));
      setTests([...createdTestObjects, ...updatedExisting].sort((a, b) => (a.order || 0) - (b.order || 0)));

      alert(`${createdTestObjects.length} adet test (${effectiveQPerTest}'er soruluk) klasör kurallarınıza göre başarıyla oluşturuldu!${quotaShortfall ? '\n\nNot: bazı klasörlerde istenen kadar soru yoktu, eksikler diğer klasörlerden tamamlandı.' : ''}${storyTooBig ? '\n\nNot: bazı hikâyelerin soru sayısı test boyutundan büyük olduğu için o hikâyeler bölünmeden tek teste kondu.' : ''}\n\nHikâye soruları her testte birlikte ve 1-2-3 sırasıyla yer alır; bazı testler bu yüzden 1-2 soru eksik olabilir.`);
      setShowRobotPanel(false);
    } catch (err) {
      console.error("Test robotu hatası:", err);
      alert("Testler oluşturulurken bir hata oluştu.");
    } finally {
      setIsRobotRunning(false);
    }
  };

  // --- ZAMANLI YAYIN AYARLARI ---
  useEffect(() => {
    if (tab !== 'test_archive' || scheduleLoaded === schedDoc) return;
    (async () => {
      try {
        setSchedule(DEFAULT_SCHEDULE); setScheduleDirty(false);
        const snap = await getDocFromServer(getScheduleRef(db, appId, schedDoc));
        if (snap.exists()) setSchedule({ ...DEFAULT_SCHEDULE, ...snap.data() });
      } catch (e) { console.error("zamanlı yayın ayarı okunamadı", e); }
      setScheduleLoaded(schedDoc);
    })();
  }, [tab, scheduleLoaded, schedDoc]);

  const updateSchedule = (patch) => { setSchedule(prev => ({ ...prev, ...patch })); setScheduleDirty(true); };

  const saveSchedule = async (override) => {
    const next = { ...schedule, ...(override || {}) };
    if (next.enabled && (!schedule.enabled || !next.lastRunDate || (override && override.time))) {
      next.lastRunDate = initialLastRunDate(next.time);
    }
    next.perDay = Math.max(1, Math.min(20, Number(next.perDay) || 1));
    setIsSaving(true);
    try {
      await setDoc(getScheduleRef(db, appId, schedDoc), next);
      setSchedule(next);
      setScheduleDirty(false);
    } catch (e) {
      console.error(e);
      alert("zamanlı yayın ayarı kaydedilemedi.");
    }
    setIsSaving(false);
  };

  const toggleQueueTest = (testId) => {
    const q = schedule.queue || [];
    updateSchedule({ queue: q.includes(testId) ? q.filter(id => id !== testId) : [...q, testId] });
  };

  const moveQueueItem = (index, dir) => {
    const q = [...(schedule.queue || [])];
    const j = index + dir;
    if (j < 0 || j >= q.length) return;
    [q[index], q[j]] = [q[j], q[index]];
    updateSchedule({ queue: q });
  };

  // --- KLASÖRE TOPLU GÖRÜNÜM AYARI (göz simgesi ekranını klasör modunda açar) ---
  const openFolderStyleEditor = async (folderId) => {
    try {
      const ids = getAllDescendantFolderIds(folderId);
      const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
      let list = [];
      for (let i = 0; i < ids.length; i += 30) {
        const snap = await getDocsFromServer(query(qRef, where('folderId', 'in', ids.slice(i, i + 30))));
        snap.docs.forEach(d => list.push({ ...d.data(), id: d.id }));
      }
      if (list.length === 0) { alert("bu klasörde (ve alt klasörlerinde) soru yok."); return; }
      list = list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setQuestions(prev => {
        const map = new Map(prev.map(p => [p.id, p]));
        list.forEach(nq => map.set(nq.id, nq));
        return Array.from(map.values());
      });
      onOpenPreviewEditor(list[0], list, { bulkFolderId: folderId });
    } catch (e) {
      console.error(e);
      alert("klasör soruları yüklenemedi.");
    }
  };

  const startEditT = (test) => {
      setEditingT(test.id);
      setTName(test.name);
      setTSelectedQs(test.questionIds || []);
      setTab('tests');
      handleLoadTestQs(test);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveT = async (isPub) => {
      if (!tName || tSelectedQs.length === 0) return;
      setIsSaving(true);
      // hikâye soruları her zaman birlikte ve 1-2-3 sırasıyla kaydedilir
      const d = { name: tName, questionIds: normalizeStoryOrder(tSelectedQs, qLookup), isPublished: isPub, updatedAt: serverTimestamp() };
      try {
          if (editingT) {
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', editingT), d);
              setTests(prev => prev.map(t => t.id === editingT ? { ...t, ...d, id: editingT } : t));
          } else {
              const chosenFolder = await askSaveFolder('bu test hangi klasöre kaydedilsin?');
              if (chosenFolder === undefined) { setIsSaving(false); return; }
              const batch = writeBatch(db);
              let updatedTests = [...tests];
              updatedTests = updatedTests.map(t => {
                  const newOrder = (t.order || 0) + 1;
                  batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'tests', t.id), { order: newOrder });
                  return { ...t, order: newOrder };
              });
              const newTestRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'tests'));
              const newTestData = { ...d, channel: testChannelTab, order: 0, folderId: chosenFolder || null, createdAt: serverTimestamp() };
              batch.set(newTestRef, newTestData);
              await batch.commit();

              updatedTests.push({ ...newTestData, id: newTestRef.id, createdAt: {seconds: Math.floor(Date.now() / 1000)} });
              setTests(updatedTests.sort((a, b) => (a.order || 0) - (b.order || 0)));
          }
          setEditingT(null);
          setTName("");
          setTSelectedQs([]);
      } catch(e) { console.error(e); }
      setIsSaving(false);
  };

  const toggleTestStatus = async (test) => {
    try {
      const next = !test.isPublished;
      const data = next ? { isPublished: true, publishedAt: new Date().toISOString() } : { isPublished: false };
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', test.id), data);
      setTests(prev => prev.map(t => t.id === test.id ? { ...t, ...data } : t));
      bumpSync();
    } catch(e) {}
  };

  // --- TOPLU YAYINLA / YAYINDAN KALDIR ---
  // Çocuk uygulamalarının yeni testi hemen görmesi için "sync" damgası güncellenir.
  const bumpSync = async () => {
    try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'sync'), { lastUpdate: serverTimestamp() }); } catch (_) {}
  };

  const setPublishForIds = async (ids, publish, label) => {
    const list = tests.filter(t => ids.includes(t.id) && !!t.isPublished !== publish);
    if (list.length === 0) { alert(publish ? 'seçilenlerin hepsi zaten yayında.' : 'seçilenlerin hepsi zaten yayında değil.'); return; }
    const empty = publish ? list.filter(t => !(t.questionIds || []).length).length : 0;
    const msg = publish
      ? `${list.length} test YAYINLANSIN mı? (çocuklar hemen görecek)${empty ? `\n\nuyarı: ${empty} testin içinde hiç soru yok, onlar çocukta görünmez.` : ''}`
      : `${list.length} test YAYINDAN KALDIRILSIN mı? (çocuklar artık göremez; çözülmüş cevaplar ve yıldızlar silinmez)`;
    if (!window.confirm(`${label}\n\n${msg}`)) return;
    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const data = publish ? { isPublished: true, publishedAt: nowIso } : { isPublished: false };
      await commitOpsInChunks(db, list.map(t => ({ type: 'update', ref: doc(db, 'artifacts', appId, 'public', 'data', 'tests', t.id), data })));
      const idset = new Set(list.map(t => t.id));
      setTests(prev => prev.map(t => idset.has(t.id) ? { ...t, ...data } : t));
      await bumpSync();
    } catch (e) { console.error(e); alert('testler güncellenemedi: ' + (e?.message || e)); }
    setIsSaving(false);
  };

  const setSelectedPublish = (publish) => {
    if (selectedTestIds.length === 0) return;
    setPublishForIds(selectedTestIds, publish, `${selectedTestIds.length} seçili test`);
  };

  // Klasörün (ve istenirse alt klasörlerinin) içindeki testler — sadece açık olan kanal
  const folderTestIds = (folderId, withSub) => {
    const set = new Set(withSub ? tfDescendants(folderId) : [folderId]);
    return tests.filter(t => chanOf(t) === testChannelTab && set.has(testFolderOf(t))).map(t => t.id);
  };

  const setFolderPublish = (folder, publish) => {
    const ids = folderTestIds(folder.id, testFilterWithSub);
    if (ids.length === 0) { alert('bu klasörde (bu sekmede) test yok.'); return; }
    setPublishForIds(ids, publish, `📁 ${tfPath(folder.id)}${testFilterWithSub ? ' (alt klasörler dahil)' : ''} · ${ids.length} test`);
  };

  const saveStudent = async () => {
    const n = stdName.trim(); const i = stdId.trim(); if (!n || !i) return;
    const studentData = { name: n, childId: i, photo: stdPhoto || "" };
    if (editingStudent) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'children', editingStudent.id), studentData);
        if (editingStudent.childId !== i || editingStudent.name !== n) {
          const relatedResponses = responses.filter(r => r.childId === editingStudent.childId);
          const updatePromises = relatedResponses.map(r => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'responses', r.id), { childId: i, childName: n }) );
          await Promise.all(updatePromises);
          setResponses(prev => prev.map(r => r.childId === editingStudent.childId ? { ...r, childId: i, childName: n } : r));
        }
        setChildrenList(prev => prev.map(c => c.id === editingStudent.id ? { ...c, ...studentData } : c));
        setEditingStudent(null);
      } catch(e) { console.error(e); }
    } else {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'children'), studentData);
      setChildrenList(prev => [...prev, { ...studentData, id: docRef.id }]);
    }
    setStdName(""); setStdId(""); setStdPhoto("");
  };

  const startEditStudent = (student) => { setEditingStudent(student); setStdName(student.name); setStdId(student.childId); setStdPhoto(student.photo || ""); };

  const saveGlobalSettings = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'global_config'), localSettings);
    } catch (e) { console.error("ayarlar kaydedilemedi", e); }
    finally { setIsSaving(false); }
  };

  const handleSendToStudents = async () => {
    setIsSaving(true);
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'sync'), {
            lastUpdate: serverTimestamp()
        });
        alert("testler öğrencilerin ekranına gönderildi.");
    } catch (e) {
        console.error(e);
        alert("gönderirken hata oluştu.");
    }
    setIsSaving(false);
  };

  const updateStudentManualStars = async (child, delta) => {
    const currentManual = child.manualStars || 0;
    const newManual = currentManual + delta;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'children', child.id), { manualStars: newManual });
      setChildrenList(prev => prev.map(c => c.id === child.id ? { ...c, manualStars: newManual } : c));
    } catch(e) { console.error("yıldız güncellenemedi", e); }
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsSaving(true);
    try {
      const responsesRef = collection(db, 'artifacts', appId, 'public', 'data', 'responses');
      const q = query(responsesRef, where('childId', '==', studentToDelete.childId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'children', studentToDelete.id));
      setChildrenList(prev => prev.filter(c => c.id !== studentToDelete.id));
      setResponses(prev => prev.filter(r => r.childId !== studentToDelete.childId));
      setStudentToDelete(null);
    } catch (e) { console.error("silme hatası:", e); }
    finally { setIsSaving(false); }
  };

  // Silinen soruları testlerin soru listesinden de çıkarır (testte "hayalet" soru kalmasın)
  const removeQuestionIdsFromTests = async (qIds) => {
    const idSet = new Set(qIds);
    const affected = tests.filter(t => (t.questionIds || []).some(id => idSet.has(id)));
    if (affected.length === 0) return;
    const ops = affected.map(t => ({
      type: 'update',
      ref: doc(db, 'artifacts', appId, 'public', 'data', 'tests', t.id),
      data: { questionIds: (t.questionIds || []).filter(id => !idSet.has(id)), updatedAt: serverTimestamp() }
    }));
    await commitOpsInChunks(db, ops);
    setTests(prev => prev.map(t => (t.questionIds || []).some(id => idSet.has(id)) ? { ...t, questionIds: t.questionIds.filter(id => !idSet.has(id)) } : t));
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', questionToDelete.id));
      await removeQuestionIdsFromTests([questionToDelete.id]);
      setQuestions(prev => prev.filter(q => q.id !== questionToDelete.id));
      setSelectedPoolQs(prev => prev.filter(id => id !== questionToDelete.id));
      setTSelectedQs(prev => prev.filter(id => id !== questionToDelete.id));
      setQuestionToDelete(null);
    } catch (e) { console.error("soru silme hatası:", e); }
    finally { setIsSaving(false); }
  };

  // ==========================================================================
  // --- TEST KLASÖRLERİ (iç içe: üst / alt klasör) + TOPLU TEST SİLME / TAŞIMA ---
  // ==========================================================================
  // Klasörler yalnızca yönetici ekranında düzen içindir; öğrenci uygulamasını etkilemez.
  // Kayıt: settings/test_folder_structure → { list: [{ id, name, parentId }] }
  const testFolderRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'test_folder_structure');
  const [testFolders, setTestFolders] = useState([]);
  const [testFolderFilter, setTestFolderFilter] = useState('all'); // 'all' | 'none' | klasör id
  const [testFilterWithSub, setTestFilterWithSub] = useState(true);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [testFoldersLoaded, setTestFoldersLoaded] = useState(false);
  useEffect(() => {
    if (!['tests', 'test_archive'].includes(tab) || testFoldersLoaded) return;
    (async () => {
      try { const snap = await getDocFromServer(testFolderRef); setTestFolders(snap.exists() ? (snap.data().list || []) : []); }
      catch (e) { console.error('test klasörleri okunamadı', e); }
      setTestFoldersLoaded(true);
    })();
  }, [tab]);
  const saveTestFolders = async (list) => { setTestFolders(list); await setDoc(testFolderRef, { list }); };

  // --- ağaç yardımcıları ---
  const tfIds = new Set(testFolders.map(f => f.id));
  const tfParent = (f) => (f.parentId && tfIds.has(f.parentId) ? f.parentId : null);
  const tfChildren = (pid) => testFolders.filter(f => tfParent(f) === (pid || null)).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  const tfDescendants = (id) => { const out = [id]; const q = [id]; while (q.length) { const c = q.shift(); tfChildren(c).forEach(ch => { out.push(ch.id); q.push(ch.id); }); } return out; };
  const tfPath = (id) => { const out = []; let c = testFolders.find(f => f.id === id); const seen = new Set(); while (c && !seen.has(c.id)) { seen.add(c.id); out.unshift(c.name); c = testFolders.find(f => f.id === tfParent(c)); } return out.join(' › '); };
  const tfOrdered = (() => { const out = []; const walk = (pid, lvl) => tfChildren(pid).forEach(f => { out.push({ ...f, level: lvl }); walk(f.id, lvl + 1); }); walk(null, 0); return out; })();
  // test kaydedilirken "hangi klasöre?" sorusu (klasör yoksa sormaz). iptal -> undefined, klasörsüz -> null
  const [folderAsk, setFolderAsk] = useState(null);
  const askSaveFolder = (title) => new Promise(resolve => {
    if (!tfOrdered.length) { resolve(null); return; }
    setFolderAsk({ title, resolve, value: (testFolderFilter !== 'all' && testFolderFilter !== 'none') ? testFolderFilter : '' });
  });
  const closeFolderAsk = (v) => { if (folderAsk) folderAsk.resolve(v); setFolderAsk(null); };
  const testFolderOf = (t) => (t.folderId && tfIds.has(t.folderId) ? t.folderId : null);
  const testsInFolders = (folderIds, withSub) => {
    const set = new Set();
    folderIds.forEach(id => (withSub ? tfDescendants(id) : [id]).forEach(x => set.add(x)));
    return set;
  };

  const addTestFolder = async (parentId = null) => {
    const parentName = parentId ? tfPath(parentId) : '';
    const name = (window.prompt(parentId ? `"${parentName}" içine yeni ALT klasörün adı:` : 'yeni test klasörünün adı (ör. Kavramlar, Sayılar):') || '').trim();
    if (!name) return;
    if (testFolders.some(f => (tfParent(f) || null) === (parentId || null) && f.name.toLocaleLowerCase('tr-TR') === name.toLocaleLowerCase('tr-TR'))) { alert('bu yerde aynı adla bir klasör zaten var.'); return; }
    const f = { id: `tfolder_${Date.now()}`, name, parentId: parentId || null };
    await saveTestFolders([...testFolders, f]);
    setTestFolderFilter(f.id);
  };
  const renameTestFolder = async (f) => {
    const name = (window.prompt('klasörün yeni adı:', f.name) || '').trim();
    if (!name || name === f.name) return;
    await saveTestFolders(testFolders.map(x => x.id === f.id ? { ...x, name } : x));
  };
  const moveTestFolder = async (f, newParentId) => {
    const np = newParentId || null;
    if (np && tfDescendants(f.id).includes(np)) { alert('bir klasör kendi alt klasörünün içine taşınamaz.'); return; }
    await saveTestFolders(testFolders.map(x => x.id === f.id ? { ...x, parentId: np } : x));
  };
  const deleteTestFolder = async (f) => {
    const parent = tfParent(f);
    const inside = tests.filter(t => t.folderId === f.id);
    const subs = tfChildren(f.id);
    if (!window.confirm(`"${f.name}" klasörü silinsin mi?\n\nİçindeki ${inside.length} test SİLİNMEZ${subs.length ? ` ve ${subs.length} alt klasör silinmez` : ''}; ${parent ? `bir üst klasöre ("${tfPath(parent)}")` : '"klasörsüz" bölümüne'} taşınır.`)) return;
    setIsSaving(true);
    try {
      if (inside.length) await commitOpsInChunks(db, inside.map(t => ({ type: 'update', ref: doc(db, 'artifacts', appId, 'public', 'data', 'tests', t.id), data: { folderId: parent } })));
      setTests(prev => prev.map(t => t.folderId === f.id ? { ...t, folderId: parent } : t));
      await saveTestFolders(testFolders.filter(x => x.id !== f.id).map(x => x.parentId === f.id ? { ...x, parentId: parent } : x));
      if (testFolderFilter === f.id) setTestFolderFilter(parent || 'all');
    } catch (e) { console.error(e); alert('klasör silinemedi.'); }
    setIsSaving(false);
  };
  const moveSelectedTests = async (folderId) => {
    if (selectedTestIds.length === 0) return;
    setIsSaving(true);
    try {
      await commitOpsInChunks(db, selectedTestIds.map(id => ({ type: 'update', ref: doc(db, 'artifacts', appId, 'public', 'data', 'tests', id), data: { folderId: folderId || null } })));
      setTests(prev => prev.map(t => selectedTestIds.includes(t.id) ? { ...t, folderId: folderId || null } : t));
      setSelectedTestIds([]);
    } catch (e) { console.error(e); alert('testler taşınamadı.'); }
    setIsSaving(false);
  };
  // seçili testleri ödev <-> harita arasında taşı
  const moveSelectedToChannel = async (target, onlyIds) => {
    const pickIds = Array.isArray(onlyIds) ? onlyIds : selectedTestIds;
    if (pickIds.length === 0) return;
    const label = target === 'gorev' ? 'ÖDEVLERE (sol taraftaki ödev listesi)' : 'HARİTAYA (adalar)';
    if (!window.confirm(`${pickIds.length} test ${label} taşınsın mı?`)) return;
    setIsSaving(true);
    try {
      const ids = [...pickIds];
      await commitOpsInChunks(db, ids.map(id => ({ type: 'update', ref: doc(db, 'artifacts', appId, 'public', 'data', 'tests', id), data: { channel: target } })));
      setTests(prev => prev.map(t => ids.includes(t.id) ? { ...t, channel: target } : t));
      setSelectedTestIds([]);
      try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'sync'), { lastUpdate: serverTimestamp() }); } catch (_) {}
    } catch (e) { console.error(e); alert('testler taşınamadı.'); }
    setIsSaving(false);
  };
  const deleteSelectedTests = async () => {
    if (selectedTestIds.length === 0) return;
    const names = tests.filter(t => selectedTestIds.includes(t.id)).map(t => t.name);
    const published = tests.filter(t => selectedTestIds.includes(t.id) && t.isPublished).length;
    if (!window.confirm(`${names.length} test silinecek${published ? ` (${published} tanesi yayında!)` : ''}:\n\n${names.slice(0, 12).join('\n')}${names.length > 12 ? `\n... ve ${names.length - 12} test daha` : ''}\n\nBu işlem geri alınamaz. Testlerin içindeki SORULAR silinmez. Devam edilsin mi?`)) return;
    setIsSaving(true);
    try {
      const ids = [...selectedTestIds];
      await commitOpsInChunks(db, ids.map(id => ({ type: 'delete', ref: doc(db, 'artifacts', appId, 'public', 'data', 'tests', id) })));
      if ((schedule.queue || []).some(id => ids.includes(id))) {
        const next = { ...schedule, queue: (schedule.queue || []).filter(id => !ids.includes(id)) };
        await setDoc(getScheduleRef(db, appId, schedDoc), next);
        setSchedule(next);
      }
      setTests(prev => prev.filter(t => !ids.includes(t.id)));
      setSelectedTestIds([]);
    } catch (e) { console.error('toplu test silme hatası:', e); alert('testler silinirken hata oluştu.'); }
    setIsSaving(false);
  };

  // --- ZAMANLI YAYIN: klasörlerden sıraya ekleme ---
  const [schedFolderSel, setSchedFolderSel] = useState([]); // seçili klasörler ('__none' = klasörsüz)
  const [schedWithSub, setSchedWithSub] = useState(true);
  const [schedListFolder, setSchedListFolder] = useState('all');
  // seçili klasörlerdeki, yayında olmayan ve sırada olmayan testler — klasör ağacı sırasıyla gruplanmış
  const schedGroupsFor = (folderIds, withSub) => {
    const queue = schedule.queue || [];
    const drafts = tests.filter(t => !t.isPublished && !queue.includes(t.id) && chanOf(t) === testChannelTab).sort((a, b) => (a.order || 0) - (b.order || 0));
    const groups = [];
    const used = new Set();
    const wanted = withSub ? testsInFolders(folderIds.filter(x => x !== '__none'), true) : new Set(folderIds.filter(x => x !== '__none'));
    tfOrdered.forEach(f => {
      if (!wanted.has(f.id)) return;
      const list = drafts.filter(t => testFolderOf(t) === f.id && !used.has(t.id));
      list.forEach(t => used.add(t.id));
      if (list.length) groups.push({ id: f.id, name: tfPath(f.id), tests: list });
    });
    if (folderIds.includes('__none')) {
      const list = drafts.filter(t => !testFolderOf(t) && !used.has(t.id));
      if (list.length) groups.push({ id: '__none', name: 'klasörsüz', tests: list });
    }
    return groups;
  };
  const shuffleArr = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const addFoldersToQueue = (mode) => {
    if (schedFolderSel.length === 0) { alert('önce soldaki listeden en az bir klasör işaretleyin.'); return; }
    const groups = schedGroupsFor(schedFolderSel, schedWithSub);
    const total = groups.reduce((a, g) => a + g.tests.length, 0);
    if (total === 0) { alert('seçili klasörlerde sıraya eklenecek yayınlanmamış test yok.'); return; }
    let ids;
    if (mode === 'random') ids = shuffleArr(groups.flatMap(g => g.tests.map(t => t.id)));
    else if (mode === 'roundrobin') {
      const lists = groups.map(g => g.tests.map(t => t.id)); ids = [];
      for (let i = 0; lists.some(l => i < l.length); i++) lists.forEach(l => { if (i < l.length) ids.push(l[i]); });
    } else ids = groups.flatMap(g => g.tests.map(t => t.id));
    const label = mode === 'random' ? 'KARIŞIK (rastgele)' : mode === 'roundrobin' ? 'DÖNÜŞÜMLÜ (her klasörden sırayla birer)' : 'SIRAYLA (klasör klasör, testlerin kendi sırasıyla)';
    if (!window.confirm(`${groups.length} klasördeki ${total} yayınlanmamış test, yayın sırasının SONUNA ${label} eklensin mi?\n\n${groups.slice(0, 10).map(g => `• ${g.name} (${g.tests.length})`).join('\n')}${groups.length > 10 ? `\n... ve ${groups.length - 10} klasör daha` : ''}\n\nSonra "kaydet"e basmayı unutmayın.`)) return;
    updateSchedule({ queue: [...(schedule.queue || []), ...ids] });
    setSchedFolderSel([]);
  };
  const shuffleQueue = () => {
    const q = schedule.queue || [];
    if (q.length < 2) return;
    if (!window.confirm(`yayın sırasındaki ${q.length} test karıştırılsın mı?`)) return;
    updateSchedule({ queue: shuffleArr(q) });
  };

  // arşivde görünen testler (seçili klasör + istenirse alt klasörleri)
  const archiveSortedTests = () => [...tests].sort((a, b) => (a.order || 0) - (b.order || 0));
  const archiveInFilter = (t) => {
    if (chanOf(t) !== testChannelTab) return false;
    if (testFolderFilter === 'all') return true;
    if (testFolderFilter === 'none') return !testFolderOf(t);
    return testFilterWithSub ? tfDescendants(testFolderFilter).includes(testFolderOf(t)) : testFolderOf(t) === testFolderFilter;
  };

  const confirmDeleteTest = async () => {
    if (!testToDelete) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', testToDelete.id));
      setTests(prev => prev.filter(t => t.id !== testToDelete.id));
      setTestToDelete(null);
    } catch (e) { console.error("test silme hatası:", e); }
    finally { setIsSaving(false); }
  };

  // TOPLU SİL: seçili soruları ve klasörleri siler. Binlerce soru da silinebilir
  // (500'lük parçalar halinde yazılır; tek seferde 500 sınırına takılmaz).
  // Klasör silinirken içindeki sorular da silinsin mi diye ayrıca sorar.
  const handleBulkDelete = async () => {
      if (selectedPoolQs.length === 0 && selectedFolders.length === 0) return;
      setIsSaving(true);
      setCopyProgress('silinecek sorular sayılıyor...');
      try {
          const qCol = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
          const folderSet = new Set(selectedFolders);
          const inFolders = new Set();
          for (let i = 0; i < selectedFolders.length; i += 30) {
              const chunk = selectedFolders.slice(i, i + 30);
              const snap = await getDocsFromServer(query(qCol, where('folderId', 'in', chunk)));
              snap.docs.forEach(d => inFolders.add(d.id));
          }
          setCopyProgress('');
          const directIds = selectedPoolQs.filter(id => !inFolders.has(id));
          const msg1 = `DİKKAT: Bu işlem geri alınamaz!\n\n${selectedFolders.length} klasör ve ${selectedPoolQs.length} işaretli soru seçili.${inFolders.size ? `\nSeçili klasörlerin içinde toplam ${inFolders.size} soru var.` : ''}\n\nDevam edilsin mi?`;
          if (!window.confirm(msg1)) { setIsSaving(false); return; }
          let deleteFolderQs = false;
          if (inFolders.size > 0) {
              deleteFolderQs = window.confirm(`Klasörlerin içindeki ${inFolders.size} soru da SİLİNSİN mi?\n\nTAMAM → klasörler İÇİNDEKİ SORULARLA BİRLİKTE silinir.\nİPTAL → yalnızca klasörler silinir, içindeki sorular havuza (ana dizine) taşınır.`);
          }
          const toDelete = deleteFolderQs ? Array.from(new Set([...directIds, ...inFolders, ...selectedPoolQs])) : Array.from(new Set(selectedPoolQs));
          const toUnfolder = deleteFolderQs ? [] : Array.from(inFolders).filter(id => !toDelete.includes(id));
          const ops = [
              ...toDelete.map(id => ({ type: 'delete', ref: doc(qCol, id) })),
              ...toUnfolder.map(id => ({ type: 'update', ref: doc(qCol, id), data: { folderId: null } }))
          ];
          if (ops.length) await commitOpsInChunks(db, ops, { onProgress: (d, t) => setCopyProgress(`siliniyor... ${d}/${t}`) });
          if (toDelete.length) {
              setCopyProgress('testlerden çıkarılıyor...');
              await removeIdsFromAllTests(db, appId, toDelete);
              setTests(prev => stripIdsFromTestState(prev, toDelete));
          }
          const delSet = new Set(toDelete);
          setQuestions(prev => prev.filter(q => !delSet.has(q.id)).map(q => (q.folderId && folderSet.has(q.folderId)) ? { ...q, folderId: null } : q));
          setTSelectedQs(prev => prev.filter(id => !delSet.has(id)));
          const currentFolders = folders.filter(f => !folderSet.has(f.id)).map(f => (f.parentId && folderSet.has(f.parentId)) ? { ...f, parentId: null } : f);
          if (selectedFolders.length) await saveFolders(currentFolders);
          setSelectedPoolQs([]);
          setSelectedFolders([]);
          setCopyProgress('');
          alert(`${toDelete.length} soru${selectedFolders.length ? ` ve ${selectedFolders.length} klasör` : ''} silindi.${toUnfolder.length ? `\n${toUnfolder.length} soru havuza taşındı.` : ''}`);
      } catch(e) { console.error(e); setCopyProgress(''); alert('silme sırasında hata oluştu: ' + (e?.message || '')); }
      setIsSaving(false);
  };

  const handleBulkRename = async () => {
      if (!bulkName.trim() || selectedPoolQs.length === 0) return;
      setIsSaving(true);
      try {
          const batch = writeBatch(db);
          selectedPoolQs.forEach(qId => {
              const ref = doc(db, 'artifacts', appId, 'public', 'data', 'questions', qId);
              batch.update(ref, { name: bulkName.trim() });
          });
          await batch.commit();
          setQuestions(prev => prev.map(q => selectedPoolQs.includes(q.id) ? { ...q, name: bulkName.trim() } : q));
          setSelectedPoolQs([]);
          setBulkName("");
          alert("seçilen sorular başarıyla isimlendirildi.");
      } catch(e) { console.error(e); }
      setIsSaving(false);
  };

  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverTestIdx, setDragOverTestIdx] = useState(null);
  const handleDragStart = (e, index) => {
      setDraggedItemIndex(index);
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData('text/plain', `test-${index}`); } catch (_) {} // Firefox sürüklemeyi başlatmak için ister
  };
  const handleDragOver = (e, index) => {
      if (draggedItemIndex === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (index !== undefined && index !== dragOverTestIdx) setDragOverTestIdx(index);
  };
  const handleDragEnd = () => { setDraggedItemIndex(null); setDragOverTestIdx(null); };

  // Testlerin sırasını kaydet: ekrandaki sıra değerleri de güncellenir (yoksa liste eski yerine zıplar)
  const commitTestOrder = async (sortedTests) => {
      const prevOrder = new Map(tests.map(t => [t.id, t.order || 0]));
      const next = sortedTests.map((t, i) => ({ ...t, order: i }));
      setTests(next);
      const ops = next
        .filter(t => prevOrder.get(t.id) !== t.order)
        .map(t => ({ type: 'update', ref: doc(db, 'artifacts', appId, 'public', 'data', 'tests', t.id), data: { order: t.order } }));
      try { if (ops.length) await commitOpsInChunks(db, ops); }
      catch (err) { console.error(err); alert('sıra kaydedilemedi: ' + (err?.message || '')); }
  };

  const handleDrop = async (e, index) => {
      e.preventDefault();
      const from = draggedItemIndex;
      setDraggedItemIndex(null); setDragOverTestIdx(null);
      if (from === null || from === index) return;
      const sortedTests = [...tests].sort((a, b) => (a.order || 0) - (b.order || 0));
      const [itemToMove] = sortedTests.splice(from, 1);
      sortedTests.splice(index, 0, itemToMove);
      await commitTestOrder(sortedTests);
  };

  const handleManualOrderChange = async (test, newValue, currentIndex) => {
      let newIndex = parseInt(newValue, 10) - 1;
      if (isNaN(newIndex)) return;
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= tests.length) newIndex = tests.length - 1;

      if (currentIndex === newIndex) return;

      const sortedTests = [...tests].sort((a, b) => (a.order || 0) - (b.order || 0));
      const [itemToMove] = sortedTests.splice(currentIndex, 1);
      sortedTests.splice(newIndex, 0, itemToMove);
      await commitTestOrder(sortedTests);
  };

  const deleteStudentTestResponse = async (studentId, testId) => {
    if(!window.confirm("bu öğrencinin bu teste ait tüm verilerini silmek istediğinize emin misiniz?")) return;

    setIsSaving(true);
    try {
        const test = tests.find(t => t.id === testId);
        const qIds = test.questionIds || [];
        const responsesRef = collection(db, 'artifacts', appId, 'public', 'data', 'responses');
        const q = query(responsesRef, where('childId', '==', studentId));
        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            if(qIds.includes(doc.data().questionId)) {
                batch.delete(doc.ref);
            }
        });
        await batch.commit();
        setResponses(prev => prev.filter(r => !(qIds.includes(r.questionId) && r.childId === studentId)));
        alert("öğrenci verileri başarıyla silindi.");
    } catch (e) {
        console.error(e);
    }
    setIsSaving(false);
  };

  const handleTestStatus = async (test, status) => {
    if (status === 'red') {
       if (!window.confirm("dikkat: bu testi sıfırlamak istediğine emin misin? bu işlem, bu testteki sorulara ait tüm öğrenci cevaplarını silecektir.")) return;
       setIsSaving(true);
       try {
          const qIds = test.questionIds || [];
          if (qIds.length === 0) { setIsSaving(false); return; }

          const responsesRef = collection(db, 'artifacts', appId, 'public', 'data', 'responses');
          const allResponsesSnap = await getDocs(responsesRef);
          const batch = writeBatch(db);
          let deleteCount = 0;

          allResponsesSnap.docs.forEach(doc => {
               const data = doc.data();
               if (qIds.includes(data.questionId)) {
                 batch.delete(doc.ref);
                 deleteCount++;
               }
           });

           if (deleteCount > 0) await batch.commit();
           await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', test.id), { manualStatus: null });
           setResponses(prev => prev.filter(r => !qIds.includes(r.questionId)));
           setTests(prev => prev.map(t => t.id === test.id ? { ...t, manualStatus: null } : t));

       } catch (e) {
         console.error("sıfırlama hatası:", e);
         alert("bir hata oluştu.");
       }
       setIsSaving(false);

    } else if (status === 'yellow') {
       if(!window.confirm("bu testi güncelleme moduna (sarı) almak istediğinize emin misiniz? bu modda yeşil yanan öğrenciler yeşil kalmaya devam eder.")) return;
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', test.id), { manualStatus: 'yellow_mode' });
       setTests(prev => prev.map(t => t.id === test.id ? { ...t, manualStatus: 'yellow_mode' } : t));

    } else if (status === 'green') {
       if (!window.confirm("bu testi tüm öğrenciler için tamamlandı (yeşil) olarak işaretlemek istediğine emin misin?")) return;
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tests', test.id), { manualStatus: 'green' });
       setTests(prev => prev.map(t => t.id === test.id ? { ...t, manualStatus: 'green' } : t));
    }
  };

  const getTestAggregateStats = (test) => { const qCount = test.questionIds?.length || 0; const testResponses = responses.filter(r => test.questionIds.includes(r.questionId)); const uniqueStudents = [...new Set(testResponses.map(r => r.childId))]; const solverCount = uniqueStudents.length; let totalCorrectPercent = 0; uniqueStudents.forEach(sid => { const sRes = testResponses.filter(r => r.childId === sid).sort((a, b) => a.timestamp - b.timestamp); const firstAttempt = sRes.slice(0, qCount); const correctCount = firstAttempt.filter(r => r.isCorrect).length; totalCorrectPercent += (correctCount / (qCount || 1)) * 100; }); const avgScore = solverCount > 0 ? Math.round(totalCorrectPercent / solverCount) : 0; return { solverCount, avgScore }; };
  const getQuestionHighlights = (test) => { const qCount = test.questionIds?.length || 0; const testResponses = responses.filter(r => test.questionIds.includes(r.questionId)); const uniqueStudents = [...new Set(testResponses.map(r => r.childId))]; let qStats = {}; test.questionIds.forEach((qid, idx) => { qStats[qid] = { id: qid, index: idx + 1, wrong: 0, empty: 0, correct: 0 }; }); uniqueStudents.forEach(sid => { const sRes = testResponses.filter(r => r.childId === sid).sort((a, b) => a.timestamp - b.timestamp); const firstAttempt = sRes.slice(0, qCount); firstAttempt.forEach(r => { if (qStats[r.questionId]) { if (r.isCorrect) qStats[r.questionId].correct++; else if (r.userChoice && (r.userChoice.includes("boş") || r.userChoice.includes("süre"))) qStats[r.questionId].empty++; else qStats[r.questionId].wrong++; } }); }); const statsArray = Object.values(qStats); let pool = [...statsArray]; const topWrong = pool.sort((a,b) => b.wrong - a.wrong)[0]; pool = pool.filter(i => i.id !== topWrong?.id); const topEmpty = pool.sort((a,b) => b.empty - a.empty)[0]; pool = pool.filter(i => i.id !== topEmpty?.id); const topCorrect = pool.sort((a,b) => b.correct - a.correct)[0]; return { topWrong, topEmpty, topCorrect }; };
  const getStudentRankings = (test) => { const qCount = test.questionIds?.length || 0; const testResponses = responses.filter(r => test.questionIds.includes(r.questionId)); const uniqueStudents = [...new Set(testResponses.map(r => r.childId))]; let rankings = uniqueStudents.map(sid => { const childName = testResponses.find(r => r.childId === sid)?.childName || "bilinmeyen"; const sRes = testResponses.filter(r => r.childId === sid).sort((a, b) => a.timestamp - b.timestamp); const firstAttempt = sRes.slice(0, qCount); const correct = firstAttempt.filter(r => r.isCorrect).length; const wrong = firstAttempt.filter(r => !r.isCorrect && !r.userChoice.includes("boş") && !r.userChoice.includes("süre")).length; const attempts = Math.ceil(sRes.length / (qCount || 1)); let hasPerfect = false; for(let i=0; i < sRes.length; i+=qCount) { const attemptSlice = sRes.slice(i, i+qCount); if (attemptSlice.length === qCount && attemptSlice.every(r => r.isCorrect)) { hasPerfect = true; break; } } return { sid, name: childName, correct, wrong, attempts, hasPerfect, firstAttemptData: firstAttempt, allResults: sRes }; }); rankings.sort((a, b) => b.correct - a.correct || a.name.localeCompare(b.name, 'tr')); return rankings; };

  const saveFolders = async (newList) => {
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'folder_structure'), { list: newList });
    } catch (e) { console.error("klasörler kaydedilemedi", e); }
  };

  const addFolder = (parentId) => {
    const name = window.prompt("yeni klasör adı:");
    if (!name) return;
    const newFolder = { id: 'folder_' + Date.now(), name, parentId };
    saveFolders([...folders, newFolder]);
    if (parentId && (!expandedFolders.includes(parentId))) {
        toggleFolder(parentId);
    }
  };

  const renameFolder = (id) => {
      const folder = folders.find(f => f.id === id);
      const newName = window.prompt("yeni klasör adı:", folder.name);
      if (newName && newName.trim() !== "") {
          const newList = folders.map(f => f.id === id ? { ...f, name: newName.trim() } : f);
          saveFolders(newList);
      }
  };

  // --- KLASÖR SIRALAMA: aynı seviyedeki klasörler arasında yukarı / aşağı taşı ---
  // Sıra, folder_structure listesindeki sırayla belirlenir; kardeş klasörle yer değiştirilir.
  const moveFolder = (id, dir) => {
    const f = folders.find(x => x.id === id);
    if (!f) return;
    const pid = f.parentId || null;
    const siblings = folders.filter(x => (x.parentId || null) === pid);
    const pos = siblings.findIndex(x => x.id === id);
    const target = siblings[pos + dir];
    if (!target) return;
    const list = [...folders];
    const a = list.findIndex(x => x.id === id);
    const b = list.findIndex(x => x.id === target.id);
    [list[a], list[b]] = [list[b], list[a]];
    saveFolders(list);
  };

  // Bir klasörün alt klasörlerini (veya ana dizini) alfabetik sırala
  const sortFoldersAlphabetically = (parentId) => {
    const pid = parentId || null;
    const siblings = folders.filter(x => (x.parentId || null) === pid);
    if (siblings.length < 2) return;
    if (!window.confirm(`${siblings.length} klasör A→Z sıralansın mı?`)) return;
    const sorted = [...siblings].sort((a, b) => a.name.localeCompare(b.name, 'tr', { numeric: true }));
    const slots = folders.map((x, i) => ((x.parentId || null) === pid ? i : -1)).filter(i => i >= 0);
    const list = [...folders];
    slots.forEach((slot, k) => { list[slot] = sorted[k]; });
    saveFolders(list);
  };

  const deleteFolder = async (id) => {
    if (!window.confirm("bu klasörü silmek istediğinize emin misiniz? (içindeki soru ve klasörler ana dizine taşınır)")) return;

    setIsSaving(true);
    try {
        const qQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), where('folderId', '==', id));
        const snap = await getDocsFromServer(qQuery);
        const batch = writeBatch(db);
        snap.docs.forEach(d => {
            batch.update(d.ref, { folderId: null });
        });
        await batch.commit();

        setQuestions(prev => prev.map(q => q.folderId === id ? { ...q, folderId: null } : q));

        const newList = folders.filter(f => f.id !== id).map(f => f.parentId === id ? { ...f, parentId: null } : f);
        await saveFolders(newList);
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const isDescendant = (parentId, childId) => {
      if (!childId) return false;
      let current = folders.find(f => f.id === childId);
      while (current) {
          if (current.parentId === parentId) return true;
          current = folders.find(f => f.id === current.parentId);
      }
      return false;
  };

  const handleDropToFolder = async (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData('type');

    if (type === 'question') {
        const qId = e.dataTransfer.getData('questionId');
        if (qId) {
            try {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', qId), { folderId: folderId });
                setQuestions(prev => prev.map(item => item.id === qId ? { ...item, folderId: folderId } : item));
            } catch(err) { console.error(err); }
        }
    } else if (type === 'folder') {
        const fId = e.dataTransfer.getData('folderId');
        if (fId && fId !== folderId && !isDescendant(fId, folderId)) {
            try {
                const newList = folders.map(f => f.id === fId ? { ...f, parentId: folderId || null } : f);
                saveFolders(newList);
            } catch(err) { console.error(err); }
        }
    } else if (!type) {
        const qId = e.dataTransfer.getData('questionId');
        if(qId) {
            try {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'questions', qId), { folderId: folderId });
                setQuestions(prev => prev.map(item => item.id === qId ? { ...item, folderId: folderId } : item));
            } catch(err) { console.error(err); }
        }
    }
  };

  const copyBulkItems = (action) => {
      setClipboardQIds([...selectedPoolQs]);
      setClipboardFolderIds([...selectedFolders]);
      setClipboardAction(action);
  };

  const copyQuestion = (qId, action) => {
      setClipboardQIds([qId]);
      setClipboardFolderIds([]);
      setClipboardAction(action);
  };

  // Seçimde hem klasör hem alt klasörleri varsa sadece EN ÜSTTEKİLER taşınır/kopyalanır;
  // alt klasörler zaten onlarla birlikte gelir (yoksa iç içe yapı düzleşip yan yana dizilir).
  const topLevelFolderIds = (ids) => {
    const set = new Set(ids);
    return ids.filter(id => {
      let cur = folders.find(f => f.id === id); const seen = new Set();
      while (cur && cur.parentId && !seen.has(cur.parentId)) {
        if (set.has(cur.parentId)) return false;
        seen.add(cur.parentId); cur = folders.find(f => f.id === cur.parentId);
      }
      return true;
    });
  };

  const pasteItems = async (targetFolderId) => {
    if (clipboardQIds.length === 0 && clipboardFolderIds.length === 0) return;
    setIsSaving(true);
    try {
        const batch = writeBatch(db);
        let newQuestions = [];
        let newFoldersList = [...folders];
        const rootClipFolders = topLevelFolderIds(clipboardFolderIds);

        if (clipboardAction === 'cut') {
            for (const id of clipboardQIds) {
                batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'questions', id), { folderId: targetFolderId || null });
            }
            for (const fId of rootClipFolders) {
                if (fId !== targetFolderId && !isDescendant(fId, targetFolderId)) {
                    const folderIndex = newFoldersList.findIndex(f => f.id === fId);
                    if (folderIndex > -1) {
                        newFoldersList[folderIndex] = { ...newFoldersList[folderIndex], parentId: targetFolderId || null };
                    }
                }
            }
            if (clipboardFolderIds.length > 0) await saveFolders(newFoldersList);
            if (clipboardQIds.length > 0) await batch.commit();
            setQuestions(prev => prev.map(q => clipboardQIds.includes(q.id) ? { ...q, folderId: targetFolderId || null } : q));

        } else if (clipboardAction === 'copy') {
            const getNextCopyName = (originalName, parentId) => {
                const siblings = newFoldersList.filter(f => (f.parentId || null) === (parentId || null));
                let k = 1;
                let newName = `${originalName} k${k}`;
                while(siblings.some(f => f.name === newName)) {
                    k++;
                    newName = `${originalName} k${k}`;
                }
                return newName;
            };

            const copyFolderRec = async (fId, newParentId) => {
                const originalFolder = folders.find(f => f.id === fId);
                if (!originalFolder) return;
                const newFolderId = 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                const newName = getNextCopyName(originalFolder.name, newParentId || null);
                const newFolder = { id: newFolderId, name: newName, parentId: newParentId || null };
                newFoldersList.push(newFolder);

                const qQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'questions'), where('folderId', '==', fId));
                const snap = await getDocsFromServer(qQuery);
                snap.docs.forEach(d => {
                    const rawData = d.data();
                    const { id: _ignoredId, ...cleanData } = rawData;
                    const newQRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'questions'));
                    const clonedOpts = Array.isArray(cleanData.options) ? cleanData.options.map(o => ({ ...o })) : [];
                    const clonedStyle = cleanData.style ? JSON.parse(JSON.stringify(cleanData.style)) : defaultStyle;
                    const newQData = {
                        ...cleanData,
                        options: clonedOpts,
                        style: clonedStyle,
                        folderId: newFolderId,
                        name: cleanData.name ? `${cleanData.name} (kopya)` : "kopya soru",
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };
                    batch.set(newQRef, newQData);
                    newQuestions.push({
                        ...newQData,
                        id: newQRef.id,
                        createdAt: { seconds: Math.floor(Date.now() / 1000) }
                    });
                });

                const childFolders = folders.filter(f => f.parentId === fId);
                for (const child of childFolders) {
                    await copyFolderRec(child.id, newFolderId);
                }
            };

            for (const fId of rootClipFolders) {
                await copyFolderRec(fId, targetFolderId || null);
            }

            for (const id of clipboardQIds) {
                const originalQ = questions.find(q => q.id === id);
                if (originalQ) {
                    const { id: _ignoredId, ...cleanQData } = originalQ;
                    const newQRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'questions'));
                    const clonedOpts = Array.isArray(cleanQData.options) ? cleanQData.options.map(o => ({ ...o })) : [];
                    const clonedStyle = cleanQData.style ? JSON.parse(JSON.stringify(cleanQData.style)) : defaultStyle;
                    const newQData = {
                        ...cleanQData,
                        options: clonedOpts,
                        style: clonedStyle,
                        folderId: targetFolderId || null,
                        name: cleanQData.name ? `${cleanQData.name} (kopya)` : "kopya soru",
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };
                    batch.set(newQRef, newQData);
                    newQuestions.push({
                        ...newQData,
                        id: newQRef.id,
                        createdAt: { seconds: Math.floor(Date.now() / 1000) }
                    });
                }
            }

            if (clipboardFolderIds.length > 0) await saveFolders(newFoldersList);
            if (newQuestions.length > 0) await batch.commit();
            setQuestions(prev => [...newQuestions, ...prev]);
        }
    } catch(err) { console.error(err); }
    setClipboardQIds([]);
    setClipboardFolderIds([]);
    setClipboardAction(null);
    setSelectedPoolQs([]);
    setSelectedFolders([]);
    setIsSaving(false);
  };

  const toggleSelectAllInFolder = (fQs) => {
      const fQIds = fQs.map(q => q.id);
      if(fQIds.length === 0) return;
      const allSelected = fQIds.every(id => selectedPoolQs.includes(id));
      if (allSelected) {
          setSelectedPoolQs(selectedPoolQs.filter(id => !fQIds.includes(id)));
      } else {
          setSelectedPoolQs(Array.from(new Set([...selectedPoolQs, ...fQIds])));
      }
  };

  const toggleFolderCheckbox = (fId, checked) => {
      if (robotIncludeSubfolders) {
          const allSubIds = getAllDescendantFolderIds(fId);
          if (checked) {
              setSelectedFolders(prev => Array.from(new Set([...prev, ...allSubIds])));
          } else {
              setSelectedFolders(prev => prev.filter(id => !allSubIds.includes(id)));
          }
      } else {
          if (checked) setSelectedFolders(prev => [...prev, fId]);
          else setSelectedFolders(prev => prev.filter(id => id !== fId));
      }
  };

  const handleBulkMove = async (targetFolderId) => {
      if (selectedPoolQs.length === 0 && selectedFolders.length === 0) return;
      setIsSaving(true);
      try {
          const batch = writeBatch(db);
          selectedPoolQs.forEach(qId => {
              const ref = doc(db, 'artifacts', appId, 'public', 'data', 'questions', qId);
              batch.update(ref, { folderId: targetFolderId || null });
          });
          await batch.commit();

          let newFoldersList = [...folders];
          topLevelFolderIds(selectedFolders).forEach(fId => {
              if (fId !== targetFolderId && !isDescendant(fId, targetFolderId)) {
                  const folderIndex = newFoldersList.findIndex(f => f.id === fId);
                  if (folderIndex > -1) {
                      newFoldersList[folderIndex] = { ...newFoldersList[folderIndex], parentId: targetFolderId || null };
                  }
              }
          });
          if(selectedFolders.length > 0) await saveFolders(newFoldersList);

          setQuestions(prev => prev.map(q => selectedPoolQs.includes(q.id) ? { ...q, folderId: targetFolderId || null } : q));
          setSelectedPoolQs([]);
          setSelectedFolders([]);
      } catch(e) { console.error(e); }
      setIsSaving(false);
  };

  const toggleFolder = (id) => {
      setExpandedFolders(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
      if (!expandedFolders.includes(id)) {
         handleLoadFolder(id);
      }
  };

  const getOrderedFolders = (parentId = null, level = 0) => {
      let result = [];
      const children = folders.filter(f => (f.parentId || null) === parentId);
      children.forEach(c => {
          result.push({ ...c, displayName: "\u00A0\u00A0".repeat(level) + (level > 0 ? "└ " : "") + c.name });
          result = result.concat(getOrderedFolders(c.id, level + 1));
      });
      return result;
  };
  const orderedFolders = getOrderedFolders();

  const renderSavedQuestionsSection = () => {
      const allQsSorted = [...questions].sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
      let displayedQuestions = [];
      if (questionDisplayTab === 'last30') {
          displayedQuestions = allQsSorted.slice(0, 30);
      } else if (questionDisplayTab === 'last100') {
          displayedQuestions = allQsSorted.slice(0, 100);
      } else if (questionDisplayTab === 'all') {
          displayedQuestions = allQsSorted;
      }

      return (
          <div className="mt-4 border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-400 uppercase text-xs">
                          kayıtlı sorular {questionDisplayTab === 'saving' ? '(tasarruf modu aktif)' : `(${displayedQuestions.length} soru)`}
                      </h3>
                      {questionDisplayTab !== 'saving' && (
                          <button
                              onClick={() => setQuestionDisplayTab('saving')}
                              className="text-[10px] font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
                          >
                              <EyeOff size={12}/> tasarruf moduna geç (gizle)
                          </button>
                      )}
                  </div>

                  <div className="flex bg-slate-200 p-1 rounded-xl gap-1">
                      <button
                          onClick={() => handleQuestionTabSelect('last30')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${questionDisplayTab === 'last30' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-300'}`}
                      >
                          son 30 soruyu göster
                      </button>
                      <button
                          onClick={() => handleQuestionTabSelect('last100')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${questionDisplayTab === 'last100' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-300'}`}
                      >
                          son 100 soruyu göster
                      </button>
                      <button
                          onClick={() => handleQuestionTabSelect('all')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${questionDisplayTab === 'all' ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-300'}`}
                      >
                          tüm soruları göster
                      </button>
                  </div>
              </div>

              {questionDisplayTab === 'saving' ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-1">
                      <EyeOff size={24} className="text-slate-300 mb-1"/>
                      <span>tasarruf modu devrede — hiçbir soru gösterilmiyor.</span>
                      <span className="text-[10px] font-medium text-slate-400">soruları görmek için yukarıdaki 3 sekmeden birini seçin.</span>
                  </div>
              ) : loadingQuestionsTab ? (
                  <div className="p-8 flex items-center justify-center text-indigo-600 gap-2 font-bold text-xs">
                      <Loader2 size={20} className="animate-spin"/> sorular yükleniyor...
                  </div>
              ) : (
                  <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto custom-scrollbar pb-4">
                      {displayedQuestions.map(q => {
                          const displayImg = getDisplayImage(q);
                          const includedTestsList = getQuestionIncludedTests(q.id);
                          const isUsed = includedTestsList.length > 0;
                          const folderName = folders.find(f => f.id === q.folderId)?.name || (isUsed ? 'ana dizin' : 'havuz');

                          return (
                              <div key={q.id} onClick={() => setDetailModalQ(q)} className="bg-white p-2 rounded-xl border shadow-sm h-36 relative group overflow-hidden cursor-pointer hover:border-indigo-400 transition-all">
                                  {displayImg ? <img src={displayImg} draggable="false" className="w-full h-full object-contain rounded-none" /> : <div className="flex h-full items-center justify-center text-slate-300"><ImageIcon/></div>}
                                  <div className="absolute inset-0 p-2 flex flex-col justify-end">
                                      <p className="font-bold text-[10px] truncate bg-white/70 px-1 rounded backdrop-blur-sm mb-0.5">{q.name || q.text || "görsel soru"}</p>
                                      <p className="font-bold text-[9px] truncate bg-indigo-50/90 text-indigo-700 px-1.5 py-0.5 rounded backdrop-blur-sm w-fit max-w-full flex items-center gap-1 border border-indigo-100 shadow-sm">
                                          <Folder size={10} className="shrink-0"/> <span className="truncate">{folderName}</span>
                                      </p>
                                      <p className={`font-bold text-[9px] truncate px-1.5 py-0.5 rounded backdrop-blur-sm w-fit max-w-full flex items-center gap-1 border shadow-sm mt-0.5 ${isUsed ? 'bg-green-50/90 text-green-700 border-green-100' : 'bg-slate-50/90 text-slate-500 border-slate-100'}`}>
                                          <ListChecks size={10} className="shrink-0"/>
                                          <span className="font-black px-1 rounded bg-white/80 text-[8px] shrink-0">{includedTestsList.length} Test</span>
                                          <span className="truncate">{isUsed ? includedTestsList.join(', ') : 'hiçbir testte yok'}</span>
                                      </p>
                                  </div>
                                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                      <button onClick={() => onOpenPreviewEditor(q, displayedQuestions)} className="p-1 bg-white text-indigo-600 rounded shadow-sm border border-indigo-100" title="görünüm ayarla"><Eye size={12}/></button>
                                      <button onClick={() => onOpenContentEditor(q, displayedQuestions)} className="p-1 bg-blue-50 text-blue-600 rounded" title="içeriği düzenle"><Edit2 size={12}/></button>
                                      <button onClick={() => startEditQ(q)} className="p-1 bg-indigo-600 text-white rounded"><Edit2 size={12}/></button>
                                      <button onClick={() => setQuestionToDelete(q)} className="p-1 bg-red-500 text-white rounded"><Trash2 size={12}/></button>
                                  </div>
                              </div>
                          );
                      })}
                      {displayedQuestions.length === 0 && (
                          <div className="col-span-3 text-center text-slate-400 font-bold text-xs py-6">henüz soru bulunamadı.</div>
                      )}
                  </div>
              )}
          </div>
      );
  };

  // --- KLASÖRÜ ÇÖZ: klasördeki (alt klasörler dahil) bütün sorular, ağaçta göründüğü sırayla ---
  const [folderSolveBusy, setFolderSolveBusy] = useState(null);
  const solveFolder = async (fId) => {
    if (!onPreviewLoaded) return;
    setFolderSolveBusy(fId);
    try {
      // ağaçtaki sıra: önce alt klasörler (yukarıdan aşağı), sonra klasörün kendi soruları
      const order = [];
      const walk = (id) => { folders.filter(f => (f.parentId || null) === id).forEach(c => walk(c.id)); order.push(id); };
      walk(fId);
      const qRef = collection(db, 'artifacts', appId, 'public', 'data', 'questions');
      const got = new Map();
      for (let i = 0; i < order.length; i += 30) {
        const snap = await getDocsFromServer(query(qRef, where('folderId', 'in', order.slice(i, i + 30))));
        snap.docs.forEach(d => got.set(d.id, { ...d.data(), id: d.id }));
      }
      if (got.size === 0) { alert('bu klasörde (alt klasörler dahil) soru yok.'); return; }
      const sec = (q) => q.createdAt?.seconds ?? (q.createdAt?._seconds ?? 0);
      const cmp = (a, b) => ((a.order ?? 1e12) - (b.order ?? 1e12)) || (sec(a) - sec(b)) || String(a.name || a.text || '').localeCompare(String(b.name || b.text || ''), 'tr', { numeric: true });
      const ids = order.flatMap(fid => Array.from(got.values()).filter(q => q.folderId === fid).sort(cmp).map(q => q.id));
      const orderedIds = normalizeStoryOrder(ids, (id) => got.get(id));
      setQuestions(prev => { const m = new Map(prev.map(q => [q.id, q])); got.forEach((q, id) => m.set(id, q)); return Array.from(m.values()); });
      const fname = folders.find(f => f.id === fId)?.name || 'klasör';
      onPreviewLoaded({ id: `__folder_${fId}`, name: `📁 ${fname} (${orderedIds.length} soru)`, questionIds: orderedIds });
    } catch (e) { console.error('klasör çözme hatası', e); alert('klasörün soruları yüklenemedi.'); }
    finally { setFolderSolveBusy(null); }
  };

  const renderFolderTree = (parentId, level = 0) => {
      const childFolders = folders.filter(f => (f.parentId || null) === (parentId || null));
      const folderQs = questions.filter(q => (q.folderId || null) === (parentId || null));

      return (
          <div key={`folder-level-${parentId}`} className={`${level > 0 ? 'ml-2 border-l-2 border-slate-200 pl-2 mt-2' : ''}`}>
              {childFolders.map((f, fIdx) => (
                  <div key={f.id} className="mb-2 animate-in fade-in slide-in-from-top-2">
                      <div
                          className="flex items-center justify-between bg-white border border-slate-200 shadow-sm p-2 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors"
                          draggable
                          onDragStart={(e) => {
                              e.stopPropagation();
                              e.dataTransfer.setData('type', 'folder');
                              e.dataTransfer.setData('folderId', f.id);
                          }}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => handleDropToFolder(e, f.id)}
                          onClick={() => toggleFolder(f.id)}
                      >
                          <div className="flex items-center gap-2">
                              <input type="checkbox" checked={selectedFolders.includes(f.id)} onChange={(e) => {
                                  e.stopPropagation();
                                  toggleFolderCheckbox(f.id, e.target.checked);
                              }} onClick={e => e.stopPropagation()} className="w-4 h-4 text-indigo-600 rounded cursor-pointer" />
                              {expandedFolders.includes(f.id) ? <FolderOpen size={16} className="text-indigo-500"/> : <Folder size={16} className="text-indigo-500"/>}
                              <span className="font-bold text-sm text-slate-700">{f.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                              <button disabled={fIdx === 0} onClick={(e) => {e.stopPropagation(); moveFolder(f.id, -1)}} title="yukarı taşı" className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-25 disabled:cursor-not-allowed"><ChevronUp size={14}/></button>
                              <button disabled={fIdx === childFolders.length - 1} onClick={(e) => {e.stopPropagation(); moveFolder(f.id, 1)}} title="aşağı taşı" className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-25 disabled:cursor-not-allowed"><ChevronDown size={14}/></button>
                              {folders.filter(x => x.parentId === f.id).length > 1 && <button onClick={(e) => {e.stopPropagation(); sortFoldersAlphabetically(f.id)}} title="alt klasörleri A→Z sırala" className="px-1 py-0.5 hover:bg-slate-100 rounded text-slate-500 text-[9px] font-black">A→Z</button>}
                              {onPreviewLoaded && <button onClick={(e) => {e.stopPropagation(); solveFolder(f.id)}} disabled={folderSolveBusy === f.id} title="bu klasördeki bütün soruları (alt klasörler dahil) yukarıdan aşağı sırayla çöz" className="px-1.5 py-1 hover:bg-green-50 rounded text-green-600 flex items-center gap-0.5 text-[10px] font-black disabled:opacity-50">{folderSolveBusy === f.id ? <Loader2 size={14} className="animate-spin"/> : <Play size={14} fill="currentColor"/>} çöz</button>}
                              <button onClick={(e) => {e.stopPropagation(); openFolderStyleEditor(f.id)}} title="bu klasördeki tüm soruların görünümünü (boyut, yazı, kutu) toplu ayarla" className="p-1 hover:bg-emerald-50 rounded text-emerald-600"><Palette size={14}/></button>
                              <button onClick={(e) => {e.stopPropagation(); toggleSelectAllInFolder(questions.filter(q => q.folderId === f.id))}} title="içindeki soruları seç" className="p-1 hover:bg-slate-100 rounded text-slate-500"><CheckSquare size={14}/></button>
                              {(clipboardQIds.length > 0 || clipboardFolderIds.length > 0) && <button onClick={(e) => {e.stopPropagation(); pasteItems(f.id)}} title={`buraya ${clipboardAction === 'cut' ? 'taşı' : 'yapıştır'}`} className="p-1 hover:bg-indigo-100 bg-indigo-50 rounded text-indigo-500"><ClipboardPaste size={14}/></button>}
                              <button onClick={(e) => {e.stopPropagation(); renameFolder(f.id)}} title="isim değiştir" className="p-1 hover:bg-slate-100 rounded text-slate-500"><Edit2 size={14}/></button>
                              <button onClick={(e) => {e.stopPropagation(); addFolder(f.id)}} title="alt klasör ekle" className="p-1 hover:bg-slate-100 rounded text-slate-500"><FolderPlus size={14}/></button>
                              <button onClick={(e) => {e.stopPropagation(); deleteFolder(f.id)}} title="sil" className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 size={14}/></button>
                          </div>
                      </div>
                      {expandedFolders.includes(f.id) && renderFolderTree(f.id, level + 1)}
                  </div>
              ))}

              {folderQs.map(q => {
                  const displayImg = getDisplayImage(q);
                  const includedTests = getQuestionIncludedTests(q.id);
                  const isUsedInAnyTest = includedTests.length > 0;
                  const isFlashing = flashingQIds.includes(q.id);

                  return (
                      <div key={q.id}
                           draggable
                           onDragStart={(e) => {
                               e.dataTransfer.setData('type', 'question');
                               e.dataTransfer.setData('questionId', q.id);
                           }}
                           onClick={() => setDetailModalQ(q)}
                           className={`p-2 rounded-lg border mb-2 flex items-center justify-between gap-2 group transition-all duration-300 cursor-pointer ${
                               isFlashing
                                   ? 'bg-green-300 border-green-600 ring-4 ring-green-300 shadow-lg'
                                   : 'bg-white hover:border-indigo-400 hover:shadow-md'
                           }`}
                      >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input type="checkbox" checked={selectedPoolQs.includes(q.id)} onChange={(e) => {
                                  if (e.target.checked) setSelectedPoolQs([...selectedPoolQs, q.id]);
                                  else setSelectedPoolQs(selectedPoolQs.filter(id => id !== q.id));
                              }} className="cursor-pointer w-4 h-4 text-indigo-600 rounded shrink-0" onClick={e => e.stopPropagation()}/>

                              <button
                                  type="button"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddQuestionToTest(q.id);
                                  }}
                                  title="teste ekle"
                                  className={`p-1 rounded-lg flex items-center gap-1 shrink-0 transition-colors ${
                                      isFlashing
                                          ? 'bg-green-600 text-white'
                                          : tSelectedQs.includes(q.id)
                                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                  }`}
                              >
                                  {tSelectedQs.includes(q.id) ? <CheckCircle size={14} className="shrink-0"/> : <PlusCircle size={14} className="shrink-0"/>}
                              </button>

                              {displayImg && (
                                  <img
                                      src={displayImg}
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddQuestionToTest(q.id);
                                      }}
                                      title="teste eklemek için tıkla"
                                      className="w-8 h-8 object-cover rounded border border-slate-200 shrink-0"
                                  />
                              )}

                              <span
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddQuestionToTest(q.id);
                                  }}
                                  title="teste eklemek için tıkla"
                                  className="text-xs font-bold truncate text-slate-800 hover:text-indigo-600"
                              >
                                  {q.name || q.text || "görsel soru"}
                              </span>
                          </div>

                          <div
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailModalQ(q);
                              }}
                              title="ekli olduğu testlerin ayrıntısını görmek için tıkla"
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-black max-w-[165px] sm:max-w-[260px] shrink-0 overflow-hidden whitespace-nowrap cursor-pointer transition-colors ${
                                  isUsedInAnyTest
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                      : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                              }`}
                          >
                              <ListChecks size={12} className="shrink-0"/>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 ${
                                  isUsedInAnyTest ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>
                                  {includedTests.length} Test
                              </span>
                              <span className="truncate">
                                  {isUsedInAnyTest ? includedTests.join(', ') : 'testte yok'}
                              </span>
                          </div>

                          <div className="flex items-center gap-1 pl-1 shrink-0" onClick={e => e.stopPropagation()}>
                              <button onClick={(e) => { e.stopPropagation(); setQuestionToDelete(q); }} title="sil" className="p-1 rounded text-red-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={12}/></button>
                              <button onClick={(e) => { e.stopPropagation(); copyQuestion(q.id, 'copy'); }} title="kopyala" className={`p-1 rounded transition-colors ${clipboardQIds.includes(q.id) && clipboardAction === 'copy' ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-200'}`}><Copy size={12}/></button>
                              <button onClick={(e) => { e.stopPropagation(); copyQuestion(q.id, 'cut'); }} title="kes" className={`p-1 rounded transition-colors ${clipboardQIds.includes(q.id) && clipboardAction === 'cut' ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-200'}`}><Scissors size={12}/></button>
                              <button onClick={(e) => { e.stopPropagation(); onOpenPreviewEditor(q, folderQs); }} className="p-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100" title="görünüm ayarla"><Eye size={12}/></button>
                              <button onClick={(e) => { e.stopPropagation(); onOpenContentEditor(q, folderQs); }} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="içeriği düzenle"><Edit2 size={12}/></button>
                          </div>
                      </div>
                  );
              })}
              {level > 0 && folderQs.length === 0 && childFolders.length === 0 && (
                  <div className="text-[10px] text-slate-400 italic p-2 opacity-50 flex items-center gap-1"><Folder size={10}/> klasör boş</div>
              )}
          </div>
      );
  };

  // --- ÖDEV / HARİTA SEKMELERİ (test yayınlarken) ---
  const chanCount = (c) => tests.filter(t => chanOf(t) === c).length;
  const channelSwitcher = (
    <div className="rounded-3xl border-2 border-indigo-100 bg-white p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        {[['gorev', '📋 ÖDEV testleri', 'çocukta haritanın solundaki "ödev" sekmesinde liste olarak görünür (yeni gelince bildirim)', 'from-pink-500 to-fuchsia-600'], ['harita', '🗺️ HARİTA testleri', 'çocukta dünyalarda ada ada görünür', 'from-sky-500 to-indigo-600']].map(([c, label, hint, grad]) => (
          <button key={c} type="button" onClick={() => { setTestChannelTab(c); setSelectedTestIds([]); setEditingT(null); }} className={`rounded-2xl p-3 text-left transition-all ${testChannelTab === c ? `bg-gradient-to-br ${grad} text-white shadow-lg` : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
            <div className="font-black text-sm">{label} <span className={`ml-1 text-[11px] px-2 py-0.5 rounded-full ${testChannelTab === c ? 'bg-white/25' : 'bg-slate-200'}`}>{chanCount(c)}</span></div>
            <div className={`text-[10px] font-bold mt-0.5 leading-tight ${testChannelTab === c ? 'text-white/90' : 'text-slate-400'}`}>{hint}</div>
          </button>
        ))}
      </div>
      <div className="text-[10px] font-bold text-slate-400 mt-1.5 px-1">yeni testler, zamanlı yayın sırası ve arşiv seçili sekmeye göredir. iki sekmenin zamanlı yayını ayrı ayrı ayarlanır (ör. her gün 1 ödev).</div>
    </div>
  );

// ============================================================================
// --- GRUP: YÖNETİCİ PANELİ (ADMIN VIEW) - ARAYÜZ (RENDER/RETURN) ---
// ============================================================================
return (
    <div className="pb-20 space-y-6">
       <div className="flex bg-slate-200 p-1 rounded-2xl sticky top-0 z-40 overflow-x-auto">
        {['game', 'game_fx', 'questions', 'dot_questions', 'bilsem_questions', ...SUBJECT_TAB_IDS, 'listen_questions', 'tests', 'test_archive', 'students'].map(id => (
           <button key={id} onClick={() => handleTabClick(id)} className={`flex-1 py-3 px-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${tab===id ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}>
             {id === 'game' ? '🏝️ dünyalar & market' : id === 'game_fx' ? '✨ test sonu & sesler' : id === 'questions' ? 'sorular' : id === 'dot_questions' ? 'etkileşimli sorular' : SUBJECT_TAB_IDS.includes(id) ? SUBJECT_TABS.find(t => t.id === id).label : id === 'bilsem_questions' ? 'bilsem soruları' : id === 'listen_questions' ? 'sesli sorular' : id === 'tests' ? 'yeni test' : id === 'test_archive' ? 'test arşivi' : id === 'students' ? 'öğrenciler' : id === 'stats' ? 'analiz' : 'ekstra'}
          </button>
         ))}
       </div>

       {tab === 'questions' && (
         <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border-2 border-indigo-50 shadow-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2"><PlusCircle size={16}/> {editingQ ? 'soruyu düzenle' : 'yeni soru'}</h4>
                {editingQ && <button onClick={resetQ} className="text-xs text-red-500 font-bold">iptal</button>}
              </div>

              <div className="flex justify-between items-center mb-2">
                  <select value={qFolderId} onChange={e => setQFolderId(e.target.value)} className="w-full sm:w-1/2 p-3 border-2 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-colors text-sm">
                     <option value="">havuz (ana dizin)</option>
                     {orderedFolders.map(f => <option key={f.id} value={f.id}>{f.displayName}</option>)}
                  </select>
              </div>

              <input
                 placeholder="soru adı (sadece yönetici görecek, isteğe bağlı)..."
                 className="w-full p-4 border-2 rounded-2xl font-bold outline-none mb-2 focus:border-indigo-500 transition-colors"
                 value={qName}
                 onChange={e => setQName(e.target.value)}
                 onKeyDown={(e) => { if(e.ctrlKey && e.key === 'Enter') saveQ(); }}
              />
              <textarea
               placeholder="soru metni (zorunlu değil, çocuklar görecek)..."
               className="w-full p-4 border-2 rounded-2xl font-bold outline-none h-24 focus:border-indigo-500 transition-colors"
               value={qText}
               onChange={e => setQText(e.target.value)}
               onKeyDown={(e) => { if(e.ctrlKey && e.key === 'Enter') saveQ(); }}
              />
               <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                   <div className="flex items-center gap-2"><label className="text-[10px] font-bold text-slate-500">süre (sn):</label><input type="number" className="w-16 p-2 rounded-lg border font-bold text-center" value={qTimeLimit} onChange={e => setQTimeLimit(e.target.value)} /></div>
                   <button onClick={() => setIsMem(!isMem)} className={`px-3 py-2 rounded-lg text-[10px] font-bold border ${isMem ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>{isMem ? 'hafıza modu açık' : 'hafıza modu kapalı'}</button>
                   {isMem && <input type="number" placeholder="bakma (sn)" className="w-16 p-2 rounded-lg border font-bold text-center" value={memTime} onChange={e => setMemTime(e.target.value)} />}
                   <button type="button" onClick={() => setTtsDefaultOn(!ttsDefaultOn)} title="Açıkken soru metni (ses yüklenmemişse) telefonun Türkçe sesiyle okunur." className={`px-3 py-2 rounded-lg text-[10px] font-bold border ${ttsDefaultOn ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-slate-500'}`}>🔊 telefonla oku {ttsDefaultOn ? '(açık)' : '(kapalı)'}</button>
                   <button
                     type="button"
                     onClick={() => setKeepSettingsPinned(!keepSettingsPinned)}
                     className={`ml-auto px-3 py-2 rounded-xl text-xs font-black border flex items-center gap-1.5 transition-all ${
                       keepSettingsPinned ? 'bg-amber-500 text-white border-amber-600 shadow' : 'bg-white text-slate-500 border-slate-200'
                     }`}
                     title="Açıkken yeni soru kaydettiğinizde süre, hafıza modu ve klasör konumu sıfırlanmaz, sabit kalır."
                   >
                     <span>📌 Ayarları Sabitle {keepSettingsPinned ? '(Aktif)' : '(Kapalı)'}</span>
                   </button>
               </div>
                <div className="grid grid-cols-2 gap-2">
                   <MediaUploader label="görsel" value={qImg} onChange={setQImg} id="q1" />
                   <MediaUploader label="ön ses 1 (ilk çalar)" value={qPreAud1} onChange={setQPreAud1} id="q4-1" type="audio" />
                   <MediaUploader label="ön ses 2 (ikinci çalar)" value={qPreAud2} onChange={setQPreAud2} id="q4-2" type="audio" />
                   <MediaUploader label="video" value={qVid} onChange={setQVid} type="video" id="q2" />
                   <MediaUploader label="ses" value={qAud} onChange={setQAud} type="audio" id="q3" />
               </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {qOpts.map((o, i) => (
                       <div key={i} className={`p-3 border-2 rounded-xl transition-all space-y-2 ${correctIdx === i ? 'border-green-500 bg-green-50' : 'bg-white'}`}>
                          <input placeholder={`seçenek ${i+1}`} className="w-full p-1 bg-transparent text-sm font-bold border-b outline-none" value={o.text} onChange={e => {const n = [...qOpts]; n[i].text = e.target.value; setQOpts(n)}} />
                          <div className="grid grid-cols-2 gap-2">
                            <MediaUploader label="görsel" small value={o.image} onChange={v => {const n = [...qOpts]; n[i].image = v; setQOpts(n)}} id={`o-${i}`} />
                            <MediaUploader label="şık sesi" small type="audio" value={o.audio || ""} onChange={v => {const n = [...qOpts]; n[i].audio = v; setQOpts(n)}} id={`o-aud-${i}`} />
                          </div>
                          <button type="button" onClick={() => setCorrectIdx(i)} className={`w-full py-1.5 border rounded-lg text-[10px] font-black uppercase transition-colors ${correctIdx === i ? 'bg-green-600 text-white border-green-700' : 'bg-white hover:bg-slate-50 text-slate-600'}`}>
                            {correctIdx === i ? '✓ doğru cevap' : 'doğru olarak işaretle'}
                          </button>
                       </div>
                     ))}
               </div>
               <button disabled={isSaving} onClick={saveQ} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">{isSaving ? "kaydediliyor..." : "kaydet"}</button>
           </div>

           {renderSavedQuestionsSection()}
         </div>
       )}

       {SUBJECT_TABS.map(st => {
         if (tab !== st.id) return null;
         const si = Math.min(subBank[st.id] || 0, (st.banks || [st.bank]).length - 1);
         const bank = st.banks ? st.banks[si] : st.bank;
         return (
         <div key={st.id} className="space-y-6 animate-in fade-in">
           {st.banks && (
             <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border-2 border-sky-100 shadow-sm">
               {st.banks.map((b, i) => (
                 <button key={b.id} type="button" onClick={() => setSubBank(prev => ({ ...prev, [st.id]: i }))}
                   className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl text-left transition-all ${i === si ? 'bg-sky-600 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-sky-50'}`}>
                   <span className="block text-xs font-black uppercase">{st.subLabel(b, i)}</span>
                   <span className={`block text-[10px] font-bold ${i === si ? 'text-white/80' : 'text-slate-400'}`}>{st.subSub(b, i)} · {b.countTemplates()} soru</span>
                 </button>
               ))}
             </div>
           )}
           <TemplateBankPanel
             key={bank.id}
             bank={bank}
             db={db}
             appId={appId}
             folders={folders}
             orderedFolders={orderedFolders}
             qFolderId={qFolderId}
             setQFolderId={setQFolderId}
             qTimeLimit={qTimeLimit}
             setQTimeLimit={setQTimeLimit}
             isMem={isMem}
             setIsMem={setIsMem}
             memTime={memTime}
             setMemTime={setMemTime}
             keepSettingsPinned={keepSettingsPinned}
             setKeepSettingsPinned={setKeepSettingsPinned}
             defaultStyle={defaultStyle}
             setQuestions={setQuestions}
             setTests={setTests}
           />
           {renderSavedQuestionsSection()}
         </div>
         );
       })}

       {tab === 'bilsem_questions' && (
         <div className="space-y-6 animate-in fade-in">
           <TemplateBankPanel
             key="BILSEM_BANK"
             bank={BILSEM_BANK}
             db={db}
             appId={appId}
             folders={folders}
             orderedFolders={orderedFolders}
             qFolderId={qFolderId}
             setQFolderId={setQFolderId}
             qTimeLimit={qTimeLimit}
             setQTimeLimit={setQTimeLimit}
             isMem={isMem}
             setIsMem={setIsMem}
             memTime={memTime}
             setMemTime={setMemTime}
             keepSettingsPinned={keepSettingsPinned}
             setKeepSettingsPinned={setKeepSettingsPinned}
             defaultStyle={defaultStyle}
             setQuestions={setQuestions}
             setTests={setTests}
           />
           {renderSavedQuestionsSection()}
         </div>
       )}

       {tab === 'listen_questions' && (
         <div className="space-y-6 animate-in fade-in">
           <TemplateBankPanel
             key="LISTEN_BANK"
             bank={LISTEN_BANK}
             db={db}
             appId={appId}
             folders={folders}
             orderedFolders={orderedFolders}
             qFolderId={qFolderId}
             setQFolderId={setQFolderId}
             qTimeLimit={qTimeLimit}
             setQTimeLimit={setQTimeLimit}
             isMem={isMem}
             setIsMem={setIsMem}
             memTime={memTime}
             setMemTime={setMemTime}
             keepSettingsPinned={keepSettingsPinned}
             setKeepSettingsPinned={setKeepSettingsPinned}
             defaultStyle={defaultStyle}
             setQuestions={setQuestions}
             setTests={setTests}
           />
           {renderSavedQuestionsSection()}
         </div>
       )}

       {tab === 'dot_questions' && (
         <div className="space-y-6 animate-in fade-in">
           <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-indigo-50 shadow-lg space-y-5">
             <div className="flex justify-between items-center">
               <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2">
                 <PlusCircle size={16}/> {editingQ ? 'etkileşimli soruyu düzenle' : 'yeni etkileşimli soru hazırla'}
               </h4>
               <button type="button" onClick={() => setTtsDefaultOn(!ttsDefaultOn)} title="Açıkken kaydedilen sorularda yönerge metni (ses yüklenmemişse) telefonun Türkçe sesiyle okunur." className={`ml-auto mr-2 px-3 py-1.5 rounded-xl text-[10px] font-black border ${ttsDefaultOn ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-slate-500'}`}>🔊 telefonla oku {ttsDefaultOn ? '(açık)' : '(kapalı)'}</button>
               {editingQ && <button onClick={resetQ} className="text-xs text-red-500 font-bold">iptal</button>}
             </div>

             {/* BÜTÜN ETKİLEŞİMLİ SORULARI TEK SEFERDE KAYDET */}
             <div className="flex flex-wrap items-center gap-2 bg-rose-50 border-2 border-rose-100 rounded-2xl p-3">
               <button type="button" disabled={isSaving} onClick={saveAllInteractive} className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black shadow hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5">
                 <Layers size={14} /> etkileşimli soruların tamamını kaydet
               </button>
               <span className="text-[10px] font-bold text-rose-800 leading-snug flex-1 min-w-[200px]">15 etkinliğin bütün boyut ve seviyeleri. Klasör seçili değilse "Etkileşimli Sorular › etkinlik › boyut/seviye" klasörlerine yerleşir. Daha önce kaydedilenlerin üzerine yazar (önce sorar).</span>
               {ixBusy && <span className="text-xs font-black text-rose-700 flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> {ixBusy}</span>}
             </div>

             {/* ETKİLEŞİMLİ SORULARA TOPLU SES (etkinlik etkinlik) */}
             <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-3 space-y-2">
               <div className="text-xs font-black text-orange-900 flex items-center gap-1.5"><Music size={14} /> toplu ses · bir etkinliğin bütün sorularına aynı sesi ekle</div>
               <div className="flex flex-wrap items-center gap-2">
                 <select value={ixAudioAct} onChange={e => setIxAudioAct(e.target.value)} className="text-xs p-2 rounded-xl border outline-none bg-white font-bold">
                   {IX_AUDIO_ACTS.map(a => <option key={a[0]} value={a[0]}>{a[2]}</option>)}
                 </select>
                 <select value={ixAudioSlot} onChange={e => setIxAudioSlot(e.target.value)} className="text-xs p-2 rounded-xl border outline-none bg-white font-bold">
                   {Object.entries(BULK_AUDIO_SLOTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                 </select>
                 <div className="w-48 sm:w-60"><MediaUploader small label="sesi seç / yükle" value={ixAudioUrl} onChange={setIxAudioUrl} type="audio" id="ix-bulk-audio" /></div>
                 <button type="button" disabled={isSaving || !ixAudioUrl} onClick={() => applyIxAudio(false)} className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow disabled:opacity-40">bütün sorulara ekle</button>
                 <button type="button" disabled={isSaving} onClick={() => applyIxAudio(true)} className="px-3 py-2 bg-white border border-orange-300 text-orange-700 text-xs font-black rounded-xl hover:bg-orange-100 disabled:opacity-40">sesi kaldır</button>
               </div>
               <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-orange-200">
                 <label className={`px-3 py-2 rounded-xl text-white text-xs font-black shadow cursor-pointer ${isSaving ? 'bg-slate-400 pointer-events-none' : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90'}`}>
                   🎵 toplu ses ekle (bütün sesleri seç)
                   <input type="file" accept="audio/*" multiple hidden onChange={onPickIxFiles} disabled={isSaving} />
                 </label>
                 <span className="text-[10px] font-bold text-orange-800 flex-1 min-w-[200px]">15 sesi birden seçin; her ses dosya adındaki numaraya (1-15) ya da yönerge kelimelerine göre uygun etkinliğe yerleşir. kaydetmeden önce eşleşmeyi görüp değiştirebilirsiniz. ses yeri: yukarıda seçili olan ("{BULK_AUDIO_SLOTS[ixAudioSlot]}").</span>
               </div>
               {ixMulti && (
                 <div className="bg-white border-2 border-orange-200 rounded-2xl p-3 space-y-1.5">
                   <div className="text-xs font-black text-slate-700">{ixMulti.files.length} ses seçildi · eşleşme:</div>
                   {IX_AUDIO_ACTS.map(a => (
                     <div key={a[0]} className="flex flex-wrap items-center gap-2 text-[11px]">
                       <span className="w-40 font-black text-slate-700 shrink-0">{a[2]}</span>
                       <span className="text-slate-300">←</span>
                       <select value={ixMulti.map[a[0]] === '' ? '' : String(ixMulti.map[a[0]])} onChange={e => setIxMulti(m => ({ ...m, map: { ...m.map, [a[0]]: e.target.value === '' ? '' : Number(e.target.value) } }))} className={`flex-1 min-w-[160px] p-1.5 border rounded-lg font-bold outline-none ${ixMulti.map[a[0]] === '' ? 'text-slate-400 bg-slate-50' : 'bg-orange-50 text-orange-900'}`}>
                         <option value="">— ses yok (dokunma)</option>
                         {ixMulti.files.map((f, fi) => <option key={fi} value={fi}>{f.name}</option>)}
                       </select>
                     </div>
                   ))}
                   <div className="flex gap-2 pt-1">
                     <button type="button" onClick={() => setIxMulti(null)} disabled={isSaving} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-black">vazgeç</button>
                     <button type="button" onClick={applyIxMulti} disabled={isSaving} className="flex-1 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-black shadow disabled:opacity-50">{isSaving ? (ixBusy || 'yükleniyor...') : 'sesleri yerleştir'}</button>
                   </div>
                 </div>
               )}
               <div className="text-[10px] font-bold text-orange-800 leading-snug">okunacak yönerge: <span className="italic">"{(IX_AUDIO_ACTS.find(a => a[0] === ixAudioAct) || [])[3]}"</span> · sonradan eklenen yeni sorulara ses için bu düğmeye tekrar basın.</div>
             </div>

             {/* 14 ETKİLEŞİMLİ ALT SEKME */}
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 bg-slate-100 p-1.5 rounded-2xl gap-1.5 border border-slate-200">
               {[
                 { id: 'dot', label: '1. Noktalı Çizim', activeBg: 'bg-indigo-600' },
                 { id: 'color_box', label: '2. Kutu Boyama', activeBg: 'bg-orange-500' },
                 { id: 'sudoku', label: '3. Sudoku', activeBg: 'bg-emerald-600' },
                 { id: 'box_coding', label: '4. Kutu Kodlama', activeBg: 'bg-purple-600' },
                 { id: 'line_coding', label: '5. Çizgi Kodlama', activeBg: 'bg-blue-600' },
                 { id: 'color_pattern', label: '6. Renk Örüntüsü', activeBg: 'bg-pink-600' },
                 { id: 'symmetry', label: '7. Simetri Çalışması', activeBg: 'bg-rose-600' },
                 { id: 'matrix_shape', label: '8. Tablo Oluşturma', activeBg: 'bg-violet-600' },
                 { id: 'matrix_paint', label: '9. Tablo Boyama', activeBg: 'bg-amber-600' },
                 { id: 'number_connect', label: '10. Sıralı Çizgi', activeBg: 'bg-cyan-600' },
                 { id: 'maze', label: '11. Labirent', activeBg: 'bg-teal-600' },
                 { id: 'shadow_quiz', label: '12. Gölge Bulma Testi', activeBg: 'bg-slate-800' },
                 { id: 'bar_graph', label: '13. Grafik Oluşturma', activeBg: 'bg-sky-600' },
                 { id: 'sequence_memory', label: '14. Sırayı Takip Et', activeBg: 'bg-fuchsia-600' },
                 { id: 'event_order', label: '15. Olay Sıralama', activeBg: 'bg-lime-600' }
               ].map(st => (
                 <button
                   key={st.id}
                   type="button"
                   onClick={() => setGridSubTab(st.id)}
                   className={`py-2.5 px-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                     gridSubTab === st.id ? `${st.activeBg} text-white shadow` : 'text-slate-600 hover:bg-slate-200 bg-white/60'
                   }`}
                 >
                   {st.label}
                 </button>
               ))}
             </div>

             {/* 1. SEKME: NOKTALI ÇİZİM */}
             {gridSubTab === 'dot' && (
               <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-2 flex-wrap">
                     <span className="text-xs font-black text-slate-600 uppercase">nokta boyutu:</span>
                     {[3, 4, 5].map(n => (
                       <button
                         key={n}
                         type="button"
                         onClick={() => {
                           setDotLevelFilter('easy');
                           if (n === 4 || n === 5 || n === 3) applyDotTemplate(n, 0);
                           else { setDotRows(n); setDotCols(n); setDotLines([]); }
                         }}
                         className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all ${Number(dotRows) === n && Number(dotCols) === n ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                       >
                         {n}×{n} ({(DOT_TEMPLATES[n] || []).length} Şablon)
                       </button>
                     ))}
                   </div>
                   <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase">özel:</label>
                     <input type="number" min="1" max="10" value={dotRows} onChange={e => { setDotRows(e.target.value); setDotLines([]); }} className="w-14 p-1.5 rounded-xl border-2 font-black text-center text-sm" />
                     <span className="font-black text-slate-400">×</span>
                     <input type="number" min="1" max="10" value={dotCols} onChange={e => { setDotCols(e.target.value); setDotLines([]); }} className="w-14 p-1.5 rounded-xl border-2 font-black text-center text-sm" />
                   </div>
                 </div>

                 <div className="space-y-2 bg-white p-3 rounded-2xl border border-indigo-100">
                   {(Number(dotRows) === 4 || Number(dotRows) === 5) && Number(dotRows) === Number(dotCols) && (
                     <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-indigo-50">
                       <span className="text-[10px] font-black text-slate-500 uppercase">zorluk (100'er soru):</span>
                       {['easy', 'medium', 'hard'].map(lv => (
                         <button
                           key={lv}
                           type="button"
                           onClick={() => {
                             setDotLevelFilter(lv);
                             const firstIdx = (DOT_TEMPLATES[Number(dotRows)] || []).findIndex(t => t.difficulty === lv);
                             if (firstIdx >= 0) applyDotTemplate(Number(dotRows), firstIdx);
                           }}
                           className={`px-3 py-1 rounded-xl text-xs font-black border ${dotLevelFilter === lv ? (lv === 'easy' ? 'bg-green-600 text-white border-green-700' : lv === 'medium' ? 'bg-amber-500 text-white border-amber-600' : 'bg-red-600 text-white border-red-700') : 'bg-white text-slate-600'}`}
                         >
                           {DOT_LEVEL_LABELS[lv]}
                         </button>
                       ))}
                       <button
                         type="button"
                         disabled={isSaving}
                         onClick={() => {
                           const list = (DOT_TEMPLATES[Number(dotRows)] || []).filter(t => t.difficulty === dotLevelFilter);
                           handleBulkGenerateQuestions(
                             list,
                             (tpl, idx) => ({
                               name: `${dotRows}x${dotCols} Noktalı Çizim - ${DOT_LEVEL_LABELS[tpl.difficulty]} #${idx + 1}`,
                               text: qText.trim() || "Noktaları birleştirerek şekli tamamlayalım.",
                               image: generateDotGridSvgDataUrl(dotRows, dotCols, tpl.lines),
                               questionType: 'dot_grid',
                               dotGrid: { rows: Number(dotRows), cols: Number(dotCols), lines: tpl.lines, difficulty: tpl.difficulty },
                               options: [],
                               correctText: 'dot_grid',
                               correctIndex: 0
                             }),
                             `${dotRows}x${dotRows} ${DOT_LEVEL_LABELS[dotLevelFilter]} Noktalı Çizim`,
                             { setId: 'dot', legacyType: 'dot_grid', keyOf: (tpl) => `dot|${Number(dotRows)}|${(DOT_TEMPLATES[Number(dotRows)] || []).indexOf(tpl)}`, pathOf: (tpl) => ['Noktalı Çizim', `${dotRows}x${dotRows}`, DOT_LEVEL_LABELS[tpl.difficulty] || 'Kolay'] }
                           );
                         }}
                         className="ml-auto px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow hover:bg-indigo-700"
                       >
                         Sadece {DOT_LEVEL_LABELS[dotLevelFilter]} 100 Şablonu Soruya Dönüştür
                       </button>
                     </div>
                   )}
                   <div className="flex flex-wrap items-center justify-between gap-2">
                     <span className="text-[10px] font-black text-indigo-600 uppercase">
                       {dotRows}×{dotCols} Şablonlar (İstediğini Seç veya Tümünü Üret):
                     </span>
                     <div className="flex items-center gap-2">
                       <select
                         value={dotTemplateIdx}
                         onChange={(e) => applyDotTemplate(Number(dotRows), Number(e.target.value))}
                         className="p-1.5 rounded-xl border-2 border-indigo-200 font-black text-xs bg-indigo-50 text-indigo-900 outline-none"
                       >
                         {(DOT_TEMPLATES[Number(dotRows)] || []).map((tpl, i) => (
                           <option key={tpl.id} value={i}>
                             Şablon #{i + 1} ({DOT_LEVEL_LABELS[tpl.difficulty] || 'Kolay'})
                           </option>
                         ))}
                       </select>
                       <button
                         type="button"
                         disabled={isSaving}
                         onClick={() =>
                           handleBulkGenerateQuestions(
                             DOT_TEMPLATES[Number(dotRows)] || [],
                             (tpl, idx) => ({
                               name: `${dotRows}x${dotCols} Noktalı Çizim #${idx + 1} (${DOT_LEVEL_LABELS[tpl.difficulty] || 'Kolay'})`,
                               text: qText.trim() || "Noktaları birleştirerek şekli tamamlayalım.",
                               image: generateDotGridSvgDataUrl(dotRows, dotCols, tpl.lines),
                               questionType: 'dot_grid',
                               dotGrid: { rows: Number(dotRows), cols: Number(dotCols), lines: tpl.lines, difficulty: tpl.difficulty || 'easy' },
                               options: [],
                               correctText: 'dot_grid',
                               correctIndex: 0
                             }),
                             `${dotRows}x${dotRows} Noktalı Çizim`,
                             { setId: 'dot', legacyType: 'dot_grid', keyOf: (tpl) => `dot|${Number(dotRows)}|${(DOT_TEMPLATES[Number(dotRows)] || []).indexOf(tpl)}`, pathOf: (tpl) => ['Noktalı Çizim', `${dotRows}x${dotRows}`, DOT_LEVEL_LABELS[tpl.difficulty] || 'Kolay'] }
                           )
                         }
                         className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow hover:bg-indigo-700 shrink-0"
                       >
                         Tüm {(DOT_TEMPLATES[Number(dotRows)] || []).length} Şablonu Soruya Dönüştür
                       </button>
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border custom-scrollbar">
                     {(DOT_TEMPLATES[Number(dotRows)] || []).map((tpl, i) => ((Number(dotRows) === 4 || Number(dotRows) === 5) && tpl.difficulty !== dotLevelFilter) ? null : (
                       <button
                         key={tpl.id}
                         type="button"
                         onClick={() => applyDotTemplate(Number(dotRows), i)}
                         className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                           dotTemplateIdx === i ? 'bg-indigo-600 text-white border-indigo-700 shadow' : 'bg-white text-slate-600 hover:bg-indigo-50'
                         }`}
                         title={`${DOT_LEVEL_LABELS[tpl.difficulty] || 'Kolay'} şablon`}
                       >
                         {i + 1}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="flex flex-col items-center justify-center py-2">
                   <DotGridPad rows={dotRows} cols={dotCols} lines={dotLines} onChange={setDotLines} size={240} title="noktaları birleştirerek şekli çiz" />
                 </div>
               </div>
             )}

             {/* 2. SEKME: KUTU BOYAMA */}
             {gridSubTab === 'color_box' && (
               <div className="bg-orange-50/40 p-4 rounded-3xl border-2 border-orange-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-2 flex-wrap">
                     <span className="text-xs font-black text-slate-600 uppercase">hızlı boyut:</span>
                     {[[1,3], [1,4], [2,2], [3,3], [4,4], [5,5]].map(([r, c]) => (
                       <button
                         key={`${r}x${c}`}
                         type="button"
                         onClick={() => {
                           if ((r === 4 && c === 4) || (r === 5 && c === 5)) applyColorBoxTemplate(r, 0);
                           else { setBoxRows(r); setBoxCols(c); setBoxCells({}); }
                         }}
                         className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all ${Number(boxRows) === r && Number(boxCols) === c ? 'bg-orange-500 text-white border-orange-500 shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                       >
                         {r}×{c} {((r === 4 && c === 4) || (r === 5 && c === 5)) ? '(200 Şablon)' : ''}
                       </button>
                     ))}
                   </div>
                   <div className="flex items-center gap-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase">özel (1-10):</label>
                     <input type="number" min="1" max="10" value={boxRows} onChange={e => { setBoxRows(e.target.value); setBoxCells({}); }} className="w-14 p-1.5 rounded-xl border-2 font-black text-center text-sm" />
                     <span className="font-black text-slate-400">×</span>
                     <input type="number" min="1" max="10" value={boxCols} onChange={e => { setBoxCols(e.target.value); setBoxCells({}); }} className="w-14 p-1.5 rounded-xl border-2 font-black text-center text-sm" />
                   </div>
                 </div>

                 {(Number(boxRows) === 4 && Number(boxCols) === 4) || (Number(boxRows) === 5 && Number(boxCols) === 5) ? (
                   <div className="space-y-2 bg-white p-3 rounded-2xl border border-orange-200">
                     <div className="flex flex-wrap items-center justify-between gap-2">
                       <span className="text-[10px] font-black text-orange-600 uppercase">
                         {boxRows}×{boxCols} Kutu Boyama Şablonları:
                       </span>
                       <div className="flex items-center gap-2">
                         <select
                           value={boxTemplateIdx}
                           onChange={(e) => applyColorBoxTemplate(Number(boxRows), Number(e.target.value))}
                           className="p-1.5 rounded-xl border-2 border-orange-200 font-black text-xs bg-orange-50 text-orange-900 outline-none"
                         >
                           {(COLOR_BOX_TEMPLATES[Number(boxRows)] || []).map((tpl, i) => (
                             <option key={tpl.id} value={i}>
                               Şablon #{i + 1} ({Object.keys(tpl.cells).length} Kutu)
                             </option>
                           ))}
                         </select>
                         <button
                           type="button"
                           disabled={isSaving}
                           onClick={() =>
                             handleBulkGenerateQuestions(
                               COLOR_BOX_TEMPLATES[Number(boxRows)] || [],
                               (tpl, idx) => ({
                                 name: `${boxRows}x${boxCols} Kutu Boyama #${idx + 1}`,
                                 text: qText.trim() || "Örnekteki gibi kutuları uygun renklerle boyayalım.",
                                 image: generateColorGridSvgDataUrl(boxRows, boxCols, tpl.cells),
                                 questionType: 'color_grid',
                                 colorGrid: { rows: boxRows, cols: boxCols, cells: tpl.cells },
                                 options: [],
                                 correctText: 'color_grid',
                                 correctIndex: 0
                               }),
                               `${boxRows}x${boxCols} Kutu Boyama`,
                             { setId: 'color_box', legacyType: 'color_grid', keyOf: (tpl, idx) => `color_box|${Number(boxRows)}|${idx}`, path: ['Kutu Boyama', `${boxRows}x${boxCols}`] }
                           )
                           }
                           className="px-3.5 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-black shadow hover:bg-orange-600 shrink-0"
                         >
                           200 Şablonu Soruya Dönüştür
                         </button>
                       </div>
                     </div>
                     <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border custom-scrollbar">
                       {(COLOR_BOX_TEMPLATES[Number(boxRows)] || []).map((tpl, i) => (
                         <button
                           key={tpl.id}
                           type="button"
                           onClick={() => applyColorBoxTemplate(Number(boxRows), i)}
                           className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                             boxTemplateIdx === i ? 'bg-orange-500 text-white border-orange-600 shadow' : 'bg-white text-slate-600 hover:bg-orange-50'
                           }`}
                         >
                           {i + 1}
                         </button>
                       ))}
                     </div>
                   </div>
                 ) : null}

                 <div className="flex flex-col items-center justify-center py-2">
                   <ColorGridPad rows={boxRows} cols={boxCols} cells={boxCells} onChange={setBoxCells} size={230} title="üstteki 4 renkten seçip kutuları boya" />
                 </div>
               </div>
             )}

             {/* 3. SEKME: SUDOKU (HAZIR BANKA: 3 BOYUT × 3 SEVİYE × 100 SORU) */}
             {gridSubTab === 'sudoku' && (
               <div className="bg-emerald-50/40 p-4 rounded-3xl border-2 border-emerald-100 space-y-4">
                 <div className="flex flex-wrap items-center gap-2">
                   <span className="text-xs font-black text-slate-600 uppercase w-16">boyut:</span>
                   {[3, 4, 5].map(sz => (
                     <button key={sz} type="button" onClick={() => applySudokuTemplate(sz, 0)}
                       className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all ${sudokuSize === sz ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                       {sz}×{sz}
                     </button>
                   ))}
                 </div>

                 <div className="flex flex-wrap items-center gap-2">
                   <span className="text-xs font-black text-slate-600 uppercase w-16">seviye:</span>
                   {SUDOKU_LEVELS.map(l => (
                     <button key={l.id} type="button" onClick={() => applySudokuTemplate(sudokuSize, 0, l.id)}
                       className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all text-left ${sudokuLevel === l.id ? (l.id === 'kolay' ? 'bg-green-600 border-green-700' : l.id === 'orta' ? 'bg-amber-500 border-amber-600' : 'bg-rose-600 border-rose-700') + ' text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
                       {l.label} <span className="opacity-75 font-bold normal-case">({l.hint})</span>
                     </button>
                   ))}
                 </div>

                 <div className="flex flex-wrap items-center gap-2">
                   <span className="text-xs font-black text-slate-600 uppercase w-16">semboller:</span>
                   <select value={sudokuThemeMode} onChange={e => applySudokuTemplate(sudokuSize, sudokuTemplateIdx, sudokuLevel, e.target.value)} className="p-2 border-2 rounded-xl font-bold text-xs outline-none">
                     <option value="auto">karışık (20 tema sırayla)</option>
                     {SUDOKU_THEMES.map(t => <option key={t.id} value={t.id}>{t.label} {t.symbols.slice(0, sudokuSize).join(' ')}</option>)}
                   </select>
                   <span className="text-[10px] font-bold text-slate-400">boş kutu oranı 4×4 ve 5×5'te en fazla %33</span>
                 </div>

                 <div className="flex flex-wrap items-center gap-2">
                   <button type="button" onClick={() => setSudokuClues({ ...sudokuSolution })} className="px-3 py-1.5 rounded-xl bg-white border text-xs font-black text-emerald-700 hover:bg-emerald-50">tüm kutuları doldur (kendin boşalt)</button>
                   <button type="button" onClick={() => applySudokuTemplate(sudokuSize, sudokuTemplateIdx)} className="px-3 py-1.5 rounded-xl bg-white border text-xs font-black text-slate-600 hover:bg-slate-50">hazır soruya geri dön</button>
                   <button type="button" disabled={isSaving}
                     onClick={() => handleBulkGenerateQuestions(
                       getSudokuBank(sudokuSize, sudokuLevel).map((_, i) => getSudokuTpl(sudokuSize, sudokuLevel, i)),
                       sudokuQuestionFromTpl,
                       `${sudokuSize}x${sudokuSize} Sudoku ${SUDOKU_LEVELS.find(l => l.id === sudokuLevel)?.label}`,
                             { setId: 'sudoku', legacyType: 'sudoku_grid', keyOf: (t) => `sudoku|${t.size}|${t.level}|${getSudokuBank(t.size, t.level).findIndex(x => x.id === t.id)}`, pathOf: (t) => ['Sudoku', `${t.size}x${t.size}`, SUDOKU_LEVELS.find(l => l.id === t.level)?.label || t.level] }
                           )}
                     className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow hover:bg-emerald-700 disabled:opacity-50">
                     bu seviyenin {getSudokuBank(sudokuSize, sudokuLevel).length} sorusunu kaydet
                   </button>
                   <button type="button" disabled={isSaving}
                     onClick={() => handleBulkGenerateQuestions(
                       SUDOKU_LEVELS.flatMap(l => getSudokuBank(sudokuSize, l.id).map((_, i) => getSudokuTpl(sudokuSize, l.id, i))),
                       (t) => sudokuQuestionFromTpl(t, getSudokuBank(t.size, t.level).findIndex(x => x.id === t.id)),
                       `${sudokuSize}x${sudokuSize} Sudoku (kolay + orta + zor)`,
                             { setId: 'sudoku', legacyType: 'sudoku_grid', keyOf: (t) => `sudoku|${t.size}|${t.level}|${getSudokuBank(t.size, t.level).findIndex(x => x.id === t.id)}`, pathOf: (t) => ['Sudoku', `${t.size}x${t.size}`, SUDOKU_LEVELS.find(l => l.id === t.level)?.label || t.level] }
                           )}
                     className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-black shadow hover:bg-slate-900 disabled:opacity-50">
                     {sudokuSize}×{sudokuSize} üç seviye ({SUDOKU_LEVELS.reduce((a, l) => a + getSudokuBank(sudokuSize, l.id).length, 0)} soru)
                   </button>
                 </div>

                 <div className="space-y-1.5">
                   <span className="text-[10px] font-black text-slate-500 uppercase block">
                     {sudokuSize}×{sudokuSize} {SUDOKU_LEVELS.find(l => l.id === sudokuLevel)?.label} hazır sorular (birini seç):
                   </span>
                   <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                     {getSudokuBank(sudokuSize, sudokuLevel).map((t, idx) => (
                       <button key={idx} type="button" onClick={() => applySudokuTemplate(sudokuSize, idx)} title={`${t.themeLabel} • ${t.emptyCount} boş kutu`}
                         className={`w-10 h-7 rounded-lg text-[10px] font-black border transition-all ${sudokuTemplateIdx === idx ? 'bg-emerald-600 text-white border-emerald-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-emerald-50'}`}>
                         {idx + 1}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="flex flex-col items-center justify-center py-2">
                   <SudokuGridPad
                     gridSize={sudokuSize}
                     clues={sudokuClues}
                     solution={sudokuSolution}
                     symbols={sudokuSymbols}
                     onChangeClues={setSudokuClues}
                     isTeacherEditor={true}
                     size={250}
                     title={`${Object.keys(sudokuSolution).length - Object.keys(sudokuClues).length} boş kutu • kutulara tıklayarak boşluk ekleyip çıkarabilirsin`}
                   />
                 </div>
               </div>
             )}

             {/* 4 & 5. SEKME: KUTU KODLAMA VE ÇİZGİ ÜZERİNDE KODLAMA */}
             {(gridSubTab === 'box_coding' || gridSubTab === 'line_coding') && (
               <div className="bg-purple-50/40 p-4 rounded-3xl border-2 border-purple-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className={`grid grid-cols-1 ${gridSubTab === 'line_coding' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2 bg-white p-2 rounded-2xl border border-purple-150 flex-1`}>
                     <button
                       type="button"
                       onClick={() => setCodingMethod('method1')}
                       className={`p-3 rounded-xl text-left border-2 transition-all ${
                         codingMethod === 'method1' ? 'bg-purple-600 text-white border-purple-700 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'
                       }`}
                     >
                       <div className="font-black text-xs uppercase">1. Yöntem: Yolu Göster ➔ Okları Dizdir</div>
                     </button>
                     <button
                       type="button"
                       onClick={() => setCodingMethod('method2')}
                       className={`p-3 rounded-xl text-left border-2 transition-all ${
                         codingMethod === 'method2' ? 'bg-purple-600 text-white border-purple-700 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'
                       }`}
                     >
                       <div className="font-black text-xs uppercase">2. Yöntem: Okları Göster ➔ Yolu İşaretlettir</div>
                     </button>
                     {gridSubTab === 'line_coding' && (
                       <button
                         type="button"
                         onClick={() => setCodingMethod('method3')}
                         className={`p-3 rounded-xl text-left border-2 transition-all ${
                           codingMethod === 'method3' ? 'bg-blue-600 text-white border-blue-700 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'
                         }`}
                       >
                         <div className="font-black text-xs uppercase">3. Yöntem: Oksuz Çizgi Yolu ➔ Okları Dizdir</div>
                       </button>
                     )}
                   </div>

                   <button
                     type="button"
                     disabled={isSaving}
                     onClick={() =>
                       handleBulkGenerateQuestions(
                         CODING_TEMPLATES[codingSize] || [],
                         (tpl, idx) => {
                           const isLine = gridSubTab === 'line_coding';
                           const effMethod = (!isLine && codingMethod === 'method3') ? 'method1' : codingMethod;
                           const codingData = {
                             mode: isLine ? 'line' : 'box',
                             method: effMethod,
                             rows: codingSize,
                             cols: codingSize,
                             path: tpl.path,
                             arrows: tpl.arrows,
                             startImage: codingStartImg || "",
                             targetImage: codingTargetImg || ""
                           };
                           return {
                             name: `${codingSize}x${codingSize} ${isLine ? 'Çizgi Kodlama' : 'Kutu Kodlama'} #${idx + 1}`,
                             text: qText.trim() || "Köpeği kemiğe ulaştırmak için doğru adımları sırasıyla seç.",
                             image: generateCodingGridSvgDataUrl(codingData),
                             questionType: isLine ? 'line_coding' : 'box_coding',
                             codingGrid: codingData,
                             options: [],
                             correctText: isLine ? 'line_coding' : 'box_coding',
                             correctIndex: 0
                           };
                         },
                         `${codingSize}x${codingSize} Kodlama`,
                             { setId: gridSubTab, legacyType: gridSubTab, keyOf: (tpl, idx) => `${gridSubTab}|${codingSize}|${idx}`, path: [gridSubTab === 'line_coding' ? 'Çizgi Kodlama' : 'Kutu Kodlama', `${codingSize}x${codingSize}`] }
                           )
                     }
                     className="px-4 py-3 rounded-xl bg-purple-600 text-white text-xs font-black shadow hover:bg-purple-700 shrink-0"
                   >
                     Tüm Kodlama Şablonlarını Soruya Dönüştür
                   </button>
                 </div>

                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-2 flex-wrap">
                     <span className="text-xs font-black text-slate-600 uppercase">tablo boyutu:</span>
                     {[3, 4, 5, 6].map(sz => (
                       <button
                         key={sz}
                         type="button"
                         onClick={() => applyCodingTemplate(sz, 0)}
                         className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all ${codingSize === sz ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                       >
                         {sz}×{sz} ({CODING_TEMPLATES[sz]?.length || 0} Şablon)
                       </button>
                     ))}
                   </div>

                   <div className="flex items-center gap-2">
                     <select
                       value={codingTemplateIdx}
                       onChange={(e) => applyCodingTemplate(codingSize, Number(e.target.value))}
                       className="p-2 rounded-xl border-2 border-purple-200 font-black text-xs bg-white text-purple-900 outline-none"
                     >
                       {(CODING_TEMPLATES[codingSize] || []).map((tpl, i) => (
                         <option key={tpl.id} value={i}>
                           Şablon #{i + 1} ({tpl.arrows.length} Ok Adımı)
                         </option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border border-slate-200 custom-scrollbar">
                   {(CODING_TEMPLATES[codingSize] || []).map((tpl, i) => (
                     <button
                       key={tpl.id}
                       type="button"
                       onClick={() => applyCodingTemplate(codingSize, i)}
                       className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                         codingTemplateIdx === i ? 'bg-purple-600 text-white border-purple-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                       }`}
                     >
                       {i + 1}
                     </button>
                   ))}
                 </div>

                 <div className="flex flex-col items-center justify-center py-2">
                   <CodingActivityPad
                     key={`teacher-coding-${gridSubTab}-${codingSize}-${codingTemplateIdx}-${codingMethod}`}
                     mode={gridSubTab === 'line_coding' ? 'line' : 'box'}
                     method={codingMethod}
                     rows={codingSize}
                     cols={codingSize}
                     path={codingPath}
                     startImage={codingStartImg}
                     targetImage={codingTargetImg}
                     isTeacherEditor={true}
                     onChangeTeacherPath={setCodingPath}
                     size={250}
                     title={gridSubTab === 'line_coding' ? 'Çizgi Üzerinde Kodlama (🐶 ➔ 🦴)' : 'Kutu İçinde Kodlama (🐶 ➔ 🦴)'}
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-2 pt-1">
                   <MediaUploader label="Özel Başlangıç Görseli (Varsayılan: 🐶)" value={codingStartImg} onChange={setCodingStartImg} id="cod-start-img" small />
                   <MediaUploader label="Özel Hedef Görseli (Varsayılan: 🦴)" value={codingTargetImg} onChange={setCodingTargetImg} id="cod-target-img" small />
                 </div>
               </div>
             )}

             {/* 6. SEKME: RENK ÖRÜNTÜLERİ */}
             {gridSubTab === 'color_pattern' && (
               <div className="bg-pink-50/40 p-4 rounded-3xl border-2 border-pink-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-2 flex-wrap">
                     <span className="text-xs font-black text-slate-600 uppercase">örüntü türü:</span>
                     {[2, 3, 4].map(pt => (
                       <button
                         key={pt}
                         type="button"
                         onClick={() => applyPatternTemplate(pt, 0)}
                         className={`px-3.5 py-1.5 rounded-xl font-black text-xs border transition-all ${patternType === pt ? 'bg-pink-600 text-white border-pink-600 shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                       >
                         {pt}'li Örüntü (200 Şablon)
                       </button>
                     ))}
                   </div>

                   <div className="flex items-center gap-1.5">
                     <button
                       type="button"
                       disabled={isSaving}
                       onClick={() =>
                         handleBulkGenerateQuestions(
                           PATTERN_TEMPLATES[patternType] || [],
                           (tpl, idx) => ({
                             name: `${patternType}'li Renk Örüntüsü #${idx + 1}`,
                             text: qText.trim() || "Örüntüdeki boş kutuları uygun renkle tamamla.",
                             image: generatePatternSvgDataUrl(tpl.cells, tpl.hiddenIndices),
                             questionType: 'color_pattern',
                             patternGrid: { period: tpl.period, cells: tpl.cells, hiddenIndices: tpl.hiddenIndices },
                             options: [],
                             correctText: 'color_pattern',
                             correctIndex: 0
                           }),
                           `${patternType}'li Örüntü`,
                           { setId: 'color_pattern', legacyType: 'color_pattern', keyOf: (tpl, idx) => `color_pattern|${patternType}|${idx}`, path: ['Renk Örüntüsü', `${patternType}'li`] }
                         )
                       }
                       className="px-3.5 py-1.5 rounded-xl bg-pink-600 text-white text-xs font-black shadow hover:bg-pink-700"
                     >
                       200 Şablonu Soruya Dönüştür
                     </button>
                   </div>
                 </div>

                 <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                   {(PATTERN_TEMPLATES[patternType] || []).map((tpl, idx) => (
                     <button
                       key={tpl.id}
                       type="button"
                       onClick={() => applyPatternTemplate(patternType, idx)}
                       className={`px-2 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 transition-all ${
                         patternTemplateIdx === idx ? 'bg-pink-600 text-white border-pink-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                       }`}
                     >
                       #{idx + 1}
                     </button>
                   ))}
                 </div>

                 <div className="flex flex-col items-center justify-center py-2">
                   <ColorPatternPad
                     cells={patternCells}
                     hiddenIndices={patternHiddenIndices}
                     onChangeCells={setPatternCells}
                     onChangeHiddenIndices={setPatternHiddenIndices}
                     isTeacherEditor={true}
                     teacherMode={patternTeacherMode}
                     title="Örüntü Şablonu (Sorulacak Kutulara Tıklayıp '?' Yapın)"
                   />
                 </div>
               </div>
                           )}

             {/* 7. SEKME: SİMETRİ ÇALIŞMASI (6x6, 7x7, 8x8 - 200'er Şablon) */}
             {gridSubTab === 'symmetry' && (
               <div className="bg-rose-50/40 p-4 rounded-3xl border-2 border-rose-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-2 flex-wrap">
                     <span className="text-xs font-black text-slate-600 uppercase">simetri boyutu:</span>
                     {[6, 7, 8].map(sz => (
                       <button
                         key={sz}
                         type="button"
                         onClick={() => applySymmetryTemplate(sz, 0)}
                         className={`px-3.5 py-1.5 rounded-xl font-black text-xs border transition-all ${symmetrySize === sz ? 'bg-rose-600 text-white border-rose-600 shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                       >
                         {sz}×{sz} (200 Şablon)
                       </button>
                     ))}
                   </div>

                   <button
                     type="button"
                     disabled={isSaving}
                     onClick={() =>
                       handleBulkGenerateQuestions(
                         SYMMETRY_TEMPLATES[symmetrySize] || [],
                         (tpl, idx) => ({
                           name: `${symmetrySize}x${symmetrySize} Simetri #${idx + 1} (${tpl.title})`,
                           text: qText.trim() || "Sol taraftaki şeklin simetriğini sağ tarafa boyayalım.",
                           image: generateSymmetrySvgDataUrl({ size: symmetrySize, leftCells: tpl.leftCells }),
                           questionType: 'symmetry_grid',
                           symmetryGrid: { size: symmetrySize, leftCells: tpl.leftCells },
                           options: [],
                           correctText: 'symmetry_grid',
                           correctIndex: 0
                         }),
                         `${symmetrySize}x${symmetrySize} Simetri`,
                             { setId: 'symmetry', legacyType: 'symmetry_grid', keyOf: (tpl, idx) => `symmetry|${symmetrySize}|${idx}`, path: ['Simetri', `${symmetrySize}x${symmetrySize}`] }
                           )
                     }
                     className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black shadow hover:bg-rose-700"
                   >
                     200 Şablonun Tümünü Soruya Dönüştür
                   </button>
                 </div>

                 <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                   {(SYMMETRY_TEMPLATES[symmetrySize] || []).map((tpl, idx) => (
                     <button
                       key={tpl.id}
                       type="button"
                       onClick={() => applySymmetryTemplate(symmetrySize, idx)}
                       className={`px-2 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 transition-all ${
                         symmetryTemplateIdx === idx ? 'bg-rose-600 text-white border-rose-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-rose-50'
                       }`}
                       title={tpl.title}
                     >
                       {idx + 1}
                     </button>
                   ))}
                 </div>

                 <div className="flex flex-col items-center justify-center py-2">
                   <SymmetryGridPad
                     gridSize={symmetrySize}
                     leftCells={symmetryLeftCells}
                     onChangeLeftCells={setSymmetryLeftCells}
                     isTeacherEditor={true}
                     size={250}
                     title={`${symmetrySize}×${symmetrySize} Simetri Şablonu #${symmetryTemplateIdx + 1} (${(SYMMETRY_TEMPLATES[symmetrySize] || [])[symmetryTemplateIdx]?.title || ''})`}
                   />
                 </div>
               </div>
             )}

             {/* 8. SEKME: TABLO OLUŞTURMA (ŞEKİL BİRLEŞTİRME MATRİSİ - 200 ŞABLON) */}
             {gridSubTab === 'matrix_shape' && (
               <div className="bg-violet-50/40 p-4 rounded-3xl border-2 border-violet-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-2">
                   <span className="text-xs font-black text-violet-800 uppercase">Tablo Oluşturma Şablonları (1 - 200):</span>
                   <button
                     type="button"
                     disabled={isSaving}
                     onClick={() =>
                       handleBulkGenerateQuestions(
                         MATRIX_SHAPE_TEMPLATES,
                         (tpl, idx) => ({
                           name: `Tablo Oluşturma #${idx + 1}`,
                           text: qText.trim() || "Satır ve sütundaki şekilleri birleştirerek tabloyu tamamla.",
                           image: generateMatrixShapeSvgDataUrl(tpl),
                           questionType: 'matrix_shape',
                           matrixShapeGrid: tpl,
                           options: [],
                           correctText: 'matrix_shape',
                           correctIndex: 0
                         }),
                         "Tablo Oluşturma",
                             { setId: 'matrix_shape', legacyType: 'matrix_shape', keyOf: (tpl, idx) => `matrix_shape|${idx}`, path: ['Tablo Oluşturma'] }
                           )
                     }
                     className="px-3.5 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-black shadow hover:bg-violet-700"
                   >
                     200 Şablonu Soruya Dönüştür
                   </button>
                 </div>

                 <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                   {MATRIX_SHAPE_TEMPLATES.map((tpl, idx) => (
                     <button
                       key={tpl.id}
                       type="button"
                       onClick={() => applyMatrixShapeTemplate(idx)}
                       className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                         matrixShapeTplIdx === idx ? 'bg-violet-600 text-white border-violet-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-violet-50'
                       }`}
                     >
                       {idx + 1}
                     </button>
                   ))}
                 </div>

                 <div className="flex justify-center py-2">
                   <MatrixShapePad
                     matrixData={matrixShapeData}
                     studentCells={{}}
                     onChangeStudentCells={() => {}}
                     readOnly={false}
                     title={`Tablo Oluşturma Şablon #${matrixShapeTplIdx + 1}`}
                   />
                 </div>
               </div>
             )}

             {/* 9. SEKME: TABLO BOYAMA (ÖRNEKTEKİ GİBİ BOYAYALIM - 200 ŞABLON) */}
             {gridSubTab === 'matrix_paint' && (
               <div className="bg-amber-50/40 p-4 rounded-3xl border-2 border-amber-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-2">
                   <span className="text-xs font-black text-amber-800 uppercase">Tablo Boyama Şablonları (1 - 200):</span>
                   <button
                     type="button"
                     disabled={isSaving}
                     onClick={() =>
                       handleBulkGenerateQuestions(
                         MATRIX_PAINT_TEMPLATES,
                         (tpl, idx) => ({
                           name: `Tablo Boyama #${idx + 1}`,
                           text: qText.trim() || "Örnekteki gibi uygun renkleri boyayalım.",
                           image: generateMatrixPaintSvgDataUrl(tpl),
                           questionType: 'matrix_paint',
                           matrixPaintGrid: tpl,
                           options: [],
                           correctText: 'matrix_paint',
                           correctIndex: 0
                         }),
                         "Tablo Boyama",
                             { setId: 'matrix_paint', legacyType: 'matrix_paint', keyOf: (tpl, idx) => `matrix_paint|${idx}`, path: ['Tablo Boyama'] }
                           )
                     }
                     className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-black shadow hover:bg-amber-700"
                   >
                     200 Şablonu Soruya Dönüştür
                   </button>
                 </div>

                 <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                   {MATRIX_PAINT_TEMPLATES.map((tpl, idx) => (
                     <button
                       key={tpl.id}
                       type="button"
                       onClick={() => applyMatrixPaintTemplate(idx)}
                       className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                         matrixPaintTplIdx === idx ? 'bg-amber-600 text-white border-amber-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-amber-50'
                       }`}
                     >
                       {idx + 1}
                     </button>
                   ))}
                 </div>

                 <div className="flex justify-center py-2">
                   <MatrixPaintPad
                     paintData={matrixPaintData}
                     studentCells={{}}
                     onChangeStudentCells={() => {}}
                     readOnly={false}
                     title={`Tablo Boyama Şablon #${matrixPaintTplIdx + 1}`}
                   />
                 </div>
               </div>
             )}

             {/* 10. SEKME: SIRALI ÇİZGİ (RENK SIRASINA GÖRE - ORTA / ZOR 100'ER ŞABLON) */}
             {gridSubTab === 'number_connect' && (
               <div className="bg-cyan-50/40 p-4 rounded-3xl border-2 border-cyan-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-2">
                   <div className="flex items-center gap-2 flex-wrap">
                     <span className="text-xs font-black text-cyan-800 uppercase">Seviye:</span>
                     {[{ id: 'medium', label: 'Orta (100) - 5 şekil, sıra karışık' }, { id: 'hard', label: 'Zor (100) - 6 şekil, tamamen karışık' }].map(lv => (
                       <button key={lv.id} type="button" onClick={() => applyNumberConnectTemplate(lv.id, 0)} className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all ${numberConnectLevel === lv.id ? 'bg-cyan-600 text-white border-cyan-700 shadow' : 'bg-white text-slate-600'}`}>{lv.label}</button>
                     ))}
                   </div>
                   <button
                     type="button"
                     disabled={isSaving}
                     onClick={() =>
                       handleBulkGenerateQuestions(
                         NUMBER_CONNECT_TEMPLATES[numberConnectLevel] || [],
                         (tpl, idx) => {
                           const { id: _i, ...data } = tpl;
                           return {
                             name: `${numberConnectLevel === 'hard' ? 'Zor' : 'Orta'} Sıralı Çizgi #${idx + 1}`,
                             text: qText.trim() || "Üstteki sıraya bak. Şekilleri aynı renk sırasıyla çizgiyle birleştir.",
                             image: generateNumberConnectSvgDataUrl(data),
                             questionType: 'number_connect',
                             numberConnectGrid: data,
                             options: [],
                             correctText: 'number_connect',
                             correctIndex: 0
                           };
                         },
                         `${numberConnectLevel === 'hard' ? 'Zor' : 'Orta'} Sıralı Çizgi`,
                             { setId: 'number_connect', legacyType: 'number_connect', keyOf: (tpl, idx) => `number_connect|${numberConnectLevel}|${idx}`, path: ['Sıralı Çizgi', numberConnectLevel === 'hard' ? 'Zor' : 'Orta'] }
                           )
                     }
                     className="px-3.5 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-black shadow hover:bg-cyan-700"
                   >
                     {numberConnectLevel === 'hard' ? 'Zor' : 'Orta'} 100 Şablonu Soruya Dönüştür
                   </button>
                 </div>

                 <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                   {(NUMBER_CONNECT_TEMPLATES[numberConnectLevel] || []).map((tpl, idx) => (
                     <button
                       key={tpl.id}
                       type="button"
                       onClick={() => applyNumberConnectTemplate(numberConnectLevel, idx)}
                       className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                         numberConnectTplIdx === idx ? 'bg-cyan-600 text-white border-cyan-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-cyan-50'
                       }`}
                     >
                       {idx + 1}
                     </button>
                   ))}
                 </div>

                 <div className="flex justify-center py-2">
                   <NumberConnectPad
                     connectData={numberConnectData}
                     studentConnections={[]}
                     onChangeStudentConnections={() => {}}
                     readOnly={true}
                     showSolution={true}
                     size={260}
                     title={`Sıralı Çizgi Şablon #${numberConnectTplIdx + 1} (Çözüm Önizleme)`}
                   />
                 </div>
               </div>
             )}

             {/* 11. SEKME: ETKİLEŞİMLİ LABİRENT (KOLAY / ORTA / ZOR - 200'ER ŞABLON) */}
             {gridSubTab === 'maze' && (
               <div className="bg-teal-50/40 p-4 rounded-3xl border-2 border-teal-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-black text-teal-800 uppercase">Zorluk:</span>
                     {[
                       { id: 'easy', label: `Kolay ${MAZE_LEVELS.easy.size}×${MAZE_LEVELS.easy.size} (200)` },
                       { id: 'medium', label: `Orta ${MAZE_LEVELS.medium.size}×${MAZE_LEVELS.medium.size} (200)` },
                       { id: 'hard', label: `Zor ${MAZE_LEVELS.hard.size}×${MAZE_LEVELS.hard.size} (200)` }
                     ].map(lv => (
                       <button
                         key={lv.id}
                         type="button"
                         onClick={() => applyMazeTemplate(lv.id, 0)}
                         className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all ${
                           mazeLevel === lv.id ? 'bg-teal-600 text-white border-teal-700 shadow' : 'bg-white text-slate-600'
                         }`}
                       >
                         {lv.label}
                       </button>
                     ))}
                   </div>

                   <button
                     type="button"
                     disabled={isSaving}
                     onClick={() =>
                       handleBulkGenerateQuestions(
                         MAZE_TEMPLATES[mazeLevel] || [],
                         (tpl, idx) => {
                           const payload = buildMazePayload(tpl, { startImage: mazeStartImg || "", endImage: mazeEndImg || "" });
                           return {
                             name: `${MAZE_LEVELS[mazeLevel]?.label || 'Kolay'} Labirent #${idx + 1}`,
                             text: qText.trim() || "Parmağınla doğru yolu takip ederek başlangıçtan hedefe ulaş.",
                             image: generateMazeSvgDataUrl(payload),
                             questionType: 'interactive_maze',
                             mazeGrid: payload,
                             options: [],
                             correctText: 'interactive_maze',
                             correctIndex: 0
                           };
                         },
                         `${mazeLevel === 'easy' ? 'Kolay' : mazeLevel === 'medium' ? 'Orta' : 'Zor'} Labirent`,
                             { setId: 'maze', legacyType: 'interactive_maze', keyOf: (tpl, idx) => `maze|${mazeLevel}|${idx}`, path: ['Labirent', MAZE_LEVELS[mazeLevel]?.label || 'Kolay'] }
                           )
                     }
                     className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-black shadow hover:bg-teal-700"
                   >
                     200 Labirenti Soruya Dönüştür
                   </button>
                 </div>

                 <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                   {(MAZE_TEMPLATES[mazeLevel] || []).map((tpl, idx) => (
                     <button
                       key={tpl.id}
                       type="button"
                       onClick={() => applyMazeTemplate(mazeLevel, idx)}
                       className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                         mazeTplIdx === idx ? 'bg-teal-600 text-white border-teal-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-teal-50'
                       }`}
                     >
                       {idx + 1}
                     </button>
                   ))}
                 </div>

                 <div className="flex justify-center py-2">
                   <InteractiveMazePad
                     mazeData={{ ...mazeData, startImage: mazeStartImg, endImage: mazeEndImg }}
                     studentPath={mazeData.solutionPath || ['0,0']}
                     onChangeStudentPath={() => {}}
                     readOnly={true}
                     size={300}
                     title={`Labirent Şablon #${mazeTplIdx + 1} (Doğru Yol Önizlemesi)`}
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-2 pt-1">
                   <MediaUploader label="Özel Başlangıç Görseli (Varsayılan: 🐰)" value={mazeStartImg} onChange={setMazeStartImg} id="maze-start-img" small />
                   <MediaUploader label="Özel Bitiş / Hedef Görseli (Varsayılan: 🥕)" value={mazeEndImg} onChange={setMazeEndImg} id="maze-end-img" small />
                 </div>
                 <p className="text-[10px] font-bold text-teal-700 text-center">yüklediğiniz görseller hem tek soru kaydında hem de "200 labirenti soruya dönüştür" işleminde kullanılır.</p>
               </div>
             )}

             {/* 12. SEKME: GÖLGE BULMA TEST SORULARI (ORTA / ZOR - 300'ER ŞABLON) */}
             {gridSubTab === 'shadow_quiz' && (
               <div className="bg-slate-100 p-4 rounded-3xl border-2 border-slate-200 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-black text-slate-700 uppercase">Gölge Seviyesi:</span>
                     {SHADOW_LEVELS.map(lv => (
                       <button
                         key={lv.id}
                         type="button"
                         onClick={() => { setShadowLevel(lv.id); setShadowTplIdx(0); }}
                         className={`px-3.5 py-1.5 rounded-xl font-black text-xs border transition-all ${
                           shadowLevel === lv.id ? 'bg-slate-800 text-white border-slate-900 shadow' : 'bg-white text-slate-600'
                         }`}
                       >
                         {lv.label}
                       </button>
                     ))}
                   </div>

                   <button
                     type="button"
                     disabled={isSaving}
                     onClick={() =>
                       handleBulkGenerateQuestions(
                         SHADOW_QUIZ_TEMPLATES[shadowLevel] || [],
                         (tpl) => ({
                           name: tpl.title,
                           text: qText.trim() || "Yukarıdaki resmin doğru gölgesi hangisidir?",
                           image: qCustomAttachmentImg || tpl.mainImage,
                           options: tpl.options,
                           correctText: "",
                           correctIndex: tpl.correctIndex
                         }),
                         `${({ easy: 'Kolay', medium: 'Orta', hard: 'Zor' })[shadowLevel] || 'Orta'} Gölge Bulma`,
                             { setId: 'shadow_quiz', keyOf: (tpl, idx) => `shadow_quiz|${shadowLevel}|${idx}`, path: ['Gölge Bulma', ({ easy: 'Kolay', medium: 'Orta', hard: 'Zor' })[shadowLevel] || 'Orta'] }
                           )
                     }
                     className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-black shadow hover:bg-slate-900"
                   >
                     300 Gölge Sorusunu Soruya Dönüştür
                   </button>
                 </div>

                 <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                   {(SHADOW_QUIZ_TEMPLATES[shadowLevel] || []).map((tpl, idx) => (
                     <button
                       key={tpl.id}
                       type="button"
                       onClick={() => setShadowTplIdx(idx)}
                       className={`w-10 h-7 rounded-lg text-[10px] font-black border transition-all ${
                         shadowTplIdx === idx ? 'bg-slate-800 text-white border-slate-900 shadow' : 'bg-slate-50 text-slate-600'
                       }`}
                     >
                       {idx + 1}
                     </button>
                   ))}
                 </div>

                 {(() => {
                   const curShadow = (SHADOW_QUIZ_TEMPLATES[shadowLevel] || [])[shadowTplIdx] || SHADOW_QUIZ_TEMPLATES.medium[0];
                   return (
                     <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl border">
                       <span className="text-xs font-black text-slate-600">{curShadow.title}</span>
                       <img src={curShadow.mainImage} className="w-32 h-32 object-contain border rounded-2xl p-1" alt="Ana Görsel" />
                       <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
                         {curShadow.options.map((opt, oIdx) => (
                           <div
                             key={oIdx}
                             className={`p-2 rounded-xl border-2 flex flex-col items-center ${
                               oIdx === curShadow.correctIndex ? 'border-green-500 bg-green-50' : 'border-slate-200'
                             }`}
                           >
                             <img src={opt.image} className="w-16 h-16 object-contain" alt="Gölge Şık" />
                             <span className="text-[9px] font-black mt-1 uppercase">
                               {oIdx === curShadow.correctIndex ? '✓ Doğru Gölge' : `Şık ${oIdx + 1}`}
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>
                   );
                 })()}
               </div>
             )}

             {/* 13. SEKME: GRAFİK OLUŞTURMA (KOLAY / ORTA / ZOR - 200'ER ŞABLON) */}
             {gridSubTab === 'bar_graph' && (
               <div className="bg-sky-50/40 p-4 rounded-3xl border-2 border-sky-100 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-3">
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-black text-sky-800 uppercase">Grafik Zorluğu:</span>
                     {[
                       { id: 'easy', label: 'Kolay (200)' },
                       { id: 'medium', label: 'Orta (200)' },
                       { id: 'hard', label: 'Zor (200)' }
                     ].map(lv => (
                       <button
                         key={lv.id}
                         type="button"
                         onClick={() => applyBarGraphTemplate(lv.id, 0)}
                         className={`px-3 py-1.5 rounded-xl font-black text-xs border transition-all ${
                           barGraphLevel === lv.id ? 'bg-sky-600 text-white border-sky-700 shadow' : 'bg-white text-slate-600'
                         }`}
                       >
                         {lv.label}
                       </button>
                     ))}
                   </div>

                   <button
                     type="button"
                     disabled={isSaving}
                     onClick={() =>
                       handleBulkGenerateQuestions(
                         BAR_GRAPH_TEMPLATES[barGraphLevel] || [],
                         (tpl, idx) => ({
                           name: `${barGraphLevel === 'easy' ? 'Kolay' : barGraphLevel === 'medium' ? 'Orta' : 'Zor'} Grafik Oluşturma #${idx + 1}`,
                           text: qText.trim() || "Resimleri say ve kaç tane varsa o kadar kutucuk boya.",
                           image: generateBarGraphSvgDataUrl(buildBarGraphPayload(tpl)),
                           questionType: 'bar_graph',
                           barGraphGrid: buildBarGraphPayload(tpl),
                           options: [],
                           correctText: 'bar_graph',
                           correctIndex: 0
                         }),
                         `${barGraphLevel === 'easy' ? 'Kolay' : barGraphLevel === 'medium' ? 'Orta' : 'Zor'} Grafik Oluşturma`,
                             { setId: 'bar_graph', legacyType: 'bar_graph', keyOf: (tpl, idx) => `bar_graph|${barGraphLevel}|${idx}`, path: ['Grafik Oluşturma', barGraphLevel === 'easy' ? 'Kolay' : barGraphLevel === 'medium' ? 'Orta' : 'Zor'] }
                           )
                     }
                     className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-black shadow hover:bg-sky-700"
                   >
                     200 Şablonu Soruya Dönüştür
                   </button>
                 </div>

                 <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                   {(BAR_GRAPH_TEMPLATES[barGraphLevel] || []).map((tpl, idx) => (
                     <button
                       key={tpl.id}
                       type="button"
                       onClick={() => applyBarGraphTemplate(barGraphLevel, idx)}
                       className={`w-9 h-7 rounded-lg text-[10px] font-black border transition-all ${
                         barGraphTplIdx === idx ? 'bg-sky-600 text-white border-sky-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-sky-50'
                       }`}
                     >
                       {idx + 1}
                     </button>
                   ))}
                 </div>

                 <div className="flex justify-center py-2">
                   <BarGraphActivityPad
                     graphData={buildBarGraphPayload(barGraphData)}
                     studentCols={{}}
                     onChangeStudentCols={() => {}}
                     readOnly={false}
                     title={`Grafik Oluşturma Şablon #${barGraphTplIdx + 1}`}
                   />
                 </div>

                 <div className="bg-white p-3 rounded-2xl border border-sky-200 space-y-2">
                   <div className="flex items-center justify-between gap-2 flex-wrap">
                     <span className="text-[10px] font-black text-sky-800 uppercase flex items-center gap-1"><ImageIcon size={13}/> nesne görsellerini değiştir (emoji yerine kendi resminiz)</span>
                     {barGraphIconImages.some(Boolean) && <button type="button" onClick={() => setBarGraphIconImages([])} className="text-[10px] font-bold text-red-500 underline">tümünü sıfırla</button>}
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                     {(barGraphData?.icons || []).map((ic, i) => (
                       <MediaUploader
                         key={`bg-img-${i}`}
                         label={`${i + 1}. nesne (${ic})`}
                         value={barGraphIconImages[i] || ""}
                         onChange={(v) => setBarGraphIconImages(prev => { const next = [...prev]; next[i] = v; return next; })}
                         id={`bar-graph-img-${i}`}
                         small
                       />
                     ))}
                   </div>
                   <p className="text-[10px] font-bold text-slate-400">görseller sütun sırasına göre uygulanır; toplu dönüştürmede her şablonun 1., 2., 3. ... nesnesinin yerine geçer.</p>
                 </div>
               </div>
             )}

             {/* 14. SEKME: SIRAYI TAKİP ET (YANIP SÖNEN KARELER) */}
             {gridSubTab === 'sequence_memory' && (
               <div className="bg-fuchsia-50/40 p-4 rounded-3xl border-2 border-fuchsia-100 space-y-4">
                 <div className="flex flex-wrap items-center gap-2">
                   <span className="text-xs font-black text-fuchsia-800 uppercase">kare sayısı:</span>
                   {SEQUENCE_SQUARE_COUNTS.map(cnt => (
                     <button key={cnt} type="button" onClick={() => applySequenceTemplate(cnt, seqLevel, 0)} className={`px-3 py-1.5 rounded-xl font-black text-xs border ${seqCount === cnt ? 'bg-fuchsia-600 text-white border-fuchsia-700 shadow' : 'bg-white text-slate-600'}`}>{cnt} Kare</button>
                   ))}
                 </div>
                 <div className="flex flex-wrap items-center justify-between gap-2">
                   <div className="flex flex-wrap items-center gap-2">
                     <span className="text-xs font-black text-fuchsia-800 uppercase">zorluk:</span>
                     {Object.entries(SEQUENCE_LEVELS).map(([id, cfg]) => (
                       <button key={id} type="button" onClick={() => applySequenceTemplate(seqCount, id, 0)} className={`px-3 py-1.5 rounded-xl font-black text-xs border ${seqLevel === id ? 'bg-fuchsia-600 text-white border-fuchsia-700 shadow' : 'bg-white text-slate-600'}`}>
                         {cfg.label} ({cfg.length} kez{id === 'easy' ? ', sıralı' : ', karışık'})
                       </button>
                     ))}
                   </div>
                   <button
                     type="button"
                     disabled={isSaving}
                     onClick={() =>
                       handleBulkGenerateQuestions(
                         SEQUENCE_TEMPLATES[seqCount]?.[seqLevel] || [],
                         (tpl, idx) => {
                           const payload = buildSequencePayload(tpl, { allowReplay: seqAllowReplay });
                           return {
                             name: `${seqCount} Kare - ${SEQUENCE_LEVELS[seqLevel].label} Sırayı Takip Et #${idx + 1}`,
                             text: qText.trim() || "Kareler hangi sırayla yandı? Sen de aynı sırayla dokun.",
                             image: generateSequenceSvgDataUrl(payload),
                             questionType: 'sequence_memory',
                             sequenceGrid: payload,
                             options: [],
                             correctText: 'sequence_memory',
                             correctIndex: 0
                           };
                         },
                         `${seqCount} Kare ${SEQUENCE_LEVELS[seqLevel].label} Sırayı Takip Et`,
                             { setId: 'sequence_memory', legacyType: 'sequence_memory', keyOf: (tpl, idx) => `sequence_memory|${seqCount}|${seqLevel}|${idx}`, path: ['Sırayı Takip Et', `${seqCount} Kare`, SEQUENCE_LEVELS[seqLevel].label] }
                           )
                     }
                     className="px-3.5 py-1.5 rounded-xl bg-fuchsia-600 text-white text-xs font-black shadow hover:bg-fuchsia-700"
                   >
                     {(SEQUENCE_TEMPLATES[seqCount]?.[seqLevel] || []).length} Şablonu Soruya Dönüştür
                   </button>
                 </div>

                 <label className="flex items-center gap-2 text-xs font-black text-fuchsia-900 cursor-pointer w-fit">
                   <input type="checkbox" checked={seqAllowReplay} onChange={e => setSeqAllowReplay(e.target.checked)} className="w-4 h-4" />
                   çocuk "tekrar izle" düğmesini kullanabilsin
                 </label>

                 <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                   {(SEQUENCE_TEMPLATES[seqCount]?.[seqLevel] || []).map((tpl, idx) => (
                     <button key={tpl.id} type="button" onClick={() => applySequenceTemplate(seqCount, seqLevel, idx)} className={`w-9 h-7 rounded-lg text-[10px] font-black border ${seqTplIdx === idx ? 'bg-fuchsia-600 text-white border-fuchsia-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-fuchsia-50'}`}>{idx + 1}</button>
                   ))}
                 </div>

                 {currentSeqTemplate && (
                   <div className="flex flex-col items-center gap-2 py-2">
                     <SequenceMemoryPad
                       key={`seq-admin-${seqCount}-${seqLevel}-${seqTplIdx}-${seqPreviewKey}`}
                       seqData={buildSequencePayload(currentSeqTemplate, { allowReplay: true })}
                       studentSequence={[]}
                       onChangeStudentSequence={() => {}}
                       readOnly={false}
                       autoPlay={true}
                       showAnswerKey={true}
                       size={320}
                       title={`${seqCount} kare • ${SEQUENCE_LEVELS[seqLevel].label} • şablon #${seqTplIdx + 1}`}
                     />
                   </div>
                 )}
               </div>
             )}

             {/* 15. SEKME: OLAY SIRALAMA */}
             {gridSubTab === 'event_order' && (() => {
               const eoList = getEventOrderTemplates(eoLevel);
               const eoTpl = eoList[eoTplIdx] || eoList[0];
               return (
                 <div className="bg-lime-50/50 p-4 rounded-3xl border-2 border-lime-100 space-y-4">
                   <div className="flex flex-wrap items-center justify-between gap-2">
                     <div className="flex flex-wrap items-center gap-2">
                       <span className="text-xs font-black text-lime-900 uppercase">zorluk:</span>
                       {Object.entries(EVENT_ORDER_LEVELS).map(([id, cfg]) => (
                         <button key={id} type="button" onClick={() => { setEoLevel(id); setEoTplIdx(0); }} className={`px-3 py-1.5 rounded-xl font-black text-xs border ${eoLevel === id ? 'bg-lime-600 text-white border-lime-700 shadow' : 'bg-white text-slate-600'}`}>
                           {cfg.label} ({cfg.n} resim)
                         </button>
                       ))}
                     </div>
                     <button type="button" disabled={isSaving} onClick={() => handleBulkGenerateQuestions(eoList, (tpl, idx) => {
                         const payload = buildEventOrderPayload(tpl);
                         return {
                           name: `${EVENT_ORDER_LEVELS[eoLevel].label} Olay Sıralama #${idx + 1} • ${tpl.title}`,
                           text: qText.trim() || EVENT_ORDER_TEXT,
                           ttsText: qText.trim() || EVENT_ORDER_TEXT,
                           ttsOn: true,
                           image: generateEventOrderSvgDataUrl(payload),
                           questionType: 'event_order',
                           eventOrderGrid: payload,
                           options: [],
                           correctText: 'event_order',
                           correctIndex: 0
                         };
                       }, `${EVENT_ORDER_LEVELS[eoLevel].label} Olay Sıralama`,
                             { setId: 'event_order', legacyType: 'event_order', keyOf: (tpl, idx) => `event_order|${eoLevel}|${idx}`, path: ['Olay Sıralama', EVENT_ORDER_LEVELS[eoLevel].label] }
                           )}
                       className="px-3.5 py-1.5 rounded-xl bg-lime-600 text-white text-xs font-black shadow hover:bg-lime-700">
                       {eoList.length} Şablonu Soruya Dönüştür
                     </button>
                   </div>
                   <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white rounded-2xl border custom-scrollbar">
                     {eoList.map((t, idx) => (
                       <button key={t.id} type="button" title={t.title} onClick={() => setEoTplIdx(idx)} className={`w-9 h-7 rounded-lg text-[10px] font-black border ${eoTplIdx === idx ? 'bg-lime-600 text-white border-lime-700 shadow' : 'bg-slate-50 text-slate-600 hover:bg-lime-50'}`}>{idx + 1}</button>
                     ))}
                   </div>
                   {eoTpl && (
                     <div className="flex flex-col items-center gap-2 py-2">
                       <div className="text-xs font-black text-lime-900">#{eoTplIdx + 1} • {eoTpl.title} <span className="text-slate-400 font-bold">(yeşil sayılar doğru sırayı gösterir)</span></div>
                       <EventOrderPad key={`eo-admin-${eoLevel}-${eoTplIdx}`} grid={buildEventOrderPayload(eoTpl)} picked={[]} onChange={() => {}} readOnly={true} showAnswer={true} />
                     </div>
                   )}
                 </div>
               );
             })()}

             <div className="flex justify-between items-center">
               <select value={qFolderId} onChange={e => setQFolderId(e.target.value)} className="w-full sm:w-1/2 p-3 border-2 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-colors text-sm">
                 <option value="">havuz (ana dizin)</option>
                 {orderedFolders.map(f => <option key={f.id} value={f.id}>{f.displayName}</option>)}
               </select>
             </div>

             <input
               placeholder="soru adı (sadece yönetici görecek, isteğe bağlı)..."
               className="w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-colors"
               value={qName}
               onChange={e => setQName(e.target.value)}
             />
             <textarea
               placeholder="yönerge / soru metni (isteğe bağlı, çocuklar görecek)..."
               className="w-full p-4 border-2 rounded-2xl font-bold outline-none h-20 focus:border-indigo-500 transition-colors"
               value={qText}
               onChange={e => setQText(e.target.value)}
             />

             {/* TÜM ETKİLEŞİMLİ SORULARDA GÖRSEL VE SES EKLEME SEÇENEĞİ */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
               <MediaUploader label="soruya özel ek görsel (isteğe bağlı)" value={qCustomAttachmentImg} onChange={setQCustomAttachmentImg} id="dot-custom-img" type="image" small />
               <MediaUploader label="ön ses 1 (ilk çalar)" value={qPreAud1} onChange={setQPreAud1} id="dot-q4-1" type="audio" small />
               <MediaUploader label="ön ses 2 (ikinci çalar)" value={qPreAud2} onChange={setQPreAud2} id="dot-q4-2" type="audio" small />
               <MediaUploader label="soru sesi" value={qAud} onChange={setQAud} id="dot-q3" type="audio" small />
             </div>

             <button
               disabled={isSaving}
               onClick={
                 gridSubTab === 'dot' ? saveDotQ :
                 gridSubTab === 'color_box' ? saveColorBoxQ :
                 gridSubTab === 'sudoku' ? saveSudokuQ :
                 gridSubTab === 'color_pattern' ? savePatternQ :
                 gridSubTab === 'symmetry' ? saveSymmetryQ :
                 gridSubTab === 'matrix_shape' ? saveMatrixShapeQ :
                 gridSubTab === 'matrix_paint' ? saveMatrixPaintQ :
                 gridSubTab === 'number_connect' ? saveNumberConnectQ :
                 gridSubTab === 'maze' ? saveMazeQ :
                 gridSubTab === 'shadow_quiz' ? saveShadowQuizQ :
                 gridSubTab === 'bar_graph' ? saveBarGraphQ :
                 gridSubTab === 'sequence_memory' ? saveSequenceQ :
                 gridSubTab === 'event_order' ? saveEventOrderQ :
                 saveCodingQ
               }
               className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all"
             >
               {isSaving ? "kaydediliyor..." : (editingQ ? "soruyu güncelle" : "soruyu kaydet")}
             </button>
           </div>

           {renderSavedQuestionsSection()}
         </div>
       )}
       {folderAsk && createPortal(
         <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => closeFolderAsk(undefined)}>
           <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-3 shadow-2xl" onClick={e => e.stopPropagation()}>
             <h4 className="font-black text-slate-800 text-base">📁 {folderAsk.title}</h4>
             <select value={folderAsk.value} onChange={e => setFolderAsk(p => ({ ...p, value: e.target.value }))} className="w-full p-3 border-2 rounded-xl font-bold text-sm outline-none">
               <option value="">(klasörsüz)</option>
               {tfOrdered.map(f => <option key={f.id} value={f.id}>{'  '.repeat(f.level)}{f.level > 0 ? '└ ' : ''}{f.name}</option>)}
             </select>
             <div className="flex gap-2">
               <button type="button" onClick={() => closeFolderAsk(undefined)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-black text-sm">vazgeç</button>
               <button type="button" onClick={() => closeFolderAsk(folderAsk.value || null)} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm">kaydet</button>
             </div>
           </div>
         </div>, document.body
       )}
       {tab === 'tests' && (
         <div className="space-y-6">
             {channelSwitcher}
             <div className="bg-white p-6 rounded-3xl border-2 border-indigo-50 shadow-lg space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2"><ListChecks size={18}/> {editingT ? 'testi düzenle' : 'yeni test'}</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRobotPanel(!showRobotPanel)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all shadow-sm ${
                        showRobotPanel ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                      }`}
                    >
                      <Atom size={16} />
                      <span>Akıllı Test Oluşturma Robotu</span>
                    </button>
                    {editingT && <button onClick={() => { setEditingT(null); setTName(""); setTSelectedQs([]); }} className="text-xs text-red-500 font-bold">yeni test</button>}
                  </div>
               </div>

               {/* AKILLI TEST OLUŞTURMA ROBOTU PANELİ */}
               {showRobotPanel && (
                 <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                   <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                     <div>
                       <h5 className="font-black text-amber-900 text-sm uppercase flex items-center gap-2">
                         <Atom size={18} className="text-amber-600" /> Otomatik Test Oluşturma Robotu
                       </h5>
                       <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                         Aşağıdaki klasör ağacından istediğiniz ana klasörleri veya alt klasörleri işaretleyin. Robot, en az teste girmiş sorulardan başlayarak her alt klasörden eşit ve rastgele dağıtarak testlerinizi otomatik üretir.
                       </p>
                     </div>
                     <span className="bg-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs font-black shrink-0">
                       {selectedFolders.length} Klasör Seçili{folderQCountText}
                     </span>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                     <div className="bg-white p-3 rounded-2xl border border-amber-200">
                       <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Test Başına Soru Sayısı</label>
                       <input
                         type="number"
                         min="1"
                         max="100"
                         value={robotQuestionsPerTest}
                         onChange={e => setRobotQuestionsPerTest(e.target.value)}
                         className="w-full p-2 border-2 border-slate-200 rounded-xl font-black text-center text-base text-indigo-700 outline-none focus:border-indigo-500"
                       />
                     </div>
                     <div className="bg-white p-3 rounded-2xl border border-amber-200">
                       <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Kaç Adet Test Üretilsin?</label>
                       <input
                         type="number"
                         min="1"
                         max="300"
                         value={robotTestCount}
                         onChange={e => setRobotTestCount(e.target.value)}
                         className="w-full p-2 border-2 border-slate-200 rounded-xl font-black text-center text-base text-indigo-700 outline-none focus:border-indigo-500"
                       />
                     </div>
                     <div className="bg-white p-3 rounded-2xl border border-amber-200">
                       <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Test Başlangıç Adı</label>
                       <input
                         type="text"
                         placeholder="Örn: Karma Test"
                         value={robotBaseName}
                         onChange={e => setRobotBaseName(e.target.value)}
                         className="w-full p-2 border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-indigo-500"
                       />
                     </div>
                     <div className="bg-white p-3 rounded-2xl border border-amber-200">
                       <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Başlangıç Numarası</label>
                       <input
                         type="number"
                         min="1"
                         value={robotStartNumber}
                         onChange={e => setRobotStartNumber(e.target.value)}
                         className="w-full p-2 border-2 border-slate-200 rounded-xl font-black text-center text-base text-slate-700 outline-none focus:border-indigo-500"
                       />
                     </div>
                   </div>

                   {/* KLASÖRE ÖZEL KURALLAR */}
                   <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
                     <div className="px-3 py-2 bg-amber-100/70 border-b border-amber-200 flex items-center justify-between gap-2 flex-wrap">
                       <span className="text-[11px] font-black text-amber-900 uppercase">Klasör Kuralları (her testte bu klasörden kaç soru?)</span>
                       <span className="text-[10px] font-bold text-amber-700">Otomatik = kalan yerlere eşit dağıtılır</span>
                     </div>
                     {getRobotRuleRoots().length === 0 ? (
                       <div className="p-3 text-[11px] font-bold text-slate-400 text-center">aşağıdaki klasör ağacından klasör işaretleyince burada listelenir.</div>
                     ) : (
                       <div className="divide-y divide-amber-100">
                         {getRobotRuleRoots().map(fid => {
                           const f = folders.find(x => x.id === fid);
                           const rule = robotFolderRules[fid] || { mode: 'auto', value: '', ignoreUsage: false };
                           const qN = Math.max(1, Number(robotQuestionsPerTest) || 10);
                           const resolved = rule.mode === 'count' ? Math.round(Number(rule.value) || 0) : rule.mode === 'percent' ? Math.round(((Number(rule.value) || 0) / 100) * qN) : null;
                           return (
                             <div key={fid} className="px-3 py-2 flex flex-wrap items-center gap-2">
                               <span className="font-black text-xs text-slate-700 flex items-center gap-1 min-w-[120px] flex-1"><Folder size={13} className="text-amber-600"/> {f?.name || fid}</span>
                               <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                                 {[{ id: 'auto', l: 'Otomatik' }, { id: 'count', l: 'Adet' }, { id: 'percent', l: 'Yüzde %' }].map(m => (
                                   <button key={m.id} type="button" onClick={() => updateRobotRule(fid, { mode: m.id })} className={`px-2 py-1 rounded-md text-[10px] font-black ${rule.mode === m.id ? 'bg-amber-500 text-white shadow' : 'text-slate-500'}`}>{m.l}</button>
                                 ))}
                               </div>
                               {rule.mode !== 'auto' && (
                                 <input type="number" min="0" max={rule.mode === 'percent' ? 100 : 100} value={rule.value} onChange={e => updateRobotRule(fid, { value: e.target.value })} placeholder={rule.mode === 'percent' ? '%' : 'adet'} className="w-16 p-1 rounded-lg border-2 border-amber-200 font-black text-center text-sm" />
                               )}
                               {resolved !== null && <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">her testte {resolved} soru</span>}
                               <label className={`flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-lg border cursor-pointer ${rule.ignoreUsage ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`} title="Açıkken bu klasörün soruları başka testlerde kaç kez kullanıldığına bakılmadan rastgele seçilir. Diğer klasörler 'en az kullanılan' kuralına uymaya devam eder.">
                                 <input type="checkbox" checked={Boolean(rule.ignoreUsage)} onChange={e => updateRobotRule(fid, { ignoreUsage: e.target.checked })} className="w-3.5 h-3.5" />
                                 kullanım sayısına bakma (rastgele)
                               </label>
                             </div>
                           );
                         })}
                       </div>
                     )}
                     {(() => {
                       const qN = Math.max(1, Number(robotQuestionsPerTest) || 10);
                       const fixed = getRobotRuleRoots().reduce((sum, fid) => {
                         const r = robotFolderRules[fid];
                         if (!r) return sum;
                         if (r.mode === 'count') return sum + Math.round(Number(r.value) || 0);
                         if (r.mode === 'percent') return sum + Math.round(((Number(r.value) || 0) / 100) * qN);
                         return sum;
                       }, 0);
                       if (getRobotRuleRoots().length === 0) return null;
                       return (
                         <div className={`px-3 py-1.5 text-[10px] font-black border-t ${fixed > qN ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                           {fixed > qN ? `Dikkat: kotalar toplamı (${fixed}) test başına soru sayısını (${qN}) aşıyor; fazlası kesilir.` : `${qN} sorunun ${fixed} tanesi kurallı klasörlerden, ${qN - fixed} tanesi otomatik dağıtımdan gelecek.`}
                         </div>
                       );
                     })()}
                   </div>

                   <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                     <div className="flex flex-wrap items-center gap-4">
                       <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-emerald-800">
                         <input type="checkbox" checked={robotShuffleInside} onChange={e => setRobotShuffleInside(e.target.checked)} className="w-4 h-4 rounded" />
                         <span>Test içinde soruları karıştır</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-amber-900">
                         <input
                           type="checkbox"
                           checked={robotIncludeSubfolders}
                           onChange={e => setRobotIncludeSubfolders(e.target.checked)}
                           className="w-4 h-4 rounded text-amber-600"
                         />
                         <span>Ana klasör seçildiğinde alt klasörlerini de otomatik dahil et</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-indigo-800">
                         <input
                           type="checkbox"
                           checked={robotPublishImmediately}
                           onChange={e => setRobotPublishImmediately(e.target.checked)}
                           className="w-4 h-4 rounded text-indigo-600"
                         />
                         <span>Oluşturulan testleri direkt yayınla (aktif et)</span>
                       </label>
                     </div>

                     <button
                       type="button"
                       disabled={isRobotRunning}
                       onClick={handleRunTestRobot}
                       className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg text-xs uppercase flex items-center gap-2 active:scale-95 transition-all"
                     >
                       {isRobotRunning ? (
                         <>
                           <Loader2 size={16} className="animate-spin" />
                           <span>Robot Testleri Hazırlıyor...</span>
                         </>
                       ) : (
                         <>
                           <Play size={16} fill="currentColor" />
                           <span>{robotQuestionsPerTest} Soruluk {robotTestCount} Testi Şimdi Üret</span>
                         </>
                       )}
                     </button>
                   </div>
                 </div>
               )}

               <input placeholder="test adı" className="w-full p-4 border-2 rounded-2xl font-bold outline-none" value={tName} onChange={e => setTName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveT(false)} />

               <div className="flex flex-col gap-4">

                 <div className="border-2 rounded-2xl p-2 bg-slate-50 flex flex-col relative min-h-[400px]">
                     <div className="flex flex-col gap-2 mb-2 sticky top-0 bg-slate-50 z-10 p-1 border-b">
                         <div className="flex items-center justify-between">
                             <p className="text-[10px] font-black text-slate-400 uppercase">havuz ve klasörler</p>
                             <div className="flex gap-2">
                                 <button onClick={() => handleLoadFolder(null, true)} className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded shadow-sm hover:bg-slate-300 flex items-center gap-1"><FolderOpen size={12}/> ana dizini yükle</button>
                                 <button onClick={() => {
                                     const rootQs = questions.filter(q => !q.folderId);
                                     toggleSelectAllInFolder(rootQs);
                                 }} className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded shadow-sm hover:bg-slate-300 flex items-center gap-1"><CheckSquare size={12}/> seç</button>
                                 {(clipboardQIds.length > 0 || clipboardFolderIds.length > 0) && <button onClick={() => pasteItems(null)} className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded hover:bg-indigo-200 shadow-sm flex items-center gap-1"><ClipboardPaste size={12}/> {clipboardAction === 'cut' ? 'taşı' : 'yapıştır'} ({clipboardQIds.length + clipboardFolderIds.length})</button>}
                                 <button onClick={() => addFolder(null)} className="text-[10px] font-bold text-white bg-slate-400 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-500 shadow-sm"><FolderPlus size={12}/> klasör ekle</button>
                                 {folders.filter(x => !x.parentId).length > 1 && <button onClick={() => sortFoldersAlphabetically(null)} title="ana dizindeki klasörleri A→Z sırala (yukarı/aşağı oklarla elle de taşıyabilirsin)" className="text-[10px] font-bold text-slate-600 bg-white border px-2 py-1 rounded hover:bg-slate-50 shadow-sm">A→Z sırala</button>}
                                 <button onClick={handleCopyAllToTestEnvironment} disabled={isSaving} title="tüm soruları ve klasörleri deneme projesine aktar" className="text-[10px] font-bold text-white bg-fuchsia-500 px-2 py-1 rounded flex items-center gap-1 hover:bg-fuchsia-600 shadow-sm disabled:opacity-50"><UploadCloud size={12}/> tümünü deneme projesine aktar</button>
                             </div>
                         </div>
                         <div className="flex flex-wrap items-center gap-1.5">
                             <button onClick={toggleSelPanel} className={`text-[10px] font-black px-2.5 py-1 rounded shadow-sm flex items-center gap-1 ${selPanel ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}>⭐ seçimlerim {savedSels && savedSels.length ? `(${savedSels.length})` : ''}</button>
                             {selPanel && savedSels === null && <Loader2 size={14} className="animate-spin text-amber-500" />}
                             {selPanel && (savedSels || []).map((sel, i) => {
                               const live = (sel.folders || []).filter(id => folders.some(f => f.id === id)).length;
                               return (
                                 <span key={sel.id} className="inline-flex items-center bg-white border-2 border-amber-200 rounded-full overflow-hidden shadow-sm">
                                   <button onClick={() => applySel(sel)} title={`${live} klasör${(sel.qs || []).length ? `, ${(sel.qs || []).length} soru` : ''} seçilir`} className="pl-2 pr-1.5 py-0.5 text-[11px] font-black text-amber-900 hover:bg-amber-50"><span className="text-amber-500">{i + 1}.</span> {sel.name} <span className="text-[9px] text-slate-400">· {live} klasör{(sel.qs || []).length ? ` · ${(sel.qs || []).length} soru` : ''}</span></button>
                                   <button onClick={() => deleteSel(sel)} title="seçimi sil" className="px-1.5 py-0.5 text-[11px] font-black text-slate-300 hover:text-red-500 hover:bg-red-50">✕</button>
                                 </span>
                               );
                             })}
                         </div>
                         {selPanel && savedSels !== null && (
                           <div className="flex flex-wrap items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg p-1.5">
                             <input value={selName} onChange={e => setSelName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveCurrentSel()} placeholder={`ad verin (boş: seçim ${(savedSels || []).length + 1})`} className="flex-1 min-w-[140px] text-[11px] font-bold p-1.5 rounded border outline-none bg-white" />
                             <button onClick={saveCurrentSel} className="text-[10px] font-black text-white bg-amber-500 hover:bg-amber-600 px-2.5 py-1.5 rounded shadow-sm">şu anki seçimi kaydet ({selectedFolders.length} klasör{selectedPoolQs.length ? `, ${selectedPoolQs.length} soru` : ''})</button>
                           </div>
                         )}
                         {copyProgress && (
                             <div className="bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-700 rounded-lg px-3 py-1.5 text-[11px] font-black flex items-center gap-2"><Loader2 size={14} className="animate-spin"/> {copyProgress}</div>
                         )}

                         {(selectedPoolQs.length > 0 || selectedFolders.length > 0) && (
                             <div className="bg-indigo-100 p-3 rounded-xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-1 border border-indigo-200 shadow-sm">
                                 <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                                     <span className="text-xs font-black text-indigo-800">{selectedPoolQs.length} Soru, {selectedFolders.length} Klasör Seçili{folderQCountText ? ` (klasörlerin içinde${folderQCountText.replace(' · ', ' ')})` : ''}</span>
                                     <div className="flex gap-2 flex-wrap items-center justify-end">
                                        <button onClick={() => copyBulkItems('copy')} className="bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-blue-600 flex items-center gap-1"><Copy size={12}/> kopyala</button>
                                        <button onClick={() => copyBulkItems('cut')} className="bg-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-orange-600 flex items-center gap-1"><Scissors size={12}/> kes</button>
                                        <div className="flex items-center gap-1 border-r border-indigo-300 pr-2">
                                            <input type="text" placeholder="toplu isim..." value={bulkName} onChange={e => setBulkName(e.target.value)} className="text-xs p-1 rounded border outline-none w-24 sm:w-28 bg-white" />
                                            <button onClick={handleBulkRename} className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold hover:bg-green-600">isim yaz</button>
                                        </div>
                                        <select id="bulkFolderSelect" className="text-xs p-1 rounded-lg border outline-none max-w-[120px] bg-white">
                                           <option value="">havuz'a (kök)</option>
                                           {orderedFolders.map(f => <option key={f.id} value={f.id}>{f.displayName}</option>)}
                                        </select>
                                        <button onClick={() => handleBulkMove(document.getElementById('bulkFolderSelect').value || null)} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-indigo-700">taşı</button>
                                        <button onClick={handleCopyToTestEnvironment} disabled={isSaving} className="bg-fuchsia-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-fuchsia-700 disabled:opacity-50">test'e kopyala (sınırsız)</button>
                                     </div>
                                 </div>

                                 {/* SEÇİLİ SORULAR İÇİN TOPLU SÜRE VE HAFIZA AYARI PANELİ */}
                                 <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-indigo-200 bg-indigo-50/80 p-2 rounded-lg">
                                     <div className="flex items-center gap-1.5">
                                         <span className="text-[10px] font-black text-indigo-900 uppercase">Toplu Süre (sn):</span>
                                         <input type="number" min="5" max="300" value={bulkTimeLimit} onChange={e => setBulkTimeLimit(e.target.value)} className="w-16 p-1 rounded border font-bold text-center bg-white text-xs" />
                                     </div>
                                     <div className="flex items-center gap-1.5">
                                         <span className="text-[10px] font-black text-indigo-900 uppercase">Hafıza Modu:</span>
                                         <select value={bulkMemoryMode} onChange={e => setBulkMemoryMode(e.target.value)} className="text-xs p-1 rounded border outline-none bg-white font-bold">
                                             <option value="no_change">Değiştirme</option>
                                             <option value="enable">Aç (Süreli Görme)</option>
                                             <option value="disable">Kapat (Daimi Göster)</option>
                                         </select>
                                     </div>
                                     {bulkMemoryMode === 'enable' && (
                                         <div className="flex items-center gap-1">
                                             <span className="text-[10px] font-black text-indigo-900 uppercase">Bakma (sn):</span>
                                             <input type="number" min="2" max="60" value={bulkMemoryTime} onChange={e => setBulkMemoryTime(e.target.value)} className="w-14 p-1 rounded border font-bold text-center bg-white text-xs" />
                                         </div>
                                     )}
                                     <button
                                         type="button"
                                         disabled={isSaving}
                                         onClick={handleBulkUpdateSettingsForSelection}
                                         className="ml-auto px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black rounded-lg shadow active:scale-95 transition-all"
                                     >
                                         {isSaving ? "Güncelleniyor..." : "Seçili Tüm Soruların Süre/Hafızasını Güncelle"}
                                     </button>
                                 </div>

                                 {/* SEÇİLİ KLASÖR / SORULARA TOPLU SES */}
                                 <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-200 bg-orange-50/80 p-2 rounded-lg">
                                     <span className="text-[10px] font-black text-orange-900 uppercase">Toplu ses:</span>
                                     <select value={bulkAudioSlot} onChange={e => setBulkAudioSlot(e.target.value)} className="text-xs p-1 rounded border outline-none bg-white font-bold">
                                         {Object.entries(BULK_AUDIO_SLOTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                     </select>
                                     <div className="w-44 sm:w-56"><MediaUploader small label="sesi seç / yükle" value={bulkAudioUrl} onChange={setBulkAudioUrl} type="audio" id="bulk-audio-upload" /></div>
                                     <button type="button" disabled={isSaving || !bulkAudioUrl} onClick={() => handleBulkPatchSelection(() => ({ [bulkAudioSlot]: bulkAudioUrl }), `"${BULK_AUDIO_SLOTS[bulkAudioSlot]}" olarak yüklenen ses eklenecek`)} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-lg shadow disabled:opacity-40">seçili sorulara ekle</button>
                                     <button type="button" disabled={isSaving} onClick={() => handleBulkPatchSelection((q) => (q[bulkAudioSlot] ? { [bulkAudioSlot]: '' } : null), `"${BULK_AUDIO_SLOTS[bulkAudioSlot]}" kaldırılacak`)} className="px-3 py-1.5 bg-white border border-orange-300 text-orange-700 text-xs font-black rounded-lg">kaldır</button>
                                 </div>

                                 {/* TELEFONLA SESLİ OKUMA + HİKÂYE TEKRARI */}
                                 <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-200 bg-sky-50/80 p-2 rounded-lg">
                                     <span className="text-[10px] font-black text-sky-900 uppercase">Telefonla oku:</span>
                                     <button type="button" disabled={isSaving} onClick={() => handleBulkPatchSelection((q) => (ttsTextOf(q) ? { ttsOn: true, ttsText: ttsTextOf(q) } : null), 'telefonla sesli okuma AÇILACAK (ses yüklenmemiş sorularda soru metni okunur)')} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-lg shadow">aç</button>
                                     <button type="button" disabled={isSaving} onClick={() => handleBulkPatchSelection(() => ({ ttsOn: false }), 'telefonla sesli okuma KAPATILACAK')} className="px-3 py-1.5 bg-white border border-sky-300 text-sky-700 text-xs font-black rounded-lg">kapat</button>
                                     <span className="text-[10px] font-black text-sky-900 uppercase ml-2">Hikâyeyi tekrar dinleme:</span>
                                     <button type="button" disabled={isSaving} onClick={() => handleBulkPatchSelection((q) => (q.storyText || q.storyAudio ? { storyReplay: true } : null), 'çocuk hikâyeyi soru ekranında TEKRAR DİNLEYEBİLECEK')} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-lg shadow">aç</button>
                                     <button type="button" disabled={isSaving} onClick={() => handleBulkPatchSelection((q) => (q.storyText || q.storyAudio ? { storyReplay: false } : null), 'hikâyeyi tekrar dinleme düğmesi KAPATILACAK')} className="px-3 py-1.5 bg-white border border-sky-300 text-sky-700 text-xs font-black rounded-lg">kapat</button>
                                 </div>

                                 {/* EKRANDA YAZI: soru yazısı / şık yazısı (klasör klasör) */}
                                 <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-200 bg-violet-50/80 p-2 rounded-lg">
                                     <span className="text-[10px] font-black text-violet-900 uppercase">Soru yazısı:</span>
                                     <button type="button" disabled={isSaving} onClick={() => handleBulkPatchSelection((q) => (q.text || q.memoryText ? { hideText: false } : null), 'soru yazısı ekranda GÖRÜNECEK')} className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-lg shadow">göster</button>
                                     <button type="button" disabled={isSaving} onClick={() => handleBulkPatchSelection((q) => (q.text || q.memoryText ? { hideText: true } : null), 'soru yazısı ekranda GİZLENECEK (ses ve telefonla okuma devam eder)')} className="px-3 py-1.5 bg-white border border-violet-300 text-violet-700 text-xs font-black rounded-lg">gizle</button>
                                     <span className="text-[10px] font-black text-violet-900 uppercase ml-2">Şık yazısı:</span>
                                     <button type="button" disabled={isSaving} onClick={() => handleBulkPatchSelection((q) => ((q.options || []).some(o => o && o.text) ? { hideOptionText: false } : null), 'şıkların yazısı ekranda GÖRÜNECEK')} className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-lg shadow">göster</button>
                                     <button type="button" disabled={isSaving} onClick={() => handleBulkPatchSelection((q) => ((q.options || []).some(o => o && o.text) ? { hideOptionText: true } : null), 'şıkların yazısı ekranda GİZLENECEK (resmi olmayan şık "sesi dinle" düğmesiyle sesli okunur)')} className="px-3 py-1.5 bg-white border border-violet-300 text-violet-700 text-xs font-black rounded-lg">gizle</button>
                                 </div>

                                 {/* TEHLİKELİ İŞLEM: diğer düğmelerden ayrı */}
                                 <div className="mt-1 flex flex-wrap items-center gap-2 p-2.5 rounded-lg border-2 border-dashed border-red-300 bg-red-50">
                                     <span className="text-[10px] font-black text-red-700 uppercase">⚠ tehlikeli işlem:</span>
                                     <span className="text-[10px] font-bold text-red-600 flex-1 min-w-[180px]">seçili {selectedPoolQs.length} soru ve {selectedFolders.length} klasörü kalıcı olarak siler (önce sorar). binlerce soru da silinebilir.</span>
                                     <button onClick={handleBulkDelete} disabled={isSaving} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-black hover:bg-red-700 disabled:opacity-50 flex items-center gap-1 shadow"><Trash2 size={12}/> seçilenleri sil</button>
                                 </div>
                             </div>
                         )}
                     </div>

                     <div className="flex-1 overflow-y-auto custom-scrollbar" onDragOver={e => e.preventDefault()} onDrop={e => handleDropToFolder(e, null)}>
                         {renderFolderTree(null, 0)}
                     </div>
                 </div>

                 <div
                   className="border-2 border-indigo-100 rounded-2xl p-2 bg-indigo-50 min-h-[250px] overflow-y-auto"
                   onDragOver={(e) => { if (selDragIdx === null) e.preventDefault(); }}
                   onDrop={(e) => {
                     if (selDragIdx !== null) return;
                     e.preventDefault();
                     const qId = e.dataTransfer.getData('questionId');
                     if (qId) handleAddQuestionToTest(qId);
                   }}
                 >
                     <p className="text-[10px] font-black text-indigo-400 mb-2 uppercase sticky top-0 bg-indigo-50 z-10 p-1 flex items-center justify-between">
                       <span>seçilenler ({tSelectedQs.length})</span>
                       {tSelectedQs.length > 1 && <span className="normal-case font-bold text-indigo-300 flex items-center gap-1"><GripVertical size={12}/> sürükleyerek sırala</span>}
                     </p>
                     {tSelectedQs.map((qid, index) => {
                       const q = questions.find(item => item.id === qid);
                       if (!q) return null;
                       const displayImg = getDisplayImage(q);
                       const currentSelectedQs = tSelectedQs.map(id => questions.find(item => item.id === id)).filter(Boolean);
                       const isDragOver = selDragOverIdx === index && selDragIdx !== null && selDragIdx !== index;

                       return (
                         <div
                           key={qid}
                           draggable
                           onDragStart={(e) => { e.stopPropagation(); setSelDragIdx(index); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('type', 'selected-reorder'); try { e.dataTransfer.setData('text/plain', 'selected-reorder'); } catch (_) {} }}
                           onDragOver={(e) => { if (selDragIdx === null) return; e.preventDefault(); e.stopPropagation(); setSelDragOverIdx(index); }}
                           onDrop={(e) => {
                             if (selDragIdx === null) return;
                             e.preventDefault(); e.stopPropagation();
                             const rect = e.currentTarget.getBoundingClientRect();
                             const after = e.clientY > rect.top + rect.height / 2;
                             reorderSelected(selDragIdx, after ? index + 1 : index);
                             setSelDragIdx(null); setSelDragOverIdx(null);
                           }}
                           onDragEnd={() => { setSelDragIdx(null); setSelDragOverIdx(null); }}
                           className={`p-2 bg-white rounded-lg border mb-2 flex items-center justify-between shadow-sm gap-2 transition-all ${selDragIdx === index ? 'opacity-40' : ''} ${isDragOver ? 'border-indigo-500 ring-2 ring-indigo-300 -translate-y-0.5' : ''}`}
                         >
                             <div className="text-slate-300 cursor-grab active:cursor-grabbing shrink-0" title="sürükle"><GripVertical size={16}/></div>
                             <div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onClick={() => setDetailModalQ(q)}>
                                 <span className="text-[10px] font-bold text-indigo-300 w-4">{index + 1}.</span>
                                 {displayImg && <img src={displayImg} draggable="false" className="w-8 h-8 object-cover rounded border border-slate-200" />}
                                 <span className="text-xs font-bold truncate">{q.name || q.text || "soru"}</span>
                             </div>
                             <div className="flex items-center gap-1">
                                 <button onClick={(e) => { e.stopPropagation(); onOpenPreviewEditor(q, currentSelectedQs); }} className="p-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100" title="görünüm ayarla"><Eye size={12}/></button>
                                 <button onClick={(e) => { e.stopPropagation(); onOpenContentEditor(q, currentSelectedQs); }} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="içeriği düzenle"><Edit2 size={12}/></button>

                                 <button onClick={() => moveQuestion(index, -1)} disabled={index === 0} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ArrowRight size={14} className="-rotate-90"/></button>
                                 <button onClick={() => moveQuestion(index, 1)} disabled={index === tSelectedQs.length - 1} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30"><ArrowRight size={14} className="rotate-90"/></button>
                                 <button onClick={() => setTSelectedQs(tSelectedQs.filter(id => id !== qid))} className="text-red-400 hover:text-red-600 ml-1"><MinusCircle size={14}/></button>
                             </div>
                           </div>
                       );
                     })}
                 </div>
               </div>

                 <div className="flex gap-2 mt-4">
                  <button onClick={() => saveT(false)} className="flex-1 py-4 bg-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-300 transition-colors">{editingT ? "taslak güncelle" : "taslak kaydet"}</button>
                  <button onClick={() => saveT(true)} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-lg">{editingT ? "yayında güncelle" : "direkt yayınla"}</button>
               </div>
             </div>
         </div>
       )}

       {tab === 'test_archive' && (
         <div className="space-y-6 animate-in fade-in">
             {channelSwitcher}
             <div className="flex flex-wrap items-center justify-end gap-2 -mt-3">
               <span className="text-[10px] font-bold text-slate-400">yayınlama zaten çocuklara anında gider; ekranlarında güncel değilse:</span>
               <button onClick={handleSendToStudents} disabled={isSaving} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl font-black shadow flex items-center gap-1.5 disabled:opacity-50"><Send size={14}/> testleri çocuklara yeniden gönder</button>
             </div>
             <div className="space-y-2">
                 {/* ZAMANLI YAYIN PANELİ */}
                 {(() => {
                   const testsById = Object.fromEntries(tests.map(t => [t.id, t]));
                   const queue = (schedule.queue || []).filter(id => testsById[id]);
                   const draftTests = [...tests].filter(t => !t.isPublished && chanOf(t) === testChannelTab).sort((a, b) => (a.order || 0) - (b.order || 0));
                   const upcoming = previewUpcoming({ ...schedule, queue }, testsById, new Date(), 5);
                   return (
                     <div className={`rounded-3xl border-2 p-4 mb-5 space-y-3 ${schedule.enabled ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
                       <div className="flex items-center justify-between gap-2 flex-wrap">
                         <h5 className="font-black text-sm text-slate-800 flex items-center gap-2"><CalendarClock size={18} className="text-emerald-600"/> zamanlı yayın (her gün otomatik) · <span className={testChannelTab === 'gorev' ? 'text-pink-600' : 'text-sky-600'}>{testChannelTab === 'gorev' ? '📋 ödevler' : '🗺️ harita'}</span></h5>
                         <label className="flex items-center gap-2 cursor-pointer text-xs font-black">
                           <span className={schedule.enabled ? 'text-emerald-700' : 'text-slate-400'}>{schedule.enabled ? 'AÇIK' : 'KAPALI'}</span>
                           <input type="checkbox" className="sr-only peer" checked={Boolean(schedule.enabled)} onChange={(e) => saveSchedule({ enabled: e.target.checked })} />
                           <div className="w-10 h-6 bg-slate-300 rounded-full relative peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-4"></div>
                         </label>
                       </div>

                       {scheduleLoaded !== schedDoc ? (
                         <div className="text-xs font-bold text-slate-400 flex items-center gap-2"><Loader2 size={14} className="animate-spin"/> ayarlar yükleniyor...</div>
                       ) : (
                         <>
                           <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-slate-200 p-3">
                             <span className="text-xs font-black text-slate-600">her</span>
                             <div className="flex gap-1">
                               {WEEKDAY_LABELS.map((lbl, d) => {
                                 const on = (schedule.weekdays || []).includes(d);
                                 return (
                                   <button key={d} type="button" onClick={() => updateSchedule({ weekdays: on ? schedule.weekdays.filter(x => x !== d) : [...(schedule.weekdays || []), d].sort() })} className={`w-9 h-8 rounded-lg text-[10px] font-black border ${on ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{lbl}</button>
                                 );
                               })}
                             </div>
                             <span className="text-xs font-black text-slate-600">saat</span>
                             <input type="time" value={schedule.time || '08:30'} onChange={e => updateSchedule({ time: e.target.value })} className="p-1.5 rounded-lg border-2 border-slate-200 font-black text-sm" />
                             <span className="text-xs font-black text-slate-600">sıradan</span>
                             <input type="number" min="1" max="20" value={schedule.perDay} onChange={e => updateSchedule({ perDay: e.target.value })} className="w-14 p-1.5 rounded-lg border-2 border-slate-200 font-black text-center text-sm" />
                             <span className="text-xs font-black text-slate-600">test yayınla</span>
                             <button type="button" disabled={isSaving || !scheduleDirty} onClick={() => saveSchedule(scheduleDirty && schedule.enabled ? { time: schedule.time } : undefined)} className="ml-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black shadow">
                               {scheduleDirty ? 'kaydet' : 'kaydedildi'}
                             </button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-1.5">
                               <div className="text-[11px] font-black text-slate-500 uppercase flex items-center justify-between">
                                 <span>yayın sırası ({queue.length} test)</span>
                                 {queue.length > 0 && <span className="flex gap-2">{queue.length > 1 && <button type="button" onClick={shuffleQueue} className="text-amber-600 underline normal-case">sırayı karıştır</button>}<button type="button" onClick={() => updateSchedule({ queue: [] })} className="text-red-500 underline normal-case">sırayı boşalt</button></span>}
                               </div>
                               {queue.length === 0 && <div className="text-xs text-slate-400 font-bold py-3 text-center">sağdaki taslak testlerden sıraya ekleyin.</div>}
                               <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                                 {queue.map((id, i) => (
                                   <div key={id} className="flex items-center gap-2 p-1.5 rounded-lg border bg-emerald-50/60 border-emerald-100">
                                     <span className="w-6 text-center text-[11px] font-black text-emerald-700">{i + 1}.</span>
                                     <span className="flex-1 text-xs font-bold truncate">{testsById[id]?.name}</span>
                                     <button type="button" onClick={() => moveQueueItem(i, -1)} disabled={i === 0} className="text-slate-400 hover:text-emerald-700 disabled:opacity-30"><ArrowRight size={14} className="-rotate-90"/></button>
                                     <button type="button" onClick={() => moveQueueItem(i, 1)} disabled={i === queue.length - 1} className="text-slate-400 hover:text-emerald-700 disabled:opacity-30"><ArrowRight size={14} className="rotate-90"/></button>
                                     <button type="button" onClick={() => toggleQueueTest(id)} className="text-red-400 hover:text-red-600"><MinusCircle size={14}/></button>
                                   </div>
                                 ))}
                               </div>
                             </div>
                             <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
                               <div className="text-[11px] font-black text-slate-500 uppercase flex items-center justify-between">
                                 <span>taslak testler ({draftTests.length})</span>
                                 {draftTests.some(t => !queue.includes(t.id)) && (
                                   <button type="button" onClick={() => updateSchedule({ queue: [...queue, ...draftTests.filter(t => !queue.includes(t.id)).map(t => t.id)] })} className="text-emerald-600 underline normal-case">hepsini sıraya ekle</button>
                                 )}
                               </div>
                               {/* KLASÖRDEN SIRAYA EKLE */}
                               <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/50 p-2 space-y-1.5">
                                 <div className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-1"><FolderOpen size={12} /> klasörden sıraya ekle</div>
                                 <div className="max-h-44 overflow-y-auto custom-scrollbar space-y-0.5 bg-white rounded-lg border border-emerald-100 p-1">
                                   {tfOrdered.length === 0 && <div className="text-[10px] text-slate-400 font-bold p-2">henüz test klasörü yok. aşağıdaki "test arşivi" bölümünden klasör açıp testleri yerleştirebilirsiniz.</div>}
                                   {[...tfOrdered, { id: '__none', name: 'klasörsüz', level: 0 }].map(f => {
                                     const n = schedGroupsFor([f.id], schedWithSub).reduce((a, g) => a + g.tests.length, 0);
                                     const on = schedFolderSel.includes(f.id);
                                     return (
                                       <label key={f.id} style={{ paddingLeft: 4 + f.level * 16 }} className={`flex items-center gap-1.5 pr-1 py-0.5 rounded-md text-[11px] font-bold cursor-pointer ${on ? 'bg-emerald-100 text-emerald-900' : 'text-slate-700 hover:bg-slate-50'} ${n === 0 && !on ? 'opacity-50' : ''}`}>
                                         <input type="checkbox" className="w-3.5 h-3.5" checked={on} onChange={() => setSchedFolderSel(prev => on ? prev.filter(x => x !== f.id) : [...prev, f.id])} />
                                         {f.level > 0 && <span className="opacity-50">└</span>}
                                         <span className="truncate flex-1">{f.name}</span>
                                         <span className="text-[9px] font-black text-slate-400">{n} taslak</span>
                                       </label>
                                     );
                                   })}
                                 </div>
                                 <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                                   <input type="checkbox" className="w-3.5 h-3.5" checked={schedWithSub} onChange={e => setSchedWithSub(e.target.checked)} /> alt klasörleri de dahil et
                                 </label>
                                 <div className="flex flex-wrap gap-1">
                                   <button type="button" onClick={() => addFoldersToQueue('order')} className="flex-1 min-w-[90px] px-2 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700" title="klasör ağacı sırasıyla, her klasörde testlerin kendi sırasıyla">sırayla ekle</button>
                                   <button type="button" onClick={() => addFoldersToQueue('random')} className="flex-1 min-w-[90px] px-2 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-black hover:bg-amber-600" title="seçili klasörlerdeki bütün testler karışık (rastgele) sırayla">karışık (rastgele) ekle</button>
                                   <button type="button" onClick={() => addFoldersToQueue('roundrobin')} className="flex-1 min-w-[90px] px-2 py-1.5 rounded-lg bg-sky-500 text-white text-[10px] font-black hover:bg-sky-600" title="her klasörden sırayla birer test: A1, B1, C1, A2, B2...">dönüşümlü ekle</button>
                                 </div>
                                 <p className="text-[9px] text-slate-500 leading-tight">yalnızca yayınlanmamış ve sırada olmayan testler eklenir. ekledikten sonra yukarıdaki "kaydet"e basın.</p>
                               </div>
                               {/* TEK TEK EKLE */}
                               <select value={schedListFolder} onChange={e => setSchedListFolder(e.target.value)} className="w-full p-1.5 border rounded-lg text-[11px] font-bold outline-none bg-white">
                                 <option value="all">tek tek ekle: bütün taslaklar</option>
                                 {tfOrdered.map(f => <option key={f.id} value={f.id}>{'  '.repeat(f.level)}{f.level > 0 ? '└ ' : ''}{f.name}</option>)}
                                 <option value="none">klasörsüz</option>
                               </select>
                               <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1">
                                 {draftTests.length === 0 && <div className="text-xs text-slate-400 font-bold py-3 text-center">yayınlanmamış test yok.</div>}
                                 {draftTests.filter(t => schedListFolder === 'all' ? true : schedListFolder === 'none' ? !testFolderOf(t) : tfDescendants(schedListFolder).includes(testFolderOf(t))).map(t => {
                                   const inQ = queue.includes(t.id);
                                   return (
                                     <button key={t.id} type="button" onClick={() => toggleQueueTest(t.id)} className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left ${inQ ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-50 border-slate-100 hover:bg-emerald-50'}`}>
                                       {inQ ? <CheckCircle size={14}/> : <PlusCircle size={14} className="text-emerald-600"/>}
                                       <span className="flex-1 min-w-0">
                                         <span className="block text-xs font-bold truncate">{t.name}</span>
                                         {testFolderOf(t) && <span className={`block text-[9px] font-bold truncate ${inQ ? 'text-emerald-100' : 'text-indigo-400'}`}>{tfPath(testFolderOf(t))}</span>}
                                       </span>
                                       <span className={`text-[9px] font-black ${inQ ? 'text-emerald-100' : 'text-slate-400'}`}>{(t.questionIds || []).length} soru</span>
                                     </button>
                                   );
                                 })}
                               </div>
                             </div>
                           </div>

                           {schedule.enabled && upcoming.length > 0 && (
                             <div className="bg-white rounded-2xl border border-emerald-200 p-3">
                               <div className="text-[11px] font-black text-emerald-700 uppercase mb-1.5 flex items-center gap-1"><Clock size={13}/> yaklaşan yayınlar</div>
                               <div className="space-y-1">
                                 {upcoming.map(u => (
                                   <div key={u.date} className="text-xs font-bold text-slate-700 flex gap-2">
                                     <span className="font-black text-emerald-700 w-28 shrink-0">{u.weekday} {u.date.slice(8, 10)}.{u.date.slice(5, 7)} • {u.time}</span>
                                     <span className="truncate">{u.tests.map(t => t?.name).join(', ')}</span>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}
                           {schedule.enabled && queue.length === 0 && <div className="text-xs font-black text-amber-600">zamanlı yayın açık ama sırada test yok.</div>}
                           <p className="text-[10px] font-bold text-slate-400 leading-snug">not: kontrol, uygulama açık olan cihazlarda (öğretmen veya öğrenci) 5 dakikada bir yapılır. o saatte hiçbir cihaz açık değilse, ilk açılışta kaçırılan günlerin testleri sırayla yayınlanır. sıra değişikliklerinden sonra "kaydet"e basmayı unutmayın.</p>
                         </>
                       )}
                     </div>
                   );
                 })()}

                 <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2 mb-4"><History size={18}/> test arşivi</h4>
             {(() => {
               const sortedTests = archiveSortedTests();
               const visibleTests = sortedTests.filter(archiveInFilter);
               const allVisibleSelected = visibleTests.length > 0 && visibleTests.every(t => selectedTestIds.includes(t.id));
               const countIn = (id) => { const set = new Set(tfDescendants(id)); return sortedTests.filter(t => set.has(testFolderOf(t))).length; };
               const sel = testFolders.find(f => f.id === testFolderFilter);
               const chip = (id, label, count) => (
                 <button key={id} type="button" onClick={() => { setTestFolderFilter(id); setSelectedTestIds([]); }} className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${testFolderFilter === id ? 'bg-indigo-600 text-white border-indigo-700 shadow' : 'bg-white text-slate-600 hover:bg-indigo-50'}`}>
                   {label} <span className="opacity-70">({count})</span>
                 </button>
               );
               return (
                 <div className="space-y-2 mb-3">
                   {/* KLASÖR AĞACI */}
                   <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                     <div className="flex flex-wrap items-center gap-1.5">
                       <FolderOpen size={16} className="text-indigo-400 mx-1" />
                       {chip('all', 'tümü', sortedTests.length)}
                       {chip('none', 'klasörsüz', sortedTests.filter(t => !testFolderOf(t)).length)}
                       <button type="button" onClick={() => addTestFolder(null)} className="px-3 py-1.5 rounded-xl text-[11px] font-black border border-dashed border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50 flex items-center gap-1"><FolderPlus size={12} /> yeni üst klasör</button>
                     </div>
                     {tfOrdered.length > 0 && (
                       <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto custom-scrollbar bg-white rounded-xl border border-slate-100 p-1">
                         {tfOrdered.map(f => (
                           <button key={f.id} type="button" onClick={() => { setTestFolderFilter(f.id); setSelectedTestIds([]); }} style={{ paddingLeft: 8 + f.level * 18 }} className={`text-left pr-2 py-1 rounded-lg text-[11px] font-black flex items-center gap-1.5 ${testFolderFilter === f.id ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-indigo-50'}`}>
                             {f.level > 0 && <span className="opacity-50">└</span>}
                             <Folder size={12} className="shrink-0" />
                             <span className="truncate flex-1">{f.name}</span>
                             <span className="opacity-70 font-bold">{countIn(f.id)}</span>
                           </button>
                         ))}
                       </div>
                     )}
                     {sel && (
                       <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200">
                         <span className="text-[10px] font-black text-indigo-700 truncate max-w-[220px]">seçili: {tfPath(sel.id)}</span>
                         <button type="button" onClick={() => addTestFolder(sel.id)} className="px-2 py-1 rounded-lg text-[10px] font-black bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center gap-1"><FolderPlus size={11} /> alt klasör ekle</button>
                         <button type="button" onClick={() => renameTestFolder(sel)} className="px-2 py-1 rounded-lg text-[10px] font-black bg-white border text-slate-600 hover:bg-slate-100 flex items-center gap-1"><Edit2 size={11} /> adını değiştir</button>
                         <select value="" onChange={e => { if (e.target.value) moveTestFolder(sel, e.target.value === '__root' ? null : e.target.value); }} className="p-1 border rounded-lg text-[10px] font-bold outline-none bg-white">
                           <option value="">klasörü taşı...</option>
                           <option value="__root">(en üste)</option>
                           {tfOrdered.filter(f => !tfDescendants(sel.id).includes(f.id)).map(f => <option key={f.id} value={f.id}>{'  '.repeat(f.level)}{f.level > 0 ? '└ ' : ''}{f.name}</option>)}
                         </select>
                         <button type="button" onClick={() => { const ids = folderTestIds(sel.id, true); if (!ids.length) { alert('bu klasörde (alt klasörler dahil) bu sekmede test yok.'); return; } moveSelectedToChannel(testChannelTab === 'gorev' ? 'harita' : 'gorev', ids); }} disabled={isSaving} className={`px-2 py-1 rounded-lg text-[10px] font-black text-white disabled:opacity-50 flex items-center gap-1 ${testChannelTab === 'gorev' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-pink-500 hover:bg-pink-600'}`} title="klasördeki bütün testleri (alt klasörler dahil) klasör yapısı bozulmadan diğer bölüme taşı">{testChannelTab === 'gorev' ? '🗺️ klasörü haritaya taşı' : '📋 klasörü ödevlere taşı'}</button>
                         <button type="button" onClick={() => setFolderPublish(sel, true)} disabled={isSaving} className="px-2 py-1 rounded-lg text-[10px] font-black bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"><Eye size={11} /> klasörü yayınla</button>
                         <button type="button" onClick={() => setFolderPublish(sel, false)} disabled={isSaving} className="px-2 py-1 rounded-lg text-[10px] font-black bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1"><EyeOff size={11} /> klasörü yayından kaldır</button>
                         <button type="button" onClick={() => deleteTestFolder(sel)} className="px-2 py-1 rounded-lg text-[10px] font-black bg-white border border-red-200 text-red-500 hover:bg-red-50 flex items-center gap-1"><Trash2 size={11} /> klasörü sil</button>
                         <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer ml-auto">
                           <input type="checkbox" className="w-3.5 h-3.5" checked={testFilterWithSub} onChange={e => setTestFilterWithSub(e.target.checked)} /> alt klasörlerdeki testleri de göster
                         </label>
                       </div>
                     )}
                   </div>
                   {sel && <p className="text-[10px] font-bold text-indigo-500 px-1">bu klasör seçiliyken "yeni test" sekmesinde oluşturduğunuz testler doğrudan bu klasöre kaydedilir.</p>}
                   {/* SEÇİM ÇUBUĞU */}
                   <div className="flex flex-wrap items-center gap-2 px-1">
                     <label className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 cursor-pointer">
                       <input type="checkbox" className="w-4 h-4" checked={allVisibleSelected} onChange={e => setSelectedTestIds(e.target.checked ? Array.from(new Set([...selectedTestIds, ...visibleTests.map(t => t.id)])) : selectedTestIds.filter(id => !visibleTests.some(t => t.id === id)))} />
                       görünenlerin hepsini seç ({visibleTests.length})
                     </label>
                     {selectedTestIds.length > 0 && (
                       <>
                         <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">{selectedTestIds.length} test seçili</span>
                         <select value="" onChange={e => { if (e.target.value) moveSelectedTests(e.target.value === '__none' ? null : e.target.value); }} disabled={isSaving} className="p-1.5 border-2 rounded-xl text-[11px] font-bold outline-none">
                           <option value="">klasöre taşı...</option>
                           {tfOrdered.map(f => <option key={f.id} value={f.id}>{'  '.repeat(f.level)}{f.level > 0 ? '└ ' : ''}{f.name}</option>)}
                           <option value="__none">(klasörsüz)</option>
                         </select>
                         <button type="button" onClick={() => moveSelectedToChannel(testChannelTab === 'gorev' ? 'harita' : 'gorev')} disabled={isSaving} className={`px-3 py-1.5 rounded-xl text-white text-[11px] font-black shadow disabled:opacity-50 ${testChannelTab === 'gorev' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-pink-500 hover:bg-pink-600'}`}>{testChannelTab === 'gorev' ? '🗺️ haritaya taşı' : '📋 ödevlere taşı'}</button>
                         <button type="button" onClick={() => setSelectedPublish(true)} disabled={isSaving} className="px-3 py-1.5 rounded-xl bg-green-500 text-white text-[11px] font-black shadow hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"><Eye size={12} /> seçilenleri yayınla</button>
                         <button type="button" onClick={() => setSelectedPublish(false)} disabled={isSaving} className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[11px] font-black shadow hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1"><EyeOff size={12} /> seçilenleri yayından kaldır</button>
                         <button type="button" onClick={deleteSelectedTests} disabled={isSaving} className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-[11px] font-black shadow hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"><Trash2 size={12} /> seçilenleri sil</button>
                         <button type="button" onClick={() => setSelectedTestIds([])} className="text-[11px] font-bold text-slate-500 hover:text-slate-700">seçimi kaldır</button>
                       </>
                     )}
                   </div>
                 </div>
               );
             })()}
             {(() => { const sortedTests = archiveSortedTests(); return sortedTests.filter(archiveInFilter).map(t => ({ t, index: sortedTests.indexOf(t) })); })().map(({ t, index }) => (
                <div key={t.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} className={`bg-white p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-center text-left gap-3 cursor-move hover:shadow-md transition-all ${t.isPublished ? 'border-indigo-100' : 'opacity-80 border-slate-200'} ${draggedItemIndex === index ? 'opacity-40' : ''} ${dragOverTestIdx === index && draggedItemIndex !== null && draggedItemIndex !== index ? (draggedItemIndex < index ? 'border-b-4 border-b-indigo-500' : 'border-t-4 border-t-indigo-500') : ''}`}>
                   <div className="flex items-center gap-3 min-w-0 w-full">
                     <input type="checkbox" className="w-4 h-4 shrink-0 cursor-pointer" checked={selectedTestIds.includes(t.id)} onChange={e => setSelectedTestIds(prev => e.target.checked ? [...prev, t.id] : prev.filter(id => id !== t.id))} onClick={e => e.stopPropagation()} title="seç" />
                     <div className="text-slate-300"><GripVertical size={20}/></div>

                     <input
                        type="number"
                        min="1"
                        max={tests.length}
                        defaultValue={index + 1}
                        key={`order-${t.id}-${index}`}
                        onBlur={(e) => handleManualOrderChange(t, e.target.value, index)}
                        onKeyDown={(e) => { if(e.key === 'Enter') e.target.blur(); }}
                        className="w-12 h-10 text-center font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 cursor-text transition-all"
                        title="sırayı değiştir (sayı yazıp enter'a bas)"
                        onClick={(e) => e.stopPropagation()}
                     />

                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shrink-0 border transition-colors ${t.isPublished ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`} title="soru sayısı">{ (t.questionIds || []).length }</div>
                     <button type="button" onClick={(e) => { e.stopPropagation(); moveSelectedToChannel(testChannelTab === 'gorev' ? 'harita' : 'gorev', [t.id]); }} disabled={isSaving} className={`shrink-0 px-2 py-1.5 rounded-lg text-white text-[10px] font-black shadow disabled:opacity-50 ${testChannelTab === 'gorev' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-pink-500 hover:bg-pink-600'}`} title="bu testi diğer bölüme taşı">{testChannelTab === 'gorev' ? '🗺️ haritaya' : '📋 ödeve'}</button>
                     <div className="min-w-0 flex-1">
                       <h5 className="font-black text-slate-800 text-xs sm:text-sm truncate">{t.name}{testFolderFilter === 'all' && t.folderId && testFolders.some(f => f.id === t.folderId) && <span className="ml-2 align-middle text-[9px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{tfPath(t.folderId)}</span>}</h5>
                       <div className="flex items-center gap-2">
                          {t.isPublished ? <span className="text-[8px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10}/> yayınlandı{t.publishedBySchedule ? ' (zamanlı)' : ''}</span> : <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><CircleSlash size={10}/> taslak</span>}
                          {!t.isPublished && (schedule.queue || []).includes(t.id) && <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><CalendarClock size={10}/> sırada #{(schedule.queue || []).indexOf(t.id) + 1}</span>}
                       </div>
                     </div>
                   </div>

                   <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                     <button onClick={() => handleTestStatus(t, 'red')} className={`w-6 h-6 rounded-full border-2 border-white shadow-sm transition-transform active:scale-90 ${t.manualStatus === 'red' ? 'bg-red-600 ring-2 ring-red-200' : 'bg-red-400 opacity-80 hover:opacity-100'}`} title="sıfırla (cevapları sil)"></button>
                     <button onClick={() => handleTestStatus(t, 'yellow')} className={`w-6 h-6 rounded-full border-2 border-white shadow-sm transition-transform active:scale-90 ${t.manualStatus === 'yellow_mode' ? 'bg-yellow-500 ring-2 ring-yellow-200' : 'bg-yellow-300 opacity-80 hover:opacity-100'}`} title="sarı mod (öğrenciler sarı görür)"></button>
                     <button onClick={() => handleTestStatus(t, 'green')} className={`w-6 h-6 rounded-full border-2 border-white shadow-sm transition-transform active:scale-90 ${t.manualStatus === 'green' ? 'bg-green-600 ring-2 ring-green-200' : 'bg-green-400 opacity-80 hover:opacity-100'}`} title="tamamlandı say (herkes için)"></button>
                   </div>

                   <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button onClick={() => toggleTestStatus(t)} className={`p-2 rounded-lg transition-all ${t.isPublished ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}><Globe size={16}/></button>
                      <button onClick={() => startEditT(t)} className="p-2 bg-slate-100 text-slate-500 rounded-lg border border-indigo-100 hover:text-indigo-600"><Edit2 size={16}/></button>
                      <button onClick={() => setTestToDelete(t)} className="p-2 bg-red-50 text-red-500 rounded-lg border border-red-100 hover:text-red-700"><Trash2 size={16}/></button>
                   </div>
                </div>
                ))}
                {tests.length === 0 && <p className="text-center text-slate-400 font-bold p-4">henüz arşivde test bulunmuyor.</p>}
             </div>
         </div>
       )}

       {tab === 'students' && (
          <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl border-2 border-indigo-50 shadow-sm">
            {[['list', '👧 öğrenciler'], ['stars', '⭐ yıldızlar (analiz)'], ['solved', '🗺️ çözülen testler']].map(([k, label]) => (
              <button key={k} type="button" onClick={() => setStudentsSub(k)} className={`py-2.5 rounded-xl text-xs font-black transition-all ${studentsSub === k ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>{label}</button>
            ))}
          </div>
       )}
       {tab === 'students' && studentsSub === 'list' && (
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border-2 border-indigo-50 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2"><Users size={18}/> {editingStudent ? "öğrenci düzenle" : "yeni öğrenci"}</h4>
                    {editingStudent && <button onClick={() => { setEditingStudent(null); setStdName(""); setStdId(""); setStdPhoto(""); }} className="text-xs font-bold text-red-500">iptal</button>}
                 </div>
                  <div className="flex flex-col gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">öğrenci adı soyadı</label><input value={stdName} onChange={(e) => setStdName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveStudent()} className="w-full p-3 border-2 rounded-xl font-bold" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">giriş numarası</label><input value={stdId} onChange={(e) => setStdId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveStudent()} className="w-full p-3 border-2 rounded-xl font-bold" /></div>
                  <MediaUploader label="öğrenci fotoğrafı" value={stdPhoto} onChange={setStdPhoto} id="std-photo" small />
                  <button onClick={saveStudent} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg mt-2">{editingStudent ? "güncelle" : "kaydet"}</button>
                  {editingStudent && <div className="text-[10px] text-orange-500 font-bold text-center">dikkat: numara değiştirilirse, eski test sonuçları yeni numaraya aktarılacaktır.</div>}
              </div>
           </div>
              <button type="button" onClick={() => setStudentsFolderOpen(o => !o)} className="w-full flex items-center gap-3 bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-sm hover:bg-indigo-50/40 text-left">
                {studentsFolderOpen ? <FolderOpen size={22} className="text-indigo-500 shrink-0" /> : <Folder size={22} className="text-indigo-500 shrink-0" />}
                <span className="font-black text-slate-800 flex-1">öğrencilerim</span>
                <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{sortedChildrenList.length} öğrenci</span>
                <span className="text-slate-400 text-sm font-black">{studentsFolderOpen ? '▲' : '▼'}</span>
              </button>
              {studentsFolderOpen && <div className="grid gap-2 pl-3 border-l-4 border-indigo-100">
               {sortedChildrenList.map(c => (
                 <div key={c.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                       {c.photo ? <img src={c.photo} className="w-8 h-8 rounded-full object-cover border"/> : <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={16}/></div>}
                       <span className="font-bold text-slate-800">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{c.childId}</span>
                       {onViewAsStudent && <button onClick={() => onViewAsStudent(c)} title="bu öğrencinin ekranını gör (hiçbir şey kaydedilmez)" className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[11px] font-black flex items-center gap-1"><Eye size={14}/> ekranını gör</button>}
                       <button onClick={() => startEditStudent(c)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                       <button onClick={() => setStudentToDelete(c)} disabled={isSaving} className="text-red-300 hover:text-red-500 disabled:opacity-50"><Trash2 size={16}/></button>
                    </div>
                 </div>
                ))}
            </div>}
          </div>
        )}

        {tab === 'game' && (
          <div className="space-y-3">
            {onViewAsStudent && (
              <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white p-4 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-black text-base">👁️ öğrenci ekranını gör</div>
                  <div className="text-[11px] font-bold text-white/85 leading-tight">çocukların gördüğü dünyaları, ödevleri ve marketi kendiniz gezin. verilen cevaplar kaydedilmez, kimsenin yıldızı değişmez.<br />bir öğrencinin kendi ekranını görmek için "öğrenciler" sekmesindeki "ekranını gör" düğmesini kullanın.</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => onViewAsStudent(null)} className="px-4 py-2.5 rounded-2xl bg-white text-indigo-700 text-sm font-black shadow active:scale-95">yayındakileri gör</button>
                  <button onClick={() => onViewAsStudent(null, { includeUnpublished: true })} className="px-4 py-2.5 rounded-2xl bg-white/20 border-2 border-white/60 text-white text-sm font-black active:scale-95">yayında olmayanlarla birlikte</button>
                </div>
              </div>
            )}
            {!anaGameCfgLoaded && <div className="text-xs font-bold text-slate-400 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> oyun ayarları yükleniyor...</div>}
            {anaGameCfgLoaded && <GameAdminPanel
              db={db} appId={appId}
              cfg={anaGameCfg} setCfg={setAnaGameCfg}
              tests={tests} setTests={setTests} fetchAdminTests={fetchAdminTests}
              childrenList={childrenList} setChildrenList={setChildrenList} fetchAdminChildren={fetchAdminChildren}
              responses={responses} fetchAdminResponses={fetchAdminResponses}
              onStartTestMode={null}
            />}
          </div>
        )}

        {tab === 'game_fx' && (
          <div className="bg-white p-6 rounded-3xl border-2 border-indigo-50 shadow-lg mb-4">
             <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2 mb-4"><Volume1 size={18}/> test ve karşılama sesleri</h4>
             <div className="space-y-6">
                     <div className="space-y-2 border-b pb-4">
                        <div className="flex items-center gap-2"><Volume1 size={20} className="text-orange-500"/><label className="font-bold text-slate-700">karşılama mesajı (ses)</label></div>
                        <p className="text-xs text-slate-400">tüm öğrenciler için "merhaba" ekranında çalacak ortak ses dosyası.</p>
                        <MediaUploader label="ses dosyası seç" value={localSettings.welcomeAudio} onChange={(v) => setLocalSettings({...localSettings, welcomeAudio: v})} id="welcome-audio" type="audio" small />
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                          <div className="flex flex-col"><span className="font-bold text-slate-700 text-xs">otomatik oynat</span><span className="text-[9px] text-slate-400">sayfa açılınca başlasın</span></div>
                          <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" className="sr-only peer" checked={localSettings.welcomeAutoPlay} onChange={(e) => setLocalSettings({...localSettings, welcomeAutoPlay: e.target.checked})} />
                             <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                     </div>

                     <div className="space-y-4 border-b pb-4">
                        <div className="flex items-center gap-2"><Music size={20} className="text-blue-500"/><label className="font-bold text-slate-700">anlık geri bildirim sesleri</label></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-green-600">doğru cevap sesi</div>
                                <MediaUploader label="doğru sesi yükle" value={localSettings.correctSound} onChange={(v) => setLocalSettings({...localSettings, correctSound: v})} id="correct-sound" type="audio" small />
                            </div>
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-red-500">yanlış cevap sesi</div>
                                <MediaUploader label="yanlış sesi yükle" value={localSettings.wrongSound} onChange={(v) => setLocalSettings({...localSettings, wrongSound: v})} id="wrong-sound" type="audio" small />
                            </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-2"><Trophy size={20} className="text-indigo-500"/><label className="font-bold text-slate-700">test bitimi ve diğerleri</label></div>
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-orange-500">son 10 saniye sesi (tik tak)</div>
                            <p className="text-[10px] text-slate-400">süre 10 saniye kalınca çalmaya başlar.</p>
                            <MediaUploader label="tik tak sesi yükle" value={localSettings.last10SecondsSound} onChange={(v) => setLocalSettings({...localSettings, last10SecondsSound: v})} id="last10-sound" type="audio" small />
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-green-600">tam puan (başarı) sesi</div>
                            <p className="text-[10px] text-slate-400">sonuç ekranında 100 alınca çalar.</p>
                            <MediaUploader label="başarı sesi yükle" value={localSettings.successAudio} onChange={(v) => setLocalSettings({...localSettings, successAudio: v})} id="success-audio" type="audio" small />
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-red-500">hatalı/eksik sonuç sesi</div>
                            <p className="text-[10px] text-slate-400">sonuç ekranında hata varsa çalar.</p>
                            <MediaUploader label="hata/gayret sesi yükle" value={localSettings.failureAudio} onChange={(v) => setLocalSettings({...localSettings, failureAudio: v})} id="failure-audio" type="audio" small />
                        </div>
                     </div>
                     <button onClick={saveGlobalSettings} disabled={isSaving} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all">{isSaving ? "kaydediliyor..." : "ayarları kaydet"}</button>
             </div>
          </div>
        )}
        {tab === 'game_fx' && (
          anaGameCfgLoaded ? <ExtraStudio db={db} appId={appId} cfg={anaGameCfg} setCfg={setAnaGameCfg} /> : <div className="text-xs font-bold text-slate-400 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> ayarlar yükleniyor...</div>
        )}

         {tab === 'students' && studentsSub === 'solved' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-50 shadow-lg">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2">🗺️ çözülen testler</h4>
                <button onClick={refreshChildrenFromServer} disabled={isSaving} className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 size={14} className="animate-spin"/> : <><RefreshCw size={14}/> güncelle</>}
                </button>
              </div>
              <p className="text-[11px] font-bold text-slate-400 mb-4">her öğrencinin haritada ve ödevlerde bitirdiği test sayısı. cevaplar okunmaz; sayı öğrencinin kendi kaydından gelir ve öğrenci uygulamayı açtığında güncellenir. silinen testler de sayılmaya devam eder. "—": öğrenci yeni sürümle henüz girmedi.</p>
              <div className="grid gap-x-4 gap-y-2 items-center text-sm" style={{ gridTemplateColumns: '1fr auto auto auto' }}>
                <div className="text-[10px] font-black text-slate-400 uppercase">öğrenci</div>
                <div className="text-[10px] font-black text-slate-400 uppercase text-center">⭐ yıldız</div>
                <div className="text-[10px] font-black text-sky-600 uppercase text-center">🗺️ harita</div>
                <div className="text-[10px] font-black text-pink-600 uppercase text-center">📋 ödev</div>
                {sortedChildrenList.map(child => {
                  const st = storedStars(child);
                  const g = child.game || {};
                  return (
                    <React.Fragment key={child.id}>
                      <div className="font-bold text-slate-800 truncate border-t pt-2">{child.name}</div>
                      <div className="text-center font-black text-indigo-600 border-t pt-2">{st == null ? '—' : st}</div>
                      <div className="text-center font-black text-sky-600 border-t pt-2">{g.tmap == null ? '—' : g.tmap}</div>
                      <div className="text-center font-black text-pink-600 border-t pt-2">{g.todev == null ? '—' : g.todev}</div>
                    </React.Fragment>
                  );
                })}
              </div>
              {sortedChildrenList.length === 0 && <p className="text-center text-slate-400 font-bold text-sm py-4">öğrenci yok.</p>}
            </div>
          </div>
        )}

         {tab === 'students' && studentsSub === 'stars' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-50 shadow-lg">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                <h4 className="font-black text-indigo-600 uppercase text-xs flex items-center gap-2"><Star size={18}/> öğrenci yıldızları</h4>
                <button onClick={refreshChildrenFromServer} disabled={isSaving} className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 size={14} className="animate-spin"/> : <><RefreshCw size={14}/> güncelle</>}
                </button>
              </div>
              <p className="text-[11px] font-bold text-slate-400 mb-4">çözülen sorular okunmaz; her öğrencinin yıldızı kendi kaydından gelir (öğrenci başına 1 okuma). yıldız, öğrenci uygulamayı açtığında güncellenir. "—" görünen öğrenci yeni sürümle henüz girmemiştir: "hesapla" sadece o öğrencinin cevaplarını bir kez okur.</p>
              <div className="space-y-2">
                {sortedChildrenList.map(child => {
                  const stars = storedStars(child);
                  return (
                    <div key={child.id} className="flex items-center justify-between gap-2 p-3 border rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3 min-w-0">
                        {child.photo ? <img src={child.photo} className="w-8 h-8 rounded-full object-cover border"/> : <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-slate-400"><User size={16}/></div>}
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-800 truncate">{child.name}</div>
                          <div className="text-[10px] font-medium text-slate-500">manuel: {child.manualStars || 0}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {stars == null && <button onClick={() => computeStarsFor(child)} disabled={starBusy === child.id} className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[11px] font-black hover:bg-amber-200 disabled:opacity-50">{starBusy === child.id ? '...' : 'hesapla'}</button>}
                        <button onClick={() => updateStudentManualStars(child, -1)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Minus size={14}/></button>
                        <div className="min-w-[2.5rem] text-center font-black text-indigo-600 flex items-center justify-center gap-0.5"><Star size={14} className="text-yellow-400 fill-yellow-400"/>{stars == null ? '—' : stars}</div>
                        <button onClick={() => updateStudentManualStars(child, 1)} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><Plus size={14}/></button>
                      </div>
                    </div>
                  );
                })}
                {sortedChildrenList.length === 0 && <p className="text-center text-slate-400 font-bold text-sm py-4">öğrenci yok.</p>}
              </div>
            </div>
          </div>
        )}

      {detailModalQ && (
          <div className="fixed inset-0 bg-slate-900/70 z-[150] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setDetailModalQ(null)}>
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl max-w-md w-full space-y-4 border-2 border-indigo-50" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><ListChecks size={20}/></div>
                          <div>
                              <h3 className="font-black text-base text-slate-800">soru ayrıntısı</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">ekli olduğu testler ve konum</p>
                          </div>
                      </div>
                      <button onClick={() => setDetailModalQ(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-red-50 hover:text-red-500"><X size={18}/></button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      {getDisplayImage(detailModalQ) ? (
                          <img src={getDisplayImage(detailModalQ)} className="w-16 h-16 object-contain rounded-xl border bg-white p-1 shrink-0" />
                      ) : (
                          <div className="w-16 h-16 rounded-xl border bg-white flex items-center justify-center text-slate-300 shrink-0"><ImageIcon size={24}/></div>
                      )}
                      <div className="min-w-0 flex-1">
                          <div className="text-sm font-black text-slate-800 break-words">{detailModalQ.name || detailModalQ.text || "görsel soru"}</div>
                          {detailModalQ.name && detailModalQ.text && (
                              <div className="text-xs font-bold text-slate-500 mt-0.5 break-words">{detailModalQ.text}</div>
                          )}
                          <div className="text-[10px] font-bold text-indigo-600 mt-1 flex items-center gap-1">
                              <Folder size={12}/> klasör: {folders.find(f => f.id === detailModalQ.folderId)?.name || "havuz (ana dizin)"}
                          </div>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <div className="text-xs font-black text-slate-500 uppercase flex items-center justify-between">
                          <span>bu sorunun eklendiği testler</span>
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[10px]">{getQuestionIncludedTests(detailModalQ.id).length} test</span>
                      </div>
                      {getQuestionIncludedTests(detailModalQ.id).length > 0 ? (
                          <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                              {getQuestionIncludedTests(detailModalQ.id).map((testName, idx) => (
                                  <div key={idx} className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black flex items-center gap-2">
                                      <CheckCircle size={14} className="text-emerald-600 shrink-0"/>
                                      <span className="break-words">{testName}</span>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs font-bold text-slate-400">
                              bu soru henüz hiçbir teste eklenmemiş.
                          </div>
                      )}
                  </div>

                  <button onClick={() => setDetailModalQ(null)} className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors">
                      kapat
                  </button>
              </div>
          </div>
      )}

      {studentToDelete && ( <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 animate-in fade-in"><div className="bg-white p-6 rounded-[2rem] shadow-2xl max-w-sm w-full text-center space-y-4"><div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2"><Trash2 size={32} /></div><h3 className="font-black text-2xl text-slate-800">öğrenciyi sil?</h3><p className="text-sm font-medium text-slate-500"><strong>{studentToDelete.name}</strong> isimli öğrenciyi silmek üzeresiniz. bu işlem geri alınamaz!</p><div className="grid grid-cols-2 gap-3 pt-2"><button onClick={() => setStudentToDelete(null)} className="py-4 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200">vazgeç</button><button onClick={confirmDeleteStudent} disabled={isSaving} className="py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : "evet, sil"}</button></div></div></div> )}
      {questionToDelete && ( <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 animate-in fade-in"><div className="bg-white p-6 rounded-[2rem] shadow-2xl max-w-sm w-full text-center space-y-4"><div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2"><Trash2 size={32} /></div><h3 className="font-black text-2xl text-slate-800">soruyu sil?</h3><p className="text-sm font-medium text-slate-500">seçilen soruyu silmek üzeresiniz. bu işlem geri alınamaz!</p><div className="grid grid-cols-2 gap-3 pt-2"><button onClick={() => setQuestionToDelete(null)} className="py-4 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200">vazgeç</button><button onClick={confirmDeleteQuestion} disabled={isSaving} className="py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : "evet, sil"}</button></div></div></div> )}
      {testToDelete && ( <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 animate-in fade-in"><div className="bg-white p-6 rounded-[2rem] shadow-2xl max-w-sm w-full text-center space-y-4"><div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2"><Trash2 size={32} /></div><h3 className="font-black text-2xl text-slate-800">testi sil?</h3><p className="text-sm font-medium text-slate-500"><strong>{testToDelete.name}</strong> isimli testi silmek üzeresiniz. bu işlem geri alınamaz!</p><div className="grid grid-cols-2 gap-3 pt-2"><button onClick={() => setTestToDelete(null)} className="py-4 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200">vazgeç</button><button onClick={confirmDeleteTest} disabled={isSaving} className="py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" size={20}/> : "evet, sil"}</button></div></div></div> )}
    </div>
  );
}
