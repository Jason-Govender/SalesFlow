import { createContext } from "react";

/**
 * Backend role strings (based on your register doc + login response)
 * Keep these as the literal values your API returns.
 */
export type UserRole =
    "Admin"
  | "SalesRep"
  | "SalesManager"
  | "BusinessDevelopmentManager"

/**
 * User profile stored in state once authenticated.
 * (Login/Register responses include these fields.)
 */
export interface IUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  tenantId: string;
}

/**
 * Session stored in state + storage.
 */
export interface IAuthSession {
  token: string;
  expiresAt: string; // ISO string from API (e.g. "2026-02-25T16:00:00Z")
  user: IUser;
}

/**
 * Registration payload supports 3 org scenarios
 */
export type RegisterRoleOption =
  | "SalesRep"
  | "SalesManager"
  | "BusinessDevelopmentManager";

export type RegisterPayload =
  // Scenario A — Create a new organisation (tenantName)
  {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;

    tenantName: string;
    tenantId?: never;
    role?: never; // ignored when tenantName is provided
  }
  // Scenario B — Join an existing organisation (tenantId + role)
  | {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;

    tenantId: string;
    role: RegisterRoleOption; // cannot be Admin when joining
    tenantName?: never;
  }
  // Scenario C — Use the default shared tenant (no org specified)
  | {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;

    role?: RegisterRoleOption; // defaults to SalesRep if omitted
    tenantName?: never;
    tenantId?: never;
  };

export interface IAuthStateContext {
  session?: IAuthSession;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string;
}

export const INITIAL_AUTH_STATE: IAuthStateContext = {
  session: undefined,
  isPending: false,
  isSuccess: false,
  isError: false,
  error: undefined,
};

export interface IAuthActionContext {
  initAuth: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthStateContext = createContext<IAuthStateContext | undefined>(
  undefined
);

export const AuthActionContext = createContext<IAuthActionContext | undefined>(
  undefined
);