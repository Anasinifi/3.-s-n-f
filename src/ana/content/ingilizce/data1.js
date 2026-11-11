// ============================================================================
// --- 3. SINIF İNGİLİZCE: ÜNİTE VERİLERİ (1-3) ---
// ============================================================================
// Konular kitaptaki temalarla aynıdır; cümleler ve sorular ÖZGÜNDÜR (kitaptan kopya değildir).
// Kelime: [ingilizce, türkçe, emoji (yedek resim), görsel tarifi (isteğe bağlı)]
//   görsel tarifi: öğretmenin üreteceği gerçek resmin adı / tarifi (toplu görsel yüklemede bu adla eşleşir)

export const U1 = {
  id: 'u1', no: 1, title: 'School Life', tr: 'Okul Hayatı', color: 'sky',
  np: ['corridor', 'meeting room'],
  sets: [
    { id: 'places', label: 'Okuldaki yerler', art: true, frame: (w) => `This is ${w.a} ${w.en}.`, items: [
      ['library', 'kütüphane', '📚', 'Okul kütüphanesi, raflarda kitaplar'],
      ['art room', 'resim odası', '🎨', 'Okulda resim odası, şövale ve boyalar'],
      ['music room', 'müzik odası', '🎼', 'Okulda müzik odası, piyano ve gitarlar'],
      ['gym', 'spor salonu', '🤸', 'Okulun kapalı spor salonu'],
      ['sports field', 'spor sahası', '🥅', 'Okulun açık futbol sahası'],
      ['classroom', 'sınıf', '🏫', 'Sıraları ve tahtası olan sınıf'],
      ['office', 'ofis', '🗄️', 'Okul müdürünün ofisi, masa ve dolap'],
      ['meeting room', 'toplantı odası', '👥', 'Büyük masalı toplantı odası'],
      ['canteen', 'kantin', '🥪', 'Okul kantini'],
      ['school garden', 'okul bahçesi', '🌳', 'Ağaçlı okul bahçesi'],
      ['corridor', 'koridor', '🚪', 'Kapıları olan okul koridoru']
    ] },
    { id: 'people', label: 'Okuldaki kişiler', art: true, frame: (w) => `This is the ${w.en}.`, items: [
      ['headteacher', 'okul müdürü', '👨‍💼', 'Takım elbiseli okul müdürü'],
      ['teacher', 'öğretmen', '👩‍🏫', 'Tahta önünde öğretmen'],
      ['art teacher', 'resim öğretmeni', '👩‍🎨', 'Elinde fırça olan resim öğretmeni'],
      ['music teacher', 'müzik öğretmeni', '🎻', 'Keman çalan müzik öğretmeni'],
      ['librarian', 'kütüphaneci', '📖', 'Kitapları düzenleyen kütüphaneci'],
      ['school nurse', 'okul hemşiresi', '👩‍⚕️', 'Beyaz önlüklü okul hemşiresi'],
      ['caretaker', 'okul görevlisi', '🧹', 'Süpürge tutan okul görevlisi'],
      ['classmate', 'sınıf arkadaşı', '🧒', 'Sırada oturan sınıf arkadaşı'],
      ['pupil', 'öğrenci', '🎒', 'Sırt çantalı öğrenci']
    ] },
    { id: 'acts', label: 'Okulda yaptıklarımız', frame: (w) => `We ${w.en}.`, items: [
      ['play football', 'futbol oynamak', '⚽', 'Futbol oynayan çocuklar'],
      ['play basketball', 'basketbol oynamak', '🏀', 'Basketbol oynayan çocuk'],
      ['play volleyball', 'voleybol oynamak', '🏐', 'Voleybol oynayan çocuklar'],
      ['play the guitar', 'gitar çalmak', '🎸', 'Gitar çalan çocuk'],
      ['read books', 'kitap okumak', '📖', 'Kitap okuyan çocuk'],
      ['draw pictures', 'resim çizmek', '✏️', 'Kalemle resim çizen çocuk'],
      ['paint pictures', 'resim boyamak', '🖌️', 'Fırçayla resim boyayan çocuk'],
      ['sing songs', 'şarkı söylemek', '🎤', 'Şarkı söyleyen çocuklar'],
      ['clean the school', 'okulu temizlemek', '🧽', 'Okulu temizleyen görevli']
    ] },
    { id: 'greet', label: 'Selamlaşma', kind: 'phrase', items: [
      ['Good morning!', 'Günaydın!', '🌅', 'Sabah selamlaşan iki çocuk'],
      ['Good afternoon!', 'Tünaydın! (öğleden sonra)', '🌤️', 'Öğleden sonra selamlaşan öğretmen ve öğrenci'],
      ['Good evening!', 'İyi akşamlar!', '🌆', 'Akşam selamlaşan komşular'],
      ['Good night!', 'İyi geceler!', '🌙', 'Yatağa giden çocuk iyi geceler diyor'],
      ['Nice to meet you!', 'Tanıştığıma memnun oldum!', '🤝', 'Tokalaşarak tanışan iki çocuk'],
      ['Have a nice day!', 'İyi günler!', '☀️', 'El sallayıp iyi günler dileyen çocuk'],
      ['See you later!', 'Sonra görüşürüz!', '👋', 'El sallayarak ayrılan arkadaşlar'],
      ['Goodbye!', 'Hoşça kal!', '🚌', 'Okul servisine binip el sallayan çocuk'],
      ['Thank you!', 'Teşekkür ederim!', '🙏', 'Teşekkür eden çocuk']
    ] },
    { id: 'months', label: 'Aylar', kind: 'word', noPic: true, items: [
      ['January', 'Ocak', '❄️'], ['February', 'Şubat', '⛄'], ['March', 'Mart', '🌱'], ['April', 'Nisan', '🌷'],
      ['May', 'Mayıs', '🌸'], ['June', 'Haziran', '🍓'], ['July', 'Temmuz', '🏖️'], ['August', 'Ağustos', '🍉'],
      ['September', 'Eylül', '🎒'], ['October', 'Ekim', '🍂'], ['November', 'Kasım', '🌧️'], ['December', 'Aralık', '🎄']
    ] },
    { id: 'party', label: 'Doğum günü', art: true, frame: (w) => `This is ${w.a} ${w.en}.`, items: [
      ['birthday cake', 'doğum günü pastası', '🎂', 'Mumlu doğum günü pastası'],
      ['candle', 'mum', '🕯️', 'Yanan bir mum'],
      ['balloon', 'balon', '🎈', 'Kırmızı bir balon'],
      ['gift', 'hediye', '🎁', 'Kurdeleli hediye paketi'],
      ['party hat', 'parti şapkası', '🥳', 'Parti şapkalı çocuk'],
      ['card', 'kart', '💌', 'Doğum günü kartı']
    ] }
  ],
  qa: [
    { q: 'Where is the librarian?', a: 'She is in the library.', w: ['She is in the gym.', 'She is a pupil.'], e: '📚' },
    { q: 'Where do we play football?', a: 'In the sports field.', w: ['In the library.', 'In the office.'], e: '⚽' },
    { q: 'Where do you read books?', a: 'In the library.', w: ['In the gym.', 'In the canteen.'], e: '📖' },
    { q: 'Where do you sing songs?', a: 'In the music room.', w: ['In the meeting room.', 'In the sports field.'], e: '🎤' },
    { q: 'Where do you paint pictures?', a: 'In the art room.', w: ['In the music room.', 'In the office.'], e: '🎨' },
    { q: 'Who is he?', a: 'He is the headteacher.', w: ['It is a library.', 'He is in March.'], e: '👨‍💼' },
    { q: 'Who is she?', a: 'She is the school nurse.', w: ['She is ten years old.', 'It is a gift.'], e: '👩‍⚕️' },
    { q: 'How old are you?', a: "I'm nine years old.", w: ["It's in May.", "I'm a pupil."], e: '🎂' },
    { q: 'How old is your sister?', a: 'She is seven years old.', w: ['She is in the gym.', 'It is her gift.'], e: '👧' },
    { q: 'When is your birthday?', a: "It's in October.", w: ["I'm eight years old.", 'It is a cake.'], e: '📅' },
    { q: 'Whose birthday is it?', a: "It's Elif's birthday.", w: ["It's in June.", 'There are six candles.'], e: '🥳' },
    { q: 'What month is it?', a: 'It is April.', w: ['It is Monday.', 'It is a classroom.'], e: '🗓️' },
    { q: 'How many candles are there?', a: 'There are eight candles.', w: ['There is a cake.', "It's in July."], e: '🕯️' },
    { q: 'Is there a gift on the table?', a: 'Yes, there is.', w: ['Yes, there are.', 'No, I am not.'], e: '🎁' },
    { q: 'Are there balloons in the room?', a: 'Yes, there are.', w: ['Yes, it is.', 'No, there isn’t.'], e: '🎈' },
    { q: 'Is there a cake on the plate?', a: "No, there isn't.", w: ["No, there aren't.", 'Yes, I do.'], e: '🍽️' },
    { q: 'Are there pupils in the classroom?', a: "No, there aren't.", w: ["No, there isn't.", 'Yes, it is.'], e: '🏫' },
    { q: 'Is Can your classmate?', a: 'Yes, he is.', w: ['Yes, there is.', 'No, it is March.'], e: '🧒' },
    { q: 'What do you do in the gym?', a: 'We play basketball.', w: ['We read books.', 'We sing songs in the office.'], e: '🏀' },
    { q: 'Who cleans the school?', a: 'The caretaker.', w: ['The librarian.', 'The art teacher.'], e: '🧹' }
  ],
  fill: [
    { s: 'We play football in the ___.', a: 'sports field', w: ['library', 'office'], e: '⚽' },
    { s: 'We read books in the ___.', a: 'library', w: ['gym', 'canteen'], e: '📚' },
    { s: 'The pupils play the guitar in the ___.', a: 'music room', w: ['meeting room', 'school garden'], e: '🎸' },
    { s: 'We draw pictures in the ___.', a: 'art room', w: ['sports field', 'corridor'], e: '✏️' },
    { s: 'The caretaker ___ the school.', a: 'cleans', w: ['sings', 'reads'], e: '🧹' },
    { s: 'You ___ run in the corridor.', a: "mustn't", w: ['must', 'are'], e: '🏃' },
    { s: 'You ___ listen to the teacher.', a: 'must', w: ["mustn't", 'is'], e: '👂' },
    { s: 'You must be ___ in the library.', a: 'quiet', w: ['noisy', 'late'], e: '🤫' },
    { s: 'There ___ nine candles on the cake.', a: 'are', w: ['is', 'am'], e: '🕯️' },
    { s: 'There ___ a gift on the table.', a: 'is', w: ['are', 'am'], e: '🎁' },
    { s: 'My birthday is ___ May.', a: 'in', w: ['on', 'at'], e: '🌸' },
    { s: 'She ___ ten years old.', a: 'is', w: ['are', 'am'], e: '👧' },
    { s: 'I ___ eight years old.', a: 'am', w: ['is', 'are'], e: '🎂' },
    { s: 'He is ___ headteacher.', a: 'the', w: ['an', 'at'], e: '👨‍💼' },
    { s: 'This is ___ art room.', a: 'an', w: ['a', 'two'], e: '🎨' },
    { s: 'This is ___ library.', a: 'a', w: ['an', 'are'], e: '📚' },
    { s: 'Nice to ___ you!', a: 'meet', w: ['see', 'have'], e: '🤝' },
    { s: 'Have a nice ___!', a: 'day', w: ['night', 'later'], e: '☀️' },
    { s: 'See you ___!', a: 'later', w: ['morning', 'nice'], e: '👋' },
    { s: 'The school nurse is in her ___.', a: 'office', w: ['gym', 'sports field'], e: '👩‍⚕️' },
    { s: 'You must be ___ on the stairs.', a: 'careful', w: ['hungry', 'old'], e: '⚠️' },
    { s: 'January, February, ___, April.', a: 'March', w: ['May', 'June'], e: '🗓️' },
    { s: 'June, July, ___, September.', a: 'August', w: ['October', 'April'], e: '🗓️' },
    { s: 'October, ___, December.', a: 'November', w: ['January', 'March'], e: '🗓️' }
  ],
  rules: [
    ['You must listen to the teacher.', true, '👂'], ['You must be quiet in the library.', true, '🤫'],
    ['You must be careful.', true, '⚠️'], ['You must raise your hand.', true, '🙋'],
    ["You mustn't run in the corridor.", true, '🏃'], ["You mustn't play football in the classroom.", true, '⚽'],
    ["You mustn't eat in the library.", true, '🍔'], ["You mustn't shout in the class.", true, '📢'],
    ['You must run in the corridor.', false, '🏃'], ['You must play football in the classroom.', false, '⚽'],
    ["You mustn't listen to the teacher.", false, '👂'], ['You must shout in the library.', false, '📢']
  ],
  dialog: [
    { l: ['Hi! I am Selin.', '___ I am Arda.'], a: 'Hello!', w: ['Good night!', 'Goodbye!'] },
    { l: ['This is my friend, Ece.', '___'], a: 'Nice to meet you!', w: ['See you later!', 'Good night!'] },
    { l: ['Bye, Mrs. Kaya!', '___'], a: 'Goodbye! Have a nice day!', w: ['Nice to meet you!', 'Good morning!'] },
    { l: ['It is 9 p.m. I am going to bed.', '___'], a: 'Good night!', w: ['Good morning!', 'Good afternoon!'] },
    { l: ['___', "It's in December."], a: 'When is your birthday?', w: ['How old are you?', 'Who is she?'] },
    { l: ['___', "I'm ten years old."], a: 'How old are you?', w: ['What month is it?', 'Where is the gym?'] },
    { l: ['Happy birthday, Can!', '___'], a: 'Thank you!', w: ['Good night!', 'See you!'] },
    { l: ['Who is she?', '___'], a: 'She is our art teacher.', w: ['It is an art room.', 'She is in May.'] },
    { l: ['Is this your classroom?', '___'], a: 'Yes, it is.', w: ['Yes, there are.', 'No, I am not.'] },
    { l: ['___', 'He is in the gym.'], a: 'Where is Mr. Demir?', w: ['How old is Mr. Demir?', 'What is this?'] }
  ],
  order: ['We read books in the library.', 'You must listen to the teacher.', 'There are six candles on the cake.', 'My birthday is in April.', 'She is the school nurse.', 'We play football in the sports field.', 'This is our music room.', "You mustn't run in the corridor.", 'I am nine years old.', 'Is there a gift on the table?', 'The caretaker cleans the school.', 'Have a nice day!'],
  read: [
    { t: 'Hello! I am Deniz. I am nine years old. My birthday is in May. Today is my birthday. There is a big cake on the table. There are nine candles on it. My classmates are here.',
      qs: [{ q: 'How old is Deniz?', a: 'Nine.', w: ['Eight.', 'Ten.'] }, { q: 'When is his birthday?', a: 'In May.', w: ['In March.', 'In June.'] }, { q: 'How many candles are there?', a: 'Nine.', w: ['Six.', 'Two.'] }, { q: 'What is on the table?', a: 'A big cake.', w: ['A guitar.', 'A ball.'] }] },
    { t: 'This is our school. It is big. There is a library and a gym. Mrs. Aksoy is our librarian. She loves books. Mr. Tan is the caretaker. He cleans the school every day. We play football in the sports field.',
      qs: [{ q: 'Who is Mrs. Aksoy?', a: 'The librarian.', w: ['The school nurse.', 'The headteacher.'] }, { q: 'What does Mr. Tan do?', a: 'He cleans the school.', w: ['He reads books.', 'He sings songs.'] }, { q: 'Where do they play football?', a: 'In the sports field.', w: ['In the library.', 'In the office.'] }, { q: 'Is the school small?', a: 'No, it is big.', w: ['Yes, it is.', 'Yes, it is small.'] }] },
    { t: 'School rules: You must be quiet in the library. You must listen to your teacher. You mustn’t run in the corridor. You mustn’t eat in the classroom.',
      qs: [{ q: 'Where must you be quiet?', a: 'In the library.', w: ['In the gym.', 'In the sports field.'] }, { q: 'Can you run in the corridor?', a: 'No, you mustn’t.', w: ['Yes, you must.', 'Yes, you can.'] }, { q: 'Who must you listen to?', a: 'Your teacher.', w: ['The caretaker.', 'Your cat.'] }] }
  ]
};

