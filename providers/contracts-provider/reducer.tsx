import { handleActions } from "redux-actions";
import {
  INITIAL_CONTRACTS_STATE,
  IContractsStateContext,
} from "./context";
import { ContractsActionEnums } from "./actions";

export const ContractsReducer = handleActions<
  IContractsStateContext,
  IContractsStateContext
>(
  {
    [ContractsActionEnums.loadContractsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractsActionEnums.loadContractsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractsActionEnums.loadContractsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractsActionEnums.clearContracts]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractsActionEnums.actionPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractsActionEnums.actionSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContractsActionEnums.actionError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_CONTRACTS_STATE
);
