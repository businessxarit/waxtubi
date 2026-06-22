// Chronologie de la vie du Prophète Muhammad (ﷺ) — Sira.
//
// Sources : faits factuels (dates, lieux, déroulement des événements)
// largement reconnus et concordants entre les biographies islamiques
// classiques (notamment la Sira d'Ibn Ishaq/Ibn Hisham) et les travaux
// historiques qui s'y appuient. Les dates avant l'Hégire sont
// approximatives, comme c'est le cas dans toute la littérature sur le
// sujet. Texte rédigé pour Waxtubi ; à des fins d'étude générale,
// pas comme une fatwa ou un avis savant.
export const SIRA_TIMELINE = [
  {
    year: "≈ 570",
    title: "Naissance à la Mecque",
    text: "Naissance du Prophète Muhammad (ﷺ) à la Mecque, dans le clan des Banu Hashim, au sein de la tribu de Quraysh. Son père Abdullah meurt avant sa naissance ; sa mère Amina meurt alors qu'il a environ six ans. Il est ensuite élevé par son grand-père Abd al-Muttalib, puis par son oncle Abu Talib.",
  },
  {
    year: "≈ 595",
    title: "Mariage avec Khadija",
    text: "Il épouse Khadija bint Khuwaylid, une marchande respectée de la Mecque. Elle sera la première personne à croire en sa mission prophétique.",
  },
  {
    year: "610",
    title: "Première révélation",
    text: "À l'âge d'environ 40 ans, alors qu'il se retire dans la grotte de Hira près de la Mecque, il reçoit la première révélation du Coran par l'intermédiaire de l'ange Jibril (Gabriel). Les premiers versets révélés font partie de la sourate Al-Alaq.",
  },
  {
    year: "613",
    title: "Prédication publique",
    text: "Après environ trois années d'appel discret auprès de son entourage proche, il commence à prêcher publiquement le message de l'islam à la Mecque.",
  },
  {
    year: "615-616",
    title: "Émigration vers l'Abyssinie",
    text: "Face à la persécution croissante des notables de la Mecque, un groupe de musulmans émigre vers l'Abyssinie (actuelle Éthiopie/Érythrée), où le souverain chrétien leur accorde sa protection.",
  },
  {
    year: "619",
    title: "L'année de la tristesse",
    text: "Khadija, son épouse, et Abu Talib, son oncle protecteur, meurent la même année — une période particulièrement douloureuse, connue comme « l'année de la tristesse » (Aam al-Huzn).",
  },
  {
    year: "622",
    title: "L'Hégire (Hijra)",
    text: "Face à l'intensification des menaces à la Mecque, le Prophète (ﷺ) et ses compagnons émigrent vers Yathrib, rebaptisée Médine. Cette migration marque le point de départ du calendrier hégirien (musulman).",
  },
  {
    year: "624",
    title: "Bataille de Badr",
    text: "Première grande bataille entre les musulmans de Médine et les forces de la Mecque. Malgré leur net désavantage numérique, les musulmans l'emportent — un événement marquant des débuts de l'islam.",
  },
  {
    year: "625",
    title: "Bataille de Uhud",
    text: "Affrontement avec les forces mecquoises où les musulmans, après un avantage initial, subissent des pertes importantes suite à un repli tactique non respecté.",
  },
  {
    year: "627",
    title: "Bataille de la Tranchée (Khandaq)",
    text: "Une coalition de tribus assiège Médine. Les musulmans creusent une tranchée défensive, contribuant à un long siège qui se termine par le retrait des assaillants.",
  },
  {
    year: "628",
    title: "Traité de Hudaybiyya",
    text: "Un accord de paix temporaire est signé entre les musulmans et les Quraysh de la Mecque, après une tentative de pèlerinage empêchée d'entrer dans la ville.",
  },
  {
    year: "630",
    title: "Conquête de la Mecque",
    text: "Après la rupture du traité par les Quraysh, le Prophète (ﷺ) marche sur la Mecque avec un grand nombre de compagnons. La ville se rend sans véritable combat ; les idoles de la Kaaba sont retirées.",
  },
  {
    year: "632",
    title: "Pèlerinage d'adieu et décès",
    text: "Le Prophète (ﷺ) accomplit son unique grand pèlerinage, durant lequel il prononce un sermon resté célèbre, insistant sur l'égalité entre les croyants. Il décède peu après à Médine, où il est enterré.",
  },
];

