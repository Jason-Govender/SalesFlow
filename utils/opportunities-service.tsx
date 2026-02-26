import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

/** OpportunityStage: 1 Lead, 2 Qualified, 3 Proposal, 4 Negotiation, 5 Closed Won, 6 Closed Lost */
export enum OpportunityStage {
  Lead = 1,
  Qualified = 2,
  Proposal = 3,
  Negotiation = 4,
  ClosedWon = 5,
  ClosedLost = 6,
}

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  [OpportunityStage.Lead]: "Lead",
  [OpportunityStage.Qualified]: "Qualified",
  [OpportunityStage.Proposal]: "Proposal",
  [OpportunityStage.Negotiation]: "Negotiation",
  [OpportunityStage.ClosedWon]: "Closed Won",
  [OpportunityStage.ClosedLost]: "Closed Lost",
};

/** OpportunitySource: 1 Inbound, 2 Outbound, 3 Referral, 4 Partner, 5 RFP */
export enum OpportunitySource {
  Inbound = 1,
  Outbound = 2,
  Referral = 3,
  Partner = 4,
  RFP = 5,
}

export const OPPORTUNITY_SOURCE_LABELS: Record<OpportunitySource, string> = {
  [OpportunitySource.Inbound]: "Inbound",
  [OpportunitySource.Outbound]: "Outbound",
  [OpportunitySource.Referral]: "Referral",
  [OpportunitySource.Partner]: "Partner",
  [OpportunitySource.RFP]: "RFP",
};

export interface IOpportunity {
  id: string;
  title: string;
  clientId: string;
  contactId?: string;
  estimatedValue?: number;
  currency?: string;
  stage: OpportunityStage | number;
  source?: OpportunitySource | number;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  ownerId?: string;
  [key: string]: unknown;
}

export interface IStageHistoryEntry {
  id?: string;
  opportunityId: string;
  stage: OpportunityStage | number;
  changedAt?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface ICreateOpportunityRequest {
  title: string;
  clientId: string;
  contactId?: string;
  estimatedValue?: number;
  currency?: string;
  stage?: OpportunityStage | number;
  source?: OpportunitySource | number;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
}

export interface IUpdateOpportunityRequest {
  title?: string;
  contactId?: string;
  estimatedValue?: number;
  currency?: string;
  stage?: OpportunityStage | number;
  source?: OpportunitySource | number;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
}

export interface ISetStageRequest {
  stage: OpportunityStage | number;
  reason?: string;
}

export interface IOpportunitiesListParams {
  clientId?: string;
  stage?: OpportunityStage | number;
  ownerId?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IOpportunitiesListResponse {
  items: IOpportunity[];
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

export const opportunitiesService = {
  async list(params?: IOpportunitiesListParams): Promise<IOpportunitiesListResponse> {
    try {
      const response = await axiosInstance.get<IOpportunitiesListResponse>(
        "/api/opportunities",
        { params }
      );
      const data = response.data;
      if (Array.isArray(data)) {
        return {
          items: data as unknown as IOpportunity[],
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
          totalCount: (data as unknown[]).length,
        };
      }
      if (data?.items) return data;
      return {
        items: (data as unknown as IOpportunity[]) ?? [],
        pageNumber: data?.pageNumber ?? 1,
        pageSize: data?.pageSize ?? 10,
        totalCount: data?.totalCount ?? 0,
      };
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load opportunities.");
      throw new Error(message);
    }
  },

  async getById(id: string): Promise<IOpportunity> {
    try {
      const response = await axiosInstance.get<IOpportunity>(
        `/api/opportunities/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load opportunity.");
      throw new Error(message);
    }
  },

  async create(body: ICreateOpportunityRequest): Promise<IOpportunity> {
    try {
      const response = await axiosInstance.post<IOpportunity>(
        "/api/opportunities",
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to create opportunity.");
      throw new Error(message);
    }
  },

  async update(
    id: string,
    body: IUpdateOpportunityRequest
  ): Promise<IOpportunity> {
    try {
      const response = await axiosInstance.put<IOpportunity>(
        `/api/opportunities/${id}`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to update opportunity.");
      throw new Error(message);
    }
  },

  async setStage(id: string, body: ISetStageRequest): Promise<void> {
    try {
      await axiosInstance.put(`/api/opportunities/${id}/stage`, body);
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to update opportunity stage."
      );
      throw new Error(message);
    }
  },

  async assign(id: string, userId: string): Promise<void> {
    try {
      await axiosInstance.post(`/api/opportunities/${id}/assign`, { userId });
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to assign opportunity."
      );
      throw new Error(message);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/opportunities/${id}`);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to delete opportunity.");
      throw new Error(message);
    }
  },

  async getStageHistory(id: string): Promise<IStageHistoryEntry[]> {
    try {
      const response = await axiosInstance.get<IStageHistoryEntry[]>(
        `/api/opportunities/${id}/stage-history`
      );
      const data = response.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load stage history."
      );
      throw new Error(message);
    }
  },
};
