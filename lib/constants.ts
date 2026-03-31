export interface WordEntry {
  text: string
  imageUrl?: string
}

export interface WordCategory {
  id: string
  label: string
  hint: string
  words: (string | WordEntry)[]
}

/** Normalise a word entry — string or object — to { text, imageUrl } */
export function resolveWord(word: string | WordEntry): WordEntry {
  return typeof word === 'string' ? { text: word } : word
}

export const WORD_CATEGORIES: WordCategory[] = [
  {
    id: "malayalam_movies",
    label: "Malayalam Movies",
    hint: "Think about a popular film from the Kerala film industry.",
    words: [
      "Manichitrathazhu",
      "Drishyam",
      "Premam",
      "Lucifer",
      "Kireedam",
      "Bangalore Days",
      "Kumbalangi Nights",
      "Minnal Murali",
      "Spadikam",
      "Manjummel Boys",
    ],
  },
  {
    id: "malayalam_essentials",
    label: "Malayalam Essentials",
    hint: "ഒരു സാധാരണ മലയാളി സംസാരത്തിൽ സ്ഥിരമായി കടന്നുവരാറുള്ള കാര്യങ്ങൾ.",
    words: [
      "ചായ",
      "ബസ്",
      "മഴ",
      "കട",
      "കറന്റ്",
      "ഫോൺ",
      "സിനിമ",
      "പത്രം",
      "കുട",
      "വണ്ടി",
    ],
  },
  {
    id: "kerala_common",
    label: "Kerala Common",
    hint: "കേരളത്തെയും മലയാളികളെയും ഓർമ്മിപ്പിക്കുന്ന സാധാരണമായ കാര്യങ്ങൾ.",
    words: [
      "തെങ്ങ്",
      "തോണി",
      "മീൻകറി",
      "കായൽ",
      "മുണ്ടി",
      "സദ്യ",
      "ഓണം",
      "പെരുന്നാൾ",
      "പുഴ",
      "നാട്",
    ],
  },
  {
    id: "fruits",
    label: "Fruits",
    hint: "മരങ്ങളിലോ വള്ളികളിലോ വളരുന്ന മധുരമുള്ള ഭക്ഷണങ്ങളെക്കുറിച്ച് ചിന്തിക്കുക.",
    words: [
      "ആപ്പിൾ",
      "മാങ്ങ",
      "വാഴപ്പഴം",
      "സ്ട്രോബെറി",
      "കൈതച്ചക്ക",
      "തണ്ണിമത്തൻ",
      "മുന്തിരി",
      "പീച്ച്",
      "ചെറി",
      "കിവി",
    ],
  },
  {
    id: "animals",
    label: "Animals",
    hint: "പ്രകൃതിയിൽ കാണപ്പെടുന്നതോ വീട്ടിൽ വളർത്തുന്നതോ ആയ ജീവികളെക്കുറിച്ച് ചിന്തിക്കുക.",
    words: [
      "ആന",
      "കടുവ",
      "ഡോൾഫിൻ",
      "കഴുകൻ",
      "പെൻഗ്വിൻ",
      "ചെന്നായ",
      "ജിറാഫ്",
      "സ്രാവ്",
      "പാണ്ട",
      "കുറുക്കൻ",
    ],
  },
  {
    id: "countries",
    label: "Countries",
    hint: "ലോക ഭൂപടത്തിലെ ഏതെങ്കിലും ഒരു രാജ്യത്തെക്കുറിച്ച് ചിന്തിക്കുക.",
    words: [
      "ബ്രസീൽ",
      "ജപ്പാൻ",
      "ഈജിപ്ത്",
      "കാനഡ",
      "ഓസ്‌ട്രേലിയ",
      "നോർവേ",
      "മെക്സിക്കോ",
      "ഇന്ത്യ",
      "ഘാന",
      "അർജന്റീന",
    ],
  },
  {
    id: "sports",
    label: "Sports",
    hint: "മത്സരബുദ്ധിയോടെയുള്ള ശാരീരിക പ്രവർത്തനങ്ങളെക്കുറിച്ചോ കളികളെക്കുറിച്ചോ ചിന്തിക്കുക.",
    words: [
      "ബാസ്കറ്റ്ബോൾ",
      "ടെന്നീസ്",
      "നീന്തൽ",
      "ഫുട്ബോൾ",
      "വോളിബോൾ",
      "ബോക്സിംഗ്",
      "സൈക്ലിംഗ്",
      "സ്കീയിംഗ്",
      "അമ്പെയ്ത്ത്",
      "ഫെൻസിങ്",
    ],
  },
  {
    id: "occupations",
    label: "Occupations",
    hint: "ഒരാൾ ചെയ്യുന്ന ജോലിയെക്കുറിച്ചോ തൊഴിലിനെക്കുറിച്ചോ ചിന്തിക്കുക.",
    words: [
      "ഡോക്ടർ",
      "പൈലറ്റ്",
      "ഷെഫ്",
      "ആർക്കിടെക്റ്റ്",
      "ഡിറ്റക്ടീവ്",
      "ബഹിരാകാശയാത്രികൻ",
      "മെക്കാനിക്",
      "ലൈബ്രേറിയൻ",
      "ജേണലിസ്റ്റ്",
      "സർജൻ",
    ],
  },
  {
    id: "places",
    label: "Places",
    hint: "ഒരു പ്രത്യേക സ്ഥലത്തെക്കുറിച്ചോ വേദിയെക്കുറിച്ചോ ചിന്തിക്കുക.",
    words: [
      "കടൽതീരം",
      "മ്യൂസിയം",
      "വിമാനത്താവളം",
      "ലൈബ്രറി",
      "ആശുപത്രി",
      "സ്റ്റേഡിയം",
      "ഫാക്ടറി",
      "ലൈറ്റ് ഹൗസ്",
      "അഗ്നിപർവ്വതം",
      "സബ്‌മറൈൻ",
    ],
  },
];

export function getCategoryById(id: string): WordCategory | undefined {
  return WORD_CATEGORIES.find((c) => c.id === id)
}

export function getRandomWord(categoryId: string): string {
  const category = getCategoryById(categoryId)
  if (!category) return ''
  const entry = category.words[Math.floor(Math.random() * category.words.length)]
  return resolveWord(entry).text
}

/** Returns the full WordEntry (text + optional imageUrl) for the given word text in a category. */
export function getWordEntry(categoryId: string, wordText: string): WordEntry {
  const category = getCategoryById(categoryId)
  if (!category) return { text: wordText }
  const match = category.words
    .map(resolveWord)
    .find((e) => e.text.toLowerCase() === wordText.toLowerCase())
  return match ?? { text: wordText }
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
