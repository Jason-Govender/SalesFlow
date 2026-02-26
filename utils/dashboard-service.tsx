import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

/**
 * Dashboard overview response types (GET /api/dashboard/overview).
 * Matches API cheatsheet response shape.
 */
export interface IDashboardOverviewOpportunities {
  totalCount: number;
  wonCount: number;
  winRate: number;
  pipelineValue: number;
}

export interface IDashboardOverviewPipelineStage {
  stageId?: number;
  stageName?: string;
  count?: number;
  value?: number;
  [key: string]: unknown;
}

export interface IDashboardOverviewPipeline {
  stages: IDashboardOverviewPipelineStage[];
  weightedPipelineValue: number;
}

export interface IDashboardOverviewActivities {
  upcomingCount: number;
  overdueCount: number;
  completedTodayCount: number;
}

export interface IDashboardOverviewContracts {
  totalActiveCount: number;
  expiringThisMonthCount: number;
  totalContractValue: number;
}

export interface IDashboardOverviewRevenueTrendItem {
  month?: string;
  value?: number;
  [key: string]: unknown;
}

export interface IDashboardOverviewRevenue {
  thisMonth: number;
  thisQuarter: number;
  thisYear: number;
  monthlyTrend: IDashboardOverviewRevenueTrendItem[];
}

export interface IDashboardOverview {
  opportunities: IDashboardOverviewOpportunities;
  pipeline: IDashboardOverviewPipeline;
  activities: IDashboardOverviewActivities;
  contracts: IDashboardOverviewContracts;
  revenue: IDashboardOverviewRevenue;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;

  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const data = axiosError?.response?.data;

  if (data?.message && typeof data.message === "string") {
    return data.message;
  }

  if (data?.error && typeof data.error === "string") {
    return data.error;
  }

  if (isAxiosError(error) && error.code === "ERR_NETWORK" && !error.response) {
    return "Cannot reach the API. Check that the API is running and NEXT_PUBLIC_API_BASE_URL points to it (e.g. http://localhost:5053 for local development).";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const isAxiosError = (error: unknown): error is AxiosError => {
  if (!error || typeof error !== "object") return false;
  return "isAxiosError" in error;
};

export const dashboardService = {
  async getOverview(): Promise<IDashboardOverview> {
    try {
      const response = await axiosInstance.get<IDashboardOverview>(
        "/api/dashboard/overview"
      );
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        "Failed to load dashboard overview."
      );
      throw new Error(message);
    }
  },
};
