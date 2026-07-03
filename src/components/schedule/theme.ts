import type { BlockCategory } from '../../domain/models';

export type CategoryTheme = {
  label: string;
  background: string;
  border: string;
  text: string;
  marker: string;
};

export const orderedBlockCategories: BlockCategory[] = ['work', 'home', 'training'];

const categoryThemes: Record<BlockCategory, CategoryTheme> = {
  work: {
    label: 'Work',
    background: 'var(--chronos-primary-soft, #e0e7ff)',
    border: 'var(--chronos-border-strong, #a5b4fc)',
    text: 'var(--chronos-primary-strong, #312e81)',
    marker: 'var(--chronos-primary, #4f46e5)',
  },
  home: {
    label: 'Home',
    background: 'var(--chronos-sky-soft, #e0f2fe)',
    border: 'var(--chronos-sky, #7dd3fc)',
    text: 'var(--chronos-sky-text, #075985)',
    marker: 'var(--chronos-sky, #0ea5e9)',
  },
  training: {
    label: 'Training',
    background: 'var(--chronos-success-soft, #d1fae5)',
    border: 'var(--chronos-success, #6ee7b7)',
    text: 'var(--chronos-success-text, #065f46)',
    marker: 'var(--chronos-success, #059669)',
  },
};

export function getCategoryTheme(category: BlockCategory): CategoryTheme {
  return categoryThemes[category];
}
