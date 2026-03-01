import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

export interface IUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface IUsersListParams {
  pageNumber?: number;
  pageSize?: number;
  role?: string;
  searchTerm?: string;
  isActive?: boolean;
}

export interface IUsersListResponse {
  items: IUser[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const data = axiosError?.response?.data;
  if (data?.message && typeof data.message === "string") return data.message;
  if (data?.error && typeof data.error === "string") return data.error;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const usersService = {
  async list(params?: IUsersListParams): Promise<IUsersListResponse> {
    try {
      const response = await axiosInstance.get<IUsersListResponse>(
        "/api/users",
        { params }
      );
      const data = response.data;
      if (Array.isArray(data)) {
        return {
          items: data as unknown as IUser[],
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 20,
          totalCount: (data as unknown[]).length,
        };
      }
      if (data?.items) return data;
      return {
        items: (data as unknown as IUser[]) ?? [],
        pageNumber: data?.pageNumber ?? 1,
        pageSize: data?.pageSize ?? 20,
        totalCount: data?.totalCount ?? 0,
      };
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load users.");
      throw new Error(message);
    }
  },
};
