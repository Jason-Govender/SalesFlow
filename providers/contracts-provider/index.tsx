"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  ContractsStateContext,
  ContractsActionContext,
  INITIAL_CONTRACTS_STATE,
} from "./context";

import { ContractsReducer } from "./reducer";
import {
  loadContractsPending,
  loadContractsSuccess,
  loadContractsError,
  clearContractsAction,
  actionPendingAction,
  actionSuccessAction,
  actionErrorAction,
} from "./actions";

import {
  contractsService,
  type ICreateContractRequest,
  type IUpdateContractRequest,
} from "../../utils/contracts-service";

export const ContractsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    ContractsReducer,
    INITIAL_CONTRACTS_STATE
  );

  const loadContractsByClient = useCallback(async (clientId: string): Promise<void> => {
    dispatch(loadContractsPending());
    try {
      const contracts = await contractsService.getContractsByClient(clientId);
      dispatch(loadContractsSuccess({ contracts, clientId }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load contracts.";
      dispatch(loadContractsError(message));
    }
  }, []);

  const loadContracts = useCallback(
    async (params?: { clientId?: string; status?: number; pageNumber?: number; pageSize?: number }): Promise<void> => {
      dispatch(loadContractsPending());
      try {
        const contracts = await contractsService.listContracts(params);
        dispatch(loadContractsSuccess({ contracts, clientId: null }));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load contracts.";
        dispatch(loadContractsError(message));
      }
    },
    []
  );

  const clearContracts = useCallback(() => {
    dispatch(clearContractsAction());
  }, []);

  const createContract = useCallback(
    async (
      clientId: string,
      body: Omit<ICreateContractRequest, "clientId">
    ) => {
      dispatch(actionPendingAction());
      try {
        const contract = await contractsService.createContract({
          ...body,
          clientId,
        });
        dispatch(actionSuccessAction());
        if (state.currentClientId === clientId) {
          const contracts = await contractsService.getContractsByClient(clientId);
          dispatch(loadContractsSuccess({ contracts, clientId }));
        } else if (state.currentClientId === null) {
          const contracts = await contractsService.listContracts();
          dispatch(loadContractsSuccess({ contracts, clientId: null }));
        }
        return contract;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create contract.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const updateContract = useCallback(
    async (id: string, body: IUpdateContractRequest) => {
      dispatch(actionPendingAction());
      try {
        await contractsService.updateContract(id, body);
        dispatch(actionSuccessAction());
        const clientId = state.currentClientId;
        if (clientId) {
          const contracts = await contractsService.getContractsByClient(clientId);
          dispatch(loadContractsSuccess({ contracts, clientId }));
        } else if (clientId === null) {
          const contracts = await contractsService.listContracts();
          dispatch(loadContractsSuccess({ contracts, clientId: null }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update contract.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const activateContract = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await contractsService.activateContract(id);
        dispatch(actionSuccessAction());
        const clientId = state.currentClientId;
        if (clientId) {
          const contracts = await contractsService.getContractsByClient(clientId);
          dispatch(loadContractsSuccess({ contracts, clientId }));
        } else if (clientId === null) {
          const contracts = await contractsService.listContracts();
          dispatch(loadContractsSuccess({ contracts, clientId: null }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to activate contract.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const cancelContract = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await contractsService.cancelContract(id);
        dispatch(actionSuccessAction());
        const clientId = state.currentClientId;
        if (clientId) {
          const contracts = await contractsService.getContractsByClient(clientId);
          dispatch(loadContractsSuccess({ contracts, clientId }));
        } else if (clientId === null) {
          const contracts = await contractsService.listContracts();
          dispatch(loadContractsSuccess({ contracts, clientId: null }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to cancel contract.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const deleteContract = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await contractsService.deleteContract(id);
        dispatch(actionSuccessAction());
        const clientId = state.currentClientId;
        if (clientId) {
          const contracts = await contractsService.getContractsByClient(clientId);
          dispatch(loadContractsSuccess({ contracts, clientId }));
        } else if (clientId === null) {
          const contracts = await contractsService.listContracts();
          dispatch(loadContractsSuccess({ contracts, clientId: null }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete contract.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadContractsByClient,
      loadContracts,
      clearContracts,
      createContract,
      updateContract,
      activateContract,
      cancelContract,
      deleteContract,
    }),
    [
      loadContractsByClient,
      loadContracts,
      clearContracts,
      createContract,
      updateContract,
      activateContract,
      cancelContract,
      deleteContract,
    ]
  );

  return (
    <ContractsStateContext.Provider value={stateValue}>
      <ContractsActionContext.Provider value={actionValue}>
        {children}
      </ContractsActionContext.Provider>
    </ContractsStateContext.Provider>
  );
};

export const useContractsState = () => {
  const context = useContext(ContractsStateContext);
  if (!context) {
    throw new Error("useContractsState must be used within ContractsProvider");
  }
  return context;
};

export const useContractsActions = () => {
  const context = useContext(ContractsActionContext);
  if (!context) {
    throw new Error("useContractsActions must be used within ContractsProvider");
  }
  return context;
};
