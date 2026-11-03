import { describe, expect, it } from 'vitest';
import { parentRoute, parseRoute, Route, routePath } from './routes';

describe('page URLs', () => {
  const routes: Route[] = [
    { view: 'dashboard' }, { view: 'accounts' }, { view: 'settings' },
    { view: 'manage_accounts' }, { view: 'manage_owners' }, { view: 'manage_categories' },
    { view: 'add_account' }, { view: 'add_owner' }, { view: 'add_category' },
    { view: 'add_account', id: 'account / 中文' },
    { view: 'add_owner', id: 'owner?#' }, { view: 'add_category', id: 'category%' },
    { view: 'entry' }, { view: 'entry', accountId: 'account / 中文' },
    { view: 'entry', accountId: 'account / 中文', id: 'record?#' },
  ];

  it.each(routes)('restores $view and its entity from the URL', route => {
    expect(parseRoute(routePath(route))).toEqual(route);
  });

  it('gives new and edit pages distinct URLs', () => {
    expect(routePath({ view: 'add_account' })).not.toBe(routePath({ view: 'add_account', id: 'a' }));
    expect(routePath({ view: 'entry', accountId: 'a' })).not.toBe(routePath({ view: 'entry', accountId: 'a', id: 'r' }));
  });

  it('accepts trailing slashes', () => {
    expect(parseRoute('/settings/accounts/')).toEqual({ view: 'manage_accounts' });
  });

  it.each(['/missing', '/accounts/a', '/owners/a/edit/extra', '/accounts/%ZZ/edit', '/accounts/a/records/%ZZ/edit'])(
    'does not turn invalid URL %s into a new entity form', path => {
      expect(parseRoute(path)).toBeNull();
    },
  );

  it.each([
    ['add_account', 'manage_accounts'], ['add_owner', 'manage_owners'],
    ['add_category', 'manage_categories'], ['entry', 'accounts'],
    ['manage_accounts', 'settings'], ['manage_owners', 'settings'], ['manage_categories', 'settings'],
    ['settings', 'dashboard'],
  ] as const)('can return from direct links to %s', (view, parent) => {
    expect(parentRoute({ view, id: 'test' })).toEqual({ view: parent });
  });
});
