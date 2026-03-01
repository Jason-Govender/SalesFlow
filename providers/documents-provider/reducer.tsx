import { handleActions } from "redux-actions";
import {
  INITIAL_DOCUMENTS_STATE,
  IDocumentsStateContext,
} from "./context";
import { DocumentsActionEnums } from "./actions";

export const DocumentsReducer = handleActions<
  IDocumentsStateContext,
  IDocumentsStateContext
>(
  {
    [DocumentsActionEnums.loadDocumentsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DocumentsActionEnums.loadDocumentsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DocumentsActionEnums.loadDocumentsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DocumentsActionEnums.clearDocuments]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DocumentsActionEnums.actionPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DocumentsActionEnums.actionSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [DocumentsActionEnums.actionError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_DOCUMENTS_STATE
);
