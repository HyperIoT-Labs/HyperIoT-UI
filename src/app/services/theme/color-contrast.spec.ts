import { MIN_CONTRAST_ON_WHITE, contrastOnWhite, darkenForWhite } from './color-contrast';

describe('contrastOnWhite', () => {
  it.each([
    ['#ffffff', 1],
    ['#fff', 1],
    ['#000000', 21],
    ['#767676', 4.54],
    ['#0956b6', 6.96],
    ['#ffeb3b', 1.22],
  ])('gives the WCAG contrast of %s', (hex, expected) => {
    expect(contrastOnWhite(hex)).toBeCloseTo(expected, 1);
  });
});

describe('darkenForWhite', () => {
  it('keeps a color that already has enough contrast', () => {
    expect(darkenForWhite('#0956b6')).toBe('#0956b6');
  });

  it.each(['#ffeb3b', '#ff9800', '#17a4fa', '#ffffff'])('darkens %s just enough', (hex) => {
    const darker = darkenForWhite(hex);

    expect(contrastOnWhite(darker)).toBeGreaterThanOrEqual(MIN_CONTRAST_ON_WHITE);
    expect(contrastOnWhite(darker)).toBeLessThan(MIN_CONTRAST_ON_WHITE + 0.5);
  });

  it('keeps the hue: only the lightness changes', () => {
    expect(darkenForWhite('#ff9800')).toMatch(/^#[0-9a-f]{2}[0-9a-f]{2}00$/);
  });

  it('accepts another target, such as the WCAG minimum for text', () => {
    expect(contrastOnWhite(darkenForWhite('#ffeb3b', 4.5))).toBeGreaterThanOrEqual(4.5);
  });
});
