import { createAction } from "redux-actions";
import type { IActivitiesStateContext } from "./context";
import type { IActivity } from "../../utils/activities-service";
import type { ActivitiesListMode } from "./context";

export enum ActivitiesActionEnums {
  loadListPending = "ACTIVITIES_LOAD_LIST_PENDING",
  loadListSuccess = "ACTIVITIES_LOAD_LIST_SUCCESS",
  loadListError = "ACTIVITIES_LOAD_LIST_ERROR",
  loadActivityPending = "ACTIVITIES_LOAD_ACTIVITY_PENDING",
  loadActivitySuccess = "ACTIVITIES_LOAD_ACTIVITY_SUCCESS",
  loadActivityError = "ACTIVITIES_LOAD_ACTIVITY_ERROR",
  clearSelectedActivity = "ACTIVITIES_CLEAR_SELECTED",
  actionPending = "ACTIVITIES_ACTION_PENDING",
  actionSuccess = "ACTIVITIES_ACTION_SUCCESS",
  actionError = "ACTIVITIES_ACTION_ERROR",
}

export const loadListPending = createAction<Partial<IActivitiesStateContext>>(
  ActivitiesActionEnums.loadListPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as Partial<IActivitiesStateContext>
);

export const loadListSuccess = createAction<
  Partial<IActivitiesStateContext>,
  {
    items: IActivity[];
    listMode: ActivitiesListMode;
    listParams: IActivitiesStateContext["listParams"];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  }
>(
  ActivitiesActionEnums.loadListSuccess,
  ({ items, listMode, listParams, pageNumber, pageSize, totalCount }) =>
    ({
      isPending: false,
      isError: false,
      error: undefined,
      items,
      listMode,
      listParams,
      pageNumber,
      pageSize,
      totalCount,
    }) as Partial<IActivitiesStateContext>
);

export const loadListError = createAction<Partial<IActivitiesStateContext>, string>(
  ActivitiesActionEnums.loadListError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      items: null,
    }) as Partial<IActivitiesStateContext>
);

export const loadActivityPending = createAction<Partial<IActivitiesStateContext>>(
  ActivitiesActionEnums.loadActivityPending,
  () => ({ isPending: true, isError: false, error: undefined }) as Partial<IActivitiesStateContext>
);

export const loadActivitySuccess = createAction<Partial<IActivitiesStateContext>, IActivity>(
  ActivitiesActionEnums.loadActivitySuccess,
  (selectedActivity) =>
    ({
      isPending: false,
      isError: false,
      error: undefined,
      selectedActivity,
    }) as Partial<IActivitiesStateContext>
);

export const loadActivityError = createAction<Partial<IActivitiesStateContext>, string>(
  ActivitiesActionEnums.loadActivityError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      selectedActivity: null,
    }) as Partial<IActivitiesStateContext>
);

export const clearSelectedActivityAction = createAction<Partial<IActivitiesStateContext>>(
  ActivitiesActionEnums.clearSelectedActivity,
  () => ({ selectedActivity: null }) as Partial<IActivitiesStateContext>
);

export const actionPendingAction = createAction<Partial<IActivitiesStateContext>>(
  ActivitiesActionEnums.actionPending,
  () => ({ actionPending: true } as Partial<IActivitiesStateContext>)
);

export const actionSuccessAction = createAction<Partial<IActivitiesStateContext>>(
  ActivitiesActionEnums.actionSuccess,
  () => ({ actionPending: false } as Partial<IActivitiesStateContext>)
);

export const actionErrorAction = createAction<Partial<IActivitiesStateContext>, string>(
  ActivitiesActionEnums.actionError,
  (error) =>
    ({
      actionPending: false,
      isError: true,
      error,
    }) as Partial<IActivitiesStateContext>
);
