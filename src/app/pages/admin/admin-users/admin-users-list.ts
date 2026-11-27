import { HUser } from 'core';

export type UserSortField = 'name' | 'username' | 'email';

export interface UserSort {
  field: UserSortField;
  direction: 'asc' | 'desc';
}

/** Name and last name, or the username when both are missing. */
export function userDisplayName(user: HUser): string {
  const fullName = [user.name, user.lastname].filter(Boolean).join(' ').trim();
  return fullName || user.username || '';
}

/** Users whose name, last name, username or email contain the term (case insensitive). */
export function filterUsers(users: readonly HUser[], term: string): HUser[] {
  const needle = term.trim().toLowerCase();
  if (!needle) {
    return [...users];
  }
  return users.filter(user =>
    [user.name, user.lastname, user.username, user.email]
      .some(value => (value ?? '').toLowerCase().includes(needle)),
  );
}

function sortValue(user: HUser, field: UserSortField): string {
  switch (field) {
    case 'name':
      return userDisplayName(user);
    case 'username':
      return user.username ?? '';
    case 'email':
      return user.email ?? '';
  }
}

export function sortUsers(users: readonly HUser[], sort: UserSort): HUser[] {
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...users].sort((a, b) =>
    factor * sortValue(a, sort.field).localeCompare(sortValue(b, sort.field), undefined, { sensitivity: 'base' }),
  );
}
