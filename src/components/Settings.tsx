import { useEffect, useState } from "react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import { languageLabel, t } from "../services/i18n";
import type { InterfaceLanguage, ParseMode, ThemeMode } from "../types";
import { Icon, type IconName } from "./Icon";

type SettingsSection = "general" | "import" | "translation" | "storage" | "update";

export function Settings() {
  const store = useCopyDeckStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const sections: Array<{ id: SettingsSection; label: string; icon: IconName }> = [
    { id: "general", label: t(store.interfaceLanguage, "general"), icon: "settings" },
    { id: "import", label: t(store.interfaceLanguage, "import"), icon: "fileArrowLeft" },
    { id: "translation", label: t(store.interfaceLanguage, "translation"), icon: "language" },
    { id: "storage", label: t(store.interfaceLanguage, "storage"), icon: "database" },
    { id: "update", label: t(store.interfaceLanguage, "update"), icon: "worldBolt" }
  ];

  return (
    <section className="settings-view">
      <button className="deck-button" onClick={store.backToList}>
        <Icon name="list" size={20} /> {t(store.interfaceLanguage, "deck")}
      </button>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          {sections.map((section) => (
            <button
              key={section.id}
              className={activeSection === section.id ? "active" : ""}
              onClick={() => setActiveSection(section.id)}
            >
              <Icon name={section.icon} size={19} />
              {section.label}
            </button>
          ))}
        </aside>

        <div className="settings-panel">
          {activeSection === "general" && <GeneralSettings />}
          {activeSection === "import" && <ImportSettings />}
          {activeSection === "translation" && <TranslationSettings />}
          {activeSection === "storage" && <StorageSettings />}
          {activeSection === "update" && <UpdateSettings />}
        </div>
      </div>
    </section>
  );
}

function GeneralSettings() {
  const store = useCopyDeckStore();

  return (
    <>
      <div className="setting-row stack">
        <span>{t(store.interfaceLanguage, "theme")}</span>
        <Segmented
          value={store.theme}
          values={["system", "light", "dark"] as ThemeMode[]}
          labels={{
            system: t(store.interfaceLanguage, "system"),
            light: t(store.interfaceLanguage, "light"),
            dark: t(store.interfaceLanguage, "dark")
          }}
          onChange={store.setTheme}
        />
      </div>

      <div className="setting-row stack">
        <span>{t(store.interfaceLanguage, "interfaceLanguage")}</span>
        <Segmented
          value={store.interfaceLanguage}
          values={["en", "ru"] as InterfaceLanguage[]}
          labels={{ en: "English", ru: "Русский" }}
          onChange={store.setInterfaceLanguage}
        />
      </div>

      <SettingSwitch
        label={t(store.interfaceLanguage, "pinWindow")}
        checked={store.pinned}
        onChange={store.setPinned}
      />
    </>
  );
}

function ImportSettings() {
  const store = useCopyDeckStore();

  return (
    <>
      <div className="setting-row stack">
        <span>{t(store.interfaceLanguage, "splitBlocks")}</span>
        <Segmented
          value={store.parseMode}
          values={["paragraph", "line", "custom"] as ParseMode[]}
          labels={{
            paragraph: t(store.interfaceLanguage, "empty"),
            line: t(store.interfaceLanguage, "line"),
            custom: t(store.interfaceLanguage, "custom")
          }}
          onChange={store.setParseMode}
        />
      </div>

      <label className="setting-row">
        <span>{t(store.interfaceLanguage, "separator")}</span>
        <input
          className="setting-input"
          value={store.customSeparator}
          placeholder="//"
          onChange={(event) => store.setCustomSeparator(event.target.value)}
        />
      </label>
    </>
  );
}

