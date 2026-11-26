import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME_COLORS, ThemeService, isHexColor } from './theme.service';

const STORAGE_KEY = 'hytThemeColors';

describe('isHexColor', () => {
  it.each(['#abc', '#ABC', '#0956b6', '#0956B6'])('accepts %s', (value) => {
    expect(isHexColor(value)).toBe(true);
  });

  it.each(['red', '#12345', '#1234567', '0956b6', '#0956b6;color:red', '', null, 42])('rejects %s', (value) => {
    expect(isHexColor(value)).toBe(false);
  });
});

describe('ThemeService', () => {
  let service: ThemeService;
  let rootStyle: CSSStyleDeclaration;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');
    rootStyle = document.documentElement.style;
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('starts with the default colors', () => {
    expect(service.colors()).toEqual(DEFAULT_THEME_COLORS);
    expect(service.hasCustomColors()).toBe(false);
    expect(rootStyle.getPropertyValue('--hyt-brand-primary')).toBe('');
  });

  it('writes the custom primary color on the root element and saves it', () => {
    service.setColors({ primary: '#C62828' });

    expect(rootStyle.getPropertyValue('--hyt-brand-primary')).toBe('#c62828');
    expect(rootStyle.getPropertyValue('--hyt-brand-secondary')).toBe('');
    expect(service.colors()).toEqual({ primary: '#c62828' });
    expect(service.hasCustomColors()).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual({ primary: '#c62828' });
  });

  it('uses the default colors when the color is not valid', () => {
    service.setColors({ primary: '#c62828' });

    service.setColors({ primary: 'red' });

    expect(service.hasCustomColors()).toBe(false);
    expect(rootStyle.getPropertyValue('--hyt-brand-primary')).toBe('');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('removes the variable and the saved colors on reset', () => {
    service.setColors({ primary: '#c62828' });

    service.reset();

    expect(rootStyle.getPropertyValue('--hyt-brand-primary')).toBe('');
    expect(service.colors()).toEqual(DEFAULT_THEME_COLORS);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('restores the colors saved by the last session', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ primary: '#c62828' }));

    service.restoreSavedColors();

    expect(rootStyle.getPropertyValue('--hyt-brand-primary')).toBe('#c62828');
    expect(service.hasCustomColors()).toBe(true);
  });

  it('restores the primary color saved by older versions, which also saved the secondary one', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ primary: '#c62828', secondary: '#00897b' }));

    service.restoreSavedColors();

    expect(service.colors()).toEqual({ primary: '#c62828' });
    expect(rootStyle.getPropertyValue('--hyt-brand-secondary')).toBe('');
  });

  it.each([
    ['not JSON', 'not json'],
    ['a JSON null', 'null'],
    ['an invalid color', JSON.stringify({ primary: 'red' })],
  ])('ignores saved colors that are %s', (_description, saved) => {
    localStorage.setItem(STORAGE_KEY, saved);

    service.restoreSavedColors();

    expect(service.hasCustomColors()).toBe(false);
    expect(rootStyle.getPropertyValue('--hyt-brand-primary')).toBe('');
  });
});
