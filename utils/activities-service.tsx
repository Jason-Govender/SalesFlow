import { axiosInstance } from "./axios-instance";
import type { AxiosError } from "axios";

/** ActivityType: 1 Meeting, 2 Call, 3 Email, 4 Task, 5 Presentation, 6 Other */
export enum ActivityType {
  Meeting = 1,
  Call = 2,
  Email = 3,
  Task = 4,
  Presentation = 5,
  Other = 6,
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  [ActivityType.Meeting]: "Meeting",
  [ActivityType.Call]: "Call",
  [ActivityType.Email]: "Email",
  [ActivityType.Task]: "Task",
  [ActivityType.Presentation]: "Presentation",
  [ActivityType.Other]: "Other",
};

/** ActivityStatus: 1 Scheduled, 2 Completed, 3 Cancelled */
export enum ActivityStatus {
  Scheduled = 1,
  Completed = 2,
  Cancelled = 3,
}

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.Scheduled]: "Scheduled",
  [ActivityStatus.Completed]: "Completed",
  [ActivityStatus.Cancelled]: "Cancelled",
};

/** Priority: 1 Low, 2 Medium, 3 High, 4 Urgent */
export enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
  Urgent = 4,
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.Low]: "Low",
  [Priority.Medium]: "Medium",
  [Priority.High]: "High",
  [Priority.Urgent]: "Urgent",
};

/** RelatedToType: 1 Client, 2 Opportunity, 3 Proposal, 4 Contract */
export enum RelatedToType {
  Client = 1,
  Opportunity = 2,
  Proposal = 3,
  Contract = 4,
}

export const RELATED_TO_TYPE_LABELS: Record<RelatedToType, string> = {
  [RelatedToType.Client]: "Client",
  [RelatedToType.Opportunity]: "Opportunity",
  [RelatedToType.Proposal]: "Proposal",
  [RelatedToType.Contract]: "Contract",
};

export interface IActivity {
  id: string;
  type: ActivityType | number;
  subject: string;
  description?: string;
  priority?: Priority | number;
  dueDate?: string;
  assignedToId?: string;
  relatedToType?: RelatedToType | number;
  relatedToId?: string;
  duration?: number;
  location?: string;
  status: ActivityStatus | number;
  outcome?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface IActivitiesListParams {
  assignedToId?: string;
  type?: ActivityType | number;
  status?: ActivityStatus | number;
  relatedToType?: RelatedToType | number;
  relatedToId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IActivitiesListResponse {
  items: IActivity[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}

export interface ICreateActivityRequest {
  type: ActivityType | number;
  subject: string;
  description?: string;
  priority?: Priority | number;
  dueDate: string;
  assignedToId?: string;
  relatedToType?: RelatedToType | number;
  relatedToId?: string;
  duration?: number;
  location?: string;
}

export interface IUpdateActivityRequest {
  type?: ActivityType | number;
  subject?: string;
  description?: string;
  priority?: Priority | number;
  dueDate?: string;
  assignedToId?: string;
  relatedToType?: RelatedToType | number;
  relatedToId?: string;
  duration?: number;
  location?: string;
}

export interface ICompleteActivityRequest {
  outcome?: string;
}

export interface IMyActivitiesParams {
  status?: ActivityStatus | number;
  pageNumber?: number;
  pageSize?: number;
}

export interface IUpcomingParams {
  daysAhead?: number;
  pageNumber?: number;
  pageSize?: number;
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
    return "Cannot reach the API. Check that the API is running and NEXT_PUBLIC_API_BASE_URL points to it.";
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

const normalizeListResponse = (
  data: unknown,
  params?: { pageNumber?: number; pageSize?: number }
): IActivitiesListResponse => {
  if (Array.isArray(data)) {
    return {
      items: data as IActivity[],
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
      totalCount: (data as unknown[]).length,
    };
  }
  const d = data as IActivitiesListResponse | undefined;
  return {
    items: d?.items ?? [],
    pageNumber: d?.pageNumber ?? 1,
    pageSize: d?.pageSize ?? 10,
    totalCount: d?.totalCount ?? 0,
  };
};

export const activitiesService = {
  async list(params?: IActivitiesListParams): Promise<IActivitiesListResponse> {
    try {
      const response = await axiosInstance.get<IActivitiesListResponse | IActivity[]>(
        "/api/activities",
        { params }
      );
      return normalizeListResponse(response.data, params);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load activities.");
      throw new Error(message);
    }
  },

  async getById(id: string): Promise<IActivity> {
    try {
      const response = await axiosInstance.get<IActivity>(`/api/activities/${id}`);
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load activity.");
      throw new Error(message);
    }
  },

  async getMyActivities(params?: IMyActivitiesParams): Promise<IActivitiesListResponse> {
    try {
      const response = await axiosInstance.get<IActivitiesListResponse | IActivity[]>(
        "/api/activities/my-activities",
        { params }
      );
      return normalizeListResponse(response.data, params);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load my activities.");
      throw new Error(message);
    }
  },

  async getUpcoming(params?: IUpcomingParams): Promise<IActivitiesListResponse> {
    try {
      const response = await axiosInstance.get<IActivitiesListResponse | IActivity[]>(
        "/api/activities/upcoming",
        { params: { daysAhead: params?.daysAhead ?? 7, ...params } }
      );
      return normalizeListResponse(response.data, params);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load upcoming activities.");
      throw new Error(message);
    }
  },

  async getOverdue(params?: { pageNumber?: number; pageSize?: number }): Promise<IActivitiesListResponse> {
    try {
      const response = await axiosInstance.get<IActivitiesListResponse | IActivity[]>(
        "/api/activities/overdue",
        { params }
      );
      return normalizeListResponse(response.data, params);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to load overdue activities.");
      throw new Error(message);
    }
  },

  async create(body: ICreateActivityRequest): Promise<IActivity> {
    try {
      const response = await axiosInstance.post<IActivity>("/api/activities", body);
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to create activity.");
      throw new Error(message);
    }
  },

  async update(id: string, body: IUpdateActivityRequest): Promise<IActivity> {
    try {
      const response = await axiosInstance.put<IActivity>(`/api/activities/${id}`, body);
      return response.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to update activity.");
      throw new Error(message);
    }
  },

  async complete(id: string, body: ICompleteActivityRequest): Promise<void> {
    try {
      await axiosInstance.put(`/api/activities/${id}/complete`, body);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to complete activity.");
      throw new Error(message);
    }
  },

  async cancel(id: string): Promise<void> {
    try {
      await axiosInstance.put(`/api/activities/${id}/cancel`);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to cancel activity.");
      throw new Error(message);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/activities/${id}`);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Failed to delete activity.");
      throw new Error(message);
    }
  },
};
