import { createContext } from "react";
import type {
  IPricingRequest,
  IPricingRequestsListParams,
  PricingRequestStatus,
  Priority,
  ICreatePricingRequestRequest,
  IUpdatePricingRequestRequest,
} from "../../utils/pricing-requests-service";

export interface IPricingRequestsPagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface IPricingRequestsFilters {
  status?: PricingRequestStatus | number;
  priority?: Priority | number;
  assignedToId?: string;
}

export interface IPricingRequestsStateContext {
  pricingRequests: IPricingRequest[] | null;
  pendingRequests: IPricingRequest[] | null;
  myRequests: IPricingRequest[] | null;
  selectedPricingRequest: IPricingRequest | null;
  pagination: IPricingRequestsPagination;
  filters: IPricingRequestsFilters;
  isPending: boolean;
  isError: boolean;
  error?: string;
  actionPending: boolean;
}

export const INITIAL_PRICING_REQUESTS_STATE: IPricingRequestsStateContext = {
  pricingRequests: null,
  pendingRequests: null,
  myRequests: null,
  selectedPricingRequest: null,
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  },
  filters: {},
  isPending: false,
  isError: false,
  error: undefined,
  actionPending: false,
};

export interface IPricingRequestsActionContext {
  loadPricingRequests: (params?: IPricingRequestsListParams) => Promise<void>;
  loadPending: () => Promise<void>;
  loadMyRequests: () => Promise<void>;
  loadPricingRequest: (id: string) => Promise<void>;
  setFilters: (filters: Partial<IPricingRequestsFilters>) => void;
  setPagination: (pageNumber: number, pageSize?: number) => void;
  createPricingRequest: (
    body: ICreatePricingRequestRequest
  ) => Promise<IPricingRequest>;
  updatePricingRequest: (
    id: string,
    body: IUpdatePricingRequestRequest
  ) => Promise<void>;
  assignPricingRequest: (id: string, userId: string) => Promise<void>;
  completePricingRequest: (id: string) => Promise<void>;
  clearSelectedPricingRequest: () => void;
}

export const PricingRequestsStateContext =
  createContext<IPricingRequestsStateContext | undefined>(undefined);

export const PricingRequestsActionContext =
  createContext<IPricingRequestsActionContext | undefined>(undefined);
