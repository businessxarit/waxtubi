// Duas (invocations) du quotidien — Waxtubi.
//
// Sources : invocations largement attestées dans les recueils de hadiths
// authentiques (notamment Sahih al-Bukhari, Sahih Muslim, Abu Dawud) et
// largement reprises dans les compilations de référence comme Hisnul
// Muslim (Sa'id ibn Ali ibn Wahf al-Qahtani). Texte arabe reproduit tel
// quel (texte religieux source, pas une œuvre sous droit d'auteur) ;
// traductions françaises rédigées pour Waxtubi, pas copiées d'un ouvrage
// existant. À visée d'étude et de pratique quotidienne, pas un avis
// savant (fatwa).
export const DUA_CATEGORIES = [
  {
    id: "reveil",
    label: "Réveil",
    icon: "🌅",
    duas: [
      {
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        transliteration: "Al-hamdu lillahi-l-ladhi ahyana ba'da ma amatana wa ilayhi-n-nushur",
        translation: "Louange à Allah qui nous a redonné la vie après nous avoir fait mourir (le sommeil), et c'est vers Lui que sera le retour.",
        source: "Rapporté par Al-Bukhari",
      },
    ],
  },
  {
    id: "sommeil",
    label: "Sommeil",
    icon: "🌙",
    duas: [
      {
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya",
        translation: "C'est en Ton nom, ô Allah, que je meurs (m'endors) et que je vis (me réveille).",
        source: "Rapporté par Al-Bukhari",
      },
      {
        arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak",
        translation: "Ô Allah, protège-moi de Ton châtiment le jour où Tu ressusciteras Tes serviteurs.",
        source: "Rapporté par Abu Dawud",
      },
    ],
  },
  {
    id: "repas",
    label: "Repas",
    icon: "🍽️",
    duas: [
      {
        arabic: "بِسْمِ اللَّهِ",
        transliteration: "Bismillah",
        translation: "Au nom d'Allah.",
        source: "Avant de manger — rapporté par Muslim",
      },
      {
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        transliteration: "Al-hamdu lillahi-l-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
        translation: "Louange à Allah qui m'a nourri de ceci et me l'a accordé sans que j'y aie aucun pouvoir ni force.",
        source: "Après avoir mangé — rapporté par At-Tirmidhi",
      },
    ],
  },
  {
    id: "maison",
    label: "Entrer / sortir de la maison",
    icon: "🏠",
    duas: [
      {
        arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا",
        transliteration: "Bismillahi walajna wa bismillahi kharajna wa 'ala Rabbina tawakkalna",
        translation: "Au nom d'Allah nous entrons, au nom d'Allah nous sortons, et c'est en notre Seigneur que nous plaçons notre confiance.",
        source: "En entrant à la maison — rapporté par Abu Dawud",
      },
      {
        arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "Bismillahi tawakkaltu 'ala Allahi wa la hawla wa la quwwata illa billah",
        translation: "Au nom d'Allah, je place ma confiance en Allah ; il n'y a de force et de puissance qu'en Allah.",
        source: "En sortant de la maison — rapporté par Abu Dawud et At-Tirmidhi",
      },
    ],
  },
  {
    id: "voyage",
    label: "Voyage",
    icon: "🧳",
    duas: [
      {
        arabic: "اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        transliteration: "Allahu akbar, Allahu akbar, Allahu akbar. Subhana-l-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun",
        translation: "Allah est le plus Grand (trois fois). Gloire à Celui qui a mis ceci à notre service, nous qui n'en étions pas capables par nous-mêmes ; et c'est vers notre Seigneur que nous retournerons.",
        source: "Rapporté par Muslim",
      },
    ],
  },
  {
    id: "matin",
    label: "Matin",
    icon: "☀️",
    duas: [
      {
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
        transliteration: "Asbahna wa asbaha-l-mulku lillah, wal-hamdu lillah, la ilaha illa Allahu wahdahu la sharika lah",
        translation: "Nous voici au matin, et le royaume tout entier appartient à Allah ; louange à Allah, nulle divinité sauf Allah, Unique, sans associé.",
        source: "Rapporté par Muslim",
      },
    ],
  },
  {
    id: "soir",
    label: "Soir",
    icon: "🌆",
    duas: [
      {
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
        transliteration: "Amsayna wa amsa-l-mulku lillah, wal-hamdu lillah, la ilaha illa Allahu wahdahu la sharika lah",
        translation: "Nous voici au soir, et le royaume tout entier appartient à Allah ; louange à Allah, nulle divinité sauf Allah, Unique, sans associé.",
        source: "Rapporté par Muslim",
      },
    ],
  },
];
