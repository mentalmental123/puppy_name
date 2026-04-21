export type Gender = 'male' | 'female' | 'both';

export type GenderFilter = 'male' | 'female' | 'both';

export interface Category {
  id: string;
  label: string;
  description?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  categoryIds: string[];
}

export interface PetName {
  id: string;
  name: string;
  gender: Gender;
  categoryIds: string[];
  description: string;
  relatedNameIds: string[];
}

export interface PetDataResponse {
  categories: Category[];
  filterGroups: FilterGroup[];
  names: PetName[];
  letters: string[];
}

export interface ApiEnvelope<T> {
  data: T;
}

export interface RawCategory {
  id: string;
  name: string;
  description?: string;
}

export interface RawFilterGroup {
  id: string;
  label: string;
  categoryIds: string[];
}

export interface RawCategoriesFile extends ApiEnvelope<RawCategory[]> {
  filterGroups?: RawFilterGroup[];
}

export interface RawName {
  id: string;
  title: string;
  definition: string;
  gender: string[];
  categories: string[];
}
