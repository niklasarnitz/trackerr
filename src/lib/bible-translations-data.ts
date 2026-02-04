export type BibleTranslation = {
  id: string;
  name: string;
  language: "de" | "en" | "ancient";
};

export const GERMAN_TRANSLATIONS: BibleTranslation[] = [
  {
    id: "LUTHER_1912",
    name: "Luther 1912 (LU12)",
    language: "de",
  },
  {
    id: "LUTHER_1984",
    name: "Luther 1984 (LU84)",
    language: "de",
  },
  {
    id: "LUTHER_2017",
    name: "Luther 2017 (LU17)",
    language: "de",
  },
  {
    id: "LUTHER_21",
    name: "Luther 21 (L21)",
    language: "de",
  },
  {
    id: "NEUE_GENFER",
    name: "Neue Genfer Übersetzung (NGÜ)",
    language: "de",
  },
  {
    id: "NEUE_EVANGELISTISCHE",
    name: "Neue Evangelistische Übersetzung (NeÜ)",
    language: "de",
  },
  {
    id: "EINHEITSÜBERSETZUNG",
    name: "Einheitsübersetzung (EU)",
    language: "de",
  },
  {
    id: "ELBERFELDER",
    name: "Elberfelder (ELB)",
    language: "de",
  },
  {
    id: "GUTE_NACHRICHT",
    name: "Gute Nachricht Bibel (GNB)",
    language: "de",
  },
  {
    id: "HOFFNUNG_FUER_ALLE",
    name: "Hoffnung für Alle (HFA)",
    language: "de",
  },
  {
    id: "MENGE_BIBEL",
    name: "Menge Bibel (MEN)",
    language: "de",
  },
  {
    id: "NEUES_LEBEN",
    name: "Neues Leben (NLB)",
    language: "de",
  },
  {
    id: "SCHLACHTER_2000",
    name: "Schlachter 2000 (SLT)",
    language: "de",
  },
  {
    id: "ZUERICHER_BIBEL",
    name: "Züricher Bibel (ZB)",
    language: "de",
  },
  {
    id: "BASIS_BIBEL",
    name: "BasisBibel (BB)",
    language: "de",
  },
];

export const ENGLISH_TRANSLATIONS: BibleTranslation[] = [
  {
    id: "KJV",
    name: "King James Version (KJV)",
    language: "en",
  },
  {
    id: "NKJV",
    name: "New King James Version (NKJV)",
    language: "en",
  },
  {
    id: "NASB",
    name: "New American Standard Bible (NASB)",
    language: "en",
  },
  {
    id: "NASB_1995",
    name: "New American Standard Bible 1995 (NASB95)",
    language: "en",
  },
  {
    id: "ESV",
    name: "English Standard Version (ESV)",
    language: "en",
  },
  {
    id: "NIV",
    name: "New International Version (NIV)",
    language: "en",
  },
  {
    id: "NLT",
    name: "New Living Translation (NLT)",
    language: "en",
  },
  {
    id: "THE_MESSAGE",
    name: "The Message (MSG)",
    language: "en",
  },
  {
    id: "NIRV",
    name: "New International Reader's Version (NIrV)",
    language: "en",
  },
  {
    id: "ASV",
    name: "American Standard Version (ASV)",
    language: "en",
  },
  {
    id: "BSB",
    name: "Berean Standard Bible (BSB)",
    language: "en",
  },
  {
    id: "RSV",
    name: "Revised Standard Version (RSV)",
    language: "en",
  },
  {
    id: "LSB",
    name: "Legacy Standard Bible (LSB)",
    language: "en",
  },
];

export const ANCIENT_TRANSLATIONS: BibleTranslation[] = [
  {
    id: "BHS",
    name: "Biblia Hebraica Stuttgartensia (BHS)",
    language: "ancient",
  },
  {
    id: "NA28",
    name: "Novum Testamentum Graece (NA28)",
    language: "ancient",
  },
  {
    id: "LXX",
    name: "Septuaginta (LXX)",
    language: "ancient",
  },
  {
    id: "VUL",
    name: "Biblia Sacra Vulgata (VUL)",
    language: "ancient",
  },
];

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  ...GERMAN_TRANSLATIONS,
  ...ENGLISH_TRANSLATIONS,
  ...ANCIENT_TRANSLATIONS,
];