/**
 * Fiches biographiques des Sahabas (compagnons) les plus connus.
 * Note de neutralité : le statut respectif des trois premiers califes
 * (Abu Bakr, Umar, Uthman) fait l'objet d'un désaccord de fond entre
 * traditions sunnite et chiite — désaccord non tranché ici. Les fiches
 * se limitent aux faits biographiques largement admis.
 */
export const SAHABA_PROFILES = [
  {
    id: "abubakr",
    name: "Abu Bakr",
    arabic: "أبو بكر الصديق",
    title: "Premier calife (632-634)",
    text: "Proche compagnon et beau-père du Prophète (ﷺ) par le mariage de sa fille Aisha. Surnommé « As-Siddiq » (le véridique) pour avoir cru sans hésiter au récit du voyage nocturne du Prophète. Devient le premier calife après la mort du Prophète et œuvre à maintenir l'unité de la communauté naissante.",
  },
  {
    id: "umar",
    name: "Umar ibn al-Khattab",
    arabic: "عمر بن الخطاب",
    title: "Deuxième calife (634-644)",
    text: "Connu pour sa rigueur et son sens de la justice. Sous son califat, le territoire sous administration musulmane connaît une expansion rapide, incluant Jérusalem et Damas. Il meurt assassiné en 644.",
  },
  {
    id: "uthman",
    name: "Uthman ibn Affan",
    arabic: "عثمان بن عفان",
    title: "Troisième calife (644-656)",
    text: "Marié à deux filles du Prophète, ce qui lui vaut le surnom de « Dhu al-Nurayn » (celui aux deux lumières). Son califat est marqué par la compilation d'une version écrite unifiée du Coran. Il meurt assassiné en 656.",
  },
  {
    id: "ali",
    name: "Ali ibn Abi Talib",
    arabic: "علي بن أبي طالب",
    title: "Quatrième calife (656-661)",
    text: "Cousin du Prophète, qu'il rejoint dès son plus jeune âge, et son gendre par le mariage avec Fatima. Reconnu pour son courage et sa connaissance religieuse. Son califat est marqué par des tensions internes à la communauté musulmane.",
  },
  {
    id: "khadija",
    name: "Khadija bint Khuwaylid",
    arabic: "خديجة بنت خويلد",
    title: "Première épouse du Prophète",
    text: "Marchande respectée de la Mecque, elle épouse le Prophète (ﷺ) avant le début de sa mission. Première personne à croire en sa prophétie, elle le soutient financièrement et moralement durant les années difficiles du début de la prédication.",
  },
  {
    id: "aisha",
    name: "Aisha bint Abi Bakr",
    arabic: "عائشة بنت أبي بكر",
    title: "Épouse du Prophète, fille d'Abu Bakr",
    text: "Connue pour sa mémoire et sa contribution à la transmission de nombreux récits (hadiths) sur la vie du Prophète après son décès. Elle joue un rôle notable dans les débuts de l'histoire islamique.",
  },
  {
    id: "bilal",
    name: "Bilal ibn Rabah",
    arabic: "بلال بن رباح",
    title: "Premier muezzin de l'islam",
    text: "Ancien esclave affranchi grâce à l'intervention d'Abu Bakr après avoir subi des persécutions pour sa foi. Il devient le premier muezzin (celui qui appelle à la prière) de l'histoire de l'islam.",
  },
];
