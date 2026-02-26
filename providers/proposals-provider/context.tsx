import { createContext } from "react";
import type {
  IProposal,
  IProposalsListParams,
  ProposalStatus,
  ICreateProposalRequest,
  IUpdateProposalRequest,
  ICreateLineItemRequest,
  IUpdateLineItemRequest,
} from "../../utils/proposals-service";

export interface IProposalsPagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface IProposalsFilters {
  clientId?: string;
  opportunityId?: string;
  status?: ProposalStatus | number;
}

export interface IProposalsStateContext {
  proposals: IProposal[] | null;
  selectedProposal: IProposal | null;
  pagination: IProposalsPagination;
  filters: IProposalsFilters;
  isPending: boolean;
  isError: boolean;
  error?: string;
  actionPending: boolean;
}

export const INITIAL_PROPOSALS_STATE: IProposalsStateContext = {
  proposals: null,
  selectedProposal: null,
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

export interface IProposalsActionContext {
  loadProposals: (params?: IProposalsListParams) => Promise<void>;
  loadProposal: (id: string) => Promise<void>;
  setFilters: (filters: Partial<IProposalsFilters>) => void;
  setPagination: (pageNumber: number, pageSize?: number) => void;
  createProposal: (body: ICreateProposalRequest) => Promise<IProposal>;
  updateProposal: (id: string, body: IUpdateProposalRequest) => Promise<void>;
  addLineItem: (proposalId: string, body: ICreateLineItemRequest) => Promise<void>;
  updateLineItem: (
    proposalId: string,
    lineItemId: string,
    body: IUpdateLineItemRequest
  ) => Promise<void>;
  removeLineItem: (proposalId: string, lineItemId: string) => Promise<void>;
  submitProposal: (id: string) => Promise<void>;
  approveProposal: (id: string) => Promise<void>;
  rejectProposal: (id: string, reason: string) => Promise<void>;
  deleteProposal: (id: string) => Promise<void>;
  clearSelectedProposal: () => void;
}

export const ProposalsStateContext =
  createContext<IProposalsStateContext | undefined>(undefined);

export const ProposalsActionContext =
  createContext<IProposalsActionContext | undefined>(undefined);
