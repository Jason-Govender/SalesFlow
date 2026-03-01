import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

/** PricingRequestStatus: 1 Pending, 2 In Progress, 3 Completed */
export enum PricingRequestStatus {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
}

export const PRICING_REQUEST_STATUS_LABELS: Record<
  PricingRequestStatus,
  string
> = {
  [PricingRequestStatus.Pending]: "Pending",
  [PricingRequestStatus.InProgress]: "In Progress",
  [PricingRequestStatus.Completed]: "Completed",
};

/** Priority: 1 Low, 2 Medium, 3 High, 4 Urgent */
export enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
  Urgent = 4,
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.Low]: "Low",
  [Priority.Medium]: "Medium",
  [Priority.High]: "High",
  [Priority.Urgent]: "Urgent",
};

export interface IPricingRequest {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  opportunityId?: string;
  requestedById: string;
  assignedToId?: string;
  priority: Priority | number;
  requiredByDate: string;
  status: PricingRequestStatus | number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ICreatePricingRequestRequest {
  title: string;
  description?: string;
  clientId: string;
  opportunityId?: string;
  requestedById: string;
  priority: Priority | number;
  requiredByDate: string;
}

export interface IUpdatePricingRequestRequest {
  title?: string;
  description?: string;
  clientId?: string;
  opportunityId?: string;
  priority?: Priority | number;
  requiredByDate?: string;
}

export interface IAssignPricingRequestRequest {
  userId: string;
}

export interface IPricingRequestsListParams {
  status?: PricingRequestStatus | number;
  priority?: Priority | number;
  assignedToId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IPricingRequestsListResponse {
  items: IPricingRequest[];
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

export const pricingRequestsService = {
  async getPricingRequests(
    params?: IPricingRequestsListParams
  ): Promise<IPricingRequestsListResponse> {
    try {
      const response = await axiosInstance.get<IPricingRequestsListResponse>(
        "/api/pricingrequests",
        { params }
      );
      const data = response.data;
      if (Array.isArray(data)) {
        return {
          items: data as unknown as IPricingRequest[],
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
          totalCount: (data as unknown[]).length,
        };
      }
      if (data?.items) return data;
      return {
        items: (data as unknown as IPricingRequest[]) ?? [],
        pageNumber: data?.pageNumber ?? 1,
        pageSize: data?.pageSize ?? 10,
        totalCount: data?.totalCount ?? 0,
      };
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load pricing requests."
      );
      throw new Error(message);
    }
  },

  async getPricingRequest(id: string): Promise<IPricingRequest> {
    try {
      const response = await axiosInstance.get<IPricingRequest>(
        `/api/pricingrequests/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load pricing request."
      );
      throw new Error(message);
    }
  },

  async getPending(): Promise<IPricingRequest[]> {
    try {
      const response = await axiosInstance.get<IPricingRequest[]>(
        "/api/pricingrequests/pending"
      );
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load pending pricing requests."
      );
      throw new Error(message);
    }
  },

  async getMyRequests(): Promise<IPricingRequest[]> {
    try {
      const response = await axiosInstance.get<IPricingRequest[]>(
        "/api/pricingrequests/my-requests"
      );
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load my pricing requests."
      );
      throw new Error(message);
    }
  },

  async create(body: ICreatePricingRequestRequest): Promise<IPricingRequest> {
    try {
      const response = await axiosInstance.post<IPricingRequest>(
        "/api/pricingrequests",
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to create pricing request."
      );
      throw new Error(message);
    }
  },

  async update(
    id: string,
    body: IUpdatePricingRequestRequest
  ): Promise<IPricingRequest> {
    try {
      const response = await axiosInstance.put<IPricingRequest>(
        `/api/pricingrequests/${id}`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to update pricing request."
      );
      throw new Error(message);
    }
  },

  async assign(
    id: string,
    body: IAssignPricingRequestRequest
  ): Promise<IPricingRequest> {
    try {
      const response = await axiosInstance.post<IPricingRequest>(
        `/api/pricingrequests/${id}/assign`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to assign pricing request."
      );
      throw new Error(message);
    }
  },

  async complete(id: string): Promise<IPricingRequest> {
    try {
      const response = await axiosInstance.put<IPricingRequest>(
        `/api/pricingrequests/${id}/complete`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to complete pricing request."
      );
      throw new Error(message);
    }
  },
};
