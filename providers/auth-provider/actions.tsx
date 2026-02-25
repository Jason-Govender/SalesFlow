import { createAction } from "redux-actions";
import { IAuthStateContext, IAuthSession } from "./context";


export enum AuthActionEnums {
  initAuthPending = "AUTH_INIT_PENDING",
  initAuthSuccess = "AUTH_INIT_SUCCESS",
  initAuthError = "AUTH_INIT_ERROR",

  loginPending = "AUTH_LOGIN_PENDING",
  loginSuccess = "AUTH_LOGIN_SUCCESS",
  loginError = "AUTH_LOGIN_ERROR",

  logout = "AUTH_LOGOUT",
  clearError = "AUTH_CLEAR_ERROR",
}


export const initAuthPending = createAction<IAuthStateContext>(
  AuthActionEnums.initAuthPending,
  () => ({
    isPending: true,
    isSuccess: false,
    isError: false,
    error: undefined,
    session: undefined,
  })
);

export const initAuthSuccess = createAction<IAuthStateContext, IAuthSession | undefined>(
  AuthActionEnums.initAuthSuccess,
  (session) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    error: undefined,
    session,
  })
);

export const initAuthError = createAction<IAuthStateContext, string>(
  AuthActionEnums.initAuthError,
  (error) => ({
    isPending: false,
    isSuccess: false,
    isError: true,
    error,
    session: undefined,
  })
);


export const loginPending = createAction<IAuthStateContext>(
  AuthActionEnums.loginPending,
  () => ({
    isPending: true,
    isSuccess: false,
    isError: false,
    error: undefined,
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
  })
);


export const logout = createAction<IAuthStateContext>(
  AuthActionEnums.logout,
  () => ({
    isPending: false,
    isSuccess: false,
    isError: false,
    error: undefined,
    session: undefined,
  })
);
