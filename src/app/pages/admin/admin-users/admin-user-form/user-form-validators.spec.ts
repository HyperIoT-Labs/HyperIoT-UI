import { FormControl, FormGroup } from '@angular/forms';
import { matchesPassword, passwordStrength } from './user-form-validators';

describe('passwordStrength', () => {
  const check = (value: string) => passwordStrength(new FormControl(value));

  it('accepts an empty value (required is a separate validator)', () => {
    expect(check('')).toBeNull();
  });

  it('accepts a password that meets every rule', () => {
    expect(check('Secret#2026')).toBeNull();
  });

  it('reports each missing rule', () => {
    expect(check('abc')).toEqual({
      passwordMinLength: true,
      passwordCase: true,
      passwordNumber: true,
      passwordSpecialChar: true,
    });
    expect(check('lowercase1!x')).toEqual({ passwordCase: true });
    expect(check('NoNumbers!!')).toEqual({ passwordNumber: true });
    expect(check('NoSpecial123')).toEqual({ passwordSpecialChar: true });
  });
});

describe('matchesPassword', () => {
  function group(password: string, confirm: string): FormGroup {
    const form = new FormGroup({
      password: new FormControl(password),
      passwordConfirm: new FormControl(confirm, matchesPassword),
    });
    // the validator reads the parent, missing at creation
    form.get('passwordConfirm')?.updateValueAndValidity();
    return form;
  }

  it('is valid when the two values are equal', () => {
    expect(group('Secret#2026', 'Secret#2026').get('passwordConfirm')?.errors).toBeNull();
  });

  it('reports a mismatch', () => {
    expect(group('Secret#2026', 'Other#2026').get('passwordConfirm')?.errors).toEqual({ passwordMismatch: true });
  });

  it('ignores the check when the password is disabled', () => {
    const form = group('Secret#2026', 'Other#2026');
    form.get('password')?.disable();
    form.get('passwordConfirm')?.updateValueAndValidity();
    expect(form.get('passwordConfirm')?.errors).toBeNull();
  });
});
