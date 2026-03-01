import { axiosInstance } from "./axios-instance";
import type {
  IAuthSession,
  RegisterPayload,
  IUser,
  UserRole,
} from "../providers/auth-provider/context";
import type { AxiosError } from "axios";

type LoginCredentials = {
  email: string;
  password: string;
};

type AuthApiResponse = {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  tenantId: string;
  expiresAt: string;
};

const mapAuthResponseToSession = (data: AuthApiResponse): IAuthSession => ({
  token: data.token,
  expiresAt: data.expiresAt,
  user: {
    userId: data.userId,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    roles: data.roles,
    tenantId: data.tenantId,
  },
});

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;

  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const data = axiosError?.response?.data;

  if (data?.message && typeof data.message === "string") {
    return data.message;
  }

  if (data?.error && typeof data.error === "string") {
    return data.error;
  }

  if (isAxiosError(error) && error.code === "ERR_NETWORK" && !error.response) {
    return "Cannot reach the API. Check that the API is running and NEXT_PUBLIC_API_BASE_URL points to it (e.g. http://localhost:5053 for local development).";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const isAxiosError = (error: unknown): error is AxiosError => {
  if (!error || typeof error !== "object") return false;
  return "isAxiosError" in error;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<IAuthSession> {
    try {
      const response = await axiosInstance.post<AuthApiResponse>(
        "/api/auth/login",
        credentials
      );
      return mapAuthResponseToSession(response.data);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Login failed.");
      throw new Error(message);
    }
  },

  async register(payload: RegisterPayload): Promise<IAuthSession> {
    try {
      const response = await axiosInstance.post<AuthApiResponse>(
        "/api/auth/register",
        payload
      );
      return mapAuthResponseToSession(response.data);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Registration failed.");
      throw new Error(message);
    }
  },

  async me(): Promise<IUser> {
    try {
      const response = await axiosInstance.get<IUser>("/api/auth/me");
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to fetch user.");
      throw new Error(message);
    }
  },
};