export type View = 'dashboard' | 'accounts' | 'settings' | 'entry' |
  'add_account' | 'add_owner' | 'add_category' |
  'manage_accounts' | 'manage_owners' | 'manage_categories';

export interface Route {
  view: View;
  id?: string;
  accountId?: string;
}

const paths: Record<View, string> = {
  dashboard: '/',
  accounts: '/accounts',
  settings: '/settings',
  entry: '/records/new',
  add_account: '/accounts/new',
  add_owner: '/owners/new',
  add_category: '/categories/new',
  manage_accounts: '/settings/accounts',
  manage_owners: '/settings/owners',
  manage_categories: '/settings/categories',
};

export function routePath(route: Route): string {
  if (route.view === 'entry' && route.accountId) {
    const base = `/accounts/${encodeURIComponent(route.accountId)}/records`;
    return route.id ? `${base}/${encodeURIComponent(route.id)}/edit` : `${base}/new`;
  }
  if (route.id) {
    const entity = { add_account: 'accounts', add_owner: 'owners', add_category: 'categories' }[route.view];
    if (entity) return `/${entity}/${encodeURIComponent(route.id)}/edit`;
  }
  return paths[route.view];
}

export function parseRoute(pathname: string): Route | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  const view = (Object.keys(paths) as View[]).find(view => paths[view] === path);
  if (view) return { view };
  try {
    const record = path.match(/^\/accounts\/([^/]+)\/records\/(?:new|([^/]+)\/edit)$/);
    if (record) return {
      view: 'entry', accountId: decodeURIComponent(record[1]),
      ...(record[2] ? { id: decodeURIComponent(record[2]) } : {}),
    };
    const entity = path.match(/^\/(accounts|owners|categories)\/([^/]+)\/edit$/);
    if (entity) return {
      view: ({ accounts: 'add_account', owners: 'add_owner', categories: 'add_category' } as const)[entity[1]],
      id: decodeURIComponent(entity[2]),
    };
  } catch {
    // Malformed URL escapes are invalid routes, never new entity forms.
  }
  return null;
}

export function parentRoute(route: Route): Route {
  switch (route.view) {
    case 'entry': return { view: 'accounts' };
    case 'add_account': return { view: 'manage_accounts' };
    case 'add_owner': return { view: 'manage_owners' };
    case 'add_category': return { view: 'manage_categories' };
    case 'manage_accounts':
    case 'manage_owners':
    case 'manage_categories': return { view: 'settings' };
    default: return { view: 'dashboard' };
  }
}
