import { describe, expect, it } from 'vitest';
import { initialFiltersState } from '../state/filters';
import type { PetName } from '../types';
import { filterAndSortNames, paginate } from './nameFilters';

const fixtureNames: PetName[] = [
  {
    id: '1',
    name: 'Luna',
    description: 'test',
    gender: 'female',
    categoryIds: ['nature'],
    relatedNameIds: []
  },
  {
    id: '2',
    name: 'Milo',
    description: 'test',
    gender: 'male',
    categoryIds: ['classic'],
    relatedNameIds: []
  },
  {
    id: '3',
    name: 'Riley',
    description: 'test',
    gender: 'both',
    categoryIds: ['nature', 'classic'],
    relatedNameIds: []
  }
];

describe('filterAndSortNames', () => {
  it('returns only female + unisex names when gender is female', () => {
    const filtered = filterAndSortNames(fixtureNames, {
      ...initialFiltersState,
      gender: 'female'
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((item) => item.gender !== 'male')).toBe(true);
  });

  it('applies search and letter filters together', () => {
    const filtered = filterAndSortNames(fixtureNames, {
      ...initialFiltersState,
      search: 'lu',
      letter: 'L'
    });

    expect(filtered.map((item) => item.name)).toEqual(['Luna']);
  });

  it('matches any selected category', () => {
    const filtered = filterAndSortNames(fixtureNames, {
      ...initialFiltersState,
      categoryIds: ['classic', 'nature']
    });

    expect(filtered.map((item) => item.name)).toEqual(['Luna', 'Milo', 'Riley']);
  });
});

describe('paginate', () => {
  it('returns the expected page size window', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    expect(paginate(items, 2, 2)).toEqual(['c', 'd']);
  });
});
