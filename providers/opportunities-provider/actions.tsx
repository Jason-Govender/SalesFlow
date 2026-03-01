import { createAction } from "redux-actions";
import type { IOpportunitiesStateContext } from "./context";
import type { IOpportunity, IStageHistoryEntry } from "../../utils/opportunities-service";

export enum OpportunitiesActionEnums {
  loadOpportunitiesPending = "OPPORTUNITIES_LOAD_PENDING",
  loadOpportunitiesSuccess = "OPPORTUNITIES_LOAD_SUCCESS",
  loadOpportunitiesError = "OPPORTUNITIES_LOAD_ERROR",
  clearOpportunities = "OPPORTUNITIES_CLEAR",
  loadOpportunityPending = "OPPORTUNITY_LOAD_PENDING",
  loadOpportunitySuccess = "OPPORTUNITY_LOAD_SUCCESS",
  loadOpportunityError = "OPPORTUNITY_LOAD_ERROR",
  clearSelectedOpportunity = "OPPORTUNITIES_CLEAR_SELECTED",
  loadStageHistorySuccess = "OPPORTUNITIES_STAGE_HISTORY_SUCCESS",
  actionPending = "OPPORTUNITIES_ACTION_PENDING",
  actionSuccess = "OPPORTUNITIES_ACTION_SUCCESS",
  actionError = "OPPORTUNITIES_ACTION_ERROR",
}

export const loadOpportunitiesPending = createAction<Partial<IOpportunitiesStateContext>>(
  OpportunitiesActionEnums.loadOpportunitiesPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as Partial<IOpportunitiesStateContext>
);

export const loadOpportunitiesSuccess = createAction<
  Partial<IOpportunitiesStateContext>,
  {
    opportunities: IOpportunity[];
    clientId: string;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }
>(
  OpportunitiesActionEnums.loadOpportunitiesSuccess,
  ({ opportunities, clientId, pageNumber, pageSize, totalCount }) =>
    ({
      isPending: false,
      isError: false,
      error: undefined,
      opportunities,
      currentClientId: clientId,
      pageNumber,
      pageSize,
      totalCount,
    }) as Partial<IOpportunitiesStateContext>
);

export const loadOpportunitiesError = createAction<Partial<IOpportunitiesStateContext>, string>(
  OpportunitiesActionEnums.loadOpportunitiesError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      opportunities: null,
    }) as Partial<IOpportunitiesStateContext>
);

export const clearOpportunitiesAction = createAction<Partial<IOpportunitiesStateContext>>(
  OpportunitiesActionEnums.clearOpportunities,
  () =>
    ({
      opportunities: null,
      selectedOpportunity: null,
      stageHistory: null,
      currentClientId: null,
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      isError: false,
      error: undefined,
    }) as Partial<IOpportunitiesStateContext>
);

export const loadOpportunityPending = createAction<Partial<IOpportunitiesStateContext>>(
  OpportunitiesActionEnums.loadOpportunityPending,
  () => ({ isPending: true, isError: false, error: undefined }) as Partial<IOpportunitiesStateContext>
);

export const loadOpportunitySuccess = createAction<Partial<IOpportunitiesStateContext>, IOpportunity>(
  OpportunitiesActionEnums.loadOpportunitySuccess,
  (selectedOpportunity) =>
    ({
      isPending: false,
      isError: false,
      error: undefined,
      selectedOpportunity,
    }) as Partial<IOpportunitiesStateContext>
);

export const loadOpportunityError = createAction<Partial<IOpportunitiesStateContext>, string>(
  OpportunitiesActionEnums.loadOpportunityError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      selectedOpportunity: null,
    }) as Partial<IOpportunitiesStateContext>
);

export const clearSelectedOpportunityAction = createAction<Partial<IOpportunitiesStateContext>>(
  OpportunitiesActionEnums.clearSelectedOpportunity,
  () =>
    ({
      selectedOpportunity: null,
      stageHistory: null,
    }) as Partial<IOpportunitiesStateContext>
);

export const loadStageHistorySuccess = createAction<
  Partial<IOpportunitiesStateContext>,
  IStageHistoryEntry[]
>(
  OpportunitiesActionEnums.loadStageHistorySuccess,
  (stageHistory) => ({ stageHistory }) as Partial<IOpportunitiesStateContext>
);

export const actionPendingAction = createAction<Partial<IOpportunitiesStateContext>>(
  OpportunitiesActionEnums.actionPending,
  () => ({ actionPending: true } as Partial<IOpportunitiesStateContext>)
);

export const actionSuccessAction = createAction<Partial<IOpportunitiesStateContext>>(
  OpportunitiesActionEnums.actionSuccess,
  () => ({ actionPending: false } as Partial<IOpportunitiesStateContext>)
);

export const actionErrorAction = createAction<Partial<IOpportunitiesStateContext>, string>(
  OpportunitiesActionEnums.actionError,
  (error) =>
    ({
      actionPending: false,
      isError: true,
      error,
    }) as Partial<IOpportunitiesStateContext>
);
