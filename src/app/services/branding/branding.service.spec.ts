import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UIBrandingService } from 'core';
import { of, throwError } from 'rxjs';
import { HyperiotLogoMobilePath, HyperiotLogoPath } from '../../constants';
import { DEFAULT_THEME_COLORS, ThemeService } from '../theme/theme.service';
import { BrandingService, formatColorScheme, parseColorScheme } from './branding.service';

describe('parseColorScheme', () => {
  it('reads the JSON string saved by the ui-branding API', () => {
    expect(parseColorScheme('{"primaryColor":"#C62828"}')).toEqual({ primary: '#c62828' });
  });

  it('reads an object with the same fields', () => {
    expect(parseColorScheme({ primaryColor: '#abc' })).toEqual({ primary: '#abc' });
  });

  it('ignores the secondary color saved by older versions', () => {
    expect(parseColorScheme('{"primaryColor":"#c62828","secondaryColor":"#00897b"}'))
      .toEqual({ primary: '#c62828' });
  });

  it.each([
    ['malformed JSON', '{primaryColor:'],
    ['a JSON null', 'null'],
    ['a number', 42],
    ['undefined', undefined],
    ['a missing primary color', '{"secondaryColor":"#00897b"}'],
    ['a color name', '{"primaryColor":"red"}'],
  ])('returns null for %s', (_description, value) => {
    expect(parseColorScheme(value)).toBeNull();
  });
});

describe('formatColorScheme', () => {
  it('writes the format read by parseColorScheme', () => {
    const colors = { primary: '#c62828' };

    expect(JSON.parse(formatColorScheme(colors))).toEqual({ primaryColor: '#c62828' });
    expect(parseColorScheme(formatColorScheme(colors))).toEqual(colors);
  });
});

describe('BrandingService', () => {
  const brandingUrl = '/hyperiot/ui-branding';
  const customColors = { primary: '#c62828' };
  const savedBranding = {
    colorScheme: formatColorScheme(customColors),
    logoBase64: 'bG9nbw==',
  };

  let getUIBranding: ReturnType<typeof vi.fn>;
  let service: BrandingService;
  let themeService: ThemeService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');
    getUIBranding = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UIBrandingService, useValue: { getUIBranding } },
      ],
    });
    service = TestBed.inject(BrandingService);
    themeService = TestBed.inject(ThemeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('starts with the HyperIoT logo and colors', () => {
    expect(service.logo()).toEqual({ standard: HyperiotLogoPath, mobile: HyperiotLogoMobilePath });
    expect(service.isBranded()).toBe(false);
    expect(themeService.colors()).toEqual(DEFAULT_THEME_COLORS);
  });

  it('applies the saved branding on load', () => {
    getUIBranding.mockReturnValue(of(savedBranding));

    service.load();

    expect(service.isBranded()).toBe(true);
    expect(service.logo().standard).not.toBe(HyperiotLogoPath);
    expect(service.logo().mobile).toBe(service.logo().standard);
    expect(themeService.colors()).toEqual(customColors);
  });

  it('keeps the HyperIoT logo when the saved branding has none', () => {
    getUIBranding.mockReturnValue(of({ colorScheme: savedBranding.colorScheme }));

    service.load();

    expect(service.isBranded()).toBe(true);
    expect(service.logo().standard).toBe(HyperiotLogoPath);
  });

  it('uses the default colors when the saved color scheme is not valid', () => {
    themeService.setColors(customColors);
    getUIBranding.mockReturnValue(of({ colorScheme: 'not json', logoBase64: 'bG9nbw==' }));

    service.load();

    expect(themeService.hasCustomColors()).toBe(false);
  });

  it('goes back to the defaults when the branding cannot be loaded', () => {
    themeService.setColors(customColors);
    getUIBranding.mockReturnValue(throwError(() => new Error('Not found')));

    service.load();

    expect(service.isBranded()).toBe(false);
    expect(themeService.hasCustomColors()).toBe(false);
  });

  it('saves only the colors with a PATCH when there is no new logo', () => {
    let saved = false;
    service.save({ colors: customColors }).subscribe(() => saved = true);

    const request = http.expectOne(brandingUrl);
    expect(request.request.method).toBe('PATCH');
    const body = request.request.body as FormData;
    expect(body.get('colorScheme')).toBe(formatColorScheme(customColors));
    expect(body.has('logo')).toBe(false);

    request.flush(savedBranding);

    expect(saved).toBe(true);
    expect(service.isBranded()).toBe(true);
    expect(themeService.colors()).toEqual(customColors);
  });

  it('saves colors and logo with a PUT when there is a new logo', () => {
    const logo = new File(['logo'], 'logo.png', { type: 'image/png' });
    service.save({ colors: customColors, logo }).subscribe();

    const request = http.expectOne(brandingUrl);
    expect(request.request.method).toBe('PUT');
    const body = request.request.body as FormData;
    expect(body.get('colorScheme')).toBe(formatColorScheme(customColors));
    expect(body.get('logo')).toBeInstanceOf(File);
    expect(body.get('favicon')).toBeInstanceOf(File);
    request.flush(savedBranding);

    expect(service.logo().standard).not.toBe(HyperiotLogoPath);
  });

  it('does not change the branding when saving fails', () => {
    let failed = false;
    service.save({ colors: customColors }).subscribe({ error: () => failed = true });

    http.expectOne(brandingUrl).flush('Error', { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
    expect(service.isBranded()).toBe(false);
    expect(themeService.hasCustomColors()).toBe(false);
  });

  it('deletes the branding and goes back to the defaults', () => {
    getUIBranding.mockReturnValue(of(savedBranding));
    service.load();

    service.restoreDefaults().subscribe();
    const request = http.expectOne(brandingUrl);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);

    expect(service.isBranded()).toBe(false);
    expect(service.logo().standard).toBe(HyperiotLogoPath);
    expect(themeService.hasCustomColors()).toBe(false);
  });

  it('forgets the branding without calling the API on clear', () => {
    getUIBranding.mockReturnValue(of(savedBranding));
    service.load();

    service.clear();

    expect(service.isBranded()).toBe(false);
    expect(service.logo().standard).toBe(HyperiotLogoPath);
    expect(themeService.hasCustomColors()).toBe(false);
  });
});
