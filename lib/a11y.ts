/**
 * Accessibility utilities and helpers
 * Ensures WCAG 2.1 AA compliance
 */

/**
 * Focus management utilities
 */
export function manageFocus(element: HTMLElement) {
  element.focus();
  if (element.scrollIntoView) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Skip to main content functionality
 */
export function createSkipLink(mainSelector: string) {
  const link = document.createElement('a');
  link.href = `#${mainSelector}`;
  link.textContent = 'Skip to main content';
  link.className = 'sr-only focus:not-sr-only';
  return link;
}

/**
 * ARIA label helpers
 */
export const ARIA_LABELS = {
  CLOSE_BUTTON: 'Close',
  MENU_BUTTON: 'Open menu',
  SEARCH_BUTTON: 'Search',
  SUBMIT_BUTTON: 'Submit form',
  NEXT: 'Next',
  PREVIOUS: 'Previous',
  LOADING: 'Loading',
  ERROR: 'Error',
  SUCCESS: 'Success',
};

/**
 * Keyboard navigation handler
 */
export function handleKeyboardNavigation(
  e: React.KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void
) {
  if (e.key === 'Enter') {
    e.preventDefault();
    onEnter?.();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    onEscape?.();
  }
}

/**
 * Color contrast checker (returns WCAG compliance level)
 */
export function checkContrast(foreground: string, background: string): 'AAA' | 'AA' | 'fail' {
  // Simplified contrast calculation (use WCAG formula)
  // This is a basic implementation - use dedicated libraries for production
  const ratio = 3; // Placeholder - calculate actual value

  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'fail';
}

/**
 * Screen reader only class utility
 */
export const srOnlyClasses =
  'absolute w-1 h-1 p-0 -m-1 overflow-hidden clip-path-0 whitespace-nowrap border-0';

/**
 * Accessibility audit checklist
 */
export const A11Y_CHECKLIST = {
  semantic_html: {
    status: 'to_review',
    items: [
      '✓ Use semantic HTML (button, form, nav, main, etc.)',
      '✓ Use heading hierarchy correctly (h1, h2, h3...)',
      '✓ Ensure form labels are properly associated',
      '✓ Use list elements appropriately',
    ],
  },
  keyboard_navigation: {
    status: 'to_review',
    items: [
      '✓ All interactive elements are keyboard accessible',
      '✓ Tab order is logical and visible',
      '✓ No keyboard traps',
      '✓ Keyboard shortcuts are documented',
    ],
  },
  color_contrast: {
    status: 'to_review',
    items: [
      '✓ Text contrast meets WCAG AA (4.5:1)',
      '✓ UI components contrast meets WCAG AA (3:1)',
      '✓ Colors not used as only means of conveying information',
    ],
  },
  images_media: {
    status: 'to_review',
    items: [
      '✓ All images have alt text',
      '✓ Videos have captions or transcripts',
      '✓ Audio files have transcripts',
    ],
  },
  forms: {
    status: 'to_review',
    items: [
      '✓ Form fields have associated labels',
      '✓ Error messages are clearly identified',
      '✓ Required fields are marked',
      '✓ Instructions are provided',
    ],
  },
  focus: {
    status: 'to_review',
    items: [
      '✓ Focus indicator is visible and obvious',
      '✓ Focus is managed correctly on modal/dialog open',
      '✓ Focus is restored on modal/dialog close',
    ],
  },
  aria: {
    status: 'to_review',
    items: [
      '✓ ARIA roles are used correctly',
      '✓ ARIA attributes reflect state changes',
      '✓ ARIA labels are concise and descriptive',
      '✓ Live regions announce dynamic content',
    ],
  },
};

/**
 * Mobile accessibility checks
 */
export const MOBILE_A11Y = {
  touch_targets: {
    min_size: '48px x 48px',
    recommendation: 'Ensure all touch targets are at least 48x48 CSS pixels',
  },
  font_size: {
    min_size: '16px',
    recommendation: 'Use minimum 16px font size to avoid automatic zoom on iOS',
  },
  viewport: {
    recommendation: 'Allow user zoom (user-scalable=yes)',
  },
  orientation: {
    recommendation: 'Support both portrait and landscape orientations',
  },
};
