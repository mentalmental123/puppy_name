import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent
} from 'react';
import './App.css';
import coverPuppy from './data/pictures/white-black-puppy.png';
import detailPuppy from './data/pictures/white-brown-puppy.png';
import facebookIcon from './data/icons/fb.svg';
import instagramIcon from './data/icons/instgrm.svg';
import xIcon from './data/icons/x.svg';
import { usePetData } from './hooks/usePetData';
import { filtersReducer, initialFiltersState } from './state/filters';
import { filterAndSortNames, paginate } from './utils/nameFilters';

const PAGE_SIZE = 9;
const GENDER_OPTIONS = ['male', 'female', 'both'] as const;
const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/purina/',
    icon: facebookIcon,
    label: 'Purina on Facebook'
  },
  {
    href: 'https://www.instagram.com/purina/',
    icon: instagramIcon,
    label: 'Purina on Instagram'
  },
  {
    href: 'https://x.com/Purina',
    icon: xIcon,
    label: 'Purina on X'
  }
] as const;

function getGenderLabel(gender: (typeof GENDER_OPTIONS)[number]): string {
  if (gender === 'male') {
    return 'Male';
  }

  if (gender === 'female') {
    return 'Female';
  }

  return 'Unisex';
}

function App() {
  const { data, loading, error } = usePetData();
  const [filters, dispatch] = useReducer(filtersReducer, initialFiltersState);
  const [selectedNameId, setSelectedNameId] = useState<string | null>(null);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const closeGroupTimeoutRef = useRef<number | null>(null);

  const filteredNames = useMemo(
    () => (data ? filterAndSortNames(data.names, filters) : []),
    [data, filters]
  );

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

  const selectedName = filteredNames.find((item) => item.id === selectedNameId) ?? null;
  const visibleNames = paginate(filteredNames, filters.page, PAGE_SIZE);

  useEffect(() => {
    return () => {
      if (closeGroupTimeoutRef.current !== null) {
        window.clearTimeout(closeGroupTimeoutRef.current);
      }
    };
  }, []);

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
  const groupedCategories = filterGroups.map((group) => ({
    ...group,
    categories: data.categories.filter((category) =>
      group.categoryIds.includes(category.id)
    )
  }));
  const showCover = !selectedName && !hasRefinement;

  const selectedNameCategoryLabel = selectedName
    ? (data.categories.find((category) => selectedName.categoryIds.includes(category.id))
        ?.label ?? 'General')
    : 'General';

  const relatedNamesText = selectedName
    ? selectedName.relatedNameIds
        .map((id) => data.names.find((name) => name.id === id)?.name)
        .filter((name): name is string => Boolean(name))
        .join(' - ') || 'None'
    : 'None';

  function setGender(gender: (typeof GENDER_OPTIONS)[number]) {
    dispatch({ type: 'set-gender', payload: gender });
  }

  function setLetter(letter: string) {
    dispatch({ type: 'set-letter', payload: letter });
  }

  function setSortDirection(event: ChangeEvent<HTMLSelectElement>) {
    dispatch({
      type: 'set-sort',
      payload: event.target.value as 'asc' | 'desc'
    });
  }

  function setSearch(event: ChangeEvent<HTMLInputElement>) {
    dispatch({ type: 'set-search', payload: event.target.value });
  }

  function toggleCategory(categoryId: string) {
    dispatch({ type: 'toggle-category', payload: categoryId });
  }

  function changePage(nextPage: number) {
    dispatch({ type: 'set-page', payload: nextPage });
  }

  function clearFilters() {
    dispatch({ type: 'clear-filters' });
    setSelectedNameId(null);
  }

  function toggleGroup(groupId: string) {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  }

  function clearPendingGroupClose() {
    if (closeGroupTimeoutRef.current !== null) {
      window.clearTimeout(closeGroupTimeoutRef.current);
      closeGroupTimeoutRef.current = null;
    }
  }

  function openGroup(groupId: string) {
    clearPendingGroupClose();

    setOpenGroupId(groupId);
  }

  function scheduleCloseGroup(groupId: string) {
    clearPendingGroupClose();

    closeGroupTimeoutRef.current = window.setTimeout(() => {
      setOpenGroupId((current) => (current === groupId ? null : current));
      closeGroupTimeoutRef.current = null;
    }, 160);
  }

  return (
    <main className="page-shell">
      <section className="canvas">
        <header className="gender-header">
          <p>Choose your pet's gender</p>
          <div className="gender-switch" role="radiogroup" aria-label="Pet gender">
            {GENDER_OPTIONS.map((gender) => (
              <button
                key={gender}
                type="button"
                className={filters.gender === gender ? 'pill active' : 'pill'}
                onClick={() => setGender(gender)}
              >
                {gender[0].toUpperCase() + gender.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <section className="toolbar-main-color">
          <section className="toolbar" aria-label="Top filters">
            {groupedCategories.map((group) => {
              const isActive = group.categoryIds.some((categoryId) =>
                filters.categoryIds.includes(categoryId)
              );
              const isOpen = openGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className={
                    isActive || isOpen ? 'toolbar-group active' : 'toolbar-group'
                  }
                  onMouseEnter={() => openGroup(group.id)}
                  onMouseLeave={() => scheduleCloseGroup(group.id)}
                >
                  <button
                    type="button"
                    className={
                      isActive || isOpen ? 'toolbar-item active' : 'toolbar-item'
                    }
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isOpen}
                  >
                    {group.label}
                    <span aria-hidden="true">{isOpen ? '−' : 'v'}</span>
                  </button>

                  <div
                    className={isOpen ? 'toolbar-dropdown is-open' : 'toolbar-dropdown'}
                  >
                    {group.categories.map((category) => {
                      const isCategoryActive = filters.categoryIds.includes(category.id);

                      return (
                        <button
                          key={category.id}
                          type="button"
                          className={
                            isCategoryActive ? 'dropdown-item is-active' : 'dropdown-item'
                          }
                          onClick={() => toggleCategory(category.id)}
                        >
                          {category.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="selected-container">
            {selectedCategories.length > 0 && (
              <section className="selected-strip" aria-label="Selected filters">
                {selectedCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className="selected-tag"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </section>
            )}
          </section>
        </section>

        <section className="main-area">
          <h1 className="section-title">All pets names</h1>

          <div className="letters-wrap" aria-label="Letters">
            <button
              type="button"
              className={filters.letter === 'ALL' ? 'letter is-active' : 'letter'}
              onClick={() => setLetter('ALL')}
            >
              A
            </button>
            {letterOptions.map((letter) => (
              <button
                key={letter}
                type="button"
                className={filters.letter === letter ? 'letter is-active' : 'letter'}
                onClick={() => setLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          <section className="search-controls" aria-label="Sort and search controls">
            <select
              value={filters.sortDirection}
              onChange={setSortDirection}
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
              onChange={setSearch}
            />
            <button type="button" className="toolbar-clear" onClick={clearFilters}>
              Clear
            </button>
          </section>

          {showCover ? (
            <section className="cover-card">
              <h2>I NEED A NAME</h2>
              <img src={coverPuppy} alt="Puppy sitting" className="cover-image" />
            </section>
          ) : (
            <section className="finder-grid">
              <aside className="names-column" aria-label="Names list">
                <button
                  type="button"
                  className="arrow-btn"
                  disabled={filters.page === 1}
                  onClick={() => changePage(Math.max(1, filters.page - 1))}
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
                  onClick={() => changePage(Math.min(totalPages, filters.page + 1))}
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
                          {getGenderLabel(selectedName.gender)}
                          <span> - {selectedNameCategoryLabel}</span>
                        </p>
                        <h3>{selectedName.name}</h3>
                      </div>
                    </div>
                    <p className="detail-text">{selectedName.description}</p>
                    <p className="detail-subtitle">Related name</p>
                    <p className="detail-meta">{relatedNamesText}</p>
                  </>
                ) : (
                  <p className="detail-placeholder">Select a name to view details.</p>
                )}
              </section>
            </section>
          )}

          <section className="social-links" aria-label="Purina social links">
            <p className="social-label">Follow Purina</p>
            <div className="social-icons">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  aria-label={link.label}
                >
                  <img src={link.icon} alt={link.label} className="social-icon" />
                </a>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

export default App;
