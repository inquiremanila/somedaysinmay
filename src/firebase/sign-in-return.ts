export const RETURN_PATH_KEY = 'somedays-firebase-return-path';
export const LAST_PAGE_KEY = 'somedays-last-page';

// Parse using the browser's URL rules so backslashes and encoded paths cannot
// turn a return destination into an external redirect or another auth callback.
export function safeReturnPath(value: string | null, origin: string): string | null {
  if (!value?.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return null;
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin || decodeURIComponent(url.pathname).replace(/\/+$/, '') === '/account') return null;
    if (url.searchParams.has('oobCode') || url.searchParams.has('apiKey')) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

export function readReturnStorage(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function writeReturnStorage(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* The email link also carries its destination. */ }
}

export function signInDestination(currentPath: string, origin: string): string {
  return safeReturnPath(currentPath, origin)
    ?? safeReturnPath(readReturnStorage(RETURN_PATH_KEY), origin)
    ?? safeReturnPath(readReturnStorage(LAST_PAGE_KEY), origin)
    ?? '/';
}
