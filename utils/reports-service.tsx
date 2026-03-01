import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

/**
 * Opportunities report (GET /api/reports/opportunities).
 * Filtered opportunities report. Params: startDate, endDate, stage, ownerId.
 */
export interface IOpportunitiesReportParams {
  startDate?: string;
  endDate?: string;
  stage?: number;
  ownerId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IOpportunityReportItem {
  id?: string;
  title?: string;
  clientName?: string;
  stage?: number;
  stageName?: string;
  estimatedValue?: number;
  expectedCloseDate?: string;
  ownerId?: string;
  ownerName?: string;
  [key: string]: unknown;
}

export interface IOpportunitiesReportResponse {
  items: IOpportunityReportItem[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Sales by period (GET /api/reports/sales-by-period).
 * Revenue grouped by time period. Params: startDate, endDate, groupBy (month | week).
 */
export interface ISalesByPeriodParams {
  startDate: string;
  endDate: string;
  groupBy: "month" | "week";
}

export interface ISalesByPeriodItem {
  period?: string;
  value?: number;
  [key: string]: unknown;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const data = axiosError?.response?.data;
  if (data?.message && typeof data.message === "string") return data.message;
  if (data?.error && typeof data.error === "string") return data.error;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const reportsService = {
  async getOpportunitiesReport(
    params: IOpportunitiesReportParams
  ): Promise<IOpportunitiesReportResponse> {
    try {
      const response = await axiosInstance.get<IOpportunitiesReportResponse>(
        "/api/reports/opportunities",
        { params }
      );
      const data = response.data;
      return {
        items: Array.isArray(data?.items) ? data.items : [],
        totalCount: data?.totalCount ?? 0,
        pageNumber: data?.pageNumber ?? params.pageNumber ?? 1,
        pageSize: data?.pageSize ?? params.pageSize ?? 10,
      };
    } catch (error: unknown) {
      throw new Error(
        extractErrorMessage(error, "Failed to load opportunities report.")
      );
    }
  },

  async getSalesByPeriod(
    params: ISalesByPeriodParams
  ): Promise<ISalesByPeriodItem[]> {
    try {
      const response = await axiosInstance.get<ISalesByPeriodItem[]>(
        "/api/reports/sales-by-period",
        { params }
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: unknown) {
      throw new Error(
        extractErrorMessage(error, "Failed to load sales by period.")
      );
    }
  },
};
