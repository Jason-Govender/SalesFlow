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
  RegisterPayload,
} from "./context";

import { AuthReducer } from "./reducer";
import {
  initAuthPending,
  initAuthSuccess,
  loginPending,
  loginSuccess,
  loginError,
  registerPending,
  registerSuccess,
  registerError,
  logout as logoutAction,
} from "./actions";

import { authSessionStorage } from "../../utils/auth-session-storage";
import { authService } from "../../utils/auth-service";
import { authEvents } from "../../utils/auth-events";

const isExpired = (expiresAt: string) => {
  const expiryMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiryMs)) return true;
  return Date.now() >= expiryMs;
};

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
    if (isExpired(storedSession.expiresAt)) {
      logout();
      return;
    }

    dispatch(initAuthSuccess(storedSession));
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

  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch(registerPending());

    try {
      const session: IAuthSession = await authService.register(payload);
      authSessionStorage.set(session);
      dispatch(registerSuccess(session));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Registration failed.";
      dispatch(registerError(message));
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const unsubscribe = authEvents.on("UNAUTHORIZED", () => {
      logout();
    });

    return unsubscribe;
  }, [logout]);

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      initAuth,
      login,
      register,
      logout,
    }),
    [initAuth, login, register, logout]
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