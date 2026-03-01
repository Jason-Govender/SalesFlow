import { createContext } from "react";
import type { IDocument } from "../../utils/documents-service";

export interface IDocumentsStateContext {
  documents: IDocument[] | null;
  currentClientId: string | null;
  currentOpportunityId: string | null;
  isPending: boolean;
  isError: boolean;
  error?: string;
  actionPending: boolean;
}

export const INITIAL_DOCUMENTS_STATE: IDocumentsStateContext = {
  documents: null,
  currentClientId: null,
  currentOpportunityId: null,
  isPending: false,
  isError: false,
  error: undefined,
  actionPending: false,
};

export interface IUploadDocumentParams {
  file: File;
  clientId?: string;
  opportunityId?: string;
  description?: string;
  documentCategory?: number;
}

export interface IDocumentsActionContext {
  loadDocumentsByClient: (clientId: string) => Promise<void>;
  loadDocumentsByOpportunity: (opportunityId: string) => Promise<void>;
  clearDocuments: () => void;
  uploadDocument: (params: IUploadDocumentParams) => Promise<IDocument>;
  deleteDocument: (id: string) => Promise<void>;
}

export const DocumentsStateContext =
  createContext<IDocumentsStateContext | undefined>(undefined);

export const DocumentsActionContext =
  createContext<IDocumentsActionContext | undefined>(undefined);
