import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

/** ClientType: 1 Government, 2 Private, 3 Partner */
export enum ClientType {
  Government = 1,
  Private = 2,
  Partner = 3,
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  [ClientType.Government]: "Government",
  [ClientType.Private]: "Private",
  [ClientType.Partner]: "Partner",
};

export interface IClient {
  id: string;
  name: string;
  industry?: string;
  clientType: ClientType;
  website?: string;
  billingAddress?: string;
  taxNumber?: string;
  companySize?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface IClientStats {
  opportunityCount?: number;
  contractCount?: number;
  totalContractValue?: number;
  [key: string]: unknown;
}

export interface ICreateClientRequest {
  name: string;
  industry?: string;
  clientType: ClientType | number;
  website?: string;
  billingAddress?: string;
  taxNumber?: string;
  companySize?: string;
}

export interface IUpdateClientRequest {
  name?: string;
  industry?: string;
  clientType?: ClientType | number;
  website?: string;
  billingAddress?: string;
  taxNumber?: string;
  companySize?: string;
  isActive?: boolean;
}

export interface IClientsListParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  industry?: string;
  clientType?: ClientType | number;
  isActive?: boolean;
}

export interface IClientsListResponse {
  items: IClient[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}

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
    return "Cannot reach the API. Check that the API is running and NEXT_PUBLIC_API_BASE_URL points to it.";
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

export const clientsService = {
  async getClients(
    params?: IClientsListParams
  ): Promise<IClientsListResponse> {
    try {
      const response = await axiosInstance.get<IClientsListResponse>(
        "/api/clients",
        { params }
      );
      const data = response.data;
      if (Array.isArray(data)) {
        return {
          items: data as unknown as IClient[],
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
          totalCount: (data as unknown[]).length,
        };
      }
      if (data?.items) return data;
      return {
        items: (data as unknown as IClient[]) ?? [],
        pageNumber: data?.pageNumber ?? 1,
        pageSize: data?.pageSize ?? 10,
        totalCount: data?.totalCount ?? 0,
      };
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load clients.");
      throw new Error(message);
    }
  },

  async getClient(id: string): Promise<IClient> {
    try {
      const response = await axiosInstance.get<IClient>(
        `/api/clients/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load client.");
      throw new Error(message);
    }
  },

  async getClientStats(id: string): Promise<IClientStats> {
    try {
      const response = await axiosInstance.get<IClientStats>(
        `/api/clients/${id}/stats`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load client statistics."
      );
      throw new Error(message);
    }
  },

  async createClient(body: ICreateClientRequest): Promise<IClient> {
    try {
      const response = await axiosInstance.post<IClient>(
        "/api/clients",
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to create client.");
      throw new Error(message);
    }
  },

  async updateClient(
    id: string,
    body: IUpdateClientRequest
  ): Promise<IClient> {
    try {
      const response = await axiosInstance.put<IClient>(
        `/api/clients/${id}`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to update client.");
      throw new Error(message);
    }
  },

  async deleteClient(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/clients/${id}`);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to delete client.");
      throw new Error(message);
    }
  },
};
