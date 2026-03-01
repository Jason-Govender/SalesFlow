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
      dispatch(loadDocumentsSuccess({ documents, clientId }));
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
    async (params: { file: File; clientId: string; description?: string; documentCategory?: number }) => {
      dispatch(actionPendingAction());
      try {
        const document = await documentsService.uploadDocument({
          file: params.file,
          relatedToType: 1,
          relatedToId: params.clientId,
          description: params.description,
          documentCategory: params.documentCategory,
        });
        dispatch(actionSuccessAction());
        if (state.currentClientId === params.clientId) {
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
    [state.currentClientId]
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await documentsService.deleteDocument(id);
        dispatch(actionSuccessAction());
        const clientId = state.currentClientId;
        if (clientId) {
          const documents = await documentsService.getDocumentsByClient(clientId);
          dispatch(loadDocumentsSuccess({ documents, clientId }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete document.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadDocumentsByClient,
      clearDocuments,
      uploadDocument,
      deleteDocument,
    }),
    [
      loadDocumentsByClient,
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
