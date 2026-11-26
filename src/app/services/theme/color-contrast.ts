/** Deliberately below the WCAG minimums (3:1, 4.5:1): only really light colors get a warning. */
export const MIN_CONTRAST_ON_WHITE = 2.5;

const WHITE: Rgb = [255, 255, 255];

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb {
  const digits = hex.replace('#', '');
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
}

function toHex(rgb: Rgb): string {
  return '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/** Relative luminance as defined by WCAG. */
function luminance([r, g, b]: Rgb): number {
  const linear = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function ratio(a: Rgb, b: Rgb): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastOnWhite(hex: string): number {
  return ratio(parseHex(hex), WHITE);
}

/** Mixes the color with black just enough to reach the contrast on white, keeping its hue. */
export function darkenForWhite(hex: string, minRatio = MIN_CONTRAST_ON_WHITE): string {
  const rgb = parseHex(hex);
  for (let black = 0; black <= 100; black++) {
    const mixed = rgb.map((v) => (v * (100 - black)) / 100) as Rgb;
    if (ratio(mixed, WHITE) >= minRatio) {
      return toHex(mixed);
    }
  }
  return '#000000';
}
