import { handleActions } from "redux-actions";
import {
  INITIAL_OPPORTUNITIES_STATE,
  IOpportunitiesStateContext,
} from "./context";
import { OpportunitiesActionEnums } from "./actions";

export const OpportunitiesReducer = handleActions<
  IOpportunitiesStateContext,
  Partial<IOpportunitiesStateContext>
>(
  {
    [OpportunitiesActionEnums.loadOpportunitiesPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.loadOpportunitiesSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.loadOpportunitiesError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.clearOpportunities]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.loadOpportunityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.loadOpportunitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.loadOpportunityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.clearSelectedOpportunity]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.loadStageHistorySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.actionPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.actionSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [OpportunitiesActionEnums.actionError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_OPPORTUNITIES_STATE
);
