import { createContext } from "react";
import type {
  IContact,
  ICreateContactRequest,
  IUpdateContactRequest,
} from "../../utils/contacts-service";

export interface IContactsStateContext {
  contacts: IContact[] | null;
  currentClientId: string | null;
  isPending: boolean;
  isError: boolean;
  error?: string;
  actionPending: boolean;
}

export const INITIAL_CONTACTS_STATE: IContactsStateContext = {
  contacts: null,
  currentClientId: null,
  isPending: false,
  isError: false,
  error: undefined,
  actionPending: false,
};

export interface IContactsActionContext {
  loadContactsByClient: (clientId: string) => Promise<void>;
  clearContacts: () => void;
  createContact: (
    clientId: string,
    body: Omit<ICreateContactRequest, "clientId">
  ) => Promise<IContact>;
  updateContact: (id: string, body: IUpdateContactRequest) => Promise<void>;
  setPrimaryContact: (id: string) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

export const ContactsStateContext =
  createContext<IContactsStateContext | undefined>(undefined);

export const ContactsActionContext =
  createContext<IContactsActionContext | undefined>(undefined);
