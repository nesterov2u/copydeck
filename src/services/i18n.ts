import type { InterfaceLanguage } from "../types";

type TranslationKey =
  | "back"
  | "blockCannotBeSeparated"
  | "blocks"
  | "cacheCleared"
  | "checkForUpdate"
  | "checking"
  | "checkingUpdates"
  | "clearCache"
  | "clearDeck"
  | "clipboardEmpty"
  | "close"
  | "copy"
  | "copyAndNext"
  | "copied"
  | "copyDeckUpToDate"
  | "currentVersion"
  | "currentDeckKept"
  | "custom"
  | "dark"
  | "deck"
  | "deckCleared"
  | "deckRestored"
  | "empty"
  | "english"
  | "french"
  | "german"
  | "general"
  | "import"
  | "importFailed"
  | "importedBlocks"
  | "installAndRestart"
  | "installing"
  | "installingUpdate"
  | "interfaceLanguage"
  | "italian"
  | "language"
  | "light"
  | "line"
  | "maximize"
  | "minimize"
  | "noUpdateAvailableYet"
  | "noRecentImports"
  | "original"
  | "pinWindow"
  | "recentImports"
  | "replaceDeck"
  | "replaceDeckConfirmBody"
  | "replaceDeckConfirmTitle"
  | "replaceDeckConfirmToast"
  | "restore"
  | "russian"
  | "separator"
  | "separatedBlocks"
  | "settings"
  | "spanish"
  | "splitBlocks"
  | "storage"
  | "system"
  | "target"
  | "theme"
  | "toggleStatus"
  | "translation"
  | "translationCachedNote"
  | "translationHoverAgain"
  | "translationLoading"
  | "translationUnavailable"
  | "translationUnavailableOriginal"
  | "unpinWindow"
  | "update"
  | "updateAvailable"
  | "updateInstallFailed"
  | "versionReady";

type TranslationValues = Record<string, string | number>;

