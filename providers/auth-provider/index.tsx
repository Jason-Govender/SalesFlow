"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

import {
  AuthStateContext,
  AuthActionContext,
  INITIAL_AUTH_STATE,
  IAuthSession,
} from "./context";

import { AuthReducer } from "./reducer";
import {
  initAuthPending,
  initAuthSuccess,
  loginPending,
  loginSuccess,
  loginError,
  logout as logoutAction,
} from "./actions";

import { authSessionStorage } from "../../utils/auth-session-storage";
import { authService } from "../../utils/auth-service";
import { authEvents } from "../../utils/auth-events";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_AUTH_STATE);
  const router = useRouter();

  const logout = useCallback(() => {
    authSessionStorage.clear();
    dispatch(logoutAction());
    router.replace("/login");
  }, [router]);

const initAuth = useCallback(async () => {
  dispatch(initAuthPending());

  const storedSession = authSessionStorage.get();

  if (!storedSession) {
    dispatch(initAuthSuccess(undefined));
    return;
  }

  try {
    const userData = await authService.me();

    const refreshedSession: IAuthSession = {
      ...storedSession,
      ...userData,
    };

    authSessionStorage.set(refreshedSession);
    dispatch(initAuthSuccess(refreshedSession));
  } catch {
    logout(); 
  }
}, [logout]);




  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      dispatch(loginPending());

      try {
        const session: IAuthSession = await authService.login(credentials);
        authSessionStorage.set(session);
        dispatch(loginSuccess(session));
      } catch (error: unknown) {

        const message =
          error instanceof Error ? error.message : "Authentication failed.";
        dispatch(loginError(message));
      }
    },
    []
  );

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const unsubscribe = authEvents.on("UNAUTHORIZED", () => {
      authSessionStorage.clear();
      dispatch(logoutAction());
      router.replace("/login");
    });

    return unsubscribe;
  }, [router]);

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      initAuth,
      login,
      logout,
    }),
    [initAuth, login, logout]
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionContext.Provider value={actionValue}>
        {children}
      </AuthActionContext.Provider>
    </AuthStateContext.Provider>
  );
};


export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }
  return context;
};

export const useAuthActions = () => {
  const context = useContext(AuthActionContext);
  if (!context) {
    throw new Error("useAuthActions must be used within AuthProvider");
  }
  return context;
};