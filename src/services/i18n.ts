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
  | "clipboardEmpty"
  | "close"
  | "copy"
  | "copyAndNext"
  | "copied"
  | "copyDeckUpToDate"
  | "currentVersion"
  | "custom"
  | "dark"
  | "deck"
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
  | "original"
  | "pinWindow"
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
    clipboardEmpty: "Clipboard is empty",
    close: "Close",
    copy: "Copy",
    copyAndNext: "Copy & Next",
    copied: "Copied",
    copyDeckUpToDate: "CopyDeck is up to date",
    currentVersion: "Current version {version}",
    custom: "Custom",
    dark: "Dark",
    deck: "Deck",
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
    original: "Original",
    pinWindow: "Pin above windows",
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
    clipboardEmpty: "Буфер обмена пуст",
    close: "Закрыть",
    copy: "Скопировать",
    copyAndNext: "Копировать и далее",
    copied: "Скопировано",
    copyDeckUpToDate: "CopyDeck обновлён",
    currentVersion: "Текущая версия {version}",
    custom: "Свой",
    dark: "Тёмная",
    deck: "Список",
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
    original: "Оригинал",
    pinWindow: "Закрепить поверх окон",
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
