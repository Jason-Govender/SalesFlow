import { createContext } from "react";
import type {
  IActivity,
  ICreateActivityRequest,
  IUpdateActivityRequest,
  IActivitiesListParams,
  RelatedToType,
} from "../../utils/activities-service";

export type ActivitiesListMode = "all" | "my" | "upcoming" | "overdue" | "related";

export interface IActivitiesStateContext {
  items: IActivity[] | null;
  selectedActivity: IActivity | null;
  listMode: ActivitiesListMode;
  listParams: IActivitiesListParams & { relatedToType?: RelatedToType; relatedToId?: string; daysAhead?: number };
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  isPending: boolean;
  isError: boolean;
  error?: string;
  actionPending: boolean;
}

export const INITIAL_ACTIVITIES_STATE: IActivitiesStateContext = {
  items: null,
  selectedActivity: null,
  listMode: "my",
  listParams: {},
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  isPending: false,
  isError: false,
  error: undefined,
  actionPending: false,
};

export interface IActivitiesActionContext {
  loadList: (options?: {
    mode?: ActivitiesListMode;
    relatedToType?: RelatedToType;
    relatedToId?: string;
    params?: Partial<IActivitiesListParams & { daysAhead?: number }>;
  }) => Promise<void>;
  loadActivity: (id: string) => Promise<void>;
  clearSelectedActivity: () => void;
  createActivity: (body: ICreateActivityRequest) => Promise<IActivity>;
  updateActivity: (id: string, body: IUpdateActivityRequest) => Promise<void>;
  completeActivity: (id: string, outcome?: string) => Promise<void>;
  cancelActivity: (id: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

export const ActivitiesStateContext =
  createContext<IActivitiesStateContext | undefined>(undefined);

export const ActivitiesActionContext =
  createContext<IActivitiesActionContext | undefined>(undefined);
