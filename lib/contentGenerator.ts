import { Puzzle } from "@/types";

const normalizeText = (text: string) =>
  text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const splitSentences = (text: string) =>
  normalizeText(text)
    .split(/[\.\!\?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

const getWords = (text: string) =>
  normalizeText(text)
    .match(/[A-Za-zÀ-ÿ0-9]+/g)
    ?.map((word) => normalize(word)) ?? [];

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

const GENERIC_TERMS = new Set([
  "nutrimento",
  "cosa",
  "processo",
  "sistema",
  "parte",
  "modo",
  "energia",
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
      word.length >= 6 &&
      !STOPWORDS.has(word) &&
      !GENERIC_TERMS.has(word) &&
      isNounLike(word)
  );

const scoreKeyword = (
  keyword: string,
  counts: Map<string, number>,
  firstParagraphWords: Set<string>,
  titleWords: Set<string>
) => {
  let score = (counts.get(keyword) ?? 0) * 2;
  if (titleWords.has(keyword)) score += 5;
  if (firstParagraphWords.has(keyword)) score += 3;
  if (isNounLike(keyword)) score += 2;
  if (keyword.length >= 9) score += 1;
  return score;
};

const pickBestKeyword = (
  candidates: string[],
  counts: Map<string, number>,
  firstParagraphWords: Set<string>,
  titleWords: Set<string>
) => {
  if (candidates.length === 0) return undefined;
  return [...new Set(candidates)]
    .sort((a, b) => {
      const scoreDiff =
        scoreKeyword(b, counts, firstParagraphWords, titleWords) -
        scoreKeyword(a, counts, firstParagraphWords, titleWords);
      if (scoreDiff !== 0) return scoreDiff;
      return a.localeCompare(b);
    })[0];
};

const scoreKeywords = (
  candidates: string[],
  counts: Map<string, number>,
  firstParagraphWords: Set<string>,
  titleWords: Set<string>
) =>
  [...new Set(candidates)].map((keyword) => ({
    keyword,
    score: scoreKeyword(keyword, counts, firstParagraphWords, titleWords),
  }));

const extractDefinition = (sentence: string) => {
  const normalized = normalize(sentence);
  const match = normalized.match(
    /^(.+?)\s+(e|sono|serve|produce|permette|usa|trasforma)\s+(.+)$/
  );
  if (!match) return undefined;
  const subject = match[1].trim();
  const definition = match[3].trim();
  const subjectWords = subject.split(/\s+/);
  const subjectKeyword = subjectWords[subjectWords.length - 1];
  return {
    subject: subjectKeyword,
    definition: sentence.trim().replace(/\s+/g, " "),
  };
};

const buildBlankSentence = (sentence: string, keyword: string) => {
  const regex = new RegExp(`\\b${keyword}\\b`, "i");
  if (!regex.test(sentence)) return undefined;
  return sentence.replace(regex, "______");
};

const PATH_DEPENDENCIES = [
  "luce",
  "energia solare",
  "acqua",
  "anidride carbonica",
  "clorofilla",
];

const extractPathDependency = (text: string) => {
  const normalized = normalize(text);
  for (const dependency of PATH_DEPENDENCIES) {
    if (normalized.includes(dependency)) {
      return dependency;
    }
  }
  return undefined;
};

const truncateExcerpt = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
};

const buildExcerpt = (sentence: string) =>
  `Estratto: ${truncateExcerpt(sentence, 160)}`;

const buildDefinitionParaphrase = (definition: string) =>
  definition
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(0, 12)
    .join(" ");


export function generatePuzzlesFromText(
  text: string,
  count: number
): Puzzle[] {
  const sentencesOriginal = splitSentences(text);
  const sentencesLower = sentencesOriginal.map((sentence) =>
    normalize(sentence)
  );
  const words = getWords(text);
  const wordCounts = buildFrequencyMap(words);
  const candidates = extractKeywords(words);

  const fallbackSentence =
    sentencesOriginal[0] ??
    "Il laboratorio è in blocco e serve una soluzione rapida.";

  const firstParagraph =
    text.split(/\n\s*\n/)[0] ?? sentencesOriginal[0] ?? "";
  const firstParagraphWords = new Set(getWords(firstParagraph));
  const titleCandidate = sentencesOriginal[0] ?? "";
  const titleWords = new Set(getWords(titleCandidate));

  // Heuristic 1: main keyword (most frequent meaningful concept).
  const mainKeyword =
    pickBestKeyword(candidates, wordCounts, firstParagraphWords, titleWords) ??
    words.find(
      (word) =>
        word.length >= 6 &&
        !STOPWORDS.has(word) &&
        !GENERIC_TERMS.has(word)
    ) ??
    "fotosintesi";

  const scoredKeywords = scoreKeywords(
    candidates,
    wordCounts,
    firstParagraphWords,
    titleWords
  ).sort((a, b) => b.score - a.score);
  const topKeyword = scoredKeywords[0]?.keyword ?? mainKeyword;
  const secondScore = scoredKeywords[1]?.score ?? 0;
  const topScore = scoredKeywords[0]?.score ?? 0;

  // Heuristic 2: definition match (X è/serve/permette...).
  const definitionMatch = sentencesOriginal
    .map((sentence) => extractDefinition(sentence))
    .find(
      (result) =>
        result &&
        result.subject.length >= 4 &&
        !GENERIC_TERMS.has(normalize(result.subject))
    );

  const definitionSubject =
    normalize(definitionMatch?.subject ?? mainKeyword);
  const definitionExcerpt =
    definitionMatch?.definition ?? fallbackSentence;

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
  const pathDependency =
    extractPathDependency(text) ??
    extractPathDependency(sentencesOriginal.join(" ")) ??
    "luce";

  const keywordSentence =
    sentencesOriginal.find((sentence, index) =>
      sentencesLower[index]?.includes(topKeyword)
    ) ?? fallbackSentence;
  const keywordExcerpt = buildExcerpt(keywordSentence);
  const isTopScored = topScore >= secondScore + 1;
  const keywordQuestion = isTopScored
    ? "Qual è il processo/tema principale?"
    : "Trova una parola chiave nel testo (presente nell’estratto).";
  const keywordAnswer = isTopScored ? topKeyword : topKeyword;

  const keywordPuzzle: Puzzle = {
    id: "p1",
    type: "keyword",
    question: `${keywordQuestion}\n${keywordExcerpt}`,
    answer: keywordAnswer,
  };

  const definitionSentence =
    definitionMatch?.definition ?? fallbackSentence;
  const definitionParaphrase = buildDefinitionParaphrase(definitionSentence);
  const definitionPuzzle: Puzzle = definitionMatch
    ? {
        id: "p2",
        type: "logic",
        question: `Come si chiama il processo che ${definitionParaphrase}?\n${buildExcerpt(
          definitionSentence
        )}`,
        answer: definitionSubject,
      }
    : {
        id: "p2",
        type: "quiz",
        question: `Quale termine descrive meglio: ${fallbackSentence}\n${buildExcerpt(
          fallbackSentence
        )}`,
        options: [mainKeyword, "materia", "strumento", "trasformazione"],
        answer: mainKeyword,
      };

  const codePuzzle: Puzzle = {
    id: "p3",
    type: "code",
    question: `Il codice è il numero di lettere della parola "${mainKeyword}".\n${keywordExcerpt}`,
    answer: codeAnswer,
  };

  const blankPuzzle: Puzzle =
    blankSentence && blankSentence.includes("______")
      ? {
          id: "p4",
          type: "quiz",
          question: `${blankSentence}\n${buildExcerpt(sentenceForBlank)}`,
          answer: mainKeyword,
        }
      : {
          id: "p4",
          type: "quiz",
          question: `Completa il concetto principale del testo.\n${buildExcerpt(
            fallbackSentence
          )}`,
          options: [mainKeyword, "struttura", "elemento", "risorsa"],
          answer: mainKeyword,
        };

  const hasExplicitDependency = extractPathDependency(text) !== undefined;
  const pathPuzzle: Puzzle = hasExplicitDependency
    ? {
        id: "p5",
        type: "path",
        question: `Senza ____ non può avvenire la fotosintesi.\n${buildExcerpt(
          sentencesOriginal.find((sentence) =>
            normalize(sentence).includes(pathDependency)
          ) ?? fallbackSentence
        )}`,
        answer: pathDependency,
      }
    : keywordPuzzle;

  const puzzles: Puzzle[] = [
    keywordPuzzle,
    definitionPuzzle,
    codePuzzle,
    blankPuzzle,
    pathPuzzle,
  ];

  const total = Math.max(1, count);
  return puzzles.slice(0, total).map((puzzle, index) => ({
    ...puzzle,
    id: `p${index + 1}`,
  }));
}
