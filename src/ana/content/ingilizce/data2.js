// ============================================================================
// --- 3. SINIF İNGİLİZCE: ÜNİTE VERİLERİ (4-6) ---
// ============================================================================

export const U4 = {
  id: 'u4', no: 4, title: 'Family Life', tr: 'Aile Hayatı', color: 'amber',
  np: ['children', 'parents', 'cousin', 'son', 'daughter', 'grandson', 'granddaughter', 'aunt', 'uncle', 'put on my uniform', 'help my parents', 'set the table', 'iron the clothes', 'put the rubbish out', 'prepare breakfast'],
  sets: [
    { id: 'family', label: 'Aile üyeleri', frame: (w) => `This is my ${w.en}.`, items: [
      ['mother', 'anne', '👩', 'Gülümseyen anne'],
      ['father', 'baba', '👨', 'Gülümseyen baba'],
      ['sister', 'kız kardeş', '👧', 'Küçük kız kardeş'],
      ['brother', 'erkek kardeş', '👦', 'Küçük erkek kardeş'],
      ['grandmother', 'büyükanne', '👵', 'Gözlüklü büyükanne'],
      ['grandfather', 'büyükbaba', '👴', 'Bastonlu büyükbaba'],
      ['baby', 'bebek', '👶', 'Gülen bebek'],
      ['aunt', 'teyze / hala', '👩‍🦰', 'Teyze'],
      ['uncle', 'amca / dayı', '🧔', 'Amca'],
      ['cousin', 'kuzen', '🧒', 'Kuzen'],
      ['son', 'oğul', '👦', 'Oğul'],
      ['daughter', 'kız evlat', '👧', 'Kız evlat'],
      ['parents', 'anne baba', '👪', 'Anne ve baba'],
      ['children', 'çocuklar', '🧒', 'Çocuklar'],
      ['grandson', 'erkek torun', '👦', 'Erkek torun'],
      ['granddaughter', 'kız torun', '👧', 'Kız torun']
    ] },
    { id: 'routine', label: 'Günlük rutinler', frame: (w) => `I ${w.en} every day.`, items: [
      ['wake up', 'uyanmak', '⏰', 'Çalar saatle uyanan çocuk'],
      ['wash my face', 'yüzümü yıkamak', '🚿', 'Lavaboda yüzünü yıkayan çocuk'],
      ['brush my teeth', 'dişlerimi fırçalamak', '🪥', 'Dişlerini fırçalayan çocuk'],
      ['have breakfast', 'kahvaltı yapmak', '🥣', 'Kahvaltı yapan aile'],
      ['put on my uniform', 'formamı giymek', '🎽', 'Okul formasını giyen çocuk'],
      ['go to school', 'okula gitmek', '🏫', 'Okula yürüyen çocuk'],
      ['have lunch', 'öğle yemeği yemek', '🍱', 'Öğle yemeği yiyen çocuk'],
      ['go home', 'eve gitmek', '🏠', 'Eve dönen çocuk'],
      ['do my homework', 'ödevimi yapmak', '📝', 'Ödev yapan çocuk'],
      ['watch TV', 'televizyon izlemek', '📺', 'Televizyon izleyen çocuk'],
      ['have dinner', 'akşam yemeği yemek', '🍽️', 'Akşam yemeği yiyen aile'],
      ['go to bed', 'yatmak', '🛏️', 'Yatağa giren çocuk'],
      ['drink milk', 'süt içmek', '🥛', 'Süt içen çocuk']
    ] },
    { id: 'chores', label: 'Ev işleri', frame: (w) => `I ${w.en}.`, items: [
      ['clean the room', 'odayı temizlemek', '🧹', 'Odasını süpüren çocuk'],
      ['make the bed', 'yatağı toplamak', '🛏️', 'Yatağını düzelten çocuk'],
      ['wash the dishes', 'bulaşık yıkamak', '🍽️', 'Bulaşık yıkayan çocuk'],
      ['set the table', 'sofrayı kurmak', '🍴', 'Sofrayı kuran çocuk'],
      ['cook dinner', 'akşam yemeği pişirmek', '🍳', 'Yemek pişiren anne'],
      ['iron the clothes', 'kıyafetleri ütülemek', '👕', 'Ütü yapan baba'],
      ['put the rubbish out', 'çöpü dışarı çıkarmak', '🗑️', 'Çöpü dışarı çıkaran çocuk'],
      ['prepare breakfast', 'kahvaltı hazırlamak', '🥞', 'Kahvaltı hazırlayan aile'],
      ['help my parents', 'anne babama yardım etmek', '🤝', 'Annesine yardım eden çocuk'],
      ['feed the cat', 'kediyi beslemek', '🐈', 'Kediye mama veren çocuk'],
      ['water the plants', 'bitkileri sulamak', '🪴', 'Saksıdaki çiçeği sulayan çocuk']
    ] },
    { id: 'hobby', label: 'Yapabildiklerimiz', frame: (w) => `I can ${w.en}.`, items: [
      ['play chess', 'satranç oynamak', '♟️', 'Satranç oynayan iki çocuk'],
      ['play the piano', 'piyano çalmak', '🎹', 'Piyano çalan çocuk'],
      ['play the violin', 'keman çalmak', '🎻', 'Keman çalan çocuk'],
      ['play the guitar', 'gitar çalmak', '🎸', 'Gitar çalan çocuk'],
      ['play basketball', 'basketbol oynamak', '🏀', 'Basket atan çocuk'],
      ['play football', 'futbol oynamak', '⚽', 'Topa vuran çocuk'],
      ['swim', 'yüzmek', '🏊', 'Havuzda yüzen çocuk'],
      ['ride a bike', 'bisiklet sürmek', '🚲', 'Bisiklet süren çocuk'],
      ['dance', 'dans etmek', '💃', 'Dans eden kız'],
      ['sing', 'şarkı söylemek', '🎤', 'Mikrofonla şarkı söyleyen çocuk'],
      ['skate', 'paten kaymak', '⛸️', 'Paten kayan çocuk'],
      ['fly a kite', 'uçurtma uçurmak', '🪁', 'Uçurtma uçuran çocuk']
    ] },
    { id: 'freq', label: 'Sıklık', kind: 'word', noPic: true, items: [
      ['always', 'her zaman', '🟢'], ['usually', 'genellikle', '🟡'], ['often', 'sık sık', '🟠'], ['sometimes', 'bazen', '🔵'], ['never', 'asla / hiçbir zaman', '🔴']
    ] }
  ],
  qa: [
    { q: 'Who is Erhan?', a: 'He is my father.', w: ['She is my mother.', 'He is in the kitchen.'], e: '👨' },
    { q: 'Who is she?', a: 'She is my grandmother.', w: ['He is my uncle.', 'She is cooking.'], e: '👵' },
    { q: 'What do you do in the morning?', a: 'I brush my teeth.', w: ['I go to bed.', 'I have dinner.'], e: '🪥' },
    { q: 'What do you do in the evening?', a: 'I do my homework.', w: ['I wake up.', 'I have breakfast.'], e: '📝' },
    { q: 'Do you set the table?', a: 'Yes, I do.', w: ['Yes, I am.', 'Yes, it is.'], e: '🍴' },
    { q: 'Do you iron the clothes?', a: "No, I don't.", w: ['No, I am not.', "No, there isn't."], e: '👕' },
    { q: 'How often do you play chess?', a: 'I sometimes play chess.', w: ['I can play chess.', 'It is chess.'], e: '♟️' },
    { q: 'How often do you wash the dishes?', a: 'I often wash the dishes.', w: ['I am washing.', 'It is a dish.'], e: '🍽️' },
    { q: 'What can Akın do?', a: 'He can play the guitar.', w: ['He is a guitar.', 'He has got a guitar.'], e: '🎸' },
    { q: 'Can your sister swim?', a: 'Yes, she can.', w: ['Yes, she is.', 'Yes, she does.'], e: '🏊' },
    { q: 'Can your grandfather play the violin?', a: "No, he can't.", w: ["No, he doesn't.", "No, he isn't."], e: '🎻' },
    { q: 'What does she do every evening?', a: 'She does her homework.', w: ['She do her homework.', 'She is homework.'], e: '📝' },
    { q: 'What does your aunt do after dinner?', a: 'She watches TV.', w: ['She watch TV.', 'She is TV.'], e: '📺' },
    { q: 'Could you help me, please?', a: 'Yes, of course.', w: ['No, I am late.', 'Good night.'], e: '🤝' },
    { q: 'When do you go to bed?', a: "At ten o'clock.", w: ['On Monday morning.', 'In the kitchen.'], e: '🛏️' }
  ],
  fill: [
    { s: 'I ___ my teeth every morning.', a: 'brush', w: ['wash', 'make'], e: '🪥' },
    { s: 'I ___ my face with water.', a: 'wash', w: ['brush', 'cook'], e: '🚿' },
    { s: 'My mother ___ dinner every evening.', a: 'cooks', w: ['cook', 'cooking'], e: '🍳' },
    { s: 'He ___ a book every day.', a: 'reads', w: ['read', 'reading'], e: '📖' },
    { s: 'My sister ___ lunch at school.', a: 'has', w: ['have', 'is'], e: '🍱' },
    { s: 'She ___ her homework after school.', a: 'does', w: ['do', 'make'], e: '📝' },
    { s: 'I ___ play the piano. I can’t play it.', a: 'never', w: ['always', 'often'], e: '🎹' },
    { s: 'My uncle ___ play football. He is very good.', a: 'can', w: ["can't", 'is'], e: '⚽' },
    { s: 'My cousin can’t ___. He is afraid of water.', a: 'swim', w: ['dance', 'sing'], e: '🏊' },
    { s: 'I ___ the bed every morning.', a: 'make', w: ['do', 'wash'], e: '🛏️' },
    { s: 'Can you put the rubbish ___, please?', a: 'out', w: ['in', 'on'], e: '🗑️' },
    { s: 'My father’s mother is my ___.', a: 'grandmother', w: ['aunt', 'sister'], e: '👵' },
    { s: 'My mother’s brother is my ___.', a: 'uncle', w: ['cousin', 'grandfather'], e: '🧔' },
    { s: 'My uncle’s son is my ___.', a: 'cousin', w: ['brother', 'father'], e: '🧒' },
    { s: 'I ___ milk every morning.', a: 'drink', w: ['eat', 'make'], e: '🥛' },
    { s: 'After school, he ___ home.', a: 'goes', w: ['go', 'going'], e: '🏠' }
  ],
  dialog: [
    { l: ['Could you help me, please?', '___'], a: 'Yes, of course.', w: ['Good night.', 'I am nine.'] },
    { l: ['___', 'I often play basketball.'], a: 'How often do you play basketball?', w: ['Can you play basketball?', 'Where is the basketball?'] },
    { l: ['Can you ride a bike?', '___'], a: "Yes, I can. It's fun!", w: ['Yes, I do.', 'Yes, it is.'] },
    { l: ['___', 'She is my aunt.'], a: 'Who is she?', w: ['What is she?', 'How is she?'] },
    { l: ['Do you help your parents at home?', '___'], a: 'Yes, I do. I set the table.', w: ['Yes, I am.', 'Yes, it is.'] },
    { l: ['___', 'He can play chess.'], a: 'What can your brother do?', w: ['What is your brother?', 'Where is your brother?'] },
    { l: ['What time do you wake up?', '___'], a: "At seven o'clock.", w: ['In the bathroom.', 'With my mother.'] }
  ],
  order: ['I brush my teeth every morning.', 'My mother cooks dinner.', 'I sometimes play chess with my grandfather.', 'He can play the violin.', 'She does her homework in the evening.', 'Do you set the table?', 'My cousin can ride a bike.', 'I never iron the clothes.', 'We have breakfast at seven o’clock.', 'Could you help me, please?'],
  read: [
    { t: 'Hi, I am Ayşe. I live with my family. My father is a doctor. My mother is a teacher. I have got a little brother, Efe. Every morning I wake up at seven. I wash my face and brush my teeth. Then we have breakfast together. In the evening I do my homework and I help my mother. I always set the table.',
      qs: [{ q: 'What time does Ayşe wake up?', a: 'At seven.', w: ['At nine.', 'At ten.'] }, { q: 'Who is Efe?', a: 'Her brother.', w: ['Her father.', 'Her cousin.'] }, { q: 'What does she always do?', a: 'She sets the table.', w: ['She irons the clothes.', 'She cooks dinner.'] }, { q: 'What is her mother?', a: 'A teacher.', w: ['A doctor.', 'A farmer.'] }] },
    { t: 'My family is very talented. My grandfather can play the violin. My grandmother can sing very well. My dad can play football but he can’t swim. My little sister can dance. I can play chess and ride a bike.',
      qs: [{ q: 'Who can play the violin?', a: 'The grandfather.', w: ['The sister.', 'The dad.'] }, { q: 'Can the dad swim?', a: "No, he can't.", w: ['Yes, he can.', 'Yes, he does.'] }, { q: 'What can the little sister do?', a: 'She can dance.', w: ['She can play chess.', 'She can swim.'] }] }
  ]
};

