import { closeTodayDisclosure } from './today-focus-restoration';

type ClosestTarget = {
  closest: (selector: string) => Element | null;
};

type CloseReviewRoot = Pick<Document, 'addEventListener' | 'removeEventListener'>;

export function bindTodayCloseReviewDismissal(root: CloseReviewRoot): () => void {
  const closeReview = (target: EventTarget | null) => {
    if (!isClosestTarget(target)) return false;
    const review = target.closest('[data-today-close-review]') as HTMLDetailsElement | null;
    if (!review) return false;
    closeTodayDisclosure(review);
    return true;
  };
  const dismissOnClick = (event: Event) => {
    if (
      !isClosestTarget(event.target) ||
      !event.target.closest('[data-today-close-review-dismiss]')
    ) {
      return;
    }
    if (closeReview(event.target)) event.preventDefault();
  };
  const dismissOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeReview(event.target)) event.preventDefault();
  };

  root.addEventListener('click', dismissOnClick);
  root.addEventListener('keydown', dismissOnEscape);
  return () => {
    root.removeEventListener('click', dismissOnClick);
    root.removeEventListener('keydown', dismissOnEscape);
  };
}

function isClosestTarget(target: EventTarget | null): target is EventTarget & ClosestTarget {
  return typeof (target as Partial<ClosestTarget> | null)?.closest === 'function';
}
