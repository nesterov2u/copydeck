const dictionary: Record<string, string> = {
  "premium coffee beans from colombia": "Премиальные кофейные зерна из Колумбии",
  "free worldwide shipping on all orders over $50.": "Бесплатная доставка по всему миру для всех заказов от $50.",
  "the best coffee i’ve ever had! – emily r.": "Лучший кофе, который я когда-либо пробовала! — Эмили Р.",
  "simple steps for the perfect cup.": "Простые шаги для идеальной чашки.",
  "sustainability, fairness, and quality in every step.": "Устойчивость, честность и качество на каждом этапе."
};

export function detectLanguage(text: string) {
  if (/[а-яё]/i.test(text)) return "RU";
  if (/[äöüß]/i.test(text)) return "DE";
  if (/[éèêàçùôî]/i.test(text)) return "FR";
  if (/[¿¡ñ]/i.test(text)) return "ES";
  if (/[àèéìíîòóù]/i.test(text)) return "IT";
  return "EN";
}

export async function translateText(text: string, targetLanguage = "RU") {
  const sourceLanguage = detectLanguage(text);
  const key = text.trim().toLowerCase().replace(/\s+/g, " ");

  await new Promise((resolve) => window.setTimeout(resolve, 350));

  return {
    sourceLanguage,
    targetLanguage,
    provider: "local-preview",
    translatedText:
      dictionary[key] ??
      `[${sourceLanguage} -> ${targetLanguage}] ${text}`
  };
}