export const U5 = {
  id: 'u5', no: 5, title: 'Homes & Houses & Neighbourhoods', tr: 'Evler ve Çevremiz (Çiftlik)', color: 'green',
  np: ['donkey', 'cottage', 'farmhouse', 'field', 'grow fruit', 'clean the barn', 'gardening', 'barn'],
  sets: [
    { id: 'animals', label: 'Çiftlik hayvanları', art: true, frame: (w) => `It is ${w.a} ${w.en}.`, items: [
      ['cow', 'inek', '🐄', 'Siyah beyaz inek'],
      ['horse', 'at', '🐎', 'Kahverengi at'],
      ['donkey', 'eşek', '🐴', 'Gri eşek'],
      ['sheep', 'koyun', '🐑', 'Beyaz koyun'],
      ['goat', 'keçi', '🐐', 'Boynuzlu keçi'],
      ['hen', 'tavuk', '🐔', 'Kahverengi tavuk'],
      ['rooster', 'horoz', '🐓', 'Öten horoz'],
      ['duck', 'ördek', '🦆', 'Sarı ördek'],
      ['turkey', 'hindi', '🦃', 'Hindi'],
      ['rabbit', 'tavşan', '🐇', 'Beyaz tavşan'],
      ['pig', 'domuz', '🐖', 'Pembe domuz'],
      ['dog', 'köpek', '🐕', 'Çiftlik köpeği'],
      ['cat', 'kedi', '🐈', 'Kedi'],
      ['chick', 'civciv', '🐥', 'Sarı civciv']
    ] },
    { id: 'farm', label: 'Çiftlikte neler var?', art: true, frame: (w) => `This is ${w.en === 'grass' ? '' : w.a + ' '}${w.en}.`, items: [
      ['farm', 'çiftlik', '🏡', 'Ahırı ve hayvanları olan çiftlik'],
      ['barn', 'ahır', '🛖', 'Kırmızı ahır'],
      ['cottage', 'kulübe', '🏚️', 'Küçük taş kulübe'],
      ['farmhouse', 'çiftlik evi', '🏠', 'Çiftlik evi'],
      ['field', 'tarla', '🌾', 'Buğday tarlası'],
      ['tractor', 'traktör', '🚜', 'Yeşil traktör'],
      ['farmer', 'çiftçi', '👨‍🌾', 'Şapkalı çiftçi'],
      ['fence', 'çit', '🚧', 'Tahta çit'],
      ['pond', 'gölet', '💧', 'Ördekli gölet'],
      ['tree', 'ağaç', '🌳', 'Büyük ağaç'],
      ['flower', 'çiçek', '🌻', 'Ayçiçeği'],
      ['grass', 'çimen', '🌿', 'Yeşil çimen'],
      ['village', 'köy', '🏘️', 'Küçük köy'],
      ['city', 'şehir', '🏙️', 'Büyük şehir']
    ] },
    { id: 'farmacts', label: 'Çiftlikte yapılanlar', frame: (w) => `I am ${w.ing} now.`, items: [
      ['water the flowers', 'çiçekleri sulamak', '🌷', 'Çiçekleri sulayan çocuk', 'watering the flowers'],
      ['collect the eggs', 'yumurtaları toplamak', '🥚', 'Sepetle yumurta toplayan çocuk', 'collecting the eggs'],
      ['plant a tree', 'ağaç dikmek', '🌱', 'Fidan diken çocuk', 'planting a tree'],
      ['feed the hens', 'tavukları beslemek', '🐔', 'Tavuklara yem veren çocuk', 'feeding the hens'],
      ['milk the cow', 'inek sağmak', '🐄', 'İnek sağan kadın', 'milking the cow'],
      ['clean the barn', 'ahırı temizlemek', '🧹', 'Ahırı temizleyen çiftçi', 'cleaning the barn'],
      ['bake bread', 'ekmek pişirmek', '🍞', 'Fırında ekmek pişiren büyükanne', 'baking bread'],
      ['plant vegetables', 'sebze dikmek', '🥕', 'Bahçeye sebze diken baba', 'planting vegetables'],
      ['pick apples', 'elma toplamak', '🍎', 'Ağaçtan elma toplayan çocuk', 'picking apples'],
      ['ride a horse', 'ata binmek', '🏇', 'Ata binen çocuk', 'riding a horse'],
      ['drive a tractor', 'traktör sürmek', '🚜', 'Traktör süren çiftçi', 'driving a tractor'],
      ['gardening', 'bahçe işleri', '🧑‍🌾', 'Bahçede çalışan dede', 'gardening']
    ] }
  ],
  qa: [
    { q: 'What is the farmer doing now?', a: 'He is planting vegetables.', w: ['He plants vegetables every day.', 'He is a farmer.'], e: '👨‍🌾' },
    { q: 'What is this?', a: 'It is a barn.', w: ['They are barns.', 'It is barning.'], e: '🛖' },
    { q: 'Are you cleaning the barn?', a: 'Yes, I am.', w: ['Yes, I do.', 'Yes, it is.'], e: '🧹' },
    { q: 'Are you milking the cow?', a: 'No, I am not.', w: ["No, I don't.", "No, it isn't."], e: '🐄' },
    { q: 'What are you doing at present?', a: 'I am feeding the rabbit.', w: ['I feed the rabbit.', 'It is a rabbit.'], e: '🐇' },
    { q: 'How many horses are there on the farm?', a: 'There are three horses.', w: ['There is a horse.', 'It is a horse.'], e: '🐎' },
    { q: 'What does your grandmother do every morning?', a: 'She bakes bread.', w: ['She is baking bread now.', 'She bake bread.'], e: '🍞' },
    { q: 'Is there a tractor on the farm?', a: 'Yes, there is.', w: ['Yes, there are.', 'Yes, I am.'], e: '🚜' },
    { q: 'Do you like villages?', a: 'Yes, I love villages.', w: ['Yes, I am a village.', 'It is a village.'], e: '🏘️' },
    { q: 'Where do horses live?', a: 'In the barn.', w: ['In the classroom.', 'In the library.'], e: '🐎' },
    { q: 'What is your mother doing?', a: 'She is watering the flowers.', w: ['She waters.', 'She is a flower.'], e: '🌷' },
    { q: 'What sound does a cow make?', a: 'Moo!', w: ['Quack!', 'Baa!'], e: '🐄' },
    { q: 'What sound does a duck make?', a: 'Quack!', w: ['Moo!', 'Woof!'], e: '🦆' },
    { q: 'What sound does a sheep make?', a: 'Baa!', w: ['Cluck!', 'Quack!'], e: '🐑' }
  ],
  fill: [
    { s: 'The woman is ___ the cow.', a: 'milking', w: ['milk', 'milks'], e: '🐄' },
    { s: 'I am ___ the eggs now.', a: 'collecting', w: ['collect', 'collects'], e: '🥚' },
    { s: 'My uncle is ___ a tree at present.', a: 'planting', w: ['plant', 'plants'], e: '🌱' },
    { s: 'We ___ watering the flowers.', a: 'are', w: ['is', 'am'], e: '🌷' },
    { s: 'She ___ feeding the hens now.', a: 'is', w: ['are', 'am'], e: '🐔' },
    { s: 'I ___ cleaning the barn.', a: 'am', w: ['is', 'are'], e: '🧹' },
    { s: 'My grandfather ___ the horse every morning.', a: 'feeds', w: ['feeding', 'feed'], e: '🐎' },
    { s: 'The farmer drives a ___.', a: 'tractor', w: ['cow', 'flower'], e: '🚜' },
    { s: 'The cows are in the ___.', a: 'barn', w: ['pond', 'kitchen'], e: '🐄' },
    { s: 'The ducks swim in the ___.', a: 'pond', w: ['barn', 'field'], e: '🦆' },
    { s: 'A hen gives us ___.', a: 'eggs', w: ['milk', 'bread'], e: '🐔' },
    { s: 'A cow gives us ___.', a: 'milk', w: ['eggs', 'apples'], e: '🥛' },
    { s: 'I love villages, but I don’t ___ cities.', a: 'like', w: ['likes', 'liking'], e: '🏙️' },
    { s: 'There ___ four sheep on our farm.', a: 'are', w: ['is', 'am'], e: '🐑' }
  ],
  dialog: [
    { l: ['___', 'I am cleaning the barn.'], a: 'What are you doing now?', w: ['How are you?', 'What do you do in the morning?'] },
    { l: ['Are you collecting eggs at present?', '___'], a: 'Yes, I am.', w: ['Yes, I do.', 'Yes, they are.'] },
    { l: ['What is this?', '___'], a: 'It’s a red farmhouse.', w: ['It’s a red flower.', 'They are farmhouses.'] },
    { l: ['Welcome to our farm!', '___'], a: 'Thank you! It is beautiful.', w: ['Good night!', 'I am late!'] },
    { l: ['___', 'There are twenty hens.'], a: 'How many hens are there?', w: ['What is a hen?', 'Where are the hens?'] },
    { l: ['Is grandpa milking the cow?', '___'], a: "No, he isn't. He is feeding the horse.", w: ['Yes, he does.', "No, he doesn't."] }
  ],
  order: ['The farmer is driving a tractor.', 'I am watering the flowers now.', 'There are three horses on the farm.', 'My grandmother bakes bread every day.', 'Are you feeding the rabbit?', 'We are picking apples at present.', 'The ducks are swimming in the pond.', 'I love villages but I don’t like cities.', 'She is milking the cow.', 'There is a big barn on our farm.'],
  read: [
    { t: 'Welcome to Green Farm! It is a big farm in a small village. There is a red barn and a little cottage. There are five cows, two horses, a donkey and lots of hens. Now it is morning. Grandpa is milking the cows. Grandma is baking bread. I am collecting the eggs. My little brother is feeding the rabbits.',
      qs: [{ q: 'How many cows are there?', a: 'Five.', w: ['Two.', 'Ten.'] }, { q: 'What is Grandma doing?', a: 'She is baking bread.', w: ['She is milking the cows.', 'She is feeding the rabbits.'] }, { q: 'Who is feeding the rabbits?', a: 'The little brother.', w: ['Grandpa.', 'Grandma.'] }, { q: 'What colour is the barn?', a: 'Red.', w: ['Blue.', 'White.'] }] },
    { t: 'My uncle is a farmer. His day starts early. He wakes up at five o’clock. He feeds the animals and cleans the barn. In the afternoon he drives his tractor in the field. He grows tomatoes and potatoes.',
      qs: [{ q: 'What is the uncle?', a: 'A farmer.', w: ['A teacher.', 'A doctor.'] }, { q: 'When does he wake up?', a: 'At five o’clock.', w: ['At nine o’clock.', 'At noon.'] }, { q: 'What does he grow?', a: 'Tomatoes and potatoes.', w: ['Apples and bananas.', 'Flowers and trees.'] }] }
  ]
};

