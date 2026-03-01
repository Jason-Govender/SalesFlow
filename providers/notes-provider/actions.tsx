import { createAction } from "redux-actions";
import type { INotesStateContext } from "./context";
import type { INote } from "../../utils/notes-service";

export enum NotesActionEnums {
  loadNotesPending = "NOTES_LOAD_PENDING",
  loadNotesSuccess = "NOTES_LOAD_SUCCESS",
  loadNotesError = "NOTES_LOAD_ERROR",
  clearNotes = "NOTES_CLEAR",
  actionPending = "NOTES_ACTION_PENDING",
  actionSuccess = "NOTES_ACTION_SUCCESS",
  actionError = "NOTES_ACTION_ERROR",
}

export const loadNotesPending = createAction<INotesStateContext>(
  NotesActionEnums.loadNotesPending,
  () =>
    ({
      isPending: true,
      isError: false,
      error: undefined,
    }) as INotesStateContext
);

export const loadNotesSuccess = createAction<
  INotesStateContext,
  { notes: INote[]; clientId: string }
>(
  NotesActionEnums.loadNotesSuccess,
  ({ notes, clientId }) =>
    ({
      isPending: false,
      isError: false,
      error: undefined,
      notes,
      currentClientId: clientId,
    }) as INotesStateContext
);

export const loadNotesError = createAction<INotesStateContext, string>(
  NotesActionEnums.loadNotesError,
  (error) =>
    ({
      isPending: false,
      isError: true,
      error,
      notes: null,
    }) as INotesStateContext
);

export const clearNotesAction = createAction<INotesStateContext>(
  NotesActionEnums.clearNotes,
  () =>
    ({
      notes: null,
      currentClientId: null,
      isError: false,
      error: undefined,
    }) as INotesStateContext
);

export const actionPendingAction = createAction<INotesStateContext>(
  NotesActionEnums.actionPending,
  () => ({ actionPending: true } as INotesStateContext)
);

export const actionSuccessAction = createAction<INotesStateContext>(
  NotesActionEnums.actionSuccess,
  () => ({ actionPending: false } as INotesStateContext)
);

export const actionErrorAction = createAction<INotesStateContext, string>(
  NotesActionEnums.actionError,
  (error) =>
    ({
      actionPending: false,
      isError: true,
      error,
    }) as INotesStateContext
);
