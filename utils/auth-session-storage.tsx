import type { IAuthSession } from "../providers/auth-provider/context";

const STORAGE_KEY = "auth_session";

const isBrowser = () => typeof window !== "undefined";

export const authSessionStorage = {
  get(): IAuthSession | null {
    if (!isBrowser()) return null;

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      return JSON.parse(raw) as IAuthSession;
    } catch {
      return null;
    }
  },

  set(session: IAuthSession): void {
    if (!isBrowser()) return;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  clear(): void {
    if (!isBrowser()) return;

    sessionStorage.removeItem(STORAGE_KEY);
  },
};

export const getAccessToken = (): string | null => {
  return authSessionStorage.get()?.token ?? null;
};