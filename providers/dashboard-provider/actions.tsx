import { createAction } from "redux-actions";
import type { IDashboardStateContext } from "./context";
import type { IDashboardOverview } from "../../utils/dashboard-service";

export enum DashboardActionEnums {
  loadDashboardPending = "DASHBOARD_LOAD_PENDING",
  loadDashboardSuccess = "DASHBOARD_LOAD_SUCCESS",
  loadDashboardError = "DASHBOARD_LOAD_ERROR",
}

export const loadDashboardPending = createAction<IDashboardStateContext>(
  DashboardActionEnums.loadDashboardPending,
  () => ({
    isPending: true,
    isError: false,
    error: undefined,
  })
);

export const loadDashboardSuccess = createAction<
  IDashboardStateContext,
  IDashboardOverview
>(DashboardActionEnums.loadDashboardSuccess, (overview) => ({
  isPending: false,
  isError: false,
  error: undefined,
  overview,
}));

export const loadDashboardError = createAction<IDashboardStateContext, string>(
  DashboardActionEnums.loadDashboardError,
  (error) => ({
    isPending: false,
    isError: true,
    error,
    overview: null,
  })
);
