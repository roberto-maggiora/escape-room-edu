import { generatePuzzlesFromText } from "@/lib/contentGenerator";
import { Locale } from "@/lib/i18n";
import { Puzzle, PuzzleType, RoomConfig } from "@/types";

const QUIZ = [
  {
    question: "Quale pianeta è conosciuto come Pianeta Rosso?",
    options: ["Marte", "Venere", "Giove", "Saturno"],
    answer: "Marte",
  },
  {
    question: "Qual è la capitale d'Italia?",
    options: ["Roma", "Milano", "Napoli", "Torino"],
    answer: "Roma",
  },
  {
    question: "Quanti lati ha un triangolo?",
    options: ["3", "4", "5", "6"],
    answer: "3",
  },
];

const KEYWORDS = [
  {
    question: "Parola chiave per aprire la stanza: sinonimo di coraggio.",
    answer: "Audacia",
  },
  {
    question: "Parola chiave: il processo delle piante per produrre energia.",
    answer: "Fotosintesi",
  },
  {
    question: "Parola chiave: il fiume più lungo d'Italia.",
    answer: "Po",
  },
];

const RIDDLES = [
  {
    question:
      "Sono sempre davanti a te ma non puoi vedermi. Cosa sono?",
    answer: "Il futuro",
  },
  {
    question:
      "Più mi togli, più divento grande. Cosa sono?",
    answer: "Un buco",
  },
  {
    question:
      "Ho città ma non case, ho fiumi ma non acqua. Cosa sono?",
    answer: "Una mappa",
  },
];

const CODES = [
  {
    question: "Inserisci il codice numerico per sbloccare il pannello.",
    answer: "314",
  },
  {
    question: "Codice di sicurezza: la somma di 12 e 8.",
    answer: "20",
  },
  {
    question: "Serratura elettronica: numero pari tra 40 e 42.",
    answer: "42",
  },
];

const LOGIC = [
  {
    question: "Se oggi è martedì, che giorno sarà tra 3 giorni?",
    answer: "Venerdì",
  },
  {
    question: "Completa la sequenza: 2, 4, 6, 8, ...",
    answer: "10",
  },
  {
    question: "Il contrario di nord è...",
    answer: "Sud",
  },
];

const PATH = [
  {
    question: "Scegli la direzione giusta per uscire dal labirinto.",
    answer: "Destra",
  },
  {
    question: "Per attraversare il ponte, quale strada prendi?",
    answer: "Centrale",
  },
  {
    question: "La via sicura è quella con la luce accesa. Quale?",
    answer: "Sinistra",
  },
];

const PUZZLE_TYPES: PuzzleType[] = [
  "quiz",
  "code",
  "keyword",
  "riddle",
  "logic",
  "path",
];

const pickRandom = <T,>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

export const generateRoom = (config: RoomConfig, _locale: Locale): Puzzle[] => {
  if (config.sourceContent?.trim()) {
    return generatePuzzlesFromText(config.sourceContent, config.puzzleCount);
  }
  const puzzles: Puzzle[] = [];
  for (let i = 0; i < config.puzzleCount; i += 1) {
    const type = pickRandom(PUZZLE_TYPES);
    if (type === "quiz") {
      const item = pickRandom(QUIZ);
      puzzles.push({
        id: `p${i + 1}`,
        type,
        question: item.question,
        options: item.options,
        answer: item.answer,
      });
      continue;
    }
    if (type === "code") {
      const item = pickRandom(CODES);
      puzzles.push({
        id: `p${i + 1}`,
        type,
        question: item.question,
        answer: item.answer,
      });
      continue;
    }
    if (type === "keyword") {
      const item = pickRandom(KEYWORDS);
      puzzles.push({
        id: `p${i + 1}`,
        type,
        question: item.question,
        answer: item.answer,
      });
      continue;
    }
    if (type === "riddle") {
      const item = pickRandom(RIDDLES);
      puzzles.push({
        id: `p${i + 1}`,
        type,
        question: item.question,
        answer: item.answer,
      });
      continue;
    }
    if (type === "logic") {
      const item = pickRandom(LOGIC);
      puzzles.push({
        id: `p${i + 1}`,
        type,
        question: item.question,
        answer: item.answer,
      });
      continue;
    }
    const item = pickRandom(PATH);
    puzzles.push({
      id: `p${i + 1}`,
      type,
      question: item.question,
      answer: item.answer,
    });
  }
  return puzzles;
};
