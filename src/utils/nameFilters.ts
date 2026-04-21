import type { PetName } from '../types';
import type { FiltersState } from '../state/filters';

function matchesGender(name: PetName, gender: FiltersState['gender']): boolean {
  if (gender === 'both') {
    return true;
  }

  return name.gender === gender || name.gender === 'both';
}

function matchesCategories(name: PetName, selectedCategories: string[]): boolean {
  if (selectedCategories.length === 0) {
    return true;
  }

  return selectedCategories.some((categoryId) =>
    name.categoryIds.includes(categoryId)
  );
}

function matchesSearch(name: PetName, search: string): boolean {
  if (!search.trim()) {
    return true;
  }

  return name.name.toLowerCase().includes(search.trim().toLowerCase());
}

function matchesLetter(name: PetName, letter: string): boolean {
  if (letter === 'ALL') {
    return true;
  }

  return name.name[0]?.toUpperCase() === letter;
}

export function filterAndSortNames(
  names: PetName[],
  filters: FiltersState
): PetName[] {
  const filtered = names.filter(
    (name) =>
      matchesGender(name, filters.gender) &&
      matchesCategories(name, filters.categoryIds) &&
      matchesSearch(name, filters.search) &&
      matchesLetter(name, filters.letter)
  );

  return filtered.sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return filters.sortDirection === 'asc' ? comparison : comparison * -1;
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
