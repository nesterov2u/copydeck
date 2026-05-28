import { Filter, Search } from "lucide-react";
import { useCopyDeckStore } from "../store/useCopyDeckStore";
import type { FilterMode } from "../types";
import { filterLabels } from "./blockLabels";

export function FiltersRow() {
  const filter = useCopyDeckStore((state) => state.filter);
  const search = useCopyDeckStore((state) => state.search);
  const setFilter = useCopyDeckStore((state) => state.setFilter);
  const setSearch = useCopyDeckStore((state) => state.setSearch);

  return (
    <section className="filters-row">
      <select value={filter} onChange={(event) => setFilter(event.target.value as FilterMode)}>
        {Object.entries(filterLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <label className="search-field">
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск..."
        />
      </label>
      <button className="icon-button" title="Фильтры">
        <Filter size={18} />
      </button>
    </section>
  );
}
