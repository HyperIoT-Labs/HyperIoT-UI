import { HttpErrorResponse } from '@angular/common/http';
import { parseUserSaveError } from './admin-user-errors';

function httpError(body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status: 422, error: body });
}

describe('parseUserSaveError', () => {
  it('maps a duplicate entity to its field', () => {
    const errors = parseUserSaveError(
      httpError({ type: 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException', errorMessages: ['email'] }),
    );
    expect(errors).toEqual([{ field: 'email', message: 'Already in use' }]);
  });

  it('maps validation errors, with or without the "huser-" prefix', () => {
    const errors = parseUserSaveError(
      httpError({
        type: 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException',
        validationErrors: [
          { field: 'huser-username', message: 'invalid username' },
          { field: 'lastName', message: 'too long' },
          { field: 'huser-unknown', message: 'something else' },
        ],
      }),
    );
    expect(errors).toEqual([
      { field: 'username', message: 'invalid username' },
      { field: 'lastname', message: 'too long' },
      { field: undefined, message: 'something else' },
    ]);
  });

  it('returns a generic message for any other error', () => {
    expect(parseUserSaveError(new Error('network'))).toEqual([{ message: 'Error executing your request' }]);
    expect(parseUserSaveError(httpError({ type: 'other' }))).toEqual([{ message: 'Error executing your request' }]);
  });
});
