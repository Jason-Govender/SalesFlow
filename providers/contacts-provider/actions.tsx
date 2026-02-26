import { createAction } from "redux-actions";
import type { IContactsStateContext } from "./context";
import type { IContact } from "../../utils/contacts-service";

export enum ContactsActionEnums {
  loadContactsPending = "CONTACTS_LOAD_PENDING",
  loadContactsSuccess = "CONTACTS_LOAD_SUCCESS",
  loadContactsError = "CONTACTS_LOAD_ERROR",
  clearContacts = "CONTACTS_CLEAR",
  actionPending = "CONTACTS_ACTION_PENDING",
  actionSuccess = "CONTACTS_ACTION_SUCCESS",
  actionError = "CONTACTS_ACTION_ERROR",
}

export const loadContactsPending = createAction<IContactsStateContext>(
  ContactsActionEnums.loadContactsPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as IContactsStateContext
);

export const loadContactsSuccess = createAction<
  IContactsStateContext,
  { contacts: IContact[]; clientId: string }
>(
  ContactsActionEnums.loadContactsSuccess,
  ({ contacts, clientId }) =>
    ({
      isPending: false,
      isError: false,
      error: undefined,
      contacts,
      currentClientId: clientId,
    }) as IContactsStateContext
);

export const loadContactsError = createAction<IContactsStateContext, string>(
  ContactsActionEnums.loadContactsError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      contacts: null,
    }) as IContactsStateContext
);

export const clearContactsAction = createAction<IContactsStateContext>(
  ContactsActionEnums.clearContacts,
  () =>
    ({
      contacts: null,
      currentClientId: null,
      isError: false,
      error: undefined,
    }) as IContactsStateContext
);

export const actionPendingAction = createAction<IContactsStateContext>(
  ContactsActionEnums.actionPending,
  () => ({ actionPending: true } as IContactsStateContext)
);

export const actionSuccessAction = createAction<IContactsStateContext>(
  ContactsActionEnums.actionSuccess,
  () => ({ actionPending: false } as IContactsStateContext)
);

export const actionErrorAction = createAction<IContactsStateContext, string>(
  ContactsActionEnums.actionError,
  (error) =>
    ({
      actionPending: false,
      isError: true,
      error,
    }) as IContactsStateContext
);
