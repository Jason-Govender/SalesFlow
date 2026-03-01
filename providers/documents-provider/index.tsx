"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  DocumentsStateContext,
  DocumentsActionContext,
  INITIAL_DOCUMENTS_STATE,
} from "./context";

import { DocumentsReducer } from "./reducer";
import {
  loadDocumentsPending,
  loadDocumentsSuccess,
  loadDocumentsError,
  clearDocumentsAction,
  actionPendingAction,
  actionSuccessAction,
  actionErrorAction,
} from "./actions";

import {
  documentsService,
} from "../../utils/documents-service";

export const DocumentsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    DocumentsReducer,
    INITIAL_DOCUMENTS_STATE
  );

  const loadDocumentsByClient = useCallback(async (clientId: string): Promise<void> => {
    dispatch(loadDocumentsPending());
    try {
      const documents = await documentsService.getDocumentsByClient(clientId);
      dispatch(loadDocumentsSuccess({ documents, clientId, opportunityId: null }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load documents.";
      dispatch(loadDocumentsError(message));
    }
  }, []);

  const loadDocumentsByOpportunity = useCallback(async (opportunityId: string): Promise<void> => {
    dispatch(loadDocumentsPending());
    try {
      const documents = await documentsService.getDocumentsByOpportunity(opportunityId);
      dispatch(loadDocumentsSuccess({ documents, clientId: null, opportunityId }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load documents.";
      dispatch(loadDocumentsError(message));
    }
  }, []);

  const clearDocuments = useCallback(() => {
    dispatch(clearDocumentsAction());
  }, []);

  const uploadDocument = useCallback(
    async (params: {
      file: File;
      clientId?: string;
      opportunityId?: string;
      description?: string;
      documentCategory?: number;
    }) => {
      dispatch(actionPendingAction());
      const relatedToType = params.opportunityId ? 2 : 1;
      const relatedToId = params.opportunityId ?? params.clientId ?? "";
      if (!relatedToId) throw new Error("clientId or opportunityId is required");
      try {
        const document = await documentsService.uploadDocument({
          file: params.file,
          relatedToType,
          relatedToId,
          description: params.description,
          documentCategory: params.documentCategory,
        });
        dispatch(actionSuccessAction());
        if (params.opportunityId && state.currentOpportunityId === params.opportunityId) {
          const documents = await documentsService.getDocumentsByOpportunity(params.opportunityId);
          dispatch(loadDocumentsSuccess({ documents, opportunityId: params.opportunityId }));
        } else if (params.clientId && state.currentClientId === params.clientId) {
          const documents = await documentsService.getDocumentsByClient(params.clientId);
          dispatch(loadDocumentsSuccess({ documents, clientId: params.clientId }));
        }
        return document;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to upload document.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId, state.currentOpportunityId]
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await documentsService.deleteDocument(id);
        dispatch(actionSuccessAction());
        if (state.currentOpportunityId) {
          const documents = await documentsService.getDocumentsByOpportunity(state.currentOpportunityId);
          dispatch(loadDocumentsSuccess({ documents, opportunityId: state.currentOpportunityId }));
        } else if (state.currentClientId) {
          const documents = await documentsService.getDocumentsByClient(state.currentClientId);
          dispatch(loadDocumentsSuccess({ documents, clientId: state.currentClientId }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete document.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId, state.currentOpportunityId]
  );

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadDocumentsByClient,
      loadDocumentsByOpportunity,
      clearDocuments,
      uploadDocument,
      deleteDocument,
    }),
    [
      loadDocumentsByClient,
      loadDocumentsByOpportunity,
      clearDocuments,
      uploadDocument,
      deleteDocument,
    ]
  );

  return (
    <DocumentsStateContext.Provider value={stateValue}>
      <DocumentsActionContext.Provider value={actionValue}>
        {children}
      </DocumentsActionContext.Provider>
    </DocumentsStateContext.Provider>
  );
};

export const useDocumentsState = () => {
  const context = useContext(DocumentsStateContext);
  if (!context) {
    throw new Error("useDocumentsState must be used within DocumentsProvider");
  }
  return context;
};

export const useDocumentsActions = () => {
  const context = useContext(DocumentsActionContext);
  if (!context) {
    throw new Error("useDocumentsActions must be used within DocumentsProvider");
  }
  return context;
};
