import { handleActions } from "redux-actions";
import {
  INITIAL_CONTACTS_STATE,
  IContactsStateContext,
} from "./context";
import { ContactsActionEnums } from "./actions";

export const ContactsReducer = handleActions<
  IContactsStateContext,
  IContactsStateContext
>(
  {
    [ContactsActionEnums.loadContactsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactsActionEnums.loadContactsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactsActionEnums.loadContactsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactsActionEnums.clearContacts]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactsActionEnums.actionPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactsActionEnums.actionSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ContactsActionEnums.actionError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_CONTACTS_STATE
);
