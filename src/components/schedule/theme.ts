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
    background: '#ccfbf1',
    border: '#5eead4',
    text: '#134e4a',
    marker: '#0f766e',
  },
  home: {
    label: 'Home',
    background: '#fce7f3',
    border: '#f9a8d4',
    text: '#9d174d',
    marker: '#be185d',
  },
  training: {
    label: 'Training',
    background: '#ede9fe',
    border: '#c4b5fd',
    text: '#5b21b6',
    marker: '#6d28d9',
  },
};

export function getCategoryTheme(category: BlockCategory): CategoryTheme {
  return categoryThemes[category];
}
