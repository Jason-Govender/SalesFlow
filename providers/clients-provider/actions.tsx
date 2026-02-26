import { createAction } from "redux-actions";
import type { IClientsStateContext } from "./context";
import type { IClientsFilters, IClientsPagination } from "./context";
import type {
  IClient,
  IClientStats,
  IClientsListResponse,
} from "../../utils/clients-service";

export enum ClientsActionEnums {
  loadClientsPending = "CLIENTS_LOAD_LIST_PENDING",
  loadClientsSuccess = "CLIENTS_LOAD_LIST_SUCCESS",
  loadClientsError = "CLIENTS_LOAD_LIST_ERROR",
  loadClientPending = "CLIENTS_LOAD_ONE_PENDING",
  loadClientSuccess = "CLIENTS_LOAD_ONE_SUCCESS",
  loadClientError = "CLIENTS_LOAD_ONE_ERROR",
  loadClientStatsSuccess = "CLIENTS_LOAD_STATS_SUCCESS",
  setFilters = "CLIENTS_SET_FILTERS",
  setPagination = "CLIENTS_SET_PAGINATION",
  setSelectedClient = "CLIENTS_SET_SELECTED",
  clearSelectedClient = "CLIENTS_CLEAR_SELECTED",
  actionPending = "CLIENTS_ACTION_PENDING",
  actionSuccess = "CLIENTS_ACTION_SUCCESS",
  actionError = "CLIENTS_ACTION_ERROR",
}

export const loadClientsPending = createAction<IClientsStateContext>(
  ClientsActionEnums.loadClientsPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IClientsStateContext
);

export const loadClientsSuccess = createAction<
  IClientsStateContext,
  IClientsListResponse
>(ClientsActionEnums.loadClientsSuccess, (response) => ({
  isPending: false,
  isError: false,
  error: undefined,
  clients: response.items,
  pagination: {
    pageNumber: response.pageNumber,
    pageSize: response.pageSize,
    totalCount: response.totalCount,
  },
} as IClientsStateContext));

export const loadClientsError = createAction<IClientsStateContext, string>(
  ClientsActionEnums.loadClientsError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      clients: null,
    }) as IClientsStateContext
);

export const loadClientPending = createAction<IClientsStateContext>(
  ClientsActionEnums.loadClientPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IClientsStateContext
);

export const loadClientSuccess = createAction<
  IClientsStateContext,
  IClient
>(ClientsActionEnums.loadClientSuccess, (client) =>
  ({
    isPending: false,
    isError: false,
    error: undefined,
    selectedClient: client,
  }) as IClientsStateContext
);

export const loadClientError = createAction<IClientsStateContext, string>(
  ClientsActionEnums.loadClientError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      selectedClient: null,
    }) as IClientsStateContext
);

export const loadClientStatsSuccess = createAction<
  IClientsStateContext,
  IClientStats
>(ClientsActionEnums.loadClientStatsSuccess, (clientStats) =>
  ({ clientStats }) as IClientsStateContext
);

export const setFiltersAction = createAction<
  IClientsStateContext,
  Partial<IClientsFilters>
>(ClientsActionEnums.setFilters, (filters) =>
  ({ filters }) as IClientsStateContext
);

export const setPaginationAction = createAction<
  IClientsStateContext,
  Partial<IClientsPagination>
>(ClientsActionEnums.setPagination, (pagination) =>
  ({ pagination }) as IClientsStateContext
);

export const setSelectedClientAction = createAction<
  IClientsStateContext,
  IClient | null
>(ClientsActionEnums.setSelectedClient, (selectedClient) =>
  ({ selectedClient }) as IClientsStateContext
);

export const clearSelectedClientAction = createAction<IClientsStateContext>(
  ClientsActionEnums.clearSelectedClient,
  () => ({ selectedClient: null, clientStats: null } as IClientsStateContext)
);

export const actionPendingAction = createAction<IClientsStateContext>(
  ClientsActionEnums.actionPending,
  () => ({ actionPending: true } as IClientsStateContext)
);

export const actionSuccessAction = createAction<IClientsStateContext>(
  ClientsActionEnums.actionSuccess,
  () => ({ actionPending: false } as IClientsStateContext)
);

export const actionErrorAction = createAction<IClientsStateContext, string>(
  ClientsActionEnums.actionError,
  (error) =>
    ({
      actionPending: false,
      isError: true,
      error,
    }) as IClientsStateContext
);
