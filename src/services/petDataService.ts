import localCategoriesFile from '../data/categories.json';
import localLettersFile from '../data/letters.json';
import localNamesFile from '../data/names.json';
import type {
  ApiEnvelope,
  Category,
  FilterGroup,
  Gender,
  PetDataResponse,
  PetName,
  RawCategoriesFile,
  RawCategory,
  RawFilterGroup,
  RawName
} from '../types';

function normalizeDriveUrl(url: string): string {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)\//);

  if (!match) {
    return url;
  }

  return `https://drive.google.com/uc?export=download&id=${match[1]}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(normalizeDriveUrl(url));

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function unwrapArrayData<T>(payload: T[] | ApiEnvelope<T[]>): T[] {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    Array.isArray((payload as ApiEnvelope<T[]>).data)
  ) {
    return (payload as ApiEnvelope<T[]>).data;
  }

  return payload as T[];
}

function toGender(genderCodes: string[]): Gender {
  const normalizedCodes = new Set(genderCodes.map((item) => item.toUpperCase().trim()));

  const hasMale = normalizedCodes.has('M') || normalizedCodes.has('MALE');
  const hasFemale = normalizedCodes.has('F') || normalizedCodes.has('FEMALE');

  if (hasMale && hasFemale) {
    return 'both';
  }

  if (hasMale) {
    return 'male';
  }

  if (hasFemale) {
    return 'female';
  }

  return 'both';
}

function htmlToText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function normalizeCategories(rawCategories: RawCategory[]): Category[] {
  return rawCategories.map((item) => ({
    id: item.id,
    label: item.name,
    description: htmlToText(item.description ?? '')
  }));
}

function normalizeFilterGroups(rawFilterGroups: RawFilterGroup[] | undefined): FilterGroup[] {
  if (!rawFilterGroups?.length) {
    return [];
  }

  return rawFilterGroups.map((group) => ({
    id: group.id,
    label: group.label,
    categoryIds: group.categoryIds
  }));
}

function buildRelatedNameIds(names: PetName[], target: PetName): string[] {
  return names
    .filter((item) => item.id !== target.id)
    .map((item) => {
      const overlap = item.categoryIds.filter((id) => target.categoryIds.includes(id)).length;
      return { id: item.id, name: item.name, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || a.name.localeCompare(b.name))
    .slice(0, 3)
    .map((item) => item.id);
}

function normalizeNames(rawNames: RawName[]): PetName[] {
  const baseNames: PetName[] = rawNames.map((item) => ({
    id: item.id,
    name: item.title,
    description: htmlToText(item.definition),
    gender: toGender(item.gender),
    categoryIds: item.categories,
    relatedNameIds: []
  }));

  return baseNames.map((item) => ({
    ...item,
    relatedNameIds: buildRelatedNameIds(baseNames, item)
  }));
}

function normalizeCategoriesPayload(
  payload: RawCategoriesFile | ApiEnvelope<RawCategory[]> | RawCategory[]
): { categories: Category[]; filterGroups: FilterGroup[] } {
  if (Array.isArray(payload)) {
    return {
      categories: normalizeCategories(payload),
      filterGroups: []
    };
  }

  const rawCategories = unwrapArrayData(payload);
  const filterGroups = 'filterGroups' in payload ? payload.filterGroups : undefined;

  return {
    categories: normalizeCategories(rawCategories),
    filterGroups: normalizeFilterGroups(filterGroups)
  };
}

function normalizeLettersPayload(payload: ApiEnvelope<string[]> | string[]): string[] {
  return unwrapArrayData(payload);
}

function normalizeNamesPayload(payload: ApiEnvelope<RawName[]> | RawName[]): PetName[] {
  return normalizeNames(unwrapArrayData(payload));
}

function buildLocalFallback(): PetDataResponse {
  const categoriesBundle = normalizeCategoriesPayload(localCategoriesFile as RawCategoriesFile);

  return {
    categories: categoriesBundle.categories,
    filterGroups: categoriesBundle.filterGroups,
    names: normalizeNamesPayload(localNamesFile as ApiEnvelope<RawName[]>),
    letters: normalizeLettersPayload(localLettersFile as ApiEnvelope<string[]>)
  };
}

export async function loadPetData(): Promise<PetDataResponse> {
  const categoriesUrl = import.meta.env.VITE_CATEGORIES_URL as string | undefined;
  const namesUrl = import.meta.env.VITE_NAMES_URL as string | undefined;
  const lettersUrl = import.meta.env.VITE_LETTERS_URL as string | undefined;

  if (!categoriesUrl || !namesUrl || !lettersUrl) {
    return buildLocalFallback();
  }

  try {
    const [categoriesPayload, namesPayload, lettersPayload] = await Promise.all([
      fetchJson<RawCategoriesFile | ApiEnvelope<RawCategory[]> | RawCategory[]>(categoriesUrl),
      fetchJson<RawName[] | ApiEnvelope<RawName[]>>(namesUrl),
      fetchJson<string[] | ApiEnvelope<string[]>>(lettersUrl)
    ]);

    const categoriesBundle = normalizeCategoriesPayload(categoriesPayload);
    const names = normalizeNamesPayload(namesPayload);
    const letters = normalizeLettersPayload(lettersPayload);

    return {
      categories: categoriesBundle.categories,
      filterGroups: categoriesBundle.filterGroups,
      names,
      letters
    };
  } catch {
    return buildLocalFallback();
  }
}
