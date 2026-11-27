import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_MIN_LENGTH = 8;

/** Same rules as the registration form, one error key per missing rule. */
export const passwordStrength: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = typeof control.value === 'string' ? control.value : '';
  if (!value) {
    return null;
  }
  const errors: ValidationErrors = {};
  if (value.length < PASSWORD_MIN_LENGTH) {
    errors['passwordMinLength'] = true;
  }
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
    errors['passwordCase'] = true;
  }
  if (!/[0-9]/.test(value)) {
    errors['passwordNumber'] = true;
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    errors['passwordSpecialChar'] = true;
  }
  return Object.keys(errors).length > 0 ? errors : null;
};

/** Error when it differs from the `password` sibling. */
export const matchesPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.parent?.get('password');
  if (!password || password.disabled || !control.value) {
    return null;
  }
  return control.value === password.value ? null : { passwordMismatch: true };
};
