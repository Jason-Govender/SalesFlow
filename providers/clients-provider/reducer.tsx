import { handleActions } from "redux-actions";
import {
  INITIAL_CLIENTS_STATE,
  IClientsStateContext,
} from "./context";
import { ClientsActionEnums } from "./actions";

export const ClientsReducer = handleActions<
  IClientsStateContext,
  IClientsStateContext & {
    filters?: Partial<IClientsStateContext["filters"]>;
    pagination?: Partial<IClientsStateContext["pagination"]>;
  }
>(
  {
    [ClientsActionEnums.loadClientsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.loadClientsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.loadClientsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.loadClientPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.loadClientSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.loadClientError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.loadClientStatsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.setFilters]: (state, action) => ({
      ...state,
      filters: { ...state.filters, ...action.payload?.filters },
    }),

    [ClientsActionEnums.setPagination]: (state, action) => ({
      ...state,
      pagination: { ...state.pagination, ...action.payload?.pagination },
    }),

    [ClientsActionEnums.setSelectedClient]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.clearSelectedClient]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.actionPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.actionSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ClientsActionEnums.actionError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_CLIENTS_STATE
);
