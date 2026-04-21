# Pet Name Finder (Frontend Test Assignment)

A simple and transparent React + Vite + TypeScript project for browsing pet names with synchronized filters.

## Features

- Gender selection: `Male` / `Female` / `Both`
- Category filtering (multi-select)
- Alphabetical search + letter filter + A-Z/Z-A sorting
- Name details panel with:
  - Description
  - Related names
- Responsive layout (desktop and tablet)
- Pagination for performance
- Error boundary
- Unit tests for filtering/pagination logic

## Tech Stack

- React (Hooks)
- TypeScript
- Vite
- `useReducer` for app state management
- Vitest + Testing Library setup
- ESLint + Prettier

## Project Structure

```text
src/
  data/                # Local JSON data + image assets
  hooks/               # Data loading hook
  services/            # API fetch + normalization + fallback logic
  state/               # Filter reducer and actions
  types/               # Shared TypeScript types and raw API types
  utils/               # Filter/sort/pagination business logic + tests
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env example:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm run dev
```

4. Run tests:

```bash
npm run test
```

## API Integration

The app uses local fallback data if API is unavailable.

Current remote sources:

```bash
VITE_LETTERS_URL=https://drive.google.com/file/d/1h5j_jp_8U14_l1d4pOUEmL3en19UQY4U/view
VITE_NAMES_URL=https://drive.google.com/file/d/1FnVX4aGPSHYiXUp8Zn3QbTdZkhPlClq9/view
VITE_CATEGORIES_URL=https://drive.google.com/file/d/1fSm8XBBfV3lcCjNzYEbXA_orrljbA-YU/view
```

The loader automatically converts Google Drive `.../view` links to direct download links.

Supported API payloads:

- Letters:

```json
{ "data": ["A", "B", "C"] }
```

- Names:

```json
{
  "data": [
    {
      "id": "...",
      "title": "Aaron",
      "definition": "<p>...</p>",
      "gender": ["M"],
      "categories": ["category-id"]
    }
  ]
}
```

- Categories:

```json
{
  "data": [
    {
      "id": "...",
      "name": "Cartoon",
      "description": "<p>...</p>"
    }
  ]
}
```

Normalization rules:

- `title` -> internal `name`
- `definition`/`description` HTML -> plain text
- `gender: ["M"]` -> `male`, `["F"]` -> `female`, both -> `both`
- related names are generated from shared categories

## Architecture Notes

- `usePetData` loads once at startup.
- `petDataService` fetches, normalizes, and falls back to local data.
- `filtersReducer` stores all UI filter state.
- `filterAndSortNames` + pagination derive visible results from source data.
- Categories from `categories.json.filterGroups` drive the top filter tabs.

## Assumptions

- Category filtering is OR-based when selecting multiple categories.
- Selecting `Male` shows male + unisex names.
- Selecting `Female` shows female + unisex names.
- If API has no related names, the app derives up to 3 related names by category overlap.
