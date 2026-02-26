"use client";

import React, {
  useReducer,
  useCallback,
  useMemo,
  useContext,
} from "react";

import {
  ContactsStateContext,
  ContactsActionContext,
  INITIAL_CONTACTS_STATE,
} from "./context";

import { ContactsReducer } from "./reducer";
import {
  loadContactsPending,
  loadContactsSuccess,
  loadContactsError,
  clearContactsAction,
  actionPendingAction,
  actionSuccessAction,
  actionErrorAction,
} from "./actions";

import {
  contactsService,
  type ICreateContactRequest,
  type IUpdateContactRequest,
} from "../../utils/contacts-service";

export const ContactsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    ContactsReducer,
    INITIAL_CONTACTS_STATE
  );

  const loadContactsByClient = useCallback(async (clientId: string): Promise<void> => {
    dispatch(loadContactsPending());
    try {
      const contacts = await contactsService.getContactsByClient(clientId);
      dispatch(loadContactsSuccess({ contacts, clientId }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load contacts.";
      dispatch(loadContactsError(message));
    }
  }, []);

  const clearContacts = useCallback(() => {
    dispatch(clearContactsAction());
  }, []);

  const createContact = useCallback(
    async (
      clientId: string,
      body: Omit<ICreateContactRequest, "clientId">
    ) => {
      dispatch(actionPendingAction());
      try {
        const contact = await contactsService.createContact({
          ...body,
          clientId,
        });
        dispatch(actionSuccessAction());
        if (state.currentClientId === clientId) {
          const contacts = await contactsService.getContactsByClient(clientId);
          dispatch(loadContactsSuccess({ contacts, clientId }));
        }
        return contact;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create contact.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const updateContact = useCallback(
    async (id: string, body: IUpdateContactRequest) => {
      dispatch(actionPendingAction());
      try {
        await contactsService.updateContact(id, body);
        dispatch(actionSuccessAction());
        const clientId = state.currentClientId;
        if (clientId) {
          const contacts = await contactsService.getContactsByClient(clientId);
          dispatch(loadContactsSuccess({ contacts, clientId }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update contact.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const setPrimaryContact = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await contactsService.setPrimaryContact(id);
        dispatch(actionSuccessAction());
        const clientId = state.currentClientId;
        if (clientId) {
          const contacts = await contactsService.getContactsByClient(clientId);
          dispatch(loadContactsSuccess({ contacts, clientId }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to set primary contact.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const deleteContact = useCallback(
    async (id: string) => {
      dispatch(actionPendingAction());
      try {
        await contactsService.deleteContact(id);
        dispatch(actionSuccessAction());
        const clientId = state.currentClientId;
        if (clientId) {
          const contacts = await contactsService.getContactsByClient(clientId);
          dispatch(loadContactsSuccess({ contacts, clientId }));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete contact.";
        dispatch(actionErrorAction(message));
        throw error;
      }
    },
    [state.currentClientId]
  );

  const stateValue = useMemo(() => state, [state]);

  const actionValue = useMemo(
    () => ({
      loadContactsByClient,
      clearContacts,
      createContact,
      updateContact,
      setPrimaryContact,
      deleteContact,
    }),
    [
      loadContactsByClient,
      clearContacts,
      createContact,
      updateContact,
      setPrimaryContact,
      deleteContact,
    ]
  );

  return (
    <ContactsStateContext.Provider value={stateValue}>
      <ContactsActionContext.Provider value={actionValue}>
        {children}
      </ContactsActionContext.Provider>
    </ContactsStateContext.Provider>
  );
};

export const useContactsState = () => {
  const context = useContext(ContactsStateContext);
  if (!context) {
    throw new Error("useContactsState must be used within ContactsProvider");
  }
  return context;
};

export const useContactsActions = () => {
  const context = useContext(ContactsActionContext);
  if (!context) {
    throw new Error("useContactsActions must be used within ContactsProvider");
  }
  return context;
};
