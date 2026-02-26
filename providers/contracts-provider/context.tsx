import { createContext } from "react";
import type {
  IContract,
  ICreateContractRequest,
  IUpdateContractRequest,
} from "../../utils/contracts-service";

export interface IContractsStateContext {
  contracts: IContract[] | null;
  currentClientId: string | null;
  isPending: boolean;
  isError: boolean;
  error?: string;
  actionPending: boolean;
}

export const INITIAL_CONTRACTS_STATE: IContractsStateContext = {
  contracts: null,
  currentClientId: null,
  isPending: false,
  isError: false,
  error: undefined,
  actionPending: false,
};

export interface IContractsActionContext {
  loadContractsByClient: (clientId: string) => Promise<void>;
  clearContracts: () => void;
  createContract: (
    clientId: string,
    body: Omit<ICreateContractRequest, "clientId">
  ) => Promise<IContract>;
  updateContract: (id: string, body: IUpdateContractRequest) => Promise<void>;
  activateContract: (id: string) => Promise<void>;
  cancelContract: (id: string) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
}

export const ContractsStateContext =
  createContext<IContractsStateContext | undefined>(undefined);

export const ContractsActionContext =
  createContext<IContractsActionContext | undefined>(undefined);
