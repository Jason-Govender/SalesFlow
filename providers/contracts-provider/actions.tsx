import { createAction } from "redux-actions";
import type { IContractsStateContext } from "./context";
import type { IContract } from "../../utils/contracts-service";

export enum ContractsActionEnums {
  loadContractsPending = "CONTRACTS_LOAD_PENDING",
  loadContractsSuccess = "CONTRACTS_LOAD_SUCCESS",
  loadContractsError = "CONTRACTS_LOAD_ERROR",
  clearContracts = "CONTRACTS_CLEAR",
  actionPending = "CONTRACTS_ACTION_PENDING",
  actionSuccess = "CONTRACTS_ACTION_SUCCESS",
  actionError = "CONTRACTS_ACTION_ERROR",
}

export const loadContractsPending = createAction<IContractsStateContext>(
  ContractsActionEnums.loadContractsPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IContractsStateContext
);

export const loadContractsSuccess = createAction<
  IContractsStateContext,
  { contracts: IContract[]; clientId: string }
>(
  ContractsActionEnums.loadContractsSuccess,
  ({ contracts, clientId }) =>
    ({
      isPending: false,
      isError: false,
      error: undefined,
      contracts,
      currentClientId: clientId,
    }) as IContractsStateContext
);

export const loadContractsError = createAction<IContractsStateContext, string>(
  ContractsActionEnums.loadContractsError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      contracts: null,
    }) as IContractsStateContext
);

export const clearContractsAction = createAction<IContractsStateContext>(
  ContractsActionEnums.clearContracts,
  () =>
    ({
      contracts: null,
      currentClientId: null,
      isError: false,
      error: undefined,
    }) as IContractsStateContext
);

export const actionPendingAction = createAction<IContractsStateContext>(
  ContractsActionEnums.actionPending,
  () => ({ actionPending: true } as IContractsStateContext)
);

export const actionSuccessAction = createAction<IContractsStateContext>(
  ContractsActionEnums.actionSuccess,
  () => ({ actionPending: false } as IContractsStateContext)
);

export const actionErrorAction = createAction<IContractsStateContext, string>(
  ContractsActionEnums.actionError,
  (error) =>
    ({
      actionPending: false,
      isError: true,
      error,
    }) as IContractsStateContext
);
