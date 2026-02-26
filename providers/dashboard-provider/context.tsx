import { createContext } from "react";
import type { IDashboardOverview } from "../../utils/dashboard-service";

export interface IDashboardStateContext {
  overview: IDashboardOverview | null;
  isPending: boolean;
  isError: boolean;
  error?: string;
}

export const INITIAL_DASHBOARD_STATE: IDashboardStateContext = {
  overview: null,
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
