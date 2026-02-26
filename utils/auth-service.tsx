import { axiosInstance } from "./axios-instance";
import type { IAuthSession, RegisterPayload, IUser } from "../providers/auth-provider/context";

type LoginCredentials = {
  email: string;
  password: string;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<IAuthSession> {
    try {
      const response = await axiosInstance.post<IAuthSession>(
        "/api/auth/login",
        credentials
      );
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed.";
      throw new Error(message);
    }
  },

  async register(payload: RegisterPayload): Promise<IAuthSession> {
    try {
      const response = await axiosInstance.post<IAuthSession>(
        "/api/auth/register",
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Registration failed.";
      throw new Error(message);
    }
  },

  async me(): Promise<IUser> {
    try {
      const response = await axiosInstance.get<IUser>("/api/auth/me");
      return response.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch user.";
      throw new Error(message);
    }
  },
};