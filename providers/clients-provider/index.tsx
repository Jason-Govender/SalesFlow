"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  ClientsStateContext,
  ClientsActionContext,
  INITIAL_CLIENTS_STATE,
} from "./context";

import { ClientsReducer } from "./reducer";
import {
  loadClientsPending,
  loadClientsSuccess,
  loadClientsError,
  loadClientPending,
  loadClientSuccess,
  loadClientError,
  loadClientStatsSuccess,
  setFiltersAction,
  setPaginationAction,
  clearSelectedClientAction,
  actionPendingAction,
  actionSuccessAction,
  actionErrorAction,
  setSelectedClientAction,
} from "./actions";

import {
  clientsService,
  type ICreateClientRequest,
  type IUpdateClientRequest,
  type IClientsListParams,
} from "../../utils/clients-service";

export const ClientsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    ClientsReducer,
    INITIAL_CLIENTS_STATE
  );

  const loadClients = useCallback(
    async (params?: IClientsListParams): Promise<void> => {
      const effectiveParams = {
        ...state.filters,
        pageNumber: params?.pageNumber ?? state.pagination.pageNumber,
        pageSize: params?.pageSize ?? state.pagination.pageSize,
        ...params,
      };
      dispatch(loadClientsPending());
      try {
        const response = await clientsService.getClients(effectiveParams);
        dispatch(loadClientsSuccess(response));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load clients.";
        dispatch(loadClientsError(message));
      }
    },
    [state.filters, state.pagination.pageNumber, state.pagination.pageSize]
  );

  const loadClient = useCallback(async (id: string): Promise<void> => {
    dispatch(loadClientPending());
    try {
      const client = await clientsService.getClient(id);
      dispatch(loadClientSuccess(client));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load client.";
      dispatch(loadClientError(message));
    }
  }, []);

  const loadClientStats = useCallback(async (id: string): Promise<void> => {
    try {
      const stats = await clientsService.getClientStats(id);
      dispatch(loadClientStatsSuccess(stats));
    } catch {
      dispatch(loadClientStatsSuccess({}));
    }
  }, []);

  const setFilters = useCallback(
    (filters: Partial<typeof state.filters>) => {
      dispatch(setFiltersAction(filters));
    },
    []
  );

  const setPagination = useCallback(
    (pageNumber: number, pageSize?: number) => {
      dispatch(
        setPaginationAction({
          pageNumber,
          ...(pageSize != null && { pageSize }),
        })
      );
    },
    []
  );

  const createClient = useCallback(
    async (body: ICreateClientRequest) => {
      dispatch(actionPendingAction());
      try {
        const client = await clientsService.createClient(body);
        dispatch(actionSuccessAction());
        dispatch(setSelectedClientAction(client));
        return client;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create client.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    []
  );

  const updateClient = useCallback(
    async (id: string, body: IUpdateClientRequest) => {
      dispatch(actionPendingAction());
      try {
        const updated = await clientsService.updateClient(id, body);
        dispatch(actionSuccessAction());
        dispatch(setSelectedClientAction(updated));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update client.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    []
  );

  const deleteClient = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await clientsService.deleteClient(id);
        dispatch(actionSuccessAction());
        dispatch(clearSelectedClientAction());
        if (state.clients) {
          const list = await clientsService.getClients({
            ...state.filters,
            pageNumber: state.pagination.pageNumber,
            pageSize: state.pagination.pageSize,
          });
          dispatch(loadClientsSuccess(list));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete client.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [
      state.clients,
      state.filters,
      state.pagination.pageNumber,
      state.pagination.pageSize,
    ]
  );

  const clearSelectedClient = useCallback(() => {
    dispatch(clearSelectedClientAction());
  }, []);

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadClients,
      loadClient,
      loadClientStats,
      setFilters,
      setPagination,
      createClient,
      updateClient,
      deleteClient,
      clearSelectedClient,
    }),
    [
      loadClients,
      loadClient,
      loadClientStats,
      setFilters,
      setPagination,
      createClient,
      updateClient,
      deleteClient,
      clearSelectedClient,
    ]
  );

  return (
    <ClientsStateContext.Provider value={stateValue}>
      <ClientsActionContext.Provider value={actionValue}>
        {children}
      </ClientsActionContext.Provider>
    </ClientsStateContext.Provider>
  );
};

export const useClientsState = () => {
  const context = useContext(ClientsStateContext);
  if (!context) {
    throw new Error("useClientsState must be used within ClientsProvider");
  }
  return context;
};

export const useClientsActions = () => {
  const context = useContext(ClientsActionContext);
  if (!context) {
    throw new Error("useClientsActions must be used within ClientsProvider");
  }
  return context;
};
