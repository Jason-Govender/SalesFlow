import { createContext } from "react";
import type {
  IOpportunity,
  ICreateOpportunityRequest,
  IUpdateOpportunityRequest,
  IStageHistoryEntry,
} from "../../utils/opportunities-service";

export interface IOpportunitiesStateContext {
  opportunities: IOpportunity[] | null;
  selectedOpportunity: IOpportunity | null;
  stageHistory: IStageHistoryEntry[] | null;
  currentClientId: string | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  /** Last stage filter used for list; refetches use this so the list stays consistent. */
  stageFilter?: number;
  /** Last search term used for list; refetches use this so the list stays consistent. */
  searchTerm?: string;
  isPending: boolean;
  isError: boolean;
  error?: string;
  actionPending: boolean;
}

export const INITIAL_OPPORTUNITIES_STATE: IOpportunitiesStateContext = {
  opportunities: null,
  selectedOpportunity: null,
  stageHistory: null,
  currentClientId: null,
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  stageFilter: undefined,
  searchTerm: undefined,
  isPending: false,
  isError: false,
  error: undefined,
  actionPending: false,
};

export interface IOpportunitiesActionContext {
  loadOpportunitiesByClient: (
    clientId: string,
    params?: { stage?: number; searchTerm?: string; pageNumber?: number; pageSize?: number }
  ) => Promise<void>;
  loadOpportunities: (
    params?: { stage?: number; searchTerm?: string; pageNumber?: number; pageSize?: number; ownerId?: string }
  ) => Promise<void>;
  clearOpportunities: () => void;
  loadOpportunity: (id: string) => Promise<void>;
  clearSelectedOpportunity: () => void;
  loadStageHistory: (id: string) => Promise<void>;
  createOpportunity: (
    body: ICreateOpportunityRequest
  ) => Promise<IOpportunity>;
  updateOpportunity: (
    id: string,
    body: IUpdateOpportunityRequest
  ) => Promise<void>;
  setStage: (
    id: string,
    stage: number,
    reason?: string
  ) => Promise<void>;
  assignOpportunity: (id: string, userId: string) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
}

export const OpportunitiesStateContext =
  createContext<IOpportunitiesStateContext | undefined>(undefined);

export const OpportunitiesActionContext =
  createContext<IOpportunitiesActionContext | undefined>(undefined);
