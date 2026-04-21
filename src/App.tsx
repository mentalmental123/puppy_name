import { useEffect, useMemo, useReducer, useState } from 'react';
import './App.css';
import coverPuppy from './data/pictures/white-black-puppy.png';
import detailPuppy from './data/pictures/white-brown-puppy.png';
import { usePetData } from './hooks/usePetData';
import { filtersReducer, initialFiltersState } from './state/filters';
import { filterAndSortNames, paginate } from './utils/nameFilters';

const PAGE_SIZE = 9;

function App() {
  const { data, loading, error } = usePetData();
  const [filters, dispatch] = useReducer(filtersReducer, initialFiltersState);
  const [selectedNameId, setSelectedNameId] = useState<string | null>(null);

  const filteredNames = useMemo(() => {
    if (!data) {
      return [];
    }

    return filterAndSortNames(data.names, filters);
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredNames.length / PAGE_SIZE));

  useEffect(() => {
    if (filters.page > totalPages) {
      dispatch({ type: 'set-page', payload: totalPages });
    }
  }, [filters.page, totalPages]);

  const hasRefinement =
    filters.gender !== 'both' ||
    filters.categoryIds.length > 0 ||
    filters.letter !== 'ALL' ||
    Boolean(filters.search.trim());

  useEffect(() => {
    if (!selectedNameId && hasRefinement && filteredNames.length > 0) {
      setSelectedNameId(filteredNames[0].id);
    }
  }, [selectedNameId, hasRefinement, filteredNames]);

  useEffect(() => {
    if (selectedNameId && !filteredNames.some((name) => name.id === selectedNameId)) {
      setSelectedNameId(filteredNames[0]?.id ?? null);
    }
  }, [selectedNameId, filteredNames]);

  const selectedName = useMemo(
    () => filteredNames.find((item) => item.id === selectedNameId) ?? null,
    [filteredNames, selectedNameId]
  );

  const visibleNames = useMemo(
    () => paginate(filteredNames, filters.page, PAGE_SIZE),
    [filteredNames, filters.page]
  );

  if (loading) {
    return (
      <main className="page-shell">
        <p className="status">Loading names...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="page-shell">
        <section className="error-box">
          <h1>Data not available</h1>
          <p>{error ?? 'Could not load pet names.'}</p>
        </section>
      </main>
    );
  }

  const selectedCategories = data.categories.filter((category) =>
    filters.categoryIds.includes(category.id)
  );
  const letterOptions = data.letters.filter((letter) => letter !== 'A');
  const filterGroups =
    data.filterGroups.length > 0
      ? data.filterGroups
      : data.categories.map((category) => ({
          id: category.id,
          label: category.label,
          categoryIds: [category.id]
        }));

  return (
    <main className="page-shell">
      <section className="canvas">
        <header className="gender-header">
          <p>Choose your pet's gender</p>
          <div className="gender-switch" role="radiogroup" aria-label="Pet gender">
            {['male', 'female', 'both'].map((gender) => (
              <button
                key={gender}
                type="button"
                className={filters.gender === gender ? 'pill active' : 'pill'}
                onClick={() =>
                  dispatch({
                    type: 'set-gender',
                    payload: gender as 'male' | 'female' | 'both'
                  })
                }
              >
                {gender[0].toUpperCase() + gender.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <section className="toolbar" aria-label="Top filters">
          <span className="toolbar-title">Filters</span>
          {filterGroups.map((group) => {
            const isActive = group.categoryIds.some((categoryId) =>
              filters.categoryIds.includes(categoryId)
            );

            return (
              <button
                key={group.id}
                type="button"
                className={isActive ? 'toolbar-item active' : 'toolbar-item'}
                onClick={() => {
                  const nextCategoryIds = isActive
                    ? filters.categoryIds.filter((id) => !group.categoryIds.includes(id))
                    : [...new Set([...filters.categoryIds, ...group.categoryIds])];

                  dispatch({ type: 'set-categories', payload: nextCategoryIds });
                }}
              >
                {group.label}
                <span aria-hidden="true">v</span>
              </button>
            );
          })}
          <select
            value={filters.sortDirection}
            onChange={(event) =>
              dispatch({
                type: 'set-sort',
                payload: event.target.value as 'asc' | 'desc'
              })
            }
            className="toolbar-select"
            aria-label="Sort names"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
          <input
            type="search"
            value={filters.search}
            placeholder="Search"
            className="toolbar-search"
            onChange={(event) =>
              dispatch({ type: 'set-search', payload: event.target.value })
            }
          />
          <button
            type="button"
            className="toolbar-clear"
            onClick={() => {
              dispatch({ type: 'clear-filters' });
              setSelectedNameId(null);
            }}
          >
            Clear
          </button>
        </section>

        {selectedCategories.length > 0 && (
          <section className="selected-strip" aria-label="Selected filters">
            {selectedCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="selected-tag"
                onClick={() =>
                  dispatch({ type: 'toggle-category', payload: category.id })
                }
              >
                {category.label}
              </button>
            ))}
          </section>
        )}

        <section className="main-area">
          <h1 className="section-title">All pets names</h1>

          <div className="letters-wrap" aria-label="Letters">
            <button
              type="button"
              className={filters.letter === 'ALL' ? 'letter is-active' : 'letter'}
              onClick={() => dispatch({ type: 'set-letter', payload: 'ALL' })}
            >
              A
            </button>
            {letterOptions.map((letter) => (
              <button
                key={letter}
                type="button"
                className={filters.letter === letter ? 'letter is-active' : 'letter'}
                onClick={() => dispatch({ type: 'set-letter', payload: letter })}
              >
                {letter}
              </button>
            ))}
          </div>

          {!selectedName && !hasRefinement ? (
            <section className="cover-card">
              <h2>I NEED A NAME</h2>
              <button
                type="button"
                className="cover-cta"
                onClick={() => setSelectedNameId(filteredNames[0]?.id ?? null)}
              >
                Browse all names
              </button>
              <img src={coverPuppy} alt="Puppy sitting" className="cover-image" />
            </section>
          ) : (
            <section className="finder-grid">
              <aside className="names-column" aria-label="Names list">
                <button
                  type="button"
                  className="arrow-btn"
                  disabled={filters.page === 1}
                  onClick={() =>
                    dispatch({ type: 'set-page', payload: Math.max(1, filters.page - 1) })
                  }
                  aria-label="Previous page"
                >
                  ^
                </button>

                <ul className="names-list">
                  {visibleNames.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedNameId(item.id)}
                        className={
                          item.id === selectedName?.id
                            ? 'name-row is-selected'
                            : 'name-row'
                        }
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="arrow-btn"
                  disabled={filters.page === totalPages}
                  onClick={() =>
                    dispatch({
                      type: 'set-page',
                      payload: Math.min(totalPages, filters.page + 1)
                    })
                  }
                  aria-label="Next page"
                >
                  v
                </button>
              </aside>

              <section className="detail-column" aria-live="polite">
                {selectedName ? (
                  <>
                    <div className="detail-top">
                      <img
                        src={detailPuppy}
                        alt="Brown and white puppy"
                        className="detail-image"
                      />
                      <div>
                        <p className="gender-mark">
                          {selectedName.gender === 'male'
                            ? 'Male'
                            : selectedName.gender === 'female'
                              ? 'Female'
                              : 'Unisex'}
                          <span>
                            {' '}
                            -{' '}
                            {data.categories.find((item) =>
                              selectedName.categoryIds.includes(item.id)
                            )?.label ?? 'General'}
                          </span>
                        </p>
                        <h3>{selectedName.name}</h3>
                      </div>
                    </div>
                    <p className="detail-text">{selectedName.description}</p>
                    <p className="detail-subtitle">Related name</p>
                    <p className="detail-meta">
                      {selectedName.relatedNameIds
                        .map(
                          (id) => data.names.find((nameItem) => nameItem.id === id)?.name
                        )
                        .filter(Boolean)
                        .join(' - ') || 'None'}
                    </p>
                    <p className="detail-dots">ooo</p>
                  </>
                ) : (
                  <p className="detail-placeholder">Select a name to view details.</p>
                )}
              </section>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
