import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

/** ProposalStatus: 1 Draft, 2 Submitted, 3 Rejected, 4 Approved */
export enum ProposalStatus {
  Draft = 1,
  Submitted = 2,
  Rejected = 3,
  Approved = 4,
}

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  [ProposalStatus.Draft]: "Draft",
  [ProposalStatus.Submitted]: "Submitted",
  [ProposalStatus.Rejected]: "Rejected",
  [ProposalStatus.Approved]: "Approved",
};

export interface IProposalLineItem {
  id: string;
  productServiceName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  lineTotal?: number;
}

export interface IProposal {
  id: string;
  opportunityId: string;
  clientId: string;
  title: string;
  description?: string;
  currency: string;
  validUntil: string;
  status: ProposalStatus;
  lineItems?: IProposalLineItem[];
  subtotal?: number;
  total?: number;
  rejectionReason?: string;
  [key: string]: unknown;
}

export interface ICreateProposalRequest {
  opportunityId: string;
  clientId: string;
  title: string;
  description?: string;
  currency: string;
  validUntil: string;
  lineItems?: ICreateLineItemRequest[];
}

export interface IUpdateProposalRequest {
  title?: string;
  description?: string;
  currency?: string;
  validUntil?: string;
}

export interface ICreateLineItemRequest {
  productServiceName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

export interface IUpdateLineItemRequest extends ICreateLineItemRequest {}

export interface IRejectProposalRequest {
  reason: string;
}

export interface IProposalsListParams {
  clientId?: string;
  opportunityId?: string;
  status?: ProposalStatus | number;
  pageNumber?: number;
  pageSize?: number;
}

export interface IProposalsListResponse {
  items: IProposal[];
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

/** Line item total: (Quantity × UnitPrice × (1 − Discount/100)) × (1 + TaxRate/100) */
export function computeLineTotal(
  quantity: number,
  unitPrice: number,
  discount: number,
  taxRate: number
): number {
  const afterDiscount = quantity * unitPrice * (1 - discount / 100);
  return afterDiscount * (1 + taxRate / 100);
}

export const proposalsService = {
  async getProposals(
    params?: IProposalsListParams
  ): Promise<IProposalsListResponse> {
    try {
      const response = await axiosInstance.get<IProposalsListResponse>(
        "/api/proposals",
        { params }
      );
      const data = response.data;
      if (Array.isArray(data)) {
        return {
          items: data as unknown as IProposal[],
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
          totalCount: (data as unknown[]).length,
        };
      }
      if (data?.items) return data;
      return {
        items: (data as unknown as IProposal[]) ?? [],
        pageNumber: data?.pageNumber ?? 1,
        pageSize: data?.pageSize ?? 10,
        totalCount: data?.totalCount ?? 0,
      };
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load proposals."
      );
      throw new Error(message);
    }
  },

  async getProposal(id: string): Promise<IProposal> {
    try {
      const response = await axiosInstance.get<IProposal>(
        `/api/proposals/${id}`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load proposal."
      );
      throw new Error(message);
    }
  },

  async createProposal(body: ICreateProposalRequest): Promise<IProposal> {
    try {
      const response = await axiosInstance.post<IProposal>(
        "/api/proposals",
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to create proposal."
      );
      throw new Error(message);
    }
  },

  async updateProposal(
    id: string,
    body: IUpdateProposalRequest
  ): Promise<IProposal> {
    try {
      const response = await axiosInstance.put<IProposal>(
        `/api/proposals/${id}`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to update proposal."
      );
      throw new Error(message);
    }
  },

  async addLineItem(
    proposalId: string,
    body: ICreateLineItemRequest
  ): Promise<IProposalLineItem> {
    try {
      const response = await axiosInstance.post<IProposalLineItem>(
        `/api/proposals/${proposalId}/line-items`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to add line item."
      );
      throw new Error(message);
    }
  },

  async updateLineItem(
    proposalId: string,
    lineItemId: string,
    body: IUpdateLineItemRequest
  ): Promise<IProposalLineItem> {
    try {
      const response = await axiosInstance.put<IProposalLineItem>(
        `/api/proposals/${proposalId}/line-items/${lineItemId}`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to update line item."
      );
      throw new Error(message);
    }
  },

  async deleteLineItem(
    proposalId: string,
    lineItemId: string
  ): Promise<void> {
    try {
      await axiosInstance.delete(
        `/api/proposals/${proposalId}/line-items/${lineItemId}`
      );
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to remove line item."
      );
      throw new Error(message);
    }
  },

  async submitProposal(id: string): Promise<IProposal> {
    try {
      const response = await axiosInstance.put<IProposal>(
        `/api/proposals/${id}/submit`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to submit proposal."
      );
      throw new Error(message);
    }
  },

  async approveProposal(id: string): Promise<IProposal> {
    try {
      const response = await axiosInstance.put<IProposal>(
        `/api/proposals/${id}/approve`
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to approve proposal."
      );
      throw new Error(message);
    }
  },

  async rejectProposal(
    id: string,
    body: IRejectProposalRequest
  ): Promise<IProposal> {
    try {
      const response = await axiosInstance.put<IProposal>(
        `/api/proposals/${id}/reject`,
        body
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to reject proposal."
      );
      throw new Error(message);
    }
  },

  async deleteProposal(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/proposals/${id}`);
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to delete proposal."
      );
      throw new Error(message);
    }
  },
};