function TranslationSettings() {
  const store = useCopyDeckStore();

  return (
    <>
      <SettingSwitch
        label={t(store.interfaceLanguage, "translation")}
        checked={store.translationEnabled}
        onChange={store.setTranslationEnabled}
      />

      <label className="setting-row">
        <span>{t(store.interfaceLanguage, "target")}</span>
        <select
          className="setting-input"
          value={store.targetLanguage}
          onChange={(event) => store.setTargetLanguage(event.target.value)}
        >
          <option value="RU">{languageLabel("RU", store.interfaceLanguage)}</option>
          <option value="EN">{languageLabel("EN", store.interfaceLanguage)}</option>
          <option value="DE">{languageLabel("DE", store.interfaceLanguage)}</option>
          <option value="FR">{languageLabel("FR", store.interfaceLanguage)}</option>
          <option value="ES">{languageLabel("ES", store.interfaceLanguage)}</option>
          <option value="IT">{languageLabel("IT", store.interfaceLanguage)}</option>
        </select>
      </label>

      <div className="setting-note">{t(store.interfaceLanguage, "translationCachedNote")}</div>
    </>
  );
}

function StorageSettings() {
  const store = useCopyDeckStore();

  return (
    <>
      <div className="settings-action-stack">
        <button className="settings-action-button primary" onClick={store.clearCache}>
          {t(store.interfaceLanguage, "clearCache")}
        </button>
        <button className="settings-action-button" onClick={store.clearDeck}>
          {t(store.interfaceLanguage, "clearDeck")}
        </button>
      </div>

      <div className="setting-row stack">
        <span>{t(store.interfaceLanguage, "recentImports")}</span>
        {store.recentImports.length ? (
          <div className="recent-import-list">
            {store.recentImports.map((item) => (
              <div className="recent-import-item" key={item.id}>
                <div className="recent-import-copy">
                  <strong>{formatRecentImportDate(item.createdAt, store.interfaceLanguage)}</strong>
                  <span>{item.preview}</span>
                  <small>{t(store.interfaceLanguage, "blocks")}: {item.blockCount}</small>
                </div>
                <button onClick={() => store.restoreRecentImport(item.id)}>
                  {t(store.interfaceLanguage, "restore")}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="setting-note">{t(store.interfaceLanguage, "noRecentImports")}</div>
        )}
      </div>
    </>
  );
}

function formatRecentImportDate(createdAt: number, interfaceLanguage: InterfaceLanguage) {
  return new Intl.DateTimeFormat(interfaceLanguage === "ru" ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(createdAt));
}

function UpdateSettings() {
  const store = useCopyDeckStore();
  const [appVersion, setAppVersion] = useState("0.1.1");
  const checking = store.updateStatus === "checking";
  const updating = store.updateStatus === "updating";

  useEffect(() => {
    import("@tauri-apps/api/app")
      .then(({ getVersion }) => getVersion())
      .then(setAppVersion)
      .catch(() => undefined);
  }, []);

  return (
    <div className="setting-row stack">
      <span>{t(store.interfaceLanguage, "update")}</span>
      <div className="setting-note">
        {t(store.interfaceLanguage, "currentVersion", { version: appVersion })}
      </div>
      <div className="settings-action-stack">
        <button
          className="settings-action-button"
          disabled={checking || updating}
          onClick={store.checkForUpdates}
        >
          {checking
            ? t(store.interfaceLanguage, "checking")
            : t(store.interfaceLanguage, "checkForUpdate")}
        </button>

        {store.availableUpdate && (
          <>
            <div className="setting-note">
              {t(store.interfaceLanguage, "versionReady", {
                version: store.availableUpdate.version
              })}
            </div>
            <button
              className="settings-action-button primary"
              disabled={updating}
              onClick={store.installUpdate}
            >
              {updating
                ? t(store.interfaceLanguage, "installing")
                : t(store.interfaceLanguage, "installAndRestart")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SettingSwitch({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <button
        className={`switch ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
        aria-label={label}
        aria-pressed={checked}
      />
    </div>
  );
}

function Segmented<T extends string>({
  value,
  values,
  labels,
  onChange
}: {
  value: T;
  values: T[];
  labels: Partial<Record<T, string>>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented-control">
      {values.map((item) => (
        <button
          key={item}
          className={value === item ? "active" : ""}
          onClick={() => onChange(item)}
        >
          {labels[item] ?? item}
        </button>
      ))}
    </div>
  );
}
