import type { Category, PetName } from '../types';
import { NameCard } from './NameCard';

interface NameListProps {
  items: PetName[];
  allNames: PetName[];
  categories: Category[];
}

export function NameList({ items, allNames, categories }: NameListProps) {
  if (items.length === 0) {
    return (
      <section className="name-list empty">
        <h2>No names match your filters</h2>
        <p>Try changing gender, search text, or category selection.</p>
      </section>
    );
  }

  return (
    <section className="name-list" aria-live="polite">
      {items.map((item) => (
        <NameCard key={item.id} item={item} allNames={allNames} categories={categories} />
      ))}
    </section>
  );
}
