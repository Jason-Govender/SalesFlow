import { handleActions } from "redux-actions";
import {
  INITIAL_PRICING_REQUESTS_STATE,
  IPricingRequestsStateContext,
} from "./context";
import { PricingRequestsActionEnums } from "./actions";

type Payload = IPricingRequestsStateContext & {
  filters?: Partial<IPricingRequestsStateContext["filters"]>;
  pagination?: Partial<IPricingRequestsStateContext["pagination"]>;
};

export const PricingRequestsReducer = handleActions<
  IPricingRequestsStateContext,
  Payload
>(
  {
    [PricingRequestsActionEnums.loadPricingRequestsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadPricingRequestsSuccess]: (
      state,
      action
    ) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadPricingRequestsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadPendingPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadPendingSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadPendingError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadMyRequestsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadMyRequestsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadMyRequestsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadPricingRequestPending]: (
      state,
      action
    ) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadPricingRequestSuccess]: (
      state,
      action
    ) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.loadPricingRequestError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.setFilters]: (state, action) => ({
      ...state,
      filters: { ...state.filters, ...action.payload?.filters },
    }),

    [PricingRequestsActionEnums.setPagination]: (state, action) => ({
      ...state,
      pagination: { ...state.pagination, ...action.payload?.pagination },
    }),

    [PricingRequestsActionEnums.setSelectedPricingRequest]: (
      state,
      action
    ) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.clearSelectedPricingRequest]: (
      state,
      action
    ) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.actionPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.actionSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [PricingRequestsActionEnums.actionError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_PRICING_REQUESTS_STATE
);
