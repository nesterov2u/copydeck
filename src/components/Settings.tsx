import { useEffect, useState } from "react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import type { ParseMode, SpreadsheetImportMode, ThemeMode } from "../types";
import { Icon, type IconName } from "./Icon";

type SettingsSection = "general" | "import" | "translation" | "storage" | "update";

const sections: Array<{ id: SettingsSection; label: string; icon: IconName }> = [
  { id: "general", label: "General", icon: "settings" },
  { id: "import", label: "Import", icon: "fileArrowLeft" },
  { id: "translation", label: "Translation", icon: "language" },
  { id: "storage", label: "Storage", icon: "database" },
  { id: "update", label: "Update", icon: "worldBolt" }
];

export function Settings() {
  const store = useCopyDeckStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");

  return (
    <section className="settings-view">
      <button className="deck-button" onClick={store.backToList}>
        <Icon name="list" size={20} /> Deck
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
        <span>Theme</span>
        <Segmented
          value={store.theme}
          values={["system", "light", "dark"] as ThemeMode[]}
          labels={{ system: "System", light: "Light", dark: "Dark" }}
          onChange={store.setTheme}
        />
      </div>

      <SettingSwitch label="Always on top" checked={store.pinned} onChange={store.setPinned} />
      <SettingSwitch label="Compact mode" checked={store.compactMode} onChange={store.setCompactMode} />
    </>
  );
}

function ImportSettings() {
  const store = useCopyDeckStore();

  return (
    <>
      <div className="setting-row stack">
        <span>Split blocks</span>
        <Segmented
          value={store.parseMode}
          values={["paragraph", "line", "custom"] as ParseMode[]}
          labels={{ paragraph: "Empty", line: "Line", custom: "Custom" }}
          onChange={store.setParseMode}
        />
      </div>

      <label className="setting-row">
        <span>Separator</span>
        <input
          className="setting-input"
          value={store.customSeparator}
          placeholder="//"
          onChange={(event) => store.setCustomSeparator(event.target.value)}
        />
      </label>

      <div className="setting-row stack">
        <span>XLSX / CSV</span>
        <Segmented
          value={store.spreadsheetImportMode}
          values={["cell", "row", "column"] as SpreadsheetImportMode[]}
          labels={{ cell: "Cells", row: "Rows", column: "One column" }}
          onChange={store.setSpreadsheetImportMode}
        />
      </div>

      {store.spreadsheetImportMode === "column" && (
        <label className="setting-row">
          <span>Column #</span>
          <input
            className="setting-input small"
            min={1}
            type="number"
            value={store.selectedColumnIndex + 1}
            onChange={(event) => store.setSelectedColumnIndex(Number(event.target.value) - 1)}
          />
        </label>
      )}
    </>
  );
}

function TranslationSettings() {
  const store = useCopyDeckStore();

  return (
    <>
      <SettingSwitch
        label="Translation"
        checked={store.translationEnabled}
        onChange={store.setTranslationEnabled}
      />

      <label className="setting-row">
        <span>Target</span>
        <select
          className="setting-input"
          value={store.targetLanguage}
          onChange={(event) => store.setTargetLanguage(event.target.value)}
        >
          <option value="RU">Russian</option>
          <option value="EN">English</option>
          <option value="DE">German</option>
          <option value="FR">French</option>
          <option value="ES">Spanish</option>
          <option value="IT">Italian</option>
        </select>
      </label>

      <div className="setting-note">Translations are cached locally and never replace the original block text.</div>
    </>
  );
}

function StorageSettings() {
  const clearCache = useCopyDeckStore((state) => state.clearCache);

  return (
    <button className="clear-cache-button" onClick={clearCache}>
      Clear Cache
    </button>
  );
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
      <span>App update</span>
      <div className="setting-note">Current version {appVersion}</div>
      <div className="settings-action-stack">
        <button
          className="settings-action-button"
          disabled={checking || updating}
          onClick={store.checkForUpdates}
        >
          {checking ? "Checking..." : "Check for update"}
        </button>

        {store.availableUpdate && (
          <>
            <div className="setting-note">Version {store.availableUpdate.version} is ready.</div>
            <button
              className="settings-action-button primary"
              disabled={updating}
              onClick={store.installUpdate}
            >
              {updating ? "Installing..." : "Install & restart"}
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
