import { createAction } from "redux-actions";
import type { IDocumentsStateContext } from "./context";
import type { IDocument } from "../../utils/documents-service";

export enum DocumentsActionEnums {
  loadDocumentsPending = "DOCUMENTS_LOAD_PENDING",
  loadDocumentsSuccess = "DOCUMENTS_LOAD_SUCCESS",
  loadDocumentsError = "DOCUMENTS_LOAD_ERROR",
  clearDocuments = "DOCUMENTS_CLEAR",
  actionPending = "DOCUMENTS_ACTION_PENDING",
  actionSuccess = "DOCUMENTS_ACTION_SUCCESS",
  actionError = "DOCUMENTS_ACTION_ERROR",
}

export const loadDocumentsPending = createAction<IDocumentsStateContext>(
  DocumentsActionEnums.loadDocumentsPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IDocumentsStateContext
);

export const loadDocumentsSuccess = createAction<
  IDocumentsStateContext,
  { documents: IDocument[]; clientId?: string | null; opportunityId?: string | null }
>(
  DocumentsActionEnums.loadDocumentsSuccess,
  ({ documents, clientId, opportunityId }) =>
    ({
      isPending: false,
      isError: false,
      error: undefined,
      documents,
      currentClientId: clientId ?? null,
      currentOpportunityId: opportunityId ?? null,
    }) as IDocumentsStateContext
);

export const loadDocumentsError = createAction<IDocumentsStateContext, string>(
  DocumentsActionEnums.loadDocumentsError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      documents: null,
    }) as IDocumentsStateContext
);

export const clearDocumentsAction = createAction<IDocumentsStateContext>(
  DocumentsActionEnums.clearDocuments,
  () =>
    ({
      documents: null,
      currentClientId: null,
      currentOpportunityId: null,
      isError: false,
      error: undefined,
    }) as IDocumentsStateContext
);

export const actionPendingAction = createAction<IDocumentsStateContext>(
  DocumentsActionEnums.actionPending,
  () => ({ actionPending: true } as IDocumentsStateContext)
);

export const actionSuccessAction = createAction<IDocumentsStateContext>(
  DocumentsActionEnums.actionSuccess,
  () => ({ actionPending: false } as IDocumentsStateContext)
);

export const actionErrorAction = createAction<IDocumentsStateContext, string>(
  DocumentsActionEnums.actionError,
  (error) =>
    ({
      actionPending: false,
      isError: true,
      error,
    }) as IDocumentsStateContext
);
