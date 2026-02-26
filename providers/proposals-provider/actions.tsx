import { createAction } from "redux-actions";
import type { IProposalsStateContext } from "./context";
import type {
  IProposalsFilters,
  IProposalsPagination,
} from "./context";
import type {
  IProposal,
  IProposalsListResponse,
} from "../../utils/proposals-service";

export enum ProposalsActionEnums {
  loadProposalsPending = "PROPOSALS_LOAD_LIST_PENDING",
  loadProposalsSuccess = "PROPOSALS_LOAD_LIST_SUCCESS",
  loadProposalsError = "PROPOSALS_LOAD_LIST_ERROR",
  loadProposalPending = "PROPOSALS_LOAD_ONE_PENDING",
  loadProposalSuccess = "PROPOSALS_LOAD_ONE_SUCCESS",
  loadProposalError = "PROPOSALS_LOAD_ONE_ERROR",
  setFilters = "PROPOSALS_SET_FILTERS",
  setPagination = "PROPOSALS_SET_PAGINATION",
  setSelectedProposal = "PROPOSALS_SET_SELECTED",
  clearSelectedProposal = "PROPOSALS_CLEAR_SELECTED",
  actionPending = "PROPOSALS_ACTION_PENDING",
  actionSuccess = "PROPOSALS_ACTION_SUCCESS",
  actionError = "PROPOSALS_ACTION_ERROR",
}

export const loadProposalsPending = createAction<IProposalsStateContext>(
  ProposalsActionEnums.loadProposalsPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IProposalsStateContext
);

export const loadProposalsSuccess = createAction<
  IProposalsStateContext,
  IProposalsListResponse
>(ProposalsActionEnums.loadProposalsSuccess, (response) => ({
  isPending: false,
  isError: false,
  error: undefined,
  proposals: response.items,
  pagination: {
    pageNumber: response.pageNumber,
    pageSize: response.pageSize,
    totalCount: response.totalCount,
  },
} as IProposalsStateContext));

export const loadProposalsError = createAction<IProposalsStateContext, string>(
  ProposalsActionEnums.loadProposalsError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      proposals: null,
    }) as IProposalsStateContext
);

export const loadProposalPending = createAction<IProposalsStateContext>(
  ProposalsActionEnums.loadProposalPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IProposalsStateContext
);

export const loadProposalSuccess = createAction<
  IProposalsStateContext,
  IProposal
>(ProposalsActionEnums.loadProposalSuccess, (proposal) =>
  ({
    isPending: false,
    isError: false,
    error: undefined,
    selectedProposal: proposal,
  }) as IProposalsStateContext
);

export const loadProposalError = createAction<IProposalsStateContext, string>(
  ProposalsActionEnums.loadProposalError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      selectedProposal: null,
    }) as IProposalsStateContext
);

export const setFiltersAction = createAction<
  IProposalsStateContext,
  Partial<IProposalsFilters>
>(ProposalsActionEnums.setFilters, (filters) =>
  ({ filters }) as IProposalsStateContext
);

export const setPaginationAction = createAction<
  IProposalsStateContext,
  Partial<IProposalsPagination>
>(ProposalsActionEnums.setPagination, (pagination) =>
  ({ pagination }) as IProposalsStateContext
);

export const setSelectedProposalAction = createAction<
  IProposalsStateContext,
  IProposal | null
>(ProposalsActionEnums.setSelectedProposal, (selectedProposal) =>
  ({ selectedProposal }) as IProposalsStateContext
);

export const clearSelectedProposalAction = createAction<IProposalsStateContext>(
  ProposalsActionEnums.clearSelectedProposal,
  () => ({ selectedProposal: null } as IProposalsStateContext)
);

export const actionPendingAction = createAction<IProposalsStateContext>(
  ProposalsActionEnums.actionPending,
  () => ({ actionPending: true } as IProposalsStateContext)
);

export const actionSuccessAction = createAction<IProposalsStateContext>(
  ProposalsActionEnums.actionSuccess,
  () => ({ actionPending: false } as IProposalsStateContext)
);

export const actionErrorAction = createAction<IProposalsStateContext, string>(
  ProposalsActionEnums.actionError,
  (error) =>
    ({
      actionPending: false,
      isError: true,
      error,
    }) as IProposalsStateContext
);
