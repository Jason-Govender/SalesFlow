import { createContext } from "react";
import type {
  IDashboardOverview,
  IPipelineMetrics,
} from "../../utils/dashboard-service";

export interface IDashboardStateContext {
  overview: IDashboardOverview | null;
  pipelineMetrics: IPipelineMetrics | null;
  isPending: boolean;
  isError: boolean;
  error?: string;
}

export const INITIAL_DASHBOARD_STATE: IDashboardStateContext = {
  overview: null,
  pipelineMetrics: null,
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
