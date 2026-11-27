import { HUser } from 'core';
import { filterUsers, sortUsers, userDisplayName } from './admin-users-list';

function user(fields: Partial<HUser>): HUser {
  return { entityVersion: 1, ...fields };
}

const anna = user({ id: 1, name: 'Anna', lastname: 'Rossi', username: 'arossi', email: 'anna@example.com' });
const bruno = user({ id: 2, name: 'bruno', lastname: 'Bianchi', username: 'zbruno', email: 'b@test.org' });
const nameless = user({ id: 3, username: 'carlo', email: 'carlo@example.com' });

describe('userDisplayName', () => {
  it('joins name and last name', () => {
    expect(userDisplayName(anna)).toBe('Anna Rossi');
  });

  it('falls back to the username', () => {
    expect(userDisplayName(nameless)).toBe('carlo');
  });

  it('returns an empty string when nothing is set', () => {
    expect(userDisplayName(user({}))).toBe('');
  });
});

describe('filterUsers', () => {
  const users = [anna, bruno, nameless];

  it('returns every user for an empty or blank term', () => {
    expect(filterUsers(users, '   ')).toEqual(users);
  });

  it('matches name, last name, username and email, ignoring case', () => {
    expect(filterUsers(users, 'ROSSI')).toEqual([anna]);
    expect(filterUsers(users, 'zbru')).toEqual([bruno]);
    expect(filterUsers(users, 'example.com')).toEqual([anna, nameless]);
  });

  it('returns no user when nothing matches', () => {
    expect(filterUsers(users, 'nobody')).toEqual([]);
  });
});

describe('sortUsers', () => {
  const users = [bruno, nameless, anna];

  it('sorts by display name ignoring case', () => {
    expect(sortUsers(users, { field: 'name', direction: 'asc' })).toEqual([anna, bruno, nameless]);
  });

  it('sorts in descending order', () => {
    expect(sortUsers(users, { field: 'username', direction: 'desc' })).toEqual([bruno, nameless, anna]);
  });

  it('does not change the input array', () => {
    const input = [...users];
    sortUsers(input, { field: 'email', direction: 'asc' });
    expect(input).toEqual(users);
  });
});
