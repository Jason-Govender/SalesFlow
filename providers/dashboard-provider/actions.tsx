import { createAction } from "redux-actions";
import type { IDashboardStateContext } from "./context";
import type {
  IDashboardOverview,
  IPipelineMetrics,
  ISalesPerformanceItem,
  IContractExpiring,
} from "../../utils/dashboard-service";

export interface IDashboardLoadSuccessPayload {
  overview: IDashboardOverview;
  pipelineMetrics: IPipelineMetrics;
  salesPerformance: ISalesPerformanceItem[] | null;
  contractsExpiring: IContractExpiring[] | null;
}

export enum DashboardActionEnums {
  loadDashboardPending = "DASHBOARD_LOAD_PENDING",
  loadDashboardSuccess = "DASHBOARD_LOAD_SUCCESS",
  loadDashboardError = "DASHBOARD_LOAD_ERROR",
}

export const loadDashboardPending = createAction<IDashboardStateContext>(
  DashboardActionEnums.loadDashboardPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IDashboardStateContext
);

export const loadDashboardSuccess = createAction<
  IDashboardStateContext,
  IDashboardLoadSuccessPayload
>(DashboardActionEnums.loadDashboardSuccess, (payload) => ({
  isPending: false,
  isError: false,
  error: undefined,
  overview: payload.overview,
  pipelineMetrics: payload.pipelineMetrics,
  salesPerformance: payload.salesPerformance,
  contractsExpiring: payload.contractsExpiring,
}));

export const loadDashboardError = createAction<IDashboardStateContext, string>(
  DashboardActionEnums.loadDashboardError,
  (error) => ({
    isPending: false,
    isError: true,
    error,
    overview: null,
    pipelineMetrics: null,
    salesPerformance: null,
    contractsExpiring: null,
  })
);
