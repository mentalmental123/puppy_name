import { useMemo, useState } from 'react';
import type { Category, PetName } from '../types';

interface NameCardProps {
  item: PetName;
  allNames: PetName[];
  categories: Category[];
}

export function NameCard({ item, allNames, categories }: NameCardProps) {
  const [open, setOpen] = useState(false);

  const relatedNames = useMemo(
    () =>
      allNames
        .filter((candidate) => item.relatedNameIds.includes(candidate.id))
        .map((candidate) => candidate.name),
    [allNames, item.relatedNameIds]
  );

  const categoryLabels = useMemo(
    () =>
      categories
        .filter((category) => item.categoryIds.includes(category.id))
        .map((category) => category.label),
    [categories, item.categoryIds]
  );

  return (
    <article className="name-card">
      <button
        type="button"
        className="name-card-main"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div>
          <h3>{item.name}</h3>
          <p className="meta">{item.gender === 'both' ? 'Unisex' : item.gender}</p>
        </div>
        <span className="expand-icon" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>

      <div className={open ? 'details open' : 'details'}>
        <p>{item.description}</p>
        <p className="meta">Categories: {categoryLabels.join(', ')}</p>
        <p className="meta">Related: {relatedNames.join(', ') || 'None'}</p>
      </div>
    </article>
  );
}