export const U6 = {
  id: 'u6', no: 6, title: 'Life in the City & in the World', tr: 'Şehirde ve Dünyada Yaşam (Yiyecekler)', color: 'rose',
  np: ['ayran', 'spinach', 'olive', 'broccoli soup', 'tomato soup', 'spinach soup', 'butter', 'pasta', 'toast'],
  sets: [
    { id: 'food', label: 'Yiyecekler', items: [
      ['bread', 'ekmek', '🍞', 'Bir somun ekmek'],
      ['cheese', 'peynir', '🧀', 'Peynir dilimi'],
      ['egg', 'yumurta', '🥚', 'Haşlanmış yumurta'],
      ['honey', 'bal', '🍯', 'Bir kavanoz bal'],
      ['butter', 'tereyağı', '🧈', 'Tereyağı kalıbı'],
      ['olive', 'zeytin', '🫒', 'Siyah zeytinler'],
      ['meat', 'et', '🥩', 'Bir parça et'],
      ['fish', 'balık', '🐟', 'Pişmiş balık'],
      ['chicken', 'tavuk eti', '🍗', 'Kızarmış tavuk budu'],
      ['rice', 'pilav', '🍚', 'Bir kase pilav'],
      ['pasta', 'makarna', '🍝', 'Bir tabak makarna'],
      ['soup', 'çorba', '🍲', 'Sıcak çorba'],
      ['salad', 'salata', '🥗', 'Bir kase salata'],
      ['sandwich', 'sandviç', '🥪', 'Sandviç'],
      ['pancake', 'krep / pankek', '🥞', 'Ballı pankek'],
      ['cake', 'kek / pasta', '🍰', 'Bir dilim pasta'],
      ['toast', 'tost', '🍞', 'Kızarmış tost'],
      ['pizza', 'pizza', '🍕', 'Bir dilim pizza']
    ] },
    { id: 'drinks', label: 'İçecekler', frame: (w) => `I like drinking ${w.en}.`, items: [
      ['water', 'su', '💧', 'Bir bardak su'],
      ['milk', 'süt', '🥛', 'Bir bardak süt'],
      ['tea', 'çay', '🍵', 'Bir fincan çay'],
      ['coffee', 'kahve', '☕', 'Bir fincan kahve'],
      ['fruit juice', 'meyve suyu', '🧃', 'Kutu meyve suyu'],
      ['ayran', 'ayran', '🥛', 'Bir bardak ayran'],
      ['lemonade', 'limonata', '🍋', 'Bir bardak limonata']
    ] },
    { id: 'fruit', label: 'Meyveler', frame: (w) => `It is ${w.a} ${w.en}.`, art: true, items: [
      ['apple', 'elma', '🍎', 'Kırmızı elma'],
      ['banana', 'muz', '🍌', 'Sarı muz'],
      ['orange', 'portakal', '🍊', 'Portakal'],
      ['strawberry', 'çilek', '🍓', 'Çilek'],
      ['cherry', 'kiraz', '🍒', 'Kiraz'],
      ['grape', 'üzüm', '🍇', 'Üzüm salkımı'],
      ['watermelon', 'karpuz', '🍉', 'Karpuz dilimi'],
      ['lemon', 'limon', '🍋', 'Limon'],
      ['pear', 'armut', '🍐', 'Armut'],
      ['peach', 'şeftali', '🍑', 'Şeftali']
    ] },
    { id: 'veg', label: 'Sebzeler', frame: (w) => `It is ${['broccoli', 'spinach', 'corn'].includes(w.en) ? '' : w.a + ' '}${w.en}.`, art: true, items: [
      ['tomato', 'domates', '🍅', 'Domates'],
      ['potato', 'patates', '🥔', 'Patates'],
      ['carrot', 'havuç', '🥕', 'Havuç'],
      ['broccoli', 'brokoli', '🥦', 'Brokoli'],
      ['spinach', 'ıspanak', '🥬', 'Ispanak yaprakları'],
      ['corn', 'mısır', '🌽', 'Mısır koçanı'],
      ['onion', 'soğan', '🧅', 'Soğan'],
      ['pepper', 'biber', '🫑', 'Yeşil biber'],
      ['cucumber', 'salatalık', '🥒', 'Salatalık']
    ] },
    { id: 'table', label: 'Sofrada', kind: 'phrase', items: [
      ['Enjoy your meal!', 'Afiyet olsun!', '🍽️', 'Sofrada afiyet olsun diyen anne'],
      ['Pass me the salt, please.', 'Tuzu uzatır mısın lütfen?', '🧂', 'Tuzu uzatan çocuk'],
      ["No, thanks. I'm full.", 'Hayır teşekkürler, doydum.', '😌', 'Karnını tutan, doymuş çocuk'],
      ['Can I see the menu, please?', 'Menüyü görebilir miyim lütfen?', '📋', 'Restoranda menüye bakan aile'],
      ['Can I have the bill, please?', 'Hesabı alabilir miyim lütfen?', '🧾', 'Garsondan hesap isteyen adam'],
      ['Yummy!', 'Çok lezzetli!', '😋', 'Dudaklarını yalayan çocuk'],
      ["I'm hungry.", 'Acıktım.', '🤤', 'Karnı guruldayan çocuk'],
      ["I'm thirsty.", 'Susadım.', '🥵', 'Su içmek isteyen çocuk']
    ] }
  ],
  qa: [
    { q: 'How often do you have fish for dinner?', a: 'I often have fish for dinner.', w: ['I am eating fish.', 'It is a fish.'], e: '🐟' },
    { q: 'How often do you have milk for breakfast?', a: 'I always have milk for breakfast.', w: ['I am milk.', 'It is milk.'], e: '🥛' },
    { q: 'What is Mira eating?', a: 'She is eating a sandwich.', w: ['She eats sandwich every.', 'It is Mira.'], e: '🥪' },
    { q: 'What do you want for breakfast?', a: 'I want some pancakes.', w: ['I am pancakes.', 'I want a cup of pancake.'], e: '🥞' },
    { q: 'What does your mother want after dinner?', a: 'She wants a cup of tea.', w: ['She want tea.', 'She is tea.'], e: '🍵' },
    { q: 'Do you want some more water?', a: "No, thanks. I'm full.", w: ['No, I am not water.', 'Yes, it is.'], e: '💧' },
    { q: 'What have you got in your lunch box?', a: 'I have got some chicken and rice.', w: ['I am lunch box.', 'It is a box.'], e: '🍱' },
    { q: 'Have you got any apples?', a: "No, I haven't.", w: ["No, I don't.", "No, there isn't."], e: '🍎' },
    { q: 'Have you got any fruit juice?', a: 'Yes, I have.', w: ['Yes, I do.', 'Yes, it is.'], e: '🧃' },
    { q: 'Do you like eating olives?', a: 'Yes, I love olives!', w: ['Yes, I am olives.', 'Olives are green trees.'], e: '🫒' },
    { q: 'What do you eat in the morning?', a: 'I eat some bread, cheese and eggs.', w: ['I eat fish and rice at night.', 'I drink at noon.'], e: '🍳' },
    { q: 'What is he drinking?', a: 'He is drinking a glass of milk.', w: ['He drinks milk every.', 'He is a milk.'], e: '🥛' },
    { q: 'Can I see the menu, please?', a: 'Of course. Here you are.', w: ['I am full.', 'Enjoy your meal!'], e: '📋' }
  ],
  fill: [
    { s: 'I like ___ fruit juice.', a: 'drinking', w: ['eating', 'drink'], e: '🧃' },
    { s: 'I dislike ___ fish.', a: 'eating', w: ['drinking', 'eat'], e: '🐟' },
    { s: 'She ___ a sandwich.', a: 'wants', w: ['want', 'wanting'], e: '🥪' },
    { s: 'I want ___ pancakes.', a: 'some', w: ['a', 'an'], e: '🥞' },
    { s: 'He wants ___ cup of tea.', a: 'a', w: ['some', 'an'], e: '🍵' },
    { s: 'Have you got ___ strawberries?', a: 'any', w: ['a', 'an'], e: '🍓' },
    { s: 'I ___ have coffee. I don’t like it.', a: 'never', w: ['always', 'often'], e: '☕' },
    { s: 'She is ___ some tomato soup today.', a: 'eating', w: ['drinking', 'eats'], e: '🍲' },
    { s: 'Pass me the ___, please.', a: 'salt', w: ['menu', 'bill'], e: '🧂' },
    { s: 'Enjoy your ___!', a: 'meal', w: ['menu', 'full'], e: '🍽️' },
    { s: 'No, thanks. I’m ___.', a: 'full', w: ['hungry', 'thirsty'], e: '😌' },
    { s: 'Monkeys love ___.', a: 'bananas', w: ['fish', 'coffee'], e: '🍌' },
    { s: 'Rabbits love ___.', a: 'carrots', w: ['meat', 'milk'], e: '🥕' },
    { s: 'We drink ___ when we are thirsty.', a: 'water', w: ['bread', 'soup'], e: '💧' }
  ],
  dialog: [
    { l: ['Do you want some more cake?', '___'], a: "No, thanks. I'm full.", w: ['Enjoy your meal!', 'Can I have the bill?'] },
    { l: ['Breakfast time! Enjoy your meal!', '___'], a: 'Thanks. Yummy!', w: ['Can I have the bill, please?', 'Good night!'] },
    { l: ['___', 'Here you are. Enjoy your meal!'], a: 'Can I see the menu, please?', w: ['I am full.', 'Goodbye!'] },
    { l: ['What do you want for lunch?', '___'], a: 'I want some soup and salad.', w: ['I am lunch.', 'It is noon.'] },
    { l: ['Have you got any bananas?', '___'], a: 'Yes, I have. Here you are.', w: ['Yes, I do.', 'Yes, it is a banana.'] },
    { l: ['___', 'No, I dislike drinking coffee.'], a: 'Do you like drinking coffee?', w: ['What is coffee?', 'Where is the coffee?'] }
  ],
  order: ['I like eating strawberries.', 'She wants a cup of tea.', 'I never have meat for breakfast.', 'He is drinking a glass of milk.', 'Have you got any apples?', 'I have got some pancakes in my lunch box.', 'Do you want some more soup?', 'Pass me the salt, please.', 'I dislike drinking coffee.', 'We always have breakfast together.'],
  read: [
    { t: 'Hi! I am Kerem. I always have breakfast with my family. I eat bread, cheese, olives and eggs. I drink milk. My sister likes honey but she dislikes olives. For lunch I have chicken and rice. I never drink coffee. My favourite fruit is strawberry.',
      qs: [{ q: 'What does Kerem drink for breakfast?', a: 'Milk.', w: ['Coffee.', 'Tea.'] }, { q: 'What does his sister dislike?', a: 'Olives.', w: ['Honey.', 'Bread.'] }, { q: 'What does Kerem have for lunch?', a: 'Chicken and rice.', w: ['Fish and pasta.', 'Soup and salad.'] }, { q: 'What is his favourite fruit?', a: 'Strawberry.', w: ['Banana.', 'Apple.'] }] },
    { t: 'Today is a picnic day. Mum has got sandwiches and fruit juice. Dad has got apples, bananas and cherries. Little Can is hungry. He is eating a big sandwich. Then he wants some more water. After the picnic he says: "Thanks, Mum. I am full!"',
      qs: [{ q: 'What has Dad got?', a: 'Apples, bananas and cherries.', w: ['Sandwiches and juice.', 'Pizza and cake.'] }, { q: 'What is Can eating?', a: 'A big sandwich.', w: ['A cake.', 'Some soup.'] }, { q: 'How does Can feel after the picnic?', a: 'Full.', w: ['Hungry.', 'Sad.'] }] }
  ]
};
