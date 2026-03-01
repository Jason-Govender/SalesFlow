import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

/** ContractStatus: 1 Draft, 2 Active, 3 Expired, 4 Renewed, 5 Cancelled */
export enum ContractStatus {
  Draft = 1,
  Active = 2,
  Expired = 3,
  Renewed = 4,
  Cancelled = 5,
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  [ContractStatus.Draft]: "Draft",
  [ContractStatus.Active]: "Active",
  [ContractStatus.Expired]: "Expired",
  [ContractStatus.Renewed]: "Renewed",
  [ContractStatus.Cancelled]: "Cancelled",
};

export interface IContract {
  id: string;
  clientId: string;
  opportunityId?: string;
  proposalId?: string;
  title: string;
  contractValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  ownerId?: string;
  status: ContractStatus;
  renewalNoticePeriod?: number;
  autoRenew?: boolean;
  terms?: string;
  isExpiringSoon?: boolean;
  daysUntilExpiry?: number;
  [key: string]: unknown;
}

export interface ICreateContractRequest {
  clientId: string;
  opportunityId?: string;
  proposalId?: string;
  title: string;
  contractValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  ownerId?: string;
  renewalNoticePeriod?: number;
  autoRenew?: boolean;
  terms?: string;
}

export interface IUpdateContractRequest {
  title?: string;
  contractValue?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  ownerId?: string;
  renewalNoticePeriod?: number;
  autoRenew?: boolean;
  terms?: string;
}

export interface ICreateRenewalRequest {
  proposedStartDate: string;
  proposedEndDate: string;
  proposedValue: number;
  notes?: string;
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

export interface IListContractsParams {
  clientId?: string;
  status?: number;
  pageNumber?: number;
  pageSize?: number;
}

export const contractsService = {
  async listContracts(params?: IListContractsParams): Promise<IContract[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.clientId) searchParams.set("clientId", params.clientId);
      if (params?.status != null) searchParams.set("status", String(params.status));
      if (params?.pageNumber != null)
        searchParams.set("pageNumber", String(params.pageNumber));
      if (params?.pageSize != null)
        searchParams.set("pageSize", String(params.pageSize));
      const query = searchParams.toString();
      const url = query ? `/api/contracts?${query}` : "/api/contracts";
      const response = await axiosInstance.get<IContract[]>(url);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (
        typeof data === "object" &&
        data !== null &&
        "items" in (data as object) &&
        Array.isArray((data as { items: IContract[] }).items)
      ) {
        return (data as { items: IContract[] }).items;
      }
      return [];
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load contracts."
      );
      throw new Error(message);
    }
  },

  async getContractsByClient(clientId: string): Promise<IContract[]> {
    try {
      const response = await axiosInstance.get<IContract[]>(
        `/api/contracts/client/${clientId}`
      );
      const data = response.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load contracts."
      );
      throw new Error(message);
    }
  },

  async getContract(id: string): Promise<IContract> {
    try {
      const response = await axiosInstance.get<IContract>(
        `/api/contracts/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load contract.");
      throw new Error(message);
    }
  },

  async createContract(body: ICreateContractRequest): Promise<IContract> {
    try {
      const response = await axiosInstance.post<IContract>(
        "/api/contracts",
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to create contract.");
      throw new Error(message);
    }
  },

  async updateContract(
    id: string,
    body: IUpdateContractRequest
  ): Promise<IContract> {
    try {
      const response = await axiosInstance.put<IContract>(
        `/api/contracts/${id}`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to update contract.");
      throw new Error(message);
    }
  },

  async activateContract(id: string): Promise<IContract> {
    try {
      const response = await axiosInstance.put<IContract>(
        `/api/contracts/${id}/activate`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to activate contract."
      );
      throw new Error(message);
    }
  },

  async cancelContract(id: string): Promise<IContract> {
    try {
      const response = await axiosInstance.put<IContract>(
        `/api/contracts/${id}/cancel`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to cancel contract."
      );
      throw new Error(message);
    }
  },

  async deleteContract(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/contracts/${id}`);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to delete contract.");
      throw new Error(message);
    }
  },

  async createRenewal(
    contractId: string,
    body: ICreateRenewalRequest
  ): Promise<unknown> {
    try {
      const response = await axiosInstance.post(
        `/api/contracts/${contractId}/renewals`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to create renewal."
      );
      throw new Error(message);
    }
  },

  async completeRenewal(renewalId: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(
        `/api/contracts/renewals/${renewalId}/complete`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to complete renewal."
      );
      throw new Error(message);
    }
  },
};
