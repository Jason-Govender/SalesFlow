
import { createContext } from "react";

export enum UserRole {
  ADMIN = "ADMIN",
  SALES_REP = "SALES_REP",
}

export interface IUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface IAuthSession {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}


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
  logout: () => void;
}

export const AuthStateContext = createContext<IAuthStateContext | undefined>(undefined);
export const AuthActionContext = createContext<IAuthActionContext | undefined>(
  undefined
);