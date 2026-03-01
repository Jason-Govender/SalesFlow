"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  OpportunitiesStateContext,
  OpportunitiesActionContext,
  INITIAL_OPPORTUNITIES_STATE,
} from "./context";

import { OpportunitiesReducer } from "./reducer";
import {
  loadOpportunitiesPending,
  loadOpportunitiesSuccess,
  loadOpportunitiesError,
  clearOpportunitiesAction,
  loadOpportunityPending,
  loadOpportunitySuccess,
  loadOpportunityError,
  clearSelectedOpportunityAction,
  loadStageHistorySuccess,
  actionPendingAction,
  actionSuccessAction,
  actionErrorAction,
} from "./actions";

import {
  opportunitiesService,
  type ICreateOpportunityRequest,
  type IUpdateOpportunityRequest,
} from "../../utils/opportunities-service";

export const OpportunitiesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    OpportunitiesReducer,
    INITIAL_OPPORTUNITIES_STATE
  );

  const loadOpportunitiesByClient = useCallback(
    async (
      clientId: string,
      params?: { stage?: number; searchTerm?: string; pageNumber?: number; pageSize?: number }
    ): Promise<void> => {
      dispatch(loadOpportunitiesPending());
      try {
        const result = await opportunitiesService.list({
          clientId,
          stage: params?.stage,
          searchTerm: params?.searchTerm,
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
        });
        dispatch(
          loadOpportunitiesSuccess({
            opportunities: result.items,
            clientId,
            pageNumber: result.pageNumber,
            pageSize: result.pageSize,
            totalCount: result.totalCount,
            stageFilter: params?.stage,
            searchTerm: params?.searchTerm,
          })
        );
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load opportunities.";
        dispatch(loadOpportunitiesError(message));
      }
    },
    []
  );

  const loadOpportunities = useCallback(
    async (
      params?: {
        stage?: number;
        searchTerm?: string;
        pageNumber?: number;
        pageSize?: number;
        ownerId?: string;
      }
    ): Promise<void> => {
      dispatch(loadOpportunitiesPending());
      try {
        const result = await opportunitiesService.list({
          stage: params?.stage,
          searchTerm: params?.searchTerm,
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
          ownerId: params?.ownerId,
        });
        dispatch(
          loadOpportunitiesSuccess({
            opportunities: result.items,
            clientId: null,
            pageNumber: result.pageNumber,
            pageSize: result.pageSize,
            totalCount: result.totalCount,
            stageFilter: params?.stage,
            searchTerm: params?.searchTerm,
          })
        );
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load opportunities.";
        dispatch(loadOpportunitiesError(message));
      }
    },
    []
  );

  const clearOpportunities = useCallback(() => {
    dispatch(clearOpportunitiesAction());
  }, []);

  const loadOpportunity = useCallback(async (id: string): Promise<void> => {
    dispatch(loadOpportunityPending());
    try {
      const opportunity = await opportunitiesService.getById(id);
      dispatch(loadOpportunitySuccess(opportunity));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load opportunity.";
      dispatch(loadOpportunityError(message));
    }
  }, []);

  const clearSelectedOpportunity = useCallback(() => {
    dispatch(clearSelectedOpportunityAction());
  }, []);

  const loadStageHistory = useCallback(async (id: string): Promise<void> => {
    try {
      const history = await opportunitiesService.getStageHistory(id);
      dispatch(loadStageHistorySuccess(history));
    } catch {
      dispatch(loadStageHistorySuccess([]));
    }
  }, []);

  const refetchListIfCurrentClient = useCallback(
    (clientId: string | null): Promise<void> => {
      if (clientId != null && state.currentClientId === clientId) {
        return opportunitiesService
          .list({
            clientId,
            stage: state.stageFilter,
            searchTerm: state.searchTerm,
            pageNumber: state.pageNumber,
            pageSize: state.pageSize,
          })
          .then((result) =>
            dispatch(
              loadOpportunitiesSuccess({
                opportunities: result.items,
                clientId,
                pageNumber: result.pageNumber,
                pageSize: result.pageSize,
                totalCount: result.totalCount,
                stageFilter: state.stageFilter,
                searchTerm: state.searchTerm,
              })
            )
          )
          .catch(() => {});
      }
      if (clientId === null && state.currentClientId === null) {
        return opportunitiesService
          .list({
            stage: state.stageFilter,
            searchTerm: state.searchTerm,
            pageNumber: state.pageNumber,
            pageSize: state.pageSize,
          })
          .then((result) =>
            dispatch(
              loadOpportunitiesSuccess({
                opportunities: result.items,
                clientId: null,
                pageNumber: result.pageNumber,
                pageSize: result.pageSize,
                totalCount: result.totalCount,
                stageFilter: state.stageFilter,
                searchTerm: state.searchTerm,
              })
            )
          )
          .catch(() => {});
      }
      return Promise.resolve();
    },
    [
      state.currentClientId,
      state.pageNumber,
      state.pageSize,
      state.stageFilter,
      state.searchTerm,
    ]
  );

  const createOpportunity = useCallback(
    async (body: ICreateOpportunityRequest) => {
      dispatch(actionPendingAction());
      try {
        const opportunity = await opportunitiesService.create(body);
        dispatch(actionSuccessAction());
        refetchListIfCurrentClient(state.currentClientId);
        return opportunity;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create opportunity.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [refetchListIfCurrentClient]
  );

  const updateOpportunity = useCallback(
    async (id: string, body: IUpdateOpportunityRequest) => {
      dispatch(actionPendingAction());
      try {
        await opportunitiesService.update(id, body);
        dispatch(actionSuccessAction());
        if (state.selectedOpportunity?.id === id) {
          const updated = await opportunitiesService.getById(id);
          dispatch(loadOpportunitySuccess(updated));
        }
        refetchListIfCurrentClient(state.currentClientId);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update opportunity.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.selectedOpportunity?.id, state.currentClientId, refetchListIfCurrentClient]
  );

  const setStage = useCallback(
    async (id: string, stage: number, reason?: string) => {
      dispatch(actionPendingAction());
      try {
        await opportunitiesService.setStage(id, { stage, reason });
        dispatch(actionSuccessAction());
        if (state.selectedOpportunity?.id === id) {
          const updated = await opportunitiesService.getById(id);
          dispatch(loadOpportunitySuccess(updated));
        }
        refetchListIfCurrentClient(state.currentClientId);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update stage.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [
      state.selectedOpportunity?.id,
      state.currentClientId,
      refetchListIfCurrentClient,
    ]
  );

  const assignOpportunity = useCallback(
    async (id: string, userId: string) => {
      dispatch(actionPendingAction());
      try {
        await opportunitiesService.assign(id, userId);
        dispatch(actionSuccessAction());
        if (state.selectedOpportunity?.id === id) {
          const updated = await opportunitiesService.getById(id);
          dispatch(loadOpportunitySuccess(updated));
        }
        refetchListIfCurrentClient(state.currentClientId);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to assign opportunity.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.selectedOpportunity?.id, state.currentClientId, refetchListIfCurrentClient]
  );

  const deleteOpportunity = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await opportunitiesService.delete(id);
        dispatch(actionSuccessAction());
        if (state.selectedOpportunity?.id === id) {
          dispatch(clearSelectedOpportunityAction());
        }
        await refetchListIfCurrentClient(state.currentClientId);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete opportunity.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.selectedOpportunity?.id, state.currentClientId, refetchListIfCurrentClient]
  );

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadOpportunitiesByClient,
      loadOpportunities,
      clearOpportunities,
      loadOpportunity,
      clearSelectedOpportunity,
      loadStageHistory,
      createOpportunity,
      updateOpportunity,
      setStage,
      assignOpportunity,
      deleteOpportunity,
    }),
    [
      loadOpportunitiesByClient,
      loadOpportunities,
      clearOpportunities,
      loadOpportunity,
      clearSelectedOpportunity,
      loadStageHistory,
      createOpportunity,
      updateOpportunity,
      setStage,
      assignOpportunity,
      deleteOpportunity,
    ]
  );

  return (
    <OpportunitiesStateContext.Provider value={stateValue}>
      <OpportunitiesActionContext.Provider value={actionValue}>
        {children}
      </OpportunitiesActionContext.Provider>
    </OpportunitiesStateContext.Provider>
  );
};

export const useOpportunitiesState = () => {
  const context = useContext(OpportunitiesStateContext);
  if (!context) {
    throw new Error("useOpportunitiesState must be used within OpportunitiesProvider");
  }
  return context;
};

export const useOpportunitiesActions = () => {
  const context = useContext(OpportunitiesActionContext);
  if (!context) {
    throw new Error("useOpportunitiesActions must be used within OpportunitiesProvider");
  }
  return context;
};
