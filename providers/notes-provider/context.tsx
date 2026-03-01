import { createContext } from "react";
import type { INote } from "../../utils/notes-service";

export interface INotesStateContext {
  notes: INote[] | null;
  currentClientId: string | null;
  currentOpportunityId: string | null;
  isPending: boolean;
  isError: boolean;
  error?: string;
  actionPending: boolean;
}

export const INITIAL_NOTES_STATE: INotesStateContext = {
  notes: null,
  currentClientId: null,
  currentOpportunityId: null,
  isPending: false,
  isError: false,
  error: undefined,
  actionPending: false,
};

export interface ICreateNoteParams {
  content: string;
  clientId?: string;
  opportunityId?: string;
  isPrivate?: boolean;
}

export interface IUpdateNoteParams {
  content?: string;
  isPrivate?: boolean;
}

export interface INotesActionContext {
  loadNotesByClient: (clientId: string) => Promise<void>;
  loadNotesByOpportunity: (opportunityId: string) => Promise<void>;
  clearNotes: () => void;
  createNote: (params: ICreateNoteParams) => Promise<INote>;
  updateNote: (id: string, params: IUpdateNoteParams) => Promise<INote>;
  deleteNote: (id: string) => Promise<void>;
}

export const NotesStateContext =
  createContext<INotesStateContext | undefined>(undefined);

export const NotesActionContext =
  createContext<INotesActionContext | undefined>(undefined);
