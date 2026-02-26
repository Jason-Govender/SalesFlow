import { handleActions } from "redux-actions";
import {
  INITIAL_PROPOSALS_STATE,
  IProposalsStateContext,
} from "./context";
import { ProposalsActionEnums } from "./actions";

export const ProposalsReducer = handleActions<
  IProposalsStateContext,
  IProposalsStateContext & { filters?: Partial<IProposalsStateContext["filters"]>; pagination?: Partial<IProposalsStateContext["pagination"]> }
>(
  {
    [ProposalsActionEnums.loadProposalsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.loadProposalsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.loadProposalsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.loadProposalPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.loadProposalSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.loadProposalError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.setFilters]: (state, action) => ({
      ...state,
      filters: { ...state.filters, ...action.payload?.filters },
    }),

    [ProposalsActionEnums.setPagination]: (state, action) => ({
      ...state,
      pagination: { ...state.pagination, ...action.payload?.pagination },
    }),

    [ProposalsActionEnums.setSelectedProposal]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.clearSelectedProposal]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.actionPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.actionSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ProposalsActionEnums.actionError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_PROPOSALS_STATE
);
