"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  ProposalsStateContext,
  ProposalsActionContext,
  INITIAL_PROPOSALS_STATE,
} from "./context";

import { ProposalsReducer } from "./reducer";
import {
  loadProposalsPending,
  loadProposalsSuccess,
  loadProposalsError,
  loadProposalPending,
  loadProposalSuccess,
  loadProposalError,
  setFiltersAction,
  setPaginationAction,
  clearSelectedProposalAction,
  actionPendingAction,
  actionSuccessAction,
  actionErrorAction,
  setSelectedProposalAction,
} from "./actions";

import {
  proposalsService,
  type ICreateProposalRequest,
  type IUpdateProposalRequest,
  type ICreateLineItemRequest,
  type IUpdateLineItemRequest,
  type IProposalsListParams,
} from "../../utils/proposals-service";

export const ProposalsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    ProposalsReducer,
    INITIAL_PROPOSALS_STATE
  );

  const loadProposals = useCallback(
    async (params?: IProposalsListParams): Promise<void> => {
      const effectiveParams = {
        ...state.filters,
        pageNumber: params?.pageNumber ?? state.pagination.pageNumber,
        pageSize: params?.pageSize ?? state.pagination.pageSize,
        ...params,
      };
      dispatch(loadProposalsPending());
      try {
        const response = await proposalsService.getProposals(effectiveParams);
        dispatch(loadProposalsSuccess(response));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load proposals.";
        dispatch(loadProposalsError(message));
      }
    },
    [state.filters, state.pagination.pageNumber, state.pagination.pageSize]
  );

  const loadProposal = useCallback(async (id: string): Promise<void> => {
    dispatch(loadProposalPending());
    try {
      const proposal = await proposalsService.getProposal(id);
      dispatch(loadProposalSuccess(proposal));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load proposal.";
      dispatch(loadProposalError(message));
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

  const createProposal = useCallback(
    async (body: ICreateProposalRequest) => {
      dispatch(actionPendingAction());
      try {
        const proposal = await proposalsService.createProposal(body);
        dispatch(actionSuccessAction());
        dispatch(setSelectedProposalAction(proposal));
        return proposal;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create proposal.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    []
  );

  const updateProposal = useCallback(
    async (id: string, body: IUpdateProposalRequest) => {
      dispatch(actionPendingAction());
      try {
        const updated = await proposalsService.updateProposal(id, body);
        dispatch(actionSuccessAction());
        dispatch(setSelectedProposalAction(updated));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update proposal.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    []
  );

  const addLineItem = useCallback(
    async (proposalId: string, body: ICreateLineItemRequest) => {
      dispatch(actionPendingAction());
      try {
        await proposalsService.addLineItem(proposalId, body);
        dispatch(actionSuccessAction());
        const updated = await proposalsService.getProposal(proposalId);
        dispatch(setSelectedProposalAction(updated));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to add line item.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    []
  );

  const updateLineItem = useCallback(
    async (
      proposalId: string,
      lineItemId: string,
      body: IUpdateLineItemRequest
    ) => {
      dispatch(actionPendingAction());
      try {
        await proposalsService.updateLineItem(proposalId, lineItemId, body);
        dispatch(actionSuccessAction());
        const updated = await proposalsService.getProposal(proposalId);
        dispatch(setSelectedProposalAction(updated));
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update line item.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    []
  );

  const removeLineItem = useCallback(
    async (proposalId: string, lineItemId: string) => {
      dispatch(actionPendingAction());
      try {
        await proposalsService.deleteLineItem(proposalId, lineItemId);
        dispatch(actionSuccessAction());
        const updated = await proposalsService.getProposal(proposalId);
        dispatch(setSelectedProposalAction(updated));
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to remove line item.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    []
  );

  const submitProposal = useCallback(async (id: string) => {
    dispatch(actionPendingAction());
    try {
      const updated = await proposalsService.submitProposal(id);
      dispatch(actionSuccessAction());
      dispatch(setSelectedProposalAction(updated));
      if (state.proposals) {
        const list = await proposalsService.getProposals({
          ...state.filters,
          pageNumber: state.pagination.pageNumber,
          pageSize: state.pagination.pageSize,
        });
        dispatch(loadProposalsSuccess(list));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to submit proposal.";
      dispatch(actionErrorAction(message));
      throw error;
    }
  }, [state.proposals, state.filters, state.pagination.pageNumber, state.pagination.pageSize]);

  const approveProposal = useCallback(async (id: string) => {
    dispatch(actionPendingAction());
    try {
      const updated = await proposalsService.approveProposal(id);
      dispatch(actionSuccessAction());
      dispatch(setSelectedProposalAction(updated));
      if (state.proposals) {
        const list = await proposalsService.getProposals({
          ...state.filters,
          pageNumber: state.pagination.pageNumber,
          pageSize: state.pagination.pageSize,
        });
        dispatch(loadProposalsSuccess(list));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to approve proposal.";
      dispatch(actionErrorAction(message));
      throw error;
    }
  }, [state.proposals, state.filters, state.pagination.pageNumber, state.pagination.pageSize]);

  const rejectProposal = useCallback(
    async (id: string, reason: string) => {
      dispatch(actionPendingAction());
      try {
        const updated = await proposalsService.rejectProposal(id, { reason });
        dispatch(actionSuccessAction());
        dispatch(setSelectedProposalAction(updated));
        if (state.proposals) {
          const list = await proposalsService.getProposals({
            ...state.filters,
            pageNumber: state.pagination.pageNumber,
            pageSize: state.pagination.pageSize,
          });
          dispatch(loadProposalsSuccess(list));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to reject proposal.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [
      state.proposals,
      state.filters,
      state.pagination.pageNumber,
      state.pagination.pageSize,
    ]
  );

  const deleteProposal = useCallback(async (id: string) => {
    dispatch(actionPendingAction());
    try {
      await proposalsService.deleteProposal(id);
      dispatch(actionSuccessAction());
      dispatch(clearSelectedProposalAction());
      if (state.proposals) {
        const list = await proposalsService.getProposals({
          ...state.filters,
          pageNumber: state.pagination.pageNumber,
          pageSize: state.pagination.pageSize,
        });
        dispatch(loadProposalsSuccess(list));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete proposal.";
      dispatch(actionErrorAction(message));
      throw error;
    }
  }, [state.proposals, state.filters, state.pagination.pageNumber, state.pagination.pageSize]);

  const clearSelectedProposal = useCallback(() => {
    dispatch(clearSelectedProposalAction());
  }, []);

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadProposals,
      loadProposal,
      setFilters,
      setPagination,
      createProposal,
      updateProposal,
      addLineItem,
      updateLineItem,
      removeLineItem,
      submitProposal,
      approveProposal,
      rejectProposal,
      deleteProposal,
      clearSelectedProposal,
    }),
    [
      loadProposals,
      loadProposal,
      setFilters,
      setPagination,
      createProposal,
      updateProposal,
      addLineItem,
      updateLineItem,
      removeLineItem,
      submitProposal,
      approveProposal,
      rejectProposal,
      deleteProposal,
      clearSelectedProposal,
    ]
  );

  return (
    <ProposalsStateContext.Provider value={stateValue}>
      <ProposalsActionContext.Provider value={actionValue}>
        {children}
      </ProposalsActionContext.Provider>
    </ProposalsStateContext.Provider>
  );
};

export const useProposalsState = () => {
  const context = useContext(ProposalsStateContext);
  if (!context) {
    throw new Error("useProposalsState must be used within ProposalsProvider");
  }
  return context;
};

export const useProposalsActions = () => {
  const context = useContext(ProposalsActionContext);
  if (!context) {
    throw new Error("useProposalsActions must be used within ProposalsProvider");
  }
  return context;
};
