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

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    DashboardReducer,
    INITIAL_DASHBOARD_STATE
  );

  const loadDashboard = useCallback(async (): Promise<void> => {
    dispatch(loadDashboardPending());

    try {
      const overview = await dashboardService.getOverview();
      dispatch(loadDashboardSuccess(overview));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load dashboard.";
      dispatch(loadDashboardError(message));
    }
  }, []);

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
