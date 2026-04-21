import type { GenderFilter } from '../types';

export type SortDirection = 'asc' | 'desc';

export interface FiltersState {
  gender: GenderFilter;
  categoryIds: string[];
  search: string;
  letter: string;
  sortDirection: SortDirection;
  page: number;
}

export type FiltersAction =
  | { type: 'set-gender'; payload: GenderFilter }
  | { type: 'toggle-category'; payload: string }
  | { type: 'set-categories'; payload: string[] }
  | { type: 'set-search'; payload: string }
  | { type: 'set-letter'; payload: string }
  | { type: 'set-sort'; payload: SortDirection }
  | { type: 'set-page'; payload: number }
  | { type: 'clear-filters' };

export const initialFiltersState: FiltersState = {
  gender: 'both',
  categoryIds: [],
  search: '',
  letter: 'ALL',
  sortDirection: 'asc',
  page: 1
};

function resetPage(state: FiltersState): FiltersState {
  return { ...state, page: 1 };
}

export function filtersReducer(
  state: FiltersState,
  action: FiltersAction
): FiltersState {
  switch (action.type) {
    case 'set-gender':
      return resetPage({ ...state, gender: action.payload });
    case 'toggle-category': {
      const exists = state.categoryIds.includes(action.payload);
      const next = exists
        ? state.categoryIds.filter((id) => id !== action.payload)
        : [...state.categoryIds, action.payload];
      return resetPage({ ...state, categoryIds: next });
    }
    case 'set-categories':
      return resetPage({ ...state, categoryIds: action.payload });
    case 'set-search':
      return resetPage({ ...state, search: action.payload });
    case 'set-letter':
      return resetPage({ ...state, letter: action.payload });
    case 'set-sort':
      return { ...state, sortDirection: action.payload };
    case 'set-page':
      return { ...state, page: action.payload };
    case 'clear-filters':
      return initialFiltersState;
    default:
      return state;
  }
}
