import type { Category, GenderFilter } from '../types';
import type { SortDirection } from '../state/filters';

interface FilterPanelProps {
  categories: Category[];
  letters: string[];
  selectedGender: GenderFilter;
  selectedCategories: string[];
  selectedLetter: string;
  search: string;
  sortDirection: SortDirection;
  onGenderChange: (gender: GenderFilter) => void;
  onCategoryToggle: (categoryId: string) => void;
  onLetterChange: (letter: string) => void;
  onSearchChange: (value: string) => void;
  onSortDirectionChange: (value: SortDirection) => void;
  onClear: () => void;
}

const genderOptions: GenderFilter[] = ['male', 'female', 'both'];

export function FilterPanel({
  categories,
  letters,
  selectedGender,
  selectedCategories,
  selectedLetter,
  search,
  sortDirection,
  onGenderChange,
  onCategoryToggle,
  onLetterChange,
  onSearchChange,
  onSortDirectionChange,
  onClear
}: FilterPanelProps) {
  return (
    <aside className="panel" aria-label="Filters">
      <div className="panel-header">
        <h2>Filters</h2>
        <button type="button" className="ghost-btn" onClick={onClear}>
          Clear
        </button>
      </div>

      <section>
        <p className="label">Pet gender</p>
        <div className="segmented-control" role="radiogroup" aria-label="Pet gender">
          {genderOptions.map((gender) => (
            <button
              key={gender}
              type="button"
              role="radio"
              aria-checked={selectedGender === gender}
              className={selectedGender === gender ? 'chip active' : 'chip'}
              onClick={() => onGenderChange(gender)}
            >
              {gender[0].toUpperCase() + gender.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label htmlFor="name-search" className="label">
          Search name
        </label>
        <input
          id="name-search"
          className="text-input"
          type="search"
          value={search}
          placeholder="Try Luna, Milo..."
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </section>

      <section>
        <label htmlFor="sort-direction" className="label">
          Alphabetical order
        </label>
        <select
          id="sort-direction"
          className="select-input"
          value={sortDirection}
          onChange={(event) => onSortDirectionChange(event.target.value as SortDirection)}
        >
          <option value="asc">A to Z</option>
          <option value="desc">Z to A</option>
        </select>
      </section>

      <section>
        <p className="label">Start letter</p>
        <div className="chip-grid">
          <button
            type="button"
            onClick={() => onLetterChange('ALL')}
            className={selectedLetter === 'ALL' ? 'chip active' : 'chip'}
          >
            All
          </button>
          {letters.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => onLetterChange(letter)}
              className={selectedLetter === letter ? 'chip active' : 'chip'}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="label">Categories</p>
        <div className="chip-grid">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryToggle(category.id)}
                className={isSelected ? 'chip active' : 'chip'}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
