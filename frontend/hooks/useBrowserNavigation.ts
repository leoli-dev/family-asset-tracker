import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { drawerParent, parentRoute, parseRoute, Route, routePath } from '../utils/routes';
import { createId } from '../utils/uuid';

interface HistoryEntry {
  key: string;
  path: string;
  index: number;
  scroll: [number, number];
}

const stateKey = 'fatNavigation';

function readEntry(): HistoryEntry {
  const path = window.location.pathname;
  const saved = window.history.state?.[stateKey] as HistoryEntry | undefined;
  if (saved?.path === path) {
    try {
      const scroll = JSON.parse(window.sessionStorage.getItem(`fat-scroll:${saved.key}`) ?? 'null');
      if (Array.isArray(scroll) && scroll.length === 2 && scroll.every(Number.isFinite)) {
        return { ...saved, scroll: scroll as [number, number] };
      }
    } catch { /* History state still works when session storage is unavailable. */ }
    return saved;
  }
  const entry: HistoryEntry = { key: createId(), path, index: 0, scroll: [0, 0] };
  window.history.replaceState({ ...window.history.state, [stateKey]: entry }, '');
  return entry;
}

// The browser owns the navigation stack. Scroll belongs to a history entry,
// so two visits to the same list can each restore their own position.
export function useBrowserNavigation(ready: boolean) {
  const [entry, setEntry] = useState(readEntry);
  const activeEntry = useRef(entry);
  const positions = useRef(new Map<string, [number, number]>());
  const restoring = useRef(true);
  const readyRef = useRef(ready);
  readyRef.current = ready;
  const route = parseRoute(entry.path);

  const updateScroll = (persist = false) => {
    if (!readyRef.current || restoring.current || window.location.pathname !== activeEntry.current.path) return;
    const updated: HistoryEntry = { ...activeEntry.current, scroll: [window.scrollX, window.scrollY] };
    activeEntry.current = updated;
    positions.current.set(updated.key, updated.scroll);
    // Avoid calling replaceState on every scroll event (mobile browsers rate-limit it).
    if (persist) {
      // A reload can snapshot history before pagehide; session storage keeps the
      // latest position even when that history snapshot contains an older value.
      try { window.sessionStorage.setItem(`fat-scroll:${updated.key}`, JSON.stringify(updated.scroll)); }
      catch { /* Use the in-memory and history positions if storage is blocked. */ }
      window.history.replaceState({ ...window.history.state, [stateKey]: updated }, '');
    }
  };
  const saveScroll = () => updateScroll(true);

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const onPop = () => {
      restoring.current = true;
      const saved = readEntry();
      const next = { ...saved, scroll: positions.current.get(saved.key) ?? saved.scroll };
      activeEntry.current = next;
      setEntry(next);
    };
    const onScroll = () => updateScroll();
    window.addEventListener('popstate', onPop);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', saveScroll);
    return () => {
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', saveScroll);
    };
  }, []);

  // Called inside the page's Suspense boundary after its content is committed.
  // A lazy view's skeleton can be too short to restore the saved position.
  const restoreScroll = useCallback(() => {
    if (!ready) return;
    window.scrollTo({ left: entry.scroll[0], top: entry.scroll[1], behavior: 'instant' });
    restoring.current = false;
  }, [entry.key, ready]);

  const navigate = (nextRoute: Route, replace = false) => {
    const path = routePath(nextRoute);
    if (window.location.pathname === path) return;
    saveScroll();
    restoring.current = true;
    const next: HistoryEntry = {
      key: createId(), path,
      index: activeEntry.current.index + (replace ? 0 : 1),
      scroll: drawerParent(nextRoute.view) && drawerParent(nextRoute.view) === (drawerParent(route?.view) ?? route?.view)
        ? [window.scrollX, window.scrollY] : [0, 0],
    };
    window.history[replace ? 'replaceState' : 'pushState']({ [stateKey]: next }, '', path);
    activeEntry.current = next;
    setEntry(next);
  };

  const back = () => {
    saveScroll();
    if (activeEntry.current.index > 0) window.history.back();
    else navigate(parentRoute(route ?? { view: 'dashboard' }), true);
  };

  const isCurrent = () => activeEntry.current.key === entry.key && window.location.pathname === entry.path;

  return { route, path: entry.path, navigate, back, restoreScroll, isCurrent, canGoBack: entry.index > 0 || entry.path !== '/' };
}
