import { createContext } from "react";
import type {
  IDashboardOverview,
  IPipelineMetrics,
  ISalesPerformanceItem,
  IContractExpiring,
} from "../../utils/dashboard-service";

export interface IDashboardStateContext {
  overview: IDashboardOverview | null;
  pipelineMetrics: IPipelineMetrics | null;
  salesPerformance: ISalesPerformanceItem[] | null;
  contractsExpiring: IContractExpiring[] | null;
  isPending: boolean;
  isError: boolean;
  error?: string;
}

export const INITIAL_DASHBOARD_STATE: IDashboardStateContext = {
  overview: null,
  pipelineMetrics: null,
  salesPerformance: null,
  contractsExpiring: null,
  isPending: false,
  isError: false,
  error: undefined,
};

export interface IDashboardActionContext {
  loadDashboard: () => Promise<void>;
}

export const DashboardStateContext =
  createContext<IDashboardStateContext | undefined>(undefined);

export const DashboardActionContext =
  createContext<IDashboardActionContext | undefined>(undefined);