export const U2 = {
  id: 'u2', no: 2, title: 'Classroom Life', tr: 'Sınıf Hayatı', color: 'emerald',
  np: ['chair', 'board', 'Life Study', 'Turkish'],
  sets: [
    { id: 'objects', label: 'Sınıf eşyaları', art: true, frame: (w) => `It is ${w.a} ${w.en}.`, items: [
      ['pen', 'tükenmez kalem', '🖊️', 'Mavi tükenmez kalem'],
      ['pencil', 'kurşun kalem', '✏️', 'Sarı kurşun kalem'],
      ['ruler', 'cetvel', '📏', 'Plastik cetvel'],
      ['school bag', 'okul çantası', '🎒', 'Okul sırt çantası'],
      ['coursebook', 'ders kitabı', '📘', 'Mavi kapaklı ders kitabı'],
      ['workbook', 'çalışma kitabı', '📗', 'Yeşil kapaklı çalışma kitabı'],
      ['exercise book', 'defter', '📒', 'Sarı kapaklı defter'],
      ['paintbrush', 'boya fırçası', '🖌️', 'Ucu boyalı fırça'],
      ['duster', 'silgi (tahta silgisi)', '🧽', 'Tahta silgisi'],
      ['scissors', 'makas', '✂️', 'Çocuk makası'],
      ['computer', 'bilgisayar', '💻', 'Dizüstü bilgisayar'],
      ['keyboard', 'klavye', '⌨️', 'Bilgisayar klavyesi'],
      ['mouse', 'fare (bilgisayar)', '🖱️', 'Bilgisayar faresi'],
      ['map', 'harita', '🗺️', 'Duvar haritası'],
      ['clock', 'saat', '🕒', 'Duvar saati']
    ] },
    { id: 'furniture', label: 'Sınıf mobilyaları', art: true, frame: (w) => `It is ${w.a} ${w.en}.`, items: [
      ['desk', 'sıra / masa', '🪑', 'Öğrenci sırası'],
      ['chair', 'sandalye', '💺', 'Okul sandalyesi'],
      ['bookshelf', 'kitaplık', '📚', 'Kitap dolu kitaplık'],
      ['locker', 'dolap', '🗄️', 'Sınıf dolabı'],
      ['bin', 'çöp kutusu', '🗑️', 'Çöp kutusu'],
      ['board', 'tahta', '📋', 'Sınıf tahtası'],
      ['window', 'pencere', '🪟', 'Sınıf penceresi'],
      ['door', 'kapı', '🚪', 'Sınıf kapısı']
    ] },
    { id: 'lessons', label: 'Dersler', kind: 'word', frame: (w) => `It is ${w.en}.`, items: [
      ['Maths', 'Matematik', '➗', 'Matematik dersi, tahtada toplama işlemi'],
      ['Science', 'Fen Bilimleri', '🔬', 'Mikroskopla deney yapan çocuk'],
      ['Life Study', 'Hayat Bilgisi', '🏡', 'Hayat bilgisi dersi, aile ve ev resmi'],
      ['English', 'İngilizce', '🔤', 'İngilizce dersi, tahtada ABC harfleri'],
      ['Turkish', 'Türkçe', '📖', 'Türkçe dersi, kitap okuyan çocuklar'],
      ['PE', 'Beden Eğitimi', '🤸', 'Beden eğitimi dersinde jimnastik yapan çocuk'],
      ['Music', 'Müzik', '🎵', 'Müzik dersinde flüt çalan çocuk'],
      ['Art', 'Görsel Sanatlar', '🎨', 'Resim dersinde boya yapan çocuk']
    ] },
    { id: 'days', label: 'Günler', kind: 'word', noPic: true, items: [
      ['Monday', 'Pazartesi', '1️⃣'], ['Tuesday', 'Salı', '2️⃣'], ['Wednesday', 'Çarşamba', '3️⃣'], ['Thursday', 'Perşembe', '4️⃣'],
      ['Friday', 'Cuma', '5️⃣'], ['Saturday', 'Cumartesi', '6️⃣'], ['Sunday', 'Pazar', '7️⃣']
    ] },
    { id: 'orders', label: 'Sınıf yönergeleri', kind: 'phrase', items: [
      ['Open your books, please!', 'Kitaplarınızı açın lütfen!', '📖', 'Kitabını açan öğrenci'],
      ['Close your books, please!', 'Kitaplarınızı kapatın lütfen!', '📕', 'Kitabını kapatan öğrenci'],
      ['Take your seat, please!', 'Yerine otur lütfen!', '🪑', 'Sırasına oturan öğrenci'],
      ['Stand up, please!', 'Ayağa kalk lütfen!', '🧍', 'Ayağa kalkan öğrenci'],
      ['Watch the video, please!', 'Videoyu izleyin lütfen!', '📺', 'Tahtada video izleyen öğrenciler'],
      ['Write your name, please!', 'Adını yaz lütfen!', '✍️', 'Defterine adını yazan öğrenci'],
      ['Come in, please!', 'İçeri gel lütfen!', '🚪', 'Kapıdan içeri giren öğrenci'],
      ['Answer the question, please!', 'Soruyu cevapla lütfen!', '🙋', 'Parmak kaldırıp cevap veren öğrenci'],
      ['Listen to me, please!', 'Beni dinleyin lütfen!', '👂', 'Öğretmenini dinleyen öğrenciler'],
      ['Be quiet, please!', 'Sessiz olun lütfen!', '🤫', 'Parmağını dudağına koyan öğretmen']
    ] },
    { id: 'weather', label: 'Hava durumu', kind: 'word', frame: (w) => `It is ${w.en}.`, items: [
      ['sunny', 'güneşli', '☀️', 'Güneşli bir gün'],
      ['rainy', 'yağmurlu', '🌧️', 'Yağmurlu bir gün, şemsiyeli çocuk'],
      ['snowy', 'karlı', '🌨️', 'Karlı bir gün, kardan adam'],
      ['cloudy', 'bulutlu', '☁️', 'Bulutlu gökyüzü'],
      ['windy', 'rüzgârlı', '🌬️', 'Rüzgârda uçan uçurtma'],
      ['stormy', 'fırtınalı', '⛈️', 'Şimşekli fırtınalı hava'],
      ['hot', 'sıcak', '🥵', 'Çok sıcak havada terleyen çocuk'],
      ['cold', 'soğuk', '🥶', 'Soğuktan üşüyen çocuk']
    ] },
    { id: 'numbers', label: 'Sayılar (20-50)', kind: 'word', noPic: true, items: [
      ['twenty', '20', '2️⃣'], ['twenty-four', '24', '2️⃣'], ['twenty-six', '26', '2️⃣'], ['thirty', '30', '3️⃣'], ['thirty-three', '33', '3️⃣'], ['thirty-seven', '37', '3️⃣'],
      ['forty', '40', '4️⃣'], ['forty-one', '41', '4️⃣'], ['forty-five', '45', '4️⃣'], ['forty-eight', '48', '4️⃣'], ['fifty', '50', '5️⃣'], ['nineteen', '19', '1️⃣']
    ] }
  ],
  qa: [
    { q: 'What is this?', a: 'It is a ruler.', w: ['They are rulers.', 'It is Monday.'], e: '📏' },
    { q: 'What are these?', a: 'They are lockers.', w: ['It is a locker.', 'It is sunny.'], e: '🗄️' },
    { q: 'What lesson is it now?', a: 'It is Science.', w: ['It is Friday.', 'It is three o’clock.'], e: '🔬' },
    { q: 'What day is it today?', a: 'It is Wednesday.', w: ['It is Maths.', 'It is rainy.'], e: '📅' },
    { q: 'What time is it?', a: "It is four o'clock.", w: ['It is Tuesday.', 'It is cloudy.'], e: '🕓' },
    { q: 'How is the weather?', a: 'It is snowy.', w: ['It is English.', 'It is a desk.'], e: '🌨️' },
    { q: 'How many pens are there on the desk?', a: 'There are three pens.', w: ['It is a pen.', 'There is a desk.'], e: '🖊️' },
    { q: 'What is on the teacher’s desk?', a: 'There is a computer.', w: ['It is Saturday.', 'It is windy.'], e: '💻' },
    { q: 'When do you have English?', a: 'On Tuesday.', w: ['In the bin.', "At nine o'clock in May."], e: '🔤' },
    { q: 'Do you have Music on Friday?', a: 'Yes, we do.', w: ['Yes, it is.', 'No, there isn’t.'], e: '🎵' },
    { q: 'Is it rainy today?', a: "No, it isn't. It is sunny.", w: ['Yes, I do.', 'No, they are not.'], e: '☀️' },
    { q: 'Where is the map?', a: 'It is on the wall.', w: ['It is Monday.', 'It is a map.'], e: '🗺️' },
    { q: 'How old is he? (twelve)', a: 'He is twelve years old.', w: ['He is twenty years old.', 'It is twelve o’clock.'], e: '🧒' },
    { q: 'Is it cold?', a: 'Yes, it is. Wear your coat.', w: ['Yes, there are.', 'No, I don’t.'], e: '🥶' }
  ],
  fill: [
    { s: 'Open your ___, please!', a: 'books', w: ['door', 'lesson'], e: '📖' },
    { s: 'Take your ___, please!', a: 'seat', w: ['name', 'video'], e: '🪑' },
    { s: 'Watch the ___, please!', a: 'video', w: ['seat', 'ruler'], e: '📺' },
    { s: 'Write your ___, please!', a: 'name', w: ['seat', 'weather'], e: '✍️' },
    { s: '___ in, please!', a: 'Come', w: ['Watch', 'Open'], e: '🚪' },
    { s: 'Answer the ___, please!', a: 'question', w: ['window', 'map'], e: '🙋' },
    { s: 'It is three o’___.', a: 'clock', w: ['day', 'lesson'], e: '🕒' },
    { s: 'There ___ two computers on the desk.', a: 'are', w: ['is', 'am'], e: '💻' },
    { s: 'There ___ a mouse on the desk.', a: 'is', w: ['are', 'am'], e: '🖱️' },
    { s: 'We have Maths ___ Monday.', a: 'on', w: ['in', 'at'], e: '➗' },
    { s: 'I go to bed at nine ___.', a: "o'clock", w: ['Monday', 'sunny'], e: '🛏️' },
    { s: 'Put the rubbish in the ___.', a: 'bin', w: ['map', 'clock'], e: '🗑️' },
    { s: 'Monday, Tuesday, ___, Thursday.', a: 'Wednesday', w: ['Friday', 'Sunday'], e: '📅' },
    { s: 'Friday, ___, Sunday.', a: 'Saturday', w: ['Monday', 'Tuesday'], e: '📅' },
    { s: 'It is ___. Take your umbrella!', a: 'rainy', w: ['sunny', 'hot'], e: '☔' },
    { s: 'It is ___. Let’s make a snowman!', a: 'snowy', w: ['windy', 'hot'], e: '⛄' },
    { s: 'We paint pictures in ___ lesson.', a: 'Art', w: ['Maths', 'English'], e: '🎨' },
    { s: 'We play games in ___ lesson.', a: 'PE', w: ['Turkish', 'Science'], e: '🤸' }
  ],
  dialog: [
    { l: ['What lesson is it now?', '___'], a: 'It is English.', w: ['It is Monday.', 'It is cold.'] },
    { l: ['___', "It is ten o'clock."], a: 'What time is it?', w: ['What day is it?', 'How is the weather?'] },
    { l: ['___', 'It is windy.'], a: 'How is the weather?', w: ['What lesson is it?', 'What is this?'] },
    { l: ['Can I come in?', '___'], a: 'Yes, come in, please!', w: ['It is a door.', 'Good night!'] },
    { l: ['What are these?', '___'], a: 'They are paintbrushes.', w: ['It is a paintbrush.', 'It is Art.'] },
    { l: ['___', 'It is Friday.'], a: 'What day is it today?', w: ['What time is it?', 'How many days?'] },
    { l: ['How many rulers are there?', '___'], a: 'There are four rulers.', w: ['It is a ruler.', 'It is four o’clock.'] },
    { l: ['Is it a mouse?', '___'], a: 'No, it isn’t. It is a keyboard.', w: ['Yes, they are.', 'No, I am not.'] }
  ],
  order: ['Open your books, please!', 'It is five o’clock.', 'We have English on Tuesday.', 'There is a map on the wall.', 'How is the weather today?', 'It is cold and snowy.', 'What lesson is it now?', 'There are two lockers in the classroom.', 'Take your seat, please!', 'They are my coursebooks.', 'Today is Thursday.', 'Watch the video, please!'],
  read: [
    { t: "Hi! I am Mert. This is my classroom. There is a big board and a map on the wall. There are twenty desks. My school bag is blue. Today is Tuesday. It is ten o'clock. We have English now. It is sunny today.",
      qs: [{ q: 'What day is it today?', a: 'Tuesday.', w: ['Monday.', 'Friday.'] }, { q: 'What lesson is it now?', a: 'English.', w: ['Maths.', 'Music.'] }, { q: 'What colour is his school bag?', a: 'Blue.', w: ['Red.', 'Green.'] }, { q: 'How many desks are there?', a: 'Twenty.', w: ['Ten.', 'Thirty.'] }, { q: 'How is the weather?', a: 'It is sunny.', w: ['It is rainy.', 'It is snowy.'] }] },
    { t: 'Our timetable: On Monday we have Maths and Turkish. On Wednesday we have Science and Art. On Friday we have Music and PE. I love Art! I paint pictures with my paintbrush.',
      qs: [{ q: 'When do they have Science?', a: 'On Wednesday.', w: ['On Monday.', 'On Friday.'] }, { q: 'What do they have on Friday?', a: 'Music and PE.', w: ['Maths and Turkish.', 'Science and Art.'] }, { q: 'What does the child love?', a: 'Art.', w: ['PE.', 'Maths.'] }] }
  ]
};

