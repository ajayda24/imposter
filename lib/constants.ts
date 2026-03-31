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
    id: 'fruits',
    label: 'Fruits',
    hint: 'Think about something sweet that grows on trees or vines.',
    words: ['Apple', 'Mango', 'Banana', 'Strawberry', 'Pineapple', 'Watermelon', 'Grape', 'Peach', 'Cherry', 'Kiwi'],
  },
  {
    id: 'animals',
    label: 'Animals',
    hint: 'Think about a living creature found in nature or domesticated.',
    words: ['Elephant', 'Tiger', 'Dolphin', 'Eagle', 'Penguin', 'Wolf', 'Giraffe', 'Shark', 'Panda', 'Fox'],
  },
  {
    id: 'countries',
    label: 'Countries',
    hint: 'Think about a nation somewhere on the world map.',
    words: ['Brazil', 'Japan', 'Egypt', 'Canada', 'Australia', 'Norway', 'Mexico', 'India', 'Ghana', 'Argentina'],
  },
  {
    id: 'sports',
    label: 'Sports',
    hint: 'Think about a competitive physical activity or game.',
    words: ['Basketball', 'Tennis', 'Swimming', 'Football', 'Volleyball', 'Boxing', 'Cycling', 'Skiing', 'Archery', 'Fencing'],
  },
  {
    id: 'foods',
    label: 'Foods',
    hint: 'Think about something you might eat for a meal or snack.',
    words: ['Pizza', 'Sushi', 'Tacos', 'Burger', 'Ramen', 'Pasta', 'Curry', 'Steak', 'Salad', 'Dumplings'],
  },
  {
    id: 'movies',
    label: 'Movies',
    hint: 'Think about a popular film genre or famous title.',
    words: ['Inception', 'Titanic', 'Avatar', 'Jaws', 'Grease', 'Frozen', 'Gladiator', 'Alien', 'Psycho', 'Casablanca'],
  },
  {
    id: 'occupations',
    label: 'Occupations',
    hint: 'Think about a job or profession someone might have.',
    words: ['Doctor', 'Pilot', 'Chef', 'Architect', 'Detective', 'Astronaut', 'Mechanic', 'Librarian', 'Journalist', 'Surgeon'],
  },
  {
    id: 'places',
    label: 'Places',
    hint: 'Think about a specific location or type of venue.',
    words: ['Beach', 'Museum', 'Airport', 'Library', 'Hospital', 'Stadium', 'Factory', 'Lighthouse', 'Volcano', 'Submarine'],
  },
]

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
