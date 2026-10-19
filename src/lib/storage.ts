// Safe localStorage helpers.
//
// Every persisted value in this app is JSON written by older versions of the
// app, by the admin panel, or by a user poking at devtools. A single corrupt
// entry used to throw during render/checkout and take the whole page down, so
// all reads go through these guards.

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw || raw === "null") return fallback;
    const parsed: unknown = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function readArray<T>(key: string): T[] {
  const value = readJson<unknown>(key, []);
  return Array.isArray(value) ? (value as T[]) : [];
}

/** For non-JSON values such as the theme name ("dark"/"light"). */
export function readString(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStored(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage can be disabled (private mode, quota, policy); nothing to do.
  }
}
