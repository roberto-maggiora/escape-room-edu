import { Puzzle } from "@/types";

const normalizeText = (text: string) =>
  text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

const splitSentences = (text: string) =>
  normalizeText(text)
    .split(/[\.\!\?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

const getWords = (text: string) =>
  normalizeText(text)
    .match(/[A-Za-zÀ-ÿ0-9]+/g)
    ?.map((word) => word.toLowerCase()) ?? [];

const STOPWORDS = new Set([
  "il",
  "lo",
  "la",
  "i",
  "gli",
  "le",
  "un",
  "uno",
  "una",
  "di",
  "a",
  "da",
  "in",
  "su",
  "per",
  "tra",
  "fra",
  "con",
  "e",
  "o",
  "ma",
  "che",
  "del",
  "della",
  "dei",
  "delle",
  "al",
  "allo",
  "alla",
  "ai",
  "agli",
  "alle",
  "nel",
  "nello",
  "nella",
  "nei",
  "nelle",
  "come",
  "piu",
  "più",
]);

const NOUN_SUFFIXES = [
  "zione",
  "sione",
  "mento",
  "tà",
  "ica",
  "osi",
  "ismo",
  "ista",
  "enza",
  "anza",
];

const VERB_MARKERS = [
  " è ",
  " sono ",
  " serve ",
  " produce ",
  " permette ",
  " usa ",
  " trasforma ",
];

const isNounLike = (word: string) =>
  NOUN_SUFFIXES.some((suffix) => word.endsWith(suffix));

const buildFrequencyMap = (words: string[]) => {
  const counts = new Map<string, number>();
  words.forEach((word) => {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });
  return counts;
};

const extractKeywords = (words: string[]) =>
  words.filter(
    (word) =>
      word.length >= 6 && !STOPWORDS.has(word) && isNounLike(word)
  );

const pickMostFrequentKeyword = (candidates: string[], counts: Map<string, number>) => {
  if (candidates.length === 0) return undefined;
  return [...new Set(candidates)]
    .sort((a, b) => {
      const freqDiff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
      if (freqDiff !== 0) return freqDiff;
      if (b.length !== a.length) return b.length - a.length;
      return a.localeCompare(b);
    })[0];
};

const toInitials = (sentence: string) =>
  sentence
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const extractDefinition = (sentenceLower: string) => {
  const match = sentenceLower.match(
    /^(.+?)\s+(è|sono|serve|produce|permette|usa|trasforma)\s+(.+)$/
  );
  if (!match) return undefined;
  const subject = match[1].trim();
  const definition = match[3].trim();
  const subjectWords = subject.split(/\s+/);
  const subjectKeyword = subjectWords[subjectWords.length - 1];
  return {
    subject: subjectKeyword,
    definition,
  };
};

const buildBlankSentence = (sentence: string, keyword: string) => {
  const regex = new RegExp(`\\b${keyword}\\b`, "i");
  if (!regex.test(sentence)) return undefined;
  return sentence.replace(regex, "______");
};

const extractCauseWord = (sentenceLower: string, keyword: string) => {
  const verbMatch = sentenceLower.match(
    /(produce|permette|usa|trasforma)\s+(.+)$/
  );
  if (!verbMatch) return undefined;
  const tail = verbMatch[2];
  const tailWords = tail.split(/\s+/).map((word) => word.replace(/[^\wÀ-ÿ]/g, ""));
  const candidate = tailWords.find(
    (word) => word && word !== keyword && !STOPWORDS.has(word)
  );
  return candidate;
};

export function generatePuzzlesFromText(
  text: string,
  count: number
): Puzzle[] {
  const sentencesOriginal = splitSentences(text);
  const sentencesLower = sentencesOriginal.map((sentence) =>
    sentence.toLowerCase()
  );
  const words = getWords(text);
  const wordCounts = buildFrequencyMap(words);
  const candidates = extractKeywords(words);

  const fallbackSentence =
    sentencesOriginal[0] ?? "Il laboratorio è in blocco e serve una soluzione rapida.";

  // Heuristic 1: main keyword (most frequent meaningful concept).
  const mainKeyword =
    pickMostFrequentKeyword(candidates, wordCounts) ??
    words.find((word) => word.length >= 6 && !STOPWORDS.has(word)) ??
    "processo";

  // Heuristic 2: definition match (X è/serve/permette...).
  const definitionMatch = sentencesLower
    .map((sentence) => extractDefinition(sentence))
    .find((result) => result && result.subject.length >= 4);

  const definitionSubject =
    definitionMatch?.subject ?? mainKeyword;
  const definitionExcerpt =
    definitionMatch?.definition.split(/\s+/).slice(0, 10).join(" ") ??
    fallbackSentence;

  // Heuristic 3: code from knowledge (length of the main keyword).
  const codeAnswer = String(mainKeyword.length);

  // Heuristic 4: fill the blank with an important keyword.
  const sentenceForBlank =
    sentencesOriginal.find((sentence, index) =>
      sentencesLower[index]?.includes(mainKeyword)
    ) ?? fallbackSentence;
  const blankSentence =
    buildBlankSentence(sentenceForBlank, mainKeyword) ??
    `______ ${sentenceForBlank}`;

  // Heuristic 5: cause-effect from verb sentences.
  const causeSentenceIndex = sentencesLower.findIndex((sentence) =>
    VERB_MARKERS.some((marker) => sentence.includes(marker))
  );
  const causeSentenceLower =
    causeSentenceIndex >= 0 ? sentencesLower[causeSentenceIndex] : "";
  const causeWord =
    extractCauseWord(causeSentenceLower, mainKeyword) ??
    candidates.find((word) => word !== mainKeyword) ??
    "energia";

  const puzzles: Puzzle[] = [
    {
      id: "p1",
      type: "keyword",
      question: "Qual è il processo/concetto principale descritto nel testo?",
      answer: mainKeyword,
    },
    {
      id: "p2",
      type: "riddle",
      question: `Come si chiama ciò che: ${definitionExcerpt} ?`,
      answer: definitionSubject,
    },
    {
      id: "p3",
      type: "code",
      question: `Il codice è il numero di lettere della parola "${mainKeyword}".`,
      answer: codeAnswer,
    },
    {
      id: "p4",
      type: "logic",
      question: blankSentence,
      answer: mainKeyword,
    },
    {
      id: "p5",
      type: "path",
      question: `Senza ______ ${mainKeyword} non può avvenire.`,
      answer: causeWord,
    },
  ];

  const total = Math.max(1, count);
  return puzzles.slice(0, total).map((puzzle, index) => ({
    ...puzzle,
    id: `p${index + 1}`,
  }));
}
