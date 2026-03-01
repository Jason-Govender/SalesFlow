import { handleActions } from "redux-actions";
import {
  INITIAL_NOTES_STATE,
  INotesStateContext,
} from "./context";
import { NotesActionEnums } from "./actions";

export const NotesReducer = handleActions<
  INotesStateContext,
  INotesStateContext
>(
  {
    [NotesActionEnums.loadNotesPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [NotesActionEnums.loadNotesSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [NotesActionEnums.loadNotesError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [NotesActionEnums.clearNotes]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [NotesActionEnums.actionPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [NotesActionEnums.actionSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [NotesActionEnums.actionError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_NOTES_STATE
);
