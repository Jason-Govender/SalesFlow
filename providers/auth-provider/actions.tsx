import { createAction } from "redux-actions";
import type { IAuthSession, IAuthStateContext } from "./context";

export enum AuthActionEnums {
  initAuthPending = "AUTH_INIT_PENDING",
  initAuthSuccess = "AUTH_INIT_SUCCESS",
  initAuthError = "AUTH_INIT_ERROR",

  loginPending = "AUTH_LOGIN_PENDING",
  loginSuccess = "AUTH_LOGIN_SUCCESS",
  loginError = "AUTH_LOGIN_ERROR",

  registerPending = "AUTH_REGISTER_PENDING",
  registerSuccess = "AUTH_REGISTER_SUCCESS",
  registerError = "AUTH_REGISTER_ERROR",

  logout = "AUTH_LOGOUT",
}

/**
 * Init auth (restore session from storage)
 */
export const initAuthPending = createAction<IAuthStateContext>(
  AuthActionEnums.initAuthPending,
  () => ({
    isPending: true,
    isSuccess: false,
    isError: false,
    error: undefined,
    isAuthReady: false,
    // Keep session as-is while pending, so app doesn't "flash logout" on refresh.
  })
);

export const initAuthSuccess = createAction<
  IAuthStateContext,
  IAuthSession | undefined
>(AuthActionEnums.initAuthSuccess, (session) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  error: undefined,
  session,
  isAuthReady: true,
}));

export const initAuthError = createAction<IAuthStateContext, string>(
  AuthActionEnums.initAuthError,
  (error) => ({
    isPending: false,
    isSuccess: false,
    isError: true,
    error,
    session: undefined,
    isAuthReady: true,
  })
);

/**
 * Login
 */
export const loginPending = createAction<IAuthStateContext>(
  AuthActionEnums.loginPending,
  () => ({
    isPending: true,
    isSuccess: false,
    isError: false,
    error: undefined,
    isAuthReady: true,
  })
);

export const loginSuccess = createAction<IAuthStateContext, IAuthSession>(
  AuthActionEnums.loginSuccess,
  (session) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    error: undefined,
    session,
    isAuthReady: true,
  })
);

export const loginError = createAction<IAuthStateContext, string>(
  AuthActionEnums.loginError,
  (error) => ({
    isPending: false,
    isSuccess: false,
    isError: true,
    error,
    session: undefined,
    isAuthReady: true,
  })
);

/**
 * Register (same end result as login: you get a session back)
 */
export const registerPending = createAction<IAuthStateContext>(
  AuthActionEnums.registerPending,
  () => ({
    isPending: true,
    isSuccess: false,
    isError: false,
    error: undefined,
    isAuthReady: true,
  })
);

export const registerSuccess = createAction<IAuthStateContext, IAuthSession>(
  AuthActionEnums.registerSuccess,
  (session) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    error: undefined,
    session,
    isAuthReady: true,
  })
);

export const registerError = createAction<IAuthStateContext, string>(
  AuthActionEnums.registerError,
  (error) => ({
    isPending: false,
    isSuccess: false,
    isError: true,
    error,
    session: undefined,
    isAuthReady: true,
  })
);

/**
 * Logout
 */
export const logout = createAction<IAuthStateContext>(
  AuthActionEnums.logout,
  () => ({
    isPending: false,
    isSuccess: false,
    isError: false,
    error: undefined,
    session: undefined,
    isAuthReady: true,
  })
);
