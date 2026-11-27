import { SaveError, parseSaveError } from '../admin-save-errors';

export const USER_FORM_FIELDS = ['username', 'name', 'lastname', 'email', 'password', 'passwordConfirm'] as const;
export type UserFormField = (typeof USER_FORM_FIELDS)[number];

export type UserSaveError = SaveError<UserFormField>;

export function parseUserSaveError(error: unknown): UserSaveError[] {
  return parseSaveError(error, USER_FORM_FIELDS);
}
