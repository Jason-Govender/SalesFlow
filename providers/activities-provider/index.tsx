"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  ActivitiesStateContext,
  ActivitiesActionContext,
  INITIAL_ACTIVITIES_STATE,
} from "./context";
import type { ActivitiesListMode, IActivitiesStateContext } from "./context";

import { ActivitiesReducer } from "./reducer";
import {
  loadListPending,
  loadListSuccess,
  loadListError,
  loadActivityPending,
  loadActivitySuccess,
  loadActivityError,
  clearSelectedActivityAction,
  actionPendingAction,
  actionSuccessAction,
  actionErrorAction,
} from "./actions";

import {
  activitiesService,
  type ICreateActivityRequest,
  type IUpdateActivityRequest,
  type RelatedToType,
} from "../../utils/activities-service";

export const ActivitiesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    ActivitiesReducer,
    INITIAL_ACTIVITIES_STATE
  );

  const loadList = useCallback(
    async (options?: {
      mode?: ActivitiesListMode;
      relatedToType?: RelatedToType;
      relatedToId?: string;
      params?: Partial<{
        pageNumber: number;
        pageSize: number;
        status: number;
        daysAhead: number;
      }>;
    }) => {
      const mode = options?.mode ?? state.listMode;
      const relatedToType = options?.relatedToType ?? state.listParams?.relatedToType;
      const relatedToId = options?.relatedToId ?? state.listParams?.relatedToId;
      const pageNumber = options?.params?.pageNumber ?? state.pageNumber;
      const pageSize = options?.params?.pageSize ?? state.pageSize;

      dispatch(loadListPending());

      try {
        let result;
        const listParams: IActivitiesStateContext["listParams"] = {
          pageNumber,
          pageSize,
          ...(relatedToType != null && { relatedToType }),
          ...(relatedToId && { relatedToId }),
        };

        if (mode === "related" && relatedToType != null && relatedToId) {
          result = await activitiesService.list({
            relatedToType,
            relatedToId,
            pageNumber,
            pageSize,
          });
          dispatch(
            loadListSuccess({
              items: result.items,
              listMode: "related",
              listParams: { ...listParams, relatedToType, relatedToId },
              pageNumber: result.pageNumber,
              pageSize: result.pageSize,
              totalCount: result.totalCount,
            })
          );
        } else if (mode === "my") {
          result = await activitiesService.getMyActivities({
            pageNumber,
            pageSize,
            status: options?.params?.status,
          });
          dispatch(
            loadListSuccess({
              items: result.items,
              listMode: "my",
              listParams,
              pageNumber: result.pageNumber,
              pageSize: result.pageSize,
              totalCount: result.totalCount,
            })
          );
        } else if (mode === "upcoming") {
          const daysAhead = options?.params?.daysAhead ?? state.listParams?.daysAhead ?? 7;
          result = await activitiesService.getUpcoming({
            daysAhead,
            pageNumber,
            pageSize,
          });
          dispatch(
            loadListSuccess({
              items: result.items,
              listMode: "upcoming",
              listParams: { ...listParams, daysAhead },
              pageNumber: result.pageNumber,
              pageSize: result.pageSize,
              totalCount: result.totalCount,
            })
          );
        } else if (mode === "overdue") {
          result = await activitiesService.getOverdue({ pageNumber, pageSize });
          dispatch(
            loadListSuccess({
              items: result.items,
              listMode: "overdue",
              listParams,
              pageNumber: result.pageNumber,
              pageSize: result.pageSize,
              totalCount: result.totalCount,
            })
          );
        } else {
          result = await activitiesService.list({
            ...state.listParams,
            pageNumber,
            pageSize,
          });
          dispatch(
            loadListSuccess({
              items: result.items,
              listMode: "all",
              listParams,
              pageNumber: result.pageNumber,
              pageSize: result.pageSize,
              totalCount: result.totalCount,
            })
          );
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load activities.";
        dispatch(loadListError(message));
      }
    },
    [state.listMode, state.listParams, state.pageNumber, state.pageSize]
  );

  const loadActivity = useCallback(async (id: string): Promise<void> => {
    dispatch(loadActivityPending());
    try {
      const activity = await activitiesService.getById(id);
      dispatch(loadActivitySuccess(activity));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load activity.";
      dispatch(loadActivityError(message));
    }
  }, []);

  const clearSelectedActivity = useCallback(() => {
    dispatch(clearSelectedActivityAction());
  }, []);

  const refreshCurrentList = useCallback(() => {
    const { listMode, listParams, pageNumber, pageSize } = state;
    if (listMode === "related" && listParams?.relatedToType != null && listParams?.relatedToId) {
      loadList({
        mode: "related",
        relatedToType: listParams.relatedToType as RelatedToType,
        relatedToId: listParams.relatedToId,
        params: { pageNumber, pageSize },
      });
    } else {
      loadList({
        mode: listMode,
        params: {
          pageNumber,
          pageSize,
          daysAhead: listParams?.daysAhead,
        },
      });
    }
  }, [state.listMode, state.listParams, state.pageNumber, state.pageSize, loadList]);

  const createActivity = useCallback(
    async (body: ICreateActivityRequest) => {
      dispatch(actionPendingAction());
      try {
        const activity = await activitiesService.create(body);
        dispatch(actionSuccessAction());
        refreshCurrentList();
        return activity;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create activity.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [refreshCurrentList]
  );

  const updateActivity = useCallback(
    async (id: string, body: IUpdateActivityRequest) => {
      dispatch(actionPendingAction());
      try {
        const updated = await activitiesService.update(id, body);
        dispatch(actionSuccessAction());
        if (state.selectedActivity?.id === id) {
          dispatch(loadActivitySuccess(updated));
        }
        refreshCurrentList();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update activity.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.selectedActivity?.id, refreshCurrentList]
  );

  const completeActivity = useCallback(
    async (id: string, outcome?: string) => {
      dispatch(actionPendingAction());
      try {
        await activitiesService.complete(id, { outcome });
        dispatch(actionSuccessAction());
        if (state.selectedActivity?.id === id) {
          const updated = await activitiesService.getById(id);
          dispatch(loadActivitySuccess(updated));
        }
        refreshCurrentList();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to complete activity.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.selectedActivity?.id, refreshCurrentList]
  );

  const cancelActivity = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await activitiesService.cancel(id);
        dispatch(actionSuccessAction());
        if (state.selectedActivity?.id === id) {
          dispatch(clearSelectedActivityAction());
        }
        refreshCurrentList();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to cancel activity.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.selectedActivity?.id, refreshCurrentList]
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await activitiesService.delete(id);
        dispatch(actionSuccessAction());
        if (state.selectedActivity?.id === id) {
          dispatch(clearSelectedActivityAction());
        }
        refreshCurrentList();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete activity.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.selectedActivity?.id, refreshCurrentList]
  );

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadList,
      loadActivity,
      clearSelectedActivity,
      createActivity,
      updateActivity,
      completeActivity,
      cancelActivity,
      deleteActivity,
    }),
    [
      loadList,
      loadActivity,
      clearSelectedActivity,
      createActivity,
      updateActivity,
      completeActivity,
      cancelActivity,
      deleteActivity,
    ]
  );

  return (
    <ActivitiesStateContext.Provider value={stateValue}>
      <ActivitiesActionContext.Provider value={actionValue}>
        {children}
      </ActivitiesActionContext.Provider>
    </ActivitiesStateContext.Provider>
  );
};

export const useActivitiesState = () => {
  const context = useContext(ActivitiesStateContext);
  if (!context) {
    throw new Error("useActivitiesState must be used within ActivitiesProvider");
  }
  return context;
};

export const useActivitiesActions = () => {
  const context = useContext(ActivitiesActionContext);
  if (!context) {
    throw new Error("useActivitiesActions must be used within ActivitiesProvider");
  }
  return context;
};
