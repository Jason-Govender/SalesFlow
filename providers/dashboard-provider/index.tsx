"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
  useEffect,
} from "react";

import {
  DashboardStateContext,
  DashboardActionContext,
  INITIAL_DASHBOARD_STATE,
} from "./context";

import { DashboardReducer } from "./reducer";
import {
  loadDashboardPending,
  loadDashboardSuccess,
  loadDashboardError,
} from "./actions";

import { dashboardService } from "../../utils/dashboard-service";
import { useAuthState } from "@/providers/auth-provider";

const ROLES_CAN_VIEW_SALES_AND_CONTRACTS = ["Admin", "SalesManager"];

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    DashboardReducer,
    INITIAL_DASHBOARD_STATE
  );
  const { session } = useAuthState();
  const canLoadRestricted =
    session?.user?.roles?.some((r) =>
      ROLES_CAN_VIEW_SALES_AND_CONTRACTS.includes(r)
    ) ?? false;

  const loadDashboard = useCallback(async (): Promise<void> => {
    dispatch(loadDashboardPending());

    try {
      const basePromises: [
        Promise<Awaited<ReturnType<typeof dashboardService.getOverview>>>,
        Promise<Awaited<ReturnType<typeof dashboardService.getPipelineMetrics>>>,
      ] = [
        dashboardService.getOverview(),
        dashboardService.getPipelineMetrics(),
      ];
      const [overview, pipelineMetrics] = await Promise.all(basePromises);

      let salesPerformance: Awaited<
        ReturnType<typeof dashboardService.getSalesPerformance>
      > | null = null;
      let contractsExpiring: Awaited<
        ReturnType<typeof dashboardService.getContractsExpiring>
      > | null = null;
      if (canLoadRestricted) {
        try {
          [salesPerformance, contractsExpiring] = await Promise.all([
            dashboardService.getSalesPerformance(5),
            dashboardService.getContractsExpiring(30),
          ]);
        } catch {
          salesPerformance = [];
          contractsExpiring = [];
        }
      }

      dispatch(
        loadDashboardSuccess({
          overview,
          pipelineMetrics,
          salesPerformance,
          contractsExpiring,
        })
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load dashboard.";
      dispatch(loadDashboardError(message));
    }
  }, [canLoadRestricted]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadDashboard,
    }),
    [loadDashboard]
  );

  return (
    <DashboardStateContext.Provider value={stateValue}>
      <DashboardActionContext.Provider value={actionValue}>
        {children}
      </DashboardActionContext.Provider>
    </DashboardStateContext.Provider>
  );
};

export const useDashboardState = () => {
  const context = useContext(DashboardStateContext);
  if (!context) {
    throw new Error("useDashboardState must be used within DashboardProvider");
  }
  return context;
};

export const useDashboardActions = () => {
  const context = useContext(DashboardActionContext);
  if (!context) {
    throw new Error("useDashboardActions must be used within DashboardProvider");
  }
  return context;
};