export const U3 = {
  id: 'u3', no: 3, title: 'Personal Life', tr: 'Kişisel Hayat', color: 'violet',
  // np: yedek emoji resmi yanıltıcı -> resimli soruda kullanılmaz (gerçek görsel yüklenince de yazılı sorularda kalır)
  np: ['skirt', 'chin', 'back', 'neck', 'eyelash', 'eyebrow', 'short', 'fat', 'thin', 'ugly', 'beautiful', 'hardworking', 'lazy', 'handsome', 'tall', 'small ears', 'jacket', 'uniform', 'jumper', 'trousers'],
  sets: [
    { id: 'body', label: 'Vücudumuz ve yüzümüz', art: false, frame: (w) => (w.en === 'teeth' ? 'These are my teeth.' : `This is my ${w.en}.`), items: [
      ['hair', 'saç', '💇', 'Saçını gösteren çocuk'],
      ['eye', 'göz', '👁️', 'Bir göz'],
      ['ear', 'kulak', '👂', 'Bir kulak'],
      ['nose', 'burun', '👃', 'Bir burun'],
      ['mouth', 'ağız', '👄', 'Gülümseyen ağız'],
      ['teeth', 'dişler', '🦷', 'Beyaz dişler'],
      ['eyebrow', 'kaş', '🤨', 'Kaşını kaldıran çocuk'],
      ['eyelash', 'kirpik', '👀', 'Uzun kirpikli gözler'],
      ['chin', 'çene', '🧔', 'Çenesini gösteren çocuk'],
      ['neck', 'boyun', '🦒', 'Boynunu gösteren çocuk'],
      ['arm', 'kol', '💪', 'Kolunu gösteren çocuk'],
      ['hand', 'el', '✋', 'Açık bir el'],
      ['leg', 'bacak', '🦵', 'Bir bacak'],
      ['foot', 'ayak', '🦶', 'Bir ayak'],
      ['back', 'sırt', '🎒', 'Sırtını gösteren çocuk']
    ] },
    { id: 'adj', label: 'Görünüş ve kişilik', kind: 'word', frame: (w) => `He is ${w.en}.`, items: [
      ['tall', 'uzun boylu', '🦒', 'Uzun boylu bir adam'],
      ['short', 'kısa boylu', '🐭', 'Kısa boylu bir çocuk'],
      ['fat', 'şişman', '🐘', 'Şişman, sevimli bir kedi'],
      ['thin', 'zayıf', '🦩', 'Zayıf bir çocuk'],
      ['young', 'genç', '👶', 'Genç bir kız'],
      ['old', 'yaşlı', '👴', 'Bastonlu yaşlı bir adam'],
      ['strong', 'güçlü', '🏋️', 'Ağırlık kaldıran güçlü adam'],
      ['happy', 'mutlu', '😀', 'Gülen mutlu çocuk'],
      ['sad', 'üzgün', '😢', 'Ağlayan üzgün çocuk'],
      ['beautiful', 'güzel', '🌹', 'Güzel bir prenses'],
      ['ugly', 'çirkin', '👹', 'Çirkin bir canavar (çizgi film)'],
      ['hardworking', 'çalışkan', '📚', 'Ders çalışan çalışkan çocuk'],
      ['lazy', 'tembel', '🛋️', 'Kanepede uzanan tembel çocuk'],
      ['handsome', 'yakışıklı', '🤵', 'Takım elbiseli yakışıklı adam']
    ] },
    { id: 'hair', label: 'Saç ve yüz özellikleri', kind: 'phrase', frame: (w) => `She has got ${w.en}.`, items: [
      ['curly hair', 'kıvırcık saç', '👩‍🦱', 'Kıvırcık saçlı kız'],
      ['straight hair', 'düz saç', '👩', 'Düz saçlı kız'],
      ['long hair', 'uzun saç', '👸', 'Uzun saçlı kız'],
      ['short hair', 'kısa saç', '👦', 'Kısa saçlı erkek çocuk'],
      ['blond hair', 'sarı saç', '👱', 'Sarı saçlı çocuk'],
      ['dark hair', 'koyu renk saç', '🧑', 'Siyah saçlı çocuk'],
      ['big eyes', 'büyük gözler', '🥺', 'Kocaman gözlü çocuk'],
      ['small ears', 'küçük kulaklar', '🐹', 'Küçük kulaklı hamster'],
      ['red hair', 'kızıl saç', '👩‍🦰', 'Kızıl saçlı kız']
    ] },
    { id: 'clothes', label: 'Giysiler', art: true, frame: (w) => `She is wearing ${w.a2}.`, items: [
      ['T-shirt', 'tişört', '👕', 'Kısa kollu tişört'],
      ['shirt', 'gömlek', '👔', 'Düğmeli gömlek'],
      ['trousers', 'pantolon', '👖', 'Pantolon', 'pl'],
      ['jeans', 'kot pantolon', '👖', 'Mavi kot pantolon', 'pl'],
      ['skirt', 'etek', '🩱', 'Pembe etek'],
      ['dress', 'elbise', '👗', 'Elbise'],
      ['coat', 'palto', '🧥', 'Kışlık palto'],
      ['jacket', 'ceket', '🥼', 'Ceket'],
      ['jumper', 'kazak', '🧶', 'Yün kazak'],
      ['socks', 'çorap', '🧦', 'Bir çift çorap', 'pl'],
      ['shoes', 'ayakkabı', '👟', 'Bir çift spor ayakkabı', 'pl'],
      ['boots', 'çizme', '👢', 'Bir çift çizme', 'pl'],
      ['scarf', 'atkı', '🧣', 'Kırmızı atkı'],
      ['hat', 'şapka', '👒', 'Hasır şapka'],
      ['cap', 'kasket', '🧢', 'Mavi kasket'],
      ['gloves', 'eldiven', '🧤', 'Bir çift eldiven', 'pl'],
      ['sunglasses', 'güneş gözlüğü', '🕶️', 'Güneş gözlüğü', 'pl'],
      ['uniform', 'okul forması', '🎽', 'Okul forması']
    ] },
    { id: 'expr', label: 'Günlük ifadeler', kind: 'phrase', items: [
      ['Thank you so much!', 'Çok teşekkür ederim!', '🙏', 'Hediye alıp teşekkür eden çocuk'],
      ['Anytime!', 'Ne zaman istersen! (Rica ederim)', '😊', 'Gülümseyerek yardım eden çocuk'],
      ["I'm so excited!", 'Çok heyecanlıyım!', '🤩', 'Heyecanla zıplayan çocuk'],
      ['Calm down!', 'Sakin ol!', '😌', 'Arkadaşını sakinleştiren çocuk'],
      ["I'm late!", 'Geç kaldım!', '⏰', 'Saate bakıp koşan çocuk'],
      ['Be careful!', 'Dikkatli ol!', '⚠️', 'Islak zeminde dikkatli yürüyen çocuk'],
      ['You look great!', 'Harika görünüyorsun!', '😍', 'Yeni elbisesini gösteren kız'],
      ['It sounds great!', 'Kulağa harika geliyor!', '👍', 'Parmak kaldıran çocuk']
    ] },
    { id: 'colours', label: 'Renkler', kind: 'word', noPic: true, items: [
      ['red', 'kırmızı', '🟥'], ['blue', 'mavi', '🟦'], ['green', 'yeşil', '🟩'], ['yellow', 'sarı', '🟨'], ['orange', 'turuncu', '🟧'],
      ['purple', 'mor', '🟪'], ['pink', 'pembe', '🌸'], ['brown', 'kahverengi', '🟫'], ['black', 'siyah', '⬛'], ['white', 'beyaz', '⬜'], ['grey', 'gri', '🐘']
    ] }
  ],
  qa: [
    { q: 'What does your brother look like?', a: 'He is tall and strong.', w: ['He is wearing a coat.', 'He has got a cat.'], e: '🧍' },
    { q: 'What is your sister’s hair like?', a: 'She has got long curly hair.', w: ['She is happy.', 'She is wearing a hat.'], e: '👩‍🦱' },
    { q: 'What colour eyes has he got?', a: 'He has got brown eyes.', w: ['He has got a brown coat.', 'He is brown.'], e: '👁️' },
    { q: 'Have you got straight hair?', a: 'Yes, I have.', w: ['Yes, I am.', 'Yes, it is.'], e: '👩' },
    { q: 'Has your mother got curly hair?', a: "No, she hasn't.", w: ['No, she isn’t.', 'No, I don’t.'], e: '👩' },
    { q: 'What are you wearing today?', a: 'I am wearing a red T-shirt.', w: ['I have got red hair.', 'It is red.'], e: '👕' },
    { q: 'What is Mert wearing?', a: 'He is wearing blue jeans.', w: ['He is tall.', 'He has got blue eyes.'], e: '👖' },
    { q: 'Whose scarf is this?', a: "It is my sister's scarf.", w: ['It is cold.', 'She is my sister.'], e: '🧣' },
    { q: 'What do you wear in winter?', a: 'I wear a coat and boots.', w: ['I wear sunglasses and shorts.', 'I am cold.'], e: '❄️' },
    { q: 'What do you wear at school?', a: 'I wear my uniform.', w: ['I wear my pyjamas.', 'I am a pupil.'], e: '🎽' },
    { q: 'Is she wearing a dress?', a: 'Yes, she is.', w: ['Yes, she has.', 'Yes, I do.'], e: '👗' },
    { q: 'Are you happy?', a: 'Yes, I am.', w: ['Yes, I have.', 'Yes, it is.'], e: '😀' },
    { q: 'Is your grandfather young?', a: 'No, he isn’t. He is old.', w: ['Yes, he has.', 'No, he hasn’t got.'], e: '👴' },
    { q: 'Thank you for your help!', a: 'Anytime!', w: ['I’m late!', 'Calm down!'], e: '🙏' }
  ],
  fill: [
    { s: 'She ___ got long hair.', a: 'has', w: ['have', 'is'], e: '👸' },
    { s: 'I ___ got big eyes.', a: 'have', w: ['has', 'am'], e: '🥺' },
    { s: 'He is ___ a green T-shirt.', a: 'wearing', w: ['wear', 'has'], e: '👕' },
    { s: 'My grandmother is ___. She is seventy.', a: 'old', w: ['young', 'short'], e: '👵' },
    { s: 'The giraffe has got a long ___.', a: 'neck', w: ['nose', 'ear'], e: '🦒' },
    { s: 'I see with my ___.', a: 'eyes', w: ['ears', 'legs'], e: '👁️' },
    { s: 'I hear with my ___.', a: 'ears', w: ['eyes', 'hands'], e: '👂' },
    { s: 'I brush my ___ every morning.', a: 'teeth', w: ['legs', 'neck'], e: '🦷' },
    { s: 'It is snowy. Wear your ___!', a: 'boots', w: ['sunglasses', 'T-shirt'], e: '🌨️' },
    { s: 'It is sunny. Wear your ___!', a: 'sunglasses', w: ['gloves', 'scarf'], e: '☀️' },
    { s: 'He studies every day. He is ___.', a: 'hardworking', w: ['lazy', 'ugly'], e: '📚' },
    { s: 'She is crying. She is ___.', a: 'sad', w: ['happy', 'strong'], e: '😢' },
    { s: 'Be ___! The floor is wet.', a: 'careful', w: ['late', 'excited'], e: '⚠️' },
    { s: 'Oh no! It is nine o’clock. I’m ___!', a: 'late', w: ['great', 'careful'], e: '⏰' },
    { s: 'Whose ___ are these? They are Duru’s jeans.', a: 'jeans', w: ['jean', 'skirt'], e: '👖' }
  ],
  dialog: [
    { l: ['Look at my new dress!', '___'], a: 'You look great!', w: ['I’m late!', 'Calm down!'] },
    { l: ['Thanks for your help!', '___'], a: 'Anytime!', w: ['Be careful!', 'Good night!'] },
    { l: ['We have a trip tomorrow!', '___'], a: "I'm so excited!", w: ['I’m late!', 'You look sad!'] },
    { l: ['___', 'He has got short dark hair.'], a: 'What is his hair like?', w: ['What is he wearing?', 'How old is he?'] },
    { l: ['___', 'She is wearing a pink skirt.'], a: 'What is she wearing?', w: ['What does she look like?', 'Who is she?'] },
    { l: ['___', 'They are Can’s shoes.'], a: 'Whose shoes are these?', w: ['What are you wearing?', 'Where are the shoes?'] },
    { l: ['Let’s go to the park!', '___'], a: 'It sounds great!', w: ['Calm down!', 'You look great!'] },
    { l: ['I am very angry!', '___'], a: 'Calm down!', w: ['Anytime!', 'It sounds great!'] }
  ],
  order: ['She has got long curly hair.', 'He is wearing a blue jacket.', 'My brother is tall and strong.', 'I have got big brown eyes.', 'What is your sister wearing?', 'Whose scarf is this?', 'I wear a coat in winter.', 'My grandmother is old and kind.', 'He has got short blond hair.', 'They are my new shoes.'],
  read: [
    { t: 'This is my best friend, Zeynep. She is nine years old. She is tall and thin. She has got long straight hair and big green eyes. Today she is wearing a yellow dress and white shoes. She is very hardworking.',
      qs: [{ q: 'Is Zeynep short?', a: 'No, she is tall.', w: ['Yes, she is.', 'Yes, she has.'] }, { q: 'What is her hair like?', a: 'Long and straight.', w: ['Short and curly.', 'Short and red.'] }, { q: 'What colour are her eyes?', a: 'Green.', w: ['Brown.', 'Blue.'] }, { q: 'What is she wearing?', a: 'A yellow dress.', w: ['A red coat.', 'Blue jeans.'] }] },
    { t: 'It is winter. It is cold and snowy. Ali is wearing a thick coat, a red scarf and black boots. His little sister Ela is wearing a pink hat and gloves. They are making a snowman. They are very happy.',
      qs: [{ q: 'How is the weather?', a: 'Cold and snowy.', w: ['Hot and sunny.', 'Warm and windy.'] }, { q: 'What colour is Ali’s scarf?', a: 'Red.', w: ['Pink.', 'Black.'] }, { q: 'What are they making?', a: 'A snowman.', w: ['A cake.', 'A dress.'] }, { q: 'How do they feel?', a: 'Happy.', w: ['Sad.', 'Lazy.'] }] }
  ]
};
