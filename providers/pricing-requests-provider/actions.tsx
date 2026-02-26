import { createAction } from "redux-actions";
import type { IPricingRequestsStateContext } from "./context";
import type {
  IPricingRequestsFilters,
  IPricingRequestsPagination,
} from "./context";
import type {
  IPricingRequest,
  IPricingRequestsListResponse,
} from "../../utils/pricing-requests-service";

export enum PricingRequestsActionEnums {
  loadPricingRequestsPending = "PRICING_REQUESTS_LOAD_LIST_PENDING",
  loadPricingRequestsSuccess = "PRICING_REQUESTS_LOAD_LIST_SUCCESS",
  loadPricingRequestsError = "PRICING_REQUESTS_LOAD_LIST_ERROR",
  loadPendingPending = "PRICING_REQUESTS_LOAD_PENDING_PENDING",
  loadPendingSuccess = "PRICING_REQUESTS_LOAD_PENDING_SUCCESS",
  loadPendingError = "PRICING_REQUESTS_LOAD_PENDING_ERROR",
  loadMyRequestsPending = "PRICING_REQUESTS_LOAD_MY_PENDING",
  loadMyRequestsSuccess = "PRICING_REQUESTS_LOAD_MY_SUCCESS",
  loadMyRequestsError = "PRICING_REQUESTS_LOAD_MY_ERROR",
  loadPricingRequestPending = "PRICING_REQUESTS_LOAD_ONE_PENDING",
  loadPricingRequestSuccess = "PRICING_REQUESTS_LOAD_ONE_SUCCESS",
  loadPricingRequestError = "PRICING_REQUESTS_LOAD_ONE_ERROR",
  setFilters = "PRICING_REQUESTS_SET_FILTERS",
  setPagination = "PRICING_REQUESTS_SET_PAGINATION",
  setSelectedPricingRequest = "PRICING_REQUESTS_SET_SELECTED",
  clearSelectedPricingRequest = "PRICING_REQUESTS_CLEAR_SELECTED",
  actionPending = "PRICING_REQUESTS_ACTION_PENDING",
  actionSuccess = "PRICING_REQUESTS_ACTION_SUCCESS",
  actionError = "PRICING_REQUESTS_ACTION_ERROR",
}

export const loadPricingRequestsPending = createAction<
  IPricingRequestsStateContext
>(PricingRequestsActionEnums.loadPricingRequestsPending, () =>
  ({
    isPending: true,
    isError: false,
    error: undefined,
  }) as IPricingRequestsStateContext
);

export const loadPricingRequestsSuccess = createAction<
  IPricingRequestsStateContext,
  IPricingRequestsListResponse
>(PricingRequestsActionEnums.loadPricingRequestsSuccess, (response) => ({
  isPending: false,
  isError: false,
  error: undefined,
  pricingRequests: response.items,
  pagination: {
    pageNumber: response.pageNumber,
    pageSize: response.pageSize,
    totalCount: response.totalCount,
  },
} as IPricingRequestsStateContext));

export const loadPricingRequestsError = createAction<
  IPricingRequestsStateContext,
  string
>(PricingRequestsActionEnums.loadPricingRequestsError, (error) =>
  ({
    isPending: false,
    isError: true,
    error,
    pricingRequests: null,
  }) as IPricingRequestsStateContext
);

export const loadPendingPending = createAction<IPricingRequestsStateContext>(
  PricingRequestsActionEnums.loadPendingPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IPricingRequestsStateContext
);

export const loadPendingSuccess = createAction<
  IPricingRequestsStateContext,
  IPricingRequest[]
>(PricingRequestsActionEnums.loadPendingSuccess, (pendingRequests) =>
  ({
    isPending: false,
    isError: false,
    error: undefined,
    pendingRequests,
  }) as IPricingRequestsStateContext
);

export const loadPendingError = createAction<
  IPricingRequestsStateContext,
  string
>(PricingRequestsActionEnums.loadPendingError, (error) =>
  ({
    isPending: false,
    isError: true,
    error,
    pendingRequests: null,
  }) as IPricingRequestsStateContext
);

export const loadMyRequestsPending = createAction<IPricingRequestsStateContext>(
  PricingRequestsActionEnums.loadMyRequestsPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IPricingRequestsStateContext
);

export const loadMyRequestsSuccess = createAction<
  IPricingRequestsStateContext,
  IPricingRequest[]
>(PricingRequestsActionEnums.loadMyRequestsSuccess, (myRequests) =>
  ({
    isPending: false,
    isError: false,
    error: undefined,
    myRequests,
  }) as IPricingRequestsStateContext
);

export const loadMyRequestsError = createAction<
  IPricingRequestsStateContext,
  string
>(PricingRequestsActionEnums.loadMyRequestsError, (error) =>
  ({
    isPending: false,
    isError: true,
    error,
    myRequests: null,
  }) as IPricingRequestsStateContext
);

export const loadPricingRequestPending = createAction<
  IPricingRequestsStateContext
>(PricingRequestsActionEnums.loadPricingRequestPending, () =>
  ({
    isPending: true,
    isError: false,
    error: undefined,
  }) as IPricingRequestsStateContext
);

export const loadPricingRequestSuccess = createAction<
  IPricingRequestsStateContext,
  IPricingRequest
>(PricingRequestsActionEnums.loadPricingRequestSuccess, (selectedPricingRequest) =>
  ({
    isPending: false,
    isError: false,
    error: undefined,
    selectedPricingRequest,
  }) as IPricingRequestsStateContext
);

export const loadPricingRequestError = createAction<
  IPricingRequestsStateContext,
  string
>(PricingRequestsActionEnums.loadPricingRequestError, (error) =>
  ({
    isPending: false,
    isError: true,
    error,
    selectedPricingRequest: null,
  }) as IPricingRequestsStateContext
);

export const setFiltersAction = createAction<
  IPricingRequestsStateContext,
  Partial<IPricingRequestsFilters>
>(PricingRequestsActionEnums.setFilters, (filters) =>
  ({ filters }) as IPricingRequestsStateContext
);

export const setPaginationAction = createAction<
  IPricingRequestsStateContext,
  Partial<IPricingRequestsPagination>
>(PricingRequestsActionEnums.setPagination, (pagination) =>
  ({ pagination }) as IPricingRequestsStateContext
);

export const setSelectedPricingRequestAction = createAction<
  IPricingRequestsStateContext,
  IPricingRequest | null
>(
  PricingRequestsActionEnums.setSelectedPricingRequest,
  (selectedPricingRequest) =>
    ({ selectedPricingRequest }) as IPricingRequestsStateContext
);

export const clearSelectedPricingRequestAction = createAction<
  IPricingRequestsStateContext
>(PricingRequestsActionEnums.clearSelectedPricingRequest, () =>
  ({ selectedPricingRequest: null } as IPricingRequestsStateContext)
);

export const actionPendingAction = createAction<IPricingRequestsStateContext>(
  PricingRequestsActionEnums.actionPending,
  () => ({ actionPending: true } as IPricingRequestsStateContext)
);

export const actionSuccessAction = createAction<IPricingRequestsStateContext>(
  PricingRequestsActionEnums.actionSuccess,
  () => ({ actionPending: false } as IPricingRequestsStateContext)
);

export const actionErrorAction = createAction<
  IPricingRequestsStateContext,
  string
>(PricingRequestsActionEnums.actionError, (error) =>
  ({
    actionPending: false,
    isError: true,
    error,
  }) as IPricingRequestsStateContext
);
