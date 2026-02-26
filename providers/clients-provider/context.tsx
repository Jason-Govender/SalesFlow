import { createContext } from "react";
import type {
  IClient,
  IClientStats,
  IClientsListParams,
  ClientType,
  ICreateClientRequest,
  IUpdateClientRequest,
} from "../../utils/clients-service";

export interface IClientsPagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface IClientsFilters {
  searchTerm?: string;
  industry?: string;
  clientType?: ClientType | number;
  isActive?: boolean;
}

export interface IClientsStateContext {
  clients: IClient[] | null;
  selectedClient: IClient | null;
  clientStats: IClientStats | null;
  pagination: IClientsPagination;
  filters: IClientsFilters;
  isPending: boolean;
  isError: boolean;
  error?: string;
  actionPending: boolean;
}

export const INITIAL_CLIENTS_STATE: IClientsStateContext = {
  clients: null,
  selectedClient: null,
  clientStats: null,
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  },
  filters: {},
  isPending: false,
  isError: false,
  error: undefined,
  actionPending: false,
};

export interface IClientsActionContext {
  loadClients: (params?: IClientsListParams) => Promise<void>;
  loadClient: (id: string) => Promise<void>;
  loadClientStats: (id: string) => Promise<void>;
  setFilters: (filters: Partial<IClientsFilters>) => void;
  setPagination: (pageNumber: number, pageSize?: number) => void;
  createClient: (body: ICreateClientRequest) => Promise<IClient>;
  updateClient: (id: string, body: IUpdateClientRequest) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  clearSelectedClient: () => void;
}

export const ClientsStateContext =
  createContext<IClientsStateContext | undefined>(undefined);

export const ClientsActionContext =
  createContext<IClientsActionContext | undefined>(undefined);