const messages: Record<InterfaceLanguage, Record<TranslationKey, string>> = {
  en: {
    back: "Back",
    blockCannotBeSeparated: "Block cannot be separated",
    blocks: "Blocks",
    cacheCleared: "Cache cleared",
    checkForUpdate: "Check for update",
    checking: "Checking...",
    checkingUpdates: "Checking updates",
    clearCache: "Clear Cache",
    clearDeck: "Clear Deck",
    clipboardEmpty: "Clipboard is empty",
    close: "Close",
    copy: "Copy",
    copyAndNext: "Copy & Next",
    copied: "Copied",
    copyDeckUpToDate: "CopyDeck is up to date",
    currentVersion: "Current version {version}",
    currentDeckKept: "Current deck kept",
    custom: "Custom",
    dark: "Dark",
    deck: "Deck",
    deckCleared: "Deck cleared",
    deckRestored: "Restored {count} blocks",
    empty: "Empty",
    english: "English",
    french: "French",
    german: "German",
    general: "General",
    import: "Import",
    importFailed: "Import failed",
    importedBlocks: "Imported {count} blocks",
    installAndRestart: "Install & restart",
    installing: "Installing...",
    installingUpdate: "Installing update",
    interfaceLanguage: "Interface language",
    italian: "Italian",
    language: "Language",
    light: "Light",
    line: "Line",
    maximize: "Maximize",
    minimize: "Minimize",
    noUpdateAvailableYet: "No update available yet",
    noRecentImports: "No recent imports yet",
    original: "Original",
    pinWindow: "Pin above windows",
    recentImports: "Recent imports",
    replaceDeck: "Replace Deck",
    replaceDeckConfirmBody:
      "Your current deck has copied or skipped blocks. Replace it with {count} new blocks from the clipboard?",
    replaceDeckConfirmTitle: "Replace current deck?",
    replaceDeckConfirmToast: "Confirm deck replacement",
    restore: "Restore",
    russian: "Russian",
    separator: "Separator",
    separatedBlocks: "Separated into {count} blocks",
    settings: "Settings",
    spanish: "Spanish",
    splitBlocks: "Split blocks",
    storage: "Storage",
    system: "System",
    target: "Target",
    theme: "Theme",
    toggleStatus: "Toggle status",
    translation: "Translation",
    translationCachedNote:
      "Translations are cached locally and never replace the original block text.",
    translationHoverAgain: "Hover again to translate",
    translationLoading: "Translating...",
    translationUnavailable: "Translation unavailable",
    translationUnavailableOriginal:
      "Translation unavailable. Original text will stay unchanged.",
    unpinWindow: "Unpin window",
    update: "Update",
    updateAvailable: "Update {version} available",
    updateInstallFailed: "Update install failed",
    versionReady: "Version {version} is ready."
  },
  ru: {
    back: "Назад",
    blockCannotBeSeparated: "Блок нельзя разделить",
    blocks: "Блоков",
    cacheCleared: "Кэш очищен",
    checkForUpdate: "Проверить обновление",
    checking: "Проверка...",
    checkingUpdates: "Проверяю обновления",
    clearCache: "Очистить кэш",
    clearDeck: "Очистить список",
    clipboardEmpty: "Буфер обмена пуст",
    close: "Закрыть",
    copy: "Скопировать",
    copyAndNext: "Копировать и далее",
    copied: "Скопировано",
    copyDeckUpToDate: "CopyDeck обновлён",
    currentVersion: "Текущая версия {version}",
    currentDeckKept: "Текущий список сохранён",
    custom: "Свой",
    dark: "Тёмная",
    deck: "Список",
    deckCleared: "Список очищен",
    deckRestored: "Восстановлено блоков: {count}",
    empty: "Пустая",
    english: "Английский",
    french: "Французский",
    german: "Немецкий",
    general: "Основное",
    import: "Импорт",
    importFailed: "Импорт не удался",
    importedBlocks: "Импортировано блоков: {count}",
    installAndRestart: "Установить и перезапустить",
    installing: "Установка...",
    installingUpdate: "Устанавливаю обновление",
    interfaceLanguage: "Язык интерфейса",
    italian: "Итальянский",
    language: "Язык",
    light: "Светлая",
    line: "Строка",
    maximize: "Развернуть",
    minimize: "Свернуть",
    noUpdateAvailableYet: "Обновление пока недоступно",
    noRecentImports: "Недавних импортов пока нет",
    original: "Оригинал",
    pinWindow: "Закрепить поверх окон",
    recentImports: "Недавние списки",
    replaceDeck: "Заменить список",
    replaceDeckConfirmBody:
      "В текущем списке уже есть скопированные или пропущенные блоки. Заменить его на новые блоки из буфера обмена: {count}?",
    replaceDeckConfirmTitle: "Заменить текущий список?",
    replaceDeckConfirmToast: "Подтвердите замену списка",
    restore: "Вернуть",
    russian: "Русский",
    separator: "Разделитель",
    separatedBlocks: "Разделено на блоки: {count}",
    settings: "Настройки",
    spanish: "Испанский",
    splitBlocks: "Делить блоки",
    storage: "Хранилище",
    system: "Авто",
    target: "Цель",
    theme: "Тема",
    toggleStatus: "Переключить статус",
    translation: "Перевод",
    translationCachedNote:
      "Переводы кэшируются локально и никогда не заменяют исходный текст блока.",
    translationHoverAgain: "Наведите ещё раз для перевода",
    translationLoading: "Перевод...",
    translationUnavailable: "Перевод временно недоступен",
    translationUnavailableOriginal:
      "Перевод недоступен. Оригинальный текст останется без изменений.",
    unpinWindow: "Открепить окно",
    update: "Обновление",
    updateAvailable: "Доступно обновление {version}",
    updateInstallFailed: "Не удалось установить обновление",
    versionReady: "Версия {version} готова."
  }
};

export function t(
  language: InterfaceLanguage,
  key: TranslationKey,
  values: TranslationValues = {}
) {
  return messages[language][key].replace(/\{(\w+)\}/g, (_, name: string) =>
    String(values[name] ?? "")
  );
}

export function languageLabel(language: string, interfaceLanguage: InterfaceLanguage) {
  const labels: Record<string, TranslationKey> = {
    DE: "german",
    EN: "english",
    ES: "spanish",
    FR: "french",
    IT: "italian",
    RU: "russian"
  };

  const key = labels[language.toUpperCase()];
  return key ? t(interfaceLanguage, key) : language.toUpperCase();
}
