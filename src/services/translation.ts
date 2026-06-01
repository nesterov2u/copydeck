const dictionary: Record<string, string> = {
  "premium coffee beans from colombia": "Премиальные кофейные зерна из Колумбии",
  "free worldwide shipping on all orders over $50.": "Бесплатная доставка по всему миру для всех заказов от $50.",
  "the best coffee i’ve ever had! – emily r.": "Лучший кофе, который я когда-либо пробовала! — Эмили Р.",
  "simple steps for the perfect cup.": "Простые шаги для идеальной чашки.",
  "sustainability, fairness, and quality in every step.": "Устойчивость, честность и качество на каждом этапе."
};

const languageHints: Record<string, string[]> = {
  EN: [
    "the",
    "and",
    "that",
    "with",
    "for",
    "you",
    "your",
    "because",
    "this",
    "from"
  ],
  ID: [
    "yang",
    "dan",
    "karena",
    "hanya",
    "banyak",
    "namun",
    "kemudian",
    "untuk",
    "pada",
    "dengan",
    "tidak",
    "biaya",
    "sistem",
    "terlihat",
    "memerlukan"
  ],
  ES: ["el", "la", "los", "las", "que", "para", "con", "porque", "una", "por"],
  FR: ["le", "la", "les", "des", "que", "pour", "avec", "dans", "une", "est"],
  DE: ["der", "die", "das", "und", "mit", "für", "nicht", "eine", "ist", "auf"],
  IT: ["il", "lo", "la", "gli", "che", "per", "con", "non", "una", "sono"],
  PT: ["o", "a", "os", "as", "que", "para", "com", "uma", "não", "por"],
  NL: ["de", "het", "een", "van", "voor", "met", "niet", "dat", "zijn", "op"],
  PL: ["i", "oraz", "nie", "dla", "jest", "że", "się", "z", "na", "który"],
  TR: ["ve", "bir", "için", "ile", "de", "bu", "olan", "olarak", "daha", "çok"]
};

export function detectLanguage(text: string) {
  const normalized = text.toLowerCase();
  if (/[а-яё]/i.test(normalized)) return "RU";
  if (/[ąćęłńóśźż]/i.test(normalized)) return "PL";
  if (/[ğışçöü]/i.test(normalized)) return "TR";
  if (/[ãõ]/i.test(normalized)) return "PT";
  if (/[äöüß]/i.test(normalized)) return "DE";
  if (/[¿¡ñ]/i.test(normalized)) return "ES";
  if (/[éèêçùôûîïœ]/i.test(normalized)) return "FR";
  if (/[àèìíîòóù]/i.test(normalized)) return "IT";

  const words = normalized.match(/\p{L}+/gu) ?? [];
  const scores = Object.entries(languageHints).map(([language, hints]) => ({
    language,
    score: hints.reduce((total, hint) => total + words.filter((word) => word === hint).length, 0)
  }));
  const winner = scores.sort((a, b) => b.score - a.score)[0];

  return winner && winner.score > 0 ? winner.language : "EN";
}

export async function translateText(text: string, targetLanguage = "RU") {
  const sourceLanguage = detectLanguage(text);
  const key = text.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedTarget = targetLanguage.toUpperCase();

  if (sourceLanguage === normalizedTarget) {
    return {
      sourceLanguage,
      targetLanguage: normalizedTarget,
      provider: "local",
      translatedText: text
    };
  }

  if (dictionary[key]) {
    await delay(120);
    return {
      sourceLanguage,
      targetLanguage: normalizedTarget,
      provider: "local-preview",
      translatedText: dictionary[key]
    };
  }

  const translatedText = await translateWithMyMemory(text, sourceLanguage, normalizedTarget);

  return {
    sourceLanguage,
    targetLanguage: normalizedTarget,
    provider: "mymemory",
    translatedText
  };
}

async function translateWithMyMemory(text: string, sourceLanguage: string, targetLanguage: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 7000);
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${sourceLanguage.toLowerCase()}|${targetLanguage.toLowerCase()}`);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("Translation request failed");

    const payload = (await response.json()) as {
      responseData?: { translatedText?: string };
    };
    const translatedText = decodeHtml(payload.responseData?.translatedText?.trim() ?? "");
    if (!translatedText) throw new Error("Empty translation");
    return translatedText;
  } finally {
    window.clearTimeout(timeout);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function decodeHtml(value: string) {
  if (typeof document === "undefined") return value;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}
