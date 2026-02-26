"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  PricingRequestsStateContext,
  PricingRequestsActionContext,
  INITIAL_PRICING_REQUESTS_STATE,
} from "./context";

import { PricingRequestsReducer } from "./reducer";
import {
  loadPricingRequestsPending,
  loadPricingRequestsSuccess,
  loadPricingRequestsError,
  loadPendingPending,
  loadPendingSuccess,
  loadPendingError,
  loadMyRequestsPending,
  loadMyRequestsSuccess,
  loadMyRequestsError,
  loadPricingRequestPending,
  loadPricingRequestSuccess,
  loadPricingRequestError,
  setFiltersAction,
  setPaginationAction,
  clearSelectedPricingRequestAction,
  actionPendingAction,
  actionSuccessAction,
  actionErrorAction,
  setSelectedPricingRequestAction,
} from "./actions";

import {
  pricingRequestsService,
  type ICreatePricingRequestRequest,
  type IUpdatePricingRequestRequest,
  type IPricingRequestsListParams,
} from "../../utils/pricing-requests-service";

export const PricingRequestsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    PricingRequestsReducer,
    INITIAL_PRICING_REQUESTS_STATE
  );

  const loadPricingRequests = useCallback(
    async (params?: IPricingRequestsListParams): Promise<void> => {
      const effectiveParams = {
        ...state.filters,
        pageNumber: params?.pageNumber ?? state.pagination.pageNumber,
        pageSize: params?.pageSize ?? state.pagination.pageSize,
        ...params,
      };
      dispatch(loadPricingRequestsPending());
      try {
        const response =
          await pricingRequestsService.getPricingRequests(effectiveParams);
        dispatch(loadPricingRequestsSuccess(response));
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load pricing requests.";
        dispatch(loadPricingRequestsError(message));
      }
    },
    [state.filters, state.pagination.pageNumber, state.pagination.pageSize]
  );

  const loadPending = useCallback(async (): Promise<void> => {
    dispatch(loadPendingPending());
    try {
      const pending =
        await pricingRequestsService.getPending();
      dispatch(loadPendingSuccess(pending));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load pending pricing requests.";
      dispatch(loadPendingError(message));
    }
  }, []);

  const loadMyRequests = useCallback(async (): Promise<void> => {
    dispatch(loadMyRequestsPending());
    try {
      const myRequests =
        await pricingRequestsService.getMyRequests();
      dispatch(loadMyRequestsSuccess(myRequests));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load my pricing requests.";
      dispatch(loadMyRequestsError(message));
    }
  }, []);

  const loadPricingRequest = useCallback(async (id: string): Promise<void> => {
    dispatch(loadPricingRequestPending());
    try {
      const request = await pricingRequestsService.getPricingRequest(id);
      dispatch(loadPricingRequestSuccess(request));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load pricing request.";
      dispatch(loadPricingRequestError(message));
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

  const createPricingRequest = useCallback(
    async (body: ICreatePricingRequestRequest) => {
      dispatch(actionPendingAction());
      try {
        const request =
          await pricingRequestsService.create(body);
        dispatch(actionSuccessAction());
        dispatch(setSelectedPricingRequestAction(request));
        return request;
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create pricing request.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    []
  );

  const updatePricingRequest = useCallback(
    async (id: string, body: IUpdatePricingRequestRequest) => {
      dispatch(actionPendingAction());
      try {
        const updated = await pricingRequestsService.update(id, body);
        dispatch(actionSuccessAction());
        dispatch(setSelectedPricingRequestAction(updated));
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update pricing request.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    []
  );

  const assignPricingRequest = useCallback(
    async (id: string, userId: string) => {
      dispatch(actionPendingAction());
      try {
        const updated = await pricingRequestsService.assign(id, { userId });
        dispatch(actionSuccessAction());
        dispatch(setSelectedPricingRequestAction(updated));
        if (state.pricingRequests) {
          const response = await pricingRequestsService.getPricingRequests({
            ...state.filters,
            pageNumber: state.pagination.pageNumber,
            pageSize: state.pagination.pageSize,
          });
          dispatch(loadPricingRequestsSuccess(response));
        }
        await loadPending();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to assign pricing request.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [
      state.pricingRequests,
      state.filters,
      state.pagination.pageNumber,
      state.pagination.pageSize,
      loadPending,
    ]
  );

  const completePricingRequest = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        const updated = await pricingRequestsService.complete(id);
        dispatch(actionSuccessAction());
        dispatch(setSelectedPricingRequestAction(updated));
        if (state.pricingRequests) {
          const response = await pricingRequestsService.getPricingRequests({
            ...state.filters,
            pageNumber: state.pagination.pageNumber,
            pageSize: state.pagination.pageSize,
          });
          dispatch(loadPricingRequestsSuccess(response));
        }
        await loadMyRequests();
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to complete pricing request.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [
      state.pricingRequests,
      state.filters,
      state.pagination.pageNumber,
      state.pagination.pageSize,
      loadMyRequests,
    ]
  );

  const clearSelectedPricingRequest = useCallback(() => {
    dispatch(clearSelectedPricingRequestAction());
  }, []);

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadPricingRequests,
      loadPending,
      loadMyRequests,
      loadPricingRequest,
      setFilters,
      setPagination,
      createPricingRequest,
      updatePricingRequest,
      assignPricingRequest,
      completePricingRequest,
      clearSelectedPricingRequest,
    }),
    [
      loadPricingRequests,
      loadPending,
      loadMyRequests,
      loadPricingRequest,
      setFilters,
      setPagination,
      createPricingRequest,
      updatePricingRequest,
      assignPricingRequest,
      completePricingRequest,
      clearSelectedPricingRequest,
    ]
  );

  return (
    <PricingRequestsStateContext.Provider value={stateValue}>
      <PricingRequestsActionContext.Provider value={actionValue}>
        {children}
      </PricingRequestsActionContext.Provider>
    </PricingRequestsStateContext.Provider>
  );
};

export const usePricingRequestsState = () => {
  const context = useContext(PricingRequestsStateContext);
  if (!context) {
    throw new Error(
      "usePricingRequestsState must be used within PricingRequestsProvider"
    );
  }
  return context;
};

export const usePricingRequestsActions = () => {
  const context = useContext(PricingRequestsActionContext);
  if (!context) {
    throw new Error(
      "usePricingRequestsActions must be used within PricingRequestsProvider"
    );
  }
  return context;
};
